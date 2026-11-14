/**
 * Ladder L1/L3/L4 — **the `loop` node kind in the definition** — `spec/flow-definition.md` v0.57 (section 2's `loop`, section
 * 3's `"$iteration"` row and the fifth arc of `"."`, section 4's *What a loop changes, and what it does not*, `FD-V50`,
 * `FD-V51` and the widened `FD-V26`/`FD-V28`/`FD-V29`, the wiring table's `round` and `carry` rows and its loop `record`),
 * `spec/task-id.md` v0.17 (`ID-R6` widened to a round),
 * [ADR 0145](../../doc/decisions/0145-a-loop-is-a-region-that-runs-its-one-branch-round-after-round.md),
 * [W228](../../doc/work-items/w228-the-loop-in-the-definition.md).
 *
 * **Every expected value is written from those rows, never read off a run.** A loop is a region of ONE branch whose entry
 * is a task or an ask; read from OUTSIDE it is read as after a map (P47 decision 1 (b′)), so the bare form of a body node
 * is `FD-V28` and the array form is green (P47 fact 13); its join is certain of LESS than a map's, because it fires on a
 * BREAK too (`FD-V29`'s v0.57 clause); `"$iteration"` names the innermost loop CONTAINING the reader and is `FD-V51`
 * where none does; a round's index is a dispatch-side segment (`ID-R6`); and the wiring check holds the body entry's
 * `inputSchema` against what reaches the loop (`round`) and against every body node with an edge to the join (`carry`),
 * one arc each, naming its producer. Each claim sits beside a CONTROL showing its observer can see.
 */
import { Validator } from '@cfworker/json-schema';
import { collected, equal, ok, readText, ROOT, suite, throws } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { validateDefinition } from '../../src/definition/validate.ts';
import { allRegions, branchIndexOf, branchPathOf, buildGraph, innermostLoopOf, UnresolvedBranchPath } from '../../src/definition/regions.ts';
import { boundaryTargets, checkWiring, type WiringVerdict } from '../../src/definition/wiring.ts';
import { definitionSchema } from '../../src/definition/definition-schema.ts';
import { PATH_LANGUAGE } from '../scheduler/fake-language.ts';
import { corpusRegistry, type CorpusRegistryDocument } from './corpus-types.ts';
import type { FlowDefinition, JsonSchema } from '../../src/definition/types.ts';

const SUITE = 'W228 — the loop node kind in the definition: FD-V50, FD-V51, read from outside as after a map, the break clause, ID-R6 for a round, the round and carry arcs, the schema';

const REGISTRY = { predicates: ['isLowConfidence'], ...typesFor(['IngestWorker', 'ScoreWorker', 'PublishWorker']) };
const doc = (nodes: unknown[], entry = 'ingest'): FlowDefinition =>
  ({ flowId: 'loop', version: 1, entry, nodes } as unknown as FlowDefinition);
const findingsOf = (d: FlowDefinition) => validateDefinition(d, REGISTRY);
const rulesOf = (d: FlowDefinition) => [...new Set(findingsOf(d).map((f) => f.rule))].sort();
const END = { id: 'done', kind: 'end', outcome: 'completed' };
const UNTIL = { path: 'input.ready', op: 'eq', value: true };
const t = (id: string, to: string, extra: Record<string, unknown> = {}) => ({ id, kind: 'task', type: 'ScoreWorker', edges: [{ to }], ...extra });

/** `ingest -> poll (loop, branch check) -> check -> polled (join) -> after -> done`, each piece overridable. */
const polling = (o: { loop?: Record<string, unknown>; check?: Record<string, unknown>; after?: Record<string, unknown> } = {}) => doc([
  { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'poll' }] },
  { id: 'poll', kind: 'loop', branch: 'check', until: UNTIL, maxIterations: 20, ...o.loop },
  t('check', 'polled', o.check),
  { id: 'polled', kind: 'join', of: 'poll', edges: [{ to: 'after' }] },
  { id: 'after', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }], ...o.after },
  END,
]);

/**
 * **P47 fact 13's document, for an opener of either kind**: `ingest -> R -> plan -> fit -> J -> promote`, `promote` reading
 * `fit` from OUTSIDE the region in the form given.
 */
const fact13 = (kind: 'loop' | 'map', fits: unknown) => doc([
  { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'R' }] },
  kind === 'loop'
    ? { id: 'R', kind: 'loop', branch: 'plan', until: { path: 'input.score', op: 'gte', value: 0.9 }, maxIterations: 5 }
    : { id: 'R', kind: 'map', over: 'items', branch: 'plan' },
  t('plan', 'fit'),
  t('fit', 'J'),
  { id: 'J', kind: 'join', of: 'R', edges: [{ to: 'promote' }] },
  { id: 'promote', kind: 'task', type: 'PublishWorker', needs: { result: '.', fits }, edges: [{ to: 'done' }] },
  END,
]);

/** **The break document**: `ingest -> L -> a -> b -> J -> out`, and — when `withBreak` — `a` also routes to the `end` `stop`. */
const breaking = (bs: unknown, withBreak: boolean) => doc([
  { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'L' }] },
  { id: 'L', kind: 'loop', branch: 'a', until: UNTIL, maxIterations: 3 },
  { id: 'a', kind: 'task', type: 'ScoreWorker', edges: withBreak ? [{ to: 'stop', when: { predicate: 'isLowConfidence' } }, { to: 'b' }] : [{ to: 'b' }] },
  t('b', 'J'),
  { id: 'stop', kind: 'end', outcome: 'stopped-early' },
  { id: 'J', kind: 'join', of: 'L', edges: [{ to: 'out' }] },
  { id: 'out', kind: 'task', type: 'PublishWorker', needs: { last: '.', bs }, edges: [{ to: 'done' }] },
  END,
].filter((n) => withBreak || (n as { id: string }).id !== 'stop'));

/** A loop inside a loop: `outer (branch a) -> a -> inner (branch b) -> b -> ij -> c -> oj`. */
const loopInLoop = (o: { inner?: Record<string, unknown>; b?: Record<string, unknown>; c?: Record<string, unknown> } = {}) => doc([
  { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'outer' }] },
  { id: 'outer', kind: 'loop', branch: 'a', until: UNTIL, maxIterations: 4 },
  t('a', 'inner'),
  { id: 'inner', kind: 'loop', branch: 'b', until: UNTIL, maxIterations: 4, ...o.inner },
  t('b', 'ij', o.b),
  { id: 'ij', kind: 'join', of: 'inner', edges: [{ to: 'c' }] },
  t('c', 'oj', o.c),
  { id: 'oj', kind: 'join', of: 'outer', edges: [{ to: 'done' }] },
  END,
]);

/** A loop inside a map instance: `m (map over items, branch a) -> a -> L (branch b) -> b -> lj -> c -> mj`. */
const loopInMap = (o: { b?: Record<string, unknown>; c?: Record<string, unknown> } = {}) => doc([
  { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'm' }] },
  { id: 'm', kind: 'map', over: 'items', branch: 'a' },
  t('a', 'L'),
  { id: 'L', kind: 'loop', branch: 'b', until: UNTIL, maxIterations: 4 },
  t('b', 'lj', o.b),
  { id: 'lj', kind: 'join', of: 'L', edges: [{ to: 'c' }] },
  t('c', 'mj', o.c),
  { id: 'mj', kind: 'join', of: 'm', edges: [{ to: 'done' }] },
  END,
]);

/** A map inside a loop round: `L (branch a) -> a -> m (map, branch b) -> b -> mj -> c -> lj`. */
const mapInLoop = (o: { b?: Record<string, unknown>; c?: Record<string, unknown> } = {}) => doc([
  { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'L' }] },
  { id: 'L', kind: 'loop', branch: 'a', until: UNTIL, maxIterations: 4 },
  t('a', 'm'),
  { id: 'm', kind: 'map', over: 'items', branch: 'b' },
  t('b', 'mj', o.b),
  { id: 'mj', kind: 'join', of: 'm', edges: [{ to: 'c' }] },
  t('c', 'lj', o.c),
  { id: 'lj', kind: 'join', of: 'L', edges: [{ to: 'done' }] },
  END,
]);

const DECLARED_CASES = [
  'FD-V50 refuses each of a loop`s own-key clauses ALONE, at the loop, its message naming the clause — beside the control that validates clean',
  'FD-V50`s kind clause: a body entry that is a map, a fanout or a loop is refused; a task and an ask are accepted',
  'an ABSENT required key is FD-V23 and a non-string branch FD-V21, never FD-V50 — and `until` is held to FD-V42-FD-V45 over the ONE root input',
  '"$iteration" is ACCEPTED inside a round — the branch entry, an edge in the body, a node two hops in, a node in a map inside the round, an inner loop node naming its enclosing round',
  'FD-V51 refuses "$iteration" where no loop contains the reader — after the join, before the loop, on a top-level loop node, on an edge — and FD-V26 its array and suffix forms',
  'P47 fact 13: read from OUTSIDE, a loop body node is read as after a map — the array form GREEN and the bare form FD-V28, for a loop and a map alike',
  'the break clause: a body that can reach an `end` makes a loop join certain of LESS — ["b"] FD-V29 with the break, ["b?"] valid, ["a"] valid, ["b"] valid with no break, with the end in a NESTED region, and after a MAP',
  'acceptances: both corpus loop flows, a map inside a loop, a loop inside a map instance and a loop inside a loop validate clean — and innermostLoopOf names the innermost loop',
  'branchPathOf: a node in a round needs its ROUND index (ID-R6 widened), nested with a map either way, and refuses without it or with one that is not a segment — and branchIndexOf refuses a round member',
  'checkWiring: the ROUND arc and one CARRY arc per body node reaching the join, each matching and mismatching, naming its producer — and the loop join`s record built from the join ARRIVAL',
  'definitionSchema() carries FD-V50`s own-key clauses and until`s grammar beside validateDefinition, and accepts what it does not carry — the kind clause and FD-V51',
  'FD-V2, FD-V6 and FD-V12 name a loop: a dangling branch, no join and two joins, a branch that is its own join',
  'boundaryTargets through an ENTRY loop: round 0`s body entry held to the payload, or to the SEED its needs composes — and nothing past the entry',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, () => {
    equal(findingsOf(polling()), [], 'the CONTROL: the polling document validates clean, so every refusal below is its one edit');
    const cases: [string, Record<string, unknown>, string][] = [
      ['edges on a loop', { edges: [{ to: 'after' }] }, 'loop has edges'],
      ['maxIterations 0', { maxIterations: 0 }, 'loop maxIterations 0 is not an integer >= 1'],
      ['maxIterations 1.5', { maxIterations: 1.5 }, 'loop maxIterations 1.5 is not an integer >= 1'],
      ['maxIterations "3"', { maxIterations: '3' }, 'loop maxIterations "3" is not an integer >= 1'],
      ['maxIterations -2', { maxIterations: -2 }, 'loop maxIterations -2 is not an integer >= 1'],
      ['maxIterationsFrom "budget..rounds"', { maxIterationsFrom: 'budget..rounds' }, 'loop maxIterationsFrom "budget..rounds" is not a key path'],
      ['maxIterationsFrom "[0].x"', { maxIterationsFrom: '[0].x' }, 'is not a key path'],
      ['maxIterationsFrom 7', { maxIterationsFrom: 7 }, 'loop maxIterationsFrom 7 is not a key path'],
    ];
    for (const [label, edit, words] of cases) {
      const d = polling({ loop: edit });
      const fs = findingsOf(d).filter((f) => f.rule === 'FD-V50');
      equal(fs.length, 1, `${label}: FD-V50 once`);
      equal(fs[0]!.at, 'poll', `${label}: at the loop`);
      ok(fs[0]!.detail.includes(words), `${label}: the message names the clause — got ${fs[0]!.detail}`);
    }
    // `edges` is ALSO `FD-V17`'s undeclared key — the loop's key set declares none (section 2's row) — so that document
    // carries both, as `FD-V50--loop-with-edges.flow.json` does; every other edit above is FD-V50 ALONE.
    equal(rulesOf(polling({ loop: { edges: [{ to: 'after' }] } })), ['FD-V17', 'FD-V50'], 'edges: FD-V17 (the key set) and FD-V50 (the loop`s own rule)');
    for (const [label, edit] of cases.slice(1)) equal(rulesOf(polling({ loop: edit })), ['FD-V50'], `${label}: FD-V50 alone`);
    // What FD-V50 ACCEPTS: an integer bound of 1, and maxIterationsFrom in FD-V40's grammar, ADR 0137's indexes included.
    for (const ok1 of [{ maxIterations: 1 }, { maxIterationsFrom: 'budget.rounds' }, { maxIterationsFrom: 'files[0].rounds' }, { maxIterationsFrom: 'rounds' }]) {
      equal(rulesOf(polling({ loop: ok1 })), [], `${JSON.stringify(ok1)} is accepted`);
    }
  });

  test(DECLARED_CASES[1]!, () => {
    // The body entry `check` replaced by each opener kind, with what that kind needs to be well-formed otherwise.
    const withEntry = (entry: unknown[]) => doc([
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'poll' }] },
      { id: 'poll', kind: 'loop', branch: 'check', until: UNTIL, maxIterations: 20 },
      ...entry,
      { id: 'polled', kind: 'join', of: 'poll', edges: [{ to: 'done' }] },
      END,
    ]);
    const asMap = withEntry([{ id: 'check', kind: 'map', over: 'items', branch: 's' }, t('s', 'mj'), { id: 'mj', kind: 'join', of: 'check', edges: [{ to: 'polled' }] }]);
    const asFan = withEntry([{ id: 'check', kind: 'fanout', branches: ['s1', 's2'] }, t('s1', 'fj'), t('s2', 'fj'), { id: 'fj', kind: 'join', of: 'check', edges: [{ to: 'polled' }] }]);
    const asLoop = withEntry([{ id: 'check', kind: 'loop', branch: 's', until: UNTIL, maxIterations: 2 }, t('s', 'ij'), { id: 'ij', kind: 'join', of: 'check', edges: [{ to: 'polled' }] }]);
    for (const [kind, d] of [['map', asMap], ['fanout', asFan], ['loop', asLoop]] as const) {
      const fs = findingsOf(d).filter((f) => f.rule === 'FD-V50');
      equal(fs.length, 1, `a ${kind} as the body entry: FD-V50 once`);
      ok(fs[0]!.detail.includes(`branch "check" is a ${kind}, not a task or an ask`), `and it names the kind — got ${fs[0]!.detail}`);
      equal(rulesOf(d), ['FD-V50'], `a ${kind} as the body entry: FD-V50 alone`);
    }
    // The CONTROLS: a task (the polling document) and an ask as the entry.
    equal(rulesOf(polling()), [], 'a task entry is accepted');
    equal(rulesOf(withEntry([{ id: 'check', kind: 'ask', edges: [{ to: 'polled' }] }])), [], 'an ask entry is accepted');
  });

  test(DECLARED_CASES[2]!, () => {
    for (const k of ['branch', 'until', 'maxIterations']) {
      const d = polling();
      delete (d.nodes[1] as unknown as Record<string, unknown>)[k];
      ok(rulesOf(d).includes('FD-V23') && !rulesOf(d).includes('FD-V50'), `an absent ${k} is FD-V23, not FD-V50 — got ${rulesOf(d).join(', ')}`);
    }
    const nonString = rulesOf(polling({ loop: { branch: 7 } }));
    ok(nonString.includes('FD-V21') && !nonString.includes('FD-V50'), `a non-string branch is FD-V21 — got ${nonString.join(', ')}`);
    // `until`: section 3's comparison grammar under an `if` gate's scope — the ONE root `input`.
    const untilCases: [string, unknown, string][] = [
      ['a bare string', 'ready', 'FD-V42'],
      ['a registered predicate name', { predicate: 'isLowConfidence' }, 'FD-V42'],
      ['a path off the input root', { path: 'outcome.result.ready', op: 'eq', value: true }, 'FD-V43'],
      ['a path naming needs', { path: 'needs.x', op: 'eq', value: true }, 'FD-V43'],
      ['an operator outside the subset', { path: 'input.ready', op: 'matches', value: 'y' }, 'FD-V44'],
      ['a group inside a group', { all: [UNTIL, { any: [UNTIL] }] }, 'FD-V45'],
    ];
    for (const [label, until, rule] of untilCases) equal(rulesOf(polling({ loop: { until } })), [rule], `until as ${label}: ${rule} alone`);
    // The FD-V43 message speaks of a LOOP's until, not of a gate (W228's conformity reader, F3).
    const offRoot = findingsOf(polling({ loop: { until: { path: 'outcome.result.ready', op: 'eq', value: true } } }))[0]!;
    ok(offRoot.detail.includes("which a loop's until cannot see") && !offRoot.detail.includes('gate'), `the off-root message is the LOOP's — got ${offRoot.detail}`);
    const named = findingsOf(polling({ loop: { until: { predicate: 'isLowConfidence' } } }))[0]!;
    ok(named.detail.includes('a loop has neither'), `the predicate-name message is the LOOP's, not the gate's — got ${named.detail}`);
    // The CONTROLS: a flat group, and a comparison with valueFrom over the same root.
    equal(rulesOf(polling({ loop: { until: { any: [UNTIL, { path: 'input.tries', op: 'gte', value: 3 }] } } })), [], 'a flat group over input is accepted');
    equal(rulesOf(polling({ loop: { until: { path: 'input.score', op: 'gte', valueFrom: 'input.target' } } })), [], 'a valueFrom over input is accepted');
  });

  test(DECLARED_CASES[3]!, () => {
    const IT = { round: '$iteration' };
    equal(rulesOf(polling({ check: { needs: { state: '.', ...IT } } })), [], 'the branch entry');
    equal(rulesOf(polling({ check: { edges: [{ to: 'polled', needs: IT }] } })), [], 'an edge in the body (no `when`, so its needs is read by nothing but is legal)');
    equal(rulesOf(loopInLoop({ c: { needs: IT } })), [], 'a node two hops into the OUTER round (`c`, after the inner join)');
    equal(rulesOf(mapInLoop({ b: { needs: IT } })), [], 'a node in a map INSIDE the round names the round');
    equal(rulesOf(loopInLoop({ inner: { needs: IT } })), [], 'an inner LOOP node`s own "$iteration" names its ENCLOSING round — never the region it opens');
    equal(rulesOf(loopInMap({ b: { needs: IT } })), [], 'a round inside a map instance');
  });

  test(DECLARED_CASES[4]!, () => {
    const IT = { round: '$iteration' };
    const sites: [string, FlowDefinition, string][] = [
      ['after the join', polling({ after: { needs: IT } }), 'after'],
      ['a top-level loop node', polling({ loop: { needs: IT } }), 'poll'],
      ['in a map instance but no loop', loopInMap({ c: { needs: IT } }), 'c'],
      ['before the loop', doc([
        { id: 'ingest', kind: 'task', type: 'IngestWorker', needs: IT, edges: [{ to: 'done' }] }, END,
      ]), 'ingest'],
    ];
    for (const [label, d, at] of sites) {
      equal(rulesOf(d), ['FD-V51'], `${label}: FD-V51 alone`);
      const f = findingsOf(d)[0]!;
      equal(f.at, at, `${label}: at the reader`);
      ok(f.detail.includes('pass the round down from a node inside the loop') && f.detail.includes('move this node inside it'),
        `${label}: the message names both fixes — got ${f.detail}`);
    }
    // An EDGE outside a loop: the reader is the node the edge hangs on.
    const edge = doc([
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'done', needs: IT }] }, END,
    ]);
    equal(rulesOf(edge), ['FD-V51'], 'on an edge outside a loop: FD-V51 alone');
    // The CONTROL beside each: "." in the same position is accepted, so the site is not what is refused.
    equal(rulesOf(polling({ after: { needs: { own: '.' } } })), [], 'the control: "." after the join is accepted');
    // FD-V26 — the grammar: no array form and no `?`, as for "$payload" and "$item".
    // And each is told ITS fix, as "$item" is (section 3's row: `"$iteration"` takes `"$item"`'s clauses).
    const fixes: [unknown, string][] = [
      [['$iteration'], 'is an array form, and there is ONE index per loop round: write "$iteration"'],
      ['$iteration?', 'write "$iteration" without "?"'],
      [['$iteration?'], 'is an array form, and there is ONE index per loop round: write "$iteration"'],
    ];
    for (const [v, fix] of fixes) {
      equal(rulesOf(polling({ check: { needs: { k: v } } })), ['FD-V26'], `${JSON.stringify(v)} inside a round: FD-V26 alone, the grammar`);
      const f = findingsOf(polling({ check: { needs: { k: v } } }))[0]!;
      ok(f.detail.includes(fix), `${JSON.stringify(v)}: the message names its fix ${JSON.stringify(fix)} — got ${f.detail}`);
    }
  });

  test(DECLARED_CASES[5]!, () => {
    for (const kind of ['loop', 'map'] as const) {
      equal(rulesOf(fact13(kind, ['fit'])), [], `${kind}: ["fit"] read from outside is GREEN`);
      equal(rulesOf(fact13(kind, ['fit?'])), [], `${kind}: ["fit?"] read from outside is GREEN`);
      equal(rulesOf(fact13(kind, 'fit')), ['FD-V28'], `${kind}: the bare "fit" is FD-V28 alone`);
      const f = findingsOf(fact13(kind, 'fit'))[0]!;
      equal(f.at, 'promote', `${kind}: at the reader`);
    }
    const loopMessage = findingsOf(fact13('loop', 'fit'))[0]!.detail;
    ok(loopMessage.includes('ROUND'), `the loop's FD-V28 message speaks of a ROUND, not an item — got ${loopMessage}`);
  });

  test(DECLARED_CASES[6]!, () => {
    equal(rulesOf(breaking(['b'], true)), ['FD-V29'], 'with the break: ["b"] is FD-V29 — the join may fire without b having run');
    equal(findingsOf(breaking(['b'], true))[0]!.at, 'out', 'at the reader');
    equal(rulesOf(breaking(['b?'], true)), [], 'with the break: ["b?"] is valid — the conditional form');
    equal(rulesOf(breaking(['a'], true)), [], 'with the break: ["a"] is valid — the branch entry runs in every round, the breaking one included');
    equal(rulesOf(breaking(['b'], false)), [], 'with NO break: ["b"] is valid — the control, so the end is what moved it');

    // **(b1), the maintainer's answer to W228's conformity reader, F2**: only an `end` whose INNERMOST region is the
    // loop's breaks it. An `end` inside a map branch in the body loses that branch, and one inside an inner loop's body
    // breaks the INNER loop — the outer round goes on, so neither shrinks certainty at the outer join.
    const nestedMap = (bs: unknown) => doc([
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'L' }] },
      { id: 'L', kind: 'loop', branch: 'a', until: UNTIL, maxIterations: 3 },
      t('a', 'm'),
      { id: 'm', kind: 'map', over: 'items', branch: 's' },
      { id: 's', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'lost', when: { predicate: 'isLowConfidence' } }, { to: 'mj' }] },
      { id: 'lost', kind: 'end', outcome: 'item-lost' },
      { id: 'mj', kind: 'join', of: 'm', edges: [{ to: 'b' }] },
      t('b', 'J'),
      { id: 'J', kind: 'join', of: 'L', edges: [{ to: 'out' }] },
      { id: 'out', kind: 'task', type: 'PublishWorker', needs: { last: '.', bs }, edges: [{ to: 'done' }] },
      END,
    ]);
    equal(rulesOf(nestedMap(['b'])), [], 'an end inside a MAP branch in the body is no break of the loop: ["b"] after the loop is valid');
    const nestedLoop = (bs: unknown) => doc([
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'outer' }] },
      { id: 'outer', kind: 'loop', branch: 'a', until: UNTIL, maxIterations: 3 },
      t('a', 'inner'),
      { id: 'inner', kind: 'loop', branch: 's', until: UNTIL, maxIterations: 3 },
      { id: 's', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'quit', when: { predicate: 'isLowConfidence' } }, { to: 'ij' }] },
      { id: 'quit', kind: 'end', outcome: 'inner-broke' },
      { id: 'ij', kind: 'join', of: 'inner', edges: [{ to: 'b' }] },
      t('b', 'oj'),
      { id: 'oj', kind: 'join', of: 'outer', edges: [{ to: 'out' }] },
      { id: 'out', kind: 'task', type: 'PublishWorker', needs: { last: '.', bs }, edges: [{ to: 'done' }] },
      END,
    ]);
    equal(rulesOf(nestedLoop(['b'])), [], 'an end inside an INNER loop`s body breaks the inner loop, not the outer: ["b"] after the outer loop is valid');
    // The control for both: the same `end` moved onto the OUTER body's own path IS a break.
    // A break AFTER b on the outer body's own path — an `end` of its own, `stop`, so no nested region reaches it.
    const ownPath = nestedLoop(['b']);
    (ownPath.nodes.find((n) => n.id === 'b') as unknown as { edges: unknown[] }).edges =
      [{ to: 'stop', when: { predicate: 'isLowConfidence' } }, { to: 'oj' }];
    ownPath.nodes.push({ id: 'stop', kind: 'end', outcome: 'stopped-early' } as never);
    equal(rulesOf(ownPath), [], 'the control`s first half: a break AFTER b still ran b, so ["b"] stays valid');
    const beforeB = nestedLoop(['b']);
    (beforeB.nodes.find((n) => n.id === 'a') as unknown as { edges: unknown[] }).edges =
      [{ to: 'quit', when: { predicate: 'isLowConfidence' } }, { to: 'inner' }];
    equal(rulesOf(beforeB), ['FD-V29'], 'and an end on the outer body`s own path BEFORE b is a break: ["b"] is FD-V29');
    // And an `end` SHARED by a nested region and the outer body's own path is a break (section 4: a shared `end` only makes
    // certainty smaller — the safe direction): b routing to the inner loop's `quit` makes ["b"] FD-V29, because `quit` is
    // also reached from inside the inner round, where b has not run.
    const shared = nestedLoop(['b']);
    (shared.nodes.find((n) => n.id === 'b') as unknown as { edges: unknown[] }).edges =
      [{ to: 'quit', when: { predicate: 'isLowConfidence' } }, { to: 'oj' }];
    equal(rulesOf(shared), ['FD-V29'], 'an end SHARED with the inner round is a break of the outer loop: ["b"] is FD-V29');
    // And the clause is a LOOP's: a MAP whose branch reaches an `end` keeps `["b"]` after its join certain (FD-V29 v0.57
    // names a loop's join only) — the map's own branch member read after the map, the shape the corpus already writes.
    const mapBreak = doc([
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'm' }] },
      { id: 'm', kind: 'map', over: 'items', branch: 'a' },
      { id: 'a', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'stop', when: { predicate: 'isLowConfidence' } }, { to: 'b' }] },
      t('b', 'mj'),
      { id: 'stop', kind: 'end', outcome: 'stopped-early' },
      { id: 'mj', kind: 'join', of: 'm', edges: [{ to: 'out' }] },
      { id: 'out', kind: 'task', type: 'PublishWorker', needs: { last: '.', bs: ['b'] }, edges: [{ to: 'done' }] },
      END,
    ]);
    equal(rulesOf(mapBreak), [], 'the same body as a MAP: ["b"] after its join is valid — the break clause is a loop`s alone');
  });

  test(DECLARED_CASES[7]!, async () => {
    const reg = corpusRegistry(JSON.parse(await readText(`${ROOT}spec/examples/registry.json`)) as CorpusRegistryDocument);
    for (const n of ['loop-training', 'loop-polling']) {
      const d = JSON.parse(await readText(`${ROOT}spec/examples/valid/${n}.flow.json`)) as FlowDefinition;
      equal(validateDefinition(d, reg), [], `${n}.flow.json validates clean against the corpus registry`);
    }
    equal(rulesOf(mapInLoop()), [], 'a map inside a loop');
    equal(rulesOf(loopInMap()), [], 'a loop inside a map instance');
    equal(rulesOf(loopInLoop()), [], 'a loop inside a loop');
    const at = (d: FlowDefinition, id: string) => innermostLoopOf(allRegions(buildGraph(d), d), id)?.fanoutId;
    equal([at(loopInLoop(), 'b'), at(loopInLoop(), 'c'), at(loopInLoop(), 'inner'), at(loopInLoop(), 'outer')], ['inner', 'outer', 'outer', undefined],
      'innermostLoopOf: b is the inner round`s, c and the inner loop node the outer`s, the top-level loop node none');
    equal([at(mapInLoop(), 'b'), at(loopInMap(), 'c'), at(polling(), 'after')], ['L', undefined, undefined],
      'a node in a map inside a round is the round`s; a node in a map instance after its loop and a node after a join are none');
  });

  test(DECLARED_CASES[8]!, () => {
    const regionsOf = (d: FlowDefinition) => allRegions(buildGraph(d), d);
    const p = polling();
    const pr = regionsOf(p);
    equal(branchPathOf(pr, 'check', new Map([['poll', 3]])), '3', 'the round index is the segment');
    equal(branchPathOf(pr, 'after', new Map()), '-', 'a node after the join is in no round');
    throws(() => branchPathOf(pr, 'check'), 'supply its round index', 'without a round index: refused');
    try { branchPathOf(pr, 'check', new Map()); ok(false, 'no throw'); } catch (e) {
      ok(e instanceof UnresolvedBranchPath && e.message.includes('crosses loop region "poll"') && e.message.includes('supply its round index'),
        `the refusal names the loop and the round — got ${(e as Error).message}`);
    }
    try { branchPathOf(pr, 'check', new Map([['poll', 1.5]])); ok(false, 'no throw'); } catch (e) {
      ok(e instanceof UnresolvedBranchPath && e.message.includes('round index 1.5 for loop region "poll"'), `a non-segment round index is refused — got ${(e as Error).message}`);
    }
    const lm = loopInMap();
    const lmr = regionsOf(lm);
    equal(branchPathOf(lmr, 'b', new Map([['m', 2], ['L', 5]])), '2.5', 'a round inside a map instance: the map`s item index, then the round');
    equal(branchPathOf(lmr, 'c', new Map([['m', 2]])), '2', 'after the inner loop`s join, only the map`s');
    throws(() => branchPathOf(lmr, 'b', new Map([['m', 2]])), 'supply its round index', 'the round missing inside the map: refused');
    const ml = mapInLoop();
    equal(branchPathOf(regionsOf(ml), 'b', new Map([['L', 1], ['m', 4]])), '1.4', 'a map inside a round: the round, then the item');
    const ll = loopInLoop();
    equal(branchPathOf(regionsOf(ll), 'b', new Map([['outer', 0], ['inner', 7]])), '0.7', 'a loop inside a loop: outer round, then inner');
    // `branchIndexOf` — the static half, exported — REFUSES a round member: a static index would mint one id for every
    // round, `spec/task-id.md` section 2's corruption (ID-R6).
    try { branchIndexOf(pr, 'check'); ok(false, 'no throw'); } catch (e) {
      ok(e instanceof UnresolvedBranchPath && e.message.includes('inside loop region "poll" (ID-R6)'), `branchIndexOf refuses a round member, naming the loop — got ${(e as Error).message}`);
    }
    equal(branchIndexOf(pr, 'after'), null, 'the control: a node after the join is in no region');
  });

  test(DECLARED_CASES[9]!, async () => {
    const ex = (v: Record<string, unknown>) => ({ examples: [v] });
    const X: JsonSchema = { type: 'object', required: ['x'], properties: { x: { type: 'integer' } }, additionalProperties: false, ...ex({ x: 1 }) };
    const Y: JsonSchema = { type: 'object', required: ['y'], properties: { y: { type: 'string' } }, additionalProperties: false, ...ex({ y: 'y' }) };
    const reg = (workers: Record<string, { inputSchema?: JsonSchema; outputSchema?: JsonSchema }>) => ({
      workers: Object.fromEntries(Object.entries(workers).map(([k, w]) => [k, { url: `corpus://${k}`, ...w }])),
      nodeTypes: Object.fromEntries(Object.keys(workers).map((k) => [k, { worker: k }])),
      languages: { path: PATH_LANGUAGE },
    }) as unknown as Parameters<typeof checkWiring>[0];
    const NEEDS_X: JsonSchema = { type: 'object', required: ['x'] };
    // `src -> L (branch e) -> e -> [b1 | b2] -> J -> out`: two body nodes with an edge to the join, so TWO carry arcs.
    const flow = doc([
      { id: 'src', kind: 'task', type: 'Src', edges: [{ to: 'L' }] },
      { id: 'L', kind: 'loop', branch: 'e', until: UNTIL, maxIterations: 3 },
      { id: 'e', kind: 'task', type: 'E', edges: [{ to: 'b1', when: { predicate: 'isLowConfidence' } }, { to: 'b2' }] },
      { id: 'b1', kind: 'task', type: 'B1', edges: [{ to: 'J' }] },
      { id: 'b2', kind: 'task', type: 'B2', edges: [{ to: 'J' }] },
      { id: 'J', kind: 'join', of: 'L', edges: [{ to: 'out' }] },
      { id: 'out', kind: 'task', type: 'Out', edges: [{ to: 'done' }] },
      END,
    ], 'src');
    equal(rulesOf(flow).filter((r) => r !== 'FD-V32'), [], 'the document is well-formed (its types are the wiring registry`s)');
    const verdicts = async (w: Parameters<typeof reg>[0]) => (await checkWiring(reg(w), flow)).verdicts;
    const into = (vs: WiringVerdict[], consumer: string) => vs.filter((v) => v.consumer === consumer).map((v) => `${v.shape}:${v.producer}:${v.kind}`).sort();
    const OUT_ANY: JsonSchema = { type: 'object' };

    const allFit = await verdicts({ Src: { outputSchema: X }, E: { inputSchema: NEEDS_X, outputSchema: X }, B1: { outputSchema: X }, B2: { outputSchema: X }, Out: { inputSchema: OUT_ANY } });
    equal(into(allFit, 'e'), ['carry:b1:fits', 'carry:b2:fits', 'round:src:fits'],
      'into the body entry: the ROUND arc from what reached the loop, and one CARRY arc per body node with an edge to the join — all fit');
    for (const v of allFit.filter((x) => x.consumer === 'e')) equal(v.through, 'L', `${v.shape} from ${v.producer} names the loop it passes through`);

    const roundNo = await verdicts({ Src: { outputSchema: Y }, E: { inputSchema: NEEDS_X, outputSchema: X }, B1: { outputSchema: X }, B2: { outputSchema: X }, Out: { inputSchema: OUT_ANY } });
    equal(into(roundNo, 'e'), ['carry:b1:fits', 'carry:b2:fits', 'round:src:no'], 'the ROUND arc mismatching: `no`, naming src, the carries unmoved');
    const carryNo = await verdicts({ Src: { outputSchema: X }, E: { inputSchema: NEEDS_X, outputSchema: X }, B1: { outputSchema: X }, B2: { outputSchema: Y }, Out: { inputSchema: OUT_ANY } });
    equal(into(carryNo, 'e'), ['carry:b1:fits', 'carry:b2:no', 'round:src:fits'], 'ONE carry mismatching: `no`, naming b2 and not b1');
    const noIn = await verdicts({ Src: { outputSchema: X }, E: { outputSchema: X }, B1: { outputSchema: X }, B2: { outputSchema: X }, Out: { inputSchema: OUT_ANY } });
    equal(into(noIn, 'e'), ['carry:b1:unchecked', 'carry:b2:unchecked', 'round:src:unchecked'], 'an entry with no inputSchema: every arc into it unchecked');

    // A GATE or an inner JOIN with an edge to the loop's join carries an `unchecked` arc, naming why (the `carry` row):
    // what reaches it is, one step back, what reaches the body entry — never a recursion.
    const viaGate = doc([
      { id: 'src', kind: 'task', type: 'Src', edges: [{ to: 'L' }] },
      { id: 'L', kind: 'loop', branch: 'e', until: UNTIL, maxIterations: 3 },
      { id: 'e', kind: 'task', type: 'E', edges: [{ to: 'g' }] },
      { id: 'g', kind: 'gate', type: 'distinct', settings: { key: 'x' }, edges: [{ to: 'J' }, { route: 'duplicate', to: 'J' }, { route: 'nokey', to: 'J' }] },
      { id: 'J', kind: 'join', of: 'L', edges: [{ to: 'done' }] },
      END,
    ], 'src');
    const gated = (await checkWiring(reg({ Src: { outputSchema: X }, E: { inputSchema: NEEDS_X, outputSchema: Y } }), viaGate)).verdicts.filter((v) => v.consumer === 'e');
    equal(gated.map((v) => `${v.shape}:${v.producer}:${v.kind}`).sort(), ['carry:g:unchecked', 'round:src:fits'],
      'a gate carrying the round into the join: its carry is UNCHECKED — E`s output Y would be `no`, so the gate`s arc is not read as e`s output');
    ok(gated.find((v) => v.shape === 'carry')!.why.includes('one step back'), `and it says why — got ${gated.find((v) => v.shape === 'carry')!.why}`);

    // `"$iteration"` composes an INTEGER >= 0 (section 3's row): a consumer key wanting an integer fits, a string is `no`.
    const withRound = doc([
      { id: 'src', kind: 'task', type: 'Src', edges: [{ to: 'L' }] },
      { id: 'L', kind: 'loop', branch: 'e', until: UNTIL, maxIterations: 3 },
      { id: 'e', kind: 'task', type: 'E', needs: { state: '.', round: '$iteration' }, edges: [{ to: 'J' }] },
      { id: 'J', kind: 'join', of: 'L', edges: [{ to: 'done' }] },
      END,
    ], 'src');
    const roundAs = async (round: JsonSchema) => (await checkWiring(reg({ Src: { outputSchema: X },
      E: { inputSchema: { type: 'object', required: ['state', 'round'], properties: { state: { type: 'object' }, round } }, outputSchema: X } }), withRound))
      .verdicts.filter((v) => v.consumer === 'e').map((v) => v.kind).sort();
    equal(await roundAs({ type: 'integer', minimum: 0 }), ['fits', 'fits'], '"$iteration" read as an integer >= 0: both arcs into e fit');
    equal(await roundAs({ type: 'string' }), ['no', 'no'], '"$iteration" read as a string: both arcs are `no` — it is an integer');
    equal(await roundAs({ type: 'integer', minimum: 1 }), ['no', 'no'], 'and its range starts at 0 — a consumer requiring >= 1 is `no`');

    // **The loop join's RECORD** — `{ last, iterations, exhausted, broke? }`, closed, `last` the JOIN ARRIVAL: the output of
    // the ONE body node with an edge to the join (the maintainer's (a1) to W228's conformity reader, F1). Its document:
    // the body entry `plan` declares `needs`, so `plan`'s inputSchema (`{ state, round }`) is NOT the state — `fit`'s
    // output (`{ score }`) is, and that is what `last` must carry.
    const SCORE: JsonSchema = { type: 'object', required: ['score'], properties: { score: { type: 'number' } }, additionalProperties: false, examples: [{ score: 0.5 }] };
    const f1 = doc([
      { id: 'src', kind: 'task', type: 'Src', edges: [{ to: 'L' }] },
      { id: 'L', kind: 'loop', branch: 'plan', until: { path: 'input.score', op: 'gte', value: 0.9 }, maxIterations: 3 },
      { id: 'plan', kind: 'task', type: 'Plan', needs: { state: '.', round: '$iteration' }, edges: [{ to: 'fit' }] },
      { id: 'fit', kind: 'task', type: 'Fit', edges: [{ to: 'J' }] },
      { id: 'J', kind: 'join', of: 'L', edges: [{ to: 'out' }] },
      { id: 'out', kind: 'task', type: 'Out', edges: [{ to: 'done' }] },
      END,
    ], 'src');
    const PLAN_IN: JsonSchema = { type: 'object', required: ['state', 'round'], properties: { state: { type: 'object' }, round: { type: 'integer' } } };
    const recordOf = async (Out: JsonSchema, Fit: { outputSchema?: JsonSchema } = { outputSchema: SCORE }) =>
      (await checkWiring(reg({ Src: { outputSchema: SCORE }, Plan: { inputSchema: PLAN_IN, outputSchema: X }, Fit, Out: { inputSchema: Out } }), f1))
        .verdicts.filter((v) => v.consumer === 'out');
    const obj = (required: string[], properties: Record<string, JsonSchema>): JsonSchema => ({ type: 'object', required, properties });
    const iter = await recordOf(obj(['iterations'], { iterations: { type: 'integer' } }));
    equal(iter.map((v) => `${v.shape}:${v.producer}:${v.kind}`), ['record:J:fits'], 'a consumer requiring `iterations` an integer FITS the join value');
    equal((await recordOf(obj(['last', 'exhausted'], { last: obj(['score'], {}), exhausted: { type: 'boolean' } }))).map((v) => v.kind), ['fits'],
      'a consumer requiring `last.score` FITS — `last` is fit`s output, the join arrival');
    equal((await recordOf(obj(['last'], { last: obj(['state'], {}) }))).map((v) => v.kind), ['no'],
      'a consumer requiring `last.state` is `no` — `last` is NOT the entry`s inputSchema (F1`s unsafe `fits`)');
    equal((await recordOf(obj(['iterations'], { iterations: { type: 'integer', minimum: 1 } }))).map((v) => v.kind), ['fits'], '`iterations` is at least 1');
    equal((await recordOf(obj(['broke'], {}))).map((v) => v.kind), ['no'], '`broke` is OPTIONAL — a consumer requiring it is `no`');
    // The value is CLOSED — measured: a consumer that forbids extra keys FITS it only because no key beyond the four can
    // arrive (`fits` reads *producer may emit any* off an open one). The adequacy reader found the earlier row here, a
    // consumer constraining `count`, fit an OPEN record too, so it measured nothing about closedness.
    const ONLY_FOUR: JsonSchema = { type: 'object', properties: { last: {}, iterations: {}, exhausted: {}, broke: {} }, additionalProperties: false };
    equal((await recordOf(ONLY_FOUR)).map((v) => v.kind), ['fits'], 'the value is CLOSED: a consumer forbidding every key beyond the four fits it');
    const ONLY_THREE: JsonSchema = { type: 'object', properties: { last: {}, iterations: {}, exhausted: {} }, additionalProperties: false };
    equal((await recordOf(ONLY_THREE)).map((v) => v.kind), ['no'], 'the control: forbidding `broke` too is `no` — the value MAY carry it');
    const noSchema = await recordOf(obj(['iterations'], { iterations: { type: 'integer' } }), {});
    equal(noSchema.map((v) => v.kind), ['unchecked'], 'the arriving node declares no outputSchema: `last` has no shape, so the record is unchecked');
    ok(noSchema[0]!.why.includes('`last`'), `and it says why — got ${noSchema[0]!.why}`);
    // **A body that can BREAK hands on the SEED as `last` too** (P47 decision 5; the maintainer's (d1)): the join's
    // successor then gets a SECOND `record` arc, `last` the shape of what reached the loop, marked `through` the loop.
    const f1Break = JSON.parse(JSON.stringify(f1)) as FlowDefinition;
    (f1Break.nodes.find((n) => n.id === 'fit') as unknown as { edges: unknown[] }).edges = [{ to: 'stop', when: { predicate: 'isLowConfidence' } }, { to: 'J' }];
    f1Break.nodes.push({ id: 'stop', kind: 'end', outcome: 'stopped-early' } as never);
    const LAST_SCORE = obj(['last'], { last: obj(['score'], {}) });
    const breakable = async (src: JsonSchema) => (await checkWiring(reg({ Src: { outputSchema: src }, Plan: { inputSchema: PLAN_IN, outputSchema: X }, Fit: { outputSchema: SCORE }, Out: { inputSchema: LAST_SCORE } }), f1Break))
      .verdicts.filter((v) => v.consumer === 'out').map((v) => `${v.shape}:${v.producer}:${v.through ?? '-'}:${v.kind}`).sort();
    equal(await breakable(SCORE), ['record:J:-:fits', 'record:J:L:fits'], 'a breakable loop: TWO record arcs — the arrival`s and the seed`s (through L) — both fit when the seed has the state`s shape');
    equal(await breakable(X), ['record:J:-:fits', 'record:J:L:no'], 'a seed WITHOUT `score`: the seed`s arc is `no` — round 0 breaking hands it on as `last`');
    equal(await recordOf(LAST_SCORE).then((vs) => vs.length), 1, 'the CONTROL: the same loop with no break gives ONE record arc');
    const entryBreak = doc([
      { id: 'L', kind: 'loop', branch: 'fit', until: UNTIL, maxIterations: 3 },
      { id: 'fit', kind: 'task', type: 'Fit', edges: [{ to: 'stop', when: { predicate: 'isLowConfidence' } }, { to: 'J' }] },
      { id: 'stop', kind: 'end', outcome: 'stopped-early' },
      { id: 'J', kind: 'join', of: 'L', edges: [{ to: 'out' }] },
      { id: 'out', kind: 'task', type: 'Out', edges: [{ to: 'done' }] },
      END,
    ], 'L');
    const eb = (await checkWiring(reg({ Fit: { outputSchema: SCORE }, Out: { inputSchema: LAST_SCORE } }), entryBreak)).verdicts.filter((v) => v.consumer === 'out');
    equal(eb.map((v) => `${v.through ?? '-'}:${v.kind}`).sort(), ['-:fits', 'L:unchecked'], 'an ENTRY loop that can break: the seed is the payload, so its arc is unchecked');
    ok(eb.find((v) => v.through === 'L')!.why.includes('payload'), `naming the payload — got ${eb.find((v) => v.through === 'L')!.why}`);
    // SEVERAL arriving nodes: no single shape — the two-carry document above.
    const several = (await verdicts({ Src: { outputSchema: X }, E: { inputSchema: NEEDS_X, outputSchema: X }, B1: { outputSchema: X }, B2: { outputSchema: X }, Out: { inputSchema: OUT_ANY } }))
      .filter((v) => v.consumer === 'out');
    equal(several.map((v) => v.kind), ['unchecked'], 'two body nodes reaching the join: the record is unchecked');
    ok(several[0]!.why.includes('2 body nodes ("b1", "b2")'), `naming both — got ${several[0]!.why}`);
  });

  test(DECLARED_CASES[10]!, () => {
    const validator = new Validator(definitionSchema() as never, '2020-12', true);
    const accepts = (d: unknown) => validator.validate(d).valid;
    ok(accepts(polling()) && accepts(loopInLoop()) && accepts(mapInLoop()) && accepts(loopInMap()), 'the CONTROLS: every acceptance document is accepted by the schema');
    ok(accepts(polling({ loop: { maxIterationsFrom: 'files[0].rounds', needs: { seed: '.' } } })), 'maxIterationsFrom with an index, and the loop`s needs (the SEED), accepted');
    ok(accepts(polling({ check: { needs: { round: '$iteration' } } })), '"$iteration" in a needs is in the reference grammar');
    // A GROUP `until` — both flat shapes — is accepted by BOTH forms, as validateDefinition accepts it: the schema never
    // refuses what the validator accepts (section 1), and neither corpus loop writes a group.
    const registryValidator = new Validator(definitionSchema(REGISTRY as never) as never, '2020-12', true);
    for (const until of [{ any: [UNTIL, { path: 'input.tries', op: 'gte', value: 3 }] }, { all: [UNTIL] }]) {
      const d = polling({ loop: { until } });
      equal(rulesOf(d), [], `${Object.keys(until)[0]} group until: valid`);
      ok(accepts(d) && registryValidator.validate(d).valid, `${Object.keys(until)[0]} group until: accepted by the static AND the registry form`);
    }
    const carried: [string, FlowDefinition, string][] = [
      ['edges on a loop', polling({ loop: { edges: [{ to: 'after' }] } }), 'FD-V50'],
      ['maxIterations 0', polling({ loop: { maxIterations: 0 } }), 'FD-V50'],
      ['maxIterations 1.5', polling({ loop: { maxIterations: 1.5 } }), 'FD-V50'],
      ['maxIterations "3"', polling({ loop: { maxIterations: '3' } }), 'FD-V50'],
      ['maxIterationsFrom not a key path', polling({ loop: { maxIterationsFrom: 'a..b' } }), 'FD-V50'],
      ['until a predicate name', polling({ loop: { until: { predicate: 'isLowConfidence' } } }), 'FD-V42'],
      ['until off the input root', polling({ loop: { until: { path: 'outcome.result.ready', op: 'eq', value: true } } }), 'FD-V43'],
      ['until with an operator outside the subset', polling({ loop: { until: { path: 'input.ready', op: 'matches', value: 'y' } } }), 'FD-V44'],
      ['until a nested group', polling({ loop: { until: { all: [UNTIL, { any: [UNTIL] }] } } }), 'FD-V45'],
      ['["$iteration"]', polling({ check: { needs: { k: ['$iteration'] } } }), 'FD-V26'],
    ];
    for (const [label, d, rule] of carried) {
      ok(!accepts(d), `${label}: REFUSED by the schema`);
      ok(rulesOf(d).includes(rule), `${label}: reported by validateDefinition as ${rule} — got ${rulesOf(d).join(', ')}`);
    }
    // What the schema does NOT carry (section 1's row): another node's kind, and where a region is.
    const notCarried: [string, FlowDefinition, string][] = [
      ['a map as the body entry', doc([
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'poll' }] },
        { id: 'poll', kind: 'loop', branch: 'check', until: UNTIL, maxIterations: 2 },
        { id: 'check', kind: 'map', over: 'items', branch: 's' }, t('s', 'mj'), { id: 'mj', kind: 'join', of: 'check', edges: [{ to: 'polled' }] },
        { id: 'polled', kind: 'join', of: 'poll', edges: [{ to: 'done' }] }, END,
      ]), 'FD-V50'],
      ['"$iteration" after the join', polling({ after: { needs: { round: '$iteration' } } }), 'FD-V51'],
    ];
    for (const [label, d, rule] of notCarried) {
      ok(accepts(d), `${label}: ACCEPTED by the schema — it reads another node`);
      equal(rulesOf(d), [rule], `${label}: refused by validateDefinition as ${rule} alone`);
    }
  });

  test(DECLARED_CASES[11]!, () => {
    // FD-V2 — a dangling `branch`: a loop's one arc names a node that is not there.
    const dangling = polling({ loop: { branch: 'nowhere' } });
    ok(rulesOf(dangling).includes('FD-V2'), `a loop branch naming no node: FD-V2 — got ${rulesOf(dangling).join(', ')}`);
    // FD-V6 — a loop opens a region, so it is closed by EXACTLY one join naming it.
    const noJoin = doc([
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'poll' }] },
      { id: 'poll', kind: 'loop', branch: 'check', until: UNTIL, maxIterations: 2 },
      t('check', 'done'),
      END,
    ]);
    ok(rulesOf(noJoin).includes('FD-V6'), `a loop with NO join: FD-V6 — got ${rulesOf(noJoin).join(', ')}`);
    const twoJoins = doc([
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'poll' }] },
      { id: 'poll', kind: 'loop', branch: 'check', until: UNTIL, maxIterations: 2 },
      { id: 'check', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'j1', when: { predicate: 'isLowConfidence' } }, { to: 'j2' }] },
      { id: 'j1', kind: 'join', of: 'poll', edges: [{ to: 'done' }] },
      { id: 'j2', kind: 'join', of: 'poll', edges: [{ to: 'done' }] },
      END,
    ]);
    ok(rulesOf(twoJoins).includes('FD-V6'), `a loop with TWO joins: FD-V6 — got ${rulesOf(twoJoins).join(', ')}`);
    // FD-V12 — a loop's branch that is its own join.
    const selfJoin = doc([
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'poll' }] },
      { id: 'poll', kind: 'loop', branch: 'polled', until: UNTIL, maxIterations: 2 },
      { id: 'polled', kind: 'join', of: 'poll', edges: [{ to: 'done' }] },
      END,
    ]);
    ok(rulesOf(selfJoin).includes('FD-V12'), `a loop whose branch is its own join: FD-V12 — got ${rulesOf(selfJoin).join(', ')}`);
    equal(rulesOf(polling()), [], 'the CONTROL: one branch, one join, validates clean');
  });

  test(DECLARED_CASES[12]!, async () => {
    // **`FD-R4` through an ENTRY loop** (v0.57, the maintainer's (c1) to W228's adequacy reader, survivor 8): round 0's
    // body entry is held to the payload, or to the SEED the loop's `needs` composes from it — and nothing past it.
    const entryLoop = (loop: Record<string, unknown> = {}) => doc([
      { id: 'poll', kind: 'loop', branch: 'check', until: UNTIL, maxIterations: 3, ...loop },
      t('check', 'after'),
      t('after', 'polled'),
      { id: 'polled', kind: 'join', of: 'poll', edges: [{ to: 'publish' }] },
      { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
      END,
    ], 'poll');
    equal(rulesOf(entryLoop()), [], 'a loop as the ENTRY validates clean');
    const payload = { ready: false, n: 1 };
    equal(boundaryTargets(entryLoop(), payload), [{ node: 'check', value: payload }],
      'the body entry is held to the PAYLOAD, once — `after` (a later body node) and `publish` (after the join) are not');
    equal(boundaryTargets(entryLoop({ needs: { seed: '.', run: '$payload' } }), payload), [{ node: 'check', value: { seed: payload, run: payload } }],
      'with `needs`, to the SEED composed from it — "." and "$payload" each the payload');
    const report = await checkWiring({ ...typesFor(['ScoreWorker', 'PublishWorker']), languages: {} } as never, entryLoop());
    equal(report.entry, ['check'], 'and the wiring report`s entry tasks are the body entry, as the walk says');
  });

  test(DECLARED_CASES[13]!, () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
