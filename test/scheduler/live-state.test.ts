/**
 * Ladder L1 — **the run's live state on its handle** — `RN-R44`, `RN-R25` v0.31,
 * [ADR 0122](../../doc/decisions/0122-a-runtimes-live-state-is-a-frozen-copy-on-its-handle.md),
 * [W196](../../doc/work-items/w196-the-runs-live-state-on-its-handle.md) under
 * [P39](../../doc/plans/p39-what-a-step-costs-and-where-a-live-run-state-is-read.md) stop-and-asks (b), (c), (d), (f).
 *
 * `RunHandle.state()` is a FROZEN copy of the run's state, cached until the next fold input that moves it;
 * `outcome()` and `node(taskId)` are the cheap reads; `done` resolves with the same frozen object `state()` returns when
 * it settles. **Every expected value comes from a SECOND ROUTE that is not the code under test**: the caller's own
 * `fold(driver.foldInputs())` — the driver's sequence, folded by the public `fold` — which is `RN-R44`'s own statement
 * of what the read must equal at a quiescent point, and `RN-R2`'s reason the two must agree.
 *
 * | what | from |
 * |---|---|
 * | equal to the caller's fold at a quiescent point, key order included | `RN-R44`, `RN-R12` (a quiescent point), `RN-R2` |
 * | the SAME object until an input moves the state; a NEW one after | P39 (b): *cached until the next fold input*; `RN-R43` (an input that moves nothing hands back the same state) |
 * | frozen at every depth; no consumer mutation reaches the runtime | P39 (b); ADR 0007 (why not a live view); P39's copy sentence: an ALIAS, a SHALLOW copy, a NESTED value, both directions |
 * | `done` the same object | P39 (f), answered 2026-10-21 |
 * | on a resume, the stored events folded | `RN-R25`, `RN-R22` (a resume always delivers its `resumed` element), P39's *taken at rest* sentence |
 * | no materialisation per input | P39 prediction 4: `outcome()` and `node()` O(1); `state()` O(run) per read, once per input that moved it |
 */
import { AssertionError, collected, deepEqual, equal, listDir, ok, readText, ROOT, suite } from '../harness.ts';
import { createRuntime } from '../../src/scheduler/runtime.ts';
import type { RunHandle } from '../../src/scheduler/runtime.ts';
import { RunControlRefused } from '../../src/driver/driver.ts';
import type { Checkpoint } from '../../src/driver/driver.ts';
import { Accumulator } from '../../src/fold/accumulator.ts';
import { fold } from '../../src/fold/run-state.ts';
import type { FoldInput, RunState } from '../../src/fold/run-state.ts';
import type { FlowDefinition, RegistryDocument } from '../../src/definition/types.ts';
import { CORPUS_LANGUAGES, type CorpusRegistryDocument } from '../definition/corpus-types.ts';

const SUITE = 'L1 — RN-R44: the run`s live state on its handle — a frozen copy cached until the next input, the caller`s own fold at every quiescent point, on start and on resume; outcome(), node(), and done the same object';

const DOCUMENT = {
  workers: { w: { url: 'https://example.test/w.js' } },
  nodeTypes: { T: { worker: 'w', inline: true } },
  predicates: [],
} as unknown as RegistryDocument;

const LINEAR = {
  flowId: 'lin', version: 1, entry: 'a',
  nodes: [
    { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'b' }] },
    { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/** A two-branch fan-out: a region OPENS, ARRIVES and JOINS. */
const FANOUT = {
  flowId: 'fan', version: 1, entry: 'a',
  nodes: [
    { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'fanout', branches: ['b', 'c'] },
    { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'j' }] },
    { id: 'c', kind: 'task', type: 'T', edges: [{ to: 'j' }] },
    { id: 'j', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/** A MAP nested in a fan-out branch — dotted branch paths, both region kinds (Q6). */
const NESTED = {
  flowId: 'nest', version: 1, entry: 'a',
  nodes: [
    { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'fanout', branches: ['pre', 'plain'] },
    { id: 'pre', kind: 'task', type: 'T', edges: [{ to: 'm' }] },
    { id: 'm', kind: 'map', over: 'items', branch: 'item' },
    { id: 'item', kind: 'task', type: 'T', edges: [{ to: 'mj' }] },
    { id: 'mj', kind: 'join', of: 'm', edges: [{ to: 'j' }] },
    { id: 'plain', kind: 'task', type: 'T', edges: [{ to: 'j' }] },
    { id: 'j', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/** A `map` over `items`, one task per item — the shape P39 is about. */
const MAP = {
  flowId: 'map', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'T', edges: [{ to: 'each' }] },
    { id: 'each', kind: 'map', over: 'items', branch: 'work' },
    { id: 'work', kind: 'task', type: 'T', edges: [{ to: 'joined' }] },
    { id: 'joined', kind: 'join', of: 'each', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/** The seams: pools and the scheduler recorded rather than built; a `cancel` the case resolves by task id. */
function seams() {
  const added: { id: string }[] = [];
  const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  const stopping = new Map<string, (v: boolean) => void>();
  const fire = (type: string, detail: unknown) => { for (const fn of listeners.get(type) ?? []) fn({ detail }); };
  const detail = (id: string, state: string, result: unknown = null, error: unknown = null) =>
    ({ id, state, result, error, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 });
  const settle = (id: string, result: unknown) => fire('task.completed', detail(id, 'done', result));
  /** A non-optional task out of retries: the scheduler fires the PAIR with one object (ADR 0007 rule 2). */
  const userAction = (id: string) => { const d = detail(id, 'user_action', null, 'boom'); fire('task.failed', d); fire('task.user_action', d); };
  const cancelled = (id: string) => fire('task.cancelled', detail(id, 'cancelled'));
  const createPool = (url: string, options: unknown) => ({ url, options }) as never;
  const createScheduler = (p: Record<string, unknown>, g: Record<string, unknown>) => ({
    workerPools: p, groups: g,
    addTask(t: unknown) { added.push(t as { id: string }); },
    addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
    cancel(id: string) { return new Promise<boolean>((res) => { stopping.set(id, res); }); },
    shutdown() { return Promise.resolve(); },
  }) as never;
  /** The worker of `id` has stopped: `task.cancelled`, then its `cancel()` resolves. */
  const stops = (id: string) => { cancelled(id); stopping.get(id)?.(true); };
  return { added, fire, settle, userAction, cancelled, stops, createPool, createScheduler };
}
type Seams = ReturnType<typeof seams>;
const runtimeOn = (s: Seams, doc: RegistryDocument = DOCUMENT) =>
  createRuntime(doc, {}, { createPool: s.createPool, createScheduler: s.createScheduler, validateBoundaries: false });

/** One macrotask turn: every microtask queued before it — `done`'s predicate, a case's read — has run. */
const turn = () => new Promise<void>((res) => setTimeout(res, 0));

/** `done`, bounded: an unsettled promise HANGS a runner rather than failing it (W77's `w77Settlement`). */
const settled = async (d: Promise<RunState>, ms = 300): Promise<RunState> => {
  const NEVER = Symbol('never settled');
  const r = await Promise.race([d, new Promise<symbol>((res) => setTimeout(() => res(NEVER), ms))]);
  if (r === NEVER) throw new AssertionError(`done did not settle within ${ms} ms`);
  return r as RunState;
};

/** The two routes compared: by value with `deepEqual`, and BYTE FOR BYTE — key order included — as `JSON.stringify`. */
function sameAsFold(h: RunHandle, at: string): string | null {
  const mine = h.state();
  const theirs = fold(h.driver.foldInputs());
  if (!deepEqual(mine, theirs)) return `${at}: state() ${JSON.stringify(mine).slice(0, 200)} vs fold ${JSON.stringify(theirs).slice(0, 200)}`;
  if (JSON.stringify(mine) !== JSON.stringify(theirs)) return `${at}: key order differs`;
  if (h.outcome() !== theirs.outcome) return `${at}: outcome() ${h.outcome()} vs ${theirs.outcome}`;
  for (const [id, n] of Object.entries(theirs.nodes)) {
    const got = h.node(id);
    if (!deepEqual(got, n) || got !== mine.nodes[id]) return `${at}: node(${id}) is not the state's entry`;
  }
  return null;
}

/**
 * **Every object reachable from `v` is frozen** — the walk returns the first unfrozen path, and how many objects it
 * visited, so a vacuous walk (nothing reachable) is visible. Typed arrays are the stated limit (`RN-R44`): their
 * elements cannot be frozen, and the walk counts them apart.
 */
function unfrozen(v: unknown): { path: string | null; objects: number; views: number } {
  const seen = new Set<object>();
  const out = { path: null as string | null, objects: 0, views: 0 };
  const stack: [unknown, string][] = [[v, '$']];
  while (stack.length > 0 && out.path === null) {
    const [x, p] = stack.pop()!;
    if (typeof x !== 'object' || x === null || seen.has(x)) continue;
    seen.add(x);
    out.objects += 1;
    // A non-empty typed array CANNOT be frozen (`Object.freeze` throws on one), so it is counted, never graded.
    if (ArrayBuffer.isView(x)) { out.views += 1; continue; }
    if (!Object.isFrozen(x)) { out.path = p; break; }
    if (x instanceof Map) for (const [k, y] of x) { stack.push([k, `${p}<key>`]); stack.push([y, `${p}<${String(k)}>`]); }
    if (x instanceof Set) for (const y of x) stack.push([y, `${p}<member>`]);
    for (const k of Object.keys(x)) stack.push([(x as Record<string, unknown>)[k], `${p}.${k}`]);
  }
  return out;
}

/** A NESTED result each task returns — the copy claim needs depth (P39's copy sentence). */
const NESTED_RESULT = (id: string) => ({ by: id, items: ['x', 'y'], deep: { n: 1, list: [{ k: id }] } });

/**
 * **Drive a run to rest, reading the handle at EVERY quiescent point** — a microtask queued by the consumer's
 * `onFoldInput` after each delivered input, which runs once the driver's synchronous turn is over (`RN-R12`). Each
 * dispatched task settles `done` with a nested result, one per macrotask turn, so every input's microtask lands before
 * the next settlement. Returns the first disagreement and the counts that keep the comparison from being vacuous.
 */
async function driveReading(flow: FlowDefinition, payload: unknown) {
  const s = seams();
  const r = runtimeOn(s);
  const out = { why: null as string | null, reads: 0, inputs: 0, frozenObjects: 0 };
  const ref: { h: RunHandle | null } = { h: null };
  const h = ref.h = r.start(flow, payload, {
    onFoldInput: () => {
      out.inputs += 1;
      queueMicrotask(() => {
        if (out.why !== null || ref.h === null) return;
        out.reads += 1;
        // A throw on a microtask is an uncaught exception that takes the runner down with no FAIL line — a CRASH is not
        // a detection (workflow section 4) — so a read that throws is recorded as the disagreement it is.
        try {
          out.why = sameAsFold(ref.h, `after input ${out.inputs}`);
          const f = unfrozen(ref.h.state());
          out.frozenObjects = Math.max(out.frozenObjects, f.objects);
          if (out.why === null && f.path !== null) out.why = `after input ${out.inputs}: ${f.path} is not frozen`;
        } catch (e) {
          out.why = `after input ${out.inputs}: the read THREW ${String(e)}`;
        }
      });
    },
  });
  for (let i = 0; i < s.added.length && i < 60; i += 1) {
    await turn();
    s.settle(String(s.added[i]!.id), NESTED_RESULT(String(s.added[i]!.id)));
  }
  const end = await settled(h.done);
  await turn();
  return { ...out, h, end, s };
}

const DECLARED_CASES = [
  'start: at EVERY quiescent point, state() deep-equals fold(driver.foldInputs()), key order included, and is frozen at every depth; outcome() and node() are the state`s — three shapes and a map',
  'every valid corpus flow: state() at every quiescent point the caller`s own fold, frozen at every depth — gates, asks, maps, decisions, failures',
  'resume: the first read after resume() folds the STORED events and the delivered ones — and no read can precede the first delivered input (RN-R22)',
  'cached: two reads with no input between are the SAME object; a read after an input that moves the state is a NEW one, and the earlier one is unchanged by it',
  'the copy claim: a consumer mutating a read (an alias), a shallow copy, or the NESTED result its onFoldInput was handed — none reaches a later read or done',
  'outcome() and node(): O(1) reads equal to the state`s — an unknown, `toString` and `__proto__` id null; a parked user_action read through both',
  'done (P39 (f)): the SAME frozen object state() returns — completed, halted, interrupted and cancelled — and a mutation of it throws',
  'after release: state() stays the settled object — a late settlement reaches no driver, and a refused run control records nothing',
  'a result Object.freeze cannot reach — a typed array, a Map — neither crashes state() nor keeps done from settling',
  'the runtime keeps ONE accumulator: one materialisation per state() read after an input that moved it, none for outcome() or node(), and every input applied once',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];
const ran: string[] = [];

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, async () => {
    ran.push(DECLARED_CASES[0]!);
    const shapes: [string, FlowDefinition, unknown, number][] = [
      // [name, flow, payload, the fewest fold inputs the run must deliver — a run that delivers fewer read nothing]
      // linear: two dispatches, two settlements, one path end — exactly five (RN-R4's elements, counted by hand).
      ['linear', LINEAR, { x: 1 }, 5],
      ['fan-out', FANOUT, { x: 1 }, 12],
      ['map nested in a fan-out branch', NESTED, { items: ['x', 'y'] }, 20],
      // a map over the TWO items its first task returns (NESTED_RESULT's `items`): ingest dispatched and settled, the region
      // entered, two branches opened, dispatched, settled and arrived, the join, the path end — thirteen.
      ['a map', MAP, { x: 1 }, 13],
    ];
    for (const [name, flow, payload, least] of shapes) {
      const d = await driveReading(flow, payload);
      equal(d.why, null, `${name}: every read agreed with the caller's own fold`);
      equal(d.end.outcome, 'completed', `${name}: the run completed`);
      ok(d.inputs >= least, `${name}: the run delivered ${d.inputs} fold inputs, at least ${least}`);
      // One microtask per delivered input, each a read: a read skipped is a quiescent point not compared (W195's G1).
      equal(d.reads, d.inputs, `${name}: one read per delivered input`);
      ok(d.frozenObjects >= 10, `${name}: the frozen walk reached ${d.frozenObjects} objects — not vacuous`);
      equal(sameAsFold(d.h, 'at the end'), null, `${name}: and at the end`);
    }
  });

  test(DECLARED_CASES[1]!, async () => {
    ran.push(DECLARED_CASES[1]!);
    const EX = `${ROOT}spec/examples`;
    const doc = JSON.parse(await readText(`${EX}/registry.json`)) as CorpusRegistryDocument;
    const names = (await listDir(`${EX}/valid`)).filter((n) => n.endsWith('.flow.json')).sort();
    ok(names.length >= 20, `the valid corpus: ${names.length} flows`);
    const seenKinds = new Set<string>();
    let reads = 0;
    // Every valid flow, and ONE variant the corpus lacks (the adequacy reader's G3): `gated-map` keyed on `series` — an
    // OBJECT, which RN-R26 records as the gate's `key` — so the freeze walk meets a nested key.
    const flows: [string, FlowDefinition][] = [];
    for (const name of names) flows.push([name, JSON.parse(await readText(`${EX}/valid/${name}`)) as FlowDefinition]);
    const objectKeyed = JSON.parse(await readText(`${EX}/valid/gated-map.flow.json`)) as { nodes: { id: string; settings?: { key?: string } }[] };
    objectKeyed.nodes.find((n) => n.id === 'dedupe')!.settings!.key = 'series';
    flows.push(['gated-map keyed on an OBJECT', objectKeyed as unknown as FlowDefinition]);
    let objectKeys = 0;
    for (const [name, flow] of flows) {
      const s = seams();
      const predicates = Object.fromEntries((doc.predicates ?? []).map((n, i) => [n, () => i % 2 === 0]));
      const r = createRuntime(doc, { predicates, languages: CORPUS_LANGUAGES },
        { createPool: s.createPool, createScheduler: s.createScheduler, validateBoundaries: false });
      let why: string | null = null;
      const ref: { h: RunHandle | null } = { h: null };
      const RESULT = (id: string) => ({
        by: id, from: 'ingest', items: ['a', 'b', 'c'], rows: ['p', 'q'], files: ['a', 'b', 'c'], slots: ['x', 'y'],
        config: { threshold: 7 }, runLabel: 'nightly', series: { id: 's1' }, deep: { n: [1, { m: 2 }] },
      });
      const h = ref.h = r.start(flow, RESULT('payload'), {
        onFoldInput: (i) => {
          seenKinds.add(i.kind);
          queueMicrotask(() => {
            if (why !== null || ref.h === null) return;
            reads += 1;
            try {
              why = sameAsFold(ref.h, `${name}`);
              const f = unfrozen(ref.h.state());
              if (why === null && f.path !== null) why = `${name}: ${f.path} is not frozen`;
            } catch (e) {
              why = `${name}: the read THREW ${String(e)}`;
            }
          });
        },
      });
      const done = new Set<string>();
      for (let guard = 0; guard < 200; guard += 1) {
        await turn();
        const open = s.added.map((t) => String(t.id)).filter((id) => !done.has(id));
        if (open.length > 0) {
          done.add(open[0]!);
          s.settle(open[0]!, RESULT(open[0]!));
          continue;
        }
        // An ask parks with nothing dispatched (RN-R37): answer it, through the driver, as a person would.
        const waiting = Object.entries(h.state().nodes).find(([, n]) => n.state === 'suspended');
        if (waiting === undefined || !h.driver.resolve(waiting[0], 'done', { result: RESULT(waiting[0]), actor: 'ana' })) break;
      }
      await turn();
      equal(why, null, `${name}: every read agreed with the caller's own fold and was frozen`);
      equal(sameAsFold(h, `${name} at rest`), null, `${name}: and at rest`);
      objectKeys += h.state().gated.filter((g) => typeof g.key === 'object' && g.key !== null).length;
    }
    ok(reads >= 300, `${reads} reads over the corpus`);
    ok(objectKeys > 0, `the variant recorded ${objectKeys} gate decision(s) keyed on an object — each walked frozen above`);
    for (const kind of ['dispatched', 'outcome', 'region', 'joinSettled', 'pathEnded', 'gated', 'asked', 'resolution']) {
      ok(seenKinds.has(kind), `the corpus delivered a \`${kind}\` element — the kinds a read must survive: ${[...seenKinds].sort().join(', ')}`);
    }
  });

  test(DECLARED_CASES[2]!, async () => {
    ran.push(DECLARED_CASES[2]!);
    // The stored run: another runtime's, cut once `a` has settled and `b` is running — stored as a consumer stores it.
    const sA = seams();
    const a = runtimeOn(sA);
    const store: FoldInput[] = [];
    const hA = a.start(LINEAR, { n: 1 }, { onFoldInput: (i, seq) => { store[seq] = structuredClone(i); } });
    sA.settle(`${hA.driver.runId}:a:-:0`, NESTED_RESULT('a'));
    const cp: Checkpoint = { header: hA.header, events: store.slice() };
    ok(cp.events.length === 3 && cp.events.some((e) => e.kind === 'outcome'), `the ARRANGEMENT: ${cp.events.length} stored elements, a settlement among them`);
    const storedResult = (cp.events.find((e) => e.kind === 'outcome') as { record: { result: { deep: { n: number } } } }).record.result;

    const s = seams();
    const b = runtimeOn(s);
    let deliveredInside = 0;
    let returned = false;
    // Every input the runtime applies, COUNTED on the accumulator's prototype for the life of this resume (restored below):
    // the stored events once and the delivered ones once — a store applied twice folds to the same state on this flow, so
    // only the count can see it.
    const proto = Accumulator.prototype as unknown as { apply: (i: FoldInput) => boolean };
    const apply = proto.apply;
    let applied = 0;
    proto.apply = function (this: unknown, i: FoldInput) { applied += 1; return apply.call(this, i); };
    let h: RunHandle;
    try {
      h = b.resume(LINEAR, cp, { onFoldInput: () => { if (!returned) deliveredInside += 1; } });
      returned = true;
      h.state();
      h.outcome();
    } finally {
      proto.apply = apply;
    }
    equal(applied, h.driver.foldInputs().length, `every element applied ONCE — the ${cp.events.length} stored and the ${h.driver.foldInputs().length - cp.events.length} delivered`);
    // The stored events are folded only once the replay has ACCEPTED them (RN-R20): a stored element whose task id does
    // not parse is the DRIVER's refusal, ResumeRefused at its position — never the fold's InvalidTaskId thrown first.
    const bad: Checkpoint = { header: cp.header, events: [...cp.events.slice(0, 2), { kind: 'dispatched', taskId: 'not a task id' }] };
    let refused: unknown = null;
    try { runtimeOn(seams()).resume(LINEAR, bad); } catch (e) { refused = e; }
    equal(refused instanceof Error ? refused.name : String(refused), 'ResumeRefused', 'a malformed stored element is refused by the replay, before anything folds it');
    // RN-R22: the `resumed` element is appended ALWAYS, before resume() returns — so no read of this handle can come
    // before the first delivered input, and the stored events are folded by the time anything can ask.
    ok(deliveredInside >= 1, `resume() delivered ${deliveredInside} element(s) before it returned`);
    const first = h.state();
    equal(sameAsFold(h, 'the first read after resume()'), null, 'the first read is the caller`s own fold of the WHOLE run — stored events included');
    ok(Object.keys(first.nodes).includes(`${hA.driver.runId}:a:-:0`) && first.nodes[`${hA.driver.runId}:a:-:0`]!.state === 'done',
      'and it holds the STORED settlement: a, settled before the process that stored it was gone');
    equal(first.resumes.length, 1, 'and the resume itself');
    // The copy claim on the SEED: the consumer's store is its own — not frozen by the runtime, and writing it moves nothing.
    ok(!Object.isFrozen(storedResult) && !Object.isFrozen(storedResult.deep), 'the consumer`s stored events are not frozen by the runtime');
    storedResult.deep.n = 99;
    equal(h.state().nodes[`${hA.driver.runId}:a:-:0`]!.result, NESTED_RESULT('a'), 'and writing into them reaches no read');
    s.settle(`${hA.driver.runId}:b:-:0`, NESTED_RESULT('b'));
    const end = await settled(h.done);
    equal(end.outcome, 'completed', 'the resumed run completes');
    equal(sameAsFold(h, 'at the end'), null, 'and its end is the caller`s fold of the whole run');
    ok(end === h.state(), 'done is the object state() returns');
  });

  test(DECLARED_CASES[3]!, () => {
    ran.push(DECLARED_CASES[3]!);
    const s = seams();
    const r = runtimeOn(s);
    const h = r.start(LINEAR, { x: 1 });
    const one = h.state();
    ok(h.state() === one, 'two reads with no input between are the SAME object');
    const snapshot = JSON.stringify(one);
    s.settle(String(s.added[0]!.id), NESTED_RESULT('a'));
    const two = h.state();
    ok(two !== one, 'a read after an input that moved the state is a NEW object');
    equal(JSON.stringify(one), snapshot, 'and the earlier read is unchanged by the input — byte for byte');
    ok(h.state() === two, 'and the new one is cached in its turn');
    // A pause moves one FLAG and nothing else (RN-R34) — still a move, so a new object; a SECOND pause is refused by the
    // driver and appends nothing, so the read stays the cached one.
    h.driver.pause({ actor: 'ops' });
    const paused = h.state();
    ok(paused !== two && paused.paused === true, 'a pause moves the flag: a new object');
    let refused: unknown = null;
    try { h.driver.pause({ actor: 'ops' }); } catch (e) { refused = e; }
    ok(refused instanceof RunControlRefused, 'a second pause is refused and appends nothing');
    ok(h.state() === paused, 'so the read is still the same object');
  });

  test(DECLARED_CASES[4]!, async () => {
    ran.push(DECLARED_CASES[4]!);
    const s = seams();
    const r = runtimeOn(s);
    const handed: FoldInput[] = [];
    const h = r.start(LINEAR, { x: 1 }, { onFoldInput: (i) => { handed.push(i); } });
    s.settle(String(s.added[0]!.id), NESTED_RESULT('a'));
    const id = String(s.added[0]!.id);
    const read = h.state();
    const before = JSON.stringify(read);
    const result = read.nodes[id]!.result as { deep: { n: number; list: { k: string }[] } };
    // (1) An ALIAS: the read itself, at every depth. Modules are strict: a write to a frozen object THROWS.
    const attempts: [string, () => void][] = [
      ['outcome', () => { (read as { outcome: string }).outcome = 'failed'; }],
      ['a node', () => { (read.nodes as Record<string, unknown>)[id] = null; }],
      ['a node`s state', () => { (read.nodes[id] as { state: string }).state = 'failed'; }],
      ['a NESTED result', () => { result.deep.n = 99; }],
      ['an element deeper still', () => { result.deep.list[0]!.k = 'z'; }],
      ['a list', () => { read.pathEnds.push({ reason: 'end', at: 'x' }); }],
    ];
    for (const [what, write] of attempts) {
      let threw: unknown = null;
      try { write(); } catch (e) { threw = e; }
      ok(threw instanceof TypeError, `writing ${what} of a read throws a TypeError`);
    }
    // (2) A SHALLOW copy: its top level is the consumer's; everything under it is the read's own, frozen.
    const shallow = { ...read, outcome: 'failed' as const, nodes: { ...read.nodes } };
    delete (shallow.nodes as Record<string, unknown>)[id];
    let deepThrew: unknown = null;
    try { ((shallow.pathEnds as unknown[]) ?? []).push(1); } catch (e) { deepThrew = e; }
    ok(deepThrew instanceof TypeError, 'a shallow copy still reaches the read`s own lists, which are frozen');
    // (3) The NESTED result the consumer's onFoldInput was handed — the input the runtime applied (re-take 3).
    const mine = handed.find((i) => i.kind === 'outcome') as { record: { result: { deep: { n: number } } } };
    ok(!Object.isFrozen(mine.record.result), 'what onFoldInput hands is unchanged: its result is the consumer`s, NOT frozen (P39 decision 5)');
    mine.record.result.deep.n = 42;
    // Both directions: none of the three reached the runtime — a later read after a NEW input, and done.
    s.settle(String(s.added[1]!.id), NESTED_RESULT('b'));
    const later = h.state();
    equal((later.nodes[id]!.result as { deep: { n: number } }).deep.n, 1, 'a later read holds the result as the task returned it');
    equal(later.outcome, 'completed', 'and the run`s own outcome');
    ok(id in later.nodes, 'and the node the shallow copy deleted');
    equal(JSON.stringify(read), before, 'and the first read is unchanged, byte for byte');
    const end = await settled(h.done);
    equal((end.nodes[id]!.result as { deep: { n: number } }).deep.n, 1, 'done holds it as the task returned it');
    equal(sameAsFold(h, 'after the writes'), null, 'and done is still the caller`s own fold');
  });

  test(DECLARED_CASES[5]!, async () => {
    ran.push(DECLARED_CASES[5]!);
    const s = seams();
    const r = runtimeOn(s);
    const resolutions: FoldInput[] = [];
    const h = r.start(LINEAR, { x: 1 }, { onFoldInput: (i) => { if (i.kind === 'resolution') resolutions.push(i); } });
    const a = String(s.added[0]!.id);
    equal(h.outcome(), 'running', 'a dispatched task: running');
    equal(h.node(a), h.state().nodes[a], 'node(id) is the state`s entry');
    ok(h.node(a) === h.state().nodes[a], 'the SAME object, not a copy of it');
    ok(Object.isFrozen(h.node(a)), 'and frozen');
    for (const id of ['r1:nope:-:0', 'toString', '__proto__', 'constructor', 'hasOwnProperty']) {
      equal(h.node(id), null, `node(${JSON.stringify(id)}) is null — a task the run never dispatched, whatever the id names`);
    }
    // `Accumulator.entry` over a LOADED state — the branch a runtime never reaches (it loads the empty state; the adequacy
    // reader's G4): the loaded state's own entry, and an inherited name still nothing.
    const loaded = fold([{ kind: 'dispatched', taskId: 'r9:x:-:0' }]);
    const over = Accumulator.load(loaded);
    ok(over.entry('r9:x:-:0') === loaded.nodes['r9:x:-:0'] && over.entry('toString') === undefined, 'entry() reads a loaded state`s OWN entries');
    // Q17 — a non-optional task out of retries parks the run on a person.
    s.userAction(a);
    await turn();
    equal(h.outcome(), 'awaiting_action', 'a parked task: outcome() reads awaiting_action');
    equal(h.node(a)!.state, 'suspended', 'and node() reads it suspended');
    equal(h.outcome(), h.state().outcome, 'outcome() is the state`s');
    ok(h.driver.resolve(a, 'done', { result: NESTED_RESULT('a'), actor: 'ana' }), 'a person resolves it');
    // The RESOLUTION's record is the runtime's own copy too (ADR 0122 rule 4): what onFoldInput handed is not frozen by a read.
    const handedResolution = resolutions.at(-1) as { record: { result: { deep: { n: number } } } } | undefined;
    ok(handedResolution !== undefined, 'the ARRANGEMENT: onFoldInput was handed the resolution');
    equal(h.node(a)!.state, 'done', 'and node() reads the resolution');
    const nested = h.node(a)!.result as { deep: { n: number } };
    ok(Object.isFrozen(nested) && Object.isFrozen(nested.deep), 'the resolution`s NESTED result frozen through node()');
    ok(!Object.isFrozen(handedResolution!.record.result.deep), 'while the resolution onFoldInput handed is the consumer`s own, not frozen');
    handedResolution!.record.result.deep.n = 7;
    equal(nested.deep.n, 1, 'and writing it reaches no read');
    s.settle(String(s.added[1]!.id), NESTED_RESULT('b'));
    equal(h.outcome(), 'completed', 'outcome() moves with the run');
    equal((await settled(h.done)).outcome, h.outcome(), 'and done agrees');
  });

  test(DECLARED_CASES[6]!, async () => {
    ran.push(DECLARED_CASES[6]!);
    const check = (name: string, h: RunHandle, end: RunState, want: string) => {
      equal(end.outcome, want, `${name}: done settles ${want}`);
      ok(end === h.state(), `${name}: await done === handle.state() — one object, not two`);
      equal(unfrozen(end).path, null, `${name}: frozen at every depth`);
      equal(sameAsFold(h, name), null, `${name}: the caller's own fold`);
      let threw: unknown = null;
      try { (end as { outcome: string }).outcome = 'running'; } catch (e) { threw = e; }
      ok(threw instanceof TypeError, `${name}: writing it throws — BREAKING in 0.9.0 for code that mutated await done`);
    };
    {
      const s = seams();
      const h = runtimeOn(s).start(LINEAR, { x: 1 });
      s.settle(String(s.added[0]!.id), NESTED_RESULT('a'));
      s.settle(String(s.added[1]!.id), NESTED_RESULT('b'));
      check('completed', h, await settled(h.done), 'completed');
    }
    {
      // A consumer callback that throws on a settlement halts the run (OR-R10): `halted`, and done resolves.
      const s = seams();
      const h = runtimeOn(s).start(LINEAR, { x: 1 }, { onFoldInput: (i) => { if (i.kind === 'outcome') throw new Error('the store is down'); } });
      try { s.settle(String(s.added[0]!.id), NESTED_RESULT('a')); } catch { /* the throw reaches the dispatcher on a scheduler event's step */ }
      check('halted', h, await settled(h.done), 'halted');
    }
    {
      const s = seams();
      const h = runtimeOn(s).start(FANOUT, { x: 1 });
      s.settle(String(s.added[0]!.id), NESTED_RESULT('a'));
      const stopped = h.stop({ actor: 'ops', reason: 'upgrade' });
      for (const t of s.added.slice(1)) s.stops(String(t.id));
      await stopped;
      check('interrupted', h, await settled(h.done), 'interrupted');
    }
    {
      // RN-R30: the run's OWNER cancels it — `cancelRequest` carried, frozen with the rest (the adequacy reader's K8).
      const s = seams();
      const h = runtimeOn(s).start(FANOUT, { x: 1 });
      s.settle(String(s.added[0]!.id), NESTED_RESULT('a'));
      const cancelling = h.driver.cancel({ actor: 'ops', reason: 'no longer needed' });
      for (const t of s.added.slice(1)) s.stops(String(t.id));
      await cancelling;
      const end = await settled(h.done);
      ok(end.cancelRequest !== null && Object.isFrozen(end.cancelRequest), 'owner-cancelled: the request recorded and frozen');
      check('owner-cancelled', h, end, 'cancelled');
    }
    {
      // RN-R28: the scheduler's own cancel of one task ends the run.
      const s = seams();
      const h = runtimeOn(s).start(FANOUT, { x: 1 });
      s.settle(String(s.added[0]!.id), NESTED_RESULT('a'));
      s.cancelled(String(s.added[1]!.id));
      check('cancelled', h, await settled(h.done), 'cancelled');
    }
  });

  test(DECLARED_CASES[7]!, async () => {
    ran.push(DECLARED_CASES[7]!);
    // RN-R28: a fan-out whose first branch the scheduler cancelled — done settles with c still in flight.
    const s = seams();
    const h = runtimeOn(s).start(FANOUT, { x: 1 });
    s.settle(String(s.added[0]!.id), NESTED_RESULT('a'));
    const [b, c] = [String(s.added[1]!.id), String(s.added[2]!.id)];
    s.cancelled(b);
    const end = await settled(h.done);
    ok(end.nodes[c]!.state === 'running', 'the ARRANGEMENT: c still running when done settled');
    const length = h.driver.foldInputs().length;
    s.settle(c, NESTED_RESULT('c'));
    equal(h.driver.foldInputs().length, length, 'c`s late settlement reached no driver — the run was released (ADR 0091)');
    ok(h.state() === end, 'and state() is still the object done resolved with');
    // A completed run: every run control is refused, and records nothing.
    const s2 = seams();
    const h2 = runtimeOn(s2).start(LINEAR, { x: 1 });
    s2.settle(String(s2.added[0]!.id), NESTED_RESULT('a'));
    s2.settle(String(s2.added[1]!.id), NESTED_RESULT('b'));
    const end2 = await settled(h2.done);
    const n = h2.driver.foldInputs().length;
    for (const [name, call] of [
      ['pause', () => h2.driver.pause({ actor: 'ops' })],
      ['cancel', () => h2.driver.cancel({ actor: 'ops' })],
      ['stop', () => h2.stop({ actor: 'ops' })],
    ] as [string, () => unknown][]) {
      let refused: unknown = null;
      try { await call(); } catch (e) { refused = e; }
      ok(refused instanceof RunControlRefused, `${name} on a finished run is refused`);
    }
    equal(h2.driver.foldInputs().length, n, 'and nothing was recorded');
    ok(h2.state() === end2, 'so state() is still the object done resolved with');
    // **The ONE run control a finished run still takes: `unpause`** — never refused `ended` (ADR 0106, RN-R35), so a run
    // that finished WHILE PAUSED can be unpaused after `done`. The element is the driver's own, so `state()` follows the
    // driver's log past `done` — RN-R44's stated exception (the conformity reader's C1): `done` is the state AT settlement.
    const s3 = seams();
    const h3 = runtimeOn(s3).start(LINEAR, { x: 1 });
    s3.settle(String(s3.added[0]!.id), NESTED_RESULT('a'));
    h3.driver.pause({ actor: 'ops' });
    s3.settle(String(s3.added[1]!.id), NESTED_RESULT('b'));
    const end3 = await settled(h3.done);
    equal([end3.outcome, end3.paused, h3.state() === end3], ['completed', true, true], 'the ARRANGEMENT: completed while paused, done the read');
    h3.driver.unpause({ actor: 'ops' });
    const after = h3.state();
    ok(after !== end3, 'the unpause is applied: state() is a NEW object');
    equal([after.paused, end3.paused], [false, true], 'state() reads it unpaused; what done resolved with is unchanged');
    equal(sameAsFold(h3, 'after the unpause'), null, 'and state() is still the caller`s own fold of the driver`s log');
  });

  test(DECLARED_CASES[8]!, async () => {
    ran.push(DECLARED_CASES[8]!);
    const s = seams();
    const h = runtimeOn(s).start(LINEAR, { x: 1 });
    const bytes = new Uint8Array([1, 2, 3]);
    const map = new Map<string, unknown>([['k', { v: 1 }]]);
    // The FIRST task returns every shape the freeze walks beyond plain data (the adequacy reader's G2): typed arrays of three
    // kinds, a Map, a Set of objects, a Map with an object KEY, and a CYCLE — which a walk without its mark never leaves.
    const cyclic: Record<string, unknown> = { n: 1 };
    cyclic.self = cyclic;
    s.settle(String(s.added[0]!.id), {
      bytes, map, plain: { n: 1 }, ints: new Int32Array([7]), shorts: new Int16Array([2]),
      set: new Set([{ s: 1 }]), keyed: new Map([[{ k: 1 }, 'v']]), cyclic,
    });
    // Read MID-RUN, synchronously, while the run is still going: a freeze that throws on a typed array fails HERE, as a
    // named failure, before `done`'s predicate meets it on a microtask (where a throw would take the runner down).
    let mid: unknown = null;
    try { h.state(); } catch (e) { mid = e; }
    equal(mid === null ? null : String(mid), null, 'state() reads a result holding typed arrays without throwing');
    s.settle(String(s.added[1]!.id), { bytes: new Float64Array([0.5]) });
    const end = await settled(h.done);
    equal(end.outcome, 'completed', 'done settles — the freeze did not throw on a typed array');
    const walk = unfrozen(end);
    equal(walk.path, null, 'everything Object.freeze can reach is frozen');
    ok(walk.views === 4, `the four typed arrays are the stated limit, counted apart: ${walk.views}`);
    const a = end.nodes[String(s.added[0]!.id)]!.result as {
      bytes: Uint8Array; map: Map<string, { v: number }>; plain: { n: number };
      set: Set<{ s: number }>; keyed: Map<{ k: number }, string>; cyclic: { self: unknown };
    };
    ok(Object.isFrozen([...a.set][0]), 'a Set`s member objects are frozen');
    ok(Object.isFrozen([...a.keyed.keys()][0]), 'a Map`s object KEYS are frozen');
    ok(Object.isFrozen(a.cyclic) && a.cyclic.self === a.cyclic, 'a cyclic result is frozen and its cycle kept');
    ok(a.bytes instanceof Uint8Array && a.bytes[2] === 3, 'the typed array arrived as the task returned it');
    ok(Object.isFrozen(a.map) && Object.isFrozen(a.map.get('k')), 'a Map is frozen as far as Object.freeze reaches — its entries` values included');
    ok(Object.isFrozen(a.plain), 'and a plain value beside them is frozen');
    ok(a.bytes !== bytes && a.map !== map, 'the runtime`s own copies, not the values the scheduler handed');
  });

  test(DECLARED_CASES[9]!, async () => {
    ran.push(DECLARED_CASES[9]!);
    // The instrument: the accumulator's prototype, wrapped for this case and restored — a count, never a clock (Q179).
    const proto = Accumulator.prototype as unknown as { materialise: () => RunState; apply: (i: FoldInput) => boolean };
    const original = { materialise: proto.materialise, apply: proto.apply };
    const tally = { materialise: 0, apply: 0 };
    proto.materialise = function (this: unknown) { tally.materialise += 1; return original.materialise.call(this); };
    proto.apply = function (this: unknown, i: FoldInput) { tally.apply += 1; return original.apply.call(this, i); };
    try {
      const run = async (items: number, read: 'outcome' | 'node' | 'state' | 'nothing') => {
        tally.materialise = 0;
        tally.apply = 0;
        const s = seams();
        const ref: { h: RunHandle | null } = { h: null };
        let inputs = 0;
        const h = ref.h = runtimeOn(s).start(MAP, { items: Array.from({ length: items }, (_, i) => i) }, {
          onFoldInput: () => {
            inputs += 1;
            if (ref.h === null) return;
            if (read === 'outcome') ref.h.outcome();
            if (read === 'node') ref.h.node(String(s.added[0]!.id));
            if (read === 'state') { ref.h.state(); ref.h.state(); }
          },
        });
        // ONE settlement per macrotask turn, as a scheduler delivers them: `done`'s predicate runs on a microtask after each
        // turn, so a predicate that materialised would pay once PER TURN — settled all in one synchronous burst, the cache
        // would absorb it and the count could not see it (the author's own probe D15 survived exactly that way).
        s.settle(String(s.added[0]!.id), { items: Array.from({ length: items }, (_, i) => i) });
        for (let i = 1; i < s.added.length; i += 1) {
          await turn();
          s.settle(String(s.added[i]!.id), { i });
        }
        const end = await settled(h.done);
        equal(end.outcome, 'completed', `${items} items, reading ${read}: completed`);
        return { ...tally, inputs, delivered: h.driver.foldInputs().length };
      };
      for (const read of ['nothing', 'outcome', 'node'] as const) {
        const t = await run(50, read);
        // 50 items: ingest dispatched and settled, the region entered, 50 opened, dispatched, settled and arrived, the join
        // and the path end — 4 x 50 + 5, derived by hand; a run that delivered fewer measured less than it claims.
        equal(t.delivered, 205, `reading ${read}: the run delivered 4 x 50 + 5 inputs`);
        equal(t.apply, t.delivered, `reading ${read}: every delivered input applied ONCE (${t.delivered})`);
        // ONE materialisation: done's, when it settles. A runtime that materialised per input would count ~4n.
        equal(t.materialise, 1, `reading ${read} after every input: ONE materialisation — done's`);
      }
      const t = await run(50, 'state');
      // Two reads per input after the handle exists: the second is the cache's. Every input moves a `map` run's state, so
      // one materialisation per input read — and done's settlement reads the cache, adding none.
      // Every input but the first (`ingest` dispatched inside `start`, before the handle exists) is read twice: ONE
      // materialisation each, 205 - 1 — and done's settlement reads the cache, adding none.
      equal([t.inputs, t.materialise], [205, 204], 'reading state() twice after every input: one materialisation per input read, the second read cached');
    } finally {
      proto.materialise = original.materialise;
      proto.apply = original.apply;
    }
    ok(Accumulator.prototype.materialise === original.materialise, 'the instrument is removed');
  });

  test(DECLARED_CASES[10]!, () => {
    equal(ran, DECLARED_CASES.slice(0, -1), 'every declared case ran, in order — a case that leaves the suite fails here naming itself');
    equal(collected().filter((s) => s.suite === SUITE).reduce((n, s) => n + s.cases.length, 0), DECLARED_CASES.length,
      'and the suite registers exactly the cases it declares');
  });
});
