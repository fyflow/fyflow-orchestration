/**
 * **What the scheduler hands a task's worker beside its payload reaches a TYPED worker, through the
 * envelope** — `FD-C5`'s second argument (`spec/flow-definition.md` v0.33),
 * [P33](../../doc/plans/p33-what-a-run-does-when-a-task-ends-cancelled.md) fact 4 and scope 3,
 * [W159](../../doc/work-items/w159-what-the-pin-adds-that-a-type-reaches.md). And the two pool options
 * the scheduler added at the pin, declared on a node type (`cancelGraceMs`, `messages`, v0.33's pool
 * table), reaching the `WorkerManager` the bootstrap helper builds.
 *
 * **Where the expected values come from.** The scheduler's own reference at the pin
 * (`node_modules/fyflow-scheduler/AGENTS.md`): section 4 — `context.signal` is an `AbortSignal`, aborted when
 * `scheduler.cancel()` is called for the task, its `reason` the one given; `context.emit(name, data)` is
 * `task.message` on the scheduler, `data` copied by `structuredClone`; section 5's `WorkerManager` table —
 * `cancelGraceMs` and `messages`, and the `TypeError`/`RangeError` each throws at construction; section 6 —
 * every `task.message` an attempt emits arrives before its settlement, a cancelled task's before
 * `task.cancelled`, `seq` counting from 0. Nothing here is a value read off a run of this code.
 *
 * **Why this is not `examples/l6.ts`**, which the plan's row names as the rung: L6 is `examples/**`
 * (`RT-R10`) and that file is W160's. The real-pool cases below are `test/scheduler/transform.test.ts`'s
 * shape (W61): a real `FyflowScheduler` over a real `WorkerManager`, inline and threaded, where a pool can
 * load the envelope worker's script — Node and Deno — and the wrapper CLASS in the browser, where
 * `ENVELOPE_WORKER_URL` resolves beside the bundle ([Q261](../../doc/questions/q261.md)). The case count is
 * the same in every runtime, and each case's name says which backends ran.
 */
import { equal, ok, suite } from '../harness.ts';
import { FyflowScheduler, FyflowTask, WorkerManager } from 'fyflow-scheduler';
import { bootstrap, EnvelopeWorker } from '../../src/scheduler/index.ts';
import { poolSpecProblem } from '../../src/definition/registry.ts';
import type { NodeTypeDeclaration } from '../../src/definition/types.ts';

/**
 * **The inner worker: a type's worker that USES both members.** It emits `started` at once — saying what
 * kind of thing each member is — and, when its input asks, waits for its signal to abort and emits
 * `aborted` with the signal's state and reason. It keeps itself and both contexts on `globalThis` where it
 * runs in this thread (the class backend and the inline pool), so identity can be asserted there; a thread
 * cannot share an object, which is why the real-pool cases read only what `emit` carried out.
 */
const INNER_SRC = `export default class Inner {
  constructor(config, workerContext) { this.workerContext = workerContext; globalThis.__W159_INNER__ = this; }
  async run(p, context) {
    this.lastContext = context;
    // WHERE this run is: a Deno worker is a WorkerGlobalScope; a Node worker thread says so through its own
    // module. Neither holds on the main thread. The module is asked only where a process says it is Node's,
    // since a browser page reports even a CAUGHT failed import of it as a page error.
    const scope = typeof WorkerGlobalScope !== 'undefined' && globalThis instanceof WorkerGlobalScope;
    const isNode = typeof globalThis.process?.versions?.node === 'string';
    const nodeThread = isNode && await import('node:worker_threads').then((m) => !m.isMainThread, () => false);
    context.emit('started', {
      input: p.input,
      offThread: scope || nodeThread,
      signal: typeof AbortSignal !== 'undefined' && context.signal instanceof AbortSignal,
      aborted: context.signal.aborted,
      emit: typeof context.emit,
    });
    if (p.input && p.input.waitForCancel) {
      await new Promise((resolve) => {
        if (context.signal.aborted) resolve();
        else context.signal.addEventListener('abort', () => resolve(), { once: true });
      });
      context.emit('aborted', { aborted: context.signal.aborted, reason: String(context.signal.reason) });
      return { stopped: true };
    }
    return { finished: true };
  }
}`;
const INNER_URL = `data:text/javascript,${encodeURIComponent(INNER_SRC)}`;
type Inner = { workerContext: unknown; lastContext: unknown };
const innerSeen = (): Inner => (globalThis as Record<string, unknown>).__W159_INNER__ as Inner;

/** The node type every real-pool case declares: both new options set, each to a value no default has, so a read-back cannot pass by the default. */
const typeFor = (inline: boolean): NodeTypeDeclaration => ({
  worker: 'inner', inline,
  pool: { maxThreads: 1, idleTimeout: 0, cancelGraceMs: 4321, messages: { flushIntervalMs: 7, maxBuffered: 33 } },
});
const REGISTRY = (inline: boolean) => ({ workers: { inner: { url: INNER_URL } }, nodeTypes: { Inner: typeFor(inline) } });

const IN_BROWSER = typeof (globalThis as { document?: unknown }).document !== 'undefined';
const BACKENDS: readonly string[] = IN_BROWSER ? ['class'] : ['inline', 'threaded'];
const DROVE = new Set<string>();

type Message = { name: string; data: Record<string, unknown>; seq: number };
type Driven = { messages: Message[]; order: string[]; state: string; reason?: unknown };

/**
 * **A wait that ENDS** — the adequacy reader's F3/F4: the settle race's timer was never cleared, which held
 * each lane ~7.5 s idle after its last case, and `shutdown()` was awaited unbounded, so a worker that never
 * stops hung the suite instead of failing it. Its timer is cleared however the race ends.
 */
async function bounded<T>(work: Promise<T>, ms: number): Promise<{ done: true; value: T } | { done: false }> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const late = new Promise<{ done: false }>((resolve) => { timer = setTimeout(() => resolve({ done: false }), ms); });
  try {
    return await Promise.race([work.then((value) => ({ done: true as const, value })), late]);
  } finally { clearTimeout(timer); }
}
const SETTLE_MS = 8000;
const SHUTDOWN_MS = 3000;

/**
 * **One task through one backend** — the scheduler's events on a pool, the wrapper's own run on the class.
 * `cancelOnStart` cancels the task with reason `W159` the moment its `started` message arrives — the worker is
 * then provably RUNNING, which is the road on which `signal` aborts (a waiting task is removed and never runs).
 */
async function drive(backend: string, input: Record<string, unknown>, cancelOnStart: boolean): Promise<Driven> {
  DROVE.add(backend);
  const payload = { settings: {}, input };
  if (backend === 'class') {
    const ctl = new AbortController();
    const messages: Message[] = [];
    const ctx = {
      taskId: 't1', signal: ctl.signal,
      emit: (name: string, data: Record<string, unknown>) => {
        messages.push({ name, data: structuredClone(data), seq: messages.length });
        if (cancelOnStart && name === 'started') ctl.abort('W159');
      },
    };
    const w = new EnvelopeWorker({ worker: INNER_URL, config: {} });
    await w.setup();
    try {
      await w.run(payload, ctx);
      return { messages, order: messages.map((m) => `message:${m.name}`), state: cancelOnStart ? 'aborted-by-hand' : 'done' };
    } finally { await w.teardown(); }
  }
  const built = bootstrap(REGISTRY(backend === 'inline'), {});
  // The pool mode is the POOL's, read off it (the adequacy reader's F5) — and the worker reports where it ran.
  equal(built.workerPools.Inner!.inline, backend === 'inline', `${backend}: the pool is ${backend === 'inline' ? 'inline' : 'threaded'}`);
  const s = new FyflowScheduler(built.workerPools, built.resourceGroups);
  const on = (name: string, f: (detail: Record<string, unknown>) => void) =>
    (s as unknown as { addEventListener(n: string, l: (e: { detail: Record<string, unknown> }) => void): void }).addEventListener(name, (e) => f(e.detail));
  const messages: Message[] = [];
  const order: string[] = [];
  let cancelling: Promise<boolean> | undefined;
  // Every field read is COPIED in the listener: a lifecycle detail is the live task (ADR 0007).
  on('task.message', (d) => {
    if (d.taskId !== 't1') return;
    messages.push({ name: d.name as string, data: d.data as Record<string, unknown>, seq: d.seq as number });
    order.push(`message:${d.name as string}`);
    if (cancelOnStart && d.name === 'started') cancelling = s.cancel('t1', { reason: 'W159' });
  });
  const settled = new Promise<Driven>((resolve) => {
    const end = (d: Record<string, unknown>) => {
      order.push(`settled:${d.state as string}`);
      const c = d.cancellation as { reason?: unknown } | undefined;
      resolve({ messages, order, state: d.state as string, reason: c?.reason });
    };
    on('task.completed', end);
    on('task.failed', end);
    on('task.cancelled', end);
  });
  try {
    s.addTask(new FyflowTask({ id: 't1', workerType: 'Inner', payload, optional: true, retryPolicy: { maxRetries: 0, backoffMs: 0 } }));
    const r = await bounded(settled, SETTLE_MS);
    if (!r.done) return { messages, order, state: `TIMEOUT after ${SETTLE_MS} ms` };
    if (cancelling !== undefined) {
      const c = await bounded(cancelling, SETTLE_MS);
      ok(c.done && c.value, `${backend}: cancel() reported it cancelled the task`);
    }
    return r.value;
  } finally {
    const down = await bounded(s.shutdown(), SHUTDOWN_MS);
    ok(down.done, `${backend}: the scheduler shut down within ${SHUTDOWN_MS} ms — a worker that never stops FAILS this case rather than hanging the suite`);
  }
}

suite('W159 — a typed worker REACHES context.signal and context.emit through the envelope, and a type`s cancelGraceMs and messages reach its pool', (test) => {
  test('FD-C5 v0.33: the wrapper hands its inner worker the SAME task context and the SAME worker context it was handed — identity, not a copy', async () => {
    const workerContext = { workerId: 'w1', emit: () => undefined };
    const ctx = { taskId: 't1', signal: new AbortController().signal, emit: () => undefined };
    const w = new EnvelopeWorker({ worker: INNER_URL, config: {} }, workerContext);
    await w.setup();
    try {
      ok(innerSeen().workerContext === workerContext, 'the inner constructor received the worker context object itself');
      await w.run({ settings: {}, input: {} }, ctx);
      ok(innerSeen().lastContext === ctx, 'the inner run() received the task context object itself');
      ok((innerSeen().lastContext as typeof ctx).signal === ctx.signal && (innerSeen().lastContext as typeof ctx).emit === ctx.emit, 'so its signal and emit are the ones the scheduler made');
    } finally { await w.teardown(); }
    // The control: a DIFFERENT context object of the same shape is not what the inner worker saw last time.
    const w2 = new EnvelopeWorker({ worker: INNER_URL, config: {} }, workerContext);
    await w2.setup();
    try {
      const other = { taskId: 't2', signal: new AbortController().signal, emit: () => undefined };
      await w2.run({ settings: {}, input: {} }, other);
      ok(innerSeen().lastContext === other && innerSeen().lastContext !== ctx, 'each run sees its own context, so the identity above can fail');
    } finally { await w2.teardown(); }
  });

  test('a type`s declared cancelGraceMs and messages reach the WorkerManager the bootstrap helper builds, inline and threaded — read back off the pool', async () => {
    for (const inline of [true, false]) {
      const built = bootstrap(REGISTRY(inline), {});
      const pool = built.workerPools.Inner!;
      try {
        equal(pool.cancelGraceMs, 4321, `${inline ? 'inline' : 'threaded'}: cancelGraceMs as declared (the scheduler's default is 2000)`);
        equal(pool.messages, { flushIntervalMs: 7, maxBuffered: 33 }, `${inline ? 'inline' : 'threaded'}: messages as declared (the default is 20 and 100)`);
      } finally { await pool.shutdown(); }
    }
    // The control: a type declaring neither gets the scheduler's defaults, so the read-back above is not the default.
    const plain = bootstrap({ workers: { inner: { url: INNER_URL } }, nodeTypes: { Inner: { worker: 'inner', inline: true } } }, {}).workerPools.Inner!;
    try {
      equal([plain.cancelGraceMs, plain.messages], [2000, { flushIntervalMs: 20, maxBuffered: 100 }], 'undeclared: the scheduler`s defaults, its reference`s section 5');
    } finally { await plain.shutdown(); }
  });

  test('a SECOND observer of the refusal rule: every numeric value poolSpecProblem refuses, the scheduler`s own constructor throws on, and every one it admits, the constructor accepts', async () => {
    // Values from the scheduler's rules (its reference, section 5): cancelGraceMs a number, not NaN, >= 0;
    // flushIntervalMs finite and > 0; maxBuffered an integer >= 1. `messages` that is not an object is
    // NOT here: the scheduler spreads it and ignores it in silence, which is why this library refuses it
    // (`poolSpecProblem`'s own comment) — a stricter rule the scheduler cannot corroborate. Nor is
    // `cancelGraceMs: null`, MEASURED here: the scheduler reads `?? 2000` and takes a null for absent, where
    // this library refuses it as it refuses a null `idleTimeout` — stricter again, and asserted in
    // `test/definition/registry.test.ts` alone.
    const CASES: readonly [string, Record<string, unknown>, boolean][] = [
      ['cancelGraceMs 0', { cancelGraceMs: 0 }, true],
      ['cancelGraceMs Infinity', { cancelGraceMs: Infinity }, true],
      ['cancelGraceMs 2.5', { cancelGraceMs: 2.5 }, true],
      ['cancelGraceMs -1', { cancelGraceMs: -1 }, false],
      ['cancelGraceMs NaN', { cancelGraceMs: NaN }, false],
      ['cancelGraceMs "100"', { cancelGraceMs: '100' }, false],
      ['cancelGraceMs true', { cancelGraceMs: true }, false],
      ['cancelGraceMs -Infinity', { cancelGraceMs: -Infinity }, false],
      ['cancelGraceMs -0.5', { cancelGraceMs: -0.5 }, false],
      ['cancelGraceMs -Number.MIN_VALUE', { cancelGraceMs: -Number.MIN_VALUE }, false],
      ['messages {}', { messages: {} }, true],
      ['flushIntervalMs 0.5', { messages: { flushIntervalMs: 0.5 } }, true],
      ['flushIntervalMs 0', { messages: { flushIntervalMs: 0 } }, false],
      ['flushIntervalMs -5', { messages: { flushIntervalMs: -5 } }, false],
      ['flushIntervalMs Infinity', { messages: { flushIntervalMs: Infinity } }, false],
      ['flushIntervalMs "20"', { messages: { flushIntervalMs: '20' } }, false],
      ['flushIntervalMs present and undefined', { messages: { flushIntervalMs: undefined } }, false],
      ['maxBuffered 1', { messages: { maxBuffered: 1 } }, true],
      ['maxBuffered 2**53', { messages: { maxBuffered: 2 ** 53 } }, true],
      ['maxBuffered 0', { messages: { maxBuffered: 0 } }, false],
      ['maxBuffered 1.5', { messages: { maxBuffered: 1.5 } }, false],
      ['maxBuffered Infinity', { messages: { maxBuffered: Infinity } }, false],
      ['maxBuffered present and undefined', { messages: { maxBuffered: undefined } }, false],
    ];
    ok(CASES.some(([, , a]) => a) && CASES.some(([, , a]) => !a), 'both verdicts are represented');
    for (const [label, options, admitted] of CASES) {
      equal(poolSpecProblem(options) === null, admitted, `${label}: poolSpecProblem ${admitted ? 'admits' : 'refuses'} it`);
      let threw = false;
      try {
        const pool = new WorkerManager(INNER_URL, { inline: true, maxThreads: 1, ...options });
        await pool.shutdown();
      } catch { threw = true; }
      equal(threw, !admitted, `${label}: the scheduler's constructor ${admitted ? 'accepts' : 'throws on'} it too`);
    }
  });

  test(`context.emit: the typed worker's emit arrives as task.message, before the settlement, carrying what each member WAS — backends: ${BACKENDS.join(', ')}`, async () => {
    for (const backend of BACKENDS) {
      const r = await drive(backend, { word: 'w159' }, false);
      equal(r.state, 'done', `${backend}: settled done (${JSON.stringify(r)})`);
      equal(r.messages.map((m) => m.name), ['started'], `${backend}: exactly the one message the worker emitted`);
      const m = r.messages[0]!;
      equal(m.data, { input: { word: 'w159' }, offThread: backend === 'threaded', signal: true, aborted: false, emit: 'function' },
        `${backend}: the inner worker saw its own input, an AbortSignal not yet aborted, and an emit function — and ran ${backend === 'threaded' ? 'OFF' : 'ON'} the main thread`);
      equal(m.seq, 0, `${backend}: the first emit of the attempt is seq 0`);
      if (backend !== 'class') equal(r.order, ['message:started', 'settled:done'], `${backend}: the message arrived BEFORE task.completed`);
    }
  });

  test(`context.signal: cancel() on the RUNNING typed task aborts the inner worker's signal with the reason given, and the task ends cancelled — backends: ${BACKENDS.join(', ')}`, async () => {
    for (const backend of BACKENDS) {
      const r = await drive(backend, { waitForCancel: true }, true);
      equal(r.messages.map((m) => m.name), ['started', 'aborted'], `${backend}: the worker saw the abort and said so (${JSON.stringify(r)})`);
      equal(r.messages[1]!.data, { aborted: true, reason: 'W159' }, `${backend}: the signal is aborted, with the reason cancel() was given`);
      if (backend === 'class') {
        equal(r.state, 'aborted-by-hand', 'class: the wrapper passed the hand-made signal through; which state the scheduler ends it in is the pool backends` half');
      } else {
        equal(r.state, 'cancelled', `${backend}: ended cancelled, the scheduler's sixth state`);
        equal(r.reason, 'W159', `${backend}: the reason on task.cancellation`);
        equal(r.order, ['message:started', 'message:aborted', 'settled:cancelled'], `${backend}: both messages BEFORE task.cancelled`);
      }
    }
  });

  test('every backend BACKENDS names was driven by the cases above', () => {
    equal([...BACKENDS].sort(), IN_BROWSER ? ['class'] : ['inline', 'threaded'], 'both pool modes outside the browser; the class inside it');
    equal([...DROVE].sort(), [...BACKENDS].sort(), 'the backends driven are exactly the backends declared');
  });
});
