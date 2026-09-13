/**
 * The flow definition, as data. `spec/flow-definition.md` sections 1-3.
 *
 * ADR 0002 rule 1: no functions anywhere in the structure. Everything here
 * survives `JSON.parse(JSON.stringify(x))`, which is what lets a definition be
 * validated, rendered and persisted by things that never ran it.
 */
// **The scheduler's pool-options TYPE, by the bare specifier ADR 0048 rule 4 allows** — W59. A
// node type's `pool` is exactly what the bootstrap helper hands `WorkerManager`, so it is typed
// as that rather than as a second copy of it. Type-only: erased in every build, so the pure
// entry still loads no scheduler value.
import type { WorkerManagerOptions } from 'fyflow-scheduler';

/** The terminal states an edge may opt into. `user_action` is refused: it suspends (FD-V18). */
export type RoutableState = 'done' | 'failed';

/** Every terminal state a scheduler task can reach. Five library states, three terminal. */
export type TerminalState = 'done' | 'failed' | 'user_action';

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

export interface Edge {
  /** Target node id. Required (FD-V23). */
  to: string;
  /**
   * Terminal states this edge is eligible for. Default `['done']` — an edge with
   * no `on` routes successes and nothing else (ADR 0004 rule 1).
   */
  on?: RoutableState[];
  /** Predicate name, resolved against the registry at instantiation (FD-V4). */
  when?: string;
  /**
   * **What this edge's PREDICATE sees, beyond its node's outcome** — `FD-C3`, and
   * [ADR 0041](../../doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md),
   * answering [Q8](../../doc/open-questions.md).
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
}

/**
 * **How a task node's attempts are retried by the SCHEDULER** — `spec/flow-definition.md`
 * section 2, v0.16 ([W58](../../doc/work-items/w58-what-a-node-says-about-its-own-task.md),
 * [Q16](../../doc/open-questions.md)'s task half). Exactly the scheduler's own shape at 0.5.2,
 * `{ maxRetries: number; backoffMs: number }`, with the ranges `FD-V30` refuses outside of: the
 * scheduler coerces (`maxRetries: "1"` retries, `1.5` retries, `{}` silently means *no
 * retries*), and a definition is data that arrives from anywhere, so the shape is pinned here.
 *
 * A retry happens INSIDE one task id and is reported on the outcome record's `attempts`
 * (`OR-R2`); the id's fourth segment is for a flow-level retry, which this library does not
 * mint ([Q111](../../doc/open-questions.md)).
 */
export interface RetryPolicy {
  /** How many times the scheduler re-dispatches a failed attempt. An integer >= 0. */
  maxRetries: number;
  /** Milliseconds between a failed attempt and its retry. A finite number >= 0. */
  backoffMs: number;
}

/**
 * **A node type's per-node settings VALIDATOR** — `spec/flow-definition.md` section 2 (v0.17),
 * [ADR 0049](../../doc/decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md)
 * rule 2. A function in the registry exactly as a predicate is (ADR 0002 rule 3): `null` ACCEPTS,
 * a string is WHY the settings are refused and becomes `FD-V33`'s detail. It receives the node's
 * EFFECTIVE settings — `{}` when the node declares none — so a type that requires a key refuses
 * an absent object by name. **The schema LANGUAGE is deliberately not here**: a declared, portable
 * schema is P18's subject, and a function is what keeps `FD-V33` decidable at instantiation
 * without inventing one ([W59](../../doc/work-items/w59-what-a-node-type-is.md)).
 */
export type SettingsValidator = (settings: Readonly<Record<string, unknown>>) => string | null;

/**
 * **What a node type IS: a REGISTRY entry** — ADR 0049 rule 1, P16 decision 4. The definition
 * names it by `type` and stays data; the worker, the pool, the groups and the config live here,
 * in the registry the consumer passes to the driver, exactly as predicates and worker types do.
 * **A type's pool is keyed by the type's NAME**, which is what `FD-V32` checks and what the
 * bootstrap helper (`fyflow-orchestration/scheduler`) builds.
 */
export interface NodeType {
  /**
   * Module URL of the worker class the type runs — what the bootstrap helper hands
   * `WorkerManager` as the INNER script; its default export is the class. Never a path in the
   * definition, which names the type and nothing else (P16 decision 4).
   */
  worker: string;
  /** Pool options the helper passes to `WorkerManager`, minus the two the type states separately below. */
  pool?: Readonly<Omit<WorkerManagerOptions, 'config' | 'groups'>>;
  /**
   * Resource-group ids the type's POOL declares: every task of the type acquires them, and the
   * scheduler unions them with a node's own `workerGroups` (W58's measurement). Each must be one
   * `Registry.groups` declares — held under `FD-V31` at construction, naming the type — because
   * a pool naming an unknown group is ignored in silence exactly as a task is (measured at W59,
   * both runtimes).
   */
  groups?: readonly string[];
  /** The pool's global config: the first constructor argument of every worker instance of the type. */
  config?: unknown;
  /** The per-node `settings` validator — see `SettingsValidator`. Absent, any plain object is accepted. */
  settings?: SettingsValidator;
  /**
   * The retry policy for every node of the type that declares none — held to `FD-V30` at
   * construction, naming the type. **A node's own wins, whole**, then this, then the driver's
   * `defaultRetryPolicy` (section 2's merge rule, one level longer).
   */
  retryPolicy?: RetryPolicy;
}

/** The registry's node types, keyed by the name a `task`'s `type` gives. A `Map` or a plain object, as the consumer prefers. */
export type NodeTypes = ReadonlyMap<string, NodeType> | Readonly<Record<string, NodeType>>;

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
 * or two versions on the two sides of a thread, are two ([Q264](../../doc/open-questions.md)).
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

export interface TaskNode {
  id: string;
  kind: 'task';
  /**
   * The scheduler pool this node's task runs in. **Exactly one of `workerType` and `type`**:
   * neither is `FD-V23`, both is `FD-V34`. Optional in SHAPE since v0.17 and required in MEANING,
   * exactly as it was — every corpus flow that declares it is unchanged.
   */
  workerType?: string;
  /**
   * **A registered node TYPE, named instead of a `workerType`** — v0.17, ADR 0049. Its pool is
   * keyed by the type's name (`FD-V32`), and its worker receives the envelope
   * `{ settings, input }` rather than the bare payload (`FD-C5`).
   */
  type?: string;
  /**
   * **Per-node settings for a typed node** — a plain JSON object the type's validator accepts
   * (`FD-V33`); `{}` when absent. Reaches the worker as `settings` in the envelope, as its own
   * copy per dispatch (`JP-R11`'s invariant, one field over). Meaningless on a node with no
   * `type`, and refused there (`FD-V34`).
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
   * ADR 0002 rule 3's shape, and `FD-V5`'s for a worker type.
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
 * answering [Q12](../../doc/open-questions.md): **fan-out is two features over one
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
   * [Q11](../../doc/open-questions.md) and belongs to W34**; this type is stated
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
   * produced ([Q165](../../doc/open-questions.md)).
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

export type FlowNode = TaskNode | FanoutNode | MapNode | JoinNode | EndNode;

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
  workerTypes: ReadonlySet<string> | readonly string[];
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
   * **The node types a `task`'s `type` may name** — the fourth set, v0.17
   * ([W59](../../doc/work-items/w59-what-a-node-type-is.md), ADR 0049). **Absent means EMPTY**,
   * as `groups` is: a definition naming any type against a registry that declares none is
   * refused (`FD-V32`). The validator reads one field of each entry, `settings`, and reads it at
   * instantiation only; the driver reads `retryPolicy`; the bootstrap helper reads the rest.
   */
  nodeTypes?: NodeTypes;
  /**
   * **The languages a `transform`'s `lang` may name** — the fifth set, v0.18
   * ([W61](../../doc/work-items/w61-what-a-transform-is.md), ADR 0051). **Absent means EMPTY**,
   * as `groups` and `nodeTypes` are: a definition declaring any transform against a registry
   * that declares no language is refused (`FD-V35`). The validator reads one field of each
   * entry, `compile`, at instantiation only; the bootstrap helper reads `worker`.
   */
  languages?: Languages;
}

/**
 * One violated rule. The validator reports **every** violation rather than the
 * first: `spec/flow-definition.md` section 5 requires an invalid definition to be
 * rejected *and* the named rule to appear among the findings, and several cases
 * legitimately violate more than one rule.
 */
export interface Finding {
  /** `FD-V1` … `FD-V37`. Never renumbered, so it is safe to assert on. */
  rule: string;
  /** Node id, edge index, or document-level `null`. */
  at: string | null;
  detail: string;
}
