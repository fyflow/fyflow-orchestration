/**
 * **The registry DOCUMENT, resolved: every construction-time refusal by name, and a node type as a
 * DERIVATION from an instance's config to pool options** —
 * `spec/flow-definition.md` section 3's registry-document subsection (v0.19),
 * [ADR 0053](../../doc/decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md),
 * [ADR 0054](../../doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md),
 * [P18](../../doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md) decisions 1-6, 9 and 12-14,
 * [W65](../../doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md).
 *
 * **This module BUILDS NOTHING.** It takes the two things a consumer supplies — a registry document
 * (data: workers, groups, node types, pool instances, predicate and language NAMES) and a `code`
 * argument (what is genuinely theirs: predicates, language adapters, custom group types, custom
 * node-type classes) — and returns a RESOLVED registry: every name looked up, every schema checked to
 * be in the subset, every config checked against its schema, every derivation RUN and its output
 * checked, every collision refused. `createRuntime` (`fyflow-orchestration/runtime`, W66) calls this
 * and then constructs groups and pools from what it returns; `new Driver` runs the same checks over
 * the registry it is handed. So a registry defect is reported where the registry is built, once,
 * naming the entry — the maintainer's *must be present in the registry* (decision 1).
 *
 * **A node type is a DERIVATION** (decision 2): `pool(config, key) → PoolSpec`. The DOCUMENT form is
 * the identity derivation — `nodeTypeFromDeclaration` — which merges an instance's config over the
 * declared one and copies the declared pool fields and groups; a CLASS registered in `code` is any
 * other. Both outputs pass through the same checks (`poolSpecProblem`, then the worker's
 * `configSchema` over the derived `config`), so a class cannot compute around a check. **Every type
 * has a DEFAULT instance, keyed by the type's name and built from the type's own `config`**; a type
 * whose own config fails its schema has no valid default and is refused here naming the type. A
 * named instance in `pools` is the same derivation over its own config.
 *
 * **The identity derivation reproduces what the bootstrap helper hands `WorkerManager` today,
 * option for option** (P18 fact 5, prediction 2): a `groups` key is ABSENT when the type declares
 * none rather than present and empty, `inline` is absent when the declaration omits it, and the
 * envelope pool config is `{ worker, config }` with `languages` only where a flow needs one. What
 * `poolOptionsOf` cannot reproduce is the KEY ORDER of today's object literal, because an options bag
 * has no order the scheduler reads — it destructures by name — so the comparison in
 * `test/definition/registry.test.ts` is over canonical JSON (keys sorted at every level), and this
 * sentence is where that is stated.
 */
import type { WorkerManagerOptions } from 'fyflow-scheduler';
import type {
  GroupInstance, GroupType, LanguageAdapter, Languages, NodeTypeDeclaration, NodeTypeDefinition, NodeTypeEntry,
  PoolInstance, PoolSpec, RegistryCode, RegistryDocument, ResolvedGroup, ResolvedPool, ResolvedRegistry, WorkerEntry,
} from './types.ts';
import { describeFindings, findings, schemaProblem, type JsonSchema } from './schema.ts';
import { languagesOf, nodeTypesOf, poolsOf, retryPolicyProblem, workersOf } from './validate.ts';
import type { NodeTypes, Pools, Workers } from './types.ts';

// ---- the refusals, each a named class ------------------------------------------------------------

/**
 * **A registry that cannot be resolved, and why** — the base of every construction-time refusal
 * below. `at` names the entry: a worker, a type, a pool, a group or a top-level key. Thrown, never
 * returned as a finding: a registry defect is not a document defect, and the fix is in a different
 * file from the one `FD-V*` names.
 */
export class RegistryError extends Error {
  readonly at: string;
  constructor(at: string, message: string) {
    super(message);
    this.name = new.target.name;
    this.at = at;
  }
}
/** A node type's `worker` names no entry in `workers`, or the entry has no `url`. */
export class WorkerMissing extends RegistryError {}
/** A pool instance's `type` names no node type. */
export class PoolTypeMissing extends RegistryError {}
/** A named pool instance's config fails its type's `configSchema`, or its DERIVED config fails the worker's. */
export class ConfigRefused extends RegistryError {}
/** A type's OWN config — its default instance's — fails its own `configSchema` or, derived, the worker's; the type has no valid default. */
export class TypeDefaultRefused extends RegistryError {}
/** A group's `type` names no group type — none of the three built-ins, none registered in `code`. */
export class GroupTypeMissing extends RegistryError {}
/** A group's config fails its group type's `configSchema`. */
export class GroupConfigRefused extends RegistryError {}
/** One name, two definitions: a node type in the document AND in `code`, a pool named as a type, a group type named as a built-in. */
export class NameCollision extends RegistryError {}
/** A declared schema is outside the subset, or malformed — Q278, ADR 0053. */
export class SchemaRefused extends RegistryError {}
/** An entry of the document carries a key its kind does not declare — the silent typo, refused. */
export class UndeclaredKey extends RegistryError {}
/** A predicate or language the document NAMES that `code` did not supply, or a group a type names that the document lacks. */
export class NameMissing extends RegistryError {}
/** A derivation returned something that is not a `PoolSpec`, threw, or produced a pool the runtime refuses (a resident group beside `idleTimeout: 0`). */
export class DerivationRefused extends RegistryError {}

// ---- the built-in group types, as DATA -----------------------------------------------------------

/**
 * **The three group types the runtime ships, by name and by config schema** — P18 decision 4 and
 * fact 2. Their constructors differ (`ConcurrentLimitGroup(limit, id?)`, `RateLimitGroup(windows, id?)`,
 * `KeyedRateLimitGroup(windows, options?)`), so each has a factory; the FACTORIES construct scheduler
 * objects and live in the runtime sub-path (W66). What this module needs of them is the NAME — a
 * custom group type colliding with one is refused — and the SCHEMA its config is checked against, and
 * both are data. `RateWindow` is `{ limit, windowMs }` verbatim from the scheduler's `.d.ts`.
 */
export const BUILT_IN_GROUP_TYPES: Readonly<Record<string, { readonly configSchema: JsonSchema }>> = {
  ConcurrentLimitGroup: { configSchema: { type: 'object', required: ['limit'], properties: { limit: { type: 'integer', minimum: 1 } }, additionalProperties: false } },
  RateLimitGroup: { configSchema: { type: 'object', required: ['windows'], properties: { windows: RATE_WINDOWS() }, additionalProperties: false } },
  KeyedRateLimitGroup: { configSchema: { type: 'object', required: ['windows'], properties: { windows: RATE_WINDOWS() }, additionalProperties: false } },
};
function RATE_WINDOWS(): JsonSchema {
  return { type: 'array', minItems: 1, items: { type: 'object', required: ['limit', 'windowMs'], properties: { limit: { type: 'integer', minimum: 1 }, windowMs: { type: 'integer', minimum: 1 } }, additionalProperties: false } };
}

// ---- the declared key sets, each compared to the spec's tables by a test --------------------------

/** The registry document's top-level keys. */
export const DOCUMENT_KEYS: readonly string[] = ['workers', 'groups', 'nodeTypes', 'pools', 'predicates', 'languages'];
/** A worker entry's keys: the URL and the four schemas. */
export const WORKER_KEYS: readonly string[] = ['url', 'configSchema', 'settingsSchema', 'inputSchema', 'outputSchema'];
/** The two of a worker's four schemas this plan CHECKS; the other two are declared and carried (P19). */
export const CHECKED_WORKER_SCHEMAS: readonly string[] = ['configSchema', 'settingsSchema'];
/** A document node type's keys. */
export const NODE_TYPE_DECLARATION_KEYS: readonly string[] = ['worker', 'inline', 'config', 'pool', 'groups', 'retryPolicy', 'settings'];
/** A `PoolSpec`'s keys — what a derivation may return. */
export const POOL_SPEC_KEYS: readonly string[] = ['config', 'maxThreads', 'maxConcurrentTasks', 'idleTimeout', 'groups', 'residentGroups'];
/** A document type's `pool` field: the `PoolSpec` minus what the type states beside it. */
export const DECLARED_POOL_KEYS: readonly string[] = POOL_SPEC_KEYS.filter((k) => k !== 'config' && k !== 'groups');
/** A pool instance's and a group instance's keys. */
export const INSTANCE_KEYS: readonly string[] = ['type', 'config'];

const isPlainObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const q = (s: string) => JSON.stringify(s);

/** A document entry may carry only its declared keys — a typo in a registry is the silent kind. */
function noUndeclared(kind: string, at: string, v: Record<string, unknown>, keys: readonly string[]): void {
  for (const k of Object.keys(v)) {
    if (!keys.includes(k)) throw new UndeclaredKey(at, `${kind} ${q(at)} carries undeclared key ${q(k)}; it declares ${keys.join(', ')}`);
  }
}

// ---- a node type as a derivation --------------------------------------------------------------

/** A class-form entry is the one whose `pool` is a FUNCTION; a document form's `pool` is an options object or absent. */
export function isDerivation(t: NodeTypeEntry): t is NodeTypeDefinition {
  return typeof (t as { pool?: unknown }).pool === 'function';
}

/**
 * **How an instance's config combines with a document type's** — the identity derivation's whole
 * rule: two plain objects merge shallowly, the instance's keys over the type's; otherwise the
 * instance's config replaces the type's when given, and the type's stands when not. Deep merge is
 * deliberately not offered — a class is where any other rule lives.
 */
export function mergeConfig(base: unknown, over: unknown): unknown {
  if (over === undefined) return base;
  if (isPlainObject(base) && isPlainObject(over)) return { ...base, ...over };
  return over;
}

/**
 * **The document form of a node type IS the identity derivation** — decision 2: `pool(config)`
 * merges the instance's config over the declared one, and copies the declared pool fields and the
 * declared groups. Keys are copied only when declared, so an absent `groups` stays absent (fact 5).
 * The declaration's shape is checked by `resolveRegistry` before this is called; here it is trusted.
 */
export function nodeTypeFromDeclaration(decl: NodeTypeDeclaration): NodeTypeDefinition {
  const declaredPool = decl.pool ?? {};
  const def: NodeTypeDefinition = {
    worker: decl.worker,
    ...(decl.inline !== undefined ? { inline: decl.inline } : {}),
    ...(decl.config !== undefined ? { config: decl.config } : {}),
    ...(decl.retryPolicy !== undefined ? { retryPolicy: decl.retryPolicy } : {}),
    ...(decl.settings !== undefined ? { settings: decl.settings } : {}),
    pool(config: unknown, _key: string): PoolSpec {
      const merged = mergeConfig(decl.config, config);
      return {
        ...(merged !== undefined ? { config: merged } : {}),
        ...declaredPool,
        ...(decl.groups !== undefined ? { groups: [...decl.groups] } : {}),
      };
    },
  };
  return def;
}

/**
 * **Why a derivation's output is not a `PoolSpec`, or `null`** — the check BOTH forms pass through
 * (decision 2's *a class cannot compute around a check*). The scheduler coerces or ignores a wrong
 * option in silence exactly as it does a retry policy (`FD-V30`'s measurements), so the shape is
 * pinned here: numbers where numbers, a string list for `groups`, a string list or a `{ key: cost }`
 * record for `residentGroups`, and no key beside the six.
 */
export function poolSpecProblem(v: unknown): string | null {
  if (!isPlainObject(v)) return `a PoolSpec is a plain object, got ${JSON.stringify(v)}`;
  for (const k of Object.keys(v)) if (!POOL_SPEC_KEYS.includes(k)) return `PoolSpec carries undeclared key ${q(k)}; it declares ${POOL_SPEC_KEYS.join(', ')}`;
  for (const k of ['maxThreads', 'maxConcurrentTasks'] as const) {
    if (v[k] !== undefined && !(typeof v[k] === 'number' && Number.isInteger(v[k]) && (v[k] as number) >= 1)) return `PoolSpec.${k} must be an integer >= 1, got ${JSON.stringify(v[k])}`;
  }
  if (v.idleTimeout !== undefined && !(typeof v.idleTimeout === 'number' && Number.isFinite(v.idleTimeout) && v.idleTimeout >= 0)) return `PoolSpec.idleTimeout must be a finite number >= 0, got ${JSON.stringify(v.idleTimeout)}`;
  if (v.groups !== undefined) {
    if (!Array.isArray(v.groups) || v.groups.some((g) => typeof g !== 'string' || g.length === 0)) return `PoolSpec.groups must be an array of group keys, got ${JSON.stringify(v.groups)}`;
    if (new Set(v.groups).size !== v.groups.length) return 'PoolSpec.groups repeats a key';
  }
  if (v.residentGroups !== undefined) {
    const r = v.residentGroups;
    if (Array.isArray(r)) {
      if (r.some((g) => typeof g !== 'string' || g.length === 0)) return `PoolSpec.residentGroups must be an array of group keys or a { key: cost } record, got ${JSON.stringify(r)}`;
      if (new Set(r).size !== r.length) return 'PoolSpec.residentGroups repeats a key';   // the adequacy reader (P4): `groups` refused a repeat and this did not
    } else if (isPlainObject(r)) {
      for (const [k, c] of Object.entries(r)) if (!(typeof c === 'number' && Number.isFinite(c) && c > 0)) return `PoolSpec.residentGroups[${q(k)}] must be a cost > 0, got ${JSON.stringify(c)}`;
    } else return `PoolSpec.residentGroups must be an array of group keys or a { key: cost } record, got ${JSON.stringify(r)}`;
  }
  return null;
}

/** The group keys a `PoolSpec` names, from both fields — what must exist in `groups`. */
export function groupsNamedBy(spec: PoolSpec): string[] {
  const resident = spec.residentGroups === undefined ? [] : Array.isArray(spec.residentGroups) ? [...spec.residentGroups] : Object.keys(spec.residentGroups);
  return [...new Set([...(spec.groups ?? []), ...resident])];
}

/**
 * **From a derived `PoolSpec` to what ONE `WorkerManager` is constructed with** — the options bag
 * the bootstrap helper hands the scheduler today (P18 fact 5), computed rather than built: the
 * pool's own fields, `inline` where the type states it, `groups` where the spec has them, and the
 * envelope pool config `{ worker: <the worker's URL>, config: <the derived config> }` with
 * `languages` only where given. Every key is present only when there is something to say, which is
 * what keeps every existing pool config byte-identical (prediction 2). Pure: W66 is what passes the
 * result to `new WorkerManager`.
 */
export function poolOptionsOf(spec: PoolSpec, inline: boolean | undefined, workerUrl: string, languages?: Readonly<Record<string, string>>): WorkerManagerOptions {
  const { config, groups, ...rest } = spec;
  return {
    ...rest,
    ...(inline !== undefined ? { inline } : {}),
    ...(groups !== undefined ? { groups: [...groups] } : {}),
    config: { worker: workerUrl, config, ...(languages !== undefined ? { languages } : {}) },
  } as WorkerManagerOptions;
}

// ---- resolution ------------------------------------------------------------------------------

const namesOf = (x: unknown): Set<string> => {
  if (x === undefined || x === null) return new Set();
  if (x instanceof Map) return new Set([...x.keys()].map(String));
  if (x instanceof Set) return new Set([...x].map(String));
  if (Array.isArray(x)) return new Set(x.map(String));
  if (typeof x === 'object') return new Set(Object.keys(x));
  return new Set();
};

/** Check a declared schema is in the subset, naming the entry and the field it sits on. */
function checkSchema(at: string, field: string, schema: unknown): JsonSchema | undefined {
  if (schema === undefined) return undefined;
  const p = schemaProblem(schema);
  if (p !== null) throw new SchemaRefused(at, `${q(at)}.${field}: ${p}`);
  return schema as JsonSchema;
}

/**
 * **A node-type entry's own shape, both forms** — the checks a type passes BEFORE its default
 * instance is derived: the worker named, `inline` a boolean, the declared pool fields a partial
 * `PoolSpec`, `groups` strings, `retryPolicy` held to `FD-V30`'s shape naming the type (as the driver
 * has since W59), `settings` a plain object, a class's `configSchema` in the subset.
 */
function checkNodeTypeShape(name: string, t: NodeTypeEntry): void {
  const at = name;
  if (!isPlainObject(t) && typeof t !== 'object') throw new UndeclaredKey(at, `node type ${q(at)} is not an object`);
  const o = t as unknown as Record<string, unknown>;
  if (!isDerivation(t)) {
    noUndeclared('node type', at, o, NODE_TYPE_DECLARATION_KEYS);
    if (o.pool !== undefined) {
      if (!isPlainObject(o.pool)) throw new DerivationRefused(at, `node type ${q(at)}.pool must be an object of pool options, got ${JSON.stringify(o.pool)}`);
      noUndeclared('node type pool', at, o.pool, DECLARED_POOL_KEYS);
      const p = poolSpecProblem(o.pool);
      if (p !== null) throw new DerivationRefused(at, `node type ${q(at)}.pool: ${p}`);
    }
    if (o.groups !== undefined && (!Array.isArray(o.groups) || o.groups.some((g) => typeof g !== 'string'))) throw new DerivationRefused(at, `node type ${q(at)}.groups must be an array of group keys, got ${JSON.stringify(o.groups)}`);
  } else {
    checkSchema(at, 'configSchema', (t as NodeTypeDefinition).configSchema);
  }
  if (typeof o.worker !== 'string' || o.worker.length === 0) throw new WorkerMissing(at, `node type ${q(at)} names no worker — \`worker\` is a key in the registry document's \`workers\``);
  if (o.inline !== undefined && typeof o.inline !== 'boolean') throw new DerivationRefused(at, `node type ${q(at)}.inline must be a boolean, got ${JSON.stringify(o.inline)}`);
  if (o.retryPolicy !== undefined) {
    const p = retryPolicyProblem(o.retryPolicy);
    if (p !== null) throw new DerivationRefused(at, `node type ${q(at)} declares a retryPolicy that is not a RetryPolicy — FD-V30: ${p}`);
  }
  if (o.settings !== undefined && !isPlainObject(o.settings)) throw new DerivationRefused(at, `node type ${q(at)}.settings must be a plain object of defaults, got ${JSON.stringify(o.settings)}`);
}

/**
 * **One instance of a type, derived and checked** — the default instance (`key === name`, the
 * type's own config) and every named instance take this same road (decision 2's *both outputs pass
 * through the same validation*): the instance config against the type's `configSchema` (a class's;
 * a document type has none — its knobs are the fields an instance may override), the derivation RUN,
 * its output held to `PoolSpec`'s shape, the derived config against the WORKER's `configSchema`,
 * every group it names present, and decision 9's refusal — a resident group beside `idleTimeout: 0`
 * deadlocks a contended group (P18 fact 6, the scheduler reference's own sentence).
 */
export function derivePool(
  key: string, typeName: string, def: NodeTypeDefinition, worker: WorkerEntry, config: unknown,
  groupKeys: ReadonlySet<string>, refuse: new (at: string, m: string) => RegistryError,
): ResolvedPool {
  const who = key === typeName ? `node type ${q(typeName)}'s default instance` : `pool ${q(key)} (an instance of ${q(typeName)})`;
  if (def.configSchema !== undefined) {
    const fs = findings(def.configSchema, config ?? {});
    if (fs.length) throw new refuse(key, `${who}: config fails the type's configSchema — ${describeFindings(fs)}`);
  }
  let spec: PoolSpec;
  try {
    spec = def.pool(config, key);
  } catch (e) {
    throw new DerivationRefused(key, `${who}: the derivation pool() THREW: ${e instanceof Error ? e.message : String(e)}`);
  }
  const shape = poolSpecProblem(spec);
  if (shape !== null) throw new DerivationRefused(key, `${who}: the derivation returned something that is not a PoolSpec — ${shape}`);
  if (worker.configSchema !== undefined) {
    const fs = findings(worker.configSchema, spec.config ?? {});
    if (fs.length) throw new refuse(key, `${who}: the derived config fails worker ${q(def.worker)}'s configSchema — ${describeFindings(fs)}`);
  }
  for (const g of groupsNamedBy(spec)) {
    if (!groupKeys.has(g)) {
      throw new NameMissing(key, `${who}: the derived pool names group ${q(g)}, which the registry document does not declare` +
        (groupKeys.size ? ` (it declares ${[...groupKeys].sort().map(q).join(', ')})` : ' (it declares no groups)') +
        ' — a pool naming a group the scheduler lacks acquires nothing, in silence');
    }
  }
  const resident = spec.residentGroups === undefined ? 0 : Array.isArray(spec.residentGroups) ? spec.residentGroups.length : Object.keys(spec.residentGroups).length;
  if (resident > 0 && spec.idleTimeout === 0) {
    throw new DerivationRefused(key, `${who}: residentGroups beside idleTimeout: 0 — a worker that never idles never releases a resident group, and a second pool contending for it waits for ever (measured on 0.5.2, P18 fact 6); give the pool a positive idleTimeout`);
  }
  return { key, type: typeName, definition: def, worker, config, spec };
}

/**
 * **The registry's SHAPE, checked by name and building nothing — what `new Driver` runs over the
 * registry it is handed, and the first half of what `resolveRegistry` does.** Every worker's `url`
 * and its four schemas (`SchemaRefused` naming the keyword — Q278), every node type's shape in
 * either form and its worker present (`WorkerMissing`), every named pool's type present
 * (`PoolTypeMissing`) and no pool named as a type (`NameCollision`). No derivation is run here: a
 * driver dispatches to a pool KEY and never builds one, so the derived spec is the runtime's to
 * check (`derivePool`), where it constructs the pool. The `groups` a document type declares are the
 * driver's own `FD-V31` check, as at v0.17, and are not repeated here.
 */
export function checkRegistry(reg: { workers?: Workers; nodeTypes?: NodeTypes; pools?: Pools }): void {
  const workers = workersOf(reg.workers);
  for (const [name, w] of workers) {
    if (!isPlainObject(w)) throw new UndeclaredKey(name, `worker ${q(name)} is not an object`);
    // The adequacy reader (P1): a worker entry's undeclared key — `settingSchema`, a typo of
    // `settingsSchema` — was accepted here and refused by the resolver, so a hand-built Driver applied
    // no schema and every settings value passed. The same lists the resolver reads, at the driver.
    noUndeclared('worker', name, w as unknown as Record<string, unknown>, WORKER_KEYS);
    if (typeof w.url !== 'string' || w.url.length === 0) throw new WorkerMissing(name, `worker ${q(name)} has no url — the module URL of its worker class`);
    for (const f of WORKER_KEYS.slice(1)) checkSchema(name, f, (w as unknown as Record<string, unknown>)[f]);
  }
  const types = nodeTypesOf(reg.nodeTypes);
  for (const [name, t] of types) {
    checkNodeTypeShape(name, t);
    if (!workers.has(t.worker)) {
      throw new WorkerMissing(name, `node type ${q(name)} names worker ${q(t.worker)}, which the registry's workers does not declare` +
        (workers.size ? ` (it declares ${[...workers.keys()].sort().map(q).join(', ')})` : ' (it declares none)'));
    }
  }
  for (const [key, p] of poolsOf(reg.pools)) {
    if (!isPlainObject(p)) throw new UndeclaredKey(key, `pool ${q(key)} is not an object`);
    noUndeclared('pool', key, p as unknown as Record<string, unknown>, INSTANCE_KEYS);   // P2: an inert `maxThreads` on an instance, refused as the resolver refuses it
    if (types.has(key)) throw new NameCollision(key, `pool ${q(key)} is named as node type ${q(key)} is — a type's name is its DEFAULT instance's key, so a named instance may not take it`);
    if (typeof p?.type !== 'string' || !types.has(p.type)) {
      throw new PoolTypeMissing(key, `pool ${q(key)} names type ${JSON.stringify(p?.type)}, which is not a node type` +
        (types.size ? ` (the registry declares ${[...types.keys()].sort().map(q).join(', ')})` : ' (the registry declares none)'));
    }
  }
}

/**
 * **Resolve a registry document against the code the consumer supplies.** Every refusal above is
 * thrown from here, checked for EVERY entry of each kind before the next kind is read, so a refusal
 * names the first defect and nothing is half-resolved. Builds nothing: the result is names, checked
 * schemas, derived `PoolSpec`s and the adapters and factories as given.
 */
export function resolveRegistry(doc: RegistryDocument, code: RegistryCode = {}): ResolvedRegistry {
  if (!isPlainObject(doc)) throw new UndeclaredKey('<document>', `a registry document is a plain object, got ${JSON.stringify(doc)}`);
  noUndeclared('registry document', '<document>', doc as unknown as Record<string, unknown>, DOCUMENT_KEYS);
  const sections = (k: string, v: unknown): Record<string, unknown> => {
    if (v === undefined) return {};
    if (!isPlainObject(v)) throw new UndeclaredKey(k, `registry document's ${q(k)} must be an object keyed by name, got ${JSON.stringify(v)}`);
    return v;
  };

  // ---- workers: the URL and the four schemas, two of them checked ----
  const workers = new Map<string, WorkerEntry>();
  for (const [name, raw] of Object.entries(sections('workers', doc.workers))) {
    if (!isPlainObject(raw)) throw new UndeclaredKey(name, `worker ${q(name)} is not an object`);
    noUndeclared('worker', name, raw, WORKER_KEYS);
    if (typeof raw.url !== 'string' || raw.url.length === 0) throw new WorkerMissing(name, `worker ${q(name)} has no url — the module URL of its worker class, resolved against the runtime's base when relative`);
    // ALL four schemas are held to the subset at construction — a malformed inputSchema is a registry
    // defect today even though nothing enforces it until P19 — and two are applied.
    for (const f of WORKER_KEYS.slice(1)) checkSchema(name, f, raw[f]);
    workers.set(name, raw as unknown as WorkerEntry);
  }

  // ---- group types: the three built-ins and the custom ones, one namespace ----
  const groupTypes = new Map<string, GroupType | { configSchema: JsonSchema }>();
  for (const [name, g] of Object.entries(BUILT_IN_GROUP_TYPES)) groupTypes.set(name, g);
  for (const [name, gt] of Object.entries(code.groupTypes ?? {})) {
    if (name in BUILT_IN_GROUP_TYPES) throw new NameCollision(name, `group type ${q(name)} is registered in code and is a built-in (${Object.keys(BUILT_IN_GROUP_TYPES).join(', ')}) — one namespace, one definition per name`);
    if (!isPlainObject(gt) || typeof gt.create !== 'function') throw new GroupTypeMissing(name, `group type ${q(name)} must be { configSchema?, create(config, key) }, got ${JSON.stringify(gt)}`);
    checkSchema(name, 'configSchema', gt.configSchema);
    groupTypes.set(name, gt as unknown as GroupType);
  }

  // ---- groups: each an instance of a group type, its config against that type's schema ----
  const groups = new Map<string, ResolvedGroup>();
  for (const [key, raw] of Object.entries(sections('groups', doc.groups))) {
    if (!isPlainObject(raw)) throw new UndeclaredKey(key, `group ${q(key)} is not an object`);
    noUndeclared('group', key, raw, INSTANCE_KEYS);
    const inst = raw as unknown as GroupInstance;
    const gt = typeof inst.type === 'string' ? groupTypes.get(inst.type) : undefined;
    if (gt === undefined) {
      throw new GroupTypeMissing(key, `group ${q(key)} names type ${JSON.stringify(inst.type)}, which is neither a built-in (${Object.keys(BUILT_IN_GROUP_TYPES).join(', ')}) nor registered in code` +
        (Object.keys(code.groupTypes ?? {}).length ? ` (registered: ${Object.keys(code.groupTypes ?? {}).sort().map(q).join(', ')})` : ''));
    }
    if (gt.configSchema !== undefined) {
      const fs = findings(gt.configSchema, inst.config ?? {});
      if (fs.length) throw new GroupConfigRefused(key, `group ${q(key)}: config fails ${q(inst.type)}'s configSchema — ${describeFindings(fs)}`);
    }
    groups.set(key, { key, type: inst.type, groupType: gt as GroupType, config: inst.config });
  }
  const groupKeys = new Set(groups.keys());

  // ---- node types: document declarations and code classes, one namespace ----
  const nodeTypes = new Map<string, NodeTypeDefinition>();
  const declared = sections('nodeTypes', doc.nodeTypes);
  const classes = code.nodeTypes ?? {};
  for (const name of Object.keys(classes)) {
    if (name in declared) throw new NameCollision(name, `node type ${q(name)} is declared in the document's nodeTypes AND registered as a class in code — one namespace, one definition per name`);
  }
  const entries: [string, NodeTypeEntry][] = [
    ...Object.entries(declared).map(([n, d]) => [n, d as NodeTypeDeclaration] as [string, NodeTypeEntry]),
    ...Object.entries(classes).map(([n, c]) => [n, c] as [string, NodeTypeEntry]),
  ];
  for (const [name, entry] of entries) {
    checkNodeTypeShape(name, entry);
    const def = isDerivation(entry) ? entry : nodeTypeFromDeclaration(entry);
    if (!workers.has(def.worker)) {
      throw new WorkerMissing(name, `node type ${q(name)} names worker ${q(def.worker)}, which the registry document's workers does not declare` +
        (workers.size ? ` (it declares ${[...workers.keys()].sort().map(q).join(', ')})` : ' (it declares none)'));
    }
    // A DOCUMENT type's declared groups are checked here by name, before any derivation runs, so the
    // message names the declaration rather than the derived spec.
    for (const g of (entry as NodeTypeDeclaration).groups ?? []) {
      if (!isDerivation(entry) && !groupKeys.has(g)) {
        throw new NameMissing(name, `node type ${q(name)} declares group ${q(g)}, which the registry document does not declare` +
          (groupKeys.size ? ` (it declares ${[...groupKeys].sort().map(q).join(', ')})` : ' (it declares no groups)'));
      }
    }
    nodeTypes.set(name, def);
  }

  // ---- pools: the default instance of every type, then the named ones ----
  const pools = new Map<string, ResolvedPool>();
  for (const [name, def] of nodeTypes) {
    pools.set(name, derivePool(name, name, def, workers.get(def.worker)!, def.config, groupKeys, TypeDefaultRefused));
  }
  for (const [key, raw] of Object.entries(sections('pools', doc.pools))) {
    if (!isPlainObject(raw)) throw new UndeclaredKey(key, `pool ${q(key)} is not an object`);
    noUndeclared('pool', key, raw, INSTANCE_KEYS);
    const inst = raw as unknown as PoolInstance;
    if (nodeTypes.has(key)) throw new NameCollision(key, `pool ${q(key)} is named as node type ${q(key)} is — a type's name is its DEFAULT instance's key, so a named instance may not take it`);
    const def = typeof inst.type === 'string' ? nodeTypes.get(inst.type) : undefined;
    if (def === undefined) {
      throw new PoolTypeMissing(key, `pool ${q(key)} names type ${JSON.stringify(inst.type)}, which is not a node type` +
        (nodeTypes.size ? ` (the registry declares ${[...nodeTypes.keys()].sort().map(q).join(', ')})` : ' (the registry declares none)'));
    }
    pools.set(key, derivePool(key, inst.type, def, workers.get(def.worker)!, inst.config, groupKeys, ConfigRefused));
  }

  // ---- predicates and languages: the document NAMES them and the code SUPPLIES them ----
  const predicateNames = doc.predicates ?? [];
  if (!Array.isArray(predicateNames) || predicateNames.some((p) => typeof p !== 'string')) throw new UndeclaredKey('predicates', `registry document's predicates must be an array of names, got ${JSON.stringify(predicateNames)}`);
  const supplied = namesOf(code.predicates);
  for (const p of predicateNames) {
    if (!supplied.has(p)) throw new NameMissing(p, `predicate ${q(p)} is named in the registry document and not supplied in code.predicates` + (supplied.size ? ` (supplied: ${[...supplied].sort().map(q).join(', ')})` : ' (none supplied)'));
  }
  const languageNames = doc.languages ?? [];
  if (!Array.isArray(languageNames) || languageNames.some((l) => typeof l !== 'string')) throw new UndeclaredKey('languages', `registry document's languages must be an array of names, got ${JSON.stringify(languageNames)}`);
  const adapters = languagesOf(code.languages as Languages | undefined);
  const languages = new Map<string, LanguageAdapter>();
  for (const l of languageNames) {
    const a = adapters.get(l);
    if (a === undefined) throw new NameMissing(l, `language ${q(l)} is named in the registry document and not supplied in code.languages` + (adapters.size ? ` (supplied: ${[...adapters.keys()].sort().map(q).join(', ')})` : ' (none supplied)') + ' — the runtime imports no engine; the adapter is code the consumer passes (ADR 0052 rule 4)');
    if (typeof a.compile !== 'function') throw new NameMissing(l, `language ${q(l)}'s adapter has no compile function — the registry half of an adapter is a synchronous compile(expr) that throws on a syntax error`);
    languages.set(l, a);
  }

  return { workers, groups, nodeTypes, pools, predicates: new Set(predicateNames), languages };
}
