/**
 * **P17 prediction 4's probe: the engine's function table WALKED, every built-in evaluated twice on
 * one input, and the names whose two evaluations differ compared BOTH WAYS to what the adapter
 * unbinds** — [W62](../../doc/work-items/w62-the-jsonata-adapter.md). The prediction said the three
 * names taken from the documentation were the only nondeterminism; **it REVERSED**: `$shuffle`
 * draws from `Math.random()`, and this walk is what found it — from the source's `staticFrame.bind`
 * list, before the probe below ever ran.
 *
 * **Where the table comes from, and where it cannot.** JSONata exposes no reflection over its
 * static frame, so the table is the engine's SOURCE: every `staticFrame.bind('<name>', …)` in
 * `node_modules/jsonata/jsonata.js`, plus the two it binds per compiled expression (`now`,
 * `millis`). Node and Deno read that file and hold `TABLE` to it both ways; **the browser cannot
 * read a file** and walks `TABLE` alone, checking each name is bound at run time — a subset check
 * where the other two runtimes have the equality. The case says which it ran.
 *
 * **What "evaluated twice on one input" means here, stated because it is the whole measurement.**
 * A built-in needs arguments; this walk calls each name over a fixed set of argument shapes drawn
 * from ONE input — values, pictures, a regex and lambdas, so the higher-order built-ins are reached
 * too — evaluates every shape that does not throw twice with a 3 ms gap between (so a millisecond
 * clock differs), and records the name if any shape's two results differ. A name that throws on
 * every shape, or returns nothing on every shape, is *unobservable by this walk* and is listed, not
 * silently passed: `$error`, because throwing is what it does, and `$assert`, which returns nothing
 * on success — 61 of 63 observed with a defined value.
 */
import { equal, ok, readText, suite } from '../harness.ts';
import { UNBOUND_FUNCTIONS } from '../../src/jsonata/index.ts';

const IN_BROWSER = typeof (globalThis as { document?: unknown }).document !== 'undefined';
/** A SECOND reading of the same fact: the corpus is inlined only into the browser bundle (the adequacy reader, m07 — the source equality below was guarded by a flag this file computed alone). */
const CORPUS_INLINED = typeof (globalThis as { __FYFLOW_CORPUS__?: unknown }).__FYFLOW_CORPUS__ !== 'undefined';

/** JSONata 2.2.2's static frame, as its source binds it, plus `now` and `millis` bound per compiled expression. Held to the source in Node and Deno. */
export const TABLE: readonly string[] = [
  'abs', 'append', 'assert', 'average', 'boolean', 'ceil', 'clone', 'contains', 'count', 'decodeUrl', 'decodeUrlComponent',
  'distinct', 'each', 'encodeUrl', 'encodeUrlComponent', 'error', 'eval', 'exists', 'filter', 'floor', 'formatBase',
  'formatInteger', 'formatNumber', 'fromMillis', 'join', 'keys', 'length', 'lookup', 'lowercase', 'map', 'match', 'max',
  'merge', 'min', 'not', 'number', 'pad', 'parseInteger', 'power', 'random', 'reduce', 'replace', 'reverse', 'round',
  'shuffle', 'sift', 'single', 'sort', 'split', 'spread', 'sqrt', 'string', 'substring', 'substringAfter', 'substringBefore',
  'sum', 'toMillis', 'trim', 'type', 'uppercase', 'zip',
  'now', 'millis',
];

/** ONE input, and the argument shapes each name is tried over. `a` has ten entries so a shuffle cannot coincide twice by chance. */
const INPUT = { a: [3, 1, 4, 1, 5, 9, 2, 6, 5, 8], s: 'Hello World', n: 4.5, o: { k: 1, j: [2] }, b: true, t: '2020-01-02T03:04:05.006Z' };
const SHAPES = [
  '()', '($)', '($.a)', '($.s)', '($.n)', '($.o)', '($.b)', '($.t)', '($.s, $.s)', '($.a, $.a)', '($.s, 2)', '($.n, 2)', '($.o, $.s)',
  '($.s, "l", "L")', '($.s, /o/)', '($.n, "0.00")', '($.n, "w")', '($.s, "w")', '($.s, "[Y]")', '("1 + 1")', '(false)', '("boom")',
  '($.a, function($x){$x > 2})', '($.a, function($x){$x * 2})', '($.a, function($x, $y){$x + $y})', '($.o, function($v){$v})',
  '($.o, "k")',
];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** A JSONata function VALUE is an object the engine tags, not a JavaScript function. */
const isBoundFunction = (v: unknown): boolean =>
  typeof v === 'function' || (typeof v === 'object' && v !== null && (v as { _jsonata_function?: unknown })._jsonata_function === true);

/** Names whose two evaluations differ; names no shape could evaluate; and every name that was asked. */
async function walk(): Promise<{ differ: string[]; unobservable: string[]; asked: string[] }> {
  const engine = (await import('jsonata')).default;
  const differ: string[] = [];
  const unobservable: string[] = [];
  const asked: string[] = [];
  for (const name of TABLE) {
    asked.push(name);
    let observed = false;
    for (const shape of SHAPES) {
      let expr: ReturnType<typeof engine>;
      try { expr = engine(`$${name}${shape}`); } catch { continue; }
      let first: string;
      try { first = JSON.stringify(await expr.evaluate(INPUT)) ?? 'undefined'; } catch { continue; }
      // OBSERVED means a defined value came back: `undefined` twice says nothing about a function
      // (the adequacy reader, m08 — `$assert` and `$lookup` had been counted on undefined alone).
      if (first !== 'undefined') observed = true;
      await sleep(3);
      let second: string;
      try { second = JSON.stringify(await expr.evaluate(INPUT)) ?? 'undefined'; } catch { second = 'THREW'; }
      if (first !== second) { differ.push(name); break; }
    }
    if (!observed) unobservable.push(name);
  }
  return { differ, unobservable, asked };
}

suite('W62 — prediction 4: JSONata`s function table walked, every built-in evaluated twice on one input', (test) => {
  test(`TABLE is the engine's own bind list — ${IN_BROWSER ? 'the browser checks every name is BOUND at run time (a subset)' : 'held to the source BOTH WAYS in this runtime'}`, async () => {
    const engine = (await import('jsonata')).default;
    ok(TABLE.length >= 60 && new Set(TABLE).size === TABLE.length, `a table of ${TABLE.length} distinct names`);
    for (const name of TABLE) {
      // A name referenced as a value evaluates to the bound function object; an unbound name is undefined.
      ok(isBoundFunction(await engine(`$${name}`).evaluate({})), `$${name} is bound in the engine`);
    }
    equal(typeof (await engine('$noSuchBuiltIn').evaluate({})), 'undefined', 'and a name the engine does not bind is undefined — the check above can fail');
    equal(IN_BROWSER, CORPUS_INLINED, 'the runtime flag agrees with the bundle`s own marker — so the equality below cannot be skipped by this file alone');
    if (IN_BROWSER) return;
    const src = await readText('node_modules/jsonata/jsonata.js');
    const bound = [...src.matchAll(/staticFrame\.bind\(['"]([A-Za-z]+)['"]/g)].map((m) => m[1]);
    const perExpression = [...src.matchAll(/environment\.bind\(['"]([A-Za-z]+)['"], defineFunction/g)].map((m) => m[1]);
    equal([...bound, ...perExpression].sort(), [...TABLE].sort(), 'the source`s static frame plus its per-expression bindings equal TABLE, both ways');
    equal(perExpression.sort(), ['millis', 'now'], 'and the per-expression pair is now and millis — bound with a timestamp the shadow overrides');
  });

  test('walked: the names whose two evaluations differ are EXACTLY what the adapter unbinds for nondeterminism — $now, $millis, $random and $shuffle; $eval is the declared exception; the unobservable names are counted, not passed', async () => {
    const { differ, unobservable, asked } = await walk();
    equal(asked.length, TABLE.length, 'every name was asked — the loop ran over the whole table');
    // Every name that differs is unbound; every unbound name differs — except `eval`, unbound for
    // Q265's reason (a run-time recompile), which is deterministic and is the one declared exception.
    equal(differ.sort(), UNBOUND_FUNCTIONS.filter((n) => n !== 'eval').sort(), `nondeterministic under this walk: ${differ.join(', ')} — and nothing else`);
    equal(UNBOUND_FUNCTIONS.filter((n) => !differ.includes(n)), ['eval'], 'the only unbound name the walk finds deterministic is $eval');
    // `$error` throws by definition and `$assert` returns nothing on success. Listed so a shape added
    // later that reaches something new is a change to this line and not a silence; 61 of the 63
    // names are observed with a defined value.
    equal(unobservable, ['assert', 'error'], `unobservable by this walk (${unobservable.length}): ${unobservable.join(', ')}`);
    ok(differ.length + unobservable.length < TABLE.length, 'and most of the table WAS observed deterministic');
  });
});
