/**
 * **What a GATE is, at the definition — every refusal with its accepted neighbour, the default route
 * against its unsafe readings, and `distinct` registered through the ONE interface a second type is
 * registered through** — `spec/flow-definition.md` v0.23 (section 2's `gate` subsection, section 3's
 * *Gate types*, section 5's `FD-V39`-`FD-V41`),
 * [ADR 0066](../../doc/decisions/0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md),
 * [W92](../../doc/work-items/w92-what-a-gate-is.md).
 *
 * **Every expected value is a rule id or a route name read from the spec's rule text**, never from the
 * validator's output. The rule selects three things and each is asserted where its well-formed WRONG
 * selection gives a different answer (`doc/workflow.md` section 5 rule 8 obligation (a), v0.23):
 *
 * | selection | right | wrong, and the fixture where it differs |
 * |---|---|---|
 * | the route an edge with no `route` carries | the type's DEFAULT | *every* route — one routeless edge would satisfy `distinct` alone; the FIRST route — `threshold` below declares `['low', 'high']` with default `high`, so its first and its default DIFFER |
 * | the edge a route is wired by | exactly one, by name | the first edge, any edge — `threshold` with two routes and ONE edge is refused |
 * | the value a gate hands on | what reached it | its settings, the predecessor's whole record — the wiring check judges the node after a gate against the producer's OUTPUT schema, and a consumer requiring the gate's setting name `key` is `no` |
 *
 * **The gate stands in THREE shapes** (obligation (a)'s shapes clause): after a top-level task, inside a
 * `fanout` branch, and inside a `map` branch — the maintainer's own (P24) — and every refusal is asserted
 * on all three, reported at the gate's own id.
 */
import { collected, equal, ok, readText, ROOT, suite, throws } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import {
  BUILT_IN_GATE_TYPES, distinct, GATE_TYPE_KEYS, gateTypeCollisions, gateTypeProblem, gateTypesOf, KEY_PATH_RE, keyPathProblem,
  NODE_KEYS_DECLARED, readKeyPath, validateDefinition, violatedRules,
} from '../../src/definition/validate.ts';
import { checkRegistry, GateTypeRefused, NameCollision } from '../../src/definition/registry.ts';
import { allRegions, branchPathOf, buildGraph } from '../../src/definition/regions.ts';
import { checkWiring, type WiringRegistry } from '../../src/definition/wiring.ts';
import { Driver, InvalidDefinition } from '../../src/driver/driver.ts';
import { liveToken } from '../../src/fold/policies.ts';
import type { Edge, FlowDefinition, GateContext, GateType, JsonSchema, Registry } from '../../src/definition/types.ts';
import { PATH_LANGUAGE } from '../scheduler/fake-language.ts';

const SUITE = 'W92 — what a GATE is: FD-V39 to FD-V41, the default route, and the one interface';

/**
 * **A SECOND gate type, registered the way `distinct` is** — through `Registry.gateTypes`, on the same
 * interface. Its DEFAULT route is `high` and its FIRST is `low`, which is the fixture where *the default*
 * and *the first* differ; `distinct`'s coincide (`first`), so no fixture over `distinct` alone can tell
 * the two readings apart.
 */
const threshold: GateType = {
  routes: ['low', 'high'],
  defaultRoute: 'high',
  settingsSchema: { type: 'object', required: ['limit'], properties: { limit: { type: 'number' }, key: { type: 'string' } }, additionalProperties: false },
  fn: (ctx) => (typeof ctx.key === 'number' && ctx.key < (ctx.settings.limit as number) ? 'low' : 'high'),
};

const registry: Registry = {
  predicates: new Set<string>(),
  ...typesFor(['IngestWorker', 'ExtractWorker', 'ScoreWorker', 'PublishWorker']),
  gateTypes: { threshold },
};

/** A `distinct` gate's three routes, fully wired, the default by OMISSION. */
const DISTINCT_EDGES: Edge[] = [{ to: 'setup' }, { route: 'duplicate', to: 'dropped' }, { route: 'nokey', to: 'dropped' }];
const GATE = (extra: Record<string, unknown> = {}) => ({ id: 'dedupe', kind: 'gate', type: 'distinct', settings: { key: 'series.id' }, edges: DISTINCT_EDGES, ...extra });

/** The three shapes, each a function from the gate node under test to a whole document; the gate is `dedupe` in all three. */
const SHAPES: readonly [string, (gate: Record<string, unknown>) => FlowDefinition][] = [
  ['after a top-level task', (gate) => ({
    flowId: 'gate-top', version: 1, entry: 'identify',
    nodes: [
      { id: 'identify', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'dedupe' }] },
      gate,
      { id: 'setup', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'done' }] },
      { id: 'dropped', kind: 'end', outcome: 'dropped' },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  }) as unknown as FlowDefinition],
  ['inside a fanout branch', (gate) => ({
    flowId: 'gate-fanout', version: 1, entry: 'ingest',
    nodes: [
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['identify', 'other'] },
      { id: 'identify', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'dedupe' }] },
      gate,
      { id: 'setup', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'dropped', kind: 'end', outcome: 'dropped' },
      { id: 'other', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  }) as unknown as FlowDefinition],
  ['inside a map branch — the maintainer`s', (gate) => ({
    flowId: 'gate-map', version: 1, entry: 'ingest',
    nodes: [
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'map', over: 'files', branch: 'identify' },
      { id: 'identify', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'dedupe' }] },
      gate,
      { id: 'setup', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'dropped', kind: 'end', outcome: 'dropped' },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  }) as unknown as FlowDefinition],
];

/** The findings AT the gate (or one of its edges), as sorted rule ids — what a refusal must be reported against. */
const at = (d: FlowDefinition, r: Registry = registry) => validateDefinition(d, r).filter((f) => f.at === 'dedupe' || (f.at ?? '').startsWith('dedupe#'));
const rulesAt = (d: FlowDefinition, r: Registry = registry) => [...new Set(at(d, r).map((f) => f.rule))].sort();
/**
 * **Which region the gate stands in, read off the DOCUMENT** — `-` for none, else the opener's kind. Each helper
 * below asserts the shapes it visited are all three, so narrowing a loop to one shape is RED rather than a
 * suite that quietly asserts less (rule 8 obligation (d): a membership, computed from what was built, not a count).
 */
const regionKindOf = (d: FlowDefinition): string => {
  const rs = allRegions(buildGraph(d), d).filter((r) => r.members.has('dedupe'));
  return rs.length ? rs[0]!.opensWith : '-';
};
const ALL_SHAPES = ['-', 'fanout', 'map'];
/** Every shape, one expected rule set: the refusal is the rule's on EVERY shape, not on the one the feature was built for. */
const everyShape = (gate: Record<string, unknown>, expected: string[], why: string, r: Registry = registry) => {
  const visited: string[] = [];
  for (const [shape, build] of SHAPES) {
    const d = build(gate);
    visited.push(regionKindOf(d));
    equal(rulesAt(d, r), expected, `${why} — ${shape}: ${at(d, r).map((f) => `${f.rule}@${f.at}: ${f.detail}`).join(' | ')}`);
  }
  equal(visited.sort(), ALL_SHAPES, `${why} — asserted where the gate stands in no region, in a fanout and in a map`);
};
/** And the whole document clean where the gate is — the ACCEPTED neighbour of each refusal. */
const cleanEveryShape = (gate: Record<string, unknown>, why: string, r: Registry = registry) => {
  const visited: string[] = [];
  for (const [shape, build] of SHAPES) {
    const d = build(gate);
    visited.push(regionKindOf(d));
    const fs = validateDefinition(d, r);
    equal(fs.map((f) => `${f.rule}@${f.at}`), [], `${why} — ${shape}`);
  }
  equal(visited.sort(), ALL_SHAPES, `${why} — asserted where the gate stands in no region, in a fanout and in a map`);
};

/**
 * **The cases, declared by NAME and named AGAIN at each call site** — Q382, closed by W132, as
 * `test/driver/gate.test.ts` has done since W93. A name read by INDEX from this list could run two cases
 * under each other's names with nothing able to see it; written twice, the name stands beside the body it
 * names, and a case renamed or deleted at its call site fails the membership case at the end.
 */
const DECLARED_CASES = [
  'the kind: FD-V24 accepts `gate`, and FD-V23, FD-V17 and FD-V21 read its key table',
  'FD-V39 — an unregistered type, a type that is not a GateType, and a type registered twice; each beside its accepted neighbour',
  'FD-V40 — settings a plain object, the key a KEY PATH (the library`s grammar), and the type`s settingsSchema',
  'FD-V41 — every declared route wired by EXACTLY ONE edge, an edge with no route carrying the DEFAULT',
  'FD-V41 — the default route is the TYPE`s default and not its first route, nor every route',
  'FD-V41 — a gate`s edge carries to and route and nothing else, and route on any other node`s edge is refused',
  'the corpus: gated-map is valid, and the three invalid cases are refused naming their own rule',
  'where a gate stands: a region member like a task, disjunctive out-arcs, no output, and never a branch entry',
  'the value a gate hands on is what reached it — and since W99 the wiring check refines it by what the route guarantees',
  'distinct is registered THROUGH the interface: one predicate, one registry road, a second type the same way',
  'GateTypeRefused and NameCollision at construction — each clause of gateTypeProblem, both ways',
  'distinct`s decision: first, duplicate and nokey, keys compared as JSON values, one memory',
  'readKeyPath — own keys of plain objects, no index, and anything else is nothing',
  'new Driver CONSTRUCTS a gate flow since W93 — ADR 0066 rule 7 LIFTED — an INVALID one still reports its FD-V, and a consumer type arrives by DriverOptions.gateTypes',
  'the spec`s tables are the code`s lists, both ways — the gate`s keys, the interface`s members, distinct`s routes',
  'what a gate carries on EVERY route, with a plain and a transformed consumer, and from an entry gate',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test('the kind: FD-V24 accepts `gate`, and FD-V23, FD-V17 and FD-V21 read its key table', () => {
    cleanEveryShape(GATE(), 'a fully wired distinct gate is valid');
    for (const k of ['Gate', 'GATE', 'decision', 'gates']) {
      equal(violatedRules(validateDefinition(SHAPES[0]![1](GATE({ kind: k })), registry)).includes('FD-V24'), true, `kind ${JSON.stringify(k)} is still FD-V24`);
    }
    // FD-V23 — `type` and `edges` are REQUIRED on a gate (section 5's enumeration, v0.23); `settings` is not.
    const noType = GATE(); delete (noType as Record<string, unknown>).type;
    everyShape(noType, ['FD-V23'], 'a gate with no type is FD-V23, and no FD-V39 is asked of a name that is not there');
    const noEdges = GATE(); delete (noEdges as Record<string, unknown>).edges;
    ok(rulesAt(SHAPES[0]![1](noEdges)).includes('FD-V23'), 'a gate with no edges is FD-V23');
    // FD-V17 — a key a gate does not declare, each a key a TASK does declare (the likely mistake).
    for (const k of ['needs', 'optional', 'transform', 'pool', 'retryPolicy', 'workerGroups', 'when']) {
      everyShape(GATE({ [k]: k === 'optional' ? true : k === 'needs' ? { a: '.' } : 'x' }), ['FD-V17'], `a gate carrying "${k}" is FD-V17`);
    }
    // FD-V21 — `type` not a string.
    everyShape(GATE({ type: 5 }), ['FD-V21'], 'type 5 is FD-V21, and nothing asks for the routes of a type that is not a name');
  });

  test('FD-V39 — an unregistered type, a type that is not a GateType, and a type registered twice; each beside its accepted neighbour', () => {
    everyShape(GATE({ type: 'unique' }), ['FD-V39'], 'an unregistered gate type is FD-V39 ALONE — the routes of a type that does not exist are not asked');
    const detail = at(SHAPES[0]![1](GATE({ type: 'unique' })))[0]!.detail;
    ok(detail.includes('"distinct"') && detail.includes('"threshold"'), `the message names the built-ins and the registry's: ${detail}`);
    // A NODE type's name is not a gate type's: the two namespaces are separate.
    everyShape(GATE({ type: 'ScoreWorker' }), ['FD-V39'], 'a node type named as a gate type is FD-V39');
    // Registered and not a GateType — reached through a flow, reported on the gate (FD-V36's precedent).
    const broken = { ...registry, gateTypes: { threshold, lax: { ...threshold, defaultRoute: 'medium' } } };
    everyShape(GATE({ type: 'lax', settings: { limit: 1 }, edges: [{ to: 'setup' }, { route: 'low', to: 'dropped' }] }), ['FD-V39'], 'a registered type whose default is not one of its routes is FD-V39', broken);
    // Registered TWICE — a consumer `distinct` beside the built-in is refused, never merged.
    const twice = { ...registry, gateTypes: { distinct: threshold } };
    everyShape(GATE(), ['FD-V39'], 'a consumer type named "distinct" makes every gate naming distinct FD-V39', twice);
    // …and in the OTHER shape the registry reads, a Map — the adequacy reader's #9: the collision was bound only on a
    // plain object, and `gateTypeCollisions` reading `Object.keys` of a Map dropped the consumer's `distinct` in silence.
    everyShape(GATE(), ['FD-V39'], 'the same collision registered as a Map', { ...registry, gateTypes: new Map([['distinct', threshold]]) });
    // The accepted neighbours: the consumer's registered type, and distinct with no registry set at all.
    cleanEveryShape(GATE({ type: 'threshold', settings: { limit: 3, key: 'score' }, edges: [{ to: 'setup' }, { route: 'low', to: 'dropped' }] }), 'a registered consumer type, fully wired');
    cleanEveryShape(GATE(), 'distinct against a registry that declares NO gate types — absent means the built-ins', { ...registry, gateTypes: undefined });
  });

  test('FD-V40 — settings a plain object, the key a KEY PATH (the library`s grammar), and the type`s settingsSchema', () => {
    everyShape(GATE({ settings: ['series'] }), ['FD-V40'], 'settings an array is FD-V40');
    everyShape(GATE({ settings: 'series.id' }), ['FD-V40'], 'settings a string is FD-V40');
    // The KEY PATH — P24 stop-and-ask (d): dotted object keys in FD-V16's charset, no index, wildcard or expression.
    for (const key of ['files[0].series', 'a..b', '.a', 'a.', 'a.*', '$.a', 'a b', 'series/id', 'x'.repeat(65), 'a.' + 'x'.repeat(65), 'a.b.' + 'x'.repeat(65)]) {
      everyShape(GATE({ settings: { key } }), ['FD-V40'], `key ${JSON.stringify(key)} is outside the grammar`);
    }
    for (const key of ['series', 'series.id', 'a_b-c.d9.E', 'x'.repeat(64) + '.y']) cleanEveryShape(GATE({ settings: { key } }), `key ${JSON.stringify(key)} is a key path`);
    // The grammar is the LIBRARY's, so it is asked of a type that is not registered too — beside FD-V39.
    everyShape(GATE({ type: 'unique', settings: { key: 'files[0]' } }), ['FD-V39', 'FD-V40'], 'a bad key beside an unknown type reports both');
    // …and of a consumer type whose schema would accept any string there.
    everyShape(GATE({ type: 'threshold', settings: { limit: 1, key: 'a[0]' }, edges: [{ to: 'setup' }, { route: 'low', to: 'dropped' }] }), ['FD-V40'], 'threshold`s schema admits any string key; the grammar still refuses an index');
    // The type's settingsSchema — distinct requires a non-empty `key` and nothing else.
    everyShape(GATE({ settings: undefined }), ['FD-V40'], 'distinct with NO settings: its schema requires key, over {} ');
    everyShape(GATE({ settings: { key: 'series', window: 3 } }), ['FD-V40'], 'distinct refuses a key its schema does not declare');
    everyShape(GATE({ settings: { key: 5 } }), ['FD-V40'], 'a number is not a key path (and distinct`s schema says string)');
    // The schema is asked only of a USABLE type — threshold's `limit` is required, distinct's is not.
    everyShape(GATE({ type: 'threshold', settings: { key: 'score' }, edges: [{ to: 'setup' }, { route: 'low', to: 'dropped' }] }), ['FD-V40'], 'threshold without limit is refused by ITS schema, not distinct`s');
    cleanEveryShape(GATE({ type: 'threshold', settings: { limit: 2 }, edges: [{ to: 'setup' }, { route: 'low', to: 'dropped' }] }), 'a type whose schema does not require key needs none');
    // `settings: null` on a type with NO settingsSchema — where only the SHAPE clause can refuse it (the adequacy
    // reader's #7: on distinct and threshold the schema refuses `{}` anyway, so the null clause had no observer).
    const loose: Registry = { ...registry, gateTypes: { loose: { routes: threshold.routes, defaultRoute: threshold.defaultRoute, fn: threshold.fn } } };
    const looseEdges = [{ to: 'setup' }, { route: 'low', to: 'dropped' }];
    everyShape(GATE({ type: 'loose', settings: null, edges: looseEdges }), ['FD-V40'], 'settings null is not a plain object, on a schema-less type', loose);
    cleanEveryShape(GATE({ type: 'loose', settings: undefined, edges: looseEdges }), 'and ABSENT settings on it are {} and valid', loose);
  });

  test('FD-V41 — every declared route wired by EXACTLY ONE edge, an edge with no route carrying the DEFAULT', () => {
    // One edge, the default by omission — distinct's duplicate and nokey unwired. TWO findings, one per route.
    for (const [shape, build] of SHAPES) {
      const fs = at(build(GATE({ edges: [{ to: 'setup' }] })));
      equal(fs.map((f) => f.rule), ['FD-V41', 'FD-V41'], `${shape}: two unwired routes, two findings`);
      ok(fs.some((f) => f.detail.includes('"duplicate"')) && fs.some((f) => f.detail.includes('"nokey"')), `${shape}: each names its route — ${fs.map((f) => f.detail).join(' | ')}`);
    }
    // A route wired twice — two edges for `nokey`.
    everyShape(GATE({ edges: [...DISTINCT_EDGES, { route: 'nokey', to: 'dropped' }] }), ['FD-V41'], 'nokey wired by two edges');
    // An edge naming a route the type does not declare — reported at the EDGE.
    const d = SHAPES[2]![1](GATE({ edges: [...DISTINCT_EDGES, { route: 'second', to: 'dropped' }] }));
    equal(at(d).map((f) => `${f.rule}@${f.at}`), ['FD-V41@dedupe#edge3'], 'an undeclared route is refused at its own edge');
    // A gate with an empty edge list: every route unwired.
    equal(at(SHAPES[0]![1](GATE({ edges: [] }))).length, 3, 'edges: [] leaves all three of distinct`s routes unwired');
    // The accepted neighbour, with the default named explicitly rather than omitted — the same wiring.
    cleanEveryShape(GATE({ edges: [{ route: 'first', to: 'setup' }, { route: 'duplicate', to: 'dropped' }, { route: 'nokey', to: 'dropped' }] }), 'first named explicitly is the default stated, and valid');
  });

  test('FD-V41 — the default route is the TYPE`s default and not its first route, nor every route', () => {
    // **threshold declares ['low', 'high'] and its DEFAULT is 'high'** — the fixture where the default and the
    // first differ. Each case below is valid or refused under exactly one of the three readings.
    const th = (edges: Edge[]) => GATE({ type: 'threshold', settings: { limit: 1 }, edges });
    ok(threshold.routes[0] !== threshold.defaultRoute, 'the ARRANGEMENT: threshold`s first route is not its default');
    // (1) a routeless edge + `low` — valid ONLY when the routeless edge carries `high`, the DEFAULT.
    cleanEveryShape(th([{ to: 'setup' }, { route: 'low', to: 'dropped' }]), 'routeless + low: the routeless edge carries the DEFAULT, high');
    // (2) a routeless edge + `high` — valid under the FIRST-route reading (routeless = low), refused under the right one.
    everyShape(th([{ to: 'setup' }, { route: 'high', to: 'dropped' }]), ['FD-V41'], 'routeless + high: high is wired twice and low not at all');
    // (3) ONE routeless edge — valid under the EVERY-route reading, refused under the right one: a gate with two
    // routes and one edge.
    const one = SHAPES[0]![1](th([{ to: 'setup' }]));
    equal(at(one).map((f) => f.rule), ['FD-V41'], 'a gate with two routes and ONE edge is refused');
    ok(at(one)[0]!.detail.includes('"low"'), `and the route it names is low, the one the default does not cover — ${at(one)[0]!.detail}`);
    // (4) and for distinct the same: one routeless edge must NOT carry duplicate — two findings, as above.
    equal(at(SHAPES[0]![1](GATE({ edges: [{ to: 'setup' }] }))).length, 2, 'distinct`s routeless edge carries first alone');
  });

  test('FD-V41 — a gate`s edge carries to and route and nothing else, and route on any other node`s edge is refused', () => {
    for (const [k, v] of [['when', 'isLow'], ['on', ['done']], ['needs', { a: 'identify' }]] as const) {
      const edges: Edge[] = [{ to: 'setup', [k]: v } as Edge, DISTINCT_EDGES[1]!, DISTINCT_EDGES[2]!];
      for (const [shape, build] of SHAPES) {
        const fs = at(build(GATE({ edges })));
        ok(fs.some((f) => f.rule === 'FD-V41' && f.at === 'dedupe#edge0' && f.detail.includes(`"${k}"`)), `${shape}: "${k}" on a gate's edge is FD-V41 at the edge — ${fs.map((f) => `${f.rule}@${f.at}`).join(', ')}`);
        ok(!fs.some((f) => f.rule === 'FD-V17'), `${shape}: and NOT FD-V17 — route is a declared edge key and FD-V17's text does not move`);
      }
    }
    everyShape(GATE({ edges: [{ to: 'setup', route: 5 } as unknown as Edge, DISTINCT_EDGES[1]!, DISTINCT_EDGES[2]!] }), ['FD-V41'], 'a route that is not a string');
    // `route` on the edge of a node that is NOT a gate — a task's, and a join's.
    const onTask = SHAPES[1]![1](GATE());
    (onTask.nodes.find((n) => n.id === 'identify') as { edges: Edge[] }).edges = [{ to: 'dedupe', route: 'first' }];
    equal(validateDefinition(onTask, registry).map((f) => `${f.rule}@${f.at}`), ['FD-V41@identify#edge0'], 'route on a TASK`s edge is FD-V41 at that edge');
    const onJoin = SHAPES[1]![1](GATE());
    (onJoin.nodes.find((n) => n.id === 'collect') as { edges: Edge[] }).edges = [{ to: 'done', route: 'first' }];
    equal(validateDefinition(onJoin, registry).map((f) => `${f.rule}@${f.at}`), ['FD-V41@collect#edge0'], 'route on a JOIN`s edge is FD-V41 at that edge');
  });

  test('the corpus: gated-map is valid, and the three invalid cases are refused naming their own rule', async () => {
    const load = async (p: string) => JSON.parse(await readText(`${ROOT}spec/examples/${p}`)) as FlowDefinition;
    const corpusReg: Registry = { predicates: new Set(), ...typesFor(['IngestWorker', 'ExtractWorker', 'ScoreWorker', 'PublishWorker']) };
    const valid = await load('valid/gated-map.flow.json');
    equal(validateDefinition(valid, corpusReg), [], 'gated-map.flow.json is valid against the built-ins alone');
    const g = valid.nodes.find((n) => n.kind === 'gate') as unknown as { type: string; settings: { key: string }; edges: Edge[] };
    ok(g.type === 'distinct' && g.settings.key.includes('.') && g.edges.some((e) => e.route === undefined), 'and it carries distinct, a DOTTED key, and the default by omission');
    for (const [file, rule] of [['FD-V39--gate-type-not-registered', 'FD-V39'], ['FD-V40--gate-key-path-with-an-index', 'FD-V40'], ['FD-V41--a-declared-route-with-no-edge', 'FD-V41']] as const) {
      const rules = violatedRules(validateDefinition(await load(`invalid/${file}.flow.json`), corpusReg));
      equal(rules, [rule], `${file}.flow.json is refused by exactly its own rule`);
    }
  });

  test('where a gate stands: a region member like a task, disjunctive out-arcs, no output, and never a branch entry', () => {
    // Region membership: a gate inside a map branch is a member of the map's region, as a task is.
    const d = SHAPES[2]![1](GATE());
    const regions = allRegions(buildGraph(d), d);
    ok(regions[0]!.members.has('dedupe') && regions[0]!.members.has('dropped'), 'the gate and its drop are members of region(split)');
    throws(() => branchPathOf(regions, 'dedupe'), 'ID-R6', 'a gate inside a map region has no path without an item index — ID-R6, as a task');
    equal(branchPathOf(regions, 'dedupe', new Map([['split', 2]])), '2', 'and item 2`s path with one');
    const f = SHAPES[1]![1](GATE());
    equal(branchPathOf(allRegions(buildGraph(f), f), 'dedupe'), '0', 'inside fanout branch 0, the gate`s path is 0');
    // A gate's out-arcs are DISJUNCTIVE — exactly one route is taken — so a node after one route is not certain
    // for a node after another: FD-V29 refuses an unconditional reference across the gate, and `?` is the fix.
    const across = SHAPES[0]![1](GATE());
    (across.nodes.find((n) => n.id === 'setup') as unknown as { needs: unknown }).needs = { id: 'identify' };
    equal(validateDefinition(across, registry), [], 'the task BEFORE the gate is certain for every route');
    // `publish` is reachable by `first` (through setup) AND by `duplicate` (through alt): naming `setup` bare is
    // FD-V29, because a run reaches publish on the duplicate route without setup having run; `setup?` is valid.
    const diamond = (ref: string) => ({ flowId: 'dj', version: 1, entry: 'identify', nodes: [
      { id: 'identify', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'dedupe' }] },
      GATE({ edges: [{ to: 'setup' }, { route: 'duplicate', to: 'alt' }, { route: 'nokey', to: 'dropped' }] }),
      { id: 'setup', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'publish' }] },
      { id: 'alt', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'publish' }] },
      { id: 'publish', kind: 'task', type: 'PublishWorker', needs: { s: ref }, edges: [{ to: 'done' }] },
      { id: 'dropped', kind: 'end', outcome: 'dropped' },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ] }) as unknown as FlowDefinition;
    equal(violatedRules(validateDefinition(diamond('setup'), registry)), ['FD-V29'], 'a gate`s routes are DISJUNCTIVE: setup is not certain for publish');
    equal(validateDefinition(diamond('setup?'), registry), [], 'and the conditional form is the fix');
    equal(validateDefinition(diamond('identify'), registry), [], 'while the node before the gate is certain on every route');
    // A gate produces NO output — a reference to one is FD-V27.
    const toGate = SHAPES[0]![1](GATE());
    (toGate.nodes.find((n) => n.id === 'setup') as unknown as { needs: unknown }).needs = { g: 'dedupe' };
    equal(validateDefinition(toGate, registry).map((f) => `${f.rule}@${f.at}`), ['FD-V27@setup'], 'a reference to a gate is FD-V27 — only a task produces an output');
    // Never a branch entry — FD-V9 and FD-V25, unchanged.
    const branchGate = { flowId: 'bg', version: 1, entry: 'ingest', nodes: [
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'map', over: 'files', branch: 'dedupe' },
      GATE({ edges: [{ to: 'collect' }, { route: 'duplicate', to: 'dropped' }, { route: 'nokey', to: 'dropped' }] }),
      { id: 'dropped', kind: 'end', outcome: 'dropped' },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ] } as unknown as FlowDefinition;
    equal(violatedRules(validateDefinition(branchGate, registry)), ['FD-V25'], 'a gate as a map`s branch is FD-V25 — a branch entry is a task');
    // An ENTRY gate is not refused — FD-V3 refuses only a join or an end.
    const entry = { flowId: 'eg', version: 1, entry: 'dedupe', nodes: [
      GATE(), { id: 'setup', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'done' }] },
      { id: 'dropped', kind: 'end', outcome: 'dropped' }, { id: 'done', kind: 'end', outcome: 'completed' },
    ] } as unknown as FlowDefinition;
    equal(validateDefinition(entry, registry), [], 'a gate may be the entry');
  });

  test('the value a gate hands on is what reached it — and since W99 the wiring check refines it by what the route guarantees', async () => {
    // Producer: `identify` emits { series: { id } }. The node after the gate is judged against THAT, so a consumer
    // requiring `series` fits and one requiring `key` — the gate's own SETTING name — does not.
    const out = { type: 'object', required: ['series'], properties: { series: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } } }, additionalProperties: false, examples: [{ series: { id: 's1' } }] };
    const reg = (consumerIn: JsonSchema): WiringRegistry => ({ ...typesFor(['IngestWorker', 'ScoreWorker', 'PublishWorker']),
      workers: { ...typesFor(['IngestWorker', 'ScoreWorker', 'PublishWorker']).workers, x: { url: 'test://x', outputSchema: out }, c: { url: 'test://c', inputSchema: consumerIn, outputSchema: { type: 'object', examples: [{}] } } },
      nodeTypes: { ...typesFor(['IngestWorker', 'ScoreWorker', 'PublishWorker']).nodeTypes, ExtractWorker: { worker: 'x' }, ScoreWorker: { worker: 'c' } } });
    for (const [shape, build] of SHAPES) {
      const d = build(GATE());
      const fitsR = await checkWiring(reg({ type: 'object', required: ['series'] }), d);
      const v = fitsR.verdicts.find((x) => x.consumer === 'setup');
      ok(v !== undefined, `${shape}: the arc after the gate is IN the report — before W92 it vanished`);
      equal([v!.producer, v!.kind], ['identify', 'fits'], `${shape}: setup is judged against identify's output, through the gate`);
      const noR = await checkWiring(reg({ type: 'object', required: ['key'] }), d);
      equal(noR.verdicts.find((x) => x.consumer === 'setup')!.kind, 'no', `${shape}: a consumer requiring the gate's SETTING name is no — the gate hands on what reached it, not its settings`);
    }
    // A gate routing into a join carries its branch's key into the record — the fanout shape, branch 0.
    const f = SHAPES[1]![1](GATE({ edges: [{ to: 'collect' }, { route: 'duplicate', to: 'dropped' }, { route: 'nokey', to: 'dropped' }] }));
    // The join must feed a TASK for the record to have a consumer to be judged against — the shape's feeds an end.
    f.nodes = f.nodes.filter((n) => n.id !== 'setup').map((n) => (n.id === 'collect' ? { ...n, edges: [{ to: 'after' }] } : n)) as typeof f.nodes;
    f.nodes.push({ id: 'after', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'done' }] } as (typeof f.nodes)[number]);
    // What the record carries is observed through `fits` (a verdict carries a sample only for a transformed arc):
    // a consumer DESCRIBING key "0" meets the producer's shape there only if the record HAS branch 0's key —
    // an absent key is read as never emitted (the check's stated leniency) and fits whatever is described.
    const rec = async (zero: JsonSchema) => (await checkWiring(reg({ type: 'object', properties: { '0': zero } }), f)).verdicts.find((x) => x.shape === 'record')!;
    const asString = await rec({ type: 'string' });
    equal([asString.consumer, asString.kind], ['after', 'no'], `branch 0's key IS in the record, THROUGH the gate — described as a string it is no: ${asString.why}`);
    ok(asString.why.includes('$.0'), 'and the reason is at $.0');
    equal((await rec({ type: 'object', required: ['series'] })).kind, 'fits', 'and under it is what reached the gate — identify`s output, which requires series — not the gate`s settings');
    // An ENTRY gate: the walk passes through it to every route's target.
    const entry = { flowId: 'eg', version: 1, entry: 'dedupe', nodes: [GATE(), { id: 'setup', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'done' }] },
      { id: 'dropped', kind: 'end', outcome: 'dropped' }, { id: 'done', kind: 'end', outcome: 'completed' }] } as unknown as FlowDefinition;
    equal((await checkWiring(reg({ type: 'object' }), entry)).entry, ['setup'], 'an entry gate does not end the walk');
  });

  test('distinct is registered THROUGH the interface: one predicate, one registry road, a second type the same way', () => {
    equal([...gateTypesOf(undefined).keys()], ['distinct'], 'absent: the built-ins alone, and distinct is the only one');
    equal(Object.keys(BUILT_IN_GATE_TYPES), ['distinct'], 'the built-in set');
    equal(gateTypeProblem(distinct), null, 'distinct passes the SAME predicate a consumer`s type passes');
    equal(gateTypeProblem(threshold), null, 'and so does the second type registered here');
    equal([...gateTypesOf({ threshold }).keys()], ['distinct', 'threshold'], 'a consumer`s type is ADDED beside the built-ins');
    equal(gateTypesOf({ distinct: threshold }).get('distinct'), distinct, 'a consumer type named as a built-in is NOT merged — the built-in stays');
    equal(gateTypeCollisions({ distinct: threshold, threshold }), ['distinct'], 'and the collision is named');
    // **A copy of distinct under ANOTHER name validates exactly as distinct does** — nothing names distinct.
    const copy: Registry = { ...registry, gateTypes: { unique: { ...distinct } } };
    for (const edges of [DISTINCT_EDGES, [{ to: 'setup' }], [...DISTINCT_EDGES, { route: 'nokey', to: 'dropped' }]] as Edge[][]) {
      for (const settings of [{ key: 'series.id' }, { key: 'a[0]' }, {}]) {
        const a = rulesAt(SHAPES[2]![1](GATE({ edges, settings })));
        const b = rulesAt(SHAPES[2]![1](GATE({ type: 'unique', edges, settings })), copy);
        equal(b, a, `the copy and distinct agree on ${JSON.stringify({ edges: edges.length, settings })}: ${a.join(',') || 'clean'}`);
      }
    }
    // As a Map, too — the registry reads either shape.
    cleanEveryShape(GATE({ type: 'threshold', settings: { limit: 3 }, edges: [{ to: 'setup' }, { route: 'low', to: 'dropped' }] }), 'a Map-shaped gateTypes', { ...registry, gateTypes: new Map([['threshold', threshold]]) });
  });

  test('GateTypeRefused and NameCollision at construction — each clause of gateTypeProblem, both ways', () => {
    checkRegistry({ gateTypes: { threshold } });
    checkRegistry({});
    ok(true, 'the accepted neighbours: a well-formed consumer type, and none');
    const refusedBy = (t: unknown, says: string) => {
      let err: unknown;
      try { checkRegistry({ gateTypes: { bad: t as GateType } }); } catch (e) { err = e; }
      ok(err instanceof GateTypeRefused && (err as GateTypeRefused).at === 'bad' && (err as Error).message.includes(says), `GateTypeRefused naming "bad" and ${JSON.stringify(says)}: ${String(err)}`);
      ok(gateTypeProblem(t) !== null, 'and gateTypeProblem agrees');
    };
    refusedBy(5, 'is an object');
    refusedBy({ ...threshold, extra: 1 }, '"extra"');
    refusedBy({ ...threshold, routes: [] }, 'non-empty');
    refusedBy({ ...threshold, routes: ['low', 'low'], defaultRoute: 'low' }, 'repeats');
    refusedBy({ ...threshold, routes: ['low', 'hi gh'], defaultRoute: 'low' }, '"hi gh"');
    refusedBy({ ...threshold, routes: ['low', 5], defaultRoute: 'low' }, 'route 5');   // the adequacy reader's #6: a regex coerces 5 to "5"
    refusedBy({ ...threshold, defaultRoute: 'medium' }, 'defaultRoute');
    refusedBy({ ...threshold, settingsSchema: { type: 'object', pattern: 'x' } }, 'settingsSchema');
    refusedBy({ ...threshold, fn: 'low' }, 'fn');
    let err: unknown;
    try { checkRegistry({ gateTypes: { distinct: threshold } }); } catch (e) { err = e; }
    ok(err instanceof NameCollision && (err as NameCollision).at === 'distinct', `a consumer type named "distinct" is NameCollision: ${String(err)}`);
    // The Map shape at construction too — the adequacy reader's #9 and #10.
    err = undefined;
    try { checkRegistry({ gateTypes: new Map([['distinct', threshold]]) }); } catch (e) { err = e; }
    ok(err instanceof NameCollision && (err as NameCollision).at === 'distinct', `a Map-registered "distinct" is NameCollision: ${String(err)}`);
    err = undefined;
    try { checkRegistry({ gateTypes: new Map([['bad', { ...threshold, fn: 'x' } as unknown as GateType]]) }); } catch (e) { err = e; }
    ok(err instanceof GateTypeRefused && (err as GateTypeRefused).at === 'bad', `a Map-registered malformed type is GateTypeRefused: ${String(err)}`);
    checkRegistry({ gateTypes: new Map([['threshold', threshold]]) });
    // An absent settingsSchema is UNCHECKED, not refused.
    const noSchema = { routes: threshold.routes, defaultRoute: threshold.defaultRoute, fn: threshold.fn };
    equal(gateTypeProblem(noSchema), null, 'a type with no settingsSchema is a gate type');
  });

  test('distinct`s decision: first, duplicate and nokey, keys compared as JSON values, one memory', () => {
    const memory = new Map<string, unknown>();
    const run = (key: unknown) => distinct.fn({ key, input: { key }, settings: { key: 'k' }, memory } as GateContext);
    equal(['s1', 's2', 's1', 's2', 's3'].map(run), ['first', 'first', 'duplicate', 'duplicate', 'first'], 'the first per key, every later one a duplicate');
    equal([1, '1', 1, '1'].map(run), ['first', 'first', 'duplicate', 'duplicate'], '1 and "1" are TWO keys — compared as JSON values');
    equal(run(''), 'first', 'the empty string is a string and a key');
    for (const k of [undefined, null, true, { id: 1 }, ['s1'], Number.NaN, Number.POSITIVE_INFINITY]) {
      equal(run(k), 'nokey', `${String(JSON.stringify(k) ?? k)} is nokey — missing, null, or not a string or a finite number`);
    }
    equal(memory.size, 6, 'the memory holds one entry per KEY seen — s1, s2, s3, 1, "1" and the empty string — and nokey writes nothing');
  });

  test('readKeyPath — own keys of plain objects, no index, and anything else is nothing', () => {
    const v = { series: { id: 's1', tags: ['a'] }, list: [{ id: 'x' }], nul: null };
    equal(readKeyPath(v, 'series.id'), 's1', 'a nested own key');
    equal(readKeyPath(v, 'series'), v.series, 'the value at the end is returned whatever it is');
    equal(readKeyPath(v, 'series.missing'), undefined, 'a missing key is nothing');
    equal(readKeyPath(v, 'list.0.id'), undefined, 'an ARRAY mid-path is nothing — no index, by stop-and-ask (d)');
    equal(readKeyPath(v, 'series.tags.0'), undefined, 'and an array at the last step, indexed, is nothing too');
    equal(readKeyPath(v, 'nul.id'), undefined, 'null mid-path is nothing');
    equal(readKeyPath(v, 'series.toString'), undefined, 'a PROTOTYPE key is not an own key');
    equal(readKeyPath('s1', 'length'), undefined, 'a primitive has no keys here');
    equal(readKeyPath(Object.create({ id: 'inherited' }) as object, 'id'), undefined, 'an inherited key is nothing');
    class Box { id = 'own'; }
    equal(readKeyPath({ box: new Box() }, 'box.id'), undefined, 'a CLASS instance is not a plain object — its own field is not read (the conformity reader, 10)');
    equal(readKeyPath({ m: new Map([['id', 1]]) }, 'm.id'), undefined, 'nor is a Map');
    equal(readKeyPath({ o: Object.assign(Object.create(null), { id: 'bare' }) }, 'o.id'), 'bare', 'an object with NO prototype is plain');
    equal(keyPathProblem('series.id'), null, 'the grammar accepts what readKeyPath reads');
    ok(KEY_PATH_RE.test('a.b') && !KEY_PATH_RE.test('a..b'), 'KEY_PATH_RE is the grammar');
  });

  test('new Driver CONSTRUCTS a gate flow since W93 — ADR 0066 rule 7 LIFTED — an INVALID one still reports its FD-V, and a consumer type arrives by DriverOptions.gateTypes', async () => {
    // **W92 asserted the REFUSAL here, and W93's lift turned it red on its first run** — `a VALID gate flow is refused
    // at construction: Error: MissingJoinPolicy…`, the constructor having reached the next check instead. That was the
    // assertion's designed expiry (ADR 0066 rule 7, lifted by ADR 0067); what it asserts now is the lift itself.
    const calls = { addTask: 0, addEventListener: 0 };
    const scheduler = { addTask: () => { calls.addTask++; }, addEventListener: () => { calls.addEventListener++; } };
    const make = (d: FlowDefinition, extra: Record<string, unknown> = {}) => new Driver(d, {
      runId: 'r1', scheduler: scheduler as never, predicates: new Map(), createTask: (c: unknown) => c as never,
      joinPolicy: liveToken as never, ...typesFor(['IngestWorker', 'ExtractWorker', 'ScoreWorker', 'PublishWorker']), ...extra,
    } as never);
    const valid = JSON.parse(await readText(`${ROOT}spec/examples/valid/gated-map.flow.json`)) as FlowDefinition;
    const d = make(valid);
    ok(calls.addEventListener > 0, 'a VALID gate flow CONSTRUCTS — the driver subscribes');
    d.start({});
    equal(calls.addTask, 1, 'and STARTS: the task before the gate is dispatched, as it is in any flow');
    // An INVALID gate document is still refused, with its rule — validation is untouched by the lift.
    const invalid = JSON.parse(await readText(`${ROOT}spec/examples/invalid/FD-V41--a-declared-route-with-no-edge.flow.json`)) as FlowDefinition;
    let err: unknown;
    try { make(invalid); } catch (e) { err = e; }
    equal((err as InvalidDefinition).rules, ['FD-V41'], 'an invalid gate document is InvalidDefinition with its rule');
    // Every shape constructs, a gate at the top level of a flow with no region included.
    for (const [shape, build] of SHAPES) {
      err = undefined;
      try { make(build(GATE())); } catch (e) { err = e; }
      equal(err, undefined, `${shape}: constructs`);
    }
    // A CONSUMER's type reaches a hand-built driver by DriverOptions.gateTypes — and without it the driver validates
    // against the built-ins alone, so a gate naming it is FD-V39 at construction (the registry road ADR 0066 rule 3 left
    // to the definition layer, and W93 gave the driver).
    const thresholdFlow = SHAPES[0]![1](GATE({ type: 'threshold', settings: { limit: 3, key: 'n' }, edges: [{ route: 'low', to: 'setup' }, { to: 'dropped' }] }));
    err = undefined;
    try { make(thresholdFlow); } catch (e) { err = e; }
    ok(err instanceof InvalidDefinition && (err as InvalidDefinition).rules.includes('FD-V39'), `no gateTypes: "threshold" is FD-V39 — ${String(err)}`);
    err = undefined;
    try { make(thresholdFlow, { gateTypes: { threshold } }); } catch (e) { err = e; }
    equal(err, undefined, 'with gateTypes: { threshold } it constructs');
  });

  test('the spec`s tables are the code`s lists, both ways — the gate`s keys, the interface`s members, distinct`s routes', async () => {
    const spec = await readText(`${ROOT}spec/flow-definition.md`);
    const tableAfter = (heading: string): string[] => {
      const from = spec.indexOf(heading);
      ok(from >= 0, `the spec has ${JSON.stringify(heading)}`);
      const body = spec.slice(from + heading.length);
      return [...body.slice(0, body.indexOf('\n##')).matchAll(/^\|\s*`([A-Za-z$][A-Za-z0-9_-]*)(?:\(ctx\))?`\s*\|/gm)].map((m) => m[1]!).sort();
    };
    const gateKeys = tableAfter('### `gate` — a decision WITH MEMORY — v0.23');
    // The subsection holds TWO tables — the node's keys and distinct's routes — read apart by their names.
    equal(gateKeys.filter((k) => ['type', 'settings', 'edges'].includes(k)), ['edges', 'settings', 'type'], 'the gate key table lists type, settings, edges');
    equal([...NODE_KEYS_DECLARED.gate!].filter((k) => k !== 'id' && k !== 'kind').sort(), ['edges', 'settings', 'type'], 'and FD-V17 accepts exactly those beside id and kind');
    equal(gateKeys.filter((k) => !['type', 'settings', 'edges'].includes(k)), [...distinct.routes].sort(), 'distinct`s route table is distinct.routes, both ways');
    equal(tableAfter('#### Gate types — CODE, beside the built-ins — v0.23'), [...GATE_TYPE_KEYS].sort(), 'the interface table is GATE_TYPE_KEYS, both ways');
  });

  test('what a gate carries on EVERY route, with a plain and a transformed consumer, and from an entry gate', async () => {
    // The adequacy reader's #15, #14 and #12, one shape: every pass-through fixture sent the NON-default routes to an
    // `end`, so a consumer on `duplicate` could leave the report — W92's own census defect for every route but the
    // default — and a transformed consumer after a gate, which needs the SAMPLE through the gate, existed nowhere.
    const out = { type: 'object', required: ['series'], properties: { series: { type: 'object', required: ['id'], properties: { id: { type: 'string' } }, additionalProperties: false } }, additionalProperties: false, examples: [{ series: { id: 's1' } }] };
    const base = typesFor(['IngestWorker']);
    const r: WiringRegistry = {
      workers: { ...base.workers, x: { url: 'test://x', outputSchema: out }, a: { url: 'test://a', inputSchema: { type: 'object', required: ['series'] } }, t: { url: 'test://t', inputSchema: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } } } },
      nodeTypes: { ...base.nodeTypes, ExtractWorker: { worker: 'x' }, AuditWorker: { worker: 'a' }, TitleWorker: { worker: 't' } },
      languages: { path: PATH_LANGUAGE },
    };
    const flowWith = (entry: string) => ({ flowId: 'routes', version: 1, entry, nodes: [
      { id: 'identify', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'dedupe' }] },
      GATE({ edges: [{ to: 'setup' }, { route: 'duplicate', to: 'audit' }, { route: 'nokey', to: 'dropped' }] }),
      { id: 'setup', kind: 'task', type: 'TitleWorker', transform: { lang: 'path', expr: 'series' }, edges: [{ to: 'done' }] },
      { id: 'audit', kind: 'task', type: 'AuditWorker', edges: [{ to: 'done' }] },
      { id: 'dropped', kind: 'end', outcome: 'dropped' },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ] }) as unknown as FlowDefinition;
    const report = await checkWiring(r, flowWith('identify'));
    const v = (c: string) => report.verdicts.find((x) => x.consumer === c);
    equal([v('audit')?.producer, v('audit')?.kind], ['identify', 'fits'], 'a consumer on the DUPLICATE route is in the report, judged against what reached the gate');
    equal([v('setup')?.producer, v('setup')?.kind], ['identify', 'transform-passes'], 'a TRANSFORMED consumer after the gate runs on the producer`s sample, carried THROUGH the gate');
    equal(v('setup')?.sample?.result, { id: 's1' }, 'and the transform saw the producer`s example — series of { series: { id: s1 } }');
    // An ENTRY gate: every route's target is where the payload may land, not only the default's.
    equal([...(await checkWiring(r, flowWith('dedupe'))).entry].sort(), ['audit', 'setup'], 'an entry gate lists EVERY route`s task target');
  });

  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run — it was deleted, renamed, or its suite stopped loading');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name. Add it here in the same commit');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership, which catches a duplicated name');
  });
});
