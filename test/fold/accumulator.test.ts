/**
 * Ladder L1 — **the fold is ONE accumulator**: `spec/run-state.md` v0.29 `RN-R43`, `RN-R1` and `RN-R2`,
 * [ADR 0120](../../doc/decisions/0120-the-fold-is-one-accumulator-and-step-stays-pure.md),
 * [W194](../../doc/work-items/w194-the-fold-is-one-accumulator.md), P39 decisions 1-3, 5 and 6.
 *
 * **The expected value is the ORACLE's** — `test/fold/oracle-run-state.ts`, the fold as it was before W194, sliced
 * verbatim from `c1aefb0` and never edited again (`doc/workflow.md` section 5 rule 4: not the code under test). P39
 * decision 5 says what `fold` returns moves on NO sequence, so the oracle's value IS the spec's here, and every claim
 * below compares against it — deep AND key order, since `deepEqual` alone would let a re-ordered `nodes` record through.
 * The identities (the SAME object back) and the cost (`RN-R43`) are the spec's own sentences, hand-written.
 *
 * **Three corpora**: hand-written sequences over every arm of `step`; a SEEDED generator over every kind, including the
 * duplicates and orders no driver appends (the arms that return the state they were handed exist for those); and the
 * sequences a `Driver` appends over every flow in `spec/examples/valid/`, on a double, under four drains.
 */
import { collected, deepEqual, equal, listDir, ok, readText, ROOT, suite } from '../harness.ts';
import { emptyState, fold, step, type FoldInput, type RegionRun, type RunOutcome, type RunState } from '../../src/fold/run-state.ts';
import { Accumulator, foldWith, stepWith, type FoldCounter } from '../../src/fold/accumulator.ts';
import * as oracle from './oracle-run-state.ts';
import { Driver } from '../../src/driver/driver.ts';
import { liveToken } from '../../src/fold/policies.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import type { TerminalState } from '../../src/definition/types.ts';
import type { RegionEvent } from '../../src/driver/events.ts';
import { CORPUS_LANGUAGES } from '../definition/corpus-types.ts';

// --- fixtures, hand-written from the spec -------------------------------------------------------------------------

const settled = (taskId: string, state: TerminalState, result: unknown = state === 'done' ? { v: { of: taskId } } : null): FoldInput => ({
  kind: 'outcome',
  record: {
    kind: 'outcome', taskId, terminalState: state, result, error: state === 'done' ? null : 'boom',
    attempts: 0, schedulerTimestamp: 1, observedAt: 1, startTime: 1, endTime: 2, executionTime: 1,
  },
});
const resolved = (taskId: string, resolvedAs: 'done' | 'failed', result: unknown = resolvedAs === 'done' ? { by: 'ana' } : null): FoldInput => ({
  kind: 'resolution',
  record: { kind: 'resolution', taskId, resolvedAs, result, error: resolvedAs === 'done' ? null : 'declined', actor: 'ana', observedAt: 2 },
});
const dispatched = (taskId: string): FoldInput => ({ kind: 'dispatched', taskId });
const asked = (taskId: string, input: unknown): FoldInput => ({ kind: 'asked', taskId, input });
const attempted = (taskId: string, attemptNumber: number): FoldInput => ({ kind: 'attempted', taskId, attemptNumber });
const region = (type: RegionEvent['type'], regionId: string, regionPath: string, branchPath: string): FoldInput =>
  ({ kind: 'region', event: { type, regionId, regionPath, branchPath, at: 'x', reason: 'failed', resolvedAs: 'done' } as RegionEvent });
const entered = (regionId: string, regionPath: string): FoldInput => ({ kind: 'regionEntered', regionId, regionPath });
const joined = (regionId: string, regionPath: string, fired: boolean): FoldInput => ({ kind: 'joinSettled', regionId, regionPath, joinId: 'j', fired });
const end: FoldInput = { kind: 'pathEnded', reason: 'end', at: 'done' };
const noEdge: FoldInput = { kind: 'pathEnded', reason: 'no-eligible-edge', at: 'a' };
const halt: FoldInput = { kind: 'halted', reason: 'Boom: the store is down' };
/** 0.7.0's name for `halted` — read, never written (ADR 0102 rule 3). Not a `FoldInput` member, hence the cast. */
const legacyStopped = { kind: 'stopped', reason: 'Boom: 0.7.0' } as unknown as FoldInput;
const request: FoldInput = { kind: 'cancelRequested', actor: 'ana', reason: 'no longer needed' };
const stopped: FoldInput = { kind: 'interrupted', actor: 'ops', reason: null };
const paused: FoldInput = { kind: 'paused', actor: 'ops' };
const unpaused: FoldInput = { kind: 'unpaused', actor: 'ops' };
const resumed = (...taskIds: string[]): FoldInput => ({ kind: 'resumed', taskIds });
const gated = (gateId: string, branchPath: string, route: string, key?: unknown): FoldInput =>
  (key === undefined ? { kind: 'gated', gateId, branchPath, route } : { kind: 'gated', gateId, branchPath, route, key });

const A = 'r1:a:-:0', B = 'r1:b:-:0', C0 = 'r1:c:0:0', C1 = 'r1:c:1:0', D = 'r1:d:1.0:0', Q = 'r1:q:-:0';

/** One row per arm and per section 3 outcome — every arm of `step`, including the ones that hand back what they were given. */
const HAND: Record<string, FoldInput[]> = {
  'linear, completed': [dispatched(A), settled(A, 'done'), dispatched(B), settled(B, 'done'), end],
  'no eligible edge: failed': [dispatched(A), settled(A, 'failed'), noEdge],
  'an optional failure routed on to an end: completed': [dispatched(A), settled(A, 'failed'), end],
  'no path end reported: the node states decide': [dispatched(A), settled(A, 'failed')],
  'a fan-out, a branch parked and resolved, the join fired': [
    dispatched(A), settled(A, 'done'), entered('split', '-'), region('branch.opened', 'split', '-', '0'), region('branch.opened', 'split', '-', '1'),
    dispatched(C0), dispatched(C1), settled(C0, 'done'), region('branch.arrived', 'split', '-', '0'), settled(C1, 'user_action'),
    region('branch.suspended', 'split', '-', '1'), resolved(C1, 'done'), region('branch.resumed', 'split', '-', '1'),
    region('branch.arrived', 'split', '-', '1'), joined('split', '-', true), dispatched(B), settled(B, 'done'), end,
  ],
  'a branch routed away from its join: stuck (Q4)': [
    entered('split', '-'), region('branch.opened', 'split', '-', '0'), region('branch.opened', 'split', '-', '1'), dispatched(C0), dispatched(C1),
    settled(C0, 'done'), region('branch.arrived', 'split', '-', '0'), settled(C1, 'done'), region('branch.exited', 'split', '-', '1'), end,
  ],
  'a branch lost, the join reported unsatisfiable: stuck outranks failed (RN-R10)': [
    entered('split', '-'), region('branch.opened', 'split', '-', '0'), dispatched(C0), settled(C0, 'failed'), region('branch.lost', 'split', '-', '0'),
    joined('split', '-', false), noEdge,
  ],
  'a map over an empty list: entered, opened nothing': [entered('each', '-')],
  'a nested instance at a dotted path, its task still parked (Q6, Q17)': [
    entered('outer', '-'), region('branch.opened', 'outer', '-', '1'), entered('inner', '1'), region('branch.opened', 'inner', '1', '1.0'),
    region('branch.opened', 'inner', '1', '1.10'), dispatched(D), settled(D, 'user_action'), region('branch.suspended', 'inner', '1', '1.0'),
    region('branch.suspended', 'inner', '1', '1.0'), region('branch.opened', 'inner', '1', '1.0'), region('branch.lost', 'inner', '1', '1.0'),
    joined('inner', '1', true), region('branch.arrived', 'outer', '-', '1'), joined('outer', '-', true), end,
  ],
  'a cancelled settlement: RN-R28, and a request after it moves nothing': [dispatched(A), dispatched(B), settled(A, 'cancelled'), request, settled(B, 'done')],
  'cancelled by its owner: cancelling, then cancelled; a second request moves nothing': [dispatched(A), request, request, settled(A, 'cancelled')],
  'stopped, a second stop, resumed elsewhere': [dispatched(A), stopped, stopped, resumed(A), resumed(), attempted(A, 2), settled(A, 'done'), end],
  'paused, a second pause, unpaused, an unpause of a run not paused': [dispatched(A), paused, paused, unpaused, unpaused, settled(A, 'done'), end],
  'halted, and the legacy `stopped`': [dispatched(A), halt, settled(A, 'done'), legacyStopped, end],
  'an ask, a second ask, answered': [asked(Q, { m: [1, { k: 'v' }] }), asked(Q, 'again'), resolved(Q, 'done', { answer: [{ n: 1 }] }), end],
  'an ask declined': [asked(Q, null), resolved(Q, 'failed'), noEdge],
  'gates, with a nested key and none': [dispatched(A), gated('g', '-', 'first', { k: [{ n: 1 }] }), gated('g', '0', 'nokey'), settled(A, 'done'), end],
  'attempts: retried, an unknown task, a duplicate dispatch (Q13)': [
    attempted(A, 1), dispatched(A), attempted(A, 1), attempted(A, 2), dispatched(A), settled(A, 'user_action'), resolved(A, 'failed'), noEdge,
  ],
  'a settlement before its dispatch, then a dispatch of it': [settled(B, 'done'), dispatched(B), end],
  'two branches parked and the FIRST parked again: the order kept, then both resumed': [
    entered('split', '-'), region('branch.opened', 'split', '-', '0'), region('branch.opened', 'split', '-', '1'), dispatched(C0), dispatched(C1),
    settled(C0, 'user_action'), region('branch.suspended', 'split', '-', '0'), settled(C1, 'user_action'), region('branch.suspended', 'split', '-', '1'),
    region('branch.suspended', 'split', '-', '0'), resolved(C1, 'done'), region('branch.resumed', 'split', '-', '1'), region('branch.arrived', 'split', '-', '1'),
  ],
  'an opener NAMED `__proto__` (FD-V16 admits it), its branch routed away: stuck — an own key, never the prototype (C1)': [
    entered('__proto__', '-'), region('branch.opened', '__proto__', '-', '0'), dispatched(C0), settled(C0, 'done'),
    region('branch.exited', '__proto__', '-', '0'), end,
  ],
  'a task id, a region path and a branch path NAMED `__proto__` — inputs no driver appends, each an own key (C1)': [
    attempted('__proto__', 1), entered('split', '__proto__'), region('branch.opened', 'split', '__proto__', '0'),
    region('branch.arrived', 'split', '__proto__', '__proto__'), joined('split', '__proto__', true), end,
  ],
  'two NON-integer instance paths under one opener, the second touched first: key order kept (O3)': [
    entered('split', '-'), entered('split', '0.1'), joined('split', '0.1', true), region('branch.opened', 'split', '-', '0'),
    joined('split', '-', true), end,
  ],
  'a join settled for an instance never entered, then a second instance entered and left: stuck': [joined('m', '-', true), entered('m', '-'), entered('m', '0'), end],
};

/** A small seeded PRNG (mulberry32): the generated corpus is the same in every runtime and on every run. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The generated corpus: every kind, over a small alphabet so that ids, instances and branches COLLIDE often. */
function generated(count: number, seed: number): FoldInput[][] {
  const r = rng(seed);
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(r() * xs.length)]!;
  const TASKS = [A, B, C0, C1, D, Q, 'r2:a:-:0'];
  const INSTANCES: [string, string][] = [['split', '-'], ['split', '0'], ['split', '0.1'], ['each', '-'], ['each', '1']];
  const BRANCHES = ['0', '1', '2', '10', '1.0'];
  const TYPES: RegionEvent['type'][] = ['branch.opened', 'branch.arrived', 'branch.exited', 'branch.lost', 'branch.suspended', 'branch.resumed'];
  const nested = () => ({ n: Math.floor(r() * 9), deep: [{ k: pick(['a', 'b']) }] });
  const one = (): FoldInput => {
    switch (Math.floor(r() * 22)) {
      case 0: case 1: case 2: return dispatched(pick(TASKS));
      case 3: return asked(pick(TASKS), nested());
      case 4: case 5: return settled(pick(TASKS), pick(['done', 'failed', 'user_action', 'cancelled'] as const), r() < 0.5 ? nested() : null);
      case 6: return resolved(pick(TASKS), pick(['done', 'failed'] as const), r() < 0.5 ? nested() : null);
      case 7: case 8: case 9: { const [id, p] = pick(INSTANCES); return region(pick(TYPES), id, p, pick(BRANCHES)); }
      case 10: { const [id, p] = pick(INSTANCES); return entered(id, p); }
      case 11: { const [id, p] = pick(INSTANCES); return joined(id, p, r() < 0.6); }
      case 12: return r() < 0.6 ? end : noEdge;
      case 13: return r() < 0.7 ? halt : legacyStopped;
      case 14: return { kind: 'cancelRequested', actor: pick(['ana', 'bob']), reason: r() < 0.5 ? null : 'why' };
      case 15: return { kind: 'interrupted', actor: pick(['ops', 'bob']), reason: null };
      case 16: return r() < 0.5 ? paused : unpaused;
      case 17: return resumed(...TASKS.filter(() => r() < 0.3));
      case 18: return gated(pick(['g', 'h']), pick(['-', '0']), pick(['first', 'nokey']), r() < 0.5 ? nested() : undefined);
      case 19: case 20: return attempted(pick(TASKS), 1 + Math.floor(r() * 3));
      default: return dispatched(pick(TASKS));
    }
  };
  const out: FoldInput[][] = [];
  for (let s = 0; s < count; s += 1) {
    const len = 1 + Math.floor(r() * 30);
    const seq: FoldInput[] = [];
    for (let i = 0; i < len; i += 1) seq.push(one());
    out.push(seq);
  }
  return out;
}
const GENERATED = generated(240, 0x5eed194);

// --- the driver corpus: every valid flow, on a double, under four drains -------------------------------------------

const EX = `${ROOT}spec/examples`;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as {
  workers: Record<string, { url: string }>; nodeTypes: Record<string, { worker: string }>; groups: Record<string, unknown>;
  pools: Record<string, { type: string }>; predicates: string[];
};

/** L2's scheduler double: it queues nothing and runs nothing; the drain below fires what a scheduler would. */
class Double {
  readonly added: string[] = [];
  private readonly listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void { this.added.push((task as { id: string }).id); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  fire(type: string, detail: unknown): void { for (const fn of this.listeners.get(type) ?? []) fn({ detail }); }
}

/** What every task returns: a value every corpus flow's `over`, `needs` and gate key can read (needs.test.ts's per-flow results, merged). */
const RESULT = (id: string) => ({
  by: id, from: 'ingest', items: ['a', 'b', 'c'], rows: ['p', 'q'], files: ['a', 'b', 'c'], slots: ['x', 'y'],
  config: { threshold: 7 }, runLabel: 'nightly', series: { id: ['s1', 's1', 's2'][Number(id.split(':')[2]) % 3] ?? 's1' },
});

type Drain = 'in order' | 'reverse' | 'alternate failures' | 'parked, attempted, resolved' | 'parked and left' | 'an uncloneable result first';
const DRAINS: Drain[] = ['in order', 'reverse', 'alternate failures', 'parked, attempted, resolved', 'parked and left', 'an uncloneable result first'];

/**
 * One flow driven to rest under one drain; its fold-input sequence. Bounded, and the bound is asserted not hit. Six drains,
 * so the corpus holds more than the happy path: dispatch order and its reverse (a fan-out's completion order is a
 * property of a SAMPLE — section 5 rule 5), optional-style failures, every task parked by `user_action` after an attempt
 * and resolved by a person — or left parked — and a run HALTED by a result that cannot be cloned.
 */
function driven(def: FlowDefinition, drain: Drain): FoldInput[] {
  const s = new Double();
  const driver = new Driver(def, {
    runId: 'r1', scheduler: s, createTask: (c) => c,
    predicates: new Map(reg.predicates.map((n, i) => [n, () => i % 2 === 0])),
    workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, groups: Object.keys(reg.groups ?? {}), languages: CORPUS_LANGUAGES,
    joinPolicy: liveToken as JoinPolicy,
    // The fold's corpus, not FD-R4's: one RESULT answers every ask and settles every task, whatever its schema says.
    validateBoundaries: false,
    onRunFailure: () => {},
  });
  driver.start(RESULT('payload'));
  const settledIds = new Set<string>();
  let flip = false;
  for (let guard = 0; guard < 400; guard += 1) {
    const open = s.added.filter((id) => !settledIds.has(id));
    if (open.length > 0) {
      const id = drain === 'reverse' ? open[open.length - 1]! : open[0]!;
      settledIds.add(id);
      const detail = { id, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, result: RESULT(id) };
      if (drain === 'parked, attempted, resolved' || drain === 'parked and left') {
        s.fire('task.running', { id, state: 'running', attemptNumber: 1, attempts: 0, timestamp: 1 });
        s.fire('task.failed', { ...detail, state: 'user_action', error: 'boom' });
        s.fire('task.user_action', { ...detail, state: 'user_action', error: 'boom' });
      } else if (drain === 'an uncloneable result first' && settledIds.size === 1) {
        // OR-R6: a result `structuredClone` refuses HALTS the run (`UncloneableResult`).
        s.fire('task.completed', { ...detail, state: 'done', result: { f: () => 1 } });
      } else if (drain === 'alternate failures' && (flip = !flip)) {
        s.fire('task.failed', { ...detail, state: 'failed', error: 'boom' });
      } else {
        s.fire('task.completed', { ...detail, state: 'done' });
      }
      continue;
    }
    // Nothing in flight: answer the first parked task or ask, if any; otherwise the run is at rest. Read with the ORACLE,
    // so the corpus does not depend on the code under test — a broken fold must fail a CASE, not the suite's import.
    const inputs = driver.foldInputs();
    const parked = oracle.fold(inputs);
    const waiting = Object.entries(parked.nodes).find(([, n]) => n.state === 'suspended');
    if (waiting === undefined || parked.outcome !== 'awaiting_action' || drain === 'parked and left') return [...inputs];
    if (!driver.resolve(waiting[0], 'done', { result: RESULT(waiting[0]), actor: 'ana' })) return [...inputs];
  }
  // Not at rest in 400 steps: the sequence is kept EMPTY, which the case below refuses by name — never a throw at import.
  return [];
}

const validNames = (await listDir(`${EX}/valid`)).filter((n) => n.endsWith('.flow.json')).sort();
const DRIVEN: Record<string, FoldInput[]> = {};
for (const name of validNames) {
  const def = JSON.parse(await readText(`${EX}/valid/${name}`)) as FlowDefinition;
  for (const d of DRAINS) DRIVEN[`${name} / ${d}`] = driven(def, d);
}

// --- the comparisons ---------------------------------------------------------------------------------------------

/** Deep-equal AND the same key order everywhere — `JSON.stringify` reads keys in their own order, `deepEqual` does not. */
function same(a: unknown, b: unknown): boolean {
  return deepEqual(a, b) && JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Every prefix of `seq`: the new `fold`, the new `step` reduction and the oracle's fold, all equal. Returns the first
 * prefix length at which any two differ, or -1 — and `-(n + 2)` where an accumulator loaded from the oracle's state at
 * prefix `n` and fed the rest differs from the oracle's fold of the whole.
 */
/** How many loaded-accumulator comparisons `firstDivergence` made — a floor on it is what keeps that loop from going empty (W4). */
let loadedComparisons = 0;
function firstDivergence(seq: readonly FoldInput[]): number {
  let stepped = emptyState();
  let o = oracle.emptyState();
  const states = [o];
  for (let n = 1; n <= seq.length; n += 1) {
    stepped = step(stepped, seq[n - 1]!);
    o = oracle.step(o, seq[n - 1]!);
    states.push(o);
    const folded = fold(seq.slice(0, n));
    if (!same(folded, o) || !same(stepped, o) || !same(oracle.fold(seq.slice(0, n)), o)) return n;
  }
  // And an accumulator LOADED from each prefix's state and fed the rest — several applies over a handed state, which
  // neither `fold` (an empty base) nor `step` (one apply) reaches: the counts kept while the base is read through.
  for (let n = 0; n < seq.length; n += 1) {
    const acc = Accumulator.load(states[n]!);
    for (const e of seq.slice(n)) acc.apply(e);
    loadedComparisons += 1;
    if (!same(acc.materialise(), o)) return -(n + 2);
  }
  return same(fold([]), oracle.fold([])) ? -1 : 0;
}

/** Every state the oracle reaches over `seq`, the empty one first. */
function oracleStates(seq: readonly FoldInput[]): RunState[] {
  const out = [oracle.emptyState()];
  for (const e of seq) out.push(oracle.step(out[out.length - 1]!, e));
  return out;
}

function deepFreeze<T>(v: T): T {
  if (v !== null && typeof v === 'object' && !Object.isFrozen(v)) {
    Object.freeze(v);
    for (const k of Object.keys(v as object)) deepFreeze((v as Record<string, unknown>)[k]);
  }
  return v;
}

/**
 * Which of `prev`'s own objects `next` still holds, at every level a step shared before v0.29: each cell, each node
 * entry, each opener's record and each region instance, and each list's entries. (Inside an instance an INPUT touched,
 * the pre-v0.29 `joinSettled` kept the old instance's three lists and the accumulator copies them — not compared.)
 */
function sharedWith(next: RunState, prev: RunState): string[] {
  const out: string[] = [];
  const n = next as unknown as Record<string, unknown>, p = prev as unknown as Record<string, unknown>;
  for (const k of Object.keys(n)) if (typeof n[k] === 'object' && n[k] !== null && n[k] === p[k]) out.push(k);
  for (const [id, e] of Object.entries(next.nodes)) if (e === prev.nodes[id]) out.push(`nodes.${id}`);
  for (const [id, byPath] of Object.entries(next.regions)) {
    if (byPath === prev.regions[id]) out.push(`regions.${id}`);
    for (const [path, r] of Object.entries(byPath)) if (r === prev.regions[id]?.[path]) out.push(`regions.${id}.${path}`);
  }
  for (const k of ['pathEnds', 'resumes', 'gated'] as const) {
    (next[k] as unknown[]).forEach((e, i) => { if (e === (prev[k] as unknown[])[i]) out.push(`${k}.${i}`); });
  }
  return out;
}

/**
 * States no fold reaches and `RunState`'s type admits — `step` is held to the oracle on these too (P39 decision 2, *ANY
 * prev*): an instance whose `opened` and `suspended` hold a path TWICE (a `Set` would drop one), keys the type does not
 * name on an instance and on the state (a spread kept them), and cells that contradict each other.
 */
const ODD: [string, RunState][] = [
  ['an instance holding a path twice, with a key the type does not name', {
    ...emptyState(), runId: 'r1',
    nodes: { [C0]: { runId: 'r1', nodeId: 'c', branchPath: '0', flowAttempt: 0, attemptNumber: null, state: 'suspended', result: null, error: null } },
    regions: { split: { '-': { opened: ['0', '0', '1'], settled: { 1: 'arrived' }, suspended: ['0', '1', '0'], joined: null, note: 'kept' } as RegionRun } },
  }],
  ['a state with a key the type does not name, halted with a task in flight and a request recorded', {
    ...oracle.fold([dispatched(A), dispatched(B), settled(B, 'done')]), haltedBy: 'Boom: by hand', cancelRequest: { actor: 'ana', reason: null },
    interruption: { actor: 'ops', reason: null }, paused: true, extra: { kept: true },
  } as RunState],
  ['a node keyed by an id no driver mints (T1, T2)', {
    ...emptyState(),
    nodes: { nope: { runId: 'r1', nodeId: 'nope', branchPath: '-', flowAttempt: 0, attemptNumber: null, state: 'running', result: null, error: null } },
  }],
  ['a joined instance with nothing opened beside a live one', {
    ...emptyState(),
    regions: { split: { '-': { opened: [], settled: {}, suspended: [], joined: true }, 0: { opened: ['0'], settled: {}, suspended: [], joined: false } } },
    pathEnds: [{ reason: 'end', at: 'x' }, { reason: 'no-eligible-edge', at: 'y' }],
  }],
];

/** One input per arm, aimed at what `prefixState` holds — the probes `step` is held to on ANY state. */
const PROBES: FoldInput[] = [
  dispatched(A), dispatched('r1:fresh:-:0'), asked(Q, { m: [1] }), asked('r1:fresh-ask:-:0', { m: [2] }), settled(A, 'done'),
  settled(C0, 'cancelled'), resolved(A, 'done'), resolved(Q, 'failed'), region('branch.opened', 'split', '-', '0'),
  region('branch.arrived', 'split', '-', '1'), region('branch.suspended', 'split', '-', '1'), region('branch.resumed', 'split', '-', '1'),
  entered('split', '-'), entered('fresh', '-'), joined('split', '-', true), joined('fresh', '0', false), end, noEdge, halt,
  legacyStopped, request, stopped, paused, unpaused, resumed(A), gated('g', '-', 'first', { k: [1] }), attempted(A, 3),
  attempted('r1:nobody:-:0', 1), dispatched('nope'), asked('nope', 1), attempted('nope', 2), settled('nope', 'done'),
];
const OUTCOMES: RunOutcome[] = ['running', 'completed', 'failed', 'awaiting_action', 'halted', 'stuck', 'cancelled', 'cancelling', 'interrupted'];

const SUITE = 'L1 — RN-R43: the fold is ONE accumulator — fold and step equal to the pre-W194 fold at every prefix, step`s identities kept, linear in its inputs';
const DECLARED_CASES = [
  'the ORACLE equivalence over the hand-written corpus: at every prefix, fold, the stepped reduction and the oracle`s fold are equal, key order included',
  'the ORACLE equivalence over a SEEDED generated corpus — every kind, duplicates and orders no driver appends — at every prefix',
  'the ORACLE equivalence over the sequences a DRIVER appends over every valid corpus flow, on a double, under six drains',
  'ANY prev: step over every oracle state of the hand-written corpus and three no fold reaches, its outcome forced to each of the nine, equals the oracle`s step on every probe — the SAME object exactly where the oracle`s is, sharing what it shared',
  'the seven early-return arms hand back the state they were handed, itself',
  'a hand-built prev whose outcome disagrees with its cells keeps it across paused, gated, attempted and a resumed with no interruption — and an arm that recomputes moves it',
  'the precedence recomputed on every REACHABLE state is the stored outcome — the arms that do not recompute are invisible on a fold',
  'the COPY claim, NESTED, both ways: an ask`s input and a gate`s key are copies of what the input carried, a settlement`s result is the input`s own object',
  'a materialised state is unchanged by a later apply to its accumulator, nested — and the next materialisation carries the apply',
  'RN-R1 and RN-R2: two folds of one array are independent values, folding mutates neither the inputs nor a frozen prev',
  'RN-R43: the fold`s counted work at 2,000 map items is below 6x its work at 500 — linear, where the spread-per-step was quadratic',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, async () => {
    // The CONTROL that the rows reach what they are named for — section 3's outcomes, hand-written.
    equal(Object.values(HAND).map((s) => oracle.fold(s).outcome),
      ['completed', 'failed', 'completed', 'failed', 'completed', 'stuck', 'stuck', 'stuck', 'awaiting_action', 'cancelled', 'cancelled',
        'completed', 'completed', 'halted', 'completed', 'failed', 'completed', 'failed', 'completed', 'awaiting_action', 'stuck', 'completed', 'completed', 'stuck'],
      'the CONTROL: each hand-written row reaches the outcome it is named for, on the oracle');
    const before = loadedComparisons;
    for (const [name, seq] of Object.entries(HAND)) equal(firstDivergence(seq), -1, `${name}: the first prefix at which fold, step and the oracle differ — -1 for none`);
    // The loaded-continuation loop RAN: one comparison per element of every row (the only observer of the counts kept
    // over a handed base across more than one apply — the adequacy reader's W5, W6).
    equal(loadedComparisons - before, Object.values(HAND).reduce((n, seq) => n + seq.length, 0), 'an accumulator loaded from EVERY prefix of every row was fed the rest');
    // The ORACLE is the c1aefb0 slice, byte for byte (ADR 0120 rule 8, *never edited again* — held, not trusted). Re-derive:
    // `git show c1aefb0:src/fold/run-state.ts | sed -n 455,833p | sha256sum`. Node and deno read the file; the browser
    // bundle does not carry it, and the skip is asserted rather than left to a silent difference.
    if (ROOT === '/__repo__/') {
      ok(typeof (globalThis as Record<string, unknown>).Deno === 'undefined', 'the oracle digest is skipped ONLY in the browser bundle');
    } else {
      const text = await readText(`${ROOT}test/fold/oracle-run-state.ts`);
      const body = text.slice(text.indexOf('export function emptyState(): RunState {'), text.lastIndexOf('\n\nexport { withOutcome as oracleWithOutcome };')) + '\n';
      const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body)))].map((b) => b.toString(16).padStart(2, '0')).join('');
      equal(digest, '044480b72b3933c9d0ae73ab06bf2014e06e280cb8376b62ca360418b6ebc906', 'the oracle is lines 455-833 of src/fold/run-state.ts at c1aefb0, unedited');
    }
  });

  test(DECLARED_CASES[1]!, () => {
    // The ARRANGEMENT: the generator reaches every kind and all nine outcomes — otherwise "every kind" is a hope.
    const kinds = new Set(GENERATED.flat().map((e) => e.kind as string));
    equal([...kinds].sort(), ['asked', 'attempted', 'cancelRequested', 'dispatched', 'gated', 'halted', 'interrupted', 'joinSettled', 'outcome',
      'pathEnded', 'paused', 'region', 'regionEntered', 'resolution', 'resumed', 'stopped', 'unpaused'], 'the generated corpus holds every kind');
    const reached = new Set(GENERATED.flatMap((s) => oracleStates(s).map((x) => x.outcome)));
    equal([...reached].sort(), [...OUTCOMES].sort(), 'and its prefixes reach every one of the nine outcomes');
    for (const [i, seq] of GENERATED.entries()) equal(firstDivergence(seq), -1, `generated sequence ${i}: the first prefix that differs — -1 for none`);
  });

  test(DECLARED_CASES[2]!, () => {
    equal(Object.keys(DRIVEN).length, validNames.length * DRAINS.length, 'every valid corpus flow, under every drain');
    ok(validNames.length >= 20, `the valid corpus is read from disk: ${validNames.length} flows`);
    // The ARRANGEMENT: the drains reach more than the happy path — parked tasks, resolutions, attempts, regions, gates, asks.
    const kinds = new Set(Object.values(DRIVEN).flat().map((e) => e.kind as string));
    for (const k of ['dispatched', 'outcome', 'resolution', 'attempted', 'region', 'regionEntered', 'joinSettled', 'pathEnded', 'gated', 'asked']) {
      ok(kinds.has(k), `the driven corpus holds a \`${k}\` element`);
    }
    const outcomes = new Set(Object.values(DRIVEN).map((s) => oracle.fold(s).outcome));
    for (const o of ['completed', 'failed', 'awaiting_action', 'halted']) ok(outcomes.has(o as RunOutcome), `and a run that ends \`${o}\` — reached: ${[...outcomes].join(', ')}`);
    for (const [name, seq] of Object.entries(DRIVEN)) {
      ok(seq.length > 0, `${name}: the driver appended something, and the drain came to rest in 400 steps`);
      equal(firstDivergence(seq), -1, `${name}: the first prefix at which fold, step and the oracle differ — -1 for none`);
    }
  });

  test(DECLARED_CASES[3]!, () => {
    let compared = 0, identical = 0;
    const handed: [string, RunState][] = [
      ...Object.entries(HAND).flatMap(([name, seq]) => oracleStates(seq).map((s, n) => [`${name} at ${n}`, s] as [string, RunState])),
      ...ODD,
    ];
    for (const [name, reached] of handed) {
      for (const outcome of OUTCOMES) {
        const prev = deepFreeze(structuredClone({ ...reached, outcome }));
        for (const probe of PROBES) {
          let want: RunState | Error, got: RunState | Error;
          try { want = oracle.step(prev, probe); } catch (e) { want = e as Error; }
          try { got = step(prev, probe); } catch (e) { got = e as Error; }
          const where = `${name}, outcome forced to ${outcome}, ${probe.kind}`;
          if (want instanceof Error) {
            ok(got instanceof Error && got.name === want.name && got.message === want.message, `${where}: throws as the oracle does — ${want.message}`);
            continue;
          }
          ok(!(got instanceof Error), `${where}: does not throw where the oracle does not — ${(got as Error)?.message}`);
          ok(same(got, want), `${where}: the same state as the oracle's step, key order included`);
          equal(got === prev, want === prev, `${where}: the SAME object back exactly where the oracle's is`);
          equal(sharedWith(got as RunState, prev), sharedWith(want, prev), `${where}: and it holds the same of prev's own objects the oracle's does`);
          compared += 1;
          if (want === prev) identical += 1;
        }
      }
    }
    // The ARRANGEMENT: both halves of the identity claim were exercised, many times each.
    ok(identical > 100 && compared - identical > 100, `both sides of the identity were reached: ${identical} handed back, ${compared - identical} new`);
  });

  test(DECLARED_CASES[4]!, () => {
    // `src/fold/run-state.ts` at c1aefb0, the seven arms that `return prev` (P39 decision 2), each from a state that
    // takes it — and its CONTROL, the same arm from a state that does not, which must be a NEW object.
    const settledRun = fold([dispatched(A), settled(A, 'done')]);
    const cancelledRun = fold([dispatched(A), settled(A, 'cancelled')]);
    const requested = fold([dispatched(A), request]);
    const stoppedRun = fold([dispatched(A), stopped]);
    const pausedRun = fold([dispatched(A), paused]);
    const askedRun = fold([asked(Q, { m: 1 })]);
    const enteredRun = fold([entered('each', '-')]);
    const rows: [string, RunState, FoldInput, RunState, FoldInput][] = [
      [':480 a second cancel request', requested, request, settledRun, request],
      [':480 a request after a cancelled settlement', cancelledRun, request, settledRun, request],
      [':487 a second stop', stoppedRun, stopped, settledRun, stopped],
      [':496 a second pause', pausedRun, paused, settledRun, paused],
      [':496 an unpause of a run not paused', settledRun, unpaused, pausedRun, unpaused],
      [':509 a dispatch of a task already in nodes (Q13)', settledRun, dispatched(A), settledRun, dispatched(B)],
      [':528 an ask of a task already in nodes', askedRun, asked(Q, 'again'), askedRun, asked('r1:q2:-:0', 'again')],
      [':555 an instance already entered', enteredRun, entered('each', '-'), enteredRun, entered('each', '0')],
      [':593 an attempt of a task not in nodes', settledRun, attempted(B, 1), settledRun, attempted(A, 1)],
    ];
    for (const [arm, from, input, control, controlInput] of rows) {
      equal(step(from, input) === from, true, `${arm}: the SAME object back`);
      equal(step(control, controlInput) === control, false, `${arm}: and the CONTROL, a state the arm moves, is a NEW object`);
    }
  });

  test(DECLARED_CASES[5]!, () => {
    // A task in flight, and a state that says the run COMPLETED — a hand-built `prev`, never a fold's.
    const lying: RunState = { ...fold([dispatched(A)]), outcome: 'completed' };
    for (const input of [paused, gated('g', '-', 'first'), attempted(A, 2), resumed(A)]) {
      const after = step(lying, input);
      equal(after.outcome, 'completed', `${input.kind}: the outcome it was handed is KEPT — this arm never recomputed it`);
      ok(same(after, oracle.step(lying, input)), `${input.kind}: and the whole state is the oracle's`);
    }
    // The CONTROL: an arm that recomputes reads the cells, as the oracle does — `running`, the task in flight.
    for (const input of [end, dispatched(B), stopped, entered('each', '-')]) {
      const after = step(lying, input);
      ok(after.outcome !== 'completed', `${input.kind}: an arm that recomputes moves it — ${after.outcome}`);
      ok(same(after, oracle.step(lying, input)), `${input.kind}: to the oracle's`);
    }
    // And a resumed WITH an interruption recomputes (RN-R32): the stop ends, the cells decide.
    const lyingStopped: RunState = { ...fold([dispatched(A), stopped]), outcome: 'completed' };
    equal(step(lyingStopped, resumed(A)).outcome, 'running', 'a resumed that ends an interruption recomputes: `running`');
  });

  test(DECLARED_CASES[6]!, () => {
    let states = 0;
    // ONE hand row is left out, and it is the claim's stated limit: an `attempted` for the id `__proto__` reads the
    // PROTOTYPE as an entry (the pre-v0.29 arm's own `prev.nodes[taskId]`) and CREATES one — a state whose cells moved and
    // whose outcome, by that arm's rule, did not. No driver appends it; equal to the oracle all the same (case 1).
    const PROTO_ROW = 'a task id, a region path and a branch path NAMED `__proto__` — inputs no driver appends, each an own key (C1)';
    ok(PROTO_ROW in HAND, 'the row left out exists, so leaving it out is not a silent narrowing');
    const corpus = [...Object.entries(HAND).filter(([n]) => n !== PROTO_ROW).map(([, s]) => s), ...GENERATED, ...Object.values(DRIVEN)];
    for (const seq of corpus) {
      // The oracle's states — decision 2's premise, measured on the code it was stated about — and the new fold's, whose
      // stored outcome must be what the PRE-v0.29 precedence computes over the same cells.
      const mine: RunState[] = [];
      for (let n = 0; n <= seq.length; n += 1) mine.push(fold(seq.slice(0, n)));
      for (const s of [...oracleStates(seq), ...mine]) {
        if (oracle.oracleWithOutcome(s).outcome !== s.outcome) {
          equal(oracle.oracleWithOutcome(s).outcome, s.outcome, `a reachable state whose stored outcome is not its precedence: ${JSON.stringify(s)}`);
        }
        states += 1;
      }
    }
    ok(states > 5000, `the claim is over the three corpora's every prefix: ${states} states`);
  });

  test(DECLARED_CASES[7]!, () => {
    const input = { m: [1, { k: 'v' }] };
    const key = { k: [{ n: 1 }] };
    const result = { v: [{ n: 1 }] };
    const seq: FoldInput[] = [asked(Q, input), gated('g', '-', 'first', key), dispatched(A), settled(A, 'done', result)];
    for (const [how, s] of [['fold', fold(seq)], ['step', seq.reduce(step, emptyState())]] as const) {
      const n = s.nodes[Q]!, g = s.gated[0]!;
      ok(n.input !== input && (n.input as typeof input).m !== input.m && (n.input as typeof input).m[1] !== input.m[1],
        `${how}: an ask's input is a DEEP copy — not the object, not its array, not the object inside it`);
      ok(g.key !== key && (g.key as typeof key).k !== key.k && (g.key as typeof key).k[0] !== key.k[0], `${how}: a gate's key likewise`);
      ok(s.nodes[A]!.result === result, `${how}: a settlement's result IS the record's own object (ADR 0058 consequence 3 — the share kept)`);
    }
    // A RESOLUTION's result is shared too (the pre-v0.29 `:640`), and an answered ask keeps the input copy it ALREADY
    // holds — taken once, when asked, never again (S4, S9 — the adequacy reader's).
    const answer = { a: [{ n: 1 }] };
    const parkedThenResolved = fold([dispatched(B), settled(B, 'user_action'), resolved(B, 'done', answer)]);
    ok(parkedThenResolved.nodes[B]!.result === answer, 'a resolution`s result IS the record`s own object');
    const askedState = fold([asked(Q, { m: [{ k: 'v' }] })]);
    ok(step(askedState, resolved(Q, 'done', answer)).nodes[Q]!.input === askedState.nodes[Q]!.input, 'an answered ask keeps the SAME input copy');
    // And a resumed list is a COPY of the element's (S5).
    const ids = [A];
    const r = fold([dispatched(A), resumed(...ids)]);
    const element = { kind: 'resumed', taskIds: ids } as FoldInput;
    ok(fold([dispatched(A), element]).resumes[0] !== ids && r.resumes[0]![0] === A, 'a resumed list is a copy of the element`s');
    // Direction 1: the input is mutated AFTER the fold — the state's copies do not move.
    const s = fold(seq);
    input.m[1] = { k: 'changed' };
    (key.k[0] as { n: number }).n = 99;
    equal([s.nodes[Q]!.input, s.gated[0]!.key], [{ m: [1, { k: 'v' }] }, { k: [{ n: 1 }] }], 'direction 1: mutating the inputs moves neither copy');
    // Direction 2: the STATE is mutated — the inputs do not move.
    const fresh = { m: [1, { k: 'v' }] }, freshKey = { k: [{ n: 1 }] };
    const t = fold([asked(Q, fresh), gated('g', '-', 'first', freshKey)]);
    ((t.nodes[Q]!.input as typeof fresh).m[1] as { k: string }).k = 'mutated';
    ((t.gated[0]!.key as typeof freshKey).k[0] as { n: number }).n = -1;
    equal([fresh, freshKey], [{ m: [1, { k: 'v' }] }, { k: [{ n: 1 }] }], 'direction 2: mutating the state moves neither input');
  });

  test(DECLARED_CASES[8]!, () => {
    const acc = Accumulator.load(emptyState());
    for (const e of [asked(Q, { m: [{ k: 'v' }] }), dispatched(A), entered('split', '-'), region('branch.opened', 'split', '-', '0'),
      region('branch.suspended', 'split', '-', '0'), gated('g', '-', 'first', { k: [1] }), end]) acc.apply(e);
    const first = acc.materialise();
    const snapshot = structuredClone(first);
    for (const e of [resolved(Q, 'done', { a: 1 }), attempted(A, 2), settled(A, 'done'), region('branch.opened', 'split', '-', '1'),
      region('branch.arrived', 'split', '-', '0'), joined('split', '-', true), gated('g', '0', 'nokey'), resumed(A), noEdge, paused, request]) acc.apply(e);
    ok(same(first, snapshot), 'the first materialisation is unchanged by eleven later inputs over the same node, instance and lists');
    const second = acc.materialise();
    equal([second.nodes[Q]!.state, second.nodes[A]!.attemptNumber, second.regions.split!['-']!.opened, second.gated.length, second.paused],
      ['done', 2, ['0', '1'], 2, true], 'and the next materialisation carries them');
    ok(same(second, oracle.fold([asked(Q, { m: [{ k: 'v' }] }), dispatched(A), entered('split', '-'), region('branch.opened', 'split', '-', '0'),
      region('branch.suspended', 'split', '-', '0'), gated('g', '-', 'first', { k: [1] }), end, resolved(Q, 'done', { a: 1 }), attempted(A, 2),
      settled(A, 'done'), region('branch.opened', 'split', '-', '1'), region('branch.arrived', 'split', '-', '0'), joined('split', '-', true),
      gated('g', '0', 'nokey'), resumed(A), noEdge, paused, request])), 'and equals the oracle`s fold of the eighteen');
  });

  test(DECLARED_CASES[9]!, () => {
    for (const [name, seq] of Object.entries(HAND)) {
      const before = structuredClone(seq);
      const a = fold(seq), b = fold(seq);
      ok(a !== b && a.nodes !== b.nodes && a.regions !== b.regions && a.pathEnds !== b.pathEnds, `${name}: two folds are two values (RN-R1)`);
      ok(same(a, b), `${name}: deep-equal (L3)`);
      for (const n of Object.values(a.nodes)) n.state = 'failed';
      for (const r of Object.values(a.regions).flatMap((x) => Object.values(x))) r.opened.push('mutated');
      a.pathEnds.push({ reason: 'end', at: 'mutated' });
      ok(same(b, fold(seq)), `${name}: mutating one fold's state moves no other fold's`);
      ok(same(seq, before), `${name}: and folding mutated no input`);
      // RN-R2 from a FROZEN prev: a step that wrote to the state it was handed throws in strict mode.
      for (let n = 0; n < seq.length; n += 1) {
        const prev = deepFreeze(structuredClone(fold(seq.slice(0, n))));
        ok(same(step(prev, seq[n]!), fold(seq.slice(0, n + 1))), `${name}: step over the frozen prefix of ${n} equals the fold of ${n + 1}`);
      }
    }
  });

  test(DECLARED_CASES[10]!, async () => {
    // A top-level `map` over N items, as a driver appends it (spec/run-state.md sections 2-3): the region entered, N
    // branches opened, N dispatched, each settled and arrived, the join fired, the path ended — 4N + 3 inputs.
    const mapRun = (n: number): FoldInput[] => {
      const ids = Array.from({ length: n }, (_, i) => String(i));
      return [
        entered('each', '-'), ...ids.map((b) => region('branch.opened', 'each', '-', b)), ...ids.map((b) => dispatched(`r1:work:${b}:0`)),
        ...ids.flatMap((b) => [settled(`r1:work:${b}:0`, 'done'), region('branch.arrived', 'each', '-', b)]), joined('each', '-', true), end,
      ];
    };
    const work = (n: number) => {
      const counter: FoldCounter = { visits: 0 };
      const inputs = mapRun(n);
      const s = foldWith(inputs, counter);
      equal([s.outcome, Object.keys(s.nodes).length, s.regions.each!['-']!.opened.length], ['completed', n, n], `the ${n}-item map run folds completed, ${n} nodes`);
      ok(same(s, fold(inputs)), `${n}: the counted fold IS the fold`);
      ok(counter.visits >= inputs.length, `${n}: every input is counted — ${counter.visits} >= ${inputs.length}`);
      return counter.visits;
    };
    const small = work(500), large = work(2000);
    const ratio = large / small;
    // Linear is 4x; the quadratic spread-per-step was 16x. 6x is P39 (e)'s line.
    ok(ratio < 6, `the work at 2,000 items is ${large}, at 500 ${small}: ${ratio.toFixed(2)}x, below 6x`);
    // And step's own cost is O(the state it is handed): one step over the 2,000-item state costs more than over the 500.
    const stepWork = (n: number) => {
      const prev = fold(mapRun(n));
      const c: FoldCounter = { visits: 0 };
      stepWith(prev, dispatched('r1:after:-:0'), c);
      return c.visits;
    };
    ok(stepWork(2000) > 3 * stepWork(500), 'step is O(the state it is handed) — documented, not hidden (RN-R43)');
    // ADR 0120 rule 4, LAZY: an arm that recomputes nothing and writes no record reads nothing of the state (C7).
    const lazyWork = (n: number, e: FoldInput) => {
      const c: FoldCounter = { visits: 0 };
      stepWith(fold(mapRun(n)), e, c);
      return c.visits;
    };
    for (const e of [paused, gated('g', '-', 'first'), attempted('r1:nobody:-:0', 1)]) {
      equal(lazyWork(2000, e), lazyWork(500, e), `step on \`${e.kind}\` costs the same over a 2,000-item state as over a 500-item one`);
    }
    // The counter sees only what calls `tick`, so an uncounted scan in the precedence would leave the ratio green (C2,
    // rule 8 (c)'s LIMIT). The second observer, independent of `tick`: the precedence's source iterates nothing. Node and
    // deno read the file; the browser bundle does not carry it, and the skip is asserted.
    if (ROOT !== '/__repo__/') {
      const src = await readText(`${ROOT}src/fold/accumulator.ts`);
      const from = src.indexOf('  private precedence(): RunOutcome {');
      const body = src.slice(from, src.indexOf('\n  }\n', from));
      ok(from > 0 && body.includes("return 'completed';"), 'the precedence`s body was found');
      equal(body.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n').match(/Object\.(values|keys|entries)|\bfor\b|\.some\(|\.filter\(|\.reduce\(|\.flatMap\(|\.forEach\(/g), null,
        'section 3`s precedence reads counts and scans nothing (RN-R43)');
    }
  });

  test(DECLARED_CASES[11]!, () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name));
    equal(ran, DECLARED_CASES, 'each declared case registered, in order, and no other — an emptied or renamed case fails here');
  });
});
