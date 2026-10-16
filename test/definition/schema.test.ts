/**
 * **The built-in JSON Schema subset — every keyword, both ways, and the refusal of everything
 * else** — `spec/flow-definition.md` section 3's registry-document subsection (v0.19),
 * [ADR 0053](../../doc/decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md),
 * [Q278](../../doc/questions/q278.md), [W65](../../doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md).
 *
 * **The fourteen cases are P18 fact 1's, verbatim** — the sample's six schemas and the values the
 * declaration measured against the prototype (`dev-dist/p18/subset-validator-check.mjs`), with the
 * expected finding COUNT each carried there. They are fixtures rather than a re-run: the prototype
 * was a seed to rewrite, and what is asserted is that the shipped validator agrees with the
 * measurement the decision was priced on. Every other expected value is the keyword's own meaning
 * in JSON Schema, stated in the spec's table.
 *
 * **Every keyword has a positive AND a negative case, and the keyword list is compared to the
 * spec's table both ways** (rule 8 obligation (a) — the rule ENUMERATES its values, so the set is
 * that enumeration; (e)'s third shape — a list is a claim about another list).
 */
import { equal, ok, readText, ROOT, suite } from '../harness.ts';
import { canonical, describeFindings, findings, SCHEMA_KEYWORDS, SCHEMA_TYPES, schemaProblem, type JsonSchema } from '../../src/definition/schema.ts';
import { fits } from '../../src/definition/wiring.ts';
// W164's readers' items: the generators, the registry, the validator and a driver run are each a reader the four
// annotations must not move.
import { sampleOf, witness } from '../../src/definition/witness.ts';
import { resolveRegistry, SchemaRefused } from '../../src/definition/registry.ts';
import { validateDefinition } from '../../src/definition/validate.ts';
import type { FlowDefinition, GateType, Registry } from '../../src/definition/types.ts';
import { Driver } from '../../src/driver/driver.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import { fold } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';

/** P18 fact 1's six schemas — the sample's, as `dev-dist/p18/subset-validator-check.mjs` wrote them. */
const S: Record<string, JsonSchema> = {
  config: { type: 'object', required: ['model'], properties: { model: { type: 'string' } } },
  settings: { type: 'object', required: ['prompt'], properties: { prompt: { type: 'string' }, temperature: { type: 'number' } } },
  gpu: { type: 'object', required: ['model'], properties: { model: { enum: ['small', 'large'] } } },
  budget: { type: 'object', required: ['tokensPerDay'], properties: { tokensPerDay: { type: 'number', minimum: 0 } } },
  windows: { type: 'object', required: ['windows'], properties: { windows: { type: 'array', minItems: 1, items: { type: 'object', required: ['limit', 'windowMs'], properties: { limit: { type: 'integer', minimum: 1 }, windowMs: { type: 'integer', minimum: 1 } } } } } },
  limit: { type: 'object', required: ['limit'], properties: { limit: { type: 'integer', minimum: 1 } }, additionalProperties: false },
};
/** [name, schema, value, expected finding count] — fact 1's table, 14 rows, 14 of 14 as expected at the declaration. */
const FACT1: readonly [string, JsonSchema, unknown, number][] = [
  ['config ok', S.config!, { model: 'small' }, 0], ['config missing', S.config!, {}, 1], ['config wrong type', S.config!, { model: 3 }, 1],
  ['settings ok', S.settings!, { prompt: 'x', temperature: 0 }, 0], ['settings temp string', S.settings!, { prompt: 'x', temperature: '0' }, 1],
  ['gpu enum ok', S.gpu!, { model: 'large' }, 0], ['gpu enum bad', S.gpu!, { model: 'huge' }, 1],
  ['budget negative', S.budget!, { tokensPerDay: -1 }, 1], ['budget ok', S.budget!, { tokensPerDay: 10 }, 0],
  ['windows ok', S.windows!, { windows: [{ limit: 60, windowMs: 60000 }] }, 0], ['windows empty', S.windows!, { windows: [] }, 1], ['windows non-integer', S.windows!, { windows: [{ limit: 1.5, windowMs: 1 }] }, 1],
  ['limit extra key', S.limit!, { limit: 2, name: 'x' }, 1], ['limit not integer', S.limit!, { limit: 2.5 }, 1],
];

suite('ADR 0053 — the subset validates P18 fact 1`s fourteen cases exactly as the measurement said', (test) => {
  test('14 rows, each with the finding count the declaration measured, and every schema in the subset', () => {
    equal(FACT1.length, 14, 'fact 1 measured fourteen cases and this is that table');
    ok(new Set(FACT1.map(([n]) => n)).size === 14, 'labels distinct');
    for (const [name, schema, value, want] of FACT1) {
      equal(schemaProblem(schema), null, `${name}: the schema is in the subset`);
      const fs = findings(schema, value);
      equal(fs.length, want, `${name}: ${want} finding(s), got ${fs.length} — ${describeFindings(fs)}`);
    }
    // The pair that decides "does it discriminate": the same schema accepts one value and refuses another.
    ok(FACT1.some(([, , , w]) => w === 0) && FACT1.some(([, , , w]) => w === 1), 'the table carries both verdicts');
  });
  test('the six schemas are the SAMPLE`s — every one the plan`s registry document or shim declares', () => {
    // The sample (P18 "The minimum sample") declares exactly: prompt's config and settings schemas, GpuModel's
    // enum schema, the budget group's, and the two built-in group shapes fact 2 read off the .d.ts.
    equal(Object.keys(S).sort(), ['budget', 'config', 'gpu', 'limit', 'settings', 'windows'], 'six, named for what declares them');
  });
});

suite('ADR 0053 — every keyword of the subset, a positive and a negative case each, and the list bound to the spec both ways', (test) => {
  test('the keyword list is EXACTLY the spec`s table, both ways', async () => {
    const spec = await readText(`${ROOT}spec/flow-definition.md`);
    // The table's rows are `| `keyword` | ... |` between the subsection heading and the next heading.
    const from = spec.indexOf('#### The schema subset');
    ok(from >= 0, 'section 3 has the schema-subset subsection');
    const body = spec.slice(from);
    const table = body.slice(0, body.indexOf('\n##', 1));
    const inSpec = [...table.matchAll(/^\|\s*`([A-Za-z]+)`\s*\|/gm)].map((m) => m[1]!).sort();
    equal(inSpec, [...SCHEMA_KEYWORDS].sort(), 'the spec`s table names exactly the keywords the validator admits');
    equal(SCHEMA_KEYWORDS.length, 17, 'seventeen — fact 1`s twelve, `examples` (ADR 0056, v0.20) and the four annotations of ADR 0098 (v0.36)');
    equal(SCHEMA_KEYWORDS.filter((k) => k === 'examples').length, 1, 'and examples is in it once');
    // W164: which rows ANNOTATE is a claim the spec`s table makes in its third column — ADR 0098 cost 3, a reader
    // counting SCHEMA_KEYWORDS to learn what is checked is wrong by five — so the five rows that say so are bound too.
    const annotating = [...table.matchAll(/^\|\s*`([A-Za-z]+)`\s*\|[^|\n]*\|\s*\*\*an ANNOTATION/gm)].map((m) => m[1]!).sort();
    equal(annotating, ['description', 'examples', 'readOnly', 'title', 'writeOnly'], 'the table marks exactly the five annotations as such');
    equal(SCHEMA_KEYWORDS.length - annotating.length, 12, 'and the rest are fact 1`s twelve that constrain');
    // And the SHAPE column the four annotations of ADR 0098 are checked against (the adequacy reader's F8): what
    // `schemaProblem` admits is what the table's second column says, both rows of each pair.
    const shapeOf = (k: string) => table.match(new RegExp(`^\\|\\s*\`${k}\`\\s*\\|([^|\\n]*)\\|`, 'm'))?.[1]?.trim();
    for (const k of ['title', 'description']) equal(shapeOf(k), 'a string', `the table gives ${k} the shape "a string"`);
    for (const k of ['readOnly', 'writeOnly']) equal(shapeOf(k), '`true` or `false`', `the table gives ${k} the shape "\`true\` or \`false\`"`);
  });
  test('type — each of the seven names, as a string and as a list, with integer refusing a fraction and number refusing NaN and Infinity', () => {
    equal(SCHEMA_TYPES.length, 7, 'seven type names');
    const samples: Record<string, unknown> = { object: {}, array: [], string: 's', number: 1.5, integer: 2, boolean: true, null: null };
    for (const t of SCHEMA_TYPES) {
      equal(findings({ type: t }, samples[t]), [], `${t} accepts its sample`);
      const other = Object.entries(samples).find(([k]) => k !== t && !(t === 'number' && k === 'integer'))!;
      equal(findings({ type: t }, other[1]).length, 1, `${t} refuses a ${other[0]}`);
    }
    equal(findings({ type: 'integer' }, 2.5).length, 1, 'integer refuses 2.5');
    equal(findings({ type: 'number' }, 2), [], 'number accepts an integer');
    equal(findings({ type: ['string', 'null'] }, null), [], 'a list of types: any of them');
    equal(findings({ type: ['string', 'null'] }, 5).length, 1, 'and refuses one outside the list');
    for (const v of [NaN, Infinity, -Infinity]) {
      equal(findings({ type: 'number' }, v).map((f) => f.says), ['expected number, got non-finite number'], `number refuses ${v}`);
      equal(findings({ type: 'integer' }, v).length, 1, `integer refuses ${v}`);
    }
    equal(findings({}, NaN), [], 'and with no type declared a non-finite number is not asked about');
  });
  test('required, properties, additionalProperties — presence, nested schemas, and the closed object', () => {
    equal(findings({ required: ['a'] }, { a: 1 }), [], 'required present');
    equal(findings({ required: ['a', 'b'] }, { a: 1 }), [{ path: '$.b', says: 'required' }], 'required absent names the key');
    equal(findings({ required: ['a'] }, { a: undefined }), [], 'present as an OWN key counts as present, as JSON Schema reads it — even holding undefined');
    equal(findings({ properties: { a: { type: 'string' } } }, { a: 5 }), [{ path: '$.a', says: 'expected string, got number' }], 'a nested schema reports its path');
    equal(findings({ properties: { a: { type: 'string' } } }, {}), [], 'a declared property may be absent unless required');
    equal(findings({ properties: { a: {} }, additionalProperties: false }, { a: 1, b: 2 }), [{ path: '$.b', says: 'not declared' }], 'additionalProperties: false refuses an undeclared key by name');
    equal(findings({ properties: { a: {} }, additionalProperties: true }, { a: 1, b: 2 }), [], 'additionalProperties: true is the open default, stated');
    equal(findings({ additionalProperties: false }, { z: 1 }), [{ path: '$.z', says: 'not declared' }], 'closed with no properties: every key is undeclared');
    equal(findings({ required: ['a'] }, 'not an object'), [], 'object keywords are silent on a non-object when no type is declared — the type clause is what says so');
  });
  test('enum and const — by VALUE, whatever the key order, so a reordered object is the same object', () => {
    equal(findings({ enum: ['a', 'b'] }, 'b'), [], 'enum accepts a member');
    equal(findings({ enum: ['a', 'b'] }, 'c').length, 1, 'enum refuses a non-member');
    equal(findings({ enum: [{ x: 1, y: 2 }] }, { y: 2, x: 1 }), [], 'an object member matched by value');
    equal(findings({ const: { x: 1, y: [1, 2] } }, { y: [1, 2], x: 1 }), [], 'const by value');
    equal(findings({ const: 5 }, 6).length, 1, 'const refuses');
    equal(canonical({ b: 1, a: [{ d: 1, c: 2 }] }), '{"a":[{"c":2,"d":1}],"b":1}', 'canonical text sorts keys at every level');
  });
  test('minimum, maximum, minLength, maxLength, minItems, items — the bounds inclusive, each with its violation named', () => {
    equal(findings({ minimum: 1 }, 1), [], 'minimum inclusive');
    equal(findings({ minimum: 1 }, 0.5), [{ path: '$', says: 'below minimum 1' }], 'below');
    equal(findings({ maximum: 1 }, 1), [], 'maximum inclusive');
    equal(findings({ maximum: 1 }, 2), [{ path: '$', says: 'above maximum 1' }], 'above');
    equal(findings({ minLength: 2 }, 'ab'), [], 'minLength inclusive');
    equal(findings({ minLength: 2 }, 'a'), [{ path: '$', says: 'shorter than 2' }], 'shorter');
    equal(findings({ maxLength: 2 }, 'abc'), [{ path: '$', says: 'longer than 2' }], 'longer');
    equal(findings({ minItems: 1 }, [1]), [], 'minItems inclusive');
    equal(findings({ minItems: 1 }, []), [{ path: '$', says: 'fewer than 1 items' }], 'fewer');
    equal(findings({ items: { type: 'integer' } }, [1, 2.5, 'x']).map((f) => f.path), ['$[1]', '$[2]'], 'items reports each failing index');
    equal(findings({ minimum: 1 }, 'not a number'), [], 'numeric bounds are silent on a non-number with no type declared');
  });
  test('a type mismatch ends the walk at that path, and the walk reports EVERY violation otherwise (two at once)', () => {
    equal(findings({ type: 'string', minLength: 3 }, 5).length, 1, 'one finding, the type, not two');
    const two = findings({ type: 'object', required: ['a'], properties: { b: { type: 'string' } } }, { b: 1 });
    equal(two.map((f) => f.path), ['$.a', '$.b'], 'a required key AND a wrong-typed one are both reported');
  });
  test('the empty schema accepts everything', () => {
    for (const v of [null, 1, 'x', [], {}, { a: [1] }, false]) equal(findings({}, v), [], `{} accepts ${JSON.stringify(v)}`);
    equal(schemaProblem({}), null, 'and is in the subset');
  });
});

suite('Q278 — a keyword outside the subset is REFUSED at construction naming it, and so is a malformed keyword value', (test) => {
  test('twelve keywords JSON Schema has and this subset does not, each refused by name — annotations included', () => {
    // W164: `description` and `title` left this list when ADR 0098 admitted them; `$comment` and `default` — two of
    // the annotations it still refuses — take their places, so the list stays twelve and keeps its annotations.
    const OUTSIDE = ['pattern', 'oneOf', 'anyOf', 'allOf', 'not', 'format', 'exclusiveMinimum', 'maxItems', 'uniqueItems', '$ref', '$comment', 'default'];
    equal(OUTSIDE.filter((k) => SCHEMA_KEYWORDS.includes(k)), [], 'none of these is in the subset (the negative list is a claim about the positive one)');
    for (const k of OUTSIDE) {
      const p = schemaProblem({ type: 'string', [k]: 'x' });
      ok(p !== null && p.includes(`"${k}"`) && p.includes('REFUSED'), `${k}: refused naming it — ${p}`);
    }
  });
  test('the refusal reaches a NESTED schema and names its path', () => {
    const p = schemaProblem({ type: 'object', properties: { model: { type: 'string', pattern: '^s' } } });
    ok(p !== null && p.startsWith('$.properties.model:') && p.includes('"pattern"'), `nested path and keyword: ${p}`);
    const q = schemaProblem({ type: 'array', items: { format: 'uri' } });
    ok(q !== null && q.startsWith('$.items:'), `inside items: ${q}`);
  });
  test('every keyword`s VALUE has a shape, and a wrong one is refused before any value is checked', () => {
    const BAD: readonly [string, unknown, string][] = [
      ['type not a name', { type: 'text' }, '$.type'],
      ['type an empty list', { type: [] }, '$.type'],
      ['type repeated', { type: ['string', 'string'] }, '$.type'],
      ['required not strings', { required: [1] }, '$.required'],
      ['required repeated', { required: ['a', 'a'] }, '$.required'],
      ['properties not an object', { properties: [] }, '$.properties'],
      ['additionalProperties a schema', { additionalProperties: { type: 'string' } }, '$.additionalProperties'],
      ['enum empty', { enum: [] }, '$.enum'],
      ['minimum not a number', { minimum: '1' }, '$.minimum'],
      ['maximum infinite', { maximum: Infinity }, '$.maximum'],
      ['minLength negative', { minLength: -1 }, '$.minLength'],
      ['maxLength a fraction', { maxLength: 1.5 }, '$.maxLength'],
      ['minItems a string', { minItems: '1' }, '$.minItems'],
      ['items a tuple', { items: [{ type: 'string' }] }, '$.items'],
      ['not an object at all', 'string', '$'],
      ['null', null, '$'],
    ];
    ok(BAD.length >= 14 && new Set(BAD.map(([l]) => l)).size === BAD.length, 'bounded and distinct');
    for (const [label, schema, at] of BAD) {
      const p = schemaProblem(schema);
      ok(p !== null && p.startsWith(`${at}:`), `${label}: refused at ${at} — ${p}`);
    }
  });
});

// W65's conformity reader: `in` walks Object.prototype, so a constraint on an inherited name was dropped in silence.
suite('the object keywords read OWN keys, never inherited ones', (test) => {
  test('required, properties and additionalProperties on names Object.prototype carries', () => {
    equal(findings({ type: 'object', required: ['constructor'] }, {}).map((f) => f.says), ['required'], 'required is satisfied by an OWN key, not by Object.prototype.constructor');
    equal(findings({ type: 'object', properties: { a: {} }, additionalProperties: false }, { toString: 1 }).map((f) => f.path), ['$.toString'], 'an own key named like a prototype member is undeclared');
    equal(findings({ type: 'object', properties: { toString: { type: 'string' } } }, {}), [], 'a declared property is read only when the key is OWN');
    equal(findings({ type: 'object', properties: { a: {} }, additionalProperties: false }, { b: 1 }).map((f) => f.path), ['$.b'], 'the control: an ordinary undeclared key');
  });
  // The adequacy reader (M01, M02, M03): the walk three levels down, `integer` inside a type LIST, and a
  // closed object BELOW the root — each observed at depth 1 only, so a validator that stopped there was green.
  test('three levels down: the refusal of an outside keyword, and a closed object inside items — M01, M03', () => {
    const deep = schemaProblem({ type: 'object', properties: { a: { type: 'object', properties: { b: { type: 'string', pattern: 'x' } } } } });
    ok(deep !== null && deep.startsWith('$.properties.a.properties.b:') && deep.includes('"pattern"'), `the walk reaches the third level and names its path: ${deep}`);
    const inItems = schemaProblem({ type: 'array', items: { type: 'object', properties: { w: { type: 'array', items: { type: 'number', multipleOf: 2 } } } } });
    ok(inItems !== null && inItems.startsWith('$.items.properties.w.items:'), `and through items twice: ${inItems}`);
    equal(findings({ type: 'array', items: { type: 'object', properties: { limit: {} }, additionalProperties: false } }, [{ limit: 1, burst: 2 }]).map((f) => f.path), ['$[0].burst'], 'additionalProperties: false is applied INSIDE items, naming the element`s key');
    equal(findings({ type: 'object', properties: { a: { type: 'object', properties: { b: {} }, additionalProperties: false } } }, { a: { b: 1, c: 2 } }).map((f) => f.path), ['$.a.c'], 'and inside a nested property');
  });
  test('integer inside a type LIST is honoured — M02', () => {
    equal(findings({ type: ['integer', 'null'] }, 2), [], 'an integer satisfies [integer, null]');
    equal(findings({ type: ['integer', 'null'] }, null), [], 'and so does null');
    equal(findings({ type: ['integer', 'null'] }, 2.5).length, 1, 'a fraction satisfies neither member');
    equal(findings({ type: ['integer', 'string'] }, 2.5).map((f) => f.says), ['expected integer|string, got number'], 'and the finding names the list');
  });
});

// ADR 0056 — `examples` is an ANNOTATION: the thirteenth keyword, held to the schema it sits on at
// construction and read by nothing when a value is validated. W72, P19 decision 2. The three rules
// are each fixtured both ways here, on every shape the keyword can sit on — a top-level schema, a
// property's, an item's — because a walk that checked it at depth 1 only would be green (W65's
// adequacy reader's M01, one keyword later).
suite('ADR 0056 — examples is an annotation: held to its schema at construction, ignored by every value check', (test) => {
  test('rule 1: findings never reads it — the same verdicts with and without the keyword, and a value outside the list is not refused', () => {
    const bare: JsonSchema = { type: 'object', required: ['n'], properties: { n: { type: 'integer', minimum: 1 } } };
    const annotated: JsonSchema = { ...bare, examples: [{ n: 1 }, { n: 7 }], properties: { n: { type: 'integer', minimum: 1, examples: [3] } } };
    equal(schemaProblem(annotated), null, 'the annotated schema is in the subset');
    for (const v of [{ n: 1 }, { n: 99 }, { n: 0 }, {}, { n: 'x' }, 'not an object']) {
      equal(findings(annotated, v), findings(bare, v), `${JSON.stringify(v)}: identical findings with the annotation and without`);
    }
    equal(findings(annotated, { n: 99 }), [], 'a conforming value that is in NO example is accepted — an example is not an enum');
    equal(findings({ type: 'string', examples: ['a'] }, 'b'), [], 'and at a leaf');
  });
  test('rule 2: an example that refutes the schema it sits on is refused at construction, naming the index and the finding — every depth', () => {
    const top = schemaProblem({ type: 'object', required: ['n'], examples: [{ n: 1 }, {}] });
    ok(top !== null && top.startsWith('$.examples[1]:') && top.includes('$.n required'), `top level, the second example, the finding: ${top}`);
    const prop = schemaProblem({ type: 'object', properties: { s: { type: 'string', minLength: 2, examples: ['ab', 'x'] } } });
    ok(prop !== null && prop.startsWith('$.properties.s.examples[1]:') && prop.includes('shorter than 2'), `under properties: ${prop}`);
    const item = schemaProblem({ type: 'array', items: { type: 'integer', examples: [2.5] } });
    ok(item !== null && item.startsWith('$.items.examples[0]:') && item.includes('expected integer'), `under items: ${item}`);
    const deep = schemaProblem({ type: 'object', properties: { a: { type: 'object', properties: { b: { enum: ['x'], examples: ['y'] } } } } });
    ok(deep !== null && deep.startsWith('$.properties.a.properties.b.examples[0]:'), `three levels down: ${deep}`);
    // The refusal is about the example, not about a value: the empty schema accepts everything, so no example can refute it.
    equal(schemaProblem({ examples: [null, 1, 'x', [], {}] }), null, 'the empty schema is refuted by nothing');
    // ORDER (ADR 0053 rule 5, ADR 0056 rule 2): an example is held to the schema only once every keyword of the
    // schema is known to be in the subset — so a nested outside keyword is reported as ITSELF, never as the
    // example that would have failed under it.
    const order = schemaProblem({ type: 'object', properties: { a: { type: 'string', pattern: 'x' } }, examples: [{ a: 5 }] });
    ok(order !== null && order.startsWith('$.properties.a:') && order.includes('"pattern"'), `the outside keyword is reported first: ${order}`);
  });
  test('rule 2, the keyword`s own shape: a non-array or an EMPTY list is refused before any example is read', () => {
    for (const bad of [[], 'x', 5, null, { a: 1 }]) {
      const p = schemaProblem({ type: 'string', examples: bad });
      ok(p !== null && p.startsWith('$.examples:') && p.includes('NON-EMPTY'), `${JSON.stringify(bad)}: refused as the keyword's misuse — ${p}`);
    }
  });
  test('rule 3 (the control): an example that conforms is accepted, on every one of the seven types and on a nested schema', () => {
    const okCases: [JsonSchema, string][] = [
      [{ type: 'object', examples: [{}] }, 'object'], [{ type: 'array', examples: [[1]] }, 'array'], [{ type: 'string', examples: ['s'] }, 'string'],
      [{ type: 'number', examples: [1.5] }, 'number'], [{ type: 'integer', examples: [2] }, 'integer'], [{ type: 'boolean', examples: [true] }, 'boolean'],
      [{ type: 'null', examples: [null] }, 'null'],
      [{ type: 'object', required: ['w'], properties: { w: { type: 'array', minItems: 1, items: { type: 'string', examples: ['a'] } } }, examples: [{ w: ['a'] }] }, 'nested, with an example at both levels'],
    ];
    for (const [s, label] of okCases) equal(schemaProblem(s), null, `${label}: accepted`);
    equal(okCases.length, 8, 'the seven types and one nested shape');
  });
  // The adequacy reader (R1): rule 2 was fixtured against five of the twelve constraining keywords, and a
  // validator that held an example to the others' negation — or to a parent's `items`, or to the second
  // shape of nesting — was green everywhere. The rule ENUMERATES its values (v0.17), so the set is all twelve.
  test('rule 2 over EVERY constraining keyword: each can refute an example, at both nesting shapes, on a third example, and the ORDER against a malformed bound', () => {
    const refuted: [string, JsonSchema][] = [
      ['type (single)', { type: 'string', examples: [1] }],
      ['type (a LIST)', { type: ['string', 'null'], examples: [1] }],
      ['required', { type: 'object', required: ['a'], examples: [{}] }],
      ['properties', { type: 'object', properties: { a: { type: 'string' } }, examples: [{ a: 1 }] }],
      ['additionalProperties', { type: 'object', properties: { a: {} }, additionalProperties: false, examples: [{ b: 1 }] }],
      ['enum', { enum: ['a'], examples: ['b'] }],
      ['const', { const: 1, examples: [2] }],
      ['minimum', { type: 'number', minimum: 1, examples: [0] }],
      ['maximum', { type: 'number', maximum: 1, examples: [2] }],
      ['minLength', { type: 'string', minLength: 2, examples: ['a'] }],
      ['maxLength', { type: 'string', maxLength: 1, examples: ['ab'] }],
      ['items', { type: 'array', items: { type: 'integer' }, examples: [['x']] }],
      ['minItems', { type: 'array', minItems: 1, examples: [[]] }],
      ['a third example, the first two conforming', { type: 'integer', examples: [1, 2, 2.5] }],
      ['properties inside items', { type: 'array', items: { type: 'object', properties: { a: { type: 'string', examples: [5] } } } }],
      ['items inside properties', { type: 'object', properties: { a: { type: 'array', items: { type: 'integer', examples: ['x'] } } } }],
    ];
    equal(refuted.length, 16, 'twelve constraining keywords, a third example, and both nesting shapes');
    for (const [label, s] of refuted) {
      const p = schemaProblem(s);
      ok(p !== null && p.includes('.examples[') && p.includes('does not conform'), `${label}: the example is refused as refuting — ${p}`);
    }
    equal(schemaProblem({ type: 'integer', examples: [1, 2, 3] }), null, 'the control: three conforming examples');
    // ORDER, the other two keywords a value check reads after the example would be held: a malformed
    // `maxLength` and a malformed `items` are reported as THEMSELVES, never as the example that fails under them.
    const bound = schemaProblem({ type: 'string', maxLength: -1, examples: ['xx'] });
    ok(bound !== null && bound.startsWith('$.maxLength:'), `a malformed bound is reported before the example: ${bound}`);
    const items = schemaProblem({ type: 'array', items: { type: 'integer', pattern: 'x' }, examples: [['a']] });
    ok(items !== null && items.startsWith('$.items:') && items.includes('"pattern"'), `an outside keyword under items is reported before the example: ${items}`);
  });
  // W164: `description` and `title` are admitted since v0.36 (ADR 0098) and left this loop; the annotations
  // P37 decision 4 still refuses by name took their places, beside `example`, the singular a typo writes.
  test('an ANNOTATION keyword outside the subset is still refused beside a valid examples — five are admitted, by name, in the one list', () => {
    for (const k of ['deprecated', '$comment', 'default', 'format', '$schema', '$id', 'example']) {
      const p = schemaProblem({ type: 'string', [k]: 'x', examples: ['x'] });
      ok(p !== null && p.includes(`"${k}"`), `${k}: refused beside a valid examples — ${p}`);
    }
  });
});

// W164 — ADR 0098, P37 decision 4 (v0.36): four ANNOTATIONS join the subset — `title` and `description` a string,
// `readOnly` and `writeOnly` a boolean. Each is fixtured at the THREE places a keyword sits (the top, under
// `properties`, under `items` — ADR 0056 rule 6's places, and W65's M01 for why depth 1 alone is not enough), and
// against BOTH value checks the library has — `findings` and the wiring relation `fits` — because *constrains
// nothing* is a claim about each reader, and the bar (ADR 0098 rule 5) is that claim plus the shape check.
// Expected values are the spec's table: the shape column, and "constrains NOTHING".
/** The four, each with a value of the shape the spec's table gives it. */
const ANNOTATIONS: readonly [string, unknown][] = [['title', 'Input'], ['description', 'what the worker reads'], ['readOnly', true], ['writeOnly', true]];
/**
 * For each, values of every OTHER JSON kind — so a check that admitted a second kind is refused by one of them. The
 * two lists of a shape are the SAME list (the adequacy reader's F3: a narrowing to one keyword's list survived
 * where the two differed), each value of a kind written both ways where the kind has two (`'true'` and `'false'`,
 * `[]` and a non-empty list, `{}` and a non-empty object).
 */
const NOT_A_STRING: readonly unknown[] = [5, 0, true, false, null, [], ['Input'], {}, { text: 'Input' }];
const NOT_A_BOOLEAN: readonly unknown[] = ['true', 'false', '', 1, 0, null, [], [true], {}, { on: true }];
const WRONG_SHAPE: Record<string, readonly unknown[]> = {
  title: NOT_A_STRING, description: NOT_A_STRING, readOnly: NOT_A_BOOLEAN, writeOnly: NOT_A_BOOLEAN,
};
/** A sub-schema four levels down — `items`, `properties`, `items`, `properties` — with `k` on its leaf. */
const DEEP = (k: string, v: unknown): [string, JsonSchema] => ['$.items.properties.a.items.properties.b', {
  type: 'array', items: { type: 'object', properties: { a: { type: 'array', items: { type: 'object', properties: { b: { type: 'string', [k]: v } } } } } },
}];
/** The six P37 decision 4 still refuses — each with a value of the shape JSON Schema gives it, so the refusal is of the KEYWORD. */
const STILL_REFUSED: readonly [string, unknown][] = [
  ['deprecated', true], ['$comment', 'a note'], ['default', 'x'], ['format', 'email'],
  ['$schema', 'https://json-schema.org/draft/2020-12/schema'], ['$id', 'https://example.com/input.json'],
];
/** The three places, each as [the path schemaProblem names, the schema with k, the same schema without it, a RIVAL `fits` says `no` against, both ways]. */
const PLACES = (k: string, v: unknown): [string, JsonSchema, JsonSchema, JsonSchema][] => [
  ['$', { type: 'object', [k]: v, properties: { a: { type: 'string' } } }, { type: 'object', properties: { a: { type: 'string' } } },
    { type: 'object', required: ['a'], properties: { a: { type: 'number' } } }],
  ['$.properties.a', { type: 'object', properties: { a: { type: 'string', [k]: v } } }, { type: 'object', properties: { a: { type: 'string' } } },
    { type: 'object', required: ['a'], properties: { a: { type: 'number' } } }],
  ['$.items', { type: 'array', items: { type: 'string', [k]: v } }, { type: 'array', items: { type: 'string' } },
    { type: 'array', items: { type: 'number' } }],
];
/** Values each place is asked about — conforming AND refused, so a reader that dropped or added a finding differs. */
const VALUES: Record<string, readonly unknown[]> = {
  '$': [{ a: 'x' }, { a: 5 }, {}, 'not an object', null],
  '$.properties.a': [{ a: 'secret' }, { a: 5 }, {}, []],
  '$.items': [['x', 'y'], ['x', 5], [], 'not an array'],
};

suite('W164 — four annotations in the schema subset: title, description, readOnly, writeOnly — shape-checked, constraining nothing (ADR 0098)', (test) => {
  test('each of the four is ADMITTED at the top, under properties and under items — and all four together, beside examples, three levels down', () => {
    equal(ANNOTATIONS.map(([k]) => k), ['title', 'description', 'readOnly', 'writeOnly'], 'the four P37 decision 4 names');
    for (const [k, v] of ANNOTATIONS) {
      ok(SCHEMA_KEYWORDS.includes(k), `${k} is in SCHEMA_KEYWORDS`);
      const places = PLACES(k, v);
      equal(places.length, 3, 'three places');
      for (const [where, s] of places) equal(schemaProblem(s), null, `${k} at ${where}: admitted`);
    }
    for (const k of ['readOnly', 'writeOnly']) equal(schemaProblem({ type: 'string', [k]: false }), null, `${k}: false is the other boolean, admitted`);
    for (const k of ['title', 'description']) equal(schemaProblem({ type: 'string', [k]: '' }), null, `${k}: the empty string is a string, admitted`);
    equal(schemaProblem({ type: 'string', readOnly: true, writeOnly: true }), null, 'readOnly and writeOnly both true: JSON Schema does not forbid it, and nor does the subset');
    const all: JsonSchema = {
      type: 'object', title: 'T', description: 'D', readOnly: false, writeOnly: true, examples: [{ a: [{ b: 'x' }] }],
      properties: { a: { type: 'array', title: 'A', items: { type: 'object', description: 'an item', properties: { b: { type: 'string', readOnly: true, writeOnly: true, title: 'B', examples: ['x'] } } } } },
    };
    equal(schemaProblem(all), null, 'all four at every depth to three, beside examples at two');
  });

  test('each is REFUSED on a wrong value shape — every other JSON kind — at each of the three places, naming the path and the keyword', () => {
    for (const [k] of ANNOTATIONS) {
      const wrong = WRONG_SHAPE[k]!;
      ok(wrong.length >= 9, `${k}: every other JSON kind, each spelled both ways`);
      for (const bad of wrong) {
        // The three places, and DEEP — depth four, the adequacy reader's F2: a check that stopped at depth 1 survived.
        for (const [where, s] of [...PLACES(k, bad), DEEP(k, bad)]) {
          const p = schemaProblem(s);
          ok(p !== null && p.startsWith(`${where}.${k}:`) && p.includes('ADR 0098'), `${k} = ${JSON.stringify(bad)} at ${where}: refused naming ${where}.${k} — ${p}`);
        }
      }
    }
    // The split between the two shapes, stated: a boolean where a string belongs, and a string where a boolean does.
    ok(schemaProblem({ title: true })?.startsWith('$.title:') === true, 'a boolean title is refused');
    ok(schemaProblem({ writeOnly: 'true' })?.startsWith('$.writeOnly:') === true, 'a string writeOnly is refused');
    // ORDER (ADR 0053 rule 5): a malformed annotation is reported as ITSELF, before any example is held to the schema.
    const order = schemaProblem({ type: 'string', description: 7, examples: [5] });
    ok(order !== null && order.startsWith('$.description:'), `the malformed annotation is reported, not the example under it: ${order}`);
    // ...and before `items` is walked — item choice 3 (the adequacy reader's F7): a malformed annotation on an array
    // schema is reported as itself, not as the outside keyword under its items.
    const beforeItems = schemaProblem({ type: 'array', title: 5, items: { format: 'x' } });
    ok(beforeItems !== null && beforeItems.startsWith('$.title:'), `the parent's malformed title before its items' format: ${beforeItems}`);
    // A malformed or outside keyword UNDER an annotated schema is still reached — the walk does not stop at an
    // annotation (the adequacy reader's F2, the writeOnly-sub-schema mutant), under properties and under items.
    for (const [k, v] of ANNOTATIONS) {
      const p = schemaProblem({ type: 'object', [k]: v, properties: { a: { type: 'object', [k]: v, properties: { b: { type: 'string', pattern: 'x' } } } } });
      ok(p !== null && p.startsWith('$.properties.a.properties.b:') && p.includes('"pattern"'), `${k} on two ancestors: the outside keyword below is refused — ${p}`);
      const q = schemaProblem({ type: 'array', [k]: v, items: { type: 'array', [k]: v, items: { type: 'string', minLength: -1 } } });
      ok(q !== null && q.startsWith('$.items.items.minLength:'), `${k} on two ancestors: the malformed bound below is refused — ${q}`);
      const [where, deep] = DEEP(k, v);
      equal(schemaProblem(deep), null, `${k} at ${where}: admitted at depth four`);
    }
  });

  test('each is read by NO value check — findings and fits give the same verdicts with it and without it, at each of the three places', () => {
    let refusedSeen = 0, noSeen = 0;
    for (const [k, v] of ANNOTATIONS) {
      for (const [where, withK, bare, rival] of PLACES(k, v)) {
        for (const value of VALUES[where]!) {
          const got = findings(withK, value);
          equal(got, findings(bare, value), `findings, ${k} at ${where}, ${JSON.stringify(value)}: identical with the annotation and without`);
          if (got.length) refusedSeen++;
        }
        // The relation between two declarations, the wiring check's `fits`: the annotated schema as the producer
        // and as the consumer, against the bare one and against a rival it does NOT fit.
        equal(fits(withK, bare), fits(bare, bare), `fits(${k} at ${where}, bare) is fits(bare, bare)`);
        equal(fits(bare, withK), fits(bare, bare), `fits(bare, ${k} at ${where}) is fits(bare, bare)`);
        equal(fits(withK, rival), fits(bare, rival), `fits(${k} at ${where}, rival) is fits(bare, rival)`);
        equal(fits(rival, withK), fits(rival, bare), `fits(rival, ${k} at ${where}) is fits(rival, bare)`);
        if (fits(bare, rival).verdict === 'no' && fits(rival, bare).verdict === 'no') noSeen++;
      }
    }
    // The controls: the comparisons above ran over refusals and `no` verdicts, so an annotation that ADDED or
    // DROPPED one would have differed — and the bare schema fits itself, so a `fits` that read the annotation would differ too.
    equal(refusedSeen, 4 * (3 + 2 + 2), 'every annotation at every place met the values its schema refuses (3 at the top, 2 under properties, 2 under items)');
    equal(noSeen, 4 * 3, 'every rival is `no` against its bare schema, both ways');
    equal(fits({ type: 'object', properties: { a: { type: 'string' } } }, { type: 'object', properties: { a: { type: 'string' } } }).verdict, 'fits', 'and a bare schema fits itself');
    // In the words of the spec's table: writeOnly hides nothing and readOnly refuses nothing.
    equal(findings({ type: 'object', required: ['token'], properties: { token: { type: 'string', writeOnly: true } } }, { token: 'secret' }), [], 'a value under writeOnly: true is accepted as any value is');
    equal(findings({ type: 'object', properties: { id: { type: 'string', readOnly: true } } }, { id: 'supplied' }), [], 'and a value supplied under readOnly: true is not refused');
    equal(findings({ type: 'string', title: 'T', description: 'D' }, 5).map((f) => f.says), ['expected string, got number'], 'and the type beside two annotations still refuses, alone');
  });

  test('the six P37 decision 4 still refuses are refused BY NAME at each of the three places — beside the four, with a value of their own shape', () => {
    equal(STILL_REFUSED.map(([k]) => k), ['deprecated', '$comment', 'default', 'format', '$schema', '$id'], 'the six, as decision 4 names them');
    for (const [k, v] of STILL_REFUSED) {
      ok(!SCHEMA_KEYWORDS.includes(k), `${k} is not in SCHEMA_KEYWORDS`);
      for (const [where, s] of PLACES(k, v)) {
        const p = schemaProblem(s);
        ok(p !== null && p.startsWith(`${where}:`) && p.includes(`"${k}"`) && p.includes('REFUSED'), `${k} at ${where}: refused naming it — ${p}`);
      }
      const beside = schemaProblem({ type: 'string', title: 'T', description: 'D', readOnly: true, writeOnly: false, [k]: v });
      ok(beside !== null && beside.includes(`"${k}"`), `${k}: refused beside all four admitted annotations — ${beside}`);
    }
  });

  // ---- After the readers (the coordinator's items 1, 4, 5 and 6) ----

  test('beside EVERY constraining keyword, and on its parent, the four change no finding — the adequacy reader`s F1', () => {
    // [the keyword, a schema whose only constraint is it, a value it accepts, a value it REFUSES] — each refusal read
    // off the keyword's row of the spec's table, never off `findings`.
    const CONSTRAINING: readonly [string, Record<string, unknown>, unknown, unknown][] = [
      ['type', { type: 'string' }, 'x', 1],
      ['required', { type: 'object', required: ['a'] }, { a: 1 }, {}],
      ['properties', { type: 'object', properties: { a: { type: 'string' } } }, { a: 'x' }, { a: 1 }],
      ['additionalProperties', { type: 'object', properties: { a: {} }, additionalProperties: false }, { a: 1 }, { b: 1 }],
      ['enum', { enum: ['a', 'b'] }, 'a', 'c'],
      ['const', { const: 1 }, 1, 2],
      ['minimum', { type: 'number', minimum: 1 }, 1, 0],
      ['maximum', { type: 'number', maximum: 1 }, 1, 2],
      ['minLength', { type: 'string', minLength: 2 }, 'ab', 'a'],
      ['maxLength', { type: 'string', maxLength: 1 }, 'a', 'ab'],
      ['items', { type: 'array', items: { type: 'string' } }, ['x'], [1]],
      ['minItems', { type: 'array', minItems: 1 }, [1], []],
    ];
    equal(CONSTRAINING.map(([k]) => k).sort(), SCHEMA_KEYWORDS.filter((k) => !['examples', 'title', 'description', 'readOnly', 'writeOnly'].includes(k)).sort(),
      'every constraining keyword of the subset, and nothing else — both ways');
    // Five places: beside the keyword at the top, under properties and under items; and on the PARENT of the
    // constrained sub-schema, under properties and under items (an annotation that switched its children off).
    const places = (s: Record<string, unknown>, ann: Record<string, unknown>, v: unknown): [string, JsonSchema, unknown][] => [
      ['beside, at the top', { ...s, ...ann }, v],
      ['beside, under properties', { type: 'object', properties: { p: { ...s, ...ann } } }, { p: v }],
      ['beside, under items', { type: 'array', items: { ...s, ...ann } }, [v]],
      ['on the parent, of properties', { type: 'object', ...ann, properties: { p: s } }, { p: v }],
      ['on the parent, of items', { type: 'array', ...ann, items: s }, [v]],
    ];
    const ALL: Record<string, unknown> = Object.fromEntries(ANNOTATIONS);
    const sets: [string, Record<string, unknown>][] = [...ANNOTATIONS.map(([k, v]): [string, Record<string, unknown>] => [k, { [k]: v }]), ['all four', ALL],
      ['readOnly and writeOnly false', { readOnly: false, writeOnly: false }]];
    for (const [k, s, good, bad] of CONSTRAINING) {
      let refusalsMet = 0;
      for (const [label, ann] of sets) {
        for (const value of [good, bad]) {
          const annotated = places(s, ann, value), bare = places(s, {}, value);
          for (let i = 0; i < annotated.length; i++) {
            const [where, withA, x] = annotated[i]!;
            equal(schemaProblem(withA), null, `${k} with ${label} ${where}: in the subset`);
            const got = findings(withA, x);
            equal(got, findings(bare[i]![1], bare[i]![2]), `${k} with ${label} ${where}, ${JSON.stringify(x)}: identical findings`);
            if (got.length) refusalsMet++;
          }
        }
      }
      // The control, per keyword: the refused value was refused at every place under every annotation set, and
      // the accepted one nowhere — so an annotation that DROPPED this keyword's finding (or added one) differed.
      equal(refusalsMet, sets.length * 5, `${k}: the refused value met at all 5 places under all ${sets.length} annotation sets`);
    }
  });

  test('beside every bound `fits` reads, on the consumer and on the producer, the four change no verdict — the adequacy reader`s F1', () => {
    // [the keyword, a consumer bounded by it, a producer that FITS it, a producer that does NOT] — the relation's
    // own rule (spec section 3, *What the schemas buy an author*): a consumer's bound is no tighter than the producer's.
    const PAIRS: readonly [string, Record<string, unknown>, Record<string, unknown>, Record<string, unknown>][] = [
      ['minimum', { type: 'number', minimum: 1 }, { type: 'number', minimum: 2 }, { type: 'number' }],
      ['maximum', { type: 'number', maximum: 5 }, { type: 'number', maximum: 3 }, { type: 'number' }],
      ['minLength', { type: 'string', minLength: 2 }, { type: 'string', minLength: 3 }, { type: 'string' }],
      ['maxLength', { type: 'string', maxLength: 5 }, { type: 'string', maxLength: 3 }, { type: 'string' }],
      ['minItems', { type: 'array', minItems: 1 }, { type: 'array', minItems: 2 }, { type: 'array' }],
      ['enum', { type: 'string', enum: ['a', 'b'] }, { type: 'string', enum: ['a'] }, { type: 'string' }],
      ['const', { type: 'integer', const: 1 }, { type: 'integer', const: 1 }, { type: 'integer' }],
      ['required', { type: 'object', required: ['a'] }, { type: 'object', required: ['a'] }, { type: 'object' }],
      ['type', { type: 'string' }, { type: 'string' }, { type: 'number' }],
      ['properties', { type: 'object', properties: { a: { type: 'string' } } }, { type: 'object', required: ['a'], properties: { a: { type: 'string' } } },
        { type: 'object', required: ['a'], properties: { a: { type: 'number' } } }],
      ['items', { type: 'array', items: { type: 'string' } }, { type: 'array', items: { type: 'string' } }, { type: 'array', items: { type: 'number' } }],
    ];
    const ALL: Record<string, unknown> = Object.fromEntries(ANNOTATIONS);
    const sets: [string, Record<string, unknown>][] = [...ANNOTATIONS.map(([k, v]): [string, Record<string, unknown>] => [k, { [k]: v }]), ['all four', ALL]];
    const nest = (s: Record<string, unknown>): JsonSchema => ({ type: 'object', required: ['p'], properties: { p: s } });
    for (const [k, c, pFit, pNo] of PAIRS) {
      equal(fits(pFit, c).verdict, 'fits', `${k}: the bare pair FITS — the control that a verdict can be lost`);
      equal(fits(pNo, c).verdict, 'no', `${k}: the bare rival is NO — the control that a verdict can be gained`);
      let met = 0;
      for (const [label, ann] of sets) {
        for (const [P, side] of [[pFit, 'fits'], [pNo, 'no']] as const) {
          equal(fits({ ...P, ...ann }, { ...c, ...ann }), fits(P, c), `${k}, ${label} on both sides, a producer that is ${side}: the same verdict`);
          equal(fits(P, { ...c, ...ann }), fits(P, c), `${k}, ${label} on the CONSUMER beside its bound: the same verdict`);
          equal(fits({ ...P, ...ann }, c), fits(P, c), `${k}, ${label} on the PRODUCER: the same verdict`);
          equal(fits(nest({ ...P, ...ann }), nest({ ...c, ...ann })), fits(nest(P), nest(c)), `${k}, ${label}, one level down: the same verdict`);
          if (fits(P, { ...c, ...ann }).verdict === side) met++;
        }
      }
      equal(met, sets.length * 2, `${k}: both verdicts met under all ${sets.length} annotation sets`);
    }
  });

  test('the generators read none of the four — witness and sampleOf give the same value with them and without them (conformity F8, adequacy F4)', () => {
    const SCHEMAS: readonly Record<string, unknown>[] = [
      { type: 'string', minLength: 3 }, { type: 'integer', minimum: 4 }, { type: 'number', maximum: 2 }, { type: 'boolean' }, { type: 'null' },
      { enum: ['b', 'a'] }, { const: { k: 1 } }, { type: 'array', minItems: 2, items: { type: 'string', minLength: 1 } },
      { type: 'object', required: ['a', 'b'], properties: { a: { type: 'integer', minimum: 7 }, b: { type: 'array', minItems: 1, items: { type: 'object', required: ['c'], properties: { c: { type: 'string', minLength: 2 } } } } } },
    ];
    const ALL: Record<string, unknown> = Object.fromEntries(ANNOTATIONS);
    /** The four put on the schema AND on every sub-schema under it, so a generator that stopped at one is seen. */
    const annotateDeep = (s: Record<string, unknown>, ann: Record<string, unknown>): Record<string, unknown> => {
      const out: Record<string, unknown> = { ...s, ...ann };
      if (s.items !== undefined) out.items = annotateDeep(s.items as Record<string, unknown>, ann);
      if (s.properties !== undefined) out.properties = Object.fromEntries(Object.entries(s.properties as Record<string, Record<string, unknown>>).map(([k, v]) => [k, annotateDeep(v, ann)]));
      return out;
    };
    let nonTrivial = 0;
    for (const s of SCHEMAS) {
      for (const [label, ann] of [...ANNOTATIONS.map(([k, v]): [string, Record<string, unknown>] => [k, { [k]: v }]), ['all four', ALL] as [string, Record<string, unknown>]]) {
        const a = annotateDeep(s, ann);
        equal(schemaProblem(a), null, `${JSON.stringify(s)} with ${label}: in the subset`);
        equal(witness(a), witness(s), `witness of ${JSON.stringify(s)} with ${label} at every depth: the same value`);
        equal(sampleOf(a), sampleOf(s), `sampleOf of ${JSON.stringify(s)} with ${label}: the same witness`);
        equal(sampleOf({ ...a, examples: [witness(s)] }), sampleOf({ ...s, examples: [witness(s)] }), `and with an example declared: the same example`);
      }
      if (JSON.stringify(witness(s)) !== '{}' && witness(s) !== null) nonTrivial++;
    }
    equal(nonTrivial, SCHEMAS.length - 1, 'the control: every witness but null`s says something a reader of an annotation could change');
    // Spelled out for two, so the comparison above is not two empty values agreeing.
    equal(witness(annotateDeep(SCHEMAS[0]!, ALL)), 'xxx', 'minLength 3 is "xxx", whatever annotates it');
    equal(witness(annotateDeep(SCHEMAS[8]!, ALL)), { a: 7, b: [{ c: 'xx' }] }, 'and the nested object, at every depth');
  });

  test('a value under writeOnly is CARRIED — the payload, the result, the fold input and the run state hold it verbatim (conformity F7, adequacy F5)', () => {
    // ADR 0098 rule 4, run on a driver: no redaction anywhere the library holds a value. A fake scheduler — the
    // driver's two-method seam — so the claim is L1's, with OR-R13 (the result check) and FD-R4 (the payload) ON.
    class FakeScheduler {
      readonly added: unknown[] = [];
      private listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
      addTask(task: unknown): void { this.added.push(task); }
      addEventListener(type: string, fn: (e: { detail: unknown }) => void): void { this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]); }
      done(id: string, result: unknown): void {
        const detail = { id, state: 'done', attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, result };
        for (const fn of this.listeners.get('task.completed') ?? []) fn({ detail });
      }
    }
    const SECRET = 'hunter2-under-writeOnly';
    const schema: JsonSchema = { type: 'object', title: 'Login', description: 'D', required: ['user', 'password'],
      properties: { user: { type: 'string', readOnly: true }, password: { type: 'string', writeOnly: true } } };
    equal(schemaProblem(schema), null, 'the schema is in the subset');
    const flow = { flowId: 'secret', version: 1, entry: 'a', nodes: [{ id: 'a', kind: 'task', type: 'Login', edges: [{ to: 'done' }] }, { id: 'done', kind: 'end', outcome: 'completed' }] } as unknown as FlowDefinition;
    const scheduler = new FakeScheduler();
    const reports: unknown[] = [];
    const d = new Driver(flow, {
      runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map(), joinPolicy: liveToken as unknown as JoinPolicy,
      workers: { login: { url: 'test://login', inputSchema: schema, outputSchema: schema } }, nodeTypes: { Login: { worker: 'login' } },
      onNonconformingResult: (f) => { reports.push(f); },
    });
    d.start({ user: 'ada', password: SECRET });                      // FD-R4 holds the payload to inputSchema: accepted
    ok(JSON.stringify(scheduler.added).includes(SECRET), 'the task handed to the scheduler carries the payload`s writeOnly value verbatim');
    scheduler.done('r1:a:-:0', { user: 'ada', password: SECRET });
    equal(reports, [], 'OR-R13: the result conforms — readOnly and writeOnly refused nothing');
    const inputs = d.foldInputs();
    const settled = inputs.find((i) => i.kind === 'outcome') as { record?: { result?: unknown } } | undefined;
    equal(settled?.record?.result, { user: 'ada', password: SECRET }, 'the fold input — the run`s event log — holds the result whole');
    const state = fold(inputs);
    equal(state.outcome, 'completed', 'and the run completes');
    equal(state.nodes['r1:a:-:0']?.result, { user: 'ada', password: SECRET }, 'and RUN STATE holds it verbatim: no redaction promise, and none kept');
  });

  test('a wrong annotation shape is refused on every road a schema is held to the subset — the registry and a gate type`s settingsSchema (adequacy F6)', () => {
    // The registry document: each of a worker's four schemas, through `resolveRegistry` → `SchemaRefused`.
    for (const field of ['configSchema', 'settingsSchema', 'inputSchema', 'outputSchema']) {
      for (const [k, bad] of [['title', 5], ['description', false], ['readOnly', 'yes'], ['writeOnly', 1]] as const) {
        let refused: unknown;
        try { resolveRegistry({ workers: { w: { url: 'test://w', [field]: { type: 'object', properties: { a: { type: 'string', [k]: bad } } } } }, nodeTypes: { T: { worker: 'w' } } }); } catch (e) { refused = e; }
        ok(refused instanceof SchemaRefused && refused.message.includes(`${field}: $.properties.a.${k}:`), `${field} with ${k} = ${JSON.stringify(bad)}: SchemaRefused naming the field and the path — ${(refused as Error)?.message}`);
      }
      // The control: the right shapes resolve on the same field.
      resolveRegistry({ workers: { w: { url: 'test://w', [field]: { type: 'object', title: 'T', properties: { a: { type: 'string', readOnly: true, writeOnly: false, description: 'D' } } } } }, nodeTypes: { T: { worker: 'w' } } });
    }
    // A gate type's settingsSchema, through `validateDefinition` → FD-V39 (the type is registered and is not a gate type).
    const gateFlow = (type: string) => ({ flowId: 'g', version: 1, entry: 'a', nodes: [
      { id: 'a', kind: 'task', type: 'A', edges: [{ to: 'g' }] },
      { id: 'g', kind: 'gate', type, settings: {}, edges: [{ to: 'done' }, { route: 'low', to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' }] }) as unknown as FlowDefinition;
    const gateType = (settingsSchema: JsonSchema): GateType => ({ routes: ['low', 'high'], defaultRoute: 'high', settingsSchema, fn: () => 'high' });
    const reg = (settingsSchema: JsonSchema): Registry => ({ predicates: new Set<string>(), workers: { a: { url: 'test://a' } }, nodeTypes: { A: { worker: 'a' } }, gateTypes: { G: gateType(settingsSchema) } });
    for (const [k, bad] of [['title', 5], ['description', null], ['readOnly', 'true'], ['writeOnly', {}]] as const) {
      const fs = validateDefinition(gateFlow('G'), reg({ type: 'object', [k]: bad }));
      ok(fs.some((f) => f.rule === 'FD-V39' && f.at === 'g' && f.detail.includes(`$.${k}:`) && f.detail.includes('ADR 0098')),
        `a gate type whose settingsSchema has ${k} = ${JSON.stringify(bad)} is FD-V39 at the gate, naming $.${k} — ${JSON.stringify(fs)}`);
    }
    equal(validateDefinition(gateFlow('G'), reg({ type: 'object', title: 'T', description: 'D', readOnly: false, writeOnly: true })), [],
      'the control: the right shapes on a gate type`s settingsSchema validate clean');
  });
});
