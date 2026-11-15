/**
 * **WHAT A LOOP RETAINS, beside a `map` of the same task count, and what a carried HISTORY costs** —
 * [W230](../doc/work-items/w230-a-loop-resumed-measured-and-on-real-workers.md), and it is
 * [P47](../doc/plans/p47-what-may-repeat-in-a-flow-and-how-a-round-hands-on-to-the-next.md)'s exit artifact (5) and
 * the measurement decision 1 promised: `spec/run-state.md` v0.37 section 7, *A loop's footprint*, prints what this
 * file prints.
 *
 * ```bash
 * node examples/loop-footprint.ts
 * deno run --import-map=examples/deno-import-map.json --allow-read --allow-net --allow-env examples/loop-footprint.ts
 * ```
 *
 * **Observer 1 of `examples/retention.ts`** — `retainedBytes` (`examples/run-flow.ts`): `v8.serialize` over the
 * driver's own growing structures in ONE call, so an object reachable twice is counted once — read at the end of a
 * COMPLETED run, every result 1 KiB. Deterministic and clock-free; a footprint is still a property of one runtime's
 * serializer ([Q179](../doc/questions/q179.md)), so nothing here is asserted — what binds the RELATION is
 * `spec/run-state.md`'s `RN-R13`, and a loop's lifetime clause is `test/driver/loop.test.ts`'s (W229).
 *
 * Two tables:
 *
 * 1. **A loop of N rounds, one task a round, beside a `map` of N instances, one task each** — N = 16, 64, 256. The same
 *    task count, so `RN-R13`'s first term is the same; what differs is the region's own bookkeeping.
 * 2. **P47 decision 1's carried HISTORY beside a reader after the loop** — the same loop, each round returning EVERY
 *    summary so far (`{ hist: [...] }`, so round *i* returns *i + 1* of them), against each round returning ONE and a
 *    node after the loop naming the body node in the array form (`needs: { all: ["work"] }`). Decision 1 ESTIMATED the
 *    first at *N(N+1)/2* summaries — 500 rounds of 1 KiB at ~125 MB — and the second at N.
 *
 * **It is not in the gate chain** — a footprint is a property of a machine and of a serializer (Q179), as
 * `retention.ts`'s and `map-cost.ts`'s figures are; covered by ladder L0 (`npm run lint`, `tsconfig.examples.json`).
 *
 * ## PRICES-THE-CONSTRUCTION: why this file builds a `Driver` by hand
 *
 * The measurement is the DRIVER's retained structures, without a runtime's accumulator or a pool, on a scheduler double
 * that settles each task as it is handed — `map-cost.ts`'s road. So it builds one, declares it here, and `examples/l6.ts`
 * lists it beside that file: a constructor and its declaration, in two files.
 */
import { Driver, fold, liveToken, type FlowDefinition, type JoinPolicy } from '../index.ts';
import { retainedBytes } from './run-flow.ts';

const g = globalThis as unknown as { Deno?: { version: { deno: string } }; process?: { versions: { node: string } } };
const runtimeName = g.Deno ? `deno ${g.Deno.version.deno}` : `node ${g.process!.versions.node}`;

const SIZES = [16, 64, 256];
const KIB = 1;

/** `ingest → L(work) → J → after → done`, `until` never holding, so the run takes all N rounds. */
const loopFlow = (n: number, readAfter: boolean): FlowDefinition => ({
  flowId: 'loop-footprint', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'Work', edges: [{ to: 'L' }] },
    { id: 'L', kind: 'loop', branch: 'work', until: { path: 'input.ok', op: 'eq', value: true }, maxIterations: n },
    { id: 'work', kind: 'task', type: 'Work', edges: [{ to: 'J' }] },
    { id: 'J', kind: 'join', of: 'L', edges: [{ to: 'after' }] },
    { id: 'after', kind: 'task', type: 'Work', ...(readAfter ? { needs: { all: ['work'] } } : {}), edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition);
/** `ingest → M(map over items, work) → MJ → after → done`. */
const MAP_FLOW = {
  flowId: 'map-footprint', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'Work', edges: [{ to: 'M' }] },
    { id: 'M', kind: 'map', over: 'items', branch: 'work' },
    { id: 'work', kind: 'task', type: 'Work', edges: [{ to: 'MJ' }] },
    { id: 'MJ', kind: 'join', of: 'M', edges: [{ to: 'after' }] },
    { id: 'after', kind: 'task', type: 'Work', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

type Mode = 'loop' | 'map' | 'history' | 'reader';
const blob = (tag: number): string => 'x'.repeat(KIB * 1024 - String(tag).length) + tag;

/** One completed run on a double that settles each task as it is handed, by INDEX; its retained bytes at the end. */
async function run(mode: Mode, n: number): Promise<{ bytes: number; tasks: number }> {
  const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  const queue: string[] = [];
  const failures: string[] = [];
  const driver = new Driver(mode === 'map' ? MAP_FLOW : loopFlow(n, mode === 'reader'), {
    runId: 'r1',
    scheduler: {
      addTask(task: unknown) { queue.push((task as { id: string }).id); },
      addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
    },
    createTask: (config) => config,
    predicates: new Map(),
    workers: { w: { url: 'worker.js' } },
    nodeTypes: { Work: { worker: 'w' } },
    joinPolicy: liveToken as JoinPolicy,
    onRunFailure: (f) => { failures.push(f.kind); },
  });
  const settle = (id: string, result: unknown) => {
    const detail = { id, state: 'done', result, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    for (const fn of listeners.get('task.completed') ?? []) fn({ detail });
  };
  driver.start({});
  let hist: string[] = [];
  let round = 0;
  for (let q = 0; q < queue.length; q += 1) {
    const id = queue[q]!;
    if (id.startsWith('r1:ingest:')) settle(id, mode === 'map' ? { items: Array.from({ length: n }, (_, i) => i) } : {});
    else if (id.startsWith('r1:work:')) {
      const s = blob(round);
      round += 1;
      if (mode === 'history') hist = [...hist, s];
      settle(id, mode === 'history' ? { ok: false, hist } : { ok: false, s });
    } else settle(id, {});
  }
  const outcome = fold(driver.foldInputs()).outcome;
  if (failures.length > 0 || outcome !== 'completed') throw new Error(`${mode} at ${n}: ${outcome} ${failures.join(', ')}`);
  const bytes = await retainedBytes(driver);
  if (bytes === null) throw new Error(`${mode} at ${n}: observer 1 refused the driver's structures`);
  return { bytes, tasks: queue.length };
}

const kib = (b: number): string => `${(b / 1024).toFixed(1)} KiB`.padStart(12);
console.log(`\n  what a loop retains — observer 1, ${runtimeName}, every result ${KIB} KiB, read at the end of a completed run\n`);
console.log('  1. a loop of N rounds beside a map of N instances, one task each');
for (const n of SIZES) {
  const l = await run('loop', n);
  const m = await run('map', n);
  console.log(`     N = ${String(n).padStart(3)}   loop ${kib(l.bytes)}   map ${kib(m.bytes)}   loop / map ${(l.bytes / m.bytes).toFixed(3)}   (${l.tasks} tasks each)`);
}
console.log('\n  2. P47 decision 1: a carried HISTORY beside a reader after the loop');
for (const n of SIZES) {
  const h = await run('history', n);
  const r = await run('reader', n);
  console.log(`     N = ${String(n).padStart(3)}   history ${kib(h.bytes)}   reader ${kib(r.bytes)}   ratio ${(h.bytes / r.bytes).toFixed(1).padStart(5)}   ` +
    `N(N+1)/2 = ${String(n * (n + 1) / 2).padStart(5)} KiB`);
}
console.log('');
