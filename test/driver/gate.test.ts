/**
 * Ladder L2 — **what a GATE does in a run**: `spec/flow-definition.md` section 2's gate (its run-time half)
 * and `FD-R5`, `spec/run-state.md`'s `RN-R26`, P24 decisions 5-8,
 * [ADR 0067](../../doc/decisions/0067-a-gate-runs-in-the-driver-its-memory-is-the-drivers-and-its-decision-is-recorded.md),
 * [W93](../../doc/work-items/w93-what-a-gate-does-in-a-run.md). No scheduler; the fake is L2's usual one, and
 * every settlement is delivered by this file in an order it ARRANGES and asserts.
 *
 * **Every expected value is derived from the rule text and the stimuli this file delivers**, never from the
 * driver's output. A gate SELECTS five things, and each is fixtured where its well-formed WRONG selections give
 * a DIFFERENT answer (`doc/workflow.md` section 5 rule 8 obligation (a), v0.23):
 *
 * | what is selected | the right one | the wrong ones, and the fixture where each differs |
 * |---|---|---|
 * | the edge taken | the edge wired for the returned route | the FIRST edge; the DEFAULT edge — `pick` returns each of three routes in turn and each lands on its own edge, so a driver taking the first or the default lands on one edge three times |
 * | the value handed on | what reached the gate | the gate's settings; the key — the successor receives the predecessor's result, which is neither, and the type writing into its own copy moves nothing |
 * | which branch is FIRST | the first to ARRIVE | the lowest item index; the first dispatched — the settlements are arranged so key A's first arrival is item `1.0`, not `0.0` |
 * | the memory's scope | one per gate per RUN | per region instance; per map item — duplicates put across two instances of the ENCLOSING map, never only in instance 0 |
 * | the resumed memory | the one the replay rebuilds | a fresh empty one; the killed driver's — cut where the three give three different routes |
 *
 * **Each case is named at its call site** — [Q382](../../doc/questions/q382.md): a name read by index from a
 * declared list can run two cases under each other's names, and W92's pass 2 measured it. The membership below
 * compares the NAMES that ran with the names declared, both ways and by count.
 */
import { collected, equal, ok, suite, throws } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { BoundaryRefused, Driver, InvalidDefinition, ResumeRefused, UndeclaredRoute } from '../../src/driver/driver.ts';
import type { Checkpoint, DriverOptions, RunFailure } from '../../src/driver/driver.ts';
import { GateTypeRefused, NameCollision } from '../../src/definition/registry.ts';
import { distinct } from '../../src/definition/validate.ts';
import type { FlowDefinition, GateContext, GateType, WorkerEntry } from '../../src/definition/types.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import { fold, step, emptyState, type FoldInput, type GateDecision } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';

const SUITE = 'W93 — what a GATE does in a run: the arm, the memory, the recorded decision, FD-R5, resume';

class FakeScheduler {
  readonly added: { id: string; payload: unknown }[] = [];
  private listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void { this.added.push(task as { id: string; payload: unknown }); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  settle(id: string, state: 'done' | 'failed' | 'user_action', result: unknown = null): void {
    const detail = { id, state, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, result, error: state === 'done' ? null : 'boom' };
    if (state === 'done') this.fire('task.completed', detail);
    else {
      this.fire('task.failed', detail);
      if (state === 'user_action') this.fire('task.user_action', detail);
    }
  }
  private fire(type: string, detail: unknown): void { for (const fn of this.listeners.get(type) ?? []) fn({ detail }); }
}

const TYPES = typesFor(['Ingest', 'Unpack', 'Identify', 'Setup', 'Publish', 'Work', 'Other']);

/** A driver with this file's defaults; `extra` wins. `failures` collects every `onRunFailure`. */
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

/** `pick`: three routes, the DEFAULT the middle one, and `fn` returns whatever the gate's settings name — so one type lands on each edge. */
const seenByPick: GateContext[] = [];
const pick: GateType = {
  routes: ['one', 'two', 'three'],
  defaultRoute: 'two',
  settingsSchema: { type: 'object', required: ['go'], properties: { go: { type: 'string' }, key: { type: 'string' }, note: { type: 'string' } }, additionalProperties: false },
  fn: (ctx) => {
    seenByPick.push({ ...ctx, input: structuredClone(ctx.input), settings: structuredClone(ctx.settings) });
    // A type writing into what it was handed — both are COPIES, so neither write may reach the run.
    (ctx.input as { body?: string }).body = 'WRITTEN BY THE TYPE';
    (ctx.settings as { note?: string }).note = 'WRITTEN BY THE TYPE';
    return ctx.settings.go as string;
  },
};

/** `rogue`: one declared route, and `fn` returns — or throws — whatever the gate's settings say. */
class Boom extends Error {}
const rogue: GateType = {
  routes: ['ok'],
  defaultRoute: 'ok',
  fn: (ctx) => {
    if (ctx.settings.throws === true) throw new Boom('the gate type threw');
    return ctx.settings.ret as string;
  },
};

/** A pick gate after a task: every edge a different task, the returned route's edge neither the first nor the default when `go` is `three`. */
const PICK_FLOW = (go: string): FlowDefinition => ({
  flowId: 'pick', version: 1, entry: 'first',
  nodes: [
    { id: 'first', kind: 'task', type: 'Work', edges: [{ to: 'g' }] },
    { id: 'g', kind: 'gate', type: 'pick', settings: { go, key: 'k', note: 'SETTING' }, edges: [
      { route: 'one', to: 'toOne' }, { to: 'toTwo' }, { route: 'three', to: 'toThree' }] },
    { id: 'toOne', kind: 'task', type: 'Other', edges: [{ to: 'done' }] },
    { id: 'toTwo', kind: 'task', type: 'Other', edges: [{ to: 'done' }] },
    { id: 'toThree', kind: 'task', type: 'Other', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
}) as unknown as FlowDefinition;

/**
 * **Two instances of an ENCLOSING map, a gate in the inner one** — the memory-scope fixture. `batches` maps over
 * the ingest's `batches`, each instance's `unpack` returns its `files`, and `files` maps over those; `identify`
 * names each file's series and `dedupe` is a `distinct` gate on it. A per-RUN memory is one map for all four
 * inner branches; a per-INSTANCE memory would be two, and a per-ITEM one four.
 */
const NESTED: FlowDefinition = {
  flowId: 'nested-gate', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'Ingest', edges: [{ to: 'batches' }] },
    { id: 'batches', kind: 'map', over: 'batches', branch: 'unpack' },
    { id: 'unpack', kind: 'task', type: 'Unpack', edges: [{ to: 'files' }] },
    { id: 'files', kind: 'map', over: 'files', branch: 'identify' },
    { id: 'identify', kind: 'task', type: 'Identify', edges: [{ to: 'dedupe' }] },
    { id: 'dedupe', kind: 'gate', type: 'distinct', settings: { key: 'series' }, edges: [
      { to: 'setup' }, { route: 'duplicate', to: 'dropped' }, { route: 'nokey', to: 'unknown' }] },
    { id: 'setup', kind: 'task', type: 'Setup', edges: [{ to: 'jFiles' }] },
    { id: 'dropped', kind: 'end', outcome: 'duplicate' },
    { id: 'unknown', kind: 'end', outcome: 'unidentified' },
    { id: 'jFiles', kind: 'join', of: 'files', edges: [{ to: 'jBatches' }] },
    { id: 'jBatches', kind: 'join', of: 'batches', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'Publish', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/** One map, a `distinct` gate in its branch — the resume fixture. `spy` wraps `distinct` and records the memory it was handed. */
const MAPPED = (type = 'distinct'): FlowDefinition => ({
  flowId: 'mapped-gate', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'Ingest', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'map', over: 'files', branch: 'identify' },
    { id: 'identify', kind: 'task', type: 'Identify', edges: [{ to: 'dedupe' }] },
    { id: 'dedupe', kind: 'gate', type, settings: { key: 'series' }, edges: [
      { to: 'setup' }, { route: 'duplicate', to: 'dropped' }, { route: 'nokey', to: 'unknown' }] },
    { id: 'setup', kind: 'task', type: 'Setup', edges: [{ to: 'collect' }] },
    { id: 'dropped', kind: 'end', outcome: 'duplicate' },
    { id: 'unknown', kind: 'end', outcome: 'unidentified' },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
}) as unknown as FlowDefinition;

/** The memory each call of `spy` was handed, as its sorted keys — read at the call, before the type writes. */
const spyCalls: string[][] = [];
const spy: GateType = {
  routes: distinct.routes, defaultRoute: distinct.defaultRoute, settingsSchema: distinct.settingsSchema,
  fn: (ctx) => { spyCalls.push([...ctx.memory.keys()].sort()); return distinct.fn(ctx); },
};

/**
 * **The mapped run's stimuli, in the order this file delivers them** — five files over three series. The ORDER
 * is the fixture: A's first arrival is item 2, then B (0), A again (3), C (1), B again (4). So the lowest index
 * per series (0 for B, 2 for A, 1 for C) and the first to arrive coincide for no series but B, and the kill point
 * below falls after A's first decision and before C's.
 */
const FILES = [{ series: 'B' }, { series: 'C' }, { series: 'A' }, { series: 'A' }, { series: 'B' }];
const ARRIVAL = [2, 0, 3, 1, 4];
type Step = { settle: string; result: unknown };
const MAPPED_SCRIPT: Step[] = [
  { settle: 'R:ingest:-:0', result: { files: FILES.map((_f, i) => ({ n: i })) } },
  ...ARRIVAL.map((i) => ({ settle: `R:identify:${i}:0`, result: FILES[i] })),
];
/** Settle every `setup` the run dispatched, in dispatch order. */
const settleSetups = (h: ReturnType<typeof harness>) => {
  for (const id of h.ids().filter((i) => i.includes(':setup:'))) h.scheduler.settle(id, 'done', { set: id });
};

/** For every key, the routes the gate gave it, in the order the branches ARRIVED — read off the sequence. */
function routesByKey(gated: readonly GateDecision[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const g of gated) (out[JSON.stringify(g.key)] ??= []).push(g.route);
  return out;
}

/**
 * **The cases, declared by NAME and named AGAIN at each call site** — Q382: a name read by index from this list
 * can run two cases under each other's names; written twice, a case renamed or deleted at its call site fails the
 * membership below.
 */
const DECLARED_CASES: readonly string[] = [
  'the edge taken is the one wired for the RETURNED route — not the first edge, not the default — and it carries what REACHED the gate',
  'a gate decision is RECORDED — a `gated` element naming the gate, its branch path, the route and the key, before what the route led to',
  'the recorded KEY is a frozen COPY, and ABSENT where nothing resolved — a key path ending on an object is the non-flat case',
  'the memory is ONE per gate per RUN — shared across two instances of the enclosing map — and FIRST is the first to ARRIVE, not the lowest index',
  'a route the type does not declare STOPS the run by name — FD-R5, UndeclaredRoute — from the listener and from start(), appending nothing for the gate',
  'a gate type that THROWS stops the run with ITS OWN error, as a throwing predicate does — from the listener and from start()',
  'FD-R4 through an ENTRY gate holds the payload to the target the gate CHOOSES, and a refused start leaves the gate`s memory untouched',
  'a gate after a PARKED task decides on the RESOLUTION`s value, on the resolve() road',
  'a RESUME rebuilds the memory by replay at EVERY cut — equal to the run nobody killed, with the killed driver alive in the same process',
  'the RESUMED memory is the one the replay REBUILDS — not a fresh empty one, not the killed driver`s — cut where the three memories DIFFER',
  'the prefix check compares the gate`s ANSWERS — a stored route tampered, or a type whose answer changed, is refused `diverged` at that position',
  'a checkpoint taken BEFORE this item resumes unchanged — no new field, and a run with no gate records no `gated` element',
  'the road IN — DriverOptions.gateTypes: absent means the built-ins, a consumer type RUNS, a collision and a malformed type are refused at construction',
  'two gates in one run keep TWO memories — one per gate, not one per type and not one for every gate',
  'a gate inside a FANOUT branch: its drop EXITS the branch, the other branch ARRIVES, and the join carries what arrived',
  'a gate that declares no key and no settings: the type is handed no key and `{}`, and the element records no key',
  'a type writing into the KEY it was handed moves nothing downstream and nothing recorded',
  'an ENTRY gate reads a CLASS instance as a clone carries it — the type, the record and a resume all see the same key',
  // W100's, and the reason `checkWiring`'s key-path verdict says what it says.
  'a key path that resolves NOWHERE routes every branch to the type`s unresolved route and the run COMPLETES — P25 prediction 4, the pair',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test('the edge taken is the one wired for the RETURNED route — not the first edge, not the default — and it carries what REACHED the gate', () => {
    const landed: Record<string, string[]> = {};
    for (const go of ['one', 'two', 'three']) {
      seenByPick.length = 0;
      const flow = PICK_FLOW(go);
      const h = harness(flow, { gateTypes: { pick } });
      h.driver.start({ from: 'caller' });
      const reached = { k: 'K', body: 'THE BODY' };
      h.scheduler.settle('R:first:-:0', 'done', reached);
      landed[go] = h.ids().filter((id) => id !== 'R:first:-:0');
      const successor = landed[go]![0]!;
      // The value handed on: what reached the gate — the predecessor's result — and NOT the gate's settings
      // and NOT the key. The type wrote into its own copies; neither write reached the successor or the definition.
      equal(h.inputOf(successor), reached, `go=${go}: the successor receives exactly what reached the gate`);
      ok(JSON.stringify(h.inputOf(successor)) !== JSON.stringify((flow.nodes[1] as unknown as { settings: unknown }).settings), `go=${go}: which is not the gate's settings`);
      ok(h.inputOf(successor) !== 'K', `go=${go}: and not the key`);
      equal((flow.nodes[1] as unknown as { settings: { note: string } }).settings.note, 'SETTING', `go=${go}: the type wrote into ITS copy of the settings — the driver's definition is unmoved`);
      // What the type was handed: the key resolved over what reached the gate, that value, and the settings.
      equal(seenByPick.length, 1, `go=${go}: the type was asked ONCE, where the branch entered the gate`);
      equal([seenByPick[0]!.key, seenByPick[0]!.input, seenByPick[0]!.settings],
        ['K', reached, { go, key: 'k', note: 'SETTING' }], `go=${go}: ctx is { key, input, settings } as the spec names them`);
      ok(seenByPick[0]!.memory instanceof Map, `go=${go}: and the gate's memory`);
    }
    // The discriminating arrangement: each route lands on its OWN edge. A driver taking the FIRST edge lands on
    // toOne three times, one taking the DEFAULT (the edge with no route) lands on toTwo three times.
    equal(landed, { one: ['R:toOne:-:0'], two: ['R:toTwo:-:0'], three: ['R:toThree:-:0'] },
      'route one -> the edge naming one (the FIRST edge); two -> the edge with NO route (the DEFAULT); three -> the edge naming three (neither)');
    ok(new Set(Object.values(landed).map((v) => v[0])).size === 3, 'the arrangement: three routes, three different successors');
  });

  test('a gate decision is RECORDED — a `gated` element naming the gate, its branch path, the route and the key, before what the route led to', () => {
    const h = harness(PICK_FLOW('three'), { gateTypes: { pick } });
    h.driver.start({});
    h.scheduler.settle('R:first:-:0', 'done', { k: 'K', body: 'b' });
    const seq = h.driver.foldInputs();
    const at = seq.findIndex((i) => i.kind === 'gated');
    equal(seq[at], { kind: 'gated', gateId: 'g', branchPath: '-', route: 'three', key: 'K' }, 'the element, field for field');
    equal(seq[at + 1], { kind: 'dispatched', taskId: 'R:toThree:-:0' }, 'and the dispatch its route led to FOLLOWS it');
    equal(seq[at - 1]?.kind, 'outcome', 'after the settlement that brought the branch to the gate');
    equal(h.gated().length, 1, 'ONE element for one branch reaching one gate — no task id, no dispatch of its own');
    equal(fold(seq).gated, [{ gateId: 'g', branchPath: '-', route: 'three', key: 'K' }], 'and RunState.gated records it (RN-R26)');
    equal(fold(seq).outcome, 'running', 'the gate moves no node and no outcome — toThree is in flight');
    // **`step` moves NOTHING else** — every other field of the state, not only `outcome` (the adequacy reader's R12: a
    // path end added at the gate survived, because only `outcome` was read and it did not move on that flow).
    const before = fold(seq.slice(0, at));
    const after = step(before, seq[at]!);
    equal({ ...after, gated: before.gated }, before, 'every field but `gated` is the state before the element, field for field');
    equal(after.gated.length, before.gated.length + 1, 'and `gated` grew by exactly the one decision');
  });

  test('the recorded KEY is a frozen COPY, and ABSENT where nothing resolved — a key path ending on an object is the non-flat case', () => {
    const flow = { ...MAPPED(), nodes: MAPPED().nodes.map((n) => (n.id === 'dedupe' ? { ...n, settings: { key: 'meta.series' } } : n)) } as FlowDefinition;
    const handed: FoldInput[] = [];
    const h = harness(flow, { onFoldInput: (i) => handed.push(i) });
    h.driver.start({});
    h.scheduler.settle('R:ingest:-:0', 'done', { files: [{ n: 0 }, { n: 1 }] });
    h.scheduler.settle('R:identify:0:0', 'done', { meta: { series: { name: 'A' } } });
    h.scheduler.settle('R:identify:1:0', 'done', { other: true });
    const [objKey, noKey] = h.gated();
    // `distinct` routes an OBJECT key to `nokey` (stop-and-ask (c)), and the element still records what was resolved.
    equal([objKey!.route, objKey!.key], ['nokey', { name: 'A' }], 'a key path ending on an object records the object');
    equal([noKey!.route, 'key' in noKey!], ['nokey', false], 'a missing segment records NO key — absent, not undefined');
    ok(Object.isFrozen(objKey!.key), 'the key a consumer is handed is frozen');
    ok(h.gated()[0]!.key !== objKey!.key, 'and a COPY — two reads give two objects, so a consumer holds none of the driver`s');
    const viaCallback = handed.find((i) => i.kind === 'gated') as Extract<FoldInput, { kind: 'gated' }>;
    ok(viaCallback.key !== objKey!.key && Object.isFrozen(viaCallback.key), 'onFoldInput is handed its own frozen copy too');
    throws(() => { (objKey!.key as { name: string }).name = 'X'; }, '', 'a write into the handed key is refused');
    equal(h.gated()[0]!.key, { name: 'A' }, 'and the driver`s own is unmoved');
    // The ALIAS half: the value handed on IS the next task's input — `dispatch` hands it as it is — so a key the driver
    // kept BY REFERENCE would move the moment a worker wrote into its input. The recorded key is the driver's own copy.
    const hp = harness(PICK_FLOW('three'), { gateTypes: { pick } });
    hp.driver.start({});
    hp.scheduler.settle('R:first:-:0', 'done', { k: { deep: 'D' }, body: 'b' });
    ((hp.inputOf('R:toThree:-:0') as { k: { deep: string } }).k).deep = 'WRITTEN BY A WORKER';
    equal([hp.gated()[0]!.key, fold(hp.driver.foldInputs()).gated[0]!.key], [{ deep: 'D' }, { deep: 'D' }],
      'a worker writing into the input it was handed moves NOTHING recorded — the key was copied when the gate decided');
    // The fold's copy: a state built from an element does not share the element's key.
    const e = { kind: 'gated', gateId: 'dedupe', branchPath: '0', route: 'nokey', key: { name: 'A' } } as FoldInput;
    const s = step(emptyState(), e);
    ((e as { key: { name: string } }).key).name = 'MOVED';
    equal(s.gated, [{ gateId: 'dedupe', branchPath: '0', route: 'nokey', key: { name: 'A' } }], 'step copies the key (RN-R2: it never shares what it was handed)');
    // ABSENT in the fold as in the element — not a `key: undefined` an `in` check would see (the adequacy reader's R21).
    equal('key' in fold(h.driver.foldInputs()).gated[1]!, false, 'the fold records NO key where nothing resolved');
    // *(A line here read `equal(fold([e]), fold([e]))` — RN-R1 stated over one input, which cannot fail on its own.
    // W93's conformity reader, finding 7; removed.)*
  });

  test('the memory is ONE per gate per RUN — shared across two instances of the enclosing map — and FIRST is the first to ARRIVE, not the lowest index', () => {
    const h = harness(NESTED);
    h.driver.start({});
    h.scheduler.settle('R:ingest:-:0', 'done', { batches: [{ b: 0 }, { b: 1 }] });
    h.scheduler.settle('R:unpack:0:0', 'done', { files: [{ f: '00' }, { f: '01' }] });
    h.scheduler.settle('R:unpack:1:0', 'done', { files: [{ f: '10' }, { f: '11' }] });
    // The ARRANGEMENT: A reaches the gate first from batch 1 (`1.0`), then B from batch 0, then A from batch 0, then B from batch 1.
    const order = ['1.0', '0.1', '0.0', '1.1'];
    const series: Record<string, string> = { '0.0': 'A', '0.1': 'B', '1.0': 'A', '1.1': 'B' };
    for (const p of order) h.scheduler.settle(`R:identify:${p}:0`, 'done', { series: series[p] });
    const gated = h.gated();
    equal(gated.map((g) => g.branchPath), order, 'the gate decided in ARRIVAL order — the sequence is the order branches reached it');
    // The rule, derived from the sequence and not from a literal naming a winner: per key, the FIRST arrival is `first`
    // and every later one `duplicate` — so exactly one `first` per key across the whole run.
    equal(routesByKey(gated), { '"A"': ['first', 'duplicate'], '"B"': ['first', 'duplicate'] },
      'one `first` per key across BOTH instances of the enclosing map — a per-instance memory gives four `first`s, a per-item one too');
    // The arrangement's own effect, asserted beside the claim (Q379): the first-arriving A is NOT the lowest index,
    // and the two A branches are in DIFFERENT instances of the enclosing map.
    const firstA = gated.find((g) => g.key === 'A')!.branchPath;
    const lowestA = Object.keys(series).filter((p) => series[p] === 'A').sort()[0]!;
    ok(firstA !== lowestA, `the first A to arrive (${firstA}) is not the lowest-indexed A (${lowestA}) — a lowest-index rule gives a different winner`);
    equal(new Set(gated.filter((g) => g.key === 'A').map((g) => g.branchPath.split('.')[0])).size, 2, 'and the two A branches sit in two instances of the ENCLOSING map');
    const setups = h.ids().filter((i) => i.includes(':setup:'));
    equal(setups.map((i) => i.split(':')[2]).sort(), gated.filter((g) => g.route === 'first').map((g) => g.branchPath).sort(),
      'setup was dispatched for exactly the branches routed `first`, at the gate`s own branch paths');
    // Drive it home: the drops EXIT their inner region (branch.exited), the joins fire, the run completes.
    settleSetups(h);
    h.scheduler.settle('R:publish:-:0', 'done', { ok: true });
    const s = fold(h.driver.foldInputs());
    equal([s.outcome, h.failures.length], ['completed', 0], 'the run COMPLETES — a drop to an `end` is a branch.exited and the joins fire');
    equal(h.driver.foldInputs().filter((i) => i.kind === 'region' && i.event.type === 'branch.exited').map((i) => (i as { event: { branchPath: string } }).event.branchPath).sort(),
      gated.filter((g) => g.route === 'duplicate').map((g) => g.branchPath).sort(), 'and each duplicate EXITED its inner region at its own path');
  });

  test('a route the type does not declare STOPS the run by name — FD-R5, UndeclaredRoute — from the listener and from start(), appending nothing for the gate', () => {
    const gateAfterTask = (settings: Record<string, unknown>) => ({
      flowId: 'rogue', version: 1, entry: 'first',
      nodes: [
        { id: 'first', kind: 'task', type: 'Work', edges: [{ to: 'g' }] },
        { id: 'g', kind: 'gate', type: 'rogue', settings, edges: [{ to: 'next' }] },
        { id: 'next', kind: 'task', type: 'Other', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    }) as unknown as FlowDefinition;
    // **The return shapes driven, bound as a MEMBERSHIP** (rule 8 obligation (d)): a loop narrowed to one shape is
    // otherwise green, every clause below simply asked of fewer values.
    const driven: unknown[] = [];
    for (const ret of ['nope', 42, undefined]) {
      driven.push(ret);
      const h = harness(gateAfterTask(ret === undefined ? {} : { ret }), { gateTypes: { rogue } });
      h.driver.start({});
      h.scheduler.settle('R:first:-:0', 'done', { x: 1 });
      const last = h.driver.foldInputs().at(-1)!;
      equal([h.failures.length, h.failures[0]?.kind], [1, 'UndeclaredRoute'], `ret=${String(ret)}: reported once, by name`);
      // W140 — Q533, P31 decision 2: the class names the refusal ONCE, by its own `name`; the message does not.
      equal([h.failures[0]!.message.startsWith('FD-R5 — run "R" reached gate "g"'), String(h.failures[0]!.cause), String(fold(h.driver.foldInputs()).stoppedBy), `${h.failures[0]!.kind}: ${h.failures[0]!.message}`].map((s, i) => i === 0 ? s : String(s).split('UndeclaredRoute').length),
        [true, 2, 2, 2], `ret=${String(ret)}: the message opens with the rule, and String(e), stoppedBy and kind: message each name the class EXACTLY once: ${String(h.failures[0]!.cause).slice(0, 80)}`);
      equal((h.failures[0]!.cause as Error).name, 'UndeclaredRoute', `ret=${String(ret)}: the class sets its OWN name, not one that merely contains it (W140 adequacy reader, finding 1)`);
      ok(/FD-R5/.test(h.failures[0]!.message) && h.failures[0]!.message.includes('"g"') && h.failures[0]!.message.includes('"rogue"'),
        `ret=${String(ret)}: naming the rule, the gate and the type: ${h.failures[0]!.message.slice(0, 160)}`);
      // …and what the type RETURNED and the routes it DECLARES, as the spec's row says (the adequacy reader's R6).
      ok(h.failures[0]!.message.includes(typeof ret === 'string' ? JSON.stringify(ret) : String(ret)) && h.failures[0]!.message.includes('its routes are "ok"'),
        `ret=${String(ret)}: naming what was returned and the declared routes: ${h.failures[0]!.message.slice(0, 220)}`);
      equal([last.kind, h.gated().length, h.ids()], ['stopped', 0, ['R:first:-:0']], `ret=${String(ret)}: stopped, NO gated element, and nothing past the gate dispatched`);
      equal(fold(h.driver.foldInputs()).outcome, 'stopped', `ret=${String(ret)}: the run is stopped (OR-R10)`);
    }
    equal(driven, ['nope', 42, undefined], 'every return shape was driven — a string the type does not declare, a number and nothing');
    // From start(): an ENTRY gate. Reported AND rethrown, since the caller is on the stack.
    const entry = { flowId: 'rogue-entry', version: 1, entry: 'g', nodes: [
      { id: 'g', kind: 'gate', type: 'rogue', settings: { ret: 'nope' }, edges: [{ to: 'next' }] },
      { id: 'next', kind: 'task', type: 'Other', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ] } as unknown as FlowDefinition;
    const h = harness(entry, { gateTypes: { rogue } });
    let err: unknown;
    try { h.driver.start({}); } catch (e) { err = e; }
    ok(err instanceof UndeclaredRoute, `start() rethrows the refusal: ${String(err)}`);
    equal([h.failures.length, h.ids(), h.gated().length], [1, [], 0], 'and reports it once, with nothing dispatched and nothing recorded for the gate');
    // From resolve(): a gate after a task a PERSON resolves — the third road into `enter`, reported AND rethrown.
    const hr = harness(gateAfterTask({ ret: 'nope' }), { gateTypes: { rogue } });
    hr.driver.start({});
    hr.scheduler.settle('R:first:-:0', 'user_action');
    err = undefined;
    try { hr.driver.resolve('R:first:-:0', 'done', { result: { x: 1 }, actor: 'ana' }); } catch (e) { err = e; }
    ok(err instanceof UndeclaredRoute, `resolve() rethrows it: ${String(err)}`);
    equal([hr.failures.map((f) => f.kind), fold(hr.driver.foldInputs()).outcome], [['UndeclaredRoute'], 'stopped'], 'reported once, and the run is stopped');
  });

  test('a gate type that THROWS stops the run with ITS OWN error, as a throwing predicate does — from the listener and from start()', () => {
    const flow = { flowId: 'throws', version: 1, entry: 'first', nodes: [
      { id: 'first', kind: 'task', type: 'Work', edges: [{ to: 'g' }] },
      { id: 'g', kind: 'gate', type: 'rogue', settings: { throws: true }, edges: [{ to: 'next' }] },
      { id: 'next', kind: 'task', type: 'Other', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ] } as unknown as FlowDefinition;
    const h = harness(flow, { gateTypes: { rogue } });
    h.driver.start({});
    h.scheduler.settle('R:first:-:0', 'done', { x: 1 });
    equal([h.failures.map((f) => f.kind), h.gated().length, h.driver.foldInputs().at(-1)!.kind], [['Boom'], 0, 'stopped'],
      'the type`s own error, unwrapped — not UndeclaredRoute — and nothing recorded for the gate');
    // The ENTRY gate's flow is the same gate with nothing before it — a `first` left in would be FD-V11, unreachable.
    const entry = { ...flow, entry: 'g', nodes: flow.nodes.filter((n) => n.id !== 'first') } as FlowDefinition;
    const h2 = harness(entry, { gateTypes: { rogue } });
    let err: unknown;
    try { h2.driver.start({}); } catch (e) { err = e; }
    ok(err instanceof Boom, `from start(), rethrown as it is: ${String(err)}`);
    equal(h2.failures.map((f) => f.kind), ['Boom'], 'and reported once');
  });

  test('FD-R4 through an ENTRY gate holds the payload to the target the gate CHOOSES, and a refused start leaves the gate`s memory untouched', () => {
    const workers: Record<string, WorkerEntry> = {
      work: { url: 'test://work', inputSchema: { type: 'object', required: ['id', 'size'] } },
      fix: { url: 'test://fix', inputSchema: { type: 'object', required: ['fixme'] } },
    };
    const types = typesFor([], { Work: { worker: 'work' }, Fix: { worker: 'fix' } }, workers);
    const flow = { flowId: 'entry-gate', version: 1, entry: 'g', nodes: [
      { id: 'g', kind: 'gate', type: 'distinct', settings: { key: 'id' }, edges: [
        { to: 'work' }, { route: 'duplicate', to: 'dup' }, { route: 'nokey', to: 'fix' }] },
      { id: 'work', kind: 'task', type: 'Work', edges: [{ to: 'done' }] },
      { id: 'fix', kind: 'task', type: 'Fix', edges: [{ to: 'done' }] },
      { id: 'dup', kind: 'end', outcome: 'duplicate' },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ] } as unknown as FlowDefinition;
    // A payload `distinct` sends to `first`: `work` accepts it, `fix` — the `nokey` target — would refuse it. The
    // run starts: only the chosen target is held. *(Before W93 the walk held every route's target, and this start was
    // refused by `fix`, a task the run never reaches — measured at the declaration step.)*
    const a = harness(flow, types);
    a.driver.start({ id: 'x', size: 1 });
    equal(a.ids(), ['R:work:-:0'], 'started, and `work` dispatched — `fix` never held the payload');
    // A payload `distinct` sends to `nokey`: held to `fix`'s schema, and refused NAMING `fix`, not `work`.
    const b = harness(flow, types);
    let err: unknown;
    try { b.driver.start({ size: 1 }); } catch (e) { err = e; }
    ok(err instanceof BoundaryRefused && (err as BoundaryRefused).nodeId === 'fix', `refused by the chosen target: ${String(err)}`);
    // The THROWAWAY memory: a start refused by the chosen target, then a corrected start with the SAME key. The first
    // evaluation must not have written the run's memory, or the second would route `duplicate` and dispatch nothing.
    const c = harness(flow, types);
    err = undefined;
    try { c.driver.start({ id: 'x' }); } catch (e) { err = e; }
    ok(err instanceof BoundaryRefused && (err as BoundaryRefused).nodeId === 'work', `the first start is refused by work (no size): ${String(err)}`);
    equal([c.ids(), c.driver.foldInputs().length], [[], 0], 'nothing dispatched and nothing appended');
    // An entry gate whose type THROWS, or returns a route it does not declare, holds NOTHING past it — the target below
    // refuses every payload, so a walk that went on anyway would refuse the start by a task the run never reaches
    // (the adequacy reader's R5). The run stops on the type for real instead: its own error, or UndeclaredRoute.
    const stopsDriven: string[] = [];
    for (const [settings, expected] of [[{ throws: true }, Boom], [{ ret: 'nope' }, UndeclaredRoute]] as const) {
      stopsDriven.push(expected.name);
      const rf = { flowId: 'entry-rogue', version: 1, entry: 'g', nodes: [
        { id: 'g', kind: 'gate', type: 'rogue', settings, edges: [{ to: 'fix' }] },
        { id: 'fix', kind: 'task', type: 'Fix', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ] } as unknown as FlowDefinition;
      const hx = harness(rf, { ...types, gateTypes: { rogue } });
      err = undefined;
      try { hx.driver.start({ size: 1 }); } catch (e) { err = e; }
      ok(err instanceof expected && !(err instanceof BoundaryRefused), `${JSON.stringify(settings)}: start() throws the type's own stop, not BoundaryRefused naming fix: ${String(err)}`);
    }
    equal(stopsDriven, ['Boom', 'UndeclaredRoute'], 'both of the type`s stops were driven at the entry — a throw and an undeclared route');
    c.driver.start({ id: 'x', size: 1 });
    equal([c.ids(), c.gated().map((g) => g.route)], [['R:work:-:0'], ['first']],
      'the corrected start routes `first` — the refused one asked the type against a THROWAWAY memory, and the run`s memory is still empty');
  });

  test('a gate after a PARKED task decides on the RESOLUTION`s value, on the resolve() road', () => {
    const h = harness(MAPPED());
    h.driver.start({});
    h.scheduler.settle('R:ingest:-:0', 'done', { files: [{ n: 0 }, { n: 1 }] });
    h.scheduler.settle('R:identify:0:0', 'user_action');
    h.scheduler.settle('R:identify:1:0', 'done', { series: 'A' });
    equal(h.gated().map((g) => [g.branchPath, g.route]), [['1', 'first']], 'the settled branch decided; the parked one has not reached the gate');
    ok(h.driver.resolve('R:identify:0:0', 'done', { result: { series: 'A' }, actor: 'ana' }), 'the person`s resolution is accepted');
    equal(h.gated().map((g) => [g.branchPath, g.route]), [['1', 'first'], ['0', 'duplicate']],
      'and the resolved branch reached the gate SECOND — the memory is the order of arrival, whatever road a branch came by');
  });

  test('a RESUME rebuilds the memory by replay at EVERY cut — equal to the run nobody killed, with the killed driver alive in the same process', () => {
    // The run nobody killed, a checkpoint INSIDE `onFoldInput` at every position (it ends mid-step, ADR 0064).
    const inside: Checkpoint[] = [];
    const ref = {} as { h: ReturnType<typeof harness> };
    ref.h = harness(MAPPED(), { onFoldInput: (_i, seq) => { inside[seq] = ref.h.driver.checkpoint(); } });
    ref.h.driver.start({});
    for (const st of MAPPED_SCRIPT) ref.h.scheduler.settle(st.settle, 'done', st.result);
    settleSetups(ref.h);
    const reference = ref.h.driver.foldInputs();
    equal(fold(reference).outcome, 'completed', 'the reference run completes');
    equal(routesByKey(ref.h.gated()), { '"A"': ['first', 'duplicate'], '"B"': ['first', 'duplicate'], '"C"': ['first'] }, 'and its gate decided one `first` per series');
    ok(inside.length === reference.length, `a checkpoint at every one of the ${reference.length} positions`);
    let resumedAtEveryCut = 0;
    for (let k = 0; k < inside.length; k++) {
      const cp = inside[k]!;
      const r = harness(MAPPED());
      r.driver.resume(cp);
      // The rest of the run: every stimulus the stored events do not already hold, delivered as the reference delivered it.
      const stored = new Set(cp.events.flatMap((e) => (e.kind === 'outcome' ? [e.record.taskId] : [])));
      for (const st of MAPPED_SCRIPT) if (!stored.has(st.settle)) r.scheduler.settle(st.settle, 'done', st.result);
      for (const id of r.ids().filter((i) => i.includes(':setup:') && !stored.has(i))) r.scheduler.settle(id, 'done', { set: id });
      const got = r.driver.foldInputs().filter((e) => e.kind !== 'resumed');
      equal(JSON.stringify(got), JSON.stringify(reference), `cut at ${k}: the resumed run IS the reference, element for element, gated elements included`);
      resumedAtEveryCut++;
    }
    equal(resumedAtEveryCut, inside.length, 'every cut was resumed — the loop ran over the whole list');
    // The killed driver is ALIVE in this process with its whole memory, and no resumed driver ever saw it: a memory kept by
    // the PROCESS resumed WRONG, in silence, where the first decision lay past the stored events (W93's declaration step).
    ok(ref.h.gated().length === 5, 'the killed driver still holds a memory that has seen every series');
  });

  test('the RESUMED memory is the one the replay REBUILDS — not a fresh empty one, not the killed driver`s — cut where the three memories DIFFER', () => {
    const inside: Checkpoint[] = [];
    spyCalls.length = 0;
    const ref = {} as { h: ReturnType<typeof harness> };
    ref.h = harness(MAPPED('spy'), { gateTypes: { spy }, onFoldInput: (_i, seq) => { inside[seq] = ref.h.driver.checkpoint(); } });
    ref.h.driver.start({});
    for (const st of MAPPED_SCRIPT) ref.h.scheduler.settle(st.settle, 'done', st.result);
    const refGated = ref.h.gated();
    // The cut: right after the FIRST decision (A, first), so the stored memory is {A}. After it B comes first, then A
    // again, then C for the first time, then B again. The three candidate memories DIFFER — fresh {}, rebuilt {A}, the
    // killed driver's {A,B,C} — and so do the ROUTES they give over the rest of the run: fresh routes the second A
    // FIRST, the killed driver's routes B and C DUPLICATE. *(The first post-resume decision, B's, routes `first` under
    // both a fresh and the rebuilt memory: what that one decision discriminates is the memory it is HANDED, which is
    // what is asserted; the routes are asserted over the whole run. W93's conformity reader, finding 5.)*
    const cut = ref.h.driver.foldInputs().findIndex((e) => e.kind === 'gated');
    const cp = inside[cut]!;
    const storedKeys = cp.events.flatMap((e) => (e.kind === 'gated' && e.route === 'first' ? [JSON.stringify(e.key)] : [])).sort();
    const killedKeys = [...new Set(refGated.map((g) => JSON.stringify(g.key)))].sort();
    equal(storedKeys, ['"A"'], 'the arrangement: the stored run decided ONE key');
    ok(storedKeys.length > 0 && killedKeys.length > storedKeys.length, `and the three candidate memories DIFFER: fresh [], rebuilt ${storedKeys}, killed ${killedKeys}`);
    spyCalls.length = 0;
    const r = harness(MAPPED('spy'), { gateTypes: { spy } });
    r.driver.resume(cp);
    const replayCalls = spyCalls.length;
    equal(replayCalls, 1, 'the replay RE-EVALUATED the stored decision — the gate`s answers are regenerated, not fed');
    const stored = new Set(cp.events.flatMap((e) => (e.kind === 'outcome' ? [e.record.taskId] : [])));
    for (const st of MAPPED_SCRIPT) if (!stored.has(st.settle)) r.scheduler.settle(st.settle, 'done', st.result);
    equal(spyCalls[replayCalls], storedKeys, 'the first decision AFTER the resume was handed the REBUILT memory — not [] and not the killed driver`s');
    equal(routesByKey(r.gated()), routesByKey(refGated), 'so every later branch routes as it did in the run nobody killed');
  });

  test('the prefix check compares the gate`s ANSWERS — a stored route tampered, or a type whose answer changed, is refused `diverged` at that position', () => {
    const inside: Checkpoint[] = [];
    const ref = {} as { h: ReturnType<typeof harness> };
    ref.h = harness(MAPPED(), { onFoldInput: (_i, seq) => { inside[seq] = ref.h.driver.checkpoint(); } });
    ref.h.driver.start({});
    for (const st of MAPPED_SCRIPT) ref.h.scheduler.settle(st.settle, 'done', st.result);
    const all = ref.h.driver.checkpoint();
    // Tamper the SECOND gated element's route (not position 0, not the last, not the first gated one).
    const positions = all.events.flatMap((e, i) => (e.kind === 'gated' ? [i] : []));
    const at = positions[1]!;
    const tampered: Checkpoint = { header: all.header, events: all.events.map((e, i) => (i === at ? { ...(e as object), route: 'duplicate' } as FoldInput : e)) };
    let err: unknown;
    try { harness(MAPPED()).driver.resume(tampered); } catch (e) { err = e; }
    ok(err instanceof ResumeRefused && err.reason === 'diverged' && err.index === at, `refused diverged at ${at}: ${String(err)}`);
    // Every FIELD of the element is compared, not only its route (the adequacy reader's R11): the key, the gate and the
    // branch path, each tampered alone at the same position, each refused there.
    const fieldsTampered: string[] = [];
    for (const field of [{ key: 'Z' }, { gateId: 'other' }, { branchPath: '9' }]) {
      fieldsTampered.push(Object.keys(field)[0]!);
      const t: Checkpoint = { header: all.header, events: all.events.map((e, i) => (i === at ? { ...(e as object), ...field } as unknown as FoldInput : e)) };
      err = undefined;
      try { harness(MAPPED()).driver.resume(t); } catch (e) { err = e; }
      ok(err instanceof ResumeRefused && err.reason === 'diverged' && err.index === at, `${JSON.stringify(field)} tampered: refused diverged at ${at}: ${String(err)}`);
    }
    equal(fieldsTampered, ['key', 'gateId', 'branchPath'], 'every field beside the route was tampered — a MEMBERSHIP, so a narrowed loop fails here');
    // A type whose answer is not a function of its context (Q9) — it answers `nokey` once this process has asked it
    // enough times — is refused where its answer first differs, not resumed on a different road.
    let asked = 0;
    const fickle: GateType = { ...distinct, fn: (ctx) => (++asked > 5 ? 'nokey' : distinct.fn(ctx)) };
    const f = {} as { h: ReturnType<typeof harness> };
    f.h = harness(MAPPED('fickle'), { gateTypes: { fickle } });
    f.h.driver.start({});
    for (const st of MAPPED_SCRIPT) f.h.scheduler.settle(st.settle, 'done', st.result);
    const fcp = f.h.driver.checkpoint();
    err = undefined;
    try { harness(MAPPED('fickle'), { gateTypes: { fickle } }).driver.resume(fcp); } catch (e) { err = e; }
    const firstGated = fcp.events.findIndex((e) => e.kind === 'gated');
    ok(err instanceof ResumeRefused && err.reason === 'diverged' && err.index === firstGated, `an impure type is refused at its first answer: ${String(err)}`);
  });

  test('a checkpoint taken BEFORE this item resumes unchanged — no new field, and a run with no gate records no `gated` element', () => {
    // Produced on `fb2a981` (W92's tree) by `dev-dist/w93/w92-checkpoint.ts`: `map-fanout`'s shape driven to a
    // quiescent point by a fake scheduler, `JSON.stringify(driver.checkpoint())`, and pasted here as data. A browser
    // cannot read a file under `test/`, so it is a literal (W32's finding).
    const cp = W92_CHECKPOINT as unknown as Checkpoint;
    equal(Object.keys(cp).sort(), ['events', 'header'], 'the pre-W93 checkpoint is { header, events } — format 1, unchanged');
    const h = harness(W92_FLOW as unknown as FlowDefinition);
    h.driver.resume(cp);
    equal(JSON.stringify(h.driver.foldInputs().slice(0, cp.events.length)), JSON.stringify(cp.events), 'it resumes, its stored events regenerated element for element');
    for (const id of h.ids()) h.scheduler.settle(id, 'done', { by: id });
    for (const id of h.ids().filter((i) => i.includes(':publish:'))) h.scheduler.settle(id, 'done', { by: id });
    const s = fold(h.driver.foldInputs());
    equal([s.outcome, s.gated], ['completed', []], 'and completes, with RunState.gated empty — a run with no gate records none');
  });

  test('the road IN — DriverOptions.gateTypes: absent means the built-ins, a consumer type RUNS, a collision and a malformed type are refused at construction', () => {
    let err: unknown;
    try { harness(PICK_FLOW('one')); } catch (e) { err = e; }
    ok(err instanceof InvalidDefinition && err.rules.includes('FD-V39'), `absent gateTypes: the built-ins alone, so "pick" is FD-V39: ${String(err)}`);
    const h = harness(PICK_FLOW('one'), { gateTypes: new Map([['pick', pick]]) });
    h.driver.start({});
    h.scheduler.settle('R:first:-:0', 'done', { k: 'K' });
    equal(h.gated().map((g) => g.route), ['one'], 'a Map is read as a record is, and the consumer`s fn decided');
    err = undefined;
    try { harness(PICK_FLOW('one'), { gateTypes: { pick, distinct } }); } catch (e) { err = e; }
    ok(err instanceof NameCollision, `a consumer type named as a built-in: ${String(err)}`);
    err = undefined;
    try { harness(PICK_FLOW('one'), { gateTypes: { pick: { ...pick, fn: 'nope' } as unknown as GateType } }); } catch (e) { err = e; }
    ok(err instanceof GateTypeRefused, `a value that is not a GateType: ${String(err)}`);
  });

  test('two gates in one run keep TWO memories — one per gate, not one per type and not one for every gate', () => {
    // The adequacy reader's R1/R2 (BLOCKING): every fixture had ONE gate, so memory pooled per TYPE or shared by all gates
    // passed everything. Two `distinct` gates in series on the SAME key: each has seen it for the first time.
    const flow = { flowId: 'two-gates', version: 1, entry: 'first', nodes: [
      { id: 'first', kind: 'task', type: 'Work', edges: [{ to: 'g1' }] },
      { id: 'g1', kind: 'gate', type: 'distinct', settings: { key: 's' }, edges: [{ to: 'g2' }, { route: 'duplicate', to: 'd1' }, { route: 'nokey', to: 'd1' }] },
      { id: 'g2', kind: 'gate', type: 'distinct', settings: { key: 's' }, edges: [{ to: 'last' }, { route: 'duplicate', to: 'd2' }, { route: 'nokey', to: 'd2' }] },
      { id: 'last', kind: 'task', type: 'Other', edges: [{ to: 'done' }] },
      { id: 'd1', kind: 'end', outcome: 'dropped-at-g1' }, { id: 'd2', kind: 'end', outcome: 'dropped-at-g2' },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ] } as unknown as FlowDefinition;
    const h = harness(flow);
    h.driver.start({});
    h.scheduler.settle('R:first:-:0', 'done', { s: 'A' });
    equal(h.gated().map((g) => [g.gateId, g.route]), [['g1', 'first'], ['g2', 'first']],
      'the key is NEW at each gate — a memory per type, or one for every gate, routes g2 `duplicate`');
    equal(h.ids(), ['R:first:-:0', 'R:last:-:0'], 'so the branch passes BOTH gates and `last` is dispatched');
  });

  test('a gate inside a FANOUT branch: its drop EXITS the branch, the other branch ARRIVES, and the join carries what arrived', () => {
    // The shapes clause (obligation (a)): a gate is a region member like a task in a `fanout` region too, not only in a
    // `map` — no run-time fixture drove one (W93's conformity reader, finding 2).
    const flow = { flowId: 'fanout-gate', version: 1, entry: 'ingest', nodes: [
      { id: 'ingest', kind: 'task', type: 'Ingest', edges: [{ to: 'fan' }] },
      { id: 'fan', kind: 'fanout', branches: ['a', 'b'] },
      { id: 'a', kind: 'task', type: 'Work', edges: [{ to: 'g' }] },
      { id: 'g', kind: 'gate', type: 'distinct', settings: { key: 'k' }, edges: [{ to: 'a2' }, { route: 'duplicate', to: 'dup' }, { route: 'nokey', to: 'lost' }] },
      { id: 'a2', kind: 'task', type: 'Setup', edges: [{ to: 'collect' }] },
      { id: 'b', kind: 'task', type: 'Other', edges: [{ to: 'collect' }] },
      { id: 'dup', kind: 'end', outcome: 'duplicate' }, { id: 'lost', kind: 'end', outcome: 'unidentified' },
      { id: 'collect', kind: 'join', of: 'fan', edges: [{ to: 'publish' }] },
      { id: 'publish', kind: 'task', type: 'Publish', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ] } as unknown as FlowDefinition;
    // The DROP: branch 0 has no key.
    const h = harness(flow);
    h.driver.start({});
    h.scheduler.settle('R:ingest:-:0', 'done', { n: 1 });
    h.scheduler.settle('R:a:0:0', 'done', {});
    h.scheduler.settle('R:b:1:0', 'done', { v: 1 });
    equal(h.gated(), [{ kind: 'gated', gateId: 'g', branchPath: '0', route: 'nokey' }], 'the gate decided at branch 0, with no key');
    const events = h.driver.foldInputs().flatMap((i) => (i.kind === 'region' ? [`${i.event.type} ${i.event.branchPath}`] : []));
    ok(events.includes('branch.exited 0') && events.includes('branch.arrived 1'), `branch 0 EXITED at the drop and branch 1 ARRIVED: ${events.join(', ')}`);
    equal(h.inputOf('R:publish:-:0'), { 1: { v: 1 } }, 'the join fired and carried what ARRIVED — branch 1 alone (JP-R12)');
    h.scheduler.settle('R:publish:-:0', 'done', { ok: true });
    equal(fold(h.driver.foldInputs()).outcome, 'completed', 'and the run completes');
    // The PASS: branch 0 keyed, so it continues through `a2` and arrives with what `a2` returned.
    const hp = harness(flow);
    hp.driver.start({});
    hp.scheduler.settle('R:ingest:-:0', 'done', { n: 1 });
    hp.scheduler.settle('R:a:0:0', 'done', { k: 'K' });
    equal(hp.inputOf('R:a2:0:0'), { k: 'K' }, 'on its first route the gate hands `a2` what reached it');
    hp.scheduler.settle('R:a2:0:0', 'done', { set: 'K' });
    hp.scheduler.settle('R:b:1:0', 'done', { v: 1 });
    equal(hp.inputOf('R:publish:-:0'), { 0: { set: 'K' }, 1: { v: 1 } }, 'and both branches ARRIVE, the gated one with a2`s result');
  });

  test('a gate that declares no key and no settings: the type is handed no key and `{}`, and the element records no key', () => {
    // The adequacy reader's R7/R8/R9: every gate that RECORDED a decision declared `key` and `settings`, so a driver
    // handing the type the whole value as its key, or `undefined` as its settings, passed everything.
    const seen: GateContext[] = [];
    const always: GateType = { routes: ['go'], defaultRoute: 'go', fn: (ctx) => { seen.push(ctx); return 'go'; } };
    const flow = { flowId: 'keyless', version: 1, entry: 'first', nodes: [
      { id: 'first', kind: 'task', type: 'Work', edges: [{ to: 'g' }] },
      { id: 'g', kind: 'gate', type: 'always', edges: [{ to: 'next' }] },
      { id: 'next', kind: 'task', type: 'Other', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ] } as unknown as FlowDefinition;
    const h = harness(flow, { gateTypes: { always } });
    h.driver.start({});
    h.scheduler.settle('R:first:-:0', 'done', { v: 1 });
    equal([seen.length, seen[0]!.key, seen[0]!.settings, seen[0]!.input], [1, undefined, {}, { v: 1 }],
      'the type is handed NO key, settings `{}` — the spec`s "`{}` when absent" — and the value');
    equal(['key' in h.gated()[0]!, 'key' in fold(h.driver.foldInputs()).gated[0]!], [false, false], 'and nothing is recorded as a key — not the whole value');
    equal(h.ids(), ['R:first:-:0', 'R:next:-:0'], 'the default route was taken');
  });

  test('a type writing into the KEY it was handed moves nothing downstream and nothing recorded', () => {
    // The adequacy reader's R3/R4 (BLOCKING): the key was once read off the ORIGINAL value, so a type writing into an
    // object key wrote into what the gate hands on; and a key recorded AFTER the type ran recorded the write.
    const scribble: GateType = { routes: ['on'], defaultRoute: 'on', fn: (ctx) => {
      (ctx.key as { deep: string }).deep = 'WRITTEN INTO THE KEY';
      (ctx.input as { k: { deep: string } }).k.deep = 'WRITTEN INTO THE INPUT';
      return 'on';
    } };
    const flow = { flowId: 'scribble', version: 1, entry: 'first', nodes: [
      { id: 'first', kind: 'task', type: 'Work', edges: [{ to: 'g' }] },
      { id: 'g', kind: 'gate', type: 'scribble', settings: { key: 'k' }, edges: [{ to: 'next' }] },
      { id: 'next', kind: 'task', type: 'Other', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ] } as unknown as FlowDefinition;
    const h = harness(flow, { gateTypes: { scribble } });
    h.driver.start({});
    h.scheduler.settle('R:first:-:0', 'done', { k: { deep: 'D' } });
    equal(h.inputOf('R:next:-:0'), { k: { deep: 'D' } }, 'the successor receives what REACHED the gate, untouched by the type');
    equal(h.gated()[0]!.key, { deep: 'D' }, 'and the recorded key is what resolved BEFORE the type ran');
  });

  test('an ENTRY gate reads a CLASS instance as a clone carries it — the type, the record and a resume all see the same key', () => {
    // W93's conformity reader, finding 1 (BLOCKING): the type was handed the key read off a COPY — plain, so `id`
    // resolved — while the record read the ORIGINAL — a class instance, so nothing resolved; and a resume, which enters
    // from the header's plain clone, regenerated the key and was REFUSED `diverged` at 0 on an honest checkpoint.
    class Upload { id = 'x'; }
    const seen: unknown[] = [];
    const watch: GateType = { ...distinct, fn: (ctx) => { seen.push(ctx.key); return distinct.fn(ctx); } };
    const flow = { flowId: 'entry-instance', version: 1, entry: 'g', nodes: [
      { id: 'g', kind: 'gate', type: 'watch', settings: { key: 'id' }, edges: [{ to: 'work' }, { route: 'duplicate', to: 'dup' }, { route: 'nokey', to: 'dup' }] },
      { id: 'work', kind: 'task', type: 'Work', edges: [{ to: 'done' }] },
      { id: 'dup', kind: 'end', outcome: 'dropped' }, { id: 'done', kind: 'end', outcome: 'completed' },
    ] } as unknown as FlowDefinition;
    const h = harness(flow, { gateTypes: { watch } });
    h.driver.start(new Upload());
    equal([seen.at(-1), h.gated().map((g) => [g.route, g.key])], ['x', [['first', 'x']]],
      'the type was handed "x" and the element records "x" — one key, resolved once, off the value as a clone carries it');
    const r = harness(flow, { gateTypes: { watch } });
    r.driver.resume(h.driver.checkpoint());
    equal(JSON.stringify(r.driver.foldInputs().filter((e) => e.kind !== 'resumed')), JSON.stringify(h.driver.foldInputs()),
      'and a resume from its checkpoint regenerates the same run — not refused `diverged` at 0');
  });

  test('a key path that resolves NOWHERE routes every branch to the type`s unresolved route and the run COMPLETES — P25 prediction 4, the pair', () => {
    // **What a MISCONFIGURED key path costs at run time, and it is the last clause of every key-path verdict
    // `checkWiring` prints** — [W100](../../doc/work-items/w100-what-a-key-path-must-satisfy.md), P25
    // prediction 4, whose scope column says the static half only was measured. `readKeyPath` gives `undefined`
    // for a path no value carries, `distinct`'s first statement sends that to `nokey`, and `nokey` is wired to
    // an `end` — so nothing refuses anything and the run reports `completed`.
    //
    // **The PAIR is two runs of ONE flow differing in the gate's `key` alone**, so no literal stands in for the
    // difference and collapsing the pair is a failure rather than a smaller case (rule 8's fourth requirement
    // on the set). One transposition is the whole of the edit.
    const keyed = (key: string): FlowDefinition => {
      const f = JSON.parse(JSON.stringify(MAPPED())) as FlowDefinition;
      (f.nodes.find((n) => n.id === 'dedupe') as unknown as { settings: Record<string, unknown> }).settings = { key };
      return f;
    };
    const run = (key: string) => {
      const h = harness(keyed(key));
      h.driver.start({});
      for (const st of MAPPED_SCRIPT) h.scheduler.settle(st.settle, 'done', st.result);
      settleSetups(h);
      const gated = h.gated();
      const routes: Record<string, number> = {};
      for (const g of gated) routes[g.route] = (routes[g.route] ?? 0) + 1;
      return {
        outcome: fold(h.driver.foldInputs()).outcome,
        routes,
        // ABSENT rather than `undefined`: ADR 0067 says the recorded key is absent where nothing resolved,
        // and an own-key read is what tells that from a key whose VALUE is undefined.
        keysSeen: [...new Set(gated.map((g) => (Object.prototype.hasOwnProperty.call(g, 'key') ? JSON.stringify(g.key) : 'ABSENT')))].sort(),
        setups: h.ids().filter((i) => i.includes(':setup:')).length,
        dispatched: h.ids().length,
      };
    };
    // The right key, derived from FILES: three series over five files, so three `first` and two `duplicate`,
    // and a `setup` task for each `first`.
    const right = run('series');
    equal([right.outcome, right.routes, right.keysSeen, right.setups],
      ['completed', { first: 3, duplicate: 2 }, ['"A"', '"B"', '"C"'], 3],
      'the control: every file keyed, one `first` per series, a per-series task for each');
    // The wrong key: `readKeyPath` reads an own key of a plain object, `seires` is not one on any of these
    // results, so every branch is handed `undefined` and `distinct` routes it `nokey`.
    const wrong = run('seires');
    equal([wrong.outcome, wrong.routes, wrong.keysSeen, wrong.setups],
      ['completed', { nokey: 5 }, ['ABSENT'], 0],
      'one transposition: 5 of 5 to nokey, NO key ever resolved, ZERO per-series tasks — and the run still COMPLETES');
    // **The difference, asserted** — so a pair collapsed to two identical runs fails here rather than
    // shrinking into a case that says nothing.
    ok(right.setups > 0 && wrong.setups === 0, `the pair differs in the work DONE: ${right.setups} per-series tasks against ${wrong.setups}`);
    ok(right.dispatched > wrong.dispatched, `and in how many tasks ran at all: ${right.dispatched} against ${wrong.dispatched}`);
    ok(right.outcome === wrong.outcome, 'and in NOTHING a run outcome can show — which is why a static verdict is what catches it');
  });

  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that was not declared at its call site');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership, which catches a duplicated name');
    equal(DECLARED_CASES.length, 20, 'and the declared list is TWENTY — nineteen of W93`s and W100`s one — written down, so a case deleted from BOTH places fails here');
  });
});

// ---- the pre-W93 checkpoint, as data ----------------------------------------------------------------
const W92_FLOW = {"flowId": "w92-map", "version": 1, "entry": "ingest", "nodes": [{"id": "ingest", "kind": "task", "type": "Ingest", "edges": [{"to": "split"}]}, {"id": "split", "kind": "map", "over": "items", "branch": "score"}, {"id": "score", "kind": "task", "type": "Work", "edges": [{"to": "collect"}]}, {"id": "collect", "kind": "join", "of": "split", "edges": [{"to": "publish"}]}, {"id": "publish", "kind": "task", "type": "Publish", "edges": [{"to": "done"}]}, {"id": "done", "kind": "end", "outcome": "completed"}]};
const W92_CHECKPOINT = {
  header: {"format": 1, "runId": "R", "flowId": "w92-map", "version": 1, "entryPayload": {"from": "caller"}},
  events: [
    {"kind": "dispatched", "taskId": "R:ingest:-:0"},
    {"kind": "outcome", "record": {"kind": "outcome", "taskId": "R:ingest:-:0", "terminalState": "done", "result": {"items": ["a", "b", "c"]}, "error": null, "attempts": 0, "schedulerTimestamp": 1, "observedAt": 0, "startTime": 1, "endTime": 2, "executionTime": 1}},
    {"kind": "regionEntered", "regionId": "split", "regionPath": "-"},
    {"kind": "region", "event": {"type": "branch.opened", "regionId": "split", "regionPath": "-", "branchPath": "0"}},
    {"kind": "region", "event": {"type": "branch.opened", "regionId": "split", "regionPath": "-", "branchPath": "1"}},
    {"kind": "region", "event": {"type": "branch.opened", "regionId": "split", "regionPath": "-", "branchPath": "2"}},
    {"kind": "dispatched", "taskId": "R:score:0:0"},
    {"kind": "dispatched", "taskId": "R:score:1:0"},
    {"kind": "dispatched", "taskId": "R:score:2:0"},
    {"kind": "outcome", "record": {"kind": "outcome", "taskId": "R:score:0:0", "terminalState": "done", "result": {"by": "R:score:0:0"}, "error": null, "attempts": 0, "schedulerTimestamp": 1, "observedAt": 0, "startTime": 1, "endTime": 2, "executionTime": 1}},
    {"kind": "region", "event": {"type": "branch.arrived", "regionId": "split", "regionPath": "-", "branchPath": "0"}},
  ],
};
