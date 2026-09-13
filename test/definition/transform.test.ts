/**
 * **`FD-V35`, `FD-V36` and `FD-V37` — what a node may DO to its input, at the definition, every
 * clause, on every SHAPE** — `spec/flow-definition.md` section 2's `transform` subsection (v0.18)
 * and section 5,
 * [ADR 0051](../../doc/decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md),
 * [W61](../../doc/work-items/w61-what-a-transform-is.md).
 *
 * **Every case runs on the FOUR shapes `FD-C5` enumerates** — a top-level task, a task inside a
 * `fanout` branch, the branch task of a `map`, and a join's successor — which is `doc/workflow.md`
 * section 5 rule 8 obligation (a)'s v0.17 clause: where a rule enumerates its own values the set
 * is that enumeration, and W59's suites were one short of it. The shape list is compared to the
 * transformed corpus flow's own structure rather than written a fifth time (`task-shapes.ts`).
 *
 * The language is the FAKE one in `test/scheduler/fake-language.ts`, so this suite needs no
 * `jsonata`; every refused expression is one its grammar refuses and every accepted one is a
 * dotted path. Every expected value is the rule id from section 5.
 */
import { equal, ok, readText, ROOT, suite } from '../harness.ts';
import { compileProblem, NODE_KEYS_DECLARED, TRANSFORM_KEYS, transformShapeProblem, validateDefinition, violatedRules } from '../../src/definition/validate.ts';
import type { FlowDefinition, LanguageAdapter, Registry } from '../../src/definition/types.ts';
import { shapesOf, transformingNode } from './task-shapes.ts';
import { CORPUS_LANGUAGES, CORPUS_NODE_TYPES } from './corpus-types.ts';
import { PATH_LANGUAGE, PATH_PROBES } from '../scheduler/fake-language.ts';

/** A second language whose compile refuses EVERYTHING, so `FD-V36` has a case that is not the grammar's. */
const STRICT: LanguageAdapter = { compile: () => { throw new Error('strict refuses every expression'); }, worker: 'test://strict' };

const registry: Registry = {
  predicates: new Set<string>(),
  workerTypes: new Set(['IngestWorker', 'ScoreWorker', 'PublishWorker', 'Scorer', 'Ranker']),
  groups: new Set(['gpu']),
  nodeTypes: { Scorer: CORPUS_NODE_TYPES.Scorer!, Ranker: { worker: 'test://Ranker' } },
  languages: { path: PATH_LANGUAGE, strict: STRICT },
};
const T = { lang: 'path', expr: 'confidence' };

/** The four shapes, each a function from *what the task under test carries* to a whole document; `at` is the id every rule must report. */
const SHAPES: readonly [string, string, (extra: Record<string, unknown>) => FlowDefinition][] = [
  ['top-level task', 'score', (extra) => ({
    flowId: 'shape-top', version: 1, entry: 'score',
    nodes: [
      { id: 'score', kind: 'task', edges: [{ to: 'done' }], ...extra },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  }) as unknown as FlowDefinition],
  ['task inside a fanout branch', 'scoreA', (extra) => ({
    flowId: 'shape-fanout', version: 1, entry: 'ingest',
    nodes: [
      { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
      { id: 'scoreA', kind: 'task', edges: [{ to: 'collect' }], ...extra },
      { id: 'scoreB', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  }) as unknown as FlowDefinition],
  ['branch task of a map', 'rank', (extra) => ({
    flowId: 'shape-map', version: 1, entry: 'ingest',
    nodes: [
      { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'each' }] },
      { id: 'each', kind: 'map', over: 'items', branch: 'rank' },
      { id: 'rank', kind: 'task', edges: [{ to: 'gather' }], ...extra },
      { id: 'gather', kind: 'join', of: 'each', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  }) as unknown as FlowDefinition],
  ['successor of a join', 'publish', (extra) => ({
    flowId: 'shape-after', version: 1, entry: 'ingest',
    nodes: [
      { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
      { id: 'scoreA', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'scoreB', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
      { id: 'publish', kind: 'task', edges: [{ to: 'done' }], ...extra },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  }) as unknown as FlowDefinition],
];

/**
 * The rule fires, ALONE, at the node the shape names — and says so if it does not. **`count` is
 * the number of FINDINGS**, one by default: `violatedRules` dedupes, so a rule reported TWICE at one
 * node (the untyped clause AND the shape clause of `FD-V37`) was invisible to the id set — the
 * adequacy reader (m11). *Reported alone* is a claim about the count as well as the id.
 */
function refused(rule: string, at: string, d: FlowDefinition, reg: Registry, label: string, count = 1): string {
  const findings = validateDefinition(d, reg);
  equal(violatedRules(findings), [rule], `${rule} must be the ONLY rule that fires for ${label} — reported: ${violatedRules(findings).join(', ') || '(nothing — accepted)'}`);
  equal(findings.length, count, `${rule} is reported ${count === 1 ? 'ONCE' : `${count} times`} for ${label} — got ${findings.length}: ${findings.map((f) => f.detail).join(' | ')}`);
  equal(findings.map((f) => f.at), findings.map(() => at), `${rule} reports the node it is about (${at}) for ${label}`);
  return findings.map((f) => f.detail).join(' | ');
}
function accepted(d: FlowDefinition, reg: Registry, label: string): void {
  const findings = validateDefinition(d, reg);
  equal(findings, [], `${label} must be ACCEPTED, got ${findings.map((f) => `${f.rule}: ${f.detail}`).join('; ')}`);
}

suite('FD-V35, FD-V36 and FD-V37 — what a node may DO to its input, every clause, on every shape', (test) => {
  for (const [shape, at, build] of SHAPES) {
    // ---- FD-V35: the language is registered, and the set is EMPTY when absent ----
    test(`${shape}: FD-V35 — an unregistered language is refused alone at ${at}, naming it and what IS registered`, () => {
      const detail = refused('FD-V35', at, build({ type: 'Scorer', transform: { lang: 'jsonata', expr: 'confidence' } }), registry, 'lang = "jsonata"');
      ok(detail.includes('"jsonata"') && detail.includes('"path"') && detail.includes('"strict"'), `names the typo and the declared languages: ${detail}`);
    });
    test(`${shape}: FD-V35 — ABSENT registry languages means EMPTY, and so does an empty object or Map`, () => {
      const omitted: Registry = { predicates: registry.predicates, workerTypes: registry.workerTypes, groups: registry.groups, nodeTypes: registry.nodeTypes };
      const detail = refused('FD-V35', at, build({ type: 'Scorer', transform: T }), omitted, 'lang = "path" against a registry with no languages key');
      ok(detail.includes('no languages'), `says the registry declares none: ${detail}`);
      refused('FD-V35', at, build({ type: 'Scorer', transform: T }), { ...omitted, languages: {} }, 'against an EMPTY languages object');
      refused('FD-V35', at, build({ type: 'Scorer', transform: T }), { ...omitted, languages: new Map() }, 'against an EMPTY languages Map');
    });
    test(`${shape}: a registered language and an accepted expression are ACCEPTED — as an object registry and as a Map`, () => {
      for (const expr of PATH_PROBES.accepted) accepted(build({ type: 'Scorer', transform: { lang: 'path', expr } }), registry, `expr = ${JSON.stringify(expr)}`);
      accepted(build({ type: 'Scorer', transform: T }), { ...registry, languages: new Map(Object.entries({ path: PATH_LANGUAGE })) }, 'languages as a Map');
      accepted(build({ type: 'Scorer' }), registry, 'and a typed node with NO transform is accepted, as it was at v0.17');
      ok(PATH_PROBES.accepted.length >= 3, 'the accepted list is not empty');
    });
    // ---- FD-V36: the language's compile accepts the expression, at instantiation ----
    test(`${shape}: FD-V36 — every expression the language REFUSES is refused alone at ${at}, with the language's message, code and position`, () => {
      ok(PATH_PROBES.refused.length >= 3, 'the refused list is not empty');
      for (const expr of PATH_PROBES.refused) {
        const detail = refused('FD-V36', at, build({ type: 'Scorer', transform: { lang: 'path', expr } }), registry, `expr = ${JSON.stringify(expr)}`);
        ok(detail.includes(JSON.stringify(expr)) && detail.includes('"path"') && detail.includes('[P0001]') && detail.includes('at position'),
          `the detail names the expression, the language, the code and the position: ${detail}`);
      }
      const c = PATH_PROBES.compileError!;
      const detail = refused('FD-V36', at, build({ type: 'Scorer', transform: { lang: 'path', expr: c.expr } }), registry, 'the compileError probe');
      ok(detail.includes(`at position ${c.position}`) && detail.includes(`[${c.code}]`), `position ${c.position} and code ${c.code}: ${detail}`);
    });
    test(`${shape}: FD-V36 — a second language that refuses EVERYTHING refuses an expression the first accepts: the rule asks the NAMED language`, () => {
      const detail = refused('FD-V36', at, build({ type: 'Scorer', transform: { lang: 'strict', expr: 'confidence' } }), registry, 'lang = "strict"');
      ok(detail.includes('strict refuses every expression') && detail.includes('"strict"'), `the strict language's own message, naming it: ${detail}`);
      accepted(build({ type: 'Scorer', transform: { lang: 'path', expr: 'confidence' } }), registry, 'while path accepts the same text');
    });
    // ---- FD-V37: typed nodes only, and exactly { lang, expr } ----
    test(`${shape}: FD-V37 — a transform on a node with NO type is refused alone at ${at}, and the message says why`, () => {
      const detail = refused('FD-V37', at, build({ workerType: 'ScoreWorker', transform: T }), registry, 'transform on a bare node');
      ok(detail.includes('no type') && detail.includes('wrapper'), `says a bare node has no wrapper to evaluate it: ${detail}`);
      // Malformed AND untyped is ONE finding, the untyped one: the language clauses are moot on a
      // node that cannot carry the key, as `FD-V34` does not also report `FD-V33` on a bare node.
      refused('FD-V37', at, build({ workerType: 'ScoreWorker', transform: 5 }), registry, 'a malformed transform on a bare node is FD-V37 once');
    });
    test(`${shape}: FD-V37 — every value that is not { lang, expr } is refused alone at ${at}`, () => {
      const MALFORMED: readonly [string, unknown][] = [
        ['a number', 5], ['a string', 'confidence'], ['an array', ['path', 'confidence']], ['null', null],
        ['no expr', { lang: 'path' }], ['no lang', { expr: 'confidence' }],
        ['lang not a string', { lang: 5, expr: 'confidence' }], ['expr not a string', { lang: 'path', expr: ['confidence'] }],
        ['a third key', { lang: 'path', expr: 'confidence', when: 'always' }],
      ];
      ok(MALFORMED.length >= 5 && new Set(MALFORMED.map(([l]) => l)).size === MALFORMED.length, 'the malformed list is non-empty and its labels distinct');
      for (const [label, v] of MALFORMED) {
        const detail = refused('FD-V37', at, build({ type: 'Scorer', transform: v }), registry, `transform = ${label}`);
        ok(detail.includes('transform'), `${label}: the detail is about the key — ${detail}`);
      }
    });
    test(`${shape}: section 5's "every violation" — an unregistered TYPE beside an unregistered LANGUAGE reports both, and so does a refused settings value beside one`, () => {
      equal(violatedRules(validateDefinition(build({ type: 'Nope', transform: { lang: 'jsonata', expr: 'x' } }), registry)), ['FD-V32', 'FD-V35'], 'FD-V32 and FD-V35 together');
      equal(violatedRules(validateDefinition(build({ type: 'Scorer', settings: { factor: 'ten' }, transform: { lang: 'jsonata', expr: 'x' } }), registry)), ['FD-V33', 'FD-V35'], 'FD-V33 and FD-V35 together');
      equal(violatedRules(validateDefinition(build({ type: 'Scorer', transform: { lang: 'path', expr: '$sum(' } }), registry)), ['FD-V36'], 'and FD-V36 alone when only the expression is wrong');
    });
  }

  test('a transform on a `map` node, a `join`, an `end`, or an EDGE is FD-V17 — an undeclared key, refused once by the key tables and not by three more clauses', () => {
    const mapDoc = SHAPES[2]![2]({ type: 'Scorer' });
    (mapDoc.nodes.find((n) => n.id === 'each') as unknown as Record<string, unknown>).transform = T;
    equal(violatedRules(validateDefinition(mapDoc, registry)), ['FD-V17'], 'on a map node');
    const joinDoc = SHAPES[1]![2]({ type: 'Scorer' });
    (joinDoc.nodes.find((n) => n.id === 'collect') as unknown as Record<string, unknown>).transform = T;
    equal(violatedRules(validateDefinition(joinDoc, registry)), ['FD-V17'], 'on a join');
    const endDoc = SHAPES[0]![2]({ type: 'Scorer' });
    (endDoc.nodes.find((n) => n.id === 'done') as unknown as Record<string, unknown>).transform = T;
    equal(violatedRules(validateDefinition(endDoc, registry)), ['FD-V17'], 'on an end node');
    const edgeDoc = SHAPES[0]![2]({ type: 'Scorer' });
    ((edgeDoc.nodes[0] as unknown as { edges: Record<string, unknown>[] }).edges[0]!).transform = T;
    equal(violatedRules(validateDefinition(edgeDoc, registry)), ['FD-V17'], 'on an edge');
    ok(!NODE_KEYS_DECLARED.map!.includes('transform') && !NODE_KEYS_DECLARED.join!.includes('transform') && !NODE_KEYS_DECLARED.end!.includes('transform') && !NODE_KEYS_DECLARED.fanout!.includes('transform'),
      'and no kind but task declares the key');
    ok(NODE_KEYS_DECLARED.task!.includes('transform'), 'which task does');
  });

  test('transformShapeProblem and compileProblem — the two predicates, every clause, naming the value', () => {
    equal(transformShapeProblem({ lang: 'path', expr: 'a' }), null, 'well-formed');
    ok((transformShapeProblem(5) ?? '').includes('5'), 'not an object, naming it');
    ok((transformShapeProblem([]) ?? '').startsWith('transform must be an object'), 'an array is not an object');
    ok((transformShapeProblem({ lang: 'path' }) ?? '').includes('"expr"'), 'missing expr');
    ok((transformShapeProblem({ expr: 'a' }) ?? '').includes('"lang"'), 'missing lang');
    ok((transformShapeProblem({ lang: 1, expr: 'a' }) ?? '').includes('transform.lang must be a string'), 'lang not a string');
    ok((transformShapeProblem({ lang: 'path', expr: 'a', x: 1 }) ?? '').includes('"x"'), 'an extra key, named');
    equal(TRANSFORM_KEYS, ['lang', 'expr'], 'and the two keys are the two');
    equal(compileProblem(PATH_LANGUAGE, 'a.b'), null, 'compile accepts');
    const p = compileProblem(PATH_LANGUAGE, '$sum(*.score') ?? '';
    ok(p.includes('not a dotted key path') && p.includes('at position 4') && p.includes('[P0001]'), `message, position and code: ${p}`);
    const noCode = compileProblem(STRICT, 'anything') ?? '';
    ok(noCode === 'strict refuses every expression', `a language setting neither position nor code gives its message alone: ${noCode}`);
    // The guard's OWN message, not the TypeError a call would throw — which also says "not a
    // function" (the adequacy reader, m08): the clause is *refused, not called*, and only the exact
    // text tells the two apart.
    equal(compileProblem({ compile: 'not a function' as unknown as LanguageAdapter['compile'], worker: 'x' }, 'a'),
      'the language`s compile is not a function; a registry half of an adapter is a synchronous compile(expr) that throws on a syntax error',
      'a compile that is not a function is refused by the guard, not called');
  });
});

suite('the transformed corpus flow — section 7`s row, the four shapes, and the registry`s languages both ways', (test) => {
  test('transformed.flow.json carries a transform on exactly the FOUR shapes FD-C5 enumerates — and validates clean against registry.json + corpus-types.ts', async () => {
    const flow = JSON.parse(await readText(`${ROOT}spec/examples/valid/transformed.flow.json`)) as FlowDefinition;
    equal([...new Set(shapesOf(flow, transformingNode))].sort(), SHAPES.map(([label]) => label).sort(),
      'the shapes the corpus flow`s transforming nodes take are exactly the shapes every case here runs on');
    const transforming = flow.nodes.filter(transformingNode).map((n) => n.id).sort();
    const spec = await readText(`${ROOT}spec/flow-definition.md`);
    const row = spec.split('\n').find((l) => l.startsWith('| `transformed.flow.json` |')) ?? '';
    ok(row.length > 0, 'section 7 has the transformed row');
    const namedInRow = [...row.matchAll(/\(`(\w+)`[,)]/g)].map((m) => m[1]!).sort();
    equal(namedInRow, transforming, `the row names exactly the transforming nodes: ${namedInRow.join(', ')}`);
    equal(transforming, ['ingest', 'publish', 'rank', 'scoreA'], 'the entry, a join`s successor, the map`s branch and a fanout branch entry — FD-C5`s four kinds of input');
    // The `needs` shape is the one W59's corpus flow does not carry: scoreA declares one, so its
    // transform reads what `needs` composed — the second of the four kinds, in the corpus.
    const scoreA = flow.nodes.find((n) => n.id === 'scoreA') as { needs?: unknown; transform: { expr: string } };
    ok(scoreA.needs !== undefined && scoreA.transform.expr.startsWith('run.'), 'scoreA transforms what its needs composed');
    const publish = flow.nodes.find((n) => n.id === 'publish') as { transform: { expr: string } };
    ok(publish.transform.expr.startsWith('$settings.'), 'and publish reads $settings, so the binding is in the corpus');
    const doc = JSON.parse(await readText(`${ROOT}spec/examples/registry.json`)) as { predicates: string[]; workerTypes: string[]; groups: string[]; nodeTypes: string[]; languages: string[] };
    accepted(flow, { predicates: new Set(doc.predicates), workerTypes: new Set(doc.workerTypes), groups: new Set(doc.groups), nodeTypes: CORPUS_NODE_TYPES, languages: CORPUS_LANGUAGES }, 'transformed.flow.json against registry.json + corpus-types.ts');
    // Obligation (e), third shape: registry.json's languages and corpus-types.ts's map, both ways.
    equal([...doc.languages].sort(), Object.keys(CORPUS_LANGUAGES).sort(), 'the names registry.json declares under languages are the keys corpus-types.ts defines');
    ok(doc.languages.length > 0, 'and the set is not empty');
  });
  test('section 2`s key table declares `transform` on the task row, and FD-V17 accepts exactly that — obligation (e)`s third shape', async () => {
    const spec = await readText(`${ROOT}spec/flow-definition.md`);
    const row = spec.split('\n').find((l) => l.startsWith('| `task` |')) ?? '';
    const cell = row.split('|')[2] ?? '';
    const documented = [...cell.matchAll(/`([A-Za-z]+)\??`/g)].map((m) => m[1]!);
    ok(documented.includes('transform'), `the task row lists transform: ${documented.join(', ')}`);
    ok(spec.split('\n').some((l) => l.startsWith('| `transform` |')), 'section 2`s transform subsection has a `transform` row');
  });
  test('the three invalid cases are the three refusals, each named for its rule and refusing for it against the corpus registry', async () => {
    const doc = JSON.parse(await readText(`${ROOT}spec/examples/registry.json`)) as { predicates: string[]; workerTypes: string[]; groups: string[]; nodeTypes: string[]; languages: string[] };
    const reg: Registry = { predicates: new Set(doc.predicates), workerTypes: new Set(doc.workerTypes), groups: new Set(doc.groups), nodeTypes: CORPUS_NODE_TYPES, languages: CORPUS_LANGUAGES };
    for (const [rule, file] of [['FD-V35', 'FD-V35--transform-language-not-in-registry'], ['FD-V36', 'FD-V36--transform-the-language-refuses'], ['FD-V37', 'FD-V37--transform-on-a-node-with-no-type']] as const) {
      const flow = JSON.parse(await readText(`${ROOT}spec/examples/invalid/${file}.flow.json`)) as FlowDefinition;
      equal(violatedRules(validateDefinition(flow, reg)), [rule], `${file} is refused for ${rule} and nothing else`);
    }
  });
});
