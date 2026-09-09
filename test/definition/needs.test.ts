/**
 * Ladder L1 — `needs`' three validation rules and its reference grammar.
 * [W41](../../doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md) under
 * [P12](../../doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md),
 * [ADR 0040](../../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md).
 *
 * **Every expected value here is derived from `spec/flow-definition.md` and not
 * from a run:**
 *
 * | what | from |
 * |---|---|
 * | the three reference forms | section 3's `needs` table — `"."`, `"n"`, `["n"]` |
 * | `FD-V26`'s clauses | section 5's row: not an object, empty, a key outside the charset, a value that is not a reference |
 * | `FD-V27`'s clauses | section 5's row: not a node, not a `task`, not reachable-from |
 * | `FD-V28`'s two directions | section 5's row: `"n"` where `n` is in a region this node is outside of, and `["n"]` where it is not |
 * | *"only a `task` or a `map` may carry it is NOT a clause"* | section 5's `FD-V26` row, which says `FD-V17` already refuses it and names the kind |
 */
import { equal, ok, readText, ROOT, suite } from '../harness.ts';
import { referenceTarget, validateDefinition } from '../../src/definition/validate.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';

const EX = `${ROOT}spec/examples`;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as {
  workerTypes: string[];
  predicates?: string[];
};
const REGISTRY = { predicates: reg.predicates ?? [], workerTypes: reg.workerTypes };

/** Rules for a definition. `nodes` is spread in so each case names only what it changes. */
const doc = (nodes: unknown[]): FlowDefinition =>
  ({ flowId: 'needs-case', version: 1, entry: 'ingest', nodes } as unknown as FlowDefinition);

const rulesOf = (d: FlowDefinition): string[] =>
  [...new Set(validateDefinition(d, REGISTRY).map((f) => f.rule))].sort();

/**
 * **How many reference forms `spec/flow-definition.md` section 3 declares**, counted
 * from its own table rather than written down here. The table's header row is
 * `| a reference is | and resolves to |`; its body rows are what this counts.
 *
 * It exists so the accepted-forms list below is bounded by a source this file does
 * NOT own — W41's adequacy reader's obligation-(d) finding, where a literal beside
 * the list fell to one compound edit that narrowed both.
 */
const specText = await readText(`${ROOT}spec/flow-definition.md`);
function referenceTableRows(): number {
  const lines = specText.split(/\r?\n/);
  const head = lines.findIndex((l) => l.startsWith('| a reference is | and resolves to |'));
  ok(head >= 0, 'section 3`s reference table is where this count comes from, and it is not there');
  let n = 0;
  for (let i = head + 2; i < lines.length && lines[i]!.startsWith('|'); i++) n++;
  ok(n > 0, 'the reference table has no body rows, which would make the bound below vacuous');
  return n;
}

/** `ingest -> subject -> done`, with `subject` carrying whatever `needs` is given. */
const linear = (needs: unknown) =>
  doc([
    { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'subject' }] },
    { id: 'subject', kind: 'task', workerType: 'ScoreWorker', needs, edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ]);

suite('L1 — FD-V26: the reference GRAMMAR', (test) => {
  test('the three forms of section 3`s table are accepted, and nothing else is', () => {
    // **Derived from the table, both directions.** The accepted list is the table's
    // own three rows; the refused list is one case per way a value can miss it.
    const accepted: unknown[] = ['.', 'ingest', ['ingest']];
    const refusedBy = new Map<string, unknown>([
      ['an object', { node: 'ingest' }],
      ['a number', 7],
      ['null', null],
      ['a two-element array', ['ingest', 'ingest']],
      ['an empty array', []],
      ['an array of a non-string', [7]],
      ['a node id with a colon', 'in:gest'],
      ['the empty string', ''],
    ]);
    const ranAccepted: unknown[] = [];
    for (const v of accepted) {
      ranAccepted.push(v);
      ok(referenceTarget(v) !== null, `${JSON.stringify(v)} is one of section 3's three forms`);
    }
    equal(ranAccepted, accepted, 'the LOOP ran every accepted form — counted from what it did');
    // **The bound is READ FROM THE SPEC, not written beside the list** — W41's
    // adequacy reader, whose compound probe deleted one form AND narrowed the
    // literal to match, for **0 failures**. A magic number beside its own list is
    // [Q102](../../doc/open-questions.md)'s shape and cannot survive an edit that
    // touches both; a count taken from `spec/flow-definition.md` section 3's own
    // reference table lives in a file this one does not own, so the same probe has
    // to edit the NORMATIVE document to stay green — which is the whole point.
    equal(accepted.length, referenceTableRows(),
      'the LIST is exactly as long as section 3`s `needs` reference table, which is where the ' +
      'three forms are declared. A form added there and not here is red, and so is the reverse');

    const ranRefused: string[] = [];
    for (const [label, v] of refusedBy) {
      ranRefused.push(label);
      equal(referenceTarget(v), null, `${label} is not a reference`);
      // And the validator reports it, under FD-V26 and nothing else.
      equal(rulesOf(linear({ k: v })), ['FD-V26'], `${label} is refused by FD-V26 alone`);
    }
    equal(ranRefused, [...refusedBy.keys()], 'the LOOP ran every refused shape');
    equal(ranRefused.length, 8, 'eight ways to miss the grammar — the claim in the title');
  });

  test('the three forms parse to the three resolutions section 3 names', () => {
    equal(referenceTarget('.'), { form: 'self', node: null }, '"." is what the node would have received anyway');
    equal(referenceTarget('ingest'), { form: 'one', node: 'ingest' }, '"n" is one output on this node`s path');
    equal(referenceTarget(['ingest']), { form: 'all', node: 'ingest' }, '["n"] is the array form');
  });

  test('needs must be a non-empty object', () => {
    equal(rulesOf(linear([])), ['FD-V26'], 'an array is not an object');
    // **A NON-EMPTY array, and it is a different clause from the one above** —
    // W41's adequacy reader. `[]` is caught by the *empty* clause, so
    // `Array.isArray(nv)` never discriminated it and could be deleted for 0. The
    // reachable case is `needs: ["ingest"]`, which without that clause validates
    // clean and hands the worker `{"0": …}` — a key no author wrote.
    equal(rulesOf(linear(['ingest'])), ['FD-V26'],
      'a NON-EMPTY array is the case `Array.isArray` exists for; the empty one is the ' +
      'empty-object clause and says nothing about it');
    // **`null`, and the property is *reported, never thrown*.** `typeof null` is
    // `"object"`, so without the `nv === null` disjunct `Object.entries(null)` throws
    // out of the validator — which `spec/flow-definition.md` section 5 refuses and
    // which two L1 cases already assert for `nodes` and none asserted for `needs`.
    equal(rulesOf(linear(null)), ['FD-V26'], 'null is reported, never thrown');
    equal(rulesOf(linear('ingest')), ['FD-V26'], 'a bare string is not a mapping');
    equal(rulesOf(linear({})), ['FD-V26'],
      'an empty needs means a node receives {} with the document reading as though it asked ' +
      'for something — FD-V23`s own argument for `version`');
  });

  test('an ARRAY element outside the charset is FD-V26, not FD-V27', () => {
    // W41's adequacy reader: the refused-shape list carries `[7]`, which the
    // `typeof` clause catches, and no array element outside `FD-V16`'s charset —
    // the only shape `ID_RE.test(ref[0])` discriminates. Without it the reference
    // parses, `FD-V27` fires instead, and the message reads *"which is not a node"*
    // about a string that could never BE one. No invalid document is accepted;
    // what changes is which rule the author is sent to.
    equal(rulesOf(linear({ k: ['in:gest'] })), ['FD-V26'], 'the grammar, not the target');
    const f = validateDefinition(linear({ k: ['in:gest'] }), REGISTRY)[0]!;
    ok(f.detail.includes('one-element array holding one'),
      'and the message is the grammar`s, which is what the rule id promises');
  });

  test('a needs KEY is in FD-V16`s charset', () => {
    equal(rulesOf(linear({ 'has:colon': '.' })), ['FD-V26'], 'a key is a payload key and takes the same charset');
    equal(rulesOf(linear({ ok_key: '.' })), [], 'underscores and hyphens are in the charset');
  });

  test('`only a task or a map may carry needs` is FD-V17`s, not FD-V26`s', () => {
    // `spec/flow-definition.md` section 5's FD-V26 row says so in the document
    // rather than leaving it to be rediscovered: `needs` is absent from the other
    // three kinds' key lists, so FD-V17 already refuses it AND names the kind.
    const d = doc([
      { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['a', 'b'], needs: { x: '.' } },
      { id: 'a', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'b', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ]);
    equal(rulesOf(d), ['FD-V17'], 'FD-V17 alone, and FD-V26 is silent — one rule, not two that could disagree');
    const f = validateDefinition(d, REGISTRY).find((x) => x.rule === 'FD-V17')!;
    ok(f.detail.includes('fanout') && f.detail.includes('needs'),
      'and it NAMES the kind and the key, which is why a second rule would add nothing');
  });
});

suite('L1 — FD-V27: where a reference POINTS', (test) => {
  test('a reference to a node that does not exist', () => {
    equal(rulesOf(linear({ k: 'nowhere' })), ['FD-V27'], 'FD-V27 alone — FD-V2 is about arcs, not references');
    // **The DETAIL, because the id alone cannot discriminate this clause** — W41's
    // adequacy reader, and it is W29's `D5` masking shape. `kindOf` returns
    // `undefined` for a node that does not exist, so with this clause disabled the
    // NEXT clause fires under the SAME id and set equality is satisfied — while the
    // message reads *"names \"nowhere\", a undefined; only a task produces an
    // output"*, which says something false about a node that is simply not there.
    const f = validateDefinition(linear({ k: 'nowhere' }), REGISTRY)[0]!;
    ok(f.detail.includes('which is not a node'),
      'the right verdict by the right route — a sibling clause reporting the same id is not this one');
    ok(!f.detail.includes('undefined'), 'and it does not describe a missing node by its missing kind');
  });

  test('a reference to a node whose kind is not a task', () => {
    // Section 2: **only a task node is ever dispatched**, and therefore only a task
    // produces an outcome record. A reference to any other kind names something
    // that has no result to give, at any branch path.
    const d = doc([
      { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
      { id: 'a', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'b', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'after' }] },
      { id: 'after', kind: 'task', workerType: 'PublishWorker', needs: { r: 'split' }, edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ]);
    equal(rulesOf(d), ['FD-V27'], 'a fanout is not a task');
    ok(validateDefinition(d, REGISTRY)[0]!.detail.includes('only a task produces an output'),
      'and the message says which of section 2`s sentences it is');
  });

  test('a reference this node is not reachable from — downstream, sideways, and itself', () => {
    const cases: [string, FlowDefinition][] = [
      ['downstream', doc([
        { id: 'ingest', kind: 'task', workerType: 'IngestWorker', needs: { l: 'subject' }, edges: [{ to: 'subject' }] },
        { id: 'subject', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ])],
      ['itself', linear({ me: 'subject' })],
      ['sideways — the other branch of a fanout', doc([
        { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
        { id: 'a', kind: 'task', workerType: 'ScoreWorker', needs: { sib: 'b' }, edges: [{ to: 'collect' }] },
        { id: 'b', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ])],
    ];
    const ran: string[] = [];
    for (const [label, d] of cases) {
      ran.push(label);
      equal(rulesOf(d), ['FD-V27'], `${label}: refused at instantiation rather than left to FD-R3`);
    }
    equal(ran, cases.map((c) => c[0]), 'the LOOP ran every case');
    equal(ran.length, 3, 'three ways to point at a node that cannot have produced anything for you');
  });

  test('a reference UPSTREAM is accepted, which is what makes the three above findings', () => {
    equal(rulesOf(linear({ up: 'ingest' })), [], 'ingest -> subject, so subject is reachable from ingest');
  });
});

suite('L1 — FD-V28: the FORM must match the graph', (test) => {
  const region = (needsOn: 'inside' | 'outside', needs: unknown) =>
    doc([
      { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'map', over: 'items', branch: 'score' },
      {
        id: 'score', kind: 'task', workerType: 'ScoreWorker',
        ...(needsOn === 'inside' ? { needs } : {}),
        edges: [{ to: 'collect' }],
      },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
      {
        id: 'publish', kind: 'task', workerType: 'PublishWorker',
        ...(needsOn === 'outside' ? { needs } : {}),
        edges: [{ to: 'done' }],
      },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ]);

  test('"n" is refused where n is inside a region this node is OUTSIDE of', () => {
    equal(rulesOf(region('outside', { s: 'score' })), ['FD-V28'],
      'publish is outside region(split) and score produces one output per instance');
    const f = validateDefinition(region('outside', { s: 'score' }), REGISTRY)[0]!;
    ok(f.detail.includes('write ["score"]'), 'and the message names the form to write instead');
  });

  test('["n"] is accepted in that same position — the two directions are one rule', () => {
    equal(rulesOf(region('outside', { s: ['score'] })), [], 'the array form is the legal one there');
  });

  test('["n"] is refused where n produces exactly one output on this node`s path', () => {
    equal(rulesOf(linear({ up: ['ingest'] })), ['FD-V28'], 'ingest is in no region');
    const f = validateDefinition(linear({ up: ['ingest'] }), REGISTRY)[0]!;
    ok(f.detail.includes('write "ingest"'), 'and the message names the form to write instead');
  });

  test('"n" is accepted from INSIDE the region, because the reader is on the branch', () => {
    // `score` reading `ingest`: `-` is a prefix of every path, so exactly one entry
    // is visible. This is the case `map-with-context.flow.json` is built on.
    equal(rulesOf(region('inside', { item: '.', run: 'ingest' })), [],
      'a map instance reading the value the map node received is ONE output — Q166`s flow');
  });

  test('a FANOUT region gives ONE output per node, so the bare form is legal from outside it', () => {
    // **W41's conformity reader's finding 1, checked back in as a probe.**
    // `FD-V28`'s first version asked *is the target in a region the reader is
    // outside of*, which is true of a `fanout` too — so `publish` naming `scoreA`
    // was refused with *"produces one output per branch; write ["scoreA"]"* while
    // `scoreA` produces exactly one, and the author was forced to write a list and
    // index `[0]` out of it. `FD-V19` is why: a non-`end` node cannot be in two
    // branch entries of one fanout, so a fanout region gives every node ONE output.
    // Nothing in this file noticed, because every case above uses a `map` region.
    const fanout = (needs: unknown) => doc([
      { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
      { id: 'scoreA', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'scoreB', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
      { id: 'publish', kind: 'task', workerType: 'PublishWorker', needs, edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ]);
    equal(rulesOf(fanout({ a: 'scoreA' })), [],
      'ONE output, so the bare form is what is legal — `FD-V19` is what guarantees it');
    equal(rulesOf(fanout({ a: ['scoreA'] })), ['FD-V28'],
      'and the ARRAY form is the one refused there, which is the opposite of a map region');
    const f = validateDefinition(fanout({ a: ['scoreA'] }), REGISTRY)[0]!;
    ok(f.detail.includes('write "scoreA"'), 'and it names the form to write instead');
  });

  test('the map/fanout split is what FD-V28 turns on — the same reader, two openers', () => {
    // The discriminating pair: one flow, one reader position, two opener kinds, and
    // the legal form is DIFFERENT. A `many` that reads region membership without
    // the opener's kind gives the same answer to both and is wrong on one of them.
    const withOpener = (kind: 'fanout' | 'map', needs: unknown) => doc([
      { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split' }] },
      kind === 'fanout'
        ? { id: 'split', kind: 'fanout', branches: ['score', 'other'] }
        : { id: 'split', kind: 'map', over: 'items', branch: 'score' },
      { id: 'score', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
      ...(kind === 'fanout'
        ? [{ id: 'other', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] }]
        : []),
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
      { id: 'publish', kind: 'task', workerType: 'PublishWorker', needs, edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ]);
    equal(rulesOf(withOpener('fanout', { s: 'score' })), [], 'fanout: the bare form');
    equal(rulesOf(withOpener('fanout', { s: ['score'] })), ['FD-V28'], 'fanout: the list is refused');
    equal(rulesOf(withOpener('map', { s: ['score'] })), [], 'map: the list');
    equal(rulesOf(withOpener('map', { s: 'score' })), ['FD-V28'], 'map: the bare form is refused');
  });

  test('the `.` form is never an FD-V28 case, in either position', () => {
    equal(rulesOf(region('inside', { x: '.' })), [], 'inside a region');
    equal(rulesOf(region('outside', { x: '.' })), [], 'and outside one — `.` names no node');
  });
});

suite('L1 — the two flows P12 exists for validate with zero findings', (test) => {
  test('map-with-context and map-over-region-output', async () => {
    const files = ['map-with-context', 'map-over-region-output'];
    const ran: string[] = [];
    for (const n of files) {
      ran.push(n);
      const d = JSON.parse(await readText(`${EX}/valid/${n}.flow.json`)) as FlowDefinition;
      equal(validateDefinition(d, REGISTRY), [], `${n}.flow.json validates with zero findings`);
    }
    equal(ran, files, 'the LOOP ran both — counted from what it did');
    equal(files.length, 2,
      'and the LIST is TWO — P12`s two blocked flows, both of them. Same obligation (d) shape as ' +
      'the accepted-forms list above, and it survived for the same reason');
  });
});
