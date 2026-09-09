#!/usr/bin/env node
/**
 * `npm run selftests` — every `*:selftest` entry in `package.json`, run
 * CONCURRENTLY, with the entries that mutate state outside their own scratch space
 * run alone first.
 *
 * **Why this file exists.** [ADR 0039](../doc/decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md).
 * The gate was 21 entries in one `&&` chain, and 93% of its wall clock was the seven
 * `:selftest` entries proving the seven checks can still fail. Nothing decided that,
 * and two things about the arrangement were accidents rather than choices: the seven
 * ran BEFORE `lint` and `typecheck`, so a syntax error in `src/` was reported after
 * seven minutes; and they ran one at a time on a machine with twenty cores, because
 * `&&` is the only sequencing a manifest string has.
 *
 * **What this file does NOT do.** It does not choose which self-tests run, does not
 * skip any, and does not change what any of them prove. The set is *derived* from the
 * manifest — every entry whose name ends in `:selftest` — so there is no list here to
 * go stale against `package.json`, which is [Q102](../doc/open-questions.md)'s shape
 * and the reason `G3` reads the `scripts/` listing rather than a declaration.
 *
 * **What binds it.** `G4` in `scripts/check-wiring.mjs`:
 *   - the gate's chain must run this file;
 *   - `--plan`, run with no override set, must name exactly the manifest's
 *     `:selftest` entries, with exactly the commands the manifest gives them, and
 *     exactly the exclusive set the `scripts/` listing implies — all three compared
 *     BOTH WAYS;
 *   - and run with `CHECK_SELFTESTS_CMD` pointing every entry at a stub, it must
 *     report every planned entry as completed. That last one is the accounting path,
 *     and it is a clause rather than a comment because "the runner ran everything it
 *     planned" is exactly the wiring `doc/workflow.md` rule 8 obligation (e) asks
 *     about: [Q149](../doc/open-questions.md) one level out, in the item after the
 *     one that closed it.
 *
 * **Exclusivity is a property of a FILE, not of a list here.** A self-test that
 * mutates something outside `dev-dist/` cannot overlap anything that reads it —
 * today that is `check-scheduler-selftest.mjs`, whose install probes delete
 * `node_modules/fyflow-scheduler` and restore it from a stash
 * ([Q148](../doc/open-questions.md), whose row said it *renames* and whose scope was
 * one entry rather than four). Such a file declares itself with the marker below,
 * and this runner reads the marker rather than carrying a name. The authority is the
 * file, which is `G3`'s own argument one directory across.
 */
import { spawn } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PKG_PATH = process.env.CHECK_SELFTESTS_PKG ?? join(ROOT, 'package.json');
const SCRIPTS = resolve(ROOT, process.env.CHECK_SELFTESTS_SCRIPTS ?? join(ROOT, 'scripts'));

/**
 * **The marker a self-test uses to say it cannot share the tree.** Written as two
 * halves so this line is not itself a marker — the defect
 * [Q178](../doc/open-questions.md) records, where a literal that quotes the pattern
 * it searches for is a false match for itself, twice in one hour in one file.
 */
const MARK = `SELFTEST-${'EXCLUSIVE'}:`;

/**
 * **The command is overridable and the DEFAULT is what the gate runs**, which is the
 * distinction `G2` was built for one file across: an override is how a check becomes
 * affordable to test, and it is also how the only configuration anybody runs stops
 * being the one anything observes. `G4` reads the plan with this unset; **`G5` reads
 * this declaration**, because no run `G4` can afford takes this branch.
 */
const CMD = process.env.CHECK_SELFTESTS_CMD ?? '';

/** `npm run <entry>` — the command an entry gets when nothing overrides it. */
const commandFor = (entry) => `npm run ${entry}`;

export function plan(pkg) {
  const scripts = pkg.scripts ?? {};
  const entries = Object.keys(scripts).filter((n) => n.endsWith(':selftest')).sort();
  return entries.map((entry) => {
    // The self-test module of `check:X:selftest` is `scripts/check-X-selftest.mjs`,
    // which is not an assumption: `G2` reads that default out of the dispatch and
    // refuses any other, in every one of the seven.
    const m = /scripts\/([\w.-]+)\.mjs/.exec(scripts[entry] ?? '');
    const file = m ? join(SCRIPTS, `${m[1]}-selftest.mjs`) : null;
    let exclusive = false;
    if (file && existsSync(file)) exclusive = readFileSync(file, 'utf8').includes(MARK);
    // **ONE expression, printed by `--plan` and spawned by `run`.** The first version
    // applied the override at the spawn site and printed `commandFor(entry)`, so
    // `spawn(CMD ?? \`echo skipping ${command}\`)` left the plan truthful and the gate
    // green with the whole self-test half at 0.1 s. W39's adequacy reader, BLOCKING.
    return { entry, exclusive, command: CMD || commandFor(entry) };
  });
}

const pkg = JSON.parse(readFileSync(PKG_PATH, 'utf8'));
const PLAN = plan(pkg);

if (process.argv.includes('--plan')) {
  // **The plan prints the command it WOULD RUN**, which is the same `p.command` the
  // run below spawns — one expression, two readers. Printing `commandFor(entry)` while
  // spawning something else is how a runner stays truthful about work it does not do.
  for (const p of PLAN) {
    console.log(`${p.exclusive ? 'alone     ' : 'concurrent'} ${p.entry} :: ${p.command}`);
  }
  console.log(`plan ${PLAN.length} entries, ${PLAN.filter((p) => p.exclusive).length} exclusive`);
  process.exit(0);
}

const started = [];
const done = [];
const run = ({ entry, command }) => new Promise((res) => {
  started.push(entry);
  const t0 = process.hrtime.bigint();
  const chunks = [];
  const child = spawn(command, { cwd: ROOT, shell: true });
  child.stdout.on('data', (d) => chunks.push(d));
  child.stderr.on('data', (d) => chunks.push(d));
  child.on('error', (e) => chunks.push(Buffer.from(`spawn failed: ${e.message}\n`)));
  child.on('close', (code) => {
    const r = { entry, code, s: Number(process.hrtime.bigint() - t0) / 1e9,
                out: Buffer.concat(chunks).toString() };
    done.push(r);
    res(r);
  });
});

const t0 = process.hrtime.bigint();
const results = [];
// **Alone first, and `for await` rather than `Promise.all`.** An exclusive entry
// overlapping anything is the hazard; overlapping another exclusive one is the same
// hazard.
for (const p of PLAN.filter((x) => x.exclusive)) results.push(await run(p));

const rest = PLAN.filter((x) => !x.exclusive);
// `availableParallelism` arrived in Node 18; the fallback is here because a bare
// `node` on this machine is 16 and a runner that cannot start is a gate that
// cannot run. `engines` says >= 22, so the fallback is belt rather than braces.
const lanes = Math.max(1, Math.min(rest.length, os.availableParallelism?.() ?? os.cpus().length));
const queue = [...rest];
await Promise.all(Array.from({ length: lanes }, async () => {
  for (;;) {
    const p = queue.shift();
    if (!p) return;
    results.push(await run(p));
  }
}));
const wall = Number(process.hrtime.bigint() - t0) / 1e9;

// **Output in PLAN order, whole, and after everything has finished** — not in
// completion order and not filtered to failures. The gate's log is read by grepping
// for `FAIL` and by reading `GATE EXIT=`, and a runner that printed only what it
// thought was interesting would be deciding what the gate proves by deciding what it
// prints.
for (const p of PLAN) {
  const r = results.find((x) => x.entry === p.entry);
  // **A planned entry with no result is printed as NEVER RUN rather than crashing
  // here.** It is the defect this file's accounting clause exists for, and a
  // `TypeError` reading `r.code` would report it as a broken runner instead of as a
  // self-test that did not run — W5's third report state, and the reason `check-*`
  // carries `NOT RUN` at all.
  if (!r) { console.log(`\n=== ${p.entry} — NEVER RUN ===`); continue; }
  console.log(`\n=== ${p.entry} — ${r.code === 0 ? 'ok' : `EXIT ${r.code}`}, ${r.s.toFixed(1)} s ` +
    `${p.exclusive ? '(alone)' : `(1 of ${lanes} lanes)`} ===`);
  process.stdout.write(r.out.endsWith('\n') || r.out === '' ? r.out : `${r.out}\n`);
}

// **The accounting, and it is the whole of obligation (e) for this file.** A runner
// that plans seven and runs six is `npm run gate` at exit 0 with a self-test silently
// unrun — the hole W38 closed one level in, reintroduced by the mechanism that made
// the gate affordable. Both directions, because a lane that ran an entry twice is a
// different defect with the same count.
const planned = PLAN.map((p) => p.entry).sort();
const completed = done.map((r) => r.entry).sort();
const missing = planned.filter((e) => !completed.includes(e));
const extra = completed.filter((e) => !planned.includes(e));
let ok = results.every((r) => r.code === 0);
if (missing.length || extra.length || completed.length !== planned.length) {
  console.log(`\n  FAIL  selftests planned ${planned.length} entries and completed ${completed.length}` +
    `${missing.length ? ` — never run: ${missing.join(', ')}` : ''}` +
    `${extra.length ? ` — not planned: ${extra.join(', ')}` : ''}. A runner that plans an entry and ` +
    'does not run it is `npm run gate` at exit 0 with a self-test that did not run, which is the ' +
    'hole ADR 0039 was required not to reopen');
  ok = false;
}
console.log(`\nselftests — ${completed.length}/${planned.length} completed, ` +
  `${results.filter((r) => r.code === 0).length} ok, ${wall.toFixed(1)} s wall, ` +
  `${results.reduce((a, r) => a + r.s, 0).toFixed(1)} s serial-equivalent, ${lanes} lanes.`);
process.exit(ok ? 0 : 1);
