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
import { distinct, GATE_TYPE_KEYS, gateTypeProblem, readKeyPath, validateDefinition, violatedRules } from '../../src/definition/validate.ts';
import { findings } from '../../src/definition/schema.ts';
import { resolveRegistry } from '../../src/definition/registry.ts';
import type { FlowDefinition, GateContext, GateType, JsonSchema } from '../../src/definition/types.ts';
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
    for (const name of ['checkWiring', 'fits', 'describeVerdict', 'boundaryTargets', 'witness', 'sampleOf', 'BoundaryRefused', 'givenVerdict']) {
      ok(typeof lib[name] === 'function', `index.ts re-exports ${name}`);
    }
    equal(lib.VERDICT_KINDS, VERDICT_KINDS, 'and the enumeration');
  });
  test('VERDICT_KINDS is exactly the verdict table', () => {
    equal([...VERDICT_KINDS].sort(), tableIds(subsection, 'verdict').sort(), 'the five verdicts, both ways');
    equal(VERDICT_KINDS.length, 5, 'five: the plan`s four and `unchecked`');
  });
  test('WIRING_SHAPES is exactly the arc table', () => {
    equal([...WIRING_SHAPES].sort(), tableIds(subsection, 'arc').sort(), 'the six shapes, both ways — the five arcs and `given` (v0.38, W166)');
    equal(WIRING_SHAPES.length, 6, 'six: the five arc shapes and `given`, which is no arc — a count beside the membership');
    ok(WIRING_SHAPES.includes('given'), 'and `given` is one of them, so the arc table`s `given` row is bound to the enumeration (W166)');
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

/**
 * **W110 — the SECOND OBSERVER of what `AGENTS.md` section 21 asserts, because that section is an
 * assertion and its first two guards had none.**
 *
 * Section 21 is P26's exit artifact as a reference section, executed by `check:docs`. Its adequacy
 * reader made **all five** of its guards tautologies AT ONCE — every variable live, every `throw`
 * textually present, no `if (false)` — and `check:docs` was **EXIT 0**, because `X4`'s three tests
 * are *contains a `throw`*, *no `process.exit()`* and *no `if (false)`*, and `RUN_FLOOR` counts
 * SNIPPETS. That is obligation (b)'s tautology clause at its **fourth consecutive exit artifact**
 * after W74's eight guards and W101's nine.
 *
 * **Guards 3-5 already had a second observer and guards 1-2 had none.** The `unchecked` residue is
 * counted by the census below (`unchecked: 14` over 31 flows since W155, 30 at W110); *a UI-emitted flow validates with NO
 * predicate registered* and *the registry really is empty* were asserted in `AGENTS.md` and nowhere
 * else, because `examples/flows/**` is reached by `validateDefinition` in no L1-L5 suite — only by
 * that census and by `result-value.test.ts`'s `needs` count, neither of which validates. **W101's
 * remedy is a second observer rather than a better guard**, and this is it: the same two claims, over
 * the document the artifact actually ships, at ladder L1.
 */
suite('W110 — the UI-emitted documents validate with an EMPTY predicate registry: section 21`s first two guards, at L1', (test) => {
  const load = async (n: string) => JSON.parse(await readText(`${ROOT}examples/flows/${n}`)) as FlowDefinition;
  /** The registry the artifact runs, as the VALIDATOR takes it — read from the document's own bytes. */
  const uiRegistry = async () => {
    const d = JSON.parse(await readText(`${ROOT}examples/ui-registry.json`)) as {
      workers?: Record<string, unknown>; nodeTypes?: Record<string, unknown>;
    };
    return { predicates: [], workers: d.workers, nodeTypes: d.nodeTypes, languages: { jsonata } } as unknown as Parameters<typeof checkWiring>[0];
  };

  test('`ui-emitted.flow.json` validates with ZERO findings against a registry whose `predicates` is EMPTY', async () => {
    const reg = await uiRegistry();
    equal((reg as unknown as { predicates: readonly string[] }).predicates, [],
      'the registry really is empty — an unused empty map proves nothing, which is W110`s careful-point 1');
    const findings = validateDefinition(await load('ui-emitted.flow.json'), reg as never);
    equal(findings.map((f) => `${f.rule}: ${f.detail}`), [],
      'a whole flow — sequence, map, join, needs, a Transform node, two declared groups and two comparisons — with no predicate registered');
  });

  test('and the PAIRED document needs exactly ONE name, so the empty case is a property of the DOCUMENT', async () => {
    const reg = await uiRegistry();
    const named = await load('ui-emitted-named.flow.json');
    // **The CONTROL for the clause above, and it is a different value rather than a second reading**:
    // against the SAME empty registry the paired document is refused BY NAME, so *validates with no
    // predicate registered* is a claim about `ui-emitted.flow.json` and not about the registry shape.
    const refused = validateDefinition(named, reg as never);
    equal(refused.map((f) => f.rule), ['FD-V4'],
      'FD-V4, and only it — the one `when` that names a predicate, against a registry that supplies none');
    ok(refused[0]!.detail.includes('weakAndPlural'), `the refusal NAMES it: ${refused[0]!.detail}`);
    // And with the one name declared it validates, which is the other arm.
    const withName = { ...(reg as unknown as Record<string, unknown>), predicates: ['weakAndPlural'] };
    equal(validateDefinition(named, withName as never).map((f) => f.rule), [],
      'with the name declared it validates — so the pair differs in the registry it needs and not only in a `when`');
  });
});

suite('W73 — the L6 corpus census, as an EQUALITY, and every arc shape reached', (test) => {
  const flowsDir = `${ROOT}examples/flows`;
  const registry = { workers: l6Registry.workers, nodeTypes: l6Registry.nodeTypes, languages: { jsonata } } as unknown as Parameters<typeof checkWiring>[0];
  const options = { workerHalf: { jsonata: compileExpression } };
  let reports: WiringReport[] = [];
  test('the census: 76 fit, 1 no, 5 transform-passes, 2 transform-fails, 14 unchecked over 31 flows', async () => {
    const names = (await listDir(flowsDir)).filter((n) => n.endsWith('.flow.json')).sort();
    ok(names.length === 31, `31 L6 flows, got ${names.length}`);
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
    // **+3 fits and +1 flow since W73 — W82's `nonconforming.flow.json`**, and its verdicts are the
    // point rather than a side effect: its two workers return values their own `outputSchema`
    // refuses, and every arc of it FITS, because a wiring check reads two SCHEMAS and never a value.
    // *The census is where that is a number instead of a sentence.*
    // **+4 fits and +1 flow since W82 — W86's `fan-out-per-item.flow.json`**, P22's exit artifact: a
    // `map` whose branch opens a second `map`. Every one of its arcs FITS, and that is the point
    // rather than a side effect — a region nested inside a map region is a shape `checkWiring`
    // traverses with no change at all, which is P22 prediction 2 (*`JP-R12`, ADR 0044 and
    // `checkWiring` need zero changes*) as a number rather than as a sentence.
    // **+3 fits, +1 no and +1 flow at W94 — `tv-ingest.flow.json`**, P24's exit artifact (a declared exception
    // of W94's, [Q342](../../doc/questions/q342.md)'s literal a sixth time). Its two `beside` branch arcs and `publish`'s
    // record FIT — **and its fourth arc was a FALSE `no` until W99** ([Q391](../../doc/questions/q391.md)): the check
    // read the gate as a flat pass-through, so the per-series worker, which requires `series`, was judged against
    // `identify`, which does not guarantee it, while `distinct` routes `first` only where `series.id` RESOLVED.
    // **+1 fit and —1 no at W99** ([ADR 0068](../../doc/decisions/0068-a-route-guarantees-what-its-type-declares-and-the-library-derives-it-from-the-key-path.md)):
    // `distinct` declares `first` and `duplicate` key-resolved, so what leaves the gate on the default route carries
    // `series` required and the arc FITS. *This census is where that is a number instead of a sentence, in both
    // directions — it carried the false `no` as a number for one plan and it carries the fix as one now.*
    // **+2 fits, +6 unchecked and +2 flows at W110** — P26's exit artifact, `ui-emitted.flow.json` and its
    // paired `ui-emitted-named.flow.json`, each **1 fit and 3 unchecked**. **The six unchecked are
    // [Q446](../../doc/questions/q446.md)'s residue as a NUMBER**, which is the one thing this census is
    // for: a transform-only node declares neither schema, so the arc INTO it and both arcs LEAVING it are
    // unchecked in every flow that has one — and the ONE fit per flow is `intake -> rate`, the only arc
    // neither end of which is that node, which is what says the residue is LOCAL to it rather than general.
    // *The census carried W99's fix as a number; it carries this item's residue as one.*
    // **+1 fit and +1 flow at W155** — P32's exit artifact, `if-then-switch.flow.json`, a declared census move. Its ONE
    // arc is `score -> publish` THROUGH the `switch` on its `certain` route, and it FITS; the `if` at the entry has no
    // producer, and its targets are entry targets (`score`, `shelve`), so no arc is counted for them.
    equal(counts, { 'fits': 76, 'no': 1, 'transform-passes': 5, 'transform-fails': 2, 'unchecked': 14 }, 'the L6 census');
    // The one `no` is the FD-R2 prediction — map-no-array's `over: "rows"` on a producer that never emits it.
    const no = reports.flatMap((r) => r.verdicts.filter((v) => v.kind === 'no'));
    equal(no.map((v) => `${v.through ?? v.producer}:${v.consumer}`), ['split:score'], 'the one no');
    ok(no[0]!.why.includes('FD-R2'), `the reason names the run-time refusal it predicts: ${no[0]!.why}`);
    // **And the arc that WAS the false `no` is asserted FITTING, by name** — a census whose gate row simply
    // vanished from the `no` list would read the same with the derivation deleted and the worker's schema weakened.
    const tv = reports[names.indexOf('tv-ingest.flow.json')]!;
    const perSeries = tv.verdicts.filter((v) => v.consumer === 'setupSeries');
    equal(perSeries.map((v) => `${v.producer}:${v.kind}`), ['identify:fits'], 'the arc through the gate FITS, and there is one of it');
  });
  test('every arc shape the relation ranges over occurs in the census, and nothing else does', () => {
    const seen = new Set<WiringShape>();
    for (const r of reports) for (const v of r.verdicts) seen.add(v.shape);
    // **Every shape but `given`** (W166): `given` is the value a caller hands `tryTransform`, which `checkWiring`
    // never produces — so the census reaches the five ARC shapes and that one is asserted absent by name.
    equal([...seen].sort(), WIRING_SHAPES.filter((s) => s !== 'given').sort(), 'the five arc shapes, both ways');
    ok(!seen.has('given'), 'and never `given`, which is not an arc');
    // And no arc's sample carries the caller's source: every transformed arc of the census (5 passes, 2 fails,
    // asserted by the census test above) names a source a SCHEMA supplies (P37 fact 4, prediction 6).
    const transformed = reports.flatMap((r) => r.verdicts.filter((v) => v.kind === 'transform-passes' || v.kind === 'transform-fails'));
    equal(transformed.length, 7, 'the census`s seven transformed arcs — 5 transform-passes and 2 transform-fails');
    for (const v of transformed) ok(v.sample?.source === 'example' || v.sample?.source === 'witness', `${v.consumer}: an arc's sample is an example or a witness, never given — got ${v.sample?.source}`);
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
    const leaves = mk('R', [{ id: 'r', kind: 'task', type: 'A', edges: [{ when: { predicate: 'go' }, to: 'gone' }, { to: 'join' }] }, { id: 'gone', kind: 'end', outcome: 'left' }]);
    equal((await checkWiring(r, leaves)).verdicts.find((v) => v.consumer === 'out')!.kind, 'no', 'and of one that can');
  });

  test('a region INSIDE a map region — a fan-out in a map branch, a map in a map, a fan-out through a task in a map — gets verdicts and no throw (the conformity reader`s two documents)', async () => {
    // Shapes the validator accepts and the driver REFUSED at construction until W84, which lifted that
    // (ADR 0062, Q160) — so these run now, and the reason this test exists is unchanged: the check is static
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
    // census set aside, one arc each — the check gives 56 verdicts, and 0 of any other kind. **59 since W92
    // added `gated-map.flow.json`**: `identify` (the map's item), `setup` (THROUGH the gate — the arc out of it, so
    // the arc into the gate) and `publish` (the join's record); the entry has none. Before W92 taught the check
    // the kind, `setup`'s arc was not in the report at all — 58, and nothing here would have said so.
    // 59 until W108 added `declared-predicate.flow.json` (v0.27, a `when` that is DATA): five nodes,
    // four of them tasks, and nine arcs — three edges out of `ingest` and four out of `score` to two
    // distinct targets, plus `review` and `publish`. A corpus census is a claim about the corpus and
    // moves with it; what it BINDS is that every arc got a verdict.
    // **74 since W180 added `ask-after-a-task.flow.json` and `ask-in-a-fanout.flow.json`** (W179's S-2): approve -> publish
    // and the `needs` arc into revise (an ask PRODUCES; the arc INTO it gets no verdict), ingest -> score through the
    // fan-out and the join's record into publish — four, each unchecked.
    equal(total, 74, 'the L4 corpus`s 74 arcs — 70 until W180 added the two ask flows, four arcs; 68 until W109 added transform-only-node.flow.json, whose two arcs are both unchecked — the one INTO it, because the CONSUMING side (the transform-only node) declares no inputSchema, and the one LEAVING it, because the PRODUCING side (the same node) declares no outputSchema (Q446). This comment gave the producer`s reason for the arc into it; W109`s conformity reader, 15');
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
    // An entry map's own `needs` — at an entry no NODE can be named, so only `"."` and (v0.44, W190) `"$payload"`, both the payload — is composed before `over` is read (the conformity reader, 15).
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

/**
 * **W99 — what a ROUTE guarantees.** The producer here DESCRIBES the key path and does not REQUIRE it,
 * which is `identify`'s shape in P24's exit artifact and the whole reason the guarantee is load-bearing: a
 * producer that requires it makes the arc fit either way, so a fixture built that way asserts nothing
 * (W92's own pass-through fixture is exactly that, which is why its verdicts did not move at this item).
 */
suite('W99 — what a ROUTE guarantees: the type declares it, the library derives it from the key path', (test) => {
  const producer = {
    type: 'object', required: ['name'],
    properties: {
      name: { type: 'string' },
      // **`series` DESCRIBES `id` and does NOT require it** — W99's adequacy reader, F1. With `required:
      // ['id']` here, `fits` found the leaf already guaranteed by the producer, so the only step the walk had
      // to add was the ROOT one and `i >= steps.length` could be `i >= 1` for ZERO. The corpus has the same
      // shape (`identify` declares `series: { required: ['id','title'] }`), which is why no rung saw it.
      series: { type: 'object', properties: { id: { type: 'string' } } },
    },
    examples: [{ name: 'n', series: { id: 's1' } }],
  } as unknown as JsonSchema;
  const wantsSeries = { type: 'object', required: ['series'] } as unknown as JsonSchema;
  const reg = (gateTypes?: Record<string, GateType>) => ({
    workers: { p: { url: 'test://p', outputSchema: producer }, c: { url: 'test://c', inputSchema: wantsSeries } },
    nodeTypes: { P: { worker: 'p' }, C: { worker: 'c' } },
    ...(gateTypes === undefined ? {} : { gateTypes }),
  } as unknown as Parameters<typeof checkWiring>[0]);
  /** Three consumers, one per route, each REQUIRING `series` — so each arc's verdict is that route's guarantee. */
  const flow = (type: string, edges: readonly Record<string, unknown>[], settings?: Record<string, unknown>) => ({
    flowId: 'guarantee', version: 1, entry: 'produce', nodes: [
      { id: 'produce', kind: 'task', type: 'P', edges: [{ to: 'gate' }] },
      { id: 'gate', kind: 'gate', type, ...(settings === undefined ? {} : { settings }), edges },
      { id: 'onA', kind: 'task', type: 'C', edges: [{ to: 'done' }] },
      { id: 'onB', kind: 'task', type: 'C', edges: [{ to: 'done' }] },
      { id: 'onC', kind: 'task', type: 'C', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition);
  const kinds = async (r: Parameters<typeof checkWiring>[0], f: FlowDefinition) => {
    const report = await checkWiring(r, f);
    return ['onA', 'onB', 'onC'].map((c) => `${c}:${report.verdicts.find((v) => v.consumer === c)?.kind ?? 'none'}`);
  };
  const DISTINCT_EDGES = [{ to: 'onA' }, { route: 'duplicate', to: 'onB' }, { route: 'nokey', to: 'onC' }];

  test('the member is a subset of routes without repeats, and a malformed one is FD-V39`s second clause', () => {
    ok(GATE_TYPE_KEYS.includes('keyResolvedRoutes'), 'the interface declares it, so a type carrying it is not refused as an extra key');
    equal([...(distinct.keyResolvedRoutes ?? [])], ['first', 'duplicate'], 'distinct declares exactly the routes its own fn reaches with a key');
    ok(!(distinct.keyResolvedRoutes ?? []).includes('nokey'), 'and NOT nokey, which is the route for the value that has none');
    equal(gateTypeProblem({ ...distinct, keyResolvedRoutes: ['first'] }), null, 'a strict subset is fine');
    equal(gateTypeProblem({ ...distinct, keyResolvedRoutes: [] }), null, 'so is empty — a type may declare that no route resolves one');
    ok((gateTypeProblem({ ...distinct, keyResolvedRoutes: 'first' }) ?? '').includes('must be an array'), 'a string is refused');
    ok((gateTypeProblem({ ...distinct, keyResolvedRoutes: ['nope'] }) ?? '').includes('not one of its routes'), 'a name that is not a route is refused, because a guarantee on it applies to nothing');
    ok((gateTypeProblem({ ...distinct, keyResolvedRoutes: ['first', 'first'] }) ?? '').includes('repeats'), 'a repeat is refused');
    // The one predicate, so the registry and the validator cannot disagree — and it is what makes this
    // `FD-V39`'s second clause rather than a rule id of its own (ADR 0068 rule 4).
    ok((gateTypeProblem({ routes: ['a'], defaultRoute: 'a', keyResolvedRoutes: ['a'] }) ?? '').includes('fn must be a function'), 'and the rest of the interface is still asked');
    // **The shape MESSAGE names every key of `GATE_TYPE_KEYS`, both ways** — correction 2's repair, bound.
    // The two messages said `{ routes, defaultRoute, settingsSchema?, fn }` as a LITERAL, so a member added to
    // the list left them describing an interface that no longer exists; they are derived from the list now, and
    // without this clause reverting them to a literal is caught by nothing (the spec's table compares the LIST).
    const shapeMsg = gateTypeProblem('not an object') ?? '';
    for (const k of GATE_TYPE_KEYS) ok(shapeMsg.includes(k), `the shape message names every key of GATE_TYPE_KEYS: ${k} is missing from ${shapeMsg}`);
    const named = shapeMsg.slice(shapeMsg.indexOf('{'), shapeMsg.indexOf('}') + 1).replace(/[{}?\s]/g, '').split(',').filter((s) => s !== '');
    equal(named.slice().sort(), [...GATE_TYPE_KEYS].sort(), 'and names NOTHING else — the message IS the list');
    // And the OPTIONAL ones print with a `?`, which is the half a set comparison cannot see (F3's M32): a message
    // calling `keyResolvedRoutes` REQUIRED is a false statement to the consumer writing a type.
    for (const k of ['settingsSchema', 'keyResolvedRoutes']) ok(shapeMsg.includes(`${k}?`), `${k} is printed as OPTIONAL: ${shapeMsg}`);
    for (const k of ['routes', 'defaultRoute', 'fn']) ok(!shapeMsg.includes(`${k}?`), `${k} is printed as REQUIRED: ${shapeMsg}`);
  });

  test('a key-resolved route carries the key path REQUIRED, and a route the type does not name carries what arrived', async () => {
    equal(await kinds(reg(), flow('distinct', DISTINCT_EDGES, { key: 'series.id' })),
      ['onA:fits', 'onB:fits', 'onC:no'],
      'first (the DEFAULT) and duplicate fit; nokey does NOT, because that route is where the key was absent');
    // The `no` names what it always named — the consumer's requirement the producer does not guarantee.
    const report = await checkWiring(reg(), flow('distinct', DISTINCT_EDGES, { key: 'series.id' }));
    ok((report.verdicts.find((v) => v.consumer === 'onC')?.why ?? '').includes('requires "series"'), 'and the nokey reason is unchanged');
  });

  test('the three SILENCES: a type that declares nothing, a gate with no key, and a route not named — each passes through as before', async () => {
    // (1) a type IDENTICAL to distinct but declaring no guarantee: every arc is what it was before v0.25.
    const blind: GateType = { routes: distinct.routes, defaultRoute: distinct.defaultRoute, settingsSchema: distinct.settingsSchema, fn: distinct.fn };
    equal(await kinds(reg({ blind }), flow('blind', DISTINCT_EDGES, { key: 'series.id' })), ['onA:no', 'onB:no', 'onC:no'],
      'a type declaring no keyResolvedRoutes refines nothing — which is the CONTROL for the case above: the same flow, the same producer, three nos');
    // (2) no `key` on the gate: there is no path to require, so a declared route guarantees nothing.
    const keyless: GateType = { routes: ['a', 'b'], defaultRoute: 'a', keyResolvedRoutes: ['a'], fn: () => 'a' };
    equal(await kinds(reg({ keyless }), flow('keyless', [{ to: 'onA' }, { route: 'b', to: 'onB' }])), ['onA:no', 'onB:no', 'onC:none'],
      'a gate naming no key refines nothing, on the route it declares resolved and on the other');
  });

  test('the ROUTE is resolved through the type`s defaultRoute, not treated as a route of its own', async () => {
    // **Correction 3's fixture.** `distinct`'s defaultRoute is `first`, which IS key-resolved, so every
    // fixture over `distinct` alone is green whether the check maps the default edge through the type or
    // simply treats *the default* as resolved. This type's default is the route that is NOT.
    const flipped: GateType = {
      routes: ['plain', 'keyed'], defaultRoute: 'plain', keyResolvedRoutes: ['keyed'],
      settingsSchema: { type: 'object', required: ['key'], properties: { key: { type: 'string' } }, additionalProperties: false } as unknown as JsonSchema,
      fn: (ctx: GateContext) => (typeof ctx.key === 'string' ? 'keyed' : 'plain'),
    };
    equal(await kinds(reg({ flipped }), flow('flipped', [{ to: 'onA' }, { route: 'keyed', to: 'onB' }], { key: 'series.id' })),
      ['onA:no', 'onB:fits', 'onC:none'],
      'the DEFAULT edge is judged as `plain`, which this type does not call key-resolved, and the explicit `keyed` edge fits');
    // **And the other direction, which is the one that binds the LOOKUP** — W99's adequacy reader, F2: with
    // `flipped` alone, the default edge's expected verdict is `no` EITHER WAY, so the lookup could be the literal
    // `'first'` or `routes[0]` for zero — every type this tree can reach has `defaultRoute === routes[0]`, and
    // the only one whose default edge is expected to FIT is `distinct`, whose default is literally named `first`.
    // Three well-formed wrong selections coincided with the right one on the whole fixture set. This type's
    // default is NEITHER first in `routes` NOR named `first`, and it IS key-resolved, so the default edge FITS
    // only if the check asked the type.
    const lastResolved: GateType = {
      routes: ['plain', 'keyed'], defaultRoute: 'keyed', keyResolvedRoutes: ['keyed'],
      settingsSchema: { type: 'object', required: ['key'], properties: { key: { type: 'string' } }, additionalProperties: false } as unknown as JsonSchema,
      fn: (ctx: GateContext) => (typeof ctx.key === 'string' ? 'keyed' : 'plain'),
    };
    equal(await kinds(reg({ lastResolved }), flow('lastResolved', [{ to: 'onA' }, { route: 'plain', to: 'onB' }], { key: 'series.id' })),
      ['onA:fits', 'onB:no', 'onC:none'],
      'a default route that is NOT routes[0] and IS key-resolved: the default edge fits and the explicit unresolved one does not');
  });

  test('the refinement is PRESENCE along every step of the path, and it leaves an undescribed step alone', async () => {
    // A consumer requiring the LEAF`s parent and one requiring nothing about it: the walk adds `required`
    // at each step, so `series.id` requires `series` at the root AND `id` under it.
    const wantsId = { type: 'object', required: ['series'], properties: { series: { type: 'object', required: ['id'] } } } as unknown as JsonSchema;
    const r = {
      workers: { p: { url: 'test://p', outputSchema: producer }, c: { url: 'test://c', inputSchema: wantsId } },
      nodeTypes: { P: { worker: 'p' }, C: { worker: 'c' } },
    } as unknown as Parameters<typeof checkWiring>[0];
    equal(await kinds(r, flow('distinct', DISTINCT_EDGES, { key: 'series.id' })), ['onA:fits', 'onB:fits', 'onC:no'],
      'a consumer requiring series.id fits on a key-resolved route — the walk requires every step, not only the first');
    // A key path the producer does not DESCRIBE: `required` is still added (the value carries it or the
    // run could not be here), and nothing invents a shape for it.
    const deep = await checkWiring(reg(), flow('distinct', DISTINCT_EDGES, { key: 'absent.thing' }));
    equal(deep.verdicts.find((v) => v.consumer === 'onA')?.kind, 'no',
      'a key path the producer never describes buys the consumer nothing it asked for — requiring `absent` is not requiring `series`');
  });
  test('a key path segment that is a PROTOTYPE key is not special — `fits` and the refinement read OWN keys only', async () => {
    // **W99's conformity reader, F1, and it is bigger than this item.** `FD-V16`'s charset admits `toString`,
    // `constructor`, `valueOf` and `__proto__` as key-path segments, and a gate whose `key` is one of them is a
    // document `validateDefinition` accepts with ZERO findings. Two bare reads answered from `Object.prototype`:
    // this item's own `requireAlong` wrote `Object.prototype.toString` — a native FUNCTION — into a refined
    // schema's `properties`, and **`fits` itself read it back as a sub-schema through a bare `k in pp`**, which
    // is P19's code and reachable on an ORDINARY EDGE with no gate at all. The measured verdict flip: a consumer
    // describing `toString` and not requiring it read `no` with an invented type union
    // (`producer may be object|array|number|integer|boolean|null`) where the same consumer asking about `zzz`
    // read `fits`. **Third and fourth occurrence of this class** — W65's reader found bare `in` at three
    // keyword sites, W74's in `pathsOf`.
    //
    // The claim the fix makes is *a prototype key is not special*, so this is an EQUALITY between two flows
    // differing only in the key path, over every consumer shape that discriminates. **The first cut of this
    // case asked about a key the gate's path does NOT name and so passed with both defects in place** — it was
    // measured vacuous against the reverted guard, which is why the consumer asks about THE KEY here.
    const shapes = (k: string): [string, Record<string, unknown>][] => [
      ['requires it, describes {}', { type: 'object', required: [k], properties: { [k]: {} } }],
      ['requires it, describes a string', { type: 'object', required: [k], properties: { [k]: { type: 'string' } } }],
      ['requires it, describes nothing', { type: 'object', required: [k] }],
      ['describes a string, does not require', { type: 'object', properties: { [k]: { type: 'string' } } }],
    ];
    const verdict = async (key: string, consumer: Record<string, unknown>) => {
      const r = {
        workers: { p: { url: 'test://p', outputSchema: producer }, c: { url: 'test://c', inputSchema: consumer as unknown as JsonSchema } },
        nodeTypes: { P: { worker: 'p' }, C: { worker: 'c' } },
      } as unknown as Parameters<typeof checkWiring>[0];
      const v = (await checkWiring(r, flow('distinct', DISTINCT_EDGES, { key }))).verdicts.find((x) => x.consumer === 'onA')!;
      return `${v.kind}: ${v.why}`;
    };
    for (const [label] of shapes('zzz')) {
      const proto = await verdict('toString', shapes('toString').find(([l]) => l === label)![1]);
      const plain = await verdict('zzz', shapes('zzz').find(([l]) => l === label)![1]);
      equal(proto.replace(/toString/g, 'KEY'), plain.replace(/zzz/g, 'KEY'),
        `a prototype-named key path answers as an ordinary undescribed one does ' + D + ' ${label}`);
    }
    // And `fits` alone, with NO gate in the picture, because that half is P19's and predates this item.
    const open = { type: 'object', required: ['name'], properties: { name: { type: 'string' } } } as unknown as JsonSchema;
    for (const k of ['toString', 'zzz']) {
      const r = fits(open, { type: 'object', properties: { [k]: { type: 'string' } } } as unknown as JsonSchema);
      equal([k, r.verdict], [k, 'fits'],
        'a consumer describing a key an OPEN producer does not name, and not requiring it, fits — the leniency, for a prototype name too');
    }
    // **The THIRD bare read: the LEAK comparison**, which asks which producer keys the consumer forbids. A
    // producer that really does emit `toString` against a CLOSED consumer that does not name it is a leak;
    // `'toString' in cp` answers TRUE from the prototype, so the bare read called it declared and returned
    // `fits`. Both sides closed, which is the only shape that reaches this clause.
    for (const k of ['toString', 'zzz']) {
      const closedP = { type: 'object', required: [], properties: { [k]: { type: 'string' } }, additionalProperties: false } as unknown as JsonSchema;
      const closedC = { type: 'object', required: [], properties: {}, additionalProperties: false } as unknown as JsonSchema;
      const r = fits(closedP, closedC);
      equal([k, r.verdict], [k, 'no'], 'a producer key the closed consumer does not name is a LEAK, whatever the key is called');
    }
  });
});

/**
 * **W100 — what a KEY PATH must satisfy.** A route can only promise that a path RESOLVED if the path is
 * one the producer can emit, so `spec/flow-definition.md`'s gate paragraph gains the refusing half of
 * [ADR 0068](../../doc/decisions/0068-a-route-guarantees-what-its-type-declares-and-the-library-derives-it-from-the-key-path.md):
 * a key path the arriving schema FORBIDS makes the arc leaving on that route `no`, and what the schema says
 * NOTHING about is a silence.
 *
 * **Every expected value is derived from `readKeyPath`'s own semantics** — the DRIVER's resolution
 * (`src/definition/validate.ts`, W93), where each segment is an OWN key of a PLAIN object and a missing key,
 * a `null`, an ARRAY mid-path or a primitive is `undefined` — and the last case here holds the static answer
 * against that function over hand-written values, so the two roads to *the path cannot resolve* are two
 * expressions rather than one (obligation (c)`s LIMIT).
 *
 * The consumer in most cases accepts EVERY object, so `fits` can only ever say `fits` and a `no` is the key
 * path's. Rule 8 obligation (a), v0.23: the walk SELECTS a failing STEP, and each well-formed wrong
 * selection has a fixture where it differs — a walk bounded at one step misses `series.slug`, `name.id` and
 * `tags.0`; one that knows only the CLOSED shape misses `name.id` and `tags.0`; one that knows only the TYPE
 * shape misses `sereis.id` and `series.slug`; one that reads the LEAF refuses `tags`, `name` and `series`,
 * which are correct paths.
 */
suite('W100 — what a KEY PATH must satisfy: a path the producer FORBIDS is `no`, and what it says nothing about is a silence', (test) => {
  const producer = {
    type: 'object', required: ['name'], additionalProperties: false,
    properties: {
      name: { type: 'string' },
      series: { type: 'object', additionalProperties: false, properties: { id: { type: 'string' } } },
      tags: { type: 'array', items: { type: 'string' } },
    },
    examples: [{ name: 'n' }],
  } as unknown as JsonSchema;
  /** The same producer with the root OPEN and `series` gone: the silence`s fixture. */
  const openProducer = { type: 'object', required: ['name'], properties: { name: { type: 'string' } }, examples: [{ name: 'n' }] } as unknown as JsonSchema;
  /** A consumer that accepts every object — so the only thing that can make an arc `no` is the key path. */
  const anything = { type: 'object' } as unknown as JsonSchema;
  const reg = (out: JsonSchema | undefined, gateTypes?: Record<string, GateType>, consumer: JsonSchema = anything) => ({
    workers: { p: { url: 'test://p', ...(out === undefined ? {} : { outputSchema: out }) }, c: { url: 'test://c', inputSchema: consumer } },
    nodeTypes: { P: { worker: 'p' }, C: { worker: 'c' } },
    ...(gateTypes === undefined ? {} : { gateTypes }),
  } as unknown as Parameters<typeof checkWiring>[0]);
  /** One consumer per route, so each arc`s verdict is that route`s. */
  const flow = (type: string, edges: readonly Record<string, unknown>[], settings?: Record<string, unknown>) => ({
    flowId: 'keypath', version: 1, entry: 'produce', nodes: [
      { id: 'produce', kind: 'task', type: 'P', edges: [{ to: 'gate' }] },
      { id: 'gate', kind: 'gate', type, ...(settings === undefined ? {} : { settings }), edges },
      { id: 'onA', kind: 'task', type: 'C', edges: [{ to: 'done' }] },
      { id: 'onB', kind: 'task', type: 'C', edges: [{ to: 'done' }] },
      { id: 'onC', kind: 'task', type: 'C', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition);
  const DISTINCT_EDGES = [{ to: 'onA' }, { route: 'duplicate', to: 'onB' }, { route: 'nokey', to: 'onC' }];
  /** The default edge`s verdict and its reason, which is the route `distinct` calls key-resolved. */
  const onA = async (r: Parameters<typeof checkWiring>[0], key?: string, edges = DISTINCT_EDGES, type = `distinct`) => {
    const f = flow(type, edges, key === undefined ? undefined : { key });
    const v = (await checkWiring(r, f)).verdicts.find((x) => x.consumer === 'onA');
    return { kind: v?.kind ?? 'none', why: v?.why ?? '' };
  };

  /**
   * The table, derived from `readKeyPath`: the CONTAINER at each step must be able to be a plain object and
   * must be able to hold the step. `at` is the container the walk stopped on.
   */
  const TABLE: readonly { key: string; kind: string; at?: string; says?: string; why: string }[] = [
    { key: 'series.id', kind: 'fits', why: 'the producer describes every step, so the route`s guarantee applies' },
    { key: 'sereis.id', kind: 'no', at: '$', says: 'additionalProperties: false', why: 'a transposition: the root is CLOSED and does not name it' },
    { key: 'series.slug', kind: 'no', at: '$.series', says: 'additionalProperties: false', why: 'the SECOND step is the closed one — a walk bounded at one step passes this' },
    { key: 'name.id', kind: 'no', at: '$.name', says: 'calls it string', why: 'a key path reads an own key of a plain object and the producer calls this one a string' },
    { key: 'tags.0', kind: 'no', at: '$.tags', says: 'calls it array', why: '`readKeyPath` reads no index: an ARRAY mid-path is undefined' },
    { key: 'tags', kind: 'fits', why: 'the LEAF`s type is never read — an array is a fine place for a path to END, and `nokey` at run time' },
    { key: 'name', kind: 'fits', why: 'the leaf is a string, which is what `distinct` wants and is still not this check`s question' },
    { key: 'series', kind: 'fits', why: 'the leaf is an object, which `distinct` routes to `nokey` — the type`s judgement, not the library`s' },
    // **Q411's FIFTH site, GUARDED rather than recorded** (W99 raised that row; its first four sites were closed
    // and nothing stopped a fifth). `FD-V16`'s charset admits `toString`, and this producer's root is CLOSED, so
    // the closed arm must fire: under a bare `here in props` it does NOT, because `Object.prototype` answers
    // `toString` for every object, and the path would read as DESCRIBED and the arc as `fits`. Measured: the
    // author pass's probe `a8` SURVIVED until these two rows existed, because every other row's producer is open
    // at the step that matters and a prototype name answers the same either way.
    { key: 'toString', kind: 'no', at: '$', says: 'additionalProperties: false', why: 'a PROTOTYPE name at a closed root: own keys only, or `Object.prototype` answers for the schema' },
    { key: 'series.toString', kind: 'no', at: '$.series', says: 'additionalProperties: false', why: 'and one step in, where the container is the closed sub-schema' },
    // **A THREE-segment path, and `at` is the whole PREFIX rather than the last segment** — the adequacy
    // reader's F4. Every other key here and every key in the corpus is at most two segments, where the two
    // expressions AGREE: at one step in, `steps.slice(0, 1).join('.')` and `steps[0]` are the same string. So
    // `at` was a selection bound at the position where its most plausible wrong value coincides with the right
    // one (v0.23), and the mutant reported `FORBIDS at $.id` — a path the schema does not contain, sending an
    // author to look in the wrong place. `readKeyPath` and `requireAlong` both walk arbitrary depth, so three
    // segments is an ordinary shape and not a constructed one.
    { key: 'series.id.x', kind: 'no', at: '$.series.id', says: 'calls it string', why: 'the THIRD step: `at` is the whole prefix, which only a path this deep can tell from the last segment' },
  ];

  test('each way the arriving schema FORBIDS a step, and each way it does not — the reason names the gate, the key, the STEP and the ROUTE', async () => {
    for (const row of TABLE) {
      const got = await onA(reg(producer), row.key);
      equal([row.key, got.kind], [row.key, row.kind], `${row.key}: ${row.why} — got ${got.kind}: ${got.why}`);
      if (row.kind !== 'no') continue;
      ok(got.why.includes(`gate "gate" is keyed on "${row.key}"`), `the reason names the gate and the key: ${got.why}`);
      ok(got.why.includes(`FORBIDS at ${row.at}:`), `and the STEP it stopped on, ${row.at}: ${got.why}`);
      ok(got.why.includes(row.says!), `and the word the schema itself uses (${row.says}): ${got.why}`);
      // **And where the schema's word is *forbids every key it does not name*, the PROPERTIES it does name** —
      // the adequacy reader's F11: `named.join(', ')` truncated to `named[0]` cost ZERO, because `says` reads the
      // literal `additionalProperties: false` and never what follows it.
      if (row.says === 'additionalProperties: false') {
        const container = row.at === '$' ? 'name, series, tags' : 'id';
        ok(got.why.includes(`it names ${container}`), `and every property that container DOES name (${container}): ${got.why}`);
      }
      ok(got.why.includes(`route "first" can never be taken`), `and the ROUTE, which is what is unreachable: ${got.why}`);
    }
  });

  test('the static refusal agrees with `readKeyPath`, the DRIVER`s own resolution — over values the schema admits', () => {
    // **The second expression over one fact** (obligation (c)`s LIMIT): the check above says a path cannot
    // resolve; this says what the driver does with a value the producer really may emit. The values are
    // hand-written from the schema above, and each is asserted to be one the producer's schema ACCEPTS —
    // otherwise the resolution would be a fact about a value no run can produce.
    const values: readonly Record<string, unknown>[] = [
      { name: 'n' },
      { name: 'n', series: { id: 's' } },
      { name: 'n', series: {}, tags: ['a'] },
    ];
    for (const v of values) equal(findings(producer, v).length, 0, `the producer schema admits ${JSON.stringify(v)}`);
    // **A COUNT beside the list** — the author pass's `d3`: `values` was a bound with nothing on it, so cutting it
    // to one left the agreement below asserted over a third of the values and every clause green.
    equal(values.length, 3, 'three values, each admitted by the schema — a list cut down is caught here and not by the loop');
    const forbidden = TABLE.filter((r) => r.kind === 'no').map((r) => r.key);
    equal(forbidden, ['sereis.id', 'series.slug', 'name.id', 'tags.0', 'toString', 'series.toString', 'series.id.x'],
      'the seven the check refuses — two are Q411`s fifth site (a prototype name at a closed container) and one is three segments deep');
    // **And the ALLOWED rows are a membership too** — the adequacy reader's F5. `forbidden` bound only the `no`
    // half, so the four `fits` rows were held by nothing: deleting `tags` alone cost ZERO, and deleting all four
    // cost ZERO. They are not decoration — `tags` is the ONLY observer of ADR 0068 rule 3 (*the LEAF's type is
    // never read*), measured by the reader as a surgical leaf-read caught by that row and by nothing else, so a
    // set that can lose the row can lose the rule with it.
    equal(TABLE.filter((r) => r.kind === 'fits').map((r) => r.key), ['series.id', 'tags', 'name', 'series'],
      'the four the check allows: a described path, and three LEAVES of the three kinds whose type this check must not judge');
    for (const key of forbidden) {
      for (const v of values) {
        equal([key, JSON.stringify(v), readKeyPath(v, key)], [key, JSON.stringify(v), undefined],
          'a path the check FORBIDS resolves to undefined on every value the producer admits — which is the route the run does not take');
      }
    }
    // And the other direction, so this is not satisfied by `readKeyPath` returning `undefined` for everything:
    // each path the check does NOT refuse resolves on some value the schema admits.
    equal(readKeyPath(values[1]!, 'series.id'), 's', 'series.id resolves');
    equal(readKeyPath(values[2]!, 'tags'), values[2]!.tags, 'tags resolves to the array — a leaf the check does not judge');
    equal(readKeyPath(values[0]!, 'name'), 'n', 'name resolves');
  });

  test('the FOUR silences: an OPEN producer, a producer with no schema, a type declaring no guarantee, and a gate with no key', async () => {
    // (1) **an OPEN producer that says nothing at a step forbids nothing** — P25 stop-and-ask (b)`s
    //     *rather than a false alarm*, and it is `fits`'s own leniency one question over. Measured at this
    //     item`s declaration step: replacing the arc`s verdict with `unchecked` here would DELETE a sound
    //     answer, because the arc`s own reasons (`producer is open there`, a requirement at another path)
    //     are about the SHAPE and not about the key.
    equal((await onA(reg(openProducer), 'absent.thing')).kind, 'fits', 'an OPEN producer silent at a step is not refused');
    equal((await onA(reg(openProducer), 'name.id')).kind, 'no', 'and the TYPE shape still refuses on an open producer — openness is about a MISSING key, not about a string');
    // (2) a producer declaring no schema: the arc is `unchecked` and there is nothing to read a path over.
    const none = await onA(reg(undefined), 'sereis.id');
    equal(none.kind, 'unchecked', 'no outputSchema, no key-path question');
    ok(none.why.includes('declares no outputSchema'), `and the reason is the missing schema, not the key: ${none.why}`);
    // (3) **the design`s stated LIMIT**: a type declaring no `keyResolvedRoutes` gets no key-path verdict,
    //     because the check can name a route unreachable only where the TYPE says what the route means
    //     (ADR 0068 rule 1, in the refusing direction). A consumer`s own type keyed on a path nothing can
    //     carry is caught by nothing, and this asserts that it is a choice rather than an oversight.
    const blind: GateType = { routes: distinct.routes, defaultRoute: distinct.defaultRoute, settingsSchema: distinct.settingsSchema, fn: distinct.fn };
    equal((await onA(reg(producer, { blind }), 'sereis.id', DISTINCT_EDGES, 'blind')).kind, 'fits',
      'a type that declares no guarantee is asked no question about the key path — the limit, and it is the CONTROL for the case above: the same producer, the same key, the same flow');
    // (4) a gate naming no key: there is no path to forbid.
    const keyless: GateType = { routes: ['a', 'b'], defaultRoute: 'a', keyResolvedRoutes: ['a'], fn: () => 'a' };
    equal((await onA(reg(producer, { keyless }), undefined, [{ to: 'onA' }, { route: 'b', to: 'onB' }], 'keyless')).kind, 'fits',
      'a gate with no key is one of ADR 0068`s three silences here too');
  });

  test('only a KEY-RESOLVED route`s arc is refused — the route the run actually takes keeps its own verdict', async () => {
    // **The anti-false-alarm claim, and it is [Q391](../../doc/questions/q391.md)`s class.** A key path that
    // resolves nowhere makes `distinct` route every branch `nokey`, so THAT arc is the one that carries a
    // value — and a refusal there would be a `no` on the only road the run takes.
    const r = await checkWiring(reg(producer), flow('distinct', DISTINCT_EDGES, { key: 'sereis.id' }));
    equal(['onA', 'onB', 'onC'].map((c) => `${c}:${r.verdicts.find((v) => v.consumer === c)?.kind}`),
      ['onA:no', 'onB:no', 'onC:fits'],
      'first and duplicate are key-resolved and unreachable; nokey is neither, and it FITS');
    // **EACH refused arc's reason names ITS OWN route** — the adequacy reader's F3, and it is v0.23's selection
    // clause exactly. `distinct` calls BOTH `first` and `duplicate` key-resolved, and every reason assertion in
    // this file was on `onA`, the DEFAULT route: hard-coding the reason's route to the literal `"first"` cost
    // ZERO, and `onB` — which this case already had in hand — then named the wrong route while its `kind` was
    // still `no`. The well-formed wrong selection (the default) coincides with the right answer at every fixture
    // that reads a reason, so the pair is asserted here as an equality over the two.
    const routeIn = (c: string): string => (r.verdicts.find((v) => v.consumer === c)!.why.match(/route "([^"]+)" can never be taken/) ?? [])[1] ?? 'none';
    equal([routeIn('onA'), routeIn('onB')], ['first', 'duplicate'],
      'the default route`s arc names `first` and the OTHER key-resolved route`s names `duplicate` — one reason, two routes');
    // **The `nokey` control, rebuilt** — the adequacy reader's F7 measured the old one (`!c.why.includes('keyed
    // on')`) as a FOURTH CLAIM: `refused !== null` implies `kind === 'no'`, so no tree makes it fire while its
    // claim passes, and under the author's own probe `a7` both went red together. v0.22's test is *name the tree
    // on which the control fails and its claim passes*. This one has one: the CORRECT key, where every arc is
    // `fits` — so *`onC` is `fits`* is not evidence by itself, and what carries the claim is the ASYMMETRY on one
    // run, asserted above, plus the reason `onC` does get.
    const c = r.verdicts.find((v) => v.consumer === 'onC')!;
    equal(c.why, 'fits', 'the nokey arc`s reason is the ordinary one, with no key path in it at all');
    const right = await checkWiring(reg(producer), flow('distinct', DISTINCT_EDGES, { key: 'series.id' }));
    equal(['onA', 'onB', 'onC'].map((x) => right.verdicts.find((v) => v.consumer === x)!.kind), ['fits', 'fits', 'fits'],
      'the CONTROL: the same flow keyed on a path the producer describes refuses nothing, so the asymmetry above is the key path`s and not the routes`');
  });

  test('a refusal is about the ROUTE, so it survives every shape the consumer past the gate can declare', async () => {
    // **BOTH readers found this, from opposite ends** — the conformity reader's F2 (the spec states the verdict
    // unconditionally and the code did not) and the adequacy reader's F6 (Output (1) is false in two of the arc
    // shapes it ranges over). Measured on documents `validateDefinition` accepts, one consumer key at a time:
    // plain was `no`; a declared `transform` and `needs: {"v": "."}` were **`unchecked`** carrying the reason;
    // and a fourth configuration neither reader reached — `needs` naming ANOTHER NODE — read **`fits`**, with
    // the reason gone altogether. `unchecked` is documented as *a side declares no schema* and is the verdict
    // authors are taught to skip, so a transformed consumer past a misspelled gate key read as green.
    //
    // The fix is an ORDER rather than a case: `keyPathRefusal` says *no value this producer admits can carry this
    // path*, so the route is never traversed — and a transform runs on a value that only exists if it is, while
    // `needs` composes one for the same reason. So the refusal outranks both roads in the verdict loop and
    // `composed()` carries it instead of downgrading it. This is obligation (a)'s shapes clause: the rule ranges
    // over the arc shapes and the set had instantiated `edge` alone.
    const shapes: readonly [string, Record<string, unknown>][] = [
      ['plain', {}],
      ['a declared transform', { transform: { lang: 'jsonata', expr: '$' } }],
      ['needs naming the edge', { needs: { v: '.' } }],
      ['needs naming another node', { needs: { v: 'produce' } }],
    ];
    equal(shapes.length, 4, 'four shapes a consumer can declare — a list cut down is caught here and not by the loop');
    const r = reg(producer, undefined, anything);
    (r as { languages?: unknown }).languages = { jsonata };
    for (const [label, extra] of shapes) {
      const f = flow('distinct', DISTINCT_EDGES, { key: 'sereis.id' }) as unknown as { nodes: Record<string, unknown>[] };
      const onANode = f.nodes.find((n) => n.id === 'onA')!;
      Object.assign(onANode, extra);
      const v = (await checkWiring(r, f as unknown as FlowDefinition)).verdicts.find((x) => x.consumer === 'onA')!;
      equal([label, v.kind], [label, 'no'], `${label}: the refusal belongs to the ROUTE, so no consumer shape can hide it — got ${v.kind}: ${v.why}`);
      ok(v.why.includes('is keyed on "sereis.id"'), `${label}: and it is the key-path reason rather than a fit or a sample: ${v.why}`);
    }
  });

  test('`fits`s leniency does not read a key the producer REQUIRES as never emitted — the pair, and a VALUE that proves it', () => {
    // **W99`s `requireAlong` is the first thing here that manufactures a required-and-undescribed key from an
    // ordinary flow**, and the leniency`s own argument — *an author who leaves an output schema open means
    // "there are keys I do not describe"* — is refuted by a schema that REQUIRES the key. The pair differs in
    // the producer`s `required` ALONE, and the difference is asserted rather than described.
    const describes = { type: 'object', properties: { series: { type: 'object', required: ['id'] } } } as unknown as JsonSchema;
    const requiring = { type: 'object', required: ['name', 'series'], properties: { name: { type: 'string' } } } as unknown as JsonSchema;
    const silent = { type: 'object', required: ['name'], properties: { name: { type: 'string' } } } as unknown as JsonSchema;
    equal(fits(silent, describes).verdict, 'fits', 'the LENIENCY, unchanged: an open producer that does not name the key is read as never emitting it');
    const r = fits(requiring, describes);
    equal(r.verdict, 'no', 'and it does NOT apply where the producer REQUIRES the key — `required` says the key IS emitted');
    ok(r.why.includes('requires it and describes nothing'), `the reason says which of the two it is: ${r.why}`);
    // **The soundness half, from a VALUE rather than from the relation`s own opinion**: this is a value the
    // producer`s schema ACCEPTS and the consumer`s REFUSES, so the `fits` this guard removes was one the run
    // can falsify — the unsafe kind.
    const value = { name: 'n', series: 42 };
    equal(findings(requiring, value).length, 0, 'the producer`s schema accepts it');
    ok(findings(describes, value).length > 0, 'and the consumer`s refuses it — which is what a `fits` there would have claimed away');
    // The guard is about the PRODUCER`s `required`, so a consumer that requires the key is unmoved.
    const wants = { type: 'object', required: ['series'], properties: { series: { type: 'object', required: ['id'] } } } as unknown as JsonSchema;
    for (const p of [silent, requiring]) equal(fits(p, wants).verdict, 'no', 'a consumer REQUIRING a key an open producer does not describe is `no` either way');
  });

  test('the corpus: the three wrong keys of P25 fact 7 are each NAMED, where none of them was before', async () => {
    // **The item`s headline, over the REAL registry and the REAL flow.** Before W100 the three read: two `no`
    // carrying [Q391](../../doc/questions/q391.md)`s own string (`consumer requires "series", producer does not
    // guarantee it`) and one — `series.slug`, the worst, because `identify``s `series` is CLOSED — reading
    // **`fits`**. The correct key is the control and W73`s census holds it at 73 fits / 1 `no`.
    const registry = { workers: l6Registry.workers, nodeTypes: l6Registry.nodeTypes, languages: { jsonata } } as unknown as Parameters<typeof checkWiring>[0];
    const base = JSON.parse(await readText(`${ROOT}examples/flows/tv-ingest.flow.json`)) as FlowDefinition;
    const keyed = (key: string): FlowDefinition => {
      const f = JSON.parse(JSON.stringify(base)) as FlowDefinition;
      (f.nodes.find((n) => n.kind === 'gate') as unknown as { settings: Record<string, unknown> }).settings = { key };
      return f;
    };
    const arc = async (key: string) => (await checkWiring(registry, keyed(key))).verdicts.find((v) => v.consumer === 'setupSeries')!;
    const right = await arc('series.id');
    equal(right.kind, 'fits', 'the shipped key: the arc through the gate FITS, which is W99`s and the control for the three below');
    // **A COUNT beside the list** — the author pass's `d5`: the three keys were a bound with nothing on them, so
    // dropping one left the corpus half asserted over two and every clause green. Each is one of P25 fact 7's.
    const WRONG = [['sereis.id', '$'], ['series.slug', '$.series'], ['name.id', '$.name']] as const;
    equal(WRONG.length, 3, 'three wrong keys, which is what P25 fact 7 measured and what this re-takes');
    for (const [key, at] of WRONG) {
      const v = await arc(key);
      equal([key, v.kind], [key, 'no'], `${key} is named`);
      ok(v.why.includes(`gate "dedupe" is keyed on "${key}"`) && v.why.includes(`FORBIDS at ${at}:`), `${key}: ${v.why}`);
      ok(!v.why.includes(`consumer requires`), `and it no longer reads as Q391 did: ${v.why}`);
    }
  });
});

suite('W153 — the wiring check reads a DERIVED gate`s routes off its NODE: the default edge and keyResolvedRoutes', (test) => {
  // `spec/flow-definition.md` v0.30, section 2's *A gate's routes are the GATE's, resolved once* — *an edge with no
  // `route` carries the set's default … and the wiring check's guarantee is the set's `keyResolvedRoutes`* — and
  // [ADR 0092](../../doc/decisions/0092-a-gate-types-routes-are-declared-statically-or-derived-from-its-node.md)
  // rule 3. **The two `wiring.ts` sites the compiler cannot see** (W153 re-take 1): both read through `?.`, so a
  // site left reading the TYPE typechecks and reads `undefined` — no default and no guarantee. Every expected
  // `fits` below is one only the NODE's set can give, so a type-level read turns it `no`.
  //
  // The producer DESCRIBES `series.id` and requires neither (W99's adequacy reader, F1), and every consumer
  // REQUIRES `series`, so an arc fits exactly where its route is key-resolved on the gate's key path.
  const producer = {
    type: 'object', required: ['name'],
    properties: { name: { type: 'string' }, series: { type: 'object', properties: { id: { type: 'string' } } } },
    examples: [{ name: 'n', series: { id: 's1' } }],
  } as unknown as JsonSchema;
  const wantsSeries = { type: 'object', required: ['series'] } as unknown as JsonSchema;
  /** `byNode`: a DERIVED type whose default and key-resolved routes are its gate's `dflt` and `resolved`. */
  const byNode: GateType = {
    routesFor: (s) => {
      if (s.throws === true) throw new Error('byNode cannot derive');
      return { routes: ['plain', 'keyed'], defaultRoute: s.dflt as string, keyResolvedRoutes: s.resolved as string[] };
    },
    fn: (ctx) => (typeof ctx.key === 'string' ? 'keyed' : 'plain'),
  };
  const reg = {
    workers: { p: { url: 'test://p', outputSchema: producer }, c: { url: 'test://c', inputSchema: wantsSeries } },
    nodeTypes: { P: { worker: 'p' }, C: { worker: 'c' } },
    gateTypes: { byNode },
  } as unknown as Parameters<typeof checkWiring>[0];
  /** One gate, two consumers: `onA` on the edge with NO route, `onB` on the edge naming `route`. */
  const flow = (settings: Record<string, unknown>, route: string) => ({
    flowId: 'derived-wiring', version: 1, entry: 'produce', nodes: [
      { id: 'produce', kind: 'task', type: 'P', edges: [{ to: 'gate' }] },
      { id: 'gate', kind: 'gate', type: 'byNode', settings: { key: 'series.id', ...settings }, edges: [{ to: 'onA' }, { route, to: 'onB' }] },
      { id: 'onA', kind: 'task', type: 'C', edges: [{ to: 'done' }] },
      { id: 'onB', kind: 'task', type: 'C', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition);
  const kinds = async (f: FlowDefinition) => {
    const report = await checkWiring(reg, f);
    return ['onA', 'onB'].map((c) => `${c}:${report.verdicts.find((v) => v.consumer === c)?.kind ?? 'none'}`);
  };

  test('the DEFAULT edge carries the NODE`s defaultRoute — a derived type has none of its own', async () => {
    // The gate's default is `keyed`, which its set calls key-resolved: the routeless edge FITS. Read off the type,
    // the default is undefined, the arc carries no route, and it is `no`.
    equal(await kinds(flow({ dflt: 'keyed', resolved: ['keyed'] }, 'plain')), ['onA:fits', 'onB:no'],
      'the routeless edge is the node`s default, keyed, and fits; the edge naming plain does not');
    // The same type, the default now `plain`: the routeless edge is `no` and the edge naming keyed fits — the
    // verdict follows the NODE's settings, so nothing fixed on the type can produce both rows.
    equal(await kinds(flow({ dflt: 'plain', resolved: ['keyed'] }, 'keyed')), ['onA:no', 'onB:fits'],
      'with the node`s default plain, the routeless edge is no and the edge naming keyed fits');
  });

  test('keyResolvedRoutes is read off the NODE`s set: two settings, two guarantees, from one type', async () => {
    // One type, the explicit edge on `plain`, and the gate's set naming WHICH route is key-resolved.
    equal(await kinds(flow({ dflt: 'keyed', resolved: ['plain'] }, 'plain')), ['onA:no', 'onB:fits'],
      'resolved [plain]: the edge naming plain fits and the default keyed does not');
    equal(await kinds(flow({ dflt: 'keyed', resolved: ['plain', 'keyed'] }, 'plain')), ['onA:fits', 'onB:fits'],
      'resolved [plain, keyed]: both fit');
    equal(await kinds(flow({ dflt: 'keyed', resolved: [] }, 'plain')), ['onA:no', 'onB:no'],
      'resolved []: neither — the CONTROL, a set that guarantees nothing, through the same type and flow');
  });

  test('a set that does not resolve is treated as an unknown type: no default, no guarantee, the arcs reported as they are', async () => {
    // routesFor throws: `routesOf` returns a problem, and the check neither throws nor guesses.
    equal(await kinds(flow({ throws: true }, 'keyed')), ['onA:no', 'onB:no'], 'routesFor threw: both arcs pass through unrefined');
    // A malformed set — a default that is not a route — likewise.
    equal(await kinds(flow({ dflt: 'nope', resolved: ['keyed'] }, 'keyed')), ['onA:no', 'onB:no'], 'a malformed set: both arcs pass through unrefined');
  });

  test('two gates of ONE derived type with DIFFERENT defaults in one flow: their routeless arcs get different verdicts (adequacy M45)', async () => {
    const twoGates = {
      flowId: 'derived-wiring-two', version: 1, entry: 'produce', nodes: [
        { id: 'produce', kind: 'task', type: 'P', edges: [{ to: 'g1' }] },
        // g1's default is keyed — key-resolved — and its explicit `plain` edge leads on to g2.
        { id: 'g1', kind: 'gate', type: 'byNode', settings: { key: 'series.id', dflt: 'keyed', resolved: ['keyed'] }, edges: [{ to: 'onA' }, { route: 'plain', to: 'g2' }] },
        // g2's default is plain — NOT key-resolved — over the same type and the same key.
        { id: 'g2', kind: 'gate', type: 'byNode', settings: { key: 'series.id', dflt: 'plain', resolved: ['keyed'] }, edges: [{ to: 'onB' }, { route: 'keyed', to: 'onC' }] },
        { id: 'onA', kind: 'task', type: 'C', edges: [{ to: 'done' }] },
        { id: 'onB', kind: 'task', type: 'C', edges: [{ to: 'done' }] },
        { id: 'onC', kind: 'task', type: 'C', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const report = await checkWiring(reg, twoGates);
    const v = (c: string) => report.verdicts.find((x) => x.consumer === c)?.kind ?? 'none';
    equal([v('onA'), v('onB'), v('onC')], ['fits', 'no', 'fits'],
      'g1`s routeless arc carries keyed and fits; g2`s carries plain and does not — one type, two NODES, two defaults');
  });

  test('a derived gate with NO settings: validated clean, constructed, routed by its default, and the wiring check asks routesFor over {} (adequacy M36, M43, M46)', async () => {
    const asked: unknown[] = [];
    const bare: GateType = {
      routesFor: (s) => { asked.push(s); return { routes: ['first', 'other'], defaultRoute: 'other' }; },
      fn: () => 'other',
    };
    const f = {
      flowId: 'bare', version: 1, entry: 'produce', nodes: [
        { id: 'produce', kind: 'task', type: 'P', edges: [{ to: 'gate' }] },
        { id: 'gate', kind: 'gate', type: 'bare', edges: [{ to: 'onA' }, { route: 'first', to: 'onB' }] },
        { id: 'onA', kind: 'task', type: 'C', edges: [{ to: 'done' }] },
        { id: 'onB', kind: 'task', type: 'C', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const r = { ...(reg as object), gateTypes: { bare } } as unknown as Parameters<typeof checkWiring>[0];
    equal(validateDefinition(f, { predicates: [], ...(r as object), gateTypes: { bare } } as never).map((x) => `${x.rule}@${x.at}`), [], 'validateDefinition: clean — no settings is {}');
    ok(asked.length === 1 && JSON.stringify(asked[0]) === '{}', `and routesFor was asked over {}: ${JSON.stringify(asked)}`);
    asked.length = 0;
    const report = await checkWiring(r, f);
    ok(asked.length === 1 && JSON.stringify(asked[0]) === '{}', `checkWiring asked routesFor over {} — a gate with no settings still has a set: ${JSON.stringify(asked)}`);
    equal(report.verdicts.map((x) => x.consumer).sort(), ['onA', 'onB'], 'and both arcs are reported');
  });
});
