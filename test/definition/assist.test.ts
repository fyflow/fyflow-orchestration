/**
 * **The authoring assists — path enumeration, the sample-and-diff loop, and a generated signature** —
 * [P19](../../doc/plans/p19-what-a-schema-buys-an-author.md) decisions 7 and 9,
 * [W74](../../doc/work-items/w74-the-assists-and-the-exit-artifact.md), `AGENTS.md` section 15.
 *
 * Every expected value is from a DOCUMENT: the subset's own `SCHEMA_KEYWORDS` and the seven
 * `SCHEMA_TYPES`; the session registry's declared schemas
 * (`examples/getting-started/session-registry.ts`); the wiring fixture corpus's `transform-passes`
 * and `transform-fails` documents, whose two expressions differ by ONE word and which are this
 * suite's DISCRIMINATING PAIR; and the generated file on disk, compared to the generator's output
 * BOTH WAYS. Never from the assists' own output.
 *
 * **Rule 8 obligation (a), the SHAPES**: `pathsOf` is instantiated on every keyword of the subset
 * and on all seven types, on both nesting roads (`properties` and `items`), and on the two
 * shapes the SUBSET REFUSES that `checkWiring` derives — a fan-out's record and a map's
 * `additionalProperties: <schema>` with its `branchKeys` marker (W74 fact A, [Q306](../../doc/questions/q306.md)).
 * **Obligation (d)**: the keyword list, the type list and the generated file are each held to their
 * other half both ways, and the discriminating pair asserts what makes its two halves DIFFER.
 */
import { equal, ok, readText, ROOT, suite } from '../harness.ts';
import {
  describePaths, pathsOf, PATH_TYPES, sampledOutput, schemaOfValue, signatureOf, signaturesOf,
  TS_TYPE_NAMES, tryTransform, tsTypeOf, type SchemaPath,
} from '../../src/definition/assist.ts';
import { findings, SCHEMA_KEYWORDS, SCHEMA_TYPES, schemaProblem, type JsonSchema } from '../../src/definition/schema.ts';
import { checkWiring } from '../../src/definition/wiring.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { SESSION_REGISTRY, SESSION_WORKERS } from '../../examples/getting-started/session-registry.ts';
import { CORPUS_LANGUAGES, type CorpusRegistryDocument } from './corpus-types.ts';
import compileExpression, { jsonata } from '../../src/jsonata/index.ts';
import l6Registry from '../../examples/registry.json' with { type: 'json' };

const EX = `${ROOT}spec/examples`;
const wiringDoc = JSON.parse(await readText(`${EX}/wiring/registry.json`)) as CorpusRegistryDocument;
const wiringRegistry = { workers: wiringDoc.workers, nodeTypes: wiringDoc.nodeTypes, languages: CORPUS_LANGUAGES };
const loadWiring = async (n: string) => JSON.parse(await readText(`${EX}/wiring/${n}`)) as FlowDefinition;
const pathsIn = (ps: readonly SchemaPath[]) => ps.map((p) => p.path);
const l6Workers = l6Registry.workers as unknown as Record<string, Record<string, JsonSchema | undefined>>;

suite('W74 — pathsOf: every path a value may carry, over the whole subset', (test) => {
  test('the leaf cases: one path, and the types the schema names', () => {
    equal(pathsOf({ type: 'string' }), [{ path: '$', types: 'string', required: true, schema: { type: 'string' } }], 'a scalar is one path');
    equal(pathsOf({ type: ['string', 'null'] })[0]!.types, 'string|null', 'a type LIST is every name it holds');
    equal(pathsOf({ const: true })[0]!.types, 'boolean', '`const` decides the type before `type` does');
    equal(pathsOf({ enum: ['a', 1, null] })[0]!.types, 'string|integer|null', 'an `enum` is the types of its own values');
    equal(pathsOf({ enum: ['a', 'b', 'c'] })[0]!.types, 'string', 'and DEDUPLICATED — three string values name the type once (the reader`s A1: the claim was in the message and not in the value)');
    equal(pathsOf({ enum: [] })[0]!.types, '', 'an empty enum names no type — refused by the subset, and this does not throw on it');
    equal(pathsOf({})[0]!.types, '*', 'the EMPTY schema admits every type, and `*` is how that is said');
  });

  test('all seven SCHEMA_TYPES are reachable, and PATH_TYPES is that list plus `*` — both ways', () => {
    const seen = SCHEMA_TYPES.map((t) => pathsOf({ type: t })[0]!.types);
    equal(seen, [...SCHEMA_TYPES], 'each of the seven types is reported under its own name');
    equal([...PATH_TYPES].sort(), ['*', ...SCHEMA_TYPES].sort(), 'PATH_TYPES is the subset`s seven and the open marker');
    equal(PATH_TYPES.length, SCHEMA_TYPES.length + 1, 'and nothing else — a count beside the membership');
  });

  test('every one of the SCHEMA_KEYWORDS is walked or deliberately ignored, and the list is bound both ways', () => {
    // A membership claim about the subset's own list: a keyword added there must appear here. W164 (ADR 0098)
    // added the four annotations to `ignored`, each with a value of the shape the spec's table gives it.
    const walked = ['type', 'required', 'properties', 'additionalProperties', 'items'];
    const decidesType = ['enum', 'const'];
    const ignored = ['minimum', 'maximum', 'minLength', 'maxLength', 'minItems', 'examples', 'title', 'description', 'readOnly', 'writeOnly'];
    equal([...walked, ...decidesType, ...ignored].sort(), [...SCHEMA_KEYWORDS].sort(),
      'the three ways pathsOf treats a keyword cover the subset exactly — both ways');
    const valueOf = (k: string): unknown => k === 'examples' ? ['x'] : k === 'title' || k === 'description' ? 'x' : k === 'readOnly' || k === 'writeOnly' ? true : 1;
    for (const k of ignored) {
      const s = { type: 'string', [k]: valueOf(k) } as JsonSchema;
      equal(schemaProblem(s), null, `${k}: the schema is in the subset, so what follows is about a schema an author may write`);
      equal(pathsOf(s).length, 1, `${k} adds no path — it is a bound or an annotation, not a place`);
    }
  });

  test('W164 — the four annotations of ADR 0098 change no path, no type, no guarantee and no generated signature, at each place they sit', () => {
    // ADR 0098 rule 3: `title`, `description`, `readOnly` and `writeOnly` constrain nothing, so the two assists that
    // DESCRIBE a schema — its paths and its TypeScript type — say exactly what they say of the same schema without them.
    const bare: JsonSchema = { type: 'object', required: ['a'], properties: { a: { type: 'array', items: { type: 'string' } }, b: { type: 'integer' } } };
    const annotated: JsonSchema = {
      type: 'object', title: 'T', description: 'D', readOnly: true, writeOnly: false, required: ['a'],
      properties: { a: { type: 'array', title: 'A', writeOnly: true, items: { type: 'string', description: 'an item', readOnly: false } }, b: { type: 'integer', writeOnly: true } },
    };
    equal(schemaProblem(annotated), null, 'the annotated schema is in the subset');
    const summary = (s: JsonSchema) => pathsOf(s).map((p) => `${p.path} ${p.types} ${p.required}`);
    equal(summary(annotated), summary(bare), 'the same paths, types and guarantees — at the top, under properties and under items');
    equal(summary(bare), ['$ object true', '$.a array true', '$.a[] string false', '$.b integer false'], 'and they are the bare schema`s, written out (the control: four paths, not one)');
    equal(tsTypeOf(annotated), tsTypeOf(bare), 'the same generated TypeScript type');
    // The two things a generator that READ them would emit (conformity F8, adequacy F4): a `readonly` modifier for
    // `readOnly: true`, and a JSDoc comment for a `description` or `title`. Neither is emitted, at either depth.
    const prop: JsonSchema = { type: 'object', required: ['id', 'note'], properties: {
      id: { type: 'string', readOnly: true, title: 'Id' }, note: { type: 'string', description: 'a note', writeOnly: true },
      inner: { type: 'object', properties: { deep: { type: 'integer', readOnly: true, description: 'deep' } } } } };
    const propBare: JsonSchema = { type: 'object', required: ['id', 'note'], properties: {
      id: { type: 'string' }, note: { type: 'string' }, inner: { type: 'object', properties: { deep: { type: 'integer' } } } } };
    const text = tsTypeOf(prop);
    equal(text, tsTypeOf(propBare), 'a property under readOnly, title, description and writeOnly: the bare schema`s type, byte for byte');
    ok(!/readonly/i.test(text) && !text.includes('/*') && !text.includes('//') && !text.includes('a note') && !text.includes('Id'),
      `no readonly modifier, no comment, no annotation text: ${text}`);
    ok(text.includes('"id": string') && text.includes('"deep"?: number'), `the control: the properties ARE emitted, so their absence above is not an empty type — ${text}`);
  });

  test('objects: properties, a required key with no schema, and the guarantee that composes', () => {
    const s: JsonSchema = {
      type: 'object', required: ['a', 'missing'],
      properties: { a: { type: 'object', required: ['deep'], properties: { deep: { type: 'string' }, maybe: { type: 'number' } } }, b: { type: 'string' } },
    };
    equal(pathsIn(pathsOf(s)), ['$', '$.a', '$.a.deep', '$.a.maybe', '$.b', '$.missing'], 'document order, `$` first, and a required key with no `properties` entry is still a path');
    const by = new Map(pathsOf(s).map((p) => [p.path, p.required]));
    equal(by.get('$.a'), true, 'a required key is guaranteed');
    equal(by.get('$.b'), false, 'an unrequired one is not');
    equal(by.get('$.a.deep'), true, 'required THROUGH a required parent is guaranteed');
    equal(by.get('$.a.maybe'), false, 'and an unrequired child of a required parent is not');
    equal(pathsOf(s).find((p) => p.path === '$.missing')!.types, '*', 'a key named only by `required` says nothing about its type');
    // Every path carries the sub-schema it addresses, not only the root — the member exists so a
    // caller may read a bound the `types` summary drops, and it was observed at `$` alone (A5).
    equal(pathsOf(s).find((p) => p.path === '$.a.deep')!.schema, { type: 'string' }, 'a nested path carries ITS schema');
    equal(pathsOf(s).find((p) => p.path === '$.b')!.schema, { type: 'string' }, 'and so does a shallow one');
    equal(pathsOf(s).find((p) => p.path === '$.missing')!.schema, {}, 'a key with no entry carries the empty schema');
  });

  test('a required key named for an Object.prototype member is a path like any other — OWN keys, never `in`', () => {
    // W74's adequacy reader (R1), found with NO mutation: `k in props` walks `Object.prototype`, so a
    // schema `schemaProblem` ACCEPTS enumerated as if `toString` were described. `checkWiring` on the
    // same arc gives a `no` NAMING `$.toString`, so the assist contradicted the check it explains.
    // `schema.ts` has carried an `own()` helper and W65's comment for this since ADR 0053.
    const s: JsonSchema = { type: 'object', required: ['toString', 'constructor', 'ok'], properties: { ok: { type: 'string' } } };
    equal(schemaProblem(s), null, 'the schema IS in the subset — this is a document an author may write');
    equal(pathsIn(pathsOf(s)), ['$', '$.ok', '$.toString', '$.constructor'], 'both prototype-named keys are paths');
    equal(pathsOf(s).filter((p) => p.types === '*').map((p) => p.path), ['$.toString', '$.constructor'],
      'and each says nothing about its type, as any required key with no `properties` entry does');
  });

  test('a required key under an UNREQUIRED parent is NOT guaranteed — the composition, in the direction a bound could miss', () => {
    const s: JsonSchema = { type: 'object', properties: { opt: { type: 'object', required: ['x'], properties: { x: { type: 'string' } } } } };
    equal(pathsOf(s).find((p) => p.path === '$.opt.x')!.required, false, 'its parent may be absent, so it may be absent');
  });

  test('arrays: one path for the element, never guaranteed, and nesting', () => {
    equal(pathsIn(pathsOf({ type: 'array', items: { type: 'array', items: { type: 'number' } } })), ['$', '$[]', '$[][]'], 'one path per depth');
    equal(pathsOf({ type: 'array', items: { type: 'string' } })[1]!.required, false, 'an element is never guaranteed — `minItems` may be absent or zero');
    equal(pathsOf({ type: 'array' }).length, 1, 'an array with no `items` says nothing about its elements');
  });

  test('an OPEN schema is walked, because saying nothing is not saying nothing is there', () => {
    equal(pathsIn(pathsOf({ properties: { a: { type: 'string' } } })), ['$', '$.a'], 'no `type`, and its properties are still paths');
    equal(pathsIn(pathsOf({ items: { type: 'string' } })), ['$', '$[]'], 'and its items');
  });

  test('the two shapes the SUBSET REFUSES and `checkWiring` DERIVES — W74 fact A, the order that would have broken this', () => {
    // A map's `JP-R12` record: keys minted at run time, each of the branch's shape.
    const record: JsonSchema = { type: 'object', additionalProperties: { type: 'object', required: ['score'], properties: { score: { type: 'number' } } }, branchKeys: true };
    ok(schemaProblem(record) !== null, 'schemaProblem REFUSES it — no author can declare this (Q306)');
    equal(pathsIn(pathsOf(record)), ['$', '$.*', '$.*.score'], 'and pathsOf walks it anyway: `$.*` is the minted branch key');
    equal(pathsOf(record).find((p) => p.path === '$.*')!.required, false, 'a branch key is never guaranteed — JP-R12 loses a branch three ways no document shows');
    equal(pathsOf(record).find((p) => p.path === '$.*.score')!.required, false, 'and nothing under it is either');
    // A fan-out's record: exact keys, none required.
    const fanout: JsonSchema = { type: 'object', required: [], properties: { '0': { type: 'number' }, '1': { type: 'string' } }, additionalProperties: false };
    equal(schemaProblem(fanout), null, 'this one IS in the subset');
    equal(pathsIn(pathsOf(fanout)), ['$', '$.0', '$.1'], 'and its branch paths are ordinary properties');
  });

  test('every schema the three corpora declare enumerates, and none throws', () => {
    let schemas = 0, paths = 0;
    for (const doc of [l6Workers, SESSION_WORKERS as unknown as typeof l6Workers, wiringDoc.workers as unknown as typeof l6Workers]) {
      for (const w of Object.values(doc)) {
        for (const kind of ['configSchema', 'settingsSchema', 'inputSchema', 'outputSchema']) {
          const s = (w as Record<string, JsonSchema | undefined>)[kind];
          if (s === undefined) continue;
          schemas++;
          const ps = pathsOf(s);
          ok(ps.length > 0 && ps[0]!.path === '$', `${kind} enumerates and starts at $`);
          paths += ps.length;
        }
      }
    }
    ok(schemas >= 35, `every declared schema of the three corpora, got ${schemas}`);
    ok(paths >= 120, `and their paths, got ${paths}`);
  });

  test('describePaths marks the guaranteed ones, and a path that is not', () => {
    const text = describePaths(pathsOf(SESSION_WORKERS.reader.outputSchema));
    equal(text.split('\n').map((l) => l.trim().split(/\s+/)[0]), ['$', '$.lines', '?', '$.source'],
      'the element line opens with the `?` marker and the rest do not (the reader`s footnote: the `.map` here was the identity)');
    ok(text.includes('? $.lines[]'), 'an element is marked as not guaranteed');
    ok(!text.includes('? $.source'), 'a required key is not marked');
    // The COLUMN is the claim — the reference prints this as one, and `padEnd` was free (A6).
    const ps = pathsOf(SESSION_WORKERS.reader.outputSchema);
    equal(text.split('\n').map((l) => l.slice(31)), ps.map((p) => p.types),
      'every type name starts at column 31 — two marker characters and a 28-wide path field');
  });
});

suite('W74 — tryTransform: the sample-and-diff loop, one candidate at a time', (test) => {
  const flow: FlowDefinition = {
    flowId: 'assist-session', version: 1, entry: 'read',
    nodes: [
      { id: 'read', kind: 'task', type: 'Reader', edges: [{ to: 'sum' }] },
      { id: 'sum', kind: 'task', type: 'Summarise', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  };
  const registry = { workers: SESSION_WORKERS, nodeTypes: SESSION_REGISTRY.nodeTypes, languages: { jsonata } } as unknown as Parameters<typeof checkWiring>[0];
  // **The worker half, handed in for the browser** — ADR 0052 rule 8's road, W62's `workerHalf`:
  // inside a bundle `import.meta.url` is the BUNDLE (Q261), so `import(adapter.worker)` yields no
  // compile function there. Where the URL imports, the URL wins and this is never read; measured,
  // because without it these cases were red in chromium, firefox and webkit while node and deno
  // were green — W73's suite carries the same handle for the same reason.
  const opts = { workerHalf: { jsonata: compileExpression } };

  test('with NO transform the arc is `no`, and the reason names the key and the side', async () => {
    const vs = await tryTransform(registry, flow, 'sum', null, opts);
    equal(vs.length, 1, 'one arc into the consumer');
    equal(vs[0]!.kind, 'no', 'lines are not text');
    equal(vs[0]!.why, '$: consumer requires "text", producer does not guarantee it', 'the relation`s own reason');
    equal(vs[0]!.sample, undefined, 'and a `no` carries no sample — nothing was run');
  });

  test('THE DISCRIMINATING PAIR: one expression, two words apart, two verdicts — and what makes them differ is asserted', async () => {
    const fails = await tryTransform(registry, flow, 'sum', { lang: 'jsonata', expr: '{ "text": lines }' }, opts);
    const passes = await tryTransform(registry, flow, 'sum', { lang: 'jsonata', expr: '{ "text": $join(lines, " ") }' }, opts);
    equal(fails[0]!.kind, 'transform-fails', 'an array under a key the consumer types `string`');
    equal(passes[0]!.kind, 'transform-passes', 'joined, it is a string');
    // The pair's own difference, asserted rather than left to two literals (rule 8's fourth
    // requirement on the set): the two RESULTS differ, and they differ in the way the schemas say.
    equal(fails[0]!.sample!.result, { text: ['alpha', 'beta', 'gamma'] }, 'what the first produced');
    equal(passes[0]!.sample!.result, { text: 'alpha beta gamma' }, 'what the second produced');
    ok(fails[0]!.why.includes('$.text expected string, got array'), 'and the finding says which path and which type');
    equal(fails[0]!.sample!.value, passes[0]!.sample!.value, 'BOTH ran on the same sample, so the expression is the only variable');
  });

  test('the sample is the producer`s DECLARED example, and the verdict says so (Q301)', async () => {
    const vs = await tryTransform(registry, flow, 'sum', { lang: 'jsonata', expr: '{ "text": $join(lines, " ") }' }, opts);
    equal(vs[0]!.sample!.source, 'example', 'a declared example, not the witness');
    equal(vs[0]!.sample!.value, SESSION_WORKERS.reader.outputSchema.examples[0], 'and it is THAT example, read off the document');
  });

  test('the flow is never mutated, and a node with no arcs into it has nothing to report', async () => {
    const before = JSON.stringify(flow);
    await tryTransform(registry, flow, 'sum', { lang: 'jsonata', expr: 'lines' }, opts);
    equal(JSON.stringify(flow), before, 'the caller`s document is untouched — the candidate goes on a COPY');
    equal(await tryTransform(registry, flow, 'read', { lang: 'jsonata', expr: '$' }, opts), [], 'the entry has no arc (FD-R4 holds its payload instead)');
    equal(await tryTransform(registry, flow, 'nowhere', null), [], 'a node id that names no task');
  });

  test('it is `checkWiring`, so a transform the check cannot run is `transform-fails` with the throw`s message', async () => {
    const vs = await tryTransform(registry, flow, 'sum', { lang: 'jsonata', expr: '{{{' }, opts);
    equal(vs[0]!.kind, 'transform-fails', 'an expression the engine refuses');
    ok(vs[0]!.why.startsWith('the transform threw on the example'), 'and the verdict says it threw rather than that it did not fit');
    const missing = await tryTransform(registry, flow, 'sum', { lang: 'nope', expr: 'x' }, opts);
    equal(missing[0]!.kind, 'unchecked', 'a language the registry does not declare is unchecked, not a failure of the expression');
  });

  test('tryTransform FORWARDS its options — the handed-in worker half, observable without a browser', async () => {
    // A10: `WiringOptions` has one member and its only observer was the three browser rungs, because
    // the URL imports everywhere else and the URL wins. A language whose URL does NOT import makes the
    // forwarding observable at node: without the handle the transform threw, with it, it runs.
    // **A `data:` URL that THROWS on evaluation, never a `file:///` one** — the first cut used
    // `file:///w74-no-such-module.ts`, which node and deno reject with an ordinary error and a
    // BROWSER refuses with `Not allowed to load local resource`, reported as a PAGE ERROR rather
    // than as a failing test: `GATE EXIT=1` with zero lines beginning `FAIL`. Found by the
    // confirming gate, in the fix for a reader's finding — v0.8's own founding observation.
    const lang = { compile: (e: string) => ({ evaluate: () => Promise.resolve(e) }), worker: 'data:text/javascript,throw new Error(%22w74: this worker half refuses to load%22)' };
    const reg = { workers: SESSION_WORKERS, nodeTypes: SESSION_REGISTRY.nodeTypes, languages: { bogus: lang } } as unknown as Parameters<typeof checkWiring>[0];
    const bare = await tryTransform(reg, flow, 'sum', { lang: 'bogus', expr: '{ "text": "x" }' });
    equal(bare[0]!.kind, 'transform-fails', 'with no handle the adapter`s URL is all there is, and it does not import');
    ok(bare[0]!.why.startsWith('the transform threw'), 'and the verdict says it threw');
    const handed = await tryTransform(reg, flow, 'sum', { lang: 'bogus', expr: '{ "text": "x" }' },
      { workerHalf: { bogus: () => ({ evaluate: () => Promise.resolve({ text: 'x' }) }) } });
    equal(handed[0]!.kind, 'transform-passes', 'handed one, the same arc passes — the option reached checkWiring');
  });

  test('the fixture corpus`s own pair, whose two documents differ by ONE word — the spec`s copy of this claim', async () => {
    const passes = await checkWiring(wiringRegistry, await loadWiring('transform-passes--a-path-picks-the-string-the-consumer-wants.flow.json'));
    const fails = await checkWiring(wiringRegistry, await loadWiring('transform-fails--a-path-picks-a-number-for-a-string-consumer.flow.json'));
    const exprOf = (f: FlowDefinition) => (f.nodes.find((n) => n.id === 'title') as { transform?: { expr: string } }).transform!.expr;
    const [p, f] = [await loadWiring('transform-passes--a-path-picks-the-string-the-consumer-wants.flow.json'), await loadWiring('transform-fails--a-path-picks-a-number-for-a-string-consumer.flow.json')];
    equal(exprOf(p), 'label', 'the passing document picks the string');
    equal(exprOf(f), 'confidence', 'the failing one picks the number — one word, and it is the only difference the two flows have');
    equal(JSON.stringify(p.nodes).replace('"label"', '"X"'), JSON.stringify(f.nodes).replace('"confidence"', '"X"'), 'asserted, rather than two literals nothing compares');
    ok(passes.verdicts.some((v) => v.kind === 'transform-passes') && fails.verdicts.some((v) => v.kind === 'transform-fails'), 'and the two verdicts follow');
  });
});

suite('W74 — the session`s two workers, RUN on their own declared examples (ADR 0056 rule 3)', (test) => {
  // **`check:workers` runs `examples/registry.json` and nothing else**, so the session's registry —
  // the reference's own — declares four examples that no check runs a worker on. Rule 8's `c2b`
  // measured exactly that: SHORTENING the producer's declared example cost ZERO at every rung,
  // because the RUN uses the worker (which returns three lines whatever the document says) and the
  // wiring verdict only asks whether the sample's result fits. **P19 fact 6 is the reason this
  // matters**: a schema and its example agreeing proves the schema is self-consistent and says
  // nothing about the worker. These two cases are `check:workers`' claim, made where the corpus
  // cannot reach — and they are what makes the session's printed `{ words: 3 }` a fact about
  // `summarise.ts` rather than about a literal.
  test('each worker RUN on its declared input example returns its declared output example', async () => {
    const Reader = (await import('../../examples/getting-started/reader.ts')).default;
    const Summarise = (await import('../../examples/getting-started/summarise.ts')).default;
    const readOut = new Reader().run({ settings: undefined, input: SESSION_WORKERS.reader.inputSchema.examples[0] });
    equal(readOut, SESSION_WORKERS.reader.outputSchema.examples[0], '`reader` on its input example returns its output example');
    const sumOut = new Summarise().run({ settings: undefined, input: SESSION_WORKERS.summarise.inputSchema.examples[0] });
    equal(sumOut, SESSION_WORKERS.summarise.outputSchema.examples[0], '`summarise` on its input example returns its output example');
  });

  test('and what each returns conforms to the schema it sits beside — the other half of the claim', async () => {
    const Reader = (await import('../../examples/getting-started/reader.ts')).default;
    const Summarise = (await import('../../examples/getting-started/summarise.ts')).default;
    equal(findings(SESSION_WORKERS.reader.outputSchema, new Reader().run({ settings: undefined, input: {} })), [], '`reader`s real output satisfies its output schema');
    equal(findings(SESSION_WORKERS.summarise.outputSchema, new Summarise().run({ settings: undefined, input: { text: 'a b' } })), [], '`summarise`s does too');
  });

  test('the session`s whole chain, end to end, derived here — section 15`s two unobserved claims', async () => {
    // **The exit artifact's seven guards can each be made a tautology at `check:docs` exit 0** (the
    // adequacy reader, C3/C4): `X4` refuses a `run` snippet with NO throw, which is a presence test and
    // not a membership. Five of section 15's seven claims are re-asserted elsewhere in this file; the
    // two that were not are *the flow RUNS to completed* and *`{ words: 3 }` comes out of it*, because
    // the item's gate says L6 UNMOVED and adds no row. This is their independent observer: the same
    // chain the session runs — the producer, the transform, the consumer — one layer under
    // `createRuntime`, so a tautologised guard up there is red down here.
    const Reader = (await import('../../examples/getting-started/reader.ts')).default;
    const Summarise = (await import('../../examples/getting-started/summarise.ts')).default;
    const read = new Reader().run({ settings: undefined, input: { source: 'inbox' } });
    const evaluate = compileExpression('{ "text": $join(lines, " ") }');
    const transformed = await evaluate.evaluate(read, {});
    equal(transformed, SESSION_WORKERS.summarise.inputSchema.examples[0], 'the ONE expression edit turns the producer`s output into the consumer`s declared input example');
    equal(new Summarise().run({ settings: undefined, input: transformed as { text: string } }), { words: 3 },
      'and the consumer returns the `{ words: 3 }` section 15 prints');
    const before = await evaluate.evaluate({ ...read, lines: [] }, {});
    equal(new Summarise().run({ settings: undefined, input: before as { text: string } }), { words: 0 }, 'no lines, no words — the count is computed and not returned');
  });

  test('a double space is ONE separator — the filter that had no fixture', async () => {
    const Summarise = (await import('../../examples/getting-started/summarise.ts')).default;
    equal(new Summarise().run({ settings: undefined, input: { text: 'a  b' } }), { words: 2 }, 'H2: the empty segment is dropped');
  });

  test('the producer READS its input rather than returning a constant — H1', async () => {
    const Reader = (await import('../../examples/getting-started/reader.ts')).default;
    equal(new Reader().run({ settings: undefined, input: { source: 'outbox' } }).source, 'outbox', 'the declared source comes back');
    equal(new Reader().run({ settings: undefined, input: {} }).source, 'unnamed', 'and the fallback is a DIFFERENT word, so ignoring the input is red');
  });

  test('the SESSION`s own numbers follow from the examples, not from a literal beside them', () => {
    const lines = SESSION_WORKERS.reader.outputSchema.examples[0].lines;
    equal(lines.join(' '), SESSION_WORKERS.summarise.inputSchema.examples[0].text,
      'the consumer`s input example IS the producer`s lines joined — which is what the session`s one expression edit does');
    equal(SESSION_WORKERS.summarise.outputSchema.examples[0].words, lines.length,
      'and the declared word count is that many — so shortening the producer`s example is red here');
  });
});

suite('W74 — signatureOf: the SHAPE, as text, and the file it generated', (test) => {
  test('tsTypeOf over the subset: every type, both nesting roads, and the open/closed difference', () => {
    equal(tsTypeOf({ type: 'string' }), 'string', 'a scalar');
    equal(tsTypeOf({ type: 'integer' }), 'number', 'integer is a number in TypeScript — the one type name that is not its own');
    equal(tsTypeOf({ type: 'null' }), 'null', 'null is a type here');
    equal(tsTypeOf({ type: ['string', 'null'] }), 'string | null', 'a type list is a union');
    equal(tsTypeOf({ const: 5 }), '5', 'a const is its literal');
    equal(tsTypeOf({ enum: ['a', 'b'] }), '"a" | "b"', 'an enum is a union of literals');
    equal(tsTypeOf({ enum: [] }), 'never', 'and an empty one is `never` rather than an empty union');
    equal(tsTypeOf(undefined), 'unknown', 'a schema the entry does not declare says nothing');
    equal(tsTypeOf({}), 'unknown', 'and neither does the empty schema');
    // **The no-`type` road, all of it** — the reader (A3/A4) found two of its three earlier roads
    // deletable for zero and the third DISAGREEING with `pathsOf` about one schema.
    equal(tsTypeOf({ properties: { a: { type: 'string' } } }), 'unknown',
      'a schema with no `type` is `unknown` EVEN WHEN it describes properties — it admits every type');
    equal(tsTypeOf({ additionalProperties: { type: 'number' } }), 'unknown', 'and even when it describes the rest');
    equal(tsTypeOf({ required: ['a'] }), 'unknown', 'and even when it requires one');
    equal(tsTypeOf({ type: 'array' }), 'unknown[]', 'an array with no `items`');
    equal(tsTypeOf({ type: 'array', items: { type: 'number' } }), '(number)[]', 'and one with them');
    equal(tsTypeOf({ type: 'object' }), 'Record<string, unknown>', 'an OPEN object with no properties');
    equal(tsTypeOf({ type: 'object', additionalProperties: false }), 'Record<string, never>', 'a CLOSED one with none');
    equal(tsTypeOf({ type: 'object', additionalProperties: { type: 'number' } }), 'Record<string, number>', 'and the map record no author can write');
  });

  test('the two assists AGREE about an open schema — pathsOf says `*`, tsTypeOf says `unknown`', () => {
    // The reader's A3/A4, the half that is not about coverage: `pathsOf`'s header argues the open case
    // (*saying nothing is not saying nothing is there*) and `tsTypeOf`'s emitted an OBJECT type for it,
    // so a worker generated from that signature refused a legal value of its own schema.
    for (const s of [{}, { properties: { a: { type: 'string' } } }, { required: ['a'] }, { items: { type: 'string' } }] as JsonSchema[]) {
      equal(pathsOf(s)[0]!.types, '*', `pathsOf calls ${JSON.stringify(s)} open`);
      equal(tsTypeOf(s), 'unknown', 'and tsTypeOf gives it the type that admits every value');
    }
  });

  test('TS_TYPE_NAMES is SCHEMA_TYPES, both ways and by count, and every one of the seven is emitted', () => {
    // `TS_NAMES` was a seven-entry map bound to nothing, two of whose entries `one()` never reached
    // (A7): `boolean` was removable for zero and `object`/`array` were dead. The membership is a claim
    // about the subset's own list, as `PATH_TYPES` already was — obligation (e)'s third shape.
    equal([...TS_TYPE_NAMES].sort(), [...SCHEMA_TYPES].sort(), 'every type the subset names is answered somewhere');
    equal(TS_TYPE_NAMES.length, SCHEMA_TYPES.length, 'and nothing else is — a count beside the membership');
    equal(SCHEMA_TYPES.map((t) => tsTypeOf({ type: t })),
      ['Record<string, unknown>', 'unknown[]', 'string', 'number', 'number', 'boolean', 'null'],
      'all SEVEN emitted, in the subset`s own order — `integer` is the one that is not its own');
  });

  test('a NESTED object is indented, which is the difference between a signature and a blob', () => {
    // A8: no test asserted a signature carrying a nested object, and `session-types.ts` is flat.
    equal(tsTypeOf({ type: 'object', required: ['outer'], additionalProperties: false, properties: { outer: { type: 'object', required: ['inner'], additionalProperties: false, properties: { inner: { type: 'string' } } } } }),
      '{\n  "outer": {\n    "inner": string;\n  };\n}', 'two levels, two indents');
  });

  test('a worker KEY that is not a TypeScript identifier is refused by name, not emitted', () => {
    // By construction, no mutation (the reader): `signatureOf`'s header says the name is the caller's
    // to make an identifier and `signaturesOf` IS the caller. `my-worker` emitted
    // `export type My-workerSettings = unknown;` — uncompilable text with no diagnostic, and fact D's
    // *the emitted text typechecks* was bound by 26 corpus keys that all happen to be safe.
    let refused: unknown;
    try { signaturesOf({ 'my-worker': { inputSchema: { type: 'string' } } }); } catch (e) { refused = e; }
    ok(refused instanceof Error && refused.message.includes('"my-worker"') && refused.message.includes('TypeScript identifier'),
      'it names the key and says why');
    ok(signaturesOf({ my_worker: { inputSchema: { type: 'string' } } }).includes('My_workerInput'), 'and an identifier passes');
  });

  test('the OPEN object gets an index signature and the CLOSED one does not — W74 fact D`s measured difference', () => {
    const props = { properties: { a: { type: 'string' } }, required: ['a'], type: 'object' } as JsonSchema;
    ok(tsTypeOf(props).includes('[k: string]: unknown;'), 'a schema that does not say `additionalProperties: false` is saying there are keys it does not describe');
    ok(!tsTypeOf({ ...props, additionalProperties: false }).includes('[k: string]'), 'and one that does say it, is not');
    equal(tsTypeOf({ ...props, additionalProperties: false }), '{\n  "a": string;\n}', 'the closed form, whole');
  });

  test('a key named only by `required` is in the TYPE too — the two assists agree about one document', () => {
    // W74's conformity reader (finding 12): `object()` iterated `properties` alone, so a REQUIRED
    // key with no entry was absent from the signature while `pathsOf` emitted `$.a` for it — the
    // same disagreement A3/A4 found one road over, in the other direction.
    const s: JsonSchema = { type: 'object', required: ['a'], properties: { b: { type: 'string' } }, additionalProperties: false };
    equal(tsTypeOf(s), '{\n  "b"?: string;\n  "a": unknown;\n}', 'the guaranteed key is typed `unknown` rather than dropped');
    equal(pathsOf(s).map((p) => p.path), ['$', '$.b', '$.a'], 'and pathsOf reports the same two keys');
  });

  test('a bound is INVISIBLE in the type, which is the sentence the reference carries', () => {
    equal(tsTypeOf({ type: 'integer', minimum: 0, maximum: 10 }), 'number', 'no type system here holds a bound');
    equal(tsTypeOf({ type: 'string', minLength: 3, maxLength: 5 }), 'string', 'nor a length');
    equal(tsTypeOf({ type: 'array', items: { type: 'string' }, minItems: 2 }), '(string)[]', 'nor an arity');
    equal(tsTypeOf({ type: 'string', examples: ['x'] }), 'string', 'and `examples` is an annotation (ADR 0056 rule 1)');
  });

  test('required and optional members, and a signature`s four declarations', () => {
    const sig = signatureOf('Thing', { inputSchema: { type: 'object', required: ['a'], properties: { a: { type: 'string' }, b: { type: 'number' } }, additionalProperties: false } });
    ok(sig.includes('"a": string;') && sig.includes('"b"?: number;'), 'required has no `?`, optional has one');
    equal(sig.split('\n').filter((l) => l.startsWith('export')).map((l) => l.split(/[ =]/)[2]),
      ['ThingSettings', 'ThingInput', 'ThingOutput', 'ThingEnvelope'], 'four declarations, named for the argument');
    ok(sig.includes('export type ThingSettings = unknown;'), 'a schema the entry does not declare is `unknown`');
  });

  test('THE GENERATED FILE IS THE GENERATOR`S OUTPUT, both ways — the binding a recipe in prose could not have', async () => {
    const onDisk = await readText(`${ROOT}examples/getting-started/session-types.ts`);
    const emitted = signaturesOf(SESSION_WORKERS);
    ok(onDisk.includes(emitted), 'every line the generator emits is in the checked-in file — the forward direction');
    const body = onDisk.slice(onDisk.indexOf('/** Generated from'));
    equal(body.trimEnd(), emitted.trimEnd(), 'and the file holds NOTHING ELSE past its header — the other direction, so a hand edit is red');
    // **Nothing above the marker may DECLARE anything** — the reader's B1b: the slice above made the
    // header region unbounded, and `export interface ReaderEnvelope { handEdited?: string }` inserted
    // there DECLARATION-MERGES into the generated envelope and widens the type `reader.ts` compiles
    // against, at `npm test` AND `npm run typecheck` exit 0. That is the drift road (B) was refused
    // for, inside road (C), which was chosen to close it.
    const header = onDisk.slice(0, onDisk.indexOf('/** Generated from'));
    equal(header.split('\n').filter((l) => /^\s*(export|declare|import|type|interface)\b/.test(l)), [],
      'the header is a comment and nothing else — no declaration above the marker');
    equal(onDisk, header + emitted + '\n', 'and the file is EXACTLY that header and the generator`s output');
    ok(onDisk.includes('do not edit by hand'), 'and it says so');
  });

  test('the header names what BINDS this file, and the claim is asserted rather than printed', async () => {
    const onDisk = await readText(`${ROOT}examples/getting-started/session-types.ts`);
    ok(onDisk.includes('`test/definition/assist.test.ts` compares this file to the generator'),
      'the generated file names the test that holds it — rule 8`s `e6` removed that sentence for ZERO until this line');
  });

  test('the generated names are the session`s worker keys, capitalised — both ways', () => {
    const emitted = signaturesOf(SESSION_WORKERS);
    const names = [...emitted.matchAll(/^export interface (\w+)Envelope/gm)].map((m) => m[1]!);
    equal(names.sort(), Object.keys(SESSION_WORKERS).map((k) => k.charAt(0).toUpperCase() + k.slice(1)).sort(),
      'one envelope per worker entry, and no entry without one');
  });

  test('every worker of the L6 corpus generates, and nothing in the subset defeats it', () => {
    const text = signaturesOf(l6Workers as unknown as Record<string, { inputSchema?: JsonSchema }>);
    equal([...text.matchAll(/^export interface \w+Envelope/gm)].length, Object.keys(l6Workers).length, 'fourteen entries, fourteen envelopes');
    // A BARE `undefined` as a type is a keyword that fell through; the STRING "undefined" is a
    // legitimate enum value and `typed`'s schema declares one, which is how this assertion was wrong
    // the first time it ran — the expected value, not the generator.
    equal(text.split('\n').filter((l) => /[:=]\s*undefined/.test(l)), [], 'no keyword fell through to a bare `undefined`');
    ok(!text.includes('[object Object]'), 'and none to a stringified object');
    ok(text.includes('"inputType": "array" | "null"'), 'while the string "undefined" survives inside an enum, as `typed` declares it');
  });
});

suite('W109 — sampledOutput: the shape a transform-only node emits, and the residue it reports beside it', (test) => {
  // **On the WIRING corpus, whose workers declare schemas — and that choice is the point.** The first
  // cut of this suite used `spec/examples/registry.json` and the arcs came back `unchecked` there
  // because NOTHING in that corpus declares a schema, so the claim *the arc leaving a transform-only
  // node is unchecked* was true of every arc in the document and said nothing about the node. Here
  // `Scored` declares an `outputSchema` and `Text` an `inputSchema`, so an `unchecked` verdict on the
  // arc LEAVING `reshape` is attributable to `reshape` alone — the consuming side has a schema and the
  // producing side is the thing with none.
  const SCORED_OUT = (wiringDoc.workers as unknown as Record<string, { outputSchema?: JsonSchema }>).scored!.outputSchema!;
  const flow = (expr: string): FlowDefinition => ({
    flowId: 'transform-only', version: 1, entry: 'score',
    nodes: [
      { id: 'score', kind: 'task', type: 'Scored', edges: [{ to: 'reshape' }] },
      { id: 'reshape', kind: 'task', type: 'Transform', transform: { lang: 'path', expr }, edges: [{ to: 'title' }] },
      { id: 'title', kind: 'task', type: 'Text', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition);

  test('schemaOfValue: the narrowest schema of the subset that ONE value satisfies, and `undefined` has none', () => {
    // Every expected value written from ADR 0053's subset, never from the function's output.
    equal(schemaOfValue(undefined), undefined, 'undefined has no schema in the subset — a transform may evaluate to nothing (ADR 0051)');
    equal(schemaOfValue(null), { type: 'null' }, 'null is its own type');
    equal(schemaOfValue('x'), { type: 'string' }, 'a string');
    equal(schemaOfValue(true), { type: 'boolean' }, 'a boolean');
    equal(schemaOfValue(3), { type: 'integer' }, 'a WHOLE number is integer — the narrowest of the two');
    equal(schemaOfValue(3.5), { type: 'number' }, 'and any other number is number');
    equal(schemaOfValue([]), { type: 'array' }, 'an EMPTY array carries no items — one value says nothing about them');
    equal(schemaOfValue([1, 2]), { type: 'array', items: { type: 'integer' } }, 'and a non-empty one takes its FIRST element');
    equal(schemaOfValue({ a: 1, b: 'x' }),
      { type: 'object', required: ['a', 'b'], properties: { a: { type: 'integer' }, b: { type: 'string' } }, additionalProperties: false },
      'an object: every own key REQUIRED and nothing else allowed, because this value had exactly those keys');
    equal(schemaOfValue({ a: undefined }), { type: 'object', properties: {}, additionalProperties: false },
      'an own key holding undefined describes nothing, so it is neither a property nor required');
    equal(schemaOfValue(() => 1), undefined, 'a function is outside the subset');
    // Every schema it emits is one the subset ACCEPTS — a relation rather than a restatement, and
    // `schemaProblem` is `schema.ts`'s rather than this function's.
    for (const v of [null, 'x', true, 3, 3.5, [], [1], { a: 1 }, { a: { b: [null] } }]) {
      equal(schemaProblem(schemaOfValue(v)!), null, `the schema for ${JSON.stringify(v)} is INSIDE the subset`);
    }
    // And it accepts the value it was inferred from, which is what "satisfies" means.
    for (const v of [null, 'x', true, 3, 3.5, [1, 2], { a: 1, b: 'x' }]) {
      equal(findings(schemaOfValue(v)!, v), [], `and it accepts ${JSON.stringify(v)} — the value it came from`);
    }
  });

  test('the sampled shape, DERIVED from the producer`s own schema before any output is read', async () => {
    // `Scored`'s outputSchema declares `label: string` and `confidence: number`, and `reshape` picks
    // `label`. So the sample's result is whatever the declared example (or the witness) holds at that
    // key, and its SHAPE is the one that key's schema names. Both derived here from the document.
    const props = (SCORED_OUT as { properties?: Record<string, JsonSchema> }).properties ?? {};
    equal((props.label as { type?: string }).type, 'string', 'the producer declares `label` a string — the fixture`s expression picks it');
    const out = await sampledOutput(wiringRegistry as never, flow('label'), 'reshape');
    equal(out.node, 'reshape', 'the node asked about');
    ok(out.sample !== undefined, `a sample was built on the producing side — ${out.why ?? ''}`);
    equal(out.schema, { type: 'string' }, 'and the sampled shape is a string, which is what the producer`s schema says of that key');
    equal(out.schema, schemaOfValue(out.sample!.result), 'the schema IS schemaOfValue of the sampled result — one road, stated');
    equal(findings(props.label!, out.sample!.result), [], 'the sampled value satisfies the producer`s own schema for the key it came from');
    equal(out.sample!.source, 'example', 'from the producer`s DECLARED example — `scored` carries one (Q301)');
    equal(out.why, undefined, 'and nothing is unexplained');
  });

  test('OUTPUT 4`s CLAIM: the arcs LEAVING are still `unchecked`, with a consumer that DOES declare a schema', async () => {
    // **The strongest claim in this item and the easiest to make falsely.** A sample is evidence about
    // ONE input; `fits` is a claim about every input. [Q446] is the residue and P26 prediction 4 says
    // this item does not remove it — so the function RETURNS the departing verdicts and this asserts
    // they are unchanged. The CONTROL for its vacuity is `title`: it declares an `inputSchema`, so if
    // `reshape` declared an `outputSchema` this arc would be judged, and the `unchecked` is therefore
    // attributable to the transform-only node rather than to a schema-free corpus.
    const f = flow('label');
    const out = await sampledOutput(wiringRegistry as never, f, 'reshape');
    ok(out.leaving.length > 0, 'there IS an arc leaving the node — a zero would make the clause below vacuous');
    equal(out.leaving.map((v) => v.kind), out.leaving.map(() => 'unchecked'),
      `every arc leaving the transform-only node is unchecked — got ${JSON.stringify(out.leaving.map((v) => [v.consumer, v.kind]))}`);
    equal(out.leaving.map((v) => v.consumer), ['title'], 'and it is the arc into the consuming node');
    // The CONTROL: the same consumer, judged `fits` when the producer DOES declare an output schema.
    // Without this the claim is satisfied by a corpus in which nothing is ever checked.
    const direct: FlowDefinition = {
      flowId: 'direct', version: 1, entry: 'score',
      nodes: [
        { id: 'score', kind: 'task', type: 'Scored', edges: [{ to: 'title' }] },
        { id: 'title', kind: 'task', type: 'Text', transform: { lang: 'path', expr: 'label' }, edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const control = (await checkWiring(wiringRegistry as never, direct)).verdicts.filter((v) => v.consumer === 'title');
    equal(control.map((v) => v.kind), ['transform-passes'],
      'CONTROL: the same consumer and the same expression, one node fewer, is JUDGED — so the unchecked above is the transform-only node`s and not the corpus`s');
    // The REASON names the type rather than a missing worker — the misleading message W109 replaced.
    const why = out.leaving[0]!.why;
    ok(why.includes('only TRANSFORMS') && why.includes('names no worker'),
      `the reason names what the type IS, not a worker the registry lacks — ${why}`);
    ok(!why.includes('is not in the registry'),
      `and does NOT send an author to add a worker the type is defined not to have — ${why}`);
    // Independent of this function: the same verdict read straight off the check.
    const report = await checkWiring(wiringRegistry as never, f);
    equal(report.verdicts.filter((v) => v.producer === 'reshape').map((v) => v.kind), ['unchecked'],
      'and checkWiring says the same on its own — the claim is the check`s, not this reading`s');
  });

  test('a CANDIDATE transform is answered without editing the flow, and the two candidates DIFFER', async () => {
    // The discriminating pair: two expressions over one document, so no literal can stand in for the
    // evaluation. `label` is a string and `confidence` a number in the producer's own schema.
    const f = flow('label');
    const asString = await sampledOutput(wiringRegistry as never, f, 'reshape', { lang: 'path', expr: 'label' });
    const asNumber = await sampledOutput(wiringRegistry as never, f, 'reshape', { lang: 'path', expr: 'confidence' });
    equal(asString.schema, { type: 'string' }, 'the candidate picking `label` emits a string');
    equal(asNumber.schema, { type: 'number' }, 'the candidate picking `confidence` emits a number');
    ok(JSON.stringify(asString.schema) !== JSON.stringify(asNumber.schema),
      'and the two candidates do not agree — collapsing this pair would leave the evaluation unasserted');
    // The flow is not mutated: asking about a candidate leaves the document's own answer alone.
    equal((await sampledOutput(wiringRegistry as never, f, 'reshape')).schema, { type: 'string' },
      'the document`s own transform still answers for itself — a candidate is a question, not an edit');
    equal((f.nodes.find((n) => n.id === 'reshape') as unknown as { transform?: unknown }).transform,
      { lang: 'path', expr: 'label' }, 'and the node is unchanged');
  });

  test('a FAILED transform reports the failure and withholds a schema — it emitted nothing', async () => {
    // **W109's conformity reader (4).** `WiringSample.result` is *what it produced, OR THE FAILURE'S
    // MESSAGE*, and `sampledOutput` selected on `'result' in sample` alone — so on `transform-fails`
    // it returned the shape of the ERROR TEXT as the node's output. Measured: `{ type: 'string' }` for
    // the message. An authoring UI, which is this function's whole purpose, would have shown it.
    const bad = await sampledOutput(wiringRegistry as never, flow('label.x'), 'reshape');
    equal(bad.schema, undefined, 'no schema — a node that threw emitted nothing to describe');
    ok(bad.why !== undefined && bad.why.includes('threw'), `the reason is the failure: ${bad.why}`);
    // The substring is taken from the failure this actually prints — the language's own CODE is on the
    // verdict's `why` and the MESSAGE is on `sample.result`, which is the field this reads.
    ok(bad.sample !== undefined && typeof bad.sample.result === 'string' && bad.sample.result.includes('cannot read "x" of string'),
      `and the sample still carries what it was handed and what it threw: ${JSON.stringify(bad.sample)}`);
    equal(bad.sample!.value, { label: 'alpha', confidence: 0.5 }, 'the value it was handed is the producer`s declared example');
    // The CONTROL, so the clause above is about the FAILURE and not about this expression: the same
    // node and a working expression gives a schema and no reason.
    const good = await sampledOutput(wiringRegistry as never, flow('label'), 'reshape');
    equal([good.schema, good.why], [{ type: 'string' }, undefined], 'CONTROL: a working expression gives a schema and no reason');
    // And the verdict kind is what discriminates them, read off the check rather than inferred.
    const kinds = async (expr: string) => (await checkWiring(wiringRegistry as never, flow(expr))).verdicts
      .filter((v) => v.consumer === 'reshape').map((v) => v.kind);
    equal([await kinds('label.x'), await kinds('label')], [['transform-fails'], ['unchecked']],
      'the check calls one transform-fails and the other unchecked — which is the field this function reads');
  });

  test('a transform that evaluates to NOTHING has no schema and SAYS so — the other documented residue', async () => {
    // The adequacy reader (F9): `SampledOutput.why` documents two reasons and only one was exercised,
    // and deleting the second cost ZERO. Its trigger is the most likely authoring mistake there is —
    // a mis-typed key path, which W61's own suite calls silent because an adapter cannot tell a typo
    // from an intended absence.
    const typo = await sampledOutput(wiringRegistry as never, flow('lbael'), 'reshape');
    equal(typo.schema, undefined, 'a mis-typed key path yields undefined, which the subset cannot describe');
    ok(typo.why !== undefined && typo.why.includes('produced undefined') && typo.why.includes('subset'),
      `and it says which of the two reasons it is: ${typo.why}`);
    ok(typo.sample !== undefined, 'while still returning the sample it ran on');
    // The OBJECT arm of `schemaOfValue`, reached THROUGH the feature rather than on a direct call —
    // which is what a reshaping node actually emits (the reader's coverage note).
    const whole = await sampledOutput(wiringRegistry as never, flow('$'), 'reshape');
    equal(whole.schema, {
      type: 'object', required: ['label', 'confidence'],
      properties: { label: { type: 'string' }, confidence: { type: 'number' } },
      additionalProperties: false,
    }, 'and `$` emits the producer`s whole value — the object arm, through the feature');
  });

  test('the reason on the arc INTO a transform-only node names the TYPE too — the copy a wiring author meets first', async () => {
    // The adequacy reader (F7): the reason exists in TWO copies in `wiring.ts`, and only the one on
    // the arc LEAVING was asserted. Reverting the other to the pre-W109 *worker "<envelope>" ... is not
    // in the registry* cost ZERO — and it is the arc an author wiring a reshaping step meets FIRST.
    const into = (await checkWiring(wiringRegistry as never, flow('label'))).verdicts.filter((v) => v.consumer === 'reshape');
    equal(into.map((v) => v.kind), ['unchecked'], 'the arc into it is unchecked — it declares no inputSchema either');
    const why = into[0]!.why;
    ok(why.includes('only TRANSFORMS') && why.includes('names no worker'),
      `and the reason names what the type IS: ${why}`);
    ok(!why.includes('is not in the registry'), `not a worker the registry lacks: ${why}`);
    ok(why.includes('the transform ran and nothing holds its result'),
      `and it says the transform RAN — which is what makes the sampled shape available at all: ${why}`);
  });

  test('a node with NO arcs into it, and one that names no task, each report rather than throw', async () => {
    const f = flow('label');
    const entry = await sampledOutput(wiringRegistry as never, f, 'score');
    ok(entry.sample === undefined && entry.why !== undefined && entry.why.includes('no arcs into it'),
      `the ENTRY node has nothing arriving, so there is no sample to transform — ${entry.why ?? JSON.stringify(entry)}`);
    equal(entry.leaving.length, 1, 'and its departing arc is still reported');
    const nobody = await sampledOutput(wiringRegistry as never, f, 'no-such-node');
    equal([nobody.leaving.length, nobody.sample], [0, undefined], 'a node id that names nothing returns no arcs and no sample');
    ok(nobody.why !== undefined, 'with a reason — an authoring tool reports');
    // **An EMPTY `leaving` is a node nothing consumes, not a node whose arcs are fine** — the
    // adequacy reader (F13): the suite's own `ok(out.leaving.length > 0)` shows the zero is the
    // vacuity case for the claim, and it was never exercised. Here it is: a transform-only node whose
    // only edge goes to an `end` has a schema, a sample and no departing arc at all.
    const toEnd: FlowDefinition = {
      flowId: 'to-end', version: 1, entry: 'score',
      nodes: [
        { id: 'score', kind: 'task', type: 'Scored', edges: [{ to: 'reshape' }] },
        { id: 'reshape', kind: 'task', type: 'Transform', transform: { lang: 'path', expr: 'label' }, edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const terminal = await sampledOutput(wiringRegistry as never, toEnd, 'reshape');
    equal(terminal.leaving.length, 0, 'no arc LEAVES a node whose successor is an `end` — there is no consumer to judge');
    equal(terminal.schema, { type: 'string' }, 'and the sampled shape is still there, which is what makes the zero distinguishable from a failure');
  });
});
