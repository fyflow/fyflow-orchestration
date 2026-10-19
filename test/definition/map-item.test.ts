/**
 * Ladder L1 — **`"$item"` in the grammar: a map instance's item as a reference** — `spec/flow-definition.md` v0.45
 * (section 3's table, `FD-V26` without its `"$item"` refusal, a new `FD-V49`, the wiring table's `needs` row),
 * [ADR 0118](../../doc/decisions/0118-a-map-instance-keeps-its-item-while-a-node-of-it-may-still-be-entered.md),
 * [P38](../../doc/plans/p38-may-a-reference-name-what-reached-the-run-and-its-map-instance.md) stop-and-asks (c), (d), (g)
 * and (i), [W191](../../doc/work-items/w191-the-map-instances-item-as-a-reference.md).
 *
 * **Every expected value is written from those rows, never read off a run**: `"$item"` names the INNERMOST map region that
 * CONTAINS the reader as a member (c) — so a `map` node names its ENCLOSING instance's item and a node in a `fanout` inside
 * a map names the map's; it is legal on every node and every edge inside a map instance, the branch entry included (d);
 * where no map instance contains the reader it is `FD-V49`, naming both fixes (g); and an arc composed through it is the
 * enclosing map's ITEM arrival, one sample per element (i). Each claim sits beside a CONTROL showing its observer can see.
 */
import { collected, equal, ok, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { validateDefinition } from '../../src/definition/validate.ts';
import { allRegions, buildGraph, innermostMapOf } from '../../src/definition/regions.ts';
import { checkWiring } from '../../src/definition/wiring.ts';
import { PATH_LANGUAGE } from '../scheduler/fake-language.ts';
import type { FlowDefinition, JsonSchema } from '../../src/definition/types.ts';

const SUITE = 'W191 — "$item" in the grammar: the innermost map instance, FD-V26`s refusal retired, FD-V49 at both sites, and the wiring check over the map`s item';

const REGISTRY = { predicates: [], ...typesFor(['IngestWorker', 'ScoreWorker', 'PublishWorker']) };
const doc = (nodes: unknown[], entry = 'ingest'): FlowDefinition =>
  ({ flowId: 'map-item', version: 1, entry, nodes } as unknown as FlowDefinition);
const findingsOf = (d: FlowDefinition) => validateDefinition(d, REGISTRY);
const rulesOf = (d: FlowDefinition) => [...new Set(findingsOf(d).map((f) => f.rule))].sort();
const END = { id: 'done', kind: 'end', outcome: 'completed' };

/** `ingest -> split (map over items) -> score -> collect -> after -> done`; `score` and `after` take the given `needs`. */
const inMap = (score: Record<string, unknown> = {}, after: Record<string, unknown> = {}) => doc([
  { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
  { id: 'split', kind: 'map', over: 'items', branch: 'score' },
  { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }], ...score },
  { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'after' }] },
  { id: 'after', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }], ...after },
  END,
]);

/** Two maps, one inside the other's instance: `outer` over `groups`, `g -> inner (over rows) -> r -> innerJoin -> h`. */
const nested = (inner: Record<string, unknown> = {}, r: Record<string, unknown> = {}, h: Record<string, unknown> = {}) => doc([
  { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'outer' }] },
  { id: 'outer', kind: 'map', over: 'groups', branch: 'g' },
  { id: 'g', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'inner' }] },
  { id: 'inner', kind: 'map', over: 'rows', branch: 'r', ...inner },
  { id: 'r', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'innerJoin' }], ...r },
  { id: 'innerJoin', kind: 'join', of: 'inner', edges: [{ to: 'h' }] },
  { id: 'h', kind: 'task', type: 'PublishWorker', edges: [{ to: 'outerJoin' }], ...h },
  { id: 'outerJoin', kind: 'join', of: 'outer', edges: [{ to: 'done' }] },
  END,
]);

/** A `fanout` inside a map instance: `split (map) -> a -> fan [l, r] -> fj -> b -> collect`. */
const fanInMap = (l: Record<string, unknown> = {}) => doc([
  { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
  { id: 'split', kind: 'map', over: 'items', branch: 'a' },
  { id: 'a', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'fan' }] },
  { id: 'fan', kind: 'fanout', branches: ['l', 'r'] },
  { id: 'l', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'fj' }], ...l },
  { id: 'r', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'fj' }] },
  { id: 'fj', kind: 'join', of: 'fan', edges: [{ to: 'b' }] },
  { id: 'b', kind: 'task', type: 'PublishWorker', edges: [{ to: 'collect' }] },
  { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
  END,
]);

const DECLARED_CASES = [
  'innermostMapOf names the innermost map region CONTAINING a node — nested maps, a map node, a fanout inside a map, and none outside',
  'FD-V26 no longer refuses "$item" at either site — its array and suffix clauses stand, and the grammar messages list it',
  '"$item" is ACCEPTED inside a map instance: the branch entry, two hops in after an ask, an edge, a fanout inside the instance, a map node inside a map',
  'FD-V49 refuses "$item" on a NODE no map instance contains — alone, at the reader, its message naming both fixes',
  'FD-V49 on an EDGE, on a top-level MAP node and after a map`s JOIN — each beside "." in the same position, accepted',
  'checkWiring: a "$item" key composes the enclosing map`s ITEM arrival, one sample per element — fits, no, and unchecked for an entry map',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test('innermostMapOf names the innermost map region CONTAINING a node — nested maps, a map node, a fanout inside a map, and none outside', () => {
    const at = (d: FlowDefinition, id: string) => innermostMapOf(allRegions(buildGraph(d), d), id)?.fanoutId;
    const n = nested();
    // Written from (c): the INNERMOST map whose region holds the node as a MEMBER, and an opener is never a member of
    // the region it opens (its branch cannot reach it — FD-V10).
    equal(at(n, 'r'), 'inner', 'r is in both instances: the INNER one is innermost');
    equal(at(n, 'inner'), 'outer', 'the inner MAP node names its ENCLOSING instance — never the region it opens');
    equal(at(n, 'g'), 'outer', 'the outer branch entry: the outer map');
    equal(at(n, 'h'), 'outer', 'h, after the inner join, is still in the outer instance');
    equal(at(n, 'outer'), undefined, 'the top-level MAP node: no map contains it');
    equal(at(n, 'ingest'), undefined, 'before every map: none');
    equal(at(n, 'done'), undefined, 'after the outer join: none');
    const f = fanInMap();
    equal(at(f, 'l'), 'split', 'a node in a FANOUT inside a map instance names the MAP — the fanout is no map');
    equal(at(f, 'fan'), 'split', 'and the fanout node itself is in the map instance');
    equal(at(f, 'b'), 'split', 'and the node after the fanout`s join');
  });

  test('FD-V26 no longer refuses "$item" at either site — its array and suffix clauses stand, and the grammar messages list it', () => {
    equal(findingsOf(inMap({ needs: { it: '$item' } })), [], 'on a NODE inside a map instance: zero findings (W190`s reading R1 retired)');
    const edge = inMap({ edges: [{ when: { path: 'needs.it.x', op: 'gt', value: 1 }, to: 'collect', needs: { it: '$item' } }, { to: 'collect' }] });
    equal(findingsOf(edge), [], 'and on an EDGE of one: zero findings');
    // The CONTROLS — FD-V26 still fires at these very sites, for the two shapes it refuses of "$item" (P38 (g)).
    for (const [v, fix] of [[['$item'], 'is an array form, and there is ONE item per map instance: write "$item"'], ['$item?', 'write "$item" without "?"']] as const) {
      const f = findingsOf(inMap({ needs: { it: v } }));
      equal(f.map((x) => x.rule), ['FD-V26'], `${JSON.stringify(v)} inside a map instance: still FD-V26, alone`);
      ok(f[0]!.detail.includes(fix), `naming its fix — got ${f[0]!.detail}`);
    }
    // The grammar's own wording names the new form beside the others, at both sites.
    const node = findingsOf(inMap({ needs: { it: 'in:gest' } }))[0]!;
    ok(node.detail.includes('which is not "." , "$payload", "$item", a node id'), `the node message lists "$item" — got ${node.detail}`);
    const onEdge = findingsOf(inMap({ edges: [{ when: { path: 'needs.it', op: 'eq', value: 1 }, to: 'collect', needs: { it: 'in:gest' } }, { to: 'collect' }] }))[0]!;
    ok(onEdge.detail.includes('which is not "$payload", "$item", a node id'), `the edge message lists it too — got ${onEdge.detail}`);
  });

  test('"$item" is ACCEPTED inside a map instance: the branch entry, two hops in after an ask, an edge, a fanout inside the instance, a map node inside a map', () => {
    const sites: [string, FlowDefinition][] = [
      ['the BRANCH ENTRY, beside "." — one value there (P38 (d))', inMap({ needs: { it: '$item', own: '.' } })],
      ['two hops in, after an ASK — the app`s case 2', doc([
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'map', over: 'items', branch: 'review' },
        { id: 'review', kind: 'ask', edges: [{ to: 'pay' }] },
        { id: 'pay', kind: 'task', type: 'PublishWorker', needs: { invoice: '$item', answer: 'review' }, edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        END,
      ])],
      ['an EDGE of a node in the instance', inMap({ edges: [{ when: { path: 'needs.it.x', op: 'gt', value: 1 }, to: 'collect', needs: { it: '$item' } }, { to: 'collect' }] })],
      ['a node in a FANOUT inside the instance', fanInMap({ needs: { it: '$item', own: '.' } })],
      ['a MAP node inside a map — its enclosing item, `over` read off the composed object', nested({ needs: { rows: '$item' } }, { needs: { row: '$item' } }, { needs: { group: '$item' } })],
    ];
    const ran: string[] = [];
    for (const [label, d] of sites) {
      ran.push(label);
      equal(findingsOf(d), [], `${label}: zero findings`);
    }
    equal(ran.length, 5, 'five sites — P38 (d)`s and (c)`s list');
    // The CONTROL showing these sites are refusable at all: a NODE id there is aimed by FD-V27.
    equal(rulesOf(inMap({ needs: { it: 'nowhere' } })), ['FD-V27'], 'a node id in the same position is aimed — the acceptance is the token`s');
  });

  test('FD-V49 refuses "$item" on a NODE no map instance contains — alone, at the reader, its message naming both fixes', () => {
    const f = findingsOf(inMap({}, { needs: { it: '$item' } }));
    equal(f.map((x) => `${x.rule}@${x.at}`), ['FD-V49@after'], 'after the map`s join, a node is in no instance: FD-V49 at the reader, and nothing else');
    // Written from (g): *"… is not inside a map instance; name the item where a map's branch receives it ("."), or move
    // this node inside the map"*. Read as two fixes, so neither half is the other's prefix.
    ok(f[0]!.detail.includes('is not inside a map instance'), `names the cause — got ${f[0]!.detail}`);
    ok(f[0]!.detail.includes('name the item where a map\'s branch receives it (".")'), 'names the first fix — "." on the branch entry');
    ok(f[0]!.detail.includes('or move this node inside the map'), 'and the second — move the READER');
    ok(f[0]!.detail.startsWith('needs["it"]'), `at the node site — got ${f[0]!.detail}`);
    // A node in a top-level FANOUT's branch: a region, and NO map instance — FD-V49 (P38 (c): the innermost MAP region).
    const inFan = doc([
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'fan' }] },
      { id: 'fan', kind: 'fanout', branches: ['l', 'r'] },
      { id: 'l', kind: 'task', type: 'ScoreWorker', needs: { it: '$item' }, edges: [{ to: 'fj' }] },
      { id: 'r', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'fj' }] },
      { id: 'fj', kind: 'join', of: 'fan', edges: [{ to: 'done' }] },
      END,
    ]);
    equal(findingsOf(inFan).map((x) => `${x.rule}@${x.at}`), ['FD-V49@l'], 'a branch of a top-level FANOUT is in a region and in no map instance: FD-V49');
    // A flow with no map at all: FD-V49 too, at the entry task.
    const noMap = doc([{ id: 'ingest', kind: 'task', type: 'IngestWorker', needs: { it: '$item' }, edges: [{ to: 'done' }] }, END]);
    equal(findingsOf(noMap).map((x) => `${x.rule}@${x.at}`), ['FD-V49@ingest'], 'a flow with no map: FD-V49 at the entry');
  });

  test('FD-V49 on an EDGE, on a top-level MAP node and after a map`s JOIN — each beside "." in the same position, accepted', () => {
    const edgeAfter = (ref: string) => inMap({}, { edges: [{ when: { path: 'needs.it', op: 'eq', value: 1 }, to: 'done', needs: { it: ref } }, { to: 'done' }] });
    const e = findingsOf(edgeAfter('$item'));
    equal(e.map((x) => `${x.rule}@${x.at}`), ['FD-V49@after#edge0'], 'an edge of a node outside every instance: FD-V49 at the EDGE');
    ok(e[0]!.detail.startsWith('edge needs["it"]') && e[0]!.detail.includes('or move this node inside the map'), `the edge site's own wording — got ${e[0]!.detail}`);
    equal(rulesOf(edgeAfter('ingest')), [], 'the CONTROL: a node id on that edge is accepted — the refusal is "$item"`s');
    // A TOP-LEVEL map node's own "$item" is its ENCLOSING instance's (c) — and it has none.
    const topMap = (ref: string) => nested({}, {}, {}).nodes.map((n) => (n.id === 'outer' ? { ...n, needs: { groups: ref } } : n));
    equal(validateDefinition(doc(topMap('$item')), REGISTRY).map((x) => `${x.rule}@${x.at}`), ['FD-V49@outer'],
      'a top-level MAP declaring "$item": FD-V49 — a map node never names the region it opens');
    equal(validateDefinition(doc(topMap('.')), REGISTRY), [], 'the CONTROL: "." there is accepted');
    // After the join, "." is accepted where "$item" is refused — the reader's PLACE is the whole difference.
    equal(findingsOf(inMap({}, { needs: { it: '.' } })), [], 'the CONTROL for the join case: "." after the join, accepted');
  });

  test('checkWiring: a "$item" key composes the enclosing map`s ITEM arrival, one sample per element — fits, no, and unchecked for an entry map', async () => {
    const ITEM: JsonSchema = { type: 'object', required: ['x'], properties: { x: { type: 'number' } }, additionalProperties: false };
    const OUT: JsonSchema = { type: 'object', required: ['items'], properties: { items: { type: 'array', items: ITEM } }, additionalProperties: false,
      examples: [{ items: [{ x: 1 }, { x: 2 }, { x: 3 }] }] };
    const B_OUT: JsonSchema = { type: 'object', required: ['ok'], properties: { ok: { type: 'boolean' } }, additionalProperties: false, examples: [{ ok: true }] };
    const wantsX: JsonSchema = { type: 'object', required: ['it'], properties: { it: { type: 'object', required: ['x'], properties: { x: { type: 'number' } } } } };
    const wantsY: JsonSchema = { type: 'object', required: ['it'], properties: { it: { type: 'object', required: ['y'], properties: { y: { type: 'string' } } } } };
    const registry = (consumerIn: JsonSchema) => ({
      workers: { p: { url: 'test://p', outputSchema: OUT }, b: { url: 'test://b', outputSchema: B_OUT }, c: { url: 'test://c', inputSchema: consumerIn } },
      nodeTypes: { P: { worker: 'p' }, B: { worker: 'b' }, C: { worker: 'c' } },
      languages: { path: PATH_LANGUAGE },
    });
    // `c` is TWO hops into the instance: what reaches it on its edge is `b`'s result, and its "$item" key is the map's item.
    const flow = (needs: unknown, entry = 'p', transform?: unknown): FlowDefinition => ({
      flowId: 'wire-item', version: 1, entry,
      nodes: [
        { id: 'p', kind: 'task', type: 'P', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'map', over: 'items', branch: 'b' },
        { id: 'b', kind: 'task', type: 'B', edges: [{ to: 'c' }] },
        { id: 'c', kind: 'task', type: 'C', needs, edges: [{ to: 'collect' }], ...(transform === undefined ? {} : { transform }) },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        END,
      ],
    } as unknown as FlowDefinition);
    const verdictAt = async (consumerIn: JsonSchema, needs: unknown, transform?: unknown) =>
      (await checkWiring(registry(consumerIn), flow(needs, 'p', transform))).verdicts.find((v) => v.consumer === 'c')!;
    const fits = await verdictAt(wantsX, { it: '$item', prev: '.' });
    equal([fits.shape, fits.kind], ['needs', 'fits'], 'the item schema `{ x: number }` under `it` FITS a consumer requiring it.x');
    // The SAMPLE is what a transform is run on, so a transform is how it is read: ONE composed object PER ITEM, the
    // producer example's three, each element under `it` and the "." key keeping the arc's ONE value — `b`'s result.
    const sampled = await verdictAt({ type: 'number' }, { it: '$item', prev: '.' }, { lang: 'path', expr: 'it.x' });
    equal([sampled.kind, sampled.sample?.arity, sampled.sample?.result], ['transform-passes', 3, [1, 2, 3]],
      'three evaluations, one per item, each the item`s own x — never one over the whole `items` array');
    equal(sampled.sample?.value, [{ it: { x: 1 }, prev: { ok: true } }, { it: { x: 2 }, prev: { ok: true } }, { it: { x: 3 }, prev: { ok: true } }],
      'each element under `it`, `prev` the same `b` result in all three');
    const no = await verdictAt(wantsY, { it: '$item' });
    equal(no.kind, 'no', 'a consumer requiring it.y — which the CLOSED item schema never emits — is `no`, not `fits` and not unchecked');
    // The CONTROL showing it is the ITEM's schema and not the edge's: read as ".", `it` would be b's `{ ok }` and NOT fit x.
    const dot = await verdictAt(wantsX, { it: '.' });
    equal(dot.kind, 'no', 'the same consumer over `{ it: "." }` — b`s result has no x: `no`');
    // An ENTRY map has no arrival — the run's payload, which no schema declares (P38 (i)).
    const entryFlow: FlowDefinition = { flowId: 'wire-entry', version: 1, entry: 'split', nodes: flow({}).nodes.filter((n) => n.id !== 'p').map((n) => (n.id === 'c' ? { ...n, needs: { it: '$item' } } : n)) } as unknown as FlowDefinition;
    const ent = (await checkWiring(registry(wantsX), entryFlow)).verdicts.find((v) => v.consumer === 'c')!;
    equal(ent.kind, 'unchecked', 'an ENTRY map: UNCHECKED — never a guessed fits');
    ok(ent.why.includes('"$item"') && ent.why.includes('no arrival'), `and it says why — got ${ent.why}`);
    // At the BRANCH ENTRY the arc IS the item: a "$item" key there takes each element in turn, beside "." (W191's adequacy
    // reader, A3 — no case put "$item" on a per-item arc).
    const atEntry: FlowDefinition = { flowId: 'wire-entry-item', version: 1, entry: 'p', nodes: [
      { id: 'p', kind: 'task', type: 'P', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'map', over: 'items', branch: 'c' },
      { id: 'c', kind: 'task', type: 'C', needs: { it: '$item', own: '.' }, transform: { lang: 'path', expr: 'it.x' }, edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      END,
    ] } as unknown as FlowDefinition;
    const ae = (await checkWiring(registry({ type: 'number' }), atEntry)).verdicts.find((v) => v.consumer === 'c')!;
    equal([ae.kind, ae.sample?.arity, ae.sample?.result], ['transform-passes', 3, [1, 2, 3]], 'at the branch entry: three evaluations, `it` each element');
    equal(ae.sample?.value, [{ it: { x: 1 }, own: { x: 1 } }, { it: { x: 2 }, own: { x: 2 } }, { it: { x: 3 }, own: { x: 3 } }],
      'and "$item" beside "." there — the same element under both keys');
    // NESTED maps: a reader in the INNER instance composes the INNER map's item, never the outer one's (A4).
    const ROWS: JsonSchema = { type: 'object', required: ['rows'], properties: { rows: { type: 'array', items: { type: 'object', required: ['y'], properties: { y: { type: 'string' } }, additionalProperties: false } } },
      additionalProperties: false, examples: [{ rows: [{ y: 'a' }, { y: 'b' }] }] };
    const nestedReg = { ...registry(wantsY), workers: { ...registry(wantsY).workers, g: { url: 'test://g', outputSchema: ROWS } }, nodeTypes: { ...registry(wantsY).nodeTypes, G: { worker: 'g' } } };
    const nestedFlow: FlowDefinition = { flowId: 'wire-nested', version: 1, entry: 'p', nodes: [
      { id: 'p', kind: 'task', type: 'P', edges: [{ to: 'outer' }] },
      { id: 'outer', kind: 'map', over: 'items', branch: 'g' },
      { id: 'g', kind: 'task', type: 'G', edges: [{ to: 'inner' }] },
      { id: 'inner', kind: 'map', over: 'rows', branch: 'c' },
      { id: 'c', kind: 'task', type: 'C', needs: { it: '$item' }, edges: [{ to: 'innerJoin' }] },
      { id: 'innerJoin', kind: 'join', of: 'inner', edges: [{ to: 'outerJoin' }] },
      { id: 'outerJoin', kind: 'join', of: 'outer', edges: [{ to: 'done' }] },
      END,
    ] } as unknown as FlowDefinition;
    equal(validateDefinition(nestedFlow, { predicates: [], ...nestedReg }), [], 'the nested-map flow is valid');
    const nv = (await checkWiring(nestedReg, nestedFlow)).verdicts.find((v) => v.consumer === 'c')!;
    equal(nv.kind, 'fits', 'the INNER item `{ y: string }` fits a consumer requiring it.y — the outer item `{ x }` would be `no`');
    // A map entered from TWO producers has no single item shape (P38 (i)) — UNCHECKED, even where both would fit.
    const twoIn: FlowDefinition = { flowId: 'wire-two', version: 1, entry: 'p0', nodes: [
      { id: 'p0', kind: 'task', type: 'P', edges: [{ when: { path: 'outcome.result.items', op: 'eq', value: null }, to: 'p' }, { to: 'q' }] },
      { id: 'p', kind: 'task', type: 'P', edges: [{ to: 'split' }] },
      { id: 'q', kind: 'task', type: 'P', edges: [{ to: 'split' }] },
      ...flow({ it: '$item' }).nodes.filter((n) => n.id !== 'p'),
    ] } as unknown as FlowDefinition;
    equal(validateDefinition(twoIn, { predicates: [], ...registry(wantsX) }), [], 'the two-producer flow is valid');
    const two = (await checkWiring(registry(wantsX), twoIn)).verdicts.find((v) => v.consumer === 'c')!;
    equal(two.kind, 'unchecked', 'a map with TWO arrivals: UNCHECKED — two producers, no single item shape');
    ok(two.why.includes('2 arrivals'), `and it says why — got ${two.why}`);
  });

  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
