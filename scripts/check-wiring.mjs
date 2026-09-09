#!/usr/bin/env node
// Ladder L0 — **the gate's own wiring: a `:selftest` entry actually runs a
// self-test.**
//
//   node scripts/check-wiring.mjs        node scripts/check-wiring.mjs --self-test
//
// Exits 0 when every check passes, 1 otherwise. It reports; it does not fix.
//
// **Why this is its own entry rather than a clause in `check-source.mjs`, and the
// reason is a measurement — [W38](../doc/work-items/w38-the-dispatch-nothing-binds.md).**
// It was written there first. `check-source-selftest.mjs` re-runs `check-source`
// for every probe, every `META` grading and every `SELF` entry — **roughly four
// hundred times** — so a per-run cost is multiplied by four hundred. The clause
// costs **0.6 s**, which is a process start per check; inside `check-source` that
// took `check:source:selftest` from **81.2 s to 317 s** and would have taken the
// gate from 433.7 s to about 670. **Here the cost is paid once.**
//
// *A check's price is not what it costs to run — it is what it costs to run
// multiplied by how often the thing around it is re-run.* That is
// [P11](../doc/plans/p11-what-should-the-gate-prove.md)'s subject arriving inside
// its own first item, and W39 owes it a verdict.
//
// `CHECK_WIRING_SCRIPTS` points `G1` at a staged copy of the check scripts, which
// is how the self-test cuts a dispatch without touching the tree
// (`doc/workflow.md` v0.11: a harness must not mutate what it measures).
// `CHECK_WIRING_PKG` points at a different manifest. Both inert unset.
//
// **The directory must be a DIRECT CHILD of the repository root, and three attempts
// were needed to learn why.** Every check derives its own `ROOT` as
// `resolve(dirname(self), '..')`, and several of them touch the tree above their
// dispatch or import a sibling:
//
//   `scripts/` copied to `dev-dist/x/scripts/`  every copy's ROOT is a level too
//                                               deep, and **`check-policies.mjs`
//                                               reads `spec/join-policy.md` at
//                                               module scope ABOVE its dispatch**,
//                                               so it died before reaching the flag
//   one file copied to `dev-dist/`              ROOT right, but **`check-spec.mjs`
//                                               imports `./check-markdown.mjs`** and
//                                               the sibling is not beside it
//   all of them staged flat in `dev-dist/`      ROOT right AND siblings present
//
// **Both wrong versions reported `G1` failures that were facts about the harness**,
// which is `doc/workflow.md` v0.11's own subject twice inside the item written to
// close its neighbour — and the reason the self-test opens with a control.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

/** A literal newline, so the anchor below is not written as an escape in prose. */
const NL = '\n';

/** The one condition that may guard a dispatch. `G2` requires it verbatim. */
const DISPATCH = "if (process.argv.includes('--self-test')) {";
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rel = (p) => relative(ROOT, p).replace(/\\/g, '/');

// **The dispatch goes HERE, before the check runs — and writing it at the bottom
// first is the mistake `G1` exists to catch.** Below the check it is unreachable on
// a failing run, because `process.exit(1)` comes first, and pointless on a passing
// one. **`G1` would have reported this file as not routing**: `check-wiring` is one
// of the entries it tests, so the check is self-covering, which is the property
// `check-source-selftest.mjs` has for `S11` and the reason to keep it.
if (process.argv.includes('--self-test')) {
  const mod = process.env.CHECK_WIRING_SELFTEST ?? join(ROOT, 'scripts', 'check-wiring-selftest.mjs');
  // `resolve`, not `join`: the default is already absolute and `join` would
  // concatenate it onto ROOT.
  const { selfTest } = await import(pathToFileURL(resolve(ROOT, mod)).href);
  process.exit(await selfTest(ROOT));
}

const failures = [];
const fail = (check, msg) => failures.push(`${check}: ${msg}`);
/** Which checks actually executed — the `NOT RUN` state W5's finding asks for. */
const ran = { G1: false, G2: false, G3: false };

const PKG_PATH = process.env.CHECK_WIRING_PKG ?? 'package.json';
const SCRIPTS = process.env.CHECK_WIRING_SCRIPTS
  ? resolve(ROOT, process.env.CHECK_WIRING_SCRIPTS)
  : join(ROOT, 'scripts');
const scriptFor = (file) => join(SCRIPTS, file);

let pkg = null;
try {
  pkg = JSON.parse(readFileSync(resolve(ROOT, PKG_PATH), 'utf8'));
} catch (e) {
  fail('G1', `${PKG_PATH} is unreadable, so there are no entries to check: ${e.message}`);
}

// --- G1: every `:selftest` script ROUTES `--self-test` -------------------------
//
// **`S11` binds four things about `package.json` and none about what the SCRIPT
// does with the flag** — [Q149](../doc/open-questions.md), and
// [P11](../doc/plans/p11-what-should-the-gate-prove.md)'s declaration measured it
// in all six: cut the four-line dispatch with a brace match so the file stays
// valid, and the `:selftest` gate entry runs the plain check, **exits 0**, and the
// self-test does not run. **151 to 373 bytes removes 404 seconds of the gate's
// evidence with everything green.** `S11` is satisfied throughout — the entry is in
// the chain, the script exists, the command is its base plus `--self-test` — and
// `S12` compares entry NAMES, so it is silent too.
//
// **This clause RUNS the script rather than reading it, and that is the whole
// design.** The obvious version is *"the file contains `--self-test`"*, which is
// **the defect W37's adequacy reader found in `D7`**: a presence test passes with a
// stale statement standing beside a live one and fails when a correct one is
// reworded. Here it would be worse — the string is in a **comment** in every one of
// the six, so a substring test is satisfied by documentation alone.
//
// **How it is affordable.** Each check takes `CHECK_<NAME>_SELFTEST`, pointing its
// self-test module somewhere else; `check-source` and `check-markdown` already did,
// and W38 gave the other four the same shape. Pointed at a stub that returns a
// sentinel, the whole test is a process start.
//
// **There is no negative half — *does it dispatch WITHOUT the flag* — and dropping
// it was a measurement.** That question can only be answered by running the check
// with no flag, which runs the check: **8.4 s**, against 0.6 for this. And the
// property is not silent, which is the whole difference from the hole this closes:
// a dispatch that fired unconditionally would make `npm run check:spec` print a
// self-test report instead of a spec report — visible in the gate's own output on
// the first run, and fatal to that check's own probes, which run the plain check
// and read what it prints. [Q149](../doc/open-questions.md)'s hole is the opposite:
// everything looks exactly as it should. *A clause is worth its cost in proportion
// to how quiet its absence is.*
// **`G1` does not run inside a child `G1` spawned, and without this line one probe
// forks without bound.** `check:wiring:selftest` is one of the seven entries, so a
// staged copy of THIS file with its dispatch falsified reaches the check body — and
// the check body spawns that same staged copy again, which reaches the body again.
// The 60 s timeout kills the parent and leaves the tree. A child asked *do you
// route* has already answered NO by arriving here, so it has nothing left to do:
// it reports `NOT RUN`, exits 0, and the parent's `!== SENTINEL` reports it.
const NESTED = process.env.CHECK_WIRING_NESTED === '1';

if (pkg && !NESTED) {
  ran.G1 = true;
  const SENTINEL = 42;
  // **What was actually TESTED is counted, and the count is compared — W38's
  // adequacy reader, BLOCKING, three findings at once.** Without it: `G1` skipping
  // its own entry costs **0**; the whole loop finding nothing costs **0**
  // (`CHECK_WIRING_SCRIPTS` at an empty directory prints `ok` over seven entries and
  // exits 0, because `ran.G1` comes from `if (pkg)` and the `existsSync` guard
  // `continue`s in silence); and the self-test's control passes while staging
  // nothing. **A check that reports `ok` having tested nothing is the shape this
  // whole item is about**, reproduced inside it.
  const owed = Object.keys(pkg.scripts ?? {}).filter((n) => n.endsWith(':selftest'));
  const tested = [];
  // **The pid is in the name.** A stub at a fixed path is one a concurrent run —
  // or a child that is itself one of the scripts under test — can delete underneath
  // this one. Measured while writing it: four of six then failed with
  // `ERR_MODULE_NOT_FOUND` and the clause reported them as not routing, **a harness
  // defect wearing the verdict of a finding**, which is `doc/workflow.md` v0.11's
  // own subject inside the clause written to close its neighbour.
  const stub = join(ROOT, 'dev-dist', `check-wiring-stub-${process.pid}.mjs`);
  mkdirSync(dirname(stub), { recursive: true });
  writeFileSync(stub, `export async function selfTest() { return ${SENTINEL}; }\n`);

  for (const name of Object.keys(pkg.scripts ?? {})) {
    if (!name.endsWith(':selftest')) continue;
    const cmd = (pkg.scripts ?? {})[name] ?? '';
    const m = /scripts\/([\w.-]+\.mjs)/.exec(cmd);
    // `S11` already reports a `:selftest` entry that runs nothing under `scripts/`.
    // Reporting it again would be two ids for one defect, which is the co-firing
    // shape W29 asked to be told apart from masking.
    if (!m || !existsSync(scriptFor(m[1]))) continue;

    // The override's name is derived from the SCRIPT, not from a list here: a
    // second list would be a second source, and the thing it would drift against is
    // the file it names.
    const base = m[1].replace(/^check-/, '').replace(/\.mjs$/, '');
    const env = `CHECK_${base.toUpperCase().replace(/-/g, '_')}_SELFTEST`;
    const script = scriptFor(m[1]);
    const r = spawnSync(process.execPath, [script, '--self-test'], {
      cwd: ROOT, encoding: 'utf8', timeout: 60_000,
      env: { ...process.env, [env]: stub, CHECK_WIRING_NESTED: '1' },
    });
    tested.push(name);
    if (r.status !== SENTINEL) {
      // **The message states what was MEASURED and not what it means.** The first
      // version said *"the gate entry then runs the plain check, exits 0, and the
      // self-test does not run"* for ANY non-sentinel exit — including a mutation
      // that routes correctly and discards the verdict, where every clause of that
      // sentence is false, and including this file's own self-covering case, where
      // the child exited 1 and the message said `exits 0`. **Q138 at the message
      // layer**: a report that names one cause when it can only observe an exit code
      // is a diagnosis the evidence does not carry. W38's conformity reader.
      fail('G1', `${rel(script)} does not ROUTE \`--self-test\`: run with the flag and ${env} ` +
        `pointing at a stub that returns ${SENTINEL}, it exited ${r.status} instead — so the ` +
        `"${name}" gate entry did not reach the module that variable names. The dispatch may be ` +
        'gone, falsified, or routed elsewhere; the exit code cannot say which, and the plain check ' +
        "may run in its place. `S11` cannot see any of it: the entry, the script and the flag " +
        `are all still there. Measured in all six at P11's declaration`);
    }
  }
  rmSync(stub, { force: true });

  const skipped = owed.filter((n) => !tested.includes(n));
  if (skipped.length) {
    fail('G1', `${skipped.length} of ${owed.length} \`:selftest\` entries were never tested — ` +
      `${skipped.join(', ')}. A clause that reports \`ok\` over entries it skipped is the shape ` +
      'this check exists to refuse, and it reproduced here: skipping one entry, or finding no ' +
      'scripts at all, cost zero failures until this line');
  }
}

// --- G2: the dispatch's DEFAULT target, which G1 structurally cannot see -------
//
// **`G1` sets `CHECK_<NAME>_SELFTEST` on every run, and the gate never sets it —
// so the one configuration the gate actually runs is the one configuration `G1`
// never observes.** W38's adequacy reader, BLOCKING, and it is
// [Q149](../doc/open-questions.md)'s hole living inside the check written to close
// it. Measured: adding `if (process.env.CHECK_SPEC_SELFTEST)` around
// `check-spec.mjs`'s `process.exit(await selfTest(ROOT))` leaves `check:wiring`
// green, `check:wiring:selftest` at 6/6 and 2/2, and `check:source` green — while
// `npm run check:spec:selftest` prints the plain spec check, exits 0, and **18
// probes never run**.
//
// **This clause reads and does not run, and that is deliberate rather than a
// relapse.** The item refused a substring test for `G1` because the string
// `--self-test` is in a comment in all six; this binds something else — the SHAPE of
// the dispatch block — and it binds the branch a running test cannot reach, because
// reaching it means not setting the override, which means paying for a real
// self-test. *Two clauses, two sources, and neither can be satisfied by what
// satisfies the other.*
if (pkg) {
  ran.G2 = true;
  const owed2 = Object.keys(pkg.scripts ?? {}).filter((n) => n.endsWith(':selftest'));
  const read = [];
  for (const name of owed2) {
    const m = /scripts\/([\w.-]+\.mjs)/.exec((pkg.scripts ?? {})[name] ?? '');
    if (!m) continue;
    const file = scriptFor(m[1]);
    if (!existsSync(file)) continue;
    read.push(name);
    const base = m[1].replace(/^check-/, '').replace(/\.mjs$/, '');
    const envName = `CHECK_${base.toUpperCase().replace(/-/g, '_')}_SELFTEST`;
    const want = `check-${base}-selftest.mjs`;
    const text = readFileSync(file, 'utf8');

    const at = text.indexOf(NL + DISPATCH) + 1;
    if (at < 1) {
      fail('G2', `${rel(file)} has no \`${DISPATCH}\` at the start of a line — the dispatch is the ` +
        'only thing that turns the flag into a self-test, and its condition must be exactly that test');
      continue;
    }
    // The block, brace-matched, so a nested `if` is visible as nesting. **Whether the
    // scan CLOSED is asserted, and rule 8 is what asked for it**: with `break`
    // removed the scan runs to the last `}` in the file, `block` becomes the whole
    // rest of the file, and every clause below still passes — so the bound that makes
    // this clause about the DISPATCH rather than about the file was doing nothing.
    // Obligation (d), on a loop whose bound is a brace rather than a count.
    let depth = 0;
    let closed = false;
    let end = at + DISPATCH.length - 1;
    for (let k = end; k < text.length; k++) {
      if (text[k] === '{') depth++;
      else if (text[k] === '}' && --depth === 0) { end = k; closed = true; break; }
    }
    // **And the same end is derived a SECOND way, from the layout.** A top-level
    // block closes with a `}` alone at column 0, so the first such line after the
    // dispatch is the end — and the two derivations must agree. Rule 8 is what asked
    // for this: with the `break` removed the brace scan runs to the LAST `}` in the
    // file, `block` becomes the whole rest of the file, and every clause below still
    // passed. `closed` alone does not close it, because a mutation that also sets
    // `closed` puts it straight back; two independent sources do, because the fix for
    // one is not the fix for the other. *The bound that makes this clause about the
    // DISPATCH rather than about the FILE was doing nothing until here.*
    const byLayout = text.indexOf(NL + '}' + NL, at);
    if (!closed || byLayout < 0 || end !== byLayout + 1) {
      fail('G2', `${rel(file)}'s dispatch block does not close where both a brace match and the ` +
        `layout say it does (brace ${closed ? end : 'unmatched'}, layout ${byLayout < 0 ? 'none' : byLayout + 1}). ` +
        'Without agreement the block being read may be the whole rest of the file, and every clause ' +
        'about the dispatch would be answered by something outside it');
      continue;
    }
    const block = text.slice(at, end + 1);

    // **CAPTURE AND COMPARE, not `includes`** — and the first version of this clause
    // was `includes`, which W38's conformity reader broke in one edit: point the
    // default at `check-source-selftest.mjs` and leave
    // `/* was check-spec-selftest.mjs */` behind, and the substring is still in the
    // block. `check:spec:selftest` then runs **another check's** self-test at exit 0
    // with its own 18 probes unrun — Q149's whole consequence, through the clause
    // added to close it. **Third instance in three items**: W37's `D7` shipped the
    // same presence test and its adequacy reader rewrote it the same way, and W36's
    // leftover-neighbour class is the same fact from the other side. *A presence test
    // passes with a stale value standing beside a live one.*
    const decl = /const mod = process\.env\.([A-Z_0-9]+) \?\? join\(ROOT, 'scripts', '([\w.-]+)'\);/.exec(block);
    if (!decl) {
      fail('G2', `${rel(file)}'s dispatch does not declare its self-test module as ` +
        "`const mod = process.env.<NAME> ?? join(ROOT, 'scripts', '<file>');`. The clause compares " +
        'the two names that expression captures; it cannot read a shape it cannot parse');
    } else {
      if (decl[1] !== envName) {
        fail('G2', `${rel(file)}'s dispatch reads \`${decl[1]}\` where the script "${name}" runs ` +
          `derives \`${envName}\`. \`G1\` points its stub at the derived name, so a mismatch means ` +
          '`G1` runs the real self-test and this entry is never cheaply testable');
      }
      if (decl[2] !== want) {
        fail('G2', `${rel(file)}'s dispatch DEFAULTS to \`${decl[2]}\`, not \`${want}\` — and the ` +
          'default is what it loads on every run the gate makes, because the gate sets no override. ' +
          `Measured: pointing it at another check's self-test leaves \`G1\` green while ` +
          `"${name}" runs that other check's probes and its own never run`);
      } else if (!existsSync(join(ROOT, 'scripts', want))) {
        fail('G2', `${rel(file)}'s dispatch defaults to scripts/${want}, which does not exist`);
      }
    }
    // **The exit must be a TOP-LEVEL STATEMENT ON ITS OWN LINE**, and the first
    // version of this clause was not — it flattened nested `{...}` blocks and asked
    // whether the call survived, which passes the measured defect verbatim, because
    // that defect adds no braces:
    //
    //     if (process.env.CHECK_SPEC_SELFTEST) process.exit(await selfTest(ROOT));
    //
    // Flattening handles the braced form; the line anchor handles the inline one.
    // **The clause written from the reader's report failed on the reader's own
    // reproduction** — obligation (e)'s own lesson, that a fix is the least-tested
    // code an item ships.
    const flat = block.replace(/\{[^{}]*\}/g, '{}');
    if (!/^\s*process\.exit\(await selfTest\(ROOT\)\);?\s*$/m.test(flat)) {
      fail('G2', `${rel(file)}'s dispatch does not exit with \`selfTest(ROOT)\` unconditionally — ` +
        'the call is absent or nested inside another condition, so `--self-test` reaches the plain ' +
        'check whenever that condition is false. `G1` cannot see this: it always sets the override');
    }
  }

  // **The same count `G1` carries, for the same reason and found the same way.** A
  // missing staged file makes the loop above `continue` in silence, and W38's own
  // self-test hit it: one probe reported `[G1]` where `[G1,G2]` was declared, because
  // `G2` had read nothing at all and printed `ok`. *A clause that reports `ok` over
  // entries it skipped is the shape this check exists to refuse* — twice now, in two
  // clauses, in one file.
  const missed = owed2.filter((n) => !read.includes(n));
  if (missed.length) {
    fail('G2', `${missed.length} of ${owed2.length} \`:selftest\` entries were never READ — ` +
      `${missed.join(', ')}. Their scripts are missing from ${rel(SCRIPTS)}, and skipping them ` +
      'silently is how this clause would report `ok` having inspected nothing');
  }
}

// --- G3: the manifest's entries are DERIVED FROM DISK, both ways ---------------
//
// **W38's adequacy reader: both entries this item adds are repointable, and both are
// deletable, for zero failures.** `"check:wiring": "node scripts/check-spec.mjs"`
// costs nothing — `S12` compares entry NAMES and the name is unchanged — and removing
// the pair from `GATE_CHAIN` and from `scripts.gate` together costs nothing, because
// both are declarations and one edit owns both. **W36's `D6` finding on entries added
// three items later**: a command's name bound, its argument not.
//
// So the authority here is neither list. **A script under `scripts/` that carries the
// dispatch is a check**, and a check owes the manifest two entries that name it — and
// an entry that names a script owes that script the matching base. Set equality both
// ways, `S12`'s shape with the disk on one side of it.
if (pkg) {
  ran.G3 = true;
  const scripts = pkg.scripts ?? {};
  const chain = (scripts.gate ?? '').split('&&').map((p) => p.trim().replace(/^npm run /, ''));
  // **A check is a `scripts/check-*.mjs` that is not a self-test, and the predicate
  // deliberately does NOT mention the dispatch.** The first version required one, and
  // that made every `G1` probe trip `G3` as well: falsifying a dispatch stopped the
  // file being a check by `G3`'s own definition, so its entries became orphans. Three
  // clauses co-firing on one mutation is three clauses nothing can tell apart. The
  // naming convention is the authority here; requiring the dispatch is `G1`'s job and
  // requiring its shape is `G2`'s.
  const onDisk = readdirSync(SCRIPTS)
    .filter((f) => /^check-[\w.-]+\.mjs$/.test(f) && !f.endsWith('-selftest.mjs'))
    .map((f) => f.replace(/^check-/, '').replace(/\.mjs$/, ''));

  for (const base of onDisk) {
    for (const entry of [`check:${base}`, `check:${base}:selftest`]) {
      const cmd = scripts[entry];
      if (cmd === undefined) {
        fail('G3', `scripts/check-${base}.mjs carries a \`--self-test\` dispatch, so it is a check, ` +
          `and package.json has no "${entry}" entry. Deleting an entry costs nothing while the only ` +
          'authority is a list somebody edits in the same commit; the authority here is the file');
        continue;
      }
      if (!new RegExp(`scripts/check-${base}\.mjs`).test(cmd)) {
        fail('G3', `"${entry}" runs \`${cmd}\`, which does not name scripts/check-${base}.mjs. ` +
          'Measured: pointing an entry at another check`s script leaves `S11` and `S12` green — they ' +
          'bind the entry NAME — and the check the name promises never runs');
      }
      if (!chain.includes(entry)) {
        fail('G3', `"${entry}" exists but is not in \`scripts.gate\`, so nothing in the gate runs it`);
      }
    }
  }

  // The other direction: an entry naming a script that is not a check, or naming
  // one base while being called another.
  for (const [entry, cmd] of Object.entries(scripts)) {
    if (!/^check:[\w.-]+(:selftest)?$/.test(entry)) continue;
    const base = entry.replace(/^check:/, '').replace(/:selftest$/, '');
    if (!onDisk.includes(base)) {
      fail('G3', `"${entry}" is a check entry and scripts/check-${base}.mjs is not a check on disk ` +
        `(missing, or carrying no \`--self-test\` dispatch). It runs \`${cmd}\``);
    }
  }
}

const checks = [
  ['G1', ran.G1, 'G1 every :selftest script routes --self-test to a self-test'],
  ['G2', ran.G2, 'G2 and its DEFAULT self-test is its own, reached with no override set'],
  ['G3', ran.G3, 'G3 and the manifest owes it two entries, derived from disk both ways'],
];
console.log(`wiring check — ${Object.keys(pkg?.scripts ?? {}).filter((n) => n.endsWith(':selftest')).length} :selftest entries\n`);
for (const [id, didRun, label] of checks) {
  const n = failures.filter((f) => f.split(':')[0] === id).length;
  // **`NOT RUN` is a third state and it is not `ok`.** W5's finding, and W29's
  // report projection exists because erasing it was invisible to every probe.
  console.log(`  ${didRun ? (n ? `FAIL  ` : 'ok    ') : 'NOT RUN'}  ${label}${n ? ` (${n})` : ''}`);
}

if (failures.length) {
  console.log('');
  for (const f of failures) console.log(`  ${f}`);
  console.log(`\n${failures.length} failure(s).`);
  process.exit(1);
}
console.log('\nAll checks passed.');
