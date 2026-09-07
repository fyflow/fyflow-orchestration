#!/usr/bin/env node
// Ladder L0 — **the pinned scheduler is installed from a registry, is the version
// this repository pins, and BOTH runtimes reach that same version.**
//
// **Rewritten 2026-08-31, and the hazard it guards changed shape.** Until then
// `fyflow-scheduler` 0.3.0 was on **no registry** — npm and JSR both stopped at
// 0.2.1, measured by W5 — so the pin was a `file:../fyflow-scheduler` link into a
// working tree, Node loaded that tree's gitignored `dist/` and Deno loaded its
// TypeScript source, and this file existed to stop the two diverging by a stale
// build. **Both registries now carry the pin**, so:
//
//   Node   node_modules/fyflow-scheduler   npm  fyflow-scheduler@0.5.1  -> dist/
//   Deno   examples/deno-import-map.json   JSR  @fyflow/scheduler@0.5.1 -> source
//
// **What that removes.** A published tarball cannot go stale against a source it
// no longer ships, so the old D3/D4 mtime comparison has nothing to compare and
// is gone. `npm install` no longer runs a build in another repository, which was
// [ADR 0013](../doc/decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)'s
// stated cost — the one write this repository made outside itself. And nothing on
// this machine can reach the sibling checkout through `node_modules`, which is
// the concrete accident that prompted the change: a junction placed there was
// followed by a recursive delete and took most of the sibling repository with it.
//
// **What it replaces it with, because the hazard did not disappear — it moved.**
// Two runtimes now reach two different registries, and they can pin different
// versions with both green. `D3` is that comparison, and it is this file's whole
// remaining reason to exist.
//
//   node scripts/check-scheduler.mjs
//
// Exits 0 when every check passes, 1 otherwise. It reports; it does not fix.
//
// `CHECK_SCHEDULER_DTS` points `D5`'s declaration parse at a copy, which is how
// `--self-test` reaches that clause without touching the installed package. It
// exists for the self-test and for nothing else, on the pattern of
// `CHECK_SOURCE_PKG`. **Three of `D5`'s four clauses were unreachable without it**
// — unreadable, empty-parse and missing-exports — and the middle one is
// [Q141](../doc/open-questions.md), which survived twelve green probes because no
// probe could supply a `.d.ts` the parse cannot read.

import { existsSync, lstatSync, readFileSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The pin, in one place. [Q3](../doc/open-questions.md) — and there is **no
 * changelog** upstream, so a bump here means re-reading its `AGENTS.md` section 6
 * rather than reading a diff. That reference ships inside the npm package, so it
 * is at `node_modules/fyflow-scheduler/AGENTS.md` rather than next door.
 */
const PIN = '0.5.1';

/** The JSR package Deno resolves the same specifier to. */
const JSR_NAME = '@fyflow/scheduler';

const failures = [];
const fail = (check, msg) => failures.push(`${check}: ${msg}`);
/** Which checks actually executed. See the reporting block at the bottom. */
const ran = { D1: false, D2: false, D3: false, D4: false, D5: false, D6: false };
/** The version the Deno half pins, for the report. `null` until `D3` parses one. */
let jsrPin = null;
const rel = (p) => relative(ROOT, p).replace(/\\/g, '/');

// --- D1: installed, readable, and NOT a link into a working tree --------------
//
// The link half is new and it is a regression guard with an incident behind it.
// `realpathSync` was what the old version used, deliberately, to check "what Node
// will actually load"; here the point is the opposite — a `node_modules` entry
// that is a junction or symlink means someone has reinstated the working-tree
// pin, and every recursive tool that touches this directory then reaches into
// another repository.
const pkgDir = join(ROOT, 'node_modules', 'fyflow-scheduler');
let manifest = null;
if (!existsSync(pkgDir)) {
  fail('D1', 'node_modules/fyflow-scheduler is missing. The pin is a registry devDependency ' +
    `(\`fyflow-scheduler\`@${PIN} on npm); run \`npm install\``);
} else if (lstatSync(pkgDir).isSymbolicLink()) {
  fail('D1', 'node_modules/fyflow-scheduler is a LINK, not an installed package. The pin is a ' +
    'registry version; a link points at a working tree, which is what this repository moved ' +
    'away from — and a recursive delete that follows one deletes the other repository');
} else {
  ran.D1 = true;
  try {
    manifest = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
  } catch (e) {
    fail('D1', `${rel(pkgDir)}/package.json is unreadable: ${e.message}`);
  }
}

// --- D2: it is the pin, and package.json asks for exactly the pin --------------
if (manifest) {
  ran.D2 = true;
  if (manifest.version !== PIN) {
    fail('D2', `the installed scheduler is ${manifest.version} and this repository pins ${PIN} ` +
      '(Q3). A version bump means re-reading its AGENTS.md section 6, because there is no changelog');
  }
  let own = null;
  try {
    own = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  } catch (e) {
    fail('D2', `package.json is unreadable: ${e.message}`);
  }
  const spec = own?.devDependencies?.['fyflow-scheduler'];
  if (spec === undefined) {
    fail('D2', 'package.json does not declare fyflow-scheduler as a devDependency. It must never ' +
      'be a runtime dependency — ADR 0013 rule 1, and `check-source.mjs` S8 refuses that half');
  } else if (spec !== PIN) {
    fail('D2', `package.json asks for "${spec}" and this check pins ${PIN}. A range would let ` +
      'the two runtimes drift on an ordinary install, which is exactly what D3 exists to stop; ' +
      'a `file:` specifier would reinstate the working-tree link');
  }
}

// --- D3: BOTH runtimes reach the same version ---------------------------------
//
// **The replacement hazard, and the only reason this file still exists.** Node
// resolves the bare specifier through npm and Deno resolves it through JSR, so
// the version is written down twice — and ladder L6 runs in both. Before, the two
// roads could differ by a stale build; now they can differ by a version, with
// every check green and L6 reporting 0.3.0 under one runtime and something else
// under the other. Same failure, new address.
{
  const mapPath = join(ROOT, 'examples', 'deno-import-map.json');
  let map = null;
  try {
    map = JSON.parse(readFileSync(mapPath, 'utf8'));
  } catch (e) {
    fail('D3', `${rel(mapPath)} is unreadable, so the Deno half of the pin has no source: ${e.message}`);
  }
  if (map) {
    ran.D3 = true;
    const spec = map.imports?.['fyflow-scheduler'];
    if (!spec) {
      fail('D3', `${rel(mapPath)} does not map the bare \`fyflow-scheduler\` specifier, so Deno ` +
        'cannot resolve it and ladder L6 cannot run there');
    } else if (spec.startsWith('.') || spec.startsWith('/') || spec.includes('..')) {
      fail('D3', `${rel(mapPath)} resolves the scheduler to a PATH ("${spec}"). The pin is a ` +
        'registry version; a path reinstates the working-tree dependency this repository removed');
    } else {
      const m = /^jsr:(@[\w.-]+\/[\w.-]+)@([\d.]+)$/.exec(spec);
      if (!m) {
        fail('D3', `${rel(mapPath)} maps the scheduler to "${spec}", which is not a pinned JSR ` +
          `specifier of the form jsr:${JSR_NAME}@<version>`);
      } else {
        if (m[1] !== JSR_NAME) {
          fail('D3', `${rel(mapPath)} points Deno at "${m[1]}" and this check expects ${JSR_NAME}`);
        }
        jsrPin = m[2];
        if (m[2] !== PIN) {
          fail('D3', `Deno would load ${m[1]}@${m[2]} and Node would load fyflow-scheduler@${PIN}. ` +
            'Ladder L6 runs in both, so this reports two runtimes green against two different ' +
            'schedulers — which is the divergence this check exists for');
        }
      }
    }
  }
}

// --- D4: every artifact Node's `exports` can select is present -----------------
//
// A published tarball can be partial the way a build can. Cheap, and it is what
// turns "cannot resolve" at L6 into a named L0 failure.
if (manifest) {
  ran.D4 = true;
  for (const a of ['dist/node/index.js', 'dist/browser/index.js', 'dist/types/index.d.ts']) {
    if (!existsSync(join(pkgDir, a))) {
      fail('D4', `${a} is missing from the installed package. Node's \`exports\` selects it, so ` +
        'ladder L6 cannot run. Reinstall, or the published tarball is incomplete');
    }
  }
}

// --- D5: it LOADS, and exposes what its own declarations say it exports --------
//
// The expected list is **derived from the package's own `dist/types/index.d.ts`**
// rather than hard-coded, so it needs no maintenance when the API moves: a value
// export it adds is one this check starts requiring. That file replaces the
// sibling's `index.ts`, which the npm tarball does not ship — the source of truth
// moved with the dependency, and this is the one check the move rewrote rather
// than deleted.
if (manifest) {
  ran.D5 = true;
  const dts = process.env.CHECK_SCHEDULER_DTS
    ? join(ROOT, process.env.CHECK_SCHEDULER_DTS)
    : join(pkgDir, 'dist', 'types', 'index.d.ts');
  const expected = [];
  try {
    const src = readFileSync(dts, 'utf8');
    // `export { A, B } from '...'` — and NOT `export type { ... }`, which erases.
    for (const line of src.split(/\r?\n/)) {
      const m = /^\s*export\s*\{([^}]*)\}\s*from/.exec(line);
      if (!m || /^\s*export\s+type/.test(line)) continue;
      for (const part of m[1].split(',')) {
        const name = part.trim().split(/\s+as\s+/).pop()?.trim();
        if (name) expected.push(name);
      }
    }
  } catch (e) {
    fail('D5', `${rel(dts)} is unreadable, so there is nothing to compare against: ${e.message}`);
  }

  // An empty list would make this check pass unconditionally, which is the
  // assertion-that-cannot-fail `doc/workflow.md` section 5 rule 3 forbids. The
  // package exports **ten** values; zero means the parse broke, not that it stopped.
  // *(This comment read "nine" from W5 until W29's adequacy reader counted them —
  // in the clause W29 built three probes for, which is the item that should have
  // caught it. `doc/` is not the only place a number goes stale unread.)*
  if (expected.length === 0 && !failures.some((f) => f.startsWith('D5'))) {
    fail('D5', `no value exports were parsed out of ${rel(dts)}. Either its declaration style ` +
      'changed or this check is silently vacuous — the second is worse');
  }

  if (expected.length) {
    try {
      const mod = await import(pathToFileURL(join(pkgDir, 'dist', 'node', 'index.js')).href);
      const missing = expected.filter((n) => !(n in mod));
      if (missing.length) {
        fail('D5', `dist/node/index.js is missing ${missing.length} value export(s) its own ` +
          `declarations name: ${missing.join(', ')}. A partial or mismatched publish`);
      }
    } catch (e) {
      fail('D5', `dist/node/index.js does not load: ${e.message}`);
    }
  }
}

if (process.argv.includes('--self-test')) {
  const { selfTest } = await import('./check-scheduler-selftest.mjs');
  process.exit(await selfTest(ROOT));
}

// **A check that did not run is reported as `NOT RUN`, never as `ok`.**
// `doc/workflow.md` section 1 rule 4: *"a skipped check reported as passed makes
// the whole ladder worthless"*. Every block above was once guarded by one
// `if (pkgDir)`, so with the link missing this printed four `ok` lines for four
// checks that never executed — found by W5's test-adequacy pass. `ran` is set
// inside each block that actually runs.
// --- D6: the Deno rung actually READS the Deno pin ----------------------------
//
// **`D3` compares two pins and nothing compared the commands that CONSUME them** —
// W36's adequacy reader, and obligation (e) in the exact form this item's own
// Verification section named. Measured twice, each for ZERO failures:
//
//   1. drop `--import-map=examples/deno-import-map.json` from `test:l6:deno` and
//      Deno resolves the bare `fyflow-scheduler` specifier out of `node_modules` —
//      the **npm** package. L6 prints `25 real runs on fyflow-scheduler 0.5.1, on
//      deno 2.9.6`, 489 assertions, exit 0, and this check prints five `ok` rows
//      **including `D3`**. The JSR half is never loaded at all.
//   2. replace the command with `node examples/l6.ts` and the Deno rung is gone,
//      while every check still passes and the banner says "node" twice.
//
// `S12` binds the gate chain's entry NAMES — by equality and in order — and
// **nothing binds an entry's ARGUMENTS**. So `D3`'s own premise, *ladder L6 runs in
// both runtimes*, was a fact about a command string that nothing checked, which
// makes `D3` a comparison between two files one of which need never be opened.
//
// **It lives here rather than in `check-source.mjs` because the premise belongs to
// the check that rests on it**: without this, `D3` is decoration.
{
  let ourPkg = null;
  try {
    ourPkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  } catch {
    // **Deliberately silent, and `ran.D6` stays false.** `D2` already owns the
    // unreadable-manifest clause and reports it; a second `fail()` for one cause
    // would be two clauses under two ids for one defect, which is the co-firing
    // shape W29 measured and `doc/workflow.md` section 5 rule 8 asks to be told
    // apart from masking. An unreadable manifest means D6 genuinely **did not
    // run**, and the report says so — which is W5's own finding and section 1
    // rule 4's subject.
  }
  if (ourPkg) {
    ran.D6 = true;
    const rung = ourPkg.scripts?.['test:l6:deno'];
    const mapRel = 'examples/deno-import-map.json';
    if (typeof rung !== 'string') {
      fail('D6', 'package.json has no `test:l6:deno` script, so ladder L6 has no Deno rung — and ' +
        "`D3`'s premise is that it runs in both runtimes");
    } else {
      if (!/(^|\s)deno\s+run(\s|$)/.test(rung)) {
        fail('D6', `\`test:l6:deno\` does not invoke \`deno run\`: it is ${JSON.stringify(rung)}. ` +
          'A rung named for a runtime it does not start is a rung reported by omission ' +
          '(`doc/workflow.md` section 1 rule 4)');
      }
      if (!rung.includes(`--import-map=${mapRel}`)) {
        fail('D6', `\`test:l6:deno\` does not pass \`--import-map=${mapRel}\`, so Deno resolves the ` +
          'bare `fyflow-scheduler` specifier out of `node_modules` — the npm package — and the JSR ' +
          'pin D3 just compared is never read. Measured: L6 then reports "on deno" while running ' +
          'the npm build, with every other clause green');
      }
    }
  }
}

const checks = [
  ['D1', ran.D1, `D1 the pinned scheduler is installed from a registry, not linked`],
  ['D2', ran.D2, `D2 it is ${PIN}, and package.json asks for exactly ${PIN}`],
  ['D3', ran.D3, `D3 Deno's JSR pin is the same version as Node's npm pin`],
  ['D4', ran.D4, `D4 every artifact \`exports\` selects is present`],
  ['D5', ran.D5, `D5 it loads and exports what its own declarations name`],
  ['D6', ran.D6, `D6 the Deno rung reads the Deno pin`],
];
// **Both halves carry a VERSION.** This printed the JSR package NAME with no version
// at all — the one line where a human sees the two pins side by side, omitting the
// number the whole check is about. W36's adequacy reader.
console.log(`scheduler check — fyflow-scheduler@${manifest?.version ?? '<not installed>'} ` +
  `(npm) / ${JSR_NAME}@${jsrPin ?? '<unpinned>'} (JSR)\n`);
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
