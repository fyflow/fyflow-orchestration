/**
 * **The JSONata adapter — the conformance suite run against it, and what this adapter claims of
 * its own** — [W62](../../doc/work-items/w62-the-jsonata-adapter.md),
 * [ADR 0052](../../doc/decisions/0052-a-second-dependency-is-declared-where-its-one-sub-path-is-reached.md),
 * [P17](../../doc/plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md)
 * decisions 2, 3, 6, 7 and 10, facts 2-5 re-taken as assertions. The conformance suite is W61's,
 * changed ONCE here — the optional `workerHalf` handle, ADR 0052 rule 8, handed at the probes below —
 * with probes written from JSONata's documented semantics and P17's measured facts, never from a run
 * of this adapter.
 *
 * **What the browser can and cannot run, stated.** In the browser bundle `import.meta.url` is the
 * bundle's own URL ([Q261](../../doc/questions/q261.md)), so `jsonata.worker` there names a module
 * with no default export and nothing can `import()` the worker half by URL — not the conformance
 * suite, not the envelope worker. The registry half, the worker half reached as this module's
 * DEFAULT EXPORT, the shadows, the bindings and the engine itself all run in all five runtimes;
 * the URL-loading claims and the real pools are Node's and Deno's, and every case says which.
 */
import { equal, ok, suite } from '../harness.ts';
import { FyflowScheduler, FyflowTask, WorkerManager } from 'fyflow-scheduler';
import { ENVELOPE_WORKER_URL, EnvelopeWorker } from '../../src/scheduler/index.ts';
import { adapterConformance, type AdapterProbes } from '../scheduler/adapter-conformance.ts';
import compileExpression, { compile, jsonata, UNBOUND_FUNCTIONS, type JsonataError } from '../../src/jsonata/index.ts';

const IN_BROWSER = typeof (globalThis as { document?: unknown }).document !== 'undefined';

/** `JP-R12`'s record over three branches, one of which returned no `score` — P17 fact 5's fixture. */
const RECORD = { '0': { confidence: 0.4, score: 40 }, '1': { seen: 1, word: null }, '2': { confidence: 0.2, score: 20 } };
const ITEMS = { items: [{ word: 'a', confidence: 0.9 }, { word: 'b', confidence: 0.2 }, { word: 'c', confidence: 0.7 }] };

/** Every expected value from JSONata's documented semantics and P17 facts 4 and 5, never from output. */
export const JSONATA_PROBES: AdapterProbes = {
  accepted: ['$', '$sum([*.score])', '*.score', '$.confidence', '$settings.factor * $.value', 'items[confidence > 0.5].word', '{ "total": $sum([*.score]), "n": $count($keys($)) }', '$uppercase(word)'],
  refused: ['$sum(*.score', '1 +', '[1, 2', '{ "a": 1', 'a.', '(', ')', '$sum([1,2]))', 'a b c'],
  nondeterministic: ['$now()', '$millis()', '$random()'],
  cases: [
    // P17 fact 5, the three arities: an array at two matches, the scalar at one, and the empty join.
    { expr: '$sum([*.score])', input: RECORD, settings: {}, expected: 60 },
    { expr: '*.score', input: RECORD, settings: {}, expected: [40, 20] },
    { expr: '*.score', input: { '0': { score: 7 }, '1': {} }, settings: {}, expected: 7 },
    { expr: '[*.score]', input: { '0': { score: 7 }, '1': {} }, settings: {}, expected: [7] },
    { expr: '$sum([*.score])', input: {}, settings: {}, expected: 0 },
    // `$` is the input (decision 7) — a map item's own field, a filter over `needs`' composition.
    { expr: '$.confidence', input: { word: 'bb', confidence: 0.2 }, settings: {}, expected: 0.2 },
    { expr: 'items[confidence > 0.5].word', input: ITEMS, settings: {}, expected: ['a', 'c'] },
    { expr: '{ "total": $sum([*.score]), "n": $count($keys($)) }', input: RECORD, settings: {}, expected: { total: 60, n: 3 } },
    // `$settings` is the binding (decision 7).
    { expr: '$settings.factor * $.value', input: { value: 3 }, settings: { factor: 10 }, expected: 30 },
    { expr: '$settings', input: { ignored: true }, settings: { a: 1, b: [2] }, expected: { a: 1, b: [2] } },
    { expr: '$', input: { a: 1 }, settings: {}, expected: { a: 1 } },
  ],
  settingsPair: { expr: '$.value * $settings.factor', input: { value: 3 }, a: { factor: 1 }, b: { factor: 2 }, expectedA: 3, expectedB: 6 },
  typeError: { expr: '$sum("a")', input: {}, settings: {}, code: 'T0412' },
  undefinedCase: { expr: 'input.scroe', input: { input: { score: 3 } }, settings: {} },
  compileError: { expr: '$sum(*.score', code: 'S0203', position: 12 },
  // The handle for a runtime that cannot import the URL (the browser bundle, Q261); Node and Deno
  // import the URL and assert its default export IS this function.
  workerHalf: compileExpression,
};

adapterConformance('jsonata (fyflow-orchestration/jsonata)', jsonata, JSONATA_PROBES);

async function rejection(expr: string, input: unknown = {}, settings: Record<string, unknown> = {}): Promise<JsonataError | undefined> {
  try { await compileExpression(expr).evaluate(input, settings); return undefined; } catch (e) { return e as JsonataError; }
}
/** The expression that exercises one unbound name: a call, with an argument where the function needs one. */
const exprFor = (name: string): string => name === 'shuffle' ? '$shuffle([1, 2, 3, 4, 5, 6, 7, 8])' : name === 'eval' ? '$eval("1 + 1")' : `$${name}()`;
/** Own non-index keys of an array, or own keys of an object — what a deep-equal over own keys sees. */
const ownKeys = (v: unknown): string[] => Array.isArray(v) ? Object.keys(v).filter((k) => !/^\d+$/.test(k)) : Object.keys((v ?? {}) as object);

suite('W62 — the JSONata adapter: one module, five names unbound, JSONata`s errors as Errors', (test) => {
  test('the adapter is { compile, worker } with NO check — P18`s hook absent, not forbidden — and compile is this module`s registry half', () => {
    ok(jsonata.compile === compile, 'the registry half is this module`s compile');
    ok(typeof jsonata.worker === 'string' && jsonata.worker.length > 0, 'the worker half is a URL');
    ok(!('check' in jsonata), 'no check hook (P17 decision 10)');
    equal(Object.keys(jsonata).sort(), ['compile', 'worker'], 'exactly the two halves');
  });

  test(`BOTH halves are ONE module: the worker URL is the adapter module itself and its default export is the worker half — Q264 closed for this adapter (${IN_BROWSER ? 'in the browser the URL is the BUNDLE, Q261: stated, not asserted' : 'asserted by importing the URL'})`, async () => {
    if (IN_BROWSER) {
      // Q261: esbuild leaves `import.meta.url` as the bundle's URL, so the worker half cannot be
      // reached by URL from inside a bundle — the same limit the envelope worker has there.
      ok(!jsonata.worker.endsWith('/src/jsonata/index.ts'), `in the bundle the worker URL is the bundle's own: ${jsonata.worker}`);
      return;
    }
    ok(jsonata.worker.endsWith('/src/jsonata/index.ts'), `the worker half is this module: ${jsonata.worker}`);
    const mod = (await import(jsonata.worker)) as { default?: unknown; compile?: unknown; jsonata?: unknown };
    ok(mod.default === compileExpression, 'the URL`s default export IS this module`s worker half — the same function, not a copy');
    ok(mod.compile === compile && mod.jsonata === jsonata, 'and the URL`s named exports are the registry half and the adapter — one module, one engine');
  });

  test('the five names are unbound BY NAME, each separately: $now, $millis, $random (every adapter`s three), $shuffle (JSONata`s own fourth — P17 prediction 4 REVERSED) and $eval (Q265, the maintainer`s answer)', async () => {
    equal([...UNBOUND_FUNCTIONS].sort(), ['eval', 'millis', 'now', 'random', 'shuffle'], 'the list, by name');
    let asked = 0;
    for (const name of UNBOUND_FUNCTIONS) {
      asked++;
      const expr = exprFor(name);
      const err = await rejection(expr);
      ok(err instanceof Error, `${expr} rejects`);
      equal(err?.code, 'UNBOUND', `${expr}: the code names the reason`);
      ok(err?.message.includes(`$${name}()`), `${expr}: the message names the function — ${err?.message}`);
    }
    // The loop's own count — W61's m50 one suite over: sliced to one name it passed (rule 8's d8).
    equal(asked, 5, 'every one of the five was asked');
  });

  test('the by-name check catches every unbound name, and the two-evaluation comparison MAY not — P17 fact 3 asserted as a PAIR, so the suite says which check caught it', async () => {
    // The raw engine, unshadowed: this module's default export shadows, so the "evaluate twice"
    // detector is run through the engine directly — the check P17 decision 6 calls necessary and
    // never sufficient.
    const engine = (await import('jsonata')).default;
    const byName: string[] = [];
    const byTwice: string[] = [];
    for (const name of UNBOUND_FUNCTIONS) {
      const expr = exprFor(name);
      if ((await rejection(expr))?.code === 'UNBOUND') byName.push(name);
      const raw = engine(expr);
      const a = JSON.stringify(await raw.evaluate({}));
      const b = JSON.stringify(await raw.evaluate({}));
      if (a !== b) byTwice.push(name);
    }
    equal(byName.sort(), [...UNBOUND_FUNCTIONS].sort(), 'BY NAME catches all five, every time');
    // `$millis()` returned the same value twice on one machine (P17 fact 3, and again at W62's
    // declaration in BOTH runtimes): the detector's verdict is reported, not required.
    ok(byTwice.includes('random') && byTwice.includes('shuffle'), `evaluating twice sees $random and $shuffle differ (saw: ${byTwice.join(', ') || 'none'})`);
    ok(byTwice.length <= byName.length && !byTwice.includes('eval'), 'and the detector never catches a name the list does not — $eval is deterministic and unbound for another reason (Q265); the pair is stated as (by name: all) against (twice: some)');
  });

  test('the shadow is PER compiled expression — a fresh compile is unaffected — and $eval is itself unbound, so the outer door is the one closed (P17 fact 3 re-measured; Q265 answered)', async () => {
    // Bound, `$eval("$now()")` rejected with the engine's D3121 wrapping the shadow's message — the
    // shadow REACHES $eval (P17 fact 3, measured again at W62's declaration). Unbound, the outer
    // call is refused before the inner text is ever compiled.
    const viaEval = await rejection('$eval("$now()")');
    equal(viaEval?.code, 'UNBOUND', `$eval("$now()") is refused at $eval itself: ${viaEval?.message}`);
    ok(viaEval?.message.includes('$eval()') === true, 'naming $eval, not $now — the outer door is the one closed');
    const engine = (await import('jsonata')).default;
    equal(typeof (await engine('$now()').evaluate({})), 'string', 'a fresh, unshadowed compile of the same text still returns — the shadow is not global');
  });

  test('$eval is UNBOUND — Q265, the maintainer`s answer at W62: bound, a syntax error inside it landed as the engine`s D3120 at EVALUATION, a task failure FD-V36 never saw', async () => {
    equal(compile('$eval("$sum(")'), undefined, 'the registry half ACCEPTS the outer expression — the inner text is a string to the parser, which is the whole hazard');
    const err = await rejection('$eval("$sum(")');
    equal(err?.code, 'UNBOUND', `unbound, the door is closed before the inner text is compiled: ${err?.message}`);
    // The measurement the decision was priced on, kept as a fact about the ENGINE: unshadowed,
    // the same expression is D3120 at evaluation.
    const engine = (await import('jsonata')).default;
    let raw: { code?: string } | undefined;
    try { await engine('$eval("$sum(")').evaluate({}); } catch (e) { raw = e as { code?: string }; }
    equal(raw?.code, 'D3120', 'the raw engine: a run-time syntax error inside $eval is D3120 — what a consumer would have met');
    equal(await compileExpression('$lookup($, "x")').evaluate({ x: 9 }, {}), 9, 'and what a consumer keeps: $lookup reads a computed key without recompiling text');
  });

  test('JSONata throws PLAIN OBJECTS; both halves re-throw them as Errors with code, position and message kept — what FD-V36 and TransformFailed read', async () => {
    let raw: unknown;
    const engine = (await import('jsonata')).default;
    try { engine('$sum(*.score'); } catch (e) { raw = e; }
    ok(!(raw instanceof Error) && typeof raw === 'object', 'the engine`s own throw is not an Error instance (measured, both runtimes)');
    let reg: JsonataError | undefined;
    try { compile('$sum(*.score'); } catch (e) { reg = e as JsonataError; }
    ok(reg instanceof Error, 'the registry half throws an Error');
    equal([reg?.code, reg?.position, reg?.message], ['S0203', 12, (raw as { message: string }).message], 'carrying the engine`s code, position and message unchanged');
    // ADR 0052 rule 6 names FOUR carried fields; the adequacy reader (m01) dropped two for zero.
    const rawObj = raw as { token?: unknown; value?: unknown };
    equal([reg?.token, 'value' in (reg ?? {})], [rawObj.token, 'value' in rawObj], 'and the engine`s token and value too — every field rule 6 names, compared to the raw throw');
    ok(reg?.token !== undefined, 'the token is a real field on this throw, so the comparison above is not two undefineds');
    let wk: JsonataError | undefined;
    try { compileExpression('$sum(*.score'); } catch (e) { wk = e as JsonataError; }
    equal([wk instanceof Error, wk?.code, wk?.position], [true, 'S0203', 12], 'and so does the worker half, with the same fields');
    const ev = await rejection('$sum("a")');
    equal([ev instanceof Error, ev?.code, typeof ev?.message], [true, 'T0412', 'string'], 'an evaluation rejection too — T0412 named on an Error');
    const plus = await rejection('1 + "a"');
    equal(plus?.code, 'T2002', 'P17 fact 4`s loud half: 1 + "a" is T2002');
  });

  test('the worker half hands out PLAIN values: JSONata`s sequence markers are stripped at every depth — the raw engine keeps them, and structuredClone would carry them to a thread (a discriminating pair)', async () => {
    const engine = (await import('jsonata')).default;
    const raw = await engine('*.score').evaluate(RECORD) as unknown[];
    equal(ownKeys(raw), ['sequence'], 'the RAW engine`s path result is a sequence — an array with an own `sequence` key');
    equal(ownKeys(structuredClone(raw)), ['sequence'], 'which structuredClone KEEPS, so a threaded worker would receive it');
    const rawNested = await engine('{ "scores": *.score }').evaluate(RECORD) as { scores: unknown };
    equal(ownKeys(rawNested.scores), ['sequence'], 'and nested inside a constructed object too');
    const adapted = await compileExpression('*.score').evaluate(RECORD, {});
    equal([ownKeys(adapted), adapted], [[], [40, 20]], 'through the adapter: a plain array, the same elements');
    const nested = await compileExpression('{ "scores": *.score, "kept": *.score[] }').evaluate({ '0': { score: 7 } }, {}) as { scores: unknown; kept: unknown };
    equal([ownKeys(nested.scores), ownKeys(nested.kept), nested], [[], [], { scores: 7, kept: [7] }], 'nested, and the `[]`-kept singleton`s keepSingleton marker too');
    const same = { a: [1, 2], b: { c: 3 } };
    ok((await compileExpression('$').evaluate(same, {})) === same, 'a value with nothing marked is returned as it is — the identity allocates nothing');
    ok((await compileExpression('$.b').evaluate(same, {})) === same.b, 'and an UNMARKED substructure returned by reference is that object, not a copy — plain() returns the original where nothing changed (the adequacy reader, m03)');
    // ARRAY-ELEMENT depth (the adequacy reader, m02): a lambda over `$$` builds a sequence INSIDE a
    // sequence, and a constructed object inside a sequence carries a marked value — measured on the
    // raw engine, both directions the object-depth case above does not reach.
    const rawDeep = await engine('$map([1, 2], function($x) { $$.*.score })').evaluate(RECORD) as unknown[][];
    equal([ownKeys(rawDeep), ownKeys(rawDeep[0])], [['sequence'], ['sequence']], 'the RAW engine marks the outer sequence AND each element');
    const deep = await compileExpression('$map([1, 2], function($x) { $$.*.score })').evaluate(RECORD, {}) as unknown[][];
    equal([ownKeys(deep), ownKeys(deep[0]), ownKeys(deep[1]), deep], [[], [], [], [[40, 20], [40, 20]]], 'through the adapter: plain at both depths');
    const objs = await compileExpression('*.{ "all": $$.*.score }').evaluate(RECORD, {}) as { all: unknown }[];
    equal([ownKeys(objs), objs.map((o) => ownKeys(o.all))], [[], [[], [], []]], 'and an object inside a sequence carrying a marked value: plain at every depth');
  });

  test('a path typo is SILENT: undefined, never a rejection — P17 fact 4`s silent half, the wrapper hands it on', async () => {
    equal(await compileExpression('input.scroe').evaluate({ input: { score: 3 } }, {}), undefined, 'undefined');
    equal(await compileExpression('$').evaluate(undefined, {}), undefined, 'and an undefined input is an undefined `$`');
  });
});

// ---- through the envelope worker, and on REAL pools — Node and Deno, where a URL can be imported ----
/**
 * Reports what it received — and TWO things about where it ran (the adequacy reader, m21: the
 * threaded half of "inline and threaded" was bound by the one `inline: backend === 'inline'`
 * expression). `sameRealm` reads a marker the test sets on ITS OWN global: an inline worker shares
 * the realm and sees it, a thread is a fresh realm and does not. `inputOwnKeys` is what a deep-equal
 * would see on the input AFTER the thread's clone — the marker claim's thread half.
 */
const INNER_SRC = `export default class Inner { async run(p) { return { keys: Object.keys(p).sort(), settings: p.settings, input: p.input, sameRealm: typeof globalThis.__W62_MARK__ !== 'undefined', inputOwnKeys: Array.isArray(p.input) ? Object.keys(p.input).filter((k) => !/^[0-9]+$/.test(k)) : null }; } }`;
const INNER_URL = `data:text/javascript,${encodeURIComponent(INNER_SRC)}`;
const CFG = { worker: INNER_URL, languages: { jsonata: jsonata.worker } };
type Seen = { keys: string[]; settings: unknown; input: unknown; sameRealm: boolean; inputOwnKeys: string[] | null };
type Settled = { state: string; result?: unknown; error?: string };

/** The scheduler's two pool modes, where a pool can load the wrapper's script and the wrapper can import the adapter's URL; the browser can do neither (Q261). */
const BACKENDS: readonly string[] = IN_BROWSER ? [] : ['inline', 'threaded'];
const DROVE = new Set<string>();

async function drive(backend: string, payload: unknown, optional: boolean): Promise<Settled> {
  DROVE.add(backend);
  const pool = new WorkerManager(ENVELOPE_WORKER_URL, { inline: backend === 'inline', maxThreads: 1, idleTimeout: 0, config: CFG });
  const s = new FyflowScheduler({ Scorer: pool }, {});
  const on = (name: string, f: (detail: Record<string, unknown>) => void) =>
    (s as unknown as { addEventListener(n: string, l: (e: { detail: Record<string, unknown> }) => void): void }).addEventListener(name, (e) => f(e.detail));
  const settled = new Promise<Settled>((resolve) => {
    on('task.completed', (d) => resolve({ state: 'done', result: d.result }));
    on('task.failed', (d) => {
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

suite('W62 — the JSONata adapter through the envelope worker and on real pools, inline and threaded', (test) => {
  test(`the wrapper loads the adapter by its URL, evaluates $sum([*.score]) over a join\`s collection, binds $settings, and fails the task with the engine\`s code — ${IN_BROWSER ? 'the browser cannot import the worker URL (Q261): stated, nothing runs' : `the class, then backends: ${BACKENDS.join(', ')}`}`, async () => {
    if (IN_BROWSER) { ok(BACKENDS.length === 0, 'stated: nothing runs here'); return; }
    const w = new EnvelopeWorker(CFG);
    await w.setup();
    try {
      const reduced = await w.run({ settings: {}, input: RECORD, transform: { lang: 'jsonata', expr: '$sum([*.score])' } }) as Seen;
      equal([reduced.input, reduced.keys], [60, ['input', 'settings']], 'the class: the inner worker receives the reduction, and exactly two keys');
      const bound = await w.run({ settings: { factor: 10 }, input: { value: 4 }, transform: { lang: 'jsonata', expr: '$.value * $settings.factor' } }) as Seen;
      equal(bound.input, 40, 'the class: $settings is the node`s settings');
      let failed: { code?: string; message?: string } | undefined;
      try { await w.run({ settings: {}, input: {}, transform: { lang: 'jsonata', expr: '$sum("a")' } }); } catch (e) { failed = e as { code?: string; message?: string }; }
      equal(failed?.code, 'T0412', `the class: TransformFailed carries the engine's code — ${failed?.message}`);
      ok(failed?.message?.includes('[T0412]') === true && !failed.message.includes('[object Object]'), 'and the message is the engine`s, not "[object Object]" — the plain object was re-thrown as an Error');
    } finally { await w.teardown(); }
    (globalThis as Record<string, unknown>).__W62_MARK__ = 1;
    for (const backend of BACKENDS) {
      const r = await drive(backend, { settings: { factor: 1 }, input: RECORD, transform: { lang: 'jsonata', expr: '$sum([*.score])' } }, true);
      equal([r.state, (r.result as Seen).input], ['done', 60], `${backend}: settled done with the reduced input (${JSON.stringify(r)})`);
      // The second observer of the backend: an inline worker shares this realm, a thread does not.
      equal((r.result as Seen).sameRealm, backend === 'inline', `${backend}: the worker ran ${backend === 'inline' ? 'in this realm' : 'in a fresh realm — a real thread'}`);
      const marked = await drive(backend, { settings: {}, input: RECORD, transform: { lang: 'jsonata', expr: '*.score' } }, true);
      equal([(marked.result as Seen).input, (marked.result as Seen).inputOwnKeys], [[40, 20], []], `${backend}: a sequence result arrives as a PLAIN array — the marker claim's ${backend === 'threaded' ? 'thread' : 'in-realm'} half`);
      const bad = await drive(backend, { settings: {}, input: {}, transform: { lang: 'jsonata', expr: '$sum("a")' } }, false);
      equal(bad.state, 'user_action', `${backend}: a T0412 on a non-optional task is parked as user_action — the road any worker throw takes`);
      ok(bad.error?.includes('[T0412]') === true, `${backend}: naming the engine's code — ${bad.error}`);
      const one = await drive(backend, { settings: {}, input: { '0': { score: 7 }, '1': {} }, transform: { lang: 'jsonata', expr: '*.score' } }, true);
      equal((one.result as Seen).input, 7, `${backend}: arity one is the SCALAR — P17 fact 5 through a real pool`);
    }
  });
  test('BACKENDS is the scheduler`s TWO pool modes outside the browser and nothing inside it — a membership, not a count — and every backend named was driven', () => {
    // Narrowed to `['inline']` with `DROVE` compared to it alone, the pair agrees and the case
    // count is unmoved (W61's m39, reproduced while writing this item's own probes): the list is
    // held to the two values `WorkerManager`'s `inline` option takes.
    equal([...BACKENDS].sort(), IN_BROWSER ? [] : ['inline', 'threaded'], 'both modes outside the browser; none inside it (Q261)');
    equal([...DROVE].sort(), [...BACKENDS].sort(), 'driven equals declared');
  });
});
