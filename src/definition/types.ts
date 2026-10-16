/**
 * The flow definition, as data. `spec/flow-definition.md` sections 1-3.
 *
 * ADR 0002 rule 1: no functions anywhere in the structure. Everything here
 * survives `JSON.parse(JSON.stringify(x))`, which is what lets a definition be
 * validated, rendered and persisted by things that never ran it.
 */
// **The scheduler's ResourceGroup TYPE, by the bare specifier ADR 0048 rule 4 allows** — W65: a group
// type's factory returns one. Type-only: erased in every build, so the pure entry still loads no
// scheduler value.
import type { ResourceGroup } from 'fyflow-scheduler';
import type { JsonSchema } from './schema.ts';
export type { JsonSchema } from './schema.ts';

/**
 * The terminal states an edge may opt into. `user_action` is refused: it suspends (FD-V18). **And
 * `cancelled` is refused too** — a cancel is the consumer's own act and halts the run rather than
 * routing it ([ADR 0094](../../doc/decisions/0094-a-cancelled-task-is-a-terminal-state-that-routes-no-edge-and-ends-its-run-cancelled.md)
 * rule 1), so `FD-V18` still admits exactly these two.
 */
export type RoutableState = 'done' | 'failed';

/**
 * Every terminal state a scheduler task can reach. **Six library states, four terminal** — `cancelled`
 * since the scheduler pin W157 moved to, which ends a task through `scheduler.cancel()` alone
 * ([ADR 0094](../../doc/decisions/0094-a-cancelled-task-is-a-terminal-state-that-routes-no-edge-and-ends-its-run-cancelled.md),
 * W158). **Widening this union is BREAKING for a consumer switching on it exhaustively**, on
 * `resumed`'s and `gated`'s precedent: such a switch stops compiling, and one comparing strings does
 * not notice.
 */
export type TerminalState = 'done' | 'failed' | 'user_action' | 'cancelled';

/**
 * **A declared reference to something the run has produced** —
 * `spec/flow-definition.md` section 3's `needs`, and
 * [ADR 0040](../../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md).
 *
 * Three forms, all of them data (ADR 0002 rule 1 — nothing here is a function and
 * everything survives `JSON.parse(JSON.stringify(x))`):
 *
 * | | |
 * |---|---|
 * | `"."` | what this node would have received anyway — the ordinary edge's value, and for a `map` instance its own item (`JP-R11`). The one token outside `FD-V16`'s charset, so it can never collide with a node id |
 * | `"score"` | that node's output **on this node's own branch path**. Exactly one, or the run stops (`FD-R3`) |
 * | `["score"]` | that node's outputs as an **array**, in ascending segment-wise-numeric `branchPath` order. Legal only where the reader is outside a region containing the named node (`FD-V28`) |
 *
 * **The array form uses JSON's own array syntax rather than a sigil**, so the
 * grammar needs exactly one invented token (`"."`) rather than two.
 */
export type Reference = string | readonly [string];

/**
 * **What a node receives, when it does not want the previous node's output** —
 * `FD-C1`. An object whose keys are the keys of the payload the node receives and
 * whose values are references. A node that declares one receives **exactly** the
 * object this describes; a node that does not receives what section 3 says an
 * ordinary edge carries, unchanged.
 *
 * Only a `task` and a `map` may carry it: `FD-V17` already refuses an undeclared
 * key on the other three kinds, so that clause needs no rule of its own.
 */
export type Needs = Readonly<Record<string, Reference>>;

/**
 * **The seven operators a declared predicate may use, and no others** — `FD-V44`,
 * [ADR 0074](../../doc/decisions/0074-a-predicate-is-a-registered-name-or-a-declared-comparison-over-the-context.md).
 * The enumeration is CLOSED and an operator outside it is refused BY NAME at construction, which is
 * [ADR 0053](../../doc/decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md)'s
 * shape and is what stops this becoming a bad expression language one shape at a time.
 *
 * **The six COMPARISONS are closed under negation OVER THE VALUES THEY CAN COMPARE** — `eq`/`ne`,
 * `lt`/`gte`, `gt`/`lte` — which is what lets `!p` be written as `p` with the complementary operator
 * rather than needing a `not` combinator, and a `not` would open the nesting P26 decision 3 refuses.
 * **The scope is the whole of the claim**: `eq`/`ne` complement over every value, and the four
 * ORDERING operators complement over numbers and over an absent path with a `default` — on a value
 * they cannot compare, a string or a boolean or an array, BOTH are false, because the comparison is
 * type-strict and no `default` fires on a path that resolved. W108's conformity reader (1) measured
 * that and the sentence said *closed* flatly. **`startsWith` is not closed at all**, and a negated
 * prefix is one of the things that stays a registered name.
 *
 * *(`ne` and `gte` have no instance anywhere in this tree — W108's declaration step measured ten
 * predicate bodies and they use `lt`, `gt`, `lte`, `eq` and `startsWith`. They are here for the
 * closure above, and their cases are CONSTRUCTED rather than found, which rule 8's *construct the
 * case that makes each guard fire* asks to be said rather than left looking covered.)*
 */
export const PREDICATE_OPS = ['eq', 'ne', 'lt', 'lte', 'gt', 'gte', 'startsWith'] as const;
export type PredicateOp = typeof PREDICATE_OPS[number];

/** The two roots a predicate's key path may start at — the two members of `DecisionContext`, and no other. */
export const PREDICATE_ROOTS = ['outcome', 'needs'] as const;

/**
 * **What a declared comparison may compare AGAINST** — a scalar, and nothing else (`FD-V44`).
 * Every one of the ten predicate bodies in this tree compares to one (`0.5`, `50`, `true`,
 * `'r1:publish:'`, `0`), and admitting an object would need a deep-equality semantics with no
 * instance and no obvious right answer for `NaN`, key order or a prototype.
 */
export type PredicateScalar = null | boolean | number | string;

/** A registered predicate NAME, resolved against the registry at instantiation (`FD-V4`). */
export interface PredicateName {
  predicate: string;
}

/**
 * **One comparison over the decision's own context** — `FD-V43` owns the path and `FD-V44` the
 * operator and the value.
 */
export interface PredicateLeaf {
  /**
   * A KEY PATH over the `DecisionContext` itself, read by `readKeyPath` — the same resolution a
   * gate's `settings.key` gets, measured unchanged at this scope. **Its first segment is `outcome`
   * or `needs` and nothing else** (`FD-V43`), because a first segment that is neither resolves to
   * `undefined` in silence and a typo would be a wrong key rather than a refusal.
   */
  path: string;
  op: PredicateOp;
  /** The literal compared against. Required — there is no operator here that takes one operand. */
  value: PredicateScalar;
  /**
   * **What is compared when the path does not resolve, or resolves to `null`.** Absent is NO MATCH
   * by default; where this is declared it is substituted instead — which is `?? 0` and `?? []`
   * **including their nullish half**, two of the measured shapes. *(It stood in for `undefined`
   * alone until both of W108's readers found the same hole: `readKeyPath` returns a terminal `null`
   * as a resolved value, so on a null-valued key `gt` and `lte` were BOTH false and the declared
   * form was not `??`. Where NO default is declared a resolved `null` stays `null`, so `eq null`
   * still holds.)*
   *
   * **It is what makes the comparisons closed under negation over the values they can compare** —
   * without it both `x > t` and `x <= t` are false for an absent path and no pair complements.
   * **Over a value an ordering operator CANNOT compare — a string, a boolean, an array — both are
   * still false and no `default` changes that**, because the comparison is type-strict and the path
   * resolved; that is the closure's scope and W108's conformity reader (1) is why it is written
   * down here rather than left to be inferred from the type-strict rule two paragraphs up.
   */
  default?: PredicateScalar | readonly PredicateScalar[];
  /**
   * **Compare the LENGTH of an array or a string, not the value** — `(needs.f ?? []).length > 0`.
   * Applied AFTER `default` is substituted and before the comparison; anything that is neither an
   * array nor a string is NO MATCH. Exactly `true` or absent (`FD-V44`).
   */
  length?: true;
}

/**
 * **A FLAT group — `all` or `any`, and its members are LEAVES.** Nesting is refused by name
 * (`FD-V45`), and so is a `{ predicate }` member: a group holding a registered name could be
 * impure, which would falsify the one thing a declared predicate guarantees over a function
 * ([Q9](../../doc/questions/q9.md)).
 *
 * **A two-member UNION rather than one interface with two optional keys, so that `{}` and
 * `{ all, any }` fail at L0** — W108's conformity reader (16) measured that
 * `interface PredicateGroup { all?; any? }` makes `when: {}` and `when: { all: [], any: [] }`
 * compile at `tsc --strict` EXIT 0, so `FD-V42`'s and `FD-V45`'s cheapest observer was the
 * validator and not the typechecker. The union costs **ZERO** on all five typecheck lanes. **Its
 * limit, stated**: a union admits a property declared by ANY member, so
 * `{ predicate, path, op, value }` — two shapes at once — still compiles and is caught only by
 * `FD-V42`. A type closes one direction ([Q196](../../doc/questions/q196.md), W43).
 */
export type PredicateGroup =
  | { all: readonly PredicateLeaf[]; any?: never }
  | { any: readonly PredicateLeaf[]; all?: never };

/**
 * **What a `when` IS** — `FD-V42`, [ADR 0074](../../doc/decisions/0074-a-predicate-is-a-registered-name-or-a-declared-comparison-over-the-context.md):
 * exactly one of three object shapes, told apart by which keys are present.
 *
 * **A bare STRING is REFUSED**, and that is the maintainer's answer to W108's stop-and-ask (b),
 * taken against the recommendation: one uniform shape, at the cost of a BREAKING change the
 * migration MADE in **102 sites over 38 files**. *(The declaration's survey found **105 sites over
 * 41 files**, which is the wider scope — it counts `doc/**`, deliberately left as history, and the
 * `.md` prose. One measurement with two scopes was reported as two measurements until W108's
 * conformity reader (6) re-took both.)*
 */
export type When = PredicateName | PredicateLeaf | PredicateGroup;

export interface Edge {
  /** Target node id. Required (FD-V23). */
  to: string;
  /**
   * Terminal states this edge is eligible for. Default `['done']` — an edge with
   * no `on` routes successes and nothing else (ADR 0004 rule 1).
   */
  on?: RoutableState[];
  /**
   * **A registered NAME or a DECLARED comparison, and always an object** — `FD-V42`,
   * [ADR 0074](../../doc/decisions/0074-a-predicate-is-a-registered-name-or-a-declared-comparison-over-the-context.md).
   * *(This was `when?: string` until v0.27; the name road is now `{ predicate: "<name>" }`.)*
   */
  when?: When;
  /**
   * **What this edge's PREDICATE sees, beyond its node's outcome** — `FD-C3`, and
   * [ADR 0041](../../doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md),
   * answering [Q8](../../doc/questions/q8.md).
   *
   * Same grammar as a node's, same aiming rules (`FD-V26`-`FD-V28`), **minus the
   * `"."` form** — *what this predicate would have received anyway* is
   * `ctx.outcome`, which it already has, so the token has nothing to name.
   *
   * **On the EDGE and not on the node**, and that is the whole of why Q8 turned out
   * to be its own decision: a node's `needs` rewrites what its WORKER receives, and
   * a node's payload is not derivable at routing time.
   */
  needs?: Needs;
  /**
   * **Which of a GATE's routes this edge carries** — `spec/flow-definition.md` v0.23,
   * [ADR 0066](../../doc/decisions/0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md).
   * A route name the gate's TYPE declares; **absent means the type's DEFAULT route**, never *every*
   * route — the precedent is an edge with no `on`, which means `done` only. `FD-V41` owns the key
   * everywhere: on an edge of any node that is not a `gate` it is refused, and a gate's edge carries
   * `to` and `route` and nothing else.
   */
  route?: string;
}

/**
 * **How a task node's attempts are retried by the SCHEDULER** — `spec/flow-definition.md`
 * section 2, v0.16 ([W58](../../doc/work-items/w58-what-a-node-says-about-its-own-task.md),
 * [Q16](../../doc/questions/q16.md)'s task half). Exactly the scheduler's own shape at 0.5.2,
 * `{ maxRetries: number; backoffMs: number }`, with the ranges `FD-V30` refuses outside of: the
 * scheduler coerces (`maxRetries: "1"` retries, `1.5` retries, `{}` silently means *no
 * retries*), and a definition is data that arrives from anywhere, so the shape is pinned here.
 *
 * A retry happens INSIDE one task id and is reported on the outcome record's `attempts`
 * (`OR-R2`); the id's fourth segment is for a flow-level retry, which this library does not
 * mint ([Q111](../../doc/questions/q111.md)).
 */
export interface RetryPolicy {
  /** How many times the scheduler re-dispatches a failed attempt. An integer >= 0. */
  maxRetries: number;
  /** Milliseconds between a failed attempt and its retry. A finite number >= 0. */
  backoffMs: number;
}

/**
 * **The registry's node types, keyed by the name a `task`'s `type` gives** — v0.19 (W65, ADR 0054):
 * each entry the DOCUMENT form (`NodeTypeDeclaration`, the identity derivation's input) or the CLASS
 * form (`NodeTypeDefinition`, any other derivation), told apart by whether `pool` is a function. A
 * `Map` or a plain object, as the consumer prefers. *(v0.17's `NodeType` — a worker URL and a
 * settings VALIDATOR function — retired here: a JSON registry cannot carry a function, and the
 * settings language is the worker's `settingsSchema`, ADR 0053.)*
 */
export type NodeTypes = ReadonlyMap<string, NodeTypeEntry> | Readonly<Record<string, NodeTypeEntry>>;

/** The registry's workers, keyed by the name a node type's `worker` gives — v0.19. A `Map` or a plain object. */
export type Workers = ReadonlyMap<string, WorkerEntry> | Readonly<Record<string, WorkerEntry>>;

/**
 * The registry's NAMED pool instances, keyed by the name a `task`'s `pool` gives — v0.19. What the
 * validator reads of one is its `type` (`FD-V38`); a `PoolInstance` and a resolved pool both fit.
 * **Absent means EMPTY**; a type's DEFAULT instance is implicit and never listed here.
 */
export type Pools = ReadonlyMap<string, Readonly<PoolInstance>> | Readonly<Record<string, Readonly<PoolInstance>>>;

/**
 * **A declared transform: a language NAME and an expression in it** — `spec/flow-definition.md`
 * section 2's `transform` subsection (v0.18). Data, as everything in a definition is (ADR 0002
 * rule 1): the language is named, never a file and never a function, and the definition says
 * WHAT it does to its input without carrying the thing that does it.
 */
export interface Transform {
  /** A key in `Registry.languages`. */
  lang: string;
  /** Text the named language's `compile` accepts; `$` is the value this node receives and `$settings` its effective settings. */
  expr: string;
}

/**
 * **A language adapter has TWO HALVES, because a function cannot cross to a thread and a URL
 * can** — P17 fact 7 (a threaded pool whose config carries a function fails its task with *could
 * not be cloned*; a URL string crosses). ADR 0051 rule 2.
 *
 * - `compile`, the REGISTRY half: synchronous, on the main thread, returns nothing and THROWS on
 *   an expression the language refuses, with the language's own message — what `FD-V36` reports,
 *   at `new Driver`, with the error's `position` and `code` as detail when the language sets them.
 * - `worker`, the WORKER half: the URL of a module whose default export is
 *   `compile(expr) => { evaluate(input, settings) => Promise<unknown> }` — the wrapper `await`s the
 *   result, so a plain value is tolerated and never required. The bootstrap
 *   helper writes it into a typed pool's config and the envelope worker loads it in `setup()`.
 * - `check`, RESERVED for P18 and implemented by nothing: a statically typed language may offer
 *   `check(expr, inputShape) => outputShape` for the pre-flight that plan builds. Optional, not
 *   absent — the conformance suite asserts the field may be present and never that it is.
 *
 * **The two halves can disagree** — one module compiled twice is the same language; two modules,
 * or two versions on the two sides of a thread, are two ([Q264](../../doc/questions/q264.md)).
 * The conformance suite in `test/scheduler/adapter-conformance.ts` asserts, for an adapter it is
 * handed, that the worker half refuses exactly what the registry half refuses.
 */
export interface LanguageAdapter {
  compile(expr: string): void;
  worker: string;
  check?(expr: string, inputShape: unknown): unknown;
}

/** The registry's languages, keyed by the name a `transform`'s `lang` gives. A `Map` or a plain object, as `nodeTypes` is. */
export type Languages = ReadonlyMap<string, LanguageAdapter> | Readonly<Record<string, LanguageAdapter>>;

// ---- the registry DOCUMENT — v0.19, P18, W65 ----------------------------------------------------
//
// **A flow and the runtime it needs are two DOCUMENTS and a registry of names** — P18's question,
// [ADR 0054](../../doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md).
// Everything below is data (ADR 0002 rule 1) except the two things decision 2 and decision 4 make
// FUNCTIONS on purpose — a node-type CLASS's `pool()` derivation and a group type's `create` — and
// those live in the `code` argument a consumer passes, never in the document.

/**
 * **A worker entry: the module URL and what the worker SAYS about itself, as four JSON schemas** —
 * decision 3. `url` is the only required field; an absent schema means UNCHECKED, stated. The first
 * two are enforced by this plan (`configSchema` over a type's and an instance's derived config at
 * construction; `settingsSchema` over a node's effective settings at `new Driver`, `FD-V33`); the
 * last two are declared, carried and enforced on no run — P19 confirms them on a run by an
 * authoring-time check (`check-workers`, W72) and validates a declared `examples` at construction (ADR 0056). All four are held
 * to the built-in subset at construction (ADR 0053, Q278).
 */
export interface WorkerEntry {
  /** The worker class's module URL — its default export is the class. Relative URLs resolve against the runtime's `base` (decision 7). */
  url: string;
  /** What the worker's CONSTRUCTOR argument must satisfy — a type's or an instance's DERIVED config. */
  configSchema?: JsonSchema;
  /** What a node's effective `settings` must satisfy — `FD-V33`, a schema in place of W59's function. */
  settingsSchema?: JsonSchema;
  /** What the worker's `run()` receives as `input`. Declared and carried; not enforced (P19). */
  inputSchema?: JsonSchema;
  /** What the worker's `run()` returns. Declared and carried; not enforced (P19). */
  outputSchema?: JsonSchema;
}

/**
 * **What a derivation RETURNS: what ONE `WorkerManager` needs, minus the two things the TYPE states
 * beside it** (`worker`, `inline`) — decision 2. `config` is the worker's constructor argument and
 * is checked against `workers[worker].configSchema`; the rest are the scheduler's own options, and a
 * key is present only when the derivation has something to say (P18 fact 5: absent, not empty).
 */
export interface PoolSpec {
  config?: unknown;
  maxThreads?: number;
  maxConcurrentTasks?: number;
  idleTimeout?: number;
  /** Group KEYS every task of the pool acquires; the scheduler unions them with a node's `workerGroups`. */
  groups?: readonly string[];
  /** Group keys held for the WORKER's lifetime rather than per task, at a cost each — never beside `idleTimeout: 0` (decision 9). */
  residentGroups?: readonly string[] | Readonly<Record<string, number>>;
  /**
   * **Threaded pools: the ms a cancelled task's worker gets to stop by itself before it is forced** — the
   * scheduler's own option, declarable since `spec/flow-definition.md` v0.33 (P33 decision 6, W159). Zero or
   * more, `Infinity` included (the scheduler's *never force*); accepted, and ignored by the scheduler, on an
   * inline pool.
   */
  cancelGraceMs?: number;
  /**
   * **The bounds on a worker's `context.emit()`** — the scheduler's `messages` option, declarable since v0.33
   * (P33 decision 6, W159): events batched for up to `flushIntervalMs` (a finite number > 0), at most
   * `maxBuffered` (an integer >= 1) per buffer between flushes. Each key optional; a key PRESENT is held to its
   * rule whatever its value, `undefined` included, because the scheduler spreads this object over its defaults
   * and a present `undefined` is what it throws on. Written out rather than imported from the scheduler, as
   * `POOL_SPEC_KEYS` is a literal: a key the scheduler adds is admitted by a version of the spec, not by a bump.
   */
  messages?: Readonly<{ flushIntervalMs?: number; maxBuffered?: number }>;
}

/**
 * **A node type as a DERIVATION from an instance's config to pool options** — decision 2, the CLASS
 * form. A document-declared type is this interface implemented by `nodeTypeFromDeclaration` (the
 * identity derivation — merge the instance's config over the declared fields); a class registered in
 * `code` is any other (`model: "large"` into a resident VRAM cost and a thread count). **Both
 * outputs pass through the same checks**, so a class cannot compute around one. A class decides how
 * a pool is BUILT and nothing about which node runs on it — that is routing, and ADR 0001 keeps
 * routing in the driver.
 */
export interface NodeTypeDefinition {
  /**
   * A key into the registry document's `workers`. Fixed per type. **ABSENT on a BUILT-IN type that
   * only transforms** (ADR 0075): such a type has no inner worker, so its pool loads the envelope
   * alone and `run()` returns the transform's own result. A CONSUMER's type must name one —
   * `checkNodeTypeShape` refuses a worker-less entry that is not a built-in, because an omitted
   * `worker` would otherwise become a transform-only type by accident.
   */
  readonly worker?: string;
  /** Fixed per type; an instance may not override it. Absent means the scheduler's default and the options bag omits the key (fact 5's rule applied to `inline`). */
  readonly inline?: boolean;
  /** The knobs an INSTANCE may set — the input to the derivation, checked before `pool()` is called. Absent means unchecked. */
  readonly configSchema?: JsonSchema;
  /** The DEFAULT instance's config (`undefined` reaches the derivation as-is; an object schema reads it as `{}`). Refused at construction when it fails `configSchema`, or when its derived config fails the worker's. */
  readonly config?: unknown;
  /** The type's retry default for its nodes (W59's merge: node, then type, then the driver's default, whole each time). */
  readonly retryPolicy?: RetryPolicy;
  /** Settings DEFAULTS, merged under a node's `settings` before the worker's `settingsSchema` is applied — decision 12, the one new field on a type. */
  readonly settings?: Readonly<Record<string, unknown>>;
  /** The derivation: a validated instance config and the instance's key, to what ONE `WorkerManager` needs. */
  pool(config: unknown, key: string): PoolSpec;
}

/**
 * **The DOCUMENT form of a node type — pure data, the identity derivation's input.** `worker` names
 * a worker entry; `inline` is the type's; `config` is the default instance's constructor argument;
 * `pool` carries the declared pool options (a `PoolSpec` minus `config` and `groups`); `groups` are
 * the pool's group keys; `retryPolicy` and `settings` are what the type declares FOR its nodes. An
 * instance's `config` merges shallowly over `config`, and since v0.37 a named instance's own `pool` merges shallowly
 * over `pool` (ADR 0099); every other field is copied as declared, every object in it copied.
 */
export interface NodeTypeDeclaration {
  /** As `NodeTypeDefinition.worker`: absent only on a built-in that only transforms (ADR 0075). */
  worker?: string;
  inline?: boolean;
  config?: unknown;
  pool?: Readonly<Omit<PoolSpec, 'config' | 'groups'>>;
  groups?: readonly string[];
  retryPolicy?: RetryPolicy;
  settings?: Readonly<Record<string, unknown>>;
}

/** A node type as the registry holds it: the document form or the class form, told apart by whether `pool` is a function. */
export type NodeTypeEntry = NodeTypeDeclaration | NodeTypeDefinition;

/** A NAMED instance of a node type — decision 1. The default instance is implicit, keyed by the type's name, built from the type's own `config`. */
export interface PoolInstance {
  /** The node type this is an instance of. */
  type: string;
  /** The instance's config — the derivation's input, merged over the type's for a document type. */
  config?: unknown;
  /**
   * **The instance's OWN pool options** — v0.37, [ADR 0099](../../doc/decisions/0099-a-named-instance-of-a-document-type-may-declare-its-own-pool-options.md):
   * the keys a type's `pool` may declare, merged SHALLOWLY over its type's (the instance's key winning, a key present
   * with `undefined` absent), every object in them copied. **On an instance of a DOCUMENT type only** — one of a CLASS
   * type is refused (`UndeclaredKey`): the class receives the instance key and owns how its pool is built.
   */
  pool?: NodeTypeDeclaration['pool'];
}

/** A resource group the runtime constructs — an instance of a group TYPE, by name, with the config its factory's schema admits. */
export interface GroupInstance {
  /** One of the three built-ins (`ConcurrentLimitGroup`, `RateLimitGroup`, `KeyedRateLimitGroup`) or a group type registered in `code`. */
  type: string;
  config?: unknown;
}

/**
 * **A resource group is a FACTORY** — decision 4 and P18 fact 2: the scheduler's three group classes
 * have three different constructors, so each is a `create(config, key)` behind one shape, and a
 * consumer registers a custom class the same way. `create` returns the scheduler's own `ResourceGroup`
 * interface. **The runtime holds what it returns to SIX members** — `canRun`, `onStart` and
 * `onFinish` because the scheduler calls them, `getMetrics`, `id` and `type` because the interface
 * requires them — each refused by name (ADR 0055, W66; the `.d.ts` marks the middle two optional and
 * the scheduler calls them unguarded, measured). The key is the group's identity and the object's own
 * `id` is inert (ADR 0049 fact 2).
 */
export interface GroupType {
  configSchema?: JsonSchema;
  create(config: unknown, key: string): ResourceGroup;
}

/**
 * **The registry DOCUMENT** — the data half of P18's answer. Every section is optional and absent
 * means EMPTY. `predicates` and `languages` are NAMES the flows may use; the `code` argument
 * supplies each one (decision 13 — the runtime imports no engine). The DRIVER's registry is derived
 * from this and exposed as `runtime.registry` (decision 14).
 */
export interface RegistryDocument {
  workers?: Readonly<Record<string, WorkerEntry>>;
  groups?: Readonly<Record<string, GroupInstance>>;
  nodeTypes?: Readonly<Record<string, NodeTypeDeclaration>>;
  pools?: Readonly<Record<string, PoolInstance>>;
  predicates?: readonly string[];
  languages?: readonly string[];
}

/**
 * **What stays CODE, exactly** — decision 7: custom predicates, language adapters, custom group
 * types, custom node-type classes. Nothing here is written into a document; everything the document
 * NAMES from here is compared to it at construction, and a name that resolves to two definitions is
 * refused (decision 2's one namespace).
 */
export interface RegistryCode {
  /** The predicate functions the document's `predicates` name — a `Map`, a record, or the names alone where only the registry is being resolved. */
  predicates?: ReadonlyMap<string, unknown> | Readonly<Record<string, unknown>> | ReadonlySet<string> | readonly string[];
  /** Custom group types, by the name the document's `groups` use in `type`. A built-in's name is refused. */
  groupTypes?: Readonly<Record<string, GroupType>>;
  /** Custom node-type classes, by the name a flow's `type` uses. A name the document's `nodeTypes` also declares is refused. */
  nodeTypes?: Readonly<Record<string, NodeTypeDefinition>>;
  /** The adapters the document's `languages` name. */
  languages?: Languages;
  /**
   * **A consumer's GATE types, beside the built-ins** — v0.23's run half,
   * [W93](../../doc/work-items/w93-what-a-gate-does-in-a-run.md). CODE with no document entry (a type's `fn`
   * is a function), so there is nothing in the registry DOCUMENT to hold them to: the runtime holds them to
   * `GateType` with `checkGateTypes` where it is built, and hands them to every driver it starts through
   * `runtime.registry.gateTypes`. Absent, the built-ins alone.
   */
  gateTypes?: GateTypes;
}

/** One pool instance, derived and checked — the default instance of a type (`key === type`) or a named one. Nothing is constructed. */
export interface ResolvedPool {
  key: string;
  /** The node type's name. */
  type: string;
  definition: NodeTypeDefinition;
  /** Absent exactly when the type names no worker — a built-in that only transforms (ADR 0075). */
  worker?: WorkerEntry;
  /** The instance config the derivation was given. */
  config: unknown;
  /** What the derivation returned, held to `PoolSpec`'s shape and the worker's `configSchema`. */
  spec: PoolSpec;
  /** A named instance's OWN pool options, COPIED, a key present with `undefined` dropped (it overrides nothing) — v0.37, ADR 0099; absent where it declares none, and on every default instance. */
  pool?: NodeTypeDeclaration['pool'];
}

/** One resource group, resolved: its factory and its checked config. `create` has NOT been called. */
export interface ResolvedGroup {
  key: string;
  type: string;
  groupType: GroupType;
  config: unknown;
}

/**
 * **A registry document resolved against its code — what `createRuntime` builds FROM, and what the
 * driver's registry is DERIVED from.** Every map is keyed by the name a flow or the document uses;
 * `pools` holds the default instance of every type under the type's name, plus the named ones.
 */
export interface ResolvedRegistry {
  workers: ReadonlyMap<string, WorkerEntry>;
  groups: ReadonlyMap<string, ResolvedGroup>;
  nodeTypes: ReadonlyMap<string, NodeTypeDefinition>;
  pools: ReadonlyMap<string, ResolvedPool>;
  predicates: ReadonlySet<string>;
  languages: ReadonlyMap<string, LanguageAdapter>;
}

export interface TaskNode {
  id: string;
  kind: 'task';
  /**
   * **The node TYPE this task runs as — REQUIRED since v0.19** (W65,
   * [ADR 0054](../../doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md)).
   * The name of a registry node type (`FD-V32`), whose DEFAULT pool instance is keyed by the type's
   * name; its worker receives the envelope `{ settings, input }` (`FD-C5`) — every task node does,
   * because there is no bare road left. *(`workerType`, v0.17's other way of naming a pool, is
   * retired: an undeclared key, `FD-V17`.)*
   */
  type: string;
  /**
   * **A NAMED instance of this node's type to run on** — v0.19, optional. A key in the registry's
   * `pools` whose `type` is this node's (`FD-V38`); absent, the type's default instance. The
   * type's own name is accepted as the default instance stated explicitly.
   */
  pool?: string;
  /**
   * **Per-node settings** — a plain JSON object the type's worker `settingsSchema` accepts, with
   * the type's `settings` defaults merged UNDER it first (`FD-V33`, v0.19); `{}` when absent and
   * the type declares none. Reaches the worker as `settings` in the envelope, the merged object,
   * as its own copy per dispatch (`JP-R11`'s invariant, one field over).
   */
  settings?: Readonly<Record<string, unknown>>;
  /**
   * **What this node may DO to its input before its worker sees it** — v0.18,
   * [ADR 0051](../../doc/decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md),
   * [P17](../../doc/plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md)
   * decisions 1, 3, 4 and 7. `{ lang, expr }`, both strings: `lang` names an entry in
   * `Registry.languages` (`FD-V35`), `expr` is text that language's `compile` accepts (`FD-V36`).
   * **Typed nodes only** (`FD-V37`): the transform is evaluated in the TYPE's worker wrapper,
   * never in the driver, so a node with no type has nowhere to evaluate it. Reaches the wrapper
   * as the envelope's third key, present only when declared (`FD-C6`); the expression sees the
   * value this node receives as `$` and the node's effective settings as `$settings`.
   */
  transform?: Transform;
  edges: Edge[];
  /**
   * `true` means the flow handles this node's failure; the default means a human
   * does (ADR 0004 rule 7). It is passed through to the scheduler task, and it is
   * the only way a node can *settle* `failed` rather than `user_action`.
   */
  optional?: boolean;
  /**
   * **What this node says about its own task's retries** — passed through to the
   * scheduler task exactly as `optional` is (ADR 0004 rule 7's precedent). Absent, the
   * driver's `defaultRetryPolicy` applies if one was given; declared, **the node wins,
   * whole** — never field by field. `FD-V30` refuses any shape but `RetryPolicy`'s.
   */
  retryPolicy?: RetryPolicy;
  /**
   * **The resource groups this node's task must acquire**, in addition to its pool's
   * (the scheduler unions the two — measured at W58). Every id must be one the
   * registry's `groups` declares (`FD-V31`), because the scheduler **silently ignores**
   * an unknown group id: the task runs and settles `done` with no `resource.blocked`
   * and no throw (P16 fact 2), so instantiation is the only place a typo is caught —
   * ADR 0002 rule 3's shape, and `FD-V32`'s for a node type (`FD-V5`'s for a worker type until v0.19).
   */
  workerGroups?: string[];
  /**
   * **What this node receives** — `FD-C1`, `FD-V26`-`FD-V28`. Optional: a task
   * without one receives the ordinary edge's value (section 3), which is what
   * every task received before [ADR 0040](../../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md).
   */
  needs?: Needs;
}

export interface FanoutNode {
  id: string;
  kind: 'fanout';
  /** Branch entry ids, in declaration order. The index here is the `branchPath` segment. */
  branches: string[];
}

/**
 * **A region whose arity is not in the document** — `spec/flow-definition.md`
 * section 2, added at v0.8 by
 * [ADR 0036](../../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md),
 * answering [Q12](../../doc/questions/q12.md): **fan-out is two features over one
 * region.**
 *
 * A `fanout` declares N branches known at authoring time. A `map` declares **one**
 * branch and a run opens N instances of it. That is the whole difference, and it is
 * why this is a second kind rather than a widened `fanout`: `FD-V9`'s arity floor is
 * a statement about the document and a map's arity is not in the document, and
 * `FD-V19`'s *"two distinct branch entries"* has no instance where there is one.
 */
export interface MapNode {
  id: string;
  kind: 'map';
  /**
   * A **key** on the value this node receives, matching `FD-V16`'s charset
   * (`FD-V25`). A declared reference and never a callback — ADR 0002 rule 1, which
   * is why *"how many items"* cannot be a function. **What it is a key ON is
   * [Q11](../../doc/questions/q11.md) and belongs to W34**; this type is stated
   * against whatever that resolves to.
   */
  over: string;
  /** **One** branch entry id, whose kind is a `task` (`FD-V25`). Not a list. */
  branch: string;
  /**
   * **What this node receives, and therefore what `over` is a key on** —
   * `FD-C1`. A `map` carries it for the same reason a `task` does, and it is what
   * makes *fan out over what a region produced* expressible: `needs: {"scores":
   * ["score"]}` with `over: "scores"` maps over an array the previous node never
   * produced ([Q165](../../doc/questions/q165.md)).
   */
  needs?: Needs;
}

export interface JoinNode {
  id: string;
  kind: 'join';
  /**
   * The `fanout` **or `map`** this join closes. The pairing is declared once, here
   * (spec section 4). Widened at v0.8 — `FD-V6`.
   */
  of: string;
  /** Exactly one edge, carrying neither `when` nor `on` (FD-V7). */
  edges: Edge[];
}

export interface EndNode {
  id: string;
  kind: 'end';
  /** Author-defined and never interpreted by the driver (Q25). */
  outcome: string;
}

/**
 * **A GATE: a decision WITH MEMORY** — `spec/flow-definition.md` section 2 (v0.23),
 * [P24](../../doc/plans/p24-what-a-node-may-remember-across-a-runs-branches.md) decisions 1-4,
 * [ADR 0066](../../doc/decisions/0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md).
 *
 * It routes the branch that reaches it and computes NOTHING: what leaves it on the chosen route is
 * exactly what reached it. It is dispatched to no scheduler, so it has no task id and produces no
 * output (`FD-V27` refuses a reference to one). Like a `task` it names a registered TYPE and carries
 * `settings`; unlike a `task` its type is a GATE type (`FD-V39`), code rather than a document entry,
 * and its edges name ROUTES rather than terminal states or predicates (`FD-V41`).
 *
 * **Valid since v0.23 and RUN since
 * [W93](../../doc/work-items/w93-what-a-gate-does-in-a-run.md)** — the driver evaluates it synchronously
 * where a branch enters it, records a `gated` fold input, and takes the one edge wired for the route its
 * type returned (`spec/flow-definition.md` section 2, `RN-R26`). *(Until W93 `new Driver` refused a flow
 * holding one, by name, at construction — v0.8's `map` split, taken as W33 took its region-in-a-map
 * refusal.)*
 */
export interface GateNode {
  id: string;
  kind: 'gate';
  /** A registered GATE type's name — a built-in (`distinct`, `if`, `switch`) or `Registry.gateTypes`' (`FD-V39`). */
  type: string;
  /**
   * **What the gate's type is configured with** — a plain object its type's `settingsSchema` accepts
   * (`FD-V40`), `{}` when absent. **`key` is the one setting the LIBRARY reads**: where present it is a
   * KEY PATH (`keyPathProblem`) over the value the gate receives, resolved by the driver and handed to
   * the type's `fn` as `ctx.key`.
   */
  settings?: Readonly<Record<string, unknown>>;
  /** Each carries `to` and, optionally, `route` — and nothing else (`FD-V41`). */
  edges: Edge[];
}

/**
 * **What a gate type's `fn` is handed** — once per branch that reaches the gate, synchronously (the
 * driver has no `async`, P24 decision 5). W92 fixed its shape and W93's driver calls it, handing COPIES of
 * the value and the settings — a predicate is handed a copy too — so a type writing into either moves
 * nothing the run holds. *(An ENTRY gate is also evaluated once at `start()` against a throwaway empty
 * memory, for `FD-R4` alone — so a type must be the pure function of its context Q9 asks every decision
 * to be.)*
 */
export interface GateContext {
  /** `settings.key` resolved over `input` by `readKeyPath` — `undefined` where the gate declares no `key` or a segment is missing. */
  readonly key: unknown;
  /** The value that reached the gate — what leaves it, unchanged, on the route `fn` returns. */
  readonly input: unknown;
  /** The gate node's settings, `{}` when it declares none. */
  readonly settings: Readonly<Record<string, unknown>>;
  /**
   * **The gate's memory: ONE per gate per RUN, the driver's, and never written down** (P24 decisions 6
   * and stop-and-ask (a)). A type reads and writes it; it is a pure function of the order branches
   * reached the gate, which is why a resume REBUILDS it by replay (W93, `RN-R26`): a resumed driver starts
   * it EMPTY and re-evaluates every gate on the stored settlements.
   */
  readonly memory: Map<string, unknown>;
}

/**
 * **A gate TYPE — the ONE public interface every gate type is written against, `distinct` included**
 * (P24 decision 2, ADR 0066). Code, not a document entry: `fn` is a function, which a JSON registry
 * cannot carry (ADR 0002 rule 1), so a consumer's types are registered in `Registry.gateTypes` the way
 * a language adapter's `compile` is supplied in code.
 *
 * **Its routes are declared STATICALLY or DERIVED from the gate's own settings — exactly one of the two**
 * ([ADR 0092](../../doc/decisions/0092-a-gate-types-routes-are-declared-statically-or-derived-from-its-node.md),
 * v0.30): a `StaticGateType` carries `routes`, `defaultRoute` and `keyResolvedRoutes?`, the same for every
 * gate naming it; a `DerivedGateType` carries `routesFor(settings)` IN PLACE of the three, so two gates of
 * one type may have two route sets. Every reader of a gate's routes reads the gate's RESOLVED set
 * (`routesOf`), never the type's members. A value carrying both, or neither, is refused (`FD-V39`,
 * `GateTypeRefused`).
 */
export type GateType = StaticGateType | DerivedGateType;

/** **A gate type whose routes are its NODE's** — `routesFor` in place of `routes`, `defaultRoute` and `keyResolvedRoutes` (ADR 0092). */
export interface DerivedGateType {
  /**
   * **The routes of ONE gate, from that gate's settings** — `{ routes, defaultRoute, keyResolvedRoutes? }`,
   * held to the clauses a static type's three members are. Called once per gate at instantiation, after
   * `FD-V40` passed, with a COPY of the settings (`{}` when the gate declares none); every reader — `FD-V41`'s
   * count, the default edge, `FD-R5`, the wiring check's guarantee — reads what it returned. **A pure function
   * of the settings**, as `fn` is of its context (Q9): the validator and each driver ask it separately, and a
   * resume asks it again. A throw or a malformed set is refused at the GATE, `FD-V39`.
   */
  routesFor(settings: Readonly<Record<string, unknown>>): Pick<StaticGateType, 'routes' | 'defaultRoute' | 'keyResolvedRoutes'>;
  readonly routes?: never;
  readonly defaultRoute?: never;
  readonly keyResolvedRoutes?: never;
  /** What a gate's `settings` must satisfy, in the built-in subset (ADR 0053). Absent means UNCHECKED (P18 decision 3). */
  readonly settingsSchema?: JsonSchema;
  /**
   * **What the settings must satisfy beyond the schema** — a message naming what is wrong, or `null`. Run by
   * `FD-V40` once the settings are a plain object the `settingsSchema` accepts, with a COPY of them; a message
   * is reported under `FD-V40`, and a throw or a return that is neither a string nor `null` under `FD-V39`
   * (ADR 0092). The subset cannot state a grammar (ADR 0053), so a type that needs one states it here.
   */
  settingsProblem?(settings: Readonly<Record<string, unknown>>): string | null;
  /** The decision: one of THIS GATE's routes, synchronously — a route outside the set `routesFor` returned for the gate STOPS the run (`FD-R5`). */
  fn(ctx: GateContext): string;
}

/** **A gate type whose routes are the same for every gate naming it** — the interface as ADR 0066 wrote it; `distinct` is one. */
export interface StaticGateType {
  /** Every route `fn` may return, each in `FD-V16`'s charset, distinct, at least one. Every one must be wired by exactly one edge (`FD-V41`). */
  readonly routes: readonly string[];
  /** What an edge with no `route` carries. One of `routes` — and NOT necessarily the first. */
  readonly defaultRoute: string;
  /** Absent on a static type: its routes are declared, not derived (ADR 0092). */
  readonly routesFor?: never;
  /** What a gate's `settings` must satisfy, in the built-in subset (ADR 0053). Absent means UNCHECKED (P18 decision 3). */
  readonly settingsSchema?: JsonSchema;
  /** As `DerivedGateType.settingsProblem`: run by `FD-V40` after the schema, its message reported under it. */
  settingsProblem?(settings: Readonly<Record<string, unknown>>): string | null;
  /**
   * **The routes on which the gate's KEY PATH resolved** — a subset of `routes` (`FD-V39`'s second clause, as every
   * other malformed member of this interface is), OPTIONAL, and
   * absent means this type makes no guarantee, which is what every type said before v0.25 and what
   * `checkWiring` assumed of all of them ([ADR 0068](../../doc/decisions/0068-a-route-guarantees-what-its-type-declares-and-the-library-derives-it-from-the-key-path.md)).
   *
   * **It is the one guarantee the LIBRARY can act on**, because a key path is the one thing the driver
   * resolves on a gate's behalf — it reads `settings.key` over the value that arrived and hands the result
   * to `fn` as `ctx.key`. So a type naming a route here is saying *when I return this, that path was
   * there*, and `checkWiring` refines what leaves the gate on such a route with `required` along the
   * NODE's own key path, at every step.
   *
   * **PRESENCE only.** Whether a resolved key is a USABLE key is this type's judgement and differs
   * between types — `distinct` wants a string or a finite number — so nothing static derives that half,
   * and a type must not read this member as a promise about the leaf's TYPE.
   */
  readonly keyResolvedRoutes?: readonly string[];
  /** The decision: one of `routes`, synchronously. A route not declared STOPS the run by name (P24 decision 8 — `FD-R5`, `UndeclaredRoute`); a throw stops it with the thrown error, as a predicate's does. */
  fn(ctx: GateContext): string;
}

/** A consumer's gate types, keyed by the name a gate's `type` gives. A `Map` or a plain object, as `nodeTypes` is. */
export type GateTypes = ReadonlyMap<string, GateType> | Readonly<Record<string, GateType>>;

export type FlowNode = TaskNode | FanoutNode | MapNode | JoinNode | EndNode | GateNode;

export interface FlowDefinition {
  flowId: string;
  version: number;
  entry: string;
  nodes: FlowNode[];
}

/**
 * What a definition is validated *against*. ADR 0002 rule 3: an unknown predicate
 * or worker type fails here, at instantiation, rather than on the one workload
 * that takes that branch.
 */
export interface Registry {
  predicates: ReadonlySet<string> | readonly string[];
  /**
   * **The resource-group ids a task node may name in `workerGroups`** — the third set,
   * added at v0.16 ([W58](../../doc/work-items/w58-what-a-node-says-about-its-own-task.md)).
   * **Optional in SHAPE and strict in MEANING: absent means EMPTY**, so a definition
   * declaring any group against a registry that lists none is refused (`FD-V31`). The
   * alternative — absent means *unchecked* — would hand P16 fact 2's silence back to
   * exactly the consumer who forgot to pass the set. A consumer passes
   * `Object.keys(scheduler.groups)`, the scheduler's own map, rather than a second list.
   */
  groups?: ReadonlySet<string> | readonly string[];
  /**
   * **The workers a node type's `worker` may name** — v0.19 (W65, ADR 0054). **Absent means
   * EMPTY**: a type naming any worker is then `FD-V32`'s second clause. The validator reads one field
   * of an entry, `settingsSchema` (`FD-V33`); the runtime reads `url` and `configSchema`.
   */
  workers?: Workers;
  /**
   * **The node types a `task`'s `type` may name** — the fourth set, v0.17
   * ([W59](../../doc/work-items/w59-what-a-node-type-is.md), ADR 0049), REQUIRED on every task node
   * since v0.19. **Absent means EMPTY**, as `groups` is: a definition naming any type against a
   * registry that declares none is refused (`FD-V32`). The validator reads `worker` and `settings`
   * of an entry; the driver reads `retryPolicy`; the runtime reads the rest and runs the derivation.
   */
  nodeTypes?: NodeTypes;
  /**
   * **The named pool instances a `task`'s `pool` may name** — v0.19. **Absent means EMPTY**; the
   * default instance of every type is implicit. The validator reads one field, `type` (`FD-V38`).
   */
  pools?: Pools;
  /**
   * **The languages a `transform`'s `lang` may name** — the fifth set, v0.18
   * ([W61](../../doc/work-items/w61-what-a-transform-is.md), ADR 0051). **Absent means EMPTY**,
   * as `groups` and `nodeTypes` are: a definition declaring any transform against a registry
   * that declares no language is refused (`FD-V35`). The validator reads one field of each
   * entry, `compile`, at instantiation only; the bootstrap helper reads `worker`.
   */
  languages?: Languages;
  /**
   * **A consumer's GATE types, beside the built-ins** — the sixth set, v0.23 (W92, ADR 0066). **Absent
   * means the BUILT-INS ALONE** — `distinct` is always there, so this set only ever ADDS; a name that
   * is a built-in's is refused (`NameCollision` at construction, `FD-V39` reached here directly). The
   * validator reads each gate's route set (`routesOf` — the static members, or `routesFor` over the gate's
   * settings, v0.30), `settingsSchema` and `settingsProblem`; the driver reads `fn` too. **A driver
   * is handed the set as `DriverOptions.gateTypes`** since W93 — the runtime's road is
   * `runtime.registry.gateTypes`, from `RegistryCode.gateTypes`. *(Until W93 no driver carried it and
   * every gate flow was refused at construction.)*
   */
  gateTypes?: GateTypes;
}

/**
 * One violated rule. The validator reports **every** violation rather than the
 * first: `spec/flow-definition.md` section 5 requires an invalid definition to be
 * rejected *and* the named rule to appear among the findings, and several cases
 * legitimately violate more than one rule.
 */
export interface Finding {
  /** `FD-V1` … `FD-V46` from the validator; `runtime.check` adds `FD-R6` (ADR 0097). Never renumbered, so it is safe to assert on. */
  rule: string;
  /** Node id, edge index, or document-level `null`. */
  at: string | null;
  detail: string;
}
