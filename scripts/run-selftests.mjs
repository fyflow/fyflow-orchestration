#!/usr/bin/env node
/**
 * `npm run selftests` — every `*:selftest` entry in `package.json`, run
 * CONCURRENTLY, with the entries that mutate state outside their own scratch space
 * run alone first.
 *
 * **Why this file exists.** [ADR 0039](../doc/decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md).
 * The gate was 21 entries in one `&&` chain, and 93% of its wall clock was the seven
 * `:selftest` entries proving the checks can still fail (seven then; eight since W72). Nothing decided that,
 * and two things about the arrangement were accidents rather than choices: the seven
 * ran BEFORE `lint` and `typecheck`, so a syntax error in `src/` was reported after
 * seven minutes; and they ran one at a time on a machine with twenty cores, because
 * `&&` is the only sequencing a manifest string has.
 *
 * **What this file does NOT do.** It does not choose which self-tests run, and does not
 * change what any of them prove. The set is *derived* from the manifest — every entry
 * whose name ends in `:selftest` — so there is no list here to go stale against
 * `package.json`, which is [Q102](../doc/questions/q102.md)'s shape and the reason `G3`
 * reads the `scripts/` listing rather than a declaration.
 *
 * **It skips an entry only when its CALLER names it, and says so — `--without <entry>`,
 * W139.** `doc/workflow.md` v0.29: an item's confirming gate is `gate:full` less
 * `check:register:selftest`, and `npm run gate:item` is that gate. The choice of WHICH
 * lane is the manifest's (`gate:item`'s own argv) and `G7` in `scripts/check-wiring.mjs`
 * binds it to exactly that one; this file only obeys and accounts. **It cannot leave
 * nothing out silently**: a `--without` with no entry, an entry that is not a `:selftest`
 * entry, a duplicate, an argument it does not know, or a set that leaves nothing to run
 * is REFUSED, exit 2, before anything runs — measured at W139's declaration, this file
 * ignored every argument but `--plan`, so `--without x` was exit 0. Every left-out entry
 * is printed by `--plan` and by the run, and the accounting below compares the run's
 * entries plus the left-out ones to the manifest both ways.
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
 *     about: [Q149](../doc/questions/q149.md) one level out, in the item after the
 *     one that closed it.
 *
 * **Exclusivity is a property of a FILE, not of a list here.** A self-test that
 * mutates something outside `dev-dist/` cannot overlap anything that reads it —
 * today that is `check-scheduler-selftest.mjs`, whose install probes delete
 * `node_modules/fyflow-scheduler` and restore it from a stash
 * ([Q148](../doc/questions/q148.md), whose row said it *renames* and whose scope was
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
 * [Q178](../doc/questions/q178.md) records, where a literal that quotes the pattern
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

/**
 * **The arguments, read whole, and anything unknown is a refusal rather than ignored.**
 * Returns the entries `--without` names, in order, and every reason to refuse. Pure, so
 * a reader can see that `--plan` and `--without` are the only two words it accepts.
 */
export function argsFrom(argv) {
  const without = [];
  const refusals = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--plan') continue;
    if (a === '--without') {
      const v = argv[i + 1];
      i += 1;
      if (v === undefined || v === '' || v.startsWith('--')) {
        refusals.push('`--without` names no entry, and leaving out nothing is not something this ' +
          'option does silently');
        if (v !== undefined && v.startsWith('--')) i -= 1;
      } else if (without.includes(v)) {
        refusals.push(`\`--without ${v}\` is given twice`);
      } else {
        without.push(v);
      }
      continue;
    }
    refusals.push(`\`${a}\` is not an argument this runner knows (\`--plan\`, \`--without <entry>\`)`);
  }
  return { without, refusals };
}

export function plan(pkg, without = []) {
  const scripts = pkg.scripts ?? {};
  const entries = Object.keys(scripts).filter((n) => n.endsWith(':selftest')).sort();
  return entries.filter((entry) => !without.includes(entry)).map((entry) => {
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
const ARGS = argsFrom(process.argv.slice(2));
const WITHOUT = ARGS.without;
const PLAN = plan(pkg, WITHOUT);

/** Every `:selftest` entry the manifest declares — what the run and the left-out set must add up to. */
const MANIFEST = Object.keys(pkg.scripts ?? {}).filter((n) => n.endsWith(':selftest')).sort();
const LEFT_OUT = MANIFEST.filter((e) => WITHOUT.includes(e));
{
  const refusals = [...ARGS.refusals];
  for (const w of WITHOUT.filter((x) => !MANIFEST.includes(x))) {
    refusals.push(`\`--without ${w}\` names no \`:selftest\` entry in package.json, so it would leave ` +
      'out nothing — a misspelt lane is a gate that runs everything while its caller believes otherwise');
  }
  if (WITHOUT.length && PLAN.length === 0) {
    refusals.push(`\`--without\` leaves out all ${MANIFEST.length} entries, and a run of none proves nothing`);
  }
  if (refusals.length) {
    for (const r of refusals) console.log(`  FAIL  selftests refused: ${r}`);
    process.exit(2);
  }
}

if (process.argv.includes('--plan')) {
  // **The plan prints the command it WOULD RUN**, which is the same `p.command` the
  // run below spawns — one expression, two readers. Printing `commandFor(entry)` while
  // spawning something else is how a runner stays truthful about work it does not do.
  for (const p of PLAN) {
    console.log(`${p.exclusive ? 'alone     ' : 'concurrent'} ${p.entry} :: ${p.command}`);
  }
  for (const e of LEFT_OUT) console.log(`left out   ${e} :: --without`);
  console.log(`plan ${PLAN.length} entries, ${PLAN.filter((p) => p.exclusive).length} exclusive` +
    `${LEFT_OUT.length ? `, ${LEFT_OUT.length} left out` : ''}`);
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
for (const e of LEFT_OUT) console.log(`\n=== ${e} — LEFT OUT by --without, not run ===`);

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
// **And the run plus what was left out is the MANIFEST, both ways — W139.** The check
// above compares the run to its own plan, so a `plan()` that stopped honouring
// `--without`, or honoured an entry nobody named, is invisible to it: plan and run agree
// and both are wrong. This compares them to the one list neither of them computes.
{
  const accounted = [...planned, ...LEFT_OUT].sort();
  const unaccounted = MANIFEST.filter((e) => !accounted.includes(e));
  const twice = accounted.filter((e, i) => accounted.indexOf(e) !== i);
  const foreign = accounted.filter((e) => !MANIFEST.includes(e));
  if (unaccounted.length || twice.length || foreign.length) {
    console.log(`\n  FAIL  selftests ran ${planned.length} and left out ${LEFT_OUT.length} of the manifest's ` +
      `${MANIFEST.length} \`:selftest\` entries` +
      `${unaccounted.length ? ` — neither run nor left out: ${unaccounted.join(', ')}` : ''}` +
      `${twice.length ? ` — both run and left out: ${twice.join(', ')}` : ''}` +
      `${foreign.length ? ` — not in the manifest: ${foreign.join(', ')}` : ''}. A lane may leave only ` +
      'by being NAMED, and every one named must be the one that left');
    ok = false;
  }
}
console.log(`\nselftests — ${completed.length}/${planned.length} completed, ` +
  `${results.filter((r) => r.code === 0).length} ok, ${wall.toFixed(1)} s wall, ` +
  `${results.reduce((a, r) => a + r.s, 0).toFixed(1)} s serial-equivalent, ${lanes} lanes` +
  `${LEFT_OUT.length ? `, ${LEFT_OUT.length} left out: ${LEFT_OUT.join(', ')}` : ''}.`);
process.exit(ok ? 0 : 1);
