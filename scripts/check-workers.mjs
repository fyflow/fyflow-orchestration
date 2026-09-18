#!/usr/bin/env node
// **The worker CONFORMANCE check — a worker is RUN on its declared input example, and what it
// returned is validated against its output schema.** P19 decision 3,
// [ADR 0056](../doc/decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md),
// [W72](../doc/work-items/w72-the-contract-an-example-beside-every-schema-and-a-worker-run-on-it.md).
//
//   node scripts/check-workers.mjs              node scripts/check-workers.mjs --self-test
//
// **Why it EXECUTES rather than reads.** P19 fact 6: writing honest output schemas for the fourteen
// corpus workers, the author typed `echo.arrays` as a list from the field's NAME — it is a count —
// and the example written beside that schema CONFORMED to it. A schema and its example agreeing
// proves the schema is self-consistent and says nothing about the worker; only running the worker
// found the mismatch, one of twelve. So this check is what `check-docs` is for a snippet: the
// declaration is executed, and the verdict is about what the worker DID.
//
// **What it does, per worker entry of a registry DOCUMENT** (default `examples/registry.json`):
//   K1  the entry passes the driver's own shape check, `checkRegistry` — every key declared, every
//       schema in the built-in subset, every `examples` held to its schema (ADR 0053 rule 5, ADR
//       0056 rule 2) — so a defect is reported here exactly as `createRuntime` would refuse it
//   K3  the module at the entry's `url` loads, its default export constructs from the config
//       example (or the witness, or `{}`), and — where an `outputSchema` is declared — `run()`
//       RETURNS a value for the input example, with ONE retry on the same task id, because a
//       worker whose contract is to fail its first attempt (`retry.ts`) has no return value to
//       check until its second. A worker with no `outputSchema` that throws has broken nothing it
//       declared (`fail.ts` throws on every call by contract) and is reported, not counted
//   K2  what `run()` returned conforms to the entry's `outputSchema` — the finding names the path
//       (`$.arrays expected array, got number` is fact 6's line); an entry with no `outputSchema`
//       is reported NOT CHECKED by name, which is what `fail` and `uncloneable` are
//   K4  the walk itself: every declared worker was checked (the checked set equals the document's
//       keys both ways), the document declares at least one, and the document in memory is
//       UNCHANGED by the run — every example is handed to a worker as a COPY, because a corpus
//       worker (`tally.ts`) MUTATES what it is handed and the declaration would otherwise ship
//       mutated to whatever reads it next (measured at W72's declaration, fact 6)
//
// **The input a worker is run on is its `inputSchema.examples[0]`, and where there is none the
// generator's WITNESS** — P19 fact 5's 28-line sampler, the maintainer's choice at W72's
// stop-and-ask 1 (optional, with the fallback named). The verdict SAYS which it ran on, and prints
// the witness, because the witness is the least value the schema admits: `{}` for thirteen of the
// fourteen corpus input schemas and `{"text":""}` for `prompt`'s, which requires a key — and it
// exercises fewer output paths than the declared example does (W72's declaration, fact 3, re-taken
// on the shipped document by its conformity reader). A declared example is primary; the witness is
// a floor. **And one example confirms a schema at ONE value**: a bound the worker's code does not
// guarantee over its whole input domain is invisible here — W72's conformity reader found two such
// bounds by deriving from the code, which is Q302.
//
// It reports; it does not fix. Exits 0 when every check passes, 1 otherwise. `CHECK_WORKERS_REGISTRY`
// points it at another document, `CHECK_WORKERS_BASE` at the directory relative worker URLs resolve
// against (default: the document's own), `CHECK_WORKERS_ROOT` at the tree whose `src/` it validates
// with — which is how `--self-test` breaks a document, and a copy of this file, without touching
// the tree.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = process.env.CHECK_WORKERS_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rel = (p) => relative(ROOT, p).replace(/\\/g, '/');

if (process.argv.includes('--self-test')) {
  const mod = process.env.CHECK_WORKERS_SELFTEST ?? join(ROOT, 'scripts', 'check-workers-selftest.mjs');
  // `resolve`, not `join`: the default is already absolute. The override is what lets
  // `check-wiring.mjs`'s `G1` prove this dispatch ROUTES rather than that its text exists (W38);
  // `G2` reads the declaration on the line above and compares both names.
  const { selfTest } = await import(pathToFileURL(resolve(ROOT, mod)).href);
  process.exit(await selfTest(ROOT));
}

const REGISTRY = resolve(ROOT, process.env.CHECK_WORKERS_REGISTRY ?? join('examples', 'registry.json'));
const BASE = resolve(ROOT, process.env.CHECK_WORKERS_BASE ?? dirname(REGISTRY));
const RUN_TIMEOUT_MS = 10_000;

const { findings, describeFindings, canonical } =
  await import(pathToFileURL(join(ROOT, 'src', 'definition', 'schema.ts')).href);
// **K1 is the DRIVER's own shape check over one entry, not a copy of it** — `checkRegistry` is what
// `new Driver` and `createRuntime` run: every key declared, every schema in the subset, every example
// held to its schema. W72's adequacy reader (i8) found the first cut re-implemented the schema half
// and let an undeclared entry key through that `createRuntime` refuses; one function, two callers.
const { checkRegistry, RegistryError } =
  await import(pathToFileURL(join(ROOT, 'src', 'definition', 'registry.ts')).href);

const failures = [];
const fail = (check, msg) => failures.push(`${check}: ${msg}`);
const q = (s) => JSON.stringify(s);
const short = (v, n = 120) => { const s = JSON.stringify(v) ?? String(v); return s.length > n ? `${s.slice(0, n)}…` : s; };

/**
 * **A WITNESS that the schema is satisfiable** — P19 fact 5's generator, which W72 kept here and W73
 * moved into the library as `src/definition/witness.ts` so the wiring check and W74's assist run on
 * the SAME generator this check does: one copy, imported by URL the way `schema.ts` is above.
 */
const { witness } = await import(pathToFileURL(join(ROOT, 'src', 'definition', 'witness.ts')).href);

/** The value to run a worker on for one schema kind: the declared example, else a witness, else `{}` — and which it was. */
function valueFor(schema) {
  if (schema === undefined) return { value: {}, source: 'no schema, {}' };
  if (Array.isArray(schema.examples) && schema.examples.length > 0) return { value: schema.examples[0], source: 'the DECLARED example' };
  const w = witness(schema);
  return { value: w, source: `the generator's WITNESS ${short(w, 60)}` };
}

/** `run()` with a deadline, so a worker that never returns is a verdict rather than a hung gate. */
function withDeadline(p, ms) {
  let t;
  return Promise.race([p, new Promise((_, rej) => { t = setTimeout(() => rej(new Error(`did not return within ${ms} ms`)), ms); })])
    .finally(() => clearTimeout(t));
}

// --- the document ------------------------------------------------------------------------------
let text = null;
let doc = null;
if (!existsSync(REGISTRY)) fail('K4', `${rel(REGISTRY)} does not exist, so there are no workers to check`);
else {
  text = readFileSync(REGISTRY, 'utf8');
  try { doc = JSON.parse(text); } catch (e) { fail('K4', `${rel(REGISTRY)} is not JSON: ${e.message}`); }
}
const workers = doc && typeof doc === 'object' && doc.workers && typeof doc.workers === 'object' && !Array.isArray(doc.workers) ? doc.workers : null;
if (doc && workers === null) fail('K4', `${rel(REGISTRY)} has no \`workers\` object`);
else if (workers && Object.keys(workers).length === 0) fail('K4', `${rel(REGISTRY)} declares no workers, so this check would pass over nothing`);
const declared = workers ? Object.keys(workers).sort() : [];

// --- per worker ----------------------------------------------------------------------------------
const lines = [];
const checked = [];
const tally = { declared: 0, witness: 0, notChecked: 0, refused: 0 };
for (const name of declared) {
  const w = workers[name];
  checked.push(name);
  if (!w || typeof w !== 'object' || typeof w.url !== 'string') {
    fail('K3', `worker ${q(name)} has no url to load`);
    lines.push(`  ${name.padEnd(12)} REFUSED — no url`);
    tally.refused++;
    continue;
  }
  // K1 — the entry as `new Driver` and `createRuntime` see it: every key declared, every schema in the
  // subset, every example held to its schema — BEFORE anything is run on it.
  try { checkRegistry({ workers: { [name]: w } }); } catch (e) {
    if (!(e instanceof RegistryError)) throw e;
    fail('K1', `worker ${q(name)}: ${e.name} — ${e.message}`);
    lines.push(`  ${name.padEnd(12)} REFUSED — ${e.name}, as createRuntime would refuse it (K1)`);
    tally.refused++;
    continue;
  }

  // K3 — load, construct, run (with one retry on the same task id).
  const url = /^[a-z][a-z0-9+.-]*:/i.test(w.url) ? w.url : pathToFileURL(resolve(BASE, w.url)).href;
  let Worker;
  try {
    const mod = await import(url);
    Worker = mod.default;
  } catch (e) {
    fail('K3', `worker ${q(name)}: module ${w.url} did not load — ${String(e.message ?? e).split('\n')[0]}`);
    lines.push(`  ${name.padEnd(12)} FAILED — module did not load (K3)`);
    continue;
  }
  if (typeof Worker !== 'function') {
    fail('K3', `worker ${q(name)}: module ${w.url} has no default export that constructs (got ${typeof Worker})`);
    lines.push(`  ${name.padEnd(12)} FAILED — no constructor (K3)`);
    continue;
  }
  const config = valueFor(w.configSchema);
  const settings = valueFor(w.settingsSchema);
  const input = valueFor(w.inputSchema);
  let worker;
  try { worker = new Worker(structuredClone(config.value), undefined); } catch (e) {
    fail('K3', `worker ${q(name)}: the constructor threw on ${config.source} — ${String(e.message ?? e).split('\n')[0]}`);
    lines.push(`  ${name.padEnd(12)} FAILED — constructor threw (K3)`);
    continue;
  }
  // **Every value a worker sees is a COPY** (K4's last clause): the document's own example must
  // survive the run unchanged, and `tally.ts` writes into what it is handed.
  const envelope = () => structuredClone({ settings: settings.value, input: input.value });
  const context = { taskId: `check-workers:${name}:0` };
  let out;
  let attempt = 0;
  let first = null;
  // `setup()` and `teardown()` outside the attempts' try, so a throw there is reported as ITS OWN
  // and never as "threw on both attempts … first: null" — W72's conformity reader (finding 10).
  try { if (typeof worker.setup === 'function') await withDeadline(worker.setup(), RUN_TIMEOUT_MS); } catch (e) {
    fail('K3', `worker ${q(name)}: setup() threw — ${String(e.message ?? e).split('\n')[0]}`);
    lines.push(`  ${name.padEnd(12)} FAILED — setup() threw (K3)`);
    continue;
  }
  try {
    // **A loop that exhausts its attempts without a value THROWS the last error** — the self-test's
    // retry-removal mutant found the first shape of this loop falling through with `out` undefined
    // and reporting the throw as a K2 mismatch of `undefined`: the right verdict for the wrong reason.
    let lastError = null;
    for (attempt = 1; attempt <= 2; attempt++) {
      try { out = await withDeadline(worker.run(envelope(), context), RUN_TIMEOUT_MS); lastError = null; break; } catch (e) {
        lastError = e;
        if (first === null) first = String(e.message ?? e).split('\n')[0];
      }
    }
    if (lastError !== null) throw lastError;
  } catch (e) {
    const second = String(e.message ?? e).split('\n')[0];
    if (input.source.startsWith('the DECLARED')) tally.declared++; else tally.witness++;
    // **A worker with NO outputSchema has declared nothing about what it returns, so a throw is not
    // a failure of anything declared** — `fail.ts` throws on every call by contract, and the entry
    // says so by declaring no output schema (W72's assumption 2). Reported by name, never counted.
    if (w.outputSchema === undefined) {
      tally.notChecked++;
      lines.push(`  ${name.padEnd(12)} NOT CHECKED — no outputSchema declared; threw on both attempts (${second.slice(0, 60)}) on ${input.source}`);
      continue;
    }
    fail('K3', `worker ${q(name)}: declares an outputSchema and threw on both attempts for ${input.source} — first: ${first}; second: ${second}`);
    lines.push(`  ${name.padEnd(12)} FAILED — threw twice, so its outputSchema is confirmed by nothing (K3)`);
    continue;
  }
  try { if (typeof worker.teardown === 'function') await withDeadline(worker.teardown(), RUN_TIMEOUT_MS); } catch (e) {
    fail('K3', `worker ${q(name)}: teardown() threw — ${String(e.message ?? e).split('\n')[0]}`);
  }
  const ranOn = `attempt ${attempt}${first ? ` (the first threw: ${first.slice(0, 50)})` : ''}, on ${input.source}`;
  if (input.source.startsWith('the DECLARED')) tally.declared++; else tally.witness++;

  // K2 — the value returned, against the output schema.
  if (w.outputSchema === undefined) {
    tally.notChecked++;
    lines.push(`  ${name.padEnd(12)} NOT CHECKED — no outputSchema declared; returned ${short(out, 60)} on ${ranOn}`);
    continue;
  }
  const fs = findings(w.outputSchema, out);
  if (fs.length) {
    fail('K2', `worker ${q(name)}: what run() returned does not conform to its outputSchema — ${describeFindings(fs)} (ran on ${ranOn}; actual ${short(out)})`);
    lines.push(`  ${name.padEnd(12)} MISMATCH — ${describeFindings(fs).slice(0, 80)} (K2)`);
  } else {
    lines.push(`  ${name.padEnd(12)} conforms on ${ranOn}`);
  }
}

// --- K4: the walk ----------------------------------------------------------------------------------
if (workers) {
  const c = [...checked].sort();
  if (c.join(',') !== declared.join(',')) fail('K4', `checked [${c.join(', ')}] and the document declares [${declared.join(', ')}] — the walk skipped or invented an entry`);
  if (canonical(JSON.parse(text)) !== canonical(doc)) {
    fail('K4', `${rel(REGISTRY)} in memory no longer equals the file — the run MUTATED the document, so an example was handed to a worker without being copied`);
  }
}

// --- report ------------------------------------------------------------------------------------------
const CHECKS = ['K1 every worker entry passes the driver`s own shape check — keys, schemas, examples',
                'K2 what run() returned conforms to the outputSchema',
                'K3 the module loads, constructs, and returns a value on the input example',
                'K4 every declared worker was checked and the document is unchanged by the run'];
console.log(`worker check — ${declared.length} worker(s) in ${rel(REGISTRY)}: ${tally.declared} ran on a declared example, ` +
  `${tally.witness} on the generator's witness, ${tally.notChecked} not checked (no outputSchema), ${tally.refused} refused\n`);
for (const l of lines) console.log(l);
console.log('');
for (const c of CHECKS) {
  const id = c.slice(0, 2);
  const bad = failures.filter((f) => f.startsWith(id + ':'));
  console.log(`  ${bad.length ? 'FAIL' : 'ok  '}  ${c}${bad.length ? ` (${bad.length})` : ''}`);
}
if (failures.length) {
  console.log('\n' + failures.map((f) => '  ' + f).join('\n'));
  console.log(`\n${failures.length} failure(s).`);
  process.exit(1);
}
console.log(`\nAll checks passed — ${declared.length} workers, every declared output schema confirmed by a run.`);
