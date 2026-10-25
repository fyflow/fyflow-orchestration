/**
 * Ladder L1 — **a bracket array INDEX in a key path**: `spec/flow-definition.md` v0.53 (section 2's gate KEY PATH,
 * section 3's `when` PATH and the wiring check's gate paragraphs, `FD-V40`, `FD-V43`),
 * [ADR 0137](../../doc/decisions/0137-a-key-path-indexes-an-array-by-a-bracket-suffix-and-a-plain-segment-keeps-its-meaning.md),
 * [W216](../../doc/work-items/w216-a-bracket-array-index-in-a-key-path.md), P44 (c1) — fyflow-app's pass 5 #2.
 *
 * **Every expected value is read from ADR 0137's grammar and rules**, written before the first run, never from the
 * validator's or `readKeyPath`'s output: the grammar's accepted and refused spellings (rule 1), the resolution over
 * hand-written values (rule 2), the root rule (rule 3), the wiring refinement and refusal (rule 4), the schema's
 * patterns (rule 5). **The CONTROL of every index claim is the plain numeric segment** — `xs.1` — which keeps its
 * meaning (an own key of a plain object, `undefined` over an array), so a resolution that read `xs[1]` as `xs.1`, or
 * `xs.1` as `xs[1]`, differs from the right one on the same value.
 *
 * **What it selects, and where each wrong selection differs** (`doc/workflow.md` section 5 rule 8 obligation (a)):
 *
 * | selection | right | wrong, and the fixture where it differs |
 * |---|---|---|
 * | what `[n]` indexes | a REAL array's element `n` | a plain object's key `"n"` (`{ "1": … }`), an array-like's (`{ length, 0, 1 }`), a string's character |
 * | what a numeric segment reads | an own key of a plain object | an array element — `xs.1` over `['a', 'b']` |
 * | the root of a `when.path` | up to the first `.` OR `[` | up to the first `.` alone — `outcom[0].x` then reads root `outcom[0]` and the message names the wrong root |
 * | the guarantee past an index | `minItems: n + 1`, and nothing about any element | `required` pushed into `items` — every element would be promised what one carried |
 * | the minItems a guarantee leaves | the larger of the producer's and `n + 1` | `n + 1` always — a producer's `minItems: 3` lowered to 2 |
 */
import { collected, equal, ok, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { KEY_PATH_RE, keyPathProblem, readKeyPath, validateDefinition } from '../../src/definition/validate.ts';
import { definitionSchema } from '../../src/definition/definition-schema.ts';
import { checkWiring } from '../../src/definition/wiring.ts';
import type { FlowDefinition, JsonSchema, Registry } from '../../src/definition/types.ts';

const SUITE = 'L1 — W216, ADR 0137: a bracket array index in a key path — the grammar on a gate`s key and a when.path, the root, readKeyPath, the wiring refinement and the schema';

const DECLARED_CASES = [
  'the grammar: every well-formed spelling accepted, every malformed one refused naming the bracket form',
  'on a gate`s key (FD-V40), an edge`s when.path (FD-V43) and an if gate`s when.path (FD-V40): the same grammar',
  'FD-V43`s root: read before the first `[`, and an index ON the root refused in both scopes',
  'readKeyPath: [n] on a real array and nothing else; a plain numeric segment unchanged (the control)',
  'every path the v0.52 grammar accepted resolves exactly as v0.52`s readKeyPath did — the oracle kept here',
  'the wiring check along an index: fits along items, a refusal where the producer is not an array or items refuses the next step, silences',
  'the wiring guarantee: minItems raised to n + 1 and never lowered, and nothing promised past the index',
  'definitionSchema(): the gate key pattern IS KEY_PATH_RE, and a comparison path takes an index past the root only',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

/** ADR 0137 rule 1's examples, ACCEPTED. */
const WELL_FORMED = ['xs[0]', 'xs[1].id', 'm[0][2]', 'a.b[999999999].c', '0[0]', 'files[0].series', 'x'.repeat(64) + '[7]', 'series.id', 'xs.1'];
/** ADR 0137 rule 1's examples, REFUSED — each a different way a bracket can be wrong, plus the forms ADR 0137 declines. */
const MALFORMED = [
  '[0]', '[0].x', 'xs[]', 'xs[-1]', 'xs[01]', 'xs[00]', 'xs[a]', 'xs[0', 'xs0]', 'xs]0[', 'xs.[0]', 'xs[0]x', 'xs[0].', 'xs[1000000000]',
  'xs[*]', 'xs[ 1]', 'xs[1.5]', 'xs["0.1"]', "xs['a']", 'xs[0]]', 'xs[[0]]',
];

const REG: Registry = { predicates: [], ...typesFor(['Work', 'Other']) };

/** A gate keyed `key` after a task — each route to its own end. */
const gateFlow = (key: string): FlowDefinition => ({
  flowId: 'k', version: 1, entry: 'work', nodes: [
    { id: 'work', kind: 'task', type: 'Work', edges: [{ to: 'g' }] },
    { id: 'g', kind: 'gate', type: 'distinct', settings: { key }, edges: [{ to: 'a' }, { route: 'duplicate', to: 'b' }, { route: 'nokey', to: 'b' }] },
    { id: 'a', kind: 'end', outcome: 'a' }, { id: 'b', kind: 'end', outcome: 'b' },
  ],
}) as unknown as FlowDefinition;
/** A task edge whose `when` compares `path`. */
const edgeFlow = (path: string, needs?: Record<string, unknown>): FlowDefinition => ({
  flowId: 'e', version: 1, entry: 'work', nodes: [
    { id: 'work', kind: 'task', type: 'Work', edges: [{ to: 'a', when: { path, op: 'eq', value: 'b' }, ...(needs === undefined ? {} : { needs }) }, { to: 'b' }] },
    { id: 'a', kind: 'end', outcome: 'a' }, { id: 'b', kind: 'end', outcome: 'b' },
  ],
}) as unknown as FlowDefinition;
/** An `if` gate whose condition compares `path`. */
const ifFlow = (path: string): FlowDefinition => ({
  flowId: 'i', version: 1, entry: 'work', nodes: [
    { id: 'work', kind: 'task', type: 'Work', edges: [{ to: 'g' }] },
    { id: 'g', kind: 'gate', type: 'if', settings: { when: { path, op: 'eq', value: 'b' } }, edges: [{ route: 'then', to: 'a' }, { to: 'b' }] },
    { id: 'a', kind: 'end', outcome: 'a' }, { id: 'b', kind: 'end', outcome: 'b' },
  ],
}) as unknown as FlowDefinition;
const findingsOf = (f: FlowDefinition) => validateDefinition(f, REG).map((x) => `${x.rule}@${x.at}`);
const detailsOf = (f: FlowDefinition) => validateDefinition(f, REG).map((x) => x.detail).join(' | ');

/**
 * **`readKeyPath` as v0.52 shipped it** — copied from `src/definition/condition.ts` at `07bc379`, the ORACLE for
 * *everything that already validates resolves exactly as before* (ADR 0137 rule 2). Never edited with the code.
 */
function readKeyPathV052(value: unknown, path: string): unknown {
  let v = value;
  for (const seg of path.split('.')) {
    if (typeof v !== 'object' || v === null) return undefined;
    const proto = Object.getPrototypeOf(v);
    if (proto !== Object.prototype && proto !== null) return undefined;
    if (!Object.prototype.hasOwnProperty.call(v, seg)) return undefined;
    v = (v as Record<string, unknown>)[seg];
  }
  return v;
}
/** v0.52's grammar, kept beside its resolution. */
const KEY_PATH_RE_V052 = /^[A-Za-z0-9_-]{1,64}(?:\.[A-Za-z0-9_-]{1,64})*$/;

suite(SUITE, (test) => {
  test('the grammar: every well-formed spelling accepted, every malformed one refused naming the bracket form', () => {
    for (const p of WELL_FORMED) {
      equal([p, KEY_PATH_RE.test(p)], [p, true], `${p} is a key path (ADR 0137 rule 1)`);
      equal([p, keyPathProblem(p)], [p, null], `and keyPathProblem says nothing of ${p}`);
    }
    for (const p of MALFORMED) {
      equal([p, KEY_PATH_RE.test(p)], [p, false], `${p} is NOT a key path (ADR 0137 rule 1)`);
      const why = keyPathProblem(p) ?? '';
      // **Naming the fix**: the message says what an index looks like and where it may stand.
      ok(why.includes('[n]') && why.includes('files[0].series') && why.includes('no leading zero') && why.includes('no index leading the path'),
        `the refusal of ${p} names the bracket form, its spelling and its place: ${why}`);
    }
    // The bound is AT 999,999,999: nine digits pass, ten do not — a bound one digit off on either side is caught.
    ok(KEY_PATH_RE.test('xs[100000000]') && KEY_PATH_RE.test('xs[999999999]') && !KEY_PATH_RE.test('xs[1000000000]'), 'nine digits are the bound');
    equal(WELL_FORMED.length + MALFORMED.length, 9 + 21, 'the two lists, counted — a list cut down is caught here and not by the loops');
  });

  test('on a gate`s key (FD-V40), an edge`s when.path (FD-V43) and an if gate`s when.path (FD-V40): the same grammar', () => {
    // A gate's key is the path itself; a when.path is `<root>.` + the path — so ONE list, three sites.
    for (const p of WELL_FORMED) {
      equal([p, findingsOf(gateFlow(p))], [p, []], `a gate keyed ${p} validates`);
      equal([p, findingsOf(edgeFlow(`outcome.result.${p}`))], [p, []], `an edge comparing outcome.result.${p} validates`);
      equal([p, findingsOf(ifFlow(`input.${p}`))], [p, []], `an if comparing input.${p} validates`);
    }
    for (const p of MALFORMED) {
      equal([p, findingsOf(gateFlow(p))], [p, ['FD-V40@g']], `a gate keyed ${p} is FD-V40 at the gate`);
      equal([p, findingsOf(edgeFlow(`outcome.result.${p}`))], [p, ['FD-V43@work#edge0']], `an edge comparing outcome.result.${p} is FD-V43 at its node`);
      equal([p, findingsOf(ifFlow(`input.${p}`))], [p, ['FD-V40@g']], `an if comparing input.${p} is FD-V40 at the gate`);
      ok(detailsOf(edgeFlow(`outcome.result.${p}`)).includes('[n]'), `and the edge's message names the bracket form for ${p}`);
    }
  });

  test('FD-V43`s root: read before the first `[`, and an index ON the root refused in both scopes', () => {
    // An index on a KNOWN root: refused for indexing it — not as a foreign root, and not as a root alone.
    for (const [f, rule, at] of [
      [edgeFlow('outcome[0].x'), 'FD-V43', 'work#edge0'], [edgeFlow('needs[0]'), 'FD-V43', 'work#edge0'], [edgeFlow('outcome[1][2].x'), 'FD-V43', 'work#edge0'],
      [ifFlow('input[0]'), 'FD-V40', 'g'], [ifFlow('input[0].x'), 'FD-V40', 'g'],
    ] as const) {
      equal(findingsOf(f), [`${rule}@${at}`], `an index on the root is refused (${rule})`);
      const d = detailsOf(f);
      ok(d.includes('indexes its root') && d.includes('.items[0]'), `naming the fix — a key first, then the index: ${d}`);
    }
    // The ROOT is what precedes the `[`: a foreign root is named WITHOUT its bracket, and called foreign.
    const foreign = detailsOf(edgeFlow('outcom[0].x'));
    ok(foreign.includes('starts at "outcom"') && !foreign.includes('indexes its root'), `outcom[0].x starts at "outcom", a foreign root: ${foreign}`);
    const wrongScope = detailsOf(ifFlow('outcome[0].x'));
    ok(wrongScope.includes('starts at "outcome"') && wrongScope.includes('one root is "input"'), `an if reading outcome[0] starts at "outcome", not its root: ${wrongScope}`);
    // A root alone is still a root alone, and an index one key in is fine — the two neighbours.
    ok(detailsOf(edgeFlow('outcome')).includes('is a root alone'), 'outcome alone is still a root alone');
    // v0.55 (W221, P45 (g1)): a `needs` path's first key must be one the edge declares, so the edge declares `a` — the
    // claim here is the INDEX one key in, and the key it indexes is read up to its `[`.
    equal(findingsOf(edgeFlow('needs.a[0]', { a: '$payload' })), [], 'needs.a[0] — an index on the first key past the root — validates');
    equal(findingsOf(ifFlow('input.xs[1]')), [], 'input.xs[1] validates');
  });

  test('readKeyPath: [n] on a real array and nothing else; a plain numeric segment unchanged (the control)', () => {
    const v = {
      xs: ['a', 'b'],
      obj: { 1: 'one', 0: 'zero' },
      like: { length: 2, 0: 'a', 1: 'b' },
      str: 'ab',
      typed: new Uint8Array([7, 8]),
      files: [{ series: 's0' }, { series: 's1' }],
      grid: [['g00', 'g01'], ['g10', 'g11']],
      nul: null,
      empty: [],
      deep: { ys: [{ zs: [0, { w: 'W' }] }] },
    };
    // [n] on a REAL array: its element n.
    equal(readKeyPath(v, 'xs[0]'), 'a', 'xs[0] is the first element');
    equal(readKeyPath(v, 'xs[1]'), 'b', 'xs[1] is the second — not the first, not the last by accident (two elements, two answers)');
    equal(readKeyPath(v, 'files[1].series'), 's1', 'a key AFTER an index reads the element`s own key');
    equal(readKeyPath(v, 'grid[1][0]'), 'g10', 'two brackets index an array of arrays, in order');
    equal(readKeyPath(v, 'grid[0][1]'), 'g01', 'and in the other order — so the brackets are not read reversed');
    equal(readKeyPath(v, 'deep.ys[0].zs[1].w'), 'W', 'a deep path through two indexes');
    equal(readKeyPath(v, 'files[0]'), { series: 's0' }, 'an index at the END returns the element whatever it is');
    // Past its end, and on everything that is not a real array: nothing.
    equal(readKeyPath(v, 'xs[2]'), undefined, 'past the end is nothing');
    equal(readKeyPath(v, 'empty[0]'), undefined, 'an empty array has no element 0');
    equal(readKeyPath(v, 'obj[1]'), undefined, 'a PLAIN OBJECT holding a key "1" is not indexed');
    equal(readKeyPath(v, 'like[0]'), undefined, 'an ARRAY-LIKE object is not indexed');
    equal(readKeyPath(v, 'str[0]'), undefined, 'a string is not indexed — a primitive has no elements here');
    equal(readKeyPath(v, 'typed[0]'), undefined, 'a typed array is not a real array');
    equal(readKeyPath(v, 'nul[0]'), undefined, 'null is not indexed');
    equal(readKeyPath(v, 'missing[0]'), undefined, 'a missing key, then an index, is nothing');
    equal(readKeyPath(v, 'files[0].nope'), undefined, 'a missing key after an index is nothing');
    equal(readKeyPath(v, 'grid[0][2]'), undefined, 'the second bracket past ITS array`s end is nothing');
    equal(readKeyPath(['root'], 'x'), undefined, 'and a KEY step over an array is nothing, as before');
    // **The CONTROL: a plain numeric segment keeps its meaning** (P44 (c1)) — on the SAME values.
    equal(readKeyPath(v, 'xs.1'), undefined, 'xs.1 over an ARRAY is nothing — a numeric segment is a KEY, never an index');
    equal(readKeyPath(v, 'obj.1'), 'one', 'and obj.1 over a plain object is its own key "1"');
    equal(readKeyPath(v, 'files.0.series'), undefined, 'files.0.series is nothing — the index form is files[0].series');
    // A string the grammar does not accept is read as ONE literal key, as every segment was before v0.53.
    equal(readKeyPath({ 'a[01]': 1, '[0]': 2, 'a[*]': 3 }, 'a[01]'), 1, 'a[01] — a leading zero — is a literal key, unchanged');
    equal(readKeyPath({ '[0]': 2 }, '[0]'), 2, '[0] — no key before it — is a literal key, unchanged');
    equal(readKeyPath({ 'a[*]': 3 }, 'a[*]'), 3, 'a[*] is a literal key, unchanged');
    equal(readKeyPath({ a: ['x'] }, 'a[01]'), undefined, 'and is NOT read as an index over an array');
    // **At the bound** (the adequacy reader's K7, K7b): a NINE-digit index is an index — past a short array's end it is
    // nothing, never the array itself — and a TEN-digit one is a literal key, as it always was.
    equal(readKeyPath({ xs: ['a'] }, 'xs[123456789]'), undefined, 'a nine-digit index past the end is nothing — not the array');
    equal(readKeyPath({ xs: ['a'] }, 'xs[999999999]'), undefined, 'and so is the largest one');
    equal(readKeyPath({ 'xs[1000000000]': 1, xs: ['a'] }, 'xs[1000000000]'), 1, 'a ten-digit bracket is a literal key, unchanged');
    // **A KEY outside FD-V16's charset, before well-formed brackets, is still ONE literal key** (the conformity reader,
    // SHOULD 1): the bracket form is read only on a segment the grammar spells whole.
    const lit = (k: string) => ({ [k]: 'LIT', [k.slice(0, k.indexOf('['))]: ['X'] });
    for (const k of ['a b[0]', 'x'.repeat(65) + '[0]', '$[0]', 'ü[0]', 'a*[0]']) equal(readKeyPath(lit(k), k), 'LIT', `${k} is a literal key, as before v0.53`);
    // **A HOLE is nothing** (the conformity reader, NIT 1): an index reads an OWN element, never the prototype's.
    const holey = structuredClone([, 'b']) as unknown[];
    const proto = Object.assign(Object.create(Array.prototype), { 0: 'FROM-PROTO' });
    Object.setPrototypeOf(holey, proto);
    equal([Array.isArray(holey), 0 in holey, Object.prototype.hasOwnProperty.call(holey, 0)], [true, true, false], 'the fixture: a real array, a hole at 0 its prototype answers');
    equal(readKeyPath({ xs: holey }, 'xs[0]'), undefined, 'a hole is nothing — not what the prototype answers');
    equal(readKeyPath({ xs: holey }, 'xs[1]'), 'b', 'and the own element beside it is read');
  });

  test('every path the v0.52 grammar accepted resolves exactly as v0.52`s readKeyPath did — the oracle kept here', () => {
    class Box { id = 'boxed'; }
    const values: unknown[] = [
      { a: { b: 1 }, xs: [1, 2], '0': { '1': 'k' }, n: null, s: 'str', box: new Box(), m: new Map([['a', 1]]) },
      [{ a: 1 }], 'a', 7, null, undefined, Object.assign(Object.create(null), { a: { b: 'bare' } }), { toString: 'own' }, {},
    ];
    const paths = ['a', 'a.b', 'a.b.c', 'xs', 'xs.0', 'xs.1', '0', '0.1', 'n', 'n.x', 's', 's.length', 'box', 'box.id', 'm.a', 'toString', 'a.toString', '__proto__', 'constructor'];
    let compared = 0;
    for (const p of paths) {
      ok(KEY_PATH_RE_V052.test(p) && KEY_PATH_RE.test(p), `${p} is accepted by BOTH grammars — this case is about those only`);
      for (const v of values) {
        equal([p, readKeyPath(v, p)], [p, readKeyPathV052(v, p)], `${p} resolves as it did at v0.52`);
        compared++;
      }
    }
    equal(compared, 19 * 9, 'nineteen paths over nine values, every pair compared');
    // The grammar only GREW: a sample of v0.52's accepted set is still accepted, and its refused set less the index.
    for (const p of ['x'.repeat(64), 'a-b_c.D9', '0.0.0']) ok(KEY_PATH_RE.test(p), `${p} still accepted`);
    for (const p of ['a..b', '.a', 'a.', 'a b', '$.a', 'a.*', 'x'.repeat(65)]) ok(!KEY_PATH_RE.test(p) && !KEY_PATH_RE_V052.test(p), `${p} refused by both`);
  });

  // ---- the wiring check, ADR 0068 along an index (ADR 0137 rule 4) ----
  const element = { type: 'object', properties: { series: { type: 'string' }, extra: { type: 'string' } } };
  const producer = {
    type: 'object', required: ['files'], additionalProperties: false,
    properties: {
      files: { type: 'array', items: element },
      closed: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { id: { type: 'string' } } } },
      many: { type: 'array', minItems: 3, items: element },
      name: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } },
      loose: { type: 'array' },
      grid: { type: 'array', items: { type: 'array', items: { type: 'string' } } },
      anyShape: {},
    },
    examples: [{ files: [{ series: 's' }] }],
  } as unknown as JsonSchema;
  const wiringReg = (consumer: JsonSchema) => ({
    workers: { p: { url: 'test://p', outputSchema: producer }, c: { url: 'test://c', inputSchema: consumer } },
    nodeTypes: { P: { worker: 'p' }, C: { worker: 'c' } },
  } as unknown as Parameters<typeof checkWiring>[0]);
  const wiringFlow = (key: string) => ({
    flowId: 'kw', version: 1, entry: 'produce', nodes: [
      { id: 'produce', kind: 'task', type: 'P', edges: [{ to: 'gate' }] },
      { id: 'gate', kind: 'gate', type: 'distinct', settings: { key }, edges: [{ to: 'onFirst' }, { route: 'duplicate', to: 'onDup' }, { route: 'nokey', to: 'onNo' }] },
      { id: 'onFirst', kind: 'task', type: 'C', edges: [{ to: 'done' }] },
      { id: 'onDup', kind: 'task', type: 'C', edges: [{ to: 'done' }] },
      { id: 'onNo', kind: 'task', type: 'C', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition);
  /** The verdict on the arc leaving by `first` — `distinct`'s default and a key-resolved route. */
  const onFirst = async (key: string, consumer: JsonSchema = { type: 'object' } as JsonSchema) => {
    const v = (await checkWiring(wiringReg(consumer), wiringFlow(key))).verdicts.find((x) => x.consumer === 'onFirst');
    return { kind: v?.kind ?? 'none', why: v?.why ?? '' };
  };

  test('the wiring check along an index: fits along items, a refusal where the producer is not an array or items refuses the next step, silences', async () => {
    // Each row derived from ADR 0137 rule 4 over the producer above; `at` is where the walk stopped, as `findings` addresses.
    const rows: readonly { key: string; kind: string; at?: string; says?: string; why: string }[] = [
      { key: 'files[0].series', kind: 'fits', why: 'the producer says files is an array whose items describe series — fits along items' },
      { key: 'files[0]', kind: 'fits', why: 'an index at the END: the leaf`s type is never read (ADR 0068 rule 3)' },
      { key: 'grid[0][1]', kind: 'fits', why: 'two indexes through an array of arrays' },
      { key: 'files[0].nope', kind: 'fits', why: 'items is an OPEN object: a key it does not name is a silence' },
      { key: 'loose[3].x', kind: 'fits', why: 'no items at all: OPEN, so any element may be there — a silence' },
      { key: 'anyShape[0]', kind: 'fits', why: 'a schema of no type may be an array — a silence' },
      { key: 'name[0]', kind: 'no', at: '$.name', says: 'calls it string, and an index [0] reads an element of an array', why: 'the producer calls name a string' },
      { key: 'files[0][0]', kind: 'no', at: '$.files[0]', says: 'calls it object, and an index [0] reads an element of an array', why: 'the ELEMENT is an object, indexed again' },
      { key: 'tags[2].x', kind: 'no', at: '$.tags[2]', says: 'calls it string, and a key path reads an own key', why: 'items refuses every element carrying a KEY — its elements are strings' },
      { key: 'closed[1].slug', kind: 'no', at: '$.closed[1]', says: 'additionalProperties: false', why: 'items is CLOSED over id' },
      { key: 'grid[0][1].x', kind: 'no', at: '$.grid[0][1]', says: 'calls it string', why: 'the walk through two indexes, stopped at the innermost element' },
      { key: 'files.0', kind: 'no', at: '$.files', says: 'calls it array, and a key path reads an own key', why: 'the CONTROL: a plain numeric segment over an array is a key, and forbidden' },
    ];
    for (const row of rows) {
      const got = await onFirst(row.key);
      equal([row.key, got.kind], [row.key, row.kind], `${row.key}: ${row.why} — got ${got.kind}: ${got.why}`);
      if (row.kind !== 'no') continue;
      ok(got.why.includes(`gate "gate" is keyed on "${row.key}"`) && got.why.includes(`FORBIDS at ${row.at}:`) && got.why.includes(row.says!) && got.why.includes('route "first"'),
        `${row.key}: the reason names the gate, the key, the STEP ${row.at}, the schema's word (${row.says}) and the route: ${got.why}`);
    }
    equal(rows.map((r) => r.kind).join(''), 'fits'.repeat(6) + 'no'.repeat(6), 'six silences or fits and six refusals, in that order');
  });

  test('the wiring guarantee: minItems raised to n + 1 and never lowered, and nothing promised past the index', async () => {
    const wants = (field: string, extra: Record<string, unknown>): JsonSchema =>
      ({ type: 'object', required: [field], properties: { [field]: { type: 'array', ...extra } } }) as unknown as JsonSchema;
    // **A guarantee READ from the index**: `files[1]` resolved means at least two elements.
    equal((await onFirst('files[1].series', wants('files', { minItems: 2 }))).kind, 'fits', 'files[1] guarantees minItems 2, which the consumer asks');
    const short = await onFirst('files[0].series', wants('files', { minItems: 2 }));
    equal(short.kind, 'no', 'files[0] guarantees only 1 — the consumer`s 2 is not met');
    ok(short.why.includes('producer minItems 1 is looser than consumer minItems 2'), `and the reason is the floor the index set: ${short.why}`);
    const none = await onFirst('name', wants('files', { minItems: 1 }));
    ok(none.kind === 'no' && none.why.includes('producer declares no minItems'), `a key without an index guarantees no length (the control): ${none.why}`);
    // **Never LOWERED**: `many` declares minItems 3; an index of 1 must leave it at 3, so a consumer asking 3 still fits.
    equal((await onFirst('many[1].series', wants('many', { minItems: 3 }))).kind, 'fits', 'many[1] leaves the producer`s minItems 3 standing');
    equal((await onFirst('many[4].series', wants('many', { minItems: 5 }))).kind, 'fits', 'and many[4] raises it to 5');
    // **Nothing past the index**: the route learned that files[1].extra exists, not that every element carries it — so a
    // consumer requiring `extra` of EVERY element is not met (`required` pushed into `items` would say fits).
    const items = wants('files', { items: { type: 'object', required: ['extra'] } });
    const past = await onFirst('files[1].extra', items);
    equal(past.kind, 'no', 'files[1].extra promises nothing about files[0].extra — no `required` in items');
    ok(past.why.includes('$.files[]') && past.why.includes('extra'), `and the reason is the consumer's per-element requirement: ${past.why}`);
    // …while the KEY before the index is still required, as W99's refinement always did.
    const before = { type: 'object', required: ['files'] } as unknown as JsonSchema;
    equal((await onFirst('files[0].series', before)).kind, 'fits', 'files itself is required along the path (it was already required by the producer)');
    equal((await onFirst('tags', { type: 'object', required: ['tags'] } as unknown as JsonSchema)).kind, 'fits', 'and a key the producer does not require becomes required (W99, the neighbour)');
    equal((await onFirst('tags[0]', { type: 'object', required: ['tags'] } as unknown as JsonSchema)).kind, 'fits', 'tags[0] requires tags too — the key step before an index is refined');
    equal((await onFirst('name', { type: 'object', required: ['tags'] } as unknown as JsonSchema)).kind, 'no', 'the control: a path not through tags leaves it unrequired');
  });

  test('definitionSchema(): the gate key pattern IS KEY_PATH_RE, and a comparison path takes an index past the root only', () => {
    const s = definitionSchema() as unknown as { $defs: Record<string, { properties?: Record<string, { properties?: Record<string, { pattern?: string }>; pattern?: string }> }> };
    const keyPattern = s.$defs.gateNode!.properties!.settings!.properties!.key!.pattern!;
    equal(keyPattern, KEY_PATH_RE.source, 'the gate`s key pattern is KEY_PATH_RE`s own source');
    const key = new RegExp(keyPattern);
    for (const p of WELL_FORMED) ok(key.test(p), `the schema accepts the key ${p}`);
    for (const p of MALFORMED) ok(!key.test(p), `the schema refuses the key ${p}`);
    const path = new RegExp(s.$defs.comparison!.properties!.path!.pattern!);
    for (const p of WELL_FORMED) {
      ok(path.test(`outcome.result.${p}`) && path.test(`needs.n.${p}`), `the schema accepts a comparison path ending ${p}`);
      ok(!path.test(`input.${p}`), `and still not one rooted at input (${p}) — an edge's roots are outcome and needs`);
    }
    for (const p of MALFORMED) ok(!path.test(`outcome.result.${p}`), `the schema refuses a comparison path ending ${p}`);
    for (const p of ['outcome[0].x', 'needs[0]', 'outcome[0]', 'outcome']) ok(!path.test(p), `the schema refuses ${p} — an index on the root, or a root alone`);
    ok(path.test('outcome.xs[0]'), 'and accepts an index on the first key past the root');
    // The two DESCRIPTIONS say the index too (the adequacy reader's D3, D3b): an agent reads them, not the pattern.
    const keyDesc = (s.$defs.gateNode!.properties!.settings!.properties!.key as { description?: string }).description ?? '';
    const pathDesc = (s.$defs.comparison!.properties!.path as { description?: string }).description ?? '';
    ok(keyDesc.includes('[n]') && keyDesc.includes('files[0].series') && keyDesc.includes('never leading the path'), `the key's description names the index: ${keyDesc}`);
    ok(pathDesc.includes('[n]') && pathDesc.includes('the root never'), `the path's description names the index and the root rule: ${pathDesc}`);
  });

  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    const ran = collected().filter((x) => x.suite === SUITE).flatMap((x) => x.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
