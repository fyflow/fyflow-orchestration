// **The negative tests for `check-workers.mjs`, checked in rather than run once by hand** —
// `doc/workflow.md` section 5 rule 7, all three requirements, and W28's contract that a grading
// names the probe it must break. [W72](../doc/work-items/w72-the-contract-an-example-beside-every-schema-and-a-worker-run-on-it.md).
//
//   node scripts/check-workers.mjs --self-test
//
// **The first probe is P19 fact 6, verbatim**: `echo.arrays` typed as a list of strings from the
// field's NAME, with an example `[]` that CONFORMS to the wrong schema — so `K1` is silent, the
// document resolves, and only running the worker says `$.arrays expected array, got number`. That
// is the case the check exists for, and the plan's W72 row asked for it as the check's first fixture.
//
// **Three passes.** PROBES break the DOCUMENT — a registry copy in scratch, one edit each — and
// declare the exact set of check ids the run must report under (rule 7 (c)); each asserts it changed
// its input (rule 7 (b)), and a CONTROL runs the unmutated document first and must be green. META
// breaks the CHECK — a mutated copy of `check-workers.mjs` — and each entry names the probe that must
// STOP being caught under it (W28), with an inertness run on the clean document so a mutant that
// turns the corpus red is graded `corpus` only where the entry SAYS so: two entries here do, because
// the defect they reintroduce (an un-copied example, no retry) is one the corpus itself exhibits,
// which is the strongest grading there is and is declared rather than stumbled into (Q150). A child
// that never prints the check's header line is a CRASH, not a detection (the `ran:` guard).
//
// **No `SELF` list, stated.** `check-docs` and `check-scheduler` ship the same way; the verdicts
// this file produces are provoked by W72's rule 8 set instead (obligation (e) over the wiring: the
// manifest entry, the dispatch, the harness, the default the gate runs), and W31 measured what a
// `SELF` list buys and what it cannot reach. What is bounded here: the probe list and the META
// list by a floor each, the ids every probe declares against the ids the CONTROL's report prints
// (derived, not a literal — Q209's `ALL_CHECKS` shape), and every reported id named by at least one
// probe (coverage), so a fifth clause added to the check with no probe is red here.
//
// **What the corpus cannot express, recorded rather than argued** (rule 8's FIRES requirement):
// `K4`'s walk clause — *the checked set equals the declared set* — has no document that trips it,
// because the loop is over the declared keys; it is a guard on the check's own loop and is
// measured by a rule 8 probe on the loop, not by a probe on a document.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const CHECK = 'scripts/check-workers.mjs';
const REGISTRY = 'examples/registry.json';
const BASE = 'examples';

/** Each probe edits a parsed copy of the corpus registry and declares the check ids the run must report. */
const PROBES = [
  {
    name: 'FACT 6 — echo.arrays typed as a list, its example [] conforming to the wrong schema: only running the worker says otherwise',
    checks: ['K2'],
    mutate: (d) => {
      d.workers.echo.outputSchema.properties.arrays = { type: 'array', items: { type: 'string' } };
      d.workers.echo.outputSchema.examples[0].arrays = [];
    },
  },
  {
    name: 'an example that refutes the schema it sits on — refused at construction, before any worker runs',
    checks: ['K1'],
    mutate: (d) => { d.workers.ingest.outputSchema.examples = [{}]; },
  },
  {
    name: 'an example on a NESTED schema that refutes it — the walk reaches it under properties',
    checks: ['K1'],
    mutate: (d) => { d.workers.score.outputSchema.properties.score.examples = [101]; },
  },
  {
    name: 'examples declared and EMPTY — a list that annotates nothing',
    checks: ['K1'],
    mutate: (d) => { d.workers.score.inputSchema.examples = []; },
  },
  {
    name: 'a keyword outside the subset on an input schema',
    checks: ['K1'],
    mutate: (d) => { d.workers.fetch.inputSchema.pattern = 'x'; },
  },
  {
    name: 'an output schema requiring a key the worker never returns (its example carrying the key, so K1 is silent)',
    checks: ['K2'],
    mutate: (d) => { d.workers.ingest.outputSchema.required.push('nope'); d.workers.ingest.outputSchema.properties.nope = {}; d.workers.ingest.outputSchema.examples[0].nope = 1; },
  },
  {
    name: 'a declared output schema on the worker that returns a FUNCTION — what it returned is not what it declared',
    checks: ['K2'],
    mutate: (d) => { d.workers.uncloneable.outputSchema = { type: 'object', properties: { fn: { type: 'string' } }, examples: [{ fn: 'f' }] }; },
  },
  {
    name: 'a worker url that loads nothing',
    checks: ['K3'],
    mutate: (d) => { d.workers.tally.url = './workers/nope.ts'; },
  },
  {
    name: 'a module with no default export that constructs (shared.ts)',
    checks: ['K3'],
    mutate: (d) => { d.workers.tally.url = './workers/shared.ts'; },
  },
  {
    name: 'a worker entry with no url',
    checks: ['K3'],
    mutate: (d) => { delete d.workers.split.url; },
  },
  {
    name: 'a worker that throws on both attempts UNDER a declared outputSchema — the schema is confirmed by nothing',
    checks: ['K3'],
    mutate: (d) => { d.workers.fail.outputSchema = { type: 'object', examples: [{}] }; },
  },
  {
    name: 'a worker entry carrying an UNDECLARED key (`note`) — refused as createRuntime refuses it, which the first cut of K1 let through (the adequacy reader, i8)',
    checks: ['K1'],
    mutate: (d) => { d.workers.tally.note = 'why'; },
  },
  {
    name: 'a config example the configSchema refutes — K1 over the third schema kind (the adequacy reader, e14a)',
    checks: ['K1'],
    mutate: (d) => { d.workers.prompt.configSchema.examples[0].model = 'huge'; },
  },
  {
    name: 'a settings example the settingsSchema refutes — K1 over the fourth schema kind (e14b)',
    checks: ['K1'],
    mutate: (d) => { d.workers.typed.settingsSchema.examples = [{ factor: 'ten' }]; },
  },
  {
    name: 'a document declaring no workers',
    checks: ['K4'],
    mutate: (d) => { d.workers = {}; },
  },
  {
    name: 'a document whose workers is not an object',
    checks: ['K4'],
    mutate: (d) => { d.workers = ['ingest']; },
  },
  {
    name: 'CONTROL, the witness road: split`s input example removed — green, and the verdict NAMES the witness it ran on',
    checks: [],
    mutate: (d) => { delete d.workers.split.inputSchema.examples; },
    mustPrint: /split\s+conforms on attempt 1, on the generator's WITNESS \{\}/,
  },
  {
    name: 'CONTROL, the witness carries a REQUIRED key: split`s input schema requiring `text` with no example — the witness is {"text":""}, not {}',
    checks: [],
    mutate: (d) => { delete d.workers.split.inputSchema.examples; d.workers.split.inputSchema.required = ['text']; },
    mustPrint: /split\s+conforms on attempt 1, on the generator's WITNESS \{"text":""\}/,
  },
  // Two more probes need a worker MODULE the corpus does not have — one that hangs, one whose
  // `setup()` throws — written into scratch by the harness (`SCRATCH_PROBES`), because
  // `examples/workers/**` is not this self-test's to add to.
];

/**
 * Worker MODULES the corpus cannot supply, written into scratch by the harness — because
 * `examples/workers/**` is not this self-test's to add to, and each is the ONE case that makes a
 * clause of the check fire (rule 8's FIRES requirement): a `run()` that never settles, a `setup()`
 * that throws, a `setup()` that never settles, a `run()` returning `undefined`, and `configEcho`,
 * which RETURNS the config it was constructed from and the settings and input it was handed — and
 * then MUTATES them — so *constructed from its config example, handed its settings example, each a
 * COPY* is a verdict rather than a sentence (the adequacy reader's B3, R6).
 */
const SCRATCH = {
  hang: 'export default class Hang { constructor() {} async run() { await new Promise(() => {}); } }\n',
  setupThrows: 'export default class SetupThrows { constructor() {} async setup() { throw new Error("setup refused"); } async run() { return {}; } }\n',
  setupHangs: 'export default class SetupHangs { constructor() {} async setup() { await new Promise(() => {}); } async run() { return {}; } }\n',
  undef: 'export default class Undef { constructor() {} async run() { return undefined; } }\n',
  configEcho: 'export default class ConfigEcho { constructor(c) { this.c = c ?? {}; } async run(env) {\n' +
    '  const out = { config: { ...this.c }, settings: { ...env.settings }, input: { ...env.input }, inputKeys: Object.keys(env.input) };\n' +
    '  this.c.mutated = true; env.settings.mutated = true; if (env.input && typeof env.input === "object") env.input.mutated = true;\n' +
    '  return out; } }\n',
};
const CONFIG_ECHO_ENTRY = (url) => ({
  url,
  configSchema: { type: 'object', required: ['k'], properties: { k: { type: 'integer' } }, additionalProperties: false, examples: [{ k: 1 }] },
  settingsSchema: { type: 'object', required: ['s'], properties: { s: { type: 'integer' } }, additionalProperties: false, examples: [{ s: 2 }] },
  inputSchema: { type: 'object', examples: [{ i: 3 }] },
  outputSchema: {
    type: 'object', required: ['config', 'settings', 'input', 'inputKeys'], additionalProperties: false,
    properties: { config: { const: { k: 1 } }, settings: { const: { s: 2 } }, input: { const: { i: 3 } }, inputKeys: { const: ['i'] } },
    examples: [{ config: { k: 1 }, settings: { s: 2 }, input: { i: 3 }, inputKeys: ['i'] }],
  },
});

// The scratch-module probes join PROBES below once the harness knows where it wrote the modules.
const SCRATCH_PROBES = (u) => [
  {
    name: 'a worker that never returns — the deadline is a verdict rather than a hung gate (costs the deadline, 10 s)',
    checks: ['K3'],
    mutate: (d) => { d.workers.tally.url = u.hang; },
    // The DEADLINE's own message: a module that fails to LOAD is K3 too, and the reader (e9) made the
    // file URL unloadable for zero — the verdict has to say which K3 it was.
    mustPrint: /K3: worker "tally": declares an outputSchema and threw on both attempts .*did not return within 10000 ms/,
  },
  {
    name: 'a worker whose setup() throws — K3 names setup(), not the attempts',
    checks: ['K3'],
    mutate: (d) => { d.workers.tally.url = u.setupThrows; },
    mustPrint: /K3: worker "tally": setup\(\) threw — setup refused/,
  },
  {
    name: 'a worker whose setup() never returns — the deadline covers setup() too (the adequacy reader, e5; costs 10 s)',
    checks: ['K3'],
    mutate: (d) => { d.workers.tally.url = u.setupHangs; },
    mustPrint: /K3: worker "tally": setup\(\) threw — did not return within 10000 ms/,
  },
  {
    name: 'a worker returning UNDEFINED under a declared outputSchema — not a value the schema accepts (e7b)',
    checks: ['K2'],
    mutate: (d) => { d.workers.tally.url = u.undef; d.workers.tally.outputSchema = { type: 'object', examples: [{}] }; },
  },
  {
    name: 'CONTROL, configEcho: the worker is CONSTRUCTED from its config example and HANDED its settings and input examples, each a COPY — echoed back and pinned by const, and the document survives the worker mutating all three',
    checks: [],
    mutate: (d) => { d.workers.configEcho = CONFIG_ECHO_ENTRY(u.configEcho); },
    mustPrint: /configEcho\s+conforms on attempt 1, on the DECLARED example/,
  },
  {
    name: 'CONTROL, the no-schema road: configEcho with NO inputSchema is handed {} and the verdict says so (e25)',
    checks: [],
    mutate: (d) => {
      const e = CONFIG_ECHO_ENTRY(u.configEcho);
      delete e.inputSchema;
      e.outputSchema.properties.input = { const: {} }; e.outputSchema.properties.inputKeys = { const: [] };
      e.outputSchema.examples = [{ config: { k: 1 }, settings: { s: 2 }, input: {}, inputKeys: [] }];
      d.workers.configEcho = e;
    },
    mustPrint: /configEcho\s+conforms on attempt 1, on no schema, \{\}/,
  },
];

/**
 * Each entry mutates a COPY of the check and names the probe that must stop being caught under it
 * (`expect: 'probe'`) — or, where the mutation reintroduces a defect the CORPUS itself exhibits,
 * names the id the clean document must go red under (`expect: 'corpus'`, declared, Q150).
 */
const META = [
  {
    name: 'K2`s validation disabled — the output is never held to the schema',
    probe: 'FACT 6', expect: 'probe',
    mutate: (t) => t.replace('const fs = findings(w.outputSchema, out);', 'const fs = [];'),
  },
  {
    name: 'K1 disabled — a schema outside the subset, or an example that refutes it, is never reported',
    probe: 'an example that refutes the schema it sits on', expect: 'probe',
    mutate: (t) => t.replace("    fail('K1', `worker ${q(name)}: ${e.name} — ${e.message}`);", "    void(`worker ${q(name)}: ${e.name} — ${e.message}`);"),
  },
  {
    name: 'K3`s threw-twice arm silenced',
    probe: 'a worker that throws on both attempts', expect: 'probe',
    mutate: (t) => t.replace("fail('K3', `worker ${q(name)}: declares an outputSchema and threw on both attempts", "void(`worker ${q(name)}: declares an outputSchema and threw on both attempts"),
  },
  {
    name: 'K3`s module-load arm silenced',
    probe: 'a worker url that loads nothing', expect: 'probe',
    mutate: (t) => t.replace("fail('K3', `worker ${q(name)}: module ${w.url} did not load", "void(`worker ${q(name)}: module ${w.url} did not load"),
  },
  {
    name: 'K4`s empty-document clause disabled',
    probe: 'a document declaring no workers', expect: 'probe',
    mutate: (t) => t.replace('else if (workers && Object.keys(workers).length === 0) fail(', 'else if (false) fail('),
  },
  {
    name: 'the example handed to a worker UN-COPIED — tally.ts mutates it and the document no longer equals the file',
    probe: 'FACT 6', expect: 'corpus', corpusId: 'K4',
    mutate: (t) => t.replace('const envelope = () => structuredClone({ settings: settings.value, input: input.value });', 'const envelope = () => ({ settings: settings.value, input: input.value });'),
  },
  {
    name: 'the one retry removed — retry.ts throws once by contract and has no return value on attempt 1',
    probe: 'FACT 6', expect: 'corpus', corpusId: 'K3',
    mutate: (t) => t.replace('for (attempt = 1; attempt <= 2; attempt++) {', 'for (attempt = 1; attempt <= 1; attempt++) {'),
  },
  {
    name: 'the exit path lies — failures printed and exit 0',
    probe: 'FACT 6', expect: 'probe',
    mutate: (t) => t.replace("console.log(`\\n${failures.length} failure(s).`);\n  process.exit(1);", "console.log(`\\n${failures.length} failure(s).`);\n  process.exit(0);"),
  },
  {
    name: 'the report row lies — every clause printed ok while the failures stand',
    probe: 'FACT 6', expect: 'probe',
    mutate: (t) => t.replace("console.log(`  ${bad.length ? 'FAIL' : 'ok  '}  ${c}", "console.log(`  ${'ok  '}  ${c}"),
  },
];

const MIN_PROBES = 24;
const MIN_META = 9;
/** Did the (possibly mutated) check RUN — a file that does not parse prints nothing. */
const RAN = (out) => /worker check — /.test(out);

const idsOf = (out) => [...out.matchAll(/^\s+FAIL\s+(K\d)/gm)].map((m) => m[1]).sort();
const reportIds = (out) => [...out.matchAll(/^\s+(?:ok|FAIL)\s+(K\d)/gm)].map((m) => m[1]).sort();
const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const canonical = (v) => JSON.stringify(v, (_, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, x[k]])) : x));

export async function selfTest(ROOT) {
  const dir = join(ROOT, 'dev-dist', `workers-selftest-${process.pid}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  /**
   * **[Q426](../doc/questions/q426.md)'s class, in the one of eight self-tests W105 listed in its `Owns`
   * block and did not touch — its conformity reader, BLOCKING.** The path already carried the pid, so
   * this file looked done; what it had no cover for is the ABORT path, which is the half output (1)
   * names. The only removals were before the `mkdirSync` above and one line before the single `return`,
   * and the rule 7 (b) guard below THROWS — `probe "..." changed nothing` propagates through
   * `check-workers.mjs`'s bare `await selfTest(ROOT)` and left the directory behind. *A per-process path
   * is not a removal, and an item whose subject is the first can ship without the second.*
   */
  process.on('exit', () => rmSync(dir, { recursive: true, force: true }));
  /**
   * **[Q426](../doc/questions/q426.md)'s class, in the one of eight self-tests W105 listed in its `Owns`
   * block and did not touch — its conformity reader, BLOCKING.** The path already carried the pid, so
   * this file looked done; what it had no cover for is the ABORT path, which is the half output (1)
   * names. The only removals were before the `mkdirSync` above and one line before the single `return`,
   * and the rule 7 (b) guard below THROWS — `probe "..." changed nothing` propagates through
   * `check-workers.mjs`'s bare `await selfTest(ROOT)` and left the directory behind. *A per-process path
   * is not a removal, and an item whose subject is the first can ship without the second.*
   */
  process.on('exit', () => rmSync(dir, { recursive: true, force: true }));
  const original = readFileSync(join(ROOT, REGISTRY), 'utf8');
  const checkText = readFileSync(join(ROOT, CHECK), 'utf8');
  const env = (registry, extra = {}) => ({ ...process.env, CHECK_WORKERS_REGISTRY: registry, CHECK_WORKERS_BASE: join(ROOT, BASE), CHECK_WORKERS_ROOT: ROOT, ...extra });
  const runCheck = (script, registry) => {
    const r = spawnSync(process.execPath, [script], { cwd: ROOT, encoding: 'utf8', env: env(registry), timeout: 120_000 });
    return { status: r.status, out: `${r.stdout ?? ''}\n${r.stderr ?? ''}` };
  };
  const fileUrl = (f) => `file:///${f.replace(/\\/g, '/').replace(/^\/+/, '')}`;
  const urls = {};
  for (const [k, src] of Object.entries(SCRATCH)) { const f = join(dir, `${k}.mjs`); writeFileSync(f, src); urls[k] = fileUrl(f); }
  const ALL_PROBES = [...PROBES, ...SCRATCH_PROBES(urls)];
  const fixtures = new Map();
  const fixtureFor = (p, i) => {
    if (fixtures.has(p.name)) return fixtures.get(p.name);
    const d = JSON.parse(original);
    p.mutate(d);
    if (canonical(d) === canonical(JSON.parse(original))) throw new Error(`probe "${p.name}" changed nothing — rule 7 (b)`);
    const f = join(dir, `probe-${i}.json`);
    writeFileSync(f, JSON.stringify(d, null, 1));
    fixtures.set(p.name, f);
    return f;
  };
  let failed = 0;
  const bad = (msg) => { failed++; console.log(`  FAIL  ${msg}`); };
  console.log('check-workers self-test —');

  // ---- the CONTROL: the shipped document is green, and its report names the ids every probe declares against ----
  const control = runCheck(join(ROOT, CHECK), join(ROOT, REGISTRY));
  const known = reportIds(control.out);
  if (!RAN(control.out)) bad('CONTROL: the check did not run on the shipped document');
  else if (control.status !== 0 || idsOf(control.out).length) bad(`CONTROL: the shipped document is RED — exit ${control.status}, ${idsOf(control.out).join(',') || 'no ids'}; a probe on a red baseline measures nothing`);
  // **And the shipped document is run on its DECLARED examples**, said of one worker by name — the
  // road every corpus entry takes, bound here so a check that quietly ran everything on the witness
  // (the same verdicts on this corpus, fact 3) is red on the WORD it prints.
  else if (!/echo\s+conforms on attempt 1, on the DECLARED example/.test(control.out)) bad('CONTROL: the shipped document did not run `echo` on its DECLARED example — the verdict line names a different road');
  else console.log(`  ok    CONTROL — the shipped document is green on its declared examples; the report names ${known.join(', ')}`);
  // **The lines the shipped document's verdict must carry, each a claim the item makes** — the
  // adequacy reader (B1, R5) rewrote both NOT CHECKED arms to `conforms`, the retry wording to
  // `attempt 1` and the header tally to zeros, and everything was green: a verdict nobody reads is
  // decoration. The two undescribable workers by name, the retried one by its attempt, the tally.
  const CONTROL_LINES = [
    [/fail\s+NOT CHECKED — no outputSchema declared; threw on both attempts \(flaky worker/, '`fail` reported NOT CHECKED by name, having thrown twice'],
    [/uncloneable\s+NOT CHECKED — no outputSchema declared; returned \{\} on attempt 1/, '`uncloneable` reported NOT CHECKED by name, having returned'],
    [/retry\s+conforms on attempt 2 \(the first threw: retry worker: first attempt/, '`retry` conforms on attempt 2 with the first throw quoted'],
    // **17 since [W86](../doc/work-items/w86-score-each-item-then-fan-out-per-item.md); 16 since
    // [W82](../doc/work-items/w82-a-result-its-own-schema-refuses-on-real-workers.md)**,
    // whose `gauge` and `stamp` are P21's exit artifact — and **both are GREEN here on purpose**:
    // one declares a bound its code does not keep past this example and the other returns a key
    // `structuredClone` will not carry, and neither is anything a run of a DECLARED EXAMPLE can see.
    // *That this line reads `17 ran on a declared example` with two defective workers in the
    // document is the measurement `OR-R13`'s capability half rests on.* (14 until then, 16 until
    // [W86](../doc/work-items/w86-score-each-item-then-fan-out-per-item.md) added `shard`.)
    //
    // **This literal is [Q342](../doc/questions/q342.md), and it fires on every item that adds a
    // worker**: the tally is a corpus CENSUS pinned in the GRADING rather than in the check, so a
    // seventeenth worker takes this gate entry RED while `check:workers` itself stays green. W82
    // recorded it and W86 is the second item to pay it, which is the datum rather than the edit.
    //
    // **21 since [W94](../doc/work-items/w94-a-tv-series-ingest-through-a-gate-on-real-workers.md)**, P24's exit artifact:
    // `download`, `identify`, `thumbnail` and `series`, the TV ingest's four — Q342's third item to pay it, SEEDED this
    // time in P24's declaration and in W94's, so it fired as predicted rather than as a surprise.
    [/21 worker\(s\) in examples\/registry\.json: 21 ran on a declared example, 0 on the generator's witness, 2 not checked \(no outputSchema\), 0 refused/, 'the header tally: all 21 on declared examples, 0 on the witness, 2 of them not checked, 0 refused'],
  ];
  for (const [re, what] of CONTROL_LINES) if (!re.test(control.out)) bad(`CONTROL: the shipped document's verdict does not say ${what}`);
  // **And the configuration the GATE runs — nothing set — is the one every spawn above overrides**
  // (the adequacy reader's B2, W39's G5 one check over): a check that exited 0 having run nothing
  // whenever `CHECK_WORKERS_REGISTRY` was unset was green at every rung. Run it once with every
  // override stripped and hold it to the same lines.
  const bare = { ...process.env };
  for (const k of Object.keys(bare)) if (k.startsWith('CHECK_WORKERS_')) delete bare[k];
  const plain = spawnSync(process.execPath, [join(ROOT, CHECK)], { cwd: ROOT, encoding: 'utf8', env: bare, timeout: 120_000 });
  const plainOut = `${plain.stdout ?? ''}\n${plain.stderr ?? ''}`;
  if (!RAN(plainOut) || plain.status !== 0 || !CONTROL_LINES.every(([re]) => re.test(plainOut))) bad(`CONTROL, no overrides: the check as the gate runs it exited ${plain.status} — ${RAN(plainOut) ? 'ran, and its verdict is not the shipped document`s' : 'did not run'}`);
  else console.log('  ok    CONTROL — with no override set, the check runs the shipped document and says the same');

  // ---- PROBES ----
  if (ALL_PROBES.length < MIN_PROBES) bad(`ALL_PROBES has ${ALL_PROBES.length} entries, below the floor of ${MIN_PROBES}`);
  let caught = 0;
  const declaredIds = new Set();
  for (const [i, p] of ALL_PROBES.entries()) {
    for (const id of p.checks) { declaredIds.add(id); if (!known.includes(id)) bad(`probe "${p.name}" declares ${id}, which the control's report never prints`); }
    let fixture;
    try { fixture = fixtureFor(p, i); } catch (e) { bad(e.message); continue; }
    const r = runCheck(join(ROOT, CHECK), fixture);
    const ids = idsOf(r.out);
    const want = [...p.checks].sort();
    if (!RAN(r.out)) { bad(`${p.name}: the check did not run (exit ${r.status}) — a crash, not a detection`); continue; }
    const ok = want.length === 0
      ? r.status === 0 && ids.length === 0 && (!p.mustPrint || p.mustPrint.test(r.out))
      : r.status === 1 && same(ids, want);
    if (ok) { caught++; console.log(`  ok    ${want.length ? `[${want.join(',')}]` : 'green'} ${p.name}`); }
    else bad(`${p.name}: declared [${want.join(',')}] and the run reported [${ids.join(',')}] at exit ${r.status}${p.mustPrint && !p.mustPrint.test(r.out) ? ' — and the verdict line was not printed' : ''}`);
  }
  for (const id of known) if (!declaredIds.has(id)) bad(`${id} is reported by the check and provoked by no probe — a clause nothing negative-tests`);
  console.log(`  ${caught}/${ALL_PROBES.length} probes caught`);

  // ---- META ----
  if (META.length < MIN_META) bad(`META has ${META.length} entries, below the floor of ${MIN_META}`);
  let noticed = 0;
  for (const [i, m] of META.entries()) {
    const probe = ALL_PROBES.find((p) => p.name.startsWith(m.probe));
    if (!probe) { bad(`META "${m.name}" names probe "${m.probe}", which does not exist — ABORT`); continue; }
    const mutated = m.mutate(checkText);
    if (mutated === checkText) { bad(`META "${m.name}": the mutation matched nothing — ABORT`); continue; }
    const script = join(dir, `meta-${i}.mjs`);
    writeFileSync(script, mutated);
    const clean = runCheck(script, join(ROOT, REGISTRY));
    if (!RAN(clean.out)) { bad(`META "${m.name}": the mutant did not run on the clean document (exit ${clean.status}) — a crash, not a detection`); continue; }
    if (m.expect === 'corpus') {
      const ids = idsOf(clean.out);
      if (clean.status === 1 && same(ids, [m.corpusId])) { noticed++; console.log(`  ok    corpus:${m.corpusId} ${m.name}`); }
      else bad(`META "${m.name}": declared the CORPUS goes red under ${m.corpusId} and it reported [${ids.join(',')}] at exit ${clean.status}`);
      continue;
    }
    if (clean.status !== 0 || idsOf(clean.out).length) { bad(`META "${m.name}": the mutant is not inert on the clean document (${idsOf(clean.out).join(',')}) — declare it corpus or fix the entry`); continue; }
    const r = runCheck(script, fixtureFor(probe, ALL_PROBES.indexOf(probe)));
    if (!RAN(r.out)) { bad(`META "${m.name}": the mutant did not run on the probe (exit ${r.status}) — a crash, not a detection`); continue; }
    const stillCaught = r.status === 1 && same(idsOf(r.out), [...probe.checks].sort());
    if (!stillCaught) { noticed++; console.log(`  ok    noticed ${m.name} — "${probe.name.slice(0, 50)}" no longer caught (exit ${r.status}, [${idsOf(r.out).join(',')}])`); }
    else bad(`META "${m.name}": STILL CAUGHT by "${probe.name.slice(0, 50)}" — the mutation reached nothing the probe observes`);
  }
  console.log(`  ${noticed}/${META.length} gradings noticed`);

  rmSync(dir, { recursive: true, force: true });
  if (existsSync(dir)) bad(`scratch ${dir} was not removed`);
  console.log(failed ? `\n${failed} failure(s).` : `\ncheck-workers self-test passed — ${ALL_PROBES.length} probes, ${META.length} gradings.`);
  return failed ? 1 : 0;
}
