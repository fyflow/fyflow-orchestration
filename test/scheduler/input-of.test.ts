/**
 * Ladder L1 — **`handle.inputOf`: what a node of a LIVE run was handed** — `RN-R45`, `RN-R25` v0.34,
 * [ADR 0128](../../doc/decisions/0128-what-a-node-was-handed-is-read-by-replaying-the-run-to-its-composition.md),
 * [W205](../../doc/work-items/w205-what-a-node-was-handed-read-by-replaying-the-run.md) under
 * [P42](../../doc/plans/p42-what-a-node-was-handed-asked-after-the-fact.md) decision 7.
 *
 * `RunHandle.inputOf(target)` is the root export `inputOf` over the run's own `driver.checkpoint()`, with the registry
 * and the join policy the runtime built the run's driver with. **Every expected value comes from a second route**: the
 * caller's own call of the export over the caller's own `checkpoint()` (P42 decision 7: *one function, so a live answer
 * and a stored one cannot differ*), and the envelope the run handed the scheduler double — beside a write and a walk
 * that show the reading reaches nothing the live run holds.
 */
import { collected, deepEqual, equal, ok, suite } from '../harness.ts';
import { createRuntime } from '../../src/scheduler/runtime.ts';
import type { RunHandle } from '../../src/scheduler/runtime.ts';
import { inputOf, type InputOfOptions, type InputTarget } from '../../src/driver/driver.ts';
import { liveToken } from '../../src/fold/policies.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition, RegistryDocument } from '../../src/definition/types.ts';
import type { FoldInput } from '../../src/fold/run-state.ts';

const SUITE = 'L1 — RN-R45, RN-R25: handle.inputOf — the export over the run`s own checkpoint at every quiescent point, on start, on resume and once released; the live run read and never reached';

const DOCUMENT = {
  workers: { w: { url: 'https://example.test/w.js' } },
  nodeTypes: { T: { worker: 'w', inline: true } },
  predicates: [],
} as unknown as RegistryDocument;

/** A MAP nested in a fan-out branch, with a `needs` read after it — dotted paths, both region kinds, a composed input. */
const NESTED = {
  flowId: 'nest', version: 1, entry: 'a',
  nodes: [
    { id: 'a', kind: 'task', type: 'T', needs: { run: '$payload', it: '.' }, edges: [{ to: 'split' }] },
    { id: 'split', kind: 'fanout', branches: ['pre', 'plain'] },
    { id: 'pre', kind: 'task', type: 'T', edges: [{ to: 'm' }] },
    { id: 'm', kind: 'map', over: 'items', branch: 'item' },
    { id: 'item', kind: 'task', type: 'T', edges: [{ to: 'mj' }] },
    { id: 'mj', kind: 'join', of: 'm', edges: [{ to: 'j' }] },
    { id: 'plain', kind: 'task', type: 'T', edges: [{ to: 'j' }] },
    { id: 'j', kind: 'join', of: 'split', edges: [{ to: 'last' }] },
    { id: 'last', kind: 'task', type: 'T', needs: { a: 'a', all: ['item?'] }, edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/** The seams: pools and the scheduler recorded rather than built (`live-state.test.ts`'s shape). */
function seams() {
  const added: { id: string; payload: unknown }[] = [];
  const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  const fire = (type: string, detail: unknown) => { for (const fn of listeners.get(type) ?? []) fn({ detail }); };
  const settle = (id: string, result: unknown) =>
    fire('task.completed', { id, state: 'done', result, error: null, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 });
  const createPool = (url: string, options: unknown) => ({ url, options }) as never;
  const createScheduler = (p: Record<string, unknown>, g: Record<string, unknown>) => ({
    workerPools: p, groups: g,
    addTask(t: unknown) { added.push(structuredClone(t as { id: string; payload: unknown })); },
    addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
    cancel() { return Promise.resolve(true); },
    shutdown() { return Promise.resolve(); },
  }) as never;
  return { added, settle, createPool, createScheduler };
}
type Seams = ReturnType<typeof seams>;
const runtimeOn = (s: Seams) => createRuntime(DOCUMENT, {}, { createPool: s.createPool, createScheduler: s.createScheduler, validateBoundaries: false });

/** One macrotask turn: every microtask queued before it — `done`'s predicate — has run. */
const turn = () => new Promise<void>((res) => setTimeout(res, 0));

/** What each task returns — `pre` the map's items. */
const RESULT = (id: string) => (id.includes(':pre:') ? { items: ['x', 'y', 'z'] } : { by: id });

/**
 * Every target the flow can be asked — each node by id alone, each path an answer named, each dispatched task by id —
 * answered by the handle and by the caller's own call of the export over its own checkpoint, compared by value.
 */
function compareAll(h: RunHandle, opts: InputOfOptions, at: string): number {
  const cp = h.driver.checkpoint();
  let n = 0;
  const targets: InputTarget[] = [];
  for (const node of NESTED.nodes) targets.push({ nodeId: node.id });
  for (const e of cp.events) if (e.kind === 'dispatched') targets.push({ taskId: e.taskId });
  for (const t of targets) {
    const live = h.inputOf(t);
    const own = inputOf(NESTED, opts, cp, t);
    ok(deepEqual(live, own), `${at}: ${JSON.stringify(t)} — the handle and the export over the checkpoint differ`);
    if (live.ok) for (const i of live.inputs) {
      const byPath = h.inputOf({ nodeId: i.nodeId, branchPath: i.branchPath });
      ok(byPath.ok && deepEqual(byPath.inputs, [i]), `${at}: ${i.nodeId}@${i.branchPath} by its path`);
    }
    n += 1;
  }
  return n;
}

const OPTS: InputOfOptions = { predicates: new Map(), workers: { w: { url: 'https://example.test/w.js' } }, nodeTypes: { T: { worker: 'w', inline: true } }, joinPolicy: liveToken as JoinPolicy, validateBoundaries: false };

const DECLARED_CASES = [
  'handle.inputOf equals the export over the run`s own checkpoint at EVERY quiescent point — every node by id, every path, every dispatched task — every task`s answer the envelope the scheduler was handed, and the run`s own join policy read',
  'on a RESUMED run and on a RELEASED one (done settled): the same function over the same events, the same answers',
  'a reading only READS the live run: nothing appended, no callback, no object of the run reachable from an answer, and a write into an answer moves nothing the run holds',
  'the cases above are exactly the cases declared',
] as const;

suite(SUITE, (test) => {
  test(DECLARED_CASES[0], async () => {
    const s = seams();
    const rt = runtimeOn(s);
    const h = rt.start(NESTED, { tenant: 't1' });
    let points = 0, compared = 0;
    for (let q = 0; q < 200; q += 1) {
      await turn();
      compared += compareAll(h, OPTS, `quiescent point ${points}`);
      points += 1;
      const open = s.added.filter((t) => !h.driver.checkpoint().events.some((e) => e.kind === 'outcome' && e.record.taskId === t.id));
      if (open.length === 0) break;
      s.settle(open[0]!.id, RESULT(open[0]!.id));
    }
    equal((await h.done).outcome, 'completed', 'the run completed');
    // Every task the scheduler was handed: its answer is the payload it was handed.
    for (const t of s.added) {
      const r = h.inputOf({ taskId: t.id });
      ok(r.ok && deepEqual(r.inputs[0]!.value, t.payload), `${t.id}: the handle's answer is the envelope the scheduler was handed`);
    }
    equal(s.added.length, 7, 'every task the flow dispatches was handed on: a, pre, plain, three items and last');
    equal(points, 8, `the start and each of the seven settlements is a quiescent point (${compared} targets compared)`);

    // **The run's OWN join policy reaches the reading** — a run started with a policy that fires on the FIRST arrival:
    // read with `liveToken` instead, its early `joinSettled` would not regenerate, and the reading would be refused.
    const FIRST: JoinPolicy<{ fired: boolean }> = {
      id: 'first-arrival', open: () => ({ fired: false }),
      step: (st, e) => (e.type === 'branch.arrived' ? { fired: true } : st),
      status: (st) => (st.fired ? 'satisfied' : 'waiting'), describe: (st) => ({ fired: st.fired }),
    };
    const s3 = seams();
    const h3 = runtimeOn(s3).start(NESTED, { tenant: 't1' }, { joinPolicy: FIRST as JoinPolicy });
    for (const id of ['r1:a:-:0', 'r1:plain:1:0']) s3.settle(id, RESULT(id));
    await turn();
    equal(h3.inputOf({ nodeId: 'j', branchPath: '-' }), { ok: true, inputs: [{ nodeId: 'j', kind: 'join', branchPath: '-', handed: 'collection', value: { 1: RESULT('r1:plain:1:0') } }] },
      'the join fired on plain`s arrival alone — by hand — and the handle reads it, so the reading was built with the run`s policy');
    const withLiveToken = inputOf(NESTED, OPTS, h3.driver.checkpoint(), { nodeId: 'j', branchPath: '-' });
    ok(!withLiveToken.ok && withLiveToken.reason === 'diverged', 'the control: the same checkpoint read with liveToken is refused diverged');

    // **The run's PREDICATES and GATE TYPES reach the reading too** (W205's adequacy reader, finding 5): a decision on a
    // registered predicate into a gate of a CODE gate type — read through the handle, the gate answered with what reached it.
    const routed = { flowId: 'routed', version: 1, entry: 'a', nodes: [
      { id: 'a', kind: 'task', type: 'T', edges: [{ when: { predicate: 'big' }, to: 'g' }, { to: 'small' }] },
      { id: 'g', kind: 'gate', type: 'pick', edges: [{ to: 'done' }, { route: 'other', to: 'small' }] },
      { id: 'small', kind: 'end', outcome: 'small' },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ] } as unknown as FlowDefinition;
    const s4 = seams();
    const rt4 = createRuntime({ ...DOCUMENT, predicates: ['big'] } as unknown as RegistryDocument,
      { predicates: { big: (ctx: { outcome: { result: unknown } }) => (ctx.outcome.result as { n: number }).n > 5 }, gateTypes: { pick: { routes: ['main', 'other'], defaultRoute: 'main', fn: () => 'main' } } } as never,
      { createPool: s4.createPool, createScheduler: s4.createScheduler, validateBoundaries: false });
    const h4 = rt4.start(routed, {});
    s4.settle('r1:a:-:0', { n: 9 });
    await turn();
    equal(h4.inputOf({ nodeId: 'g', branchPath: '-' }), { ok: true, inputs: [{ nodeId: 'g', kind: 'gate', branchPath: '-', handed: 'received', value: { n: 9 } }] },
      'the gate the registered predicate routed into, read through the handle — built with the run`s predicates and gate types');
  });

  test(DECLARED_CASES[1], async () => {
    const s = seams();
    const rt = runtimeOn(s);
    const h = rt.start(NESTED, { tenant: 't1' });
    await turn();
    s.settle('r1:a:-:0', RESULT('r1:a:-:0'));
    s.settle('r1:pre:0:0', RESULT('r1:pre:0:0'));
    await turn();
    const cp = h.driver.checkpoint();
    // RESUMED on a fresh runtime: the stored events and the `resumed` element, the item tasks re-handed.
    const s2 = seams();
    const h2 = runtimeOn(s2).resume(NESTED, cp);
    await turn();
    compareAll(h2, OPTS, 'resumed');
    for (const t of s2.added) {
      const r = h2.inputOf({ taskId: t.id });
      ok(r.ok && deepEqual(r.inputs[0]!.value, t.payload), `resumed ${t.id}: re-handed with the envelope the reading answers`);
      const before = h.inputOf({ taskId: t.id });
      ok(before.ok && deepEqual(before, r), `resumed ${t.id}: the stored run's own handle answers the same`);
    }
    ok(s2.added.length >= 4, `the resume re-handed the in-flight set (${s2.added.length})`);
    // RELEASED: drive the resumed run to its end; `done` settles and the runtime releases it — the handle still reads.
    for (let q = 0; q < 50 && s2.added.some((t) => !h2.driver.checkpoint().events.some((e) => e.kind === 'outcome' && e.record.taskId === t.id)); q += 1) {
      const t = s2.added.find((x) => !h2.driver.checkpoint().events.some((e) => e.kind === 'outcome' && e.record.taskId === x.id))!;
      s2.settle(t.id, RESULT(t.id));
      await turn();
    }
    equal((await h2.done).outcome, 'completed', 'the resumed run completed and was released');
    compareAll(h2, OPTS, 'released');
    const last = h2.inputOf({ taskId: 'r1:last:-:0' });
    ok(last.ok && deepEqual(last.inputs[0]!.value, s2.added.find((t) => t.id === 'r1:last:-:0')!.payload), 'released: last`s answer is what the scheduler was handed');
  });

  test(DECLARED_CASES[2], async () => {
    const s = seams();
    const seen: FoldInput[] = [];
    const rt = runtimeOn(s);
    const h = rt.start(NESTED, { tenant: 't1' }, { onFoldInput: (e) => { seen.push(e); } });
    await turn();
    s.settle('r1:a:-:0', RESULT('r1:a:-:0'));
    s.settle('r1:pre:0:0', RESULT('r1:pre:0:0'));
    await turn();
    const before = JSON.stringify(h.driver.checkpoint());
    const delivered = seen.length;
    const state = h.state();
    const r = h.inputOf({ taskId: 'r1:a:-:0' });
    const items = h.inputOf({ nodeId: 'item' });
    ok(r.ok && items.ok && items.inputs.length === 3, 'answered');
    equal(JSON.stringify(h.driver.checkpoint()), before, 'nothing was appended to the live run');
    equal(seen.length, delivered, 'and no element delivered to its consumer');
    ok(h.state() === state, 'the live state is the same object — no input moved it');
    // Nothing of the live run is reachable from an answer — walked from the live driver, the walk shown able to succeed.
    const env = (r.ok ? r.inputs[0]!.value : null) as { input: { run: { tenant: string }; it: { tenant: string } } };
    ok(!reaches(h.driver, env) && !reaches(h.driver, env.input) && !reaches(h.driver, env.input.run), 'the answer and its parts are no object the live driver holds');
    ok(reaches(h.driver, h.driver.checkpoint), 'the control: the walk reaches what the driver DOES hold (its own method)');
    // A write into an answer, where it is writable, moves nothing the run holds — and the next reading is unchanged.
    const item0 = (items.ok ? items.inputs[0]!.value : null) as { settings: Record<string, unknown>; input: unknown };
    item0.settings.injected = true;
    equal(JSON.stringify(h.driver.checkpoint()), before, 'a write into an answer reaches no element of the run');
    const again = h.inputOf({ nodeId: 'item' });
    ok(again.ok && deepEqual((again.inputs[0]!.value as { settings: unknown }).settings, {}), 'and the next reading is handed a fresh value, unwritten');
    // The run still runs on: the items settle and `last` is handed what it would have been.
    for (const id of ['r1:item:0.0:0', 'r1:item:0.1:0', 'r1:item:0.2:0', 'r1:plain:1:0']) s.settle(id, RESULT(id));
    await turn();
    const last = s.added.find((t) => t.id === 'r1:last:-:0');
    ok(last !== undefined, 'last was dispatched');
    equal(last!.payload, { settings: {}, input: { a: RESULT('r1:a:-:0'), all: ['r1:item:0.0:0', 'r1:item:0.1:0', 'r1:item:0.2:0'].map(RESULT) } }, 'and handed what the spec composes — unmoved by any reading');
  });

  test(DECLARED_CASES[3], () => {
    const ran = collected().find((x) => x.suite === SUITE)!.cases.map((c) => c.name).sort();
    const declared: string[] = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});

/** Does anything reachable from `root` — own properties, `Map` keys and values, `Set` values, functions included — equal `target`? */
function reaches(root: unknown, target: unknown): boolean {
  const seen = new Set<unknown>();
  const stack: unknown[] = [root];
  while (stack.length > 0) {
    const v = stack.pop();
    if (v === target) return true;
    if (v === null || (typeof v !== 'object' && typeof v !== 'function') || seen.has(v)) continue;
    seen.add(v);
    if (v instanceof Map) for (const [k, x] of v) stack.push(k, x);
    else if (v instanceof Set) for (const x of v) stack.push(x);
    if (ArrayBuffer.isView(v)) continue;
    for (const k of Reflect.ownKeys(v as object)) {
      const d = Object.getOwnPropertyDescriptor(v, k);
      if (d && 'value' in d) stack.push(d.value);
    }
    if (typeof v === 'object') stack.push(Object.getPrototypeOf(v));
  }
  return false;
}
