/**
 * **`FD-V32`, `FD-V33` and `FD-V38` — what a node TYPE is at the definition since every task node
 * names one, every clause, on every SHAPE** — `spec/flow-definition.md` section 2 (v0.19) and
 * section 5, [ADR 0049](../../doc/decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md),
 * [ADR 0053](../../doc/decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md),
 * [ADR 0054](../../doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md),
 * [W59](../../doc/work-items/w59-what-a-node-type-is.md), [W65](../../doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md).
 *
 * **Every case runs on the FOUR shapes `FD-C5` enumerates** — a top-level task, a task inside a
 * `fanout` branch, the branch task of a `map`, and a join's successor — `doc/workflow.md` section 5
 * rule 8 obligation (a)'s enumeration clause, and the shape list is compared to the typed corpus
 * flow's own structure rather than written down again (`task-shapes.ts`).
 *
 * Every expected value is the rule id from section 5; the refused settings values are what the
 * corpus worker's `settingsSchema` refuses by its own keywords, and the envelope those settings would
 * have been carried in is what `FD-C5` says a worker reads, so none of them may mean something
 * quietly. **`workerType` is retired**: a task with no `type` is `FD-V23` and one carrying the old
 * key is `FD-V17`, and both are asserted here so the retirement is a measurement.
 */
import { equal, ok, readText, ROOT, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { effectiveSettings, NODE_KEYS_DECLARED, settingsProblem, validateDefinition, violatedRules } from '../../src/definition/validate.ts';
import type { FlowDefinition, JsonSchema, NodeTypeEntry, Registry, RegistryDocument, WorkerEntry } from '../../src/definition/types.ts';
import { shapesOf, typedNode } from './task-shapes.ts';
import { corpusRegistry } from './corpus-types.ts';

/** The corpus scorer's `settingsSchema` — a literal here, asserted equal to `registry.json`'s below (a list is a claim about another list). */
const SCORER_SCHEMA: JsonSchema = { type: 'object', properties: { factor: { type: 'number', minimum: 0 } }, additionalProperties: false };
/** Two named instances, so `FD-V38` has a pool of the node's type and one of another type to name. */
const registry: Registry = {
  predicates: new Set<string>(),
  groups: new Set(['gpu']),
  ...typesFor(['IngestWorker', 'ScoreWorker', 'PublishWorker'], {
    // `Scorer` declares settings DEFAULTS, so the merge under a node's settings has a case (decision 12).
    Scorer: { worker: 'scorer', settings: { factor: 1 } },
    // `Ranker`'s worker has no settingsSchema: any plain object is accepted (decision 3's absent-means-unchecked).
    Ranker: { worker: 'ranker' },
  }, { scorer: { url: 'test://scorer', settingsSchema: SCORER_SCHEMA } }),
  pools: { 'scorer-fast': { type: 'Scorer' }, 'ranker-big': { type: 'Ranker' } },
};

/**
 * The four shapes, each a function from *what the task under test carries* to a whole document.
 * `at` is the id every rule here must report for that shape. The task under test carries ONLY
 * what `extra` gives it, so a case decides what it names.
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
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
      { id: 'scoreA', kind: 'task', edges: [{ to: 'collect' }], ...extra },
      { id: 'scoreB', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  }) as unknown as FlowDefinition],
  ['branch task of a map', 'rank', (extra) => ({
    flowId: 'shape-map', version: 1, entry: 'ingest',
    nodes: [
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'each' }] },
      { id: 'each', kind: 'map', over: 'items', branch: 'rank' },
      { id: 'rank', kind: 'task', edges: [{ to: 'gather' }], ...extra },
      { id: 'gather', kind: 'join', of: 'each', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  }) as unknown as FlowDefinition],
  ['successor of a join', 'publish', (extra) => ({
    flowId: 'shape-after', version: 1, entry: 'ingest',
    nodes: [
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
      { id: 'scoreA', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'scoreB', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
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

/** The rule fires alone, somewhere at `at` — for a registry defect that reaches EVERY task node (no workers, no types), where `refused`'s every-finding-at-`at` cannot hold. */
function refusedEverywhere(rule: string, at: string, d: FlowDefinition, reg: Registry, label: string): string {
  const findings = validateDefinition(d, reg);
  equal(violatedRules(findings), [rule], `${rule} must be the ONLY rule that fires for ${label} — reported: ${violatedRules(findings).join(', ') || '(nothing — accepted)'}`);
  ok(findings.some((f) => f.at === at), `${rule} reports the node under test (${at}) among the nodes it fires at for ${label}`);
  return findings.filter((f) => f.at === at).map((f) => f.detail).join(' | ');
}
/** The suite's registry with its sections as plain records, for a fixture that edits one entry. */
const R = registry as unknown as { workers: Record<string, WorkerEntry>; nodeTypes: Record<string, NodeTypeEntry> };

function accepted(d: FlowDefinition, reg: Registry, label: string): void {
  const findings = validateDefinition(d, reg);
  equal(findings, [], `${label} must be ACCEPTED, got ${findings.map((f) => `${f.rule}: ${f.detail}`).join('; ')}`);
}

suite('FD-V32 — type is REQUIRED and names a registered node type whose worker the registry declares, every clause, on every shape', (test) => {
  for (const [shape, at, build] of SHAPES) {
    test(`${shape}: an unregistered type is FD-V32 alone at ${at}, and the detail names what IS registered`, () => {
      const detail = refused('FD-V32', at, build({ type: 'Nope' }), registry, 'type = "Nope"');
      ok(detail.includes('"Nope"') && detail.includes('"Scorer"') && detail.includes('"Ranker"') && detail.includes('"IngestWorker"'),
        `names the typo and the declared types: ${detail}`);
    });
    test(`${shape}: a registered type whose WORKER the registry lacks is FD-V32 alone — the second clause, v0.19`, () => {
      const { scorer: _dropped, ...rest } = R.workers;
      const noWorker: Registry = { ...registry, workers: rest };
      const detail = refused('FD-V32', at, build({ type: 'Scorer' }), noWorker, 'type = "Scorer" with no scorer worker');
      ok(detail.includes('names worker "scorer"') && detail.includes('"ranker"'), `the detail says the worker is what is missing, and what is declared: ${detail}`);
      refusedEverywhere('FD-V32', at, build({ type: 'Scorer' }), { ...registry, workers: undefined }, 'and workers ABSENT means EMPTY — every type then names a worker the registry lacks');
    });
    test(`${shape}: ABSENT registry nodeTypes means EMPTY — every type is unregistered, naming that`, () => {
      const omitted: Registry = { predicates: registry.predicates, groups: registry.groups, workers: registry.workers };
      // Every task node names a type, so a registry with none refuses EVERY task of the shape — the node under test among them.
      const detail = refusedEverywhere('FD-V32', at, build({ type: 'Scorer' }), omitted, 'type = "Scorer" against a registry with no nodeTypes key');
      ok(detail.includes('no node types'), `says the registry declares none: ${detail}`);
      refusedEverywhere('FD-V32', at, build({ type: 'Scorer' }), { ...omitted, nodeTypes: {} }, 'and against an EMPTY nodeTypes object');
      refusedEverywhere('FD-V32', at, build({ type: 'Scorer' }), { ...omitted, nodeTypes: new Map() }, 'and against an EMPTY nodeTypes Map');
    });
    test(`${shape}: a registered type is accepted, with settings and without, as an object or as a Map, and with a Map of workers`, () => {
      accepted(build({ type: 'Scorer', settings: { factor: 2 } }), registry, 'type = "Scorer", settings = {factor: 2}');
      accepted(build({ type: 'Scorer' }), registry, 'type = "Scorer" and no settings — the type`s defaults are what the schema sees');
      accepted(build({ type: 'Ranker', settings: { anything: 'goes' } }), registry, 'a type whose worker has no settingsSchema accepts any plain object');
      accepted(build({ type: 'Scorer', settings: { factor: 2 } }), { ...registry, nodeTypes: new Map(Object.entries(registry.nodeTypes!)) }, 'nodeTypes as a Map');
      accepted(build({ type: 'Scorer', settings: { factor: 2 } }), { ...registry, workers: new Map(Object.entries(registry.workers!)) }, 'workers as a Map');
    });
    test(`${shape}: a non-string type is FD-V21 (wrong type) and not FD-V32 — FD-V32 asks about a NAME`, () => {
      refused('FD-V21', at, build({ type: 5 }), registry, 'type = 5');
    });
    test(`${shape}: NO type at all is FD-V23 alone, naming the key — type is REQUIRED since v0.19`, () => {
      const detail = refused('FD-V23', at, build({}), registry, 'a task with no type');
      ok(detail.includes('"type"'), `names the required key: ${detail}`);
    });
    test(`${shape}: the RETIRED key — workerType — is FD-V17 alone beside a type, and FD-V17 with FD-V23 without one`, () => {
      const detail = refused('FD-V17', at, build({ type: 'Scorer', workerType: 'ScoreWorker' }), registry, 'workerType beside type');
      ok(detail.includes('"workerType"'), `an undeclared key like any other: ${detail}`);
      const rules = violatedRules(validateDefinition(build({ workerType: 'ScoreWorker' }), registry));
      equal(rules, ['FD-V17', 'FD-V23'], `the old spelling alone is the undeclared key AND the missing one: ${rules.join(', ')}`);
    });
  }
});

suite('FD-V33 — settings is a plain object the worker`s settingsSchema accepts, with the type`s defaults merged under, every clause, on every shape', (test) => {
  // [label, value]. The shape clause first, then what the corpus schema refuses by keyword.
  const REFUSED: readonly [string, unknown][] = [
    ['a number', 5],
    ['a string', 'x'],
    ['an array', []],
    ['null', null],
    ['factor a string — type: number', { factor: 'ten' }],
    ['factor negative — minimum: 0', { factor: -1 }],
    ['factor NaN — a finite number only', { factor: NaN }],
    ['a typo`d key — additionalProperties: false', { fector: 1 }],
    ['a key beside factor', { factor: 1, extra: 2 }],
  ];
  const ACCEPTED: readonly [string, unknown][] = [
    ['{}', {}],
    ['{factor: 1}', { factor: 1 }],
    ['{factor: 0.5}', { factor: 0.5 }],
  ];
  for (const [shape, at, build] of SHAPES) {
    test(`${shape}: every refused settings value fires FD-V33 alone at ${at}, and the detail carries the schema's finding`, () => {
      ok(REFUSED.length >= 5 && new Set(REFUSED.map(([l]) => l)).size === REFUSED.length, 'the refused list is non-empty and its labels distinct');
      for (const [label, s] of REFUSED) {
        const detail = refused('FD-V33', at, build({ type: 'Scorer', settings: s }), registry, `settings = ${label}`);
        if (typeof s === 'object' && s !== null && !Array.isArray(s)) ok(detail.includes('settingsSchema') && detail.includes('$.'), `${label}: the finding names its path - ${detail}`);
      }
    });
    test(`${shape}: every accepted settings value validates clean, and so does no settings key at all`, () => {
      ok(ACCEPTED.length >= 3 && new Set(ACCEPTED.map(([l]) => l)).size === ACCEPTED.length, 'the accepted list is non-empty and its labels distinct');
      for (const [label, s] of ACCEPTED) accepted(build({ type: 'Scorer', settings: s }), registry, `settings = ${label}`);
      accepted(build({ type: 'Scorer' }), registry, 'no settings');
    });
    test(`${shape}: the type's DEFAULTS are merged UNDER the node's before the schema is applied — decision 12, both directions`, () => {
      // A worker that REQUIRES `factor`: a node declaring none is refused under a type with no
      // defaults, and accepted under a type whose defaults supply it.
      const strict: Registry = {
        ...registry,
        workers: { ...R.workers, strict: { url: 'test://strict', settingsSchema: { type: 'object', required: ['factor'], properties: { factor: { type: 'number' } } } } },
        nodeTypes: { ...R.nodeTypes, Bare: { worker: 'strict' }, Defaulted: { worker: 'strict', settings: { factor: 4 } } },
      };
      const detail = refused('FD-V33', at, build({ type: 'Bare' }), strict, 'type = "Bare" with no settings');
      ok(detail.includes('$.factor required') && detail.includes('{}'), `the schema saw {} and said what is required: ${detail}`);
      accepted(build({ type: 'Defaulted' }), strict, 'the same worker, a type whose defaults carry the key');
      accepted(build({ type: 'Bare', settings: { factor: 1 } }), strict, 'and a node supplying it itself');
      // The node WINS per key: a default the node overrides is checked as the node wrote it.
      const over = refused('FD-V33', at, build({ type: 'Defaulted', settings: { factor: 'no' } }), strict, 'a node overriding a default with a wrong type');
      ok(over.includes('"factor":"no"'), `the effective settings carry the node's value, not the default: ${over}`);
    });
    test(`${shape}: a settingsSchema OUTSIDE the subset is reported, never applied — a keyword ignored would be a constraint dropped in silence (Q278)`, () => {
      const bad: Registry = { ...registry, workers: { ...(registry.workers as Record<string, unknown>), scorer: { url: 'test://scorer', settingsSchema: { type: 'object', pattern: 'x' } } } as Registry['workers'] };
      const detail = refused('FD-V33', at, build({ type: 'Scorer', settings: { factor: 1 } }), bad, 'a schema with `pattern`');
      ok(detail.includes('"pattern"') && detail.includes('not in the built-in subset'), `names the keyword: ${detail}`);
    });
    test(`${shape}: an unregistered type AND malformed settings report BOTH — section 5's "every violation"`, () => {
      const rules = violatedRules(validateDefinition(build({ type: 'Nope', settings: 5 }), registry));
      equal(rules, ['FD-V32', 'FD-V33'], `both rules, so an author with two things wrong reads two rows: ${rules.join(', ')}`);
    });
  }

  test('settingsProblem and effectiveSettings — the predicate and the merge, every clause', () => {
    equal(settingsProblem(undefined, undefined, undefined), null, 'no schema, no defaults, no settings: accepted');
    equal(settingsProblem(undefined, undefined, { any: 1 }), null, 'no schema: any plain object');
    ok((settingsProblem(undefined, undefined, [1]) ?? '').startsWith('settings must be a plain object'), 'the shape clause fires with no schema at all');
    ok((settingsProblem(undefined, undefined, null) ?? '').includes('null'), 'and names the value');
    const schema: JsonSchema = { type: 'object', required: ['factor'] };
    ok((settingsProblem(schema, undefined, undefined) ?? '').includes('$.factor required'), 'absent settings reach the schema as {}');
    equal(settingsProblem(schema, { factor: 1 }, undefined), null, 'the defaults reach the schema when the node declares none');
    equal(settingsProblem(schema, undefined, { factor: 1 }), null, 'and present ones as themselves');
    equal(effectiveSettings({ settings: { a: 1 } }, { settings: { a: 0, b: 2 } }), { a: 1, b: 2 }, 'the node wins per key over the type`s defaults');
    equal(effectiveSettings({}, undefined), {}, 'nothing declared anywhere: {}');
    equal(effectiveSettings({}, { settings: { b: 2 } }), { b: 2 }, 'defaults alone');
    // The adequacy reader (M09): the merge is SHALLOW — a nested default object is replaced, never merged into (the spec's settings row says so now).
    equal(effectiveSettings({ settings: { a: { y: 2 } } }, { settings: { a: { x: 1 }, b: 2 } }), { a: { y: 2 }, b: 2 }, 'a nested object from the node REPLACES the default`s, shallowly');
  });
  // The adequacy reader (M14): a settingsSchema outside the subset is FD-V33 whether or not the node declares settings.
  for (const [shape, at, build] of SHAPES) {
    test(`${shape}: a worker settingsSchema OUTSIDE the subset is FD-V33 on a node declaring NO settings too — reported, never applied`, () => {
      const outside: Registry = { ...registry, workers: { ...R.workers, scorer: { url: 'test://scorer', settingsSchema: { type: 'object', pattern: 'x' } } } };
      const detail = refused('FD-V33', at, build({ type: 'Scorer' }), outside, 'no settings, schema outside the subset');
      ok(detail.includes('"pattern"'), `names the keyword: ${detail}`);
      refused('FD-V33', at, build({ type: 'Scorer', settings: { factor: 1 } }), outside, 'and with settings — the same refusal');
    });
  }
});

suite('FD-V38 — pool names a registered instance of THIS node`s type, every clause, on every shape', (test) => {
  for (const [shape, at, build] of SHAPES) {
    test(`${shape}: an unregistered pool is FD-V38 alone at ${at}, naming what IS registered and the default instance`, () => {
      const detail = refused('FD-V38', at, build({ type: 'Scorer', pool: 'nope' }), registry, 'pool = "nope"');
      ok(detail.includes('"nope"') && detail.includes('"scorer-fast"') && detail.includes('"ranker-big"') && detail.includes('keyed "Scorer"'), `names the typo, the declared instances and the default: ${detail}`);
    });
    test(`${shape}: a pool that is an instance of ANOTHER type is FD-V38 alone, naming both types`, () => {
      const detail = refused('FD-V38', at, build({ type: 'Scorer', pool: 'ranker-big' }), registry, 'pool = "ranker-big" on a Scorer');
      ok(detail.includes('"ranker-big"') && detail.includes('"Ranker"') && detail.includes('"Scorer"'), `names the instance's type and the node's: ${detail}`);
      // The adequacy reader (M21): the OTHER type's DEFAULT instance, by its type name, is not an instance of this type either.
      const byName = refused('FD-V38', at, build({ type: 'Scorer', pool: 'Ranker' }), registry, 'pool = "Ranker" on a Scorer — another type`s default');
      ok(byName.includes('"Ranker"') && byName.includes('not a registered pool instance'), `a type name is not a pool key: ${byName}`);
    });
    test(`${shape}: an instance of the node's own type is accepted, and so is the type's own name — the default instance stated explicitly`, () => {
      accepted(build({ type: 'Scorer', pool: 'scorer-fast' }), registry, 'pool = "scorer-fast"');
      accepted(build({ type: 'Scorer', pool: 'Scorer' }), registry, 'pool = "Scorer", the default');
      accepted(build({ type: 'Ranker', pool: 'ranker-big', settings: { x: 1 } }), registry, 'and on the other type, with settings beside it');
      accepted(build({ type: 'Scorer', pool: 'scorer-fast' }), { ...registry, pools: new Map(Object.entries(registry.pools!)) }, 'pools as a Map');
    });
    test(`${shape}: ABSENT registry pools means EMPTY — every named instance is unknown, and the default is still accepted`, () => {
      const omitted: Registry = { ...registry, pools: undefined };
      const detail = refused('FD-V38', at, build({ type: 'Scorer', pool: 'scorer-fast' }), omitted, 'pool = "scorer-fast" against no pools');
      ok(detail.includes('no named instances'), `says the registry declares none: ${detail}`);
      accepted(build({ type: 'Scorer', pool: 'Scorer' }), omitted, 'the type`s own name needs no pools section');
      refused('FD-V38', at, build({ type: 'Scorer', pool: 'scorer-fast' }), { ...registry, pools: {} }, 'an EMPTY pools object');
    });
    test(`${shape}: a non-string pool is FD-V21, and a pool on an UNREGISTERED type is FD-V32 alone — the type question comes first`, () => {
      refused('FD-V21', at, build({ type: 'Scorer', pool: 7 }), registry, 'pool = 7');
      refused('FD-V32', at, build({ type: 'Nope', pool: 'scorer-fast' }), registry, 'pool on an unknown type');
    });
  }
});

suite('the typed corpus flow — section 7`s rows, the four shapes, the pooled flow, and the registry document both ways', (test) => {
  const doc = async () => JSON.parse(await readText(`${ROOT}spec/examples/registry.json`)) as Required<RegistryDocument>;
  test('typed.flow.json carries a typed node on exactly the FOUR shapes FD-C5 enumerates, its entry declaring NO settings — and validates clean against the registry document', async () => {
    const flow = JSON.parse(await readText(`${ROOT}spec/examples/valid/typed.flow.json`)) as FlowDefinition;
    // Every task node is typed since v0.19, so the shapes the flow's typed nodes take are the shapes
    // every case here runs on, both ways — derived from the document's structure.
    equal([...new Set(shapesOf(flow, typedNode))].sort(), SHAPES.map(([label]) => label).sort(),
      'the shapes the corpus flow`s typed nodes take are exactly the shapes every case here runs on');
    // Section 7's row names one node per shape in parentheses; each is a task of the flow, and the
    // four named nodes cover the four shapes — read from the row rather than repeated here.
    const spec = await readText(`${ROOT}spec/flow-definition.md`);
    const row = spec.split('\n').find((l) => l.startsWith('| `typed.flow.json` |')) ?? '';
    ok(row.length > 0, 'section 7 has the typed row');
    const namedInRow = [...row.matchAll(/\(`(\w+)`[,)]/g)].map((m) => m[1]!).sort();
    equal(namedInRow, ['ingest', 'publish', 'rank', 'scoreA'], `the row names the four nodes: ${namedInRow.join(', ')}`);
    const named = { ...flow, nodes: flow.nodes.filter((n) => n.kind !== 'task' || namedInRow.includes(n.id)) };
    equal([...new Set(shapesOf(named, typedNode))].sort(), SHAPES.map(([label]) => label).sort(), 'and the four named nodes take the four shapes, one each');
    const entry = flow.nodes.find((n) => n.id === flow.entry) as { settings?: unknown; type: string };
    equal(entry.settings, undefined, 'the entry node declares no settings, so what the schema sees is the TYPE`s defaults alone');
    const d = await doc();
    ok(d.nodeTypes[entry.type]!.settings !== undefined, 'and the corpus`s Scorer declares defaults, so the merge road is in the corpus');
    accepted(flow, corpusRegistry(d), 'typed.flow.json against registry.json');
  });
  test('pooled.flow.json — a node on a NAMED instance of its type, and one on the default by name — validates clean, and its pool is an instance of its type in the document', async () => {
    const flow = JSON.parse(await readText(`${ROOT}spec/examples/valid/pooled.flow.json`)) as FlowDefinition;
    const d = await doc();
    accepted(flow, corpusRegistry(d), 'pooled.flow.json against registry.json');
    const pooled = flow.nodes.filter((n) => n.kind === 'task' && (n as { pool?: string }).pool !== undefined) as unknown as { id: string; type: string; pool: string }[];
    equal(pooled.map((n) => n.id).sort(), ['publish', 'score'], 'two nodes name a pool');
    for (const n of pooled) {
      const inst = d.pools[n.pool];
      ok(n.pool === n.type || (inst !== undefined && inst.type === n.type), `${n.id}: pool "${n.pool}" is the default or an instance of ${n.type}`);
    }
    ok(pooled.some((n) => n.pool !== n.type) && pooled.some((n) => n.pool === n.type), 'one named instance and one default-by-name — the pair FD-V38 accepts both halves of');
  });
  test('section 2`s key table declares `type`, `pool` and `settings` on the task row and NOT `workerType`, and FD-V17 accepts exactly those — obligation (e)`s third shape', async () => {
    const spec = await readText(`${ROOT}spec/flow-definition.md`);
    const row = spec.split('\n').find((l) => l.startsWith('| `task` |')) ?? '';
    const cell = row.split('|')[2] ?? '';
    const documented = [...cell.matchAll(/`([A-Za-z]+)\??`/g)].map((m) => m[1]!);
    ok(documented.includes('type') && documented.includes('pool') && documented.includes('settings'), `the task row lists the three keys: ${documented.join(', ')}`);
    ok(!documented.includes('workerType'), 'and not the retired one');
    ok(NODE_KEYS_DECLARED.task!.includes('type') && NODE_KEYS_DECLARED.task!.includes('pool') && NODE_KEYS_DECLARED.task!.includes('settings'), 'and the validator declares all three');
    ok(!NODE_KEYS_DECLARED.task!.includes('workerType'), 'and does not declare workerType');
    for (const key of ['type', 'pool', 'settings']) ok(spec.split('\n').some((l) => l.startsWith(`| \`${key}\` |`)), `section 2\`s typed-node subsection has a \`${key}\` row`);
  });
  test('the three invalid cases are the three refusals, each named for its rule and refusing for it against the corpus registry — and the two retired cases are gone', async () => {
    const reg = corpusRegistry(await doc());
    for (const [rule, file] of [['FD-V32', 'FD-V32--type-not-in-registry'], ['FD-V33', 'FD-V33--settings-the-type-refuses'], ['FD-V38', 'FD-V38--pool-not-an-instance-of-the-type']] as const) {
      const flow = JSON.parse(await readText(`${ROOT}spec/examples/invalid/${file}.flow.json`)) as FlowDefinition;
      equal(violatedRules(validateDefinition(flow, reg)), [rule], `${file} is refused for ${rule} and nothing else`);
    }
    for (const gone of ['FD-V5--unknown-worker-type', 'FD-V34--type-beside-worker-type']) {
      let missing = false;
      try { await readText(`${ROOT}spec/examples/invalid/${gone}.flow.json`); } catch { missing = true; }
      ok(missing, `${gone} retired with workerType`);
    }
  });
  test('the scorer schema this suite refuses against IS registry.json`s — a literal is a claim about the document', async () => {
    const d = await doc();
    equal(d.workers.scorer!.settingsSchema, SCORER_SCHEMA, 'the corpus worker`s settingsSchema, verbatim');
  });
});
