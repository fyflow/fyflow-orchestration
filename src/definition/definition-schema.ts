/**
 * **A flow definition's STATIC SHAPE as a JSON Schema, draft 2020-12** — `spec/flow-definition.md` section 1's
 * *The definition's shape as a schema* (v0.50), [W210](../../doc/work-items/w210-the-static-shape-schema.md),
 * [ADR 0132](../../doc/decisions/0132-a-definitions-shape-is-a-schema-built-from-the-validator.md), P43 (a1).
 *
 * **BUILT, never written down** (P43 decision 1). Every key list and every enumeration below is READ from the
 * validator's own exported constants — `DOC_KEYS_DECLARED`, `NODE_KEYS_DECLARED` / `NODE_KEYS_REQUIRED`,
 * `EDGE_KEYS_DECLARED` / `EDGE_KEYS_REQUIRED`, `RETRY_POLICY_KEYS`, `TRANSFORM_KEYS`, the predicate key sets,
 * `ROUTABLE_STATES`, `KINDS`, `ID_RE`, `KEY_PATH_RE`, `PREDICATE_OPS`, `PREDICATE_ROOTS`, and the schema subset's
 * `SCHEMA_KEYWORDS` / `SCHEMA_TYPES` — so a key the validator gains is a key this schema gains. **Three things are
 * WRITTEN here, because the validator keeps them private** (W210's conformity reader, S1): the reference grammar's
 * tokens (`"."`, `"$payload"`, `"$item"`, `"!error"`), the operator partition `FD-V44` reads, and which edge keys each
 * kind's edges admit (`FD-V7`, `FD-V41`). W210's suite holds each to the validator — every spelling against
 * `referenceTarget`, every operator against `validateDefinition`, each edge site's refusals — so a token the validator
 * gains is a red test rather than a silent refusal. **A key with no
 * hand-written `description`, or no schema of its own, makes `definitionSchema()` THROW, naming it**: the key sets are
 * typed `readonly string[]`, so the typechecker cannot see a missing entry, and the L1 suite that builds the schema is
 * where the omission fails (W210's Record says why this is L1 and not L0).
 *
 * **What it carries and what it does not.** It carries every rule a single node, edge or value decides by its own
 * shape. It carries NOTHING that needs another node or the registry — whether a referenced node exists, its kind,
 * reachability, regions, cycles, a predicate's or a type's registration — and it EVALUATES nothing it embeds. Its root
 * `description` names `validateDefinition` (and `runtime.check`) as the authority for every such rule. **What it refuses,
 * `validateDefinition` refuses under every registry; the converse does not hold** (ADR 0132 rule 2).
 *
 * **Not held to ADR 0053's subset** (P43 decision 2): that subset governs the schemas this library EVALUATES, and this
 * one it EMITS for a consumer's validator and never evaluates — so `$defs`, `$ref`, `oneOf`, `if`/`then`, `pattern`
 * and the rest of 2020-12 are used freely. Pure: no engine, no scheduler value, a NEW object on every call.
 */
import {
  ASK_REFUSED_KEYS, BUILT_IN_GATE_TYPES, DOC_KEYS_DECLARED, EDGE_KEYS_DECLARED, EDGE_KEYS_REQUIRED, ID_RE, KEY_PATH_RE, KINDS,
  NODE_KEYS_DECLARED, NODE_KEYS_REQUIRED, PREDICATE_GROUP_KEYS, PREDICATE_LEAF_KEYS, PREDICATE_LEAF_REQUIRED,
  PREDICATE_NAME_KEYS, RETRY_POLICY_KEYS, ROUTABLE_STATES, TRANSFORM_KEYS,
} from './validate.ts';
import { PREDICATE_OPS, PREDICATE_ROOTS, type PredicateOp } from './types.ts';
import { SCHEMA_KEYWORDS, SCHEMA_TYPES } from './schema.ts';

/** The dialect every schema `definitionSchema()` returns declares in `$schema`. */
const DRAFT_2020_12 = 'https://json-schema.org/draft/2020-12/schema';

/**
 * **What `definitionSchema()` returns** — a plain, JSON-serialisable JSON Schema draft 2020-12 document, owned by the
 * caller: a new value on every call, so mutating one changes no other.
 */
export type DefinitionSchema = { $schema: string } & Record<string, unknown>;

type Schema = Record<string, unknown>;

/** An id where the value is a string, and anything that is not a string — `nodeKeySchema`'s `branches` and `of`. */
const idOrNonString = (): Schema => ({ anyOf: [ref('id'), { not: { type: 'string' } }] });

/** A `$ref` into this document's own `$defs`. */
const ref = (name: string): Schema => ({ $ref: `#/$defs/${name}` });

/** A RegExp's body with its `^` and `$` anchors removed — throws rather than emit a pattern that means something else. */
function body(re: RegExp, name: string): string {
  const s = re.source;
  if (!s.startsWith('^') || !s.endsWith('$') || re.flags !== '') {
    throw new Error(`definitionSchema: ${name} is no longer an anchored, flagless expression (${String(re)}) — its body cannot be reused as a pattern`);
  }
  return s.slice(1, -1);
}

/** Look a key up in a description table, throwing where the validator declares a key this module does not describe. */
function described(table: Readonly<Record<string, string>>, key: string, where: string): string {
  const d = Object.prototype.hasOwnProperty.call(table, key) ? table[key] : undefined;
  if (d === undefined) throw new Error(`definitionSchema: ${where} declares the key "${key}" and no description is written for it`);
  return d;
}

// ---- the descriptions, hand-written per key (P43 (a1)) ----

const DOC_DESCRIPTIONS: Readonly<Record<string, string>> = {
  flowId: 'The flow\'s id: 1-64 characters from [A-Za-z0-9_-] (FD-V16), the charset of spec/task-id.md — it is a segment of every task id this flow mints.',
  version: 'The definition\'s version, an integer >= 1 (FD-V21), managed by the author. The driver does not interpret it.',
  entry: 'The id of the node a run starts at. It must name a node of this document that is neither a join nor an end (FD-V3 — validateDefinition\'s, not this schema\'s).',
  nodes: 'One object per node, order irrelevant. Node ids are unique across the document (FD-V1 — validateDefinition\'s).',
};

/** A key's description that holds on every kind declaring it; a kind's own entry below wins over it. */
const NODE_DESCRIPTIONS: Readonly<Record<string, string>> = {
  id: 'The node\'s id: 1-64 characters from [A-Za-z0-9_-] (FD-V16), unique in the document (FD-V1). It is a segment of the task id the node mints.',
  kind: 'Which of the seven node kinds this is (FD-V24). There is no "decision" kind: a decision is an edge\'s `when`, and a decision with memory is a `gate`.',
  edges: 'Where the run goes from here, in order. The first eligible edge whose `when` holds is taken; an edge with no `on` routes `done` only.',
  needs: 'What this node receives instead of the previous node\'s output: an object whose keys name what the node receives and whose values are references (spec/flow-definition.md section 3, FD-V26). Where each reference points is validateDefinition\'s (FD-V27-FD-V29, FD-V49).',
  settings: 'Settings, a plain object.',
  type: 'A registered type\'s name.',
};

const KIND_DESCRIPTIONS: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  task: {
    kind: 'A `task`: the one kind that is dispatched — one scheduler task, run by the worker of the node type it names.',
    type: 'The registered NODE type that runs this task (required since v0.19). Which names are registered is the registry\'s: FD-V32, validateDefinition\'s. The built-in "Transform" runs nothing but the node\'s own `transform` (FD-V46).',
    pool: 'A named pool INSTANCE of this node\'s type, from the registry\'s `pools` (FD-V38). Absent: the type\'s default instance, keyed by the type\'s name.',
    settings: 'Settings handed to the worker in its envelope, merged OVER the type\'s defaults. A plain object; what its worker\'s settingsSchema says of them is FD-V33\'s, validateDefinition\'s.',
    transform: 'An expression the node type\'s worker wrapper evaluates over this node\'s input before the worker sees it: exactly { lang, expr } (FD-V37). The language must be registered (FD-V35) and accept the expression (FD-V36) — validateDefinition\'s.',
    optional: 'true: the FLOW handles this task\'s failure — it ends `failed` and may route a `failed` edge. Absent or false: a failure out of retries waits for a person (`user_action`).',
    retryPolicy: 'How the scheduler retries a failed attempt, inside one task id: exactly { maxRetries, backoffMs } (FD-V30).',
    workerGroups: 'The resource groups the scheduler holds this task to: a non-empty list of distinct group ids (FD-V31). That each id is one the registry\'s `groups` declares is validateDefinition\'s.',
    needs: NODE_DESCRIPTIONS.needs!,
  },
  fanout: {
    kind: 'A `fanout`: opens a region of N branches declared HERE, closed by the one `join` naming it. Dispatches nothing.',
    branches: 'The region\'s branch entries: at least two distinct node ids (FD-V9), each a task or an ask, none of them its own join (FD-V9, FD-V12 — validateDefinition\'s).',
  },
  map: {
    kind: 'A `map`: opens a region of ONE branch, opened once per item of an array at run time, closed by the one `join` naming it. Dispatches nothing.',
    over: 'The key, in the value that reaches the map, holding the array of items: 1-64 characters from [A-Za-z0-9_-] (FD-V25).',
    branch: 'The id of the one node each item\'s instance starts at — a task or an ask (FD-V25, validateDefinition\'s).',
    needs: 'What the map receives before it reads `over` (spec/flow-definition.md section 3, FD-V26).',
  },
  join: {
    kind: 'A `join`: closes the region its `of` opened, by the join policy the driver is given. Dispatches nothing.',
    of: 'The id of the `fanout` or `map` whose region this closes (FD-V6, validateDefinition\'s).',
    edges: 'Exactly one edge, carrying neither `when` nor `on` (FD-V7): a join has no outcome for either to read.',
  },
  end: {
    kind: 'An `end`: terminates one path. No edges.',
    outcome: 'A non-empty, author-defined string (FD-V8). The driver does not interpret it.',
  },
  gate: {
    kind: 'A `gate`: routes the branch that reaches it by a registered GATE type\'s decision, and hands on exactly what reached it — a decision with memory. Dispatches nothing.',
    type: `The registered GATE type that decides: a built-in (${Object.keys(BUILT_IN_GATE_TYPES).sort().map((t) => `"${t}"`).join(', ')}) or one the registry's \`gateTypes\` adds (FD-V39, validateDefinition's).`,
    settings: 'Settings the gate type reads: a plain object (FD-V40). A `key`, where present, is a key path the library resolves over what reached the gate. What the type\'s settingsSchema says of the rest is validateDefinition\'s.',
    edges: 'One edge per route of the gate\'s type, each carrying `to` and `route` — an edge with no `route` carries the type\'s DEFAULT route, which may also be named (FD-V41). That every route is wired exactly once is validateDefinition\'s.',
  },
  ask: {
    kind: `An \`ask\`: waits for a PERSON, whose answer is its output and is routed by its edges as a task's settlement is. Never dispatched. A task's ${ASK_REFUSED_KEYS.map((k) => `\`${k}\``).join(', ')} are refused on an ask (FD-V47).`,
    settings: 'Opaque settings a UI reads: a plain object (FD-V21). The library never reads them.',
    answerSchema: 'The schema a `done` answer is held to, in the library\'s built-in schema subset (FD-V48, ADR 0053). That an `examples` entry conforms is validateDefinition\'s (ADR 0056).',
    needs: 'What the person is shown as the ask\'s input (spec/flow-definition.md section 3, FD-V26).',
  },
};

const EDGE_DESCRIPTIONS: Readonly<Record<string, string>> = {
  to: 'The id of the node this edge leads to (FD-V2, validateDefinition\'s).',
  on: 'The terminal states this edge is eligible for: a non-empty list of distinct "done" / "failed" (FD-V18). Absent: ["done"]. "user_action" suspends rather than routes.',
  when: 'The decision: a registered predicate NAME { predicate }, a declared COMPARISON { path, op, value, default?, length? }, or a flat GROUP { all } or { any } of comparisons (FD-V42-FD-V45). Absent: the edge is the default for its state.',
  needs: 'What this edge\'s predicate sees beyond its node\'s outcome — `needs`\' grammar minus "." (FD-V26).',
  route: 'On a gate\'s edge, which of the gate type\'s routes it carries; absent: the type\'s DEFAULT route (FD-V41). Refused on every other kind\'s edge.',
};

const RETRY_DESCRIPTIONS: Readonly<Record<string, string>> = {
  maxRetries: 'How many times a failed attempt is re-dispatched: an integer >= 0.',
  backoffMs: 'Milliseconds between a failed attempt and its retry: a finite number >= 0.',
};

const TRANSFORM_DESCRIPTIONS: Readonly<Record<string, string>> = {
  lang: 'A registered language\'s name (FD-V35, validateDefinition\'s).',
  expr: 'Text that language compiles (FD-V36, validateDefinition\'s): `$` is the value this node receives, `$settings` its effective settings.',
};

const PREDICATE_DESCRIPTIONS: Readonly<Record<string, string>> = {
  predicate: 'A registered predicate\'s name (FD-V4, validateDefinition\'s).',
  path: `A key path over the decision's context, starting at ${PREDICATE_ROOTS.map((r) => `"${r}"`).join(' or ')} and naming a key beyond it (FD-V43).`,
  op: `One of ${PREDICATE_OPS.join(', ')} (FD-V44). The ordering operators compare numbers and "startsWith" a string — a comparison between kinds is no match, never a coercion.`,
  value: 'The scalar compared against: null, a boolean, a number or a string (FD-V44).',
  default: 'What is compared where the path does not resolve or resolves to null: a scalar, or — with `length` — an array or a string (FD-V44).',
  length: 'Exactly true: compare the LENGTH of the array or string, against a number (FD-V44).',
  all: 'A flat group: a non-empty list of comparisons that must all hold (FD-V45).',
  any: 'A flat group: a non-empty list of comparisons of which one must hold (FD-V45).',
};

const SUBSET_DESCRIPTIONS: Readonly<Record<string, string>> = {
  type: 'One of the seven JSON types, or a non-empty list of distinct ones.',
  required: 'Property names an object must carry.',
  properties: 'A schema, in the subset, per property name.',
  additionalProperties: 'true or false only — never a schema.',
  enum: 'A non-empty list of the values allowed.',
  const: 'The one value allowed.',
  minimum: 'The smallest number allowed.',
  maximum: 'The largest number allowed.',
  minLength: 'The shortest string allowed: an integer >= 0.',
  maxLength: 'The longest string allowed: an integer >= 0.',
  items: 'ONE schema, in the subset, for every item — never a tuple.',
  minItems: 'The fewest items allowed: an integer >= 0.',
  examples: 'A non-empty list of values the schema accepts (that each conforms is ADR 0056\'s check, validateDefinition\'s).',
  title: 'An annotation: a string, constraining nothing (ADR 0098).',
  description: 'An annotation: a string, constraining nothing (ADR 0098).',
  readOnly: 'An annotation: true or false, constraining nothing (ADR 0098).',
  writeOnly: 'An annotation: true or false, constraining nothing (ADR 0098).',
};

// ---- the operator partition FD-V44 reads (validate.ts's NUMERIC_OPS / STRING_OPS, private there) ----
// Typed as `PredicateOp`, so an operator removed from `PREDICATE_OPS` fails here at L0; one ADDED to it is in neither
// list and so compares any scalar, which is the validator's own reading of an operator outside both sets.
const NUMERIC_OPS: readonly PredicateOp[] = ['lt', 'lte', 'gt', 'gte'];
const STRING_OPS: readonly PredicateOp[] = ['startsWith'];

/** The reference grammar's one invented PART after a node id — `"n!error"`, v0.49 (ADR 0131). */
const ERROR_PART = '!error';

// ---- the per-key schemas ----

/** The schema of one node key, for one kind. Throws for a key the validator declares and this module has no schema for. */
function nodeKeySchema(kind: string, key: string): Schema {
  switch (key) {
    case 'id': return ref('id');
    case 'kind': return { const: kind };
    case 'type': case 'pool': return { type: 'string' };
    case 'settings':
      return kind === 'gate'
        ? { type: 'object', properties: { key: { type: 'string', pattern: KEY_PATH_RE.source, description: 'A key path: dot-separated object keys, each [A-Za-z0-9_-]{1,64} — no index, no wildcard, no expression (FD-V40).' } } }
        : { type: 'object' };
    case 'transform': return ref('transform');
    case 'optional': return { type: 'boolean' };
    case 'needs': return ref('needs');
    case 'retryPolicy': return ref('retryPolicy');
    case 'workerGroups': return { type: 'array', minItems: 1, uniqueItems: true, items: { type: 'string' } };
    // **`branches`' entries and `of` admit a NON-string** — W210's conformity reader, B1: the validator holds both only
    // through the graph (`FD-V2`, `FD-V6` and `FD-V9` read a string and pass anything else over), so `of: null` on a join
    // of no region and `["b", "c", 5]` are ACCEPTED there, and refusing them here would refuse what the validator accepts
    // (ADR 0132 rule 2). A string is held to the id charset. That `FD-V21` should refuse the rest is Q774.
    case 'branches': return { type: 'array', minItems: 2, uniqueItems: true, items: idOrNonString() };
    case 'of': return idOrNonString();
    case 'over': case 'branch': return ref('id');
    case 'outcome': return { type: 'string', minLength: 1 };
    case 'answerSchema': return ref('subsetSchema');
    case 'edges': {
      if (kind === 'join') return { type: 'array', minItems: 1, maxItems: 1, items: ref('joinEdge') };
      if (kind === 'gate') return { type: 'array', minItems: 1, items: ref('gateEdge') };
      return { type: 'array', minItems: 1, items: ref('edge') };
    }
  }
  throw new Error(`definitionSchema: the "${kind}" kind declares the key "${key}" and no schema is written for it`);
}

/** The schema of one edge key. `needs` on an edge is the edge's grammar (no "."). */
function edgeKeySchema(key: string): Schema {
  switch (key) {
    case 'to': return ref('id');
    case 'on': return { type: 'array', minItems: 1, uniqueItems: true, items: { enum: [...ROUTABLE_STATES] } };
    case 'when': return ref('when');
    case 'needs': return ref('edgeNeeds');
    case 'route': return { type: 'string' };
  }
  throw new Error(`definitionSchema: an edge declares the key "${key}" and no schema is written for it`);
}

/** The keys an edge of each KIND of node may carry — `FD-V41` (route only on a gate's, and a gate's carries nothing else) and `FD-V7` (a join's carries neither `on` nor `when`). */
const EDGE_KEYS_BY_SITE: Readonly<Record<'edge' | 'joinEdge' | 'gateEdge', (k: string) => boolean>> = {
  edge: (k) => k !== 'route',
  joinEdge: (k) => k !== 'route' && k !== 'on' && k !== 'when',
  gateEdge: (k) => k === 'to' || k === 'route',
};

const SITE_DESCRIPTIONS: Readonly<Record<'edge' | 'joinEdge' | 'gateEdge', string>> = {
  edge: 'An edge of a task or an ask: { to, on?, when?, needs? }.',
  joinEdge: 'A join\'s one edge: { to, needs? } — neither `on` nor `when` (FD-V7).',
  gateEdge: 'A gate\'s edge: { to, route? } and nothing else (FD-V41).',
};

function edgeSchema(site: 'edge' | 'joinEdge' | 'gateEdge'): Schema {
  const keys = EDGE_KEYS_DECLARED.filter(EDGE_KEYS_BY_SITE[site]);
  return {
    description: SITE_DESCRIPTIONS[site],
    type: 'object',
    required: EDGE_KEYS_REQUIRED.filter((k) => keys.includes(k)),
    properties: Object.fromEntries(keys.map((k) => [k, { ...edgeKeySchema(k), description: described(EDGE_DESCRIPTIONS, k, 'an edge') }])),
    additionalProperties: false,
  };
}

/** One kind's node schema: its declared keys, its required ones, nothing else (`FD-V17`, `FD-V23`, `FD-V47`). */
function kindSchema(kind: string): Schema {
  const keys = NODE_KEYS_DECLARED[kind];
  const required = NODE_KEYS_REQUIRED[kind];
  if (keys === undefined || required === undefined) throw new Error(`definitionSchema: the validator declares no keys for the kind "${kind}"`);
  const own = KIND_DESCRIPTIONS[kind] ?? {};
  return {
    description: described(own, 'kind', `the "${kind}" kind`),
    type: 'object',
    required: [...required],
    properties: Object.fromEntries(keys.map((k) => [k, {
      ...nodeKeySchema(kind, k),
      description: Object.prototype.hasOwnProperty.call(own, k) ? own[k] : described(NODE_DESCRIPTIONS, k, `the "${kind}" kind`),
    }])),
    additionalProperties: false,
  };
}

/** The schema of one keyword of ADR 0053's subset, as a META-schema over an `answerSchema` (`FD-V48`). */
function subsetKeywordSchema(keyword: string): Schema {
  const nonNegInt = { type: 'integer', minimum: 0 };
  switch (keyword) {
    case 'type': return { anyOf: [{ enum: [...SCHEMA_TYPES] }, { type: 'array', minItems: 1, uniqueItems: true, items: { enum: [...SCHEMA_TYPES] } }] };
    case 'required': return { type: 'array', uniqueItems: true, items: { type: 'string' } };
    case 'properties': return { type: 'object', additionalProperties: ref('subsetSchema') };
    case 'additionalProperties': return { type: 'boolean' };
    case 'enum': return { type: 'array', minItems: 1 };
    case 'const': return {};
    case 'minimum': case 'maximum': return { type: 'number' };
    case 'minLength': case 'maxLength': case 'minItems': return nonNegInt;
    case 'items': return ref('subsetSchema');
    case 'examples': return { type: 'array', minItems: 1 };
    case 'title': case 'description': return { type: 'string' };
    case 'readOnly': case 'writeOnly': return { type: 'boolean' };
  }
  throw new Error(`definitionSchema: the schema subset declares the keyword "${keyword}" and no schema is written for it`);
}

/** The keyed object at one site — a node's `needs` (`withSelf`) or an edge's. */
function needsSchema(withSelf: boolean, description: string): Schema {
  return {
    description,
    type: 'object',
    minProperties: 1,
    propertyNames: ref('id'),
    additionalProperties: ref(withSelf ? 'reference' : 'edgeReference'),
  };
}

/** One reference's grammar — `"."` (a node's site only), `"$payload"`, `"$item"`, `"n"`, `"n!error"`, each node form with `?` and as a one-element array. */
function referenceSchema(withSelf: boolean, id: string): Schema {
  const aimed = `${id}(?:${ERROR_PART})?\\??`;
  const tokens = [...(withSelf ? ['\\.'] : []), '\\$payload', '\\$item', aimed];
  return {
    description: (withSelf ? '"." (what this node would have received), ' : '') +
      '"$payload" (what the run entered with), "$item" (the item of the map instance containing this node), a node id ' +
      '(that node\'s output), or a node id followed by "!error" (that node\'s error, null where it succeeded) — each node form ' +
      'with an optional "?" last (the node may not have run: absent, not refused), and as a one-element array (every output of that node visible on this node\'s path, in branch-path order; where each form is legal is FD-V28\'s) (FD-V26).',
    anyOf: [
      { type: 'string', pattern: `^(?:${tokens.join('|')})$` },
      { type: 'array', minItems: 1, maxItems: 1, items: { type: 'string', pattern: `^${aimed}$` } },
    ],
  };
}

/** A declared comparison — `FD-V42`'s shape, `FD-V43`'s path, `FD-V44`'s operator and value. */
function leafSchema(id: string): Schema {
  const path = `^(?:${PREDICATE_ROOTS.join('|')})(?:\\.${id})+$`;
  // A function, not one shared object: each use gets its own, so no part of a result aliases another.
  const scalar = (): Schema => ({ type: ['null', 'boolean', 'number', 'string'] });
  const keySchemas: Record<string, Schema> = {
    path: { type: 'string', pattern: path },
    op: { enum: [...PREDICATE_OPS] },
    value: scalar(),
    default: { anyOf: [scalar(), { type: 'array', items: scalar() }] },
    length: { const: true },
  };
  return {
    description: 'A declared comparison over the decision\'s context.',
    type: 'object',
    required: [...PREDICATE_LEAF_REQUIRED],
    properties: Object.fromEntries(PREDICATE_LEAF_KEYS.map((k) => {
      const s = keySchemas[k];
      if (s === undefined) throw new Error(`definitionSchema: a comparison declares the key "${k}" and no schema is written for it`);
      return [k, { ...s, description: described(PREDICATE_DESCRIPTIONS, k, 'a comparison') }];
    })),
    additionalProperties: false,
    allOf: [
      // `length: true` compares a length — a number — and a length has no prefix; its default stands in for the value.
      {
        if: { required: ['length'] },
        then: { properties: { value: { type: 'number' }, op: { not: { enum: [...STRING_OPS] } }, default: { type: ['array', 'string'] } } },
      },
      // with no `length`: an ordering operator compares a number, and a default is a scalar.
      {
        if: { not: { required: ['length'] } },
        then: { properties: { default: scalar() } },
      },
      {
        if: { required: ['op'], properties: { op: { enum: [...NUMERIC_OPS] } } },
        then: { anyOf: [{ required: ['length'] }, { properties: { value: { type: 'number' } } }] },
      },
      {
        if: { required: ['op'], properties: { op: { enum: [...STRING_OPS] } } },
        then: { properties: { value: { type: 'string' } } },
      },
    ],
  };
}

/**
 * **A flow definition's static shape as a JSON Schema, draft 2020-12** — P43 (a1), ADR 0132. A plain object, a NEW
 * one on every call, JSON-serialisable. It carries every rule a node, an edge or a value decides by its own shape
 * and names `validateDefinition` as the authority for the rest; what it refuses, `validateDefinition` refuses under
 * every registry.
 */
export function definitionSchema(): DefinitionSchema {
  const id = body(ID_RE, 'ID_RE');
  // `KEY_PATH_RE` is used whole (a gate's `settings.key`); asserted anchored and flagless here too.
  body(KEY_PATH_RE, 'KEY_PATH_RE');
  const defs: Record<string, Schema> = {
    id: { description: 'A node id: 1-64 characters from [A-Za-z0-9_-] (FD-V16).', type: 'string', pattern: `^${id}$` },
    node: {
      description: `A node: one of ${KINDS.join(', ')}, told apart by \`kind\`.`,
      type: 'object',
      required: ['kind'],
      properties: { kind: { enum: [...KINDS] } },
      allOf: KINDS.map((k) => ({ if: { required: ['kind'], properties: { kind: { const: k } } }, then: ref(`${k}Node`) })),
    },
    ...Object.fromEntries(KINDS.map((k) => [`${k}Node`, kindSchema(k)])),
    edge: edgeSchema('edge'),
    joinEdge: edgeSchema('joinEdge'),
    gateEdge: edgeSchema('gateEdge'),
    needs: needsSchema(true, 'A node\'s `needs`: a non-empty object, each key 1-64 characters from [A-Za-z0-9_-], each value a reference (FD-V26).'),
    edgeNeeds: needsSchema(false, 'An edge\'s `needs`: as a node\'s, minus "." — its predicate already has the outcome (FD-V26).'),
    reference: referenceSchema(true, id),
    edgeReference: referenceSchema(false, id),
    retryPolicy: {
      description: 'Exactly the scheduler\'s shape (FD-V30).',
      type: 'object',
      required: [...RETRY_POLICY_KEYS],
      properties: Object.fromEntries(RETRY_POLICY_KEYS.map((k) => [k, {
        ...(k === 'maxRetries' ? { type: 'integer', minimum: 0 } : { type: 'number', minimum: 0 }),
        description: described(RETRY_DESCRIPTIONS, k, 'a retryPolicy'),
      }])),
      additionalProperties: false,
    },
    transform: {
      description: 'Exactly { lang, expr }, both strings (FD-V37).',
      type: 'object',
      required: [...TRANSFORM_KEYS],
      properties: Object.fromEntries(TRANSFORM_KEYS.map((k) => [k, { type: 'string', description: described(TRANSFORM_DESCRIPTIONS, k, 'a transform') }])),
      additionalProperties: false,
    },
    when: {
      description: 'One of three shapes, told apart by its keys (FD-V42): a registered name, a declared comparison, or a flat group.',
      oneOf: [ref('predicateName'), ref('comparison'), ref('group')],
    },
    predicateName: {
      description: 'A registered predicate, by name (FD-V4\'s lookup is validateDefinition\'s).',
      type: 'object',
      required: [...PREDICATE_NAME_KEYS],
      properties: Object.fromEntries(PREDICATE_NAME_KEYS.map((k) => [k, { type: 'string', description: described(PREDICATE_DESCRIPTIONS, k, 'a predicate name') }])),
      additionalProperties: false,
    },
    comparison: leafSchema(id),
    group: {
      description: 'A FLAT group — `all` or `any`, never both, never nested, its members comparisons (FD-V45).',
      oneOf: PREDICATE_GROUP_KEYS.map((k) => ({
        type: 'object',
        required: [k],
        properties: { [k]: { type: 'array', minItems: 1, items: ref('comparison'), description: described(PREDICATE_DESCRIPTIONS, k, 'a group') } },
        additionalProperties: false,
      })),
    },
    subsetSchema: {
      description: 'A schema in the library\'s built-in subset (ADR 0053): a plain object using only these keywords — any other is refused, never ignored (Q278).',
      type: 'object',
      properties: Object.fromEntries(SCHEMA_KEYWORDS.map((k) => [k, { ...subsetKeywordSchema(k), description: described(SUBSET_DESCRIPTIONS, k, 'the schema subset') }])),
      additionalProperties: false,
    },
  };
  return {
    $schema: DRAFT_2020_12,
    title: 'FlowDefinition',
    description: 'The STATIC SHAPE of a fyflow-orchestration flow definition (spec/flow-definition.md). It carries every rule a node, ' +
      'an edge or a value decides by its own shape, and none that needs another node or a registry: whether a named node exists and ' +
      'what kind it is, reachability, cycles, regions and joins, where a `needs` reference points, and every registered name — node ' +
      'types, pools, groups, languages, predicates, gate types and their routes and settings. For all of those, and for the definition ' +
      'as a whole, the AUTHORITY is `validateDefinition(flow, registry)` — and `runtime.check(flow)` on a runtime. A document this ' +
      'schema refuses, validateDefinition refuses; one it accepts may still be refused there.',
    type: 'object',
    required: [...DOC_KEYS_DECLARED],
    properties: Object.fromEntries(DOC_KEYS_DECLARED.map((k) => {
      const s: Schema = k === 'flowId' || k === 'entry' ? ref('id')
        : k === 'version' ? { type: 'integer', minimum: 1 }
          : k === 'nodes' ? { type: 'array', minItems: 1, items: ref('node') }
            : (() => { throw new Error(`definitionSchema: the document declares the key "${k}" and no schema is written for it`); })();
      return [k, { ...s, description: described(DOC_DESCRIPTIONS, k, 'the document') }];
    })),
    additionalProperties: false,
    $defs: defs,
  };
}
