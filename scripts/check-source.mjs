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

import { readdirSync, readFileSync, statSync } from 'node:fs';
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

const checks = [
  'S1 no node: import in published source',
  'S2 no Node global in published source',
  'S3 no DOM global in published source',
  'S4 no syntax Node cannot type-strip',
  'S5 no *.node.ts in the JSR publish set',
  'S6 every published file is in the JSR allowlist',
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
