/**
 * Ladder L1-L2 — **a reference read costs its answer: the driver's index of a node's outputs by the prefix its readers
 * share** — [W199](../../doc/work-items/w199-the-reference-index-a-read-costs-its-answer.md) under
 * [P40](../../doc/plans/p40-what-a-reference-read-costs-inside-a-map.md) decisions 1-3 and 5,
 * [ADR 0124](../../doc/decisions/0124-a-reference-read-costs-its-answer.md).
 *
 * Until W199 every `needs` reference read took EVERY output of the node it names, asked
 * [ADR 0044](../../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)'s
 * predicate of each, and sorted the survivors ([Q735](../../doc/questions/q735.md)). The driver now keeps, inside
 * `outputsCache`, each named node's entries grouped by the first `d` segments of their branch path — `d` the depth the
 * reader and the target share — each group in branch-path order, and a read takes its group.
 *
 * **The ORACLE is the pre-W199 expression, kept HERE and not in `src/`** (`doc/workflow.md` section 5 rule 4): the
 * filter by ADR 0044's predicate — its body as it stood before W199 restated it, verbatim — and the sort by
 * `compareBranchPaths`, copied verbatim. Every read the driver makes is compared to it **by identity, entry by entry, in
 * order** — so the `one` form's chosen object is the oracle's first.
 *
 * | what | from |
 * |---|---|
 * | which outputs a reader sees | `FD-C1`, ADR 0044 rules 1-3 — the oracle's filter |
 * | in which order | `compareBranchPaths`, the order `JP-R12` and every `all` answer use — the oracle's sort |
 * | that the index is ONE source | ADR 0044 rule 2, P40 decision 2 — `visibilityKey` restates `outputIsVisible` with no change of behaviour (L1 below) |
 * | that it holds nothing of its own | ADR 0121 rule 2's condition, carried one level (ADR 0124): every entry it reaches `===` a `byNode` entry |
 */
import { collected, equal, listDir, ok, readText, ROOT, suite } from '../harness.ts';
import { Driver, type Checkpoint } from '../../src/driver/driver.ts';
import { parseTaskId } from '../../src/driver/ids.ts';
import { liveToken } from '../../src/fold/policies.ts';
import { fold } from '../../src/fold/run-state.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { allRegions, buildGraph, outputIsVisible, sharedRegionDepth, visibilityKey, type RegionSets } from '../../src/definition/regions.ts';
import { CORPUS_LANGUAGES } from '../definition/corpus-types.ts';

const EX = `${ROOT}spec/examples`;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as {
  workers: Record<string, { url: string }>; nodeTypes: Record<string, { worker: string }>; groups: Record<string, unknown>;
  pools: Record<string, { type: string }>; predicates: string[];
};

// --- the oracle: the pre-W199 expression ------------------------------------------------------------------------------

/** `outputIsVisible`'s body before W199 restated it — verbatim, so the oracle is not the code under test. */
function oracleVisible(regions: RegionSets[], readerId: string, readerPath: string, targetId: string, targetPath: string): boolean {
  const depth = sharedRegionDepth(regions, readerId, targetId);
  if (depth === 0) return true;
  const xs = readerPath === '-' ? [] : readerPath.split('.');
  const ys = targetPath === '-' ? [] : targetPath.split('.');
  for (let i = 0; i < depth; i++) {
    if (xs[i] === undefined || ys[i] === undefined) return false;
    if (xs[i] !== ys[i]) return false;
  }
  return true;
}

/** `src/driver/driver.ts`'s `compareBranchPaths`, verbatim — unexported there. */
function compareBranchPaths(a: string, b: string): number {
  const xs = a.split('.');
  const ys = b.split('.');
  for (let i = 0; i < Math.max(xs.length, ys.length); i++) {
    const d = (xs[i] === undefined ? -1 : Number(xs[i])) - (ys[i] === undefined ? -1 : Number(ys[i]));
    if (d !== 0) return d;
  }
  return 0;
}

type Entry = { path: string; result: unknown };
type Index = Map<string, Map<number, Map<string, Entry[]>>>;
interface Private {
  regions: RegionSets[];
  outputs(): Map<string, Entry[]>;
  visibleOutputs(atNodeId: string, here: string, node: string): readonly Entry[];
  outputsCache: { byNode: Map<string, Entry[]>; index: Index; examined: number } | null;
}
const priv = (d: Driver): Private => d as unknown as Private;

/** The pre-W199 resolution's visible list — the filter and the sort — over the driver's own projection. */
function oracle(d: Driver, at: string, here: string, node: string): Entry[] {
  const p = priv(d);
  return (p.outputs().get(node) ?? [])
    .filter((e) => oracleVisible(p.regions, at, here, node, e.path))
    .sort((x, y) => compareBranchPaths(x.path, y.path));
}

/** Two visible lists, compared entry by entry BY IDENTITY and in order. The first difference, or `null`. */
function sameList(got: readonly Entry[], want: readonly Entry[]): string | null {
  if (got.length !== want.length) return `${got.length} entries vs ${want.length} (${got.map((e) => e.path)} vs ${want.map((e) => e.path)})`;
  for (let i = 0; i < got.length; i += 1) {
    if (got[i] !== want[i]) return `[${i}]: ${got[i]!.path} vs ${want[i]!.path}${got[i]!.path === want[i]!.path ? ' (same path, another object)' : ''}`;
  }
  return null;
}

/** The first `d` segments, by the test's own hand — a second route to the key, never `visibilityKey`. */
function prefix(path: string, d: number): string | null {
  const segs = path === '-' ? [] : path.split('.');
  return segs.length < d ? null : JSON.stringify(segs.slice(0, d));
}

/**
 * **The whole index against a regroup of `byNode`**, independent of any read: for every `(node, depth)` the index holds,
 * its groups are exactly the node's entries grouped by their first `depth` segments (an entry with fewer in none), each
 * group in branch-path order, each entry the projection's own object. The first difference, or `null`.
 */
function indexDisagreement(d: Driver): string | null {
  const p = priv(d);
  p.outputs();
  const c = p.outputsCache;
  if (c === null) return null;
  for (const [node, byDepth] of c.index) {
    const entries = c.byNode.get(node) ?? [];
    for (const [depth, groups] of byDepth) {
      const want = new Map<string, Entry[]>();
      for (const e of entries) {
        const k = prefix(e.path, depth);
        if (k === null) continue;
        const g = want.get(k);
        if (g) g.push(e);
        else want.set(k, [e]);
      }
      for (const g of want.values()) g.sort((x, y) => compareBranchPaths(x.path, y.path));
      let n = 0;
      for (const [key, g] of groups) {
        n += 1;
        const segs = g[0] === undefined ? null : prefix(g[0].path, depth);
        if (g.length === 0) return `${node}@${depth}: an EMPTY group "${key}" kept`;
        const w = want.get(segs!);
        if (w === undefined) return `${node}@${depth}: group "${key}" has no counterpart`;
        const why = sameList(g, w);
        if (why !== null) return `${node}@${depth} group "${key}": ${why}`;
        for (const e of g) if (prefix(e.path, depth) !== segs) return `${node}@${depth} group "${key}": ${e.path} filed under the wrong key`;
      }
      if (n !== want.size) return `${node}@${depth}: ${n} groups vs ${want.size}`;
    }
  }
  return null;
}

// --- driving -------------------------------------------------------------------------------------------------------

class Double {
  readonly added: string[] = [];
  private readonly listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void { this.added.push((task as { id: string }).id); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  fire(type: string, detail: unknown): void { for (const fn of this.listeners.get(type) ?? []) fn({ detail }); }
}

/** What every corpus task returns — `test/driver/log-view.test.ts`'s value. */
const RESULT = (id: string) => ({
  by: id, from: 'ingest', items: ['a', 'b', 'c'], rows: ['p', 'q'], files: ['a', 'b', 'c'], slots: ['x', 'y'],
  config: { threshold: 7 }, runLabel: 'nightly', series: { id: ['s1', 's1', 's2'][Number(id.split(':')[2]) % 3] ?? 's1' },
});

/** What the reads saw: the first disagreement, and the arrangement — how many reads, at which depths, of which sizes. */
interface Tally {
  why: string | null;
  reads: number;
  byDepth: Map<number, number>;
  multi: number;
  empty: number;
  /** Reads whose reader holds a `one`-form reference and found more than one visible entry. */
  oneMulti: number;
  index: number;
}
const tally = (): Tally => ({ why: null, reads: 0, byDepth: new Map(), multi: 0, empty: 0, oneMulti: 0, index: 0 });

/**
 * Installs the oracle on ONE driver: every `visibleOutputs` call is answered by the driver and compared to the oracle at
 * that moment — a read mid-step, as `compose` and `resolveNeeds` make it.
 */
function watch(d: Driver, t: Tally, def: FlowDefinition): void {
  const p = priv(d);
  const orig = p.visibleOutputs;
  const forms = new Map<string, Map<string, 'one' | 'all'>>();
  for (const n of def.nodes as { id: string; needs?: Record<string, unknown>; edges?: { needs?: Record<string, unknown> }[] }[]) {
    const m = new Map<string, 'one' | 'all'>();
    for (const r of [n.needs, ...(n.edges ?? []).map((e) => e.needs)]) {
      for (const ref of Object.values(r ?? {})) {
        if (typeof ref === 'string' && !ref.startsWith('.') && !ref.startsWith('$')) m.set(ref.replace(/\?$/, ''), 'one');
        if (Array.isArray(ref)) m.set(String(ref[0]).replace(/\?$/, ''), 'all');
      }
    }
    forms.set(n.id, m);
  }
  p.visibleOutputs = function (this: Driver, at: string, here: string, node: string): readonly Entry[] {
    const got = orig.call(this, at, here, node);
    const want = oracle(d, at, here, node);
    t.reads += 1;
    const depth = sharedRegionDepth(p.regions, at, node);
    t.byDepth.set(depth, (t.byDepth.get(depth) ?? 0) + 1);
    if (want.length > 1) t.multi += 1;
    if (want.length === 0) t.empty += 1;
    if (want.length > 1 && forms.get(at)?.get(node) === 'one') t.oneMulti += 1;
    const why = sameList(got, want);
    if (why !== null && t.why === null) t.why = `${at}@${here} reading ${node} (depth ${depth}): ${why}`;
    return got;
  };
}

function driverFor(def: FlowDefinition, s: Double, onFoldInput?: () => void): Driver {
  return new Driver(def, {
    runId: 'r1', scheduler: s, createTask: (c) => c,
    predicates: new Map(reg.predicates.map((n, i) => [n, () => i % 2 === 0])),
    workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, groups: Object.keys(reg.groups ?? {}), languages: CORPUS_LANGUAGES,
    joinPolicy: liveToken as JoinPolicy,
    validateBoundaries: false,
    onRunFailure: () => {},
    ...(onFoldInput ? { onFoldInput } : {}),
  });
}

type Drain = 'in order' | 'reverse' | 'alternate failures' | 'parked, attempted, resolved' | 'parked and left' | 'every other parked, resolved last';
const DRAINS: Drain[] = ['in order', 'reverse', 'alternate failures', 'parked, attempted, resolved', 'parked and left', 'every other parked, resolved last'];

interface Driven { t: Tally; rests: Checkpoint[]; atRest: boolean; driver: Driver }

/**
 * One flow driven to rest under one drain, the oracle on every read; with `everyInput`, the WHOLE index also compared to
 * a regroup at every fold input (which catches `outputs()` up there — the other granularity is the reads-only drive).
 */
function drive(def: FlowDefinition, drain: Drain, everyInput: boolean, result: (id: string) => unknown = RESULT, payload: unknown = RESULT('payload')): Driven {
  const s = new Double();
  const t = tally();
  const ref: { d: Driver | null } = { d: null };
  const checkIndex = () => {
    if (t.why !== null || ref.d === null) return;
    t.index += 1;
    const why = indexDisagreement(ref.d);
    if (why !== null) t.why = `index: ${why}`;
  };
  const d = ref.d = driverFor(def, s, everyInput ? checkIndex : undefined);
  watch(d, t, def);
  d.start(payload);
  const rests: Checkpoint[] = [];
  const settled = new Set<string>();
  let flip = false;
  let other = false;
  let atRest = false;
  for (let guard = 0; guard < 2000; guard += 1) {
    rests.push(d.checkpoint());
    const open = s.added.filter((id) => !settled.has(id));
    if (open.length > 0) {
      const id = drain === 'reverse' ? open[open.length - 1]! : open[0]!;
      settled.add(id);
      const detail = { id, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, result: result(id) };
      if (drain === 'parked, attempted, resolved' || drain === 'parked and left' || (drain === 'every other parked, resolved last' && (other = !other))) {
        s.fire('task.running', { id, state: 'running', attemptNumber: 1, attempts: 0, timestamp: 1 });
        s.fire('task.failed', { ...detail, state: 'user_action', error: 'boom' });
        s.fire('task.user_action', { ...detail, state: 'user_action', error: 'boom' });
      } else if (drain === 'alternate failures' && (flip = !flip)) {
        s.fire('task.failed', { ...detail, state: 'failed', error: 'boom' });
      } else {
        s.fire('task.completed', { ...detail, state: 'done' });
      }
      continue;
    }
    const state = fold(d.foldInputs());
    const waiting = Object.entries(state.nodes).find(([, n]) => n.state === 'suspended');
    if (waiting === undefined || state.outcome !== 'awaiting_action' || drain === 'parked and left') {
      atRest = true;
      break;
    }
    if (!d.resolve(waiting[0], 'done', { result: result(waiting[0]), actor: 'ana' })) { atRest = true; break; }
  }
  checkIndex();
  return { t, rests, atRest, driver: d };
}

/** Resumes `def` from every checkpoint in `rests`, the oracle on the resumed driver; resolves what is parked, then drains. */
function resumeEach(def: FlowDefinition, rests: Checkpoint[], into: Tally, result: (id: string) => unknown = RESULT): number {
  let resumed = 0;
  for (const cp of rests) {
    const s = new Double();
    const d = driverFor(def, s);
    watch(d, into, def);
    d.resume(cp);
    resumed += 1;
    const settled = new Set<string>();
    for (let guard = 0; guard < 2000; guard += 1) {
      const why = indexDisagreement(d);
      if (why !== null && into.why === null) into.why = `resumed at ${cp.events.length}: index: ${why}`;
      const open = s.added.filter((id) => !settled.has(id));
      if (open.length > 0) {
        const id = open[0]!;
        settled.add(id);
        s.fire('task.completed', { id, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, result: result(id), state: 'done' });
        continue;
      }
      const state = fold(d.foldInputs());
      const waiting = Object.entries(state.nodes).find(([, n]) => n.state === 'suspended');
      if (waiting === undefined || !d.resolve(waiting[0], 'done', { result: result(waiting[0]), actor: 'ana' })) break;
    }
  }
  return resumed;
}

const validNames = (await listDir(`${EX}/valid`)).filter((n) => n.endsWith('.flow.json')).sort();
const DEFS: Record<string, FlowDefinition> = {};
for (const name of validNames) DEFS[name] = JSON.parse(await readText(`${EX}/valid/${name}`)) as FlowDefinition;

// --- the constructed flows the corpus lacks ---------------------------------------------------------------------------

/** A task of the corpus registry's `ScoreWorker` type, so a constructed flow runs under either driver below. */
const task = (id: string, to: string, extra: Record<string, unknown> = {}) => ({ id, kind: 'task', type: 'ScoreWorker', ...extra, edges: [{ to }] });
const join = (id: string, of: string, to: string) => ({ id, kind: 'join', of, edges: [{ to }] });
const END = { id: 'done', kind: 'end', outcome: 'completed' };
const flow = (flowId: string, entry: string, nodes: unknown[]) => ({ flowId, version: 1, entry, nodes }) as unknown as FlowDefinition;
const SIMPLE = { workers: { w: { url: 'worker.js' } }, nodeTypes: { ScoreWorker: { worker: 'w' } } };

/**
 * **A NESTED map** — an outer map over `items`; each instance `prep`, an inner map over `prep`'s `sub`, its branch
 * `leaf` -> `tail`. `tail` reads `prep` (the OUTER instance's, shared depth 1) and `leaf` (its OWN inner instance's,
 * depth 2); `h`, after the inner join and still in the outer instance, reads `["leaf"]` (depth 1, every inner output of
 * its instance); `final`, after the outer join, reads `["tail"]` and `["prep"]` (depth 0, everything).
 */
const NESTED = flow('nested', 'ingest', [
  task('ingest', 'outer'),
  { id: 'outer', kind: 'map', over: 'items', branch: 'prep' },
  task('prep', 'inner'),
  { id: 'inner', kind: 'map', over: 'sub', branch: 'leaf' },
  task('leaf', 'tail'),
  // `tail`'s EDGE reads too — `resolveReference`'s second call site (`resolveNeeds`), at depths 1 and 2: the comparison
  // never holds, so the default edge is taken, and the read is made for the predicate all the same.
  { id: 'tail', kind: 'task', type: 'ScoreWorker', needs: { p: 'prep', l: 'leaf' }, edges: [
    { when: { path: 'needs.l.n', op: 'gt', value: 100 }, to: 'innerJoin', needs: { l: 'leaf', p: 'prep' } },
    { to: 'innerJoin' },
  ] },
  join('innerJoin', 'inner', 'h'),
  // `h`'s EDGE reads `["leaf"]` at depth 1, where `leaf`'s own chain is 2 deep: a read made with the TARGET's id as the
  // reader's (the adequacy reader's C4) would ask at depth 2, where `h`'s one-segment path has no key.
  { id: 'h', kind: 'task', type: 'ScoreWorker', needs: { ls: ['leaf'], p: 'prep' }, edges: [
    { when: { path: 'needs.ls.0.n', op: 'gt', value: 100 }, to: 'outerJoin', needs: { ls: ['leaf'] } },
    { to: 'outerJoin' },
  ] },
  join('outerJoin', 'outer', 'final'),
  task('final', 'done', { needs: { ts: ['tail'], ps: ['prep'] } }),
  END,
]);
const nestedResult = (outer: number, inner: number) => (id: string): unknown =>
  id.includes(':ingest:') ? { items: Array.from({ length: outer }, (_, i) => i) }
    : id.includes(':prep:') ? { sub: Array.from({ length: inner }, (_, i) => i) } : { id, n: 1 };

/** **One step back**, the app's shape — `post` reads its own instance's `work` — at a two-digit arity. */
const ONE_STEP = flow('one-step', 'ingest', [
  task('ingest', 'each'),
  { id: 'each', kind: 'map', over: 'items', branch: 'work' },
  task('work', 'post'),
  task('post', 'collect', { needs: { w: 'work', it: '.' } }),
  join('collect', 'each', 'final'),
  task('final', 'done', { needs: { all: ['work?'], posts: ['post?'] } }),
  END,
]);
const itemsResult = (n: number) => (id: string): unknown => (id.includes(':ingest:') ? { items: Array.from({ length: n }, (_, i) => i) } : { id });

/**
 * **A `fanout` inside an instance, read by `one`** — P40 fact 7's *a `one` reference with SEVERAL survivors is still
 * reachable at depth > 0*: each instance fans out to `a` and `b`, joins, and `after` reads `a` by the bare form, which
 * `FD-V28` admits (a fanout region is not a map). Whether that read ever finds more than one survivor is MEASURED here.
 */
const FANOUT_IN_INSTANCE = flow('fanout-in-instance', 'ingest', [
  task('ingest', 'each'),
  { id: 'each', kind: 'map', over: 'items', branch: 'pre' },
  task('pre', 'fan'),
  { id: 'fan', kind: 'fanout', branches: ['a', 'b'] },
  task('a', 'j'),
  task('b', 'j'),
  join('j', 'fan', 'after'),
  task('after', 'collect', { needs: { x: 'a', y: 'b' } }),
  join('collect', 'each', 'done'),
  END,
]);

function simpleDriver(def: FlowDefinition, s: Double): Driver {
  return new Driver(def, {
    runId: 'r1', scheduler: s, createTask: (c) => c, predicates: new Map(), ...SIMPLE,
    joinPolicy: liveToken as JoinPolicy, onRunFailure: (f) => { throw new Error(`the arrangement failed: ${f.kind}`); },
  });
}

/** A constructed flow drained in order or in reverse, the oracle on every read and the index compared after each settlement. */
function driveSimple(def: FlowDefinition, result: (id: string) => unknown, reverse: boolean): { t: Tally; rests: Checkpoint[]; d: Driver } {
  const s = new Double();
  const t = tally();
  const d = simpleDriver(def, s);
  watch(d, t, def);
  d.start({});
  const rests: Checkpoint[] = [];
  const settled = new Set<string>();
  for (let guard = 0; guard < 5000; guard += 1) {
    rests.push(d.checkpoint());
    const open = s.added.filter((id) => !settled.has(id));
    if (open.length === 0) break;
    const id = reverse ? open[open.length - 1]! : open[0]!;
    settled.add(id);
    s.fire('task.completed', { id, state: 'done', attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, result: result(id) });
    const why = indexDisagreement(d);
    if (why !== null && t.why === null) t.why = `after ${id}: index: ${why}`;
  }
  return { t, rests, d };
}

const SUITE = 'L1-L2 — W199: a reference read costs its answer — the index`s answer equal to the pre-W199 filter-and-sort at every read, corpus and constructed, one definition of visibility';
const DECLARED_CASES = [
  'L1 — visibilityKey is the first d SEGMENTS (1 and 10 distinct, a short path null), and outputIsVisible restated through it equals its pre-W199 body over every (reader, target) pair of every valid corpus flow at every path pair',
  'every read of every valid corpus flow, under six drains, equals the oracle by identity and in order — the whole index equal to a regroup at every fold input, and again with reads only',
  'a RESUMED driver — the index rebuilt from the caught-up projection — equals the oracle at every read, from every rest point of every valid corpus flow',
  'a NESTED map at twelve outer items: an inner reader reading the outer instance`s node (depth 1) and its own inner instance`s (depth 2), an `all` read of the inner outputs, everything after the outer join — in order, in reverse, and resumed',
  'a SIBLING map — reference-past-a-map-arity at twelve items and three slots — every instance reads every output in branch-path order (depth 0), in order and in reverse',
  'twelve items, one step back, settled in REVERSE (an insertion before every entry) and with every other task parked and resolved LAST (a resolution placed among later siblings)',
  'a REPEATED settlement — a done, then a user_action for the same task — REMOVES the entry from the index, and its resolution places it again, each read after equal to the oracle',
  'a fanout inside an instance read by the bare form — the survivors MEASURED, the read equal to the oracle',
  'every entry the index reaches is a byNode entry (===), no group empty, and a read hands out COPIES — the index`s own lists never leave the driver',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];
const ran: string[] = [];

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, () => {
    ran.push(DECLARED_CASES[0]!);
    // The key, by hand: segment-wise, never by string.
    equal([visibilityKey('-', 0), visibilityKey('3.1', 0), visibilityKey('1', 1), visibilityKey('10', 1), visibilityKey('1.0', 1), visibilityKey('1.0', 2)],
      ['', '', '1', '10', '1', '1.0'], 'depth 0 is one key for every path; `1` and `10` are different keys; `1.0` at depth 1 is `1`');
    equal([visibilityKey('-', 1), visibilityKey('1', 2), visibilityKey('1.0', 3)], [null, null, null], 'a path with fewer than d segments has no key');
    ok(visibilityKey('1', 1) !== visibilityKey('10', 1) && visibilityKey('1.1', 1) !== visibilityKey('11', 1), 'no two segment lists share a key');
    let pairs = 0;
    let deep = 0;
    const paths = ['-', '0', '1', '10', '11', '0.0', '0.1', '1.0', '1.1', '10.0', '1.10', '0.0.0', '1.0.1'];
    for (const name of validNames) {
      const def = DEFS[name]!;
      const regions = allRegions(buildGraph(def), def);
      const ids = (def.nodes as { id: string }[]).map((n) => n.id);
      for (const r of ids) {
        for (const tg of ids) {
          if (sharedRegionDepth(regions, r, tg) > 0) deep += 1;
          for (const rp of paths) {
            for (const tp of paths) {
              pairs += 1;
              const want = oracleVisible(regions, r, rp, tg, tp);
              if (outputIsVisible(regions, r, rp, tg, tp) !== want) {
                equal(outputIsVisible(regions, r, rp, tg, tp), want, `${name}: ${r}@${rp} -> ${tg}@${tp}`);
              }
            }
          }
        }
      }
    }
    ok(pairs > 100_000 && deep > 0, `the arrangement: ${pairs} comparisons, ${deep} (reader, target) pairs sharing a region`);
  });

  test(DECLARED_CASES[1]!, () => {
    ran.push(DECLARED_CASES[1]!);
    const all = tally();
    let runs = 0;
    for (const name of validNames) {
      for (const drain of DRAINS) {
        for (const everyInput of [true, false]) {
          const r = drive(DEFS[name]!, drain, everyInput);
          equal(r.t.why, null, `${name} / ${drain}${everyInput ? ' / index at every fold input' : ''}: every read equals the oracle`);
          ok(r.atRest, `${name} / ${drain}: came to rest`);
          all.reads += r.t.reads;
          all.multi += r.t.multi;
          all.empty += r.t.empty;
          all.index += r.t.index;
          for (const [k, v] of r.t.byDepth) all.byDepth.set(k, (all.byDepth.get(k) ?? 0) + v);
          runs += 1;
        }
      }
    }
    // The ARRANGEMENT: the corpus reached reads with several visible entries, reads with none (a conditional reference
    // whose target did not run), and the index compared at every fold input. **Every corpus read is at depth 0** —
    // MEASURED: no corpus flow holds a reference between two nodes sharing a region — so the depths above 0 are the
    // constructed cases' below, and this case says so rather than leaving it to be assumed.
    ok(all.reads > 100, `reads compared (${all.reads}) over ${runs} runs`);
    equal([...all.byDepth.keys()], [0], `every corpus read is at depth 0: ${JSON.stringify([...all.byDepth])}`);
    // Reads with NONE visible: the corpus reaches none under these drains (MEASURED, 0) — the empty group is the
    // zero-item case below.
    ok(all.multi > 0, `reads with several entries (${all.multi}); with none, ${all.empty}`);
    ok(all.index > all.reads, `the whole index compared at every fold input (${all.index})`);
  });

  test(DECLARED_CASES[2]!, () => {
    ran.push(DECLARED_CASES[2]!);
    const t = tally();
    let resumed = 0;
    for (const name of validNames) {
      for (const drain of ['in order', 'parked and left'] as Drain[]) {
        const r = drive(DEFS[name]!, drain, false);
        resumed += resumeEach(DEFS[name]!, r.rests, t);
      }
    }
    equal(t.why, null, 'every read on every resumed driver equals the oracle, and the index a regroup');
    ok(resumed > 100 && t.reads > 0, `the arrangement: ${resumed} resumes, ${t.reads} reads on them`);
  });

  test(DECLARED_CASES[3]!, () => {
    ran.push(DECLARED_CASES[3]!);
    const res = nestedResult(12, 2);
    for (const reverse of [false, true]) {
      const r = driveSimple(NESTED, res, reverse);
      equal(r.t.why, null, `nested, ${reverse ? 'reverse' : 'in order'}: every read equals the oracle`);
      // Derived from the document: 24 tails read prep and leaf as NODE needs (48 reads, depths 1 and 2) and again through
      // their EDGE's needs (48 more), 12 h's read leaf and prep (24, depth 1) and leaf again through their edge (12), and
      // `final` reads tail and prep (2, depth 0).
      equal(r.t.reads, 134, 'the arrangement: 48 + 48 + 24 + 12 + 2 reads');
      equal([r.t.byDepth.get(0), r.t.byDepth.get(1), r.t.byDepth.get(2)], [2, 48 + 24 + 12, 48], 'at depths 0, 1 and 2');
      equal(r.t.multi, 12 + 12 + 2, 'twelve h`s read their instance`s TWO leaves, twice, and final reads 24 tails and 12 preps');
      ok(fold(r.d.foldInputs()).outcome === 'completed', 'the arrangement: the run completed');
      if (!reverse) {
        const t = tally();
        const resumed = resumeEach(NESTED, r.rests.filter((_, i) => i % 7 === 0), t, res);
        equal(t.why, null, 'resumed mid-map: every read equals the oracle, the index rebuilt from the projection');
        ok(resumed >= 10 && t.reads > 0, `the arrangement: ${resumed} resumes, ${t.reads} reads`);
      }
    }
  });

  test(DECLARED_CASES[4]!, () => {
    ran.push(DECLARED_CASES[4]!);
    const def = DEFS['reference-past-a-map-arity.flow.json']!;
    const s12 = (id: string): unknown => (id.includes(':ingest:') ? { items: Array.from({ length: 12 }, (_, i) => i) }
      : id.includes(':regroup:') ? { slots: ['a', 'b', 'c'] } : RESULT(id));
    for (const drain of ['in order', 'reverse'] as Drain[]) {
      const r = drive(def, drain, true, s12, {});
      equal(r.t.why, null, `sibling maps, ${drain}: every read equals the oracle`);
      equal([r.t.reads, r.t.byDepth.get(0), r.t.multi], [3, 3, 3], 'the arrangement: three publish instances, each reading ALL twelve scores at depth 0');
      const publish = r.driver.foldInputs().filter((i) => i.kind === 'dispatched' && parseTaskId(i.taskId).nodeId === 'publish').length;
      equal(publish, 3, 'three publish instances dispatched');
    }
  });

  test(DECLARED_CASES[5]!, () => {
    ran.push(DECLARED_CASES[5]!);
    for (const reverse of [false, true]) {
      const r = driveSimple(ONE_STEP, itemsResult(12), reverse);
      equal(r.t.why, null, `twelve items, ${reverse ? 'reverse' : 'in order'}: every read equals the oracle`);
      equal([r.t.reads, r.t.byDepth.get(1), r.t.byDepth.get(0)], [14, 12, 2], 'twelve posts read their instance`s work (depth 1); final reads work and post (depth 0)');
    }
    // Groups built EARLY and then grown OUT OF ORDER — the adequacy reader's X6: the depth-0 group of `work` and a depth-1
    // one are built by direct reads before any `work` settles, then the twelve settle in a SCRAMBLED order, so `reindex`
    // inserts into a multi-entry group at its middle, its front and its end; the whole index equals a regroup after each.
    {
      const s = new Double();
      const t = tally();
      const d = simpleDriver(ONE_STEP, s);
      watch(d, t, ONE_STEP);
      d.start({});
      s.fire('task.completed', { id: s.added[0]!, state: 'done', attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, result: { items: Array.from({ length: 12 }, (_, i) => i) } });
      equal([priv(d).visibleOutputs('final', '-', 'work').length, priv(d).visibleOutputs('post', '7', 'work').length], [0, 0], 'the arrangement: both groups built EMPTY');
      for (const i of [5, 0, 11, 2, 9, 1, 10, 3, 8, 4, 7, 6]) {
        s.fire('task.completed', { id: `r1:work:${i}:0`, state: 'done', attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, result: { i } });
        equal(indexDisagreement(d), null, `after work@${i}: the whole index equals a regroup`);
      }
      equal(priv(d).visibleOutputs('final', '-', 'work').map((e) => e.path), ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
        'the depth-0 group in branch-path order, 10 and 11 after 9');
      equal(t.why, null, 'every read equals the oracle');
    }
    // The EMPTY answer, by direct reads of the lookup against the oracle: `post` read before any `post` settled (no
    // group at depth 0), and a reader path with fewer segments than the shared depth (no key at depth 1 — visible to
    // nothing). A map of zero items would be the run-shaped road, and under `live-token` it ends `stuck`.
    const s = new Double();
    const d = simpleDriver(ONE_STEP, s);
    d.start({});
    s.fire('task.completed', { id: s.added[0]!, state: 'done', attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, result: { items: [0, 1] } });
    s.fire('task.completed', { id: s.added[1]!, state: 'done', attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, result: { i: 0 } });
    for (const [at, here, node] of [['final', '-', 'post'], ['post', '-', 'work'], ['post', '1', 'work']] as [string, string, string][]) {
      const got = priv(d).visibleOutputs(at, here, node);
      equal([got.length, sameList(got, oracle(d, at, here, node))], [0, null], `${at}@${here} reading ${node}: EMPTY, as the oracle`);
    }
    equal(priv(d).visibleOutputs('post', '0', 'work').length, 1, 'the control: post@0 reading work finds work@0');
    for (const drain of ['every other parked, resolved last', 'parked, attempted, resolved'] as Drain[]) {
      const r = drive(ONE_STEP, drain, true, itemsResult(12), {});
      equal(r.t.why, null, `twelve items, ${drain}: every read equals the oracle`);
      ok(r.atRest && r.t.reads >= 12, `the arrangement: ${r.t.reads} reads, at rest`);
    }
  });

  test(DECLARED_CASES[6]!, () => {
    ran.push(DECLARED_CASES[6]!);
    // W195's arrangement (its conformity reader's C4): `ID-R4` asks only whether the id was dispatched, so a settlement
    // event repeated for a settled task is appended, and its effective outcome goes back to none. The task re-settled is
    // the LEAF `publish` (its edge goes to an end, so its resolution re-dispatches nothing) — and also a `score`, whose
    // index at depth 1 is one group per instance. The reads are the driver's own lookup, called directly, each against the
    // oracle at that moment; the indexes are built by those reads BEFORE the removal.
    const def = DEFS['map-with-context.flow.json']!;
    const s = new Double();
    const d = driverFor(def, s);
    d.start(RESULT('payload'));
    const detail = (id: string) => ({ id, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, result: RESULT(id) });
    for (let q = 0; q < s.added.length; q += 1) s.fire('task.completed', { ...detail(s.added[q]!), state: 'done' });
    const p = priv(d);
    const reads: [string, string, string][] = [['done', '-', 'publish'], ['done', '-', 'score'], ['score', '1', 'score']];
    const check = (when: string) => {
      for (const [at, here, node] of reads) equal(sameList(p.visibleOutputs(at, here, node), oracle(d, at, here, node)), null, `${when}: ${at}@${here} reading ${node}`);
      equal(indexDisagreement(d), null, `${when}: the whole index equals a regroup`);
    };
    check('every task settled once');
    const groups = (node: string, depth: number) => [...(p.outputsCache!.index.get(node)?.get(depth)?.keys() ?? [])];
    equal([groups('publish', 0), groups('score', 0), groups('score', 1)], [[''], [''], ['0', '1', '2']], 'the arrangement: three indexes built, score@1 one group per instance');
    for (const id of [s.added[s.added.length - 1]!, 'r1:score:1:0']) {
      equal(s.added.includes(id), true, `the arrangement: ${id} was dispatched`);
      s.fire('task.failed', { ...detail(id), state: 'user_action', error: 'again' });
      s.fire('task.user_action', { ...detail(id), state: 'user_action', error: 'again' });
    }
    check('after the two repeated settlements');
    equal([groups('publish', 0), groups('score', 1)], [[], ['0', '2']], 'publish`s ONLY entry and score@1`s group are REMOVED — groups deleted, never kept empty');
    equal(p.visibleOutputs('done', '-', 'score').map((e) => e.path), ['0', '2'], 'and the depth-0 group lost score@1 from its MIDDLE');
    equal(d.resolve(s.added[s.added.length - 1]!, 'done', { result: RESULT('again'), actor: 'ana' }), true, 'the arrangement: publish parked again, so resolvable');
    check('after publish`s resolution');
    equal(groups('publish', 0), [''], 'publish placed AGAIN');
    // A REPLACEMENT in place — the adequacy reader's P2 / X1: a repeated `done` with a NEW result; the last settlement
    // wins (`effectiveOutcome`), so the entry is a NEW object at the SAME path — inside the depth-0 group of three scores
    // (its middle) and as publish's only entry. Each read after it takes the new object, as the oracle does.
    const scoreBefore = p.visibleOutputs('done', '-', 'score')[1];
    for (const id of ['r1:score:2:0', s.added[s.added.length - 1]!]) {
      s.fire('task.completed', { ...detail(id), state: 'done', result: { replaced: id } });
    }
    check('after the two replacements');
    equal(p.visibleOutputs('done', '-', 'score').map((e) => e.path), ['0', '2'], 'score@1 still parked; score@2 replaced in place');
    equal((p.visibleOutputs('done', '-', 'score')[1]!.result as { replaced?: string }).replaced, 'r1:score:2:0', 'the group holds the NEW object');
    ok(scoreBefore !== p.visibleOutputs('done', '-', 'score')[1], 'and not the old one');
    equal((p.visibleOutputs('score', '2', 'score')[0]!.result as { replaced?: string }).replaced, 'r1:score:2:0', 'and so does its depth-1 group');
  });

  test(DECLARED_CASES[7]!, () => {
    ran.push(DECLARED_CASES[7]!);
    for (const reverse of [false, true]) {
      const r = driveSimple(FANOUT_IN_INSTANCE, itemsResult(12), reverse);
      equal(r.t.why, null, `fanout in an instance, ${reverse ? 'reverse' : 'in order'}: every read equals the oracle`);
      equal([r.t.reads, r.t.byDepth.get(1)], [24, 24], 'twelve `after`s read a and b, at depth 1');
      // MEASURED, P40 fact 7's last sentence: `a` sits in ONE branch of each instance's fanout, so a bare read finds ONE.
      equal([r.t.oneMulti, r.t.multi], [0, 0], 'no `one` read finds more than one survivor: a fanout node has one output per instance (FD-V19)');
    }
  });

  test(DECLARED_CASES[8]!, () => {
    ran.push(DECLARED_CASES[8]!);
    const r = driveSimple(NESTED, nestedResult(12, 2), false);
    const c = priv(r.d).outputsCache!;
    const own = new Set<Entry>();
    for (const l of c.byNode.values()) for (const e of l) own.add(e);
    let reached = 0;
    let groups = 0;
    for (const byDepth of c.index.values()) {
      for (const g of byDepth.values()) {
        for (const list of g.values()) {
          groups += 1;
          ok(list.length > 0, 'no group is kept empty');
          for (const e of list) {
            reached += 1;
            ok(own.has(e), `an index entry (${e.path}) is a byNode entry — the same object`);
          }
        }
      }
    }
    // Derived: prep at depth 1 (12 groups of 1) and 0 (1 group of 12); leaf at depth 2 (24 of 1) and depth 1 (12 of 2);
    // tail at depth 0 (1 group of 24) — 12 + 12 + 24 + 24 + 24 entries in 12 + 1 + 24 + 12 + 1 groups.
    equal([reached, groups], [96, 50], 'the index reaches 96 entries in 50 groups');
    // A read hands out copies: `h`'s payload holds COPIES of the leaf results, never the projection's objects.
    const s = new Double();
    const seen: unknown[] = [];
    const d = new Driver(NESTED, {
      runId: 'r1', scheduler: s, createTask: (cfg) => { seen.push(cfg); return cfg; }, predicates: new Map(), ...SIMPLE,
      joinPolicy: liveToken as JoinPolicy, onRunFailure: (f) => { throw new Error(f.kind); },
    });
    d.start({});
    const res = nestedResult(1, 2);
    for (let q = 0; q < s.added.length; q += 1) {
      s.fire('task.completed', { id: s.added[q]!, state: 'done', attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, result: res(s.added[q]!) });
    }
    const h = seen.find((cfg) => (cfg as { id: string }).id.includes(':h:')) as { payload: { input: { ls: unknown[] } } };
    const leaves = priv(d).outputsCache!.byNode.get('leaf')!;
    equal(h.payload.input.ls, leaves.map((e) => e.result), 'h received its instance`s two leaves, in order');
    ok(h.payload.input.ls.every((v, i) => v !== leaves[i]!.result), 'each a COPY — no projection object leaves the driver');
  });

  test(DECLARED_CASES[9]!, () => {
    equal(ran, DECLARED_CASES.slice(0, -1), 'every declared case ran, in order — a case that leaves the suite fails here naming itself');
    equal(collected().filter((s) => s.suite === SUITE).reduce((n, s) => n + s.cases.length, 0), DECLARED_CASES.length,
      'and the suite registers exactly the cases it declares');
  });
});
