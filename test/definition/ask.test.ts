/**
 * **What an ASK is, at the definition — every key accepted, every refused key refused by its OWN rule beside its
 * accepted neighbour, a reference to it admitted, its edges held as a task's, the wiring check over its arcs, and
 * the driver's interim refusal, which EXPIRED at W180 and now asserts the park** — `spec/flow-definition.md` v0.42 (section 2's `ask` subsection, section 3's
 * wiring subsection, section 5's widened rules and `FD-V47`/`FD-V48`), `spec/task-id.md` v0.13,
 * [ADR 0108](../../doc/decisions/0108-an-ask-is-a-seventh-node-kind-with-a-task-id-and-no-dispatch.md),
 * [W179](../../doc/work-items/w179-the-ask-node-in-the-definition.md).
 *
 * **Every expected value is a rule id, a key name or a verdict read from the spec's rule text**, never from the
 * validator's output. **Where two checks guard one door the shape is chosen so only one can hold** (P35's brief):
 * a `retryPolicy` of the WRONG shape on an ask is `FD-V47` alone — `FD-V30` would refuse it on a task — and a key
 * no kind declares on an ask is `FD-V17` and not `FD-V47`, so the two rules cannot stand in for each other.
 *
 * **The ask stands in FOUR shapes** (rule 8 obligation (a)'s shapes clause): after a top-level task, at the ENTRY,
 * as a fan-out's branch entry before its join, and as a map's branch — one per item — and every key, accepted or
 * refused, is asserted on all four, reported at the ask's own id.
 */
import { collected, equal, ok, readText, ROOT, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { ASK_REFUSED_KEYS, NODE_KEYS_DECLARED, TASK_KEYS_DECLARED, validateDefinition, violatedRules } from '../../src/definition/validate.ts';
import { allRegions, buildGraph } from '../../src/definition/regions.ts';
import { checkWiring, type WiringRegistry } from '../../src/definition/wiring.ts';
import { Driver } from '../../src/driver/driver.ts';
import { fold } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';
import type { FlowDefinition, JsonSchema, Registry } from '../../src/definition/types.ts';
import { PATH_LANGUAGE } from '../scheduler/fake-language.ts';

const SUITE = 'W179 — what an ASK is: the seventh kind, FD-V47 and FD-V48, a reference to it, and its arcs';

const registry: Registry = {
  predicates: new Set<string>(['isApproved']),
  ...typesFor(['IngestWorker', 'ScoreWorker', 'PublishWorker', 'ReviewWorker']),
  groups: ['gpu'],
  languages: { path: PATH_LANGUAGE },
};

/** The ask under test is `approve` in every shape: a decline edge and a default, to `declined` and `after`. */
const ASK = (extra: Record<string, unknown> = {}) => ({
  id: 'approve', kind: 'ask', edges: [{ on: ['failed'], to: 'declined' }, { to: 'after' }], ...extra,
});

/** The four shapes, each a function from the ask node under test to a whole document. */
const SHAPES: readonly [string, (ask: Record<string, unknown>) => FlowDefinition][] = [
  ['after a top-level task', (ask) => ({
    flowId: 'ask-top', version: 1, entry: 'ingest',
    nodes: [
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'approve' }] },
      ask,
      { id: 'after', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
      { id: 'declined', kind: 'end', outcome: 'declined' },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  }) as unknown as FlowDefinition],
  ['at the entry', (ask) => ({
    flowId: 'ask-entry', version: 1, entry: 'approve',
    nodes: [
      ask,
      { id: 'after', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
      { id: 'declined', kind: 'end', outcome: 'declined' },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  }) as unknown as FlowDefinition],
  ['a fan-out`s branch entry, before its join', (ask) => ({
    flowId: 'ask-fanout', version: 1, entry: 'ingest',
    nodes: [
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['approve', 'other'] },
      ask,
      { id: 'after', kind: 'task', type: 'PublishWorker', edges: [{ to: 'collect' }] },
      { id: 'declined', kind: 'end', outcome: 'declined' },
      { id: 'other', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  }) as unknown as FlowDefinition],
  ['a map`s branch — one ask per item', (ask) => ({
    flowId: 'ask-map', version: 1, entry: 'ingest',
    nodes: [
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'map', over: 'files', branch: 'approve' },
      ask,
      { id: 'after', kind: 'task', type: 'PublishWorker', edges: [{ to: 'collect' }] },
      { id: 'declined', kind: 'end', outcome: 'declined' },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  }) as unknown as FlowDefinition],
];

/** The findings AT the ask (or one of its edges). */
const at = (d: FlowDefinition, r: Registry = registry) => validateDefinition(d, r).filter((f) => f.at === 'approve' || (f.at ?? '').startsWith('approve#'));
const rulesAt = (d: FlowDefinition, r: Registry = registry) => [...new Set(at(d, r).map((f) => f.rule))].sort();
/** Where the ask stands, read off the DOCUMENT: `entry`, `-` (no region), or the opener's kind. */
const standing = (d: FlowDefinition): string => {
  if (d.entry === 'approve') return 'entry';
  const rs = allRegions(buildGraph(d), d).filter((r) => r.members.has('approve'));
  return rs.length ? rs[0]!.opensWith : '-';
};
const ALL_STANDINGS = ['-', 'entry', 'fanout', 'map'];
const everyShape = (ask: Record<string, unknown>, expected: string[], why: string, r: Registry = registry) => {
  const visited: string[] = [];
  for (const [shape, build] of SHAPES) {
    const d = build(ask);
    visited.push(standing(d));
    equal(rulesAt(d, r), expected, `${why} — ${shape}: ${at(d, r).map((f) => `${f.rule}@${f.at}: ${f.detail}`).join(' | ')}`);
  }
  equal(visited.sort(), ALL_STANDINGS, `${why} — asserted after a task, at the entry, in a fanout and in a map`);
};
/** The whole document clean — the ACCEPTED neighbour of each refusal. */
const cleanEveryShape = (ask: Record<string, unknown>, why: string, r: Registry = registry) => {
  const visited: string[] = [];
  for (const [shape, build] of SHAPES) {
    const d = build(ask);
    visited.push(standing(d));
    equal(validateDefinition(d, r).map((f) => `${f.rule}@${f.at}: ${f.detail}`), [], `${why} — ${shape}`);
  }
  equal(visited.sort(), ALL_STANDINGS, `${why} — asserted after a task, at the entry, in a fanout and in a map`);
};

/** A worker-key value each of the six would be ACCEPTED with on a task, against `registry` — the control's. */
const TASK_VALUES: Readonly<Record<string, unknown>> = {
  type: 'ScoreWorker',
  pool: 'ScoreWorker',
  optional: true,
  retryPolicy: { maxRetries: 1, backoffMs: 0 },
  workerGroups: ['gpu'],
  transform: { lang: 'path', expr: 'score' },
};

const ANSWER: JsonSchema = {
  type: 'object', required: ['approved'], additionalProperties: false,
  properties: { approved: { type: 'boolean' }, note: { type: 'string' } },
  examples: [{ approved: true }],
};

/** The cases, declared by NAME and named AGAIN at each call site (Q382's form, as `gate.test.ts`). */
const DECLARED_CASES = [
  'the kind: FD-V24 accepts `ask` on every shape, with each declared key alone and all together',
  'FD-V47 — each of the six task keys refused on an ask by FD-V47 ALONE, one finding per key, beside the same key accepted on a task',
  'FD-V48 — answerSchema held to the schema subset: in it accepted, outside it refused by FD-V48 alone, naming where',
  'settings is opaque: any plain object accepted unread, anything else FD-V21 alone',
  'edges: required (FD-V23) and held as a task`s (FD-V7, FD-V18, FD-V41, FD-V43) — a decline edge and a `when` over the answer accepted',
  'FD-V27 admits a reference to an ask — on a node and on an edge — and FD-V28 and FD-V29 ask of it what they ask of a task',
  'where an ask stands: wherever a task may — entry, branch entry, map branch, nested — and the kinds FD-V9 and FD-V25 still refuse',
  'the corpus: the valid ask flow is clean, and FD-V47`s and FD-V48`s cases are refused by exactly their own rule',
  'the wiring check: an ask is a PRODUCER of its answerSchema and never a consumer, and no FD-R4 target',
  'the driver PARKS where a branch ENTERS an ask, nothing handed to the scheduler — W179`s interim refusal, expired at W180',
  'the code`s lists are the spec`s: the ask`s declared keys and its six refused keys, both ways',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test('the kind: FD-V24 accepts `ask` on every shape, with each declared key alone and all together', () => {
    cleanEveryShape(ASK(), 'an ask with nothing but edges is valid');
    cleanEveryShape(ASK({ settings: { question: 'Publish?' } }), 'with settings');
    cleanEveryShape(ASK({ answerSchema: ANSWER }), 'with an answerSchema');
    // `"."` is the one reference legal on every shape, the entry included (FD-V27: an entry is reachable from nothing).
    cleanEveryShape(ASK({ needs: { received: '.' } }), 'with needs');
    cleanEveryShape(ASK({ settings: { question: 'Publish?', form: { kind: 'yes-no' } }, answerSchema: ANSWER, needs: { received: '.' } }), 'with every key it declares');
    // The CONTROL beside the acceptance: the kind's spelling is the rule's, so a near miss is still FD-V24.
    for (const k of ['Ask', 'ASK', 'asks', 'question', 'decision']) {
      everyShape(ASK({ kind: k }), ['FD-V24'], `kind ${JSON.stringify(k)} is FD-V24`);
    }
    const msg = at(SHAPES[0]![1](ASK({ kind: 'decision' })))[0]!.detail;
    ok(msg.includes('|ask'), `FD-V24's message lists the seventh kind: ${msg}`);
  });

  test('FD-V47 — each of the six task keys refused on an ask by FD-V47 ALONE, one finding per key, beside the same key accepted on a task', () => {
    equal([...Object.keys(TASK_VALUES)].sort(), ['optional', 'pool', 'retryPolicy', 'transform', 'type', 'workerGroups'],
      'the six keys section 5`s FD-V47 row names, hand-written');
    for (const [k, v] of Object.entries(TASK_VALUES)) {
      everyShape(ASK({ [k]: v }), ['FD-V47'], `${k} on an ask is FD-V47 and nothing else — FD-V17 silent`);
      const fs = at(SHAPES[0]![1](ASK({ [k]: v })));
      equal(fs.length, 1, `${k}: ONE finding`);
      ok(fs[0]!.detail.includes(`"${k}"`), `${k}: the finding names the key — ${fs[0]!.detail}`);
      // The control: the same key, the same value, on a TASK in the same position, is accepted.
      const task = SHAPES[0]![1]({ id: 'approve', kind: 'task', type: 'ScoreWorker', edges: [{ on: ['failed'], to: 'declined' }, { to: 'after' }], [k]: v });
      equal(validateDefinition(task, registry).map((f) => `${f.rule}@${f.at}`), [], `${k}: the same key on a task is accepted — the refusal is the ask's`);
    }
    // A key of the WRONG shape on an ask is still FD-V47 alone: no FD-V30, FD-V31, FD-V21 or FD-V37 is asked of a key
    // the ask may not carry at all (the shape a task's own rule would refuse, so only FD-V47 can hold).
    for (const [k, v] of [['retryPolicy', 'never'], ['workerGroups', []], ['optional', 'yes'], ['transform', { lang: 'path' }], ['type', 5], ['pool', 'nowhere']] as const) {
      everyShape(ASK({ [k]: v }), ['FD-V47'], `${k}: ${JSON.stringify(v)} on an ask is FD-V47 alone, not the task rule that owns the shape`);
    }
    // All six at once: SIX findings, one per key.
    const all = at(SHAPES[0]![1](ASK({ ...TASK_VALUES })));
    equal(all.map((f) => f.rule), ['FD-V47', 'FD-V47', 'FD-V47', 'FD-V47', 'FD-V47', 'FD-V47'], 'six keys, six FD-V47 findings');
    // The transform's message says why an ask cannot run one (P35 decision 6, FD-C6).
    const tr = at(SHAPES[0]![1](ASK({ transform: TASK_VALUES.transform })))[0]!.detail;
    ok(tr.includes('FD-C6') && tr.includes('needs'), `the transform's finding names FD-C6 and points at needs: ${tr}`);
    // And the OTHER door: a key no kind declares on an ask is FD-V17, never FD-V47.
    everyShape(ASK({ question: 'Publish?' }), ['FD-V17'], 'a key no kind declares is FD-V17 on an ask, not FD-V47');
    everyShape(ASK({ over: 'files' }), ['FD-V17'], 'a MAP key on an ask is FD-V17 — FD-V47 owns the six TASK keys only');
  });

  test('FD-V48 — answerSchema held to the schema subset: in it accepted, outside it refused by FD-V48 alone, naming where', () => {
    for (const [why, s] of [
      ['the empty schema, which accepts everything', {}],
      ['a scalar type', { type: 'boolean' }],
      ['an object with an example it accepts', ANSWER],
      ['the v0.36 annotations', { type: 'string', title: 'Reason', description: 'why', readOnly: false }],
    ] as const) cleanEveryShape(ASK({ answerSchema: s }), `answerSchema ${why} is in the subset`);
    for (const [why, s, where] of [
      ['pattern, outside the subset', { type: 'object', properties: { code: { type: 'string', pattern: '^[A-Z]{3}$' } } }, '$.properties.code: keyword "pattern"'],
      ['not a plain object', 'yes-or-no', '$: a schema is a plain object'],
      ['an array', [{ type: 'string' }], '$: a schema is a plain object'],
      ['additionalProperties as a schema', { type: 'object', additionalProperties: { type: 'string' } }, '$.additionalProperties'],
      ['an example that refutes it', { type: 'boolean', examples: ['yes'] }, '$.examples[0]'],
      ['an unknown type name', { type: 'bool' }, '$.type'],
      ['a deprecated annotation', { type: 'string', deprecated: true }, 'keyword "deprecated"'],
    ] as const) {
      everyShape(ASK({ answerSchema: s }), ['FD-V48'], `answerSchema ${why} is FD-V48 alone`);
      const d = at(SHAPES[0]![1](ASK({ answerSchema: s })))[0]!.detail;
      ok(d.includes(where), `${why}: the finding names where — expected ${JSON.stringify(where)} in ${d}`);
    }
  });

  test('settings is opaque: any plain object accepted unread, anything else FD-V21 alone', () => {
    for (const s of [{}, { question: 'x' }, { question: 'x', choices: ['a', 'b'], nested: { deep: [1, null] } }, { key: 'not.a.key.path[0]' }]) {
      cleanEveryShape(ASK({ settings: s }), `settings ${JSON.stringify(s)} is accepted — the library reads none of it (a gate's key-path grammar is not asked)`);
    }
    for (const s of ['Publish?', 5, true, null, [], [{ question: 'x' }]]) {
      everyShape(ASK({ settings: s }), ['FD-V21'], `settings ${JSON.stringify(s)} is FD-V21 alone — no FD-V33 or FD-V40, which ask a TYPE`);
    }
  });

  test('edges: required (FD-V23) and held as a task`s (FD-V7, FD-V18, FD-V41, FD-V43) — a decline edge and a `when` over the answer accepted', () => {
    const noEdges = ASK(); delete (noEdges as Record<string, unknown>).edges;
    everyShape(noEdges, ['FD-V23', 'FD-V7'], 'an ask with no edges is FD-V23 (required) and FD-V7 (no edges), as a task is');
    ok(at(SHAPES[0]![1](noEdges)).some((f) => f.rule === 'FD-V7' && f.detail.startsWith('ask node')), 'and FD-V7 names the kind it is holding');
    everyShape(ASK({ edges: [] }), ['FD-V7'], 'an EMPTY edges is FD-V7 alone');
    everyShape(ASK({ edges: [{ on: ['failed'], to: 'declined' }] }), ['FD-V7'], 'a decline edge alone: no edge is eligible for done');
    everyShape(ASK({ edges: [{ when: { path: 'outcome.result.approved', op: 'eq', value: true }, to: 'after' }] }), ['FD-V7'], 'a guarded done edge with no default');
    everyShape(ASK({ edges: [{ to: 'after' }, { when: { path: 'outcome.result.approved', op: 'eq', value: true }, to: 'declined' }] }), ['FD-V7'], 'the default not last');
    everyShape(ASK({ edges: [{ on: ['user_action'], to: 'declined' }, { to: 'after' }] }), ['FD-V18'], 'on: user_action is FD-V18, as on a task');
    everyShape(ASK({ edges: [{ route: 'approve', to: 'after' }] }), ['FD-V41'], 'a gate-style route on an ask`s edge is FD-V41 — no route grammar on an ask (P35 (h))');
    everyShape(ASK({ edges: [{ when: { path: 'input.approved', op: 'eq', value: true }, to: 'declined' }, { to: 'after' }] }), ['FD-V43'], 'the `input` root is a gate`s, refused on an ask`s edge as on a task`s');
    // The accepted neighbours: the decline edge, a declared `when` over the ANSWER, a registered name, an edge needs.
    cleanEveryShape(ASK({ edges: [
      { on: ['failed'], to: 'declined' },
      { when: { path: 'outcome.result.approved', op: 'eq', value: true }, to: 'after' },
      { to: 'declined' },
    ] }), 'a decline edge, a `when` over outcome.result and a default');
    cleanEveryShape(ASK({ edges: [{ when: { predicate: 'isApproved' }, to: 'after' }, { to: 'declined' }] }), 'a registered predicate over the answer');
    everyShape(ASK({ edges: [{ when: { predicate: 'isMissing' }, to: 'after' }, { to: 'declined' }] }), ['FD-V4'], 'an unregistered name is FD-V4, as on a task');
    // One edge for both answers leaves `declined` unreachable (FD-V11, at `declined`) — so the claim is AT the ask.
    everyShape(ASK({ edges: [{ on: ['done', 'failed'], to: 'after' }] }), [], 'one edge for both answers is nothing at the ask');
  });

  test('FD-V27 admits a reference to an ask — on a node and on an edge — and FD-V28 and FD-V29 ask of it what they ask of a task', () => {
    const top = (nodes: Record<string, unknown>[]) => ({ flowId: 'ref', version: 1, entry: 'ingest', nodes }) as unknown as FlowDefinition;
    const rules = (d: FlowDefinition) => violatedRules(validateDefinition(d, registry));
    // A node's needs and an edge's needs naming the ask: accepted.
    equal(rules(top([
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'approve' }] },
      ASK(),
      { id: 'after', kind: 'task', type: 'PublishWorker', needs: { answer: 'approve', doc: 'ingest' },
        edges: [{ when: { path: 'needs.answer.approved', op: 'eq', value: true }, needs: { answer: 'approve' }, to: 'done' }, { to: 'done' }] },
      { id: 'declined', kind: 'end', outcome: 'declined' },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ])), [], 'a node`s needs and an edge`s needs naming an ask upstream are accepted — its answer is its output');
    // CONTROLS: a reference to a kind that produces nothing is still FD-V27, with the widened sentence.
    const toFanout = top([
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
      { id: 'a', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'b', kind: 'ask', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'after' }] },
      { id: 'after', kind: 'task', type: 'PublishWorker', needs: { r: 'split', ans: 'b' }, edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ]);
    const f27 = validateDefinition(toFanout, registry).filter((f) => f.rule === 'FD-V27');
    equal(f27.length, 1, 'ONE FD-V27: the fanout — and not the ask beside it, in the same needs');
    ok(f27[0]!.detail.includes('"split"') && f27[0]!.detail.includes('only a task or an ask produces an output'), `the message is the widened sentence: ${f27[0]!.detail}`);
    // FD-V27's reachability clause applies to an ask as to a task: an ask naming what comes AFTER it.
    equal(rules(top([
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'approve' }] },
      ASK({ needs: { later: 'after' } }),
      { id: 'after', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
      { id: 'declined', kind: 'end', outcome: 'declined' },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ])), ['FD-V27'], 'an ask`s own needs naming a node downstream of it is FD-V27');
    // FD-V28: an ask in a MAP region produces one output per item, so from outside the region it is ["approve"].
    const map = (ref: unknown) => ({ flowId: 'ref-map', version: 1, entry: 'ingest', nodes: [
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'map', over: 'files', branch: 'approve' },
      ASK({ edges: [{ to: 'collect' }] }),
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'after' }] },
      { id: 'after', kind: 'task', type: 'PublishWorker', needs: { answers: ref }, edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ] }) as unknown as FlowDefinition;
    equal(rules(map('approve')), ['FD-V28'], 'an ask inside a map region named as ONE value from outside it is FD-V28');
    equal(rules(map(['approve'])), [], 'and as a list it is accepted — one answer per item');
    // FD-V29: an ask reached only through a decision may not have run.
    const decided = (ref: string) => top([
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ when: { predicate: 'isApproved' }, to: 'approve' }, { to: 'after' }] },
      ASK({ edges: [{ to: 'after' }] }),
      { id: 'after', kind: 'task', type: 'PublishWorker', needs: { answer: ref }, edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ]);
    equal(rules(decided('approve')), ['FD-V29'], 'an UNCONDITIONAL reference to an ask a decision routes around is FD-V29');
    equal(rules(decided('approve?')), [], 'and the conditional form is accepted');
  });

  test('where an ask stands: wherever a task may — entry, branch entry, map branch, nested — and the kinds FD-V9 and FD-V25 still refuse', () => {
    // The four shapes are each clean above (FD-V3 at the entry, FD-V9 as a branch entry, FD-V25 as a map's branch).
    // The CONTROLS on the same rules: a gate as a fan-out's branch entry, an end as a map's branch, an end at the entry.
    const fanoutGate = SHAPES[2]![1]({ id: 'approve', kind: 'gate', type: 'distinct', edges: [{ to: 'after' }, { route: 'duplicate', to: 'declined' }, { route: 'nokey', to: 'declined' }] });
    const v9 = validateDefinition(fanoutGate, registry).filter((f) => f.rule === 'FD-V9');
    equal(v9.map((f) => f.at), ['split'], 'a gate as a branch entry is still FD-V9');
    ok(v9[0]!.detail.includes('not a task or an ask'), `FD-V9's message names both kinds it admits: ${v9[0]!.detail}`);
    const mapEnd = SHAPES[3]![1]({ id: 'approve', kind: 'end', outcome: 'x' });
    const v25 = validateDefinition(mapEnd, registry).filter((f) => f.rule === 'FD-V25');
    equal(v25.map((f) => f.at), ['split'], 'an end as a map`s branch is still FD-V25');
    ok(v25[0]!.detail.includes('not a task or an ask'), `FD-V25's message names both kinds it admits: ${v25[0]!.detail}`);
    // Nested (Q6): an ask as the branch of a map that is itself a fan-out's branch member.
    const nested = { flowId: 'ask-nested', version: 1, entry: 'ingest', nodes: [
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['prep', 'other'] },
      { id: 'prep', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'each' }] },
      { id: 'each', kind: 'map', over: 'items', branch: 'approve' },
      ASK({ edges: [{ on: ['failed'], to: 'declined' }, { to: 'inner' }] }),
      { id: 'declined', kind: 'end', outcome: 'declined' },
      { id: 'inner', kind: 'join', of: 'each', edges: [{ to: 'collect' }] },
      { id: 'other', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ] } as unknown as FlowDefinition;
    equal(validateDefinition(nested, registry).map((f) => `${f.rule}@${f.at}`), [], 'an ask in a map in a fan-out branch, its decline leaving both regions for an end — valid');
    const regions = allRegions(buildGraph(nested), nested).filter((r) => r.members.has('approve')).map((r) => r.fanoutId).sort();
    equal(regions, ['each', 'split'], 'and it IS in both regions — the shape is the nested one, not a flat one');
  });

  test('the corpus: the valid ask flow is clean, and FD-V47`s and FD-V48`s cases are refused by exactly their own rule', async () => {
    const load = async (rel: string) => JSON.parse(await readText(`${ROOT}spec/examples/${rel}`)) as FlowDefinition;
    const corpus = JSON.parse(await readText(`${ROOT}spec/examples/registry.json`)) as { predicates: string[]; nodeTypes: Record<string, { worker: string }>; workers: Record<string, { url: string }> };
    const reg: Registry = { predicates: corpus.predicates, workers: corpus.workers, nodeTypes: corpus.nodeTypes };
    const ask = await load('valid/ask.flow.json');
    equal(validateDefinition(ask, reg), [], 'ask.flow.json is valid');
    equal(ask.entry, 'approve', 'its ENTRY is an ask');
    equal(ask.nodes.filter((n) => n.kind === 'ask').map((n) => n.id).sort(), ['approve', 'confirm', 'revise'], 'it carries three asks');
    // Reading R8: no task node and no region, so neither `test/driver/needs.test.ts`'s region census (which RUNS each
    // region-bearing flow) nor `spec/outcome-record.md` section 4's task-node census moved before W180 — which added the
    // task-bearing and region-bearing ask flows beside this one (W179's S-2).
    equal(ask.nodes.filter((n) => n.kind === 'task').length, 0, 'no task node — reading R8');
    equal(allRegions(buildGraph(ask), ask).length, 0, 'no region — reading R8');
    const a = ask.nodes.find((n) => n.id === 'approve') as unknown as Record<string, unknown>;
    equal(Object.keys(a).sort(), ['answerSchema', 'edges', 'id', 'kind', 'needs', 'settings'], 'its entry ask carries every key the kind declares');
    const c = ask.nodes.find((n) => n.id === 'confirm') as unknown as Record<string, unknown>;
    equal(Object.keys(c).sort(), ['edges', 'id', 'kind'], 'and `confirm` nothing but what the kind requires');
    equal((ask.nodes.find((n) => n.id === 'revise') as { needs?: unknown }).needs, { earlier: 'approve' }, 'and `revise` references an ask');
    const v47 = validateDefinition(await load('invalid/FD-V47--an-ask-with-a-type-and-a-transform.flow.json'), reg);
    equal(v47.map((f) => `${f.rule}@${f.at}`), ['FD-V47@approve', 'FD-V47@approve'], 'FD-V47`s case: two findings, the type and the transform, and nothing else');
    const v48 = validateDefinition(await load('invalid/FD-V48--an-answer-schema-with-a-pattern.flow.json'), reg);
    equal(v48.map((f) => `${f.rule}@${f.at}`), ['FD-V48@approve'], 'FD-V48`s case: one finding, and nothing else');
  });

  test('the wiring check: an ask is a PRODUCER of its answerSchema and never a consumer, and no FD-R4 target', async () => {
    const wr: WiringRegistry = {
      workers: {
        approved: { url: 'test://approved', inputSchema: { type: 'object', required: ['approved'], properties: { approved: { type: 'boolean' } } } },
        scored: { url: 'test://scored', inputSchema: { type: 'object', required: ['score'], properties: { score: { type: 'number' } } } },
        source: { url: 'test://source', outputSchema: { type: 'object', required: ['text'], properties: { text: { type: 'string' } }, examples: [{ text: 'x' }] } },
        wrapped: { url: 'test://wrapped', inputSchema: { type: 'object', required: ['answer'], properties: { answer: { type: 'object', required: ['approved'], properties: { approved: { type: 'boolean' } } } } } },
      },
      nodeTypes: { Approved: { worker: 'approved' }, Scored: { worker: 'scored' }, Source: { worker: 'source' }, Wrapped: { worker: 'wrapped' } },
    };
    const flow = (askExtra: Record<string, unknown>, consumer: string, entry = 'src') => ({ flowId: 'w', version: 1, entry, nodes: [
      { id: 'src', kind: 'task', type: 'Source', edges: [{ to: 'approve' }] },
      { id: 'approve', kind: 'ask', edges: [{ to: 'use' }], ...askExtra },
      { id: 'use', kind: 'task', type: consumer, edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ] }) as unknown as FlowDefinition;
    const report = await checkWiring(wr, flow({ answerSchema: ANSWER }, 'Approved'));
    equal(report.verdicts.map((v) => `${v.producer} -> ${v.consumer}: ${v.kind}`), ['approve -> use: fits'],
      'ONE verdict: the arc OUT of the ask, its answerSchema against the consumer — and none for the arc INTO it');
    equal(report.verdicts[0]!.shape, 'edge', 'an ask`s arc is an edge');
    equal((await checkWiring(wr, flow({ answerSchema: ANSWER }, 'Scored'))).verdicts.map((v) => v.kind), ['no'],
      'a consumer requiring a key the answerSchema never emits (closed) is `no` — the schema is READ');
    const none = (await checkWiring(wr, flow({}, 'Approved'))).verdicts;
    equal(none.map((v) => v.kind), ['unchecked'], 'an ask with no answerSchema sends an unchecked arc');
    ok(none[0]!.why.includes('"approve" is an ask') && none[0]!.why.includes('answerSchema'), `naming the ask and the key: ${none[0]!.why}`);
    const bad = (await checkWiring(wr, flow({ answerSchema: { type: 'string', pattern: 'x' } }, 'Approved'))).verdicts;
    equal(bad.map((v) => v.kind), ['unchecked'], 'an answerSchema outside the subset is never handed to the witness generator');
    ok(bad[0]!.why.includes('FD-V48'), `and the reason names FD-V48: ${bad[0]!.why}`);
    // A `needs` naming the ask composes its answerSchema.
    const viaNeeds = { flowId: 'w2', version: 1, entry: 'src', nodes: [
      { id: 'src', kind: 'task', type: 'Source', edges: [{ to: 'approve' }] },
      { id: 'approve', kind: 'ask', answerSchema: ANSWER, edges: [{ to: 'use' }] },
      { id: 'use', kind: 'task', type: 'Wrapped', needs: { answer: 'approve' }, edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ] } as unknown as FlowDefinition;
    equal((await checkWiring(wr, viaNeeds)).verdicts.map((v) => `${v.shape}:${v.kind}`), ['needs:fits'], 'a needs naming the ask carries its answerSchema');
    // An ask as a fan-out's branch: its answer is that branch's key — `0` — in the join's record. A consumer naming a
    // key the record never mints never meets it (the header's leniency), so the DISCRIMINATING consumer requires a key
    // `0` CANNOT carry if `0` is the ask's closed answerSchema: `no` exactly when the ask's branch arrives.
    const wr2: WiringRegistry = { ...wr, workers: { ...wr.workers,
      zeroScore: { url: 'test://zs', inputSchema: { type: 'object', properties: { '0': { type: 'object', required: ['score'] } } } },
      zeroApproved: { url: 'test://za', inputSchema: { type: 'object', properties: { '0': { type: 'object', required: ['approved'], properties: { approved: { type: 'boolean' } } } } } },
    }, nodeTypes: { ...wr.nodeTypes, ZeroScore: { worker: 'zeroScore' }, ZeroApproved: { worker: 'zeroApproved' } } };
    const region = (consumer: string) => ({ flowId: 'w3', version: 1, entry: 'src', nodes: [
      { id: 'src', kind: 'task', type: 'Source', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['approve', 'other'] },
      { id: 'approve', kind: 'ask', answerSchema: ANSWER, edges: [{ to: 'collect' }] },
      { id: 'other', kind: 'task', type: 'Source', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'use' }] },
      { id: 'use', kind: 'task', type: consumer, edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ] }) as unknown as FlowDefinition;
    equal((await checkWiring(wr2, region('ZeroScore'))).verdicts.filter((v) => v.consumer === 'use').map((v) => `${v.shape}:${v.kind}`), ['record:no'],
      'the ask`s branch ARRIVES in the record: its key `0` is the answerSchema, which never carries `score`');
    equal((await checkWiring(wr2, region('ZeroApproved'))).verdicts.filter((v) => v.consumer === 'use').map((v) => `${v.shape}:${v.kind}`), ['record:fits'],
      'and the control: `0` requiring what the answer guarantees fits');
    // No FD-R4 target: an entry ask lists nothing; a task at the entry lists itself.
    equal((await checkWiring(wr, flow({ answerSchema: ANSWER }, 'Approved', 'approve'))).entry, [], 'an entry ask is no start target');
    equal((await checkWiring(wr, flow({ answerSchema: ANSWER }, 'Approved'))).entry, ['src'], 'the control: an entry task is');
  });

  test('the driver PARKS where a branch ENTERS an ask, nothing handed to the scheduler — W179`s interim refusal, expired at W180', () => {
    // ADR 0108 rule 8's interim refusal ENDED at W180 (ADR 0109): the arm PARKS. The same four roads the refusal was
    // asserted on, each now a park with nothing handed to the scheduler for the ask — and no failure reported.
    const make = (def: FlowDefinition) => {
      const added: string[] = [];
      const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
      const scheduler = {
        addTask: (t: { id: string }) => { added.push(t.id); },
        addEventListener: (type: string, fn: (e: { detail: unknown }) => void) => { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
      };
      const failures: { kind: string }[] = [];
      const driver = new Driver(def, {
        runId: 'r1', scheduler: scheduler as never, createTask: (c: unknown) => c as never, predicates: new Map(),
        joinPolicy: liveToken as never, ...typesFor(['IngestWorker', 'ScoreWorker', 'PublishWorker', 'ReviewWorker']),
        onRunFailure: (f: { kind: string }) => failures.push({ kind: f.kind }),
      } as never);
      const settle = (id: string) => {
        const detail = { id, state: 'done', attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, result: { files: ['a'] } };
        for (const fn of listeners.get('task.completed') ?? []) fn({ detail });
      };
      return { driver, added, failures, settle };
    };
    const asked = (d: Driver) => d.foldInputs().filter((e) => e.kind === 'asked').map((e) => (e as { taskId: string }).taskId);
    // From start(): an entry ask parks, nothing handed on.
    const entry = make(SHAPES[1]![1](ASK()));
    entry.driver.start({});
    equal([entry.added, asked(entry.driver), entry.failures], [[], ['r1:approve:-:0'], []], 'an entry ask parks: nothing sent, one asked, nothing reported');
    equal(fold(entry.driver.foldInputs()).outcome, 'awaiting_action', 'the run awaits the person');
    // From a settlement: an ask after a task.
    const after = make(SHAPES[0]![1](ASK()));
    after.driver.start({});
    after.settle('r1:ingest:-:0');
    equal([after.added, asked(after.driver), after.failures], [['r1:ingest:-:0'], ['r1:approve:-:0'], []], 'an ask after a task parks when the task settles');
    // In a region: the ask as branch 0, and as branch 1 of an entry fan-out — its sibling task handed on either way.
    const region = make(SHAPES[2]![1](ASK()));
    region.driver.start({});
    region.settle('r1:ingest:-:0');
    equal([region.added, asked(region.driver)], [['r1:ingest:-:0', 'r1:other:1:0'], ['r1:approve:0:0']], 'a branch-entry ask parks and its sibling runs');
    const sibling = make({ flowId: 'ask-sibling', version: 1, entry: 'split', nodes: [
      { id: 'split', kind: 'fanout', branches: ['other', 'approve'] },
      { id: 'other', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
      ASK({ edges: [{ to: 'collect' }] }),
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ] } as unknown as FlowDefinition);
    sibling.driver.start({});
    equal([sibling.added, asked(sibling.driver), sibling.failures], [['r1:other:0:0'], ['r1:approve:1:0'], []], 'as the second branch: the sibling sent, the ask parked, nothing reported');
    const control = make(SHAPES[2]![1]({ id: 'approve', kind: 'task', type: 'ReviewWorker', edges: [{ on: ['failed'], to: 'declined' }, { to: 'after' }] }));
    control.driver.start({});
    control.settle('r1:ingest:-:0');
    equal(control.added.sort(), ['r1:approve:0:0', 'r1:ingest:-:0', 'r1:other:1:0'], 'the CONTROL: a task in the ask`s place IS dispatched');
    equal(asked(control.driver), [], 'and appends no asked element');
  });

  test('the code`s lists are the spec`s: the ask`s declared keys and its six refused keys, both ways', async () => {
    equal([...NODE_KEYS_DECLARED.ask!].sort(), ['answerSchema', 'edges', 'id', 'kind', 'needs', 'settings'], 'the ask`s declared keys, hand-written from section 2`s row');
    equal([...ASK_REFUSED_KEYS].sort(), ['optional', 'pool', 'retryPolicy', 'transform', 'type', 'workerGroups'], 'the six refused keys, hand-written from FD-V47`s row');
    equal(ASK_REFUSED_KEYS.filter((k) => !TASK_KEYS_DECLARED.includes(k)), [], 'every refused key is a TASK key — FD-V47 refuses what a task declares, nothing else');
    equal(ASK_REFUSED_KEYS.filter((k) => NODE_KEYS_DECLARED.ask!.includes(k)), [], 'and none is declared on an ask, so FD-V17 and FD-V47 never both own one');
    const spec = await readText(`${ROOT}spec/flow-definition.md`);
    const row = spec.split('\n').find((l) => l.startsWith('| `FD-V47` |')) ?? '';
    // The ENUMERATION only — the clause between the rule's bold head and its version mark — because the row's prose
    // names `transform` again further on, and a key dropped from the list must not be found there (the author's P2).
    const head = /declares\*\* — (.*?) — v0\.42/.exec(row)?.[1] ?? '';
    ok(head.length > 0, `FD-V47's row carries its enumeration where this reads it: ${row.slice(0, 120)}`);
    const named = [...head.matchAll(/`([A-Za-z]+)`/g)].map((m) => m[1]!).sort();
    equal(named, [...ASK_REFUSED_KEYS].sort(), 'FD-V47`s row enumerates exactly the six, and nothing else');
  });

  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run — it was deleted, renamed, or its suite stopped loading');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name. Add it here in the same commit');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership, which catches a duplicated name');
  });
});
