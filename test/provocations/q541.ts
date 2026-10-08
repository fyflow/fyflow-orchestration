/**
 * **Q541's provocation, checked in and runnable** — W145, P31, `doc/workflow.md` section 5 rule 7.
 *
 *   node test/provocations/q541.ts
 *
 * Node only: `scripts/run-browser-tests.mjs` is a Node script. It runs a BYTE COPY of that script under
 * a per-process scratch root, `dev-dist/q541-<pid>/<case>/`, where the copy derives its `ROOT` and so
 * finds the runner and the bundle each case puts there. Nothing in the tree is written; the scratch root
 * is removed on exit. Every expected value is Q541's `closes-when` and P31 decision 3, never a run's
 * output:
 *
 * | case | the baseline | the bundle | exit | the report lines, the WHOLE set |
 * |---|---|---|---|---|
 * | **A** | the REAL runner, plus `throws-on-import.ts` by `--with`: it RAN and exits 1 | reports | **1** | `RAN and exited 1`, the runner's own `FAIL`-naming report; **no** advice, **no** browser |
 * | **B** | none: `test/runner.ts` does not exist, so it could not run at all | reports | **1** | the advice, and nothing else |
 * | **C** | a fixture runner that crashes part-way: an `assertions` word, but no count line, exit 1 | reports | **1** | the advice — the runner never finished a run |
 * | **D** | a fixture runner that exits 0 with no count line | reports | **1** | `could not read an assertion count`, and nothing else |
 * | **E** | a fixture runner whose count line says 2 and exits 0 | **throws on import** | **1** | chromium's count line, `PARITY FAIL`, the never-reported `FAIL` naming a page error, the `PAGE ERROR` naming the fixture's error, the failure count — and well inside the 60 s wait |
 * | **F** | the same green fixture runner — the CONTROL | reports 2 passed | **0** | chromium's count line and `all passed (parity with node: 2)` |
 * | **H** | the same green fixture runner | an UNHANDLED REJECTION (a page error), then reports 2 passed | **1** | chromium's count line, the `PAGE ERROR`, the failure count — and NO never-reported `FAIL` and no `PARITY FAIL`: a page error from a suite that goes on to report does not lose its report (the conformity reader's finding 1) |
 * | **G** | the same green fixture runner | logs a CONSOLE error, then reports 2 passed | **1** | chromium's count line, the `PAGE ERROR` naming that console text, the failure count — and NO never-reported `FAIL` and no `PARITY FAIL`: a console error does not stop the wait |
 *
 * Rule 7's three requirements: **(a)** this file; **(b)** each input is asserted to be what its case
 * says — the copy byte-identical to the script, `throws-on-import.ts` throwing when imported, and the
 * real runner's exit 1 under the shim, read through the script's own `RAN and exited 1` (B's missing
 * runner and C's and D's missing count line are true by construction of their fixtures, and not
 * asserted separately — the conformity reader's finding 6); **(c)** each case's full SET of report lines is compared
 * exactly. Not a `*.test.ts`, so neither the runner's glob nor the browser bundle runs it. Exits 0 when
 * every clause holds, 1 otherwise, naming each clause that did not.
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = join(ROOT, 'scripts', 'run-browser-tests.mjs');
const PROVOCATION = 'test/provocations/throws-on-import.ts';
const SCRATCH = join(ROOT, 'dev-dist', `q541-${process.pid}`);
const ADVICE = 'could not establish the Node baseline — run `node test/runner.ts` first';

const problems: string[] = [];
const check = (cond: boolean, clause: string) => {
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${clause}`);
  if (!cond) problems.push(clause);
};

// The ENVIRONMENT, asserted (rule 8's harness row): node 16 fails long before a report line.
check(Number(process.versions.node.split('.')[0]) >= 24, `the runtime is node >= 24 (node ${process.versions.node})`);

rmSync(SCRATCH, { recursive: true, force: true });
process.on('exit', () => rmSync(SCRATCH, { recursive: true, force: true }));

/** The fixtures, each hand-written from the contract it stands in for. */
const BUNDLE_REPORTS = 'globalThis.__FYFLOW_RESULT__ = { passed: 2, failures: [], suites: 1 };\n';
/**
 * A console error, and the result set 6 s LATER — past the script's 5 s page-error grace, so a console error
 * that shortened the wait as a page error does would cut this report off (rule 8 probe p13).
 */
const BUNDLE_CONSOLE = "console.error('a console error, not a page error');\n" +
  'setTimeout(() => { globalThis.__FYFLOW_RESULT__ = { passed: 2, failures: [], suites: 1 }; }, 6_000);\n';
/** A page error from a suite that has not stopped: an unhandled rejection, then the result, as a stray async throw would. */
const BUNDLE_REJECTS_THEN_REPORTS = "Promise.reject(new Error('a page error, and the suite still reports'));\n" +
  'setTimeout(() => { globalThis.__FYFLOW_RESULT__ = { passed: 2, failures: [], suites: 1 }; }, 300);\n';
/** A fixture read at MODULE SCOPE that does not parse — the shape W132's provocation throws, now in a bundle. */
const BUNDLE_THROWS = `const fixture = JSON.parse('{ "cases": 2, this is not JSON }');\n` +
  'globalThis.__FYFLOW_RESULT__ = { passed: fixture.cases, failures: [], suites: 1 };\n';
/** test/runner.ts's count line: two spaces, `N file(s), M assertions, on <runtime>`. */
const RUNNER_GREEN = "console.log('\\n  1 file(s), 2 assertions, on node fixture');\nconsole.log('  all passed\\n');\n";
const RUNNER_CRASHES = "console.log('\\n  a suite');\nconsole.log('    FAIL  2 assertions disagree');\nthrow new Error('the runner died part-way');\n";
const RUNNER_SILENT = "console.log('nothing a baseline can be read from');\n";
/** The REAL runner, with Q272's provocation added the way q272.ts adds it. */
const RUNNER_REAL_FAILS = `process.argv.push('--with', ${JSON.stringify(PROVOCATION)});\n` +
  `await import(${JSON.stringify(pathToFileURL(join(ROOT, 'test', 'runner.ts')).href)});\n`;

/** One case's root: a byte copy of the script, a bundle, and a runner unless `runner` is null. */
function caseRoot(name: string, bundle: string, runner: string | null): string {
  const r = join(SCRATCH, name);
  mkdirSync(join(r, 'scripts'), { recursive: true });
  mkdirSync(join(r, 'dev-dist', 'browser'), { recursive: true });
  copyFileSync(SCRIPT, join(r, 'scripts', 'run-browser-tests.mjs'));
  writeFileSync(join(r, 'dev-dist', 'browser', 'tests.js'), bundle);
  if (runner !== null) {
    mkdirSync(join(r, 'test'), { recursive: true });
    writeFileSync(join(r, 'test', 'runner.ts'), runner);
  }
  return r;
}

/**
 * Each REPORT line the script can print, by kind. A case's verdict is the SET of kinds its output carries,
 * compared exactly — so a case that prints one line too many is as wrong as one that prints one too few.
 */
const KINDS: Array<[string, RegExp]> = [
  ['ran-and-failed', /^the Node baseline RAN and exited \d+: `node test\/runner\.ts` failed, so no browser was started\. Its own report names each failure:$/],
  ['advice', /^could not establish the Node baseline — run `node test\/runner\.ts` first$/],
  ['no-count', /^could not read an assertion count from the Node run$/],
  ['engine-count', /^ {2}\d+ file\(s\), \d+ assertions, on chromium$/],
  ['parity-fail', /^ {2}PARITY FAIL {2}/],
  ['fail', /^ {2}FAIL {2}/],
  ['page-error', /^ {2}PAGE ERROR {2}/],
  ['engine-failures', /^ {2}\d+ FAILURE\(S\) in chromium$/],
  ['all-passed', /^ {2}all passed \(parity with node: \d+\)$/],
];

function run(name: string, root: string) {
  const copy = join(root, 'scripts', 'run-browser-tests.mjs');
  // (b) the subject is the script as it ships, byte for byte.
  check(readFileSync(copy).equals(readFileSync(SCRIPT)), `${name}: the copy under the scratch root is byte-identical to scripts/run-browser-tests.mjs`);
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [copy], { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: 180_000 });
  const ms = Date.now() - t0;
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  const lines = out.split(/\r?\n/);
  const kinds = [...new Set(lines.flatMap((l) => KINDS.filter(([, re]) => re.test(l)).map(([k]) => k)))].sort();
  return { status: r.status, out, lines, kinds, ms };
}

function kindsAre(name: string, got: string[], want: string[]) {
  const w = [...want].sort();
  check(JSON.stringify(got) === JSON.stringify(w), `${name}: the report lines are exactly [${w.join(', ')}] (got [${got.join(', ')}])`);
}

// (b) the input of case A: the provocation THROWS when it is imported — otherwise A proves nothing.
let threw = '';
try {
  await import(pathToFileURL(join(ROOT, PROVOCATION)).href);
} catch (e) {
  threw = e instanceof Error ? e.name : typeof e;
}
check(threw !== '', `${PROVOCATION} throws when it is imported (${threw || 'it did not'})`);

// A — the baseline RAN and exited 1. Named, not advised; no browser.
const a = run('A', caseRoot('a', BUNDLE_REPORTS, RUNNER_REAL_FAILS));
check(a.status === 1, `A: exits 1 (got ${a.status})`);
kindsAre('A', a.kinds, ['ran-and-failed']);
check(/^the Node baseline RAN and exited 1: /m.test(a.out), 'A: it says the baseline RAN and the code it exited with, 1');
check(!a.out.includes(ADVICE), 'A: it does NOT advise running the runner first — the runner has run');
// The runner's own report, from its count line on: the count, the unimported file NAMED with its error, the total.
const report = a.lines.slice(a.lines.findIndex((l) => KINDS[0]![1].test(l)) + 1).filter((l) => l.trim() !== '');
check(/^ {2}\d+ file\(s\), \d+ assertions, on node /.test(report[0] ?? ''), `A: the runner's report starts at its count line (got ${JSON.stringify(report[0])})`);
check(report.includes(`  ${PROVOCATION} › could not be imported`), `A: the report NAMES the failure: ${PROVOCATION} › could not be imported`);
check(report.some((l) => /^ {4}SyntaxError: /.test(l)), "A: and the failure's error, SyntaxError");
check(report.includes('  1 FAILURE(S)'), 'A: and the runner\'s own total, 1 FAILURE(S)');
check(!report.some((l) => /^\s+ok\s/.test(l)), 'A: and none of the runner\'s per-case ok lines — the report is from its count line on');

// B — no runner at all: the advice, and only the advice.
const b = run('B', caseRoot('b', BUNDLE_REPORTS, null));
check(b.status === 1, `B: exits 1 (got ${b.status})`);
kindsAre('B', b.kinds, ['advice']);

// C — a runner that died before its count line: it never finished a run, so the advice.
const c = run('C', caseRoot('c', BUNDLE_REPORTS, RUNNER_CRASHES));
check(c.status === 1, `C: exits 1 (got ${c.status})`);
kindsAre('C', c.kinds, ['advice']);

// D — exit 0 with no count line: the count could not be read, which is not "could not run".
const d = run('D', caseRoot('d', BUNDLE_REPORTS, RUNNER_SILENT));
check(d.status === 1, `D: exits 1 (got ${d.status})`);
kindsAre('D', d.kinds, ['no-count']);

// E — a green baseline and a bundle that throws on import: named, and not a 60 s timeout.
const e = run('E', caseRoot('e', BUNDLE_THROWS, RUNNER_GREEN));
check(e.status === 1, `E: exits 1 (got ${e.status})`);
kindsAre('E', e.kinds, ['engine-count', 'parity-fail', 'fail', 'page-error', 'engine-failures']);
const eFails = e.lines.filter((l) => KINDS[5]![1].test(l)).map((l) => l.trim());
check(JSON.stringify(eFails) === JSON.stringify(['FAIL  the suite never reported: a page error stopped it (PAGE ERROR below)']),
  `E: the one FAIL line says a page error stopped the suite (got ${JSON.stringify(eFails)})`);
const ePage = e.lines.filter((l) => KINDS[6]![1].test(l)).map((l) => l.trim());
check(ePage.length === 1 && /^PAGE ERROR {2}SyntaxError: .*JSON/.test(ePage[0]!),
  `E: the one PAGE ERROR is the fixture's own, a SyntaxError from JSON (got ${JSON.stringify(ePage)})`);
check(e.ms < 30_000, `E: it reports well inside the 60 s wait (${e.ms} ms; the bound is 30 000 ms)`);

// F — the CONTROL: the same green baseline and a bundle that reports. Green, so the cases above are not the apparatus.
const f = run('F', caseRoot('f', BUNDLE_REPORTS, RUNNER_GREEN));
check(f.status === 0, `F: the control exits 0 (got ${f.status})`);
kindsAre('F', f.kinds, ['all-passed', 'engine-count']);

// G — a CONSOLE error is a failure, but no evidence that evaluation stopped: the wait goes on and the suite reports.
const g = run('G', caseRoot('g', BUNDLE_CONSOLE, RUNNER_GREEN));
check(g.status === 1, `G: exits 1 (got ${g.status})`);
kindsAre('G', g.kinds, ['engine-count', 'page-error', 'engine-failures']);
const gPage = g.lines.filter((l) => KINDS[6]![1].test(l)).map((l) => l.trim());
check(JSON.stringify(gPage) === JSON.stringify(['PAGE ERROR  a console error, not a page error']),
  `G: the one PAGE ERROR is the console text (got ${JSON.stringify(gPage)})`);

// H — a PAGE error from a suite that goes on to report: the report is kept, not cut off at the error.
const h = run('H', caseRoot('h', BUNDLE_REJECTS_THEN_REPORTS, RUNNER_GREEN));
check(h.status === 1, `H: exits 1 (got ${h.status})`);
kindsAre('H', h.kinds, ['engine-count', 'page-error', 'engine-failures']);
const hPage = h.lines.filter((l) => KINDS[6]![1].test(l)).map((l) => l.trim());
check(hPage.length === 1 && hPage[0]!.includes('a page error, and the suite still reports'),
  `H: the one PAGE ERROR is the rejection's own (got ${JSON.stringify(hPage)})`);

console.log(problems.length
  ? `\n  q541 provocation — ${problems.length} clause(s) did not hold\n`
  : `\n  q541 provocation — every clause held: a baseline that ran is named, one that could not is advised, a bundle that throws on import is reported in ${e.ms} ms\n`);
process.exit(problems.length ? 1 : 0);
