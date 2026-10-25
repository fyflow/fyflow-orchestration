/**
 * Ladder L2 — **a comparison's `valueFrom` ROUTES a run, with no predicate registered at all** — `spec/flow-definition.md`
 * v0.55 (section 3's `when` subsection, `FD-C7`'s L2 clause, `FD-C3`),
 * [ADR 0140](../../doc/decisions/0140-a-comparison-may-compare-against-another-key-path-and-an-absent-one-is-no-match.md),
 * P45 (a1), (b1), [W221](../../doc/work-items/w221-a-comparisons-value-from.md).
 *
 * **Pass 6's own flow** (fyflow-app's request #1): `sizeLimit` works out a limit, `stat` a size, and `stat`'s edge to `copy`
 * compares `outcome.result.size lte needs.limit.max` — the edge declaring `needs: { limit: "sizeLimit" }` — with a default
 * edge to `skip`. Each road is asserted as the DRIVER's dispatch, beside its CONTROL: the same comparison against the
 * literal `max` routing the same way, and a `valueFrom` naming an absent key (`needs.limit.nope`) taking the default where
 * the size is below the max. And an entry `if` comparing `input.a` against `input.b` both ways, its control an absent
 * `input.b`. Every expected road is the item file's, derived by hand from section 3's sentences before the first run.
 */
import { collected, equal, ok, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { Driver } from '../../src/driver/driver.ts';
import { fold } from '../../src/fold/run-state.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import type { Predicate } from '../../src/driver/routing.ts';

const SUITE = 'L2 — W221, P45 (a1) (b1): a comparison`s valueFrom routes a run — pass 6`s size against its limit both ways, an if on input.a against input.b, no predicate registered';

const DECLARED_CASES = [
  'pass 6`s flow: size lte needs.limit.max takes copy at and below the max and skip above it — the literal max routing the same way',
  'an absent valueFrom takes the default edge where the size is below the max — needs.limit.nope, and a limit with no max',
  'an entry if on input.a lt input.b: then and else on two payloads, else where input.b is absent or not a number',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

class FakeScheduler {
  readonly added: { id: string; payload?: unknown }[] = [];
  private readonly listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  addTask(t: { id: string; payload?: unknown }): void { this.added.push(t); }
  settle(id: string, result: unknown): void {
    const detail = { id, state: 'done', result, attempts: 0, timestamp: 1_000 };
    for (const fn of this.listeners.get('task.completed') ?? []) fn({ detail });
  }
}

const TYPES = typesFor(['Limit', 'StatPath', 'Copy', 'Skip', 'Work']);
/** The EMPTY predicate registry — the claim is that a `valueFrom` routes on data alone. */
const NO_PREDICATES: ReadonlyMap<string, Predicate> = new Map<string, Predicate>();

const driverFor = (def: FlowDefinition, scheduler: FakeScheduler) => new Driver(def, {
  runId: 'r1', scheduler, createTask: (c: unknown) => c, predicates: NO_PREDICATES, ...TYPES,
} as unknown as ConstructorParameters<typeof Driver>[1]);

/** Pass 6's flow, its guarded edge's right side given. */
const pass6 = (right: Record<string, unknown>): FlowDefinition => ({
  flowId: 'pass6', version: 1, entry: 'sizeLimit',
  nodes: [
    { id: 'sizeLimit', kind: 'task', type: 'Limit', edges: [{ to: 'stat' }] },
    { id: 'stat', kind: 'task', type: 'StatPath', edges: [
      { when: { path: 'outcome.result.size', op: 'lte', ...right }, needs: { limit: 'sizeLimit' }, to: 'copy' },
      { to: 'skip' },
    ] },
    { id: 'copy', kind: 'task', type: 'Copy', edges: [{ to: 'done' }] },
    { id: 'skip', kind: 'task', type: 'Skip', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition);

/** Run pass 6's flow: the limit settles `limit`, the stat `stat`; the road is the third task dispatched. */
function road(def: FlowDefinition, limit: unknown, stat: unknown): string {
  const scheduler = new FakeScheduler();
  driverFor(def, scheduler).start({});
  scheduler.settle('r1:sizeLimit:-:0', limit);
  scheduler.settle('r1:stat:-:0', stat);
  const nodes = scheduler.added.map((t) => t.id.split(':')[1]!);
  equal(nodes.slice(0, 2), ['sizeLimit', 'stat'], 'the two producers ran first');
  return nodes[2] ?? '(nothing)';
}

const FROM = pass6({ valueFrom: 'needs.limit.max' });

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, () => {
    ok(NO_PREDICATES.size === 0, 'the predicate registry is empty');
    const LITERAL = pass6({ value: 100 });
    // [size, the road] with max 100 — and the literal 100 the same road (the control).
    const ROWS: [number, string][] = [[50, 'copy'], [100, 'copy'], [150, 'skip']];
    for (const [size, want] of ROWS) {
      equal(road(FROM, { max: 100 }, { size }), want, `size ${size} against needs.limit.max 100: ${want}`);
      equal(road(LITERAL, { max: 100 }, { size }), want, `and against the literal 100: ${want}`);
    }
    // The LIMIT is read from the run, not fixed: the same size against another max takes the other road.
    equal(road(FROM, { max: 40 }, { size: 50 }), 'skip', 'size 50 against max 40: skip — the right side moved with the run');
    equal(road(LITERAL, { max: 40 }, { size: 50 }), 'copy', 'while the literal 100 still copies — the pair that tells the two apart');
  });

  test(DECLARED_CASES[1]!, () => {
    equal(road(pass6({ valueFrom: 'needs.limit.nope' }), { max: 100 }, { size: 50 }), 'skip',
      'needs.limit.nope does not resolve: no match, so the default edge, where size 50 is below max 100');
    equal(road(FROM, {}, { size: 50 }), 'skip', 'a limit with no max: no match — skip');
    equal(road(FROM, { max: '100' }, { size: 50 }), 'skip', 'a max that is a string: no match — type-strict, skip');
    equal(road(FROM, { max: { v: 100 } }, { size: 50 }), 'skip', 'a max that is an object: no match — skip');
    // The CONTROL: the same run with the max present copies — the four above are not an evaluator that says no to all.
    equal(road(FROM, { max: 100 }, { size: 50 }), 'copy', 'with max 100 present: copy');
  });

  test(DECLARED_CASES[2]!, () => {
    const def = {
      flowId: 'ab', version: 1, entry: 'check',
      nodes: [
        { id: 'check', kind: 'gate', type: 'if', settings: { when: { path: 'input.a', op: 'lt', valueFrom: 'input.b' } },
          edges: [{ route: 'then', to: 'yes' }, { to: 'no' }] },
        { id: 'yes', kind: 'task', type: 'Work', edges: [{ to: 'done' }] },
        { id: 'no', kind: 'task', type: 'Work', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const routed = (payload: unknown): string => {
      const scheduler = new FakeScheduler();
      const d = driverFor(def, scheduler);
      d.start(payload);
      const gated = fold(d.foldInputs()).gated.map((g) => g.route);
      return `${gated.join()}:${scheduler.added.map((t) => t.id.split(':')[1]).join()}`;
    };
    equal(routed({ a: 1, b: 2 }), 'then:yes', '1 lt 2: then');
    equal(routed({ a: 3, b: 2 }), 'else:no', '3 lt 2: else');
    equal(routed({ a: 2, b: 2 }), 'else:no', '2 lt 2: else — the boundary');
    equal(routed({ a: 1 }), 'else:no', 'input.b absent: else');
    equal(routed({ a: 1, b: '2' }), 'else:no', 'input.b a string: else — type-strict');
  });

  test(DECLARED_CASES[3]!, () => {
    const ran = collected().filter((x) => x.suite === SUITE).flatMap((x) => x.cases.map((c) => c.name)).sort();
    equal(ran, [...DECLARED_CASES].sort(), 'every declared case ran, and no other');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
