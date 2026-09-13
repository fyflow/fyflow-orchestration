/**
 * **The ADAPTER CONFORMANCE SUITE — what any language adapter must do, run against the adapter it
 * is handed** — [W61](../../doc/work-items/w61-what-a-transform-is.md),
 * [ADR 0051](../../doc/decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md)
 * rule 2, [P17](../../doc/plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md)
 * decisions 3, 6, 7 and 10. W61 runs it against the FAKE language in `fake-language.ts`; W62 runs
 * the same function against the JSONata adapter, so that adapter is a second implementation of an
 * interface that already has a suite — W50's *two sources that can disagree* made into a test
 * rather than a hazard.
 *
 * A helper rather than a `*.test.ts`, so a suite file names the adapter and the probes and this
 * file names the CLAUSES. Every expected value comes from the probes the caller writes from its
 * language's own definition, never from a run.
 */
import { deepEqual, equal, ok, suite, throws } from '../harness.ts';
import type { LanguageAdapter } from '../../src/definition/types.ts';

export interface AdapterCase {
  expr: string;
  input: unknown;
  settings: Readonly<Record<string, unknown>>;
  expected: unknown;
}

export interface AdapterProbes {
  /** Expressions the language accepts — the registry half returns and the worker half compiles. */
  accepted: readonly string[];
  /** Expressions the language refuses — the registry half throws and so does the worker half. */
  refused: readonly string[];
  /** P17 decision 6: the three unbound names, as expressions that must NEVER yield a value. */
  nondeterministic: readonly string[];
  /** Expression, input, settings, expected — evaluated through the worker half. */
  cases: readonly AdapterCase[];
  /** P17 decision 7: ONE expression over TWO settings gives TWO answers — the `$settings` binding as a discriminating pair. */
  settingsPair: { expr: string; input: unknown; a: Readonly<Record<string, unknown>>; b: Readonly<Record<string, unknown>>; expectedA: unknown; expectedB: unknown };
  /** A LOUD failure at evaluation, carrying the language's own code (P17 fact 4's other half). */
  typeError?: { expr: string; input: unknown; settings: Readonly<Record<string, unknown>>; code: string };
  /**
   * P17 fact 4's SILENT half, REQUIRED of every adapter (the adequacy reader, m60): an expression
   * naming something the input does not have evaluates to `undefined` and does not reject — the
   * wrapper hands it on, and an adapter that rejected instead would turn a typo into a task failure
   * this document says it is not.
   */
  undefinedCase: { expr: string; input: unknown; settings: Readonly<Record<string, unknown>> };
  /** A refused expression's code and position, as `FD-V36` reports them. */
  compileError?: { expr: string; code: string; position: number };
}

/** The worker half's default export, structurally. */
type WorkerCompile = (expr: string) => { evaluate(input: unknown, settings: Readonly<Record<string, unknown>>): unknown };

async function workerHalf(adapter: LanguageAdapter): Promise<WorkerCompile> {
  const mod = (await import(adapter.worker)) as { default?: unknown };
  ok(typeof mod.default === 'function', `the worker module's default export is the compile function (got ${typeof mod.default})`);
  return mod.default as WorkerCompile;
}

function refuses(fn: () => unknown): { threw: boolean; error?: unknown } {
  try { fn(); return { threw: false }; } catch (e) { return { threw: true, error: e }; }
}

export function adapterConformance(name: string, adapter: LanguageAdapter, probes: AdapterProbes): void {
  suite(`adapter conformance — ${name}`, (test) => {
    test('the interface: compile is a function, worker a non-empty module URL, check OPTIONAL (P18`s hook, reserved) — and the probe lists are non-empty, distinct and disjoint', () => {
      ok(typeof adapter.compile === 'function', 'compile is a function — the registry half');
      ok(typeof adapter.worker === 'string' && adapter.worker.length > 0, 'worker is a non-empty string — the worker half`s module URL');
      ok(!('check' in adapter) || adapter.check === undefined || typeof adapter.check === 'function', 'check, if present, is a function; its absence is legal');
      for (const [label, list] of [['accepted', probes.accepted], ['refused', probes.refused], ['nondeterministic', probes.nondeterministic]] as const) {
        ok(list.length >= 3 && new Set(list).size === list.length, `${label} is non-empty and distinct (${list.length})`);
      }
      ok(probes.cases.length >= 3, `at least three cases (${probes.cases.length})`);
      equal(probes.accepted.filter((e) => probes.refused.includes(e)), [], 'accepted and refused are disjoint');
      // **The three, BY NAME** — the conformity reader (finding 1): the spec and ADR 0051 say the suite
      // asserts them by name, and a count of three was satisfied by any three refused expressions.
      equal([...probes.nondeterministic].sort(), ['$millis()', '$now()', '$random()'], 'exactly the three names P17 decision 6 unbinds, by name');
    });

    test('the registry half: every refused expression THROWS synchronously with a message, every accepted one returns', () => {
      for (const expr of probes.refused) {
        const r = refuses(() => adapter.compile(expr));
        ok(r.threw, `compile(${JSON.stringify(expr)}) throws`);
        ok(r.error instanceof Error && r.error.message.length > 0, `and the throw is an Error with a message: ${String(r.error)}`);
      }
      // "returns nothing" — the registry half's whole contract is the throw; a value returned is
      // read by nobody, so the suite pins it (the conformity reader, finding 7).
      for (const expr of probes.accepted) equal(adapter.compile(expr), undefined, `compile(${JSON.stringify(expr)}) returns nothing`);
      if (probes.compileError) {
        const r = refuses(() => adapter.compile(probes.compileError!.expr));
        const e = r.error as { code?: unknown; position?: unknown };
        equal(e.code, probes.compileError.code, 'a refused expression carries the language`s code');
        equal(e.position, probes.compileError.position, 'and the position FD-V36 reports');
      }
    });

    test('the worker half loads, and it refuses EXACTLY what the registry half refuses — the two halves agree (Q264)', async () => {
      const compile = await workerHalf(adapter);
      for (const expr of probes.refused) ok(refuses(() => compile(expr)).threw, `worker compile(${JSON.stringify(expr)}) throws, as the registry half did`);
      for (const expr of probes.accepted) {
        const r = refuses(() => compile(expr));
        equal(r.threw, false, `worker compile(${JSON.stringify(expr)}) returns, as the registry half did`);
      }
      // And the same predicate over BOTH lists at once, so a list emptied does not make the loop vacuous.
      const all = [...probes.accepted, ...probes.refused];
      const registry = all.map((e) => refuses(() => adapter.compile(e)).threw);
      const worker = all.map((e) => refuses(() => compile(e)).threw);
      equal(worker, registry, 'the two halves` verdicts agree expression by expression');
      ok(registry.some((x) => x) && registry.some((x) => !x), 'and the verdicts are not all one value');
    });

    test('every case evaluates to its expected value through the worker half — and to the SAME value twice (necessary, never sufficient)', async () => {
      const compile = await workerHalf(adapter);
      for (const c of probes.cases) {
        const compiled = compile(c.expr);
        ok(typeof compiled?.evaluate === 'function', `compile(${JSON.stringify(c.expr)}) has evaluate()`);
        const once = await compiled.evaluate(c.input, c.settings);
        const twice = await compiled.evaluate(c.input, c.settings);
        equal(once, c.expected, `${c.expr} over ${JSON.stringify(c.input)} evaluates to the expected value`);
        equal(twice, once, `${c.expr}: the second evaluation agrees — P17 fact 3's check, stated as necessary and not sufficient`);
      }
      ok(probes.cases.some((c) => !deepEqual(c.expected, c.input)), 'at least one case is not the identity — the transform DOES something');
    });

    test('the settings binding: ONE expression over TWO settings gives TWO different answers — P17 decision 7 as a discriminating pair', async () => {
      const compile = await workerHalf(adapter);
      const p = probes.settingsPair;
      ok(!deepEqual(p.a, p.b), 'the two settings differ — the pair is a claim (rule 8, fourth requirement on the set)');
      ok(!deepEqual(p.expectedA, p.expectedB), 'and so do the two expected values');
      const compiled = compile(p.expr);
      equal(await compiled.evaluate(p.input, p.a), p.expectedA, 'settings A');
      equal(await compiled.evaluate(p.input, p.b), p.expectedB, 'settings B — same expression, same input, a different answer');
    });

    test('a missing path is `undefined` and NOT a rejection — P17 fact 4`s silent half, required of every adapter', async () => {
      const compile = await workerHalf(adapter);
      const u = probes.undefinedCase;
      equal(await compile(u.expr).evaluate(u.input, u.settings), undefined, `${u.expr} over ${JSON.stringify(u.input)} is undefined, not a throw`);
    });

    test('the three nondeterministic names NEVER yield a value: refused at compile, or a rejection at evaluate — P17 decision 6', async () => {
      const compile = await workerHalf(adapter);
      let asked = 0;
      for (const expr of probes.nondeterministic) {
        asked++;
        let yielded: unknown = 'NOTHING';
        let how = 'compile';
        try {
          const compiled = compile(expr);
          how = 'evaluate';
          yielded = await compiled.evaluate({}, {});
        } catch { /* refused, one way or the other */ }
        equal(yielded, 'NOTHING', `${expr} yielded a value at ${how}: ${JSON.stringify(yielded)}`);
      }
      equal(asked, probes.nondeterministic.length, 'every name was asked — the loop ran over the whole list (the adequacy reader, m50)');
    });

    test('a LOUD failure at evaluation rejects with the language`s own code — the half of P17 fact 4 an adapter CAN report', async () => {
      if (!probes.typeError) { throws(() => { throw new Error('no typeError probe'); }, 'no typeError probe', 'an adapter declaring no loud failure says so here'); return; }
      const compile = await workerHalf(adapter);
      const t = probes.typeError;
      let err: unknown;
      try { await compile(t.expr).evaluate(t.input, t.settings); } catch (e) { err = e; }
      ok(err instanceof Error, `${t.expr} over ${JSON.stringify(t.input)} rejects`);
      equal((err as { code?: unknown }).code, t.code, `and the rejection carries the code ${t.code}`);
    });
  });
}
