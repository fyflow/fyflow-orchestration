/**
 * Ladder L2 — **what a node was HANDED, read after the fact by replaying the run to that node's composition** —
 * [W205](../../doc/work-items/w205-what-a-node-was-handed-read-by-replaying-the-run.md) under
 * [P42](../../doc/plans/p42-what-a-node-was-handed-asked-after-the-fact.md) decisions 1-7,
 * [ADR 0128](../../doc/decisions/0128-what-a-node-was-handed-is-read-by-replaying-the-run-to-its-composition.md),
 * `spec/run-state.md` `RN-R45`.
 *
 * `inputOf(flow, options, { header, events }, target)` builds a deaf driver for the stored run and replays it until the
 * target's composition. **Every expected value comes from somewhere other than the reading**:
 *
 * | what | from |
 * |---|---|
 * | a task's answer | the envelope the run's own driver handed `createTask` — captured on the double (exit (1)'s oracle). **It shares `compose` and `dispatch` with its subject BY DESIGN**, so it proves the cut and the replay, never the composition — which is why every per-kind claim below ALSO holds a value derived BY HAND from the spec |
 * | an ask's answer | its `asked` element's `input` (`RN-R37`), and by hand |
 * | every other kind's | by hand from `FD-C1`, `JP-R11`, `JP-R12` and the gate's own routes, on a flow built so each WRONG selection differs: an early-firing join with a late arrival, a gate whose memory decides a later route, an `all` and a `"n?"` read whose later siblings settle after dispatch, `"$payload"` at the entry, an end reached on several paths in an order that is not path order |
 * | the refusals | `RN-R45`'s table, P42 decision 5; `format` and `flow` from `resumeRefusal`'s own messages |
 *
 * **Bounded for the chromium lane's 60 s** (P42's brief): the corpus is the valid corpus under TWO drains, its prefixes
 * the RESTS a store would hold (one per settlement), and the per-prefix question asked per NODE (one replay answers every
 * path) — the large sizes are the cost suite's (`test/fold/input-of-cost.test.ts`). Nothing here reads a file but the
 * corpus, which the browser bundle inlines.
 */
import { collected, deepEqual, equal, listDir, ok, readText, ROOT, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { Driver, inputOf, type Checkpoint, type InputOfOptions, type InputReading, type NodeInput } from '../../src/driver/driver.ts';
import { buildTaskId, parseTaskId } from '../../src/driver/ids.ts';
import { fold } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { DecisionContext } from '../../src/driver/routing.ts';
import type { FlowDefinition, GateType } from '../../src/definition/types.ts';
import type { FoldInput } from '../../src/fold/run-state.ts';
import { CORPUS_LANGUAGES } from '../definition/corpus-types.ts';

const SUITE = 'L2 — W205, RN-R45: what a node was HANDED, read by replaying the run to its composition — the corpus oracle on every rest and every resume, every kind by hand, every refusal, every halt read up to the halt, deaf';

/** A scheduler double that RECORDS what it is handed and fires only what a case tells it to. */
class Fake {
  readonly added: string[] = [];
  private readonly listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(t: unknown): void { this.added.push((t as { id: string }).id); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  cancel(): Promise<boolean> { return Promise.resolve(true); }
  fire(type: string, detail: Record<string, unknown>): void {
    const d = { attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, error: null, ...detail };
    for (const fn of this.listeners.get(type) ?? []) fn({ detail: d });
  }
  done(id: string, result: unknown): void { this.fire('task.completed', { id, state: 'done', result }); }
  /** A non-optional task out of retries — the PAIR, one object (ADR 0007 rule 2). */
  userAction(id: string): void {
    const d = { id, state: 'user_action', error: 'boom' };
    this.fire('task.failed', d);
    this.fire('task.user_action', d);
  }
}

const TYPES = typesFor(['T'], {}, {});
const flow = (flowId: string, entry: string, nodes: unknown[]): FlowDefinition => ({ flowId, version: 1, entry, nodes } as unknown as FlowDefinition);
const END = { id: 'done', kind: 'end', outcome: 'completed' };

/** **A policy that fires on the FIRST arrival** — the third-party policy ADR 0046 rule 4 names, which lets a branch arrive LATE. */
const FIRST: JoinPolicy<{ fired: boolean }> = {
  id: 'first-arrival',
  open: () => ({ fired: false }),
  step: (s, e) => (e.type === 'branch.arrived' ? { fired: true } : s),
  status: (s) => (s.fired ? 'satisfied' : 'waiting'),
  describe: (s) => ({ fired: s.fired }),
};

interface Made {
  driver: Driver;
  sch: Fake;
  /** What the driver handed `createTask`, per task id — a structured clone taken AT the call. */
  envelopes: Map<string, unknown>;
  /** The options a reading builds its driver from: the same registry, predicates and policy. */
  opts: InputOfOptions;
  failures: string[];
}

function make(def: FlowDefinition, o: {
  predicates?: Map<string, (c: DecisionContext) => boolean>; policy?: JoinPolicy; gateTypes?: Record<string, GateType>;
  onFoldInput?: (input: FoldInput, seq: number) => void;
} = {}): Made {
  const sch = new Fake();
  const envelopes = new Map<string, unknown>();
  const failures: string[] = [];
  const opts: InputOfOptions = {
    predicates: o.predicates ?? new Map(), ...TYPES, joinPolicy: (o.policy ?? liveToken) as JoinPolicy,
    ...(o.gateTypes !== undefined ? { gateTypes: o.gateTypes } : {}),
  };
  const driver = new Driver(def, {
    runId: 'r1', scheduler: sch as never, ...opts,
    createTask: (c) => { envelopes.set(c.id, structuredClone(c.payload)); return c as never; },
    onRunFailure: (f) => { failures.push(f.kind); },
    ...(o.onFoldInput !== undefined ? { onFoldInput: o.onFoldInput } : {}),
  });
  return { driver, sch, envelopes, opts, failures };
}

/** The one answer a path target must have; a failure names the refusal. */
function one(r: InputReading, what: string): NodeInput {
  if (!r.ok) throw new Error(`${what}: refused ${r.reason}@${r.index} — ${r.message}`);
  equal(r.inputs.length, 1, `${what}: a target with a path has exactly one answer`);
  return r.inputs[0]!;
}
const refusal = (r: InputReading) => (r.ok ? 'ANSWERED' : `${r.reason}@${r.index}`);
const view = (r: InputReading) => (r.ok ? r.inputs.map((i) => [i.branchPath, i.handed, i.value]) : refusal(r));

// --- the corpus -----------------------------------------------------------------------------------------------------

const EX = `${ROOT}spec/examples`;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as {
  workers: Record<string, { url: string }>; nodeTypes: Record<string, { worker: string }>; groups: Record<string, unknown>;
  pools: Record<string, { type: string }>; predicates: string[];
};
const CORPUS_OPTS: InputOfOptions = {
  predicates: new Map(reg.predicates.map((n, i) => [n, () => i % 2 === 0])),
  workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, groups: Object.keys(reg.groups ?? {}), languages: CORPUS_LANGUAGES,
  joinPolicy: liveToken as JoinPolicy, validateBoundaries: false,
};
const validNames = (await listDir(`${EX}/valid`)).filter((n) => n.endsWith('.flow.json')).sort();
const DEFS: [string, FlowDefinition][] = [];
for (const name of validNames) DEFS.push([name, JSON.parse(await readText(`${EX}/valid/${name}`)) as FlowDefinition]);

/** What every corpus task returns — every key a corpus `over`, gate key or predicate path reads (`reference-index.test.ts`'s). */
const RESULT = (id: string) => ({
  by: id, items: ['a', 'b', 'c'], rows: ['p', 'q'], files: ['a', 'b', 'c'], slots: ['x', 'y'], config: { threshold: 7 },
  runLabel: 'nightly', series: { id: ['s1', 's1', 's2'][Number(id.split(':')[2]) % 3] ?? 's1' },
});
type Drain = 'in order' | 'reverse, alternate failures, parked and resolved';
const DRAINS: Drain[] = ['in order', 'reverse, alternate failures, parked and resolved'];

interface CorpusRun { rests: Checkpoint[]; envelopes: Map<string, unknown>; final: Checkpoint }

/** A corpus flow driven to rest under one drain, its checkpoint taken at EVERY rest (one per settlement or resolution). */
function driveCorpus(def: FlowDefinition, drain: Drain, from: Checkpoint | null = null): CorpusRun {
  const sch = new Fake();
  const envelopes = new Map<string, unknown>();
  const d = new Driver(def, {
    runId: from === null ? 'r1' : from.header.runId, scheduler: sch as never, ...CORPUS_OPTS,
    createTask: (c) => { envelopes.set(c.id, structuredClone(c.payload)); return c as never; },
    onRunFailure: () => {},
  });
  if (from === null) d.start(RESULT('payload'));
  else d.resume(from);
  const rests: Checkpoint[] = [];
  const settled = new Set<string>();
  let flip = false;
  for (let guard = 0; guard < 400; guard += 1) {
    rests.push(d.checkpoint());
    const open = sch.added.filter((id) => !settled.has(id));
    if (open.length > 0) {
      const id = drain === 'in order' ? open[0]! : open[open.length - 1]!;
      settled.add(id);
      if (drain !== 'in order' && (flip = !flip)) {
        if (id.split(':')[2] === '-' || id.endsWith(':0:0')) sch.userAction(id);
        else sch.fire('task.failed', { id, state: 'failed', error: 'boom' });
      } else sch.done(id, RESULT(id));
      continue;
    }
    const state = fold(d.foldInputs());
    const waiting = Object.entries(state.nodes).find(([, n]) => n.state === 'suspended');
    if (waiting === undefined || !d.resolve(waiting[0], 'done', { result: RESULT(waiting[0]), actor: 'ana' })) break;
  }
  return { rests, envelopes, final: d.checkpoint() };
}

/** Every task id a stored sequence dispatched, and every ask it asked with its input. */
const dispatchedIn = (cp: Checkpoint) => cp.events.filter((e): e is Extract<FoldInput, { kind: 'dispatched' }> => e.kind === 'dispatched').map((e) => e.taskId);
const askedIn = (cp: Checkpoint) => cp.events.filter((e): e is Extract<FoldInput, { kind: 'asked' }> => e.kind === 'asked');

// --- the constructed flows -------------------------------------------------------------------------------------------

/**
 * **A map, a gate whose MEMORY decides a later route, and two ends** — `fetch` (the entry, reading `"$payload"` and `"."`)
 * hands `m` five items; each instance's `w` returns its item's key, and `g` (the built-in `distinct` on `k`) keeps the
 * FIRST of a key, drops a duplicate to `drop` and a keyless one to `lost`. The kept ones settle `keep` (settings its own),
 * arrive at `mj`, and `s` reads `["keep?"]` and `"."`.
 */
const MAP_GATE = flow('map-gate', 'fetch', [
  { id: 'fetch', kind: 'task', type: 'T', needs: { run: '$payload', it: '.' }, edges: [{ to: 'm' }] },
  { id: 'm', kind: 'map', over: 'items', branch: 'w' },
  { id: 'w', kind: 'task', type: 'T', edges: [{ to: 'g' }] },
  { id: 'g', kind: 'gate', type: 'distinct', settings: { key: 'k' }, edges: [{ to: 'keep' }, { route: 'duplicate', to: 'drop' }, { route: 'nokey', to: 'lost' }] },
  { id: 'keep', kind: 'task', type: 'T', settings: { mode: 'keep' }, edges: [{ to: 'mj' }] },
  { id: 'drop', kind: 'end', outcome: 'duplicate' },
  { id: 'lost', kind: 'end', outcome: 'unidentified' },
  { id: 'mj', kind: 'join', of: 'm', edges: [{ to: 's' }] },
  { id: 's', kind: 'task', type: 'T', needs: { all: ['keep?'], got: '.' }, edges: [{ to: 'done' }] },
  END,
]);
const PAYLOAD = { tenant: 't1', note: 'the run`s own' };
const ITEMS = [{ k: 'x', n: 0 }, { k: 'y', n: 1 }, { k: 'x', n: 2 }, { n: 3 }, { k: 'x', n: 4 }];
const W = (i: number) => ({ ...(ITEMS[i]!.k !== undefined ? { k: ITEMS[i]!.k } : {}), by: `w${i}` });
const K = (i: number) => ({ kept: i });

/**
 * Settled in the order 2, 4, 3, 0, 1 — so `g` decides `first` at 2, `duplicate` at 4 and 0 (its memory holds `x` from 2),
 * `nokey` at 3 and `first` at 1; `keep:2` settles before `keep:1`, so `mj` fires on 1's arrival.
 */
function driveMapGate(): Made {
  const m = make(MAP_GATE);
  m.driver.start(PAYLOAD);
  m.sch.done('r1:fetch:-:0', { items: ITEMS, tag: 'fetched' });
  for (const i of [2, 4, 3, 0, 1]) m.sch.done(`r1:w:${i}:0`, W(i));
  m.sch.done('r1:keep:2:0', K(2));
  m.sch.done('r1:keep:1:0', K(1));
  m.sch.done('r1:s:-:0', { fin: true });
  return m;
}

/**
 * **Two early-firing joins, each with LATE arrivals** — `j` (of fanout `f`) and `mj` (of map `m`) fire on the FIRST arrival.
 * `s` reads `"c?"` — its sibling `c` settles AFTER `s` is dispatched — and `t` reads `["w"]` — two of the three `w`s settle
 * after. A composition from the FINAL state would hand `s` a `c` and `t` three `w`s; the run handed neither.
 */
const EARLY = flow('early', 'a', [
  { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'f' }] },
  { id: 'f', kind: 'fanout', branches: ['b', 'c'] },
  { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'j' }] },
  { id: 'c', kind: 'task', type: 'T', edges: [{ to: 'j' }] },
  { id: 'j', kind: 'join', of: 'f', edges: [{ to: 's' }] },
  { id: 's', kind: 'task', type: 'T', needs: { c: 'c?', it: '.' }, edges: [{ to: 'm' }] },
  { id: 'm', kind: 'map', over: 'items', branch: 'w' },
  { id: 'w', kind: 'task', type: 'T', edges: [{ to: 'mj' }] },
  { id: 'mj', kind: 'join', of: 'm', edges: [{ to: 't' }] },
  { id: 't', kind: 'task', type: 'T', needs: { ws: ['w'], it: '.' }, edges: [{ to: 'done' }] },
  END,
]);
const A = { a: 1 }, B = { b: 2 }, C = { c: 3 }, S = { items: ['p', 'q', 'r'] };
const WE = (i: number) => ({ w: i });

function driveEarly(): Made {
  const m = make(EARLY, { policy: FIRST as JoinPolicy });
  m.driver.start({ go: true });
  m.sch.done('r1:a:-:0', A);
  m.sch.done('r1:b:0:0', B);
  m.sch.done('r1:c:1:0', C);
  m.sch.done('r1:s:-:0', S);
  m.sch.done('r1:w:1:0', WE(1));
  m.sch.done('r1:w:0:0', WE(0));
  m.sch.done('r1:w:2:0', WE(2));
  m.sch.done('r1:t:-:0', { fin: true });
  return m;
}

/** **An ask, and a task parked at `user_action` then resolved** — `q` reads `"."` and `"$payload"`; `z` reads `"."` and `q`. */
const ASKED = flow('asked', 'a', [
  { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'q' }] },
  { id: 'q', kind: 'ask', needs: { got: '.', run: '$payload' }, edges: [{ to: 'z' }] },
  { id: 'z', kind: 'task', type: 'T', needs: { answer: '.', q: 'q' }, edges: [{ to: 'done' }] },
  END,
]);

/** **A decision** — `a` routes to `x` where `p` holds, else to the end `y`. */
const DECIDE = flow('decide', 'a', [
  { id: 'a', kind: 'task', type: 'T', edges: [{ when: { predicate: 'p' }, to: 'x' }, { to: 'y' }] },
  { id: 'x', kind: 'task', type: 'T', edges: [{ to: 'z' }] },
  { id: 'z', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
  { id: 'y', kind: 'end', outcome: 'other' },
  END,
]);
const yes = new Map([['p', () => true]]);
const no = new Map([['p', () => false]]);

/** **A fan-out of two** — the shape a consumer's throw on one `dispatched` element splits. */
const FAN = flow('fan', 'a', [
  { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'f' }] },
  { id: 'f', kind: 'fanout', branches: ['x', 'y'] },
  { id: 'x', kind: 'task', type: 'T', edges: [{ to: 'j' }] },
  { id: 'y', kind: 'task', type: 'T', edges: [{ to: 'j' }] },
  { id: 'j', kind: 'join', of: 'f', edges: [{ to: 'done' }] },
  END,
]);

const DECLARED_CASES = [
  'the corpus oracle: every dispatched task of every valid corpus flow answered EQUAL to the envelope the driver handed createTask — per task id at the end, per node at EVERY prefix of the stored events, and every ask its asked input',
  'the corpus oracle on a RESUME from every rest: every task the resumed run dispatched answered equal to the envelope a createTask was handed for it',
  'a map, a gate with memory, two ends — by hand: "$payload" at the entry, the map`s received, the gate`s per path in REPLAY order, an end reached on several paths in that order, a task id and its (node, path) one answer',
  'a join`s two answers by hand — an arrival at each arriving path, the LATE one after an early firing included, and the collection at the opener`s; a "n?" read and an all read whose siblings settle after dispatch answered as composed THEN',
  'an ask`s answer is its asked element`s input, by hand; a task parked at user_action and resolved: its one dispatch`s envelope, before the resolution and after',
  'unknown: a node the definition lacks, a malformed path, a task id that does not parse, of another run, at another attempt, naming a node with no task id, and a target of neither shape',
  'not-reached: a node the run never entered, a well-formed path it never reached, a task dispatched after a prefix — each with the prefix`s length',
  'diverged: a changed registry and a changed definition BEFORE the target — a predicate routing INTO the target refused, never answered — and AFTER it the target answered (the stated limit)',
  'format and flow: the header refused by resumeRefusal`s own half and its message, an element that is no element, a header payload that does not clone — and a halted, cancelled run is NOT refused',
  'every halt class read up to the halt and not-reached after it, never diverged: a predicate`s throw, FD-R3, FD-R5, OR-R6, OR-R10 on a dispatched element, and a 0.7.0 stopped element',
  'a run the scheduler cancelled, one its owner cancelled and one its owner stopped — each read up to its end, and the stopped run`s resume read through it',
  'a reading is DEAF: callbacks handed in its options are not called, nothing is handed on, nothing is appended to the stored run — the control: a resume handed the same calls them',
  'the cases above are exactly the cases declared',
] as const;

suite(SUITE, (test) => {
  test(DECLARED_CASES[0], () => {
    let tasks = 0, asks = 0, nodeReads = 0, prefixes = 0, flows = 0;
    for (const [name, def] of DEFS) {
      flows += 1;
      for (const drain of DRAINS) {
        const run = driveCorpus(def, drain);
        // (i) At the END: every task by its id, equal to what `createTask` was handed; every ask equal to its `asked` input.
        for (const id of dispatchedIn(run.final)) {
          tasks += 1;
          const got = one(inputOf(def, CORPUS_OPTS, run.final, { taskId: id }), `${name} (${drain}) ${id}`);
          ok(run.envelopes.has(id), `${name} (${drain}): ${id} was dispatched, so createTask was handed it`);
          ok(got.kind === 'task' && got.handed === 'envelope', `${name} (${drain}) ${id}: a task's answer is its envelope`);
          ok(deepEqual(got.value, run.envelopes.get(id)), `${name} (${drain}) ${id}: the answer is NOT the envelope createTask was handed:\n  ${JSON.stringify(got.value)}\n  ${JSON.stringify(run.envelopes.get(id))}`);
        }
        for (const a of askedIn(run.final)) {
          asks += 1;
          const got = one(inputOf(def, CORPUS_OPTS, run.final, { taskId: a.taskId }), `${name} (${drain}) ${a.taskId}`);
          ok(got.kind === 'ask' && got.handed === 'received' && deepEqual(got.value, a.input), `${name} (${drain}) ${a.taskId}: an ask's answer is its asked input`);
        }
        // (ii) At EVERY PREFIX of the stored events — every rest, and every position INSIDE a step, where a node's composition
        // and its own element fall on the two sides of the cut — per TASK NODE, one replay: exactly the node's tasks whose
        // `dispatched` element the prefix holds, in dispatch order, each equal to its envelope.
        for (let n = 0; n <= run.final.events.length; n += 1) {
          const cp: Checkpoint = { header: run.final.header, events: run.final.events.slice(0, n) };
          prefixes += 1;
          const inPrefix = dispatchedIn(cp);
          for (const n of def.nodes) {
            if (n.kind !== 'task') continue;
            nodeReads += 1;
            const r = inputOf(def, CORPUS_OPTS, cp, { nodeId: n.id });
            const want = inPrefix.filter((id) => parseTaskId(id).nodeId === n.id);
            if (!r.ok) {
              equal([r.reason, want], ['not-reached', []], `${name} (${drain}) at ${cp.events.length}: ${n.id} refused ${r.reason}`);
              continue;
            }
            const ids = r.inputs.map((i) => buildTaskId('r1', n.id, i.branchPath === '-' ? null : i.branchPath.split('.').map(Number)));
            equal(ids, want, `${name} (${drain}) at ${cp.events.length}: ${n.id}'s answers are its dispatches in the prefix, in dispatch order`);
            r.inputs.forEach((i, k) => ok(deepEqual(i.value, run.envelopes.get(ids[k]!)), `${name} (${drain}) at ${cp.events.length}: ${ids[k]} differs from its envelope`));
          }
        }
      }
    }
    // The arrangement, so a corpus that shrank to nothing cannot pass in silence.
    equal(flows, DEFS.length, 'every valid corpus flow was driven');
    ok(DEFS.length >= 26 && tasks >= 200 && asks >= 8 && prefixes >= 900 && nodeReads >= 3500,
      `the oracle reached the corpus: ${DEFS.length} flows, ${tasks} task answers, ${asks} asks, ${prefixes} prefixes, ${nodeReads} node reads`);
  });

  test(DECLARED_CASES[1], () => {
    let resumed = 0, checked = 0, reHanded = 0;
    for (const [name, def] of DEFS) for (const drain of DRAINS) {
      const run = driveCorpus(def, drain);
      for (const cp of run.rests) {
        const again = driveCorpus(def, drain, cp);
        resumed += 1;
        // The resume's IN-FLIGHT set — what its `resumed` element names (RN-R21, RN-R22): handed on AGAIN, so the stored
        // run's envelope and the resumed run's must be one. (Every other task the two share was dispatched by each on its
        // own continuation — a drain's failures fall differently after a resume — and is not compared across them.)
        const inFlight = (again.final.events.slice(cp.events.length).find((e) => e.kind === 'resumed') as { taskIds: string[] }).taskIds;
        for (const id of inFlight) {
          reHanded += 1;
          ok(deepEqual(again.envelopes.get(id), run.envelopes.get(id)), `${name}: ${id} re-handed by the resume with a different envelope`);
        }
        for (const id of dispatchedIn(again.final)) {
          const got = one(inputOf(def, CORPUS_OPTS, again.final, { taskId: id }), `${name} resumed at ${cp.events.length}: ${id}`);
          // The resumed run's createTask saw what it handed on — the in-flight set again, then what it dispatched; a task
          // settled before the resume was handed on by the first run alone.
          const want = again.envelopes.get(id) ?? run.envelopes.get(id);
          ok(want !== undefined, `${name} resumed at ${cp.events.length}: ${id} was handed to some createTask`);
          ok(deepEqual(got.value, want), `${name} resumed at ${cp.events.length}: ${id} is not the envelope handed for it`);
          checked += 1;
        }
      }
    }
    ok(resumed >= 300 && checked >= 1500 && reHanded >= 300, `resumed ${resumed} times, ${checked} answers checked, ${reHanded} re-handed`);
  });

  test(DECLARED_CASES[2], () => {
    const m = driveMapGate();
    const cp = m.driver.checkpoint();
    equal(m.failures, [], 'the run halts nowhere');
    const read = (target: Parameters<typeof inputOf>[3]) => inputOf(MAP_GATE, m.opts, cp, target);
    // `fetch`, the ENTRY: `"$payload"` is the run's payload and `"."` is what `start` was called with — the same value here.
    equal(one(read({ taskId: 'r1:fetch:-:0' }), 'fetch').value, { settings: {}, input: { run: PAYLOAD, it: PAYLOAD } },
      'the entry task`s envelope: no settings, its input composed from the header`s payload (FD-C1 "$payload", ".")');
    // `m` — the edge value: fetch's result, whole.
    equal(view(read({ nodeId: 'm', branchPath: '-' })), [['-', 'received', { items: ITEMS, tag: 'fetched' }]], 'the map is handed fetch`s result, the value it reads `over` from');
    // `w:i` — its own item (JP-R11).
    for (const i of [0, 1, 2, 3, 4]) equal(one(read({ taskId: `r1:w:${i}:0` }), `w:${i}`).value, { settings: {}, input: ITEMS[i] }, `w:${i} is handed its own item`);
    // `g`, node id alone: every path, in the order the replay reached them — settlement order 2, 4, 3, 0, 1, never path order.
    equal(view(read({ nodeId: 'g' })), [2, 4, 3, 0, 1].map((i) => [String(i), 'received', W(i)]),
      'the gate is handed each w`s result, in the order the run reached it — 2, 4, 3, 0, 1');
    // `drop`, reached on TWO paths — 4 then 0, because the gate's memory held `x` from instance 2 (RN-R26).
    equal(view(read({ nodeId: 'drop' })), [['4', 'received', W(4)], ['0', 'received', W(0)]],
      'the duplicate end is reached at 4 and then 0 — what reached it is what the gate was handed, unchanged');
    equal(view(read({ nodeId: 'lost' })), [['3', 'received', W(3)]], 'the keyless item reaches `lost`, alone');
    // `keep`, a task: its settings are its OWN, and the task id and its (node, path) name ONE answer.
    const byId = one(read({ taskId: 'r1:keep:1:0' }), 'keep by id');
    const byPath = one(read({ nodeId: 'keep', branchPath: '1' }), 'keep by path');
    equal(byId, byPath, 'a task id and its (node, branch path) are one answer');
    equal(byId, { nodeId: 'keep', kind: 'task', branchPath: '1', handed: 'envelope', value: { settings: { mode: 'keep' }, input: W(1) } },
      'keep:1 is handed its node`s settings and the gate`s value');
    equal((view(read({ nodeId: 'keep' })) as unknown[][]).map((x) => x[0]), ['2', '1'], 'keep`s answers in DISPATCH order — 2 then 1');
    // `mj`: arrivals at 2 then 1, then the collection at '-', keyed and ordered by branch path (JP-R12).
    equal(view(read({ nodeId: 'mj' })), [['2', 'arrival', K(2)], ['1', 'arrival', K(1)], ['-', 'collection', { 1: K(1), 2: K(2) }]],
      'the join: two arrivals in arrival order, then what it handed on');
    equal(Object.keys((one(read({ nodeId: 'mj', branchPath: '-' }), 'mj collection').value as object)), ['1', '2'], 'the collection`s keys in branch-path order');
    // `s`: `["keep?"]` in branch-path order, and `"."` the collection.
    equal(one(read({ taskId: 'r1:s:-:0' }), 's').value, { settings: {}, input: { all: [K(1), K(2)], got: { 1: K(1), 2: K(2) } } }, 's composes both keeps and the collection');
    const sEnv = one(read({ taskId: 'r1:s:-:0' }), 's').value as { settings: object; input: { all: object[] } };
    ok(Object.isFrozen(sEnv.input.all[0]) && !Object.isFrozen(sEnv.settings) && !Object.isFrozen(sEnv),
      'handed AS BUILT (ADR 0128 rule 4): a needs-composed value is the reading driver`s frozen shared copy (ADR 0126), the envelope and its settings the caller`s own — not copied again');
    equal(view(read({ nodeId: 'done', branchPath: '-' })), [['-', 'received', { fin: true }]], 'the end after s is handed s`s result');
    // `options` with NO joinPolicy: the reading defaults to `liveToken`, as `runtime.resume` does — and answers the same.
    const { joinPolicy: _policy, ...noPolicy } = m.opts;
    equal(inputOf(MAP_GATE, noPolicy, cp, { nodeId: 'mj' }), read({ nodeId: 'mj' }), 'no joinPolicy in the options: liveToken, the run`s own here');
    // **An END SHARED by two sequential regions** (`end` is exempt from FD-V19, so the definition validates): reached
    // from `a` on f1's branch 0 and from `d` on f2's branch 1. Its path is the BRANCH THAT REACHED IT — what its
    // `branch.exited` names — never the path the graph gives the node, which is one region's whichever branch arrives.
    const SHARED = flow('shared-end', 'a0', [
      { id: 'a0', kind: 'task', type: 'T', edges: [{ to: 'f1' }] },
      { id: 'f1', kind: 'fanout', branches: ['a', 'b'] },
      { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'out' }] },
      { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'j1' }] },
      { id: 'j1', kind: 'join', of: 'f1', edges: [{ to: 'f2' }] },
      { id: 'f2', kind: 'fanout', branches: ['c', 'd'] },
      { id: 'c', kind: 'task', type: 'T', edges: [{ to: 'j2' }] },
      { id: 'd', kind: 'task', type: 'T', edges: [{ to: 'out' }] },
      { id: 'j2', kind: 'join', of: 'f2', edges: [{ to: 'done' }] },
      { id: 'out', kind: 'end', outcome: 'exited' },
      END,
    ]);
    const sh = make(SHARED);
    sh.driver.start({});
    for (const [id, v] of [['r1:a0:-:0', 0], ['r1:a:0:0', 'from a'], ['r1:b:1:0', 'from b'], ['r1:c:0:0', 'from c'], ['r1:d:1:0', 'from d']] as const) sh.sch.done(id, v);
    equal(sh.failures, [], 'the shared-end run halts nowhere');
    equal(view(inputOf(SHARED, sh.opts, sh.driver.checkpoint(), { nodeId: 'out' })), [['0', 'received', 'from a'], ['1', 'received', 'from d']],
      'the shared end: reached at 0 from a and at 1 from d — each the branch that reached it');
    // **The stated limit** (RN-R45, ADR 0128 rule 3; W205's conformity reader, finding 1): an end shared by two SIBLING
    // regions can be reached TWICE on one path — here at 0 from a (f1) and at 0 from c (f2). A path target answers the
    // FIRST composition on its path; the node id alone lists both, told apart by their order alone.
    const TWICE = flow('twice', 'a0', SHARED.nodes.map((n) => (n as { id: string }).id === 'c'
      ? { id: 'c', kind: 'task', type: 'T', edges: [{ to: 'out' }] }
      : (n as { id: string }).id === 'd' ? { id: 'd', kind: 'task', type: 'T', edges: [{ to: 'j2' }] } : n));
    const tw = make(TWICE);
    tw.driver.start({});
    for (const [id, v] of [['r1:a0:-:0', 0], ['r1:a:0:0', 'from a'], ['r1:b:1:0', 'from b'], ['r1:c:0:0', 'from c'], ['r1:d:1:0', 'from d']] as const) tw.sch.done(id, v);
    equal(tw.failures, [], 'the twice-reached run halts nowhere');
    const twCp = tw.driver.checkpoint();
    equal(view(inputOf(TWICE, tw.opts, twCp, { nodeId: 'out' })), [['0', 'received', 'from a'], ['0', 'received', 'from c']], 'the node id alone: both, in replay order');
    equal(view(inputOf(TWICE, tw.opts, twCp, { nodeId: 'out', branchPath: '0' })), [['0', 'received', 'from a']], 'the path target: the FIRST on that path');
    // The control on the oracle: what createTask was handed agrees with every hand-derived envelope above.
    equal(m.envelopes.get('r1:keep:1:0'), { settings: { mode: 'keep' }, input: W(1) }, 'the double saw the same envelope the hand derivation says');
  });

  test(DECLARED_CASES[3], () => {
    const m = driveEarly();
    const cp = m.driver.checkpoint();
    const read = (target: Parameters<typeof inputOf>[3]) => inputOf(EARLY, m.opts, cp, target);
    equal(view(read({ nodeId: 'j' })), [['0', 'arrival', B], ['-', 'collection', { 0: B }], ['1', 'arrival', C]],
      'j: b arrives and the join FIRES on it, handing on {0: B}; c arrives LATE, after the firing — and is answered');
    equal(one(read({ nodeId: 'j', branchPath: '1' }), 'the late arrival').value, C, 'the late arrival by its path');
    equal(one(read({ nodeId: 'j', branchPath: '-' }), 'the collection').value, { 0: B }, 'the collection by the opener`s path: what was handed on, not what arrived');
    // `s` reads `"c?"`: c had NOT settled at s's dispatch, so the key is ABSENT (FD-C4) — the final state has c's output.
    equal(one(read({ taskId: 'r1:s:-:0' }), 's').value, { settings: {}, input: { it: { 0: B } } }, 's was handed no `c` — c settled after it was dispatched');
    ok(fold(cp.events).nodes['r1:c:1:0']?.state === 'done', 'the control: c DID settle, so a composition from the final state would have handed s a `c`');
    // `t` reads `["w"]`: only w:1 had settled when mj fired on it.
    equal(one(read({ taskId: 'r1:t:-:0' }), 't').value, { settings: {}, input: { ws: [WE(1)], it: { 1: WE(1) } } }, 't was handed one w — the other two settled after');
    equal(view(read({ nodeId: 'mj' })), [['1', 'arrival', WE(1)], ['-', 'collection', { 1: WE(1) }], ['0', 'arrival', WE(0)], ['2', 'arrival', WE(2)]],
      'mj: w:1 arrives and fires it, then w:0 and w:2 arrive late');
    equal(view(read({ nodeId: 'f', branchPath: '-' })), [['-', 'received', A]], 'the fanout is handed a`s result');
    equal(one(read({ taskId: 'r1:c:1:0' }), 'c').value, { settings: {}, input: A }, 'each branch its own copy of a`s result (JP-R11)');
    ok(deepEqual(m.envelopes.get('r1:t:-:0'), { settings: {}, input: { ws: [WE(1)], it: { 1: WE(1) } } }), 'the double saw the same envelope for t');
  });

  test(DECLARED_CASES[4], () => {
    const m = make(ASKED);
    m.driver.start({ who: 'p' });
    m.sch.done('r1:a:-:0', { draft: 1 });
    // At the park: the ask has its answer already.
    const parked = m.driver.checkpoint();
    const asked = askedIn(parked)[0]!;
    const q = one(inputOf(ASKED, m.opts, parked, { taskId: 'r1:q:-:0' }), 'q at the park');
    equal(q, { nodeId: 'q', kind: 'ask', branchPath: '-', handed: 'received', value: { got: { draft: 1 }, run: { who: 'p' } } }, 'the ask was handed `.` and "$payload" — by hand');
    equal(q.value, asked.input, 'and that IS its asked element`s input (RN-R37)');
    ok(Object.isFrozen((q.value as { run: object }).run) && !Object.isFrozen(q.value as object), 'handed AS BUILT (ADR 0128 rule 4): the ask`s "$payload" key is the reading driver`s ONE frozen copy of the run`s payload (ADR 0126), the composed object the caller`s own');
    ok(m.driver.resolve('r1:q:-:0', 'done', { result: { approved: true }, actor: 'ana' }), 'the person answers');
    m.sch.userAction('r1:z:-:0');
    const zWant = { settings: {}, input: { answer: { approved: true }, q: { approved: true } } };
    const atPark = m.driver.checkpoint();
    equal(one(inputOf(ASKED, m.opts, atPark, { taskId: 'r1:z:-:0' }), 'z parked').value, zWant, 'z, parked at user_action: the envelope its one dispatch carried');
    ok(m.driver.resolve('r1:z:-:0', 'done', { result: { fixed: true }, actor: 'ana' }), 'the person resolves z');
    const end = m.driver.checkpoint();
    equal(one(inputOf(ASKED, m.opts, end, { taskId: 'r1:z:-:0' }), 'z resolved').value, zWant, 'and after its resolution: still that ONE envelope — a resolution re-dispatches nothing');
    equal(m.envelopes.get('r1:z:-:0'), zWant, 'the double saw z once, with that envelope');
    equal(view(inputOf(ASKED, m.opts, end, { nodeId: 'done' })), [['-', 'received', { fixed: true }]], 'the end is handed the resolution`s result');
  });

  test(DECLARED_CASES[5], () => {
    const m = driveMapGate();
    const cp = m.driver.checkpoint();
    const reason = (target: unknown) => {
      const r = inputOf(MAP_GATE, m.opts, cp, target as Parameters<typeof inputOf>[3]);
      return r.ok ? 'ANSWERED' : `${r.reason}:${r.index}`;
    };
    equal([
      reason({ nodeId: 'nope' }),
      reason({ nodeId: 'w', branchPath: '0.x' }),
      reason({ nodeId: 'w', branchPath: '' }),
      reason({ nodeId: 'w', branchPath: 7 }),
      reason({ taskId: 'garbage' }),
      reason({ taskId: 'r9:w:0:0' }),
      reason({ taskId: 'r1:w:0:1' }),
      reason({ taskId: 'r1:g:0:0' }),
      reason({ taskId: 'r1:nope:-:0' }),
      reason({}),
      reason(null),
    ], Array(11).fill('unknown:null'), 'each target that names nothing this run can have is `unknown`, index null');
    equal([reason({ nodeId: 'w', branchPath: '0' }), reason({ taskId: 'r1:w:0:0' })], ['ANSWERED', 'ANSWERED'], 'the control: the same node and id, well-formed, are answered');
    // A run that is NOT r1: the reading builds its driver for the header's run id, and a task id of ANOTHER run is unknown.
    const sch7 = new Fake();
    const d7 = new Driver(DECIDE, { runId: 'r7', scheduler: sch7 as never, ...m.opts, predicates: yes, createTask: (c) => c as never });
    d7.start({});
    sch7.done('r7:a:-:0', 1);
    const cp7 = d7.checkpoint();
    const opts7 = { ...m.opts, predicates: yes };
    equal([refusal(inputOf(DECIDE, opts7, cp7, { taskId: 'r7:x:-:0' })), refusal(inputOf(DECIDE, opts7, cp7, { taskId: 'r1:x:-:0' }))], ['ANSWERED', 'unknown@null'],
      'run r7: its own task read, a task id of run r1 unknown');
  });

  test(DECLARED_CASES[6], () => {
    const m = driveMapGate();
    const cp = m.driver.checkpoint();
    const r1 = inputOf(MAP_GATE, m.opts, cp, { nodeId: 'w', branchPath: '9' });
    equal(refusal(r1), `not-reached@${cp.events.length}`, 'a well-formed path the run never reached: not-reached, the prefix its whole length');
    const d = make(DECIDE, { predicates: no });
    d.driver.start({});
    d.sch.done('r1:a:-:0', 1);
    const dc = d.driver.checkpoint();
    equal(refusal(inputOf(DECIDE, d.opts, dc, { nodeId: 'x' })), `not-reached@${dc.events.length}`, 'a node on the route not taken: not-reached');
    equal(view(inputOf(DECIDE, d.opts, dc, { nodeId: 'y' })), [['-', 'received', 1]], 'the control: the route taken is answered');
    // A task the run dispatched AFTER a prefix: not-reached at that prefix, answered at the end.
    const prefix = { header: cp.header, events: cp.events.slice(0, cp.events.findIndex((e) => e.kind === 'dispatched' && e.taskId === 'r1:keep:1:0')) };
    equal(refusal(inputOf(MAP_GATE, m.opts, prefix, { taskId: 'r1:keep:1:0' })), `not-reached@${prefix.events.length}`, 'keep:1 at the prefix BEFORE its dispatch');
    ok(inputOf(MAP_GATE, m.opts, { header: cp.header, events: cp.events.slice(0, prefix.events.length + 1) }, { taskId: 'r1:keep:1:0' }).ok,
      'the control: one element longer — its own `dispatched` — and it is answered');
  });

  test(DECLARED_CASES[7], () => {
    const m = make(DECIDE, { predicates: yes });
    m.driver.start({});
    m.sch.done('r1:a:-:0', 1);
    m.sch.done('r1:x:-:0', 2);
    const cp = m.driver.checkpoint();
    const xAt = cp.events.findIndex((e) => e.kind === 'dispatched' && e.taskId === 'r1:x:-:0');
    // A CHANGED REGISTRY: `p` now declines, so the replay routes to `y` — an END, whose composition is offered and must be
    // CONFIRMED by its own element: `pathEnded` against the stored `dispatched x` — diverged, at x's position.
    const changed = { ...m.opts, predicates: no };
    equal(refusal(inputOf(DECIDE, changed, cp, { nodeId: 'y' })), `diverged@${xAt}`, 'a predicate routing INTO the target: diverged at the first element it changes, never answered');
    // And as a PATH target, whose answer would END the replay at its offer — so only the confirmation stands between a
    // composition the stored run never made and an answer (W205's adequacy reader, finding 1: the node-id-alone form above
    // replays on and diverges whether or not the offer is confirmed).
    equal(refusal(inputOf(DECIDE, changed, cp, { nodeId: 'y', branchPath: '-' })), `diverged@${xAt}`, 'the same end as a PATH target: diverged, never answered');
    const GATED_DECIDE = flow('decide', 'a', [
      { id: 'a', kind: 'task', type: 'T', edges: [{ when: { predicate: 'p' }, to: 'x' }, { to: 'gy' }] },
      ...(DECIDE.nodes.slice(1, 3) as unknown[]),
      { id: 'gy', kind: 'gate', type: 'distinct', settings: { key: 'k' }, edges: [{ to: 'y' }, { route: 'duplicate', to: 'y' }, { route: 'nokey', to: 'y' }] },
      ...(DECIDE.nodes.slice(3) as unknown[]),
    ]);
    equal(refusal(inputOf(GATED_DECIDE, changed, cp, { nodeId: 'gy', branchPath: '-' })), `diverged@${xAt}`, 'a GATE path target routed into: diverged, never answered');
    ok(inputOf(GATED_DECIDE, m.opts, cp, { taskId: 'r1:x:-:0' }).ok, 'the control: the same definition under the stored registry answers x');
    equal(refusal(inputOf(DECIDE, changed, cp, { taskId: 'r1:x:-:0' })), `diverged@${xAt}`, 'the task the stored run dispatched there: diverged too');
    equal(refusal(inputOf(DECIDE, changed, cp, { taskId: 'r1:z:-:0' })), `diverged@${xAt}`, 'and every target after it');
    ok(inputOf(DECIDE, changed, cp, { taskId: 'r1:a:-:0' }).ok, 'a target BEFORE the change is answered — the cut verifies the prefix it replays');
    // A CHANGED DEFINITION at the same id and version: the routes swapped.
    const SWAPPED = flow('decide', 'a', [
      { id: 'a', kind: 'task', type: 'T', edges: [{ when: { predicate: 'p' }, to: 'y' }, { to: 'x' }] },
      ...(DECIDE.nodes.slice(1) as unknown[]),
    ]);
    equal(refusal(inputOf(SWAPPED, m.opts, cp, { nodeId: 'y' })), `diverged@${xAt}`, 'a changed definition routing into the target: diverged');
    // AFTER the target, nothing is detected — the stated limit (RN-R45).
    const LATER = flow('decide', 'a', [...(DECIDE.nodes.slice(0, 2) as unknown[]), { id: 'z', kind: 'task', type: 'T', settings: { changed: true }, edges: [{ to: 'done' }] }, ...(DECIDE.nodes.slice(3) as unknown[])]);
    equal(one(inputOf(LATER, m.opts, cp, { taskId: 'r1:x:-:0' }), 'x under a later change').value, { settings: {}, input: 1 },
      'a definition changed only AFTER the target: the target is answered, and the change is not detected');
    // The limit at its sharpest: a change that moves an ENVELOPE and no ELEMENT is not detected even AT the target — the
    // stored events hold no payload to compare (P23 fact 2), so the reading answers with the definition it is handed.
    equal(one(inputOf(LATER, m.opts, cp, { taskId: 'r1:z:-:0' }), 'z under its own change').value, { settings: { changed: true }, input: 2 },
      'z, whose own settings changed: answered with the CHANGED settings — its `dispatched` element still matches');
    equal(m.envelopes.get('r1:z:-:0'), { settings: {}, input: 2 }, 'the control: the run handed z no settings');
  });

  test(DECLARED_CASES[8], () => {
    const m = driveMapGate();
    const cp = m.driver.checkpoint();
    const r = (run: unknown, def: FlowDefinition = MAP_GATE) => {
      const x = inputOf(def, m.opts, run as Checkpoint, { taskId: 'r1:w:0:0' });
      return x.ok ? 'ANSWERED' : `${x.reason}:${x.index}`;
    };
    equal([
      r(null), r({}), r({ header: cp.header }), r({ header: cp.header, events: {} }),
      r({ header: { ...cp.header, format: 2 }, events: cp.events }),
      r({ header: { ...cp.header, runId: 7 }, events: cp.events }),
      // A runId of the right TYPE that is no run id (ID-R2) — the conformity reader's construction: it threw until refused.
      r({ header: { ...cp.header, runId: 'r:1' }, events: cp.events }),
      r({ header: { ...cp.header, runId: '' }, events: cp.events }),
      r({ header: cp.header, events: [...cp.events.slice(0, 3), null, ...cp.events.slice(3)] }),
      r({ header: { ...cp.header, entryPayload: () => 1 }, events: cp.events }),
    ], Array(10).fill('format:null'), 'each run that is not a stored run this version wrote is `format`');
    equal([r(cp, { ...MAP_GATE, flowId: 'other' } as FlowDefinition), r(cp, { ...MAP_GATE, version: 2 } as FlowDefinition)], ['flow:null', 'flow:null'],
      'a definition that is not the stored run`s: `flow`');
    const f = inputOf(MAP_GATE, m.opts, { header: { ...cp.header, format: 2 }, events: cp.events }, { taskId: 'r1:w:0:0' });
    ok(!f.ok && f.message.includes('ResumeRefused (format)'), 'the message is resumeRefusal`s own — one function reads a header for both');
    // A HALTED, a CANCELLED run: a resume refuses both before replaying; a reading reads them (decision 5).
    const halted = { header: cp.header, events: [...cp.events, { kind: 'halted', reason: 'X' } as FoldInput] };
    const cancelled = { header: cp.header, events: [...cp.events, { kind: 'cancelRequested', actor: 'ana', reason: null } as unknown as FoldInput] };
    equal([r(halted), r(cancelled)], ['ANSWERED', 'ANSWERED'], 'a halted run and a cancelled run are READ');
  });

  test(DECLARED_CASES[9], () => {
    const at = (cp: Checkpoint, kind: string) => cp.events.findIndex((e) => e.kind === kind);
    // (1) A PREDICATE's throw — regenerable: the replay would halt there again.
    {
      const m = make(DECIDE, { predicates: new Map([['p', () => { throw new Error('boom'); }]]) });
      m.driver.start({});
      m.sch.done('r1:a:-:0', 1);
      const cp = m.driver.checkpoint();
      equal(m.failures.length, 1, 'the predicate`s throw halted the run');
      ok(inputOf(DECIDE, m.opts, cp, { taskId: 'r1:a:-:0' }).ok, 'a predicate`s throw: a is read');
      equal(refusal(inputOf(DECIDE, m.opts, cp, { nodeId: 'y' })), `not-reached@${at(cp, 'halted')}`, 'and what follows the halt is not-reached, the prefix ending AT the halt');
      // A 0.7.0 store wrote the halt `stopped` (ADR 0102): read as one.
      const old = { header: cp.header, events: cp.events.map((e) => (e.kind === 'halted' ? { kind: 'stopped', reason: e.reason } as unknown as FoldInput : e)) };
      equal([inputOf(DECIDE, m.opts, old, { taskId: 'r1:a:-:0' }).ok, refusal(inputOf(DECIDE, m.opts, old, { nodeId: 'y' }))], [true, `not-reached@${at(cp, 'halted')}`],
        'a 0.7.0 `stopped` element ends the prefix exactly as `halted` does');
    }
    // (2) FD-R3: `s` reads `c` unconditionally and the first-arrival join fires before c settles.
    {
      const UNRESOLVED = flow('unresolved', 'a', [...(EARLY.nodes.slice(0, 5) as unknown[]),
        { id: 's', kind: 'task', type: 'T', needs: { c: 'c' }, edges: [{ to: 'done' }] }, END]);
      const m = make(UNRESOLVED, { policy: FIRST as JoinPolicy });
      m.driver.start({});
      m.sch.done('r1:a:-:0', A);
      m.sch.done('r1:b:0:0', B);
      const cp = m.driver.checkpoint();
      equal(m.failures, ['UnresolvedReference'], 'FD-R3 halted the run');
      equal(view(inputOf(UNRESOLVED, m.opts, cp, { nodeId: 'j', branchPath: '-' })), [['-', 'collection', { 0: B }]], 'FD-R3: the collection the join handed on is read');
      equal(one(inputOf(UNRESOLVED, m.opts, cp, { taskId: 'r1:c:1:0' }), 'c').value, { settings: {}, input: A }, 'and c, dispatched before');
      equal(refusal(inputOf(UNRESOLVED, m.opts, cp, { taskId: 'r1:s:-:0' })), `not-reached@${at(cp, 'halted')}`, 's — whose composition threw — is not-reached');
    }
    // (3) FD-R5: a gate type answering a route it does not declare — the halt PREEMPTS the gate's own element.
    {
      const bad: GateType = { routes: ['a', 'b'], defaultRoute: 'a', fn: () => 'zzz' } as unknown as GateType;
      const GATED = flow('gated', 'a', [
        { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'g' }] },
        { id: 'g', kind: 'gate', type: 'bad', edges: [{ to: 'x' }, { route: 'b', to: 'y' }] },
        { id: 'x', kind: 'end', outcome: 'x' }, { id: 'y', kind: 'end', outcome: 'y' },
      ]);
      const m = make(GATED, { gateTypes: { bad } });
      m.driver.start({});
      m.sch.done('r1:a:-:0', 1);
      const cp = m.driver.checkpoint();
      equal(m.failures, ['UndeclaredRoute'], 'FD-R5 halted the run');
      ok(inputOf(GATED, m.opts, cp, { taskId: 'r1:a:-:0' }).ok, 'FD-R5: a is read');
      equal(refusal(inputOf(GATED, m.opts, cp, { nodeId: 'g' })), `not-reached@${at(cp, 'halted')}`,
        'the gate whose type answered wrong appended NO element of its own — not-reached: the halt`s reason names it');
    }
    // (4) OR-R6: a result that does not clone — the settlement never reaches the log.
    {
      const m = make(DECIDE, { predicates: yes });
      m.driver.start({});
      m.sch.done('r1:a:-:0', () => 1);
      const cp = m.driver.checkpoint();
      equal(m.failures, ['UncloneableResult'], 'OR-R6 halted the run');
      equal(one(inputOf(DECIDE, m.opts, cp, { taskId: 'r1:a:-:0' }), 'a').value, { settings: {}, input: {} }, 'OR-R6: a is read');
      equal(refusal(inputOf(DECIDE, m.opts, cp, { nodeId: 'x' })), `not-reached@${at(cp, 'halted')}`, 'and x, never dispatched, is not-reached');
    }
    // (5) OR-R10: a consumer's onFoldInput throws on x's `dispatched` — the stored run halts mid-step; the replay, which calls
    // no consumer, would go on to dispatch y there. Without the prefix ending at `halted`, that is `diverged`.
    {
      const m = make(FAN, { onFoldInput: (e) => { if (e.kind === 'dispatched' && e.taskId === 'r1:x:0:0') throw new Error('consumer'); } });
      m.driver.start({});
      m.sch.done('r1:a:-:0', A);
      const cp = m.driver.checkpoint();
      equal(m.failures.length, 1, 'OR-R10 halted the run');
      equal(cp.events.at(-1)?.kind, 'halted', 'its last element is the halt, right after x`s dispatch');
      equal(one(inputOf(FAN, m.opts, cp, { taskId: 'r1:x:0:0' }), 'x').value, { settings: {}, input: A }, 'OR-R10: x — its dispatch stored before the halt — is read');
      equal(refusal(inputOf(FAN, m.opts, cp, { taskId: 'r1:y:1:0' })), `not-reached@${at(cp, 'halted')}`, 'y — which the replay dispatches PAST the prefix — not-reached, never diverged');
    }
  });

  test(DECLARED_CASES[10], () => {
    // (1) The SCHEDULER cancelled x on its own: the run ends `cancelled` and routes nothing after (RN-R28).
    {
      const m = make(DECIDE, { predicates: yes });
      m.driver.start({});
      m.sch.done('r1:a:-:0', 1);
      m.sch.fire('task.cancelled', { id: 'r1:x:-:0', state: 'cancelled' });
      const cp = m.driver.checkpoint();
      equal(fold(cp.events).outcome, 'cancelled', 'the run is cancelled');
      equal(one(inputOf(DECIDE, m.opts, cp, { taskId: 'r1:x:-:0' }), 'x').value, { settings: {}, input: 1 }, 'a cancelled task is read');
      equal(refusal(inputOf(DECIDE, m.opts, cp, { nodeId: 'z' })), `not-reached@${cp.events.length}`, 'its successor, never entered: not-reached');
    }
    // (2) Its OWNER cancelled it: the prefix ends at `cancelRequested`.
    {
      const m = make(FAN);
      m.driver.start({});
      m.sch.done('r1:a:-:0', A);
      void m.driver.cancel({ actor: 'ana' });
      m.sch.fire('task.cancelled', { id: 'r1:x:0:0', state: 'cancelled' });
      m.sch.fire('task.cancelled', { id: 'r1:y:1:0', state: 'cancelled' });
      const cp = m.driver.checkpoint();
      const req = cp.events.findIndex((e) => e.kind === 'cancelRequested');
      ok(req > 0, 'the owner`s request is stored');
      equal(one(inputOf(FAN, m.opts, cp, { taskId: 'r1:y:1:0' }), 'y').value, { settings: {}, input: A }, 'a task dispatched before the request is read');
      equal(refusal(inputOf(FAN, m.opts, cp, { nodeId: 'j' })), `not-reached@${req}`, 'the join, never reached: not-reached at the request`s position');
    }
    // (3) Its OWNER stopped it: `interrupted` is FED, so the reading reads through it; and its RESUME is read through.
    {
      const m = make(DECIDE, { predicates: yes });
      m.driver.start({});
      m.sch.done('r1:a:-:0', 1);
      void m.driver.stop({ actor: 'ana' });
      const cp = m.driver.checkpoint();
      ok(cp.events.some((e) => e.kind === 'interrupted'), 'the stop is stored');
      equal(one(inputOf(DECIDE, m.opts, cp, { taskId: 'r1:x:-:0' }), 'x').value, { settings: {}, input: 1 }, 'the stopped run is read');
      equal(refusal(inputOf(DECIDE, m.opts, cp, { nodeId: 'z' })), `not-reached@${cp.events.length}`, 'z not-reached: not yet dispatched');
      const r = make(DECIDE, { predicates: yes });
      r.driver.resume(cp);
      r.sch.done('r1:x:-:0', 'resumed');
      const cp2 = r.driver.checkpoint();
      equal(one(inputOf(DECIDE, r.opts, cp2, { taskId: 'r1:z:-:0' }), 'z after the resume').value, r.envelopes.get('r1:z:-:0'), 'through the stop and the resume: z equal to what the resumed run`s createTask was handed');
      equal(r.envelopes.get('r1:z:-:0'), { settings: {}, input: 'resumed' }, 'by hand');
    }
  });

  test(DECLARED_CASES[11], () => {
    const m = make(FAN);
    m.driver.start({});
    m.sch.done('r1:a:-:0', A);
    const cp = m.driver.checkpoint();
    const frozen = JSON.stringify(cp);
    const calls: string[] = [];
    const loud = {
      ...m.opts,
      createTask: (c: unknown) => { calls.push('createTask'); return c; },
      onFoldInput: () => { calls.push('onFoldInput'); },
      onRegionEvent: () => { calls.push('onRegionEvent'); },
      onRunFailure: () => { calls.push('onRunFailure'); },
      onHeader: () => { calls.push('onHeader'); },
    } as InputOfOptions;
    for (const id of ['r1:a:-:0', 'r1:x:0:0', 'r1:y:1:0']) ok(inputOf(FAN, loud, cp, { taskId: id }).ok, `${id} read`);
    ok(inputOf(FAN, loud, cp, { nodeId: 'f' }).ok, 'the fanout read');
    // A prefix that ends INSIDE a step — before y's `dispatched` — so the replay regenerates a LOST TAIL, the elements a
    // resume DELIVERS (RN-R24) and hands on: here a driver built with these callbacks would call them.
    const cut = { header: cp.header, events: cp.events.slice(0, cp.events.findIndex((e) => e.kind === 'dispatched' && e.taskId === 'r1:y:1:0')) };
    ok(inputOf(FAN, loud, cut, { nodeId: 'f' }).ok && refusal(inputOf(FAN, loud, cut, { taskId: 'r1:y:1:0' })) === `not-reached@${cut.events.length}`, 'a mid-step prefix read');
    // And a run whose replay regenerates its HALT past the prefix — what a driver would report to onRunFailure.
    const h = make(DECIDE, { predicates: new Map([['p', () => { throw new Error('boom'); }]]) });
    h.driver.start({});
    h.sch.done('r1:a:-:0', 1);
    const hc = h.driver.checkpoint();
    ok(inputOf(DECIDE, { ...(loud as object), predicates: h.opts.predicates } as InputOfOptions, hc, { nodeId: 'y' }).ok === false, 'the halted run read');
    equal(calls, [], 'a reading handed every callback calls NONE of them, and hands no task on (DEAF_SCHEDULER throws if it is handed one)');
    equal(JSON.stringify(cp), frozen, 'the stored run is unchanged by the readings');
    // The CONTROL: a driver given the same calls and RESUMED from the same checkpoint calls them — so the options were live.
    const sch = new Fake();
    const d = new Driver(FAN, { runId: 'r1', scheduler: sch as never, ...(loud as unknown as Record<string, unknown>) } as never);
    d.resume(cp);
    ok(calls.includes('createTask') && calls.includes('onFoldInput'), `the control: a resume handed the same options called them — ${JSON.stringify([...new Set(calls)])}`);
    equal(sch.added, ['r1:x:0:0', 'r1:y:1:0'], 'and handed its in-flight set on');
  });

  test(DECLARED_CASES[12], () => {
    const ran = collected().find((s) => s.suite === SUITE)!.cases.map((c) => c.name).sort();
    const declared: string[] = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
