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
import { checkGateTypes, groupsNamedBy, resolveRegistry } from '../definition/registry.ts';
import { Driver, resumeRefusal } from '../driver/driver.ts';
import type { Checkpoint, CheckpointHeader, DriverOptions, SchedulerLike } from '../driver/driver.ts';
import { InvalidTaskId, parseTaskId } from '../driver/ids.ts';
import { liveToken } from '../fold/policies.ts';
import { emptyState, isTerminal, step } from '../fold/run-state.ts';
import type { FoldInput, RunState } from '../fold/run-state.ts';
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
 * **A `start` or a `resume` naming a run id a driver of THIS runtime already holds** — `RN-R25`,
 * [ADR 0065](../../doc/decisions/0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md),
 * [Q364](../../doc/questions/q364.md), P23 stop-and-ask (b). `at` is the run id. Thrown before any
 * driver is built, so the refused call costs nothing — and a minted id never reaches it, because the
 * counter skips ids in use.
 */
export class RunIdInUse extends RuntimeError {}

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
   * ([Q261](../../doc/questions/q261.md)), which is why the runtime cannot guess it.
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
 * **Every member here reaches the driver by exactly one of THREE roads, and a test reads this file
 * and compares the lists BOTH WAYS** — [W76](../../doc/work-items/w76-what-start-accepts.md),
 * [W77](../../doc/work-items/w77-what-start-returns.md),
 * [P20](../../doc/plans/p20-what-the-runtime-owes-a-consumer.md) decision 5. A member is
 * **conditionally spread** into the `new Driver` literal, so that omitting it leaves the driver's
 * own default in place; or **defaulted with `??`** where this module has a default of its own to
 * supply (`runId` mints, `joinPolicy` is `liveToken`); or **COMPOSED**, wrapped in the runtime's
 * own callback which then calls the consumer's. The third road has exactly one member,
 * `onFoldInput`, and it arrived with [ADR 0058](../../doc/decisions/0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md):
 * `done` needs that channel and a consumer may pass one too, so replacing it would silently drop
 * theirs. *(W76's binding FIRED by name when it moved — `expected: [] actual: ["onFoldInput"]` —
 * which is that item's Outputs (2) doing exactly what it was built for.)* The binding is what makes the `Pick` above a
 * claim rather than a decoration: **P20 fact 2 measured that widening it and forgetting the
 * forwarding line is green on all five typecheckers, `npm test`, `check:source` AND `check:docs`**,
 * so before W76 a typed option a consumer passed could be silently dropped and nothing noticed.
 * That is `doc/workflow.md` rule 8 obligation (e)'s third shape — *a LIST is a claim about another
 * list*. The `??` road is DERIVED from this file rather than exempted by name, which is what lets
 * `runId` be on it: P20 decision 5 knew of `joinPolicy` alone and W76's declaration step measured
 * two. *(The test also PINS that road's membership to `['joinPolicy', 'runId']`, so moving a member
 * between the two roads fails and has to be done deliberately — a ratchet of
 * [Q102](../../doc/questions/q102.md)'s shape. Both of W76's readers found the first version of
 * this sentence overclaiming, because it said the test named nobody.)*
 *
 * **`onRegionEvent` is here because it was the one `DriverOptions` member no consumer of
 * `createRuntime` could reach** ([Q297](../../doc/questions/q297.md), [W71](../../doc/work-items/w71-the-reference-stops-teaching-a-fake-scheduler.md)).
 * Of the eighteen members AS THEY STOOD a consumer reaches **two** because the runtime supplies them (`runId`,
 * `scheduler`), **six** through `RuntimeRegistry`, **two** through `RuntimeOptions` — and only two,
 * because `base`, `flows`, `createPool` and `createScheduler` are the runtime's own and are not
 * `DriverOptions` members at all — and **seven** through this `Pick` as it stood. 2 + 6 + 2 + 7 is
 * seventeen; the eighteenth was `onRegionEvent`. *P20 fact 1 states the third road as SIX, which
 * makes its table 21 slots over 18 members and therefore not a partition at all; what survives is
 * its conclusion — one residue, and a unique one — which is why this was a defect rather than a
 * judgement about which callbacks are worth carrying.* The event the callback receives is **already
 * frozen by the driver** (`OR-R7`, [Q73](../../doc/questions/q73.md), W12), so nothing is copied or
 * re-frozen at this seam; measured across it rather than assumed, at W76's declaration step and in
 * `AGENTS.md` section 10. *(What `onFoldInput` receives IS re-copied — `freezeInput` gives it its
 * own frozen object — so the two outbound paths carry equal values and not the same one, which
 * `test/scheduler/runtime.test.ts` asserts and which its first version got wrong.)*
 *
 * **`onNonconformingResult` is the NINETEENTH member and it arrived here by the binding rather
 * than by a judgement** — [W80](../../doc/work-items/w80-what-a-run-time-result-check-is.md),
 * [ADR 0060](../../doc/decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md).
 * It is a per-RUN diagnostic, as every other `on*` member here is, which is why it is in this
 * `Pick` and not in `RuntimeOptions` beside `validateBoundaries`: that one is a POLICY every driver
 * a runtime starts inherits, and this one names a `runId`. The orphan count stays **0** and its pin
 * moved 18 to 19 in the same diff, which is what the test's own comment asks for.
 */
export interface StartOptions extends Pick<DriverOptions,
  'createTask' | 'joinPolicy' | 'onFoldInput' | 'onNonconformingResult' | 'onRegionEvent' | 'onRunFailure' | 'onUnsatisfiableJoin' | 'onUnmintedTask' | 'now'> {
  /**
   * Omitted, the runtime mints `r<n>` from its own counter — inside `ID-R2`'s charset, unique per RUNTIME and not globally
   * (decision 10). **Since W89 the counter SKIPS an id in use on this runtime, and a caller naming one is refused** (`RunIdInUse`,
   * `RN-R25`): a resumed run keeps the id it was stored under, so a fresh runtime's counter would otherwise mint it again.
   */
  runId?: string;
}

/**
 * **What `resume` may say about the run it resumes: everything `start` may, but its id** — `RN-R25`. The run id is the
 * checkpoint's (`header.runId`), because every task id the stored run dispatched embeds it; there is nothing to choose.
 */
export type ResumeOptions = Omit<StartOptions, 'runId'>;

/**
 * **What a driver is handed, and therefore what `runtime.registry` IS** — decision 14. Note
 * `predicates`: the driver wants the FUNCTIONS, keyed by name, where the validator's `Registry`
 * wants the names alone. *(This was typed as the validator's `Registry` and built with the names,
 * so `new Driver(flow, { ...runtime.registry, … })` — the thing decision 14 exists to make possible
 * — refused a VALID flow under `FD-V4`, the driver reading an array's indices as its predicate
 * names. W66's conformity reader, finding 4, with a probe.)* To validate a document against this
 * registry rather than run it, pass `[...registry.predicates.keys()]` as the validator's names.
 */
export type RuntimeRegistry = Pick<DriverOptions, 'predicates' | 'workers' | 'nodeTypes' | 'pools' | 'groups' | 'languages' | 'gateTypes'>;

/**
 * **What `runtime.start` hands back — the run's driver, and the run's END** —
 * [ADR 0058](../../doc/decisions/0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md),
 * [W77](../../doc/work-items/w77-what-start-returns.md), [Q293](../../doc/questions/q293.md).
 *
 * **Why the runtime and not the driver.** A run's state is a pure fold of what the driver reports,
 * and [ADR 0014](../../doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md)
 * spends a paragraph forbidding the driver subscribing to itself — *"a fold with a subscription has
 * a lifetime, a fold with a lifetime has state between calls, and ladder L3's fold-the-same-log-twice
 * stops meaning anything"* — and names `attachFold(driver)` as the ergonomic next step it refuses.
 * **The runtime is a CALLER**: `onFoldInput` is the push half ADR 0014 rule 3 built for a caller,
 * and `fold` still never learns that a driver exists. That is also why this is a pair and not
 * `Object.assign(driver, { done })`: an additive `done` hanging off the driver object tells every
 * reader that the driver produced it, which is the one thing that decision denies. It cost **31
 * typecheck errors in two files, both ours** — and that is the scope the FIVE TYPECHECK LANES
 * measured; the reference's snippets are a sixth lane no typechecker reaches, and three of them
 * bind the result, so the work was in three files (W77 finding A, corrected by its conformity
 * reader, finding 6). The maintainer took it.
 *
 * **`done` RESOLVES and never rejects, and that reversed the plan's own lean on a measurement.**
 * Its settlement rule is terminality and nothing else, so a run the driver REFUSES resolves with
 * `outcome: 'stopped'` and `stoppedBy` carrying the reason rather than throwing it away — `failRun`
 * appends the `stopped` element BEFORE it calls `onRunFailure`, so a refusal is already terminal
 * when a consumer hears of it. The road not taken rejects there, and on the one class of refusal
 * that is reported AND rethrown (`start()` has the caller on the stack) it rejects a promise the
 * caller is never handed: measured in a child process with no listener, **exit 1, the process
 * died**, on an authoring error the consumer had correctly caught. W77 finding B.
 *
 * **There is no deadline and that is deliberate.** Ten of the thirteen blocks this replaces hang
 * for ever precisely because a hand-rolled `new Promise` cannot be raced by whoever holds it; once
 * `done` IS a promise, `Promise.race([done, timeout])` is the consumer's one line. A run parked on
 * a person is `awaiting_action`, which `isTerminal` calls NOT terminal, so `done` waits for the
 * resolution — correct, and a trap, and the reference teaches it rather than the library guessing a
 * number that is wrong for every human-in-the-loop run.
 */
export interface RunHandle {
  /** The run's `Driver`, already started — exactly what `start` returned before ADR 0058. */
  readonly driver: Driver;
  /**
   * **The run's end.** Resolves with the terminal `RunState` — `completed`, `failed`, `stuck` or
   * `stopped` — and never rejects. Pending while the outcome is `running` or `awaiting_action`.
   *
   * It is the SAME expression a consumer would have written, moved: the runtime keeps ONE
   * `RunState` and `step`s it per fold input, which is what `fold` is
   * (`for (const i of inputs) s = step(s, i)`), and `RN-R2` is the rule that says a stepped prefix
   * equals a fold of that prefix. `test/scheduler/runtime.test.ts` holds `await done` equal to
   * `fold(driver.foldInputs())` — the caller's own expression over the driver's own sequence, which
   * is a second route rather than a second definition.
   */
  readonly done: Promise<RunState>;
  /**
   * **What a consumer writes FIRST when it stores this run by appending its events** — P23
   * decision 4, [ADR 0064](../../doc/decisions/0064-a-checkpoint-is-the-whole-event-sequence-and-a-header-and-it-is-a-copy.md)
   * rule 5. Equal to `driver.checkpoint().header` and a separate copy of it.
   *
   * **It arrives AFTER the run's first events, and that is measured rather than avoidable.** `start`
   * dispatches the entry node synchronously, so a consumer's `onFoldInput` has been handed **1 to 5**
   * elements before this handle exists — 1 on 59 of L6's 62 starts, 5 on a nested map at the entry
   * (W88's declaration step) — and it is not bounded by 5: an entry FAN-OUT of N branches delivers
   * `regionEntered`, N `branch.opened` and N `dispatched`, 2N + 1, before `start` returns (W88's
   * conformity reader, finding 11). That is what `onFoldInput`'s `seq` is for: a store keyed by position
   * does not care which was written first (`RN-R18`).
   */
  readonly header: CheckpointHeader;
}

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
  /**
   * Start one run of `flow` with `payload`, and return its {@link RunHandle} — the `Driver`,
   * already started, and a `done` promise that resolves when the run reaches a terminal
   * outcome. **BREAKING at `0.3.0`**: this returned the `Driver` itself until ADR 0058.
   */
  start(flow: FlowDefinition, payload: unknown, options?: StartOptions): RunHandle;
  /**
   * **Resume the run a checkpoint stored**, on THIS runtime's scheduler, and return the same {@link RunHandle} `start` does —
   * `RN-R19` to `RN-R25`, [ADR 0065](../../doc/decisions/0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md).
   * The header is refused first and before any driver exists (`resumeRefusal` — format, flow id, version, a stopped run),
   * then a run id in use (`RunIdInUse`); then a driver is built for `header.runId` exactly as `start` builds one and
   * `Driver.resume` replays the stored events, re-dispatches what was in flight AT-LEAST-ONCE, and appends `resumed`.
   *
   * **The consumer's `onFoldInput` receives the DRIVER's positions from the stored length on** — the elements the replay
   * regenerated past the stored events (the lost tail), then `resumed`, then whatever the run does next — so a store that
   * appends what it is handed holds the whole run again (`RN-R24`). `done` resolves with the terminal `RunState` of the
   * WHOLE run, stored elements included.
   */
  resume(flow: FlowDefinition, checkpoint: Checkpoint, options?: ResumeOptions): RunHandle;
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

  // **The consumer's GATE types, held to `GateType` HERE rather than on a first `start`** — W93, ADR 0067. A gate
  // type is CODE with no document entry (its `fn` is a function), so there is no `both ways` to take against the
  // document as there is for a predicate or a language above: what can be checked is the SHAPE and the name —
  // `GateTypeRefused` and `NameCollision`, the same predicate `checkRegistry` runs in every `new Driver`. Handed
  // to every driver as `registry.gateTypes`; absent, the built-ins alone.
  checkGateTypes(code.gateTypes);

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
    ...(code.gateTypes !== undefined ? { gateTypes: code.gateTypes } : {}),
  };

  // **Which languages each type's pools were BUILT with** — what `start` holds an incoming flow to.
  // Read from `transformLanguagesByType` over the SAME flows `bootstrap` was given: one function,
  // two callers, one input. *(It read them back off `built.workerPools[name].config` at first, which
  // is a `WorkerManager` in production and whatever the pool seam returns at ladder L1 — so the
  // check was blind behind the seam and every transforming flow was refused. Caught on the suite's
  // first run.)*
  const builtLanguages = transformLanguagesByType(options.flows ?? []);

  let minted = 0;
  /**
   * **Every run id a driver of THIS runtime holds** — `RN-R25`, [Q364](../../doc/questions/q364.md), P23 stop-and-ask (b),
   * answered: *refuse, and the counter skips ids in use*. **Held for the runtime's LIFE, not the run's**, and that is a
   * measurement rather than caution: a driver subscribes at construction and `SchedulerLike` has no way to unsubscribe it —
   * since [ADR 0088](../../doc/decisions/0088-a-runtime-routes-each-settlement-to-the-driver-holding-its-run-id.md) to this
   * runtime's ROUTER, which keeps it for the runtime's life (rule 5) — so a completed run's driver still hears every
   * settlement carrying its run id: a second run under that id would have its settlements appended to the first run's
   * sequence, and the first run's checkpoint would change after it completed. So *live* here means *a driver of this runtime
   * holds it*, which is every run it started or resumed.
   */
  const inUse = new Set<string>();
  /** **ADR 0088** — every driver this runtime builds hears its own run's settlements and no other run's. */
  const router = settlementRouter(scheduler);
  const mint = (): string => {
    let id: string;
    do id = `r${++minted}`; while (inUse.has(id));
    return id;
  };
  const runtime: Runtime = {
    registry,
    resolved,
    scheduler,
    pools: built.derived,
    groups,
    start(flow, payload, startOptions = {}) {
      return openRun(flow, payload, startOptions, null);
    },
    resume(flow, checkpoint, resumeOptions = {}) {
      // **The header is refused BEFORE a driver is built** — the one function `Driver.resume` calls too, so the two cannot
      // disagree, and a checkpoint refused here has cost no run id (a driver, once built, is subscribed for good).
      const refused = resumeRefusal(flow, checkpoint);
      if (refused !== null) throw refused;
      // **And an entry payload the clone refuses, before a driver exists too** — W89's conformity reader, finding 7: thrown
      // from `Driver.resume` it spent the run id on this runtime, so the corrected checkpoint could not be resumed here. The
      // platform's `DataCloneError`, as `start()` throws it (`RN-R15`).
      structuredClone(checkpoint.header.entryPayload);
      return openRun(flow, checkpoint.header.entryPayload, { ...resumeOptions, runId: checkpoint.header.runId }, checkpoint);
    },
    shutdown() {
      return scheduler.shutdown();
    },
  };
  return runtime;

  /**
   * **One run opened — by `start` from a payload, or by `resume` from a checkpoint — and the ONE place a runtime builds a
   * `Driver`.** Both doors share it so that every `StartOptions` member reaches a resumed driver by the same road it reaches a
   * started one (`test/scheduler/runtime.test.ts` binds the literal below both ways), and so that the run id in use, the
   * transform refusal and `done` cannot differ between the two.
   */
  function openRun(flow: FlowDefinition, payload: unknown, startOptions: StartOptions, from: Checkpoint | null): RunHandle {
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
    const runId = startOptions.runId ?? mint();
    if (inUse.has(runId)) {
      throw new RunIdInUse(runId, `run id ${q(runId)} is in use on this runtime — a driver it built holds it, and a driver cannot be detached ` +
        'from its scheduler, so a second run under that id would be heard by both (RN-R25, Q364). Resume or start it on a fresh runtime, ' +
        'or omit runId and let the runtime mint one (the counter skips ids in use).');
    }

    // **The run's END, kept by the RUNTIME** — ADR 0058, W77, Q293. `done` resolves with the
    // terminal `RunState` and never rejects; `stopped` is a terminal outcome like any other, so a
    // driver refusal arrives here carrying `stoppedBy` rather than as a thrown `Error`.
    //
    // **What is kept is ONE `RunState`, not the inputs.** `fold` IS this loop —
    // `for (const i of inputs) s = step(s, i)` — and `RN-R2` is the rule that a stepped prefix
    // equals a fold of that prefix, so this is `fold`'s own body with the prefix kept instead of
    // recomputed. Measured over a 24-branch fan-out: keeping the inputs and re-folding retains
    // 445.5 KiB and takes 23 ms, re-reading `driver.foldInputs()` deep-clones 5944 elements and
    // takes 35 ms, and this retains 437.3 KiB and takes 6 ms. *(`foldInputs()` is
    // `Object.freeze(this.inputs.map(freezeInput))`, so every call clones every result.)*
    //
    // **The price, stated rather than hidden** (P20's Scope Out): `step` writes
    // `result: r.result` by reference into the record `freezeInput` cloned, so this pins ONE copy
    // of every result for the life of the run — P15's own quantity, (tasks settled) x (bytes each
    // returned), once more.
    //
    // **It is ABOUT THE SAME as what the block it replaces retains, not half, and the first
    // version of this comment said half.** The copied block keeps its `inputs` array AND folds a
    // state out of it — but `step` writes `result: r.result` BY REFERENCE, so that state's results
    // ARE the objects inside its own `inputs`, and `v8.serialize` called on two roots cannot see
    // the sharing. Measured: the block retains **89.1 KiB** of inputs plus **0.6 KiB** of state
    // scaffolding = ~89.7, against this mechanism's **87.6** — ~2% less, where adding the two
    // serialisations gave a spurious 176.7 and a spurious factor of two. *The identity measurement
    // that falsifies the sum was printed three lines above it* (W77's conformity reader, finding 3).
    //
    // And it is bounded per RETAINED HANDLE rather than per live run: a promise retains its
    // resolution, which is the property that makes `done` worth having, so a consumer holding N
    // settled handles holds N `RunState`s. A consumer who previously kept no completion machinery
    // at all now pays one copy they did not, and the `structuredClone` `freezeInput` makes is now
    // paid on every settlement of every run rather than only where a consumer asked for one.
    // [Q320](../../doc/questions/q320.md).
    let settle!: (s: RunState) => void;
    const done = new Promise<RunState>((resolve) => { settle = resolve; });
    let state = emptyState();
    let settled = false;
    // **A RESUMED run's state starts from the events the checkpoint STORED** (`RN-R25`), stepped at the first element the
    // driver delivers — the first position PAST them (`RN-R24`). Not before: `Driver.resume` compares every stored element
    // with what its replay regenerates and delivers nothing until the stored ones have all been matched, so by the time this
    // steps them they are the driver's own first elements, and a checkpoint the replay refuses is never folded here at all.
    let seed: readonly FoldInput[] | null = from === null ? null : from.events;
    // **The STEP is synchronous and the PREDICATE is not, and the split is load-bearing.** The
    // driver dispatches the next node synchronously inside the same listener turn, so asking
    // `isTerminal` the instant an input arrives can report a terminal state with the run still
    // going — `AGENTS.md`'s own prose calls this "load-bearing rather than decoration" and
    // `RN-R12` claims its predicate at rest. Stepping, by contrast, is correct at every prefix.
    const settleIfTerminal = () => {
      if (settled || !isTerminal(state)) return;
      settled = true;
      settle(state);
    };
    // **The whole of `registry`, spread** — which is what makes decision 14's claim true: a
    // consumer who writes this line by hand passes the same object, `predicates` included.
    // **A per-run VIEW of the scheduler, not the scheduler** — ADR 0088 rule 1. `addTask` is the scheduler's own; a
    // listener the driver attaches is held by the runtime's router under THIS run id, so a settlement reaches this driver
    // only when its task id names this run (or names no run at all, which every driver must hear — ADR 0027). **It SHADOWS
    // the runtime's `scheduler` for the rest of this function, on purpose**: the literal below cannot hand a driver the
    // scheduler itself by accident, and it stays the bare `scheduler,` line W76's binding reads as road (a).
    const scheduler = router.forRun(runId);
    const driver = new Driver(flow, {
      runId,
      scheduler,
      ...registry,
      joinPolicy: startOptions.joinPolicy ?? liveToken,
      ...(options.defaultRetryPolicy !== undefined ? { defaultRetryPolicy: options.defaultRetryPolicy } : {}),
      ...(options.validateBoundaries !== undefined ? { validateBoundaries: options.validateBoundaries } : {}),
      ...(startOptions.createTask !== undefined ? { createTask: startOptions.createTask } : {}),
      // **`onFoldInput` is COMPOSED, not conditionally spread** — the runtime needs this channel
      // to keep `done`, and it is also a `StartOptions` member a consumer may pass, so replacing
      // it would silently drop theirs. Record first, schedule second, hand on third: `done`
      // settles from a sequence no consumer callback can shorten. This is the THIRD road
      // `start` reaches a member by, and `test/scheduler/runtime.test.ts` binds all three both
      // ways and pins this one — W76's ratchet, moved deliberately rather than around.
      // **`seq` is handed on as the DRIVER gave it** (`RN-R18`, ADR 0064 rule 5) — never counted
      // here. A runtime-side counter would agree today, because this wrapper sees every element
      // of a run from its first, and it is the well-formed wrong answer the first time a driver's
      // sequence does not start at this callback's first call.
      onFoldInput: (input: FoldInput, seq: number) => {
        if (seed !== null) {
          for (const stored of seed) state = step(state, stored);
          seed = null;
        }
        state = step(state, input);
        queueMicrotask(settleIfTerminal);
        startOptions.onFoldInput?.(input, seq);
      },
      ...(startOptions.onRegionEvent !== undefined ? { onRegionEvent: startOptions.onRegionEvent } : {}),
      ...(startOptions.onRunFailure !== undefined ? { onRunFailure: startOptions.onRunFailure } : {}),
      ...(startOptions.onUnsatisfiableJoin !== undefined ? { onUnsatisfiableJoin: startOptions.onUnsatisfiableJoin } : {}),
      ...(startOptions.onUnmintedTask !== undefined ? { onUnmintedTask: startOptions.onUnmintedTask } : {}),
      ...(startOptions.onNonconformingResult !== undefined ? { onNonconformingResult: startOptions.onNonconformingResult } : {}),
      ...(startOptions.now !== undefined ? { now: startOptions.now } : {}),
    });
    // **In use from the moment the driver EXISTS**, before it starts or resumes: it has subscribed, and a `start` refused by
    // `FD-R4` or a resume refused mid-replay leaves a driver that still hears this run id (RN-R25).
    inUse.add(runId);
    if (from === null) driver.start(payload);
    else driver.resume(from);
    // **The header is the DRIVER's, read back — not assembled here from `flow`, `payload` and
    // `runId`** (ADR 0064 rule 5, P23 decision 4). Assembling it would agree on every field but
    // one: the entry payload would be the caller's own object, which the caller can still mutate.
    return { driver, done, header: driver.checkpoint().header };
  }
}

/**
 * **ADR 0088 — the runtime ROUTES each settlement to the driver holding its run id**, where one shared scheduler used to
 * broadcast it to every driver and `ID-R4` tier 1 dropped all but one: N runs settling `k` times each cost `N² x k`
 * deliveries ([Q244](../../doc/questions/q244.md), W55's measurement, re-taken by W142).
 *
 * **What it does, rule by rule.** `forRun(runId)` is the `SchedulerLike` a driver is handed (rule 1): `addTask` is the
 * scheduler's own, and `addEventListener` files the listener under `runId` and that event name. The scheduler is subscribed
 * ONCE per event name, by the first driver that asks (rule 2). Each event is read for `detail.id` and nothing else, and that
 * id is put through `parseTaskId` — `ID-R4`'s tier-0 parse, the same function, so the grammar is in one place (rule 3).
 * Then (rule 4): a run id some driver here holds goes to that run's listeners and to no other; a run id none holds goes
 * nowhere, which is what every driver's tier 1 did with it; and an id that does not parse — or is not a string — goes to
 * EVERY driver subscribed to that event, in subscription order, so each still reports it through `onUnmintedTask` under
 * its own run id (ADR 0027 rule 3). Nothing is ever removed (rule 5, `RN-R25`).
 *
 * **Why `parseTaskId` and not the cheaper `split(':')[0]`.** `pc:ingest:x:0` has a run-id-shaped first segment and does
 * not parse: split would route it to `pc` alone and every other driver would stop reporting it. L6's second pair row
 * carries that id for exactly this.
 *
 * **A listener that throws does not starve the others, and its throw still reaches whoever dispatched the event.** A
 * driver's own listener catches everything its routing raises (`OR-R10`); what can still escape is a consumer's callback —
 * `onFoldInput` or `onRunFailure` — throwing out of the driver's failure path. Before ADR 0088 that throw left the driver's
 * listener and reached the scheduler's `dispatchEvent`, which reports it; it still does, because the FIRST throw is
 * re-thrown here after the loop, synchronously — so a run's single routed listener throws exactly as it did. Only the
 * broadcast row can hand one event to several drivers, and there the loop finishes first: every later throw is re-raised on
 * a microtask, as `dispatchEvent` reports each listener's on its own. *(Isolating EVERY throw onto a microtask was the first
 * version, and `test/scheduler/runtime.test.ts`'s W77 case — a consumer's `onFoldInput` throwing, over a scheduler double
 * that calls listeners directly — took the process down: the throw that used to unwind to the double's caller became an
 * uncaught exception.)*
 */
function settlementRouter(scheduler: SchedulerLike): { forRun(runId: string): SchedulerLike } {
  type Listener = (e: object) => void;
  /** run id -> event name -> the listeners filed under it. */
  const byRun = new Map<string, Map<string, Listener[]>>();
  /** event name -> every listener filed under it, in subscription order — rule 4's third row. */
  const every = new Map<string, Listener[]>();
  const deliver = (name: string): Listener => (e) => {
    const detail = 'detail' in e ? (e as { detail?: unknown }).detail : undefined;
    const id = typeof detail === 'object' && detail !== null ? (detail as { id?: unknown }).id : undefined;
    let runId: string | null = null;
    if (typeof id === 'string') {
      try {
        runId = parseTaskId(id).runId;
      } catch (err) {
        if (!(err instanceof InvalidTaskId)) throw err;
      }
    }
    const listeners = runId === null ? every.get(name) : byRun.get(runId)?.get(name);
    if (listeners === undefined) return;
    let first: { err: unknown } | null = null;
    for (const listener of listeners) {
      try {
        listener(e);
      } catch (err) {
        if (first === null) first = { err };
        else queueMicrotask(() => { throw err; });
      }
    }
    if (first !== null) throw first.err;
  };
  return {
    forRun(runId) {
      return {
        addTask: (task, options) => scheduler.addTask(task, options),
        addEventListener(name, listener) {
          let mine = byRun.get(runId);
          if (mine === undefined) byRun.set(runId, mine = new Map());
          mine.set(name, [...(mine.get(name) ?? []), listener]);
          const all = every.get(name);
          if (all === undefined) {
            every.set(name, [listener]);
            scheduler.addEventListener(name, deliver(name));
          } else {
            all.push(listener);
          }
        },
      };
    },
  };
}

/** Re-exported so a consumer can read what a schema-bearing built-in admits without importing the pure entry. */
export type { JsonSchema, TaskNode };
