/**
 * **The built-in JSON Schema subset — every keyword, both ways, and the refusal of everything
 * else** — `spec/flow-definition.md` section 3's registry-document subsection (v0.19),
 * [ADR 0053](../../doc/decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md),
 * [Q278](../../doc/open-questions.md), [W65](../../doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md).
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
    equal(SCHEMA_KEYWORDS.length, 13, 'thirteen — fact 1`s twelve and `examples`, the annotation ADR 0056 adds (v0.20)');
    equal(SCHEMA_KEYWORDS.filter((k) => k === 'examples').length, 1, 'and examples is the one keyword beyond the twelve, once');
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
    const OUTSIDE = ['pattern', 'oneOf', 'anyOf', 'allOf', 'not', 'format', 'exclusiveMinimum', 'maxItems', 'uniqueItems', '$ref', 'description', 'title'];
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
  test('an ANNOTATION keyword outside the subset is still refused — examples is the one admitted, not a whitelist', () => {
    for (const k of ['description', 'title', 'default', '$comment', 'example']) {
      const p = schemaProblem({ type: 'string', [k]: 'x', examples: ['x'] });
      ok(p !== null && p.includes(`"${k}"`), `${k}: refused beside a valid examples — ${p}`);
    }
  });
});
