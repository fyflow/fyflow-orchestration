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
//   node scripts/check-source.mjs              node scripts/check-source.mjs --self-test
//
// Exits 0 when every check passes, 1 otherwise. It reports; it does not fix.
//
// `CHECK_SOURCE_PKG` points the manifest checks (`S8`, `S11`, `S12`, `S13`) at a
// copy, which is how `--self-test` breaks the manifest without touching the tree;
// `CHECK_SOURCE_DENO` does the same for `deno.json` (`S5`, `S6`, and `S8`'s JSR half — W57).
// `CHECK_SOURCE_SELFTEST` points `--self-test` at a copy of the probe file, which
// is how the probe list's own floor is provoked.
//
// **`CHECK_SOURCE_SRC` points the PUBLISHED SET at a copy of `src/` and `index.ts`,
// and W30 added it for `S4` and `S7` — the two clauses no second mechanism guards.**
// Both loop over `published()`, so until there was a way to hand this script a
// different published tree, every one of `S1`-`S4`, `S7` could be **emptied entirely
// for 0 failures with all 24 probes green**. Measured at W30's declaration, four
// ways: `UNSTRIPPABLE` emptied, `S4`'s clause made inert, the published loop's
// `SCHEDULER_REACH` emptied, `S7`'s clause made inert — **all four inert on the
// clean tree and all four at 24/24**.
//
// **`rel()` resolves against whichever root a path is under**, which is what keeps
// the override from being noise: `S6` compares `rel(p)` to `deno.json`'s allowlist,
// so a copy under `dev-dist/` reported relative to `ROOT` would fail `S6` on every
// file it holds. Unset, `SRC_ROOT === ROOT` and the expression is the one that was
// here before. Neither variable exists for anything but the self-test.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

if (process.argv.includes('--self-test')) {
  const mod = process.env.CHECK_SOURCE_SELFTEST ?? join(ROOT, 'scripts', 'check-source-selftest.mjs');
  // `resolve`, not `join`: the default is already absolute and `join` would
  // concatenate it onto ROOT.
  const { selfTest } = await import(pathToFileURL(resolve(ROOT, mod)).href);
  process.exit(await selfTest(ROOT));
}

const PKG_PATH = process.env.CHECK_SOURCE_PKG ?? 'package.json';
const SRC_ROOT = process.env.CHECK_SOURCE_SRC ? resolve(ROOT, process.env.CHECK_SOURCE_SRC) : ROOT;
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
  walk(join(SRC_ROOT, 'src'));
  out.push(join(SRC_ROOT, 'index.ts'));
  return out;
}

// See `CHECK_SOURCE_SRC` in the header: a path under the overridden published tree
// is labelled relative to THAT tree, so `S6`'s comparison against `deno.json`'s
// allowlist still reads `src/driver/driver.ts` rather than a `dev-dist/` prefix.
// With the variable unset this is `relative(ROOT, p)` and nothing else.
const rel = (p) =>
  relative(SRC_ROOT !== ROOT && p.startsWith(SRC_ROOT) ? SRC_ROOT : ROOT, p).replace(/\\/g, '/');

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
// `CHECK_SOURCE_DENO` points this at a copy, on `CHECK_SOURCE_PKG`'s pattern — W57, for
// `S8`'s `deno.json` half, which had no probe while its only clause refused a mapping outright.
const DENO_PATH = process.env.CHECK_SOURCE_DENO ?? 'deno.json';
const denoJson = JSON.parse(readFileSync(join(ROOT, DENO_PATH), 'utf8'));
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

// S7 — `RT-R11`, ADR 0048 rule 4, superseding ADR 0013 rule 2. **A published file
// reaches the scheduler by the BARE specifier `fyflow-scheduler`, and by no other form.**
//
// Until W57 this clause refused the import in EVERY form, because ADR 0013 rule 1 said
// the library depends on the scheduler not at all. ADR 0048 makes it a declared
// dependency — `src/driver/driver.ts` imports `FyflowTask` for the default `createTask`
// — and NARROWS this clause to the FORM of the reach rather than retiring it. Measured
// at W57 before choosing: `check-scheduler.mjs`'s `D1`-`D3` read `node_modules`,
// `package.json` and the L6 import map and no source file, so a relative reach into
// `../fyflow-scheduler` from `src/` — the 2026-08-31 shape — would otherwise be guarded
// by nothing but whether a sibling checkout happens to exist on the machine.
//
//   `@fyflow/scheduler`     the JSR name, which Node cannot resolve
//   `jsr:` / `npm:` prefix  a registry, which Node and the browser cannot resolve
//   `file:`                 a working tree
//   `../fyflow-scheduler`   a working tree, by path
//
// The resolution is configuration — `node_modules`, `deno.json`, the L6 map — and never
// the specifier: ADR 0013 rule 4, kept and made normative as `RT-R11`.
//
// **What a regex cannot close, stated so `S7`'s reach is not overstated:** a specifier
// built at run time — `import('fyflow' + '-scheduler')`, or a `const` holding the name.
// Both survive. `S7` raises the cost of the mistake; it does not make it impossible.
const SCHEDULER_NAMES = /fyflow-scheduler|@fyflow\/scheduler/;
const CANONICAL_SPECIFIER = 'fyflow-scheduler';
/** Every import form's specifier, captured: `from`, side-effect, dynamic, `require()`. */
const SPECIFIER_FORMS = [
  // The quote class carries the BACKTICK since W57's adequacy reader (m05): `import(`jsr:…`)` in a
  // template literal passed every form and only `typecheck:node` saw it.
  /\bfrom\s+['"`]([^'"`]+)['"`]/g,
  /^\s*import\s+['"`]([^'"`]+)['"`]/gm,
  /\bimport\s*\(\s*['"`]([^'"`]+)['"`]/g,
  /\brequire\s*\(\s*['"`]([^'"`]+)['"`]/g,
];
const reachesSchedulerWrongly = (spec) => SCHEDULER_NAMES.test(spec) && spec !== CANONICAL_SPECIFIER;
for (const p of files) {
  // Import specifiers live in string literals, so this reads the comment-stripped
  // text rather than `code()` — which blanks strings and would blank the evidence.
  const imports = withoutComments(readFileSync(p, 'utf8'));
  for (const re of SPECIFIER_FORMS) {
    for (const m of imports.matchAll(re)) {
      if (reachesSchedulerWrongly(m[1])) {
        fail('S7', `${rel(p)} reaches the scheduler as "${m[1]}" — RT-R11 / ADR 0048 rule 4. A published ` +
          `file names it by the bare specifier "${CANONICAL_SPECIFIER}" and nothing else: the JSR name ` +
          'and a jsr:/npm: prefix resolve in one runtime and not the others, and file: or ../ is a working tree');
      }
    }
  }
}

// S14 — `RT-R12`, ADR 0052: a SECOND dependency, `jsonata`, reached from ONE sub-path and by
// ONE form. The engine is loaded by `src/jsonata/**` and by nothing else in the published set —
// not the pure entry, not the scheduler sub-path (ADR 0049 rule 5's shape, one sub-path over: a
// root or a helper re-exporting the adapter carries the engine to every consumer, and nothing but
// this clause sees a re-export). Inside `src/jsonata/` the specifier is the bare `jsonata`: an
// `npm:` prefix resolves in one runtime only, a path into `node_modules` is a layout, and a path or
// URL to the engine's own file is a copy beside the one the manifests declare. The specifier's
// resolution is configuration — `node_modules` for Node and the browser, `deno.json`'s `imports`
// for Deno — exactly as `S7` holds for the scheduler, and the same regex limit applies: a specifier
// built at run time survives.
const JSONATA_NAMES = /(^|[\/:])jsonata(?=$|[\/@.?#])/;
const JSONATA_DIR = 'src/jsonata/';
for (const p of files) {
  const r = rel(p);
  const imports = withoutComments(readFileSync(p, 'utf8'));
  // `form`, not `re`: the loop head is a self-test anchor for `S7`'s copy of this loop, and an
  // identical second line made that anchor ambiguous (W62's first self-test run, W29's guard).
  for (const form of SPECIFIER_FORMS) {
    for (const m of imports.matchAll(form)) {
      const spec = m[1];
      if (!JSONATA_NAMES.test(spec)) continue;
      if (!r.startsWith(JSONATA_DIR)) {
        fail('S14', `${r} reaches jsonata as "${spec}" — RT-R12 / ADR 0052. Only src/jsonata/** loads the engine; ` +
          'the pure entry and the scheduler sub-path carry none of it, so a consumer who never transforms never pays for it');
      } else if (spec !== 'jsonata') {
        fail('S14', `${r} reaches jsonata as "${spec}" — RT-R12 / ADR 0052. The bare specifier "jsonata" and nothing else: ` +
          'an npm: prefix, a path or a URL resolves in one runtime and not the others, or beside the copy the manifests declare');
      }
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

// S8 — `RT-R11`'s MANIFEST half: ADR 0048 rules 1, 2 and 7, superseding ADR 0013 rule 1's.
// `S7` binds the FORM of the reach in source; this binds the DECLARATION in the two
// published manifests, and `check-scheduler.mjs`'s `D8` binds both declarations to `PIN`.
//
// Until W57 this refused a `peerDependencies` entry as *"a false statement in a
// manifest"* — ADR 0013's words, true while the pinned version was on no registry. `D8`
// now REQUIRES that entry. What stays refused is a SECOND declaration: a `dependencies`
// or `optionalDependencies` entry installs a private copy of the scheduler beside
// whatever the consumer holds, and two copies of `FyflowTask` are two classes —
// `addTask` takes one and `instanceof` sees the other.
//
// **Read once, here, and used by `S8`, `S11`, `S12` and `S13`.** It was read twice
// before W24 — this block and `S11`'s — and a self-test needs one place to point at a copy.
const pkg = JSON.parse(readFileSync(join(ROOT, PKG_PATH), 'utf8'));
for (const field of ['dependencies', 'optionalDependencies']) {
  for (const name of Object.keys(pkg[field] ?? {})) {
    if (SCHEDULER_NAMES.test(name)) {
      fail('S8', `${PKG_PATH} ${field} declares "${name}" — RT-R11 / ADR 0048 rule 7. The scheduler is a ` +
        'PEER dependency (D8 holds it to the pin); a second declaration here installs a second copy ' +
        'beside the consumer`s, and two copies of FyflowTask are two classes');
    }
  }
}
// The JSR manifest's half. `deno.json` MUST map the scheduler — ADR 0048 rule 2, to the
// pinned `jsr:` form, which `D8` checks — and may NOT map it to a PATH. That was ADR 0013
// rule 3's real objection (*a path outside the package sitting in what we publish*), it
// survives that rule, and it is ADR 0029 rule 3's incident arriving in the publish manifest.
// **`imports` AND every `scopes` block** — W57's adequacy reader (m22) re-mapped the scheduler for
// `./src/` alone, to a working tree, with `imports` intact and every check green. And an ABSOLUTE
// Windows path (`C:/…`) is a path too (m24).
const denoMaps = [['imports', denoJson.imports ?? {}],
  ...Object.entries(denoJson.scopes ?? {}).map(([s, m]) => [`scopes["${s}"]`, m ?? {}])];
for (const [where, map] of denoMaps) for (const [spec, target] of Object.entries(map)) {
  const t = String(target);
  if (!SCHEDULER_NAMES.test(spec) && !SCHEDULER_NAMES.test(t)) continue;
  if (t.startsWith('.') || t.startsWith('/') || t.includes('..') || t.startsWith('file:') || /^[A-Za-z]:[\\/]/.test(t)) {
    fail('S8', `${DENO_PATH} ${where} maps "${spec}" to a PATH ("${t}") — RT-R11 / ADR 0029 rule 3. deno.json is ` +
      'the JSR publish manifest; the scheduler is reached from a registry, jsr:@fyflow/scheduler at the ' +
      'pin, and never from a working tree');
  }
}

// The test tree, walked for `S13`'s lint-target clause below. **Until W57 this was `S9`'s
// input set** — *no file in the browser bundle's input set imports the scheduler*, ADR 0013
// rule 6 — and `S9` is RETIRED by ADR 0048 rule 7: once `src/driver/driver.ts` imports the
// scheduler, every suite that imports the driver carries its browser build into
// `dev-dist/browser/tests.js` by construction (measured at W57: 27 files / 703 cases in
// chromium, firefox and webkit with it in), and a rule whose property nothing can have is
// not a rule. What still keeps a scheduler RUN out of the browser is the glob: L6 lives in
// `examples/**`, which `scripts/build-browser-tests.mjs` does not reach — `RT-R10`.
function testSources() {
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

// S15 — `RT-R12`, ADR 0052: the second dependency is DECLARED where each installer reads it, at
// ONE pin, and its sub-path is EXPORTED by both manifests. `S14` binds the form of the reach in
// source; this binds the declaration — the maintainer's shape (W62): `dependencies` at exactly the
// pin (a pure-function engine has no class identity to keep single, so a private copy beside a
// consumer's is harmless, and the exact pin is earned by the internals the adapter relies on — its
// plain-object errors, its sequence markers, its `$eval` codes), and `deno.json`'s `imports` at
// `npm:jsonata@<pin>` because no JSR package exists. A SECOND field naming the engine —
// `peerDependencies`, `optionalDependencies`, `peerDependenciesMeta`, or `devDependencies` beside
// `dependencies` — is refused: W57's adequacy reader found the hole in the field ADJACENT to the one
// a check reads. The two export maps must carry `./jsonata` with the scheduler sub-path's shape,
// because ladder L6's clause (2c) names the scheduler sub-path by literal and nothing else reads
// the maps. `check-scheduler.mjs`'s `D8` is the scheduler's pin; this is jsonata's, and the pin is
// written ONCE here and in no consumer document (ADR 0052 names the value it decides; AGENTS.md
// points at package.json — W62's conformity reader found the number in section 14 and it was removed).
const JSONATA_PIN = '2.2.2';
{
  const deps = pkg.dependencies ?? {};
  if (deps.jsonata !== JSONATA_PIN) {
    fail('S15', `${PKG_PATH} dependencies.jsonata is ${JSON.stringify(deps.jsonata)} — RT-R12 / ADR 0052 rule 1: exactly "${JSONATA_PIN}"`);
  }
  // The two ARRAY-valued fields are in the list since W62's adequacy reader (m11) shipped the
  // engine's eight files in the tarball through `bundledDependencies: ["jsonata"]` with every check
  // green — an array's keys are its indices, so the object read below saw nothing.
  for (const field of ['peerDependencies', 'optionalDependencies', 'peerDependenciesMeta', 'devDependencies', 'bundledDependencies', 'bundleDependencies']) {
    const names = Array.isArray(pkg[field]) ? pkg[field].map(String) : Object.keys(pkg[field] ?? {});
    if (names.some((n) => JSONATA_NAMES.test(n))) {
      fail('S15', `${PKG_PATH} ${field} names jsonata — RT-R12 / ADR 0052 rule 1: ONE declaration, in dependencies, and no field beside it`);
    }
  }
  const mapped = denoJson.imports?.jsonata;
  if (mapped !== `npm:jsonata@${JSONATA_PIN}`) {
    fail('S15', `${DENO_PATH} imports.jsonata is ${JSON.stringify(mapped)} — RT-R12 / ADR 0052 rule 2: exactly "npm:jsonata@${JSONATA_PIN}", the one registry that carries it`);
  }
  for (const [where, map] of denoMaps) for (const [spec, target] of Object.entries(map)) {
    if (where !== 'imports' && (JSONATA_NAMES.test(spec) || JSONATA_NAMES.test(String(target)))) {
      fail('S15', `${DENO_PATH} ${where} maps "${spec}" — RT-R12 / ADR 0052 rule 2: jsonata is mapped in imports and nowhere else`);
    }
  }
  const sched = pkg.exports?.['./scheduler'];
  const js = pkg.exports?.['./jsonata'];
  const expectedNpm = JSON.stringify(sched, (k, v) => (typeof v === 'string' ? v.replaceAll('/scheduler/', '/jsonata/') : v));
  if (sched === undefined || JSON.stringify(js) !== expectedNpm) {
    fail('S15', `${PKG_PATH} exports["./jsonata"] is ${JSON.stringify(js)} — RT-R12 / ADR 0052 rule 3: the scheduler sub-path's shape with jsonata's paths (${expectedNpm})`);
  }
  if (denoJson.exports?.['./jsonata'] !== './src/jsonata/index.ts') {
    fail('S15', `${DENO_PATH} exports["./jsonata"] is ${JSON.stringify(denoJson.exports?.['./jsonata'])} — RT-R12 / ADR 0052 rule 3: "./src/jsonata/index.ts"`);
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
  const scripts = pkg.scripts ?? {};
  const gate = scripts.gate ?? '';
  if (!gate) fail('S11', `${PKG_PATH} has no \`gate\` script`);
  // **"Run by the gate" stopped being "named in `scripts.gate`" at
  // [ADR 0039](../doc/decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md).**
  // The seven `:selftest` entries left the `&&` chain for one entry that derives them
  // from this same manifest and runs them concurrently, so a textual test over the
  // chain now reports every one of them missing. **Reachability is the property this
  // clause has always meant** — its own heading says *reachable from `npm run gate`* —
  // and textual membership was how it was implemented while a chain was the only
  // sequencing a manifest had.
  //
  // **The half this cannot see is `G4` in `scripts/check-wiring.mjs`, and it is not
  // optional.** Two of the three clauses that used to refuse an entry leaving the gate
  // are this one and `S12`, and both go quiet here the moment the seven are out of the
  // chain; `G4` asks the runner for its plan and compares it to this manifest both
  // ways, including each entry's COMMAND. Without `G4` this line is a tautology: every
  // `:selftest` entry is "reachable" because the runner claims to run all of them.
  const chain = gate.split('&&').map((s) => s.trim().replace(/^npm run /, ''));
  const runsSelftests = chain.some((n) => /scripts\/run-selftests\.mjs/.test(scripts[n] ?? ''));
  const gateRuns = (n) => chain.includes(n) || (runsSelftests && n.endsWith(':selftest'));
  for (const [name, cmd] of Object.entries(scripts)) {
    if (!name.startsWith('check:')) continue;
    if (!gateRuns(name)) {
      fail('S11', `${PKG_PATH} declares "${name}" and \`npm run gate\` does not run it — ` +
        'a check outside the gate is a check that does not exist' +
        (name.endsWith(':selftest') && !runsSelftests
          ? '. Since ADR 0039 the `:selftest` entries are reached through the entry that runs ' +
            'scripts/run-selftests.mjs, and no chain entry does'
          : ''));
    }
    // **And the entry has to run a script that exists.** Being named in the chain
    // is not the same as doing anything: `"check:policies": "node --version"` is
    // in the gate, exits 0, and checks nothing. Measured as a survivor of the
    // first version of S11, which asserted only the name.
    const m = /scripts\/([\w.-]+\.mjs)/.exec(cmd ?? '');
    if (!m) {
      fail('S11', `${PKG_PATH}'s "${name}" does not run anything under scripts/ — "${cmd}"`);
    } else if (!existsSync(join(ROOT, 'scripts', m[1]))) {
      fail('S11', `${PKG_PATH}'s "${name}" runs scripts/${m[1]}, which does not exist`);
    }
    // **And a `:selftest` entry has to run the self-test.** S11's clause above is
    // about DELETION — the name leaving the chain, the script not existing — and
    // W24's conformity reader found the GUTTING case one level in, on the entry
    // this item adds: dropping ` --self-test` from `check:source:selftest` leaves
    // the name in the chain, the script existing, `S12` silent (the name is
    // untouched) and `S13` silent (no `npm run`), and the gate green while the
    // entry runs the plain check a second time. That is S11's own recorded
    // survivor — *"being named in the chain is not the same as doing anything"* —
    // one level in, and all four `:selftest` entries had it.
    if (name.endsWith(':selftest')) {
      const base = scripts[name.slice(0, -':selftest'.length)];
      if (!/--self-test\b/.test(cmd ?? '')) {
        fail('S11', `${PKG_PATH}'s "${name}" does not pass --self-test — "${cmd}". A :selftest ` +
          'entry that runs the plain check is in the gate, exits 0, and runs no probe');
      } else if (base !== undefined && (cmd ?? '').replace(/\s*--self-test\b/, '') !== base) {
        fail('S11', `${PKG_PATH}'s "${name}" is not its own check plus --self-test — "${cmd}" ` +
          `against "${base}"`);
      }
    }
  }
}

// --- S12/S13: the gate's own chain, and the chains that chain composes --------
// **`S11` guarded eight of the gate's fifteen entries and nothing guarded the rest**
// — [Q126](../doc/open-questions.md), measured at W24's declaration. *(Both numbers
// are of that moment and neither is of now: since
// [ADR 0039](../doc/decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md)
// the chain is **fifteen** entries, only **seven** of which are `check:*`, and the
// seven `:selftest` entries `S11` also guards are not in the chain at all — they are
// reached through `selftests`, which is what `G4` binds.
// *(This read "twenty-one" and "fourteen" — W38's after-figures, stale one item later,
// in the parenthesis about stale counts, for the second consecutive item. W39's
// conformity reader.)* *(This read
// "sixteen" and "nine" — W24's own after-figures — for four items, through W30's two
// new entries and W38's two. Corrected by W38's conformity reader, which is the class
// this parenthesis is about, in the parenthesis about it.)* Stated in past
// tense because a count in a comment is the thing this repository gets wrong most
// often — W24's conformity reader caught this sentence mixing the two vintages.)*
// Its loop opens `if (!name.startsWith('check:'))
// continue`, so at W24's declaration `lint`, `typecheck`, `test`, `test:deno`,
// `test:browser`, `test:l6` and `test:l6:deno` were in the chain and held there by
// nothing: deleting ` && npm run test:l6:deno` left all eight `check:*` entries
// exiting 0, which is how W23's adequacy reader found it and how P8's declaration
// reproduced it.
//
// **`S12` is a DECLARED SET compared BOTH WAYS, and it is equality rather than a
// floor for a measured reason.** A floor is what `check-docs`' `RUN_FLOOR` is, and
// `RUN_FLOOR` is the thing that went stale in the direction of weakness
// ([Q102](../doc/open-questions.md)). A floor answers *are there at least N*;
// equality answers *are these exactly the ones*, and only the second fails when an
// entry is **swapped** rather than removed.
//
// **The obligation this creates is stated rather than hidden**: a plan that adds a
// runtime to the gate must add it to `GATE_CHAIN`, in this file, in the same
// commit. That is `RUN_FLOOR`'s shape — and the difference is that `scripts/**` has
// an owner now, which is what P8 exists for.
//
// **Order IS asserted, and the first version of this comment said it was not.**
// It read *"nothing here depends on the order the gate runs in beyond
// `doc/workflow.md` section 4's ladder, which is a claim about levels rather than
// about this string"* — and W24's conformity reader pointed out that **this string
// is the only implementation section 4's ladder has**. *"Climb from L0 and stop at
// the first failure"* is exactly what `&&` in this order does, and a chain running
// `test:l6` ahead of `lint` reports a sixty-second rung while L0 is broken. So the
// comparison runs the multiset difference **first**, because it gives the precise
// message, and then compares the sequences.
//
// **Once order is asserted, the multiset difference decides no verdict** — sequence
// equality implies multiset equality — and it is kept for the MESSAGE. Measured on
// a chain running `lint` twice: with `missingFrom`'s `pool.splice` the failure reads
// *runs "lint" and GATE_CHAIN does not declare it*; without it, the same input is
// still refused, by the order clause, saying *in a different ORDER* about a
// duplicate. **W24's two readers produced this between them** — the adequacy reader
// found the splice deletable for 0 against the pre-order code, and the conformity
// reader's order finding dissolved it into a message-quality question while the fix
// for one was being written for the other.
//
// **And the order this list declares CHANGED at
// [ADR 0039](../doc/decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md),
// because the order it declared was the ladder's inverse.** The paragraph above
// states the principle — *"a chain running `test:l6` ahead of `lint` reports a
// sixty-second rung while L0 is broken"* — and the chain it was written beside ran
// **489 seconds of `:selftest` entries ahead of `lint`**, measured. A rule stated
// correctly in a comment, in the file that enforces it, over a list that broke it:
// `doc/workflow.md` section 6 pass 3 rule 3's sharpest shape. The seven `:selftest`
// entries are now one entry at the END, and `lint` and `typecheck` are first.
const GATE_CHAIN = [
  'lint',
  'typecheck',
  // **Cheapest first, MEASURED rather than assumed.** The first version of this list
  // read spec, source, wiring, markdown, scheduler, policies, docs while ADR 0039
  // claimed *"within a tier the cheapest entry goes first"* — and `check:wiring` is
  // 1.74 s against `check:scheduler` and `check:policies` at 0.09, so it sat third
  // ahead of four entries 5-19x cheaper. W39's conformity reader; the claim is now
  // true of the list rather than of the sentence.
  'check:scheduler',
  'check:policies',
  'check:spec',
  'check:source',
  'check:markdown',
  'check:wiring',
  'check:docs',
  'test',
  'test:deno',
  'test:browser',
  'test:l6',
  'test:l6:deno',
  'selftests',
];

/**
 * **`S13` — the lists one level down, which no register row reached.** Each row is
 * an exact ordered parse of one script's command, compared both ways like `S12`:
 *
 * | the list | what dropping one entry costs |
 * |---|---|
 * | `typecheck` | dropping `typecheck:deno` drops the ONLY Deno typecheck — `RT-R3`'s and `RT-R4`'s rung |
 * | `test:browser` | dropping `build:browser-tests` runs the browser rung against a stale bundle and reports green |
 * | `lint` | dropping `examples/` un-lints the whole of ladder L6 |
 *
 * The third is `doc/workflow.md` rule 8's fourth obligation applied to
 * `package.json`: **a list of directories is a loop bound, and nothing counted it.**
 *
 * `split` says how the command is cut into parts — `&&` for a chain of commands,
 * `ws` for one command's argument list.
 */
const COMPOSED = [
  {
    name: 'typecheck',
    split: '&&',
    parts: [
      'npm run typecheck:node',
      'npm run typecheck:browser',
      'npm run typecheck:deno',
      'npm run typecheck:tests',
      'npm run typecheck:examples',
    ],
  },
  {
    name: 'test:browser',
    split: '&&',
    parts: ['npm run build:browser-tests', 'node scripts/run-browser-tests.mjs'],
  },
  {
    name: 'lint',
    split: 'ws',
    parts: ['deno', 'lint', 'src/', 'test/', 'examples/', 'index.ts'],
  },
];

/**
 * `a && b` -> `['a','b']`; an argument list -> its tokens. **Nothing is filtered
 * out**, deliberately: a trailing `&&` produces an empty part, and an empty part
 * that silently vanished would make a malformed chain compare equal to a
 * well-formed one.
 */
function parts(cmd, split) {
  return split === '&&' ? cmd.split('&&').map((s) => s.trim()) : cmd.trim().split(/\s+/);
}

/** The entries of `a` that `b` does not cover, as a MULTISET — so a duplicate shows. */
function missingFrom(a, b) {
  const pool = [...b];
  const out = [];
  for (const x of a) {
    const i = pool.indexOf(x);
    if (i < 0) out.push(x);
    else pool.splice(i, 1);
  }
  return out;
}

{
  const scripts = pkg.scripts ?? {};
  const gate = typeof scripts.gate === 'string' ? scripts.gate.trim() : '';
  if (!gate) {
    fail('S12', `${PKG_PATH} has no \`gate\` script, so there is no chain to compare against`);
  } else {
    // **A parser that cannot classify a segment says so and does NOT compare.**
    // P6's retro: *a parser that cannot classify a row must say so loudly rather
    // than return a value* — and `check-policies`' `halvesRead` is the same guard.
    // A set comparison built on a half-read chain reports a mismatch that is true
    // of the parse and says nothing about the wiring.
    const segs = parts(gate, '&&');
    const parsed = segs.map((s) => /^npm run ([A-Za-z0-9:._-]+)$/.exec(s));
    const unreadable = segs.filter((_, i) => !parsed[i]);
    for (const s of unreadable) {
      fail('S12', `\`npm run gate\` has a segment this check cannot classify — "${s}". Every ` +
        'segment of the chain is `npm run <script>`, so anything else is either a new shape ' +
        'this check has to learn or a typo that npm will run anyway');
    }
    if (unreadable.length === 0) {
      const ran = parsed.map((m) => m[1]);
      for (const n of missingFrom(GATE_CHAIN, ran)) {
        fail('S12', `GATE_CHAIN declares "${n}" and \`npm run gate\` does not run it — the ` +
          'entry was dropped from the chain, or moved out of it');
      }
      for (const n of missingFrom(ran, GATE_CHAIN)) {
        fail('S12', `\`npm run gate\` runs "${n}" and GATE_CHAIN does not declare it — add it ` +
          'to scripts/check-source.mjs in the same commit that adds it to the chain');
      }
      // Only once the two hold the same entries is a difference an ORDER
      // difference; reported separately so the message says which it is.
      if (missingFrom(ran, GATE_CHAIN).length === 0 && missingFrom(GATE_CHAIN, ran).length === 0 &&
          ran.join(' ') !== GATE_CHAIN.join(' ')) {
        fail('S12', '`npm run gate` runs the entries GATE_CHAIN declares in a different ORDER — ' +
          '`&&` in sequence is the only implementation `doc/workflow.md` section 4\'s ladder has, ' +
          `so the order is part of the declaration. Declared: ${GATE_CHAIN.join(' ')}`);
      }
    }
  }

  for (const c of COMPOSED) {
    const cmd = typeof scripts[c.name] === 'string' ? scripts[c.name].trim() : '';
    if (!cmd) {
      fail('S13', `${PKG_PATH} has no "${c.name}" script, and S13 declares what it composes`);
      continue;
    }
    const actual = parts(cmd, c.split);
    for (const p of missingFrom(c.parts, actual)) {
      fail('S13', `"${c.name}" is declared to run \`${p}\` and does not`);
    }
    for (const p of missingFrom(actual, c.parts)) {
      fail('S13', `"${c.name}" runs \`${p}\`, which S13 does not declare`);
    }
  }

  // **`COMPOSED` is a loop bound, so something has to count it from somewhere
  // else** — `doc/workflow.md` rule 8's fourth obligation asked of this file's own
  // deliverable. Emptying the list above would otherwise leave every clause in it
  // running over nothing. The independent source is `package.json` itself: an
  // entry in the chain whose command runs ANOTHER npm script is a composed list by
  // construction, and must be declared.
  for (const name of GATE_CHAIN) {
    const cmd = scripts[name] ?? '';
    if (!/\bnpm run /.test(cmd)) continue;
    if (!COMPOSED.some((c) => c.name === name)) {
      fail('S13', `\`npm run gate\` runs "${name}", whose own command composes other npm ` +
        'scripts, and COMPOSED does not declare what those are — a chain inside a chain is ' +
        'exactly the surface Q126 measured');
    }
  }

  // **And the same question for `lint`'s directory list**, whose independent source
  // is the disk rather than the manifest: every tree this script already walks —
  // `published()` for `src/` and `index.ts`, `testSources()` for `test/`,
  // `exampleSources()` for `examples/` — must be a target `deno lint` is given.
  // Dropping `examples/` therefore fails twice, by two routes that share no code.
  const lintCmd = scripts.lint ?? '';
  if (lintCmd) {
    const targets = new Set(parts(lintCmd, 'ws').slice(2));
    const walked = new Set([...files, ...testSources(), ...exampleSources()].map((p) => {
      const r = rel(p);
      return r.includes('/') ? r.slice(0, r.indexOf('/') + 1) : r;
    }));
    for (const t of [...walked].sort()) {
      if (!targets.has(t)) {
        fail('S13', `"lint" does not lint ${t}, which this script walks for S1-S4, S7, S10 or ` +
          'S13 — an unlinted tree is a tree L0 half covers');
      }
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
  'S7 a published file reaches the scheduler only by its bare specifier',
  'S8 no second declaration of the scheduler, and no path in deno.json',
  'S10 no file under examples/ writes a path into the sibling repository',
  'S11 every check:* script is reachable from `npm run gate`',
  'S12 `npm run gate` runs exactly the entries GATE_CHAIN declares',
  'S13 the chains and the argument lists the gate composes',
  'S14 jsonata is reached only from src/jsonata/**, and only by its bare specifier',
  'S15 jsonata is declared once, at one pin, in both manifests, and its sub-path is exported by both',
];
console.log(`source check — ${files.length} published files, ${GATE_CHAIN.length} gate entries\n`);
for (const c of checks) {
  // **The id is the first word, not the first two characters.** `c.slice(0, 2)`
  // read `S10` and `S11` as `S1`, so both rows printed S1's failure count and
  // their own never appeared; adding S12 and S13 would have made it five rows
  // reporting one check. It changes the report and not the exit code, which is
  // why it survived from W1 to W24 — and it is the report a reader acts on.
  const bad = failures.filter((f) => f.startsWith(c.slice(0, c.indexOf(' ')) + ':'));
  console.log(`  ${bad.length ? 'FAIL' : 'ok  '}  ${c}${bad.length ? ` (${bad.length})` : ''}`);
}
if (failures.length) {
  console.log('\n' + failures.map((f) => '  ' + f).join('\n'));
  console.log(`\n${failures.length} failure(s).`);
  process.exit(1);
}
console.log('\nAll checks passed.');
