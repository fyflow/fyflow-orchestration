/**
 * Ladder L1 — **`"$payload"` in the grammar: the run's payload as a reference** — `spec/flow-definition.md` v0.44
 * (section 3's table, `FD-V26`'s `$` clauses, the wiring table's `needs` row), [ADR 0117](../../doc/decisions/0117-a-reference-may-name-what-reached-the-run.md),
 * [P38](../../doc/plans/p38-may-a-reference-name-what-reached-the-run-and-its-map-instance.md) stop-and-asks (b), (d), (g),
 * (h) and (i), [W190](../../doc/work-items/w190-the-runs-payload-as-a-reference.md).
 *
 * **Every expected value is written from those rows, never read off a run**: `"$payload"` parses to its own form with no
 * node (h) and `"$item"` to its own (W191 composes it and gives it `FD-V49`; W190's reading R1 refused it until then); the whole `$` prefix is
 * reserved, so every other `$` spelling is `null` and `FD-V26` names the fix (g) — the bare form for an array, no `?` for
 * a suffix, the two references for anything else; `"$payload"` is legal on every node and every edge, the entry included
 * (d), and `FD-V27`-`FD-V29` never aim it; an arc composed through it is `unchecked` (i); and `boundaryTargets` composes it
 * from the walk's own payload (P38 fact 8). Each claim sits beside a CONTROL showing its observer can see.
 */
import { collected, equal, ok, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { referenceTarget, validateDefinition } from '../../src/definition/validate.ts';
import { boundaryTargets, checkWiring } from '../../src/definition/wiring.ts';
import type { FlowDefinition, JsonSchema } from '../../src/definition/types.ts';

const SUITE = 'W190 — "$payload" in the grammar: referenceTarget`s new forms, FD-V26`s "$" clauses at both sites, every site it is legal, and the wiring check`s unchecked';

const REGISTRY = { predicates: ['isLowConfidence'], ...typesFor(['IngestWorker', 'ScoreWorker', 'PublishWorker']) };
const doc = (nodes: unknown[], entry = 'ingest'): FlowDefinition =>
  ({ flowId: 'run-payload', version: 1, entry, nodes } as unknown as FlowDefinition);
const findingsOf = (d: FlowDefinition) => validateDefinition(d, REGISTRY);
const rulesOf = (d: FlowDefinition) => [...new Set(findingsOf(d).map((f) => f.rule))].sort();

/** `ingest -> subject -> done`, `subject` declaring `needs`. */
const atNode = (needs: unknown) => doc([
  { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'subject' }] },
  { id: 'subject', kind: 'task', type: 'ScoreWorker', needs, edges: [{ to: 'done' }] },
  { id: 'done', kind: 'end', outcome: 'completed' },
]);
/** The same, the `needs` on `subject`'s GUARDED edge. */
const atEdge = (needs: unknown) => doc([
  { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'subject' }] },
  { id: 'subject', kind: 'task', type: 'ScoreWorker',
    edges: [{ when: { path: 'needs.run.amount', op: 'gt', value: 100 }, to: 'review', needs }, { to: 'done' }] },
  { id: 'review', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
  { id: 'done', kind: 'end', outcome: 'completed' },
]);

const DECLARED_CASES = [
  'referenceTarget parses "$payload" and "$item" to their own node-less forms, and every other "$" spelling to null',
  'FD-V26 refuses each "$" mistake at a NODE, alone, and its message names the fix',
  'and at an EDGE, by the same clauses, the edge`s "." clause unmoved beside them',
  '"$item" is no longer refused by FD-V26 at either site since W191 — inside a map instance it is accepted, outside one it is FD-V49',
  '"$payload" is ACCEPTED at the entry, two hops on, on a map node, on an ask and on an edge — no FD-V26 to FD-V29',
  'no node can be called "$payload" — FD-V16 — so the token cannot collide with a node id',
  'checkWiring: an arc composed through a "$payload" key reads UNCHECKED, naming it, beside a "." control that reads a verdict',
  'boundaryTargets: an entry map whose `over` is read off a "$payload" key walks the PAYLOAD`s elements',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test('referenceTarget parses "$payload" and "$item" to their own node-less forms, and every other "$" spelling to null', () => {
    equal(referenceTarget('$payload'), { form: 'payload', node: null, conditional: false },
      '"$payload" — its own form, no node, never conditional (P38 (h))');
    equal(referenceTarget('$item'), { form: 'item', node: null, conditional: false },
      '"$item" — its own form too, parsed in this item so the union is ONE type for both (P38 (h))');
    // The old forms are unmoved — the variant is ADDED, never a reuse of `'self'` (P38 (h)'s refused alternative).
    equal(referenceTarget('.'), { form: 'self', node: null, conditional: false }, 'and "." is still `self`');
    equal(referenceTarget('ingest'), { form: 'one', node: 'ingest', conditional: false }, 'and a node id still `one`');
    const refused = ['$payload?', ['$payload'], ['$payload?'], '$item?', ['$item'], '$other', '$', '$Payload', '$payload ', ['$other']];
    const ran: unknown[] = [];
    for (const v of refused) {
      ran.push(v);
      equal(referenceTarget(v), null, `${JSON.stringify(v)} is not a reference — the "$" prefix is reserved (P38 (b))`);
    }
    equal(ran.length, refused.length, 'the LOOP ran every spelling');
  });

  test('FD-V26 refuses each "$" mistake at a NODE, alone, and its message names the fix', () => {
    // Each spelling, the ONE rule P38 (g) names, and the fix that rule's message carries — written from (g)'s row.
    const cases: [unknown, string][] = [
      // The array cases read `is an array form`: *write "$payload"* alone is a prefix of the suffix clause's own fix, so it
      // could not tell the two clauses apart (W190's own probe P4 survived it).
      [['$payload'], 'is an array form, and there is ONE run payload: write "$payload"'],
      ['$payload?', 'write "$payload" without "?"'],
      [['$payload?'], 'is an array form, and there is ONE run payload: write "$payload"'],
      ['$other', '"$payload" (the run\'s payload) and "$item" (a map instance\'s item)'],
      [['$item'], 'is an array form, and there is ONE item per map instance: write "$item"'],
      ['$item?', 'write "$item" without "?"'],
    ];
    for (const [v, fix] of cases) {
      const d = atNode({ k: v });
      equal(rulesOf(d), ['FD-V26'], `${JSON.stringify(v)}: FD-V26 alone — the GRAMMAR, never FD-V27 aiming at a node called that`);
      const f = findingsOf(d)[0]!;
      ok(f.detail.includes(fix), `${JSON.stringify(v)}: the message names the fix ${JSON.stringify(fix)} — got ${f.detail}`);
      equal(f.at, 'subject', 'at the node');
    }
    // The CONTROL the messages are read against: a non-`$` non-reference still gets the GRAMMAR message, which now
    // lists "$payload" among the forms — so the `$` messages above are not the one message every refusal gets.
    const plain = findingsOf(atNode({ k: 'in:gest' }))[0]!;
    ok(plain.detail.includes('which is not "." , "$payload", "$item", a node id') && !plain.detail.includes('reserved'),
      `a non-"$" refusal is worded as the grammar, not as a "$" clause — got ${plain.detail}`);
  });

  test('and at an EDGE, by the same clauses, the edge`s "." clause unmoved beside them', () => {
    const cases: [unknown, string][] = [
      [['$payload'], 'is an array form'],
      ['$payload?', 'without "?"'],
      ['$other', 'the "$" prefix is reserved'],
      // The other three node-site spellings, at the edge site too (W190's adequacy reader, A6).
      [['$payload?'], 'is an array form, and there is ONE run payload: write "$payload"'],
      [['$item'], 'is an array form, and there is ONE item per map instance: write "$item"'],
      ['$item?', 'write "$item" without "?"'],
    ];
    for (const [v, fix] of cases) {
      const d = atEdge({ run: v });
      equal(rulesOf(d), ['FD-V26'], `${JSON.stringify(v)} on an edge: FD-V26 alone`);
      const f = findingsOf(d)[0]!;
      ok(f.detail.startsWith('edge needs["run"]') && f.detail.includes(fix), `the edge's message names the fix — got ${f.detail}`);
      equal(f.at, 'subject#edge0', 'at the edge');
    }
    // `"."` on an edge is refused as it was (v0.12), and by its own message — `"$payload"`, which has no node either,
    // is NOT (P38 decision 3): reading the clause as `node === null` refused both.
    const dot = findingsOf(atEdge({ run: '.' }));
    equal(dot.map((f) => f.rule), ['FD-V26'], '"." on an edge: still FD-V26');
    ok(dot[0]!.detail.includes('ctx.outcome'), 'with the message naming what the predicate already has');
    equal(rulesOf(atEdge({ run: '$payload' })), [], '"$payload" on an edge: ACCEPTED — a predicate has no ctx.payload');
  });

  test('"$item" is no longer refused by FD-V26 at either site since W191 — inside a map instance it is accepted, outside one it is FD-V49', () => {
    // W190's reading R1 refused it with FD-V26 at both sites until W191 composed it (v0.45, ADR 0118). These two
    // positions are in NO map instance, so the refusal is now the AIM rule's, FD-V49 — and FD-V26 is silent.
    const node = findingsOf(atNode({ item: '$item' }));
    equal(node.map((f) => f.rule), ['FD-V49'], 'at a node outside any map instance: FD-V49, never FD-V26');
    // `run` declared too (v0.55, W221, P45 (g1)): `atEdge`'s comparison reads `needs.run`, and an undeclared `needs` key is
    // FD-V43 — so the edge declares what its comparison reads, and this case still asks about `"$item"` alone.
    const edge = findingsOf(atEdge({ item: '$item', run: '$payload' }));
    equal(edge.map((f) => f.rule), ['FD-V49'], 'at an edge outside any map instance: FD-V49');
    ok(edge[0]!.detail.startsWith('edge needs["item"]'), `the edge's own wording — got ${edge[0]!.detail}`);
    // Inside a map instance it is LEGAL (W191's L1 suite holds every site; this is the one W190 refused).
    const inMap = doc([
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'map', over: 'items', branch: 'score' },
      { id: 'score', kind: 'task', type: 'ScoreWorker', needs: { item: '$item' }, edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ]);
    equal(rulesOf(inMap), [], 'inside a map instance: accepted');
  });

  test('"$payload" is ACCEPTED at the entry, two hops on, on a map node, on an ask and on an edge — no FD-V26 to FD-V29', () => {
    // P38 (d): one rule per token, no case where a correct value is refused — the entry included, where it equals ".".
    const sites: [string, FlowDefinition][] = [
      ['the entry task, beside "."', doc([
        { id: 'ingest', kind: 'task', type: 'IngestWorker', needs: { run: '$payload', own: '.' }, edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ])],
      ['two hops on, beside a node id', doc([
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'mid' }] },
        { id: 'mid', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'last' }] },
        { id: 'last', kind: 'task', type: 'PublishWorker', needs: { run: '$payload', up: 'ingest', prev: '.' }, edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ])],
      ['a map node, its `over` a key of the composed object — and a branch task INSIDE the map', doc([
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'map', over: 'items', branch: 'score', needs: { items: '$payload' } },
        { id: 'score', kind: 'task', type: 'ScoreWorker', needs: { item: '.', run: '$payload' }, edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ])],
      ['an ENTRY ask, and its successor reading it beside the answer (the app`s case 1)', doc([
        { id: 'approve', kind: 'ask', needs: { invoice: '$payload' }, edges: [{ to: 'pay' }] },
        { id: 'pay', kind: 'task', type: 'PublishWorker', needs: { invoice: '$payload', answer: 'approve' }, edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ], 'approve')],
      ['an edge, its predicate reading needs.run.amount', atEdge({ run: '$payload' })],
    ];
    const ran: string[] = [];
    for (const [label, d] of sites) {
      ran.push(label);
      equal(findingsOf(d), [], `${label}: zero findings`);
    }
    equal(ran.length, 5, 'five sites — P38 (d)`s list');
    // The CONTROL that shows the observer can see a refusal at these very sites: a node id there is aimed.
    equal(rulesOf(atNode({ run: 'nowhere' })), ['FD-V27'], 'a NODE id in the same position is aimed by FD-V27 — the skip is the token`s alone');
  });

  test('no node can be called "$payload" — FD-V16 — so the token cannot collide with a node id', () => {
    const d = doc([
      { id: '$payload', kind: 'task', type: 'IngestWorker', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ], '$payload');
    ok(rulesOf(d).includes('FD-V16'), `a node id "$payload" is FD-V16 (P38 fact 1) — got ${rulesOf(d).join()}`);
  });

  test('checkWiring: an arc composed through a "$payload" key reads UNCHECKED, naming it, beside a "." control that reads a verdict', async () => {
    const OUT: JsonSchema = { type: 'object', required: ['amount'], properties: { amount: { type: 'number' } }, additionalProperties: false, examples: [{ amount: 3 }] };
    const IN: JsonSchema = { type: 'object', required: ['own'], properties: { own: { type: 'object' } } };
    const registry = {
      workers: { p: { url: 'test://p', outputSchema: OUT }, c: { url: 'test://c', inputSchema: IN } },
      nodeTypes: { P: { worker: 'p' }, C: { worker: 'c' } },
    };
    const flow = (needs: unknown): FlowDefinition => ({
      flowId: 'wire', version: 1, entry: 'p',
      nodes: [
        { id: 'p', kind: 'task', type: 'P', edges: [{ to: 'c' }] },
        { id: 'c', kind: 'task', type: 'C', needs, edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition);
    const control = (await checkWiring(registry, flow({ own: '.' }))).verdicts.find((v) => v.consumer === 'c')!;
    equal([control.shape, control.kind], ['needs', 'fits'], 'the CONTROL: "." composes the producer`s schema and the arc FITS');
    const withRun = (await checkWiring(registry, flow({ own: '.', run: '$payload' }))).verdicts.find((v) => v.consumer === 'c')!;
    equal([withRun.shape, withRun.kind], ['needs', 'unchecked'], 'one "$payload" key beside it: UNCHECKED — never `fits`, never the edge`s schema (P38 (i))');
    ok(withRun.why.includes('"$payload"') && withRun.why.includes('no schema declares'), `and it says why — got ${withRun.why}`);
    // Read as "." (`t.node === null`), the key would take the edge's schema and `{ own, run }` would FIT a consumer
    // requiring only `own` — the false verdict (i) refuses. A consumer REQUIRING `run` shows the difference too:
    const needsRun: JsonSchema = { type: 'object', required: ['run'], properties: { run: { type: 'object' } } };
    const r2 = { ...registry, workers: { ...registry.workers, c: { url: 'test://c', inputSchema: needsRun } } };
    const v2 = (await checkWiring(r2, flow({ run: '$payload' }))).verdicts.find((v) => v.consumer === 'c')!;
    equal(v2.kind, 'unchecked', 'a consumer requiring the key: still UNCHECKED, the payload`s shape unknown');
  });

  test('boundaryTargets: an entry map whose `over` is read off a "$payload" key walks the PAYLOAD`s elements', () => {
    const flow = (needs: unknown): FlowDefinition => ({
      flowId: 'walk', version: 1, entry: 'split',
      nodes: [
        { id: 'split', kind: 'map', over: 'items', branch: 'score', ...(needs === undefined ? {} : { needs }) },
        { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition);
    // The payload IS the list, so `{ items: "$payload" }` makes `over: "items"` read it — three targets, one per element.
    const payload = ['p', 'q', 'r'];
    equal(boundaryTargets(flow({ items: '$payload' }), payload), [
      { node: 'score', value: 'p' }, { node: 'score', value: 'q' }, { node: 'score', value: 'r' },
    ], 'the walk composes the "$payload" key from its own payload, and reads `over` off it (P38 fact 8)');
    // CONTROLS: the same payload with no `needs` has no `items` key to read, so it walks nothing; and "." is the same
    // value at the entry — the two spellings agree where they must (P38 (d)).
    equal(boundaryTargets(flow(undefined), payload), [], 'no needs: `over` reads `items` off an ARRAY, and finds nothing');
    equal(boundaryTargets(flow({ items: '.' }), payload), boundaryTargets(flow({ items: '$payload' }), payload),
      'at the entry, "." and "$payload" are the same value');
  });

  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
