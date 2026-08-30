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

import { execFileSync } from 'node:child_process';
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
let expected = null;
try {
  const out = execFileSync(process.execPath, [join(ROOT, 'test', 'runner.ts')], { encoding: 'utf8' });
  const m = /(\d+) assertions/.exec(out);
  if (m) expected = Number(m[1]);
} catch {
  console.error('could not establish the Node baseline — run `node test/runner.ts` first');
  process.exit(1);
}
if (expected === null) {
  console.error('could not read an assertion count from the Node run');
  process.exit(1);
}

const ENGINES = { chromium, firefox, webkit };
const asked = process.argv.slice(2).filter((a) => a in ENGINES);
const engines = asked.length ? asked : ['chromium'];

let failed = 0;
for (const name of engines) {
  const browser = await ENGINES[name].launch();
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e.stack || e)));
  page.on('console', (m) => {
    if (m.type() === 'error') pageErrors.push(m.text());
  });

  let result;
  try {
    await page.goto(base, { waitUntil: 'load' });
    await page.waitForFunction(() => '__FYFLOW_RESULT__' in globalThis, null, { timeout: 60_000 });
    result = await page.evaluate(() => globalThis.__FYFLOW_RESULT__);
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
