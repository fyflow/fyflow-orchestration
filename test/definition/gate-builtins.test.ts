/**
 * **The built-in `if` and `switch`, at the definition** — `spec/flow-definition.md` v0.31 (section 2's gate
 * subsection and its built-in table, section 3's `when` subsection — the `input` root and `FD-C8` — and
 * `FD-V40`/`FD-V41`), [P32](../../doc/plans/p32-what-a-gate-may-decide-without-memory.md) decisions 1, 4, 5 and 6,
 * [W154](../../doc/work-items/w154-the-built-in-if-and-switch.md).
 *
 * **Every expected value is read from the rule text, never from the validator's or a type's output.** A route
 * comes from P32 decision 4 (`then`/`else`, default `else`) or decision 5 (the case names plus `default`); what a
 * comparison answers comes from section 3's `when` subsection — absent is no match for EVERY operator, a `default`
 * stands in for an absent or `null` value before `length`, a comparison between kinds is no match and never a
 * coercion, `length` is an array's or a string's; what a case matches comes from decision 5 — `===`, so `"1"` and
 * `1` are two values. Each table row is a value a WRONG reading answers differently (`doc/workflow.md` section 5
 * rule 8 obligation (a)): a coercing compare on `"5"`, an absent-as-zero on `{}`, a null-is-absent on `null`, a
 * `==` match on `"1"`, an `in` on an array case.
 *
 * Both types are reached as `BUILT_IN_GATE_TYPES.if` and `.switch` — by NAME, as a flow reaches them: neither has a
 * named export (W154 Scope/Out), and no registry below registers either.
 */
import { collected, equal, ok, suite, throws } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { BUILT_IN_GATE_TYPES, gateTypeCollisions, gateTypeProblem, gateTypesOf, routesOf, validateDefinition } from '../../src/definition/validate.ts';
import { checkRegistry, NameCollision } from '../../src/definition/registry.ts';
import { checkWiring } from '../../src/definition/wiring.ts';
import { evaluateWhen } from '../../src/driver/routing.ts';
import type { FlowDefinition, GateContext, GateType, JsonSchema, Registry, When } from '../../src/definition/types.ts';

const SUITE = 'W154 — the built-in if and switch: registered through the interface, their grammar, and what each decides';

const IF = BUILT_IN_GATE_TYPES.if!;
const SWITCH = BUILT_IN_GATE_TYPES.switch!;

/** No gate type registered and no predicate either — the built-ins are reachable with neither (P32's exit artifact's claim). */
const registry: Registry = { predicates: new Set<string>(), ...typesFor(['Ingest', 'Work', 'Other']) };

/** A consumer type, to stand under a built-in's name. */
const other: GateType = { routes: ['a', 'b'], defaultRoute: 'a', fn: () => 'a' };

/** One `if` gate after a task, its two routes wired, the default by OMISSION. */
const ifFlow = (settings: unknown, edges: unknown[] = [{ route: 'then', to: 'work' }, { to: 'other' }]): FlowDefinition => ({
  flowId: 'if-def', version: 1, entry: 'ingest', nodes: [
    { id: 'ingest', kind: 'task', type: 'Ingest', edges: [{ to: 'g' }] },
    settings === undefined ? { id: 'g', kind: 'gate', type: 'if', edges } : { id: 'g', kind: 'gate', type: 'if', settings, edges },
    { id: 'work', kind: 'task', type: 'Work', edges: [{ to: 'done' }] },
    { id: 'other', kind: 'task', type: 'Other', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
}) as unknown as FlowDefinition;

/** P32 decision 5's own example, after a task: two cases wired by name and `default` by OMISSION. */
const CASES = { approved: 'approved', rework: ['rejected', 'needs-changes'] };
const SWITCH_EDGES = [{ route: 'approved', to: 'work' }, { route: 'rework', to: 'other' }, { to: 'done' }];
const switchFlow = (settings: unknown, edges: unknown[] = SWITCH_EDGES): FlowDefinition => ({
  flowId: 'switch-def', version: 1, entry: 'ingest', nodes: [
    { id: 'ingest', kind: 'task', type: 'Ingest', edges: [{ to: 's' }] },
    settings === undefined ? { id: 's', kind: 'gate', type: 'switch', edges } : { id: 's', kind: 'gate', type: 'switch', settings, edges },
    { id: 'work', kind: 'task', type: 'Work', edges: [{ to: 'done' }] },
    { id: 'other', kind: 'task', type: 'Other', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
}) as unknown as FlowDefinition;

/** The findings AT a gate or one of its edges, as `rule` and `detail`. */
const findingsAt = (d: FlowDefinition, gate: string) =>
  validateDefinition(d, registry).filter((f) => f.at === gate || (f.at ?? '').startsWith(`${gate}#`));

/** A gate context for calling `fn` directly — the shape the driver hands it, with an EMPTY memory to watch. */
const ctxOf = (settings: Record<string, unknown>, input: unknown, key?: unknown): GateContext =>
  ({ key, input, settings, memory: new Map<string, unknown>() });

const DECLARED_CASES: readonly string[] = [
  'if and switch are BUILT IN and registered THROUGH the interface: gateTypeProblem, checkRegistry, a collision by either name',
  'if`s grammar: a comparison or a flat group over input, each refusal FD-V40 at the gate beside its accepted neighbour — and a task edge`s grammar UNMOVED',
  'if decides over a table of values: every operator, absent, null, wrong type, boundary, length, default and both groups — by the evaluator a task edge uses',
  'switch`s grammar: { key, cases }, a case name a route name, a value a scalar or a non-empty array, a value in two cases refused — FD-V40 beside its neighbours',
  'switch`s routes are its NODE`s: every case plus default, the default by an edge with no route, and FD-V41 refusing an unwired case BY NAME',
  'switch decides over a table of values: ===, "1" against 1, null, absent, a value in an array case, a key that is not a scalar',
  'the wiring check: a switch`s case routes are KEY-RESOLVED along its key and its default is not; an if`s then is NOT refined (W154 Scope/Out)',
  'switch`s route ORDER is the parsed object`s: integer-like case names first, ascending, then the rest in document order, then default',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test('if and switch are BUILT IN and registered THROUGH the interface: gateTypeProblem, checkRegistry, a collision by either name', () => {
    equal(Object.keys(BUILT_IN_GATE_TYPES).sort(), ['distinct', 'if', 'switch'], 'P32 decision 1: two built-ins beside distinct, and nothing else');
    equal([gateTypeProblem(IF), gateTypeProblem(SWITCH)], [null, null], 'each passes the SAME predicate a consumer`s type passes');
    checkRegistry({});
    ok(true, 'and checkRegistry, which holds every built-in to gateTypeProblem, accepts the set');
    // `if` is STATIC — P32 decision 4: routes then and else, the default else — and makes no key guarantee (Scope/Out).
    equal([[...(IF.routes ?? [])], IF.defaultRoute, IF.keyResolvedRoutes, typeof IF.routesFor], [['then', 'else'], 'else', undefined, 'undefined'],
      'if: routes then and else, default else — the static form, and no keyResolvedRoutes');
    // `switch` is DERIVED — P32 decision 5: its routes are its gate's.
    equal([SWITCH.routes, SWITCH.defaultRoute, typeof SWITCH.routesFor], [undefined, undefined, 'function'], 'switch: no static routes — routesFor, the derived form');
    // Neither reads memory and neither is told apart by NAME anywhere but the registry: a COPY under another name
    // validates exactly as the built-in does.
    const copies: Registry = { ...registry, gateTypes: { myIf: { ...IF }, mySwitch: { ...SWITCH } } };
    const viaIf = (type: string, s: unknown) => validateDefinition({ ...ifFlow(s), nodes: ifFlow(s).nodes.map((n) => (n.id === 'g' ? { ...n, type } : n)) } as FlowDefinition, copies).map((f) => f.rule);
    for (const s of [{ when: { path: 'input.p', op: 'gt', value: 1 } }, { when: { path: 'outcome.p', op: 'gt', value: 1 } }, {}]) {
      equal(viaIf('myIf', s), viaIf('if', s), `a copy of if agrees with if on ${JSON.stringify(s)}`);
    }
    // A consumer type named as either built-in is REFUSED, never merged — NameCollision and gateTypeCollisions.
    for (const name of ['if', 'switch']) {
      throws(() => checkRegistry({ gateTypes: { [name]: other } }), name, `a consumer type named "${name}" is a NameCollision`);
      let err: unknown;
      try { checkRegistry({ gateTypes: { [name]: other } }); } catch (e) { err = e; }
      ok(err instanceof NameCollision, `and the class is NameCollision: ${String(err)}`);
      equal(gateTypesOf({ [name]: other }).get(name), BUILT_IN_GATE_TYPES[name], `gateTypesOf keeps the built-in "${name}"`);
    }
    equal(gateTypeCollisions({ if: other, switch: other, mine: other }), ['if', 'switch'], 'and the collisions are named, the consumer`s own name not');
    // The validator with NO gateTypes at all reaches both, and with them a gate naming them is clean.
    equal(validateDefinition(ifFlow({ when: { path: 'input.p', op: 'gt', value: 1 } }), registry), [], 'an if gate validates against a registry that registers no gate type');
    equal(validateDefinition(switchFlow({ key: 'status', cases: CASES }), registry), [], 'and so does a switch gate');
  });

  test('if`s grammar: a comparison or a flat group over input, each refusal FD-V40 at the gate beside its accepted neighbour — and a task edge`s grammar UNMOVED', () => {
    const accepted: [string, unknown][] = [
      ['a comparison', { path: 'input.priority', op: 'gte', value: 5 }],
      ['a nested path', { path: 'input.meta.priority', op: 'lt', value: 5 }],
      ['default and length', { path: 'input.tags', op: 'gte', value: 1, length: true, default: [] }],
      ['an all group', { all: [{ path: 'input.a', op: 'eq', value: 1 }, { path: 'input.b', op: 'ne', value: null }] }],
      ['an any group', { any: [{ path: 'input.a', op: 'startsWith', value: 'x' }, { path: 'input.b', op: 'lte', value: 2 }] }],
    ];
    for (const [label, when] of accepted) equal(findingsAt(ifFlow({ when }), 'g'), [], `accepted: ${label}`);
    // Each refusal: FD-V40 alone at the gate (P32 decision 7 — the settings' defect), the message saying what is
    // wrong, and — for a grammar defect — the rule whose grammar it is.
    const refused: [string, unknown, string][] = [
      ['no settings at all — when is required', undefined, '$.when required'],
      ['no when', {}, '$.when required'],
      ['a key beside when — the settings are closed', { when: { path: 'input.p', op: 'eq', value: 1 }, key: 'p' }, '$.key not declared'],
      ['a bare string', { when: 'isHigh' }, 'settings.when is string'],
      ['a registered NAME — P32 Scope/Out', { when: { predicate: 'isHigh' } }, 'names a registered predicate, which an if gate cannot ask'],
      ['a NAME inside a group', { when: { any: [{ predicate: 'isHigh' }] } }, 'names a registered predicate'],
      ['the outcome root', { when: { path: 'outcome.result.p', op: 'eq', value: 1 } }, 'its one root is "input"'],
      ['the needs root', { when: { path: 'needs.earlier.p', op: 'eq', value: 1 } }, 'its one root is "input"'],
      ['no root', { when: { path: 'priority', op: 'eq', value: 1 } }, 'starts at "priority"'],
      ['input alone — FD-V43`s root-alone clause, W154 stop-and-ask (m)', { when: { path: 'input', op: 'eq', value: 1 } }, 'is a root alone'],
      ['an operator outside the seven', { when: { path: 'input.p', op: 'matches', value: 'x' } }, 'is not one of'],
      ['a value that is not a scalar', { when: { path: 'input.p', op: 'eq', value: { a: 1 } } }, 'SCALAR'],
      ['a number operator against a string', { when: { path: 'input.p', op: 'gt', value: '5' } }, 'not a number'],
      ['a group inside a group', { when: { all: [{ any: [{ path: 'input.p', op: 'eq', value: 1 }] }] } }, 'FLAT'],
      ['an empty group', { when: { all: [] } }, 'empty'],
      ['both shapes at once', { when: { path: 'input.p', op: 'eq', value: 1, all: [] } }, 'more than one shape'],
      ['neither shape', { when: { value: 1 } }, 'neither a comparison'],
    ];
    const grammarRule: Record<string, string> = {
      'settings.when is string': 'FD-V42', 'names a registered predicate, which an if gate cannot ask': 'FD-V42', 'its one root is "input"': 'FD-V43',
      'starts at "priority"': 'FD-V43', 'is a root alone': 'FD-V43', 'is not one of': 'FD-V44', 'SCALAR': 'FD-V44', 'not a number': 'FD-V44',
      'FLAT': 'FD-V45', 'empty': 'FD-V45', 'more than one shape': 'FD-V42', 'neither a comparison': 'FD-V42',
    };
    for (const [label, settings, says] of refused) {
      const fs = findingsAt(ifFlow(settings), 'g');
      equal(fs.map((f) => f.rule), ['FD-V40'], `refused, FD-V40 alone at the gate: ${label} — ${fs.map((f) => f.detail).join(' | ')}`);
      ok(fs[0]!.detail.includes(says), `${label}: the message says ${JSON.stringify(says)} — ${fs[0]?.detail}`);
      // Group membership (`'names a registered predicate'` inside a group) is FD-V45's clause; a top-level name the gate's own.
      const rule = label === 'a NAME inside a group' ? 'FD-V45' : grammarRule[says];
      if (rule !== undefined) ok(fs[0]!.detail.includes(`(${rule}'s grammar`), `${label}: and it names ${rule}, whose grammar it is — ${fs[0]!.detail}`);
    }
    // **The TASK edge's grammar is UNMOVED** (Output (4)): `input` is not a root there, and `outcome`/`needs` still are —
    // two lists, not one wider one, because `input.x` on an edge would resolve to nothing in silence (re-take 3).
    const edgeFlow = (when: unknown) => ({
      flowId: 'edge', version: 1, entry: 'ingest', nodes: [
        { id: 'ingest', kind: 'task', type: 'Ingest', edges: [{ when, to: 'work' }, { to: 'other' }] },
        { id: 'work', kind: 'task', type: 'Work', edges: [{ to: 'done' }] },
        { id: 'other', kind: 'task', type: 'Other', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    }) as unknown as FlowDefinition;
    const onEdge = (when: unknown) => validateDefinition(edgeFlow(when), registry);
    equal(onEdge({ path: 'input.priority', op: 'gte', value: 5 }).map((f) => f.rule), ['FD-V43'], 'input.x on a TASK edge is still FD-V43');
    ok(onEdge({ path: 'input.priority', op: 'gte', value: 5 })[0]!.detail.includes('a predicate\'s roots are "outcome" and "needs"'), 'with the edge`s own message, byte for byte');
    equal(onEdge({ path: 'outcome.result.priority', op: 'gte', value: 5 }), [], 'and outcome.x on a task edge is still accepted');
    equal(onEdge({ path: 'outcome', op: 'eq', value: 1 })[0]!.detail.includes('is a root alone and names no value — "outcome" is a container'), true, 'the edge`s root-alone message, unmoved');
  });

  test('if decides over a table of values: every operator, absent, null, wrong type, boundary, length, default and both groups — by the evaluator a task edge uses', () => {
    const P = 'input.priority';
    // [label, when, input, expected route] — each expected route is read off section 3's `when` text.
    const rows: [string, Record<string, unknown>, unknown, 'then' | 'else'][] = [
      ['gte at the boundary', { path: P, op: 'gte', value: 5 }, { priority: 5 }, 'then'],
      ['gte just below', { path: P, op: 'gte', value: 5 }, { priority: 4.5 }, 'else'],
      ['gte, absent — no match', { path: P, op: 'gte', value: 5 }, {}, 'else'],
      ['gte, null with no default — a scalar, not a number', { path: P, op: 'gte', value: 5 }, { priority: null }, 'else'],
      ['gte, "5" — no coercion', { path: P, op: 'gte', value: 5 }, { priority: '5' }, 'else'],
      ['lt, absent — no match, so lt and gte are BOTH false', { path: P, op: 'lt', value: 5 }, {}, 'else'],
      ['lt at the boundary', { path: P, op: 'lt', value: 5 }, { priority: 5 }, 'else'],
      ['lt below', { path: P, op: 'lt', value: 5 }, { priority: 4 }, 'then'],
      ['lt, default 0 on absent', { path: P, op: 'lt', value: 5, default: 0 }, {}, 'then'],
      ['lt, default 0 on null — null takes the default', { path: P, op: 'lt', value: 5, default: 0 }, { priority: null }, 'then'],
      ['lt, default 0, a present 9', { path: P, op: 'lt', value: 5, default: 0 }, { priority: 9 }, 'else'],
      ['gt at the boundary', { path: P, op: 'gt', value: 5 }, { priority: 5 }, 'else'],
      ['lte at the boundary', { path: P, op: 'lte', value: 5 }, { priority: 5 }, 'then'],
      ['eq 1 against "1" — two values', { path: 'input.n', op: 'eq', value: 1 }, { n: '1' }, 'else'],
      ['eq 1 against 1', { path: 'input.n', op: 'eq', value: 1 }, { n: 1 }, 'then'],
      ['eq null against a resolved null', { path: 'input.n', op: 'eq', value: null }, { n: null }, 'then'],
      ['eq null against absent — absent is no match', { path: 'input.n', op: 'eq', value: null }, {}, 'else'],
      ['ne, a different value', { path: 'input.s', op: 'ne', value: 'x' }, { s: 'y' }, 'then'],
      ['ne, the same value', { path: 'input.s', op: 'ne', value: 'x' }, { s: 'x' }, 'else'],
      ['ne, absent — no match for EVERY operator', { path: 'input.s', op: 'ne', value: 'x' }, {}, 'else'],
      // Reader item R2 (adequacy C02): `ne` across KINDS — type-strict, so a number and a string are two values and `ne` holds.
      ['ne 1 against "1" — two values, so ne holds', { path: 'input.n', op: 'ne', value: 1 }, { n: '1' }, 'then'],
      ['ne 0 against false — no coercion, so ne holds', { path: 'input.n', op: 'ne', value: 0 }, { n: false }, 'then'],
      ['startsWith', { path: 'input.name', op: 'startsWith', value: 'Dark.' }, { name: 'Dark.S01E01' }, 'then'],
      ['startsWith on a number', { path: 'input.name', op: 'startsWith', value: '5' }, { name: 5 }, 'else'],
      ['length of an array', { path: 'input.tags', op: 'gte', value: 2, length: true }, { tags: ['a', 'b'] }, 'then'],
      ['length of a short array', { path: 'input.tags', op: 'gte', value: 2, length: true }, { tags: ['a'] }, 'else'],
      ['length of a string', { path: 'input.tags', op: 'gte', value: 2, length: true }, { tags: 'ab' }, 'then'],
      ['length of a number — none', { path: 'input.tags', op: 'gte', value: 0, length: true }, { tags: 5 }, 'else'],
      ['length, default [] on absent', { path: 'input.tags', op: 'eq', value: 0, length: true, default: [] }, {}, 'then'],
      ['a nested path', { path: 'input.meta.p', op: 'eq', value: 1 }, { meta: { p: 1 } }, 'then'],
      ['an array under a key step — a numeric segment is a key, not an index', { path: 'input.meta.p', op: 'eq', value: 1 }, { meta: [{ p: 1 }] }, 'else'],
      ['a scalar payload — input.priority on 7 resolves to nothing', { path: P, op: 'gte', value: 5 }, 7, 'else'],
      ['a null payload', { path: P, op: 'gte', value: 5 }, null, 'else'],
      ['a class instance — not a plain object', { path: P, op: 'gte', value: 5 }, new (class { priority = 9; })(), 'else'],
      ['all, both true', { all: [{ path: 'input.a', op: 'eq', value: 1 }, { path: 'input.b', op: 'eq', value: 2 }] }, { a: 1, b: 2 }, 'then'],
      ['all, one false', { all: [{ path: 'input.a', op: 'eq', value: 1 }, { path: 'input.b', op: 'eq', value: 2 }] }, { a: 1, b: 3 }, 'else'],
      ['any, one true', { any: [{ path: 'input.a', op: 'eq', value: 1 }, { path: 'input.b', op: 'eq', value: 2 }] }, { a: 0, b: 2 }, 'then'],
      ['any, none', { any: [{ path: 'input.a', op: 'eq', value: 1 }, { path: 'input.b', op: 'eq', value: 2 }] }, { a: 0, b: 0 }, 'else'],
    ];
    const seen = new Set<string>();
    for (const [label, when, input, expected] of rows) {
      const ctx = ctxOf({ when }, input, 'a key the if ignores');
      equal(IF.fn(ctx), expected, `${label}: ${expected}`);
      equal(ctx.memory.size, 0, `${label}: and the memory is untouched — if reads none (FD-C8)`);
      seen.add(expected);
      // **The same evaluator a task edge's `when` is** (P32 decision 4): the comparison re-rooted at `outcome.result`
      // over an outcome holding the same value answers the same — a second evaluator would have to agree on all
      // thirty-six rows to pass this.
      const reroot = (w: Record<string, unknown>): Record<string, unknown> => ('path' in w
        ? { ...w, path: `outcome.result${(w.path as string).slice('input'.length)}` }
        : Object.fromEntries(Object.entries(w).map(([k, ms]) => [k, (ms as Record<string, unknown>[]).map(reroot)])));
      equal(evaluateWhen(reroot(when) as unknown as When, { outcome: { result: input } as never, needs: {} }, new Map()), expected === 'then', `${label}: the task edge's evaluator agrees`);
    }
    equal([...seen].sort(), ['else', 'then'], 'the table reaches both routes');
  });

  test('switch`s grammar: { key, cases }, a case name a route name, a value a scalar or a non-empty array, a value in two cases refused — FD-V40 beside its neighbours', () => {
    const accepted: [string, unknown][] = [
      ['P32 decision 5`s example', { key: 'status', cases: CASES }],
      ['every scalar kind as a value', { key: 'status', cases: { approved: null, rework: true, a: 1, b: 'x' } }],
      ['"1" and 1 in two cases — two values', { key: 'status', cases: { approved: '1', rework: 1 } }],
      ['true and 1 in two cases — two values', { key: 'status', cases: { approved: true, rework: 1 } }],
      ['a nested key path', { key: 'review.status', cases: CASES }],
      // The neighbours of (l)'s two refusals: ONE case, and two cases each naming its values once.
      ['one case', { key: 'status', cases: { approved: 'ok' } }],
      ['two array cases, no value repeated', { key: 'status', cases: { approved: ['ok', 'fine'], rework: ['no', 'later'] } }],
    ];
    for (const [label, settings] of accepted) {
      const s = settings as { cases: Record<string, unknown> };
      // Wire whatever cases the settings declare, so only the GRAMMAR is under test here.
      const edges = [...Object.keys(s.cases).map((c) => ({ route: c, to: 'work' })), { to: 'done' }];
      equal(findingsAt(switchFlow(settings, edges), 's'), [], `accepted: ${label}`);
    }
    const refused: [string, unknown, string][] = [
      ['no settings', undefined, '$.key required'],
      ['no key', { cases: CASES }, '$.key required'],
      ['no cases', { key: 'status' }, '$.cases required'],
      ['a key beside the two', { key: 'status', cases: CASES, note: 'x' }, '$.note not declared'],
      ['a key outside the key-path grammar', { key: 'files[*].status', cases: CASES }, 'is not a key path'],
      ['cases an array', { key: 'status', cases: ['approved'] }, 'expected object'],
      ['cases null', { key: 'status', cases: null }, 'expected object'],
      ['a case named default — reserved', { key: 'status', cases: { default: 'x' } }, 'reserved'],
      ['a case name outside the route charset', { key: 'status', cases: { 'two words': 'x' } }, 'not [A-Za-z0-9_-]{1,64}'],
      ['a case value that is an object', { key: 'status', cases: { approved: { a: 1 } } }, 'cases.approved is object'],
      ['a case value that is an empty array', { key: 'status', cases: { approved: [] } }, 'empty array'],
      ['an array case holding an object', { key: 'status', cases: { approved: ['ok', { a: 1 }] } }, 'cases.approved holds object'],
      ['an array case holding an array', { key: 'status', cases: { approved: ['ok', ['x']] } }, 'cases.approved holds an array'],
      ['a value in two cases, scalar and scalar', { key: 'status', cases: { approved: 'x', rework: 'x' } }, 'named by two cases, "approved" and "rework"'],
      ['a value in two cases, scalar and array', { key: 'status', cases: { approved: 'x', rework: ['y', 'x'] } }, 'named by two cases, "approved" and "rework"'],
      ['a value in two cases, array and array', { key: 'status', cases: { approved: ['a', 1], rework: [2, 1] } }, 'the value 1 is named by two cases'],
      ['null in two cases', { key: 'status', cases: { approved: null, rework: [null] } }, 'the value null is named by two cases'],
      // Reader items R2 (adequacy S12, S13) and R3 (conformity C3): 0 and -0 are ONE value by ===, and the message names -0.
      ['0 and -0 in two cases — one value by ===', { key: 'status', cases: JSON.parse('{"approved":0,"rework":-0}') }, 'the values 0 in case "approved" and -0 in case "rework" are one value by ==='],
      ['Infinity as a case value — not a finite number', { key: 'status', cases: { approved: Infinity } }, 'cases.approved is Infinity'],
      ['NaN inside an array case', { key: 'status', cases: { approved: [1, NaN] } }, 'cases.approved holds NaN'],
      // W154 stop-and-ask (l), the maintainer's answer: both refused.
      ['an EMPTY table — always default, written as a question', { key: 'status', cases: {} }, 'cases is empty'],
      ['a value repeated INSIDE one case', { key: 'status', cases: { approved: ['ok', 'fine', 'ok'] } }, 'cases.approved repeats the value "ok"'],
    ];
    for (const [label, settings, says] of refused) {
      const fs = findingsAt(switchFlow(settings), 's');
      equal(fs.map((f) => f.rule), ['FD-V40'], `refused, FD-V40 alone — the gate is not counted by FD-V41 once its settings are refused: ${label} — ${fs.map((f) => f.detail).join(' | ')}`);
      ok(fs[0]!.detail.includes(says), `${label}: the message says ${JSON.stringify(says)} — ${fs[0]?.detail}`);
    }
  });

  test('switch`s routes are its NODE`s: every case plus default, the default by an edge with no route, and FD-V41 refusing an unwired case BY NAME', () => {
    equal(routesOf(SWITCH, { key: 'status', cases: CASES }),
      { routes: ['approved', 'rework', 'default'], defaultRoute: 'default', keyResolvedRoutes: ['approved', 'rework'] },
      'P32 decision 5: the case names in the document`s order, then default; default the default; every case key-resolved');
    equal(routesOf(SWITCH, { key: 'k', cases: { b: 1, a: 2 } }), { routes: ['b', 'a', 'default'], defaultRoute: 'default', keyResolvedRoutes: ['b', 'a'] },
      'a second gate, a second set — the order is the document`s, not sorted');
    // FD-V41 against the GATE's set. Each refusal is the gate's, at the gate or the edge, and names what is wrong.
    const v41 = (edges: unknown[]) => findingsAt(switchFlow({ key: 'status', cases: CASES }, edges), 's');
    const noRework = v41([{ route: 'approved', to: 'work' }, { to: 'done' }]);
    equal(noRework.map((f) => f.rule), ['FD-V41'], 'a case left unwired is FD-V41');
    ok(noRework[0]!.detail.includes('route "rework"') && noRework[0]!.detail.includes('has no edge'), `naming the CASE: ${noRework[0]?.detail}`);
    const noDefault = v41([{ route: 'approved', to: 'work' }, { route: 'rework', to: 'other' }]);
    equal(noDefault.map((f) => f.rule), ['FD-V41'], 'and so is default left unwired');
    ok(noDefault[0]!.detail.includes('route "default" (the default route'), `naming default as the default: ${noDefault[0]?.detail}`);
    const stray = v41([...SWITCH_EDGES, { route: 'pending', to: 'done' }]);
    equal(stray.map((f) => [f.rule, f.at]), [['FD-V41', 's#edge3']], 'an edge naming a value that is no case is FD-V41 at that edge');
    ok(stray[0]!.detail.includes('"approved", "rework", "default"'), `naming the gate's routes: ${stray[0]?.detail}`);
    const twice = v41([{ route: 'approved', to: 'work' }, { route: 'approved', to: 'other' }, { route: 'rework', to: 'other' }, { to: 'done' }]);
    ok(twice.length === 1 && twice[0]!.detail.includes('wired by 2 edges'), `a case wired twice: ${twice.map((f) => f.detail).join(' | ')}`);
    // `default` named explicitly IS the default route — so beside an edge with no route it is wired twice.
    equal(v41([{ route: 'approved', to: 'work' }, { route: 'rework', to: 'other' }, { route: 'default', to: 'done' }]), [], 'default named by its route is accepted');
    ok(v41([...SWITCH_EDGES, { route: 'default', to: 'done' }]).some((f) => f.detail.includes('wired by 2 edges')), 'and beside an edge with no route it is wired twice');
    // A case NAME that is a VALUE of another case is no clash: names are routes and values are values.
    equal(findingsAt(switchFlow({ key: 'status', cases: { approved: 'rework', rework: 'approved' } }), 's'), [], 'a case named as another case`s value is accepted');
  });

  test('switch decides over a table of values: ===, "1" against 1, null, absent, a value in an array case, a key that is not a scalar', () => {
    const cases = { num: 1, str: '1', nil: null, yes: true, many: ['a', 'b'], zero: 0 };
    // [label, the resolved key the driver hands fn, the expected route] — P32 decision 5.
    const rows: [string, unknown, string][] = [
      ['1 — the number case', 1, 'num'],
      ['"1" — the string case, not the number', '1', 'str'],
      ['null — the null case, a resolved null is a value', null, 'nil'],
      ['true — the boolean case, not the number 1', true, 'yes'],
      ['"a" — named in an array case', 'a', 'many'],
      ['"b" — the array case`s second value', 'b', 'many'],
      ['0 — the zero case', 0, 'zero'],
      // Reader item R2 (adequacy S26): -0 === 0, so a key of -0 takes the zero case — matching is ===, not Object.is.
      ['-0 — the zero case, since -0 === 0', -0, 'zero'],
      ['false — no case: not 0, no coercion', false, 'default'],
      ['"" — no case: not 0, no coercion', '', 'default'],
      ['an absent key — did not resolve', undefined, 'default'],
      ['2 — matches no case', 2, 'default'],
      ['"c" — matches no case', 'c', 'default'],
      ['["a"] — an array key is not a member of an array case', ['a'], 'default'],
      ['{} — an object key', {}, 'default'],
      ['NaN — equals nothing', NaN, 'default'],
    ];
    const reached = new Set<string>();
    for (const [label, key, expected] of rows) {
      const ctx = ctxOf({ key: 'status', cases }, { status: key }, key);
      equal(SWITCH.fn(ctx), expected, label);
      equal(ctx.memory.size, 0, `${label}: and the memory is untouched — switch reads none (FD-C8)`);
      reached.add(expected);
    }
    equal([...reached].sort(), ['default', 'many', 'nil', 'num', 'str', 'yes', 'zero'], 'every case and default reached by the table');
    // It reads the KEY, which the driver resolved — not the input: a key and an input that disagree follow the key.
    equal(SWITCH.fn(ctxOf({ key: 'status', cases }, { status: 1 }, 'a')), 'many', 'switch matches ctx.key, the library`s resolution, and never re-reads the input');
  });

  test('the wiring check: a switch`s case routes are KEY-RESOLVED along its key and its default is not; an if`s then is NOT refined (W154 Scope/Out)', async () => {
    // The producer DESCRIBES `status` and does not require it; every consumer REQUIRES it — so an arc fits exactly
    // where its route guarantees the key (ADR 0068), and is `no` elsewhere (Q391's shape).
    const open = {
      type: 'object', required: ['name'], properties: { name: { type: 'string' }, status: { type: 'string' } },
      examples: [{ name: 'n', status: 'approved' }],
    } as unknown as JsonSchema;
    const closedWithout = {
      type: 'object', required: ['name'], properties: { name: { type: 'string' } }, additionalProperties: false, examples: [{ name: 'n' }],
    } as unknown as JsonSchema;
    const reg = (producer: JsonSchema) => ({
      workers: { p: { url: 'test://p', outputSchema: producer }, c: { url: 'test://c', inputSchema: { type: 'object', required: ['status'] } } },
      nodeTypes: { P: { worker: 'p' }, C: { worker: 'c' } },
    }) as unknown as Parameters<typeof checkWiring>[0];
    const flow = (gate: Record<string, unknown>, routed: string) => ({
      flowId: 'wire', version: 1, entry: 'produce', nodes: [
        { id: 'produce', kind: 'task', type: 'P', edges: [{ to: 'g' }] },
        { id: 'g', kind: 'gate', ...gate, edges: [{ route: routed, to: 'onRoute' }, { to: 'onDefault' }] },
        { id: 'onRoute', kind: 'task', type: 'C', edges: [{ to: 'done' }] },
        { id: 'onDefault', kind: 'task', type: 'C', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    }) as unknown as FlowDefinition;
    const verdicts = async (producer: JsonSchema, f: FlowDefinition) => {
      const r = await checkWiring(reg(producer), f);
      return Object.fromEntries(['onRoute', 'onDefault'].map((c) => [c, r.verdicts.find((v) => v.consumer === c)!]));
    };
    const sw = { type: 'switch', settings: { key: 'status', cases: { approved: 'approved' } } };
    const s1 = await verdicts(open, flow(sw, 'approved'));
    equal([s1.onRoute!.kind, s1.onDefault!.kind], ['fits', 'no'], `switch: the case route guarantees the key and fits; default does not — ${s1.onDefault!.why}`);
    // The REFUSING direction (W100): a producer that can never emit the key — the case can never be taken.
    const s2 = await verdicts(closedWithout, flow(sw, 'approved'));
    equal(s2.onRoute!.kind, 'no', 'switch over a key the producer FORBIDS: the case arc is no');
    ok(s2.onRoute!.why.includes('gate "g" is keyed on "status"'), `by the key-path reason: ${s2.onRoute!.why}`);
    // `if` makes NO guarantee: its path is inside `when`, not `settings.key` — priced at W154's declaration, not built.
    const iff = { type: 'if', settings: { when: { path: 'input.status', op: 'eq', value: 'approved' } } };
    const i1 = await verdicts(open, flow(iff, 'then'));
    equal([i1.onRoute!.kind, i1.onDefault!.kind], ['no', 'no'], `if: then is NOT refined along its compared path, so a consumer requiring it is no — ${i1.onRoute!.why}`);
  });

  test('switch`s route ORDER is the parsed object`s: integer-like case names first, ascending, then the rest in document order, then default', () => {
    // Reader item R1 (conformity C1): JSON.parse has already lost the document order for integer-like keys, so the
    // spec states the order the PARSED object enumerates — and the routes FD-V41 names follow it. Routing is unaffected.
    const cases = JSON.parse('{"b":"x","404":"y","200":"z"}') as Record<string, unknown>;
    equal(routesOf(SWITCH, { key: 'status', cases }), { routes: ['200', '404', 'b', 'default'], defaultRoute: 'default', keyResolvedRoutes: ['200', '404', 'b'] },
      'the integer-like names 200 and 404 first, ascending, then b, then default');
    const stray = findingsAt(switchFlow({ key: 'status', cases }, [{ route: '200', to: 'work' }, { route: '404', to: 'work' }, { route: 'b', to: 'other' }, { route: 'x', to: 'done' }, { to: 'done' }]), 's');
    ok(stray.length === 1 && stray[0]!.detail.includes('"200", "404", "b", "default"'), `FD-V41 lists the gate's routes in that order: ${stray.map((f) => f.detail).join(' | ')}`);
  });

  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run — it was deleted, renamed, or its suite stopped loading');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name. Add it here in the same commit');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership, which catches a duplicated name');
  });
});
