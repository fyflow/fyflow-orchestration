/**
 * **A WITNESS that a schema is satisfiable — the LEAST value the subset admits, for a schema that
 * declares no `examples`** — [P19](../../doc/plans/p19-what-a-schema-buys-an-author.md) fact 5,
 * [ADR 0056](../../doc/decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md)
 * rule 3, [W73](../../doc/work-items/w73-the-wiring-check-a-verdict-per-edge-and-two-boundaries-validated-once.md)
 * Outputs (6) — lifted here from `scripts/check-workers.mjs`, where W72 kept it, because the
 * wiring check needs it in the library and W74's assist imports it too; the check now imports
 * this one copy ([Q301](../../doc/open-questions.md)).
 *
 * **What it is and is not.** A required property with no schema is `null`; an unbounded string is
 * empty; a bounded-below number sits ON its minimum and a bounded-above one just under its maximum;
 * an array carries `minItems` items and an object carries only what `required` names; a `const` or
 * `enum` yields its first value; a type list yields its FIRST type. It proves the schema can be
 * satisfied and nothing else — W72 measured that on the corpus it is `{}` for thirteen of fourteen
 * input schemas and reaches fewer output paths than the declared example in five of twelve
 * described workers. **So a declared example is primary and this is the fallback, and every
 * verdict built on a witness says so** (`sampleOf` below carries the word).
 *
 * Pure over data, no `node:` import, no clock (`RT-R3`, `RT-R4`). Takes a schema already known to
 * be in the subset (`schemaProblem` first, as `findings` requires) — a keyword outside it is not
 * read here, which is ADR 0053 rule 5's order.
 */
import type { JsonSchema } from './schema.ts';

/** The least value `schema` admits. */
export function witness(schema: JsonSchema, path = '$'): unknown {
  const s = schema as Record<string, unknown>;
  if (s.const !== undefined) return s.const;
  if (Array.isArray(s.enum)) return s.enum[0];
  const types = s.type === undefined ? ['object'] : Array.isArray(s.type) ? (s.type as string[]) : [s.type as string];
  const t = types[0];
  switch (t) {
    case 'null': return null;
    case 'boolean': return true;
    case 'integer': case 'number': {
      const lo = typeof s.minimum === 'number' ? s.minimum : typeof s.maximum === 'number' ? (s.maximum as number) - 1 : 0;
      return t === 'integer' ? Math.ceil(lo) : lo;
    }
    case 'string': return 'x'.repeat(typeof s.minLength === 'number' ? s.minLength : 0);
    case 'array': {
      const n = typeof s.minItems === 'number' ? s.minItems : 0;
      const items = s.items as JsonSchema | undefined;
      return Array.from({ length: n }, (_, i) => (items ? witness(items, `${path}[${i}]`) : null));
    }
    case 'object': {
      const out: Record<string, unknown> = {};
      const props = (s.properties ?? {}) as Record<string, JsonSchema>;
      for (const k of (s.required ?? []) as string[]) out[k] = props[k] ? witness(props[k]!, `${path}.${k}`) : null;
      return out;
    }
    default: throw new Error(`${path}: no witness for type ${JSON.stringify(t)}`);
  }
}

/** Where a sample came from — the word every verdict built on one carries (Q301). */
export type SampleSource = 'example' | 'witness';

/**
 * **The value a tool runs on for one schema, and which it was**: the FIRST declared example (ADR
 * 0056 rule 3), else the witness. A schema of `undefined` — a worker that declares none — has no
 * sample; the caller says UNCHECKED rather than inventing one.
 */
export function sampleOf(schema: JsonSchema | undefined): { value: unknown; source: SampleSource } | undefined {
  if (schema === undefined) return undefined;
  const ex = (schema as { examples?: unknown }).examples;
  if (Array.isArray(ex) && ex.length > 0) return { value: ex[0], source: 'example' };
  return { value: witness(schema), source: 'witness' };
}
