/**
 * Ladder L2 — **the built-in `if` and `switch` in a run** — `spec/flow-definition.md` v0.31 (section 2's gate and
 * its built-in table, `FD-C8`, `FD-R4` through an entry gate, `FD-V41`),
 * [P32](../../doc/plans/p32-what-a-gate-may-decide-without-memory.md) decisions 4-6,
 * [W154](../../doc/work-items/w154-the-built-in-if-and-switch.md). No scheduler; L2's fake, and every settlement is
 * delivered by this file.
 *
 * **No predicate and no gate type is registered anywhere in this file** — `predicates` is an empty `Map` and
 * `gateTypes` is never passed — which is P32's question: *with no worker before the decision and no code
 * registered for it*. Every expected route is read from P32 decisions 4 and 5 and section 3's `when` text over the
 * value this file delivers, never from the driver's output.
 */
import { collected, equal, ok, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { BoundaryRefused, Driver, InvalidDefinition } from '../../src/driver/driver.ts';
import type { DriverOptions, RunFailure } from '../../src/driver/driver.ts';
import type { FlowDefinition, WorkerEntry } from '../../src/definition/types.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import { fold, type FoldInput } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';

const SUITE = 'W154 — the built-in if and switch in a run: every route taken, FD-R4 through an entry if, no memory, no code registered';

class FakeScheduler {
  readonly added: { id: string; payload: unknown }[] = [];
  private listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void { this.added.push(task as { id: string; payload: unknown }); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  settle(id: string, result: unknown): void {
    const detail = { id, state: 'done', attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, result, error: null };
    for (const fn of this.listeners.get('task.completed') ?? []) fn({ detail });
  }
}

const TYPES = typesFor(['Ingest', 'Check', 'Work', 'Other', 'Publish', 'Revise', 'Review', 'Numeric', 'Textual']);

function harness(flow: FlowDefinition, extra: Partial<DriverOptions> = {}) {
  const scheduler = new FakeScheduler();
  const failures: RunFailure[] = [];
  const driver = new Driver(flow, {
    runId: 'R', scheduler, createTask: (c) => c, predicates: new Map(), ...TYPES,
    joinPolicy: liveToken as unknown as JoinPolicy, now: () => 0,
    onRunFailure: (f) => failures.push(f),
    ...extra,
  } as DriverOptions);
  return {
    scheduler, driver, failures,
    ids: () => scheduler.added.map((t) => t.id),
    inputOf: (id: string) => (scheduler.added.find((t) => t.id === id)?.payload as { input?: unknown } | undefined)?.input,
    gated: () => driver.foldInputs().filter((i): i is Extract<FoldInput, { kind: 'gated' }> => i.kind === 'gated'),
  };
}

/** P32 decision 4's own example as the ENTRY: `then` to `escalate`, the default `else` to `queue`. */
const ENTRY_IF = {
  flowId: 'triage', version: 1, entry: 'triage', nodes: [
    { id: 'triage', kind: 'gate', type: 'if', settings: { when: { path: 'input.priority', op: 'gte', value: 5 } },
      edges: [{ route: 'then', to: 'escalate' }, { to: 'queue' }] },
    { id: 'escalate', kind: 'task', type: 'Work', edges: [{ to: 'done' }] },
    { id: 'queue', kind: 'task', type: 'Other', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/** P32 decision 5's example AFTER a task, with two more cases — `1` and `"1"` — so the strict match has a pair to tell apart. */
const SWITCH_CASES = { approved: 'approved', rework: ['rejected', 'needs-changes'], numeric: 1, textual: '1' };
const AFTER_SWITCH = (cases: Record<string, unknown> = SWITCH_CASES, edges?: unknown[]) => ({
  flowId: 'by-status', version: 1, entry: 'check', nodes: [
    { id: 'check', kind: 'task', type: 'Check', edges: [{ to: 'byStatus' }] },
    { id: 'byStatus', kind: 'gate', type: 'switch', settings: { key: 'status', cases }, edges: edges ?? [
      { route: 'approved', to: 'publish' }, { route: 'rework', to: 'revise' },
      { route: 'numeric', to: 'numeric' }, { route: 'textual', to: 'textual' }, { to: 'review' }] },
    { id: 'publish', kind: 'task', type: 'Publish', edges: [{ to: 'done' }] },
    { id: 'revise', kind: 'task', type: 'Revise', edges: [{ to: 'done' }] },
    { id: 'numeric', kind: 'task', type: 'Numeric', edges: [{ to: 'done' }] },
    { id: 'textual', kind: 'task', type: 'Textual', edges: [{ to: 'done' }] },
    { id: 'review', kind: 'task', type: 'Review', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
}) as unknown as FlowDefinition;

const DECLARED_CASES: readonly string[] = [
  'an ENTRY if routes the payload: then and else each taken, the else by the edge with no route, and what left is what arrived',
  'a switch after a task routes its result: every case and default taken, "1" and 1 two routes, a value named in an array case',
  'FD-R4 through an ENTRY if holds the payload to the target the if CHOOSES, and to no other',
  'a switch case left unwired is refused at construction by FD-V41, naming the case',
  'no memory: two branches with one key take the SAME route at a switch, where distinct sends the second to duplicate',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test('an ENTRY if routes the payload: then and else each taken, the else by the edge with no route, and what left is what arrived', () => {
    // [payload, the expected target, the expected route] — `gte 5`, P32 decision 4; absent is no match (section 3).
    const rows: [unknown, string, string][] = [
      [{ priority: 7, id: 'a' }, 'escalate', 'then'],
      [{ priority: 5, id: 'b' }, 'escalate', 'then'],
      [{ priority: 4, id: 'c' }, 'queue', 'else'],
      [{ priority: '9', id: 'd' }, 'queue', 'else'],
      [{ id: 'e' }, 'queue', 'else'],
    ];
    for (const [payload, target, route] of rows) {
      const h = harness(ENTRY_IF);
      h.driver.start(payload);
      equal(h.ids(), [`R:${target}:-:0`], `${JSON.stringify(payload)}: ${route}, so ${target} and nothing else`);
      equal(h.inputOf(`R:${target}:-:0`), payload, 'carrying exactly what reached the gate');
      // An `if` declares no `key`, so the recorded decision carries none (section 2: absent where the gate declares no key).
      equal(h.gated().map((g) => [g.gateId, g.route, 'key' in g]), [['triage', route, false]], 'the decision recorded, with its route and no key');
      equal(h.failures, [], 'nothing reported');
      h.scheduler.settle(`R:${target}:-:0`, {});
      equal(fold(h.driver.foldInputs()).outcome, 'completed', 'and the run completes');
    }
  });

  test('a switch after a task routes its result: every case and default taken, "1" and 1 two routes, a value named in an array case', () => {
    // [the task's result, the expected route, the expected target] — P32 decision 5: `===` on the resolved key, a
    // key that does not resolve or matches no case is `default`, carried by the edge with no route.
    const rows: [unknown, string, string][] = [
      [{ status: 'approved' }, 'approved', 'publish'],
      [{ status: 'rejected' }, 'rework', 'revise'],
      [{ status: 'needs-changes' }, 'rework', 'revise'],
      [{ status: 1 }, 'numeric', 'numeric'],
      [{ status: '1' }, 'textual', 'textual'],
      [{ status: 'pending' }, 'default', 'review'],
      [{ status: true }, 'default', 'review'],
      [{ status: null }, 'default', 'review'],
      [{}, 'default', 'review'],
      [{ status: { nested: 'approved' } }, 'default', 'review'],
    ];
    const taken = new Set<string>();
    for (const [result, route, target] of rows) {
      const h = harness(AFTER_SWITCH());
      h.driver.start({});
      h.scheduler.settle('R:check:-:0', result);
      equal(h.ids(), ['R:check:-:0', `R:${target}:-:0`], `${JSON.stringify(result)}: ${route}, so ${target}`);
      equal(h.inputOf(`R:${target}:-:0`), result, 'carrying exactly what reached the gate — the task`s result');
      equal(h.gated().map((g) => [g.gateId, g.route]), [['byStatus', route]], 'the decision recorded with its route');
      equal(h.failures, [], 'nothing reported');
      taken.add(route);
    }
    equal([...taken].sort(), ['approved', 'default', 'numeric', 'rework', 'textual'], 'every route of the gate taken, by exactly the results above');
  });

  test('FD-R4 through an ENTRY if holds the payload to the target the if CHOOSES, and to no other', () => {
    // `escalate`'s worker requires `owner`; `queue`'s requires `fixme`. A payload the if routes `then` is held to
    // `escalate` alone and one it routes `else` to `queue` alone — so each refusal NAMES the chosen target.
    const workers: Record<string, WorkerEntry> = {
      work: { url: 'test://work', inputSchema: { type: 'object', required: ['priority', 'owner'] } },
      fix: { url: 'test://fix', inputSchema: { type: 'object', required: ['fixme'] } },
    };
    const types = typesFor([], { Work: { worker: 'work' }, Other: { worker: 'fix' } }, workers);
    const start = (payload: unknown) => {
      const h = harness(ENTRY_IF, types);
      let err: unknown;
      try { h.driver.start(payload); } catch (e) { err = e; }
      return { h, err };
    };
    const thenOk = start({ priority: 7, owner: 'o' });
    equal([thenOk.err, thenOk.h.ids()], [undefined, ['R:escalate:-:0']], 'then, and escalate accepts it: started — queue, which would refuse it, never held it');
    const elseOk = start({ priority: 1, fixme: true });
    equal([elseOk.err, elseOk.h.ids()], [undefined, ['R:queue:-:0']], 'else, and queue accepts it: started — escalate, which would refuse it, never held it');
    const thenBad = start({ priority: 7 });
    ok(thenBad.err instanceof BoundaryRefused && (thenBad.err as BoundaryRefused).nodeId === 'escalate', `then, held to escalate and refused naming it: ${String(thenBad.err)}`);
    const elseBad = start({ priority: 1, owner: 'o' });
    ok(elseBad.err instanceof BoundaryRefused && (elseBad.err as BoundaryRefused).nodeId === 'queue', `else, held to queue and refused naming it — not escalate, which it fits: ${String(elseBad.err)}`);
    equal([thenBad.h.ids(), elseBad.h.ids()], [[], []], 'a refused start dispatches nothing');
  });

  test('a switch case left unwired is refused at construction by FD-V41, naming the case', () => {
    let err: unknown;
    try {
      harness(AFTER_SWITCH(SWITCH_CASES, [{ route: 'approved', to: 'publish' }, { route: 'numeric', to: 'numeric' }, { route: 'textual', to: 'textual' }, { to: 'review' }]));
    } catch (e) { err = e; }
    ok(err instanceof InvalidDefinition && (err as InvalidDefinition).rules.includes('FD-V41'), `refused at construction, FD-V41: ${String(err)}`);
    ok(String(err).includes('"rework"'), `naming the forgotten case: ${String(err)}`);
    // The CONTROL: the same document with the case wired constructs.
    const h = harness(AFTER_SWITCH());
    equal(h.failures, [], 'every case wired: it constructs');
  });

  test('no memory: two branches with one key take the SAME route at a switch, where distinct sends the second to duplicate', () => {
    // A map over two items whose `check` both return status `approved`. A switch has no memory (P32 decision 1,
    // FD-C8): both branches route `approved`. The PAIR: `distinct` at the same place, same key, routes the second
    // `duplicate` — so the difference is the type's memory and nothing else in the fixture.
    const mapped = (gate: Record<string, unknown>) => ({
      flowId: 'mapped', version: 1, entry: 'ingest', nodes: [
        { id: 'ingest', kind: 'task', type: 'Ingest', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'map', over: 'items', branch: 'check' },
        { id: 'check', kind: 'task', type: 'Check', edges: [{ to: 'g' }] },
        { id: 'g', kind: 'gate', ...gate },
        { id: 'ok', kind: 'task', type: 'Work', edges: [{ to: 'collect' }] },
        { id: 'dropped', kind: 'end', outcome: 'dropped' },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    }) as unknown as FlowDefinition;
    const run = (gate: Record<string, unknown>) => {
      const h = harness(mapped(gate));
      h.driver.start({});
      h.scheduler.settle('R:ingest:-:0', { items: [{ n: 0 }, { n: 1 }] });
      h.scheduler.settle('R:check:0:0', { status: 'approved' });
      h.scheduler.settle('R:check:1:0', { status: 'approved' });
      return h.gated().map((d) => d.route);
    };
    equal(run({ type: 'switch', settings: { key: 'status', cases: { approved: 'approved' } }, edges: [{ route: 'approved', to: 'ok' }, { to: 'dropped' }] }),
      ['approved', 'approved'], 'switch: the same key, the same route, both times');
    equal(run({ type: 'distinct', settings: { key: 'status' }, edges: [{ to: 'ok' }, { route: 'duplicate', to: 'dropped' }, { route: 'nokey', to: 'dropped' }] }),
      ['first', 'duplicate'], 'the PAIR — distinct remembers, so the second is duplicate');
  });

  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run — it was deleted, renamed, or its suite stopped loading');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name. Add it here in the same commit');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership, which catches a duplicated name');
  });
});
