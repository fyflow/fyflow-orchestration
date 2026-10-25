/**
 * Ladder L2 — **a bracket array INDEX routes a run**: `spec/flow-definition.md` v0.53, section 2's gate KEY PATH and
 * section 3's `when` PATH, resolved by `readKeyPath` where a branch enters a gate and where an edge's `when` is
 * evaluated — [ADR 0137](../../doc/decisions/0137-a-key-path-indexes-an-array-by-a-bracket-suffix-and-a-plain-segment-keeps-its-meaning.md),
 * [W216](../../doc/work-items/w216-a-bracket-array-index-in-a-key-path.md), P44 (c1). No scheduler; L2's usual fake, and
 * every settlement is delivered by this file.
 *
 * **Every expected route is derived by hand from the value this file settles and ADR 0137 rule 2** — `[n]` is element
 * `n` of a real array, and nothing else — never from the driver's output. **Each claim has its CONTROL on the same
 * value**: the plain numeric segment `xs.1`, which keeps its meaning (an own key of a plain object, `undefined` over an
 * array, P44 (c1)), so a driver reading `[1]` as `.1` — or `.1` as `[1]` — takes the other route.
 *
 * | site | the value settled | `…xs[1]` | `…xs.1` (the control) |
 * |---|---|---|---|
 * | a `distinct` gate's key | `{ xs: ['a', 'b'] }` | `'b'` → `first` | `undefined` → `nokey` |
 * | a `switch` gate's key | `{ xs: ['a', 'b'] }` | `'b'` → case `bee` | `undefined` → `default` |
 * | an `if` gate's `when` | `{ xs: ['a', 'b'] }` | `input.xs[1] eq 'b'` holds → `then` | `input.xs.1` absent → `else` |
 * | a task edge's `when` | `{ xs: ['a', 'b'] }` | `outcome.result.xs[1] eq 'b'` holds → that edge | absent → the fallback edge |
 * | a `distinct` gate's key | `{ xs: { 1: 'b' } }` — an OBJECT | `undefined` → `nokey` | `'b'` → `first` |
 * | a `distinct` gate's key | `{ xs: ['a'] }` — one element | `undefined` (past the end) → `nokey` | `undefined` → `nokey` |
 */
import { collected, equal, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { Driver } from '../../src/driver/driver.ts';
import type { DriverOptions, RunFailure } from '../../src/driver/driver.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import { liveToken } from '../../src/fold/policies.ts';

const SUITE = 'L2 — W216, ADR 0137: a bracket array index routes a run — a distinct, a switch, an if and a task edge by xs[1], each beside xs.1';

const DECLARED_CASES = [
  'a distinct gate keyed xs[1] routes by the second element; keyed xs.1 the same value has no key',
  'a switch gate keyed xs[1] takes the second element`s case; keyed xs.1 its default',
  'an if gate on input.xs[1] takes then; on input.xs.1 else',
  'a task edge on outcome.result.xs[1] is taken; on outcome.result.xs.1 the fallback is',
  'over an OBJECT holding "1" the two swap, and past the array`s end both have no key',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

class FakeScheduler {
  readonly added: { id: string; payload: unknown }[] = [];
  private listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void { this.added.push(task as { id: string; payload: unknown }); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  done(id: string, result: unknown): void {
    const detail = { id, state: 'done', attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, result, error: null };
    for (const fn of this.listeners.get('task.completed') ?? []) fn({ detail });
  }
}

const TYPES = typesFor(['Work', 'OnA', 'OnB', 'OnC']);

/**
 * Run `flow` with `first` settling `result`, and return the node id of every task dispatched AFTER it — the route the
 * run took, read off the scheduler — and any run failure.
 */
function routeOf(flow: FlowDefinition, result: unknown): { after: string[]; failures: RunFailure[] } {
  const scheduler = new FakeScheduler();
  const failures: RunFailure[] = [];
  const driver = new Driver(flow, {
    runId: 'R', scheduler, createTask: (c) => c, predicates: new Map(), ...TYPES,
    joinPolicy: liveToken as unknown as JoinPolicy, now: () => 0,
    onRunFailure: (f) => failures.push(f),
  } as DriverOptions);
  driver.start({});
  scheduler.done('R:first:-:0', result);
  return { after: scheduler.added.map((t) => t.id).filter((id) => id !== 'R:first:-:0').map((id) => id.split(':')[1]!), failures };
}

const tail = [
  { id: 'onA', kind: 'task', type: 'OnA', edges: [{ to: 'done' }] },
  { id: 'onB', kind: 'task', type: 'OnB', edges: [{ to: 'done' }] },
  { id: 'onC', kind: 'task', type: 'OnC', edges: [{ to: 'done' }] },
  { id: 'done', kind: 'end', outcome: 'completed' },
];
const distinctFlow = (key: string) => ({
  flowId: 'd', version: 1, entry: 'first', nodes: [
    { id: 'first', kind: 'task', type: 'Work', edges: [{ to: 'g' }] },
    { id: 'g', kind: 'gate', type: 'distinct', settings: { key }, edges: [{ to: 'onA' }, { route: 'duplicate', to: 'onB' }, { route: 'nokey', to: 'onC' }] },
    ...tail,
  ],
}) as unknown as FlowDefinition;
const switchFlow = (key: string) => ({
  flowId: 's', version: 1, entry: 'first', nodes: [
    { id: 'first', kind: 'task', type: 'Work', edges: [{ to: 'g' }] },
    { id: 'g', kind: 'gate', type: 'switch', settings: { key, cases: { ay: 'a', bee: 'b' } }, edges: [{ route: 'ay', to: 'onA' }, { route: 'bee', to: 'onB' }, { to: 'onC' }] },
    ...tail,
  ],
}) as unknown as FlowDefinition;
const ifFlow = (path: string) => ({
  flowId: 'i', version: 1, entry: 'first', nodes: [
    { id: 'first', kind: 'task', type: 'Work', edges: [{ to: 'g' }] },
    { id: 'g', kind: 'gate', type: 'if', settings: { when: { path, op: 'eq', value: 'b' } }, edges: [{ route: 'then', to: 'onA' }, { to: 'onB' }] },
    ...tail.filter((n) => n.id !== 'onC'),
  ],
}) as unknown as FlowDefinition;
const edgeFlow = (path: string) => ({
  flowId: 'e', version: 1, entry: 'first', nodes: [
    { id: 'first', kind: 'task', type: 'Work', edges: [{ to: 'onA', when: { path, op: 'eq', value: 'b' } }, { to: 'onB' }] },
    ...tail.filter((n) => n.id !== 'onC'),
  ],
}) as unknown as FlowDefinition;

const TWO = { xs: ['a', 'b'] };

suite(SUITE, (test) => {
  test('a distinct gate keyed xs[1] routes by the second element; keyed xs.1 the same value has no key', () => {
    equal(routeOf(distinctFlow('xs[1]'), TWO), { after: ['onA'], failures: [] }, 'xs[1] over ["a","b"] is "b": first, so onA');
    equal(routeOf(distinctFlow('xs.1'), TWO), { after: ['onC'], failures: [] }, 'xs.1 over the same array is undefined: nokey, so onC');
    equal(routeOf(distinctFlow('xs[0]'), TWO), { after: ['onA'], failures: [] }, 'xs[0] is "a", a key too: first');
  });

  test('a switch gate keyed xs[1] takes the second element`s case; keyed xs.1 its default', () => {
    equal(routeOf(switchFlow('xs[1]'), TWO).after, ['onB'], 'xs[1] is "b": case bee, so onB — not ay, which xs[0] would take');
    equal(routeOf(switchFlow('xs[0]'), TWO).after, ['onA'], 'xs[0] is "a": case ay, so onA — the two indexes are told apart');
    equal(routeOf(switchFlow('xs.1'), TWO).after, ['onC'], 'xs.1 is undefined: default, so onC');
  });

  test('an if gate on input.xs[1] takes then; on input.xs.1 else', () => {
    equal(routeOf(ifFlow('input.xs[1]'), TWO).after, ['onA'], 'input.xs[1] eq "b" holds: then, so onA');
    equal(routeOf(ifFlow('input.xs.1'), TWO).after, ['onB'], 'input.xs.1 is absent, and absent is no match: else, so onB');
    equal(routeOf(ifFlow('input.xs[0]'), TWO).after, ['onB'], 'input.xs[0] is "a", not "b": else — the index chose the element');
  });

  test('a task edge on outcome.result.xs[1] is taken; on outcome.result.xs.1 the fallback is', () => {
    equal(routeOf(edgeFlow('outcome.result.xs[1]'), TWO).after, ['onA'], 'outcome.result.xs[1] eq "b" holds: the first edge, onA');
    equal(routeOf(edgeFlow('outcome.result.xs.1'), TWO).after, ['onB'], 'outcome.result.xs.1 is absent: the fallback, onB');
  });

  test('over an OBJECT holding "1" the two swap, and past the array`s end both have no key', () => {
    const obj = { xs: { 1: 'b' } };
    equal(routeOf(distinctFlow('xs[1]'), obj).after, ['onC'], 'xs[1] over an OBJECT is undefined — an index reads a real array only: nokey');
    equal(routeOf(distinctFlow('xs.1'), obj).after, ['onA'], 'xs.1 over that object is its own key "1": "b", first');
    const one = { xs: ['a'] };
    equal(routeOf(distinctFlow('xs[1]'), one).after, ['onC'], 'xs[1] past a one-element array is undefined: nokey');
    equal(routeOf(distinctFlow('xs.1'), one).after, ['onC'], 'and xs.1 over it is undefined too');
  });

  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    const ran = collected().filter((x) => x.suite === SUITE).flatMap((x) => x.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
