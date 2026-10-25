/**
 * Ladder L1 — **a comparison's `valueFrom`: another key path in place of the literal** — `spec/flow-definition.md` v0.55
 * (section 3's `when` subsection, `FD-C7`, `FD-C3`, section 5's `FD-V42` and `FD-V43`),
 * [ADR 0140](../../doc/decisions/0140-a-comparison-may-compare-against-another-key-path-and-an-absent-one-is-no-match.md),
 * [P45](../../doc/plans/p45-what-a-comparison-may-compare-against-and-who-may-read-a-key-path.md) (a1), (b1), (d1), (g1),
 * decisions 2-8, [W221](../../doc/work-items/w221-a-comparisons-value-from.md) — fyflow-app's pass 6 #1.
 *
 * **Every expected value is read from the spec's sentences and P45 decisions 3-4**, derived in the item file's tables
 * before the first run, never from the functions' output (`doc/workflow.md` section 5 rule 1):
 *
 * - **exactly one of `value` / `valueFrom`** (`FD-V42`) — both refused, neither refused, each alone ACCEPTED (the control);
 * - **`valueFrom` held to `FD-V43`'s every clause under the comparison's own scope** — on an edge (`outcome` / `needs`) and
 *   in an `if` (`input`), each refusal beside the same document with a right root, accepted;
 * - **(g1)** — a `needs` path or `valueFrom` whose first key the edge's `needs` does not declare is `FD-V43`, each beside the
 *   declared form accepted;
 * - **the evaluator** — the resolved value compared as a literal would be, each row beside the SAME comparison with the
 *   literal where a literal is legal; a resolved object or array NO MATCH for every operator, `ne` included; an ABSENT
 *   `valueFrom` NO MATCH for every operator, so `x gt y` and `x lte y` are both false, and the left's `default` does not
 *   stand in for it;
 * - **`definitionSchema()`** — accepting the form and refusing both-or-neither, with a real 2020-12 validator as the
 *   observer and `validateDefinition` as the second.
 */
import { Validator } from '@cfworker/json-schema';
import { collected, equal, ok, readText, ROOT, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { predicateProblem, validateDefinition, violatedRules } from '../../src/definition/validate.ts';
import { evaluateDeclared } from '../../src/definition/condition.ts';
import { definitionSchema } from '../../src/definition/definition-schema.ts';
import { PREDICATE_OPS } from '../../src/definition/types.ts';
import { evaluateWhen } from '../../src/driver/routing.ts';
import type { DecisionContext } from '../../src/driver/routing.ts';
import type { FlowDefinition, PredicateLeaf, When } from '../../src/definition/types.ts';

const SUITE = 'L1 — W221, P45 (a1) (b1) (g1): a comparison`s valueFrom — exactly one right side, FD-V43 on both keys, the needs a path names declared, compared as a literal, absent no match';

const DECLARED_CASES = [
  'FD-V42 — exactly one of value and valueFrom: both refused, neither refused, each alone accepted (the control), on an edge, in a group and in an if',
  'FD-V43 on valueFrom — every path clause under the comparison`s own scope, on an edge and in an if, each beside a right root accepted',
  'FD-V44`s literal clauses are value`s alone — an ordering operator or startsWith with valueFrom accepted; length with startsWith and the default clauses still asked',
  '(g1) — a needs path or valueFrom whose first key the edge does not declare is FD-V43, each beside the declared form accepted; not asked where FD-V26 owns the needs',
  'the evaluator — the resolved value compared as a literal would be, row by row beside the literal',
  'a resolved OBJECT or ARRAY is no match for every operator, ne included — and eq over one object named twice',
  'an ABSENT valueFrom is no match for every operator — x gt y and x lte y both false — and the left default does not stand in for it',
  'an if asks valueFrom over { input }, by the one evaluator',
  'definitionSchema() accepts valueFrom and refuses both-or-neither and a valueFrom outside the roots — validateDefinition the second observer',
  'the valid corpus file carries valueFrom on an edge, in a group and in an if, and validates',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

const TYPES = typesFor(['IngestWorker', 'ScoreWorker', 'ReviewWorker']);
const REGISTRY = { predicates: [], ...TYPES };

/** A two-task flow whose `score` edge carries `when`, with an optional edge `needs` on that edge. */
const edgeFlow = (when: unknown, needs?: unknown): FlowDefinition => ({
  flowId: 'vf', version: 1, entry: 'limits',
  nodes: [
    { id: 'limits', kind: 'task', type: 'IngestWorker', edges: [{ to: 'score' }] },
    { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [
      needs === undefined ? { when, to: 'review' } : { when, to: 'review', needs },
      { to: 'done' },
    ] },
    { id: 'review', kind: 'task', type: 'ReviewWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition);

/** An ENTRY `if` gate whose condition is `when`. */
const ifFlow = (when: unknown): FlowDefinition => ({
  flowId: 'vfi', version: 1, entry: 'check',
  nodes: [
    { id: 'check', kind: 'gate', type: 'if', settings: { when }, edges: [{ route: 'then', to: 'yes' }, { to: 'no' }] },
    { id: 'yes', kind: 'end', outcome: 'yes' },
    { id: 'no', kind: 'end', outcome: 'no' },
  ],
} as unknown as FlowDefinition);

const rulesOf = (d: FlowDefinition): string[] => violatedRules(validateDefinition(d, REGISTRY));
const detailsOf = (d: FlowDefinition): string => validateDefinition(d, REGISTRY).map((f) => `${f.rule}: ${f.detail}`).join(' | ');

/** A `DecisionContext` built here, so no expected value comes from the driver. */
const ctxOf = (result: unknown, needs: Record<string, unknown> = {}): DecisionContext => ({
  outcome: {
    kind: 'outcome', taskId: 'r1:score:-:0', terminalState: 'done', result, error: null, attempts: 0,
    observedAt: 1, startTime: 1, endTime: 1, executionTime: 0, schedulerTimestamp: 1,
  } as unknown as DecisionContext['outcome'],
  needs,
});
const NO_PREDICATES = new Map();
const ask = (when: unknown, ctx: DecisionContext): boolean => evaluateWhen(when as When, ctx, NO_PREDICATES);
/** A comparison of `outcome.result.l` against `valueFrom: outcome.result.r`, and the same against the literal `r`. */
const fromLeaf = (op: string, extra: Record<string, unknown> = {}) => ({ path: 'outcome.result.l', op, valueFrom: 'outcome.result.r', ...extra });
const litLeaf = (op: string, value: unknown, extra: Record<string, unknown> = {}) => ({ path: 'outcome.result.l', op, value, ...extra });

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, () => {
    const both = { path: 'outcome.result.score', op: 'gte', value: 50, valueFrom: 'outcome.result.min' };
    const neither = { path: 'outcome.result.score', op: 'gte' };
    const fromOnly = { path: 'outcome.result.score', op: 'gte', valueFrom: 'outcome.result.min' };
    const valueOnly = { path: 'outcome.result.score', op: 'gte', value: 50 };
    equal(rulesOf(edgeFlow(both)), ['FD-V42'], 'both value and valueFrom: FD-V42');
    equal(rulesOf(edgeFlow(neither)), ['FD-V42'], 'neither: FD-V42');
    equal(rulesOf(edgeFlow(fromOnly)), [], 'valueFrom alone: accepted (the control for both)');
    equal(rulesOf(edgeFlow(valueOnly)), [], 'value alone: accepted, as in 0.12.0 (the control for neither)');
    for (const [label, w] of [['both', both], ['neither', neither]] as const) {
      const m = predicateProblem(w)!.message;
      ok(m.includes('"value"') && m.includes('"valueFrom"'), `${label}: the message names the two keys — got ${m}`);
    }
    ok(predicateProblem(both)!.message.includes('both'), 'and says which it is: both');
    ok(predicateProblem(neither)!.message.includes('neither'), 'or neither');
    // `valueFrom` does not MARK a comparison — `path` or `op` does — so `{ valueFrom }` alone is FD-V42's *marks none*.
    equal(rulesOf(edgeFlow({ valueFrom: 'outcome.result.min' })), ['FD-V42'], '{ valueFrom } alone marks no shape');
    // In a GROUP member, and in an `if` (the gate's settings: FD-V40, with FD-V42's message).
    equal(rulesOf(edgeFlow({ any: [valueOnly, both] })), ['FD-V42'], 'a group member carrying both: FD-V42');
    equal(rulesOf(edgeFlow({ any: [valueOnly, fromOnly] })), [], 'a group member carrying valueFrom: accepted');
    const ifBoth = rulesOf(ifFlow({ path: 'input.a', op: 'lt', value: 1, valueFrom: 'input.b' }));
    equal(ifBoth, ['FD-V40'], 'an if carrying both: FD-V40');
    ok(detailsOf(ifFlow({ path: 'input.a', op: 'lt', value: 1, valueFrom: 'input.b' })).includes('FD-V42'), 'with FD-V42`s grammar named');
    equal(rulesOf(ifFlow({ path: 'input.a', op: 'lt' })), ['FD-V40'], 'an if carrying neither: FD-V40');
    equal(rulesOf(ifFlow({ path: 'input.a', op: 'lt', valueFrom: 'input.b' })), [], 'an if carrying valueFrom alone: accepted');
  });

  test(DECLARED_CASES[1]!, () => {
    const on = (valueFrom: unknown) => ({ path: 'outcome.result.score', op: 'eq', valueFrom });
    const EDGE_REFUSED: [unknown, string][] = [
      ['result.max', 'starts at "result"'],
      ['input.b', 'starts at "input"'],
      ['outcom.result.x', 'starts at "outcom"'],
      ['outcome', 'is a root alone'],
      ['needs', 'is a root alone'],
      ['outcome[0].x', 'indexes its root'],
      ['outcome.result[01]', 'is not a key path'],
      ['outcome.*.x', 'is not a key path'],
      ['', 'is not a key path'],
      [7, 'is not a key path'],
    ];
    for (const [vf, says] of EDGE_REFUSED) {
      equal(rulesOf(edgeFlow(on(vf))), ['FD-V43'], `valueFrom ${JSON.stringify(vf)} on an edge: FD-V43`);
      const m = predicateProblem(on(vf))!.message;
      ok(m.includes('valueFrom') && m.includes(says), `the message names valueFrom and says "${says}" — got ${m}`);
    }
    // The CONTROLS — a right root, on an edge, accepted; an index one key in accepted.
    for (const vf of ['outcome.result.max', 'outcome.taskId', 'outcome.result.items[0].max']) {
      equal(rulesOf(edgeFlow(on(vf))), [], `valueFrom ${vf} on an edge: accepted`);
    }
    equal(rulesOf(edgeFlow(on('needs.limit.max'), { limit: 'limits' })), [], 'needs.limit.max with limit declared: accepted');
    // The SAME clauses in an `if`, whose one root is `input` — and `outcome` / `needs` refused there.
    const inIf = (valueFrom: unknown) => ifFlow({ path: 'input.a', op: 'eq', valueFrom });
    for (const vf of ['outcome.x', 'needs.limit.max', 'input', 'input[0].x', 'b']) {
      equal(rulesOf(inIf(vf)), ['FD-V40'], `valueFrom ${JSON.stringify(vf)} in an if: FD-V40`);
      ok(detailsOf(inIf(vf)).includes('FD-V43'), `${vf}: with FD-V43's grammar named`);
    }
    equal(rulesOf(inIf('input.b')), [], 'valueFrom input.b in an if: accepted (the control)');
    equal(rulesOf(inIf('input.xs[1]')), [], 'and an index one key in');
    // The PATH's clause is asked FIRST, and a bad path is reported as the path's — the right side is not reported instead.
    ok(predicateProblem({ path: 'result.x', op: 'eq', valueFrom: 'outcome.y' })!.message.includes('path "result.x"'),
      'a bad path beside a good valueFrom names the path');
    ok(predicateProblem({ path: 'outcome.y', op: 'eq', valueFrom: 'result.x' })!.message.includes('valueFrom "result.x"'),
      'a good path beside a bad valueFrom names the valueFrom');
    // BOTH bad: the path is asked first, so the path is named (adequacy reader, V43-order).
    ok(predicateProblem({ path: 'result.x', op: 'eq', valueFrom: 'result.y' })!.message.includes('path "result.x"'),
      'both bad: the path is reported, being asked first');
  });

  test(DECLARED_CASES[2]!, () => {
    // P45 fact 4: a valueFrom's kind is a run-time fact, so no literal clause is asked of it.
    for (const op of PREDICATE_OPS) {
      equal(rulesOf(edgeFlow({ path: 'outcome.result.l', op, valueFrom: 'outcome.result.r' })), [], `"${op}" with valueFrom: accepted`);
    }
    equal(rulesOf(edgeFlow({ path: 'outcome.result.l', op: 'gte', valueFrom: 'outcome.result.r', length: true })), [],
      'a length compared against a valueFrom: accepted');
    equal(rulesOf(edgeFlow({ path: 'outcome.result.l', op: 'gt', valueFrom: 'outcome.result.r', default: 0 })), [],
      'a scalar default on the left: accepted');
    // What does NOT depend on the right side's kind is still asked.
    equal(rulesOf(edgeFlow({ path: 'outcome.result.l', op: 'startsWith', valueFrom: 'outcome.result.r', length: true })), ['FD-V44'],
      'a length with startsWith: FD-V44 — a length has no prefix');
    equal(rulesOf(edgeFlow({ path: 'outcome.result.l', op: 'gt', valueFrom: 'outcome.result.r', default: [] })), ['FD-V44'],
      'an array default with no length: FD-V44');
    equal(rulesOf(edgeFlow({ path: 'outcome.result.l', op: 'gt', valueFrom: 'outcome.result.r', length: true, default: 3 })), ['FD-V44'],
      'a length whose default has none: FD-V44');
    equal(rulesOf(edgeFlow({ path: 'outcome.result.l', op: 'gt', valueFrom: 'outcome.result.r', length: 1 })), ['FD-V44'],
      'length not exactly true: FD-V44');
    equal(rulesOf(edgeFlow({ path: 'outcome.result.l', op: 'matches', valueFrom: 'outcome.result.r' })), ['FD-V44'],
      'an operator outside the seven: FD-V44');
    // The CONTROL — the same literal shapes ARE refused where the right side is `value`.
    equal(rulesOf(edgeFlow({ path: 'outcome.result.l', op: 'gte', value: 'x' })), ['FD-V44'], 'gte against a string literal: FD-V44');
  });

  test(DECLARED_CASES[3]!, () => {
    const p = (path: string) => ({ path, op: 'lte', value: 100 });
    const vf = (valueFrom: string) => ({ path: 'outcome.result.size', op: 'lte', valueFrom });
    // REFUSED: the first key past `needs` is not one the edge declares.
    const REFUSED: [string, unknown, unknown][] = [
      ['a path, no needs on the edge', p('needs.limit.max'), undefined],
      ['a valueFrom, no needs on the edge', vf('needs.limit.max'), undefined],
      ['a path, another key declared', p('needs.limit.max'), { other: 'limits' }],
      ['a valueFrom, another key declared', vf('needs.limit.max'), { other: 'limits' }],
      ['a valueFrom, a key that PREFIXES the declared one', vf('needs.lim.max'), { limit: 'limits' }],
      ['a valueFrom, the declared key as a prefix of it', vf('needs.limits.max'), { limit: 'limits' }],
      ['a group member`s valueFrom', { all: [p('outcome.result.x'), vf('needs.nope.max'), p('outcome.result.y')] }, { limit: 'limits' }],
    ];
    equal(REFUSED.length, 7, 'the REFUSED table holds its seven rows — an emptied table fails here (W221 adequacy, W-g1table)');
    for (const [label, w, needs] of REFUSED) {
      equal(rulesOf(edgeFlow(w, needs)), ['FD-V43'], `${label}: FD-V43`);
    }
    const m = validateDefinition(edgeFlow(vf('needs.limit.max'), { other: 'limits', more: 'limits' }), REGISTRY)[0]!.detail;
    ok(m.includes('"limit"') && m.includes('"other"') && m.includes('"more"'), `the message names the key and the declared keys — got ${m}`);
    ok(validateDefinition(edgeFlow(vf('needs.limit.max')), REGISTRY)[0]!.detail.includes('declares no `needs`'),
      'and where the edge declares none, it says so');
    // ACCEPTED — the declared forms, each the control of a row above.
    const ACCEPTED: [string, unknown, unknown][] = [
      ['a path, its key declared', p('needs.limit.max'), { limit: 'limits' }],
      ['a valueFrom, its key declared', vf('needs.limit.max'), { limit: 'limits' }],
      ['a valueFrom, its key indexed', vf('needs.limit[0].max'), { limit: 'limits' }],
      ['a valueFrom, its key alone', vf('needs.limit'), { limit: 'limits' }],
      ['an outcome path, no needs on the edge', vf('outcome.result.max'), undefined],
      ['a "$payload" key', vf('needs.run.max'), { run: '$payload' }],
      ['a group member`s valueFrom, its key declared', { all: [p('outcome.result.x'), vf('needs.limit.max')] }, { limit: 'limits' }],
    ];
    equal(ACCEPTED.length, 7, 'the ACCEPTED table holds its seven rows');
    for (const [label, w, needs] of ACCEPTED) equal(rulesOf(edgeFlow(w, needs)), [], `${label}: accepted`);
    // ONE defect, one rule: an edge `needs` FD-V26 refuses (not an object; empty) is FD-V26's, and the key is not also asked.
    equal(rulesOf(edgeFlow(vf('needs.limit.max'), 'limits')), ['FD-V26'], 'a needs that is not an object: FD-V26 alone');
    equal(rulesOf(edgeFlow(vf('needs.limit.max'), {})), ['FD-V26'], 'an empty needs: FD-V26 alone');
    // A key DECLARED with a reference FD-V26 refuses is still declared — the key is right, its value is the defect.
    equal(rulesOf(edgeFlow(vf('needs.limit.max'), { limit: '.' })), ['FD-V26'], 'a declared key whose reference is refused: FD-V26 alone');
    // `predicateProblem` with no edge does not ask — a public caller with no edge is not refused for a key it cannot know.
    equal(predicateProblem(vf('needs.limit.max')), null, 'predicateProblem(when) with no edge: no needs clause');
    equal(predicateProblem(vf('needs.limit.max'), [])?.rule, 'FD-V43', 'predicateProblem(when, []) — an edge declaring none: FD-V43');
    equal(predicateProblem(vf('needs.limit.max'), ['limit']), null, 'predicateProblem(when, ["limit"]): accepted');
  });

  test(DECLARED_CASES[4]!, () => {
    // [op, l, r, answer] — the item file's table. Where a literal `r` is legal (FD-V44), the same comparison against the
    // literal gives the SAME answer: the control that the right side is compared AS a literal would be.
    const ROWS: [string, unknown, unknown, boolean][] = [
      ['eq', 5, 5, true], ['ne', 5, 5, false],
      ['eq', '5', 5, false], ['ne', '5', 5, true],
      ['lt', 4, 5, true], ['lte', 4, 5, true], ['gt', 4, 5, false], ['gte', 4, 5, false],
      ['lt', 5, 5, false], ['lte', 5, 5, true], ['gt', 5, 5, false], ['gte', 5, 5, true],
      ['gt', 6, 5, true], ['gte', 6, 5, true],
      ['startsWith', 'abc', 'ab', true], ['startsWith', 'xab', 'ab', false],
      ['lt', 4, 'ab', false], ['gte', 4, 'ab', false], ['startsWith', 'abc', 5, false],
      ['eq', true, true, true], ['ne', true, true, false], ['ne', false, true, true],
      ['eq', null, null, true], ['ne', null, null, false], ['ne', 0, null, true], ['gte', 0, null, false],
      ['eq', 'ab', 'ab', true], ['ne', 'ab', 'abc', true],
    ];
    let compared = 0;
    for (const [op, l, r, want] of ROWS) {
      const ctx = ctxOf({ l, r });
      equal(ask(fromLeaf(op), ctx), want, `${JSON.stringify(l)} ${op} valueFrom→${JSON.stringify(r)}: ${want}`);
      // The literal control, where FD-V44 admits that literal for that operator.
      const literalLegal = predicateProblem(litLeaf(op, r)) === null;
      if (literalLegal) {
        equal(ask(litLeaf(op, r), ctx), want, `and against the literal ${JSON.stringify(r)}: the same answer`);
        compared++;
      }
    }
    // 28 rows; FD-V44 refuses four of their literals (lt / gte against 'ab', startsWith against 5, gte against null), so
    // the literal control runs on the other 24 — derived from the table, by the rule, before the run.
    equal([ROWS.length, compared], [28, 24], 'the literal control ran on 24 of the 28 rows');
    // The left side's modifiers are the LEFT's: `default` stands in for an absent left, `length` measures the left.
    equal(ask(fromLeaf('lt', { default: 3 }), ctxOf({ r: 5 })), true, 'an absent left takes its default 3, and 3 lt 5');
    equal(ask(fromLeaf('gte', { length: true }), ctxOf({ l: 'abc', r: 3 })), true, 'the left`s length 3 gte 3');
    equal(ask(fromLeaf('gte', { length: true }), ctxOf({ l: 'abc', r: 4 })), false, 'and not gte 4');
    // And NOT the right's (W221's adequacy reader, E-rightlength): `length` measures the LEFT only, so a right side
    // holding a string or an array is compared as itself — a string or array against the number 3, no match.
    equal(ask(fromLeaf('eq', { length: true }), ctxOf({ l: 'abc', r: 'xyz' })), false, 'length does not measure a string right side');
    equal(ask(fromLeaf('eq', { length: true }), ctxOf({ l: 'abc', r: [1, 2, 3] })), false, 'nor an array right side');
    // And the left `default` stands in for the LEFT, never for a right resolving to NULL (adequacy, E-leftdefault-null):
    // 5 ne null is true; a default standing in for the right would make it 5 ne 5, false.
    equal(ask({ path: 'outcome.result.x', op: 'ne', valueFrom: 'outcome.result.y', default: 5 }, ctxOf({ x: 5, y: null })), true,
      'a left default does not stand in for a right side resolving to null');
    // A `valueFrom` on the OTHER root reads the edge's composed `needs` — pass 6's own comparison.
    const pass6 = { path: 'outcome.result.size', op: 'lte', valueFrom: 'needs.limit.max' };
    equal(ask(pass6, ctxOf({ size: 50 }, { limit: { max: 100 } })), true, 'size 50 lte max 100');
    equal(ask(pass6, ctxOf({ size: 100 }, { limit: { max: 100 } })), true, 'size 100 lte max 100 — the boundary');
    equal(ask(pass6, ctxOf({ size: 150 }, { limit: { max: 100 } })), false, 'size 150 is not');
  });

  test(DECLARED_CASES[5]!, () => {
    const OBJECTS: [string, unknown][] = [['an object', { a: 1 }], ['an empty object', {}], ['an array', [5]], ['an empty array', []]];
    equal(OBJECTS.length, 4, 'the OBJECTS table holds its four rows — an emptied table fails here (W221 adequacy, W-objects)');
    let objectAsks = 0;
    for (const [label, r] of OBJECTS) {
      for (const op of PREDICATE_OPS) {
        for (const l of [5, 'x', null, true]) {
          equal(ask(fromLeaf(op), ctxOf({ l, r })), false, `${JSON.stringify(l)} ${op} ${label}: no match`);
          objectAsks++;
        }
      }
      // `ne` is the row `===` alone gets wrong: 5 !== {a:1} is true.
      equal(ask(fromLeaf('ne'), ctxOf({ l: 5, r })), false, `ne against ${label}: NO match, where !== would say true`);
    }
    equal(objectAsks, 4 * 7 * 4, 'every object row was asked under every operator and every left value');
    // The SAME object named on both sides: `===` would make `eq` true.
    const same = { path: 'outcome.result.o', op: 'eq', valueFrom: 'outcome.result.o' };
    equal(ask(same, ctxOf({ o: { a: 1 } })), false, 'eq over one object named twice: no match, where === would say true');
    equal(ask({ ...same, op: 'ne' }, ctxOf({ o: { a: 1 } })), false, 'and ne over it: no match');
    equal(ask({ ...same, path: 'outcome.result.xs', valueFrom: 'outcome.result.xs' }, ctxOf({ xs: [1] })), false, 'eq over one array named twice: no match');
    // The CONTROL — the same key named twice holding a SCALAR is eq: the guard is the object's, not the doubling's.
    equal(ask(same, ctxOf({ o: 7 })), true, 'eq over one scalar named twice: true');
    // And the LEFT side is 0.12.0's: an object on the left with `ne` against a scalar right is still true (P45 decision 3).
    equal(ask({ path: 'outcome.result.o', op: 'ne', valueFrom: 'outcome.result.r' }, ctxOf({ o: { a: 1 }, r: 5 })), true,
      'ne with an OBJECT on the LEFT and a scalar right: true, unmoved — the asymmetry the spec states');
    equal(ask({ path: 'outcome.result.o', op: 'ne', value: 5 }, ctxOf({ o: { a: 1 } })), true, 'as it is against the literal');
  });

  test(DECLARED_CASES[6]!, () => {
    // Absent: a missing key, a missing parent, an index past the end, a key over an array, a class instance.
    class Box { r = 5; }
    // [label, valueFrom, result] — every case section 3's absent rule names, each where the right side WOULD hold 5 (or
    // 'x' for startsWith) under a naive walk, so a resolution wider than `readKeyPath`'s answers true somewhere here.
    const ABSENT: [string, string, unknown][] = [
      ['a missing key', 'outcome.result.r', {}],
      ['null mid-path', 'outcome.result.p.r', { p: null }],
      ['a key under a class instance', 'outcome.result.box.r', { box: new Box() }],
      ['an index past the end', 'outcome.result.xs[3]', { xs: [5, 5, 5] }],
      ['a plain numeric key over an array', 'outcome.result.xs.0', { xs: [5] }],
      ['a key under an array', 'outcome.result.xs.r', { xs: [5] }],
    ];
    equal(ABSENT.length, 6, 'the ABSENT table holds its six rows — an emptied table fails here (W221 adequacy, W-absent)');
    for (const [label, valueFrom, result] of ABSENT) {
      for (const op of PREDICATE_OPS) {
        const l = op === 'startsWith' ? 'x' : 5;
        equal(ask({ path: 'outcome.result.l', op, valueFrom }, ctxOf({ ...(result as object), l })), false, `${op} against ${label}: no match`);
      }
    }
    // The CONTROL over the observed side: the same reads where the right side DOES resolve answer true for `eq`.
    equal(ask({ path: 'outcome.result.l', op: 'eq', valueFrom: 'outcome.result.xs[0]' }, ctxOf({ l: 5, xs: [5] })), true, 'xs[0] resolves: eq 5 holds');
    equal(ask({ path: 'outcome.result.l', op: 'eq', valueFrom: 'outcome.result.r' }, ctxOf({ l: 5, r: 5 })), true, 'r resolves: eq 5 holds');
    // **The consequence, (b1)**: `x gt y` and `x lte y` are BOTH false where `y` is absent — no pair complements.
    const gt = { path: 'outcome.result.x', op: 'gt', valueFrom: 'outcome.result.y' };
    const lte = { path: 'outcome.result.x', op: 'lte', valueFrom: 'outcome.result.y' };
    equal([ask(gt, ctxOf({ x: 5 })), ask(lte, ctxOf({ x: 5 }))], [false, false], 'x gt y and x lte y both false where y is absent');
    equal([ask(gt, ctxOf({ x: 5, y: 3 })), ask(lte, ctxOf({ x: 5, y: 3 }))], [true, false], 'and they partition where y resolves (the control)');
    // **The left's `default` does not stand in for the right**: with `default: 3` on the left, an absent RIGHT is still no match.
    const gtD = { ...gt, default: 3 };
    const lteD = { ...lte, default: 3 };
    equal([ask(gtD, ctxOf({ x: 5 })), ask(lteD, ctxOf({ x: 5 }))], [false, false], 'a left default does not stand in for an absent right');
    equal([ask(gtD, ctxOf({ y: 3 })), ask(lteD, ctxOf({ y: 3 }))], [false, true], 'while it does stand in for an absent LEFT: 3 lte 3');
    // `ne` against an absent right is no match — `ne` does not mean "missing or different".
    equal(ask({ path: 'outcome.result.x', op: 'ne', valueFrom: 'outcome.result.y' }, ctxOf({ x: 5 })), false, 'ne against an absent right: no match');
    // A resolved NULL is not absent: `eq` holds against a left null, and `ne` against a left number.
    equal(ask({ path: 'outcome.result.x', op: 'eq', valueFrom: 'outcome.result.y' }, ctxOf({ x: null, y: null })), true, 'a resolved null is a value');
    equal(ask({ path: 'outcome.result.x', op: 'ne', valueFrom: 'outcome.result.y' }, ctxOf({ x: 5, y: null })), true, 'and ne 5 against it is true');
    // The `needs` root: an edge's composed `needs` with the key absent — pass 6's control.
    equal(ask({ path: 'outcome.result.size', op: 'lte', valueFrom: 'needs.limit.nope' }, ctxOf({ size: 50 }, { limit: { max: 100 } })), false,
      'needs.limit.nope, absent: no match where size 50 is below the max');
  });

  test(DECLARED_CASES[7]!, () => {
    const lt = { path: 'input.a', op: 'lt', valueFrom: 'input.b' } as unknown as When;
    const asked = (input: unknown) => evaluateDeclared(lt, { input }, (m) => new Error(m));
    equal(asked({ a: 1, b: 2 }), true, '1 lt 2: then');
    equal(asked({ a: 3, b: 2 }), false, '3 lt 2: else');
    equal(asked({ a: 1 }), false, 'b absent: else');
    equal(asked({ a: 1, b: '2' }), false, 'b a string: else — type-strict');
    equal(asked({ a: 1, b: { v: 2 } }), false, 'b an object: else');
    // The literal control on the same scope.
    equal(evaluateDeclared({ path: 'input.a', op: 'lt', value: 2 } as unknown as When, { input: { a: 1 } }, (m) => new Error(m)), true, '1 lt the literal 2: then');
  });

  test(DECLARED_CASES[8]!, () => {
    const schema = definitionSchema();
    const validator = new Validator(schema as never, '2020-12', true);
    const accepts = (d: unknown) => validator.validate(d).valid;
    const docs: [string, unknown, unknown, boolean, string[]][] = [
      ['valueFrom alone', { path: 'outcome.result.size', op: 'lte', valueFrom: 'needs.limit.max' }, { limit: 'limits' }, true, []],
      ['valueFrom on outcome, an index past a key', { path: 'outcome.result.size', op: 'lte', valueFrom: 'outcome.result.items[0].max' }, undefined, true, []],
      ['value alone (0.12.0)', { path: 'outcome.result.size', op: 'lte', value: 100 }, undefined, true, []],
      ['both', { path: 'outcome.result.size', op: 'lte', value: 100, valueFrom: 'outcome.result.max' }, undefined, false, ['FD-V42']],
      ['neither', { path: 'outcome.result.size', op: 'lte' }, undefined, false, ['FD-V42']],
      ['valueFrom at a foreign root', { path: 'outcome.result.size', op: 'lte', valueFrom: 'input.max' }, undefined, false, ['FD-V43']],
      ['valueFrom a root alone', { path: 'outcome.result.size', op: 'lte', valueFrom: 'outcome' }, undefined, false, ['FD-V43']],
      ['valueFrom indexing its root', { path: 'outcome.result.size', op: 'lte', valueFrom: 'needs[0].max' }, undefined, false, ['FD-V43']],
      ['valueFrom with length and startsWith', { path: 'outcome.result.s', op: 'startsWith', valueFrom: 'outcome.result.p', length: true }, undefined, false, ['FD-V44']],
      ['valueFrom with an ordering op (no literal to type)', { path: 'outcome.result.size', op: 'gt', valueFrom: 'outcome.result.max' }, undefined, true, []],
    ];
    for (const [label, w, needs, want, rules] of docs) {
      const d = edgeFlow(w, needs);
      equal(accepts(d), want, `the schema ${want ? 'accepts' : 'refuses'}: ${label}`);
      equal(rulesOf(d), rules, `and validateDefinition reports ${JSON.stringify(rules)} (the second observer)`);
    }
    // (g1) is NOT the schema's: an undeclared needs key is accepted by it and refused by the validator — section 1's
    // *does not carry* row.
    const undeclared = edgeFlow({ path: 'outcome.result.size', op: 'lte', valueFrom: 'needs.limit.max' });
    equal(accepts(undeclared), true, 'the schema accepts an undeclared needs key — a relation between two keys it cannot state');
    equal(rulesOf(undeclared), ['FD-V43'], 'and the validator refuses it');
  });

  test(DECLARED_CASES[9]!, async () => {
    const doc = JSON.parse(await readText(`${ROOT}spec/examples/valid/value-from.flow.json`)) as FlowDefinition;
    const sites: string[] = [];
    const walk = (w: unknown, at: string) => {
      const o = w as Record<string, unknown>;
      if ('valueFrom' in o) sites.push(at);
      for (const k of ['all', 'any']) if (Array.isArray(o[k])) (o[k] as unknown[]).forEach((m, i) => walk(m, `${at}.${k}[${i}]`));
    };
    for (const n of doc.nodes as unknown as Record<string, unknown>[]) {
      if (n.kind === 'gate' && n.type === 'if') walk((n.settings as { when: unknown }).when, `${String(n.id)}.if`);
      for (const [i, e] of ((n.edges ?? []) as Record<string, unknown>[]).entries()) if (e.when !== undefined) walk(e.when, `${String(n.id)}#edge${i}`);
    }
    equal(sites, ['check.if', 'score#edge0', 'score#edge1.any[0]', 'score#edge1.any[1]'],
      'valueFrom in an if, on an edge over needs, and twice in a group — read off the document');
    const registry = { predicates: [], ...typesFor(['IngestWorker', 'ScoreWorker', 'ReviewWorker', 'PublishWorker']) };
    equal(violatedRules(validateDefinition(doc, registry)), [], 'and the whole document validates');
  });

  test(DECLARED_CASES[10]!, () => {
    const ran = collected().filter((x) => x.suite === SUITE).flatMap((x) => x.cases.map((c) => c.name)).sort();
    equal(ran, [...DECLARED_CASES].sort(), 'every declared case ran, and no other');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});

// Kept typed: a comparison WITH `valueFrom` is a `PredicateLeaf` (the union's second member), and one with both keys is
// not — the L0 half of FD-V42's exactly-one, which the tests lane typechecks.
const typedFrom: PredicateLeaf = { path: 'outcome.result.size', op: 'lte', valueFrom: 'needs.limit.max' };
const typedValue: PredicateLeaf = { path: 'outcome.result.size', op: 'lte', value: 100 };
// @ts-expect-error — both value and valueFrom: neither member of the union admits it
const typedBoth: PredicateLeaf = { path: 'outcome.result.size', op: 'lte', value: 100, valueFrom: 'needs.limit.max' };
// @ts-expect-error — neither: neither member of the union admits it
const typedNeither: PredicateLeaf = { path: 'outcome.result.size', op: 'lte' };
void [typedFrom, typedValue, typedBoth, typedNeither];
