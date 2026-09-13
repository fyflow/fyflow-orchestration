/**
 * **The conformance suite, run against the FAKE language** — W61's Outputs row 8. This is the
 * suite W62's JSONata adapter is a second caller of; here the adapter under test is the fixture in
 * `fake-language.ts`, whose two halves are two copies of one grammar so the suite's *the halves
 * agree* clause has something to disagree about.
 */
import { equal, ok, suite } from '../harness.ts';
import { adapterConformance } from './adapter-conformance.ts';
import { GRAMMAR, PATH_LANGUAGE, PATH_PROBES, PATH_WORKER_SRC, PATH_WORKER_URL, pathCompile } from './fake-language.ts';

adapterConformance('path (the fake language, a test fixture)', PATH_LANGUAGE, PATH_PROBES);

suite('the fake language — what the fixture itself claims', (test) => {
  test('the adapter is the registry compile and the data: URL worker, and declares no check (P18`s hook absent, not forbidden)', () => {
    ok(PATH_LANGUAGE.compile === pathCompile, 'the registry half is pathCompile');
    equal(PATH_LANGUAGE.worker, PATH_WORKER_URL, 'the worker half is the data: URL');
    ok(PATH_WORKER_URL.startsWith('data:text/javascript,'), 'a data: URL, so every runtime this suite runs in can import() it');
    ok(!('check' in PATH_LANGUAGE), 'no check hook — the conformance suite asserts the field is OPTIONAL, and this fixture is the absent case');
    ok(PATH_WORKER_SRC.includes('export default function compile'), 'the worker module`s default export is compile');
  });

  test('a refused expression carries P0001 and the position of the first offending character', () => {
    for (const [expr, position] of [['$sum(*.score', 4], ['a-b', 1], ['a b', 1], ['', 0], ['a..b', 4], ['$$', 2]] as const) {
      let err: unknown;
      try { pathCompile(expr); } catch (e) { err = e; }
      ok(err instanceof Error, `${JSON.stringify(expr)} is refused`);
      equal((err as { code?: unknown }).code, 'P0001', `${JSON.stringify(expr)}: the code`);
      equal((err as { position?: unknown }).position, position, `${JSON.stringify(expr)}: the position`);
    }
  });

  test('every REFUSED entry fails the grammar and every ACCEPTED one passes it — the lists are held to the fixture`s own definition (the adequacy reader, m41/m42)', () => {
    // A second route for each entry's honesty; it does not stop a deletion, which the conformance
    // suite bounds only by `>= 3` — stated rather than dressed up: these are fixture lists.
    for (const e of PATH_PROBES.refused) ok(!GRAMMAR.test(e), `${JSON.stringify(e)} is outside the grammar`);
    for (const e of PATH_PROBES.accepted) ok(GRAMMAR.test(e), `${JSON.stringify(e)} is inside it`);
    ok(PATH_PROBES.refused.length >= 10 && PATH_PROBES.accepted.length >= 5, 'and the lists are as long as the fixture declares');
  });

  test('the three names P17 decision 6 unbinds are in the REFUSED list — this fixture refuses them at compile, and the suite asks only that they never yield a value', () => {
    for (const n of PATH_PROBES.nondeterministic) ok(PATH_PROBES.refused.includes(n), `${n} is refused by the grammar`);
  });
});
