/**
 * Ladder L1 — `needs`' FOUR validation rules and its reference grammar.
 * [W41](../../doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md) under
 * [P12](../../doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md),
 * [ADR 0040](../../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md).
 *
 * **Every expected value here is derived from `spec/flow-definition.md` and not
 * from a run:**
 *
 * | what | from |
 * |---|---|
 * | the five reference spellings, over FOUR rows | section 3's `needs` table — `"."`, `"n"`, `["n"]`, and v0.13's `"n?"` and `["n?"]` |
 * | `FD-V29`'s two directions | section 5's row: a `task`'s edges are DISJUNCTIVE and a region's branches CONJUNCTIVE, so a branch entry is certain for its join and an inner one is not |
 * | `FD-V26`'s clauses | section 5's row: not an object, empty, a key outside the charset, a value that is not a reference |
 * | `FD-V27`'s clauses | section 5's row: not a node, not a `task`, not reachable-from |
 * | `FD-V28`'s two directions | section 5's row: `"n"` where `n` is in a region this node is outside of, and `["n"]` where it is not |
 * | *"only a `task` or a `map` may carry it is NOT a clause"* | section 5's `FD-V26` row, which says `FD-V17` already refuses it and names the kind |
 */
import { equal, listDir, ok, readText, ROOT, suite } from '../harness.ts';
import { EDGE_KEYS_DECLARED, referenceTarget, validateDefinition } from '../../src/definition/validate.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { CORPUS_LANGUAGES } from './corpus-types.ts';

const EX = `${ROOT}spec/examples`;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as {
  workers: Record<string, { url: string }>;
  nodeTypes: Record<string, { worker: string }>;
  pools: Record<string, { type: string }>;
  predicates?: string[];
  groups?: string[];
};
// `groups` since W58: `task-config.flow.json` declares `workerGroups`, and a registry that omits
// the set declares NO groups (`FD-V31`), so the corpus-wide loop below needs the corpus's own.
// `nodeTypes` since W59, for the same reason one set over: `typed.flow.json` names a type, and a
// registry that omits the set declares none (`FD-V32`).
// `languages` since W61, one set further: `transformed.flow.json` names `path` (`FD-V35`).
const REGISTRY = { predicates: reg.predicates ?? [], workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, groups: Object.keys(reg.groups ?? {}), languages: CORPUS_LANGUAGES };

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

/**
 * **Which ROW of that table a spelling belongs to** — W45, and it is what replaced
 * a count.
 *
 * v0.13 made the suffix a **modifier** rather than a fourth form, so the table has
 * four rows and five accepted spellings and `accepted.length === rows` stopped being
 * either true or meaningful. The bound below is strictly stronger than the count it
 * replaces: it fails when a row no spelling exercises is added **and** when a
 * spelling is accepted that belongs to no row, neither of which a count can see on
 * its own. *A count over two sets of different sizes is a coincidence waiting to
 * happen* — and this is `JP-R9`'s *compare the two halves rather than copy one of
 * them* over a table instead of over a rules list.
 */
function rowOf(v: unknown): string {
  const t = referenceTarget(v)!;
  return t.conditional ? 'suffix' : t.form;
}

/** `ingest -> subject -> done`, with `subject` carrying whatever `needs` is given. */
const linear = (needs: unknown) =>
  doc([
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'subject' }] },
    { id: 'subject', kind: 'task', type: 'ScoreWorker', needs, edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ]);

suite('L1 — FD-V26: the reference GRAMMAR', (test) => {
  test('the five spellings of section 3`s table are accepted, and nothing else is', () => {
    // **Derived from the table, both directions.** The accepted list is the table's
    // own rows; the refused list is one case per way a value can miss it.
    //
    // **v0.13 added ONE row and TWO spellings** — W45. `?` is a MODIFIER on either
    // aimed form rather than a fourth form (`FD-C4`), which is why the bound below
    // maps spellings to rows instead of counting them. The four refusals that carry
    // a `?` are the ways the suffix can be written wrong: it goes on the END of a
    // node id, and what is left after stripping it must still be an id, so `"?"`,
    // `".?"` and `"ingest??"` need no clause of their own.
    const accepted: unknown[] = ['.', 'ingest', ['ingest'], 'ingest?', ['ingest?']];
    const refusedBy = new Map<string, unknown>([
      ['an object', { node: 'ingest' }],
      ['a number', 7],
      ['null', null],
      ['a two-element array', ['ingest', 'ingest']],
      ['an empty array', []],
      ['an array of a non-string', [7]],
      ['a node id with a colon', 'in:gest'],
      ['the empty string', ''],
      // **The four `?` shapes were HERE and are now generated below** — W45's rule 8
      // re-run, after acting on its adequacy reader. That reader's blocking finding
      // was that the four rows fell to one edited literal; the cross-product closed
      // the consequence (the grammar is bound) and left the rows themselves
      // deletable for **0**, because every case they named the loop now generates.
      // *A guard with no reachable effect is not defence in depth* — this item's own
      // sentence, from deleting `target === n.id` in `validate.ts`, applied to a
      // fixture list rather than to a guard.
    ]);
    const ranAccepted: unknown[] = [];
    for (const v of accepted) {
      ranAccepted.push(v);
      ok(referenceTarget(v) !== null, `${JSON.stringify(v)} is one of section 3's spellings`);
    }
    equal(ranAccepted, accepted, 'the LOOP ran every accepted form — counted from what it did');
    // **The bound is READ FROM THE SPEC, not written beside the list** — W41's
    // adequacy reader, whose compound probe deleted one form AND narrowed the
    // literal to match, for **0 failures**. A magic number beside its own list is
    // [Q102](../../doc/open-questions.md)'s shape and cannot survive an edit that
    // touches both; a count taken from `spec/flow-definition.md` section 3's own
    // reference table lives in a file this one does not own, so the same probe has
    // to edit the NORMATIVE document to stay green — which is the whole point.
    // **Every accepted spelling belongs to a row, and every row has a spelling** —
    // both ways, against a count read from the normative document. A row added
    // there and exercised by nothing here is red; a spelling accepted here that no
    // row describes is red. `accepted.length === rows` was neither once the suffix
    // became a modifier: four rows, five spellings.
    const rowsHit = [...new Set(accepted.map(rowOf))];
    equal(rowsHit.length, referenceTableRows(),
      'every ROW of section 3`s `needs` reference table is exercised by a spelling in this list — ' +
      'the count is read from the normative document, so satisfying it needs an edit there');
    equal(rowsHit.sort(), ['all', 'one', 'self', 'suffix'],
      'and the four rows are the ones this file names, so a fifth appearing is a finding rather ' +
      'than a silently absorbed bucket');
    // **And every AIMED form appears with AND without the suffix** - rule 8 found
    // that the row bound above cannot see a missing spelling *within* a row:
    // dropping `['ingest?']` still hits all four rows, for **0**. The suffix is a
    // modifier, so the spellings are a 2x2 cross-product plus `"."`, and that is
    // derived here rather than counted.
    const aimedSpellings = accepted.map((v) => referenceTarget(v)!).filter((t) => t.node !== null);
    equal(aimedSpellings.map((t) => `${t.form}${t.conditional ? '?' : ''}`).sort(),
      ['all', 'all?', 'one', 'one?'],
      'both aimed forms, each with and without the modifier - a spelling missing from a row the ' +
      'bound above still counts as hit is what this catches');

    const ranRefused: string[] = [];
    for (const [label, v] of refusedBy) {
      ranRefused.push(label);
      equal(referenceTarget(v), null, `${label} is not a reference`);
      // And the validator reports it, under FD-V26 and nothing else.
      equal(rulesOf(linear({ k: v })), ['FD-V26'], `${label} is refused by FD-V26 alone`);
    }
    equal(ranRefused, [...refusedBy.keys()], 'the LOOP ran every refused shape');
    equal(ranRefused.length, 8,
      'eight ways to miss the grammar by SHAPE; the four ways to miss it by SUFFIX are the ' +
      'generated cross-product below, which no edit to this list can narrow');

    // **And the SUFFIX half is GENERATED from the rule rather than listed** — W45's
    // adequacy reader, BLOCKING. The four `?` rows above were bounded by that `12`
    // and nothing else: deleting all four and editing the literal cost **0**, after
    // which `referenceTarget` could be made to accept `"?"` and `".?"` for 0 as
    // well. *A magic number beside its own list* is the defect the ACCEPTED list
    // above escapes by reading `referenceTableRows()`, twenty lines up, with a
    // comment naming it.
    //
    // The grammar is TWO operations — strip one trailing `?`, then the remainder
    // must match `FD-V16`'s charset — so its answers over a cross-product are
    // enumerable and no row can leave. `bodies` x `suffixes` is 16 spellings, and
    // exactly three of them are the table's own rows.
    const bodies: Record<string, string> = { valid: 'ingest', invalid: 'in:gest', dot: '.', empty: '' };
    const suffixes: Record<string, (b: string) => string> = {
      none: (b) => b, trailing: (b) => `${b}?`, leading: (b) => `?${b}`, twice: (b) => `${b}??`,
    };
    // Derived from section 3's table and `FD-V26`'s row, spelling by spelling: a
    // valid id with no suffix and with one trailing `?` are two rows, `"."` with no
    // suffix is the third, and every other cell fails the remainder test.
    const ACCEPTED_CELLS = ['valid/none', 'valid/trailing', 'dot/none'];
    const accepting: string[] = [];
    const cells: string[] = [];
    for (const [bn, body] of Object.entries(bodies)) {
      for (const [sn, apply] of Object.entries(suffixes)) {
        const cell = `${bn}/${sn}`;
        cells.push(cell);
        const spelling = apply(body);
        const bare = referenceTarget(spelling);
        const listed = referenceTarget([spelling]);
        if (bare !== null) accepting.push(cell);
        // The ARRAY form answers the same question of the same string, minus `"."`.
        equal(listed !== null, bare !== null && bn !== 'dot',
          `${cell}: the array form accepts exactly what the bare form does, minus "."`);
        if (bare === null) {
          equal(rulesOf(linear({ k: spelling })), ['FD-V26'], `${cell}: refused by FD-V26 alone`);
        }
      }
    }
    // **The two AXES are named, both ways, because the count was derived from the
    // list it bounds** — W45's rule 8 re-run found it: `cells.length ===
    // Object.keys(bodies).length * Object.keys(suffixes).length` shrinks on BOTH
    // sides when an axis member leaves, so dropping `empty` cost **0**. That is
    // [Q102](../../doc/open-questions.md)'s shape inside the fix for a reader's
    // finding about exactly that shape, which is rule 8's own founding observation.
    equal(Object.keys(bodies).sort(), ['dot', 'empty', 'invalid', 'valid'],
      'the BODY axis is a valid id, an id outside the charset, the `.` token and the empty string — ' +
      'the four things the remainder after stripping can be');
    equal(Object.keys(suffixes).sort(), ['leading', 'none', 'trailing', 'twice'],
      'and the SUFFIX axis is where one `?` can go and what two of them do');
    equal(cells.length, Object.keys(bodies).length * Object.keys(suffixes).length,
      'the LOOP ran the whole cross-product — counted from what it did, not declared');
    equal(accepting.sort(), [...ACCEPTED_CELLS].sort(),
      'exactly three of the sixteen spellings are accepted, and they are section 3`s three ' +
      'aimed-and-self rows. A row deleted from `refusedBy` cannot hide here, because this loop ' +
      'GENERATES its own cases from the two operations the grammar performs');
  });

  test('the five spellings parse to the resolutions section 3 names', () => {
    equal(referenceTarget('.'), { form: 'self', node: null, conditional: false },
      '"." is what the node would have received anyway, and may not be conditional');
    equal(referenceTarget('ingest'), { form: 'one', node: 'ingest', conditional: false },
      '"n" is one output on this node`s path');
    equal(referenceTarget(['ingest']), { form: 'all', node: 'ingest', conditional: false },
      '["n"] is the array form');
    // **`conditional` is a field BESIDE `form`, not a value of it** — ADR 0042 rule 3.
    // The suffix decides what happens when the target produced nothing and never
    // which outputs are named, so `FD-V28` reads `form` with the suffix stripped and
    // `FD-V29` reads `conditional`. If it were a fourth `form` value, `FD-V28` would
    // have to enumerate it and would go quiet on a conditional reference.
    equal(referenceTarget('ingest?'), { form: 'one', node: 'ingest', conditional: true },
      '"n?" is the same ONE output, with FD-C4 instead of FD-R3 when there is none');
    equal(referenceTarget(['ingest?']), { form: 'all', node: 'ingest', conditional: true },
      '["n?"] is the same ARRAY, and `[]` instead of FD-R3');
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
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['a', 'b'], needs: { x: '.' } },
      { id: 'a', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'b', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
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
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
      { id: 'a', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'b', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'after' }] },
      { id: 'after', kind: 'task', type: 'PublishWorker', needs: { r: 'split' }, edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ]);
    equal(rulesOf(d), ['FD-V27'], 'a fanout is not a task');
    ok(validateDefinition(d, REGISTRY)[0]!.detail.includes('only a task produces an output'),
      'and the message says which of section 2`s sentences it is');
  });

  test('a reference this node is not reachable from — downstream, sideways, and itself', () => {
    const cases: [string, FlowDefinition][] = [
      ['downstream', doc([
        { id: 'ingest', kind: 'task', type: 'IngestWorker', needs: { l: 'subject' }, edges: [{ to: 'subject' }] },
        { id: 'subject', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ])],
      ['itself', linear({ me: 'subject' })],
      ['sideways — the other branch of a fanout', doc([
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
        { id: 'a', kind: 'task', type: 'ScoreWorker', needs: { sib: 'b' }, edges: [{ to: 'collect' }] },
        { id: 'b', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
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
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'map', over: 'items', branch: 'score' },
      {
        id: 'score', kind: 'task', type: 'ScoreWorker',
        ...(needsOn === 'inside' ? { needs } : {}),
        edges: [{ to: 'collect' }],
      },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
      {
        id: 'publish', kind: 'task', type: 'PublishWorker',
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
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
      { id: 'scoreA', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'scoreB', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
      { id: 'publish', kind: 'task', type: 'PublishWorker', needs, edges: [{ to: 'done' }] },
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
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
      kind === 'fanout'
        ? { id: 'split', kind: 'fanout', branches: ['score', 'other'] }
        : { id: 'split', kind: 'map', over: 'items', branch: 'score' },
      { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
      ...(kind === 'fanout'
        ? [{ id: 'other', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] }]
        : []),
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
      { id: 'publish', kind: 'task', type: 'PublishWorker', needs, edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ]);
    equal(rulesOf(withOpener('fanout', { s: 'score' })), [], 'fanout: the bare form');
    equal(rulesOf(withOpener('fanout', { s: ['score'] })), ['FD-V28'], 'fanout: the list is refused');
    equal(rulesOf(withOpener('map', { s: ['score'] })), [], 'map: the list');
    equal(rulesOf(withOpener('map', { s: 'score' })), ['FD-V28'], 'map: the bare form is refused');
    // **And the SUFFIX does not excuse the wrong FORM** - rule 8 found this hole:
    // gating this rule on `!t.conditional` cost **0**, because no fixture wrote a
    // conditional reference in the wrong form. `?` decides what happens when the
    // target produced NOTHING; `FD-V28` decides how many things it produces when it
    // did. Two questions, and the suffix answers only one - ADR 0042 rule 3.
    equal(rulesOf(withOpener('map', { s: 'score?' })), ['FD-V28'],
      'map: the CONDITIONAL bare form is refused too, and the fix is the FORM, not the suffix');
    equal(rulesOf(withOpener('fanout', { s: ['score?'] })), ['FD-V28'],
      'fanout: and the conditional LIST form, in the other direction');
    equal(rulesOf(withOpener('map', { s: ['score?'] })), [], 'map: the conditional list is accepted');
    equal(rulesOf(withOpener('fanout', { s: 'score?' })), [], 'fanout: and the conditional bare form');
  });

  test('the `.` form is never an FD-V28 case, in either position', () => {
    equal(rulesOf(region('inside', { x: '.' })), [], 'inside a region');
    equal(rulesOf(region('outside', { x: '.' })), [], 'and outside one — `.` names no node');
  });
});

/**
 * `FD-V29` — an UNCONDITIONAL reference names a node that must have run.
 * [ADR 0042](../../doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md),
 * [W45](../../doc/work-items/w45-what-a-reference-must-be-able-to-say.md).
 *
 * **Every expected value here is derived from the rule text, and the rule's whole
 * content is the difference between DOMINANCE and CERTAINTY.** So the cases come in
 * pairs: one where a `task`'s edges make the target uncertain (refused) and one where
 * a `fanout`'s branches make it certain (accepted) — and the second half is what a
 * dominance rule would have got wrong, 22 times over both corpora.
 */
suite('L1 — FD-V29: an unconditional reference names a node that MUST have run', (test) => {
  /** `ingest` decides between `flag` and `skip`; both reach `publish`, which declares `needs`. */
  const acrossADecision = (needs: unknown): FlowDefinition =>
    doc([
      {
        id: 'ingest', kind: 'task', type: 'IngestWorker',
        edges: [{ when: 'isLowConfidence', to: 'flag' }, { to: 'skip' }],
      },
      { id: 'flag', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'publish' }] },
      { id: 'skip', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'publish' }] },
      { id: 'publish', kind: 'task', type: 'PublishWorker', needs, edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ]);

  test('Q187`s own flow: the bare form across a decision is refused at INSTANTIATION', () => {
    equal(rulesOf(acrossADecision({ f: 'flag' })), ['FD-V29'],
      'FD-V29 alone — FD-V27 accepts it, because `publish` IS reachable from `flag`');
    const f = validateDefinition(acrossADecision({ f: 'flag' }), REGISTRY)[0]!;
    // **The DETAIL, because the id alone cannot discriminate WHICH fix to make** —
    // `FD-V28`'s own standard for a refusal message, and this rule has two fixes.
    ok(f.detail.includes('"flag?"'), 'and the message names the conditional form to write');
    ok(f.detail.includes('every path reaches'), 'and the other fix, which is to move the reference');
    ok(!f.detail.includes('not reachable from'),
      'and it does NOT say what FD-V27 says — the two are different findings with different fixes');
  });

  test('and the conditional form is EXEMPT, which is the whole of what the suffix buys', () => {
    equal(rulesOf(acrossADecision({ f: 'flag?' })), [], 'the same document, one character longer');
    equal(rulesOf(acrossADecision({ own: '.', f: 'flag?' })), [],
      'and beside a `"."`, which is `reference-if-it-ran.flow.json`s own shape');
  });

  test('a FANOUT branch entry is CERTAIN from after the join, and dominance says otherwise', () => {
    // **This is the rule's whole content.** `scoreA` does not dominate `collect` —
    // every path to the join goes through `scoreB` too — and `JP-R5` dispatches both
    // branch entries when the region opens, so it has always run. A dominance rule
    // would refuse this, and `FD-V28`'s own note in `spec/flow-definition.md` calls
    // it *"a valid document"*: the two rules would have contradicted each other in
    // one document, nine lines apart.
    const afterAJoin = (needs: unknown): FlowDefinition =>
      doc([
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
        { id: 'scoreA', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'scoreB', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
        { id: 'publish', kind: 'task', type: 'PublishWorker', needs, edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ]);
    equal(rulesOf(afterAJoin({ a: 'scoreA' })), [], 'branch entry A: accepted');
    equal(rulesOf(afterAJoin({ b: 'scoreB' })), [], 'branch entry B: accepted, and neither dominates');
    // And the map opener's one branch entry, for the same reason at arity N: N = 0
    // makes the run `stuck` with the join never firing (`spec/join-policy.md`
    // section 5), so a join that IS entered had at least one instance.
    const afterAMapJoin = doc([
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'map', over: 'items', branch: 'score' },
      { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
      { id: 'publish', kind: 'task', type: 'PublishWorker', needs: { s: ['score'] }, edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ]);
    equal(rulesOf(afterAMapJoin), [], 'a map`s one branch entry: accepted, and it does not dominate either');
  });

  test('an INNER branch entry is NOT certain, because the outer branch may be lost', () => {
    // The other side of the same distinction, and the reason `certainlySettled` is a
    // fixpoint rather than one union: `inner` is entered only if `scoreB` routed to
    // it, so `scoreC` is certain for `innerJoin` and NOT for `outerJoin`. Measured
    // over the corpus: `nested`, `nested-suspend`, `map-in-fanout` and `nested-map`
    // are four of the seven references FD-V29 refuses.
    const nested = (reader: string, needs: unknown): FlowDefinition =>
      doc([
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'outer' }] },
        { id: 'outer', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
        { id: 'scoreA', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'outerJoin' }] },
        { id: 'scoreB', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'inner' }] },
        { id: 'inner', kind: 'fanout', branches: ['scoreC', 'scoreD'] },
        { id: 'scoreC', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'innerJoin' }] },
        { id: 'scoreD', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'innerJoin' }] },
        { id: 'innerJoin', kind: 'join', of: 'inner', edges: [{ to: 'outerJoin' }] },
        { id: 'outerJoin', kind: 'join', of: 'outer', edges: [{ to: reader }] },
        { id: reader, kind: 'task', type: 'PublishWorker', needs, edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ]);
    equal(rulesOf(nested('publish', { c: 'scoreC' })), ['FD-V29'],
      'an INNER branch entry, read from after the OUTER join: refused');
    equal(rulesOf(nested('publish', { c: 'scoreC?' })), [], 'and the conditional form is accepted');
    equal(rulesOf(nested('publish', { a: 'scoreA' })), [],
      'while the OUTER branch entry beside it is accepted — the fixpoint, not one union');
  });

  test('FD-V29 fires at the EDGE site too, by the same loop', () => {
    // ADR 0041 rule 4: one grammar, one reader, both sites in one loop. A `?` on an
    // edge is what makes a PREDICATE conditional — `'earlier' in ctx.needs`.
    const edge = (needs: unknown): FlowDefinition =>
      doc([
        {
          id: 'ingest', kind: 'task', type: 'IngestWorker',
          edges: [{ when: 'isLowConfidence', to: 'flag' }, { to: 'skip' }],
        },
        { id: 'flag', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'publish' }] },
        { id: 'skip', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'publish' }] },
        {
          id: 'publish', kind: 'task', type: 'PublishWorker',
          edges: [{ when: 'isHighConfidence', to: 'done', needs }, { to: 'done' }],
        },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ]);
    equal(rulesOf(edge({ f: 'flag' })), ['FD-V29'], 'the edge site, refused');
    const f = validateDefinition(edge({ f: 'flag' }), REGISTRY)[0]!;
    // **The SITE label and the `at`, because the shared loop is where they could
    // drift** — W42's adequacy reader's two findings, one rule later.
    ok(f.detail.startsWith('edge needs['), 'and the message says EDGE, so a reader is sent to the edge');
    equal(f.at, 'publish#edge0', 'and `at` names the edge INDEX, not just the node');
    equal(rulesOf(edge({ f: 'flag?' })), [], 'and the edge site is exempt by the same suffix');
  });

  test('a THREE-way merge — the intersection runs over every predecessor, not two', () => {
    // **W45's adequacy reader, BLOCKING.** `certainlySettled`'s intersection is
    // `for (const p of ps.slice(1))`, and narrowing it to `ps.slice(1, 2)` cost
    // **0 failures**: every fixture in the tree merged exactly TWO paths, so the
    // loop's own bound had no case above two. `FD-V29` is *"a node is on EVERY
    // path"*, and with the bound narrowed the document below is accepted and the
    // `d`/`c` workload dies at run time on `FD-R3` — Q187 re-opened for one
    // edited slice bound.
    //
    // `publish` has THREE inbound arcs. `a` runs on the `m` and `n` roads and not
    // on the `c` one, so `c` — the third predecessor — is the only witness.
    const threeWay = (needs: unknown): FlowDefinition =>
      doc([
        {
          id: 'ingest', kind: 'task', type: 'IngestWorker',
          edges: [{ when: 'isLowConfidence', to: 'd' }, { to: 'a' }],
        },
        { id: 'd', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'c' }] },
        { id: 'c', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'publish' }] },
        {
          id: 'a', kind: 'task', type: 'ScoreWorker',
          edges: [{ when: 'isLowConfidence', to: 'm' }, { to: 'n' }],
        },
        { id: 'm', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'publish' }] },
        { id: 'n', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'publish' }] },
        { id: 'publish', kind: 'task', type: 'PublishWorker', needs, edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ]);
    equal(rulesOf(threeWay({ k: 'a' })), ['FD-V29'],
      '`a` is certain on two of publish`s three roads and not on the third — refused');
    equal(rulesOf(threeWay({ k: 'a?' })), [], 'and the conditional form is accepted');
    equal(rulesOf(threeWay({ k: 'ingest' })), [],
      'while `ingest` is on all three, which is what makes the finding above a finding');
    // And the BOUND itself, read from the document rather than from the walk: the
    // reader must genuinely have three predecessors, or the case is a two-way merge
    // with a longer name.
    const arcsInto = (id: string) =>
      threeWay({}).nodes.filter((n) =>
        ((n as { edges?: { to: string }[] }).edges ?? []).some((e) => e.to === id)).length;
    equal(arcsInto('publish'), 3, 'publish really has THREE inbound arcs — the bound this exercises');
  });

  test('FD-V29 is SKIPPED where the entry node is not a node — the walk has no answer', () => {
    // W45's adequacy reader. `certainlySettled` returns an EMPTY map when `entry`
    // names nothing, and `certain.get(n.id)?.has(target) ?? false` then read *not
    // certain* — so the validator reported `FD-V29` *"a run can reach this node
    // without `ingest` having run"* about a document with **no entry node at all**,
    // beside `FD-V3`. The sibling rules degrade gracefully: `FD-V27`'s `reachFrom`
    // and `FD-V28`'s regions do not depend on `entry`. This one is entry-rooted and
    // now says so, on the `!cyclic` guard's own argument — a walk that is not
    // meaningful produces noise rather than findings.
    const noEntry = {
      flowId: 'no-entry-node', version: 1, entry: 'nope',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'subject' }] },
        { id: 'subject', kind: 'task', type: 'ScoreWorker', needs: { k: 'ingest' }, edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    equal(rulesOf(noEntry), ['FD-V3'],
      'FD-V3 alone — and `FD-V29` said something FALSE about this document before this guard');
  });

  test('the refusal names the fix for BOTH forms, and they are different fixes', () => {
    // W45's adequacy reader: the message's `t.form === 'all'` branches were
    // unasserted, and collapsing them told the author of an array-form reference to
    // write `"merge?"` — which `FD-V28` then refuses — and to expect an absent key
    // rather than `[]`. Both are the wrong instruction, and the ADR's own standard
    // is *the refusal names the fix*.
    const inAMapRegion = (needs: unknown): FlowDefinition =>
      doc([
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'outer' }] },
        { id: 'outer', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
        { id: 'scoreA', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'outerJoin' }] },
        { id: 'scoreB', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'inner' }] },
        { id: 'inner', kind: 'map', over: 'items', branch: 'merge' },
        { id: 'merge', kind: 'task', type: 'MergeWorker', edges: [{ to: 'innerJoin' }] },
        { id: 'innerJoin', kind: 'join', of: 'inner', edges: [{ to: 'outerJoin' }] },
        { id: 'outerJoin', kind: 'join', of: 'outer', edges: [{ to: 'publish' }] },
        { id: 'publish', kind: 'task', type: 'PublishWorker', needs, edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ]);
    equal(rulesOf(inAMapRegion({ x: ['merge'] })), ['FD-V29'], 'the ARRAY form, refused');
    const all = validateDefinition(inAMapRegion({ x: ['merge'] }), REGISTRY)[0]!;
    ok(all.detail.includes('"merge?" inside the array'),
      'and the fix it names is the suffix INSIDE the array — `"merge?"` bare is FD-V28');
    ok(all.detail.includes('possibly-empty array'),
      'and it says the key will be an empty array, which is FD-C4`s array row and not its other one');
    // The one-form half, on the same rule, so the two messages are compared rather
    // than each asserted alone.
    const one = validateDefinition(acrossADecision({ f: 'flag' }), REGISTRY)[0]!;
    ok(one.detail.includes('possibly absent') && !one.detail.includes('inside the array'),
      'while the ONE form is told *possibly absent* and nothing about an array');
  });

  test('FD-V29 and FD-V28 are INDEPENDENT — a document that violates both reports both', () => {
    // No `continue` between them in the validator, and this is why: an author with a
    // wrong form AND an uncertain target has two things to fix, and reporting one
    // would hide the other until the first was fixed. Section 5's *reports EVERY
    // violation* is the rule.
    const both = doc([
      { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'outer' }] },
      { id: 'outer', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
      { id: 'scoreA', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'outerJoin' }] },
      { id: 'scoreB', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'inner' }] },
      { id: 'inner', kind: 'map', over: 'items', branch: 'scoreC' },
      { id: 'scoreC', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'innerJoin' }] },
      { id: 'innerJoin', kind: 'join', of: 'inner', edges: [{ to: 'outerJoin' }] },
      { id: 'outerJoin', kind: 'join', of: 'outer', edges: [{ to: 'publish' }] },
      // `scoreC` is inside a MAP region this node is outside of, so FD-V28 wants
      // `["scoreC"]`; and it is an inner branch entry, so FD-V29 wants the suffix.
      { id: 'publish', kind: 'task', type: 'PublishWorker', needs: { c: 'scoreC' }, edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ]);
    equal(rulesOf(both), ['FD-V28', 'FD-V29'], 'both, and neither hides the other');
  });

  test('the corpus is UNMOVED by FD-V29 — every valid example still validates', async () => {
    // **The measurement the rule was decided on, as an assertion.** 0 of the 6
    // references `spec/examples/valid/**` writes is refused, so this rule is a
    // widening nothing in the normative corpus pays for. `l4-corpus.test.ts`
    // asserts the same thing over the directory; this one says WHY it is here.
    const names = (await listDir(`${EX}/valid`)).filter((n) => n.endsWith('.flow.json'));
    // **Bounded by section 7's own example table, not by a floor** - rule 8 found
    // that `names.length >= 14` catches a slice to 3 and not a slice to 14, and that
    // the `equal(ran, names)` below is a tautology because `ran` is pushed inside a
    // loop over `names`. The count comes from the normative document, which this
    // file does not own, and `l4-corpus.test.ts` already compares that table to the
    // directory BOTH WAYS - so the two halves cannot drift.
    const tableRows = specText.split(/\r?\n/)
      .filter((l) => /^\| `[a-z0-9-]+\.flow\.json` \|/.test(l)).length;
    ok(tableRows > 0, 'section 7`s example table is where this count comes from, and it is not there');
    equal(names.length, tableRows,
      'the loop runs one flow per row of `spec/flow-definition.md` section 7`s example table - a ' +
      'floor here answered *are there at least N* and went stale toward weakness');
    const ran: string[] = [];
    for (const n of names) {
      ran.push(n);
      const d = JSON.parse(await readText(`${EX}/valid/${n}`)) as FlowDefinition;
      equal(validateDefinition(d, REGISTRY), [], `${n} validates with zero findings`);
    }
    equal(ran, names, 'the LOOP ran every file the DIRECTORY holds, not a list beside itself');
  });
});

/**
 * **The measurement `ADR 0042` is decided on, as an assertion** — W45's adequacy
 * reader, and the comparable precedent is W41's `FD-C2` measurement, which is an
 * executable L2 clause where this one was prose in three files.
 *
 * **The four PROPERTIES are asserted and the four absolute NUMBERS are not**, which
 * is deliberate and is [Q102](../../doc/open-questions.md)'s shape avoided rather
 * than met: `127 / 30 / 8 / 22` are true of the corpus this rule was decided over and
 * would go stale the next time anyone adds a flow, so pinning them would oblige every
 * future item to retune a literal it has no opinion about. The properties are what the
 * decision rests on, they are stable under corpus growth, and each is falsifiable —
 * deleting the conjunctive clause makes the gap ZERO and clause 3 red.
 *
 * The walk below is written from `spec/flow-definition.md` section 4's arc enumeration
 * and section 3's routing rule 2, **not** from `src/definition/regions.ts`, so it is a
 * second independent expression of the same graph.
 */
suite('L1 — FD-V29 is not dominance, and that is a measurement over the corpus', (test) => {
  type Doc = { entry: string; nodes: { id: string; kind: string; [k: string]: unknown }[] };

  /** Section 4's arc shapes: a task's and a join's `edges`, a fanout's `branches`, a map's `branch`. */
  const succOf = (d: Doc) => {
    const out = new Map<string, string[]>(d.nodes.map((n) => [n.id, [] as string[]]));
    for (const n of d.nodes) {
      const push = (t: string) => out.get(n.id)!.push(t);
      if (n.kind === 'task' || n.kind === 'join') {
        for (const e of (n.edges ?? []) as { to: string }[]) push(e.to);
      } else if (n.kind === 'fanout') for (const b of (n.branches ?? []) as string[]) push(b);
      else if (n.kind === 'map') push(n.branch as string);
    }
    return out;
  };

  /** `conjunctive: false` is plain dominance; `true` is `FD-V29`'s certainty. */
  const walk = (d: Doc, conjunctive: boolean) => {
    const succ = succOf(d);
    const pred = new Map<string, string[]>(d.nodes.map((n) => [n.id, [] as string[]]));
    for (const [a, ss] of succ) for (const x of ss) if (pred.has(x)) pred.get(x)!.push(a);
    const reach = new Set([d.entry]);
    const st = [d.entry];
    while (st.length) {
      const x = st.pop()!;
      for (const y of succ.get(x) ?? []) if (!reach.has(y)) { reach.add(y); st.push(y); }
    }
    const entriesOf = new Map<string, string[]>();
    const openerOf = new Map<string, string>();
    for (const n of d.nodes) {
      if (n.kind === 'fanout') entriesOf.set(n.id, n.branches as string[]);
      if (n.kind === 'map') entriesOf.set(n.id, [n.branch as string]);
      if (n.kind === 'join') openerOf.set(n.id, n.of as string);
    }
    const m = new Map<string, Set<string>>(
      [...reach].map((i) => [i, i === d.entry ? new Set<string>() : new Set(reach)]),
    );
    for (let pass = 0; pass < 200; pass++) {
      let moved = false;
      for (const i of reach) {
        if (i === d.entry) continue;
        const ps = (pred.get(i) ?? []).filter((x) => reach.has(x));
        let nx = ps.length ? new Set([...m.get(ps[0]!)!, ps[0]!]) : new Set<string>();
        for (const q of ps.slice(1)) {
          const t = new Set([...m.get(q)!, q]);
          nx = new Set([...nx].filter((x) => t.has(x)));
        }
        const op = openerOf.get(i);
        if (conjunctive && op !== undefined && reach.has(op)) {
          for (const b of entriesOf.get(op) ?? []) if (reach.has(b)) nx.add(b);
        }
        const c = m.get(i)!;
        if (nx.size !== c.size || [...nx].some((x) => !c.has(x))) { m.set(i, nx); moved = true; }
      }
      if (!moved) return m;
    }
    ok(false, 'the fixpoint did not converge — FD-V10 forbids cycles, so this cannot happen');
    return m;
  };

  test('certainty is a STRICT subset of dominance, and the corpus writes nothing either refuses', async () => {
    // **`FD-V29` is excluded from the admission test, and that is the whole
    // subtlety.** The claim is about what `FD-V26`/`FD-V27`/`FD-V28` admit — the
    // rules that existed when this was decided. Run the whole validator instead and
    // it refuses exactly the certainty set, so the measurement reports *certainty
    // refuses 0* and is circular. Measured: it does.
    const AIMING = ['FD-V26', 'FD-V27', 'FD-V28'];
    let admitted = 0, dominance = 0, certainty = 0, certaintyOnly = 0;
    let writtenRefs = 0, writtenRefusedByCertainty = 0;
    const files = (await listDir(`${EX}/valid`)).filter((n) => n.endsWith('.flow.json')).sort();
    const ran: string[] = [];
    for (const f of files) {
      const base = JSON.parse(await readText(`${EX}/valid/${f}`)) as Doc;
      ran.push(f);
      const dom = walk(base, false), cert = walk(base, true);
      // What the document WRITES: no reference the corpus actually carries may be
      // refused by the rule that ships. This is the half P13 fact 2 measured and the
      // one that would make the rule cost something.
      for (const n of base.nodes) {
        const sites = [n.needs, ...((n.edges ?? []) as { needs?: unknown }[]).map((e) => e.needs)];
        for (const site of sites) {
          for (const ref of Object.values((site ?? {}) as Record<string, unknown>)) {
            const t = referenceTarget(ref);
            if (t === null || t.node === null) continue;
            writtenRefs++;
            if (!t.conditional && !cert.get(n.id)?.has(t.node)) writtenRefusedByCertainty++;
          }
        }
      }
      // The ADMITTED set: every (reader, target, form) triple the aiming rules accept.
      const tasks = base.nodes.filter((n) => n.kind === 'task').map((n) => n.id);
      const readers = base.nodes.filter((n) => n.kind === 'task' || n.kind === 'map').map((n) => n.id);
      for (const reader of readers) for (const target of tasks) for (const form of ['one', 'all'] as const) {
        const d = JSON.parse(JSON.stringify(base)) as Doc;
        const rn = d.nodes.find((n) => n.id === reader)! as Record<string, unknown>;
        rn.needs = { ...((rn.needs ?? {}) as object), __probe: form === 'one' ? target : [target] };
        const fs = validateDefinition(d as unknown as FlowDefinition, REGISTRY);
        if (fs.some((x) => AIMING.includes(x.rule))) continue;
        admitted++;
        const dRef = !dom.get(reader)?.has(target), cRef = !cert.get(reader)?.has(target);
        if (dRef) dominance++;
        if (cRef) certainty++;
        if (cRef && !dRef) certaintyOnly++;
      }
    }
    equal(ran, files, 'the LOOP ran every flow the DIRECTORY holds, not a list beside it');

    // 1. The admitted set is not empty, or every clause below is vacuous.
    ok(admitted > 0, `the corpus admits references at all (${admitted})`);
    // 2. Certainty is a SUBSET of dominance — everything dominance accepts, it accepts.
    equal(certaintyOnly, 0,
      'nothing is refused by certainty and accepted by dominance: the conjunctive clause only ' +
      'ever ADDS to what is certain, which is why FD-V29 cannot refuse more than dominance would');
    // 3. And a STRICT subset — there is a gap, which is the whole decision. Deleting
    //    the conjunctive clause makes certainty equal dominance and this clause red.
    ok(dominance > certainty,
      `dominance refuses STRICTLY more than FD-V29 does (${dominance} against ${certainty}) — the ` +
      'references in between are the ones a dominance rule would have cost, and there is at ' +
      'least one');
    // 4. And the corpus WRITES nothing the shipped rule refuses, which is what makes
    //    adopting it cost zero. P13 fact 2's half, over the normative corpus.
    ok(writtenRefs > 0, `the corpus writes aimed references at all (${writtenRefs})`);
    equal(writtenRefusedByCertainty, 0,
      'and FD-V29 refuses NONE of them — every unconditional reference the normative corpus ' +
      'carries names a node every path to its reader passes through');
  });
});

suite('L1 — what `FD-V17` refuses against IS what `spec/` declares', (test) => {
  /**
   * **The third instance in one plan of *a list bound to nothing*** — W41 found
   * `RULE_PREFIXES` and its own `accepted` list, and W42's conformity reader found
   * this: `FD-V17` reads *"a node object, **an edge object**, or the document carries
   * a key its kind does not declare"*, and the only statement of what an edge
   * declares is section 3's Edge key table. `EDGE_KEYS` is a literal in
   * `src/definition/validate.ts`, and **nothing compared the two**: for one item the
   * code accepted `needs` on an edge while the table did not declare it, which is
   * `spec/README.md` rule 4's inverse in the accepting direction.
   *
   * **Both ways.** A key in the code and not the table is a rule refusing against a
   * set the document does not state; a key in the table and not the code is a
   * document promising a key `FD-V17` then refuses.
   *
   * Measured: rewriting the table's `needs` row struck through cost **0** before this.
   */
  const keyRows = (heading: string): string[] => {
    const lines = specText.split(/\r?\n/);
    const head = lines.findIndex((l) => l.startsWith(heading));
    ok(head >= 0, `${heading} is where this comes from, and it is not there`);
    const out: string[] = [];
    for (let i = head + 2; i < lines.length && lines[i]!.startsWith('|'); i++) {
      const first = lines[i]!.split('|')[1]!.trim();
      const m = /^`([A-Za-z]+)`$/.exec(first);
      if (m) out.push(m[1]!);
    }
    return out.sort();
  };

  test('the EDGE key table and `EDGE_KEYS` are the same set, both ways', () => {
    const declared = keyRows('| Edge key | | |');
    equal(declared, ['needs', 'on', 'to', 'when'],
      'section 3 declares exactly four edge keys — and a row struck through or added is red here ' +
      'rather than silently disagreeing with the validator');
    equal([...EDGE_KEYS_DECLARED].sort(), declared,
      '`FD-V17` refuses against the same four the document declares. A key in one and not the ' +
      'other is a rule whose set nobody wrote down');
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
