#!/usr/bin/env node
// The npm build — W152, `spec/runtime-targets.md` section 1: JSR ships the TypeScript source and
// npm ships an esbuild bundle per platform plus declarations. Run by `prepack`, so the tarball
// `npm pack` makes and the one `npm publish` uploads are built by the same hook (the maintainer's
// choice, 2026-10-10). Output:
//
//   dist/node/{index,scheduler/index,jsonata/index}.js      platform node, ESM, code-split
//   dist/browser/{index,scheduler/index,jsonata/index}.js   platform browser, ESM, code-split
//   dist/types/...                                          tsc's declaration emit (tsconfig.build.json)
//
// Four decisions, each with the defect it prevents:
//
//   1. **`fyflow-scheduler` and `jsonata` are EXTERNAL** — ADR 0048 (a peer, resolved by the
//      consumer's installer) and ADR 0052. Inlining the scheduler would hand a consumer TWO
//      schedulers, and `WorkerManager`/`FyflowScheduler` objects from one are not the other's. The
//      metafile is read back and the build FAILS if any input came from either package.
//   2. **Code SPLITTING across the three entries.** `.`, `./scheduler` and `./jsonata` share the
//      definition and driver modules; bundled separately, each would carry its own copy and a
//      `RegistryError` thrown by `createRuntime` would not be `instanceof` the `RegistryError` a
//      consumer imports from `.`. Split, every module exists once, as it does under Deno.
//   3. **The envelope worker's URL is REPLACED at build time** (Outputs (9)). The source builds it as
//      `new URL('./envelope-worker.ts', import.meta.url)`, which in a bundle names a `.ts` file that
//      is not beside the output — every typed node type would fail to load for an npm consumer. The
//      plugin below bundles `envelope-worker.ts` on its own and substitutes, for that one
//      expression, a `data:` URL on Node and a `Blob` URL in the browser: `fyflow-scheduler`'s own
//      worker plugin, for the same reason. The source is not edited, so JSR still ships the file
//      and Deno still resolves it beside `bootstrap.ts`. The expression must occur EXACTLY ONCE,
//      or the build fails rather than shipping a bundle that still points at a `.ts` file.
//   4. **Declarations are rewritten `.ts` -> `.js`** in every relative specifier, because tsc keeps
//      the source's `.ts` specifiers in a `.d.ts`; and the two sub-path entries the `exports` map
//      names (`dist/types/scheduler/index.d.ts`, `dist/types/jsonata/index.d.ts`) are written as
//      re-exports of the emitted `src/` tree, the default export included.

import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import * as esbuild from 'esbuild';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SEP = String.fromCharCode(92);
const posix = (p) => p.split(SEP).join('/');

/** The three entries `package.json`'s `exports` names, keyed by their output path under each platform. */
export const ENTRIES = Object.freeze({
  'index': 'index.ts',
  'scheduler/index': 'src/scheduler/index.ts',
  'jsonata/index': 'src/jsonata/index.ts',
});
/** Kept out of every bundle — the peer and the dependency. */
export const EXTERNAL = Object.freeze(['fyflow-scheduler', 'jsonata']);
/** The one expression the envelope-worker plugin replaces, as the source spells it. */
export const ENVELOPE_EXPR = "new URL('./envelope-worker.ts', import.meta.url).href";

const die = (msg) => { console.error(`build: FAIL — ${msg}`); process.exit(1); };

const envelopeWorkerPlugin = (platform) => ({
  name: 'envelope-worker-url',
  setup(build) {
    build.onLoad({ filter: /[\\/]src[\\/]scheduler[\\/]bootstrap\.ts$/ }, async (args) => {
      const source = readFileSync(args.path, 'utf8');
      const count = source.split(ENVELOPE_EXPR).length - 1;
      if (count !== 1) {
        throw new Error(`src/scheduler/bootstrap.ts spells \`${ENVELOPE_EXPR}\` ${count} times, and the ` +
          'envelope-worker plugin replaces exactly one. A bundle left pointing at envelope-worker.ts ' +
          'loads no typed node type for an npm consumer (W152 Outputs (9))');
      }
      return {
        contents: source.replace(ENVELOPE_EXPR, '__fyflowEnvelopeWorkerUrl') +
          "\nimport __fyflowEnvelopeWorkerUrl from 'fyflow-envelope-worker:url';\n",
        loader: 'ts',
      };
    });
    build.onResolve({ filter: /^fyflow-envelope-worker:url$/ }, () => ({ path: 'envelope-worker', namespace: 'fyflow-envelope-worker' }));
    build.onLoad({ filter: /.*/, namespace: 'fyflow-envelope-worker' }, async () => {
      const r = await esbuild.build({
        entryPoints: [join(ROOT, 'src', 'scheduler', 'envelope-worker.ts')],
        bundle: true, platform, format: 'esm', target: ['es2022'], write: false, external: [...EXTERNAL],
      });
      const code = r.outputFiles[0].text;
      const contents = platform === 'node'
        ? `export default ${JSON.stringify(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)};\n`
        : `export default URL.createObjectURL(new Blob([${JSON.stringify(code)}], { type: 'text/javascript' }));\n`;
      return { contents, loader: 'js' };
    });
  },
});

async function bundle(platform) {
  const r = await esbuild.build({
    absWorkingDir: ROOT,
    entryPoints: Object.entries(ENTRIES).map(([out, inp]) => ({ out, in: inp })),
    bundle: true,
    splitting: true,
    format: 'esm',
    platform,
    target: ['es2022'],
    outdir: join(DIST, platform),
    chunkNames: 'chunks/[name]-[hash]',
    external: [...EXTERNAL],
    plugins: [envelopeWorkerPlugin(platform)],
    metafile: true,
    logLevel: 'warning',
  });
  // **Decision 1, read back from what esbuild actually took in.** `external` is a request; the
  // metafile is the evidence.
  const inlined = Object.keys(r.metafile.inputs).filter((p) => /(^|\/)node_modules\/(fyflow-scheduler|jsonata)\//.test(posix(p)));
  if (inlined.length) die(`the ${platform} bundle inlined ${inlined.length} module(s) of a package it must keep external: ${inlined.slice(0, 3).join(', ')}`);
  for (const [file] of Object.entries(r.metafile.outputs)) {
    if (!file.endsWith('.js')) continue;
    // A STRING naming it, not the `// src/scheduler/envelope-worker.ts` path comment esbuild writes.
    if (/['"`][^'"`\n]*envelope-worker\.ts['"`]/.test(readFileSync(join(ROOT, file), 'utf8'))) {
      die(`${posix(file)} still names envelope-worker.ts in a string — the envelope worker's URL was not replaced`);
    }
  }
  console.log(`build: dist/${platform} — ${Object.keys(r.metafile.outputs).filter((f) => f.endsWith('.js')).length} files`);
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p)); else out.push(p);
  }
  return out;
}

function declarations() {
  const tsc = join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');
  const r = spawnSync(process.execPath, [tsc, '-p', join(ROOT, 'tsconfig.build.json')], { cwd: ROOT, stdio: 'inherit' });
  if (r.status !== 0) die(`tsc -p tsconfig.build.json exited ${r.status}`);
  const types = join(DIST, 'types');
  const RE = /((?:from|import)\s*\(?\s*)(['"])(\.{1,2}\/[^'"]+)\.ts\2/g;
  for (const f of walk(types).filter((p) => p.endsWith('.d.ts'))) {
    const text = readFileSync(f, 'utf8');
    const out = text.replace(RE, '$1$2$3.js$2');
    if (out !== text) writeFileSync(f, out);
    // In a SPECIFIER position — a doc comment quoting `"./workers/prompt.ts"` is prose, not an import.
    if (/(?:from|import)\s*\(?\s*(['"])\.{1,2}\/[^'"]+\.ts\1/.test(out)) die(`${posix(relative(ROOT, f))} still names a relative .ts specifier after the rewrite`);
  }
  // The sub-path entries `exports` names. `export *` does not carry a default, so it is re-exported.
  for (const [entry, src] of Object.entries(ENTRIES)) {
    if (entry === 'index') continue;
    const target = join(types, entry + '.d.ts');
    const emitted = join(types, src.replace(/\.ts$/, '.d.ts'));
    if (!existsSync(emitted)) die(`tsc emitted no ${posix(relative(ROOT, emitted))} for the "${entry}" entry`);
    const spec = posix(relative(dirname(target), emitted)).replace(/\.d\.ts$/, '.js');
    // A default EXPORTED, never `export { default as EnvelopeWorker }`, which re-exports one under a name.
    const hasDefault = /export\s+default\b|export\s*\{[^}]*(?:\bas\s+default|[{,]\s*default)\s*[,}]/.test(readFileSync(emitted, 'utf8'));
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, `export * from '${spec}';\n${hasDefault ? `export { default } from '${spec}';\n` : ''}`);
  }
  console.log(`build: dist/types — ${walk(types).length} declaration files`);
}

rmSync(DIST, { recursive: true, force: true });
await bundle('node');
await bundle('browser');
declarations();
// Every path `package.json`'s `exports` names must now exist — the map is the contract.
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const named = new Set();
const collect = (v) => { if (typeof v === 'string') named.add(v); else if (v && typeof v === 'object') Object.values(v).forEach(collect); };
collect(pkg.exports); for (const k of ['main', 'browser', 'types']) if (pkg[k]) named.add(pkg[k]);
const missing = [...named].filter((p) => !existsSync(join(ROOT, p)));
if (missing.length) die(`package.json names ${missing.join(', ')}, which the build did not emit`);
console.log(`build: ok — all ${named.size} paths package.json's exports names exist`);
