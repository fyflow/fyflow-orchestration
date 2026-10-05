/**
 * **The envelope worker EVALUATING a declared transform, at ladder L1** — `FD-C6`
 * (`spec/flow-definition.md` section 3, v0.18),
 * [ADR 0051](../../doc/decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md)
 * rules 3 and 5, [W61](../../doc/work-items/w61-what-a-transform-is.md). The language is the FAKE
 * one in `fake-language.ts`, so nothing here needs `jsonata`.
 *
 * **The four kinds of `input` `FD-C5` enumerates are each transformed here** — the ordinary
 * edge's value, what `needs` composed, a map item, a join's collection — as VALUES handed to the
 * wrapper, which is the only shape the wrapper can see (obligation (a)'s enumeration clause; the
 * driver-side half of the same four is `test/driver/transform.test.ts`). Every expected value is
 * written from the fake language's grammar and the fixture value, never from a run.
 *
 * **And on a REAL pool, inline and threaded.** Where a pool can load the envelope worker's script
 * — Node and Deno — the second suite runs it on a real `FyflowScheduler` and reads the two roads a
 * failure takes off the scheduler. In the browser a pool loads its script by URL and
 * `ENVELOPE_WORKER_URL` resolves beside the bundle ([Q261](../../doc/questions/q261.md)), so the
 * same cases drive the wrapper CLASS directly and assert the wrapper's half of each claim; the
 * case count is the same in all five runtimes, which is what the browser runner's parity check
 * asks, and the header of every case says which backends ran.
 */
import { equal, ok, suite } from '../harness.ts';
import { FyflowScheduler, FyflowTask, WorkerManager } from 'fyflow-scheduler';
import { ENVELOPE_WORKER_URL, EnvelopeWorker, NotAnEnvelope, TransformFailed, unpackEnvelope } from '../../src/scheduler/index.ts';
import { PATH_WORKER_URL } from './fake-language.ts';

/** An inner worker any runtime can import: records exactly what it was handed. */
const INNER_SRC = `export default class Inner {
  constructor(config, ctx) { this.config = config; globalThis.__W61_INNER__ = this; }
  async run(p) { return { keys: Object.keys(p).sort(), hasInput: 'input' in p, settings: p.settings, input: p.input }; }
}`;
const INNER_URL = `data:text/javascript,${encodeURIComponent(INNER_SRC)}`;
/** A language whose WORKER half refuses everything while its registry half accepts — Q264's disagreement, constructed. */
const DISAGREEING_URL = `data:text/javascript,${encodeURIComponent('export default function compile(expr) { const e = new Error("the worker half refuses " + expr); e.code = "X0001"; throw e; }')}`;
/** A language module whose compile returns something with no evaluate. */
const NO_EVALUATE_URL = `data:text/javascript,${encodeURIComponent('export default function compile() { return { run: 1 }; }')}`;
const NO_DEFAULT_URL = `data:text/javascript,${encodeURIComponent('export const compile = () => ({});')}`;
/** A SECOND language whose evaluate tags the text with its own name — so two languages sharing one expression TEXT are distinguishable. */
const UPPER_URL = `data:text/javascript,${encodeURIComponent('export default function compile(expr) { return { evaluate() { return Promise.resolve("UPPER:" + expr); } }; }')}`;

const CFG = { worker: INNER_URL, languages: { path: PATH_WORKER_URL } };
type Seen = { keys: string[]; hasInput: boolean; settings: unknown; input: unknown };

async function fresh(cfg: { worker: string; config?: unknown; languages?: Record<string, string> } = CFG): Promise<EnvelopeWorker> {
  const w = new EnvelopeWorker(cfg);
  await w.setup();
  return w;
}
function compiles(): number { return ((globalThis as Record<string, unknown>).__PATH_COMPILES__ as number | undefined) ?? 0; }

/**
 * The four kinds of `input`, as `[label, the value received, the expression, what the worker must see]`.
 * The join collection is `JP-R12`'s record keyed by branch path; the fake reads `1.score` as the
 * key `1` then `score`.
 */
const KINDS: readonly [string, unknown, string, unknown][] = [
  ['the ordinary edge`s value', { confidence: 0.9, items: ['a', 'b'] }, 'confidence', 0.9],
  ['what `needs` composed', { own: { confidence: 0.3 }, run: { config: { factor: 4 } } }, 'run.config', { factor: 4 }],
  ['a map item', { word: 'bb', confidence: 0.2 }, 'word', 'bb'],
  ['a join`s collection', { '0': { score: 40 }, '1': { score: 20 } }, '1.score', 20],
];

suite('W61 — the envelope worker evaluates a declared transform in run(), on all four kinds of input FD-C5 names', (test) => {
  test('KINDS is FD-C5`s own enumeration and not a list bound by its count: four values, each recognisable as its kind by its shape', () => {
    // W58's adequacy finding: a shapes list bound by nothing but the printed case count is
    // deletable one entry at a time. The wrapper sees VALUES, so the membership claim is over
    // the values' shapes: exactly one is a JP-R12 record (every key a branch path), exactly one
    // is a `needs` composition carrying `own`, exactly one is a map item with `word`, and exactly
    // one is an ordinary result carrying `items` — and there are four, FD-C5's count.
    equal(KINDS.length, 4, 'four kinds, FD-C5`s enumeration');
    const isRecord = (v: unknown) => typeof v === 'object' && v !== null && Object.keys(v).length > 0 && Object.keys(v).every((k) => /^\d+(\.\d+)*$/.test(k));
    const has = (v: unknown, k: string) => typeof v === 'object' && v !== null && k in v;
    equal(KINDS.filter(([, v]) => isRecord(v)).map(([l]) => l), ['a join`s collection'], 'exactly one join collection');
    equal(KINDS.filter(([, v]) => has(v, 'own')).map(([l]) => l), ['what `needs` composed'], 'exactly one needs composition');
    equal(KINDS.filter(([, v]) => has(v, 'word')).map(([l]) => l), ['a map item'], 'exactly one map item');
    equal(KINDS.filter(([, v]) => has(v, 'items')).map(([l]) => l), ['the ordinary edge`s value'], 'exactly one ordinary edge value');
  });

  for (const [kind, value, expr, expected] of KINDS) {
    test(`${kind}: with a transform the inner worker receives { settings, input } with input REPLACED by the evaluation; without one, the value as sent — and the two differ`, async () => {
      const w = await fresh();
      const settings = { factor: 10 };
      const transformed = await w.run({ settings, input: value, transform: { lang: 'path', expr } }, { taskId: 't' }) as Seen;
      equal(transformed.keys, ['input', 'settings'], 'FD-C5 still: exactly the two keys, the third consumed here');
      equal(transformed.input, expected, `input is the expression ${JSON.stringify(expr)} evaluated over the value received`);
      equal(transformed.settings, settings, 'settings as sent');
      const plain = await w.run({ settings, input: value }, { taskId: 't' }) as Seen;
      equal(plain.input, value, 'without a transform the value received is what arrives, untouched');
      ok(JSON.stringify(plain.input) !== JSON.stringify(transformed.input), 'and the transformed value differs from the untransformed one — the pair is a claim');
      await w.teardown();
    });
  }

  test('the settings binding: one expression, two envelopes with different settings, two different inputs — P17 decision 7 as a pair', async () => {
    const w = await fresh();
    const a = await w.run({ settings: { factor: 10 }, input: { confidence: 0.5 }, transform: { lang: 'path', expr: '$settings.factor' } }) as Seen;
    const b = await w.run({ settings: { factor: 100 }, input: { confidence: 0.5 }, transform: { lang: 'path', expr: '$settings.factor' } }) as Seen;
    equal(a.input, 10, 'settings A reaches the expression as $settings');
    equal(b.input, 100, 'settings B does too');
    ok(a.input !== b.input, 'and the two answers differ');
    await w.teardown();
  });

  test('a transform that evaluates to undefined is NOT a failure: the inner worker runs with input undefined, the key present — P17 fact 4 and decision 5', async () => {
    const w = await fresh();
    const seen = await w.run({ settings: {}, input: { confidence: 0.5 }, transform: { lang: 'path', expr: 'scroe' } }) as Seen;
    equal(seen.hasInput, true, 'the input key is present');
    equal(seen.input, undefined, 'holding undefined — the typo is silent, as the adapter cannot tell it from an intended absence');
    await w.teardown();
  });

  test('each distinct (lang, expr) is compiled ONCE per worker instance, never per task — P17 decision 3', async () => {
    const w = await fresh();
    const before = compiles();
    await w.run({ settings: {}, input: { a: 1 }, transform: { lang: 'path', expr: 'a' } });
    await w.run({ settings: {}, input: { a: 2 }, transform: { lang: 'path', expr: 'a' } });
    equal(compiles() - before, 1, 'two tasks, one expression, one compile');
    await w.run({ settings: {}, input: { b: 3 }, transform: { lang: 'path', expr: 'b' } });
    equal(compiles() - before, 2, 'a second expression is a second compile');
    const w2 = await fresh();
    await w2.run({ settings: {}, input: { a: 1 }, transform: { lang: 'path', expr: 'a' } });
    equal(compiles() - before, 3, 'and a second INSTANCE compiles the first expression again — once per instance, not once per pool');
    await w.teardown();
    await w2.teardown();
  });

  test('the memo is keyed by the PAIR (lang, expr): two languages sharing one expression text on ONE instance each get their own compile — the adequacy reader (m23)', async () => {
    // Keyed by the expression text alone, the second language's task silently received the first
    // language's compiled expression, and no suite ran two languages with one text on one worker.
    const w = await fresh({ worker: INNER_URL, languages: { path: PATH_WORKER_URL, upper: UPPER_URL } });
    const before = compiles();
    const a = await w.run({ settings: {}, input: { a: 1 }, transform: { lang: 'path', expr: 'a' } }) as Seen;
    const b = await w.run({ settings: {}, input: { a: 1 }, transform: { lang: 'upper', expr: 'a' } }) as Seen;
    const a2 = await w.run({ settings: {}, input: { a: 2 }, transform: { lang: 'path', expr: 'a' } }) as Seen;
    equal(a.input, 1, 'path evaluated `a` over the input');
    equal(b.input, 'UPPER:a', 'upper evaluated the SAME text as its own language, not path`s memo');
    equal(a2.input, 2, 'and path`s memo survived upper`s compile of the same text');
    ok(a.input !== b.input, 'the two languages` answers differ — the pair is a claim');
    equal(compiles() - before, 1, 'path compiled once (its counter); upper`s compile is its own module`s');
    await w.teardown();
  });

  test('TransformFailed: a loud failure at evaluation names the language, the expression and the language`s own code, and is thrown from run()', async () => {
    const w = await fresh();
    let err: unknown;
    try { await w.run({ settings: {}, input: { a: 5 }, transform: { lang: 'path', expr: 'a.b' } }); } catch (e) { err = e; }
    ok(err instanceof TransformFailed, `a TransformFailed: ${String(err)}`);
    const f = err as TransformFailed;
    equal([f.lang, f.expr, f.code], ['path', 'a.b', 'P0002'], 'the language, the expression and the code');
    ok(f.message.includes('path') && f.message.includes('"a.b"') && f.message.includes('[P0002]') && f.message.includes('cannot read "b"'), `the message carries all four: ${f.message}`);
    await w.teardown();
  });

  test('TransformFailed: a language the pool config does NOT carry, naming it and what the pool carries', async () => {
    const w = await fresh();
    let err: unknown;
    try { await w.run({ settings: {}, input: {}, transform: { lang: 'jsonata', expr: '$' } }); } catch (e) { err = e; }
    ok(err instanceof TransformFailed && err.message.includes('"jsonata"') && err.message.includes('"path"') && err.message.includes('not loaded'), `names both: ${(err as Error)?.message}`);
    const none = await fresh({ worker: INNER_URL });
    err = undefined;
    try { await none.run({ settings: {}, input: {}, transform: { lang: 'path', expr: '$' } }); } catch (e) { err = e; }
    ok(err instanceof TransformFailed && err.message.includes('no languages'), `a pool config with no languages at all says so: ${(err as Error)?.message}`);
    await w.teardown();
    await none.teardown();
  });

  test('TransformFailed: the worker half refusing an expression, or compiling to nothing evaluable — the two halves DISAGREE (Q264), a task failure rather than a silence', async () => {
    const w = await fresh({ worker: INNER_URL, languages: { odd: DISAGREEING_URL, hollow: NO_EVALUATE_URL } });
    let err: unknown;
    try { await w.run({ settings: {}, input: {}, transform: { lang: 'odd', expr: 'anything' } }); } catch (e) { err = e; }
    ok(err instanceof TransformFailed && err.code === 'X0001' && err.message.includes('worker half') && err.message.includes('refuses anything'), `the worker half's refusal, with its code: ${(err as Error)?.message}`);
    err = undefined;
    try { await w.run({ settings: {}, input: {}, transform: { lang: 'hollow', expr: 'x' } }); } catch (e) { err = e; }
    ok(err instanceof TransformFailed && err.message.includes('no evaluate'), `a compile with no evaluate: ${(err as Error)?.message}`);
    await w.teardown();
  });

  test('unpackEnvelope: a well-formed transform is kept, a malformed one is NotAnEnvelope, and a fourth key is dropped', () => {
    equal(unpackEnvelope({ settings: { a: 1 }, input: 2, transform: { lang: 'path', expr: 'x' } }), { settings: { a: 1 }, input: 2, transform: { lang: 'path', expr: 'x' } }, 'three keys out');
    equal(Object.keys(unpackEnvelope({ settings: {}, input: 1 })), ['settings', 'input'], 'no transform, no key');
    equal(Object.keys(unpackEnvelope({ settings: {}, input: 1, transform: { lang: 'path', expr: 'x' }, extra: 9 })).sort(), ['input', 'settings', 'transform'], 'a fourth key dropped');
    for (const [label, v] of [['a string', 'later'], ['null', null], ['no expr', { lang: 'path' }], ['a third key', { lang: 'path', expr: 'x', z: 1 }], ['expr not a string', { lang: 'path', expr: 5 }]] as const) {
      let err: unknown;
      try { unpackEnvelope({ settings: {}, input: 1, transform: v }); } catch (e) { err = e; }
      ok(err instanceof NotAnEnvelope && (err as Error).message.includes('transform'), `${label}: NotAnEnvelope naming the key — ${(err as Error)?.message}`);
    }
  });

  test('a language module that FAILS TO LOAD in setup() does not throw there: the task that needs it fails at run() naming the language and the load error, and a task that does not still runs — the maintainer`s call at W61`s stop-and-ask', async () => {
    // Measured at the declaration: a setup() throw is a WORKER error — the task stays pending with
    // attempts 0, the pool restarts, nothing reaches the driver. So every way the worker half can
    // fail to load is remembered and thrown from run(), on the tasks that name that language.
    const LOADS: readonly [string, string, string][] = [
      ['no default compile function', NO_DEFAULT_URL, 'default compile function'],
      ['an empty URL', '', 'no worker module URL'],
      ['a module that does not parse', `data:text/javascript,${encodeURIComponent('export default function (')}`, 'did not load'],
    ];
    ok(LOADS.length >= 3 && new Set(LOADS.map(([l]) => l)).size === LOADS.length, 'three ways to fail to load, distinct');
    for (const [label, url, names] of LOADS) {
      const w = new EnvelopeWorker({ worker: INNER_URL, languages: { path: PATH_WORKER_URL, broken: url } });
      await w.setup();
      let err: unknown;
      try { await w.run({ settings: {}, input: { a: 1 }, transform: { lang: 'broken', expr: 'a' } }); } catch (e) { err = e; }
      ok(err instanceof TransformFailed && err.lang === 'broken' && err.message.includes('"broken"') && err.message.includes(names),
        `${label}: the task fails at run() with TransformFailed naming the language and why — ${(err as Error)?.message}`);
      const other = await w.run({ settings: {}, input: { a: 1 }, transform: { lang: 'path', expr: 'a' } }) as Seen;
      equal(other.input, 1, `${label}: a task in a language that DID load still runs on the same worker`);
      const plain = await w.run({ settings: {}, input: { a: 1 } }) as Seen;
      equal(plain.input, { a: 1 }, `${label}: and so does a task with no transform`);
      await w.teardown();
    }
  });

  test('run() before setup() is refused; teardown clears what setup loaded', async () => {
    const w = await fresh();
    await w.teardown();
    let err: unknown;
    try { await w.run({ settings: {}, input: 1 }); } catch (e) { err = e; }
    ok(err instanceof Error && err.message.includes('before setup()'), 'after teardown the inner worker is gone');
    const cold = new EnvelopeWorker(CFG);
    err = undefined;
    try { await cold.run({ settings: {}, input: 1, transform: { lang: 'path', expr: '$' } }); } catch (e) { err = e; }
    ok(err instanceof Error && err.message.includes('before setup()'), 'and a cold worker refuses a transformed envelope by the same clause');
  });
});

// ---------------------------------------------------------------------------------------------
// On a REAL pool. `BACKENDS` is the measurement's scope, stated: inline and threaded pools where a
// pool can load the wrapper's script, the class itself in the browser (Q261).
const IN_BROWSER = typeof (globalThis as { document?: unknown }).document !== 'undefined';
const BACKENDS: readonly string[] = IN_BROWSER ? ['class'] : ['inline', 'threaded'];
/** Which backends a real-pool case actually DROVE — the second observer of `BACKENDS` (the adequacy reader, m39). */
const DROVE = new Set<string>();

type Settled = { state: string; result?: unknown; error?: string };
/** Runs one envelope through a backend and reports how it settled — the scheduler's state on a pool, the wrapper's throw on the class. */
async function drive(backend: string, payload: unknown, optional: boolean, cfg: typeof CFG = CFG): Promise<Settled> {
  DROVE.add(backend);
  if (backend === 'class') {
    const w = await fresh(cfg);
    try { return { state: 'done', result: await w.run(payload, { taskId: 't1' }) }; } catch (e) { return { state: 'threw', error: (e as Error).message }; } finally { await w.teardown(); }
  }
  const pool = new WorkerManager(ENVELOPE_WORKER_URL, { inline: backend === 'inline', maxThreads: 1, idleTimeout: 0, config: cfg });
  const s = new FyflowScheduler({ Scorer: pool }, {});
  // The scheduler is an EventTarget whose listeners are typed by the DOM lib; the detail is read structurally.
  const on = (name: string, f: (detail: Record<string, unknown>) => void) =>
    (s as unknown as { addEventListener(n: string, l: (e: { detail: Record<string, unknown> }) => void): void }).addEventListener(name, (e) => f(e.detail));
  const settled = new Promise<Settled>((resolve) => {
    on('task.completed', (d) => resolve({ state: 'done', result: d.result }));
    on('task.failed', (d) => {
      // `task.failed` fires for a `user_action` task too (ADR 0007 rule 2): read the STATE.
      const err = d.error as { message?: string } | string | undefined;
      resolve({ state: d.state as string, error: typeof err === 'string' ? err : err?.message });
    });
  });
  try {
    s.addTask(new FyflowTask({ id: 't1', workerType: 'Scorer', payload, optional, retryPolicy: { maxRetries: 0, backoffMs: 0 } }));
    const timeout = new Promise<Settled>((resolve) => setTimeout(() => resolve({ state: 'TIMEOUT after 8 s' }), 8000));
    return await Promise.race([settled, timeout]);
  } finally {
    await s.shutdown();
  }
}

suite('W61 — a transform on a REAL pool, inline and threaded: the transformed input arrives, and a failure takes a task`s two roads', (test) => {
  test('BACKENDS is the scheduler`s TWO pool modes where a pool can load the wrapper, and the class in the browser — a membership, not a count (the adequacy reader, m39)', () => {
    // `['inline', 'threaded']` narrowed to `['inline']` left 953 unmoved, because the backends loop
    // is inside each case. The membership is stated here against the two values `WorkerManager`'s
    // `inline` option takes, and the cases below record what they DROVE for the last test to compare.
    equal([...BACKENDS].sort(), IN_BROWSER ? ['class'] : ['inline', 'threaded'], 'both modes outside the browser; the class inside it');
  });
  test(`a transformed task settles done with the inner worker having received the evaluated input — backends: ${BACKENDS.join(', ')}`, async () => {
    for (const backend of BACKENDS) {
      const r = await drive(backend, { settings: { factor: 10 }, input: { confidence: 0.9, items: ['a'] }, transform: { lang: 'path', expr: 'confidence' } }, true);
      equal(r.state, 'done', `${backend}: settled done (${JSON.stringify(r)})`);
      const seen = r.result as Seen;
      equal(seen.input, 0.9, `${backend}: the inner worker received the evaluated input`);
      equal(seen.keys, ['input', 'settings'], `${backend}: and exactly the two keys`);
      const plain = await drive(backend, { settings: { factor: 10 }, input: { confidence: 0.9, items: ['a'] } }, true);
      equal((plain.result as Seen).input, { confidence: 0.9, items: ['a'] }, `${backend}: without a transform, the value received`);
    }
  });

  test(`an evaluation failure is the TASK's failure — failed on an optional task, user_action on a non-optional one — P17 decision 5, backends: ${BACKENDS.join(', ')}`, async () => {
    for (const backend of BACKENDS) {
      const failing = { settings: {}, input: { a: 5 }, transform: { lang: 'path', expr: 'a.b' } };
      const opt = await drive(backend, failing, true);
      const req = await drive(backend, failing, false);
      ok(opt.error !== undefined && opt.error.includes('transform failed') && opt.error.includes('[P0002]'), `${backend}: the error is TransformFailed's message — ${opt.error}`);
      ok(req.error !== undefined && req.error.includes('transform failed'), `${backend}: on the non-optional task too — ${req.error}`);
      if (backend === 'class') {
        equal([opt.state, req.state], ['threw', 'threw'], `${backend}: the wrapper THROWS from run(); which road the scheduler takes is the pool backends' half`);
      } else {
        equal(opt.state, 'failed', `${backend}: optional — failed`);
        equal(req.state, 'user_action', `${backend}: non-optional — parked as user_action, the road any worker throw takes`);
      }
    }
  });

  test(`a language module that does not LOAD is the TASK's failure too, and only for the tasks that name it — the stop-and-ask's road, on real pools where they load; backends: ${BACKENDS.join(', ')}`, async () => {
    // With a throw in setup() instead, the measured shape is a task pending forever with attempts 0
    // and the pool restarting: a run that never completes and reports nothing. This case is the
    // one that fails if the wrapper goes back to throwing there.
    const cfg = { worker: INNER_URL, languages: { path: PATH_WORKER_URL, broken: `data:text/javascript,${encodeURIComponent('export default function (')}` } };
    for (const backend of BACKENDS) {
      const bad = await drive(backend, { settings: {}, input: { a: 1 }, transform: { lang: 'broken', expr: 'a' } }, true, cfg);
      ok(bad.state !== 'done' && !bad.state.startsWith('TIMEOUT') && bad.error !== undefined && bad.error.includes('"broken"') && bad.error.includes('did not load'),
        `${backend}: the task in the broken language settled as a FAILURE naming the language and the load error, not as a hang — ${JSON.stringify(bad)}`);
      if (backend !== 'class') equal(bad.state, 'failed', `${backend}: failed (optional)`);
      const good = await drive(backend, { settings: {}, input: { a: 1 }, transform: { lang: 'path', expr: 'a' } }, true, cfg);
      equal([good.state, (good.result as Seen).input], ['done', 1], `${backend}: a task in the language that DID load runs on the same pool`);
      const plain = await drive(backend, { settings: {}, input: { a: 1 } }, true, cfg);
      equal([plain.state, (plain.result as Seen).input], ['done', { a: 1 }], `${backend}: and a task with no transform`);
    }
  });

  test('every backend BACKENDS names was actually driven by the cases above — the loop ran over the whole list', () => {
    equal([...DROVE].sort(), [...BACKENDS].sort(), 'the backends driven are exactly the backends declared');
  });
});

// ---------------------------------------------------------------------------------------------
// W109 — the NO-INNER arm: a type that only TRANSFORMS, on a REAL pool.
// ADR 0075 rules 2 and 4. `transformOnly: true` is what the pool config carries for such a type and
// is what `setup()` keys off; `worker` is absent. The two are mutually exclusive and the
// contradiction is refused.
//
// **Obligation (e) lives here**, and the item's own "What to be careful of" 5 names the two probes:
// what happens when the no-inner road is taken by a pool that HAS an inner worker, and the reverse.
// Both are cases below, because a flag read off the wrong field is exactly how a pool runs the wrong
// thing in silence — `inner === null` is also the state BEFORE setup and AFTER teardown, which
// `run()` has refused by name since v0.17.
const ONLY_CFG = { transformOnly: true as const, languages: { path: PATH_WORKER_URL } };
/**
 * **W109's OWN record of what it drove** — the adequacy reader (F6). `DROVE` is module-level and the
 * `[...DROVE] === [...BACKENDS]` case lives in the W61 suite, whose cases run BOTH modes before these
 * do, so narrowing this suite's loop to `BACKENDS.slice(0, 1)` cost ZERO: W61's clause was satisfied
 * whatever W109 drove. That matters more here than it did at W61, because THREADED is the only road on
 * which the pool config crosses a `structuredClone` into a worker thread — which is the reason
 * `EnvelopePoolConfig.worker`'s own doc comment gives for omitting the key rather than setting it
 * `undefined`.
 */
const DROVE_109 = new Set<string>();
const drive109 = async (backend: string, payload: unknown, optional: boolean): Promise<Settled> => {
  DROVE_109.add(backend);
  return await drive(backend, payload, optional, ONLY_CFG as never);
};

suite('W109 — a type that only TRANSFORMS: the transform IS the task, on a real pool and on the class', (test) => {
  test(`the transform's own result is what the task returns — no inner worker, no envelope around it; backends: ${BACKENDS.join(', ')}`, async () => {
    for (const backend of BACKENDS) {
      const r = await drive109(backend, { settings: {}, input: { confidence: 0.9, items: ['a'] }, transform: { lang: 'path', expr: 'confidence' } }, true);
      equal(r.state, 'done', `${backend}: settled done (${JSON.stringify(r)})`);
      // **The RESULT is the evaluation and NOT `{ settings, input }`** — the discriminating assertion.
      // With an inner worker the same payload returns a `Seen`; here it returns the value itself, so
      // an arm that fell through to the inner road would fail on the SHAPE and not only on a count.
      equal(r.result, 0.9, `${backend}: the task's result IS the transform's result`);
      const deeper = await drive109(backend, { settings: { factor: 3 }, input: { a: { b: [1, 2] } }, transform: { lang: 'path', expr: 'a.b' } }, true);
      equal(deeper.result, [1, 2], `${backend}: and whatever the expression yields, structure included`);
      const fromSettings = await drive109(backend, { settings: { factor: 7 }, input: { ignored: true }, transform: { lang: 'path', expr: '$settings.factor' } }, true);
      equal(fromSettings.result, 7, `${backend}: $settings is bound here too — ADR 0075 rule 3's \`settings\`, P26 decision 5 (c)`);
    }
  });

  test(`a transform that FAILS is still the TASK's failure, by both of P17 decision 5's roads; backends: ${BACKENDS.join(', ')}`, async () => {
    for (const backend of BACKENDS) {
      const failing = { settings: {}, input: { a: 5 }, transform: { lang: 'path', expr: 'a.b' } };
      const opt = await drive109(backend, failing, true);
      const req = await drive109(backend, failing, false);
      ok(opt.error !== undefined && opt.error.includes('transform failed') && opt.error.includes('[P0002]'),
        `${backend}: TransformFailed's message, unchanged by there being no inner worker — ${opt.error}`);
      if (backend === 'class') {
        equal([opt.state, req.state], ['threw', 'threw'], `${backend}: the wrapper throws from run()`);
      } else {
        equal([opt.state, req.state], ['failed', 'user_action'], `${backend}: optional failed, non-optional parked — the same two roads`);
      }
    }
  });

  test(`an envelope with NO transform is refused by name — FD-V46's run-time twin, which a valid document cannot reach; backends: ${BACKENDS.join(', ')}`, async () => {
    for (const backend of BACKENDS) {
      const r = await drive109(backend, { settings: {}, input: { a: 1 } }, true);
      const msg = r.error ?? '';
      ok(msg.includes('names no worker') && msg.includes('must carry a transform'),
        `${backend}: the refusal says what is missing and why there is nothing else to do — ${msg || JSON.stringify(r)}`);
      ok(msg.includes('FD-V46'), `${backend}: and names the rule that makes this unreachable from a valid document — ${msg}`);
    }
  });

  // ---- obligation (e): the WIRING of the arm, from both sides ----
  test('the arm is keyed off `transformOnly` and NOT off the absence of `worker` — an empty config is still the refusal it was', async () => {
    // **The probe the item's careful-point 5 asks for, second direction.** If the arm keyed off
    // `!('worker' in cfg)` then `{}` — a malformed pool config — would become a transform-only pool
    // and every such defect would silently return its input. Measured here as the refusal it is.
    let err = '';
    try { const w = new EnvelopeWorker({} as never); await w.setup(); } catch (e) { err = (e as Error).message; }
    ok(err.includes('names no worker URL'), `an EMPTY pool config is a malformed config, not a transform-only one — ${err || '(setup returned)'}`);
    for (const bad of [{ worker: '' }, { worker: 5 as never }, { worker: null as never }]) {
      let e2 = '';
      try { const w = new EnvelopeWorker(bad as never); await w.setup(); } catch (e) { e2 = (e as Error).message; }
      ok(e2.includes('names no worker URL'), `${JSON.stringify(bad)} is refused, not read as a shape — ${e2 || '(setup returned)'}`);
    }
  });

  test('the two keys are MUTUALLY EXCLUSIVE: a config carrying both is refused rather than resolved', async () => {
    // **Obligation (e), first direction**: the no-inner road taken by a config that HAS an inner
    // worker. Silently preferring either key is how a pool runs the wrong one of the two things its
    // config names, so the contradiction is a refusal.
    let err = '';
    try { const w = new EnvelopeWorker({ transformOnly: true, worker: INNER_URL } as never); await w.setup(); } catch (e) { err = (e as Error).message; }
    ok(err.includes('transformOnly') && err.includes('either has an inner worker or only transforms'),
      `both keys is a refusal naming both — ${err || '(setup returned)'}`);
  });

  test('run() before setup() and after teardown() are STILL refused on a transform-only pool — the lifecycle states the arm must not absorb', async () => {
    // The null `inner` is reachable three ways and only ONE of them is this arm. Before `setup()` the
    // flag is false, so the refusal stands; `teardown()` resets it, so it stands again afterwards.
    const before = new EnvelopeWorker(ONLY_CFG as never);
    let e1 = '';
    try { await before.run({ settings: {}, input: 1, transform: { lang: 'path', expr: '$' } }); } catch (e) { e1 = (e as Error).message; }
    ok(e1.includes('run() before setup()'), `before setup: the v0.17 refusal, not the arm — ${e1 || '(ran)'}`);

    const w = new EnvelopeWorker(ONLY_CFG as never);
    await w.setup();
    equal(await w.run({ settings: {}, input: { a: 2 }, transform: { lang: 'path', expr: 'a' } }), 2, 'and after setup it takes the arm');
    await w.teardown();
    let e2 = '';
    try { await w.run({ settings: {}, input: { a: 2 }, transform: { lang: 'path', expr: 'a' } }); } catch (e) { e2 = (e as Error).message; }
    ok(e2.includes('run() before setup()'), `after teardown: refused again, because teardown resets the flag — ${e2 || '(ran)'}`);
  });

  test('every backend BACKENDS names was driven by THIS suite — a per-suite set, because the module-level one is satisfied by W61`s cases', () => {
    equal([...DROVE_109].sort(), [...BACKENDS].sort(), 'the backends W109 drove are exactly the backends declared');
  });

  test('the DISCRIMINATING PAIR: one payload, two configs, and what makes them differ is asserted', () => {
    // Whatever makes a pair differ is itself a claim (rule 8's requirement on the set). The pair is
    // `CFG` against `ONLY_CFG`, and what it turns on is exactly one key each: `worker` against
    // `transformOnly`. Collapsing it — giving ONLY_CFG a worker, or CFG none — must be a failure and
    // not a smaller suite, which the two refusal cases above are.
    equal(Object.keys(CFG).sort(), ['languages', 'worker'], 'the inner-worker config names a worker and no marker');
    equal(Object.keys(ONLY_CFG).sort(), ['languages', 'transformOnly'], 'the transform-only config names the marker and no worker');
    equal((ONLY_CFG as { worker?: unknown }).worker, undefined, 'and the two never both name a worker — the refusal above is what holds that');
  });
});
