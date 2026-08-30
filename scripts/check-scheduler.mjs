#!/usr/bin/env node
// Ladder L0 — **the pinned scheduler is present, is the version we pin, and the
// build Node loads is not older than the source Deno loads.**
//
// [ADR 0013](../doc/decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
// rule 5. `fyflow-scheduler` 0.3.0 is on **no registry** — npm and JSR both stop
// at 0.2.1, measured — so the pin is reached from the working tree next door, and
// the two runtimes reach it by different roads:
//
//   Node   node_modules/fyflow-scheduler -> ../fyflow-scheduler, `exports` ->
//          dist/node/index.js            ...a BUILD, which goes stale
//   Deno   examples/deno-import-map.json -> ../fyflow-scheduler/index.ts
//                                         ...the SOURCE, which cannot
//
// That asymmetry is the whole reason this file exists. Node cannot read the
// source at all: `core/threadWrapper.ts:5` value-imports an `interface`, and
// Node runs TypeScript by erasing types rather than compiling them
// ([S9](../doc/scheduler-upstream.md)). So ladder L6 can silently run 0.2.x under
// Node and 0.3.0 under Deno and report both green.
//
// **It is not hypothetical.** `../fyflow-scheduler/dist/` was found stale at the
// start of W5 — a pre-0.3.0 build with no `_failOrphanedTask` and no
// `getAdmissionQueue` in it, behind a `package.json` reading `0.3.0`. `npm
// install` runs the sibling's `prepare` today, and npm 11.19 already warns that
// it may stop; more ordinarily, the sibling's source changes without our install
// running.
//
//   node scripts/check-scheduler.mjs
//
// Exits 0 when every check passes, 1 otherwise. It reports; it does not fix, and
// it never runs a build in another repository.

import { readFileSync, statSync, realpathSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The pin, in one place. [Q3](../doc/open-questions.md) — and there is **no
 * changelog** upstream, so a bump here means re-reading its `AGENTS.md` section 6
 * rather than reading a diff.
 */
const PIN = '0.3.0';

const failures = [];
const fail = (check, msg) => failures.push(`${check}: ${msg}`);
/** Which checks actually executed. See the reporting block at the bottom. */
const ran = { D1: false, D2: false, D3: false, D4: false, D5: false };
const rel = (p) => relative(ROOT, p).replace(/\\/g, '/');

/**
 * Resolved through `node_modules`, never hard-coded — this checks **what Node
 * will actually load**, so a link that points somewhere unexpected is a finding
 * rather than something the check reads past.
 */
let pkgDir = null;
try {
  pkgDir = realpathSync(join(ROOT, 'node_modules', 'fyflow-scheduler'));
} catch {
  fail('D1', 'node_modules/fyflow-scheduler is missing. ADR 0013 rule 3: the pin is a ' +
    '`file:../fyflow-scheduler` devDependency, so `../fyflow-scheduler` must be checked out ' +
    'beside this repository. Run `npm install`');
}

let manifest = null;
if (pkgDir) {
  ran.D1 = true;
  try {
    manifest = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
  } catch (e) {
    fail('D1', `${rel(pkgDir)}/package.json is unreadable: ${e.message}`);
  }
}

if (manifest) ran.D2 = true;
if (manifest && manifest.version !== PIN) {
  fail('D2', `the linked scheduler is ${manifest.version}, and this repository pins ${PIN} ` +
    '(Q3). Either the sibling moved or the pin did; a version bump means re-reading its ' +
    'AGENTS.md section 6, because there is no changelog');
}

// D3 — the build is not older than the source.
//
// "The source" is the sibling's OWN `deno.json` publish allowlist, so this cannot
// drift from what it considers its source: a new module it starts publishing is
// one this check starts watching, with no edit here.
if (pkgDir) {
  ran.D3 = true;
  ran.D4 = true;
  let allowed = [];
  try {
    const denoJson = JSON.parse(readFileSync(join(pkgDir, 'deno.json'), 'utf8'));
    allowed = (denoJson.publish?.exclude ?? [])
      .filter((e) => e.startsWith('!') && e.endsWith('.ts'))
      .map((e) => e.slice(1));
  } catch (e) {
    fail('D3', `${rel(pkgDir)}/deno.json is unreadable, so "its own source list" has no source: ${e.message}`);
  }

  if (allowed.length === 0 && !failures.some((f) => f.startsWith('D3'))) {
    fail('D3', `${rel(pkgDir)}/deno.json publishes no .ts file, which cannot be right — ` +
      'the allowlist this check reads has changed shape');
  }

  // `core/workerWrapperUrl.ts` is rewritten BY THE BUILD — `esbuild.config.js`
  // swaps in a stub before emitting types and restores it after
  // (`:253-268`), so its mtime is always a few seconds AFTER the dist it
  // produced. Comparing against it makes D4 fail every time, immediately after a
  // successful build. Excluded by name, with the citation, rather than by a
  // tolerance window that would hide a real staleness of the same size.
  const SELF_WRITTEN = new Set(['core/workerWrapperUrl.ts']);

  let newestSource = 0;
  let newestName = '';
  for (const name of allowed) {
    if (SELF_WRITTEN.has(name)) continue;
    try {
      const m = statSync(join(pkgDir, name)).mtimeMs;
      if (m > newestSource) { newestSource = m; newestName = name; }
    } catch {
      fail('D3', `${rel(pkgDir)}/deno.json lists ${name}, which does not exist`);
    }
  }

  // The guard `D3` and `D5` both carry and `D4` did not: with nothing left to
  // compare against, the `if (newestSource && ...)` below short-circuits and D4
  // reports `ok` having measured nothing. Reachable by growing `SELF_WRITTEN`,
  // which exists precisely because it is expected to grow. Found by W5's
  // test-adequacy pass.
  if (newestSource === 0 && !failures.some((f) => f.startsWith('D3'))) {
    fail('D4', 'no source file was left to compare dist/ against, so this check would pass ' +
      'having measured nothing — SELF_WRITTEN has swallowed the allowlist');
  }

  // Every artifact `exports` can select. A partial build is as wrong as no build.
  const artifacts = ['dist/node/index.js', 'dist/browser/index.js', 'dist/types/index.d.ts'];
  for (const a of artifacts) {
    let built;
    try {
      built = statSync(join(pkgDir, a)).mtimeMs;
    } catch {
      fail('D4', `${a} is missing from the linked scheduler. Node's \`exports\` selects it, ` +
        'so ladder L6 cannot run. Fix: `npm run build` in ../fyflow-scheduler');
      continue;
    }
    if (newestSource && built < newestSource) {
      const age = Math.round((newestSource - built) / 1000);
      fail('D4', `${a} is ${age}s older than ${newestName}, so Node would load a build that ` +
        'predates the source Deno loads — ADR 0013 cost 2. Fix: `npm run build` in ' +
        '../fyflow-scheduler');
    }
  }
}

// D5 — the build LOADS, and exposes what the source says it exports.
//
// D4 compares timestamps, which is the right tool for "stale" and the wrong one
// for "half-built" — a build that died after `dist/node` would pass it. The
// export list is **derived from the sibling's own `index.ts`** rather than
// hard-coded, so it needs no maintenance when its API moves: a value export it
// adds is one this check starts requiring.
if (pkgDir) {
  ran.D5 = true;
  let expected = [];
  try {
    const src = readFileSync(join(pkgDir, 'index.ts'), 'utf8');
    // `export { A, B } from '...'` — and NOT `export type { ... }`, which erases.
    for (const m of src.matchAll(/^\s*export\s*\{([^}]*)\}\s*from/gm)) {
      const line = src.slice(Math.max(0, m.index - 12), m.index + 12);
      if (/export\s+type/.test(line)) continue;
      for (const part of m[1].split(',')) {
        const name = part.trim().split(/\s+as\s+/).pop()?.trim();
        if (name) expected.push(name);
      }
    }
  } catch (e) {
    fail('D5', `${rel(pkgDir)}/index.ts is unreadable, so there is nothing to compare against: ${e.message}`);
  }

  // An empty list would make this check pass unconditionally, which is the
  // assertion-that-cannot-fail `doc/workflow.md` section 5 rule 3 forbids. The
  // sibling exports ten values; zero means the parse broke, not that it stopped.
  if (expected.length === 0 && !failures.some((f) => f.startsWith('D5'))) {
    fail('D5', `no value exports were parsed out of ${rel(pkgDir)}/index.ts. Either its export ` +
      'style changed or this check is silently vacuous — the second is worse');
  }

  if (expected.length) {
    try {
      const mod = await import(pathToFileURL(join(pkgDir, 'dist', 'node', 'index.js')).href);
      const missing = expected.filter((n) => !(n in mod));
      if (missing.length) {
        fail('D5', `dist/node/index.js is missing ${missing.length} value export(s) its own ` +
          `index.ts declares: ${missing.join(', ')}. A partial or failed build. ` +
          'Fix: `npm run build` in ../fyflow-scheduler');
      }
    } catch (e) {
      fail('D5', `dist/node/index.js does not load: ${e.message}. Fix: \`npm run build\` in ../fyflow-scheduler`);
    }
  }
}

// **A check that did not run is reported as `NOT RUN`, never as `ok`.**
// `doc/workflow.md` section 1 rule 4: *"a skipped check reported as passed makes
// the whole ladder worthless"*. D2-D5 are all guarded by `if (pkgDir)`, so with the
// link missing this printed four `ok` lines for four checks that never executed —
// in a script whose own header says it reports rather than fixes. Found by W5's
// test-adequacy pass. `ran` is set inside each block that actually runs.
const checks = [
  ['D1', ran.D1, `D1 the pinned scheduler is linked and readable`],
  ['D2', ran.D2, `D2 it is ${PIN}, the version this repository pins`],
  ['D3', ran.D3, `D3 its own publish allowlist names the source to compare against`],
  ['D4', ran.D4, `D4 its dist/ is not older than that source`],
  ['D5', ran.D5, `D5 its dist/ loads and exports what its index.ts declares`],
];
console.log(`scheduler check — ${pkgDir ? rel(pkgDir) : '<not linked>'}\n`);
for (const [id, didRun, label] of checks) {
  const bad = failures.filter((f) => f.startsWith(id + ':'));
  const verdict = bad.length ? 'FAIL   ' : didRun ? 'ok     ' : 'NOT RUN';
  console.log(`  ${verdict}  ${label}${bad.length ? ` (${bad.length})` : ''}`);
}
if (failures.length) {
  console.log('\n' + failures.map((f) => '  ' + f).join('\n'));
  console.log(`\n${failures.length} failure(s).`);
  process.exit(1);
}
console.log('\nAll checks passed.');
