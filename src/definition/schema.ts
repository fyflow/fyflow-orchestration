/**
 * **The built-in JSON Schema SUBSET, and the one rule that keeps it honest: a keyword outside it is
 * REFUSED at construction naming the keyword** —
 * [ADR 0053](../../doc/decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md),
 * [P18](../../doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md) decision 8 and fact 1,
 * [Q278](../../doc/open-questions.md), [W65](../../doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md).
 *
 * A worker entry in the registry document declares up to four schemas (`configSchema`,
 * `settingsSchema`, `inputSchema`, `outputSchema`); a group type declares one; a node-type class may
 * declare one. A worker's first two, a group type's and a class's are CHECKED — at `createRuntime`
 * and at `new Driver` — and a worker's last two are declared, carried and enforced by nothing in
 * this plan (P19's strict mode). The maintainer priced three validators at the draft (`ajv` 262 KB,
 * `@cfworker/json-schema` 42 KB, this subset 1.5 KB bundled as its 32-line prototype — the shipped module
 * is 4.2 KB minified) and chose the subset, with the 42 KB
 * dependency as prediction 4's reversal condition.
 *
 * **Why an unknown keyword is refused and never ignored (Q278).** JSON Schema's own semantics ignore
 * a keyword an implementation does not know, so a worker whose `settingsSchema` writes `pattern`
 * would have that constraint silently dropped and every `settings` value accepted — W43's zero-score
 * shape one layer up: a document that says one thing and a validator that checks another, at exit 0.
 * The refusal names the keyword and the path, so a consumer meets a refusal rather than a pass, and
 * prediction 4's reversal (a real worker needing a keyword outside the subset) is legible the day it
 * happens. Annotation keywords (`title`, `description`, `$schema`, `$comment`) are outside the subset
 * too and are refused the same way — a consequence ADR 0053 states rather than a whitelist it invents.
 *
 * **What `type` means over JSON data.** `number` and `integer` admit FINITE numbers only: JSON text
 * cannot carry `NaN` or an infinity, so a schema over JSON data has no reading of them but *not a
 * number*; a hand-built document carrying one is refused rather than admitted by `typeof`.
 *
 * Two functions, deliberately: `schemaProblem` decides whether a schema is IN the subset (run once,
 * at construction, on every declared schema — the registry's mistake, named); `findings` decides
 * whether a VALUE satisfies a schema already known to be in it. A schema that fails the first must
 * never reach the second, and the callers in `registry.ts` and `validate.ts` enforce that order.
 * No dependency, no `node:` import, no `Date` — pure functions over data (`RT-R3`, `RT-R4`).
 */

/** A JSON Schema in the subset — data, as everything in a registry document is. Checked by `schemaProblem`. */
export type JsonSchema = Readonly<Record<string, unknown>>;

/**
 * **The subset, enumerated** — the twelve keywords P18 fact 1 measured as covering the sample's and
 * the corpus's schemas (14 of 14 cases). `spec/flow-definition.md` section 3's table names the same
 * twelve, and `test/definition/schema.test.ts` compares the two lists both ways (rule 8 obligation
 * (e)'s third shape — a list is a claim about another list).
 */
export const SCHEMA_KEYWORDS: readonly string[] = [
  'type', 'required', 'properties', 'additionalProperties', 'enum', 'const',
  'minimum', 'maximum', 'minLength', 'maxLength', 'items', 'minItems',
];

/** The type names `type` may use — JSON Schema's seven, `integer` included. */
export const SCHEMA_TYPES: readonly string[] = ['object', 'array', 'string', 'number', 'integer', 'boolean', 'null'];

/** One way a value fails a schema: where, and what the schema said. */
export interface SchemaFinding {
  /** A JSON-path-like address: `$`, `$.model`, `$.windows[0].limit`. */
  path: string;
  says: string;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNonNegInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0;

/**
 * **Why a schema is NOT in the subset, or `null`** — the construction-time check, recursive over
 * `properties` and `items`. The first problem found is returned, naming the path inside the schema
 * (`$.properties.model`) and the keyword or value, because a registry defect is fixed one at a time
 * where it is declared. An EMPTY schema `{}` is in the subset and accepts every value, which is
 * JSON Schema's own reading and is what an author who writes `"inputSchema": {}` means.
 */
export function schemaProblem(schema: unknown, at = '$'): string | null {
  if (!isPlainObject(schema)) return `${at}: a schema is a plain object, got ${JSON.stringify(schema)}`;
  for (const k of Object.keys(schema)) {
    if (!SCHEMA_KEYWORDS.includes(k)) {
      return `${at}: keyword "${k}" is outside the built-in subset (${SCHEMA_KEYWORDS.join(', ')}) and is REFUSED rather than ignored — ` +
        'an ignored keyword would constrain nothing in silence (Q278, ADR 0053)';
    }
  }
  const s = schema;
  if (s.type !== undefined) {
    const types = Array.isArray(s.type) ? s.type : [s.type];
    if (types.length === 0) return `${at}.type: an empty list names no type`;
    for (const t of types) {
      if (typeof t !== 'string' || !SCHEMA_TYPES.includes(t)) return `${at}.type: ${JSON.stringify(t)} is not one of ${SCHEMA_TYPES.join('|')}`;
    }
    if (new Set(types).size !== types.length) return `${at}.type: repeats an entry`;
  }
  if (s.required !== undefined) {
    if (!Array.isArray(s.required) || s.required.some((x) => typeof x !== 'string')) return `${at}.required: must be an array of property names, got ${JSON.stringify(s.required)}`;
    if (new Set(s.required).size !== s.required.length) return `${at}.required: repeats a name`;
  }
  if (s.properties !== undefined) {
    if (!isPlainObject(s.properties)) return `${at}.properties: must be an object of schemas, got ${JSON.stringify(s.properties)}`;
    for (const [k, sub] of Object.entries(s.properties)) {
      const p = schemaProblem(sub, `${at}.properties.${k}`);
      if (p !== null) return p;
    }
  }
  if (s.additionalProperties !== undefined && typeof s.additionalProperties !== 'boolean') {
    return `${at}.additionalProperties: the subset admits true or false, not a schema (got ${JSON.stringify(s.additionalProperties)})`;
  }
  if (s.enum !== undefined && (!Array.isArray(s.enum) || s.enum.length === 0)) return `${at}.enum: must be a non-empty array, got ${JSON.stringify(s.enum)}`;
  for (const k of ['minimum', 'maximum'] as const) {
    if (s[k] !== undefined && (typeof s[k] !== 'number' || !Number.isFinite(s[k]))) return `${at}.${k}: must be a finite number, got ${JSON.stringify(s[k])}`;
  }
  for (const k of ['minLength', 'maxLength', 'minItems'] as const) {
    if (s[k] !== undefined && !isNonNegInt(s[k])) return `${at}.${k}: must be an integer >= 0, got ${JSON.stringify(s[k])}`;
  }
  if (s.items !== undefined) {
    if (Array.isArray(s.items)) return `${at}.items: the subset admits one schema for every item, not a tuple`;
    const p = schemaProblem(s.items, `${at}.items`);
    if (p !== null) return p;
  }
  return null;
}

/** The JSON kind of a value, for `type` — with a non-finite number reported as what it is. */
function kindOf(v: unknown): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (typeof v === 'number') return Number.isFinite(v) ? 'number' : 'non-finite number';
  return typeof v;
}

/** Canonical JSON text — keys sorted at every level — so `enum` and `const` compare values, not key order. */
export function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`;
  if (isPlainObject(v)) return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(',')}}`;
  return JSON.stringify(v) ?? 'undefined';
}

/**
 * **Every way `value` fails `schema`, in document order** — empty means it satisfies it. `schema`
 * must already have passed `schemaProblem`; this function does not re-check the subset, and a
 * caller that skipped the check would be back to ignoring a keyword in silence. A `type` mismatch
 * ends the walk at that path, because the remaining keywords are statements about a value of that
 * type (the prototype's own shape, P18 fact 1).
 */
export function findings(schema: JsonSchema, value: unknown, path = '$'): SchemaFinding[] {
  const out: SchemaFinding[] = [];
  const kind = kindOf(value);
  if (schema.type !== undefined) {
    const types = (Array.isArray(schema.type) ? schema.type : [schema.type]) as string[];
    const ok = types.some((t) => t === kind || (t === 'integer' && kind === 'number' && Number.isInteger(value)));
    if (!ok) { out.push({ path, says: `expected ${types.join('|')}, got ${kind}` }); return out; }
  }
  if (schema.enum !== undefined) {
    const c = canonical(value);
    if (!(schema.enum as unknown[]).some((e) => canonical(e) === c)) out.push({ path, says: `not one of ${JSON.stringify(schema.enum)}` });
  }
  if (schema.const !== undefined && canonical(schema.const) !== canonical(value)) out.push({ path, says: `not ${JSON.stringify(schema.const)}` });
  if (kind === 'number') {
    const n = value as number;
    if (schema.minimum !== undefined && n < (schema.minimum as number)) out.push({ path, says: `below minimum ${schema.minimum}` });
    if (schema.maximum !== undefined && n > (schema.maximum as number)) out.push({ path, says: `above maximum ${schema.maximum}` });
  }
  if (kind === 'string') {
    const s = value as string;
    if (schema.minLength !== undefined && s.length < (schema.minLength as number)) out.push({ path, says: `shorter than ${schema.minLength}` });
    if (schema.maxLength !== undefined && s.length > (schema.maxLength as number)) out.push({ path, says: `longer than ${schema.maxLength}` });
  }
  if (kind === 'array') {
    const a = value as unknown[];
    if (schema.minItems !== undefined && a.length < (schema.minItems as number)) out.push({ path, says: `fewer than ${schema.minItems} items` });
    if (schema.items !== undefined) a.forEach((v, i) => out.push(...findings(schema.items as JsonSchema, v, `${path}[${i}]`)));
  }
  if (kind === 'object') {
    const o = value as Record<string, unknown>;
    const props = (schema.properties ?? {}) as Record<string, JsonSchema>;
    // **OWN keys, never `in`** — W65's conformity reader: `in` walks `Object.prototype`, so `required:
    // ['constructor']` was satisfied by `{}`, `{ toString: 1 }` passed `additionalProperties: false`, and a
    // declared `toString` property was read off an absent key — a constraint dropped in silence, which is
    // ADR 0053's own reason for Q278.
    for (const k of (schema.required ?? []) as string[]) if (!own(o, k)) out.push({ path: `${path}.${k}`, says: 'required' });
    for (const [k, sub] of Object.entries(props)) if (own(o, k)) out.push(...findings(sub, o[k], `${path}.${k}`));
    if (schema.additionalProperties === false) for (const k of Object.keys(o)) if (!own(props, k)) out.push({ path: `${path}.${k}`, says: 'not declared' });
  }
  return out;
}

const own = (o: object, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k);

/** The findings as one line — what a refusal's detail carries. */
export function describeFindings(fs: readonly SchemaFinding[]): string {
  return fs.map((f) => `${f.path} ${f.says}`).join('; ');
}
