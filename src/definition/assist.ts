/**
 * **The AUTHORING ASSISTS: what a schema buys the person or the agent wiring a flow** —
 * [P19](../../doc/plans/p19-what-a-schema-buys-an-author.md) decisions 7 and 9,
 * [W74](../../doc/work-items/w74-the-assists-and-the-exit-artifact.md), `AGENTS.md` section 15.
 *
 * Three functions, each a READING of declarations W72 shipped and of the relation W73 shipped.
 * **None of them refuses anything, none changes what a node receives, and none is reachable from a
 * run** — which is why this module adds no rule to `spec/` and no class to section 9's list.
 *
 * | | what it answers |
 * |---|---|
 * | `pathsOf(schema)` | *what is there to reach for* — every path a value of the schema may carry |
 * | `tryTransform(registry, flow, node, transform)` | *does THIS expression fit* — the sample-and-diff loop, one candidate at a time |
 * | `signatureOf(name, worker)` | *what do I write my worker against* — a TypeScript signature from the three schemas |
 *
 * **The loop is a SUBSTITUTION over `checkWiring` and not a second evaluator** (W74 fact B): it puts
 * the candidate `transform` on a COPY of the flow's node and re-runs the check, so there is ONE
 * evaluator, ONE sampling rule and ONE per-item road — W73's adequacy reader (R7) found that a map's
 * branch task composing `"."` and transforming it must be evaluated once per ELEMENT, and an assist
 * that re-implemented the evaluation would have to rediscover that. Every verdict it returns is
 * therefore W73's, unchanged: *the sample passed*, never *fits*, with the sample's source and arity
 * on it ([Q301](../../doc/open-questions.md)).
 *
 * **`pathsOf` does NOT gate on `schemaProblem`, and that is a decision rather than an oversight**
 * (W74 fact A). ADR 0053 rule 5 puts that gate in front of `findings`, because a VALUE check may not
 * read a schema that might carry an unknown keyword. A READING tool is the other case: the shape an
 * author most needs to see is the one the subset CANNOT say — a map's `JP-R12` record, which
 * `checkWiring` derives as `additionalProperties: <schema>` with a `branchKeys` marker and which
 * `schemaProblem` refuses by name ([Q306](../../doc/open-questions.md)). Gating here would refuse
 * exactly the join successor's author. So this module walks what the CHECK derives as well as what an
 * author may declare, and an unknown keyword is simply not read.
 *
 * **What a generated signature is NOT** (P19 decision 9): enforcement. A type catches the SHAPE and
 * not the constraints — a worker typed to return a `number` can still return one below a declared
 * `minimum`, and `check:workers` and the wiring check are what see that. The generator is here rather
 * than as a build step because a recipe the gate RUNS is a recipe that is still true next month;
 * `json-schema-to-typescript` is the richer consumer tool and section 15 names it. **The two AGREE
 * wherever a schema says something and differ wherever it says LESS**: an empty or annotation-only
 * schema is `unknown` here and an OBJECT type there, and a closed object with no properties is
 * `Record<string, never>` here and `{}` — *any non-nullish value* — there. *(This said they differ on
 * the OPEN object, which is the reverse of what both emit: the item's own fact ran that generator
 * TWICE, once with an option that CLOSES what a schema leaves open, and kept the first run's
 * conclusion beside the second run's line count. W74's conformity reader, from the author's own
 * output.)*
 *
 * Pure over data except `tryTransform`, which is `checkWiring`'s one `import()` of an adapter's
 * worker half by URL; no `node:` import, no clock (`RT-R3`, `RT-R4`).
 */
import type { JsonSchema } from './schema.ts';
import type { FlowDefinition, FlowNode, WorkerEntry } from './types.ts';
import { checkWiring, type WiringOptions, type WiringRegistry, type WiringSample, type WiringVerdict } from './wiring.ts';

// ---- (1) path enumeration ----------------------------------------------------------------------

/** One place a value of a schema may carry something, and what the schema says of it. */
export interface SchemaPath {
  /** Addressed as `findings` addresses a value: `$`, `$.items[]`, and `$.*` for a key minted at run time. */
  path: string;
  /** The type names the schema admits here, `|`-joined — or `*` where it names none (an open schema admits every type). */
  types: string;
  /**
   * **Whether a value is GUARANTEED to carry this path** — every step from `$` to here is named in
   * its parent's `required`. A path that is not required may simply be absent, which is what an
   * author writing `a.b.c` needs to know before writing it.
   */
  required: boolean;
  /** The sub-schema at this path, so a caller may read a bound the summary above drops. */
  schema: JsonSchema;
}

const TYPES = ['object', 'array', 'string', 'number', 'integer', 'boolean', 'null'];
const jsonType = (v: unknown): string => v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v;
const isPlainObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** The type names a schema admits, or `['*']` where it names none. `const` and `enum` decide it before `type` does. */
function typeNames(s: Record<string, unknown>): string[] {
  if (s.const !== undefined) return [jsonType(s.const)];
  if (Array.isArray(s.enum)) return [...new Set(s.enum.map(jsonType))];
  if (s.type === undefined) return ['*'];
  return Array.isArray(s.type) ? (s.type as string[]).slice() : [s.type as string];
}

/**
 * **Every path a value of `schema` may carry, in document order, `$` first** — the walk an author
 * reads before writing a transform, and the walk the sample-and-diff loop prints beside a `no`.
 *
 * **What it walks is `properties`, `items`, `required` and `additionalProperties`, and that is the
 * whole of it** — so a `const` or an `enum` whose VALUES are objects or arrays gives `$` alone,
 * even though the schema determines exactly what is under it (W74's conformity reader, finding 5).
 * The types are still right; the paths stop at the root. No corpus schema has an object-valued
 * `const` or `enum` — the two `const`s in the L6 registry are `true` — so this is a stated bound
 * rather than a measured loss, and a fifth road is what would close it.
 *
 * `properties` gives `$.k`; `items` gives `$[]`, once, because every element has the same schema in
 * the subset; a key named by `required` with no `properties` entry is still a path, typed `*`; and
 * `additionalProperties` holding a SCHEMA gives `$.*` — the map record's minted branch key, the one
 * shape no author can declare (the header, [Q306](../../doc/open-questions.md)).
 *
 * An open schema (no `type`) admits every type, so its `properties` and `items` are walked too: a
 * schema that says nothing is not a schema that says *nothing is there*.
 */
export function pathsOf(schema: JsonSchema, at = '$', required = true, out: SchemaPath[] = []): SchemaPath[] {
  const s = schema as Record<string, unknown>;
  const types = typeNames(s);
  out.push({ path: at, types: types.join('|'), required, schema });
  const open = types.includes('*');
  if (types.includes('object') || open) {
    const req = new Set((s.required ?? []) as string[]);
    const props = (s.properties ?? {}) as Record<string, JsonSchema>;
    for (const [k, sub] of Object.entries(props)) pathsOf(sub, `${at}.${k}`, required && req.has(k), out);
    // **OWN keys, never `in`** — `schema.ts`'s own helper and its comment, thirty lines from the
    // module this one imports: `in` walks `Object.prototype`, so a schema requiring `toString`
    // enumerated as if the key were described. Measured by W74's adequacy reader (R1) with no
    // mutation: `pathsOf` dropped `$.toString` while `checkWiring` gave the same arc a `no`
    // NAMING it — the assist contradicting the check it exists to explain. ADR 0053's reason for
    // Q278, one module over.
    for (const k of req) if (!Object.hasOwn(props, k)) out.push({ path: `${at}.${k}`, types: '*', required, schema: {} });
    // The `JP-R12` record over a `map` region: keys minted at run time, each of the branch's shape.
    // Never required — `JP-R12` loses a branch three ways no document shows (W73's `record()`).
    if (isPlainObject(s.additionalProperties)) pathsOf(s.additionalProperties as JsonSchema, `${at}.*`, false, out);
  }
  if ((types.includes('array') || open) && s.items !== undefined) {
    // An element of an array is never GUARANTEED: `minItems` may be absent or zero.
    pathsOf(s.items as JsonSchema, `${at}[]`, false, out);
  }
  return out;
}

/** `pathsOf`'s answer as lines a person reads — one path each, the guaranteed ones marked. */
export function describePaths(paths: readonly SchemaPath[]): string {
  return paths.map((p) => `${p.required ? '  ' : '? '}${p.path.padEnd(28)} ${p.types}`).join('\n');
}

// ---- (2) the sample-and-diff loop ---------------------------------------------------------------

/** A candidate transform, exactly as a task node declares one (`FD-V37`). */
export interface CandidateTransform {
  lang: string;
  expr: string;
}

/**
 * **One candidate expression on one node, and what every arc into that node then says** — the
 * sample-and-diff loop, and the whole of it.
 *
 * `transform` is put on a COPY of `flow`'s node and `checkWiring` is re-run, so the verdicts are
 * W73's own: `transform-passes` with the sample's source and arity where every evaluation's result
 * is accepted by the consumer's `inputSchema`, `transform-fails` with the finding where one is not,
 * and the transform run once per ELEMENT where the arc is a map's item. Pass `null` to ask what the
 * arcs say with NO transform, which is where an author starts.
 *
 * The flow is never mutated. A node id that names no task returns `[]` — an authoring tool reports,
 * and there is nothing to report about a node with no arcs into it.
 */
export async function tryTransform(
  registry: WiringRegistry,
  flow: FlowDefinition,
  nodeId: string,
  transform: CandidateTransform | null,
  options: WiringOptions = {},
): Promise<WiringVerdict[]> {
  const nodes = flow.nodes.map((n): FlowNode => {
    if (n.id !== nodeId) return n;
    const copy = { ...n } as Record<string, unknown>;
    if (transform === null) delete copy.transform;
    else copy.transform = { lang: transform.lang, expr: transform.expr };
    return copy as unknown as FlowNode;
  });
  const report = await checkWiring(registry, { ...flow, nodes }, options);
  return report.verdicts.filter((v) => v.consumer === nodeId);
}

// ---- (2b) the SAMPLED OUTPUT of a node that only transforms ---------------------------------------

/**
 * **A schema INFERRED from ONE value** — its TYPE SHAPE in ADR 0053's subset: the types it carries, the
 * keys it had, and nothing about its values. Evidence about one input and never a declaration, which is
 * the whole caveat `sampledOutput` carries. *(This said *the narrowest schema of the subset that the
 * value satisfies, and no narrower*, and the superlative is false: `{ const: 7 }` is in the subset, `7`
 * satisfies it and `8` does not, so it is strictly narrower than the `{ type: 'integer' }` this returns.
 * W109's conformity reader, 9. What the function IS — a sound shape inference — is what the rest of
 * this comment describes.)*
 *
 * The rules, so a reader need not infer them: a plain object becomes `type: 'object'` with every own
 * key REQUIRED and `additionalProperties: false`, because this value had exactly those keys; an array
 * becomes `type: 'array'` with `items` inferred from its FIRST element, and an empty one carries no
 * `items` at all; `null` is `type: 'null'`; a whole number is `integer` and any other number is
 * `number`. **`undefined` has no schema in the subset and returns `undefined`** — a transform that
 * evaluates to nothing is not a failure (ADR 0051), so the absence has to be sayable here too.
 *
 * It is deliberately NOT a generaliser: an array of mixed types reports its first element's shape, and
 * `sampledOutput`'s own wording is what stops that being read as a guarantee. A UI showing this must
 * show it as *what the sample produced*.
 */
export function schemaOfValue(v: unknown): JsonSchema | undefined {
  if (v === undefined) return undefined;
  if (v === null) return { type: 'null' };
  if (Array.isArray(v)) {
    const first = v.length ? schemaOfValue(v[0]) : undefined;
    return { type: 'array', ...(first !== undefined ? { items: first } : {}) } as JsonSchema;
  }
  switch (typeof v) {
    case 'string': return { type: 'string' };
    case 'boolean': return { type: 'boolean' };
    case 'number': return { type: Number.isInteger(v) ? 'integer' : 'number' } as JsonSchema;
    case 'object': {
      const properties: Record<string, JsonSchema> = {};
      const required: string[] = [];
      for (const k of Object.keys(v as object)) {
        const sub = schemaOfValue((v as Record<string, unknown>)[k]);
        if (sub === undefined) continue;                   // an own key holding `undefined` describes nothing
        properties[k] = sub;
        required.push(k);
      }
      return { type: 'object', ...(required.length ? { required } : {}), properties, additionalProperties: false } as JsonSchema;
    }
    default: return undefined;                             // a function or a symbol: outside the subset
  }
}

/** What a node PRODUCES, as far as a sample can say — `sampledOutput`'s answer. */
export interface SampledOutput {
  /** The node asked about. */
  node: string;
  /**
   * The sample its transform ran on and what came out — `WiringSample`, W73's own, with the source
   * (a declared `examples` or the generator's witness) and the arity where the producer is a region.
   * Absent when no sample could be built on the producing side.
   */
  sample?: WiringSample;
  /** `schemaOfValue(sample.result)` — the shape of the one value this sample produced. */
  schema?: JsonSchema;
  /**
   * **The verdicts on the arcs LEAVING this node, which are still `unchecked`** — and they are
   * returned rather than elided on purpose. [Q446](../../doc/open-questions.md) is the residue: a
   * sample is evidence about one input and `fits` is a claim about every input, so nothing here turns
   * an arc green. P26 prediction 4 says this item does not remove that, and a function whose caller
   * can read the residue off its own return value cannot be read as having removed it.
   */
  leaving: WiringVerdict[];
  /** Why there is no sample, or no schema for its result. Absent when both are present. */
  why?: string;
}

/**
 * **The SHAPE a node emits, sampled** —
 * [ADR 0075](../../doc/decisions/0075-a-node-that-only-transforms-is-a-built-in-type-with-no-inner-worker.md)
 * rule 6, [W109](../../doc/work-items/w109-a-node-that-only-transforms.md), P26 decision 5 (a).
 *
 * **The hole it fills.** Every arc leaving a node with no `outputSchema` is `unchecked`, and a node of
 * a type that only transforms has no worker and therefore no schemas at all — so P19's authoring
 * feedback goes dark exactly on the node a UI is most likely to emit (P26 fact 6, re-measured at
 * W109's declaration step). A transform-only node cannot DECLARE what it produces, and this is what it
 * can show instead.
 *
 * **It is a WIRING of `tryTransform` and computes nothing of its own**, which is fact 7 read exactly:
 * `checkWiring` already runs the transform on the producer's sample, already puts the result in
 * `WiringSample.result`, and already says in words that *the transform ran and nothing holds its
 * result*. Measured at W109's declaration step — that string is the verdict's own `why` today. What
 * was missing was a function that asks the question an AUTHOR asks (*what does this node emit*) rather
 * than the question a check asks (*does what arrives fit*), and that reports the residue beside the
 * answer. Pass a `transform` to ask about a candidate; pass nothing to ask about the one the node
 * declares.
 *
 * A node id that names no task, or one with no arcs into it, returns `leaving: []` and a `why` — an
 * authoring tool reports.
 */
export async function sampledOutput(
  registry: WiringRegistry,
  flow: FlowDefinition,
  nodeId: string,
  transform?: CandidateTransform,
  options: WiringOptions = {},
): Promise<SampledOutput> {
  // ONE report answers both halves where no candidate is given; with a candidate, the arcs INTO the
  // node are the candidate's and the arcs LEAVING are the shipped flow's, because a candidate is a
  // question and not an edit.
  const report = await checkWiring(registry, flow, options);
  const into = transform === undefined
    ? report.verdicts.filter((v) => v.consumer === nodeId)
    : await tryTransform(registry, flow, nodeId, transform, options);
  const leaving = report.verdicts.filter((v) => v.producer === nodeId);
  // **`kind` is read, and that is a repair.** This selected on `'result' in sample` alone — and
  // `WiringSample.result`'s own doc comment is *what it produced, OR THE FAILURE'S MESSAGE*. So on a
  // `transform-fails` verdict this returned the shape of the ERROR TEXT as the node's output: measured
  // with a language whose `evaluate` throws, `{ schema: { type: 'string' } }` for the message `"boom"`,
  // with no `why`, to an authoring UI whose whole purpose is to show what the node emits. W109's
  // conformity reader, 4 — the one case the item's own *this is the claim easiest to make falsely*
  // note did not guard. A failed transform produced NOTHING, so it reports the failure instead.
  const failed = into.find((v) => v.kind === 'transform-fails');
  const withResult = into.find((v) => v.kind !== 'transform-fails' && v.sample !== undefined && 'result' in (v.sample as object));
  if (withResult === undefined) {
    const why = into.length === 0
      ? `"${nodeId}" has no arcs into it — nothing arrives, so there is no sample to transform (an entry node's value is the run's payload)`
      : (failed ?? into[0]!).why;
    // A FAILED transform's sample is returned — the value it was handed and the message it threw —
    // because that is what an author needs to see; what is withheld is the SCHEMA, because a schema
    // here would be the shape of an error string presented as the node's output.
    return { node: nodeId, leaving, why, ...(failed?.sample !== undefined ? { sample: failed.sample } : {}) };
  }
  const sample = withResult.sample!;
  const schema = schemaOfValue(sample.result);
  return {
    node: nodeId, sample, leaving,
    ...(schema !== undefined
      ? { schema }
      : { why: `the transform produced ${sample.result === undefined ? 'undefined' : typeof sample.result}, which the schema subset cannot describe` }),
  };
}

// ---- (3) the generated signature -----------------------------------------------------------------

/**
 * **The five SCALAR type names, and `integer` is the one that is not its own** — `object` and
 * `array` are NOT here because `one()` answers those before it reads this map, and an entry that
 * is never read is a list bound to nothing (W74's adequacy reader, A7). `PATH_TYPES_TS` below is
 * the membership: this map's keys plus those two ARE `SCHEMA_TYPES`, compared both ways by a test.
 */
const TS_NAMES = new Map([['string', 'string'], ['number', 'number'], ['integer', 'number'], ['boolean', 'boolean'], ['null', 'null']]);
/** The two type names `one()` answers before reading `TS_NAMES` — named so the membership above is total. */
const TS_STRUCTURED: readonly string[] = ['object', 'array'];
const lit = (v: unknown): string => JSON.stringify(v);

/**
 * **A TypeScript type for one schema of the subset** — the SHAPE and not the constraints, which is
 * the sentence P19 decision 9 asks the reference to carry rather than calling this enforcement. A
 * `minimum`, a `maxLength` and a `minItems` are all invisible here on purpose: no type system in
 * this language holds them, and pretending otherwise is the *ignored keyword* defect
 * ([Q278](../../doc/open-questions.md)) one layer out.
 *
 * `examples` is an annotation and is not read (ADR 0056 rule 1). An OPEN object gets an index
 * signature, because a schema that does not say `additionalProperties: false` is saying *there are
 * keys I do not describe* — measured against `json-schema-to-typescript` 15.0.4, which closes it
 * (W74 fact D). `additionalProperties` holding a schema — the map record no author can write — is
 * `Record<string, T>`.
 */
export function tsTypeOf(schema: JsonSchema | undefined, indent = ''): string {
  const s = (schema ?? {}) as Record<string, unknown>;
  if (s.const !== undefined) return lit(s.const);
  if (Array.isArray(s.enum)) return s.enum.length === 0 ? 'never' : s.enum.map(lit).join(' | ');
  // **A schema with no `type` is `unknown`, even when it describes properties** — W74's adequacy
  // reader (A3/A4). The two earlier roads here emitted an OBJECT type for `{ properties: … }`,
  // which `pathsOf` reports as `*` (*admits every type*) — two assists disagreeing about one
  // schema, and a worker generated from that signature refusing a legal value of its own schema.
  // It is the SECOND measured difference from `json-schema-to-typescript`, which types such a
  // schema as an object; this is the sound reading and section 15 names both. Measured: ZERO of
  // the 127 sub-schemas the three corpora declare are open-with-properties, so no emitted line
  // moves. The map record always carries `type: 'object'`, so `object()` below is its road.
  if (s.type === undefined) return 'unknown';
  const types = Array.isArray(s.type) ? (s.type as string[]) : [s.type as string];
  return types.map((t) => one(t, s, indent)).join(' | ');
}

function one(t: string, s: Record<string, unknown>, indent: string): string {
  if (t === 'object') return object(s, indent);
  if (t === 'array') return s.items === undefined ? 'unknown[]' : `(${tsTypeOf(s.items as JsonSchema, indent)})[]`;
  return TS_NAMES.get(t) ?? 'unknown';
}

function object(s: Record<string, unknown>, indent: string): string {
  if (isPlainObject(s.additionalProperties)) return `Record<string, ${tsTypeOf(s.additionalProperties as JsonSchema, indent)}>`;
  const props = Object.entries((s.properties ?? {}) as Record<string, JsonSchema>);
  const closed = s.additionalProperties === false;
  if (props.length === 0) return closed ? 'Record<string, never>' : 'Record<string, unknown>';
  const req = new Set((s.required ?? []) as string[]);
  // **A key named only by `required` is emitted too, typed `unknown`** — W74's conformity reader
  // (finding 12): `pathsOf` emits `$.a` for it and `object()` dropped it, so the two assists
  // disagreed about one document and a worker's author lost a key their schema GUARANTEES.
  const named = [...props.map(([k]) => k)];
  const all: [string, JsonSchema][] = [...props, ...[...req].filter((k) => !named.includes(k)).map((k) => [k, {}] as [string, JsonSchema])];
  const body = all.map(([k, sub]) => `${indent}  ${lit(k)}${req.has(k) ? '' : '?'}: ${tsTypeOf(sub, `${indent}  `)};`).join('\n');
  const rest = closed ? '' : `\n${indent}  [k: string]: unknown;`;
  return `{\n${body}${rest}\n${indent}}`;
}

/**
 * **The three schemas a signature is generated from, PICKED from `WorkerEntry` rather than restated**
 * — W74's conformity reader (finding 10). Written as its own three-field interface this was a fourth
 * list beside `WorkerEntry`'s five fields and `WORKER_KEYS`' five names with nothing comparing them,
 * so a fifth schema kind would reach the entry and the refusal list and silently not reach the
 * generator ([Q217](../../doc/open-questions.md)'s shape, obligation (e)'s third). `configSchema` is
 * deliberately NOT picked: a signature is what a worker's author writes `run()` against, and the
 * config is the pool's.
 */
export type WorkerSchemas = Pick<WorkerEntry, 'settingsSchema' | 'inputSchema' | 'outputSchema'>;

/**
 * **The TypeScript a worker's author writes against, as TEXT** — four declarations named for
 * `name`: `<Name>Settings`, `<Name>Input`, `<Name>Output` and the `<Name>Envelope` a typed node's
 * worker actually receives (`FD-C5`: `{ settings, input }`, `input` being what the node received,
 * transformed where the node declares one).
 *
 * `name` is used as a TypeScript identifier and is the caller's to make one; a registry KEY is
 * lower-case by convention, so a generator capitalises it. A schema the entry does not declare is
 * `unknown`, which is what *nothing is declared about this side* means and is what makes the
 * generated worker refuse to read it without a check.
 */
export function signatureOf(name: string, worker: WorkerSchemas): string {
  return [
    `/** Generated from the registry document's ${lit(name)} worker entry, by \`signatureOf\`.`,
    ` *  Types catch the SHAPE and not the constraints: a number below a declared \`minimum\`, a`,
    ` *  string past a \`maxLength\` and a short array all typecheck. \`npm run check:workers\` and`,
    ` *  \`checkWiring\` are what see those. Do not edit by hand. */`,
    `export type ${name}Settings = ${tsTypeOf(worker.settingsSchema)};`,
    `export type ${name}Input = ${tsTypeOf(worker.inputSchema)};`,
    `export type ${name}Output = ${tsTypeOf(worker.outputSchema)};`,
    `export interface ${name}Envelope { settings: ${name}Settings; input: ${name}Input; }`,
  ].join('\n');
}

/** Every worker of a registry document, one signature each, in the document's own key order. */
export function signaturesOf(workers: Readonly<Record<string, WorkerSchemas>>): string {
  return Object.entries(workers)
    .map(([key, w]) => {
      // **A key that is not a TypeScript identifier is REFUSED here rather than emitted** — W74's
      // adequacy reader: `signatureOf`'s header says `name` is the caller's to make an identifier,
      // and THIS is the caller. A registry key may be any non-empty string, so `my-worker` emitted
      // `export type My-workerSettings = unknown;` — text that does not compile, with no
      // diagnostic. Fact D's *the emitted text typechecks* was bound by 26 keys that happen to be
      // safe. Loud here, where the key is, rather than at a consumer's `tsc`.
      if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) {
        throw new Error(`signaturesOf: worker key ${JSON.stringify(key)} is not a TypeScript identifier, so no signature can be named for it — pass signatureOf a name of your own`);
      }
      return signatureOf(key.charAt(0).toUpperCase() + key.slice(1), w);
    })
    .join('\n\n');
}

/** The type names `pathsOf` may report, `*` included — bound to the subset's own list by a test. */
export const PATH_TYPES: readonly string[] = ['*', ...TYPES];
/**
 * **Every type name `tsTypeOf` can be handed, and where each is answered** — the scalars from
 * `TS_NAMES`, the two structured ones from `one()`. A test compares this to `SCHEMA_TYPES` BOTH
 * WAYS and by count, because a map whose entries nothing reaches is a list bound to nothing.
 */
export const TS_TYPE_NAMES: readonly string[] = [...TS_STRUCTURED, ...TS_NAMES.keys()];
