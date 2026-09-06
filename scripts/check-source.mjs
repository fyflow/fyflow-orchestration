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
// copy, which is how `--self-test` breaks the manifest without touching the tree.
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
//
// **Read once, here, and used by `S8`, `S11`, `S12` and `S13`.** It was read
// twice before W24 — this block and `S11`'s — and a self-test needs one place to
// point at a copy.
const pkg = JSON.parse(readFileSync(join(ROOT, PKG_PATH), 'utf8'));
for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
  for (const name of Object.keys(pkg[field] ?? {})) {
    if (/fyflow-scheduler|@fyflow\/scheduler/.test(name)) {
      fail('S8', `${PKG_PATH} ${field} declares "${name}" — ADR 0013 rule 1. The published ` +
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
  const scripts = pkg.scripts ?? {};
  const gate = scripts.gate ?? '';
  if (!gate) fail('S11', `${PKG_PATH} has no \`gate\` script`);
  for (const [name, cmd] of Object.entries(scripts)) {
    if (!name.startsWith('check:')) continue;
    if (!new RegExp(`npm run ${name.replace(/[:]/g, '[:]')}(?![:\\w])`).test(gate)) {
      fail('S11', `${PKG_PATH} declares "${name}" and \`npm run gate\` does not run it — ` +
        'a check outside the gate is a check that does not exist');
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
// are of that moment and neither is of now: the chain is **sixteen** entries since
// this item added `check:source:selftest`, and S11 guards **nine** of them, because
// what it counts is `check:*` and the entry this item added is one. Stated in past
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
const GATE_CHAIN = [
  'check:spec',
  'check:spec:selftest',
  'check:source',
  'check:source:selftest',
  'check:markdown',
  'check:markdown:selftest',
  'check:scheduler',
  'check:scheduler:selftest',
  'check:policies',
  'check:policies:selftest',
  'check:docs',
  'check:docs:selftest',
  'lint',
  'typecheck',
  'test',
  'test:deno',
  'test:browser',
  'test:l6',
  'test:l6:deno',
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
  // `published()` for `src/` and `index.ts`, `browserBundleInputs()` for `test/`,
  // `exampleSources()` for `examples/` — must be a target `deno lint` is given.
  // Dropping `examples/` therefore fails twice, by two routes that share no code.
  const lintCmd = scripts.lint ?? '';
  if (lintCmd) {
    const targets = new Set(parts(lintCmd, 'ws').slice(2));
    const walked = new Set([...files, ...browserBundleInputs(), ...exampleSources()].map((p) => {
      const r = rel(p);
      return r.includes('/') ? r.slice(0, r.indexOf('/') + 1) : r;
    }));
    for (const t of [...walked].sort()) {
      if (!targets.has(t)) {
        fail('S13', `"lint" does not lint ${t}, which this script walks for S1-S4, S7, S9 or ` +
          'S10 — an unlinted tree is a tree L0 half covers');
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
  'S7 no published file imports the scheduler',
  'S8 no manifest declares the scheduler as a runtime dependency',
  'S9 nothing in the browser bundle’s input set imports the scheduler',
  'S10 no file under examples/ writes a path into the sibling repository',
  'S11 every check:* script is reachable from `npm run gate`',
  'S12 `npm run gate` runs exactly the entries GATE_CHAIN declares',
  'S13 the chains and the argument lists the gate composes',
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
