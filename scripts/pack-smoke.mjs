#!/usr/bin/env node
// The packed-artifact smoke test — W152 Outputs (4). Run: `npm run pack:smoke`.
//
// **What a consumer who installs the TARBALL gets**, measured on the tarball rather than on the
// tree it was built from. `npm pack` runs `prepack`, which is `npm run build`, so the artifact tested
// here is built exactly as the one `npm publish` uploads. Before W152 that tarball held two files,
// `README.md` and `package.json`, and every `exports` entry pointed at a path it did not contain.
//
// It is `pack:smoke` and not `check:pack` by the maintainer's answer (a) of 2026-10-10: any
// `check:*` name is bound by `check-source.mjs`'s `S11` and `check-wiring.mjs`'s `G3` to a
// `:selftest` sibling reached from `gate:full`, and W152 keeps this OUT of the gate. Its provocations
// are its `--provoke` mode, at the bottom of this file.
//
// Each clause fails under its own id, so a provocation can name the set it must trip:
//
//   P1  `npm pack` (and so the build) exits 0 and reports a file list
//   P2  the tarball holds dist/**, README.md, LICENSE, AGENTS.md and package.json, and NOTHING ELSE
//   P3  every path package.json's `exports` (and main/browser/types) names is in the tarball, and
//       the sub-paths this file tests ARE the `exports` keys, both ways — so a sub-path added to the
//       map is not one P5-P7 and P9 silently never reach
//   P4  fyflow-scheduler and jsonata are EXTERNAL: no bundle defines the scheduler's classes or
//       jsonata's engine, and each sub-path that reaches them imports them by bare specifier
//   P5  installed beside fyflow-scheduler at the peer pin, each sub-path's RUNTIME exports are exactly
//       the ones its entry file declares — the source entry is imported under Node's type
//       stripping and the two namespaces compared both ways
//   P6  a consumer file typechecks against the shipped .d.ts (nodenext, skipLibCheck OFF), and each
//       sub-path's TYPE-level exports are exactly its entry file's, both ways (TypeScript's checker)
//   P7  a real flow reaches `completed` with the value the spec gives it, a TYPED node, threaded and
//       inline, with a jsonata transform — which is what breaks if the envelope worker's URL still
//       names a `.ts` file (Outputs (9)) — and a `RegistryError` thrown by `./scheduler` is
//       `instanceof` the class `.` exports (one module instance across entries)
//   P8  AGENTS.md and LICENSE are in node_modules/fyflow-orchestration/, byte-identical to the tree's,
//       and the LICENSE is MIT with fyflow-scheduler's copyright line (Outputs (5): the same holder)
//   P9  each sub-path bundles for the browser with esbuild (platform browser) from the installed
//       package, and resolves to dist/browser
//   P10 the packed package.json carries `repository`, `homepage`, `bugs` and `keywords`
//       (Outputs (6)) — `repository` naming this GitHub repository, which npm provenance requires
//
//   P11 the BROWSER bundle RUNS: the installed dist/browser, bundled for a page and loaded in
//       Chromium, completes a typed node threaded and inline, serving only the consumer's own worker.
//       It is the only clause that executes the envelope-worker plugin's Blob-URL branch (Outputs (9));
//       P9 bundles and runs nothing. W152's conformity reader, finding 4. The worker is `.js`, since
//       nothing in a browser executes TypeScript, and there is no transform: a jsonata worker half in a
//       browser has to be served beside the bundle (AGENTS.md), which is the consumer's arrangement.
//
// **`dist/` is DELETED before packing**, so the tarball holds only what `prepack` built on this run:
// with a stale `dist/` from an earlier build in the tree, a missing `prepack` packed it green.
//
// Exit 0 green, 1 with `pack:smoke: FAIL` after the failing ids, 2 on a crash of this script.

import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SEP = String.fromCharCode(92);
const posix = (p) => p.split(SEP).join('/');
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const sh = (cmd, args, cwd, extra = {}) => spawnSync(cmd, args, {
  cwd, encoding: 'utf8', shell: process.platform === 'win32', maxBuffer: 64 * 1024 * 1024, ...extra,
});

/** The three entries and the source file that declares each one's exports. */
const ENTRIES = [
  ['fyflow-orchestration', 'index.ts'],
  ['fyflow-orchestration/scheduler', 'src/scheduler/index.ts'],
  ['fyflow-orchestration/jsonata', 'src/jsonata/index.ts'],
];

async function smoke() {
  const failures = [];
  const fail = (id, msg) => { failures.push(id); console.error(`  FAIL  ${id} ${msg}`); };
  const ok = (id, msg) => console.log(`  ok    ${id} ${msg}`);
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const scratch = join(ROOT, 'dev-dist', `pack-smoke-${process.pid}`);
  rmSync(scratch, { recursive: true, force: true });
  mkdirSync(scratch, { recursive: true });
  const finish = () => {
    if (process.env.PACK_SMOKE_KEEP !== '1') rmSync(scratch, { recursive: true, force: true });
    if (failures.length) {
      console.error(`pack:smoke: FAIL — ${[...new Set(failures)].join(', ')}`);
      return 1;
    }
    console.log('pack:smoke: ok');
    return 0;
  };

  // --- P1 ------------------------------------------------------------------------------------
  rmSync(join(ROOT, 'dist'), { recursive: true, force: true });
  const packed = sh(NPM, ['pack', '--json', '--pack-destination', scratch], ROOT);
  let listing;
  try {
    const json = packed.stdout.slice(packed.stdout.indexOf('[\n'));
    listing = JSON.parse(json)[0];
  } catch { /* reported below */ }
  if (packed.status !== 0 || !listing) {
    // The build's own refusal goes on the SAME line, so a provocation can name the reason it fired for.
    const why = `${packed.stdout || ''}\n${packed.stderr || ''}`.split('\n').find((l) => l.startsWith('build: FAIL')) ??
      `${packed.stderr || ''}`.split('\n').find((l) => /rror/.test(l)) ?? 'no reason printed';
    fail('P1', `npm pack exited ${packed.status} — the prepack build or the pack failed: ${why.trim()}`);
    return finish();
  }
  const files = listing.files.map((f) => posix(f.path)).sort();
  const tgz = join(scratch, listing.filename);
  ok('P1', `npm pack built and packed ${files.length} files`);

  // --- P2 ------------------------------------------------------------------------------------
  const OWED = ['AGENTS.md', 'LICENSE', 'README.md', 'package.json'];
  const extra = files.filter((f) => !OWED.includes(f) && !f.startsWith('dist/'));
  const lacking = OWED.filter((f) => !files.includes(f));
  const dirs = ['dist/node/', 'dist/browser/', 'dist/types/'].filter((d) => !files.some((f) => f.startsWith(d)));
  if (extra.length) fail('P2', `the tarball carries files outside dist/** and ${OWED.join(', ')}: ${extra.slice(0, 8).join(', ')}`);
  if (lacking.length) fail('P2', `the tarball lacks ${lacking.join(', ')}`);
  if (dirs.length) fail('P2', `the tarball has nothing under ${dirs.join(', ')}`);
  if (!extra.length && !lacking.length && !dirs.length) ok('P2', `the tarball is dist/** and ${OWED.join(', ')}, nothing else`);

  // --- P3 ------------------------------------------------------------------------------------
  const named = new Set();
  const collect = (v) => { if (typeof v === 'string') named.add(v.replace(/^\.\//, '')); else if (v && typeof v === 'object') Object.values(v).forEach(collect); };
  collect(pkg.exports);
  for (const k of ['main', 'browser', 'types']) if (pkg[k]) named.add(pkg[k].replace(/^\.\//, ''));
  const absent = [...named].filter((p) => !files.includes(p));
  if (absent.length) fail('P3', `package.json names ${absent.join(', ')}, which the tarball does not contain`);
  else ok('P3', `all ${named.size} paths package.json's exports names are in the tarball`);
  const keys = Object.keys(pkg.exports ?? {}).map((k) => k === '.' ? pkg.name : `${pkg.name}/${k.replace(/^\.\//, '')}`).sort();
  const tested = ENTRIES.map(([s]) => s).sort();
  const untested = keys.filter((k) => !tested.includes(k));
  const unexported = tested.filter((k) => !keys.includes(k));
  if (untested.length) fail('P3', `package.json exports ${untested.join(', ')}, which this smoke test does not test`);
  if (unexported.length) fail('P3', `this smoke test tests ${unexported.join(', ')}, which package.json does not export`);

  // --- install -----------------------------------------------------------------------------
  const consumer = join(scratch, 'consumer');
  mkdirSync(consumer, { recursive: true });
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({ name: 'consumer', private: true, type: 'module' }, null, 2));
  const peer = pkg.peerDependencies['fyflow-scheduler'];
  const inst = sh(NPM, ['install', '--no-audit', '--no-fund', '--prefer-offline', '--ignore-scripts', tgz, `fyflow-scheduler@${peer}`], consumer);
  const installed = join(consumer, 'node_modules', 'fyflow-orchestration');
  if (inst.status !== 0 || !existsSync(installed)) {
    console.error(inst.stdout, inst.stderr);
    fail('P1', `npm install of the tarball beside fyflow-scheduler@${peer} exited ${inst.status}`);
    return finish();
  }

  // --- P4 ------------------------------------------------------------------------------------
  const MARKERS = [
    // esbuild RENAMES on a collision (`jsonata3`, measured), so a trailing digit is allowed.
    ['fyflow-scheduler', /\bvar (FyflowScheduler|WorkerManager)\d* = class\b/],
    ['jsonata', /\bfunction jsonata\d*\(expr, options\)/],
  ];
  const IMPORTS = [
    ['fyflow-scheduler', 'scheduler/index.js'],
    ['jsonata', 'jsonata/index.js'],
  ];
  let p4 = 0;
  for (const platform of ['node', 'browser']) {
    const base = join(installed, 'dist', platform);
    if (!existsSync(base)) continue; // P2/P3 already say so
    for (const f of walk(base).filter((p) => p.endsWith('.js'))) {
      const text = readFileSync(f, 'utf8');
      for (const [name, re] of MARKERS) {
        if (re.test(text)) { p4 += 1; fail('P4', `dist/${platform}/${posix(relative(base, f))} INLINES ${name} — it must stay external (ADR 0048, ADR 0052)`); }
      }
    }
    for (const [name, file] of IMPORTS) {
      const p = join(base, file);
      if (existsSync(p) && !new RegExp(`from\\s*["']${name}["']`).test(readFileSync(p, 'utf8'))) {
        p4 += 1; fail('P4', `dist/${platform}/${file} does not import ${name} by its bare specifier`);
      }
    }
  }
  if (!p4) ok('P4', 'fyflow-scheduler and jsonata are external in both platforms` bundles');

  // --- P5 ------------------------------------------------------------------------------------
  const probe = join(consumer, 'exports.mjs');
  writeFileSync(probe, [
    `const out = {};`,
    ...ENTRIES.map(([spec, src], i) => [
      `const a${i} = Object.keys(await import(${JSON.stringify(spec)})).sort();`,
      `const b${i} = Object.keys(await import(${JSON.stringify(pathToFileURL(join(ROOT, src)).href)})).sort();`,
      `out[${JSON.stringify(spec)}] = { installed: a${i}, declared: b${i} };`,
    ].join('\n')),
    `console.log('EXPORTS ' + JSON.stringify(out));`,
  ].join('\n'));
  const ex = sh(process.execPath, [probe], consumer, { shell: false, timeout: 60_000 });
  const exLine = (ex.stdout || '').split('\n').find((l) => l.startsWith('EXPORTS '));
  if (ex.status !== 0 || !exLine) {
    fail('P5', `importing the installed sub-paths failed (exit ${ex.status}): ${(ex.stderr || '').split('\n').slice(0, 4).join(' | ')}`);
  } else {
    let p5 = 0;
    for (const [spec, { installed: a, declared: b }] of Object.entries(JSON.parse(exLine.slice(8)))) {
      const missingE = b.filter((n) => !a.includes(n));
      const extraE = a.filter((n) => !b.includes(n));
      if (b.length === 0) { p5 += 1; fail('P5', `${spec}: the source entry declares no runtime export, so the comparison is vacuous`); }
      if (missingE.length) { p5 += 1; fail('P5', `${spec} lacks runtime export(s) its entry declares: ${missingE.join(', ')}`); }
      if (extraE.length) { p5 += 1; fail('P5', `${spec} exports ${extraE.join(', ')}, which its entry does not declare`); }
    }
    if (!p5) ok('P5', 'each sub-path`s runtime exports are exactly its entry file`s, both ways');
  }

  // --- P6 ------------------------------------------------------------------------------------
  const ts = (await import(pathToFileURL(join(ROOT, 'node_modules', 'typescript', 'lib', 'typescript.js')).href)).default;
  const consumerTs = join(consumer, 'consumer.ts');
  writeFileSync(consumerTs, [
    ...ENTRIES.map(([spec], i) => `import * as m${i} from ${JSON.stringify(spec)};`),
    `import type { FlowDefinition, RegistryDocument, RunState } from 'fyflow-orchestration';`,
    `import { createRuntime } from 'fyflow-orchestration/scheduler';`,
    `import compileExpression, { jsonata } from 'fyflow-orchestration/jsonata';`,
    `const registry: RegistryDocument = { workers: { w: { url: './w.ts' } }, nodeTypes: { T: { worker: 'w' } } };`,
    `const flow: FlowDefinition = { flowId: 'f', version: 1, entry: 'e', nodes: [{ id: 'e', kind: 'end', outcome: 'completed' }] };`,
    `const rt = createRuntime(registry, { languages: { jsonata } }, { base: import.meta.url });`,
    `const done: Promise<RunState> = rt.start(flow, {}).done;`,
    `const c: { evaluate: unknown } = compileExpression('1');`,
    `export { ${ENTRIES.map((_, i) => `m${i}`).join(', ')}, done, c };`, // derived from ENTRIES, so a row dropped there is P3's finding alone
  ].join('\n'));
  const opts = { module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext, target: ts.ScriptTarget.ES2022,
    strict: true, noEmit: true, skipLibCheck: false, lib: ['lib.es2022.d.ts'], types: ['node'], // a Node consumer: fyflow-scheduler's own .d.ts need @types/node (EventTarget, Worker)
    typeRoots: [join(ROOT, 'node_modules', '@types')] };
  const program = ts.createProgram([consumerTs], opts);
  // **Only THIS package's .d.ts and the consumer file are held.** skipLibCheck is off so our
  // declarations are checked whole; fyflow-scheduler's own .d.ts (0.5.2's, as W152 measured) name DOM types
  // (`EventListenerOrEventListenerObject`) that neither ES2022 nor @types/node declares — measured at
  // W152, six diagnostics, all in node_modules/fyflow-scheduler/ — and that is the scheduler's to fix,
  // not a defect a consumer of THIS package can see that a consumer of the scheduler alone cannot.
  const allDiags = ts.getPreEmitDiagnostics(program);
  const diags = allDiags.filter((d) => !d.file || !posix(d.file.fileName).includes('/node_modules/fyflow-scheduler/'));
  if (allDiags.length !== diags.length) console.log(`  note  P6 ${allDiags.length - diags.length} diagnostic(s) inside fyflow-scheduler's own .d.ts, not held here`);
  let p6 = 0;
  if (diags.length) {
    p6 += 1;
    fail('P6', `the consumer file does not typecheck against the shipped .d.ts — ${diags.length} diagnostic(s), first: ` +
      ts.flattenDiagnosticMessageText(diags[0].messageText, ' '));
    for (const d of diags.slice(0, 20)) console.error(`        ${d.file ? posix(relative(consumer, d.file.fileName)) : ''} ${ts.flattenDiagnosticMessageText(d.messageText, ' ').slice(0, 200)}`);
  }
  const srcProgram = ts.createProgram(ENTRIES.map(([, s]) => join(ROOT, s)), {
    module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, target: ts.ScriptTarget.ES2022,
    allowImportingTsExtensions: true, noEmit: true, strict: true, skipLibCheck: true, lib: ['lib.es2022.d.ts'], types: ['node'],
    typeRoots: [join(ROOT, 'node_modules', '@types')] });
  const names = (prog, sf, spec) => {
    const checker = prog.getTypeChecker();
    let sym;
    if (spec === undefined) sym = checker.getSymbolAtLocation(sf);
    else {
      const decl = sf.statements.find((s) => ts.isImportDeclaration(s) && s.moduleSpecifier.text === spec);
      sym = decl && checker.getSymbolAtLocation(decl.moduleSpecifier);
    }
    return sym ? checker.getExportsOfModule(sym).map((s) => s.name).sort() : undefined;
  };
  const csf = program.getSourceFile(consumerTs);
  for (const [spec, src] of ENTRIES) {
    const want = names(srcProgram, srcProgram.getSourceFile(join(ROOT, src)));
    const got = names(program, csf, spec);
    if (!want || want.length === 0) { p6 += 1; fail('P6', `${src} resolves to no export at the type level, so the comparison is vacuous`); continue; }
    if (!got) { p6 += 1; fail('P6', `${spec} resolves to no module at the type level from a consumer`); continue; }
    const lacks = want.filter((n) => !got.includes(n));
    const adds = got.filter((n) => !want.includes(n));
    if (lacks.length) { p6 += 1; fail('P6', `${spec}'s .d.ts lacks ${lacks.length} export(s) ${src} declares: ${lacks.slice(0, 6).join(', ')}`); }
    if (adds.length) { p6 += 1; fail('P6', `${spec}'s .d.ts exports ${adds.slice(0, 6).join(', ')}, which ${src} does not declare`); }
  }
  if (!p6) ok('P6', 'a consumer typechecks against the .d.ts (nodenext), and each sub-path`s type exports are its entry`s, both ways');

  // --- P7 ------------------------------------------------------------------------------------
  writeFileSync(join(consumer, 'worker.ts'), [
    'export default class Greeter {',
    '  run(envelope: { settings: { say: string }; input: { text: string } }): { text: string } {',
    "    return { text: envelope.input.text + ' ' + envelope.settings.say };",
    '  }',
    '}',
  ].join('\n'));
  // **The expected value is DERIVED.** greet: 'hello' + ' world'; shout's transform runs on its input
  // BEFORE its worker sees it (spec/flow-definition.md, the transform subsection, v0.18), so
  // $uppercase('hello world') = 'HELLO WORLD', and the worker appends ' !'.
  writeFileSync(join(consumer, 'flow.mjs'), `
import { createRuntime } from 'fyflow-orchestration/scheduler';
import { jsonata } from 'fyflow-orchestration/jsonata';
import { RegistryError } from 'fyflow-orchestration';
const want = 'HELLO WORLD !';
const mode = process.argv[2];
// ONE mode per process, so a mode that HANGS cannot take the other's verdict with it (measured: with the
// envelope worker's URL left at the .ts file the threaded run never settles and Node exits 13).
if (mode === 'threaded' || mode === 'inline') {
  const inline = mode === 'inline';
  try {
    const registry = {
      workers: { greeter: { url: './worker.ts', settingsSchema: { type: 'object', required: ['say'], properties: { say: { type: 'string' } } } } },
      nodeTypes: { Greeter: { worker: 'greeter', inline } },
      languages: ['jsonata'],
    };
    const flow = { flowId: 'smoke', version: 1, entry: 'greet', nodes: [
      { id: 'greet', kind: 'task', type: 'Greeter', settings: { say: 'world' }, edges: [{ to: 'shout' }] },
      { id: 'shout', kind: 'task', type: 'Greeter', settings: { say: '!' }, transform: { lang: 'jsonata', expr: '{ "text": $uppercase(text) }' }, edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ] };
    const rt = createRuntime(registry, { languages: { jsonata } }, { base: import.meta.url });
    let timer;
    const state = await Promise.race([rt.start(flow, { text: 'hello' }).done,
      new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('the run did not settle in 30 s')), 30_000); })]);
    clearTimeout(timer);
    await rt.shutdown();
    const shout = Object.values(state.nodes).find((n) => n.nodeId === 'shout');
    const errs = Object.values(state.nodes).map((n) => n.error).filter(Boolean).map((e) => e.message ?? String(e));
    if (state.outcome === 'completed' && shout?.result?.text === want) console.log('FLOW_OK ' + mode);
    else console.log('FLOW_BAD ' + mode + ' outcome=' + state.outcome + ' result=' + JSON.stringify(shout?.result) + ' ' + errs.join(' | ').slice(0, 300));
  } catch (e) { console.log('FLOW_BAD ' + mode + ' threw ' + (e && e.message)); process.exit(0); }
} else {
  let caught;
  try { createRuntime({ workers: 5 }, {}, {}); } catch (e) { caught = e; }
  console.log(caught instanceof RegistryError ? 'IDENTITY_OK' : 'IDENTITY_BAD ' + (caught && caught.constructor && caught.constructor.name));
}
`);
  let p7 = 0;
  for (const mode of ['threaded', 'inline']) {
    const fl = sh(process.execPath, ['flow.mjs', mode], consumer, { shell: false, timeout: 90_000 });
    const flOut = fl.stdout || '';
    if (!flOut.includes(`FLOW_OK ${mode}`)) {
      p7 += 1;
      const bad = flOut.split('\n').find((l) => l.startsWith(`FLOW_BAD ${mode}`));
      fail('P7', `the ${mode} typed flow did not complete with { text: 'HELLO WORLD !' }: ${bad ?? `no verdict (exit ${fl.status}) ${(fl.stderr || '').split('\n').slice(0, 3).join(' | ')}`}`);
    }
  }
  const id = sh(process.execPath, ['flow.mjs', 'identity'], consumer, { shell: false, timeout: 60_000 });
  const flOut = id.stdout || '';
  if (!flOut.includes('IDENTITY_OK')) { p7 += 1; fail('P7', `a RegistryError thrown by ./scheduler is not instanceof the one . exports — ${flOut.split('\n').find((l) => l.startsWith('IDENTITY_')) ?? 'no verdict'}`); }
  if (!p7) ok('P7', 'a typed node completed threaded and inline with a jsonata transform; one RegistryError class across entries');

  // --- P8 ------------------------------------------------------------------------------------
  let p8 = 0;
  for (const f of ['AGENTS.md', 'LICENSE']) {
    const p = join(installed, f);
    if (!existsSync(p)) { p8 += 1; fail('P8', `node_modules/fyflow-orchestration/${f} is not there`); }
    else if (!readFileSync(p).equals(readFileSync(join(ROOT, f)))) { p8 += 1; fail('P8', `node_modules/fyflow-orchestration/${f} differs from the tree's`); }
  }
  const lic = existsSync(join(ROOT, 'LICENSE')) ? readFileSync(join(ROOT, 'LICENSE'), 'utf8') : '';
  const theirs = readFileSync(join(consumer, 'node_modules', 'fyflow-scheduler', 'LICENSE'), 'utf8');
  const holder = (s) => (/^Copyright \(c\) .+$/m.exec(s) ?? [''])[0].trim();
  if (!/^MIT License\b/.test(lic) || !lic.includes('Permission is hereby granted, free of charge')) { p8 += 1; fail('P8', 'LICENSE is not the MIT text both manifests declare'); }
  if (!holder(lic) || holder(lic) !== holder(theirs)) { p8 += 1; fail('P8', `LICENSE's holder line "${holder(lic)}" is not fyflow-scheduler's "${holder(theirs)}"`); }
  if (!p8) ok('P8', 'AGENTS.md and LICENSE are installed, byte-identical to the tree`s; MIT, fyflow-scheduler`s holder');

  // --- P9 ------------------------------------------------------------------------------------
  const esbuild = await import(pathToFileURL(join(ROOT, 'node_modules', 'esbuild', 'lib', 'main.js')).href);
  let p9 = 0;
  for (const [spec] of ENTRIES) {
    try {
      const r = await esbuild.build({
        stdin: { contents: `export * from ${JSON.stringify(spec)};`, resolveDir: consumer, loader: 'js' },
        absWorkingDir: consumer, bundle: true, platform: 'browser', format: 'esm', write: false, metafile: true, logLevel: 'silent',
      });
      const ours = Object.keys(r.metafile.inputs).map(posix).filter((p) => p.includes('node_modules/fyflow-orchestration/'));
      const wrong = ours.filter((p) => !p.includes('node_modules/fyflow-orchestration/dist/browser/'));
      if (ours.length === 0 || wrong.length) { p9 += 1; fail('P9', `${spec} for the browser resolved ${wrong[0] ?? 'nothing of this package'}, not dist/browser`); }
    } catch (e) {
      p9 += 1; fail('P9', `${spec} does not bundle for the browser: ${(e.errors?.[0]?.text ?? e.message).slice(0, 200)}`);
    }
  }
  if (!p9) ok('P9', 'each sub-path bundles for the browser from the installed package, from dist/browser');

  // --- P10 -----------------------------------------------------------------------------------
  const shipped = JSON.parse(readFileSync(join(installed, 'package.json'), 'utf8'));
  const REPO = 'github.com/fyflow/fyflow-orchestration';
  const meta = [
    ['repository', typeof shipped.repository?.url === 'string' && shipped.repository.url.includes(REPO)],
    ['homepage', typeof shipped.homepage === 'string' && shipped.homepage.includes(REPO)],
    ['bugs', typeof shipped.bugs?.url === 'string' && shipped.bugs.url.includes(REPO)],
    ['keywords', Array.isArray(shipped.keywords) && shipped.keywords.length > 0],
  ].filter(([, good]) => !good).map(([k]) => k);
  if (meta.length) fail('P10', `the packed package.json lacks, or points away from ${REPO} in: ${meta.join(', ')}`);
  else ok('P10', `repository, homepage and bugs name ${REPO}; keywords present`);

  // --- P11 -----------------------------------------------------------------------------------
  // **Derived**: the worker appends ' ' + settings.say to input.text, so 'hello' -> 'hello world'.
  const page = `
import { createRuntime } from 'fyflow-orchestration/scheduler';
const out = [];
for (const inline of [false, true]) {
  const mode = inline ? 'inline' : 'threaded';
  try {
    const registry = { workers: { greeter: { url: './worker.js' } }, nodeTypes: { Greeter: { worker: 'greeter', inline } } };
    const flow = { flowId: 'browser', version: 1, entry: 'greet', nodes: [
      { id: 'greet', kind: 'task', type: 'Greeter', settings: { say: 'world' }, edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' } ] };
    const rt = createRuntime(registry, {}, { base: location.href });
    const st = await Promise.race([rt.start(flow, { text: 'hello' }).done,
      new Promise((_, rej) => setTimeout(() => rej(new Error('the run did not settle in 20 s')), 20000))]);
    await rt.shutdown();
    const g = Object.values(st.nodes).find((n) => n.nodeId === 'greet');
    out.push(st.outcome === 'completed' && g?.result?.text === 'hello world' ? 'FLOW_OK ' + mode
      : 'FLOW_BAD ' + mode + ' outcome=' + st.outcome + ' result=' + JSON.stringify(g?.result) + ' ' + (g?.error ?? ''));
  } catch (e) { out.push('FLOW_BAD ' + mode + ' threw ' + e.message); }
}
window.__done = out;
`;
  let p11 = 0;
  let browser;
  let server;
  try {
    const app = (await esbuild.build({ stdin: { contents: page, resolveDir: consumer, loader: 'js' }, absWorkingDir: consumer,
      bundle: true, platform: 'browser', format: 'esm', write: false, logLevel: 'silent' })).outputFiles[0].text;
    const WORKER = 'export default class Greeter { run(e) { return { text: e.input.text + " " + e.settings.say }; } }';
    server = createServer((req, res) => {
      const js = req.url === '/app.js' ? app : req.url === '/worker.js' ? WORKER : undefined;
      res.writeHead(200, { 'content-type': js === undefined ? 'text/html' : 'text/javascript' });
      res.end(js ?? '<!doctype html><script type="module" src="/app.js"></script>');
    });
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    const { chromium } = await import(pathToFileURL(join(ROOT, 'node_modules', 'playwright', 'index.mjs')).href);
    browser = await chromium.launch();
    const pg = await browser.newPage();
    const pageErrors = [];
    pg.on('pageerror', (e) => pageErrors.push(e.message));
    await pg.goto(`http://127.0.0.1:${server.address().port}/`);
    const done = await pg.waitForFunction(() => window.__done, null, { timeout: 60_000 }).then((h) => h.jsonValue()).catch(() => undefined);
    for (const mode of ['threaded', 'inline']) {
      if (!done?.includes(`FLOW_OK ${mode}`)) {
        p11 += 1;
        fail('P11', `the ${mode} typed flow did not complete in Chromium from dist/browser: ${done?.find((l) => l.includes(mode)) ?? `no verdict ${pageErrors.slice(0, 2).join(' | ')}`}`);
      }
    }
  } catch (e) {
    p11 += 1; fail('P11', `the browser run could not be staged: ${(e && e.message || String(e)).split('\n')[0]}`);
  } finally {
    await browser?.close().catch(() => {});
    server?.close();
  }
  if (!p11) ok('P11', 'dist/browser ran a typed node threaded and inline in Chromium, the envelope worker from its Blob URL');

  return finish();
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p)); else out.push(p);
  }
  return out;
}

// =====================================================================================================
// --provoke — W152's provocations, section 5 rule 7 and rule 8, checked in.
//
// Each probe edits the tree, runs a smoke (this file's, or `deno task jsr:smoke`), grades the run, and
// restores. The harness obligations (doc/workflow.md section 5 rule 8, the HARNESS rows):
//
//   - every edit's ANCHOR is checked against the CURRENT text and must match EXACTLY ONCE, or the
//     probe aborts (restoring) and is graded ABORT — never run;
//   - every edit must CHANGE its input;
//   - every touched file is restored to its FIRST snapshot, byte for byte, and compared;
//   - the tree is DIGESTED before and after the whole set, and the run fails if they differ;
//   - a CONTROL probe (no edit) must come back clean;
//   - the GRADER is controlled: one probe whose right verdict is CRASH, and one deliberately mis-declared
//     so its right verdict is WRONG-REASON, graded every pass.
//
// Verdicts: CAUGHT (exit 1, the summary line, EXACTLY the declared ids, and the declared `must` text in
// a failure line), WRONG-REASON (exit 1 with the summary, a different set or no `must`), CRASH (any
// other non-zero exit, or no summary line), SURVIVED (exit 0), CLEAN (a control at exit 0).
//
// `--probes <file>` adds probes from a module exporting `default: Probe[]` (the item's rule 8 set).
// `--only <id,...>` runs a subset.

const BUILD = 'scripts/build.mjs';
const PROBES = [
  { id: 'C0', name: 'CONTROL: no edit', smoke: 'pack', edits: [], want: 'CLEAN' },
  // --- the declared provocations (W152 Tests) ---
  { id: 'K1', name: 'the bundle inlines fyflow-scheduler (EXTERNAL loses it): the build`s own guard stops the pack',
    smoke: 'pack', edits: [[BUILD, "export const EXTERNAL = Object.freeze(['fyflow-scheduler', 'jsonata']);", "export const EXTERNAL = Object.freeze(['jsonata']);"]],
    want: ['P1'], must: 'inlined' },
  { id: 'K1b', name: 'the bundle inlines fyflow-scheduler AND the build`s guard is gone: pack:smoke`s own P4 sees it',
    smoke: 'pack', edits: [[BUILD, "export const EXTERNAL = Object.freeze(['fyflow-scheduler', 'jsonata']);", "export const EXTERNAL = Object.freeze(['jsonata']);"],
      [BUILD, '  if (inlined.length) die(', '  if (false) die(']],
    want: ['P4'], must: 'INLINES fyflow-scheduler' },
  { id: 'K1c', name: 'the bundle inlines jsonata AND the build`s guard is gone',
    smoke: 'pack', edits: [[BUILD, "export const EXTERNAL = Object.freeze(['fyflow-scheduler', 'jsonata']);", "export const EXTERNAL = Object.freeze(['fyflow-scheduler']);"],
      [BUILD, '  if (inlined.length) die(', '  if (false) die(']],
    want: ['P4'], must: 'INLINES jsonata' },
  { id: 'K2', name: 'files list without AGENTS.md',
    smoke: 'pack', edits: [['package.json', '    "AGENTS.md",\n', '']], want: ['P2', 'P8'], must: 'the tarball lacks AGENTS.md' },
  { id: 'K2b', name: 'files list without LICENSE (npm adds a LICENSE on its own, so this must stay GREEN)',
    smoke: 'pack', edits: [['package.json', '    "AGENTS.md",\n    "LICENSE"\n', '    "AGENTS.md"\n']], want: 'SURVIVED' },
  { id: 'K2c', name: 'files list gains src/: the tarball carries source it must not',
    smoke: 'pack', edits: [['package.json', '    "dist/**/*",\n', '    "dist/**/*",\n    "src/**/*",\n']], want: ['P2'], must: 'outside dist/**' },
  { id: 'K3', name: 'an exports entry points at a path the build does not emit: the build`s own check stops the pack',
    smoke: 'pack', edits: [['package.json', '"default": "./dist/node/jsonata/index.js"\n      },\n      "browser"', '"default": "./dist/node/jsonata/main.js"\n      },\n      "browser"']],
    want: ['P1'], must: 'which the build did not emit' },
  { id: 'K3b', name: 'an exports entry points at an unemitted path AND the build`s check is gone: P3, P5 and P7 see it',
    smoke: 'pack', edits: [['package.json', '"default": "./dist/node/jsonata/index.js"\n      },\n      "browser"', '"default": "./dist/node/jsonata/main.js"\n      },\n      "browser"'],
      [BUILD, 'if (missing.length) die(`package.json names', 'if (false) die(`package.json names']],
    want: ['P3', 'P5', 'P7'], must: 'dist/node/jsonata/main.js' },
  { id: 'K4', name: 'the .d.ts emit misses a sub-path (tsconfig.build.json drops src/jsonata/index.ts): the build stops',
    smoke: 'pack', edits: [['tsconfig.build.json', '"src/scheduler/index.ts", "src/jsonata/index.ts"]', '"src/scheduler/index.ts"]']],
    want: ['P1'], must: 'tsc emitted no' },
  { id: 'K4b', name: 'the .d.ts emit misses a sub-path AND the build`s check is gone: P6 sees it (P3 does not: the entry stub is still written)',
    smoke: 'pack', edits: [['tsconfig.build.json', '"src/scheduler/index.ts", "src/jsonata/index.ts"]', '"src/scheduler/index.ts"]'],
      [BUILD, "    if (!existsSync(emitted)) die(", '    if (false) die('],
      [BUILD, '    const hasDefault = /export', '    const hasDefault = !existsSync(emitted) ? false : /export']],
    want: ['P6'], must: "fyflow-orchestration/jsonata's .d.ts lacks" },
  { id: 'K5', name: 'the envelope worker`s URL is left pointing at envelope-worker.ts: the build`s guard stops the pack',
    smoke: 'pack', edits: [[BUILD, "contents: source.replace(ENVELOPE_EXPR, '__fyflowEnvelopeWorkerUrl') +", 'contents: source +']],
    want: ['P1'], must: 'envelope-worker.ts' },
  { id: 'K5b', name: 'the envelope worker`s URL left at the .ts file AND the build`s guard gone: the typed flow fails, threaded and inline, on Node (P7) and in Chromium (P11)',
    smoke: 'pack', edits: [[BUILD, "contents: source.replace(ENVELOPE_EXPR, '__fyflowEnvelopeWorkerUrl') +", 'contents: source +'],
      [BUILD, "    if (/['\"`][^'\"`\\n]*envelope-worker\\.ts['\"`]/.test(", "    if (false && /['\"`][^'\"`\\n]*envelope-worker\\.ts['\"`]/.test("]],
    want: ['P7', 'P11'], must: 'typed flow did not complete' }, // both platforms' bundles lose the envelope worker
  { id: 'K5d', name: 'the BROWSER branch of the envelope-worker plugin points at a file beside the bundle instead of a Blob: only P11 runs it',
    smoke: 'pack', edits: [[BUILD, "        : `export default URL.createObjectURL(new Blob([${JSON.stringify(code)}], { type: 'text/javascript' }));\\n`;",
      "        : `export default new URL('./envelope-worker.js', import.meta.url).href;\\n`;"]],
    want: ['P11'], must: 'did not complete in Chromium' },
  { id: 'K6', name: 'no code splitting: each entry carries its own RegistryError',
    smoke: 'pack', edits: [[BUILD, '    splitting: true,', '    splitting: false,']], want: ['P7'], must: 'is not instanceof' },
  // --- jsr:smoke ---
  { id: 'J0', name: 'CONTROL: jsr:smoke with no edit', smoke: 'jsr', edits: [], want: 'CLEAN', dry: 0 },
  { id: 'JA', name: 'AGENTS.md dropped from deno.json`s allowlist: jsr:smoke RED while the dry run stays GREEN',
    smoke: 'jsr', edits: [['deno.json', '      "!AGENTS.md",\n', '']], want: ['J2'], must: 'lacks AGENTS.md', dry: 0 },
  { id: 'JL', name: 'LICENSE dropped from deno.json`s allowlist: jsr:smoke RED while the dry run stays GREEN',
    smoke: 'jsr', edits: [['deno.json', '      "!AGENTS.md",\n      "!LICENSE"\n', '      "!AGENTS.md"\n']], want: ['J2'], must: 'lacks LICENSE', dry: 0 },
  { id: 'JE', name: 'envelope-worker.ts dropped from deno.json`s allowlist: the dry run is RED here too (it is in the module graph)',
    smoke: 'jsr', edits: [['deno.json', '      "!src/scheduler/envelope-worker.ts",\n', '']], want: ['J1'], must: 'exited 1', dry: 1 },
  { id: 'JS', name: 'a script reaches the published set: the allowlist publishes scripts/publish-output.ts',
    smoke: 'jsr', edits: [['deno.json', '      "!README.md",\n', '      "!README.md",\n      "!scripts/publish-output.ts",\n']], want: ['J3'], must: 'development-only', dry: 0 },
  // --- the grader's own controls ---
  { id: 'GX', name: 'GRADER: a syntax error in pack-smoke.mjs itself — no clause can report it, so the right verdict is CRASH',
    smoke: 'pack', edits: [['scripts/pack-smoke.mjs', '#!/usr/bin/env node\n// The packed-artifact smoke test', '#!/usr/bin/env node\n)// The packed-artifact smoke test']],
    want: 'CRASH' },
  { id: 'GW', name: 'GRADER: AGENTS.md dropped from files, deliberately declared as P9 — right verdict WRONG-REASON',
    smoke: 'pack', edits: [['package.json', '    "AGENTS.md",\n', '']], want: ['P9'], must: 'the tarball lacks AGENTS.md', grader: 'WRONG-REASON' },
];

/**
 * **The tree git can see — tracked files and untracked ones it does not ignore**, each path and its
 * bytes. Git's own ignore rules decide what is scratch (the build output, every process's scratch
 * space, `node_modules`), so this names no directory and holds no second list of them.
 */
function digestTree() {
  const h = createHash('sha256');
  const r = sh('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], ROOT, { shell: false });
  if (r.status !== 0) throw new Error(`git ls-files exited ${r.status}: ${r.stderr}`);
  for (const p of [...new Set(r.stdout.split('\0').filter(Boolean))].sort()) {
    h.update(p); h.update('\0');
    h.update(existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p)) : Buffer.from('<deleted>')); h.update('\0');
  }
  return h.digest('hex');
}

function runSmoke(kind, cmd) {
  if (cmd) return sh(cmd[0], cmd.slice(1), ROOT, { shell: false, timeout: 600_000 });
  if (kind === 'pack') return sh(process.execPath, [join(ROOT, 'scripts', 'pack-smoke.mjs')], ROOT, { shell: false, timeout: 600_000 });
  return sh('deno', ['task', 'jsr:smoke'], ROOT, { timeout: 600_000 });
}

function grade(p, r) {
  const out = `${r.stdout || ''}\n${r.stderr || ''}`;
  const summary = /^[\w-]+:smoke: FAIL/m.test(out);
  const ids = [...new Set([...out.matchAll(/^ {2}FAIL {2}([A-Z]\d+)\b/gm)].map((m) => m[1]))].sort();
  if (r.status === 0) return { verdict: p.want === 'CLEAN' ? 'CLEAN' : 'SURVIVED', ids };
  if (r.status !== 1 || !summary) return { verdict: 'CRASH', ids };
  if (!Array.isArray(p.want)) return { verdict: 'WRONG-REASON', ids };
  const want = [...p.want].sort();
  const same = want.length === ids.length && want.every((x, i) => x === ids[i]);
  const mustSeen = !p.must || out.split('\n').some((l) => /^ {2}FAIL {2}/.test(l) && l.includes(p.must));
  return { verdict: same && mustSeen ? 'CAUGHT' : 'WRONG-REASON', ids, mustSeen };
}

async function provoke(argv) {
  const extraAt = argv.indexOf('--probes');
  const onlyAt = argv.indexOf('--only');
  let probes = [...PROBES];
  if (extraAt !== -1) probes.push(...(await import(pathToFileURL(resolve(argv[extraAt + 1])).href)).default);
  if (onlyAt !== -1) { const only = argv[onlyAt + 1].split(','); probes = probes.filter((p) => only.includes(p.id)); }
  const log = join(ROOT, 'dev-dist', `pack-smoke-provoke-${process.pid}`);
  mkdirSync(log, { recursive: true });
  const before = digestTree();
  const first = new Map(); // file -> its FIRST snapshot, the restore target for every probe
  const rows = [];
  let harnessBad = 0;
  for (const p of probes) {
    const t0 = Date.now();
    const touched = [];
    let abort;
    try {
      for (const [file, anchor, replacement] of p.edits) {
        const abs = join(ROOT, file);
        if (!first.has(file)) first.set(file, readFileSync(abs));
        const cur = readFileSync(abs, 'utf8');
        const n = cur.split(anchor).length - 1;
        if (n !== 1) { abort = `${file}: anchor matched ${n} times in the CURRENT text — ${JSON.stringify(anchor.slice(0, 60))}`; break; }
        const next = cur.replace(anchor, () => replacement);
        if (next === cur) { abort = `${file}: the edit did not change its input`; break; }
        writeFileSync(abs, next);
        touched.push(file);
      }
      let g;
      let dry;
      if (abort) g = { verdict: 'ABORT', ids: [] };
      else {
        const r = runSmoke(p.smoke, p.cmd);
        writeFileSync(join(log, `${p.id}.log`), `${r.stdout || ''}\n${r.stderr || ''}`);
        g = grade(p, r);
        if (p.dry !== undefined) dry = sh('deno', ['publish', '--dry-run', '--allow-dirty'], ROOT).status;
      }
      const expected = p.grader ?? (Array.isArray(p.want) ? 'CAUGHT' : p.want);
      const dryOk = p.dry === undefined || dry === p.dry;
      const pass = g.verdict === expected && dryOk;
      rows.push({ p, g, expected, pass, dry, abort, s: ((Date.now() - t0) / 1000).toFixed(0) });
      console.log(`  ${pass ? 'ok  ' : 'BAD '}  ${p.id.padEnd(4)} ${g.verdict.padEnd(12)} want ${expected.padEnd(12)} ids [${g.ids.join(',')}]` +
        `${p.dry !== undefined ? ` dry-run EXIT ${dry} (want ${p.dry})` : ''} ${((Date.now() - t0) / 1000).toFixed(0)}s — ${p.name}${abort ? `\n        ABORT: ${abort}` : ''}`);
    } finally {
      for (const file of new Set(touched)) { // only what was WRITTEN, each to its FIRST snapshot
        writeFileSync(join(ROOT, file), first.get(file));
        if (!readFileSync(join(ROOT, file)).equals(first.get(file))) { harnessBad += 1; console.error(`  HARNESS  ${file} was not restored byte for byte`); }
      }
    }
  }
  const after = digestTree();
  if (before !== after) { harnessBad += 1; console.error(`  HARNESS  the tree's digest changed across the set: ${before.slice(0, 12)} -> ${after.slice(0, 12)}`); }
  const bad = rows.filter((r) => !r.pass);
  console.log(`pack:smoke --provoke: ${rows.length - bad.length}/${rows.length} as declared; digest ${before.slice(0, 12)} ${before === after ? '==' : '!='} ${after.slice(0, 12)}; logs in ${posix(relative(ROOT, log))}`);
  return bad.length || harnessBad ? 1 : 0;
}

try {
  process.exitCode = process.argv.includes('--provoke') ? await provoke(process.argv) : await smoke();
} catch (e) {
  console.error(`pack:smoke: CRASH — ${e && e.stack ? e.stack : e}`);
  process.exitCode = 2;
}
