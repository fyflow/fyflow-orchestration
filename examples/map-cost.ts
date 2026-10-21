/**
 * **WHAT A LONG `map` COSTS, re-taken on the tree that ships** — [W197](../doc/work-items/w197-the-cost-check-and-the-exit-artifact.md),
 * and it is [P39](../doc/plans/p39-what-a-step-costs-and-where-a-live-run-state-is-read.md)'s exit artifact clause (2):
 * fyflow-app's *pass 2* repro — a `map` over `n` items on a scheduler double, every settlement delivered at once — timed
 * for `fold`, for the driver with and without a `task.running` before each settlement, and for a runtime from `start` to
 * `done` with its consumer reading `handle.outcome()` after every input it is handed once the handle exists (all but
 * `ingest`'s dispatch, which `start()` delivers before it returns); each size in a FRESH process, printed beside the
 * figures P39 and W196 measured on the tree BEFORE the plan.
 *
 * ```bash
 * node examples/map-cost.ts
 * deno run --import-map=examples/deno-import-map.json --allow-read --allow-run --allow-env examples/map-cost.ts
 * ```
 *
 * ## A measurement, not a gate entry
 *
 * **A cost in milliseconds is a property of a machine** ([Q179](../doc/questions/q179.md)), and P39 fact 4 measured the
 * same 16,000-item driver at 988 ms in a fresh process and 3,818 ms in one that had just folded 4,000 items — which is why
 * every size here runs in a process of its own, and why nothing here is asserted. **What binds the claim is
 * `test/fold/map-cost.test.ts`**, at L1-L2, where the work of the same three subjects is COUNTED at 2,000 and 8,000
 * items, pinned exactly and held below 6x. This file is covered by ladder **L0** — `npm run lint` lints `examples/` and
 * `tsconfig.examples.json` includes it — and its TEXT by `examples/l6.ts`' construction clause (the marker below and
 * `CONSTRUCTION_PRICED`); nothing RUNS it but a person.
 *
 * ## PRICES-THE-CONSTRUCTION: why this file builds a `Driver` by hand
 *
 * The app's repro IS a `Driver` over a scheduler double — the driver's own cost, without a runtime's accumulator or a
 * pool — and P39 fact 4's table is that number. So the file that re-takes it builds one, as `settlement-cost.ts` does for
 * the road it prices, and `examples/l6.ts` lists it beside that file: a constructor and its declaration, in two files.
 *
 * ## What the harness does NOT do, and why each matters to the number
 *
 * - **No `queue.shift()`.** The app's harness drained its 16,000-entry queue with `shift()`, which moves every element
 *   behind the head — quadratic, and ~26% of the coordinator's 16,000-item driver profile (P39 fact 4). Here the queue
 *   is walked by INDEX.
 * - **A `task.running` carries `attemptNumber`.** The app's double fired none, and a detail of `{ attempts: 0 }` appends
 *   nothing either: the driver reads `attemptNumber`, an integer from 1 (P39 fact 6). The `running` column fires
 *   `{ id, state: 'running', attemptNumber: 1 }` before each settlement, so an `attempted` element is appended per task.
 */
import { Driver, fold, liveToken, type FlowDefinition, type FoldInput, type JoinPolicy } from '../index.ts';
import { createRuntime } from '../src/scheduler/index.ts';

const g = globalThis as unknown as {
  Deno?: { version: { deno: string }; args: string[]; execPath(): string; exit(c: number): never;
    Command: new (cmd: string, o: { args: string[] }) => { outputSync(): { code: number; stdout: Uint8Array; stderr: Uint8Array } } };
  process?: { versions: { node: string }; argv: string[]; execPath: string; exit(c: number): never };
};
const runtimeName = g.Deno ? `deno ${g.Deno.version.deno}` : `node ${g.process!.versions.node}`;
const args = g.Deno ? g.Deno.args : g.process!.argv.slice(2);

const SIZES = [1_000, 2_000, 4_000, 8_000, 16_000];
type Subject = 'fold' | 'driver' | 'running' | 'runtime';
const SUBJECTS: readonly Subject[] = ['fold', 'driver', 'running', 'runtime'];

/**
 * **What was measured BEFORE the plan, by size** — node 24.20.0, each from the document named. `fold`: P39 fact 1 (one
 * process, sizes in turn; 8,000 and 16,000 not run, the 4,000 already 33 s). The driver: P39 fact 4 (its queue walked by
 * index; 1,000 and 2,000 are fact 1's driver column). The runtime: W196's Record, on `e2b62c8` — the runtime stepping a
 * `RunState` per input, every settlement in one burst, nobody reading the run.
 */
const BEFORE: Record<Subject, Record<number, number>> = {
  fold: { 1_000: 135, 2_000: 3_609, 4_000: 33_664 },
  driver: { 1_000: 28, 2_000: 33, 4_000: 98, 8_000: 351, 16_000: 988 },
  running: { 4_000: 113, 8_000: 517, 16_000: 2_870 },
  runtime: { 1_000: 987, 2_000: 8_284, 4_000: 34_311, 8_000: 157_679, 16_000: 683_151 },
};

/** The app's repro flow: an ENTRY `map` over the payload's items, one task per item, a join, an end. */
const REPRO = {
  flowId: 'big-map', version: 1, entry: 'each',
  nodes: [
    { id: 'each', kind: 'map', over: 'items', branch: 'work' },
    { id: 'work', kind: 'task', type: 'Work', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'each', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/** The app's repro, driver only: `ms` from `start` to the last settlement; the fold inputs it appended. */
function driverRun(items: number, running: boolean): { ms: number; inputs: FoldInput[] } {
  const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  const queue: string[] = [];
  const fire = (type: string, detail: unknown) => { for (const fn of listeners.get(type) ?? []) fn({ detail }); };
  const failures: string[] = [];
  const driver = new Driver(REPRO, {
    runId: 'run-1',
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
  const t0 = performance.now();
  driver.start({ items: Array.from({ length: items }, (_, i) => i) });
  // By INDEX — never `shift()` (P39 fact 4).
  for (let q = 0; q < queue.length; q += 1) {
    const id = queue[q]!;
    if (running) fire('task.running', { id, state: 'running', attemptNumber: 1 });
    fire('task.completed', { id, state: 'done', result: { id }, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 });
  }
  const ms = performance.now() - t0;
  if (failures.length > 0) throw new Error(`${items} items: ${failures.join(', ')}`);
  return { ms, inputs: driver.foldInputs() as FoldInput[] };
}

/** W196's runtime measurement: `start` to `done` over a `map` on a scheduler double, `outcome()` read after every input once the handle exists. */
async function runtimeRun(items: number): Promise<{ ms: number; inputs: number }> {
  const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  const added: { id: string }[] = [];
  const settle = (id: string, result: unknown) => {
    const detail = { id, state: 'done', result, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    for (const fn of listeners.get('task.completed') ?? []) fn({ detail });
  };
  const flow = {
    flowId: 'map', version: 1, entry: 'ingest',
    nodes: [
      { id: 'ingest', kind: 'task', type: 'T', edges: [{ to: 'each' }] },
      { id: 'each', kind: 'map', over: 'items', branch: 'work' },
      { id: 'work', kind: 'task', type: 'T', edges: [{ to: 'joined' }] },
      { id: 'joined', kind: 'join', of: 'each', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;
  const document = { workers: { w: { url: 'https://example.test/w.js' } }, nodeTypes: { T: { worker: 'w', inline: true } }, predicates: [] };
  const rt = createRuntime(document as never, {}, {
    createPool: ((url: string, options: unknown) => ({ url, options })) as never,
    createScheduler: ((pools: unknown, groups: unknown) => ({
      workerPools: pools, groups,
      addTask(t: { id: string }) { added.push(t); },
      addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
      shutdown() { return Promise.resolve(); },
    })) as never,
    validateBoundaries: false,
  });
  let inputs = 0;
  const ref: { outcome?: () => unknown } = {};
  const t0 = performance.now();
  const h = rt.start(flow, {}, { onFoldInput: () => { inputs += 1; ref.outcome?.(); } });
  ref.outcome = () => h.outcome();
  settle(added[0]!.id, { items: Array.from({ length: items }, (_, i) => i) });
  for (let i = 1; i < added.length; i += 1) settle(added[i]!.id, { i });
  const end = await h.done;
  const ms = performance.now() - t0;
  if (end.outcome !== 'completed') throw new Error(`${items} items: the runtime's run settled ${end.outcome}`);
  return { ms, inputs };
}

/** ONE subject at ONE size, in THIS process — what a child prints, as one JSON line. */
async function one(subject: Subject, items: number): Promise<{ subject: Subject; items: number; inputs: number; ms: number }> {
  if (subject === 'runtime') return { subject, items, ...(await runtimeRun(items)) };
  const d = driverRun(items, subject === 'running');
  if (subject !== 'fold') return { subject, items, inputs: d.inputs.length, ms: d.ms };
  const t0 = performance.now();
  const state = fold(d.inputs);
  const ms = performance.now() - t0;
  if (state.outcome !== 'completed') throw new Error(`${items} items: fold read ${state.outcome}`);
  return { subject, items, inputs: d.inputs.length, ms };
}

/** Run this file again as a CHILD for one subject and size, and read its one JSON line. */
async function child(subject: Subject, items: number): Promise<{ inputs: number; ms: number }> {
  const self = new URL(import.meta.url);
  let out: string;
  if (g.Deno) {
    const map = new URL('./deno-import-map.json', import.meta.url).href;
    const r = new g.Deno.Command(g.Deno.execPath(), {
      args: ['run', `--import-map=${map}`, '--allow-read', '--allow-run', '--allow-env', self.href, '--one', subject, String(items)],
    }).outputSync();
    out = new TextDecoder().decode(r.stdout);
    if (r.code !== 0) throw new Error(`the child for ${subject} at ${items} exited ${r.code}: ${new TextDecoder().decode(r.stderr).slice(0, 400)}`);
  } else {
    const { spawnSync } = await import('node:child_process');
    const { fileURLToPath } = await import('node:url');
    const r = spawnSync(g.process!.execPath, [fileURLToPath(self), '--one', subject, String(items)], { encoding: 'utf8' });
    out = r.stdout;
    if (r.status !== 0) throw new Error(`the child for ${subject} at ${items} exited ${r.status}: ${r.stderr.slice(0, 400)}`);
  }
  const line = out.trim().split('\n').pop()!;
  return JSON.parse(line) as { inputs: number; ms: number };
}

if (args[0] === '--one') {
  console.log(JSON.stringify(await one(args[1] as Subject, Number(args[2]))));
} else {
  const only = args[0] === undefined ? SUBJECTS : SUBJECTS.filter((s) => s === args[0]);
  const fmt = (ms: number | undefined) => (ms === undefined ? '—' : `${Math.round(ms).toLocaleString('en-US')} ms`);
  console.log(`\n  what a long map costs — ${runtimeName}, each size in a fresh process; BEFORE is node 24.20.0 on the tree before P39\n`);
  for (const subject of only) {
    console.log(`  ${subject === 'fold' ? 'fold' : subject === 'driver' ? 'driver, no task.running' : subject === 'running' ? 'driver, task.running (attemptNumber 1) before each settlement' : 'runtime, start to done, outcome() after every input'}`);
    console.log(`    ${'items'.padStart(7)}  ${'inputs'.padStart(7)}  ${'BEFORE'.padStart(11)}  ${'now'.padStart(9)}`);
    for (const items of SIZES) {
      const r = await child(subject, items);
      console.log(`    ${items.toLocaleString('en-US').padStart(7)}  ${String(r.inputs).padStart(7)}  ${fmt(BEFORE[subject][items]).padStart(11)}  ${fmt(r.ms).padStart(9)}`);
    }
    console.log('');
  }
}
