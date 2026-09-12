/**
 * **`FD-V32`, `FD-V33` and `FD-V34` — what a node TYPE is at the definition, every clause, on
 * every SHAPE** — `spec/flow-definition.md` section 2 (v0.17) and section 5,
 * [ADR 0049](../../doc/decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md),
 * [W59](../../doc/work-items/w59-what-a-node-type-is.md).
 *
 * **Every case runs on the three shapes a task node takes** — a top-level task, a task inside a
 * `fanout` branch, and the branch task of a `map` — which is `doc/workflow.md` section 5 rule 8
 * obligation (a)'s v0.16 clause, and the shape list is compared to the typed corpus flow's own
 * structure rather than written down a fourth time (W58's adequacy reader, `task-shapes.ts`).
 *
 * Every expected value is the rule id from section 5; the refused settings values are the ones
 * the type's validator in `corpus-types.ts` names, and the envelope those settings would have
 * been carried in is what `FD-C5` says a worker reads, so none of them may mean something quietly.
 */
import { equal, ok, readText, ROOT, suite } from '../harness.ts';
import { NODE_KEYS_DECLARED, settingsProblem, validateDefinition, violatedRules } from '../../src/definition/validate.ts';
import type { FlowDefinition, NodeType, Registry } from '../../src/definition/types.ts';
import { shapesOf, typedNode } from './task-shapes.ts';
import { CORPUS_NODE_TYPES } from './corpus-types.ts';

/** The corpus type, plus one with NO validator so *absent validator accepts any object* has a case. */
const TYPES: Readonly<Record<string, NodeType>> = {
  Scorer: CORPUS_NODE_TYPES.Scorer!,
  Ranker: { worker: 'test://Ranker' },
};
const registry: Registry = {
  predicates: new Set<string>(),
  // A type's pool is keyed by its name, so both type names are pools here (FD-V32's second clause).
  workerTypes: new Set(['IngestWorker', 'ScoreWorker', 'PublishWorker', 'Scorer', 'Ranker']),
  groups: new Set(['gpu']),
  nodeTypes: TYPES,
};

/**
 * The three shapes, each a function from *what the task under test carries* to a whole document.
 * `at` is the id every rule here must report for that shape. The task under test carries ONLY
 * what `extra` gives it, so a case decides whether it is typed, untyped, both or neither.
 */
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
  // The FOURTH shape — the adequacy reader (q51): `FD-C5`'s own enumeration names a join's
  // successor, and no suite had put a typed node there.
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

/** The rule fires, ALONE, at the node the shape names — and says so if it does not. */
function refused(rule: string, at: string, d: FlowDefinition, reg: Registry, label: string): string {
  const findings = validateDefinition(d, reg);
  equal(violatedRules(findings), [rule],
    `${rule} must be the ONLY rule that fires for ${label} — reported: ${violatedRules(findings).join(', ') || '(nothing — accepted)'}`);
  equal(findings.map((f) => f.at), findings.map(() => at), `${rule} reports the node it is about (${at}) for ${label}`);
  return findings.map((f) => f.detail).join(' | ');
}

function accepted(d: FlowDefinition, reg: Registry, label: string): void {
  const findings = validateDefinition(d, reg);
  equal(findings, [], `${label} must be ACCEPTED, got ${findings.map((f) => `${f.rule}: ${f.detail}`).join('; ')}`);
}

suite('FD-V32 — type names a registered node type whose pool is keyed by its name, every clause, on every shape', (test) => {
  for (const [shape, at, build] of SHAPES) {
    test(`${shape}: an unregistered type is FD-V32 alone at ${at}, and the detail names what IS registered`, () => {
      const detail = refused('FD-V32', at, build({ type: 'Nope' }), registry, 'type = "Nope"');
      ok(detail.includes('"Nope"') && detail.includes('"Scorer"') && detail.includes('"Ranker"'),
        `names the typo and the declared types: ${detail}`);
    });
    test(`${shape}: a registered type with NO POOL of its name is FD-V32 alone — a type's pool is keyed by its name`, () => {
      const noPool: Registry = { ...registry, workerTypes: new Set(['IngestWorker', 'ScoreWorker', 'PublishWorker']) };
      const detail = refused('FD-V32', at, build({ type: 'Scorer' }), noPool, 'type = "Scorer" with no Scorer pool');
      ok(detail.includes('no pool'), `the detail says the pool is what is missing: ${detail}`);
    });
    test(`${shape}: ABSENT registry nodeTypes means EMPTY — every type is unregistered, naming that`, () => {
      const omitted: Registry = { predicates: registry.predicates, workerTypes: registry.workerTypes, groups: registry.groups };
      const detail = refused('FD-V32', at, build({ type: 'Scorer' }), omitted, 'type = "Scorer" against a registry with no nodeTypes key');
      ok(detail.includes('no node types'), `says the registry declares none: ${detail}`);
      refused('FD-V32', at, build({ type: 'Scorer' }), { ...omitted, nodeTypes: {} }, 'and against an EMPTY nodeTypes object');
      refused('FD-V32', at, build({ type: 'Scorer' }), { ...omitted, nodeTypes: new Map() }, 'and against an EMPTY nodeTypes Map');
    });
    test(`${shape}: a registered type with a pool is accepted, with settings and without, as an object or as a Map`, () => {
      accepted(build({ type: 'Scorer', settings: { factor: 2 } }), registry, 'type = "Scorer", settings = {factor: 2}');
      accepted(build({ type: 'Scorer' }), registry, 'type = "Scorer" and no settings — the effective {} is accepted by this validator');
      accepted(build({ type: 'Ranker', settings: { anything: 'goes' } }), registry, 'a type with no validator accepts any plain object');
      accepted(build({ type: 'Scorer', settings: { factor: 2 } }), { ...registry, nodeTypes: new Map(Object.entries(TYPES)) }, 'nodeTypes as a Map');
    });
    test(`${shape}: a non-string type is FD-V21 (wrong type) and not FD-V32 — FD-V32 asks about a NAME`, () => {
      refused('FD-V21', at, build({ type: 5 }), registry, 'type = 5');
    });
  }
});

suite('FD-V33 — settings is a plain object the type`s validator accepts, every clause, on every shape', (test) => {
  // [label, value]. The shape clause first, then what the corpus validator refuses by name.
  const REFUSED: readonly [string, unknown][] = [
    ['a number', 5],
    ['a string', 'x'],
    ['an array', []],
    ['null', null],
    ['factor a string — the corpus validator refuses it', { factor: 'ten' }],
    ['factor negative', { factor: -1 }],
    ['factor NaN', { factor: NaN }],
    ['a typo`d key — undeclared by the type', { fector: 1 }],
    ['a key beside factor', { factor: 1, extra: 2 }],
  ];
  const ACCEPTED: readonly [string, unknown][] = [
    ['{}', {}],
    ['{factor: 1}', { factor: 1 }],
    ['{factor: 0.5} — positive and finite', { factor: 0.5 }],
  ];
  for (const [shape, at, build] of SHAPES) {
    test(`${shape}: every refused settings value fires FD-V33 alone at ${at}`, () => {
      ok(REFUSED.length >= 5 && new Set(REFUSED.map(([l]) => l)).size === REFUSED.length, 'the refused list is non-empty and its labels distinct');
      for (const [label, s] of REFUSED) refused('FD-V33', at, build({ type: 'Scorer', settings: s }), registry, `settings = ${label}`);
    });
    test(`${shape}: every accepted settings value validates clean, and so does no settings key at all`, () => {
      // Bounded as REFUSED is — the adequacy reader (q19) emptied this list for zero.
      ok(ACCEPTED.length >= 3 && new Set(ACCEPTED.map(([l]) => l)).size === ACCEPTED.length, 'the accepted list is non-empty and its labels distinct');
      for (const [label, s] of ACCEPTED) accepted(build({ type: 'Scorer', settings: s }), registry, `settings = ${label}`);
      accepted(build({ type: 'Scorer' }), registry, 'no settings');
    });
    test(`${shape}: the validator sees {} when the node declares NO settings — a type that requires a key refuses absence by name`, () => {
      const strict: Registry = { ...registry, nodeTypes: { ...TYPES, Strict: { worker: 'test://Strict', settings: (s) => (typeof s.factor === 'number' ? null : `settings.factor is required, got ${JSON.stringify(s.factor)}`) } }, workerTypes: new Set([...registry.workerTypes, 'Strict']) };
      const detail = refused('FD-V33', at, build({ type: 'Strict' }), strict, 'type = "Strict" with no settings');
      ok(detail.includes('required') && detail.includes('undefined'), `the validator saw {} and said so: ${detail}`);
      accepted(build({ type: 'Strict', settings: { factor: 1 } }), strict, 'and with the key present');
    });
    test(`${shape}: a validator that THROWS refuses, naming the throw — and one returning a boolean refuses too`, () => {
      const odd: Registry = {
        ...registry,
        workerTypes: new Set([...registry.workerTypes, 'Throws', 'Bool']),
        nodeTypes: {
          ...TYPES,
          Throws: { worker: 'test://Throws', settings: () => { throw new Error('validator exploded'); } },
          Bool: { worker: 'test://Bool', settings: (() => false) as unknown as NodeType['settings'] },
        },
      };
      const thrown = refused('FD-V33', at, build({ type: 'Throws', settings: { factor: 1 } }), odd, 'a throwing validator');
      ok(thrown.includes('THREW') && thrown.includes('validator exploded'), `the throw is the detail: ${thrown}`);
      const bool = refused('FD-V33', at, build({ type: 'Bool', settings: { factor: 1 } }), odd, 'a validator returning false');
      ok(bool.includes('neither null') && bool.includes('false'), `a boolean verdict is refused as such, not read as accept: ${bool}`);
      // And `true` is refused the same way: the contract is null-or-string, not a predicate's.
      const boolTrue: Registry = { ...odd, nodeTypes: { ...TYPES, Bool: { worker: 'test://Bool', settings: (() => true) as unknown as NodeType['settings'] } } };
      refused('FD-V33', at, build({ type: 'Bool', settings: { factor: 1 } }), boolTrue, 'a validator returning true');
    });
    test(`${shape}: an unregistered type AND malformed settings report BOTH — section 5's "every violation"`, () => {
      const rules = violatedRules(validateDefinition(build({ type: 'Nope', settings: 5 }), registry));
      equal(rules, ['FD-V32', 'FD-V33'], `both rules, so an author with two things wrong reads two rows: ${rules.join(', ')}`);
    });
  }

  test('settingsProblem — the one predicate, both clauses, and its messages name the value', () => {
    equal(settingsProblem(undefined, undefined), null, 'no validator, no settings: accepted');
    equal(settingsProblem(undefined, { any: 1 }), null, 'no validator: any plain object');
    ok((settingsProblem(undefined, [1]) ?? '').startsWith('settings must be a plain object'), 'the shape clause fires with no validator at all');
    ok((settingsProblem(undefined, null) ?? '').includes('null'), 'and names the value');
    equal(settingsProblem((s) => (s.factor === undefined ? 'factor missing' : null), undefined), 'factor missing', 'absent settings reach the validator as {}');
    equal(settingsProblem((s) => (s.factor === undefined ? 'factor missing' : null), { factor: 1 }), null, 'and present ones as themselves');
  });
});

suite('FD-V34 — a node names its pool ONE way: the typed and untyped halves are not mixed, on every shape', (test) => {
  for (const [shape, at, build] of SHAPES) {
    test(`${shape}: type BESIDE workerType is FD-V34 alone at ${at}, naming both`, () => {
      const detail = refused('FD-V34', at, build({ type: 'Scorer', workerType: 'ScoreWorker' }), registry, 'type and workerType together');
      ok(detail.includes('"Scorer"') && detail.includes('"ScoreWorker"'), `names both keys' values: ${detail}`);
    });
    test(`${shape}: a bare workerType that NAMES A TYPE is FD-V34 alone — the raw payload would reach a worker expecting the envelope`, () => {
      // FD-V5 is silent here by construction: a type's pool is keyed by its name, so the name IS
      // a registered pool. Without this clause the document is accepted and the type's worker
      // receives `{ confidence }` where it reads `settings` and `input` — measured at W59's
      // declaration on a real scheduler as a task FAILURE naming the pool.
      const detail = refused('FD-V34', at, build({ workerType: 'Scorer' }), registry, 'workerType = "Scorer", a node type');
      ok(detail.includes('type: "Scorer"'), `the detail says what to write instead: ${detail}`);
      accepted(build({ workerType: 'ScoreWorker' }), registry, 'while a workerType naming an ordinary pool is accepted');
    });
    test(`${shape}: settings on a node with NO type is FD-V34 alone — it would be carried nowhere`, () => {
      refused('FD-V34', at, build({ workerType: 'ScoreWorker', settings: { factor: 1 } }), registry, 'settings on a bare node');
      refused('FD-V34', at, build({ workerType: 'ScoreWorker', settings: 5 }), registry, 'and a malformed settings on a bare node is FD-V34, not FD-V33 — the halves are the mistake');
    });
    test(`${shape}: NEITHER key is FD-V23 alone, and the message names both`, () => {
      const detail = refused('FD-V23', at, build({}), registry, 'a task with neither workerType nor type');
      ok(detail.includes('"workerType"') && detail.includes('"type"'), `both spellings of the fix are named: ${detail}`);
    });
  }
});

suite('the typed corpus flow — section 7`s row, the three shapes, and the registry both ways', (test) => {
  test('typed.flow.json carries a typed node on exactly the FOUR shapes FD-C5 enumerates, its entry declaring NO settings — and validates clean', async () => {
    const flow = JSON.parse(await readText(`${ROOT}spec/examples/valid/typed.flow.json`)) as FlowDefinition;
    // The SHAPES this suite runs are the shapes the corpus flow's typed nodes take, both ways —
    // derived from the document's structure, so a shape deleted from the list above fails naming
    // itself, and a fourth shape nobody built for fails too.
    equal([...new Set(shapesOf(flow, typedNode))].sort(), SHAPES.map(([label]) => label).sort(),
      'the shapes the corpus flow`s typed nodes take are exactly the shapes every case here runs on');
    const typed = flow.nodes.filter(typedNode).map((n) => n.id).sort();
    // Section 7's row names the three typed nodes in parentheses, and the names are read from the
    // row rather than repeated here (rule 8 obligation (b), W58's own pattern).
    const spec = await readText(`${ROOT}spec/flow-definition.md`);
    const row = spec.split('\n').find((l) => l.startsWith('| `typed.flow.json` |')) ?? '';
    ok(row.length > 0, 'section 7 has the typed row');
    const namedInRow = [...row.matchAll(/\(`(\w+)`[,)]/g)].map((m) => m[1]!).sort();
    equal(namedInRow, typed, `the row names exactly the typed nodes: ${namedInRow.join(', ')}`);
    equal(typed, ['ingest', 'publish', 'rank', 'scoreA'], 'and they are the entry, a join`s successor, the map`s branch and a fanout branch entry — FD-C5`s four kinds of input');
    const entry = flow.nodes.find((n) => n.id === flow.entry) as { settings?: unknown };
    equal(entry.settings, undefined, 'the entry node declares no settings, so the corpus shows the {} default the validator sees');
    // Against the corpus registry exactly as L4 builds it.
    const doc = JSON.parse(await readText(`${ROOT}spec/examples/registry.json`)) as { predicates: string[]; workerTypes: string[]; groups: string[]; nodeTypes: string[] };
    accepted(flow, { predicates: new Set(doc.predicates), workerTypes: new Set(doc.workerTypes), groups: new Set(doc.groups), nodeTypes: CORPUS_NODE_TYPES }, 'typed.flow.json against registry.json + corpus-types.ts');
  });
  test('section 2`s key table declares `type` and `settings` on the task row, and FD-V17 accepts exactly those — obligation (e)`s third shape', async () => {
    const spec = await readText(`${ROOT}spec/flow-definition.md`);
    const row = spec.split('\n').find((l) => l.startsWith('| `task` |')) ?? '';
    const cell = row.split('|')[2] ?? '';
    const documented = [...cell.matchAll(/`([A-Za-z]+)\??`/g)].map((m) => m[1]!);
    ok(documented.includes('type') && documented.includes('settings'), `the task row lists both new keys: ${documented.join(', ')}`);
    ok(NODE_KEYS_DECLARED.task!.includes('type') && NODE_KEYS_DECLARED.task!.includes('settings'), 'and the validator declares both');
    // And the subsection's own key table has a row per key, so an author finds each.
    ok(spec.split('\n').some((l) => l.startsWith('| `type` |')) && spec.split('\n').some((l) => l.startsWith('| `settings` |')),
      'section 2`s typed-node subsection has a `type` row and a `settings` row');
  });
  test('the three invalid cases are the three refusals, each named for its rule and refusing for it against the corpus registry', async () => {
    const doc = JSON.parse(await readText(`${ROOT}spec/examples/registry.json`)) as { predicates: string[]; workerTypes: string[]; groups: string[]; nodeTypes: string[] };
    const reg: Registry = { predicates: new Set(doc.predicates), workerTypes: new Set(doc.workerTypes), groups: new Set(doc.groups), nodeTypes: CORPUS_NODE_TYPES };
    for (const [rule, file] of [['FD-V32', 'FD-V32--type-not-in-registry'], ['FD-V33', 'FD-V33--settings-the-type-refuses'], ['FD-V34', 'FD-V34--type-beside-worker-type']] as const) {
      const flow = JSON.parse(await readText(`${ROOT}spec/examples/invalid/${file}.flow.json`)) as FlowDefinition;
      equal(violatedRules(validateDefinition(flow, reg)), [rule], `${file} is refused for ${rule} and nothing else`);
    }
  });
});
