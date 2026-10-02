/**
 * **What a PREDICATE is, at the definition — the three shapes, the CLOSED operator enumeration with a
 * refusal per non-member, the two roots, and the absent rule that makes the comparisons closed under
 * negation** — `spec/flow-definition.md` v0.27 (section 3's `when` subsection, `FD-C7`, section 5's
 * `FD-V42`-`FD-V45`),
 * [ADR 0074](../../doc/decisions/0074-a-predicate-is-a-registered-name-or-a-declared-comparison-over-the-context.md),
 * [W108](../../doc/work-items/w108-a-predicate-is-data.md).
 *
 * **Every expected value is a rule id or a verdict read from the spec's own rule text**, derived before
 * the validator was run, never from its output (`doc/workflow.md` section 5 rule 1).
 *
 * **The ENUMERATION clause, and it is why this file is shaped as it is** (obligation (a), v0.17): the
 * subset's membership is a CLOSED enumeration, so the set is THAT enumeration — **a fixture per member
 * AND a refusal per non-member, each under the SAME claim** (v0.18). `OPS` below is read from
 * `PREDICATE_OPS` and every one of the seven is both accepted by `FD-V44` and exercised by `evaluateWhen`;
 * `NOT_OPS` is a list of plausible neighbours and every one is refused, naming the enumeration.
 *
 * **The SELECTION clause** (obligation (a), v0.23). A predicate SELECTS three things, and each fixture
 * puts the right selection where every well-formed wrong one differs:
 *
 * | selection | right | the wrong ones it is built against, and WHERE |
 * |---|---|---|
 * | which SEGMENT of a path is the root | the FIRST | the LAST, and any. `ROOT_CASES` below is the fixture: `needs.outcome` and `outcome.needs.deep` both END on the other root, so a check reading the last segment ACCEPTS them, and `result.confidence` and `outcom.result.x` both end on an ordinary key, so it REFUSES them — the two readings disagree on all four |
 * | which OPERATOR an `op` names | the one it spells | the first in the list, and index 0. `PREDICATE_OPS[0]` is `eq`, so rule 8 probe `s4` forces the switch to `eq` and the `ne` row of the operator table below is what fails — the table gives every operator at least one row whose answer differs from `eq`'s |
 * | which MEMBER of a group decides | every one (`all`) or some one (`any`) | the first alone, and the last alone — so every group fixture has its deciding member in the MIDDLE and a group whose first and last members agree with each other and not with the verdict |
 *
 * *(Three of these four rows described fixtures that are not in this file — a two-segment path that
 * is three segments, an `ORDER_SENSITIVE` identifier that does not exist, and "no fixture uses `eq`
 * as its only operator" when the `leaf` helper below DEFAULTS to `eq`. W108's conformity reader,
 * 10. The selection was bound; the table said it was bound by something else, which is a claim
 * about evidence and is exactly what `doc/workflow.md` section 1 rule 5 is about.)*
 *
 * **The CONTROLS are named beside the claims** (obligation (d), v0.18/v0.21), and each is an expression
 * over the OBSERVED side or over the RELATION, never over the declared one — and for each, the tree on
 * which it fails while its claim passes is named in its own message.
 */
import { equal, ok, readText, ROOT, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import {
  predicateProblem,
  PREDICATE_GROUP_KEYS, PREDICATE_LEAF_KEYS, PREDICATE_LEAF_REQUIRED, PREDICATE_NAME_KEYS,
  validateDefinition, violatedRules,
} from '../../src/definition/validate.ts';
import { PREDICATE_OPS, PREDICATE_ROOTS } from '../../src/definition/types.ts';
import { evaluateWhen } from '../../src/driver/routing.ts';
import type { DecisionContext } from '../../src/driver/routing.ts';
import type { FlowDefinition, PredicateLeaf, Registry, When } from '../../src/definition/types.ts';

const SUITE = 'W108 — a predicate is DATA: FD-V42 to FD-V45, the subset, and the absent rule';

const REGISTRY: Registry = {
  predicates: ['isLowConfidence'],
  ...typesFor(['ScoreWorker', 'ReviewWorker']),
};

/** A one-decision flow carrying `when` on its first edge — the smallest document each refusal needs. */
const flowWith = (when: unknown): FlowDefinition => ({
  flowId: 'p', version: 1, entry: 'score',
  nodes: [
    { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [
      { when, to: 'review' } as unknown as { to: string },
      { to: 'done' },
    ] },
    { id: 'review', kind: 'task', type: 'ReviewWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition);

const rulesFor = (when: unknown): string[] => violatedRules(validateDefinition(flowWith(when), REGISTRY));

/** A `DecisionContext` with the two roots, built here so no expected value comes from the driver. */
const ctxOf = (result: unknown, needs: Record<string, unknown> = {}, taskId = 'r1:score:-:0'): DecisionContext => ({
  outcome: {
    kind: 'outcome', taskId, terminalState: 'done', result, error: null, attempts: 0,
    observedAt: 1, startTime: 1, endTime: 1, executionTime: 0, schedulerTimestamp: 1,
  } as unknown as DecisionContext['outcome'],
  needs,
});

const leaf = (p: Partial<PredicateLeaf>): PredicateLeaf =>
  ({ path: 'outcome.result.n', op: 'eq', value: 1, ...p }) as PredicateLeaf;

suite(SUITE, (test) => {
  // ---- FD-V42: the three SHAPES, and a key a shape does not declare --------------------------

  test('FD-V42 — a `when` is an object, and a BARE STRING is refused with the object form in the message', () => {
    equal(rulesFor('isLowConfidence'), ['FD-V42'],
      'the form that was valid until v0.27 is refused, and by the FORM rule rather than by FD-V4');
    const p = predicateProblem('isLowConfidence');
    ok(p !== null && p.rule === 'FD-V42', 'FD-V42');
    ok(p!.message.includes('{ "predicate": "isLowConfidence" }'),
      'the message names the migration, because this is the one refusal every pre-v0.27 document hits');
    // The CONTROL for the clause above, and it is over the OBSERVED side: a string that is NOT a
    // registered name is refused the same way, so the message is not the registry's answer in disguise.
    ok(predicateProblem('noSuchPredicate')?.rule === 'FD-V42',
      'an UNREGISTERED name as a bare string is FD-V42 too — the shape is asked before the registry, ' +
      'and a tree where this read FD-V4 is one where the lookup runs on a value that is not a predicate');
  });

  test('FD-V42 — every non-object, and an object marking none of the three shapes', () => {
    for (const v of [42, true, null, ['outcome.result.n'], 'x']) {
      equal(rulesFor(v), ['FD-V42'], `when ${JSON.stringify(v)} is not an object of one of the three shapes`);
    }
    equal(rulesFor({}), ['FD-V42'], 'an object with no keys marks nothing');
    equal(rulesFor({ when: 'x' }), ['FD-V42'], 'an object whose key is none of the three markers');
    ok(predicateProblem({ nope: 1 })!.message.includes('matches none of the three shapes'), 'and it says so');
  });

  test('FD-V42 — an object marking MORE than one shape, in all three pairs', () => {
    const pairs: [string, unknown][] = [
      ['name + comparison', { predicate: 'isLowConfidence', path: 'outcome.result.n', op: 'eq', value: 1 }],
      ['name + group', { predicate: 'isLowConfidence', all: [leaf({})] }],
      ['comparison + group', { path: 'outcome.result.n', op: 'eq', value: 1, all: [leaf({})] }],
    ];
    for (const [label, v] of pairs) {
      equal(rulesFor(v), ['FD-V42'], `${label} marks two shapes and is refused`);
      ok(predicateProblem(v)!.message.includes('more than one shape'), `${label}: and it says which problem it is`);
    }
  });

  test('FD-V42 — each shape refuses a key it does not declare, and the three key lists are what it refuses against', () => {
    // **A key name per shape, and the TYPO of a declared key is the case that matters** — rule 8
    // probes `a10`/`a11`/`a12`: narrowing each clause to the one key name a fixture used (`nope`,
    // and `value` for the name form) survived every rung, and `{ path, op, value, defualt: 0 }` —
    // a typo of the key this item's own design argument turns on — was accepted.
    for (const k of ['value', 'path', 'predicat', 'Predicate', 'nope']) {
      equal(rulesFor({ predicate: 'isLowConfidence', [k]: 1 }), ['FD-V42'], `the name form refuses "${k}" beside its one key`);
    }
    for (const k of ['defualt', 'lenght', 'Op', 'PATH', 'predicate_', 'nope', 'all_']) {
      equal(rulesFor({ ...leaf({}), [k]: 1 }), ['FD-V42'], `a comparison refuses "${k}" beside its five`);
    }
    for (const k of ['Any', 'alll', 'path_', 'nope']) {
      equal(rulesFor({ all: [leaf({})], [k]: 1 }), ['FD-V42'], `a group refuses "${k}" beside its one`);
    }
    equal(rulesFor({ predicate: 7 }), ['FD-V42'], 'a `predicate` that is not a string');
    for (const k of PREDICATE_LEAF_REQUIRED) {
      const o = { ...leaf({}) } as Record<string, unknown>;
      delete o[k];
      equal(rulesFor(o), ['FD-V42'], `a comparison missing "${k}"`);
    }
    // Obligation (e)'s third shape — a LIST is a claim about another list. These three lists are the
    // document's own key tables, and `spec/flow-definition.md`'s `when` subsection is the other half.
    equal([...PREDICATE_NAME_KEYS], ['predicate'], 'the name form`s keys');
    equal([...PREDICATE_LEAF_KEYS], ['path', 'op', 'value', 'default', 'length'], 'a comparison`s keys');
    equal([...PREDICATE_GROUP_KEYS], ['all', 'any'], 'a group`s keys');
    equal([...PREDICATE_LEAF_REQUIRED], ['path', 'op', 'value'], 'and which of a comparison`s are required');
  });

  // ---- FD-V43: the key path, and its two ROOTS -----------------------------------------------

  test('FD-V43 — a path that is not a key path, and one whose FIRST segment is not a root', () => {
    for (const bad of ['', 'outcome.', '.result', 'outcome result', 'outcome.result[0]', 'outcome.*.x']) {
      equal(rulesFor(leaf({ path: bad })), ['FD-V43'], `path ${JSON.stringify(bad)} is outside the key-path grammar`);
    }
    equal(rulesFor(leaf({ path: 7 as unknown as string })), ['FD-V43'], 'a path that is not a string');
    // **The SELECTION fixture, and it is a LIST so a check narrowed to two string literals fails.**
    // Rule 8 probe `a5b`: `if (root === 'result' || root === 'ctx')` passed every rung until these
    // existed. `needs.outcome` and `outcome.needs.deep` END on the other root, so a check reading
    // the LAST segment accepts them; the rest end on an ordinary key, so it refuses them. Both
    // readings therefore disagree with the right answer somewhere in this list.
    const ROOT_CASES: [string, string][] = [
      ['result.confidence', 'the spec`s own first example of a wrong root'],
      ['outcom.result.x', '`spec/flow-definition.md``s NAMED typo, which was in no fixture'],
      ['ctx.outcome.result', '`ctx` is not a root either — the path is rooted AT the context'],
      ['OUTCOME.x', 'the charset is case-SENSITIVE and a root is spelled one way'],
      ['needsx.y', 'a root is a whole segment, never a prefix of one'],
      ['Outcome.result.x', 'and not capitalised'],
      ['needs.outcome', 'ends ON the other root — a last-segment reader ACCEPTS this one'],
      ['outcome.needs.deep', 'and so does this; both are refused because the FIRST segment is what is read'],
    ];
    for (const [path, why] of ROOT_CASES) {
      const want = path.split('.')[0] === 'outcome' || path.split('.')[0] === 'needs' ? [] : ['FD-V43'];
      equal(rulesFor(leaf({ path })), want, `${path}: ${why}`);
    }
    // The CONTROL over the RELATION: the list reaches BOTH readings. A fixture list where every
    // entry is refused under either reading binds neither, so this says so rather than assuming it.
    ok(ROOT_CASES.some(([p]) => (p.split('.').pop() === 'outcome' || p.split('.').pop() === 'needs')),
      'and at least one case ENDS on a root, which is what a last-segment reader would accept');
    ok(predicateProblem(leaf({ path: 'result.confidence' }))!.message.includes('resolve to nothing in silence'),
      'the message says WHY, because a wrong root is a wrong key rather than a question');
  });

  test('FD-V43 — a ROOT ALONE names a container and is refused; both roots with a leaf are accepted', () => {
    for (const r of PREDICATE_ROOTS) {
      equal(rulesFor(leaf({ path: r })), ['FD-V43'], `"${r}" alone is a container, and no comparison against it can be true`);
      equal(rulesFor(leaf({ path: `${r}.x` })), [], `"${r}.x" is a path a decision can see`);
    }
    // The CONTROL, over the RELATION rather than over either side: the two roots are DIFFERENT
    // values, so a tree where `PREDICATE_ROOTS` was one name repeated passes every clause above
    // and fails this one.
    equal(new Set(PREDICATE_ROOTS).size, PREDICATE_ROOTS.length, 'the roots are distinct');
    equal([...PREDICATE_ROOTS], ['outcome', 'needs'], 'and they are the two members of a DecisionContext');
  });

  // ---- FD-V44: the CLOSED enumeration, a member at a time and a non-member at a time ----------

  test('FD-V44 — every one of the seven operators is ACCEPTED, under one claim', () => {
    const valueFor = (op: string) => (op === 'startsWith' ? 'r1:' : op === 'eq' || op === 'ne' ? true : 1);
    const visited: string[] = [];
    for (const op of PREDICATE_OPS) {
      visited.push(op);
      equal(rulesFor(leaf({ op, value: valueFor(op) as never })), [], `op "${op}" is in the subset`);
    }
    equal(PREDICATE_OPS.length, 7, 'and there are seven of them');
    // **The loop BOUND beside the list's length** — obligation (d), and probe `d3` is why: narrowing
    // this loop to `PREDICATE_OPS.slice(0, 1)` cost ZERO, because a count of the LIST says nothing
    // about how much of it was visited. A membership, both ways, and the count beside it.
    equal(visited, [...PREDICATE_OPS], 'and every one of them was actually PUT THROUGH the validator, in order');
    equal(visited.length, PREDICATE_OPS.length, 'with the count beside the membership, which catches a duplicated member');
  });

  test('FD-V44 — every plausible NON-member is refused BY NAME, under the same claim', () => {
    const NOT_OPS = ['matches', 'in', 'contains', 'endsWith', 'includes', 'exists', 'not', 'and', 'or',
      'equals', 'EQ', 'lt ', '==', '<', 'regex', 'between'];
    for (const op of NOT_OPS) {
      equal(rulesFor(leaf({ op: op as never })), ['FD-V44'], `op ${JSON.stringify(op)} is outside the subset`);
      const m = predicateProblem(leaf({ op: op as never }))!.message;
      ok(m.includes(op), `${op}: the refusal names the operator it refused`);
      for (const legal of PREDICATE_OPS) ok(m.includes(legal), `${op}: and it names "${legal}" as one of the legal set`);
    }
    equal(rulesFor(leaf({ op: 7 as never })), ['FD-V44'], 'an op that is not a string');
    // The CONTROL for the enumeration, over the OBSERVED side: `NOT_OPS` and `PREDICATE_OPS` are
    // DISJOINT, so a tree where a member had been copied into the refused list fails here while
    // every clause above still passes.
    for (const op of NOT_OPS) ok(!(PREDICATE_OPS as readonly string[]).includes(op), `${op} is not also a member`);
    ok(NOT_OPS.length > PREDICATE_OPS.length, 'and the refused list is not a token gesture');
  });

  test('FD-V44 — the VALUE an operator can compare, and the two modifiers', () => {
    equal(rulesFor(leaf({ op: 'lt', value: 'nine' as never })), ['FD-V44'], 'an ordering operator against a string');
    equal(rulesFor(leaf({ op: 'gte', value: null as never })), ['FD-V44'], 'and against null');
    equal(rulesFor(leaf({ op: 'startsWith', value: 1 as never })), ['FD-V44'], 'startsWith against a number');
    // Rule 8 probe `c4`: `isScalar` widened to admit any object not carrying key `'a'` survived,
    // because every non-scalar fixture was `{a: 1}`, `[1]` or `NaN`.
    for (const v of [{ a: 1 }, { b: 2 }, {}, [1], [], [[1]], Number.NaN, Infinity, -Infinity, new Date(0)]) {
      equal(rulesFor(leaf({ value: v as never })), ['FD-V44'], `value ${JSON.stringify(v) ?? String(v)} is not a scalar`);
    }
    ok(predicateProblem(leaf({ value: Number.NaN }))!.message.includes('NaN'),
      'and a non-finite NUMBER prints its VALUE — `typeof NaN` is "number" and the message says ' +
      '"a FINITE number", so printing the typeof read as if it had been accepted (the conformity reader, 19)');
    for (const v of [null, true, false, 0, -1.5, '', 'x']) {
      equal(rulesFor(leaf({ op: 'eq', value: v as never })), [], `eq against ${JSON.stringify(v)} is a scalar comparison`);
    }
    equal(rulesFor(leaf({ length: 1 as never })), ['FD-V44'], 'length is exactly true or absent');
    equal(rulesFor(leaf({ length: false as never })), ['FD-V44'], 'and `false` is not "compare the value" — there is no such thing to ask for');
    equal(rulesFor(leaf({ op: 'gt', value: 0, length: true })), [], 'a length against a number');
    equal(rulesFor(leaf({ op: 'eq', value: 'x', length: true })), ['FD-V44'], 'a length against a string');
    equal(rulesFor(leaf({ op: 'startsWith', value: 'x', length: true })), ['FD-V44'], 'a length has no prefix');
    equal(rulesFor(leaf({ default: { a: 1 } as never })), ['FD-V44'], 'a default that is not a scalar or an array of them');
    equal(rulesFor(leaf({ default: [{ a: 1 }] as never })), ['FD-V44'], 'nor an array of objects');
    equal(rulesFor(leaf({ op: 'gt', value: 0, length: true, default: 3 as never })), ['FD-V44'],
      'a default that has no length, where `length` measures it');
    equal(rulesFor(leaf({ op: 'gt', value: 0, length: true, default: [] })), [], 'and `[]` is the default the tree writes');
    // **An ARRAY default with NO `length` is refused** — W108's conformity reader (17) found the
    // message claiming this restriction while neither the code nor `FD-V44`'s row had it, and the
    // restriction is the right one: an array compared against a scalar can never match, so the
    // comparison is permanently false wherever the path is absent. A silent no-match, `FD-R2`'s class.
    equal(rulesFor(leaf({ default: [] })), ['FD-V44'], 'an array default with no `length` could never match');
    equal(rulesFor(leaf({ default: ['a'] })), ['FD-V44'], 'and a non-empty one is no better');
    ok(predicateProblem(leaf({ default: [] }))!.message.includes('could never match'),
      'and the refusal says WHY, because an author who wrote it meant `length: true`');
    equal(rulesFor(leaf({ op: 'gt', value: 0, length: true, default: 'ab' })), [], 'a string has a length too');
  });

  // ---- FD-V45: a FLAT group whose members are COMPARISONS -------------------------------------

  test('FD-V45 — a group is a non-empty array of comparisons, and NESTING is refused by name', () => {
    equal(rulesFor({ all: [leaf({}), leaf({ op: 'gt', value: 1 })] }), [], 'an `all` of two comparisons');
    equal(rulesFor({ any: [leaf({})] }), [], 'an `any` of one');
    equal(rulesFor({ all: [], }), ['FD-V45'], 'an empty group is "always true" written as a question');
    equal(rulesFor({ any: [] }), ['FD-V45'], 'and so is an empty `any`');
    equal(rulesFor({ all: leaf({}) as never }), ['FD-V45'], 'a group whose members are not an array');
    equal(rulesFor({ all: [leaf({})], any: [leaf({})] }), ['FD-V45'], 'both `all` and `any` says neither');
    // **On BOTH group kinds** — rule 8 probes `h2`/`h3`: narrowing either clause to `which === 'all'`
    // survived every rung, because every nesting fixture and every name-member fixture used `all`.
    // And the consequence of the narrowed form is worse than a missing refusal: `evalLeaf` is then
    // handed a member with no `path` and `readKeyPath` throws a bare `TypeError` AT ROUTING TIME,
    // which is Output (3)'s own claim failing.
    equal(rulesFor({ all: [leaf({}), { any: [leaf({})] }] }), ['FD-V45'], 'a group INSIDE an `all`');
    equal(rulesFor({ any: [leaf({}), { all: [leaf({})] }] }), ['FD-V45'], 'and a group inside an `any`');
    equal(rulesFor({ any: [leaf({}), { predicate: 'isLowConfidence' }] }), ['FD-V45'], 'and a NAME inside an `any`');
    ok(predicateProblem({ all: [leaf({}), { any: [leaf({})] }] })!.message.includes('nesting is refused rather than evaluated'),
      'and it says so, because a flat group is a decision rather than an omission');
    equal(rulesFor({ all: [leaf({}), { predicate: 'isLowConfidence' }] }), ['FD-V45'], 'a member naming a registered predicate');
    ok(predicateProblem({ all: [{ predicate: 'isLowConfidence' }] })!.message.includes('impure'),
      'and the message carries the ARGUMENT, because this is the restriction that needs one');
    for (const bad of [1, 'x', null, [leaf({})]]) {
      equal(rulesFor({ any: [leaf({}), bad] }), ['FD-V45'], `a member that is ${JSON.stringify(bad)}`);
    }
  });

  test('FD-V45 — a MEMBER`s own path and operator are FD-V43`s and FD-V44`s, wherever the comparison sits', () => {
    // The deciding member is in the MIDDLE in each, so a check reading the first or the last member
    // alone passes — which is the selection clause applied to a group's own loop bound.
    equal(rulesFor({ all: [leaf({}), leaf({ path: 'result.x' }), leaf({})] }), ['FD-V43'],
      'a bad path in the middle of an `all` is reported under FD-V43, not FD-V45');
    equal(rulesFor({ any: [leaf({}), leaf({ op: 'matches' as never }), leaf({})] }), ['FD-V44'],
      'and a bad operator under FD-V44');
    equal(rulesFor({ all: [leaf({}), leaf({ nope: 1 } as never), leaf({})] }), ['FD-V42'],
      'and an undeclared key under FD-V42 — one rule owns each question wherever it is asked');
  });

  // ---- FD-V4: the NAME road, and the one thing that moved about it ----------------------------

  test('FD-V42-45 — a refusal names the EDGE it is on and carries its own message, through validateDefinition', () => {
    // **Output (3) is *every refusal is at CONSTRUCTION with its POSITION*, and neither half had an
    // observer** — every clause above projects through `violatedRules` to rule ids, and every
    // message clause calls `predicateProblem` DIRECTLY, bypassing `add()`. Rule 8 probes `c3`/`h4`:
    // re-pointing the finding's `at` to a constant, and its detail to `'refused'`, each survived.
    for (const [when, rule, says] of [
      ['isLowConfidence', 'FD-V42', 'it is an object'],
      [leaf({ path: 'result.x' }), 'FD-V43', 'roots are'],
      [leaf({ op: 'matches' as never }), 'FD-V44', 'the enumeration is closed'],
      [{ all: [leaf({}), { any: [leaf({})] }] }, 'FD-V45', 'nesting is refused'],
    ] as [unknown, string, string][]) {
      const fs = validateDefinition(flowWith(when), REGISTRY);
      equal(fs.map((f) => f.rule), [rule], `${rule} is reported, alone`);
      equal(fs[0]!.at, 'score#edge0',
        `${rule} names the EDGE it is on, not the flow — an author fixing a document needs the ` +
        'position, and `validate.ts` builds it as `${where}#edge${i}`');
      ok(fs[0]!.detail.includes(says),
        `${rule} carries its own message through add(), not a bare id: it must say ${JSON.stringify(says)}`);
    }
    // The CONTROL over the OBSERVED side: a SECOND edge's refusal names a DIFFERENT position, so
    // the `at` above is a function of where the `when` is rather than a constant that happens to fit.
    const twoEdges = {
      flowId: 'p', version: 1, entry: 'score',
      nodes: [
        { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [
          { when: { predicate: 'isLowConfidence' }, to: 'review' },
          { when: 'isLowConfidence', to: 'review' },
          { to: 'done' },
        ] },
        { id: 'review', kind: 'task', type: 'ReviewWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const f2 = validateDefinition(twoEdges, REGISTRY);
    equal(f2.map((x) => [x.rule, x.at]), [['FD-V42', 'score#edge1']],
      'the SECOND edge`s refusal names the second edge — a constant `at` cannot do that');
  });

  test('FD-V4 — the name road keeps its rule, and a declared predicate names NOTHING for it to ask about', () => {
    equal(rulesFor({ predicate: 'isLowConfidence' }), [], 'a registered name');
    equal(rulesFor({ predicate: 'isLowConfidenc' }), ['FD-V4'], 'and an unregistered one is FD-V4, as it has been since P1');
    // The claim that makes FD-V4 narrow rather than broken: a COMPARISON and a GROUP name no
    // predicate, so a registry with NO predicates at all accepts both. A tree where FD-V4 asked the
    // registry about every `when` fails this and passes everything above it.
    const noPreds: Registry = { predicates: [], ...typesFor(['ScoreWorker', 'ReviewWorker']) };
    for (const w of [leaf({}), { all: [leaf({})] }, { any: [leaf({})] }]) {
      equal(violatedRules(validateDefinition(flowWith(w), noPreds)), [],
        'a declared predicate is accepted against an EMPTY predicate registry');
    }
    equal(violatedRules(validateDefinition(flowWith({ predicate: 'isLowConfidence' }), noPreds)), ['FD-V4'],
      'while a NAME against the same registry is refused — the pair is what makes the clause above non-vacuous');
  });

  // ---- FD-C7: what the EVALUATOR answers, over the table the spec states ----------------------

  test('FD-C7 — every operator answers what section 3 says, over absent, null, wrong-type and boundary', () => {
    const preds = new Map();
    const t = (when: When, ctx: DecisionContext) => evaluateWhen(when, ctx, preds);
    // Each row is (op, value, the result, the expected answer) derived from the spec's own sentences.
    const rows: [string, unknown, unknown, boolean, string][] = [
      ['eq', 1, { n: 1 }, true, 'eq on an equal number'],
      ['eq', 1, { n: '1' }, false, 'eq is ===, so a string is not the number'],
      ['ne', 1, { n: 2 }, true, 'ne on a different number'],
      ['ne', 1, { n: 1 }, false, 'ne on an equal one'],
      ['lt', 50, { n: 49 }, true, 'lt below'],
      ['lt', 50, { n: 50 }, false, 'lt at the boundary'],
      ['lte', 50, { n: 50 }, true, 'lte at the boundary'],
      ['gt', 50, { n: 51 }, true, 'gt above'],
      ['gt', 50, { n: 50 }, false, 'gt at the boundary'],
      ['gte', 50, { n: 50 }, true, 'gte at the boundary'],
      ['lt', 50, { n: '9' }, false, 'TYPE-STRICT: a string is no match where JS `<` would coerce and say true'],
      ['gt', 0.5, { n: '9' }, false, 'and in the other direction'],
      // **`startsWith` too** — rule 8 probe `b3`: `String(v).startsWith(String(w))` survived every
      // rung, because the three type-strict rows were all numeric. `FD-V44` pins the VALUE to a
      // string, so only the LEFT operand can be wrong-typed and only the evaluator can see it.
      ['startsWith', '12', { n: 12345 }, false, 'TYPE-STRICT on the left operand: a NUMBER has no prefix'],
      ['startsWith', 'tr', { n: true }, false, 'nor does a boolean'],
      ['startsWith', 'nu', { n: null }, false, 'nor a resolved null'],
      ['startsWith', '1,2', { n: [1, 2] }, false, 'nor an array, which `String()` would have joined'],
      ['startsWith', '12', { n: '12345' }, true, 'and the string does — the control, so the four above are not "no to everything"'],
      ['gte', 50, { n: null }, false, 'null is not a number'],
      ['eq', null, { n: null }, true, 'but eq against null is a scalar comparison and holds'],
    ];
    for (const [op, value, result, want, why] of rows) {
      equal(t(leaf({ path: 'outcome.result.n', op: op as never, value: value as never }), ctxOf(result)), want, why);
    }
    equal(t(leaf({ path: 'outcome.taskId', op: 'startsWith', value: 'r1:publish:' }), ctxOf(null, {}, 'r1:publish:0:0')),
      true, 'startsWith over the SECOND root, which no schema describes');
    equal(t(leaf({ path: 'outcome.taskId', op: 'startsWith', value: 'r1:publish:' }), ctxOf(null, {}, 'r1:score:-:0')),
      false, 'and false on another id');
  });

  test('FD-C7 — the path is `readKeyPath`s resolution, and a NAIVE property walk differs on five shapes', () => {
    const preds = new Map();
    const t = (when: When, ctx: DecisionContext) => evaluateWhen(when, ctx, preds);
    class Box { id = 'own'; }
    // Each row is a value a bare `obj?.[seg]` walk resolves and `readKeyPath` does NOT, so each is
    // a tree on which the two disagree. Without them the evaluator's resolution is bound by nothing
    // (rule 8 probe `e7` survived at ZERO until this case existed).
    const rows: [string, unknown, string, string][] = [
      ['a PROTOTYPE key is not an own key', { }, 'outcome.result.toString',
        'a bare walk reads Object.prototype.toString and answers about a FUNCTION'],
      ['a class instance is not a plain object', { box: new Box() }, 'outcome.result.box.id',
        'a bare walk reads its own field; `readKeyPath` does not'],
      ['an ARRAY mid-path has no index', { list: [{ id: 'x' }] }, 'outcome.result.list.0.id',
        'a bare walk indexes; the grammar has no index (P24 stop-and-ask (d))'],
      ['a Map is not a plain object', { m: new Map([['id', 'x']]) }, 'outcome.result.m.id',
        'a bare walk reads nothing here either, but `.size` would differ'],
      ['null mid-path is nothing', { nul: null }, 'outcome.result.nul.id', 'both give nothing, and neither throws'],
    ];
    for (const [why, result, path, note] of rows) {
      equal(t(leaf({ path, op: 'ne', value: null }), ctxOf(result)), false,
        `${why} — so the path resolves to nothing and even \`ne null\` is NO MATCH (${note})`);
    }
    // The CONTROL, over the OBSERVED side: the same operator on a path that DOES resolve answers
    // true, so the rows above are not satisfied by an evaluator that says no to everything.
    equal(t(leaf({ path: 'outcome.result.ok', op: 'ne', value: null }), ctxOf({ ok: 1 })), true,
      'and a path that resolves answers — a tree where every row above passed because nothing resolves fails here');
    equal(t(leaf({ path: 'outcome.result.bare.id', op: 'eq', value: 'x' }),
      ctxOf({ bare: Object.assign(Object.create(null), { id: 'x' }) })), true,
      'an object with NO prototype IS plain, which is the half a `proto !== Object.prototype` test alone gets wrong');
  });

  test('FD-C7 — an absent path is NO MATCH for EVERY operator, and `default` is what changes that', () => {
    const preds = new Map();
    const t = (when: When, ctx: DecisionContext) => evaluateWhen(when, ctx, preds);
    const absent = [ctxOf({}), ctxOf(null), ctxOf({ n: undefined }), ctxOf('a primitive'), ctxOf({ n: { deep: 1 } }, {})];
    for (const op of PREDICATE_OPS) {
      const value = op === 'startsWith' ? 'x' : op === 'eq' || op === 'ne' ? 1 : 1;
      for (const ctx of absent.slice(0, 4)) {
        equal(t(leaf({ path: 'outcome.result.n', op: op as never, value: value as never }), ctx), false,
          `"${op}" against an absent path is NO MATCH — including "ne", which a naive !== would answer true`);
      }
    }
    // **This is the pair that makes the absent rule a DECISION rather than a default.** With no
    // `default` both an operator and its complement are false, so no pair complements; with one,
    // they partition. A tree where `default` were ignored passes every clause above and fails here.
    const gt = leaf({ path: 'outcome.result.score', op: 'gt', value: 0.5 });
    const lte = leaf({ path: 'outcome.result.score', op: 'lte', value: 0.5 });
    equal([t(gt, ctxOf({})), t(lte, ctxOf({}))], [false, false],
      'with no default, an operator and its complement are BOTH false for an absent path');
    const gtD = leaf({ path: 'outcome.result.score', op: 'gt', value: 0.5, default: 0 });
    const lteD = leaf({ path: 'outcome.result.score', op: 'lte', value: 0.5, default: 0 });
    equal([t(gtD, ctxOf({})), t(lteD, ctxOf({}))], [false, true],
      'and with one they PARTITION — which is what makes the six comparisons closed under negation');
    equal([t(gtD, ctxOf({ score: 0.9 })), t(lteD, ctxOf({ score: 0.9 }))], [true, false],
      'and they still partition where the path resolves, so the default is not standing in for the value');

    // **A path resolving to NULL takes the default too, and this is BOTH readers' shared finding.**
    // `readKeyPath` returns a terminal `null` as a RESOLVED value, so a `v === undefined` test left
    // `gt` and `lte` both false here — the pair not complementary, and the declared form not
    // reproducing `(r?.score ?? 0) > 0.5`, which five documents said it was. Measured against the
    // JS body itself rather than against an expectation, because the claim IS *it is `?? 0`*.
    const jsIsHigh = (r: { score?: number | null } | null) => ((r?.score ?? 0) > 0.5);
    for (const r of [{}, { score: null }, { score: 0 }, { score: 0.6 }, { score: 0.5 }] as ({ score?: number | null })[]) {
      equal([t(gtD, ctxOf(r)), t(lteD, ctxOf(r))], [jsIsHigh(r), !jsIsHigh(r)],
        `score=${JSON.stringify(r.score)}: the declared pair IS \`(score ?? 0) > 0.5\` and its negation — ` +
        'the nullish half included, which is what `??` does and what a `v === undefined` test does not');
    }
    // And the half a blanket "null is no match" would have broken: with NO default declared, a
    // resolved `null` is compared as the scalar it is.
    equal(t(leaf({ path: 'outcome.result.score', op: 'eq', value: null }), ctxOf({ score: null })), true,
      'with no default, a resolved null is still a VALUE and `eq null` holds');
    equal(t(leaf({ path: 'outcome.result.score', op: 'eq', value: null }), ctxOf({})), false,
      'while an ABSENT path is no match even for `eq null` — the two are told apart, which is the ' +
      'whole reason the default`s nullish half is conditional on a default being declared');
    equal(t(leaf({ path: 'needs.f', op: 'gt', value: 0, length: true, default: ['x'] }), ctxOf(null, { f: null })), true,
      'and `length` with a default over a null key is `?? []` on its own terms');
  });

  test('FD-C7 — `length` measures an array or a string, after the default and before the comparison', () => {
    const preds = new Map();
    const t = (when: When, ctx: DecisionContext) => evaluateWhen(when, ctx, preds);
    const l = leaf({ path: 'needs.f', op: 'gt', value: 0, length: true, default: [] });
    equal(t(l, ctxOf(null, { f: ['a'] })), true, 'a non-empty array');
    equal(t(l, ctxOf(null, { f: [] })), false, 'an empty one');
    equal(t(l, ctxOf(null, {})), false, 'and an ABSENT key, through the default `[]` — which is `?? []` exactly');
    equal(t(leaf({ path: 'outcome.result.s', op: 'gte', value: 3, length: true }), ctxOf({ s: 'abc' })), true, 'a string has a length');
    equal(t(leaf({ path: 'outcome.result.s', op: 'gt', value: 0, length: true }), ctxOf({ s: 7 })), false,
      'a number has none, and a value with no length is NO MATCH rather than a throw');
    equal(t(leaf({ path: 'outcome.result.s', op: 'gt', value: 0, length: true }), ctxOf({ s: { length: 9 } })), false,
      'and an object with a `length` FIELD is not a thing with a length — the rule names arrays and strings');
    // **The ORDER, at a value where the two orders DISAGREE** — rule 8 probe `a1`, and it is v0.23's
    // selection clause on the one modifier pair this item adds. The only place `default` and
    // `length` co-occur anywhere in the tree is `default: []` with `gt 0`, and THERE the two orders
    // coincide: right → `[]` → length 0 → `0 > 0` false; wrong → `undefined` has no length → false.
    // A non-empty default is what tells them apart.
    equal(t(leaf({ path: 'outcome.result.s', op: 'gte', value: 2, length: true, default: 'ab' }), ctxOf({})), true,
      'default BEFORE length: an absent path takes the default "ab", whose length 2 is >= 2. Taking ' +
      'the length FIRST gives `undefined`, which has none, and answers false');
    equal(t(leaf({ path: 'needs.f', op: 'gte', value: 3, length: true, default: ['a', 'b', 'c'] }), ctxOf(null, {})), true,
      'and the same on the other root, with an array default of three');
    equal(t(leaf({ path: 'needs.f', op: 'gte', value: 3, length: true, default: ['a', 'b', 'c'] }), ctxOf(null, { f: ['x'] })), false,
      'while a key that RESOLVES is measured and not defaulted — so the default is not standing in for the value');
  });

  test('FD-C7 — a group answers over its members, and the deciding member is never the first or the last', () => {
    const preds = new Map();
    const t = (when: When, ctx: DecisionContext) => evaluateWhen(when, ctx, preds);
    const yes = leaf({ path: 'outcome.result.a', op: 'eq', value: 1 });
    const no = leaf({ path: 'outcome.result.b', op: 'eq', value: 2 });
    const ctx = ctxOf({ a: 1, b: 99 });
    equal(t({ all: [yes, no, yes] }, ctx), false, 'an `all` is false when its MIDDLE member is');
    equal(t({ all: [yes, yes, yes] }, ctx), true, 'and true when every member is');
    equal(t({ any: [no, yes, no] }, ctx), true, 'an `any` is true when its MIDDLE member is');
    equal(t({ any: [no, no, no] }, ctx), false, 'and false when none is');
    // The control: a reading that returned the FIRST member's answer, or the LAST's, gives the
    // wrong verdict on exactly these four and the right one on a two-member group.
    equal([t({ all: [yes, no, yes] }, ctx), t({ any: [no, yes, no] }, ctx)], [false, true],
      'so first-member and last-member readings both disagree with the right answer here');
  });

  test('FD-C7 — the NAME road through the same evaluator, and a declared predicate reaching NO registry', () => {
    let calls = 0;
    const preds = new Map([['isLowConfidence', (c: DecisionContext) => { calls++; return (c.outcome.result as { c: number }).c < 0.5; }]]);
    equal(evaluateWhen({ predicate: 'isLowConfidence' }, ctxOf({ c: 0.4 }), preds), true, 'the name road answers');
    equal(calls, 1, 'by calling the registered function');
    equal(evaluateWhen(leaf({ path: 'outcome.result.c', op: 'lt', value: 0.5 }), ctxOf({ c: 0.4 }), preds), true,
      'and a declared comparison gives the same answer');
    equal(calls, 1, 'without calling it — a declared predicate reaches the registry not at all, which is ' +
      'what `CANNOT be impure` rests on: there is nothing registered for it to call');
  });

  // ---- the CORPUS document, and the enumeration over what it carries ---------------------------

  test('the corpus`s declared-predicate flow carries every SHAPE and six of the seven operators', async () => {
    const doc = JSON.parse(await readText(`${ROOT}spec/examples/valid/declared-predicate.flow.json`)) as FlowDefinition;
    const whens = doc.nodes.flatMap((n) => ((n as { edges?: { when?: When }[] }).edges ?? []).map((e) => e.when)).filter((w) => w !== undefined);
    const shapeOf = (w: unknown) => {
      const o = w as Record<string, unknown>;
      return 'predicate' in o ? 'name' : ('all' in o || 'any' in o) ? 'group' : 'comparison';
    };
    const found = [...new Set(whens.map(shapeOf))].sort();
    equal(found, ['comparison', 'group', 'name'],
      'all three shapes, in ONE document — obligation (a)`s enumeration under one claim');
    // **The CONTROL, over the OBSERVED side and over the RELATION** — probe `c3` re-sourced the
    // left-hand side to the literal and the clause above stayed green, which is v0.21's whole
    // class. These two read the document and nothing else, so the comparison cannot be a list
    // compared with itself: a tree where `whens` came from a literal fails them.
    ok(whens.length >= 6, `the document carries ${whens.length} \`when\`s, and the shapes above are drawn from them`);
    equal(found.length, new Set(whens.map(shapeOf)).size, 'and the set is the one the walk built');
    for (const shape of found) {
      ok(whens.some((w) => shapeOf(w) === shape), `${shape} is attested by an actual edge of the document`);
    }
    const opsIn = (w: unknown): string[] => {
      const o = w as Record<string, unknown>;
      if ('op' in o) return [o.op as string];
      const ms = (o.all ?? o.any ?? []) as { op: string }[];
      return ms.map((m) => m.op);
    };
    const used = new Set(whens.flatMap(opsIn));
    const missing = PREDICATE_OPS.filter((o) => !used.has(o));
    // **ALL SEVEN, and the escape clause is gone** — rule 8 probe `j1`: this read
    // `equal(missing, ['ne'].filter((o) => !used.has(o)))`, written for an operator the document
    // turned out to carry, so both sides were `[]` and dropping `ne` made both sides `['ne']` — a
    // tautology for exactly one operator and for no other.
    equal(missing, [], 'the document carries EVERY operator of the subset, so the enumeration is ' +
      'instantiated whole in ONE document and under ONE claim');
    equal(used.size, PREDICATE_OPS.length, 'and the count beside the membership');
    // The control, over the RELATION: every operator the document uses is a MEMBER of the
    // enumeration. A tree where the document carried an operator the subset does not have would
    // pass the shape clause above and fail here — and `C4`'s corpus is validated at L4 either way.
    for (const o of used) ok((PREDICATE_OPS as readonly string[]).includes(o), `"${o}" is in the subset`);
    equal(violatedRules(validateDefinition(doc, {
      predicates: ['isLowConfidence'],
      ...typesFor(['IngestWorker', 'ScoreWorker', 'ReviewWorker', 'PublishWorker']),
    })), [], 'and the whole document validates');
  });
});
