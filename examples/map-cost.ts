/**
 * **WHAT A LONG `map` COSTS, re-taken on the tree that ships** — [W197](../doc/work-items/w197-the-cost-check-and-the-exit-artifact.md),
 * and it is [P39](../doc/plans/p39-what-a-step-costs-and-where-a-live-run-state-is-read.md)'s exit artifact clause (2):
 * fyflow-app's *pass 2* repro — a `map` over `n` items on a scheduler double, every settlement delivered at once — timed
 * for `fold`, for the driver with and without a `task.running` before each settlement, and for a runtime from `start` to
 * `done` with its consumer reading `handle.outcome()` after every input it is handed once the handle exists (all but
 * `ingest`'s dispatch, which `start()` delivers before it returns); each size in a FRESH process, printed beside the
 * figures P39 and W196 measured on the tree BEFORE the plan.
 *
 * **And four REFERENCE subjects since [W200](../doc/work-items/w200-the-exit-artifact-on-real-workers-and-the-reply.md)**,
 * [P40](../doc/plans/p40-what-a-reference-read-costs-inside-a-map.md)'s exit artifact clause (2): the driver alone over a
 * `map` whose branch READS another node by `needs` — one step back (`post` reading its own instance's `work`, Q735's own
 * shape), two steps back (`work` → `mid` → `post`), a NESTED map (`tail` reading the outer instance's `prep` and its own
 * inner instance's `leaf`) and a SIBLING map of three slots (`publish` reading `["score"]`, every output) — at 2,000 /
 * 8,000 / 16,000 items, printed beside what W199's declaration step measured on `6006caa`, the tree before
 * [ADR 0124](../doc/decisions/0124-a-reference-read-costs-its-answer.md)'s index, in node 24.20.0 or deno 2.9.6 by the
 * runtime running this file. Their work is COUNTED in `test/fold/map-cost.test.ts` too (`outputsCache.examined`).
 *
 * **And two LARGE-READ subjects since [W203](../doc/work-items/w203-the-exit-artifact-on-real-workers-the-reply-and-p41s-close.md)**,
 * [P41](../doc/plans/p41-what-a-reference-to-a-large-value-costs-inside-a-map.md)'s exit artifact clause (2): fyflow-app's
 * *fetch-then-map* — `fetch` returns ~100 KB holding the item list, a map runs over it, and each instance declares
 * `needs: { item: "$item", all: "fetch" }` — and, beside it, the same flow whose `all` names a SMALL node (`tiny`,
 * before `fetch`), the floor the large read is held against (P41 prediction 2). The driver alone at 1,000 / 2,000 /
 * 4,000 items, `task.running` before every settlement, the queue walked by index, each size a fresh process — TIME and
 * PEAK HEAP over a post-GC baseline (sampled every 256 settlements and at the end), printed beside what W203 measured
 * with this same harness on `88059b7`, the tree before
 * [ADR 0126](../doc/decisions/0126-a-references-value-is-one-frozen-copy-shared-by-every-reader.md)'s shared copy, in
 * node 24.20.0 or deno 2.9.6 by the runtime running this file. Their copies are COUNTED in
 * `test/fold/reference-copy-cost.test.ts` (`outputsCache.copies`). *(W202's declaration step re-took P41 fact 4 with
 * the maintainer's own harness — `queue.shift()`, no `task.running` — at 529 / 1,993 / 15,475 ms and 178 / 468 /
 * 1,448 MB in node; the BEFORE below is this file's harness on the same tree, so its two columns compare.)*
 *
 * ```bash
 * node examples/map-cost.ts
 * deno run --import-map=examples/deno-import-map.json --allow-read --allow-run --allow-env examples/map-cost.ts
 * ```
 *
 * Each child is started with its runtime's `--expose-gc` flag, so a large read's baseline is taken after a collection.
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
/** The reference subjects' sizes — the three W199 measured before the index. */
const REF_SIZES = [2_000, 8_000, 16_000];
/** The large-read subjects' sizes — P41 fact 4's three. */
const LARGE_SIZES = [1_000, 2_000, 4_000];
type RefShape = 'one step back' | 'two steps back' | 'nested map' | 'sibling map';
type LargeShape = 'large read' | 'large read, small node';
type Subject = 'fold' | 'driver' | 'running' | 'runtime' | RefShape | LargeShape;
const REF_SHAPES: readonly RefShape[] = ['one step back', 'two steps back', 'nested map', 'sibling map'];
const LARGE_SHAPES: readonly LargeShape[] = ['large read', 'large read, small node'];
const SUBJECTS: readonly Subject[] = ['fold', 'driver', 'running', 'runtime', ...REF_SHAPES, ...LARGE_SHAPES];
const isRef = (s: Subject): s is RefShape => (REF_SHAPES as readonly string[]).includes(s);
const isLarge = (s: Subject): s is LargeShape => (LARGE_SHAPES as readonly string[]).includes(s);

/**
 * **What was measured BEFORE the plan, by size** — node 24.20.0, each from the document named (the large-read rows from
 * W203's Record, which carries the `88059b7` figures and their log). `fold`: P39 fact 1 (one
 * process, sizes in turn; 8,000 and 16,000 not run, the 4,000 already 33 s). The driver: P39 fact 4 (its queue walked by
 * index; 1,000 and 2,000 are fact 1's driver column). The runtime: W196's Record, on `e2b62c8` — the runtime stepping a
 * `RunState` per input, every settlement in one burst, nobody reading the run.
 */
const BEFORE: Record<Subject, Record<number, number>> = {
  fold: { 1_000: 135, 2_000: 3_609, 4_000: 33_664 },
  driver: { 1_000: 28, 2_000: 33, 4_000: 98, 8_000: 351, 16_000: 988 },
  running: { 4_000: 113, 8_000: 517, 16_000: 2_870 },
  runtime: { 1_000: 987, 2_000: 8_284, 4_000: 34_311, 8_000: 157_679, 16_000: 683_151 },
  // **W199's declaration step, on `6006caa`** (its re-take 1): the driver alone, `task.running` before each settlement, each
  // size a fresh process, node 24.20.0. The nested map and the sibling were not run at 16,000 before the index.
  'one step back': { 2_000: 701, 8_000: 22_033, 16_000: 99_029 },
  'two steps back': { 2_000: 1_310, 8_000: 41_622, 16_000: 176_628 },
  'nested map': { 2_000: 18_251, 8_000: 290_697 },
  'sibling map': { 2_000: 52, 8_000: 178 },
  // **W203, this file's harness on `88059b7`** (the tree before ADR 0126's shared copy), each size a fresh process,
  // node 24.20.0: ms here, and the peak heap over baseline in `BEFORE_MB`.
  'large read': { 1_000: 543, 2_000: 1_949, 4_000: 7_936 },
  'large read, small node': { 1_000: 62, 2_000: 73, 4_000: 118 },
};
/** The same re-takes in deno 2.9.6 — printed for the reference and the large-read subjects when this file runs under deno. */
const BEFORE_DENO: Partial<Record<Subject, Record<number, number>>> = {
  'one step back': { 2_000: 474, 8_000: 12_006, 16_000: 64_208 },
  'two steps back': { 2_000: 815, 8_000: 26_770, 16_000: 124_493 },
  'nested map': { 2_000: 16_881, 8_000: 323_427 },
  'sibling map': { 2_000: 59, 8_000: 206 },
  'large read': { 1_000: 836, 2_000: 2_116, 4_000: 8_383 },
  'large read, small node': { 1_000: 33, 2_000: 55, 4_000: 98 },
};
/** The large-read subjects' peak heap over baseline BEFORE, in MB — node 24.20.0 and deno 2.9.6, on `88059b7`. */
const BEFORE_MB: Record<'node' | 'deno', Record<LargeShape, Record<number, number>>> = {
  node: {
    'large read': { 1_000: 179, 2_000: 470, 4_000: 1_440 },
    'large read, small node': { 1_000: 6, 2_000: 10, 4_000: 16 },
  },
  deno: {
    'large read': { 1_000: 174, 2_000: 467, 4_000: 1_433 },
    'large read, small node': { 1_000: 6, 2_000: 12, 4_000: 15 },
  },
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

/**
 * **A REFERENCE read inside a map, the driver alone** — W199's re-take harness, the shapes `test/fold/map-cost.test.ts`
 * counts: an `ingest` task hands the map its items; `task.running` (attemptNumber 1) before every settlement; the queue
 * walked by index. `ms` from `start` to the last settlement.
 */
function refRun(shape: RefShape, items: number): { ms: number; inputs: number } {
  const task = (id: string, to: string, extra: Record<string, unknown> = {}) => ({ id, kind: 'task', type: 'Work', ...extra, edges: [{ to }] });
  const end = [{ id: 'collect', kind: 'join', of: 'each', edges: [{ to: 'done' }] }, { id: 'done', kind: 'end', outcome: 'completed' }];
  const nodes = shape === 'sibling map'
    ? [
      task('ingest', 'each'),
      { id: 'each', kind: 'map', over: 'items', branch: 'score' },
      task('score', 'collect'),
      { id: 'collect', kind: 'join', of: 'each', edges: [{ to: 'regroup' }] },
      task('regroup', 'rank'),
      { id: 'rank', kind: 'map', over: 'slots', branch: 'publish' },
      task('publish', 'gather', { needs: { scored: ['score'] } }),
      { id: 'gather', kind: 'join', of: 'rank', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ]
    : shape === 'nested map'
    ? [
      task('ingest', 'each'),
      { id: 'each', kind: 'map', over: 'items', branch: 'prep' },
      task('prep', 'inner'),
      { id: 'inner', kind: 'map', over: 'sub', branch: 'leaf' },
      task('leaf', 'tail'),
      task('tail', 'innerJoin', { needs: { p: 'prep', l: 'leaf' } }),
      { id: 'innerJoin', kind: 'join', of: 'inner', edges: [{ to: 'collect' }] },
      ...end,
    ]
    : shape === 'two steps back'
    ? [
      task('ingest', 'each'),
      { id: 'each', kind: 'map', over: 'items', branch: 'work' },
      task('work', 'mid'),
      task('mid', 'post'),
      task('post', 'collect', { needs: { w: 'work' } }),
      ...end,
    ]
    : [
      task('ingest', 'each'),
      { id: 'each', kind: 'map', over: 'items', branch: 'work' },
      task('work', 'post'),
      task('post', 'collect', { needs: { w: 'work', it: '.' } }),
      ...end,
    ];
  const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  const queue: string[] = [];
  const fire = (type: string, detail: unknown) => { for (const fn of listeners.get(type) ?? []) fn({ detail }); };
  const failures: string[] = [];
  const driver = new Driver({ flowId: 'big-map', version: 1, entry: 'ingest', nodes } as unknown as FlowDefinition, {
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
  const t0 = performance.now();
  driver.start({});
  // By INDEX — never `shift()` (P39 fact 4).
  for (let q = 0; q < queue.length; q += 1) {
    const id = queue[q]!;
    fire('task.running', { id, state: 'running', attemptNumber: 1 });
    const result = id.includes(':ingest:') ? { items: Array.from({ length: items }, (_, i) => i) }
      : id.includes(':prep:') ? { sub: [0, 1] } : id.includes(':regroup:') ? { slots: [0, 1, 2] } : { i: q };
    fire('task.completed', { id, state: 'done', result, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 });
  }
  const ms = performance.now() - t0;
  if (failures.length > 0) throw new Error(`${shape} at ${items} items: ${failures.join(', ')}`);
  const inputs = driver.foldInputs() as FoldInput[];
  // Outside the timed span: the run COMPLETED, so every read the shape makes was made.
  if (fold(inputs).outcome !== 'completed') throw new Error(`${shape} at ${items} items: the run did not complete`);
  return { ms, inputs: inputs.length };
}

/** The heap in use now — node's `process.memoryUsage()` or deno's `Deno.memoryUsage()`. */
const heapUsed = (): number => {
  const m = g.Deno ? (g.Deno as unknown as { memoryUsage(): { heapUsed: number } }).memoryUsage()
    : (g.process as unknown as { memoryUsage(): { heapUsed: number } }).memoryUsage();
  return m.heapUsed;
};

/**
 * **A LARGE value read inside a map, the driver alone** — fyflow-app's *fetch-then-map* (P41 fact 4): `fetch` settles
 * with ~100 KB holding the items, the map runs over them, and each `work` instance reads `all: "fetch"` beside its
 * `"$item"`; with `small`, `all` names `tiny`, a node before `fetch` whose result is one field — the same flow, the
 * same items, a small referenced value. `task.running` (attemptNumber 1) before every settlement; the queue walked by
 * index, each config held until the walk reaches it, as a scheduler's pending queue holds what no worker has taken (P41
 * fact 3) and released after. `ms` from `start` to the last settlement; `mb` the peak heap over a baseline taken after
 * a collection, sampled every 256 settlements and at the end.
 */
function largeRun(small: boolean, items: number): { ms: number; inputs: number; mb: number } {
  const nodes = [
    ...(small ? [{ id: 'tiny', kind: 'task', type: 'Work', edges: [{ to: 'fetch' }] }] : []),
    { id: 'fetch', kind: 'task', type: 'Work', edges: [{ to: 'each' }] },
    { id: 'each', kind: 'map', over: 'items', branch: 'work' },
    { id: 'work', kind: 'task', type: 'Work', needs: { item: '$item', all: small ? 'tiny' : 'fetch' }, edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'each', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ];
  // ~100 KB holding the items, whatever their number — P41 fact 4's shape.
  const pad = 'x'.repeat(Math.max(0, Math.floor(100_000 / items) - 20));
  const fetched = { items: Array.from({ length: items }, (_, i) => ({ i, pad })) };
  const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  const queue: ({ id: string } | null)[] = [];
  const fire = (type: string, detail: unknown) => { for (const fn of listeners.get(type) ?? []) fn({ detail }); };
  const failures: string[] = [];
  const driver = new Driver({ flowId: 'fetch-map', version: 1, entry: small ? 'tiny' : 'fetch', nodes } as unknown as FlowDefinition, {
    runId: 'r1',
    scheduler: {
      addTask(task: unknown) { queue.push(task as { id: string }); },
      addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
    },
    createTask: (config) => config,
    predicates: new Map(),
    workers: { w: { url: 'worker.js' } },
    nodeTypes: { Work: { worker: 'w' } },
    joinPolicy: liveToken as JoinPolicy,
    onRunFailure: (f) => { failures.push(f.kind); },
  });
  (globalThis as { gc?: () => void }).gc?.();
  const h0 = heapUsed();
  let peak = h0;
  const t0 = performance.now();
  driver.start({});
  // By INDEX — never `shift()` (P39 fact 4); each config released once the walk has taken it.
  for (let q = 0; q < queue.length; q += 1) {
    const id = queue[q]!.id;
    queue[q] = null;
    fire('task.running', { id, state: 'running', attemptNumber: 1 });
    const result = id.includes(':tiny:') ? { tiny: 1 } : id.includes(':fetch:') ? fetched : { n: 1 };
    fire('task.completed', { id, state: 'done', result, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 });
    if ((q & 255) === 0) peak = Math.max(peak, heapUsed());
  }
  const ms = performance.now() - t0;
  peak = Math.max(peak, heapUsed());
  if (failures.length > 0) throw new Error(`large read at ${items} items: ${failures.join(', ')}`);
  const inputs = driver.foldInputs() as FoldInput[];
  // Outside the timed span: the run COMPLETED, so every read was made.
  if (fold(inputs).outcome !== 'completed') throw new Error(`large read at ${items} items: the run did not complete`);
  return { ms, inputs: inputs.length, mb: (peak - h0) / 1e6 };
}

/** ONE subject at ONE size, in THIS process — what a child prints, as one JSON line. */
async function one(subject: Subject, items: number): Promise<{ subject: Subject; items: number; inputs: number; ms: number; mb?: number }> {
  if (isLarge(subject)) return { subject, items, ...largeRun(subject === 'large read, small node', items) };
  if (isRef(subject)) return { subject, items, ...refRun(subject, items) };
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
async function child(subject: Subject, items: number): Promise<{ inputs: number; ms: number; mb?: number }> {
  const self = new URL(import.meta.url);
  let out: string;
  if (g.Deno) {
    const map = new URL('./deno-import-map.json', import.meta.url).href;
    const r = new g.Deno.Command(g.Deno.execPath(), {
      args: ['run', '--v8-flags=--expose-gc', `--import-map=${map}`, '--allow-read', '--allow-run', '--allow-env', self.href, '--one', subject, String(items)],
    }).outputSync();
    out = new TextDecoder().decode(r.stdout);
    if (r.code !== 0) throw new Error(`the child for ${subject} at ${items} exited ${r.code}: ${new TextDecoder().decode(r.stderr).slice(0, 400)}`);
  } else {
    const { spawnSync } = await import('node:child_process');
    const { fileURLToPath } = await import('node:url');
    const r = spawnSync(g.process!.execPath, ['--expose-gc', fileURLToPath(self), '--one', subject, String(items)], { encoding: 'utf8' });
    out = r.stdout;
    if (r.status !== 0) throw new Error(`the child for ${subject} at ${items} exited ${r.status}: ${r.stderr.slice(0, 400)}`);
  }
  const line = out.trim().split('\n').pop()!;
  return JSON.parse(line) as { inputs: number; ms: number; mb?: number };
}

if (args[0] === '--one') {
  console.log(JSON.stringify(await one(args[1] as Subject, Number(args[2]))));
} else {
  const only = args[0] === undefined ? SUBJECTS : SUBJECTS.filter((s) => s === args[0]);
  const fmt = (ms: number | undefined) => (ms === undefined ? '—' : `${Math.round(ms).toLocaleString('en-US')} ms`);
  console.log(`\n  what a long map costs — ${runtimeName}, each size in a fresh process; BEFORE is node 24.20.0 on the tree before P39,` +
    ` for a needs read inside a map ${g.Deno ? 'deno 2.9.6' : 'node 24.20.0'} on the tree before ADR 0124's index (6006caa),` +
    ` and for a large read the same runtime on the tree before ADR 0126's shared copy (88059b7)\n`);
  for (const subject of only) {
    console.log(`  ${subject === 'fold' ? 'fold' : subject === 'driver' ? 'driver, no task.running' : subject === 'running' ? 'driver, task.running (attemptNumber 1) before each settlement' : subject === 'runtime' ? 'runtime, start to done, outcome() after every input' : subject === 'large read' ? 'driver, fetch-then-map: each instance reads the ~100 KB fetch result, task.running before each settlement — time and peak heap' : subject === 'large read, small node' ? 'driver, the same flow reading a SMALL node, task.running before each settlement — time and peak heap' : `driver, a needs read inside a map: ${subject}, task.running before each settlement`}`);
    const large = isLarge(subject);
    console.log(`    ${'items'.padStart(7)}  ${'inputs'.padStart(7)}  ${'BEFORE'.padStart(11)}  ${'now'.padStart(9)}${large ? `  ${'BEFORE MB'.padStart(9)}  ${'now MB'.padStart(7)}` : ''}`);
    const before = (isRef(subject) || large) && g.Deno ? BEFORE_DENO[subject]! : BEFORE[subject];
    const mb = (v: number | undefined) => (v === undefined ? '—' : `${Math.round(v)} MB`);
    for (const items of large ? LARGE_SIZES : isRef(subject) ? REF_SIZES : SIZES) {
      const r = await child(subject, items);
      const mbText = isLarge(subject) ? `  ${mb(BEFORE_MB[g.Deno ? 'deno' : 'node'][subject][items]).padStart(9)}  ${mb(r.mb).padStart(7)}` : '';
      console.log(`    ${items.toLocaleString('en-US').padStart(7)}  ${String(r.inputs).padStart(7)}  ${fmt(before[items]).padStart(11)}  ${fmt(r.ms).padStart(9)}${mbText}`);
    }
    console.log('');
  }
}
