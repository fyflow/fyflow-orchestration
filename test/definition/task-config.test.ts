/**
 * **`FD-V30` and `FD-V31` — what a node says about its own task, every clause, on every
 * SHAPE** — `spec/flow-definition.md` section 2 (v0.16) and section 5,
 * [W58](../../doc/work-items/w58-what-a-node-says-about-its-own-task.md).
 *
 * **Every case below runs on THREE shapes, and that is `doc/workflow.md` section 5 rule 8
 * obligation (a)'s v0.16 clause applied before a reader had to.** A rule stated over *a task
 * node* ranges over a top-level task, a task inside a `fanout` branch, and the branch task of a
 * `map` — and W41 and W53 each shipped a rule wrong about the shape the author's set did not use.
 * So the refusals are asserted as a function of the shape, and a case that fires on one shape
 * and not another fails naming which.
 *
 * Every expected value is the rule id from section 5, and the shape of each refused value comes
 * from what the SCHEDULER was measured to do with it in silence (section 2's blockquote): `{}`
 * means *no retries*, a string `maxRetries` retries by coercion, an unknown group id is ignored.
 */
import { equal, ok, readText, ROOT, suite } from '../harness.ts';
import {
  NODE_KEYS_DECLARED, RETRY_POLICY_KEYS, retryPolicyProblem, TASK_KEYS_DECLARED, validateDefinition, violatedRules,
} from '../../src/definition/validate.ts';
import type { FlowDefinition, Registry } from '../../src/definition/types.ts';
import { shapesOf } from './task-shapes.ts';

const registry: Registry = {
  predicates: new Set<string>(),
  workerTypes: new Set(['IngestWorker', 'ScoreWorker', 'PublishWorker', 'MergeWorker']),
  groups: new Set(['gpu', 'api']),
};

/**
 * The three shapes a task node takes, each a function from *what the task under test carries* to
 * a whole document. `at` is the id `FD-V30`/`FD-V31` must report for that shape.
 */
const SHAPES: readonly [string, string, (extra: Record<string, unknown>) => FlowDefinition][] = [
  ['top-level task', 'score', (extra) => ({
    flowId: 'shape-top', version: 1, entry: 'score',
    nodes: [
      { id: 'score', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'done' }], ...extra },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  }) as unknown as FlowDefinition],
  ['task inside a fanout branch', 'scoreA', (extra) => ({
    flowId: 'shape-fanout', version: 1, entry: 'ingest',
    nodes: [
      { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
      { id: 'scoreA', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }], ...extra },
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
      { id: 'rank', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'gather' }], ...extra },
      { id: 'gather', kind: 'join', of: 'each', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  }) as unknown as FlowDefinition],
];

/** The rule fires, ALONE, at the node the shape names — and says so if it does not. */
function refused(rule: string, at: string, d: FlowDefinition, reg: Registry, label: string): void {
  const findings = validateDefinition(d, reg);
  equal(violatedRules(findings), [rule],
    `${rule} must be the ONLY rule that fires for ${label} — a refused shape that also trips ` +
      `FD-V17 or FD-V21 would be a rule that does not own its key. Reported: ` +
      `${violatedRules(findings).join(', ') || '(nothing — accepted)'}`);
  equal(findings.filter((f) => f.rule === rule).map((f) => f.at), findings.filter((f) => f.rule === rule).map(() => at),
    `${rule} reports the node it is about (${at}) for ${label}`);
}

function accepted(d: FlowDefinition, reg: Registry, label: string): void {
  const findings = validateDefinition(d, reg);
  equal(findings, [], `${label} must be ACCEPTED, got ${findings.map((f) => `${f.rule}: ${f.detail}`).join('; ')}`);
}

suite('FD-V30 — retryPolicy is exactly the scheduler`s shape, every clause, on every shape', (test) => {
  // [label, value]. Each is something the scheduler was measured to accept in silence or to
  // coerce, except the last three, which are the scheduler's declared type and are accepted.
  const REFUSED: readonly [string, unknown][] = [
    ['null', null],
    ['an array', [1, 0]],
    ['a string', '1'],
    ['a number', 1],
    ['{} — silently means no retries upstream', {}],
    ['{maxRetries} alone — backoffMs missing', { maxRetries: 1 }],
    ['{backoffMs} alone — maxRetries missing, silently no retries upstream', { backoffMs: 0 }],
    ['a key beside the two — dropped in silence upstream', { maxRetries: 1, backoffMs: 0, jitter: 5 }],
    ['maxRetries a string — RETRIES by coercion upstream', { maxRetries: '1', backoffMs: 0 }],
    ['maxRetries a fraction', { maxRetries: 1.5, backoffMs: 0 }],
    ['maxRetries negative', { maxRetries: -1, backoffMs: 0 }],
    ['maxRetries NaN', { maxRetries: NaN, backoffMs: 0 }],
    ['maxRetries Infinity', { maxRetries: Infinity, backoffMs: 0 }],
    ['maxRetries a boolean', { maxRetries: true, backoffMs: 0 }],
    ['backoffMs a string', { maxRetries: 1, backoffMs: '5' }],
    ['backoffMs negative — Node warns and retries at once upstream', { maxRetries: 1, backoffMs: -5 }],
    ['backoffMs NaN', { maxRetries: 1, backoffMs: NaN }],
    ['backoffMs Infinity', { maxRetries: 1, backoffMs: Infinity }],
    ['backoffMs null', { maxRetries: 1, backoffMs: null }],
  ];
  const ACCEPTED: readonly [string, unknown][] = [
    ['{maxRetries: 0, backoffMs: 0} — explicit no-retries', { maxRetries: 0, backoffMs: 0 }],
    ['{maxRetries: 3, backoffMs: 250}', { maxRetries: 3, backoffMs: 250 }],
    ['a fractional backoffMs is a number', { maxRetries: 1, backoffMs: 0.5 }],
  ];
  for (const [shape, at, build] of SHAPES) {
    test(`${shape}: every refused shape fires FD-V30 alone at ${at}`, () => {
      // The loop is over a list; an emptied list passes vacuously, so the size is asserted
      // against section 5's own clause count: five clauses, and every one has at least one
      // case here (the map from clause to cases is the labels' own wording).
      ok(REFUSED.length >= 5 && new Set(REFUSED.map(([l]) => l)).size === REFUSED.length, 'the refused list is non-empty and its labels distinct');
      for (const [label, rp] of REFUSED) refused('FD-V30', at, build({ retryPolicy: rp }), registry, `retryPolicy = ${label}`);
    });
    test(`${shape}: every accepted shape validates clean`, () => {
      for (const [label, rp] of ACCEPTED) accepted(build({ retryPolicy: rp }), registry, `retryPolicy = ${label}`);
      accepted(build({}), registry, 'no retryPolicy at all');
    });
  }

  test('the detail names the key that is missing or extra, so an author reads which', () => {
    ok((retryPolicyProblem({ backoffMs: 0 }) ?? '').includes('"maxRetries"'), 'missing maxRetries is named');
    ok((retryPolicyProblem({ maxRetries: 0 }) ?? '').includes('"backoffMs"'), 'missing backoffMs is named');
    ok((retryPolicyProblem({ maxRetries: 0, backoffMs: 0, jitter: 1 }) ?? '').includes('"jitter"'), 'the extra key is named');
    equal(retryPolicyProblem({ maxRetries: 0, backoffMs: 0 }), null, 'and the exact shape has no problem');
    // **The not-an-object clause is observable only through its MESSAGE** — W58's rule 8 probe
    // `a1`: an array or a string has no `maxRetries` key, so the missing-key clause refuses it
    // anyway under the same id, and deleting the shape clause cost 0 until this bound existed.
    for (const v of [[1, 0], '1', 5, null]) {
      ok((retryPolicyProblem(v) ?? '').startsWith('retryPolicy must be an object'),
        `${JSON.stringify(v)} is refused for not being an object, not for a missing key: ${retryPolicyProblem(v)}`);
    }
  });

  test('RETRY_POLICY_KEYS is exactly the two keys section 2`s table names, both ways — obligation (e)`s third shape', async () => {
    // The document's row: `| \`retryPolicy\` | optional | … the two keys \`maxRetries\`, …, and \`backoffMs\`, … |`
    const spec = await readText(`${ROOT}spec/flow-definition.md`);
    const row = spec.split('\n').find((l) => l.startsWith('| `retryPolicy` |'));
    ok(row !== undefined, 'section 2 has a `retryPolicy` key-table row');
    const m = /the two keys `(\w+)`[^`]*`(\w+)`/.exec(row ?? '');
    ok(m !== null, 'the row names its two keys in the form "the two keys `a`, …, and `b`"');
    equal([...RETRY_POLICY_KEYS].sort(), [m![1]!, m![2]!].sort(),
      'the keys the validator requires are the keys the document declares, and no others');
  });
});

suite('FD-V31 — workerGroups names only groups the registry declares, every clause, on every shape', (test) => {
  const REFUSED: readonly [string, unknown][] = [
    ['a string rather than an array', 'gpu'],
    ['an object', { gpu: true }],
    ['an empty array — declares nothing while reading as though it did', []],
    ['a non-string entry', [1]],
    ['a null entry', [null]],
    ['a repeated entry — the scheduler dedupes it in silence', ['gpu', 'gpu']],
    ['an unknown id — the scheduler IGNORES it in silence (P16 fact 2)', ['nope']],
    ['a known id beside an unknown one', ['gpu', 'nope']],
  ];
  for (const [shape, at, build] of SHAPES) {
    test(`${shape}: every refused shape fires FD-V31 alone at ${at}`, () => {
      ok(REFUSED.length >= 5 && new Set(REFUSED.map(([l]) => l)).size === REFUSED.length, 'the refused list is non-empty and its labels distinct');
      for (const [label, wg] of REFUSED) refused('FD-V31', at, build({ workerGroups: wg }), registry, `workerGroups = ${label}`);
    });
    test(`${shape}: one known id, both known ids, and no key at all are accepted`, () => {
      accepted(build({ workerGroups: ['gpu'] }), registry, 'workerGroups = ["gpu"]');
      accepted(build({ workerGroups: ['api', 'gpu'] }), registry, 'workerGroups = ["api", "gpu"]');
      accepted(build({}), registry, 'no workerGroups at all');
    });
    test(`${shape}: ABSENT registry groups means EMPTY — a valid declaration is refused, naming the id`, () => {
      // The item's declared negative control, and the maintainer's call at W58's stop-and-ask:
      // *absent means unchecked* would hand the scheduler's silence back to exactly the consumer
      // who forgot the set.
      const omitted: Registry = { predicates: registry.predicates, workerTypes: registry.workerTypes };
      refused('FD-V31', at, build({ workerGroups: ['gpu'] }), omitted, 'workerGroups = ["gpu"] against a registry with NO groups key');
      refused('FD-V31', at, build({ workerGroups: ['gpu'] }), { ...omitted, groups: [] }, 'and against an EMPTY groups set');
      const f = validateDefinition(build({ workerGroups: ['gpu'] }), omitted).find((x) => x.rule === 'FD-V31');
      ok((f?.detail ?? '').includes('"gpu"') && (f?.detail ?? '').includes('no groups'),
        `the detail names the id and says the registry declares no groups: ${f?.detail}`);
    });
  }

  test('the detail names the id AND what the registry does declare, so the typo is visible beside its fix', () => {
    const [, , build] = SHAPES[0]!;
    const f = validateDefinition(build({ workerGroups: ['gpU'] }), registry).find((x) => x.rule === 'FD-V31');
    ok((f?.detail ?? '').includes('"gpU"') && (f?.detail ?? '').includes('"gpu"') && (f?.detail ?? '').includes('"api"'),
      `names the typo and the declared set: ${f?.detail}`);
    // **The non-string clause is observable only through its MESSAGE** — rule 8 probe `a11`:
    // `groups.has(1)` is false, so the unknown-id clause refuses a number anyway under the same
    // id. The message is what an author reads, so it is bound.
    for (const v of [1, null, true]) {
      const g = validateDefinition(build({ workerGroups: [v] }), registry).find((x) => x.rule === 'FD-V31');
      ok((g?.detail ?? '').includes('is not a string'), `${JSON.stringify(v)} is refused as not a string, not as unknown: ${g?.detail}`);
    }
  });

  test('the registry`s groups may be a Set or an array, as the other two sets may', () => {
    const [, , build] = SHAPES[0]!;
    accepted(build({ workerGroups: ['gpu'] }), { ...registry, groups: ['gpu'] }, 'groups as an array');
    accepted(build({ workerGroups: ['gpu'] }), { ...registry, groups: new Set(['gpu']) }, 'groups as a Set');
  });
});

suite('the task key table — section 2 and FD-V17 agree on what a task declares, both ways', (test) => {
  test('the corpus flow section 7 promises carries BOTH keys on exactly the three nodes its row names, one per shape', async () => {
    // **The `Outputs` row, bound** — rule 8 obligation (b), written before the set ran:
    // `spec/examples/valid/task-config.flow.json` is validated at L4 and never run, so
    // nothing else observes WHICH nodes carry the keys. Section 7's row names them, and
    // the names are read from the row rather than repeated here.
    const spec = await readText(`${ROOT}spec/flow-definition.md`);
    const row = spec.split('\n').find((l) => l.startsWith('| `task-config.flow.json` |')) ?? '';
    ok(row.length > 0, 'section 7 has the task-config row');
    const namedInRow = [...row.matchAll(/\(`(\w+)`[,)]/g)].map((m) => m[1]!).sort();
    equal(namedInRow, ['ingest', 'rank', 'scoreA'], `the row names the three carrying nodes in parentheses: ${namedInRow.join(', ')}`);
    const flow = JSON.parse(await readText(`${ROOT}spec/examples/valid/task-config.flow.json`)) as FlowDefinition;
    const carrying = flow.nodes
      .filter((n) => n.kind === 'task' && (n as { retryPolicy?: unknown }).retryPolicy !== undefined && (n as { workerGroups?: unknown }).workerGroups !== undefined)
      .map((n) => n.id).sort();
    equal(carrying, namedInRow, 'and exactly those nodes carry both keys in the file');
    // And the three are the three SHAPES: a top-level task, a fanout branch entry, a map's branch.
    const byId = new Map(flow.nodes.map((n) => [n.id, n]));
    const fanouts = flow.nodes.filter((n) => n.kind === 'fanout').flatMap((n) => (n as { branches: string[] }).branches);
    const mapBranches = flow.nodes.filter((n) => n.kind === 'map').map((n) => (n as { branch: string }).branch);
    equal([fanouts.includes('scoreA'), mapBranches.includes('rank'), byId.get('ingest')?.id === flow.entry], [true, true, true],
      'scoreA is a fanout branch entry, rank is a map branch, ingest is the top-level entry');
    equal(validateDefinition(flow, registry), [], 'and the document validates against a registry declaring gpu and api');
  });
  test('SHAPES is exactly the set of shapes the corpus flow`s carrying nodes take, both ways — W58`s adequacy reader (d01, d05)', async () => {
    // **The three shapes were a list bound to nothing but the printed case count**: with the map
    // shape deleted from `SHAPES`, a rule skipped on a map branch task cost ZERO (a compound the
    // reader ran). The corpus flow's three carrying nodes each take one shape, and that shape is
    // DERIVED from the document's structure here — entry, a fanout's branch entry, a map's branch —
    // so a shape deleted from the list fails naming itself, and a fourth shape nobody built for
    // fails too.
    const flow = JSON.parse(await readText(`${ROOT}spec/examples/valid/task-config.flow.json`)) as FlowDefinition;
    equal([...new Set(shapesOf(flow))].sort(), SHAPES.map(([label]) => label).sort(),
      'the shapes the corpus flow`s carrying nodes take are exactly the shapes every case here runs on');
  });
  test('TASK_KEYS_DECLARED equals the keys section 2`s `task` row lists — obligation (e)`s third shape (W42`s EDGE_KEYS, one row up)', async () => {
    const spec = await readText(`${ROOT}spec/flow-definition.md`);
    const row = spec.split('\n').find((l) => l.startsWith('| `task` |'));
    ok(row !== undefined, 'section 2 has a `task` kind-table row');
    const cell = (row ?? '').split('|')[2] ?? '';
    const documented = [...cell.matchAll(/`([A-Za-z]+)\??`/g)].map((m) => m[1]!).sort();
    ok(documented.length > 4, `the row parsed into a key list: ${documented.join(', ')}`);
    equal([...TASK_KEYS_DECLARED].sort(), documented,
      'the keys FD-V17 accepts on a task are exactly the keys the document declares — a key accepted and undocumented, or documented and refused, fails here naming itself');
  });
  test('and EVERY kind row agrees with FD-V17`s key set, both ways — the adequacy reader added retryPolicy to the map kind for zero (adj03)', async () => {
    const spec = await readText(`${ROOT}spec/flow-definition.md`);
    const rows = spec.split('\n').filter((l) => /^\| `(task|fanout|map|join|end)` \|/.test(l));
    equal(rows.length, 5, 'section 2 has one row per kind');
    const documented = Object.fromEntries(rows.map((row) => {
      const kind = /^\| `(\w+)` \|/.exec(row)![1]!;
      const cell = row.split('|')[2] ?? '';
      return [kind, [...cell.matchAll(/`([A-Za-z]+)\??`/g)].map((m) => m[1]!).sort()];
    }));
    const declared = Object.fromEntries(Object.entries(NODE_KEYS_DECLARED).map(([k, v]) => [k, [...v].sort()]));
    equal(declared, documented, 'the keys FD-V17 accepts, per kind, are exactly the keys section 2 declares, per kind — a key accepted on a kind that dispatches nothing fails here naming the kind');
  });
  test('and FD-V17 still refuses a key beside the two new ones — the bag P16 decision 3 refused', () => {
    const [, at, build] = SHAPES[0]!;
    const rules = violatedRules(validateDefinition(build({ task: { retryPolicy: { maxRetries: 1, backoffMs: 0 } } }), registry));
    equal(rules, ['FD-V17'], `an opaque \`task\` bag is FD-V17 at ${at}: ${rules.join(', ')}`);
  });
});
