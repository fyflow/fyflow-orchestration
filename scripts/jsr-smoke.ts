// The JSR smoke test — W152 Outputs (10), adopted from fyflow-scheduler's `scripts/jsr-smoke.ts`.
// Run: `deno task jsr:smoke`.
//
// Copies EXACTLY the files `deno publish --dry-run` says it would publish into a scratch directory,
// and runs a real flow there: a TYPED node, threaded and inline, with a `jsonata` transform. A green
// dry run is not evidence that the package works — it proves the module graph resolves and the
// public API has no slow types, and it says nothing about a file reached any other way, or about a
// file that is not a module at all.
//
// What it asserts, in order, as J1-J6 — each a way the published package can be wrong while the dry run is
// green:
//
//   1. the dry run EXITS 0 and lists files;
//   2. the files a consumer is owed are listed: every `exports` target, `deno.json`, `README.md`,
//      `LICENSE` and `AGENTS.md` (the maintainer's direction, 2026-10-10). The last two are not
//      modules, so the dry run cannot miss them — this list is the only thing that does;
//   3. nothing development-only is listed: `package.json`, a `tsconfig*.json`, `scripts/`, `test/`,
//      `examples/`, `doc/`, `spec/`, `dist/` or `dev-dist/`;
//   4. the published source's non-relative imports are EXACTLY `deno.json`'s `imports` keys, both
//      ways. The scheduler's version asserts NO dependency; this package has two by design
//      (ADR 0048, ADR 0052), so the claim is that it has those two and no third — a script's
//      `jsr:@std/...` reaching a published module would be the third;
//   5. a real flow runs against the staged copy alone and ends `completed` with the result
//      `spec/flow-definition.md`'s transform subsection gives it (below);
//   6. the staged root entry loads under Node's type STRIPPING (fyflow-scheduler 0.5.1 shipped a
//      type imported as a value, which `deno check` and `tsc` both pass and Node refuses).
//
// **Measured at W152, against the declaration's premise:** dropping `src/scheduler/envelope-worker.ts`
// from the allowlist does NOT leave the dry run green here, as it does for the scheduler's
// `workerWrapper.ts`. `src/scheduler/index.ts` re-exports `EnvelopeWorker` from it, so it is in the
// module graph and the dry run refuses it (`error[excluded-module]`). This file is still the only
// check that RUNS the envelope worker from the published set, and assertion 2 is the case only it
// sees.

import { externalImports, nativePath, parsePublishedFileUrls, stagingPlan } from './publish-output.ts';

const ROOT_URL = new URL('../', import.meta.url).href;
const ROOT = nativePath.fromFileUrl(ROOT_URL);
const dec = new TextDecoder();
const failures: string[] = [];
const fail = (id: string, msg: string) => { failures.push(`${id} ${msg}`); console.error(`  FAIL  ${id} ${msg}`); };
const ok = (msg: string) => console.log(`  ok    ${msg}`);

async function run(cmd: string, args: string[], cwd: string): Promise<{ code: number; out: string }> {
  const r = await new Deno.Command(cmd, { args, cwd, stdout: 'piped', stderr: 'piped' }).output();
  return { code: r.code, out: dec.decode(r.stdout) + dec.decode(r.stderr) };
}

// --- 1. the dry run --------------------------------------------------------------------------
const dry = await run(Deno.execPath(), ['publish', '--dry-run', '--allow-dirty'], ROOT);
if (dry.code !== 0) {
  console.error(dry.out);
  console.error('  FAIL  J1 `deno publish --dry-run` exited ' + dry.code);
  console.error('jsr:smoke: FAIL — 1 failure(s)');
  Deno.exit(1);
}
const urls = parsePublishedFileUrls(dry.out);
if (urls.length === 0) {
  console.error(dry.out);
  console.error('  FAIL  J1 could not parse the published file list out of the dry run');
  console.error('jsr:smoke: FAIL — 1 failure(s)');
  Deno.exit(1);
}
const rel = urls.map((u) => u.slice(ROOT_URL.length));
console.log(`jsr:smoke — ${rel.length} files would be published`);

// --- 2. what a consumer is owed --------------------------------------------------------------
const denoJson = JSON.parse(await Deno.readTextFile(`${ROOT}/deno.json`)) as {
  exports: Record<string, string>; imports?: Record<string, string>;
};
const owed = ['deno.json', 'README.md', 'LICENSE', 'AGENTS.md',
  ...Object.values(denoJson.exports).map((p) => p.replace(/^\.\//, ''))];
const missing = owed.filter((f) => !rel.includes(f));
if (missing.length) fail('J2', `the published set lacks ${missing.join(', ')}`);
else ok(`the published set carries ${owed.join(', ')}`);

// --- 3. nothing development-only -------------------------------------------------------------
const forbidden = rel.filter((f) => /^(package(-lock)?\.json|tsconfig[^/]*\.json)$/.test(f) ||
  /^(scripts|test|examples|doc|spec|dist|dev-dist|node_modules|\.github)\//.test(f));
if (forbidden.length) fail('J3', `development-only files would be published: ${forbidden.join(', ')}`);
else ok('no development-only file is published');

// --- 4. the dependencies are exactly the declared ones ---------------------------------------
const declared = new Set(Object.keys(denoJson.imports ?? {}));
const used = new Map<string, string>();
for (const f of rel.filter((p) => /\.(ts|js|mjs)$/.test(p))) {
  for (const s of externalImports(await Deno.readTextFile(`${ROOT}/${f}`))) if (!used.has(s)) used.set(s, f);
}
const undeclared = [...used].filter(([s]) => !declared.has(s));
const unused = [...declared].filter((s) => !used.has(s));
if (undeclared.length) fail('J4', `the published source imports ${undeclared.map(([s, f]) => `${s} (${f})`).join(', ')}, which deno.json's imports do not declare`);
if (unused.length) fail('J4', `deno.json declares ${unused.join(', ')} and no published file imports it`);
if (!undeclared.length && !unused.length) ok(`the published imports are exactly deno.json's: ${[...declared].join(', ')}`);

// --- 5. a real flow against the staged copy alone --------------------------------------------
const staging = `${ROOT}/dev-dist/jsr-smoke-${Deno.pid}`;
await Deno.remove(staging, { recursive: true }).catch(() => {});
for (const { source, target } of stagingPlan(urls, ROOT_URL, staging)) {
  await Deno.mkdir(target.replace(/[\\/][^\\/]+$/, ''), { recursive: true });
  await Deno.copyFile(source, target);
}

// The consumer's own worker, outside the package — getting-started's `Greeter`.
await Deno.writeTextFile(`${staging}/consumer-worker.ts`, `
export default class Greeter {
  run(envelope: { settings: { say: string }; input: { text: string } }): { text: string } {
    return { text: envelope.input.text + ' ' + envelope.settings.say };
  }
}
`);
// **The expected value is DERIVED, not observed.** greet: 'hello' + ' world'. shout's transform
// runs on its input BEFORE its worker sees it (spec/flow-definition.md, the transform subsection,
// v0.18): { text: $uppercase('hello world') } = 'HELLO WORLD', then the worker appends ' !'.
await Deno.writeTextFile(`${staging}/smoke.ts`, `
import { createRuntime } from './src/scheduler/index.ts';
import { jsonata } from './src/jsonata/index.ts';
import { RegistryError } from './index.ts';
const want = 'HELLO WORLD !';
for (const inline of [false, true]) {
  const registry = {
    workers: { greeter: { url: './consumer-worker.ts', settingsSchema: { type: 'object', required: ['say'], properties: { say: { type: 'string' } } } } },
    nodeTypes: { Greeter: { worker: 'greeter', inline } },
    languages: ['jsonata'],
  };
  const flow = { flowId: 'smoke', version: 1, entry: 'greet', nodes: [
    { id: 'greet', kind: 'task', type: 'Greeter', settings: { say: 'world' }, edges: [{ to: 'shout' }] },
    { id: 'shout', kind: 'task', type: 'Greeter', settings: { say: '!' }, transform: { lang: 'jsonata', expr: '{ "text": $uppercase(text) }' }, edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ] };
  const rt = createRuntime(registry, { languages: { jsonata } }, { base: import.meta.url });
  const state = await rt.start(flow, { text: 'hello' }).done;
  await rt.shutdown();
  const shout = Object.values(state.nodes).find((n) => n.nodeId === 'shout');
  if (state.outcome !== 'completed') throw new Error((inline ? 'inline' : 'threaded') + ': outcome ' + state.outcome + ' ' + JSON.stringify(state.nodes));
  if (shout?.result?.text !== want) throw new Error((inline ? 'inline' : 'threaded') + ': shout returned ' + JSON.stringify(shout?.result));
  console.log('FLOW_OK ' + (inline ? 'inline' : 'threaded'));
}
let caught;
try { createRuntime({ workers: 5 }, {}, {}); } catch (e) { caught = e; }
if (!(caught instanceof RegistryError)) throw new Error('a registry defect did not throw a RegistryError: ' + caught);
console.log('REGISTRY_ERROR_OK');
`);
const flow = await run(Deno.execPath(), ['run', '--no-lock', `--config=${staging}/deno.json`,
  '--allow-read', '--allow-net', '--allow-env', '--allow-sys', `${staging}/smoke.ts`], staging);
for (const marker of ['FLOW_OK threaded', 'FLOW_OK inline', 'REGISTRY_ERROR_OK']) {
  if (!flow.out.includes(marker)) {
    fail('J5', `the staged flow did not print ${marker} (exit ${flow.code})`);
  }
}
if (flow.code !== 0 || failures.some((f) => f.startsWith('J5 '))) console.error(flow.out);
else ok('a typed node ran threaded and inline, with a jsonata transform, against the published files alone');

// --- 6. Node type stripping --------------------------------------------------------------------
const nodeV = await run('node', ['--version'], staging).catch(() => ({ code: 1, out: '' }));
const [maj, min] = nodeV.out.trim().replace(/^v/, '').split('.').map(Number);
if (nodeV.code !== 0 || !(maj > 22 || (maj === 22 && min >= 18))) {
  console.log('  skip  Node type stripping (needs Node >= 22.18 on the PATH)');
} else {
  const entry = new URL(`file:///${staging.replace(/\\/g, '/').replace(/^\//, '')}/index.ts`).href;
  const strip = await run('node', ['--input-type=module', '-e', `await import(${JSON.stringify(entry)});`], staging);
  if (strip.code !== 0) { console.error(strip.out); fail('J6', 'the published root entry does not load under Node type stripping'); }
  else ok(`the published root entry loads under Node ${nodeV.out.trim()} type stripping`);
}

if (failures.length === 0 || Deno.env.get('JSR_SMOKE_KEEP') !== '1') await Deno.remove(staging, { recursive: true }).catch(() => {});
if (failures.length) {
  console.error(`jsr:smoke: FAIL — ${failures.length} failure(s)`);
  Deno.exit(1);
}
console.log('jsr:smoke: ok');
