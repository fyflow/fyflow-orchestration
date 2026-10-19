/**
 * The definition validator — `spec/flow-definition.md` section 5.
 *
 * Forty-five refusals — `FD-V14`, `FD-V15` and, since v0.19 (W65, ADR 0054), `FD-V5` and `FD-V34`
 * deliberately absent — the number `check-spec` prints as *C4 covered 45 definition refusals*, derived
 * from the ids in this file. *(44 until W191 added `FD-V49`, `"$item"` outside any map instance, v0.45 — 42 until W179 added `FD-V47` and `FD-V48`, the ASK's two, v0.42 — and this
 * sentence read **thirty-seven** from W92 until W179, stale by five through v0.27's `FD-V42`-`FD-V45` and
 * v0.28's `FD-V46`, the increment again applied to a number nothing was tracking. 34 until W92 added
 * `FD-V39`-`FD-V41`, the GATE's three, v0.23. This read
 * 23 before W45 and 24 after it: the increment was applied to a number nothing was tracking, and
 * it had been wrong by three for several plans. W45's conformity reader. **27 until W58 added
 * `FD-V30` and `FD-V31`, 29 until W59 added `FD-V32`-`FD-V34`, 32 until W61 added
 * `FD-V35`-`FD-V37`; 35 until W65 retired `FD-V5` and `FD-V34` with `workerType` and added `FD-V38`.**)* Reports EVERY violation
 * rather than the first, because section 5 requires an invalid definition to be
 * rejected *and* the named rule to appear among the findings, and several cases
 * legitimately violate more than one rule.
 *
 * ADR 0002 rule 3: this runs in full, at instantiation, before any task is queued.
 */
import type { DerivedGateType, Edge, Finding, FlowDefinition, FlowNode, GateContext, GateType, GateTypes, JsonSchema, StaticGateType, LanguageAdapter, Languages, NodeTypeEntry, NodeTypes, Pools, Registry, Transform, When, WorkerEntry, Workers } from './types.ts';
import { PREDICATE_OPS, PREDICATE_ROOTS } from './types.ts';
import { describeFindings, findings, schemaProblem } from './schema.ts';
import { allRegions, buildGraph, certainlySettled, innermostMapOf } from './regions.ts';
// **The built-in `if` gate answers by the evaluator a task edge's `when` uses** (P32 decision 4) — the pure
// declared-comparison evaluator, in `./condition.ts` since W154's exception (p), where `routing.ts`' `evaluateWhen` reaches
// it too. Nothing in `src/definition` imports `src/driver`.
import { evaluateDeclared } from './condition.ts';
export { readKeyPath } from './condition.ts';

const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
// `gate` since v0.23 (W92, ADR 0066) — and adding it HERE alone made this validator THROW: `NODE_KEYS[nd.kind]!`
// below found no row, a `TypeError` all five typecheck lanes pass, because the table is a `Record<string, …>`.
// Measured at W92's declaration step, which is why the two tables below and this list move together.
// `ask` since v0.42 (W179, ADR 0108) — and the three move together again, for the same measured reason.
const KINDS = ['task', 'fanout', 'map', 'join', 'end', 'gate', 'ask'] as const;
const ROUTABLE = ['done', 'failed'] as const;

const DOC_KEYS = ['flowId', 'version', 'entry', 'nodes'];
const NODE_KEYS: Record<string, { req: string[]; opt: string[] }> = {
  // `retryPolicy` and `workerGroups` since v0.16 (W58): what a node says about its OWN task,
  // as declared keys rather than an opaque bag — P16 decision 3, because `FD-V17`'s whole job
  // is refusing a key the kind does not declare, and a bag is where a typo lives until run time.
  // **`type` is REQUIRED since v0.19 (W65, ADR 0054) and `workerType` is retired**: every task
  // names a node type, and a `workerType` key is `FD-V17`'s undeclared key like any other. `pool`
  // names a named instance of the type (`FD-V38`); `settings` and `transform` are a `task`'s keys
  // and no other kind's, so a `transform` on a `map` node, a `join` or an edge is `FD-V17`'s
  // undeclared key, which is what P17 wants said once rather than as three more clauses.
  task: { req: ['id', 'kind', 'type', 'edges'], opt: ['pool', 'settings', 'transform', 'optional', 'needs', 'retryPolicy', 'workerGroups'] },
  fanout: { req: ['id', 'kind', 'branches'], opt: [] },
  // `spec/flow-definition.md` section 2, v0.8. `over` and `branch` are both
  // required: a map that does not say where its arity comes from is one that
  // silently means nothing, which is `FD-V23`'s own argument for `version`.
  map: { req: ['id', 'kind', 'over', 'branch'], opt: ['needs'] },
  join: { req: ['id', 'kind', 'of', 'edges'], opt: [] },
  end: { req: ['id', 'kind', 'outcome'], opt: [] },
  // v0.23 (W92, ADR 0066): a gate names a GATE type and carries settings, as a task names a node type — and
  // nothing else a task carries. `needs` is absent on purpose: a gate hands on what reached it, unchanged.
  gate: { req: ['id', 'kind', 'type', 'edges'], opt: ['settings'] },
  // v0.42 (W179, ADR 0108, P35 stop-and-ask (a)): an ASK waits for a person. It routes like a task (`edges`,
  // `FD-V7`), receives what its `needs` composes, carries opaque `settings` a UI reads and an `answerSchema` a
  // `done` answer is held to — and NONE of the keys a task's worker reads: those six are `FD-V47`'s
  // (`ASK_REFUSED_KEYS`), refused there by name, so `FD-V17` does not report them a second time.
  ask: { req: ['id', 'kind', 'edges'], opt: ['settings', 'answerSchema', 'needs'] },
};
/**
 * **The six keys a `task` declares that an `ask` REFUSES, each by `FD-V47` and by nothing else** — v0.42, W179,
 * P35 stop-and-ask (a) and decision 6. Every one is read by a task's WORKER or its scheduler task — a type and its
 * pool, `optional`, `retryPolicy` and `workerGroups` are handed to the scheduler, and a `transform` is evaluated in
 * the type's worker wrapper (`FD-C6`) — and an ask has neither: it is never dispatched. **One rule owns them on an
 * ask**, `FD-V41`'s precedent for `route` on every edge, so `FD-V17`'s message (*undeclared*) does not say the wrong
 * thing beside the right one. Exported so `test/definition/ask.test.ts` compares it to the spec's row both ways.
 */
export const ASK_REFUSED_KEYS: readonly string[] = ['type', 'pool', 'optional', 'retryPolicy', 'workerGroups', 'transform'];
// `route` since v0.23 (W92): a DECLARED edge key, so `FD-V17` does not move — and one rule, `FD-V41`, owns it on
// every edge (refused off a gate; on a gate, the only key beside `to`), on `FD-V26`'s precedent for `needs`.
const EDGE_KEYS = { req: ['to'], opt: ['on', 'when', 'needs', 'route'] };
/**
 * **The keys `FD-V17` refuses against, exported so a test can compare them to
 * `spec/flow-definition.md` section 3s own Edge key table** — W42s conformity reader.
 * That table is the documents ONLY statement of what an edge declares, and for one
 * item the code accepted `needs` while the table did not list it.
 */
export const EDGE_KEYS_DECLARED: readonly string[] = [...EDGE_KEYS.req, ...EDGE_KEYS.opt];
/**
 * **The keys `FD-V17` accepts on a `task` node, exported for the same reason** — W58, and it is
 * obligation (e)'s third shape (*a list is a claim about another list*) on the row this item
 * edits: `spec/flow-definition.md` section 2's kind table is the document's only statement of
 * what a task declares, and `test/definition/task-config.test.ts` compares the two both ways.
 */
export const TASK_KEYS_DECLARED: readonly string[] = [...NODE_KEYS.task!.req, ...NODE_KEYS.task!.opt];
/**
 * **Every kind's declared keys, for the same comparison over EVERY row of section 2's table** —
 * W58's adequacy reader (`adj03`): with only the `task` row bound, `retryPolicy` added to the
 * `map` kind's optional keys cost 0, and a key accepted on a kind that dispatches nothing is
 * P16 decision 3's silent-key hole one row over.
 */
export const NODE_KEYS_DECLARED: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  Object.entries(NODE_KEYS).map(([kind, k]) => [kind, [...k.req, ...k.opt]]),
);
/**
 * **The two keys a `retryPolicy` carries, and no others** — `FD-V30`. The scheduler's own
 * constructor at 0.5.2 destructures exactly these; a key beside them is a typo the scheduler
 * would drop in silence, which is W57's adequacy-reader lesson (*a check that reads a field is
 * blind to the field beside it*) applied to the field this item adds.
 */
export const RETRY_POLICY_KEYS: readonly string[] = ['maxRetries', 'backoffMs'];

/**
 * **Why a `retryPolicy` is malformed, or `null` when it is exactly the scheduler's shape** —
 * `FD-V30`'s whole predicate, in one place so the L1 suite and the driver's option read one
 * definition of *well formed*.
 *
 * **Every clause was chosen from a measurement of what the scheduler DOES with the shape,
 * not from taste** (W58's declaration step, on a real inline scheduler at 0.5.2): `{}` and
 * `{ backoffMs: 5 }` silently mean *no retries*; `{ maxRetries: "1" }` retries by coercion;
 * `1.5` retries; `-1` never does; a negative `backoffMs` makes Node warn and then retry at
 * once. A definition is data that arrives from anywhere, so none of those may mean something
 * quietly.
 */
export function retryPolicyProblem(v: unknown): string | null {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) {
    return `retryPolicy must be an object { maxRetries, backoffMs }, got ${JSON.stringify(v)}`;
  }
  const o = v as Record<string, unknown>;
  for (const k of RETRY_POLICY_KEYS) {
    if (o[k] === undefined) return `retryPolicy is missing required key "${k}"`;
  }
  for (const k of Object.keys(o)) {
    if (!RETRY_POLICY_KEYS.includes(k)) {
      return `retryPolicy carries undeclared key "${k}"; the scheduler would drop it in silence`;
    }
  }
  if (typeof o.maxRetries !== 'number' || !Number.isInteger(o.maxRetries) || o.maxRetries < 0) {
    return `retryPolicy.maxRetries must be an integer >= 0, got ${JSON.stringify(o.maxRetries)}`;
  }
  if (typeof o.backoffMs !== 'number' || !Number.isFinite(o.backoffMs) || o.backoffMs < 0) {
    return `retryPolicy.backoffMs must be a finite number >= 0, got ${JSON.stringify(o.backoffMs)}`;
  }
  return null;
}

const asSet = (x: ReadonlySet<string> | readonly string[]): ReadonlySet<string> =>
  x instanceof Set ? x : new Set(x as readonly string[]);

/**
 * **The one node type the library ships: a node that ONLY transforms** —
 * [ADR 0075](../../doc/decisions/0075-a-node-that-only-transforms-is-a-built-in-type-with-no-inner-worker.md),
 * [W109](../../doc/work-items/w109-a-node-that-only-transforms.md), and the third built-in SET here
 * after `BUILT_IN_GROUP_TYPES` (`registry.ts`) and `BUILT_IN_GATE_TYPES` (below).
 *
 * **It names NO worker, and that is the whole of its definition.** A typed pool's script is the
 * package's own envelope worker whatever the type (`ENVELOPE_WORKER_URL`), and that worker loads an
 * inner class from `EnvelopePoolConfig.worker`; with no worker named there is no inner class, so
 * `run()` returns the node's own `transform` evaluated over the value it received. Everything else a
 * node type may say is absent on purpose: no `inline` (the scheduler's default, as `NodeTypeDeclaration`
 * says of an absent one), no `config` (there is no constructor to hand one to), no `groups` and no
 * `retryPolicy` (a consumer who wants either declares a named pool INSTANCE of this type, or a node's
 * own `retryPolicy`).
 *
 * **It names a LANGUAGE nowhere, which is why it costs no dependency** — `lang` is the node's, exactly
 * as `transform` has been since ADR 0051, so the adapter stays the consumer's and `S14`/ADR 0052 rule 4
 * are untouched. A built-in JSONata type would ship a 242 KB engine to every consumer and turn `S14`
 * red (P26 fact 5).
 *
 * **The name is capitalised because the corpus's type names are** — `Scored`, `Bounded`, `GpuModel` —
 * and because it must read apart from the node KEY beside it: `{ type: 'Transform', transform: { lang,
 * expr } }`. W109's stop-and-ask (b).
 */
export const BUILT_IN_NODE_TYPES: Readonly<Record<string, NodeTypeEntry>> = Object.freeze({
  Transform: Object.freeze({}) as NodeTypeEntry,
});

/**
 * **The registry's node types as ONE shape: the consumer's, then the BUILT-INS APPENDED** — a `Map` or
 * a plain object in, a `Map` out, and absent is the built-ins ALONE. *(This read *the BUILT-INS, then
 * the consumer's — `gateTypesOf`'s reading exactly*, which states the order backwards and claims a
 * parity the code comment below contradicts four lines on: the ORDER differs from `gateTypesOf` and
 * the difference is load-bearing. W109's conformity reader, 8.)* The five callers (the validator, the driver, the wiring check, `resolveRegistry` and `bootstrap`) all go
 * through here, so none of them can disagree about what `Transform` is.
 *
 * **A consumer entry named as a built-in is NOT merged** — the built-in stays, and the collision is
 * refused by `checkRegistry`, which is BOTH the road `resolveRegistry` takes and the road a hand-built
 * `Driver` takes. *(This said *or, reached here directly, by `FD-V32`'s own message on the node that
 * names it*, and `FD-V32` CANNOT fire — precisely because the built-in won the merge, so its worker
 * clause is skipped by `onlyTransforms`. Measured by both of W109's readers from opposite ends: a
 * consumer's worker-backed `Transform` validated with ZERO findings and constructed. `checkRegistry`
 * calls `nodeTypeCollisions` now, on `checkGateTypes`' precedent.)*
 *
 * *(Until v0.28 this returned the consumer's alone and `undefined` was EMPTY; the reading moved because
 * `Transform` has to be nameable by a flow whose registry declares no `nodeTypes` at all.)*
 */
export function nodeTypesOf(x: NodeTypes | undefined): ReadonlyMap<string, NodeTypeEntry> {
  // **The consumer's entries FIRST and the built-ins appended, which is where this differs from
  // `gateTypesOf`.** A node type's name is its DEFAULT pool instance's key (ADR 0054), so this order
  // is the order a consumer reads its own types in; `gateTypesOf` merges built-ins first because a
  // gate type builds nothing. `Map.set` on a key already present keeps its POSITION and replaces its
  // VALUE, so the built-in WINS a collision reached here directly — the order moves and the rule
  // does not. **Both halves are asserted in `test/definition/node-type.test.ts`'s W109 suite**, and
  // until they were, prepending here cost ZERO: `bootstrap` filters by name into three loops of its
  // own, so POOL-creation order is that function's and not this one's. *(An earlier version of this
  // comment claimed this map's order IS pool-creation order, which over-claims by one function.)*
  const own = x === undefined ? [] : x instanceof Map ? [...(x as ReadonlyMap<string, NodeTypeEntry>)] : Object.entries(x as Readonly<Record<string, NodeTypeEntry>>);
  const out = new Map<string, NodeTypeEntry>(own);
  for (const [name, t] of Object.entries(BUILT_IN_NODE_TYPES)) out.set(name, t);
  return out;
}

/** The consumer's node-type names that collide with a built-in — refused, never merged (`nodeTypesOf`). `gateTypeCollisions`' twin. */
export function nodeTypeCollisions(x: NodeTypes | undefined): string[] {
  if (x === undefined) return [];
  const names = x instanceof Map ? [...(x as ReadonlyMap<string, NodeTypeEntry>).keys()] : Object.keys(x);
  return names.filter((n) => Object.prototype.hasOwnProperty.call(BUILT_IN_NODE_TYPES, n)).sort();
}

/**
 * **A node type that only transforms is one that names no worker** — ADR 0075 rule 2. The property and
 * not the NAME, so every layer asks the same question of the entry it holds rather than comparing
 * against a list of built-in names. **Its two callers are `FD-V32`, which skips its worker clause for
 * such a type, and `FD-V46`, which requires a `transform` on every node of one** — and that is the
 * whole of them. *(The first draft of this comment enumerated `derivePool` and `bootstrap` as callers,
 * and ADR 0075 rule 2 said the question is asked *in one way in six places*; measured, this function
 * has exactly TWO call sites and the other layers each write `worker === undefined` INLINE — the same
 * question, not the same expression. W109's conformity reader (7) and its adequacy reader (F5, K5).)*
 * **Only a built-in may be one**, which `checkNodeTypeShape` is what enforces — an omitted `worker` on
 * a consumer's type stays a refusal, and that clause is the only thing between the two readings.
 */
export function onlyTransforms(t: NodeTypeEntry | undefined): boolean {
  return t !== undefined && (t as { worker?: unknown }).worker === undefined;
}

/** **The registry's workers as ONE shape** — v0.19, `nodeTypesOf`'s reading: `undefined` is EMPTY. */
export function workersOf(x: Workers | undefined): ReadonlyMap<string, WorkerEntry> {
  if (x === undefined) return new Map();
  if (x instanceof Map) return x as ReadonlyMap<string, WorkerEntry>;
  return new Map(Object.entries(x as Readonly<Record<string, WorkerEntry>>));
}

/** **The registry's named pool instances as ONE shape** — v0.19: `undefined` is EMPTY, and a type's default instance is never here. */
export function poolsOf(x: Pools | undefined): ReadonlyMap<string, { readonly type: string; readonly config?: unknown }> {
  if (x === undefined) return new Map();
  if (x instanceof Map) return x as ReadonlyMap<string, { readonly type: string; readonly config?: unknown }>;
  return new Map(Object.entries(x as Readonly<Record<string, { readonly type: string; readonly config?: unknown }>>));
}

/**
 * **The registry's languages as ONE shape** — `Registry.languages`' own reading: a `Map` or a plain
 * object in, a `Map` out, and `undefined` is EMPTY (v0.18, W61 — `nodeTypesOf` one set over).
 * Shared by the validator, the driver and the bootstrap helper so the three cannot read the
 * option differently.
 */
export function languagesOf(x: Languages | undefined): ReadonlyMap<string, LanguageAdapter> {
  if (x === undefined) return new Map();
  if (x instanceof Map) return x as ReadonlyMap<string, LanguageAdapter>;
  return new Map(Object.entries(x as Readonly<Record<string, LanguageAdapter>>));
}

// ---- the GATE: its key path, its interface, and the one built-in type — v0.23 (W92, ADR 0066) ----

/**
 * **A KEY PATH — P24 stop-and-ask (d), answered**: dot-separated OBJECT keys, each segment in `FD-V16`'s
 * charset, over the value a gate receives. **No array index, no wildcard, no expression** — a key a flow
 * needs COMPUTED is computed in the task before the gate (P24 decision 5), because the driver has no
 * `async` and `evaluate()` in every expression language here returns a Promise (ADR 0051).
 */
export const KEY_PATH_RE = /^[A-Za-z0-9_-]{1,64}(?:\.[A-Za-z0-9_-]{1,64})*$/;

/**
 * **Why a gate's `settings.key` is not a key path, or `null`** — `FD-V40`'s grammar clause. `key` is the
 * ONE setting the library itself reads on a gate (the driver resolves it and hands the type's `fn` the
 * result), so its grammar is the library's and not a type's — which is also why it is checked here rather
 * than by a `settingsSchema`: the subset has no `pattern` (ADR 0053), so no schema could say it.
 */
export function keyPathProblem(v: unknown): string | null {
  if (typeof v !== 'string') return `settings.key must be a key path string, got ${JSON.stringify(v)}`;
  if (KEY_PATH_RE.test(v)) return null;
  return `settings.key ${JSON.stringify(v)} is not a key path — dot-separated object keys, each [A-Za-z0-9_-]{1,64}; ` +
    'no array index, no wildcard, no expression (a key that must be computed is computed in the task before the gate)';
}

// `readKeyPath` — what a key path NAMES on a value — lives in `./condition.ts` since W154 (exception (p)), beside the
// declared-comparison evaluator that reads by it; re-exported above, so the public name does not move.

/**
 * A gate type's own members — the interface's seven, and no other own key (a typo is the silent kind).
 * `routesFor` and `settingsProblem` since v0.30 (ADR 0092): a type carries `routes` and `defaultRoute`
 * (`keyResolvedRoutes?` beside them) OR `routesFor`, exactly one of the two.
 */
export const GATE_TYPE_KEYS: readonly string[] = ['routes', 'defaultRoute', 'settingsSchema', 'keyResolvedRoutes', 'routesFor', 'settingsProblem', 'fn'];

/** The members a STATIC type declares its routes by — a type carrying any of them beside `routesFor` carries both (ADR 0092). */
const STATIC_ROUTE_KEYS: readonly string[] = ['routes', 'defaultRoute', 'keyResolvedRoutes'];

/** The members of a resolved ROUTE SET — what `routesFor` returns, and no other own key. */
const ROUTE_SET_KEYS: readonly string[] = STATIC_ROUTE_KEYS;

/**
 * Which of `GATE_TYPE_KEYS` may be absent ALWAYS — the `?` the message below prints. `routes`,
 * `defaultRoute` and `routesFor` are printed bare and the message says which two forms they make.
 */
const GATE_TYPE_OPTIONAL: ReadonlySet<string> = new Set(['settingsSchema', 'keyResolvedRoutes', 'settingsProblem']);

/**
 * **The interface's shape, as a sentence, DERIVED from `GATE_TYPE_KEYS`** rather than restated beside it.
 * Both of `gateTypeProblem`'s shape messages said `{ routes, defaultRoute, settingsSchema?, fn }` as a
 * literal, so `keyResolvedRoutes` would have left two live error messages describing an interface that no
 * longer exists — `doc/workflow.md` obligation (e)'s third shape, *a list is a claim about another list*,
 * found at [W99](../../doc/work-items/w99-what-a-route-guarantees.md)'s declaration step before the member
 * was added. Adding a key to the list now moves the message with it.
 */
const GATE_TYPE_SHAPE = `{ ${GATE_TYPE_KEYS.map((k) => (GATE_TYPE_OPTIONAL.has(k) ? `${k}?` : k)).join(', ')} }` +
  ' with its routes declared STATICALLY by routes and defaultRoute (keyResolvedRoutes beside them) or DERIVED by routesFor, exactly one of the two';

/**
 * **A value a gate type handed back, as text — and it CANNOT THROW** (W153, conformity reader C1). Every message
 * about a gate type describes values the TYPE produced — what `routesFor` or `settingsProblem` returned, what it
 * threw — and `JSON.stringify` throws on a BigInt and on a cycle, which turned a malformed type into a raw
 * `TypeError` out of `validateDefinition`, `new Driver` and `checkWiring`. JSON where JSON works, so every message
 * that described a JSON value reads as it did; otherwise `String`, and failing that the value's `typeof`.
 */
function describeValue(v: unknown): string {
  try {
    const j = JSON.stringify(v);
    if (j !== undefined) return j;
  } catch { /* a BigInt, a cycle, a throwing toJSON — described below */ }
  try {
    return typeof v === 'bigint' ? `${v}n` : String(v);
  } catch {
    return `an unprintable ${typeof v}`;
  }
}

/** What a gate type THREW, as text — an `Error`'s message, or the thrown value described; never a throw itself. */
function describeThrown(e: unknown): string {
  try {
    if (e instanceof Error) return String(e.message);
  } catch { /* a throwing message getter — described below */ }
  return describeValue(e);
}

/**
 * **Why a ROUTE SET is malformed, or `null`** — `FD-V39`'s route clauses, one function for a static type's
 * three members and for what a derived type's `routesFor` returned (ADR 0092), so the two cannot be held to
 * different rules. The messages are the ones v0.23 and v0.25 wrote.
 */
function routeSetProblem(routes: unknown, defaultRoute: unknown, keyResolvedRoutes: unknown): string | null {
  if (!Array.isArray(routes) || routes.length === 0) return `routes must be a non-empty array of route names, got ${describeValue(routes)}`;
  for (const r of routes) {
    if (typeof r !== 'string' || !ID_RE.test(r)) return `route ${describeValue(r)} is not [A-Za-z0-9_-]{1,64}`;
  }
  if (new Set(routes).size !== routes.length) return 'routes repeats a route';
  if (typeof defaultRoute !== 'string' || !(routes as string[]).includes(defaultRoute)) {
    return `defaultRoute ${describeValue(defaultRoute)} is not one of its routes (${(routes as string[]).join(', ')}) — an edge with no route would carry a route the type never returns`;
  }
  // **`FD-V39`'s second clause** — the routes on which the key path resolved are a SUBSET of `routes`,
  // without repeats. No id of its own: this predicate IS that clause, and `C4` refused a separate one by
  // asking for a case in `spec/examples/invalid/` that cannot exist, a gate type being CODE (W99).
  // A name that is not a route is the silent kind twice over: the check would never match it, so the
  // guarantee would simply never apply and the type would read as making one (W99, ADR 0068 rule 4).
  if (keyResolvedRoutes !== undefined) {
    const kr = keyResolvedRoutes;
    if (!Array.isArray(kr)) return `keyResolvedRoutes must be an array of route names, got ${describeValue(kr)}`;
    for (const r of kr) {
      if (typeof r !== 'string' || !(routes as string[]).includes(r)) {
        return `keyResolvedRoutes names ${describeValue(r)}, which is not one of its routes (${(routes as string[]).join(', ')}) — a guarantee on a route the type never returns applies to nothing`;
      }
    }
    if (new Set(kr as string[]).size !== kr.length) return 'keyResolvedRoutes repeats a route';
  }
  return null;
}

/**
 * **Why a value is not a `GateType`, or `null`** — one predicate for the validator (`FD-V39`'s second
 * clause, a malformed type reached through a flow) and the registry (`GateTypeRefused`, at construction),
 * so the two cannot disagree about what a gate type IS. `distinct` is held to it like any other.
 */
export function gateTypeProblem(t: unknown): string | null {
  if (typeof t !== 'object' || t === null || Array.isArray(t)) return `a gate type is an object ${GATE_TYPE_SHAPE}, got ${describeValue(t)}`;
  const o = t as Record<string, unknown>;
  const extra = Object.keys(o).filter((k) => !GATE_TYPE_KEYS.includes(k));
  if (extra.length) return `it carries ${extra.map((k) => describeValue(k)).join(', ')}, which a gate type does not declare; it is ${GATE_TYPE_SHAPE}`;
  // **Exactly one of the two route forms** — ADR 0092 rule 2. Checked BEFORE either form's own clauses, so a
  // type carrying both is told so rather than that one half is malformed.
  const staticKeys = STATIC_ROUTE_KEYS.filter((k) => o[k] !== undefined);
  const derived = o.routesFor !== undefined;
  if (derived && staticKeys.length) {
    return `it carries routesFor AND ${staticKeys.join(', ')} — a gate type declares its routes statically or derives them from its gate's settings, exactly one of the two`;
  }
  if (!derived && staticKeys.length === 0) {
    return 'it declares its routes neither statically (routes, defaultRoute) nor by routesFor — a gate type declares exactly one of the two';
  }
  if (derived) {
    if (typeof o.routesFor !== 'function') return 'routesFor must be a function (settings) => { routes, defaultRoute, keyResolvedRoutes? }';
  } else {
    const p = routeSetProblem(o.routes, o.defaultRoute, o.keyResolvedRoutes);
    if (p !== null) return p;
  }
  if (o.settingsSchema !== undefined) {
    const p = schemaProblem(o.settingsSchema);
    if (p !== null) return `its settingsSchema is not in the built-in subset — ${p}`;
  }
  if (o.settingsProblem !== undefined && typeof o.settingsProblem !== 'function') return 'settingsProblem must be a function (settings) => string | null';
  if (typeof o.fn !== 'function') return 'fn must be a function (ctx) => route';
  return null;
}

/**
 * **A gate's RESOLVED route set, or why it has none** — ADR 0092 rule 3, the ONE function between a gate's
 * routes and every reader of them: `FD-V41`'s count, `FD-R5`'s undeclared-route stop, the edge an edge with no
 * `route` carries (`gateEdge`), and the wiring check's default and guarantee. A `StaticGateType` resolves to
 * its own three members; a `DerivedGateType` to what its `routesFor` returns for THIS gate's settings.
 *
 * **Pure and TOTAL**: it never throws. Settings that are not a plain object, a `routesFor` that throws, and a
 * set that fails `FD-V39`'s route clauses (`routeSetProblem`, the predicate a static type is held to) or
 * carries a key beside the three are each a `{ problem }`. `routesFor` is handed a COPY of the settings, so a
 * type writing into them moves nothing in the definition, and what it returned is copied and frozen, so a
 * type mutating its own result later moves nothing a reader cached. Call it with the type `gateTypeProblem`
 * accepted — the validator, the driver and the wiring check each do.
 */
export function routesOf(
  type: GateType,
  settings: unknown,
): Pick<StaticGateType, 'routes' | 'defaultRoute' | 'keyResolvedRoutes'> | { readonly problem: string } {
  let set: unknown;
  if (typeof type.routesFor === 'function') {
    if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) {
      return { problem: `routesFor is asked over settings that are a plain object, got ${describeValue(settings)}` };
    }
    // The COPY is taken BEFORE the call and outside its `try` (conformity reader C2): settings that cannot be
    // copied are the SETTINGS' defect, which the validator refuses as `FD-V40` before it ever asks `routesFor`,
    // and must not read here as the type having thrown.
    let copy: Readonly<Record<string, unknown>>;
    try {
      copy = structuredClone(settings) as Readonly<Record<string, unknown>>;
    } catch (e) {
      return { problem: `the gate's settings cannot be copied for routesFor — ${describeThrown(e)}` };
    }
    try {
      set = type.routesFor(copy);
    } catch (e) {
      return { problem: `routesFor threw: ${describeThrown(e)}` };
    }
    if (typeof set !== 'object' || set === null || Array.isArray(set)) {
      return { problem: `routesFor returned ${describeValue(set)}, which is not { routes, defaultRoute, keyResolvedRoutes? }` };
    }
    const extra = Object.keys(set).filter((k) => !ROUTE_SET_KEYS.includes(k));
    if (extra.length) return { problem: `routesFor returned ${extra.map((k) => describeValue(k)).join(', ')}, which a route set does not declare; it is { routes, defaultRoute, keyResolvedRoutes? }` };
  } else {
    set = type;
  }
  const s = set as Record<string, unknown>;
  const p = routeSetProblem(s.routes, s.defaultRoute, s.keyResolvedRoutes);
  if (p !== null) return { problem: typeof type.routesFor === 'function' ? `routesFor returned a malformed route set: ${p}` : p };
  const routes = Object.freeze([...(s.routes as string[])]);
  const defaultRoute = s.defaultRoute as string;
  return s.keyResolvedRoutes === undefined
    ? Object.freeze({ routes, defaultRoute })
    : Object.freeze({ routes, defaultRoute, keyResolvedRoutes: Object.freeze([...(s.keyResolvedRoutes as string[])]) });
}

/**
 * **`distinct` — the one BUILT-IN gate type, and it is written against the public interface and nothing
 * else** (P24 decision 2): nothing in the validator, the wiring check or the driver names it; they read
 * the gate's route set through `routesOf`, and `settingsSchema`, `settingsProblem` and `fn`, off whatever type
 * a gate names. A `StaticGateType` — its routes are the same for every gate (ADR 0092). It keeps the FIRST
 * branch to reach the gate per key and routes every later one with the same key to `duplicate`.
 *
 * - `first` (the DEFAULT) — the key has not been seen at this gate in this run;
 * - `duplicate` — it has;
 * - `nokey` — the key is missing, `null`, or not a string or a FINITE number (P24 stop-and-ask (c)):
 *   treating a missing key as a key would drop every unidentified file after the first as a duplicate of
 *   "undefined", and stopping the run would end a batch on one bad file.
 *
 * **Keys are compared as JSON values**, so `"1"` and `1` are two keys — JSON tells them apart, and a type
 * that merged them would be making a decision the document cannot see. The empty string is a string and a
 * key. Memory holds one entry per key seen; `fn` writes it and nothing else does. Its life is the RUN's —
 * one memory per gate, created empty with the driver and rebuilt by replay on resume (W93, `RN-R26`).
 */
export const distinct: StaticGateType = Object.freeze({
  routes: Object.freeze(['first', 'duplicate', 'nokey']),
  defaultRoute: 'first',
  settingsSchema: Object.freeze({
    type: 'object',
    required: ['key'],
    properties: { key: { type: 'string', minLength: 1 } },
    additionalProperties: false,
  }) as JsonSchema,
  // **`first` and `duplicate` are reached only where the key path RESOLVED** — read off `fn` below, whose
  // first statement sends every other case to `nokey`. So a branch leaving this gate on either of them
  // carries a value with the key path present, which is what `checkWiring` refines with (ADR 0068).
  // `nokey` is deliberately absent: it is the route for the value that has no key.
  keyResolvedRoutes: Object.freeze(['first', 'duplicate']),
  fn(ctx: GateContext): string {
    const key = ctx.key;
    if (!(typeof key === 'string' || (typeof key === 'number' && Number.isFinite(key)))) return 'nokey';
    const seen = JSON.stringify(key);
    if (ctx.memory.has(seen)) return 'duplicate';
    ctx.memory.set(seen, true);
    return 'first';
  },
});

/** The error the evaluator throws on an operator `FD-V44` should have refused — unreachable through an `if`, whose grammar refuses one at load. */
const UNKNOWN_OP = (message: string): Error => new Error(message);

/**
 * **`if` — a gate that routes the value reaching it by a DECLARED condition** (P32 decision 4,
 * [W154](../../doc/work-items/w154-the-built-in-if-and-switch.md)). Written against the public interface exactly
 * as `distinct` is, and nothing names it but `BUILT_IN_GATE_TYPES` (P32 decision 1). A `StaticGateType`: routes
 * **`then`** and **`else`**, the DEFAULT `else`, so an edge with no `route` is the fallback as a task's edge with
 * no `when` is (P32 stop-and-ask (b)).
 *
 * Its settings are `{ when }`: a COMPARISON or a FLAT GROUP — `FD-V42`-`FD-V45`'s grammar MINUS the NAME shape,
 * whose ONE root is **`input`**, the value that reached the gate as the driver's clone carries it (`settingsProblem`,
 * reported under `FD-V40`). `fn` asks the evaluator a task edge's `when` uses over `{ input }`, and reads
 * nothing else — no memory, no key, no clock (`FD-C8`). **No `keyResolvedRoutes`**: its path is inside `when`, not
 * `settings.key`, and the refinement that would need is priced in W154's declaration and not built.
 */
const ifGate: StaticGateType = Object.freeze({
  routes: Object.freeze(['then', 'else']),
  defaultRoute: 'else',
  // The KEYS only: the grammar is not the subset's to state (P32 fact 3), and `when`'s TYPE is left to
  // `settingsProblem` so a bare string gets the grammar's own message rather than the schema's.
  settingsSchema: Object.freeze({
    type: 'object',
    required: ['when'],
    properties: { when: {} },
    additionalProperties: false,
  }) as JsonSchema,
  settingsProblem(settings: Readonly<Record<string, unknown>>): string | null {
    const p = gateConditionProblem(settings.when);
    return p === null ? null : `${p.message} (${p.rule}'s grammar, which an if gate's condition is held to)`;
  },
  fn(ctx: GateContext): string {
    // `{ input }` is a PLAIN object, so `readKeyPath` over it at `input.a.b` is `readKeyPath(input, 'a.b')` — the
    // value as the driver's clone carries it, the reading a gate's key gets (ADR 0067).
    return evaluateDeclared(ctx.settings.when as When, { input: ctx.input }, UNKNOWN_OP) ? 'then' : 'else';
  },
});

/**
 * **`switch` — a gate that routes the value reaching it by a DECLARED table of values** (P32 decision 5, W154). A
 * `DerivedGateType` (ADR 0092): its routes are its GATE's — every case name, plus **`default`**, the DEFAULT — so
 * `FD-V41` refuses a case left unwired, naming it, which an edge chain of `{ op: "eq" }` cannot.
 *
 * Its settings are `{ key, cases }`: `key` is the library's KEY PATH (`FD-V40`), resolved by the driver over what
 * reached the gate and handed to `fn` as `ctx.key`; `cases` maps a ROUTE NAME (`FD-V16`'s charset, `default`
 * reserved) to a SCALAR or a non-empty array of scalars. **Matching is type-strict `===`** — `FD-C7`'s *no
 * coercion*, so `"1"` and `1` are two values — and a value named by two cases is refused at load. A key that does not
 * resolve, or matches no case, takes `default`. **`keyResolvedRoutes` is every case**: no case value is `undefined`,
 * so a case route is taken only where the key path resolved, and the wiring check refines along it (ADR 0068).
 */
const switchGate: DerivedGateType = Object.freeze({
  settingsSchema: Object.freeze({
    type: 'object',
    required: ['key', 'cases'],
    properties: { key: { type: 'string', minLength: 1 }, cases: { type: 'object' } },
    additionalProperties: false,
  }) as JsonSchema,
  settingsProblem(settings: Readonly<Record<string, unknown>>): string | null {
    const cases = settings.cases as Record<string, unknown>;   // a plain object: the schema ran first
    const seen: { value: unknown; name: string }[] = [];
    // **An EMPTY table is refused** — W154 stop-and-ask (l), the maintainer's answer: a switch with no case routes
    // every value to `default`, which is "always default" written as a question (`FD-V45`'s empty-group reading).
    if (Object.keys(cases).length === 0) return 'cases is empty — a switch with no case routes every value to default, which is "always default" written as a question';
    for (const name of Object.keys(cases)) {
      if (!ID_RE.test(name)) return `cases names the case ${JSON.stringify(name)}, which is not [A-Za-z0-9_-]{1,64} — a case name is a ROUTE name (FD-V16's charset)`;
      if (name === 'default') return 'cases names a case "default", which is the route a key matching no case takes — the name is reserved';
      const v = cases[name];
      if (Array.isArray(v) && v.length === 0) return `cases.${name} is an empty array; a case names a scalar or a non-empty array of scalars — a case no value can reach is a route no run can take`;
      for (const x of Array.isArray(v) ? v : [v]) {
        if (!isScalar(x)) {
          return `cases.${name} ${Array.isArray(v) ? 'holds' : 'is'} ${scalarName(x)}; a case names a SCALAR — null, a boolean, a finite number or a string — or a non-empty array of them`;
        }
        // **By `===`** — the relation `fn` matches by, so "1" and 1 are two values here as there. Across two cases a
        // value would take two routes; INSIDE one case it is a repeat, refused too — W154 stop-and-ask (l), the
        // maintainer's answer, on the precedent of `routes repeats a route` and `FD-V31`'s repeated group.
        const other = seen.find((s) => s.value === x);
        if (other !== undefined && other.name === name) {
          return `cases.${name} repeats the value ${caseValue(x)} — a case names each of its values once`;
        }
        if (other !== undefined) {
          // `0` and `-0` are ONE value by `===` and JSON prints both `0`, so the message names each as written (reader item R3).
          if (!Object.is(other.value, x)) {
            return `the values ${caseValue(other.value)} in case "${other.name}" and ${caseValue(x)} in case "${name}" are one value by === — a value takes one route`;
          }
          return `the value ${caseValue(x)} is named by two cases, "${other.name}" and "${name}" — a value takes one route (matching is ===, so "1" and 1 are two values)`;
        }
        seen.push({ value: x, name });
      }
    }
    return null;
  },
  routesFor(settings: Readonly<Record<string, unknown>>) {
    const cases = settings.cases;
    // Asked only once `settingsProblem` passed — by the validator and the driver; the wiring check asks over the
    // settings as given, and a throw there is a set that does not resolve (ADR 0092 rule 3).
    if (typeof cases !== 'object' || cases === null || Array.isArray(cases)) throw new Error(`cases is ${scalarName(cases)}, not an object of case names`);
    const names = Object.keys(cases);
    return { routes: [...names, 'default'], defaultRoute: 'default', keyResolvedRoutes: names };
  },
  fn(ctx: GateContext): string {
    const key = ctx.key;
    // A key that did not resolve, or is not a scalar, can equal no case: every case value is a scalar.
    if (key === undefined || (typeof key === 'object' && key !== null)) return 'default';
    const cases = ctx.settings.cases as Record<string, unknown>;
    for (const name of Object.keys(cases)) {
      const v = cases[name];
      if (Array.isArray(v) ? v.some((x) => x === key) : v === key) return name;
    }
    return 'default';
  },
});

/**
 * **The built-in gate types, by name** — `distinct` (P24), and since W154 `if` and `switch` (P32 decision 1), all
 * three written against the public interface a consumer's type is. A consumer type named as any of them is refused,
 * never merged (`NameCollision`, `FD-V39`).
 */
export const BUILT_IN_GATE_TYPES: Readonly<Record<string, GateType>> = Object.freeze({ distinct, if: ifGate, switch: switchGate });

/**
 * **Every gate type a flow may name: the built-ins, then the consumer's** — `Registry.gateTypes`' own
 * reading, a `Map` or a plain object in and a `Map` out, and absent is the built-ins ALONE. **A consumer
 * entry named as a built-in is NOT merged** — the built-in stays, and the collision is refused where the
 * registry is built (`NameCollision`) or, reached here directly, on the gate that names it (`FD-V39`).
 */
export function gateTypesOf(x: GateTypes | undefined): ReadonlyMap<string, GateType> {
  const out = new Map<string, GateType>(Object.entries(BUILT_IN_GATE_TYPES));
  const own = x === undefined ? [] : x instanceof Map ? [...(x as ReadonlyMap<string, GateType>)] : Object.entries(x as Readonly<Record<string, GateType>>);
  for (const [name, t] of own) if (!out.has(name)) out.set(name, t);
  return out;
}

/** The consumer's gate-type names that collide with a built-in — refused, never merged (`gateTypesOf`). */
export function gateTypeCollisions(x: GateTypes | undefined): string[] {
  if (x === undefined) return [];
  const names = x instanceof Map ? [...(x as ReadonlyMap<string, GateType>).keys()] : Object.keys(x);
  return names.filter((n) => Object.prototype.hasOwnProperty.call(BUILT_IN_GATE_TYPES, n)).sort();
}

// ---- a PREDICATE that is DATA — v0.27 (W108, ADR 0074) ----

/**
 * **The keys each of the three `when` shapes carries, and no others** — `FD-V42`, on `FD-V30`'s and
 * `FD-V37`'s precedent (`RETRY_POLICY_KEYS`, `TRANSFORM_KEYS`): the evaluator reads exactly these, so
 * a key beside them would be carried and read by nothing. Exported so a test can compare them to
 * `spec/flow-definition.md` section 3's own tables, which is obligation (e)'s third shape — *a list is
 * a claim about another list* — on the tables this item adds.
 */
export const PREDICATE_NAME_KEYS: readonly string[] = ['predicate'];
export const PREDICATE_LEAF_KEYS: readonly string[] = ['path', 'op', 'value', 'default', 'length'];
export const PREDICATE_LEAF_REQUIRED: readonly string[] = ['path', 'op', 'value'];
export const PREDICATE_GROUP_KEYS: readonly string[] = ['all', 'any'];

/** Which of the three shapes an object is, by the key that marks it — or `null` for none, `'ambiguous'` for more than one. */
function predicateShapeOf(o: Record<string, unknown>): 'name' | 'leaf' | 'group' | 'ambiguous' | null {
  const marks: ('name' | 'leaf' | 'group')[] = [];
  if ('predicate' in o) marks.push('name');
  if ('path' in o || 'op' in o) marks.push('leaf');
  if ('all' in o || 'any' in o) marks.push('group');
  if (marks.length === 0) return null;
  if (marks.length > 1) return 'ambiguous';
  return marks[0]!;
}

/** A case value as a message prints it — `-0` as `-0`, which `JSON.stringify` prints `0` (W154 reader item R3). Error paths only. */
const caseValue = (v: unknown): string => (Object.is(v, -0) ? '-0' : JSON.stringify(v));

const isScalar = (v: unknown): v is null | boolean | number | string =>
  v === null || typeof v === 'boolean' || typeof v === 'string' || (typeof v === 'number' && Number.isFinite(v));

const scalarName = (v: unknown): string =>
  v === null ? 'null'
    : Array.isArray(v) ? 'an array'
      // **A non-finite number prints its VALUE**, because `typeof NaN` is `number` and the message
      // beside it says *a FINITE number* — so the refusal read as if it had accepted (W108's
      // conformity reader, 19).
      : (typeof v === 'number' && !Number.isFinite(v)) ? String(v)
        : typeof v;

/** The operators whose operand must be a NUMBER, and the one whose operand must be a STRING. */
const NUMERIC_OPS: ReadonlySet<string> = new Set(['lt', 'lte', 'gt', 'gte']);
const STRING_OPS: ReadonlySet<string> = new Set(['startsWith']);

/**
 * **Why a LEAF is not a comparison, or `null`** — `FD-V43`'s path clause and `FD-V44`'s operator and
 * value clauses, in one place so the validator and any later reader share one definition of *well
 * formed*. Returns the rule id with the message, because one value spans two rules and reporting it
 * under one of them would make the other's fixture a lie.
 */
/**
 * **Where a comparison is asked, and so which ROOTS its path may start at** — W154. A task's or a join's edge asks
 * it over a `DecisionContext`, whose members are `outcome` and `needs` (`PREDICATE_ROOTS`, `FD-V43`, UNMOVED); an
 * `if` gate asks it over the value that reached the gate, under the ONE root `input` (P32 decision 4). Two scopes
 * and not one wider list, because `input.x` on a task edge would resolve to nothing in silence — `FD-V43`'s own
 * class (W154 re-take 3). The messages are the scope's, so a task edge's read byte-for-byte as before.
 */
interface ComparisonScope {
  readonly roots: readonly string[];
  /** Why a first segment outside `roots` is refused — the tail of `FD-V43`'s root message. */
  readonly foreignRoot: (root: string) => string;
  /** Why a root ALONE is refused — the tail of `FD-V43`'s root-alone message. */
  readonly rootAlone: (root: string) => string;
}

const EDGE_SCOPE: ComparisonScope = {
  roots: PREDICATE_ROOTS,
  foreignRoot: () => `which a decision cannot see — a predicate's roots are ${PREDICATE_ROOTS.map((r) => JSON.stringify(r)).join(' and ')}, and any other first segment would resolve to nothing in silence`,
  rootAlone: (root) => `and names no value — ${JSON.stringify(root)} is a container, so a comparison against it could only ever be no match`,
};

/** The one root an `if` gate's condition may start at: what reached the gate. Private — no new public name (W154). */
const GATE_CONDITION_ROOTS: readonly string[] = ['input'];

const GATE_SCOPE: ComparisonScope = {
  roots: GATE_CONDITION_ROOTS,
  foreignRoot: () => 'which an if gate cannot see — its one root is "input", the value that reached the gate; a gate has no outcome and no edge needs, and any other first segment would resolve to nothing in silence',
  rootAlone: () => 'and names no key — a gate\'s path names a key INSIDE the value that reached it, as every gate\'s key path does; a value that must be compared whole is wrapped by the task before the gate',
};

function leafProblem(o: Record<string, unknown>, where: string, scope: ComparisonScope = EDGE_SCOPE): { rule: string; message: string } | null {
  const extra = Object.keys(o).filter((k) => !PREDICATE_LEAF_KEYS.includes(k));
  if (extra.length) {
    return { rule: 'FD-V42', message: `${where} carries ${extra.map((k) => JSON.stringify(k)).join(', ')}, which a comparison does not declare; it is { ${PREDICATE_LEAF_KEYS.join(', ')} }` };
  }
  for (const k of PREDICATE_LEAF_REQUIRED) {
    if (!(k in o)) return { rule: 'FD-V42', message: `${where} is missing required key "${k}"; a comparison is { ${PREDICATE_LEAF_KEYS.join(', ')} } with ${PREDICATE_LEAF_REQUIRED.join(', ')} required` };
  }
  // ---- FD-V43: the key path, and its ROOT ----
  const path = o.path;
  if (typeof path !== 'string' || !KEY_PATH_RE.test(path)) {
    return { rule: 'FD-V43', message: `${where} path ${JSON.stringify(path)} is not a key path — dot-separated object keys, each [A-Za-z0-9_-]{1,64}; no array index, no wildcard, no expression` };
  }
  const root = path.split('.')[0]!;
  if (!scope.roots.includes(root)) {
    return { rule: 'FD-V43', message: `${where} path ${JSON.stringify(path)} starts at ${JSON.stringify(root)}, ${scope.foreignRoot(root)}` };
  }
  if (path.split('.').length < 2) {
    return { rule: 'FD-V43', message: `${where} path ${JSON.stringify(path)} is a root alone ${scope.rootAlone(root)}` };
  }
  // ---- FD-V44: the operator, the literal, and the two modifiers ----
  const op = o.op;
  if (typeof op !== 'string' || !(PREDICATE_OPS as readonly string[]).includes(op)) {
    return { rule: 'FD-V44', message: `${where} op ${JSON.stringify(op)} is not one of ${PREDICATE_OPS.join(', ')} — the enumeration is closed, and a predicate that computes stays a registered name` };
  }
  if (o.length !== undefined && o.length !== true) {
    return { rule: 'FD-V44', message: `${where} length is ${JSON.stringify(o.length)}; it is exactly true or absent — there is no "compare the value, not its length" to ask for` };
  }
  const takesLength = o.length === true;
  if (!isScalar(o.value)) {
    return { rule: 'FD-V44', message: `${where} value is ${scalarName(o.value)}; a comparison compares against a SCALAR — null, a boolean, a finite number or a string` };
  }
  if (takesLength && typeof o.value !== 'number') {
    return { rule: 'FD-V44', message: `${where} compares a length against ${JSON.stringify(o.value)}; a length is a number` };
  }
  if (!takesLength && NUMERIC_OPS.has(op) && typeof o.value !== 'number') {
    return { rule: 'FD-V44', message: `${where} op "${op}" compares against ${JSON.stringify(o.value)}, which is not a number — the ordering operators are numeric, and a comparison between kinds is no match rather than a coercion` };
  }
  if (STRING_OPS.has(op) && typeof o.value !== 'string') {
    return { rule: 'FD-V44', message: `${where} op "${op}" compares against ${JSON.stringify(o.value)}, which is not a string` };
  }
  if (takesLength && STRING_OPS.has(op)) {
    return { rule: 'FD-V44', message: `${where} takes a length and uses "${op}"; a length is a number and has no prefix` };
  }
  if ('default' in o) {
    const d = o.default;
    const okDefault = Array.isArray(d) ? d.every(isScalar) : isScalar(d);
    if (!okDefault) {
      return { rule: 'FD-V44', message: `${where} default is ${scalarName(d)}; it is a scalar, or an array of scalars where \`length\` measures it` };
    }
    if (takesLength && !(Array.isArray(d) || typeof d === 'string')) {
      return { rule: 'FD-V44', message: `${where} takes a length and its default is ${JSON.stringify(d)}, which has none — the default stands in for the value BEFORE the length is taken` };
    }
    // **And the converse, which this message claimed and the code did not enforce** (W108's
    // conformity reader, 17): an ARRAY default with no `length` is compared against a SCALAR, so
    // it can never match and the comparison is permanently false wherever the path is absent —
    // a silent no-match, which is `FD-R2`'s class and the one thing this grammar exists to refuse.
    if (!takesLength && Array.isArray(d)) {
      return { rule: 'FD-V44', message: `${where} default is an array and the comparison takes no \`length\`, so it would be compared against a scalar and could never match — an array default is for \`length: true\`` };
    }
  }
  return null;
}

/**
 * **Why a `when` is not a predicate, or `null`** — `FD-V42` (the form and its keys), `FD-V43` (a
 * leaf's key path) and `FD-V45` (a group's members), in one place so the validator, the driver and
 * the tests cannot disagree about what a predicate IS.
 * [ADR 0074](../../doc/decisions/0074-a-predicate-is-a-registered-name-or-a-declared-comparison-over-the-context.md).
 *
 * **A registered NAME is a shape here and its REGISTRY lookup is not** — that stays `FD-V4`, which
 * has owned *an edge's `when` names a predicate absent from the registry* since P1 and whose only
 * change at v0.27 is where the name is written.
 */
export function predicateProblem(v: unknown): { rule: string; message: string } | null {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) {
    return {
      rule: 'FD-V42',
      message: `when is ${scalarName(v)}; it is an object — a registered name { predicate }, a comparison { ${PREDICATE_LEAF_KEYS.join(', ')} }, or a flat group { all } or { any }` +
        (typeof v === 'string' ? `. A bare string was the form until v0.27; write { "predicate": ${JSON.stringify(v)} }` : ''),
    };
  }
  const o = v as Record<string, unknown>;
  const shape = predicateShapeOf(o);
  if (shape === null) {
    return { rule: 'FD-V42', message: `when carries ${Object.keys(o).map((k) => JSON.stringify(k)).join(', ') || 'no keys'} and matches none of the three shapes — { predicate }, { ${PREDICATE_LEAF_KEYS.join(', ')} }, or { all } or { any }` };
  }
  if (shape === 'ambiguous') {
    return { rule: 'FD-V42', message: `when carries ${Object.keys(o).map((k) => JSON.stringify(k)).join(', ')} and matches more than one shape — a name, a comparison and a group are told apart by which keys are present, so an object may mark only one` };
  }
  if (shape === 'name') {
    const extra = Object.keys(o).filter((k) => !PREDICATE_NAME_KEYS.includes(k));
    if (extra.length) return { rule: 'FD-V42', message: `when names a predicate and also carries ${extra.map((k) => JSON.stringify(k)).join(', ')}; the name form is { predicate } and nothing else` };
    if (typeof o.predicate !== 'string') return { rule: 'FD-V42', message: `when predicate is ${scalarName(o.predicate)}; it is the name of a registered predicate` };
    return null;
  }
  if (shape === 'leaf') return leafProblem(o, 'when');
  return groupProblem(o, 'when', EDGE_SCOPE);
}

/**
 * **`FD-V45`: a FLAT group, whose members are LEAVES** — shared by a task edge's `when` and an `if` gate's
 * condition (W154), so the two cannot disagree about what a group IS; `label` and `scope` are the only difference,
 * and a task edge passes the values this read before it was a function.
 */
function groupProblem(o: Record<string, unknown>, label: string, scope: ComparisonScope): { rule: string; message: string } | null {
  const extra = Object.keys(o).filter((k) => !PREDICATE_GROUP_KEYS.includes(k));
  if (extra.length) return { rule: 'FD-V42', message: `${label} is a group and also carries ${extra.map((k) => JSON.stringify(k)).join(', ')}; a group is { all } or { any } and nothing else` };
  if ('all' in o && 'any' in o) return { rule: 'FD-V45', message: `${label} carries both "all" and "any"; a group is one or the other, because a document that says both says neither` };
  const which = 'all' in o ? 'all' : 'any';
  const members = o[which];
  if (!Array.isArray(members) || members.length === 0) {
    return { rule: 'FD-V45', message: `${label} ${which} is ${Array.isArray(members) ? 'empty' : scalarName(members)}; it is a non-empty array of comparisons — an empty group is "always true" or "always false" written as a question` };
  }
  for (let i = 0; i < members.length; i++) {
    const m: unknown = members[i];
    const at = `${label} ${which}[${i}]`;
    if (typeof m !== 'object' || m === null || Array.isArray(m)) {
      return { rule: 'FD-V45', message: `${at} is ${scalarName(m)}; a group's members are comparisons` };
    }
    const ms = predicateShapeOf(m as Record<string, unknown>);
    if (ms === 'group') {
      return { rule: 'FD-V45', message: `${at} is a group; a group is FLAT and its members are comparisons — nesting is refused rather than evaluated` };
    }
    if (ms === 'name') {
      return { rule: 'FD-V45', message: `${at} names a registered predicate; a group's members are comparisons — a group holding a function could be impure, which is the one thing a declared predicate guarantees over a registered one` };
    }
    if (ms === null || ms === 'ambiguous') {
      return { rule: 'FD-V45', message: `${at} carries ${Object.keys(m as object).map((k) => JSON.stringify(k)).join(', ') || 'no keys'} and is not a comparison` };
    }
    const p = leafProblem(m as Record<string, unknown>, at, scope);
    if (p) return p;
  }
  return null;
}

/**
 * **Why an `if` gate's `settings.when` is not a condition, or `null`** — W154, P32 decision 4: `FD-V42`-`FD-V45`'s
 * grammar MINUS the NAME shape, over the ONE root `input`. The rule returned is the grammar's own, for the message;
 * the finding is `FD-V40`, the gate's settings, because `if`'s `settingsProblem` is what asks (P32 decision 7).
 * **A NAME is refused, with the reason**: a registered predicate is handed a `DecisionContext` — an `outcome` and an
 * edge's `needs` — and a gate has neither; a decision that needs code is a gate type of its own (P32 Scope/Out).
 */
function gateConditionProblem(v: unknown): { rule: string; message: string } | null {
  const label = 'settings.when';
  if (typeof v !== 'object' || v === null || Array.isArray(v)) {
    return { rule: 'FD-V42', message: `${label} is ${scalarName(v)}; it is an object — a comparison { ${PREDICATE_LEAF_KEYS.join(', ')} } or a flat group { all } or { any }, over the root "input"` };
  }
  const o = v as Record<string, unknown>;
  const shape = predicateShapeOf(o);
  if (shape === null) {
    return { rule: 'FD-V42', message: `${label} carries ${Object.keys(o).map((k) => JSON.stringify(k)).join(', ') || 'no keys'} and is neither a comparison { ${PREDICATE_LEAF_KEYS.join(', ')} } nor a flat group { all } or { any }` };
  }
  if (shape === 'ambiguous') {
    return { rule: 'FD-V42', message: `${label} carries ${Object.keys(o).map((k) => JSON.stringify(k)).join(', ')} and matches more than one shape — a comparison and a group are told apart by which keys are present, so an object may mark only one` };
  }
  if (shape === 'name') {
    return { rule: 'FD-V42', message: `${label} names a registered predicate, which an if gate cannot ask — a predicate is handed a decision's outcome and its edge's needs, and a gate has neither. Write a comparison over "input", or register a gate type of your own` };
  }
  if (shape === 'leaf') return leafProblem(o, label, GATE_SCOPE);
  return groupProblem(o, label, GATE_SCOPE);
}

/** Every registered predicate NAME a `when` reaches, so `FD-V4` can be asked of each — `[]` for a declared one. */
export function predicateNamesIn(v: unknown): string[] {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return [];
  const o = v as Record<string, unknown>;
  return typeof o.predicate === 'string' ? [o.predicate] : [];
}

/**
 * **The two keys a `transform` carries, and no others** — `FD-V37`'s shape half, on `FD-V30`'s
 * precedent (`RETRY_POLICY_KEYS`): the wrapper reads exactly these two, so a key beside them
 * would be carried and read by nothing — a typo that means something quietly.
 */
export const TRANSFORM_KEYS: readonly string[] = ['lang', 'expr'];

/**
 * **Why a `transform` value is not `{ lang, expr }`, or `null`** — `FD-V37`'s shape clause in one
 * place, as `retryPolicyProblem` is `FD-V30`'s. An object, not `null`, not an array, carrying
 * BOTH keys as strings and NO other key. Whether the node is TYPED is `FD-V37`'s other clause and
 * is decided beside the node, not here.
 */
export function transformShapeProblem(v: unknown): string | null {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) {
    return `transform must be an object { lang, expr }, got ${JSON.stringify(v)}`;
  }
  const o = v as Record<string, unknown>;
  for (const k of TRANSFORM_KEYS) {
    if (o[k] === undefined) return `transform is missing "${k}"; it is { lang, expr }, both strings`;
    if (typeof o[k] !== 'string') return `transform.${k} must be a string, got ${JSON.stringify(o[k])}`;
  }
  const extra = Object.keys(o).filter((k) => !TRANSFORM_KEYS.includes(k));
  if (extra.length) return `transform carries ${extra.map((k) => `"${k}"`).join(', ')}, which the wrapper would read as nothing; it is { lang, expr } and no other key`;
  return null;
}

/**
 * **What the language says about an expression, or `null`** — `FD-V36`'s whole predicate. The
 * REGISTRY half of an adapter is a synchronous `compile` that returns nothing and THROWS on an
 * expression the language refuses (ADR 0051 rule 2); the throw's message is the detail, and the
 * error's `position` and `code` ride along when the language sets them (JSONata's `S0203` at
 * position 12 — P17 fact 2). A `compile` that is not a function is the REGISTRY's mistake and is
 * refused at `new Driver` naming the language (as a non-function settings validator is under
 * `FD-V33`); reached here directly, it is reported the same way on the node.
 */
export function compileProblem(adapter: LanguageAdapter, expr: string): string | null {
  if (typeof adapter.compile !== 'function') {
    return 'the language`s compile is not a function; a registry half of an adapter is a synchronous compile(expr) that throws on a syntax error';
  }
  try {
    adapter.compile(expr);
  } catch (e) {
    const err = e as { position?: unknown; code?: unknown };
    const message = e instanceof Error ? e.message : String(e);
    const position = typeof err.position === 'number' ? ` at position ${err.position}` : '';
    const code = typeof err.code === 'string' && err.code.length ? ` [${err.code}]` : '';
    return `${message}${position}${code}`;
  }
  return null;
}

/**
 * **A node's EFFECTIVE settings: the type's defaults merged UNDER what the node declares** —
 * `spec/flow-definition.md` section 2 (v0.19, P18 decision 12). One definition, read by the
 * validator (what the worker's `settingsSchema` sees) and by the driver (what the envelope carries),
 * so the object refused at construction and the object dispatched are the same object. A shallow
 * merge, the node's keys winning; `{}` when neither declares anything.
 */
export function effectiveSettings(
  node: { settings?: Readonly<Record<string, unknown>> },
  type?: { settings?: Readonly<Record<string, unknown>> },
): Readonly<Record<string, unknown>> {
  return { ...(type?.settings ?? {}), ...(node.settings ?? {}) };
}

/**
 * **Why a typed node's `settings` is refused, or `null`** — `FD-V33`'s whole predicate, in one
 * place as `retryPolicyProblem` is for `FD-V30`. Two clauses: the SHAPE — a plain JSON object,
 * because a definition is data (ADR 0002 rule 1) and an array or a scalar is a value the envelope
 * would carry without a word — and the worker's `settingsSchema` over the EFFECTIVE settings (the
 * type's defaults merged under the node's). **An absent schema means UNCHECKED** (P18 decision 3),
 * which is what v0.17's absent validator meant. A schema outside the built-in subset is the
 * REGISTRY's mistake and is refused at construction by name (ADR 0053, Q278); reached here anyway,
 * it is reported rather than applied, because a keyword ignored is a constraint dropped in silence.
 */
export function settingsProblem(
  schema: JsonSchema | undefined,
  defaults: Readonly<Record<string, unknown>> | undefined,
  settings: unknown,
): string | null {
  if (settings !== undefined && (typeof settings !== 'object' || settings === null || Array.isArray(settings))) {
    return `settings must be a plain object, got ${JSON.stringify(settings)}`;
  }
  if (schema === undefined) return null;
  const malformed = schemaProblem(schema);
  if (malformed !== null) return `the worker's settingsSchema is not in the built-in subset and cannot be applied — ${malformed}`;
  const effective = effectiveSettings({ settings: settings as Readonly<Record<string, unknown>> | undefined }, { settings: defaults });
  const fs = findings(schema, effective);
  if (fs.length === 0) return null;
  return `settings ${JSON.stringify(effective)} fail the worker's settingsSchema: ${describeFindings(fs)}`;
}

/**
 * @returns every violated rule. Empty means the definition is valid.
 *   A definition is valid **against a registry**: FD-V4 and FD-V32 are refusals
 *   about one, so there is no such thing as validating without it.
 */
/**
 * **Every reference a node's declarations aim, from BOTH sites** — W42.
 *
 * A `needs` on the node and a `needs` on any of its edges are aimed by the same two
 * rules, at the same reader, so `FD-V27` and `FD-V28` iterate one sequence rather
 * than two loops that could drift apart. The third element is what the message says,
 * which is the only thing the two sites do not share.
 */
function aimedReferences(n: FlowNode): [string, unknown, 'needs' | 'edge needs', string][] {
  const out: [string, unknown, 'needs' | 'edge needs', string][] = [];
  const push = (v: unknown, site: 'needs' | 'edge needs', at: string) => {
    if (typeof v !== 'object' || v === null || Array.isArray(v)) return;
    for (const [k, ref] of Object.entries(v as Record<string, unknown>)) out.push([k, ref, site, at]);
  };
  push((n as unknown as Record<string, unknown>).needs, 'needs', n.id);
  const edges = (n as { edges?: unknown }).edges;
  if (Array.isArray(edges)) {
    // **Every edge, and each reporting its OWN index** — W42's adequacy reader found
    // both halves: `edges.slice(0, 1)` cost **0**, because every edge-site fixture in
    // the tree put its `needs` on edge 0; and `FD-V27`/`FD-V28` reported `at: <node
    // id>` for an edge-site violation while `FD-V26`'s clauses report `<node>#edgeN`,
    // so an author with three edges was told the node and not the edge.
    edges.forEach((e, i) => {
      if (typeof e === 'object' && e !== null) {
        push((e as Record<string, unknown>).needs, 'edge needs', `${n.id}#edge${i}`);
      }
    });
  }
  return out;
}

/**
 * **The one place `needs`' reference grammar is parsed** — `FD-V26`'s five forms (`"."`, `"$payload"`, `"$item"`, `"n"`, `["n"]` — the two `$` forms since v0.44, `"$item"` composed since v0.45),
 * and `spec/flow-definition.md` section 3's table. `null` is *not a reference at
 * all*, which is what `FD-V26` reports; every other return is well formed and
 * `FD-V27`/`FD-V28` decide whether it is well AIMED.
 *
 * **The grammar's invented tokens are `"."`, `"?"` and — v0.44 — the whole `"$"` PREFIX**, and
 * each is safe because it is outside `FD-V16`'s charset, so no node may ever be called `.`, end
 * in `?` or begin with `$` (P38 fact 1). *(This read *"`"."` and `"?"` are the only invented
 * tokens"* until W190.)* Two `$` tokens are references: **`"$payload"`** — the value the RUN
 * entered with, from any node and any edge (v0.44,
 * [ADR 0117](../../doc/decisions/0117-a-reference-may-name-what-reached-the-run.md)) — and
 * **`"$item"`** — the item of the innermost map instance CONTAINING the reader, from any node or edge
 * inside one (v0.45, P38 (c), [ADR 0118](../../doc/decisions/0118-a-map-instance-keeps-its-item-while-a-node-of-it-may-still-be-entered.md));
 * parsed here since v0.44 so the union is one type for both (P38 (h)), and aimed by `FD-V49`. Every other `$`
 * spelling — `["$payload"]`, `"$payload?"`, `"$other"` — is `null`, and `FD-V26` names the fix.
 * **They are `form`s and not a flag**, and `node` is `null` on all three node-less forms, so a
 * caller that reads `node === null` as *the `"."` form* reads `"$payload"` as `"."` in silence —
 * **switch on `form`** (P38 fact 7, the reason the union is widened rather than `'self'` reused).
 * **On an EDGE the `"."` form is refused** — `FD-V26`s v0.12 clause — but that is the
 * CALLER`s rule: this function parses ONE grammar, and the two sites differ in what
 * they accept of it rather than in how it is read. *`"$payload"` and `"$item"` are NOT refused there*: a
 * predicate has no `ctx.payload` and no `ctx.item`, so naming either is not redundant (P38 decision 3).
 *
 * **The `?` suffix is v0.13's, and it decides what happens when the target produced
 * NOTHING on this path rather than which outputs are named** —
 * [ADR 0042](../../doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md).
 * So `conditional` is a third field beside `form` rather than two more values of it:
 * `FD-V28` asks *how many* and reads `form`; `FD-V29` asks *must it have run* and
 * reads `conditional`. A `"."` may not carry one — it resolves to the edge's own
 * value, which is always there — and the remainder after the suffix is stripped must
 * still be an id, so `"?"`, `"n??"` and `".?"` are all `null` with no extra clause.
 */
export function referenceTarget(
  ref: unknown,
): { form: 'self'; node: null; conditional: false }
  // P38 (h)'s `{ form: 'payload' | 'item'; … }`, written as two members so a switch on `form` NARROWS: one member
  // with a two-literal discriminant is not split by a `===`, and every caller below would need a cast.
  | { form: 'payload'; node: null; conditional: false }
  | { form: 'item'; node: null; conditional: false }
  | { form: 'one' | 'all'; node: string; conditional: boolean }
  | null {
  if (ref === '.') return { form: 'self', node: null, conditional: false };
  if (ref === PAYLOAD_TOKEN) return { form: 'payload', node: null, conditional: false };
  if (ref === ITEM_TOKEN) return { form: 'item', node: null, conditional: false };
  if (typeof ref === 'string') return aimed(ref, 'one');
  if (Array.isArray(ref) && ref.length === 1 && typeof ref[0] === 'string') {
    return aimed(ref[0], 'all');
  }
  return null;
}

/** One aimed reference's node id and its optional `?` suffix. `referenceTarget`'s only helper. */
function aimed(s: string, form: 'one' | 'all'): { form: 'one' | 'all'; node: string; conditional: boolean } | null {
  const conditional = s.endsWith('?');
  const node = conditional ? s.slice(0, -1) : s;
  return ID_RE.test(node) ? { form, node, conditional } : null;
}

/** The run's payload as a reference — v0.44, P38 (b). */
const PAYLOAD_TOKEN = '$payload';
/** A map instance's item as a reference — PARSED since v0.44 (P38 (h)), composed since v0.45 (W191). */
const ITEM_TOKEN = '$item';

/**
 * **What `FD-V26` says about a `$` spelling that is not a reference** — P38 (g): the whole `$` prefix is
 * reserved, so a spelling that starts with it is never read as a node id (`FD-V16` refuses `$` in an id, so it
 * could never name one) and the message names the FIX rather than the grammar. `null` for anything that does
 * not start with `$`, which the caller words as before. The ARRAY form is asked first: `["$payload?"]` is told
 * to drop the brackets, and dropping them leaves the suffix to be told next.
 */
function dollarProblem(ref: unknown): string | null {
  const one = Array.isArray(ref) && ref.length === 1 ? ref[0] : ref;
  if (typeof one !== 'string' || !one.startsWith('$')) return null;
  const bare = one.endsWith('?') ? one.slice(0, -1) : one;
  const known = bare === PAYLOAD_TOKEN || bare === ITEM_TOKEN;
  if (known && Array.isArray(ref)) {
    return `${JSON.stringify(ref)} is an array form, and there is ONE ${bare === PAYLOAD_TOKEN ? 'run payload' : 'item per map instance'}: write ${JSON.stringify(bare)}`;
  }
  if (known) return `${JSON.stringify(one)} carries "?", and ${JSON.stringify(bare)} is always there: write ${JSON.stringify(bare)} without "?"`;
  return `${JSON.stringify(ref)} is not a reference: the "$" prefix is reserved, and its references are "$payload" (the run's payload) and "$item" (a map instance's item)`;
}

/**
 * **`FD-V49` — `"$item"` where no map instance contains the reader** (v0.45, P38 (g)): its own id rather than an
 * `FD-V27` clause, on `FD-V28`'s precedent — *a different fix earns a different id*: `FD-V27`'s fix is to re-point
 * the reference, and this one's is to move the READER. The message names both roads. *(Until W191 `FD-V26` refused
 * `"$item"` everywhere, naming `"."` on the branch entry — W190's reading R1.)*
 */
const itemOutside = (site: string, k: string, nodeId: string): string =>
  `${site}[${JSON.stringify(k)}] is "$item", and "${nodeId}" is not inside a map instance: name the item where a map's branch receives it ("."), or move this node inside the map`;

export function validateDefinition(doc: FlowDefinition, registry: Registry): Finding[] {
  const f: Finding[] = [];
  const add = (rule: string, at: string | null, detail: string) => f.push({ rule, at, detail });
  const preds = asSet(registry.predicates);
  // **Absent means EMPTY, not unchecked** — `Registry.groups`' own doc comment, and the
  // maintainer's call at W58's stop-and-ask with both directions priced.
  const groups = asSet(registry.groups ?? []);
  // The fourth set, read the same way (W59): absent means no node type is registered.
  const nodeTypes = nodeTypesOf(registry.nodeTypes);
  // The fifth set, read the same way (W61): absent means no language is registered.
  const languages = languagesOf(registry.languages);
  // The workers and the named pool instances, read the same way (W65, v0.19): absent means none.
  const workers = workersOf(registry.workers);
  const pools = poolsOf(registry.pools);
  // The sixth set (W92, v0.23): the built-in gate types and the consumer's, and the consumer's names that
  // collide with a built-in — refused rather than merged (`gateTypesOf`).
  const gateTypes = gateTypesOf(registry.gateTypes);
  const gateCollisions = new Set(gateTypeCollisions(registry.gateTypes));
  const d = doc as unknown as Record<string, unknown>;

  // ---- document shape: FD-V23, FD-V17, FD-V21, FD-V16 ----
  for (const k of DOC_KEYS) {
    if (d?.[k] === undefined) add('FD-V23', null, `document is missing required key "${k}"`);
  }
  for (const k of Object.keys(d ?? {})) {
    if (!DOC_KEYS.includes(k)) add('FD-V17', null, `document carries undeclared key "${k}"`);
  }
  if (d?.flowId !== undefined && (typeof d.flowId !== 'string' || !ID_RE.test(d.flowId as string))) {
    add('FD-V16', null, `flowId ${JSON.stringify(d.flowId)} is not [A-Za-z0-9_-]{1,64}`);
  }
  if (d?.version !== undefined && (!Number.isInteger(d.version) || (d.version as number) < 1)) {
    add('FD-V21', null, `version must be an integer >= 1, got ${JSON.stringify(d.version)}`);
  }
  if (d?.nodes !== undefined && !Array.isArray(d.nodes)) {
    add('FD-V21', null, 'nodes must be an array');
  }

  const nodes: FlowNode[] = Array.isArray(doc?.nodes) ? doc.nodes : [];

  // ---- per node ----
  for (const n of nodes) {
    if (n === null || typeof n !== 'object') {
      add('FD-V21', null, `nodes contains ${JSON.stringify(n)}, which is not a node object`);
      continue;
    }
    const nd = n as unknown as Record<string, unknown>;
    const where = typeof nd?.id === 'string' ? (nd.id as string) : '<node with no id>';
    if (nd?.id === undefined) add('FD-V23', where, 'node is missing required key "id"');
    if (nd?.kind === undefined) add('FD-V23', where, 'node is missing required key "kind"');
    if (nd?.id !== undefined && typeof nd.id !== 'string') {
      add('FD-V21', where, 'node id must be a string');
      continue;
    }
    if (typeof nd?.id === 'string' && !ID_RE.test(nd.id)) {
      add('FD-V16', where, `node id is not [A-Za-z0-9_-]{1,64}`);
    }
    if (nd?.kind === undefined) continue;
    if (typeof nd.kind !== 'string' || !(KINDS as readonly string[]).includes(nd.kind)) {
      // FD-V24. The rule the other three could not reach: `kind` is present so
      // FD-V23 is silent, it is a string so FD-V21 is silent, and FD-V17 has no
      // declared key set to compare against for an unknown kind.
      add('FD-V24', where, `node kind ${JSON.stringify(nd.kind)} is not task|fanout|map|join|end|gate|ask`);
      continue;
    }

    const spec = NODE_KEYS[nd.kind]!;
    for (const k of spec.req) {
      if (k !== 'id' && k !== 'kind' && nd[k] === undefined) {
        add('FD-V23', where, `${nd.kind} node is missing required key "${k}"`);
      }
    }
    for (const k of Object.keys(nd)) {
      if (!spec.req.includes(k) && !spec.opt.includes(k)) {
        // **`FD-V47` — a key only a task's WORKER reads, on an ask** (v0.42, W179). One finding per key, naming it,
        // and `FD-V17` silent for it: the ask's six refused keys are this rule's, not an undeclared key's.
        if (nd.kind === 'ask' && ASK_REFUSED_KEYS.includes(k)) {
          add('FD-V47', where, k === 'transform'
            ? 'ask node carries "transform", which only a task declares — a transform is evaluated in a node type\'s worker wrapper (FD-C6) and an ask runs no worker, so nothing would evaluate it; what reaches an ask is composed by its `needs` (P35 decision 6)'
            : `ask node carries "${k}", which only a task declares — it is read by a task's worker or its scheduler task, and an ask runs no worker and is never dispatched, so nothing would read it`);
        } else {
          add('FD-V17', where, `${nd.kind} node carries undeclared key "${k}"`);
        }
      }
    }

    if (nd.kind === 'task') {
      if (nd.optional !== undefined && typeof nd.optional !== 'boolean') {
        add('FD-V21', where, 'optional must be a boolean');
      }
      // ---- a node TYPE and its POOL: FD-V32, FD-V33, FD-V38 ----
      // `spec/flow-definition.md` section 2 (v0.19, W65) and ADR 0054. A task names the thing that
      // runs it ONE way — `type`, REQUIRED, a registry node type whose DEFAULT pool instance is keyed
      // by its name — and may name a NAMED instance of that type in `pool`. A task with no `type` is
      // `FD-V23`'s generic clause (the key loop above); a `workerType` is `FD-V17`'s undeclared key.
      // `FD-V5` and `FD-V34` are retired with it — with one road there are no halves to mix.
      if (nd.type !== undefined && typeof nd.type !== 'string') {
        add('FD-V21', where, 'type must be a string');
      }
      if (nd.pool !== undefined && typeof nd.pool !== 'string') {
        add('FD-V21', where, 'pool must be a string');
      }
      if (typeof nd.type === 'string') {
        // **`FD-V32` — the type must exist AND name a worker the registry declares.** Two clauses
        // under one id because both mean *this node cannot run* and the fix is the registry either
        // way; the second is reported only when the first passed, so an unregistered type reads one
        // message. *(v0.17's second clause — a registered type with no POOL of its name — has no
        // instance since v0.19: every type has a default instance, built from its own config.)*
        const type = nodeTypes.get(nd.type);
        if (type === undefined) {
          // The `no node types` arm is GONE: since v0.28 `nodeTypesOf` always returns at least the
          // built-ins, so it could never render — measured with `nodeTypes: undefined`, the detail reads
          // *(the registry declares "Transform")*. W109's conformity reader, 14, which is finding 1's
          // withdrawn reading from the other side.
          add('FD-V32', where, `type "${nd.type}" is not a registered node type` +
            ` (the registry declares ${[...nodeTypes.keys()].sort().map((x) => `"${x}"`).join(', ')})`);
        } else if (!onlyTransforms(type) && (typeof type.worker !== 'string' || !workers.has(type.worker))) {
          // **A type that names NO worker is EXEMPT from this clause since v0.28** — ADR 0075: it is a
          // built-in that only transforms, so *a type with no worker cannot run* is false of it. The
          // test is `onlyTransforms`, the PROPERTY, not a comparison against the built-in names: a
          // consumer's type with an omitted `worker` never reaches here, because
          // `checkNodeTypeShape` refuses it at `resolveRegistry`, and a registry reached directly
          // carries whatever its author put in it. **What such a node must declare instead is
          // `FD-V46`'s**, below.
          add('FD-V32', where, `type "${nd.type}" is registered but names worker ${JSON.stringify(type.worker)}, which the registry's workers does not declare` +
            (workers.size ? ` (it declares ${[...workers.keys()].sort().map((x) => `"${x}"`).join(', ')})` : ' (it declares none)') + ' — a type with no worker cannot run');
        }
        // **`FD-V33` — the SHAPE, then the worker's `settingsSchema` over the EFFECTIVE settings**
        // (the type's defaults merged under the node's) — see `settingsProblem`. Run against an
        // unregistered type too (shape alone), so a malformed `settings` beside an unknown `type`
        // reports both things wrong rather than one at a time.
        const worker = type === undefined || typeof type.worker !== 'string' ? undefined : workers.get(type.worker);
        const problem = settingsProblem(worker?.settingsSchema, type?.settings, nd.settings);
        if (problem !== null) add('FD-V33', where, problem);
        // **`FD-V38` — a `pool` names an instance of THIS node's type.** The type's own name is its
        // default instance, stated explicitly, and is accepted; any other name is a key in the
        // registry's `pools` whose `type` is this node's. Reported only once the type is registered.
        if (typeof nd.pool === 'string' && type !== undefined && nd.pool !== nd.type) {
          const inst = pools.get(nd.pool);
          if (inst === undefined) {
            add('FD-V38', where, `pool "${nd.pool}" is not a registered pool instance` +
              (pools.size ? ` (the registry declares ${[...pools.keys()].sort().map((x) => `"${x}"`).join(', ')})` : ' (the registry declares no named instances)') +
              `; a node with no pool runs on its type's default instance, keyed "${nd.type}"`);
          } else if (inst.type !== nd.type) {
            add('FD-V38', where, `pool "${nd.pool}" is an instance of type "${inst.type}", not of this node's type "${nd.type}"; a node runs on an instance of its own type`);
          }
        }
      }
      // ---- FD-V35, FD-V36, FD-V37: what a node may DO to its input before its worker sees it ----
      // `spec/flow-definition.md` section 2's `transform` subsection, v0.18 (W61), ADR 0051, P17
      // decisions 1, 3 and 4. The transform is evaluated in the TYPE's worker wrapper and never in
      // the driver; its shape is exactly `{ lang, expr }` (`FD-V37`, a key that would be carried
      // nowhere); `lang` names a registered language, the set EMPTY when absent (`FD-V35`,
      // `FD-V31`'s reading); and `expr` is text that language's `compile` accepts, run HERE at
      // instantiation because compilation is synchronous (`FD-V36`, ADR 0002 rule 3's whole
      // argument: a syntax error is refused at `new Driver`, not on the one workload that reaches
      // the node). `FD-V36` is reported only when `FD-V35` passed — an unknown language has no
      // compiler to ask. *(v0.18's other `FD-V37` clause — a transform on a node with no `type` —
      // has no instance since v0.19: every task node is typed, and one with no `type` is `FD-V23`.)*
      if (nd.transform !== undefined) {
        const shape = transformShapeProblem(nd.transform);
        if (shape !== null) {
          add('FD-V37', where, shape);
        } else {
          const t = nd.transform as Transform;
          const adapter = languages.get(t.lang);
          if (adapter === undefined) {
            add('FD-V35', where, `transform.lang "${t.lang}" is not a registered language` +
              (languages.size ? ` (the registry declares ${[...languages.keys()].sort().map((x) => `"${x}"`).join(', ')})` : ' (the registry declares no languages)'));
          } else {
            const problem = compileProblem(adapter, t.expr);
            if (problem !== null) add('FD-V36', where, `transform.expr ${JSON.stringify(t.expr)} is refused by "${t.lang}": ${problem}`);
          }
        }
      }
      // ---- FD-V46: a node whose type only TRANSFORMS must say what it transforms ----
      // `spec/flow-definition.md` section 5, v0.28 (W109), ADR 0075 rule 3 and P26 decision 5 (b).
      // A type with no worker has nothing to run BUT the transform, so a node of one that declares
      // none would dispatch a real task, pay a clone and a log record, and hand its successor the
      // value it was given — an EXPENSIVE IDENTITY, which is the alternative the maintainer refused.
      //
      // **Its own id rather than a clause of `FD-V37`**, on `FD-V28`'s stated precedent that a
      // different fix earns a different id (W109's stop-and-ask (d)): `FD-V37` refuses a `transform`
      // that is MALFORMED and this refuses one that is MISSING, so one rule would say two opposite
      // things and its fixture's name would describe half of it. Reported only once the type is
      // registered — an unregistered type is `FD-V32`'s and has no worker to be absent.
      if (typeof nd.type === 'string' && nd.transform === undefined && onlyTransforms(nodeTypes.get(nd.type))) {
        add('FD-V46', where, `type "${nd.type}" only transforms — it names no worker, so a node of it with no \`transform\` ` +
          'would dispatch a task that returns what it was given. Declare a `transform`, or move the computation onto the node that CONSUMES the value ' +
          '(a `transform` there costs no extra task) or into that node`s `needs` if it is a selection');
      }
      // ---- FD-V30: what a node says about its task's RETRIES ----
      // `spec/flow-definition.md` section 2, v0.16 (W58). Its own id rather than a clause of
      // `FD-V21`, on `FD-V26`'s precedent: the rule owns the key's whole shape, because the
      // fix is the same whichever clause fired — write `{ maxRetries, backoffMs }` — and a
      // reader with a malformed policy reads one row.
      if (nd.retryPolicy !== undefined) {
        const problem = retryPolicyProblem(nd.retryPolicy);
        if (problem !== null) add('FD-V30', where, problem);
      }
      // ---- FD-V31: what a node says about its task's RESOURCE GROUPS ----
      // Same section. Every id must be one the registry declares, because the scheduler
      // ignores an unknown one in silence (P16 fact 2, re-measured at W58 with a resource
      // listener attached: no `resource.blocked`, no throw, `done`). Empty and repeated
      // entries are refused too: `[]` declares nothing while reading as though it did
      // (`FD-V26`'s empty-`needs` clause), and the scheduler dedupes a repeat in silence.
      if (nd.workerGroups !== undefined) {
        const wg = nd.workerGroups;
        if (!Array.isArray(wg)) {
          add('FD-V31', where, `workerGroups must be an array of group ids, got ${JSON.stringify(wg)}`);
        } else if (wg.length === 0) {
          add('FD-V31', where, 'workerGroups is empty; a node that declares it names at least one group');
        } else {
          for (const g of wg) {
            if (typeof g !== 'string') {
              add('FD-V31', where, `workerGroups entry ${JSON.stringify(g)} is not a string`);
            } else if (!groups.has(g)) {
              add('FD-V31', where, `workerGroups names "${g}", which the registry does not declare` +
                (groups.size ? ` (it declares ${[...groups].sort().map((x) => `"${x}"`).join(', ')})` : ' (it declares no groups)'));
            }
          }
          if (new Set(wg).size !== wg.length) add('FD-V31', where, 'workerGroups repeats an entry');
        }
      }
    }
    // ---- a GATE: its type, its settings and its routes — FD-V39, FD-V40, FD-V41 (v0.23) ----
    // `spec/flow-definition.md` section 2's `gate` subsection, ADR 0066, P24 decisions 2-4. Every clause is
    // decided HERE, at instantiation and against the registry, because a document alone cannot know a
    // type's routes: shape is checked without a registry, exhaustiveness with one. **Split by what an
    // author FIXES** (`FD-V28`'s precedent): the type is `FD-V39`, what the type is configured with is
    // `FD-V40`, how the gate is wired is `FD-V41`.
    if (nd.kind === 'gate') {
      if (nd.type !== undefined && typeof nd.type !== 'string') add('FD-V21', where, 'type must be a string');
      const typeName = typeof nd.type === 'string' ? nd.type : undefined;
      const type = typeName === undefined ? undefined : gateTypes.get(typeName);
      // **`FD-V39`** — the type is registered, is a gate type, and is declared once.
      let usable: GateType | undefined;
      if (typeName !== undefined) {
        if (type === undefined) {
          const added = [...gateTypes.keys()].filter((x) => !Object.prototype.hasOwnProperty.call(BUILT_IN_GATE_TYPES, x)).sort();
          add('FD-V39', where, `type "${typeName}" is not a registered gate type (the built-ins are ${Object.keys(BUILT_IN_GATE_TYPES).sort().map((x) => `"${x}"`).join(', ')}` +
            (added.length ? `; the registry adds ${added.map((x) => `"${x}"`).join(', ')})` : '; the registry adds none)'));
        } else if (gateCollisions.has(typeName)) {
          add('FD-V39', where, `type "${typeName}" is a built-in gate type AND registered in the registry's gateTypes — one namespace, one definition per name`);
        } else {
          const problem = gateTypeProblem(type);
          if (problem !== null) add('FD-V39', where, `type "${typeName}" is registered and is not a gate type: ${problem}`);
          else usable = type;
        }
      }
      // **`FD-V40`** — the settings: a plain object (always), a `key` in stop-and-ask (d)'s grammar (always —
      // the key is the LIBRARY's, not the type's), and the type's `settingsSchema` over them, `{}` when absent
      // (only once `FD-V39` passed — an unknown type has no schema to ask).
      const settings = nd.settings;
      // Whether `FD-V40` found anything on THIS gate — a derived type's routes are asked only once it found
      // nothing (ADR 0092 rule 3), so `routesFor` may assume the settings its schema and `settingsProblem` accept.
      let settingsRefused = false;
      if (settings !== undefined && (typeof settings !== 'object' || settings === null || Array.isArray(settings))) {
        add('FD-V40', where, `settings must be a plain object, got ${describeValue(settings)}`);
        settingsRefused = true;
      } else {
        const s = (settings ?? {}) as Record<string, unknown>;
        if (Object.prototype.hasOwnProperty.call(s, 'key')) {
          const kp = keyPathProblem(s.key);
          if (kp !== null) { add('FD-V40', where, kp); settingsRefused = true; }
        }
        let schemaRefused = false;
        if (usable?.settingsSchema !== undefined) {
          const fs = findings(usable.settingsSchema, s);
          if (fs.length) { add('FD-V40', where, `settings ${describeValue(s)} fail gate type "${typeName}"'s settingsSchema: ${describeFindings(fs)}`); schemaRefused = true; settingsRefused = true; }
        }
        // **The type's own check, AFTER its schema accepted** — ADR 0092 rule 4, P32 decision 3: the subset
        // cannot state a grammar (ADR 0053), so a type that needs one states it as a function. Handed a COPY.
        // A message is the SETTINGS' defect (`FD-V40`); a throw, or a return that is neither a message nor
        // `null`, is the TYPE's (`FD-V39`) — split by what an author fixes, `FD-V28`'s precedent.
        // **Settings a type's own code is handed must COPY** — conformity reader C2. Asked only where the type
        // carries `settingsProblem` or `routesFor`, the two members handed a copy at instantiation, and refused
        // here as the SETTINGS' defect (`FD-V40`): copied inside either call's `try`, an uncloneable value read as
        // the TYPE having thrown. One clone per such gate, at instantiation.
        let uncopyable = false;
        if (usable !== undefined && (usable.settingsProblem !== undefined || typeof usable.routesFor === 'function')) {
          try { structuredClone(s); } catch (e) {
            add('FD-V40', where, `settings cannot be copied for gate type "${typeName}" — they must survive structuredClone, as a JSON document's do: ${describeThrown(e)}`);
            uncopyable = true;
            settingsRefused = true;
          }
        }
        if (usable?.settingsProblem !== undefined && !schemaRefused && !uncopyable) {
          let said: unknown;
          let threw = false;
          const copy = structuredClone(s);   // cannot throw: `uncopyable` above
          try { said = usable.settingsProblem(copy); } catch (e) {
            threw = true;
            add('FD-V39', where, `type "${typeName}"'s settingsProblem threw: ${describeThrown(e)}`);
          }
          if (!threw && said !== null) {
            if (typeof said === 'string') {
              add('FD-V40', where, `settings ${describeValue(s)} fail gate type "${typeName}"'s settingsProblem: ` +
                (said === '' ? 'it returned an EMPTY message — a refusal with no reason given (null is the pass)' : said));
            } else add('FD-V39', where, `type "${typeName}"'s settingsProblem returned ${describeValue(said)}, which is neither a message nor null`);
          }
          // A THROW blocks resolution as a refusal does (conformity reader C4): `routesFor` may assume settings
          // `settingsProblem` passed, and a throw passed nothing.
          if (threw || said !== null) settingsRefused = true;
        }
      }
      // **The gate's ROUTE SET, resolved once** — ADR 0092 rule 3. A static type's three members, or what a
      // derived type's `routesFor` returns for THIS gate's settings, asked only once `FD-V40` passed on the
      // gate. A throw or a malformed set is the TYPE's, reported at the gate under `FD-V39`.
      let routeSet: ReturnType<typeof routesOf> | undefined;
      if (usable !== undefined && !(typeof usable.routesFor === 'function' && settingsRefused)) {
        routeSet = routesOf(usable, settings ?? {});
        if ('problem' in routeSet) add('FD-V39', where, `type "${typeName}" resolves no route set for this gate: ${routeSet.problem}`);
      }
      // **`FD-V41`'s WIRING half** — every route of the gate's RESOLVED set is wired by EXACTLY ONE edge, an edge
      // with no `route` carrying the set's DEFAULT route (never *every* route: an edge with no `on` means `done`
      // only), and no edge names a route outside the set. **Only once the set resolved**: with no type, or a
      // derived type whose settings were refused, there are no routes to count — and each GATE is counted
      // against its OWN set (ADR 0092). The per-edge half — a `route` that is not a string, `when`/`on`/`needs`
      // on a gate edge, `route` on any other node's edge — is in the edge loop below, and needs no registry.
      if (routeSet !== undefined && !('problem' in routeSet) && Array.isArray(nd.edges)) {
        const gate = routeSet;
        const count = new Map<string, number>(gate.routes.map((r) => [r, 0]));
        (nd.edges as unknown[]).forEach((e, i) => {
          if (e === null || typeof e !== 'object') return;          // FD-V21's
          const r = (e as Record<string, unknown>).route;
          if (r !== undefined && typeof r !== 'string') return;     // the edge loop's
          const route = r === undefined ? gate.defaultRoute : r;
          if (!count.has(route)) {
            add('FD-V41', `${where}#edge${i}`, `route "${route}" is not one of this gate's routes — the routes gate type "${typeName}" declares for it are ${gate.routes.map((x) => `"${x}"`).join(', ')}`);
            return;
          }
          count.set(route, count.get(route)! + 1);
        });
        for (const [route, n] of count) {
          const how = route === gate.defaultRoute ? ' (the default route — an edge with no `route` carries it)' : '';
          if (n === 0) {
            add('FD-V41', where, `route "${route}"${how} of this gate (gate type "${typeName}") has no edge; every route of the gate is wired exactly once — a drop is an edge to an \`end\` node, because a route left unwired would be dropped in silence the day the type grows one`);
          } else if (n > 1) {
            add('FD-V41', where, `route "${route}"${how} of this gate (gate type "${typeName}") is wired by ${n} edges; exactly one`);
          }
        }
      }
    }
    // ---- an ASK's own two keys: `settings` (`FD-V21`) and `answerSchema` (`FD-V48`) — v0.42, W179 ----
    // `settings` is OPAQUE: the library never reads it, so its whole check is its SHAPE, a plain object — a
    // declared key of the wrong type, which is `FD-V21`'s sentence; there is no type and no schema to ask, so
    // neither `FD-V33` (a node TYPE's worker) nor `FD-V40` (a gate TYPE's) is the rule. `answerSchema` is held to the
    // schema SUBSET at load by the same function a worker's schemas are (`schemaProblem`, ADR 0053) — its own id
    // because the fix is in the schema, and an `examples` it declares is held to it too (ADR 0056).
    if (nd.kind === 'ask') {
      const s = nd.settings;
      if (s !== undefined && (typeof s !== 'object' || s === null || Array.isArray(s))) {
        add('FD-V21', where, `ask settings must be a plain object, got ${describeValue(s)}`);
      }
      if (nd.answerSchema !== undefined) {
        const problem = schemaProblem(nd.answerSchema);
        if (problem !== null) add('FD-V48', where, `answerSchema is not in the built-in schema subset — ${problem}`);
      }
    }
    if (nd.kind === 'end') {
      if (nd.edges !== undefined) add('FD-V8', where, 'end node has edges');
      // Both rules apply and section 5 names both: FD-V8 owns "absent or empty",
      // FD-V21 explicitly enumerates "`outcome` not a string".
      if (nd.outcome !== undefined && typeof nd.outcome !== 'string') {
        add('FD-V21', where, 'end node outcome must be a string');
      }
      if (typeof nd.outcome !== 'string' || nd.outcome.length === 0) {
        add('FD-V8', where, 'end node outcome is absent or empty');
      }
    }
    if (nd.kind === 'fanout') {
      if (nd.edges !== undefined) add('FD-V9', where, 'fanout has edges');
      if (nd.branches !== undefined && !Array.isArray(nd.branches)) {
        add('FD-V21', where, 'fanout branches must be an array');
      }
    }
    // ---- FD-V25: the map's own rule, and FD-V9 is untouched ----
    // `spec/flow-definition.md` v0.8 and ADR 0036. Two separate ids rather than one
    // rule with clauses that apply to one kind each: `FD-V9`'s arity floor and its
    // repeated-entry clause are statements about a DOCUMENT that declares its
    // branches, and a map's arity is not in the document at all.
    if (nd.kind === 'map') {
      if (nd.edges !== undefined) add('FD-V25', where, 'map has edges');
      if (nd.branch !== undefined && typeof nd.branch !== 'string') {
        // FD-V21 owns "wrong type"; the graph builder filters a non-string `branch`
        // out before FD-V2 could see it, exactly as it does for a non-string
        // `edge.to`, so without this a map with `branch: 5` reaches the driver with
        // no arc and **no finding that names the cause**.
        //
        // **The comment here used to say "no diagnostic", and that overclaimed** —
        // W32's adequacy reader measured it: `FD-V11` and `FD-V20` still fire on
        // such a document, so what this guard adds is the DIAGNOSIS, not every
        // diagnostic. `test/definition/map.test.ts` asserts the finding and that
        // `succ` contributes no arc.
        //
        // **The two type checks in this block are attributed to different rules and
        // that is deliberate** — W32's conformity reader asked. `over: 42` reports
        // `FD-V25` alone, because `FD-V25`'s text is *"its `over` is not **a
        // string** matching …"* and so owns the type half; `branch: 5` reports
        // `FD-V21` alone, because `FD-V25`'s branch clause is about a **kind** and
        // a non-string names no node to have one. Both readings have precedent
        // here: `workerType` reports `FD-V21`, `flowId` reports only `FD-V16`.
        add('FD-V21', where, `map branch must be a string, got ${JSON.stringify(nd.branch)}`);
      }
      if (nd.over !== undefined && (typeof nd.over !== 'string' || !ID_RE.test(nd.over))) {
        add('FD-V25', where, `map over ${JSON.stringify(nd.over)} is not [A-Za-z0-9_-]{1,64}`);
      }
    }
    // ---- FD-V26: `needs`' own shape ----
    // `spec/flow-definition.md` section 3, v0.11, and ADR 0040.
    //
    // **The *"only on a `task`, a `map` or (v0.42) an `ask`"* clause is NOT here, and that is a
    // measurement rather than an omission**: `needs` is absent from the other four
    // kinds' `opt` lists, so `FD-V17`'s undeclared-key clause thirty lines up
    // already refuses it and names the kind. A second rule saying the same thing
    // would be one `FD-V17` could never disagree with, which is `FD-V19`'s own
    // twice-earned warning about writing a refusal against a set something else
    // already computes.
    if (nd.needs !== undefined) {
      const nv = nd.needs;
      if (typeof nv !== 'object' || nv === null || Array.isArray(nv)) {
        add('FD-V26', where, `needs must be an object, got ${JSON.stringify(nv)}`);
      } else if (Object.keys(nv).length === 0) {
        // A node declaring `needs: {}` receives `{}` — every input silently
        // discarded, with the document reading as though it asked for something.
        // `FD-V23`'s own argument for `version`.
        add('FD-V26', where, 'needs is empty; a node that declares one receives exactly what it names');
      } else {
        for (const [k, ref] of Object.entries(nv as Record<string, unknown>)) {
          if (!ID_RE.test(k)) add('FD-V26', where, `needs key ${JSON.stringify(k)} is not [A-Za-z0-9_-]{1,64}`);
          const target = referenceTarget(ref);
          // **The `$` clauses first, v0.44** (P38 (g)): a `$` spelling that is not a reference is told its fix —
          // `["$payload"]` the bare form, `"$payload?"` without the suffix, anything else the two references there are.
          const dollar = target === null ? dollarProblem(ref) : null;
          if (dollar !== null) {
            add('FD-V26', where, `needs[${JSON.stringify(k)}]: ${dollar}`);
          } else if (target === null) {
            add('FD-V26', where, `needs[${JSON.stringify(k)}] is ${JSON.stringify(ref)}, which is not "." , "$payload", "$item", a node id with an optional "?" suffix, or a one-element array holding one`);
          }
        }
      }
    }

    if (nd.edges !== undefined && !Array.isArray(nd.edges)) {
      add('FD-V21', where, 'edges must be an array');
      continue;
    }

    // ---- per edge: FD-V23, FD-V17, FD-V18, FD-V4 ----
    const edges: Edge[] = Array.isArray(nd.edges) ? (nd.edges as Edge[]) : [];
    edges.forEach((e, i) => {
      const at = `${where}#edge${i}`;
      if (e === null || typeof e !== 'object') {
        add('FD-V21', at, `edge is ${JSON.stringify(e)}, which is not an edge object`);
        return;
      }
      const ed = e as unknown as Record<string, unknown>;
      if (ed?.to === undefined) add('FD-V23', at, 'edge is missing required key "to"');
      else if (typeof ed.to !== 'string') {
        // Without this the graph builder filters the non-string target out before
        // FD-V2 can see it, the driver reaches `byId.get(5) === undefined`, and the
        // run ends with no error and no `end` node — the silent stop section 3
        // refuses on P1's own validity grounds.
        add('FD-V21', at, `edge.to must be a string, got ${JSON.stringify(ed.to)}`);
      }
      for (const k of Object.keys(ed ?? {})) {
        if (!EDGE_KEYS.req.includes(k) && !EDGE_KEYS.opt.includes(k)) {
          add('FD-V17', at, `edge carries undeclared key "${k}"`);
        }
      }
      if (ed?.on !== undefined) {
        const on = ed.on;
        const ok =
          Array.isArray(on) &&
          on.length > 0 &&
          on.every((x) => (ROUTABLE as readonly unknown[]).includes(x)) &&
          new Set(on).size === on.length;
        if (!ok) {
          add('FD-V18', at, `on must be a non-empty array of distinct "done"/"failed", got ${JSON.stringify(on)}`);
        }
      }
      // ---- the `when`: its SHAPE (`FD-V42`-`FD-V45`) and, for the name form alone, its REGISTRY
      // lookup (`FD-V4`) — v0.27, W108, ADR 0074.
      //
      // **`FD-V4` keeps its id and its sentence and only the SPELLING moved**: it has refused *an
      // edge's `when` names a predicate absent from the registry* since P1, and a name is now written
      // `{ "predicate": "x" }`. The shape is asked FIRST and the lookup only where the shape held, on
      // `FD-V36`'s precedent (an unknown language has no compiler to ask): an object that is not a
      // predicate at all has no name to look up, and reporting both would make `FD-V42`'s fixture
      // name two rules.
      if (ed?.when !== undefined) {
        const problem = predicateProblem(ed.when);
        if (problem) add(problem.rule, at, problem.message);
        else for (const name of predicateNamesIn(ed.when)) {
          if (!preds.has(name)) add('FD-V4', at, `when names "${name}", which is not a registered predicate`);
        }
      }
      // ---- FD-V41's per-edge half: the `route` key, owned everywhere (v0.23, W92) ----
      // On `FD-V26`'s precedent for `needs`: one rule owns the key's whole shape on every edge. A `route` off a
      // gate is a key read by nothing — a task's edges select by `on` and `when` — so it is refused rather
      // than carried; on a gate it is a string or absent; and a gate's edge carries `to` and `route` and
      // NOTHING else, `FD-V7`'s precedent for a join's edge: a gate has no terminal state for `on` to select,
      // runs no predicate for `when` to name, and hands on what reached it, so an edge `needs` has no reader.
      if (nd.kind === 'gate') {
        if (ed?.route !== undefined && typeof ed.route !== 'string') {
          add('FD-V41', at, `route must be a string naming one of the gate type's routes, got ${JSON.stringify(ed.route)}`);
        }
        for (const k of ['when', 'on', 'needs']) {
          if (ed?.[k] !== undefined) {
            add('FD-V41', at, `a gate's edge carries "${k}"; it carries \`to\` and \`route\` and nothing else — a gate routes by the route its TYPE returns, never by a predicate, a terminal state or a composed value`);
          }
        }
      } else if (ed?.route !== undefined) {
        add('FD-V41', at, `edge carries "route", which only a gate's edge declares — a ${String(nd.kind)} edge selects by \`on\` and \`when\`, and a route here would be read by nothing`);
      }
      // ---- FD-V26 on an EDGE, and the one clause a node's does not have ----
      // `spec/flow-definition.md` section 3, v0.12, and ADR 0041. The grammar is the
      // same, and `"."` is REFUSED: *what this predicate would have received anyway*
      // is `ctx.outcome`, which it already has, so the token has nothing to name.
      // **It is the same rule id rather than a new one** because it is the same
      // grammar with one form removed, and an author fixing it reads the same row.
      if (ed?.needs !== undefined) {
        const nv = ed.needs;
        if (typeof nv !== 'object' || nv === null || Array.isArray(nv)) {
          add('FD-V26', at, `edge needs must be an object, got ${JSON.stringify(nv)}`);
        } else if (Object.keys(nv).length === 0) {
          add('FD-V26', at, 'edge needs is empty; an edge that declares one names at least one thing');
        } else {
          for (const [k, ref] of Object.entries(nv as Record<string, unknown>)) {
            if (!ID_RE.test(k)) add('FD-V26', at, `edge needs key ${JSON.stringify(k)} is not [A-Za-z0-9_-]{1,64}`);
            const target = referenceTarget(ref);
            const dollar = target === null ? dollarProblem(ref) : null;
            if (dollar !== null) {
              add('FD-V26', at, `edge needs[${JSON.stringify(k)}]: ${dollar}`);
            } else if (target === null) {
              add('FD-V26', at, `edge needs[${JSON.stringify(k)}] is ${JSON.stringify(ref)}, which is not "$payload", "$item", a node id with an optional "?" suffix or a one-element array holding one`);
            } else if (target.form === 'self') {
              // **On `form`, never on `node === null`** (P38 fact 9): `"$payload"` and `"$item"` have no node either, and
              // an edge MAY name them — a predicate has no `ctx.payload` and no `ctx.item` (decision 3). Read as
              // `node === null` this clause refused them with a message about `ctx.outcome`.
              add('FD-V26', at, `edge needs[${JSON.stringify(k)}] is ".", which an EDGE may not use: what a predicate would have received anyway is its node's own outcome, and \`ctx.outcome\` already carries it`);
            }
          }
        }
      }
    });
  }

  // ---- FD-V1: duplicate ids ----
  const ids = nodes.map((n) => (n as { id?: unknown } | null)?.id).filter((x): x is string => typeof x === 'string');
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  for (const id of new Set(dupes)) add('FD-V1', id, 'two nodes share this id');

  const g = buildGraph(doc);
  const kindOf = (id: string) => g.byId.get(id)?.kind;

  // ---- FD-V2: dangling references ----
  for (const n of nodes) {
    if (typeof n?.id !== 'string') continue;
    for (const t of g.succ(n.id)) {
      if (!g.byId.has(t)) add('FD-V2', n.id, `references node "${t}", which does not exist`);
    }
    if (n.kind === 'join' && typeof n.of === 'string' && !g.byId.has(n.of)) {
      // FD-V2 owns "names a node that does not exist"; FD-V6 owns "does not name a
      // fanout", and a node that does not exist is not a fanout. Both are reported.
      add('FD-V2', n.id, `join.of names "${n.of}", which does not exist`);
      add('FD-V6', n.id, `join.of names "${n.of}", which is not a fanout`);
    }
  }

  // ---- FD-V3: entry ----
  if (typeof doc?.entry !== 'string' || !g.byId.has(doc.entry)) {
    if (doc?.entry !== undefined) add('FD-V3', null, `entry "${String(doc?.entry)}" does not exist`);
  } else if (kindOf(doc.entry) === 'join' || kindOf(doc.entry) === 'end') {
    add('FD-V3', doc.entry, `entry names a ${kindOf(doc.entry)} node`);
  }

  // ---- FD-V6: pairing ----
  const fanouts = nodes.filter((n) => n?.kind === 'fanout');
  const maps = nodes.filter((n) => n?.kind === 'map');
  // **A region opener is a `fanout` or a `map`** — spec section 4, v0.8. Everything
  // downstream is about a region and does not care which opened it, so this is the
  // one place the two are unioned.
  const openers = [...fanouts, ...maps];
  const joins = nodes.filter((n) => n?.kind === 'join');
  for (const j of joins) {
    if (typeof j.of === 'string' && g.byId.has(j.of) && kindOf(j.of) !== 'fanout' && kindOf(j.of) !== 'map') {
      add('FD-V6', j.id, `join.of names a ${kindOf(j.of)}, not a fanout or map`);
    }
  }
  for (const opener of openers) {
    const mine = joins.filter((j) => j.of === opener.id);
    if (mine.length !== 1) {
      add('FD-V6', opener.id, `${mine.length} joins name this ${opener.kind}, expected exactly 1`);
    }
  }

  // ---- FD-V7: edges ----
  // **A `task`'s clauses and, since v0.42, an `ask`'s** (W179): an ask routes as a task's settlement does — `on`
  // and `when`, a `failed` answer being the person declining (P35 (h)) — so it needs the same done edge and the
  // same default per terminal state, and the message names which of the two it is.
  for (const n of nodes) {
    if (typeof n?.id !== 'string') continue;
    if (n.kind === 'task' || n.kind === 'ask') {
      // Malformed entries were already reported as FD-V21 above; dropping them here
      // keeps FD-V7 a statement about the edges that exist rather than a crash.
      const edges: Edge[] = (Array.isArray(n.edges) ? n.edges : []).filter(
        (e): e is Edge => e !== null && typeof e === 'object',
      );
      if (edges.length === 0) {
        add('FD-V7', n.id, `${n.kind} node has no edges`);
        continue;
      }
      const onOf = (e: Edge | null | undefined) =>
        (Array.isArray(e?.on) && e.on.length ? e.on : (['done'] as const));
      const states = new Set<string>();
      for (const e of edges) for (const s of onOf(e)) states.add(s as string);
      if (!states.has('done')) add('FD-V7', n.id, `no edge of this ${n.kind} node is eligible for "done"`);
      for (const t of states) {
        const eligible = edges.filter((e) => (onOf(e) as readonly string[]).includes(t));
        const bare = eligible.filter((e) => e.when === undefined);
        if (bare.length === 0) add('FD-V7', n.id, `no default (no-\`when\`) edge eligible for "${t}"`);
        else if (bare.length > 1) add('FD-V7', n.id, `${bare.length} default edges eligible for "${t}"`);
        else if (eligible[eligible.length - 1] !== bare[0]) {
          add('FD-V7', n.id, `the default edge for "${t}" is not last among its eligible edges`);
        }
      }
    }
    if (n.kind === 'join') {
      const edges: Edge[] = Array.isArray(n.edges) ? n.edges : [];
      if (edges.length !== 1) add('FD-V7', n.id, `join node has ${edges.length} edges, expected exactly 1`);
      else if (edges[0]!.when !== undefined || edges[0]!.on !== undefined) {
        add('FD-V7', n.id, 'a join node edge may carry neither `when` nor `on`');
      }
    }
  }

  // ---- FD-V25: a map's branch entry is a task — or, since v0.42, an ask ----
  // Beside FD-V9's identical clause rather than with the other FD-V25 clauses,
  // because both need `kindOf` and therefore the graph. Requiring a `task` here is
  // what keeps map-inside-map expressible only through that task's edges — the same
  // road nesting a fanout already takes.
  //
  // **[Q156](../../doc/questions/q156.md) is DECIDED and this rule did not move for it**
  // ([ADR 0062](../../doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md),
  // [W84](../../doc/work-items/w84-what-a-regions-identity-is.md)): a map's branch may reach a region and
  // the driver RUNS it. *(This read "so P10's `not taken` stays not taken rather than being decided in
  // either direction" — true when it was written and false since W84. The rule is unchanged either way,
  // which is what that sentence was really about.)*
  // **`ask` since v0.42 (W179)**: an ask is allowed wherever a task is (P35 (a)) — one per item, each its own
  // task id — and it keeps the map-inside-map road the same way, through its own edges.
  for (const m of maps) {
    if (typeof m.branch === 'string' && g.byId.has(m.branch) && kindOf(m.branch) !== 'task' && kindOf(m.branch) !== 'ask') {
      add('FD-V25', m.id, `branch "${m.branch}" is a ${kindOf(m.branch)}, not a task or an ask`);
    }
  }

  // ---- FD-V9: fanout ----
  for (const fan of fanouts) {
    const b: string[] = Array.isArray(fan.branches) ? fan.branches : [];
    if (b.length < 2) add('FD-V9', fan.id, `fanout has ${b.length} branches, needs at least 2`);
    if (new Set(b).size !== b.length) add('FD-V9', fan.id, 'fanout repeats a branch entry');
    // `ask` since v0.42 (W179) — allowed wherever a task is, `FD-V25`'s widening one rule over.
    for (const x of b) {
      if (g.byId.has(x) && kindOf(x) !== 'task' && kindOf(x) !== 'ask') {
        add('FD-V9', fan.id, `branch entry "${x}" is a ${kindOf(x)}, not a task or an ask`);
      }
    }
  }

  // ---- FD-V10: acyclic ----
  const colour = new Map<string, number>();
  let cyclic = false;
  const walk = (id: string): boolean => {
    if (colour.get(id) === 2) return false;
    if (colour.get(id) === 1) return true;
    colour.set(id, 1);
    for (const t of g.succ(id)) if (g.byId.has(t) && walk(t)) return true;
    colour.set(id, 2);
    return false;
  };
  for (const id of g.byId.keys()) {
    if (walk(id)) { cyclic = true; break; }
  }
  if (cyclic) add('FD-V10', null, 'the graph contains a cycle');

  // ---- FD-V11: reachability. Skipped when entry is unresolvable — FD-V3 owns that.
  // NOT skipped when the graph is cyclic: reachability holds independently of
  // FD-V10, `reachFrom` is iterative with a seen set so a cycle cannot hang it,
  // and suppressing it hid a violation the spec says is present. ----
  if (typeof doc?.entry === 'string' && g.byId.has(doc.entry)) {
    const seen = new Set([doc.entry, ...Array.from(reachFrom(g, doc.entry))]);
    for (const id of g.byId.keys()) {
      if (!seen.has(id)) add('FD-V11', id, 'node is not reachable from entry');
    }
  }

  // ---- the region family: FD-V12, FD-V13, FD-V19, FD-V20, FD-V22 ----
  //
  // **`FD-V15` was here and is retired** — `spec/flow-definition.md` v0.7. It
  // refused any `fanout` inside another fanout's region, and it was the only
  // finding the nested example produced: with it set aside, `FD-V13`, `FD-V19`
  // and `FD-V22` all accept
  // `spec/examples/valid/nested-fanout.flow.json`, measured before the rule was
  // retired. **The id is retired rather than reused**, as `FD-V14` is absent.
  //
  // `FD-V19` and `FD-V22` are what nesting now RESTS on rather than what it had
  // to get past: they keep an inner region wholly inside one outer branch, which
  // is what makes `innermostRegionOf` unique and `branchPath` derivable.
  // Guarded on acyclicity deliberately, unlike FD-V11 above: `region(F)` is not
  // meaningful on a cyclic graph, so these would be noise rather than findings.
  if (!cyclic) {
    for (const r of allRegions(g, doc)) {
      for (const b of r.branches) {
        // `r.branches` holds a map's single `branch` too (`regionSets`), so this
        // covers both openers with no second loop — `FD-V12` widened at v0.8.
        if (b === r.joinId) {
          add('FD-V12', r.fanoutId, `branch entry "${b}" is this ${r.opensWith}'s own join`);
        }
      }
      for (const id of r.members) {
        if (kindOf(id) !== 'end' && r.after.has(id)) {
          add('FD-V13', id, `node is in both region(${r.fanoutId}) and after(${r.fanoutId})`);
        }
      }
      for (let i = 0; i < r.branches.length; i++) {
        for (let k = i + 1; k < r.branches.length; k++) {
          const a = r.branchOf.get(r.branches[i]!)!;
          const bb = r.branchOf.get(r.branches[k]!)!;
          for (const id of a) {
            if (bb.has(id) && kindOf(id) !== 'end') {
              add('FD-V19', id, `node is in two branches of fanout "${r.fanoutId}"`);
            }
          }
        }
      }
      for (const n of nodes) {
        if (typeof n?.id !== 'string') continue;
        if (r.members.has(n.id) || n.id === r.fanoutId) continue;
        for (const t of g.succ(n.id)) {
          if (t === r.joinId) {
            add('FD-V20', n.id, `node outside region(${r.fanoutId}) has an arc to its join`);
          }
          if (r.members.has(t) && kindOf(t) !== 'end') {
            add('FD-V22', t, `node in region(${r.fanoutId}) is entered from "${n.id}", outside it`);
          }
        }
      }
    }
  }

  // ---- FD-V27 and FD-V28: where a `needs` reference POINTS ----
  //
  // `spec/flow-definition.md` section 3, v0.11, and ADR 0040. `FD-V26` above says
  // a reference is well FORMED; these two say it is well AIMED, and they are two
  // ids rather than one because they fail for different reasons and an author fixes
  // them differently: `FD-V27` is *that node cannot have produced anything for you*
  // and `FD-V28` is *it produced a different NUMBER of things than you asked for*.
  //
  // **Both are skipped on a cyclic graph**, exactly as the region family above is
  // and for the same reason: `region(F)` and reachability-order are not meaningful
  // there, so these would be noise rather than findings.
  if (!cyclic) {
    const regions = allRegions(g, doc);
    // **`FD-V29`'s input, computed once** — `certainlySettled` is a fixpoint over
    // the whole graph and every reference in the document reads the same answer.
    const certain = certainlySettled(g, doc);
    for (const n of nodes) {
      // `nodes` may hold `null`, a number or a string — `FD-V21` reported that
      // above and the loop must survive it. Without this guard a malformed
      // document THROWS out of the validator, which `spec/flow-definition.md`
      // section 5's *"reported, never thrown"* refuses and two L1 cases assert.
      if (typeof n !== 'object' || n === null || typeof n.id !== 'string') continue;
      // **Both SITES, in one loop** — W42. A `needs` on the node says what its WORKER
      // receives and a `needs` on an edge says what that edge's PREDICATE sees, and
      // `FD-V27` and `FD-V28` are the same two questions of both: *can that node have
      // produced anything for you*, and *did it produce the NUMBER of things you asked
      // for*. The reader is the same node in both cases — an edge has no path of its
      // own — so nothing below distinguishes them except the message.
      for (const [k, ref, site, at] of aimedReferences(n)) {
        const t = referenceTarget(ref);
        if (t === null) continue; // FD-V26's
        // **The node-less forms, BY NAME** (P38 fact 7): `"."`, `"$payload"` and `"$item"` name no node, so there is
        // nothing for `FD-V27`-`FD-V29` to aim — *always there*, no `?`, nothing like `FD-V29` (the app's ask). Named
        // rather than read off `node === null`, so a fourth node-less form is a compile error here and not a silent skip.
        // **`"$item"` has an aim of its own, `FD-V49`** (v0.45, P38 (g)): the READER must be inside a map instance —
        // the innermost map region containing it as a member, P38 (c) — or there is no item to name. The same
        // `regions` this block computed once, read by the walk the driver and the wiring check read (`innermostMapOf`).
        if (t.form === 'item') {
          if (innermostMapOf(regions, n.id) === undefined) add('FD-V49', at, itemOutside(site, k, n.id));
          continue;
        }
        if (t.form === 'self' || t.form === 'payload') continue;
        const target = t.node;
        if (!g.byId.has(target)) {
          add('FD-V27', at, `${site}[${JSON.stringify(k)}] names "${target}", which is not a node`);
          continue;
        }
        if (kindOf(target) !== 'task' && kindOf(target) !== 'ask') {
          // **Only a task — and, since v0.42, an ask — produces an output** — section 2's own sentence.
          // A reference to a `fanout`, `map`, `join`, `end` or — v0.23 — `gate` names something that has no
          // result to give, at any branch path; an ASK's output is the person's answer (P35 (a), W179).
          add('FD-V27', at, `${site}[${JSON.stringify(k)}] names "${target}", a ${kindOf(target)}; only a task or an ask produces an output`);
          continue;
        }
        // **`target === n.id` was here and is DELETED, on a measurement.** Rule 8
        // graded that clause a SURVIVOR: dropping it alone costs 0, because
        // `reachFrom` seeds `seen` from `succ(start)` rather than from `start`, and
        // this block is guarded on `!cyclic`, so on an acyclic graph a node is never
        // in its own reach set and the disjunct can never be the clause that fires.
        // *A guard with no reachable effect is not defence in depth; it is a reader
        // being told something is checked here when the answer is fixed* — the map
        // arm's own sentence in `src/driver/driver.ts`, applied to a validator.
        if (!reachFrom(g, target).has(n.id)) {
          // The declaring node must be DOWNSTREAM of what it names. A reference
          // pointing sideways or backwards names a node that may not have run,
          // and `FD-R3` would be the only thing to say so — at run time, on the
          // one workload that takes that branch, which is ADR 0002 rule 3's own
          // argument for validating at instantiation.
          add('FD-V27', at, `${site}[${JSON.stringify(k)}] names "${target}", which this node is not reachable from`);
          continue;
        }
        // **`FD-V29` — an UNCONDITIONAL reference names a node that must have run**,
        // and it is `FD-V27`'s missing half rather than a clause of it:
        // [Q187](../../doc/questions/q187.md), decided as
        // [ADR 0042](../../doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md).
        //
        // **Its own id, on `FD-V28`'s own stated precedent** — *because an author
        // fixes the two differently.* `FD-V27` is *that node cannot have produced
        // anything for you* and the fix is to re-point the reference; this is *it
        // MIGHT not have* and the fix is to write `?`. A message that offered both
        // would name neither.
        //
        // **Not dominance** — see `certainlySettled`, which is where the two kinds
        // of branching are read apart, and where the 22-of-29 measurement lives.
        // **A conditional reference is exempt by construction**, which is the whole
        // of what the suffix buys: `FD-R3` then does not fire and the key is simply
        // absent.
        // **`certain.size > 0` first, and it is the entry-validity guard `!cyclic`'s
        // argument asks for** — W45's adequacy reader. `certainlySettled` returns an
        // EMPTY map when `entry` names nothing, and `?? false` then read *not
        // certain* for every node: the validator reported `FD-V29` about a document
        // with no entry node at all, beside `FD-V3`, saying *"a run can reach this
        // node without X having run"* of a document no run can enter. `FD-V27` and
        // `FD-V28` do not depend on `entry` and degrade gracefully; this rule is the
        // only entry-rooted one, so it is the only one that needed saying.
        if (!t.conditional && certain.size > 0 && !(certain.get(n.id)?.has(target) ?? false)) {
          add(
            'FD-V29',
            at,
            `${site}[${JSON.stringify(k)}] names "${target}" unconditionally, and a run can reach ` +
              `this node without "${target}" having run — a decision routes around it, or it is ` +
              'inside a region whose branch may be lost before it is entered. `FD-V27` checked that ' +
              `this node is reachable FROM it, which is weaker. Write "${target}?"` +
              `${t.form === 'all' ? ' inside the array' : ''} if you mean *if it ran*, and read the ` +
              `key as ${t.form === 'all' ? 'a possibly-empty array' : 'possibly absent'}; otherwise ` +
              'move the reference to a node every path reaches',
          );
          // No `continue`: `FD-V28`'s question — *how many* — is independent of this
          // one, and an author with a wrong form AND an uncertain target has two
          // things to fix. Reporting one would hide the other until the first was
          // fixed, which section 5's *reports EVERY violation* refuses.
        }
        // **`FD-V28` — the FORM must match the graph**, and the graph is what
        // decides it: the named node produces more than one output for this reader
        // exactly when the reader is outside a **`map`** region the named node is in.
        //
        // **`r.opensWith === 'map'` is load-bearing and the first version omitted
        // it**, which W41's conformity reader caught: with a bare `r.members.has`,
        // `publish` outside `region(split)` naming `scoreA` was refused with
        // *"produces one output per branch; write `["scoreA"]`"* — while `scoreA`
        // produces **exactly one**, and the author was forced to write a list and
        // index `[0]` out of it. `FD-V19` refuses a non-`end` node in two branch
        // entries of one fanout, so a `fanout` region gives every node **one**
        // output; only a `map` region enters its branch once per item.
        //
        // **That is `FD-C2`'s own measurement, and the rule was written against a
        // set that contradicted it.** `spec/examples/valid`'s region-bearing flows
        // — **six when this was written and THIRTEEN now**, found by W84's conformity
        // reader — gave (node id, branchPath) pairs distinct 4/4, 4/4, 5/5, 6/6, 4/4
        // and 7/7, and the node ids collapse in **exactly** those with a map
        // region and in none with only `fanout`s. Same document, nine lines
        // apart, and the code followed the wrong half.
        const many = regions.some((r) => r.opensWith === 'map' && r.members.has(target) && !r.members.has(n.id));
        if (many && t.form === 'one') {
          add('FD-V28', at, `${site}[${JSON.stringify(k)}] names "${target}" as one value, but it is inside a map region this node is outside of, so it produces one output per ITEM; write ["${target}"]`);
        } else if (!many && t.form === 'all') {
          add('FD-V28', at, `${site}[${JSON.stringify(k)}] names ["${target}"] as a list, but it produces exactly one output on this node's branch path; write "${target}"`);
        }
      }
    }
  }

  return f;
}

function reachFrom(g: ReturnType<typeof buildGraph>, start: string): Set<string> {
  const seen = new Set<string>();
  const stack = [...g.succ(start)];
  while (stack.length) {
    const x = stack.pop() as string;
    if (!g.byId.has(x) || seen.has(x)) continue;
    seen.add(x);
    stack.push(...g.succ(x));
  }
  return seen;
}

/** Convenience: the rule ids violated, deduplicated and sorted. */
export function violatedRules(findings: Finding[]): string[] {
  return [...new Set(findings.map((x) => x.rule))].sort();
}
