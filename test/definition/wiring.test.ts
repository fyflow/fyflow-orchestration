/**
 * **The wiring check — one verdict per arc, from the schemas the workers declare** —
 * `spec/flow-definition.md` section 3's *what the schemas buy an author* subsection (v0.21),
 * [P19](../../doc/plans/p19-what-a-schema-buys-an-author.md) decisions 4 and 8,
 * [W73](../../doc/work-items/w73-the-wiring-check-a-verdict-per-edge-and-two-boundaries-validated-once.md).
 *
 * Every expected value is from a DOCUMENT: P19 fact 3's twelve controls (`dev-dist/p19/fact-3-controls.log`,
 * eight negative) rebuilt here from the corpus schemas they were named after; the wiring fixture
 * corpus in `spec/examples/wiring/`, whose verdicts section 7 tabulates and this file compares
 * BOTH WAYS; the L6 corpus (`examples/registry.json` and `examples/flows/`), whose census W73's
 * declaration measured and this file holds as an EQUALITY; and `JP-R12`'s record shape and
 * `FD-C1`'s reference table for the constructed cases. Never from the check's own output.
 *
 * Rule 8 obligation (a) — the SHAPES: every arc shape the relation ranges over (`edge`, `branch`,
 * `item`, `record`, `needs`) occurs in the L6 census and the set is asserted, every verdict KIND is
 * reached by a fixture document and that set is asserted, and both enumerations are held to the
 * spec's tables both ways (obligation (e)'s third shape — a list is a claim about another list).
 */
import { equal, listDir, ok, readText, ROOT, suite } from '../harness.ts';
import { checkWiring, describeVerdict, boundaryTargets, fits, VERDICT_KINDS, WIRING_SHAPES, type VerdictKind, type WiringReport, type WiringShape } from '../../src/definition/wiring.ts';
import { validateDefinition, violatedRules } from '../../src/definition/validate.ts';
import { resolveRegistry } from '../../src/definition/registry.ts';
import type { FlowDefinition, JsonSchema } from '../../src/definition/types.ts';
import { corpusRegistry, CORPUS_LANGUAGES, type CorpusRegistryDocument } from './corpus-types.ts';
import { PATH_LANGUAGE } from '../scheduler/fake-language.ts';
import compileExpression, { jsonata } from '../../src/jsonata/index.ts';
import l6Registry from '../../examples/registry.json' with { type: 'json' };

const EX = `${ROOT}spec/examples`;
const specText = await readText(`${ROOT}spec/flow-definition.md`);
const wiringDoc = JSON.parse(await readText(`${EX}/wiring/registry.json`)) as CorpusRegistryDocument;
const wiringRegistry = { workers: wiringDoc.workers, nodeTypes: wiringDoc.nodeTypes, languages: CORPUS_LANGUAGES };
const wiringNames = (await listDir(`${EX}/wiring`)).filter((n) => n.endsWith('.flow.json')).sort();
const loadWiring = async (n: string) => JSON.parse(await readText(`${EX}/wiring/${n}`)) as FlowDefinition;

// ---- the corpus schemas the controls were named after (examples/registry.json, W72's document) ----
const W = l6Registry.workers as unknown as Record<string, { inputSchema?: JsonSchema; outputSchema?: JsonSchema }>;
const CONF = { type: 'number', minimum: 0, maximum: 1 } as const;

/**
 * `spec/flow-definition.md`'s subsection, sliced between its heading and the next heading — EMPTY when
 * the heading is gone, never a throw: an assertion at module scope takes the whole runner down with
 * zero FAIL lines (Q272's shape; rule 8 probe `e2` measured it here), so the tests assert on it.
 */
const subsection = (() => {
  const from = specText.indexOf('#### What the schemas buy an author');
  if (from < 0) return '';
  const rest = specText.slice(from + 5);
  const stop = rest.search(/\n#{2,4} /);
  return rest.slice(0, stop < 0 ? undefined : stop);
})();
/** The first-column code spans of the table whose header row is `| <first> |`. */
const tableIds = (text: string, header: string): string[] => {
  const i = text.indexOf(`| ${header} |`);
  ok(i >= 0, `the spec has a table headed "${header}"`);
  const rows = text.slice(i).split('\n').slice(2);
  const out: string[] = [];
  for (const r of rows) {
    const m = /^\|\s*`([^`]+)`\s*\|/.exec(r);
    if (!m) break;
    out.push(m[1]!);
  }
  return out;
};

suite('W73 — fits(P, C): P19 fact 3`s relation, its twelve controls as fixtures, its stated leniency and the map record', (test) => {
  // The controls of fact-3-controls.log, in order: four positive, eight negative, each with the reason it printed.
  const CONTROLS: [string, JsonSchema, JsonSchema, 'fits' | 'no', string][] = [
    ['CONTROL score -> ingest (fits)', W.score!.outputSchema!, W.ingest!.inputSchema!, 'fits', ''],
    ['score -> consumer REQUIRING text', W.score!.outputSchema!, { type: 'object', required: ['text'], properties: { text: { type: 'string' } } }, 'no', 'consumer requires "text", producer does not guarantee it'],
    ['tally (word nullable) -> consumer word: string', W.tally!.outputSchema!, { type: 'object', properties: { word: { type: 'string' } } }, 'no', '$.word: producer may be null, consumer accepts string'],
    ['number producer -> integer consumer', { type: 'number' }, { type: 'integer' }, 'no', 'producer may be number, consumer accepts integer'],
    ['integer producer -> number consumer (fits)', { type: 'integer' }, { type: 'number' }, 'fits', ''],
    ['OPEN producer -> additionalProperties:false consumer', { type: 'object', properties: { a: { type: 'number' } } }, { type: 'object', properties: { a: { type: 'number' } }, additionalProperties: false }, 'no', 'consumer forbids extra keys, producer may emit any'],
    ['producer confidence 0..1 -> consumer minimum 0.5', { type: 'object', properties: { confidence: CONF } }, { type: 'object', properties: { confidence: { type: 'number', minimum: 0.5 } } }, 'no', '$.confidence: producer minimum 0 is looser than consumer minimum 0.5'],
    ['enum producer -> narrower enum consumer', { enum: ['a', 'b', 'c'] }, { enum: ['a', 'b'] }, 'no', 'producer may emit ["c"] which consumer\'s enum refuses'],
    ['enum producer -> wider enum consumer (fits)', { enum: ['a', 'b'] }, { enum: ['a', 'b', 'c'] }, 'fits', ''],
    ['array of strings -> array of integers', { type: 'array', items: { type: 'string' } }, { type: 'array', items: { type: 'integer' } }, 'no', '$[]: producer may be string, consumer accepts integer'],
    ['ANY producer -> ANY consumer (fits)', {}, {}, 'fits', ''],
    ['ANY producer -> typed consumer', {}, { type: 'object' }, 'no', 'producer may be array|string|number|integer|boolean|null, consumer accepts object'],
  ];
  // Inside a test, never at the suite's build time: an `equal` there is a throw at module load and the
  // runner dies with zero FAIL lines (rule 8 probe `d1` measured exactly that — a crash, not a detection).
  test('twelve controls, eight negative, as fact 3 declared', () => {
    equal(CONTROLS.length, 12, 'twelve controls, as fact 3 declared');
    equal(CONTROLS.filter(([, , , v]) => v === 'no').length, 8, 'eight of them negative, as fact 3 declared');
  });
  test('the `const` clause — the one keyword the twelve controls never exercised (rule 8 probe r2 survived until this existed)', () => {
    equal(fits({ const: true }, { const: true }).verdict, 'fits', 'the same literal');
    const r = fits({ type: 'boolean' }, { const: true });
    equal(r.verdict, 'no', 'a boolean producer into a consumer requiring one value');
    ok(r.why.includes('consumer requires const true'), r.why);
    equal(fits({ const: 'a' }, { enum: ['a', 'b'] }).verdict, 'fits', 'a const producer into an enum that holds it');
    equal(fits({ const: 'c' }, { enum: ['a', 'b'] }).verdict, 'no', 'and into one that does not');
  });
  // **Seven clause controls beyond fact 3's twelve** — W73's adequacy reader found `fits` lenient for ZERO
  // five ways, each a clause or an enumerated keyword no control reached: an unbounded producer into an
  // enum; `minLength`, `maxLength`, `minItems` (each removable from the bounds list); `maximum`'s DIRECTION
  // (the corpus's one pair is 1 into 1, which cannot tell `<=` from `>=`); a producer with no `items`; and
  // the leak between two closed objects. Each with its positive twin, so the direction is bound and not
  // the keyword's presence alone (v0.17's enumeration clause: the set is the enumeration, five of five).
  const CLAUSE_CONTROLS: [string, JsonSchema, JsonSchema, 'fits' | 'no', string][] = [
    ['unbounded string -> enum consumer', { type: 'string' }, { enum: ['a'] }, 'no', 'consumer requires one of ["a"], producer is unbounded'],
    ['const producer -> enum consumer holding it (fits)', { const: 'a' }, { enum: ['a'] }, 'fits', ''],
    ['string with no minLength -> consumer minLength 2', { type: 'string' }, { type: 'string', minLength: 2 }, 'no', 'consumer bounds minLength 2, producer declares no minLength'],
    ['producer minLength 1 -> consumer minLength 2', { type: 'string', minLength: 1 }, { type: 'string', minLength: 2 }, 'no', 'producer minLength 1 is looser than consumer minLength 2'],
    ['producer minLength 3 -> consumer minLength 2 (fits)', { type: 'string', minLength: 3 }, { type: 'string', minLength: 2 }, 'fits', ''],
    ['producer maxLength 9 -> consumer maxLength 3', { type: 'string', maxLength: 9 }, { type: 'string', maxLength: 3 }, 'no', 'producer maxLength 9 is looser than consumer maxLength 3'],
    ['producer maxLength 3 -> consumer maxLength 9 (fits)', { type: 'string', maxLength: 3 }, { type: 'string', maxLength: 9 }, 'fits', ''],
    ['array with no minItems -> consumer minItems 1', { type: 'array' }, { type: 'array', minItems: 1 }, 'no', 'consumer bounds minItems 1, producer declares no minItems'],
    ['producer minItems 2 -> consumer minItems 1 (fits)', { type: 'array', minItems: 2 }, { type: 'array', minItems: 1 }, 'fits', ''],
    ['producer minItems 0 -> consumer minItems 1', { type: 'array', minItems: 0 }, { type: 'array', minItems: 1 }, 'no', 'producer minItems 0 is looser than consumer minItems 1'],
    ['producer maximum 5 -> consumer maximum 1 (the direction)', { type: 'number', maximum: 5 }, { type: 'number', maximum: 1 }, 'no', 'producer maximum 5 is looser than consumer maximum 1'],
    ['producer maximum 1 -> consumer maximum 5 (fits, the other direction)', { type: 'number', maximum: 1 }, { type: 'number', maximum: 5 }, 'fits', ''],
    ['array with no items -> consumer constraining items', { type: 'array' }, { type: 'array', items: { type: 'object' } }, 'no', '$[]: consumer constrains items, producer does not'],
    ['two closed objects, the producer emitting a key the consumer forbids', { type: 'object', properties: { a: { type: 'number' }, b: { type: 'number' } }, additionalProperties: false }, { type: 'object', properties: { a: { type: 'number' } }, additionalProperties: false }, 'no', 'producer emits b which consumer forbids'],
    ['two closed objects, the producer emitting only what the consumer names (fits)', { type: 'object', properties: { a: { type: 'number' } }, additionalProperties: false }, { type: 'object', properties: { a: { type: 'number' }, b: { type: 'number' } }, additionalProperties: false }, 'fits', ''],
  ];
  test('the bounds list is instantiated five of five, each keyword in BOTH directions (the adequacy reader`s a2-a5)', () => {
    const keywords = ['minimum', 'maximum', 'minLength', 'maxLength', 'minItems'];
    // Read through the whole consumer schema (control 7's `minimum` sits under a property), as a key.
    const reached = keywords.filter((k) => [...CONTROLS, ...CLAUSE_CONTROLS].some(([, , C]) => JSON.stringify(C).includes(`"${k}":`)));
    equal(reached, keywords, 'every keyword of the bounds list has a control on the consumer side');
    const looser = keywords.filter((k) => CLAUSE_CONTROLS.some(([, , , v, why]) => v === 'no' && why.includes(`looser than consumer ${k}`)) || k === 'minimum');
    equal(looser.sort(), keywords.slice().sort(), 'and each is bound in the looser-than direction (minimum by control 7)');
  });
  for (const [name, P, C, want, why] of [...CONTROLS, ...CLAUSE_CONTROLS]) {
    test(name, () => {
      const r = fits(P, C);
      equal(r.verdict, want, `verdict for ${name}`);
      ok(r.why.includes(why), `the reason reads as the control log printed it: got "${r.why}"`);
    });
  }

  test('the stated LENIENCY: an open producer into a consumer DESCRIBING an optional key fits, and REQUIRING it is no', () => {
    const open = { type: 'object', properties: { a: { type: 'number' } } };
    equal(fits(open, { type: 'object', properties: { b: { type: 'number' } } }).verdict, 'fits', 'a key the producer does not name is read as never emitted');
    equal(fits(open, { type: 'object', required: ['b'], properties: { b: { type: 'number' } } }).verdict, 'no', 'unless the consumer requires it');
    // A closed producer is not lenient about anything: the same optional key is met by `additionalProperties: false` alone.
    equal(fits({ ...open, additionalProperties: false }, { type: 'object', properties: { b: { type: 'number' } } }).verdict, 'fits', 'a closed producer never emits b');
  });

  test('a map`s record — branch-path keys of the branch`s shape — meets a consumer naming a path, and never one naming another key', () => {
    const branch = { type: 'object', required: ['score'], properties: { score: { type: 'integer' } }, additionalProperties: false };
    const record = { type: 'object', additionalProperties: branch, branchKeys: true } as JsonSchema;
    equal(fits(record, { type: 'object' }).verdict, 'fits', 'any object');
    equal(fits(record, { type: 'object', properties: { '0': { type: 'object' } } }).verdict, 'fits', 'a path key described as an object');
    equal(fits(record, { type: 'object', properties: { '0': { type: 'number' } } }).verdict, 'no', 'a path key described as a number: the branch is an object');
    equal(fits(record, { type: 'object', properties: { confidence: { type: 'number' } } }).verdict, 'fits', 'a key the record can never mint is never met');
    equal(fits(record, { type: 'object', required: ['0'] }).verdict, 'no', 'a required key: a map may mint none');
    equal(fits(record, { type: 'object', additionalProperties: false }).verdict, 'no', 'a closed consumer: the record`s keys are unknown');
    // A schema an author writes can never carry the marker: the subset refuses `additionalProperties` as a schema.
    ok(!('branchKeys' in { type: 'object' }), 'the marker is the check`s own and no fixture here carries it');
  });
});

suite('W73 — the two enumerations are the spec`s tables, both ways', (test) => {
  test('the root exports the check, the relation, the witness and the refusal class — an authoring tool a consumer can import', async () => {
    const lib = await import('../../index.ts') as Record<string, unknown>;
    for (const name of ['checkWiring', 'fits', 'describeVerdict', 'boundaryTargets', 'witness', 'sampleOf', 'BoundaryRefused']) {
      ok(typeof lib[name] === 'function', `index.ts re-exports ${name}`);
    }
    equal(lib.VERDICT_KINDS, VERDICT_KINDS, 'and the enumeration');
  });
  test('VERDICT_KINDS is exactly the verdict table', () => {
    equal([...VERDICT_KINDS].sort(), tableIds(subsection, 'verdict').sort(), 'the five verdicts, both ways');
    equal(VERDICT_KINDS.length, 5, 'five: the plan`s four and `unchecked`');
  });
  test('WIRING_SHAPES is exactly the arc table', () => {
    equal([...WIRING_SHAPES].sort(), tableIds(subsection, 'arc').sort(), 'the five shapes, both ways');
  });
});

suite('W73 — the wiring fixture corpus IS what section 7 says it is, and every verdict kind is reached', (test) => {
  /** Section 7's wiring table: file -> the verdict cell, `kind: producer -> consumer` joined by `;`. Empty when the corpus is not named (asserted below, inside a test). */
  const documented = (() => {
    const from = specText.indexOf('`spec/examples/wiring/`');
    if (from < 0) return new Map<string, string>();
    const rows = [...specText.slice(from).matchAll(/^\|\s*`([A-Za-z0-9_.-]+\.flow\.json)`\s*\|([^|]*)\|/gm)];
    return new Map(rows.map((m) => [m[1]!, m[2]!.trim()]));
  })();
  const verdictsOf = (r: WiringReport) => r.verdicts.map((v) => `${v.kind}: ${v.producer} -> ${v.consumer}`).sort().join('; ');

  test('every document on disk has a row, and every row a document', () => {
    equal(wiringNames.filter((n) => !documented.has(n)), [], 'a document in spec/examples/wiring/ has no row in section 7');
    equal([...documented.keys()].filter((n) => !wiringNames.includes(n)), [], 'section 7 names a wiring document that is not on disk');
    ok(documented.size > 0 && wiringNames.length > 0, 'neither side is empty');
  });
  test('the registry is a registry document and resolves; every document validates clean against it', async () => {
    resolveRegistry(wiringDoc, { predicates: wiringDoc.predicates, languages: CORPUS_LANGUAGES });
    const reg = corpusRegistry(wiringDoc);
    for (const n of wiringNames) equal(violatedRules(validateDefinition(await loadWiring(n), reg)), [], `${n} validates — a miswire VALIDATES, which is why it lives here and not in invalid/`);
  });
  for (const n of wiringNames) {
    test(`${n}: its verdicts are the row's`, async () => {
      const r = await checkWiring(wiringRegistry, await loadWiring(n));
      equal(verdictsOf(r), documented.get(n), `the verdicts section 7 records for ${n}`);
      // The filename's prefix is the verdict the document exists for, as invalid/'s is the rule id.
      ok(r.verdicts.some((v) => v.kind === n.split('--')[0]), `the document earns the verdict its name carries`);
      for (const v of r.verdicts.filter((v) => v.kind.startsWith('transform'))) {
        ok(v.sample !== undefined && describeVerdict(v).includes(`on the ${v.sample.source}`), 'a transformed verdict names its sample`s source (Q301)');
      }
    });
  }
  test('every verdict kind is reached by some document — the check`s positive cases, one per kind', async () => {
    const seen = new Set<VerdictKind>();
    for (const n of wiringNames) for (const v of (await checkWiring(wiringRegistry, await loadWiring(n))).verdicts) seen.add(v.kind);
    equal([...seen].sort(), [...VERDICT_KINDS].sort(), 'the kinds the fixture corpus reaches are exactly the five');
  });
});

suite('W73 — the L6 corpus census, as an EQUALITY, and every arc shape reached', (test) => {
  const flowsDir = `${ROOT}examples/flows`;
  const registry = { workers: l6Registry.workers, nodeTypes: l6Registry.nodeTypes, languages: { jsonata } } as unknown as Parameters<typeof checkWiring>[0];
  const options = { workerHalf: { jsonata: compileExpression } };
  let reports: WiringReport[] = [];
  test('the census: 62 fit, 1 no, 5 transform-passes, 2 transform-fails, 8 unchecked over 25 flows', async () => {
    const names = (await listDir(flowsDir)).filter((n) => n.endsWith('.flow.json')).sort();
    ok(names.length === 25, `25 L6 flows, got ${names.length}`);
    reports = [];
    for (const n of names) reports.push(await checkWiring(registry, JSON.parse(await readText(`${flowsDir}/${n}`)) as FlowDefinition, options));
    const counts: Record<VerdictKind, number> = { 'fits': 0, 'no': 0, 'transform-passes': 0, 'transform-fails': 0, 'unchecked': 0 };
    for (const r of reports) for (const v of r.verdicts) counts[v.kind]++;
    // W73's declaration (fact G), on the document as this item corrected it: split's per-item
    // confidence bounded, typed's echoed items typed. The 8 unchecked are the five join records a
    // `fail`-worker branch reaches (it declares no outputSchema by design, ADR 0056 rule 4) and
    // triage's three GpuModel arcs — a CLASS type W67's shim registers in code, which a document
    // alone cannot carry; ladder L6 runs the check on every row over the RUNTIME's registry (decision
    // 14's object, the class included) and asserts triage has no unchecked arc there.
    equal(counts, { 'fits': 62, 'no': 1, 'transform-passes': 5, 'transform-fails': 2, 'unchecked': 8 }, 'the L6 census');
    // And the one `no` is the FD-R2 prediction: map-no-array's `over: "rows"` on a producer that never emits it.
    const no = reports.flatMap((r) => r.verdicts.filter((v) => v.kind === 'no'));
    equal(no.map((v) => `${v.through}:${v.consumer}`), ['split:score'], 'the one no');
    ok(no[0]!.why.includes('FD-R2'), `the reason names the run-time refusal it predicts: ${no[0]!.why}`);
  });
  test('every arc shape the relation ranges over occurs in the census, and nothing else does', () => {
    const seen = new Set<WiringShape>();
    for (const r of reports) for (const v of r.verdicts) seen.add(v.shape);
    equal([...seen].sort(), [...WIRING_SHAPES].sort(), 'the five shapes, both ways');
  });
  test('the transformed arcs name their sample and, where the producer is a region or a map, its arity (Q263, Q301)', () => {
    const t = reports.flatMap((r) => r.verdicts.filter((v) => v.kind.startsWith('transform')));
    equal(t.length, 7, 'seven transformed arcs in the corpus');
    for (const v of t) ok(v.sample?.source === 'example', `${v.consumer}: every corpus example is declared, so every sample is one`);
    const total = t.find((v) => v.consumer === 'total')!;
    // Derived from the document: both branches are `Scorer` nodes, whose worker `typed` declares an output example with `score: 9`, so the record at arity two sums to 18.
    equal([total.shape, total.sample?.arity, total.sample?.result], ['record', 2, 18], 'transformed.flow`s total: the record at arity two, $sum([*.score]) over two example scores of 9');
  });
  test('the entry tasks are the wiring check`s own walk — a task entry, and every branch task of a fan-out entry', () => {
    const byId = new Map(reports.map((r) => [r.flowId, r]));
    equal(byId.get('map')!.entry, ['ingest'], 'a task entry');
    equal(byId.get('nested-map')!.entry, ['scoreA', 'prep'], 'nested-map opens with a fanout: both branch tasks');
  });
  test('the URL and the handed worker half are the same function wherever the URL imports (ADR 0052 rule 8)', async () => {
    let mod: { default?: unknown } | undefined;
    try { mod = (await import(jsonata.worker)) as { default?: unknown }; } catch { mod = undefined; }
    if (typeof mod?.default === 'function') equal(mod.default, compileExpression, 'the adapter module`s default IS the handle');
    else ok(true, 'this runtime cannot import the URL (the browser bundle, Q261); the handle stood in');
  });
});

suite('W73 — constructed shapes: needs, a fan-out`s record, a map`s arity, the witness road, provenance', (test) => {
  const OUT_A: JsonSchema = { type: 'object', required: ['x'], properties: { x: { type: 'integer' } }, additionalProperties: false, examples: [{ x: 1 }] };
  const NO_EXAMPLE: JsonSchema = { type: 'object', required: ['label'], properties: { label: { type: 'string', minLength: 2 } }, additionalProperties: false };
  const reg = (workers: Record<string, { inputSchema?: JsonSchema; outputSchema?: JsonSchema }>) => ({
    workers: Object.fromEntries(Object.entries(workers).map(([k, w]) => [k, { url: `corpus://${k}`, ...w }])),
    nodeTypes: Object.fromEntries(Object.keys(workers).map((k) => [k, { worker: k }])),
    languages: { path: PATH_LANGUAGE },
  });
  const task = (id: string, type: string, to: string, extra: Record<string, unknown> = {}) => ({ id, kind: 'task', type, edges: [{ to }], ...extra });
  const flow = (nodes: unknown[], entry = (nodes[0] as { id: string }).id): FlowDefinition => ({ flowId: 'c', version: 1, entry, nodes: nodes as FlowDefinition['nodes'] });

  test('needs — FD-C1`s four forms compose one schema: "." the edge`s value, an id its output, [id] an array of it, a ? makes the key optional', async () => {
    const r = reg({ A: { outputSchema: OUT_A }, B: { outputSchema: { type: 'object', required: ['y'], properties: { y: { type: 'string' } }, additionalProperties: false, examples: [{ y: 'b' }] } },
      C: { inputSchema: { type: 'object', required: ['own', 'a', 'all'], properties: { own: { type: 'object', required: ['y'] }, a: { type: 'object', required: ['x'] }, all: { type: 'array', items: { type: 'object' } }, maybe: { type: 'object' } } } },
      D: { inputSchema: { type: 'object', required: ['maybe'] } } });
    const f = flow([task('a', 'A', 'b'), task('b', 'B', 'c'), task('c', 'C', 'd', { needs: { own: '.', a: 'a', all: ['a'], maybe: 'a?' } }), task('d', 'D', 'done', { needs: { maybe: 'a?' } }), { id: 'done', kind: 'end', outcome: 'completed' }]);
    const report = await checkWiring(r, f);
    const c = report.verdicts.find((v) => v.consumer === 'c')!;
    equal([c.shape, c.kind], ['needs', 'fits'], 'the composed object fits a consumer requiring the three unconditional keys');
    const d = report.verdicts.find((v) => v.consumer === 'd')!;
    equal([d.shape, d.kind], ['needs', 'no'], 'a consumer REQUIRING a key a `?` reference may leave absent');
    ok(d.why.includes('consumer requires "maybe", producer does not guarantee it'), d.why);
  });

  test('a fan-out`s record is exact in its KEYS and requires NONE of them (JP-R12`s three roads): describing the paths fits, requiring one is no', async () => {
    const r = reg({ A: { outputSchema: OUT_A }, P: { inputSchema: { type: 'object', properties: { '0': { type: 'object', required: ['x'] }, '1': { type: 'object' } } } },
      Q: { inputSchema: { type: 'object', required: ['2'] } }, R: { inputSchema: { type: 'object', required: ['1'] } }, S: { inputSchema: { type: 'object', properties: { '0': { type: 'object', required: ['y'] } } } } });
    const mk = (successor: string, second: unknown[]) => flow([
      task('in', 'A', 'split'), { id: 'split', kind: 'fanout', branches: ['l', 'r'] }, task('l', 'A', 'join'), ...second,
      { id: 'join', kind: 'join', of: 'split', edges: [{ to: 'out' }] }, task('out', successor, 'done'), { id: 'done', kind: 'end', outcome: 'completed' }]);
    const plain = [task('r', 'A', 'join')];
    const p = (await checkWiring(r, mk('P', plain))).verdicts.find((v) => v.consumer === 'out')!;
    equal([p.shape, p.producer, p.kind], ['record', 'join', 'fits'], 'both paths described and neither required: fits');
    const s = (await checkWiring(r, mk('S', plain))).verdicts.find((v) => v.consumer === 'out')!;
    equal(s.kind, 'no', 'a path described with a shape the branch does not guarantee: the KEYS are exact');
    const q = (await checkWiring(r, mk('Q', plain))).verdicts.find((v) => v.consumer === 'out')!;
    equal(q.kind, 'no', 'a consumer requiring a path the region does not have');
    // A consumer REQUIRING a branch key is `no` whether or not the branch can visibly leave: a person may
    // resolve a non-optional branch task `failed` (RS-R3) and a policy may fire before it settles — W73's
    // conformity reader found the first cut reading `fits` here, the direction a run can falsify.
    const rr = (await checkWiring(r, mk('R', plain))).verdicts.find((v) => v.consumer === 'out')!;
    equal(rr.kind, 'no', 'requiring the key of a branch with no visible exit');
    ok(rr.why.includes('consumer requires "1", producer does not guarantee it'), rr.why);
    const leaves = mk('R', [{ id: 'r', kind: 'task', type: 'A', edges: [{ when: 'go', to: 'gone' }, { to: 'join' }] }, { id: 'gone', kind: 'end', outcome: 'left' }]);
    equal((await checkWiring(r, leaves)).verdicts.find((v) => v.consumer === 'out')!.kind, 'no', 'and of one that can');
  });

  test('a region INSIDE a map region — a fan-out in a map branch, a map in a map, a fan-out through a task in a map — gets verdicts and no throw (the conformity reader`s two documents)', async () => {
    // Shapes the validator accepts and the driver refuses at construction (Q160); the check is static
    // and must answer. Derived: every arc fits — the items are `B`'s shape and every consumer accepts an object.
    const A: JsonSchema = { type: 'object', required: ['items'], properties: { items: { type: 'array', items: { type: 'object', required: ['x'], properties: { x: { type: 'integer' } } } } }, additionalProperties: false, examples: [{ items: [{ x: 1 }, { x: 2 }] }] };
    const B: JsonSchema = { type: 'object', required: ['x'], properties: { x: { type: 'integer' } }, additionalProperties: false, examples: [{ x: 1 }] };
    // The successor is TRANSFORMED so the record's sample is reported (a `fits` verdict carries none): the
    // fake language's `0` picks the outer record's first key, and the sample's keys are what the check minted.
    const r = reg({ A: { outputSchema: A, inputSchema: {} }, B: { outputSchema: B, inputSchema: { type: 'object' } }, P: { inputSchema: { type: 'object' } } });
    const END = { id: 'done', kind: 'end', outcome: 'completed' };
    const OUT = { transform: { lang: 'path', expr: '0' } };
    const fanInMap = flow([task('in', 'A', 'each'), { id: 'each', kind: 'map', over: 'items', branch: 'fan' }, { id: 'fan', kind: 'fanout', branches: ['l', 'r'] }, task('l', 'B', 'fj'), task('r', 'B', 'fj'),
      { id: 'fj', kind: 'join', of: 'fan', edges: [{ to: 'gather' }] }, { id: 'gather', kind: 'join', of: 'each', edges: [{ to: 'out' }] }, task('out', 'P', 'done', OUT), END]);
    const mapInMap = flow([task('in', 'A', 'outer'), { id: 'outer', kind: 'map', over: 'items', branch: 'mid' }, task('mid', 'A', 'inner', { needs: { own: '.' } }), { id: 'inner', kind: 'map', over: 'items', branch: 'leaf' },
      task('leaf', 'B', 'ij'), { id: 'ij', kind: 'join', of: 'inner', edges: [{ to: 'oj' }] }, { id: 'oj', kind: 'join', of: 'outer', edges: [{ to: 'out' }] }, task('out', 'P', 'done', OUT), END]);
    const fanViaTask = flow([task('in', 'A', 'each'), { id: 'each', kind: 'map', over: 'items', branch: 'mid' }, task('mid', 'B', 'fan'), { id: 'fan', kind: 'fanout', branches: ['l', 'r'] }, task('l', 'B', 'fj'), task('r', 'B', 'fj'),
      { id: 'fj', kind: 'join', of: 'fan', edges: [{ to: 'gather' }] }, { id: 'gather', kind: 'join', of: 'each', edges: [{ to: 'out' }] }, task('out', 'P', 'done', OUT), END]);
    for (const [name, f, arcs] of [['fan-out in a map branch', fanInMap, 3], ['map in a map', mapInMap, 3], ['fan-out through a task in a map', fanViaTask, 4]] as const) {
      const report = await checkWiring(r, f);
      equal(report.counts, { 'fits': arcs - 1, 'no': 0, 'transform-passes': 1, 'transform-fails': 0, 'unchecked': 0 }, `${name}: ${arcs} arcs, every one a verdict, none a throw`);
      const rec = report.verdicts.find((v) => v.consumer === 'out')!;
      equal([rec.shape, rec.sample?.arity], ['record', 2], `${name}: the successor receives the outer record, at the example's arity`);
      ok(Object.keys(rec.sample!.value as object).every((k) => /^\d+(\.\d+)*$/.test(k)), `${name}: the sample's keys are branch paths — ${Object.keys(rec.sample!.value as object).join(', ')}`);
    }
  });

  test('the L4 corpus: every consumer a verdict and every verdict UNCHECKED — the check is total over documents whose registry declares no schema (Q300, road B)', async () => {
    const l4 = JSON.parse(await readText(`${EX}/registry.json`)) as CorpusRegistryDocument;
    const registry = { workers: l4.workers, nodeTypes: l4.nodeTypes, languages: CORPUS_LANGUAGES };
    const names = (await listDir(`${EX}/valid`)).filter((n) => n.endsWith('.flow.json')).sort();
    let total = 0;
    for (const n of names) {
      const report = await checkWiring(registry, JSON.parse(await readText(`${EX}/valid/${n}`)) as FlowDefinition);
      equal(report.counts.unchecked, report.verdicts.length, `${n}: every arc unchecked, by name`);
      for (const v of report.verdicts) ok(v.why.includes('declares no outputSchema') || v.why.includes('declares no inputSchema') || v.why.includes('which'), `${n}: ${v.why}`);
      total += report.verdicts.length;
    }
    // W73's declaration census over the nineteen L4 flows: 53 consumers plus the 3 transformed ones the
    // census set aside, one arc each — the check gives 56 verdicts, and 0 of any other kind.
    equal(total, 56, 'the L4 corpus`s 56 arcs');
  });

  test('a map`s record is BUILT with the branch-path marker: a successor naming "0" as a number is `no`, naming it as an object fits, naming `confidence` is never met (rule 8 probe s4 survived until this existed)', async () => {
    const items = { type: 'object', required: ['items'], properties: { items: { type: 'array', items: { type: 'object' } } }, examples: [{ items: [{}, {}] }] };
    const mk = (successor: string) => flow([task('s', 'S', 'each'), { id: 'each', kind: 'map', over: 'items', branch: 't' }, task('t', 'T', 'gather'),
      { id: 'gather', kind: 'join', of: 'each', edges: [{ to: 'out' }] }, task('out', successor, 'done'), { id: 'done', kind: 'end', outcome: 'completed' }]);
    const r = reg({ S: { outputSchema: items }, T: { inputSchema: { type: 'object' }, outputSchema: { type: 'object', required: ['score'], properties: { score: { type: 'integer' } }, additionalProperties: false } },
      N: { inputSchema: { type: 'object', properties: { '0': { type: 'number' } } } }, O: { inputSchema: { type: 'object', properties: { '0': { type: 'object', required: ['score'] } } } },
      C: { inputSchema: { type: 'object', properties: { confidence: { type: 'number' } } } } });
    const of = async (s: string) => (await checkWiring(r, mk(s))).verdicts.find((v) => v.consumer === 'out')!;
    equal([(await of('N')).shape, (await of('N')).kind], ['record', 'no'], 'a path key the map may mint, described as a number: the branch is an object');
    equal((await of('O')).kind, 'fits', 'described as an object requiring score, which the branch guarantees');
    equal((await of('C')).kind, 'fits', 'a key the record can never mint is never met');
  });

  test('a map`s sample arity comes from the producer`s example, and a transformed successor`s verdict NAMES it (Q263)', async () => {
    const items = (n: number) => ({ type: 'object', required: ['items'], properties: { items: { type: 'array', items: { type: 'object', required: ['confidence'], properties: { confidence: { type: 'number' } } } } }, examples: [{ items: Array.from({ length: n }, (_, i) => ({ confidence: i + 1 })) }] });
    for (const [n, want] of [[2, 'transform-passes'], [1, 'transform-passes'], [0, 'transform-fails']] as const) {
      const r = reg({ S: { outputSchema: items(n) }, T: { inputSchema: { type: 'object' }, outputSchema: { type: 'object', required: ['confidence'], properties: { confidence: { type: 'number' } }, examples: [{ confidence: 0.5 }] } }, N: { inputSchema: { type: 'number' } } });
      const f = flow([task('s', 'S', 'each'), { id: 'each', kind: 'map', over: 'items', branch: 't' }, task('t', 'T', 'gather'),
        { id: 'gather', kind: 'join', of: 'each', edges: [{ to: 'first' }] }, task('first', 'N', 'done', { transform: { lang: 'path', expr: '0.confidence' } }), { id: 'done', kind: 'end', outcome: 'completed' }]);
      const v = (await checkWiring(r, f)).verdicts.find((vv) => vv.consumer === 'first')!;
      equal([v.kind, v.sample?.arity], [want, n], `the record at arity ${n}: the path 0.confidence is a number at one and two and absent at zero`);
      ok(v.why.includes(`arity ${n}`) || v.kind === 'transform-fails', `the verdict names the arity: ${v.why}`);
      const item = (await checkWiring(r, f)).verdicts.find((vv) => vv.consumer === 't')!;
      equal([item.shape, item.kind], ['item', 'fits'], 'and the map`s own item arc fits');
    }
  });

  test('a map`s branch task composing "." and transforming it is sampled ONE ITEM at a time, never on the array (the adequacy reader`s R7)', async () => {
    // A correct wiring read `transform-fails` before this existed: `composed()` copied the item arrival's
    // whole array under the key, beside a one-item schema, and the check evaluated once over the array.
    const items = (arr: unknown[]) => ({ type: 'object', required: ['items'], properties: { items: { type: 'array', items: { type: 'object', required: ['n'], properties: { n: { type: 'integer' } } } } }, examples: [{ items: arr }] });
    const mk = (arr: unknown[], transform?: { lang: string; expr: string }) => {
      const r = reg({ S: { outputSchema: items(arr) }, T: { inputSchema: transform ? { type: 'integer' } : { type: 'object', required: ['item'], properties: { item: { type: 'object', required: ['n'] } } } } });
      const f = flow([task('s', 'S', 'each'), { id: 'each', kind: 'map', over: 'items', branch: 't' },
        task('t', 'T', 'j', { needs: { item: '.' }, ...(transform ? { transform } : {}) }), { id: 'j', kind: 'join', of: 'each', edges: [{ to: 'done' }] }, { id: 'done', kind: 'end', outcome: 'completed' }]);
      return { r, f };
    };
    const { r, f } = mk([{ n: 1 }, { n: 2 }], { lang: 'path', expr: 'item.n' });
    const v = (await checkWiring(r, f)).verdicts.find((vv) => vv.consumer === 't')!;
    equal([v.shape, v.kind, v.sample?.arity, v.sample?.result], ['needs', 'transform-passes', 2, [1, 2]], 'two evaluations, one per item, each an integer');
    equal(v.sample?.value, [{ item: { n: 1 } }, { item: { n: 2 } }], 'the sample is one composed object per element');
    ok(v.why.includes('2 evaluations'), v.why);
    // The same composition with no transform: the schema is the ITEM's, composed, and it fits.
    const plain = mk([{ n: 1 }, { n: 2 }]);
    equal((await checkWiring(plain.r, plain.f)).verdicts.find((vv) => vv.consumer === 't')!.kind, 'fits', 'composed over the item schema, not the array');
    // Arity ZERO through the item shape (s3): a transform with no sample to run on is UNCHECKED naming the
    // arity — never `transform-passes … 0 evaluations, every result accepted`.
    const empty = mk([], { lang: 'path', expr: 'item.n' });
    const z = (await checkWiring(empty.r, empty.f)).verdicts.find((vv) => vv.consumer === 't')!;
    equal([z.kind, z.sample?.arity], ['unchecked', 0], 'nothing to run on');
    ok(z.why.includes('arity 0'), z.why);
  });

  test('the item row`s two halves: a CLOSED producer that never emits `over` is `no` (FD-R2 predicted), an OPEN one that says nothing about it is unchecked (the adequacy reader`s s9)', async () => {
    const closed = reg({ S: { outputSchema: { type: 'object', properties: { other: { type: 'array' } }, additionalProperties: false, examples: [{ other: [] }] } }, T: { inputSchema: { type: 'object' } } });
    const open = reg({ S: { outputSchema: { type: 'object', properties: { other: { type: 'array' } }, examples: [{ other: [] }] } }, T: { inputSchema: { type: 'object' } } });
    const f = flow([task('s', 'S', 'each'), { id: 'each', kind: 'map', over: 'items', branch: 't' }, task('t', 'T', 'j'), { id: 'j', kind: 'join', of: 'each', edges: [{ to: 'done' }] }, { id: 'done', kind: 'end', outcome: 'completed' }]);
    const c = (await checkWiring(closed, f)).verdicts.find((v) => v.consumer === 't')!;
    equal([c.shape, c.kind], ['item', 'no'], 'closed: the schema never emits `items`');
    ok(c.why.includes('never emits') && c.why.includes('FD-R2'), c.why);
    const u = (await checkWiring(open, f)).verdicts.find((v) => v.consumer === 't')!;
    equal([u.shape, u.kind], ['item', 'unchecked'], 'open: it may emit `items` — the leniency, so the check says nothing');
    ok(u.why.includes('says nothing about'), u.why);
  });

  test('a transformed consumer whose worker declares no inputSchema is UNCHECKED — the transform ran and nothing holds its result (the adequacy reader`s s4)', async () => {
    const r = reg({ A: { outputSchema: OUT_A }, T: {} });
    const f = flow([task('a', 'A', 't'), task('t', 'T', 'done', { transform: { lang: 'path', expr: 'x' } }), { id: 'done', kind: 'end', outcome: 'completed' }]);
    const v = (await checkWiring(r, f)).verdicts[0]!;
    equal(v.kind, 'unchecked', 'the spec`s unchecked row, under the transformed claim too (v0.18`s same-claim clause)');
    ok(v.why.includes('declares no inputSchema') && v.why.includes('nothing holds its result'), v.why);
    equal(v.sample?.result, (OUT_A as { examples: { x: unknown }[] }).examples[0]!.x, 'the transform DID run and its result is reported');
  });

  test('the ENTRY has no arc: an entry task`s needs composes the payload, which is FD-R4`s, and the check says nothing of it (the adequacy reader`s s1)', async () => {
    const r = reg({ A: { inputSchema: { type: 'object', required: ['own'], properties: { own: { type: 'object' } } }, outputSchema: OUT_A }, B: { inputSchema: { type: 'object' } } });
    const f = flow([task('a', 'A', 'b', { needs: { own: '.' } }), task('b', 'B', 'done'), { id: 'done', kind: 'end', outcome: 'completed' }]);
    const report = await checkWiring(r, f);
    equal(report.verdicts.map((v) => v.consumer), ['b'], 'one arc, a -> b; the first cut minted a synthetic <entry> producer and read the entry as `no`');
    equal(report.entry, ['a'], 'and the entry is where FD-R4 holds the payload');
  });

  test('the witness road: a producer with a schema and no example is sampled on the witness, and the verdict says so (Q301)', async () => {
    const r = reg({ A: { outputSchema: NO_EXAMPLE }, T: { inputSchema: { type: 'string', minLength: 2 } } });
    const f = flow([task('a', 'A', 't'), task('t', 'T', 'done', { transform: { lang: 'path', expr: 'label' } }), { id: 'done', kind: 'end', outcome: 'completed' }]);
    const v = (await checkWiring(r, f)).verdicts[0]!;
    equal([v.kind, v.sample?.source, v.sample?.value], ['transform-passes', 'witness', { label: 'xx' }], 'the witness sits ON minLength');
    ok(v.why.includes('the witness') && describeVerdict(v).includes('on the witness'), 'both the reason and the line carry the word');
    // The same producer with an example is sampled on the example — the witness is the FALLBACK.
    const withExample = reg({ A: { outputSchema: { ...NO_EXAMPLE, examples: [{ label: 'alpha' }] } }, T: { inputSchema: { type: 'string', minLength: 2 } } });
    equal((await checkWiring(withExample, f)).verdicts[0]!.sample?.source, 'example', 'declared, the example wins');
  });

  test('a transform that THROWS is transform-fails carrying the message; a language the registry lacks is unchecked naming it', async () => {
    const r = reg({ A: { outputSchema: OUT_A }, T: { inputSchema: { type: 'integer' } } });
    const throws = flow([task('a', 'A', 't'), task('t', 'T', 'done', { transform: { lang: 'path', expr: 'x.deeper' } }), { id: 'done', kind: 'end', outcome: 'completed' }]);
    const v = (await checkWiring(r, throws)).verdicts[0]!;
    equal(v.kind, 'transform-fails', 'walking INTO a number throws in the fake language (P0002)');
    ok(v.why.includes('threw') && String(v.sample?.result).includes('cannot read'), v.why);
    const missing = flow([task('a', 'A', 't'), task('t', 'T', 'done', { transform: { lang: 'nope', expr: 'x' } }), { id: 'done', kind: 'end', outcome: 'completed' }]);
    const u = (await checkWiring(r, missing)).verdicts[0]!;
    equal([u.kind, u.why], ['unchecked', 'language "nope" is not in the registry'], 'no engine to run it');
  });

  test('provenance — the consumer`s schema is read from the consumer TYPE`s worker: re-typing the node flips the verdict', async () => {
    const r = reg({ A: { outputSchema: OUT_A }, Loose: { inputSchema: { type: 'object' } }, Tight: { inputSchema: { type: 'object', required: ['y'] } } });
    const loose = flow([task('a', 'A', 'b'), task('b', 'Loose', 'done'), { id: 'done', kind: 'end', outcome: 'completed' }]);
    const tight = flow([task('a', 'A', 'b'), task('b', 'Tight', 'done'), { id: 'done', kind: 'end', outcome: 'completed' }]);
    equal((await checkWiring(r, loose)).verdicts[0]!.kind, 'fits', 'Loose accepts');
    equal((await checkWiring(r, tight)).verdicts[0]!.kind, 'no', 'Tight requires y');
    // And the producer's, from the producer type's worker.
    const r2 = reg({ A: { outputSchema: { type: 'object', required: ['y'], properties: { y: { type: 'string' } }, additionalProperties: false } }, Tight: { inputSchema: { type: 'object', required: ['y'] } } });
    equal((await checkWiring(r2, tight)).verdicts[0]!.kind, 'fits', 'a producer that guarantees y');
    // A type or a worker the registry lacks is unchecked BY NAME, not a throw.
    const u = (await checkWiring({ workers: {}, nodeTypes: {}, languages: {} }, loose)).verdicts[0]!;
    equal([u.kind, u.why], ['unchecked', 'type "A" of "a" is not in the registry'], 'the producer`s type');
  });

  test('boundaryTargets — the tasks a payload reaches with no worker in between, with the value each gets', () => {
    const t = flow([task('a', 'A', 'done'), { id: 'done', kind: 'end', outcome: 'completed' }]);
    equal(boundaryTargets(t, { p: 1 }), [{ node: 'a', value: { p: 1 } }], 'a task entry');
    const fan = flow([{ id: 'split', kind: 'fanout', branches: ['l', 'r'] }, task('l', 'A', 'join'), task('r', 'A', 'join'), { id: 'join', kind: 'join', of: 'split', edges: [{ to: 'done' }] }, { id: 'done', kind: 'end', outcome: 'completed' }], 'split');
    equal(boundaryTargets(fan, { p: 1 }), [{ node: 'l', value: { p: 1 } }, { node: 'r', value: { p: 1 } }], 'a fan-out entry: every branch, the same value (JP-R11)');
    const map = flow([{ id: 'each', kind: 'map', over: 'items', branch: 'b' }, task('b', 'A', 'join'), { id: 'join', kind: 'join', of: 'each', edges: [{ to: 'done' }] }, { id: 'done', kind: 'end', outcome: 'completed' }], 'each');
    equal(boundaryTargets(map, { items: [1, 2] }), [{ node: 'b', value: 1 }, { node: 'b', value: 2 }], 'a map entry: one per item');
    equal(boundaryTargets(map, { items: 'no' }), [], 'not an array: nothing to hold — FD-R2 is the run`s');
    // An entry map's own `needs` — only `"."` can be named at an entry — is composed before `over` is read (the conformity reader, 15).
    const mapNeeds = flow([{ id: 'each', kind: 'map', over: 'items', branch: 'b', needs: { items: '.' } }, task('b', 'A', 'join'), { id: 'join', kind: 'join', of: 'each', edges: [{ to: 'done' }] }, { id: 'done', kind: 'end', outcome: 'completed' }], 'each');
    equal(boundaryTargets(mapNeeds, [1, 2]), [{ node: 'b', value: 1 }, { node: 'b', value: 2 }], 'a map entry composing ".": the payload IS the array');
    // RECURSIVELY (the adequacy reader's s5): a fan-out nested in an entry fan-out — a walk that stops at the
    // first fan-out cost 0 at L1 and L6, because every fixture's entry region held tasks alone.
    const nested = flow([{ id: 'outer', kind: 'fanout', branches: ['a', 'inner'] }, task('a', 'A', 'oj'), { id: 'inner', kind: 'fanout', branches: ['c', 'd'] }, task('c', 'A', 'ij'), task('d', 'A', 'ij'),
      { id: 'ij', kind: 'join', of: 'inner', edges: [{ to: 'oj' }] }, { id: 'oj', kind: 'join', of: 'outer', edges: [{ to: 'done' }] }, { id: 'done', kind: 'end', outcome: 'completed' }], 'outer');
    equal(boundaryTargets(nested, { p: 1 }).map((t) => t.node), ['a', 'c', 'd'], 'every branch task of the nested region too');
  });

  test('ONE entry walk, two callers: the report`s `entry` is what boundaryTargets walks to, on every corpus flow and on a map-opened one (the adequacy reader`s w1)', async () => {
    const A = { inputSchema: { type: 'object' }, outputSchema: OUT_A };
    const r = reg({ A });
    const map = flow([{ id: 'each', kind: 'map', over: 'items', branch: 'b' }, task('b', 'A', 'join'), { id: 'join', kind: 'join', of: 'each', edges: [{ to: 'done' }] }, { id: 'done', kind: 'end', outcome: 'completed' }], 'each');
    equal((await checkWiring(r, map)).entry, ['b'], 'a map-opened flow names its branch task — the second walk`s map arm was bound by nothing');
    const nested = flow([{ id: 'outer', kind: 'fanout', branches: ['a', 'inner'] }, task('a', 'A', 'oj'), { id: 'inner', kind: 'fanout', branches: ['c', 'd'] }, task('c', 'A', 'ij'), task('d', 'A', 'ij'),
      { id: 'ij', kind: 'join', of: 'inner', edges: [{ to: 'oj' }] }, { id: 'oj', kind: 'join', of: 'outer', edges: [{ to: 'done' }] }, { id: 'done', kind: 'end', outcome: 'completed' }], 'outer');
    equal((await checkWiring(r, nested)).entry, boundaryTargets(nested, {}).map((t) => t.node), 'the same names in the same order');
  });
});
