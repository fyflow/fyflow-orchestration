#!/usr/bin/env node
// Run the bundled suite in a real browser — the third rung of `RT-R1`.
//
// The bundle is an ES module (the suites use top-level await for fixtures), and a
// module script will not execute from `about:blank` or a `data:` URL: both are
// opaque origins. So the runner starts a loopback HTTP server on an ephemeral
// port, serves exactly two things, and shuts it down. Nothing is configured,
// nothing can collide, and no dev-server dependency enters the tree.
//
//   node scripts/build-browser-tests.mjs && node scripts/run-browser-tests.mjs
//   node scripts/run-browser-tests.mjs chromium firefox webkit
//
// Exits 0 when every assertion passes in every requested engine, 1 otherwise.

import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BUNDLE = join(ROOT, 'dev-dist', 'browser', 'tests.js');

if (!existsSync(BUNDLE)) {
  console.error('no bundle — run: node scripts/build-browser-tests.mjs');
  process.exit(1);
}
const source = readFileSync(BUNDLE, 'utf8');
const PAGE =
  '<!doctype html><meta charset="utf-8"><title>fyflow tests</title>' +
  '<script type="module" src="/tests.js"></script>';

const server = createServer((req, res) => {
  if (req.url === '/tests.js') {
    res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' });
    res.end(source);
  } else {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(PAGE);
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

// **Parity, not just green.** A fixture missing from the inlined corpus produces
// one FEWER L4 case rather than a failure: `l4-corpus.test.ts` enumerates its
// cases from `listDir`, which in a browser reads the generated copy. A lossy
// bundle would report "all passed" with less coverage than Node and Deno, and
// `RT-R1` claims the SAME suites in all three. So the Node suite is run first and
// the browser must match its assertion count.
//
// **A baseline that RAN and failed is reported as that, naming its failures** — W145, Q541, P31
// decision 3. The runner RAN when its output carries its own count line, which it prints only once
// every suite it could import has run (test/runner.ts). A run that then exits non-zero has failures,
// and its report from that line on names every one — an unimported file and each failed case — so it
// is printed as it is, and no browser starts: there is no passing baseline to match. Before W145 any
// non-zero exit printed the advice below, which is wrong once the runner HAS run. The advice now
// stays only for a baseline that could not run at all: no count line and not exit 0. Provoked by
// `test/provocations/q541.ts`.
const baseline = spawnSync(process.execPath, [join(ROOT, 'test', 'runner.ts')], {
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'inherit'],
  maxBuffer: 256 * 1024 * 1024,
});
const baselineOut = baseline.stdout ?? '';
const countLine = /^ {2}\d+ file\(s\), (\d+) assertions, on /m.exec(baselineOut);
if (countLine && baseline.status !== 0) {
  console.error(
    `the Node baseline RAN and exited ${baseline.status}: \`node test/runner.ts\` failed, so no ` +
      'browser was started. Its own report names each failure:',
  );
  console.error(baselineOut.slice(countLine.index).trimEnd() + '\n');
  process.exit(1);
}
if (!countLine && baseline.status !== 0) {
  console.error('could not establish the Node baseline — run `node test/runner.ts` first');
  process.exit(1);
}
if (!countLine) {
  console.error('could not read an assertion count from the Node run');
  process.exit(1);
}
const expected = Number(countLine[1]);

const ENGINES = { chromium, firefox, webkit };
const asked = process.argv.slice(2).filter((a) => a in ENGINES);
const engines = asked.length ? asked : ['chromium'];

let failed = 0;
for (const name of engines) {
  const browser = await ENGINES[name].launch();
  const page = await browser.newPage();
  const pageErrors = [];
  // **A page error ends the wait** — W145, Q541's second clause. The bundle is ONE module, so a suite
  // that throws while it is imported stops its evaluation and the result is never set: before W145 that
  // was a 60 s timeout. An uncaught page error fails the engine whenever it comes, so stopping at the
  // first one changes no verdict, and a run with none waits exactly as before. A console error does
  // not stop it: it is no evidence that evaluation stopped.
  let pageErrorSeen;
  const stoppedByPageError = new Promise((r) => {
    pageErrorSeen = r;
  });
  page.on('pageerror', (e) => {
    pageErrors.push(String(e.stack || e));
    pageErrorSeen('page error');
  });
  page.on('console', (m) => {
    if (m.type() === 'error') pageErrors.push(m.text());
  });

  let result;
  try {
    await page.goto(base, { waitUntil: 'load' });
    // A timeout still rejects into the `catch` below, as before W145. `Promise.race` subscribes to both
    // inputs, so the wait that loses — rejected when the browser closes — is never an unhandled rejection.
    const reported = page
      .waitForFunction(() => '__FYFLOW_RESULT__' in globalThis, null, { timeout: 60_000 })
      .then(() => 'reported');
    const first = await Promise.race([reported, stoppedByPageError]);
    result = first === 'reported'
      ? await page.evaluate(() => globalThis.__FYFLOW_RESULT__)
      : { passed: 0, failures: ['the suite never reported: a page error stopped it (PAGE ERROR below)'], suites: 0 };
  } catch (e) {
    result = { passed: 0, failures: [`the suite never reported: ${e.message}`], suites: 0 };
  }
  await browser.close();

  const total = result.passed + result.failures.length;
  console.log(`\n  ${result.suites} file(s), ${total} assertions, on ${name}`);
  if (total !== expected) {
    failed++;
    console.log(
      `\n  PARITY FAIL  ${name} ran ${total} assertions, node ran ${expected}. ` +
        'A bundle that inlines fewer fixtures runs fewer cases and still reports "all passed" — ' +
        'RT-R1 claims the SAME suites in all three runtimes, so a count mismatch is a failure.',
    );
  }
  if (result.failures.length || pageErrors.length) {
    failed++;
    for (const f of result.failures) console.log(`\n  FAIL  ${f}`);
    for (const e of pageErrors) console.log(`\n  PAGE ERROR  ${e}`);
    console.log(`\n  ${result.failures.length + pageErrors.length} FAILURE(S) in ${name}\n`);
  } else if (total === expected) {
    console.log(`  all passed (parity with node: ${expected})`);
  }
}

server.close();
process.exit(failed ? 1 : 0);
