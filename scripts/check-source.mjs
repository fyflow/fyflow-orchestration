#!/usr/bin/env node
// `RT-R4`'s grep, and `RT-R5`'s backstop — ladder L0 over PUBLISHED source.
//
// spec/runtime-targets.md mandates this check and W3 shipped without it: the
// negative tests were run by hand once and reported as a gate. This is the
// checked-in version.
//
// It exists because no typecheck covers the union:
//   - the browser tsconfig catches Node globals and `node:` imports, but only
//     because `types: []` removes @types/node — a config change silently disables it;
//   - the Node tsconfig catches `document` and `window` but NOT `localStorage`,
//     which @types/node declares globally;
//   - `RT-R9`'s type-stripping constraint is caught by no checker at all.
//
//   node scripts/check-source.mjs
//
// Exits 0 when every check passes, 1 otherwise. It reports; it does not fix.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const fail = (check, msg) => failures.push(`${check}: ${msg}`);

/** The published set. `RT-R7` exempts everything else — scripts/, test/, configs. */
function published() {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name.endsWith('.ts')) out.push(p);
    }
  };
  walk(join(ROOT, 'src'));
  out.push(join(ROOT, 'index.ts'));
  return out;
}

const rel = (p) => relative(ROOT, p).replace(/\\/g, '/');

// RT-R4 — every import form, not just `from "node:…"`.
const NODE_IMPORT = [
  /\bfrom\s+['"]node:/,
  /^\s*import\s+['"]node:/m,
  /\bimport\s*\(\s*['"]node:/,
  /\brequire\s*\(/,
];
// RT-R4 — Node globals as free identifiers. Not import specifiers, so no
// resolver sees them, and the browser bundle links them to nothing.
const NODE_GLOBALS = [
  'process', 'Buffer', '__dirname', '__filename', 'global', 'setImmediate', 'clearImmediate',
];
// RT-R5 — `localStorage` is the one the Node tsconfig does NOT catch, because
// @types/node declares it globally. That is exactly why this rule needs a grep.
const DOM_GLOBALS = ['document', 'window', 'localStorage', 'sessionStorage', 'navigator'];
// RT-R9 — syntax Node's type stripping cannot erase. No typechecker objects.
const UNSTRIPPABLE = [
  [/\bconstructor\s*\([^)]*\b(?:public|private|protected|readonly)\s+\w/s, 'a constructor parameter property'],
  [/^\s*(?:export\s+)?(?:const\s+)?enum\s+\w/m, 'an enum'],
  [/^\s*(?:export\s+)?namespace\s+\w/m, 'a namespace'],
  [/^\s*@\w+/m, 'a decorator'],
  [/\bimport\s+\w+\s*=\s*require\s*\(/, 'import = require()'],
];

/** Comments removed. String literals KEPT — an import specifier lives inside one. */
function withoutComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1 ');
}

/** Comments AND strings removed, so a rule name quoted in prose is not a violation. */
function code(text) {
  return withoutComments(text)
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
}

const files = published();
for (const p of files) {
  const raw = readFileSync(p, 'utf8');
  const src = code(raw);
  const imports = withoutComments(raw);

  for (const re of NODE_IMPORT) {
    if (re.test(imports) && !p.endsWith('.node.ts')) {
      fail('S1', `${rel(p)} imports a Node builtin (${re}) outside a *.node.ts file — RT-R4`);
    }
  }
  for (const name of NODE_GLOBALS) {
    if (new RegExp(`(^|[^.\\w$])${name}\\s*[.([]`).test(src) && !p.endsWith('.node.ts')) {
      fail('S2', `${rel(p)} uses the Node global "${name}" — RT-R4. It bundles silently for the browser and throws at runtime`);
    }
  }
  for (const name of DOM_GLOBALS) {
    if (new RegExp(`(^|[^.\\w$])${name}\\s*[.([]`).test(src)) {
      fail('S3', `${rel(p)} uses the DOM global "${name}" — RT-R5`);
    }
  }
  for (const [re, what] of UNSTRIPPABLE) {
    if (re.test(src)) {
      fail('S4', `${rel(p)} contains ${what} — RT-R9. Node runs TypeScript by erasing types, so this fails at load and no typechecker objects`);
    }
  }
}

// RT-R4's other half, and S6: the allowlist must actually describe the tree.
//
// S5/S6 exist because the third conformity pass found `deno publish` broken —
// `index.ts` exported a module the allowlist did not list, so the JSR package
// would have shipped a dangling export. `published()` above walks `src/` on disk,
// so on its own it could never disagree with `deno.json`; this is the comparison
// that makes the allowlist checkable rather than decorative.
const denoJson = JSON.parse(readFileSync(join(ROOT, 'deno.json'), 'utf8'));
const allowed = new Set(
  (denoJson.publish?.exclude ?? []).filter((e) => e.startsWith('!')).map((e) => e.slice(1)),
);
for (const entry of allowed) {
  if (/\.node\.ts$/.test(entry)) fail('S5', `deno.json publishes ${entry}, a *.node.ts file — RT-R4`);
}
for (const p of files) {
  const name = rel(p);
  if (!allowed.has(name)) {
    fail('S6', `${name} is published source but is not in deno.json's publish allowlist — ` +
      'JSR ships TypeScript source, so an unlisted module referenced by an export fails at publish');
  }
}

// S7 — ADR 0013 rule 2. **No published file may import the scheduler**, by any
// name and by any route.
//
// The library depends on `fyflow-scheduler` NOT AT ALL: `SchedulerLike` and
// `TaskFactory` are structural (ADR 0001 rule 2), and a consumer passes its own
// scheduler in. That is what makes the published npm and JSR packages
// dependency-free, and W5 is the first item with the library on disk and a
// `node_modules` entry pointing at it — so it is the first item that could break
// it by autocomplete.
//
// It would typecheck, `deno publish --dry-run` would pass (JSR resolves the
// specifier), and every other check here would stay green. The failure is
// architectural, not mechanical: a driver that can construct a scheduler is a
// driver that will.
// **The package answers to TWO names, and the second was the one this check
// missed.** npm publishes `fyflow-scheduler`; JSR publishes **`@fyflow/scheduler`**
// — ADR 0013's own Context measured both, at 0.2.1. A Deno consumer runs
// `deno add jsr:@fyflow/scheduler` and then writes the **bare** `@fyflow/scheduler`
// in source, with no `jsr:` prefix anywhere near the import. That is the
// highest-probability real form of this mistake and it was the one form not
// matched. Found by W5's test-adequacy pass; the `jsr:`/`npm:` prefixed forms fall
// out of the same alternation.
const NAMES = '(?:fyflow-scheduler|@fyflow/scheduler)';
const SCHEDULER_REACH = [
  [new RegExp(`\\bfrom\\s+['"][^'"]*${NAMES}`), 'an import of the scheduler'],
  [new RegExp(`^\\s*import\\s+['"][^'"]*${NAMES}`, 'm'), 'a side-effect import of the scheduler'],
  [new RegExp(`\\bimport\\s*\\(\\s*['"][^'"]*${NAMES}`), 'a dynamic import of the scheduler'],
  [new RegExp(`\\brequire\\s*\\(\\s*['"][^'"]*${NAMES}`), 'a require() of the scheduler'],
  [/\bfrom\s+['"][^'"]*\.\.\/fyflow-scheduler/, 'a relative reach into ../fyflow-scheduler'],
];
// **What a regex cannot close, stated so `S7`'s reach is not overstated:** a
// specifier built at run time — `import('fyflow' + '-scheduler')`, or a `const`
// holding the name. Both survive. `S7` raises the cost of the mistake; it does not
// make it impossible.
for (const p of files) {
  // Import specifiers live in string literals, so this reads the comment-stripped
  // text rather than `code()` — which blanks strings and would blank the evidence.
  const imports = withoutComments(readFileSync(p, 'utf8'));
  for (const [re, what] of SCHEDULER_REACH) {
    if (re.test(imports)) {
      fail('S7', `${rel(p)} contains ${what} — ADR 0013 rule 1. The published library depends on ` +
        'the scheduler NOT AT ALL; SchedulerLike is structural and the caller passes one in');
    }
  }
}

// S6's converse. `published()` walks `src/` plus `index.ts`, so a `.ts` added to
// the allowlist ANYWHERE ELSE — `lib/`, `runtime/` — is shipped to JSR and is
// invisible to S1-S4 and S7. S6 compares the two lists in one direction only; this
// is the other. Found by W5's spec-conformity pass.
for (const entry of allowed) {
  if (!entry.endsWith('.ts')) continue;
  if (!files.some((p) => rel(p) === entry)) {
    fail('S6', `deno.json publishes ${entry}, which is outside the set this script scans ` +
      '(src/** plus index.ts) — so S1-S4 and S7 never see it. Either move it under src/ or widen ' +
      'published()');
  }
}

// S8 — ADR 0013 rule 1's MANIFEST half. `S7` refuses the import; nothing refused
// the declaration, and ADR 0013's own *Alternatives rejected* calls a
// `peerDependency` on the scheduler "a false statement in a manifest".
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
  for (const name of Object.keys(pkg[field] ?? {})) {
    if (/fyflow-scheduler|@fyflow\/scheduler/.test(name)) {
      fail('S8', `package.json ${field} declares "${name}" — ADR 0013 rule 1. The published ` +
        'package depends on the scheduler NOT AT ALL; it belongs in devDependencies, which ' +
        'consumers do not install');
    }
  }
}
for (const spec of Object.keys(denoJson.imports ?? {})) {
  if (/fyflow-scheduler|@fyflow\/scheduler/.test(spec)) {
    fail('S8', `deno.json imports "${spec}" — ADR 0013 rule 3. deno.json is the JSR publish ` +
      'manifest; the Deno mapping belongs in examples/deno-import-map.json, which only the L6 ' +
      'runner reads');
  }
}

// S9 — ADR 0013 rule 6 / `RT-R10`, which claimed to be structural and was not.
//
// `scripts/build-browser-tests.mjs` globs `test/**/*.test.ts`. That glob is what
// would carry a scheduler import INTO the browser bundle, not what keeps one out:
// the sibling ships a `browser` export condition, so esbuild resolves it happily
// and the bundle grows by the whole scheduler with no warning. Measured by both of
// W5's review passes, independently. This is the mechanism the rule asserted.
//
// `RT-R7` exempts tooling from the *import* rules; this is a different constraint
// — what the browser bundle's INPUT SET may reach — and L6 is in `examples/`
// precisely so it is out of that set.
function browserBundleInputs() {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name.endsWith('.ts')) out.push(p);
    }
  };
  walk(join(ROOT, 'test'));
  return out;
}
for (const p of browserBundleInputs()) {
  const imports = withoutComments(readFileSync(p, 'utf8'));
  for (const [re] of SCHEDULER_REACH) {
    if (re.test(imports)) {
      fail('S9', `${rel(p)} imports the scheduler, and test/** is bundled for the browser by ` +
        'scripts/build-browser-tests.mjs — ADR 0013 rule 6. Ladder L6 lives in examples/, which ' +
        'that glob does not reach');
    }
  }
}

// S10 — ADR 0013 rule 4: the specifier is bare in source and the resolution is
// configuration. `examples/**` is the one tree that imports the scheduler at all,
// and it is the one tree no other check looks at.
function exampleSources() {
  const dir = join(ROOT, 'examples');
  const out = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name.endsWith('.ts') || name.endsWith('.js')) out.push(p);
    }
  };
  try { walk(dir); } catch { /* no examples/ yet */ }
  return out;
}
for (const p of exampleSources()) {
  // `withoutComments`, never `code()`: a path lives inside a string literal and
  // `code()` blanks those. The same reasoning `S1` carries, and getting it wrong
  // here made this check pass its own negative test.
  const src = withoutComments(readFileSync(p, 'utf8'));
  if (/\.\.\/fyflow-scheduler|\.\.\/\.\.\/fyflow-scheduler/.test(src)) {
    fail('S10', `${rel(p)} writes a path into the sibling repository — ADR 0013 rule 4. The ` +
      'specifier is bare in source and the resolution is configuration: node_modules for Node, ' +
      'examples/deno-import-map.json for Deno');
  }
}

// --- S11: every `check:*` script is reachable from `npm run gate` -------------
// **A check nobody runs is a check that does not exist**, and until W16 nothing
// said so. Its adequacy reader measured the cost on the newest one: removing
// `check:policies` from the `gate` chain, removing `check:policies:selftest`, and
// replacing the script body with `node --version` all left `npm run gate` green.
// That is W15's `render.ts` finding one level up — a declared mechanism executed
// by a script nothing asserts — and `JP-R9`'s test clause says in terms *"run by
// `npm run gate`"*.
//
// **It lives here rather than in the script it was written for**, and that is the
// whole point: a wiring check inside `check-policies.mjs` cannot fire when
// `check-policies` is the entry that was dropped. This file is independently in
// the chain, so removing any OTHER entry is caught by a script that still runs.
// Removing `check:source` itself is the one case no in-repo check can see.
{
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const scripts = pkg.scripts ?? {};
  const gate = scripts.gate ?? '';
  if (!gate) fail('S11', 'package.json has no `gate` script');
  for (const [name, cmd] of Object.entries(scripts)) {
    if (!name.startsWith('check:')) continue;
    if (!new RegExp(`npm run ${name.replace(/[:]/g, '[:]')}(?![:\\w])`).test(gate)) {
      fail('S11', `package.json declares "${name}" and \`npm run gate\` does not run it — ` +
        'a check outside the gate is a check that does not exist');
    }
    // **And the entry has to run a script that exists.** Being named in the chain
    // is not the same as doing anything: `"check:policies": "node --version"` is
    // in the gate, exits 0, and checks nothing. Measured as a survivor of the
    // first version of S11, which asserted only the name.
    const m = /scripts\/([\w.-]+\.mjs)/.exec(cmd ?? '');
    if (!m) {
      fail('S11', `package.json's "${name}" does not run anything under scripts/ — "${cmd}"`);
    } else if (!existsSync(join(ROOT, 'scripts', m[1]))) {
      fail('S11', `package.json's "${name}" runs scripts/${m[1]}, which does not exist`);
    }
  }
}

const checks = [
  'S1 no node: import in published source',
  'S2 no Node global in published source',
  'S3 no DOM global in published source',
  'S4 no syntax Node cannot type-strip',
  'S5 no *.node.ts in the JSR publish set',
  'S6 the published set and the JSR allowlist describe each other',
  'S7 no published file imports the scheduler',
  'S8 no manifest declares the scheduler as a runtime dependency',
  'S9 nothing in the browser bundle’s input set imports the scheduler',
  'S10 no file under examples/ writes a path into the sibling repository',
  'S11 every check:* script is reachable from `npm run gate`',
];
console.log(`source check — ${files.length} published files\n`);
for (const c of checks) {
  const bad = failures.filter((f) => f.startsWith(c.slice(0, 2) + ':'));
  console.log(`  ${bad.length ? 'FAIL' : 'ok  '}  ${c}${bad.length ? ` (${bad.length})` : ''}`);
}
if (failures.length) {
  console.log('\n' + failures.map((f) => '  ' + f).join('\n'));
  console.log(`\n${failures.length} failure(s).`);
  process.exit(1);
}
console.log('\nAll checks passed.');
