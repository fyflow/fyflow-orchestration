#!/usr/bin/env node
// Bundle the test suites for the browser — `RT-R1`'s third runtime.
//
// Two problems the other two runtimes do not have, and one rule that shapes both:
//
//   1. **A browser has no filesystem**, and L4's fixtures are files. The corpus is
//      inlined into the bundle as `__FYFLOW_CORPUS__`; `test/harness.ts` prefers it
//      when present, so **the suites themselves are byte-identical in all three
//      runtimes** — which is what `RT-R1` is actually asking for.
//   2. **The output is ESM, not IIFE.** The suites load their fixtures at module
//      scope, so they use top-level await, which the IIFE format forbids. The
//      runner injects the bundle as `<script type="module">`.
//   3. **The entry must import every suite statically**, because a bundle has no
//      dynamic `import()` of a local path. That would normally mean a maintained
//      list, which W3's declaration forbids: *"the test runner MUST discover suites
//      by globbing, so a later item adds a file rather than editing a shared
//      list."* So the entry is **generated** from the same glob the Node and Deno
//      runner uses. Derived, never maintained.
//
// Output: dev-dist/browser/tests.js — an ES module that runs the suite and leaves
// `globalThis.__FYFLOW_RESULT__ = { passed, failures, suites }`.

import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const SEP = String.fromCharCode(92); // a backslash, without escaping it in a template
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const toPosix = (p) => p.split(SEP).join('/');
const relPosix = (p) => toPosix(relative(ROOT, p));

function walk(dir, keep) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, keep));
    else if (keep(name)) out.push(p);
  }
  return out;
}

// The same glob the Node and Deno runner uses.
const suites = walk(join(ROOT, 'test'), (n) => n.endsWith('.test.ts')).sort();
// Every fixture L4 reads. Inlined rather than fetched: an `about:blank` page has
// no origin to fetch from.
//
// **`spec/flow-definition.md` is here because L4 reads it** — `test/definition/l4-corpus.test.ts`
// compares `spec/examples/valid/` against section 7's own table both ways
// ([W32](../doc/work-items/w32-what-a-map-fanout-is.md)). It is the first non-JSON
// entry and the first outside `spec/examples/`, so the walk is no longer the whole
// story and the list says so.
//
// **The failure this fixes is worth stating, because it is silent in the wrong
// way.** `readText` throws for a path the corpus does not carry; the suites read
// their fixtures at MODULE SCOPE, so the throw happens while the bundle is
// LOADING and takes **every** suite with it. The runner then reports *"the suite
// never reported"* at **0 file(s), 1 assertion** — measured in all three browsers.
// A missing fixture does not fail one test; it fails the run in a way that names
// no file.
const fixtures = [
  ...walk(join(ROOT, 'spec', 'examples'), (n) => n.endsWith('.json')),
  join(ROOT, 'spec', 'flow-definition.md'),
].sort();
const corpus = Object.fromEntries(fixtures.map((p) => [relPosix(p), readFileSync(p, 'utf8')]));

// Absolute specifiers: the generated entry lives in dev-dist/, so a path relative
// to the repository root would not resolve from there.
// The corpus assignment lives in its OWN module, imported first. ES module
// imports are HOISTED: written as a statement in the entry it would run *after*
// every suite had already loaded its fixtures at module scope, and the harness
// would fall through to its Node branch — which is exactly the failure this
// bundle exists to rule out.
mkdirSync(join(ROOT, 'dev-dist'), { recursive: true });
const corpusModule = join(ROOT, 'dev-dist', 'corpus.generated.js');
writeFileSync(
  corpusModule,
  `globalThis.__FYFLOW_CORPUS__ = ${JSON.stringify(corpus)};
`,
);

const imports = [
  `import ${JSON.stringify(toPosix(corpusModule))};`,
  `import { collected } from ${JSON.stringify(toPosix(join(ROOT, 'test', 'harness.ts')))};`,
  ...suites.map((p, i) => `import * as s${i} from ${JSON.stringify(toPosix(p))};`),
  suites.map((_p, i) => `void s${i};`).join(' '),
].join('\n');

const entry = [
  imports,
  '',
  '// ESM output, so top-level await is legal — which the suites need for fixtures.',
  'async function main() {',
  '  const failures = [];',
  '  let passed = 0;',
  '  for (const { suite, cases } of collected()) {',
  '    for (const c of cases) {',
  '      try { await c.fn(); passed++; }',
  '      catch (e) { failures.push(suite + " > " + c.name + "\\n    " + ((e && e.message) || String(e))); }',
  '    }',
  '  }',
  `  return { passed, failures, suites: ${suites.length} };`,
  '}',
  '',
  'main().then(',
  '  (r) => { globalThis.__FYFLOW_RESULT__ = r; },',
  '  (e) => { globalThis.__FYFLOW_RESULT__ = { passed: 0, failures: [String((e && e.stack) || e)], suites: 0 }; },',
  ');',
].join('\n');

const generated = join(ROOT, 'dev-dist', 'browser-entry.generated.ts');
mkdirSync(dirname(generated), { recursive: true });
writeFileSync(generated, entry);

await esbuild.build({
  entryPoints: [generated],
  bundle: true,
  platform: 'browser',
  format: 'esm',
  target: 'es2022',
  // `test/harness.ts` reaches node:fs on its Node branch, which the browser
  // branch short-circuits before — unreachable here, but the bundler still has to
  // resolve it. Left external so the dynamic import survives unevaluated.
  // RT-R7 exempts the harness; that this is the ONLY external is the evidence
  // that no published module and no suite reaches for a Node builtin.
  external: ['node:fs'],
  outfile: join(ROOT, 'dev-dist', 'browser', 'tests.js'),
  logLevel: 'warning',
});

console.log(
  `browser bundle — ${suites.length} suite(s), ${fixtures.length} fixture(s) inlined ` +
    `-> dev-dist/browser/tests.js`,
);
