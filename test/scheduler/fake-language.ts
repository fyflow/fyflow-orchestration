/**
 * **The FAKE language — a test fixture that satisfies the language-adapter interface, so every
 * clause of that interface has a positive case before a real language exists** —
 * [W61](../../doc/work-items/w61-what-a-transform-is.md),
 * [ADR 0051](../../doc/decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md)
 * rule 2, [P17](../../doc/plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md)
 * work item W61's Outputs row 8. It is what makes W62's JSONata adapter a SECOND implementation of
 * an interface that already has a conformance suite, rather than the first.
 *
 * **Deliberately trivial, so a reviewer holds the whole language in one line**: an expression is a
 * dotted key path read from the input (`confidence`, `run.config`), or `$` for the input itself,
 * or `$settings.<path>` read from the node's settings — and `compile` refuses anything else with
 * `code: 'P0001'` and the `position` of the first offending character. Evaluating reads the path:
 * a missing key is `undefined` (P17 fact 4's silent typo, reproduced on purpose) and walking INTO a
 * non-object throws with `code: 'P0002'` (the loud type error, so `TransformFailed`'s *the
 * language's own code* clause has a positive case). The three nondeterministic names P17 decision
 * 6 unbinds — `$now()`, `$millis()`, `$random()` — are outside the grammar, so here they are
 * refused at compile; the conformance suite asks only that they never yield a value.
 *
 * **The two halves are TWO COPIES of one grammar, on purpose.** The registry half is the function
 * below; the worker half is the `data:` URL module whose source is the string below, which every
 * runtime this suite runs in can `import()`. ADR 0051 rule 2 says the halves may disagree
 * ([Q264](../../doc/open-questions.md)) and the conformance suite asserts they do not; a fixture
 * whose two halves were one object would make that clause vacuous, so this one keeps them apart.
 */
import type { LanguageAdapter } from '../../src/definition/types.ts';
import type { AdapterProbes } from './adapter-conformance.ts';

/** `$`, `$settings.a.b`, or `a.b.c` — segments `[A-Za-z0-9_]+`, dot-joined; a digit-leading segment is a key too, so `JP-R12`'s `1.score` reads branch `1`'s `score`. Exported so the fixture's own test can hold the probe lists to it. */
export const GRAMMAR = /^(\$|\$settings(\.[A-Za-z0-9_]+)+|[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)*)$/;

/** Index of the first character outside the grammar's alphabet, or the length for a structurally wrong path. */
function positionOf(expr: string): number {
  const i = [...expr].findIndex((c) => !/[A-Za-z0-9_.$]/.test(c));
  return i >= 0 ? i : expr.length;
}

/** The REGISTRY half: synchronous, returns nothing, throws on anything that is not a path. */
export function pathCompile(expr: string): void {
  if (typeof expr !== 'string' || !GRAMMAR.test(expr)) {
    const e = new Error(`path: not a dotted key path: ${JSON.stringify(expr)}`) as Error & { code: string; position: number };
    e.code = 'P0001';
    e.position = typeof expr === 'string' ? positionOf(expr) : 0;
    throw e;
  }
}

/**
 * The WORKER half, as module source. Its default export is `compile(expr) => { evaluate(input,
 * settings) }`, and `evaluate` returns a Promise — as JSONata's does — so the wrapper's `await` is
 * exercised. It counts its compiles on `globalThis`, which is how the wrapper's *once per
 * instance* clause is observed from outside.
 */
export const PATH_WORKER_SRC = `const GRAMMAR = ${GRAMMAR.toString()};
export default function compile(expr) {
  if (typeof expr !== 'string' || !GRAMMAR.test(expr)) {
    const e = new Error('path: not a dotted key path: ' + JSON.stringify(expr));
    e.code = 'P0001';
    const i = typeof expr === 'string' ? [...expr].findIndex((c) => !/[A-Za-z0-9_.$]/.test(c)) : -1;
    e.position = i >= 0 ? i : (typeof expr === 'string' ? expr.length : 0);
    throw e;
  }
  globalThis.__PATH_COMPILES__ = (globalThis.__PATH_COMPILES__ ?? 0) + 1;
  const segs = expr === '$' ? [] : expr.split('.');
  const fromSettings = segs[0] === '$settings';
  const walk = fromSettings ? segs.slice(1) : segs;
  return {
    evaluate(input, settings) {
      let v = fromSettings ? settings : input;
      for (const k of walk) {
        if (v === undefined || v === null) return Promise.resolve(undefined);
        if (typeof v !== 'object') {
          const e = new Error('path: cannot read "' + k + '" of ' + typeof v + ' ' + JSON.stringify(v));
          e.code = 'P0002';
          return Promise.reject(e);
        }
        v = v[k];
      }
      return Promise.resolve(v);
    },
  };
}
`;

export const PATH_WORKER_URL = `data:text/javascript,${encodeURIComponent(PATH_WORKER_SRC)}`;

/** The adapter a registry carries under `languages: { path: PATH_LANGUAGE }`. No `check`: P18's hook, optional and absent here. */
export const PATH_LANGUAGE: LanguageAdapter = { compile: pathCompile, worker: PATH_WORKER_URL };

/** What the conformance suite runs this fixture against. Every expected value is written from the grammar above, never from a run. */
export const PATH_PROBES: AdapterProbes = {
  accepted: ['$', 'confidence', 'run.config', 'a.b.c', 'x_1.y2', '$settings.factor', '$settings.a.b'],
  refused: ['', '$sum(*.score', '*.score', 'a..b', '.a', 'a.', '$settings', '$$', 'a-b', 'a b', '$now()', '$millis()', '$random()'],
  nondeterministic: ['$now()', '$millis()', '$random()'],
  cases: [
    { expr: '$', input: { a: 1, b: [2] }, settings: {}, expected: { a: 1, b: [2] } },
    { expr: 'confidence', input: { confidence: 0.7, word: 'x' }, settings: {}, expected: 0.7 },
    { expr: 'run.config', input: { own: { confidence: 0.2 }, run: { config: { k: 1 } } }, settings: {}, expected: { k: 1 } },
    { expr: 'a.b.c', input: { a: { b: { c: [1, 2, 3] } } }, settings: {}, expected: [1, 2, 3] },
    { expr: 'missing', input: { a: 1 }, settings: {}, expected: undefined },
    { expr: '$settings.factor', input: { ignored: true }, settings: { factor: 10 }, expected: 10 },
  ],
  settingsPair: { expr: '$settings.factor', input: { x: 1 }, a: { factor: 1 }, b: { factor: 2 }, expectedA: 1, expectedB: 2 },
  typeError: { expr: 'a.b', input: { a: 5 }, settings: {}, code: 'P0002' },
  undefinedCase: { expr: 'scroe', input: { score: 3 }, settings: {} },
  compileError: { expr: '$sum(*.score', code: 'P0001', position: 4 },
};
