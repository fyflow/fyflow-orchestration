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

import { existsSync, mkdirSync, readdirSync, readFileSync, rmdirSync, rmSync, writeFileSync } from 'node:fs';

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
const ran = { G1: false, G2: false, G3: false, G4: false, G5: false, G6: false };

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
  //
  // **And in a DIRECTORY rather than flat, which is W103's finding 3 — W105.** The pid made the stub
  // unique and left it a direct child of `dev-dist/`, where it **glob-matches `check-*.mjs`**. A gate
  // killed mid-run left `dev-dist/check-wiring-stub-27708.mjs` behind, `check-wiring-selftest.mjs`
  // stages its copies into that same flat directory and points this check at it with
  // `CHECK_WIRING_SCRIPTS`, so `G3` saw a check the manifest never declares and **the self-test's
  // CONTROL went red** — after which every verdict below it was a fact about the harness, and the real
  // probe failure underneath was invisible until a human removed the file. One directory deep is what
  // takes the stub out of that glob; the stub itself is a mutant of a SELFTEST module and the dispatch
  // hands it `ROOT`, so unlike a mutant of a CHECK it is under no depth constraint.
  const stubDir = join(ROOT, 'dev-dist', `wiring-${process.pid}`);
  const stub = join(stubDir, 'stub.mjs');
  mkdirSync(stubDir, { recursive: true });
  // **Removed on the abort path too, and the old `rmSync` below was not.** It sat after the loop, so a
  // `fail()` that threw — or a 60 s timeout killing this process — left the file for the next run to
  // trip over, which is exactly how finding 3 happened. `process.on('exit')` covers the throw and
  // every `process.exit` road; `SIGKILL` leaks this one directory, which is the stated limit.
  process.on('exit', () => {
    rmSync(stubDir, { recursive: true, force: true });
    // **And PRUNE the intermediate, because `ROOT` is not always the repository root — W105's adequacy
    // reader, who found `dev-dist/dev-dist` on the author's own tree, empty, out of a COMPLETED EXIT 0
    // lane.** `check-wiring-selftest.mjs`'s META pass writes its mutant inside
    // `dev-dist/wiring-selftest-<pid>/`, so that copy's `ROOT = resolve(dirname(self), '..')` is
    // `<root>/dev-dist` — and `mkdirSync(..., { recursive: true })` then creates
    // `dev-dist/dev-dist/wiring-<pid>`, of which the line above removes only the leaf. **The mechanism
    // PRE-DATES W105** (`mkdirSync(dirname(stub))` did the same at HEAD and `rmSync(stub)` removed a
    // file, leaving the directory) — but it is [Q426](../doc/open-questions.md)'s shape, in the clause
    // this item added to close Q426, so it is this item's to fix. `rmdirSync` rather than `rmSync`
    // deliberately: it fails when the directory is not empty, which is the case where something real
    // lives there and must not be deleted — W105's hazard 4, *a self-test that deletes the wrong path is
    // worse than one that leaks*.
    try { rmdirSync(join(ROOT, 'dev-dist')); } catch { /* not empty, or not ours: leave it */ }
  });
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
  rmSync(stubDir, { recursive: true, force: true });

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
/**
 * **The gate's chain, and what "the gate runs it" means since
 * [ADR 0039](../doc/decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md).**
 * The `:selftest` entries (seven then, eight since W72) are not in the `&&` chain any more — one entry runs
 * `scripts/run-selftests.mjs`, which derives them from this manifest and runs them
 * concurrently. `G3`'s membership clause and `S11`'s both mean *reached by the gate*
 * rather than *spelled in this string*, and **`G4` below is what makes the second
 * disjunct true rather than assumed.**
 */
// **ADR 0070 (W103): reachability is a property of the FULL chain, not of `gate`.**
// `gate` is the ladder and `gate:full` is the ladder plus `selftests`, so a check or a
// `:selftest` entry is *reached by the gate* when `gate:full` reaches it. Parsed one
// level deep: `gate:full`'s own parts, with the `gate` part replaced by `gate`'s.
// **If `gate:full` is missing this list is EMPTY**, which is the honest answer rather
// than a fallback to `gate` — `G4` then reports that nothing names the runner, and
// `G3` that no check is reachable, which is exactly what a deleted `gate:full` means.
const partsOf = (name) => (pkg?.scripts?.[name] ?? '')
  .split('&&')
  .map((p) => p.trim().replace(/^npm run /, ''))
  .filter((p) => p !== '');
const CHAIN = partsOf('gate:full').flatMap((n) => (n === 'gate' ? partsOf('gate') : [n]));
const RUNNER_RE = /scripts\/run-selftests\.mjs/;
const CHAIN_RUNS_SELFTESTS = CHAIN.some((n) => RUNNER_RE.test(pkg?.scripts?.[n] ?? ''));
const gateRuns = (n) => CHAIN.includes(n) || (CHAIN_RUNS_SELFTESTS && n.endsWith(':selftest'));

if (pkg) {
  ran.G3 = true;
  const scripts = pkg.scripts ?? {};
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
      if (!gateRuns(entry)) {
        fail('G3', `"${entry}" exists and \`npm run gate\` does not reach it — it is not in the ` +
          'chain, and no chain entry runs scripts/run-selftests.mjs either, so nothing in the gate ' +
          'runs it');
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

// --- G4: the gate RUNS every `:selftest` entry, and the RUNNER is asked ---------
//
// **[ADR 0039](../doc/decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md)
// took the (then seven) `:selftest` entries out of the gate's `&&` chain**, because they
// were 93% of its wall clock, they ran ahead of `lint` and `typecheck`, and they ran
// one at a time on a machine with twenty cores. `scripts/run-selftests.mjs` derives
// them from this manifest and runs them concurrently.
//
// **That is obligation (e) reopened by the fix for obligation (e), one item after
// [Q149](../doc/open-questions.md) was closed.** Before the change an entry leaving
// the gate was refused three times over — `S11` (it is a `check:*` and the chain does
// not name it), `S12` (the declared ordered chain), `G3` (the disk-derived pair). All
// three go quiet the moment the seven are not in the chain. What replaces them:
//
//   the gate REACHES the runner            the chain entry's own COMMAND is run, not
//                                          a command this check composes
//   its plan IS the manifest               `--plan`, run with no override, compared
//                                          both ways — and the COMMAND per entry, not
//                                          only the name
//   its exclusive set is the DISK's        computed a second time here, from the
//                                          marker in the self-test file rather than
//                                          from a list either side carries
//   its ACCOUNTING runs                    pointed at a stub, it must report every
//                                          planned entry completed AND exit 0
//   its VERDICT runs                       pointed at a stub that FAILS, it must
//                                          exit non-zero
//   the override is NOT SET in the gate    because if it is, the gate runs stubs
//
// **The last three clauses cost ~1 s and W38 dropped its analogue for costing 8.4.**
// The argument is that one, applied and coming out the other way: *a clause is worth
// its cost in proportion to how quiet its absence is*. An unconditional dispatch
// prints a self-test report where a check report belongs and is loud; **a runner that
// plans seven entries and runs six, or runs seven and ignores what they returned, is
// `npm run gate` at exit 0 with the self-tests silently gone**, which is the quietest
// failure this repository has measured and is the one P11 exists because of.
//
// **Three of these six clauses come from W39's conformity reader and each is a shape
// this repository has now found in four consecutive items.** The first version of
// this block asked *does some chain entry's command MENTION `run-selftests.mjs`* and
// then spawned `node <runner>` itself: `"selftests": "node scripts/run-selftests.mjs --plan"`
// and `"selftests": "echo scripts/run-selftests.mjs"` both left `check:wiring` and
// `check:source` at **exit 0 with nothing run** — **W36's `D6` verbatim** (*the entry
// name is bound and its argument is not*), in the one entry that reaches the other
// seven, and in the clause whose own COMMAND test applies that lesson to them. The
// second version never observed the command the gate actually executes, because both
// its runs set `CHECK_SELFTESTS_CMD` — **W38's `G2` distinction, missing from the file
// that cites it**. And nothing read the runner's verdict, so `let ok = true;` cost
// **zero**.
if (pkg) {
  ran.G4 = true;
  const scripts = pkg.scripts ?? {};
  const owed = Object.keys(scripts).filter((n) => n.endsWith(':selftest')).sort();
  const RUNNER_FILE = 'run-selftests.mjs';
  const chainEntries = CHAIN.filter((n) => RUNNER_RE.test(scripts[n] ?? ''));

  // **The override is refused in the gate's own environment, not just unset in the
  // children.** `CHECK_SELFTESTS_CMD` replaces every entry's command, which is how the
  // clauses below stay affordable — and with it exported, `npm run selftests` reports
  // `7/7 completed, 7 ok` in 0.3 s and the gate is green with no self-test run at all.
  // W39's conformity reader measured it on the real tree. `G1` and `G2` have the same
  // exposure through `CHECK_<NAME>_SELFTEST` and it is not this clause's to fix.
  if (process.env.CHECK_SELFTESTS_CMD !== undefined) {
    fail('G4', 'CHECK_SELFTESTS_CMD is set in this process`s environment. It replaces the command ' +
      'every `:selftest` entry runs, so `npm run gate` would report every self-test green having ' +
      'run none of them. It exists for this check`s own clauses and for nothing else');
  }

  if (chainEntries.length !== 1) {
    fail('G4', `${chainEntries.length} entries in \`scripts.gate\` name scripts/${RUNNER_FILE} and ` +
      `exactly one must, or the ${owed.length} \`:selftest\` entries are reached by nothing — S11, ` +
      'S12 and G3 all compare entry names in the chain, and the seven are not in it since ADR 0039');
  } else {
    // **The command is the MANIFEST's, re-pointed at SCRIPTS and run.** Composing
    // `node <runner>` here is what let `"selftests": "node scripts/run-selftests.mjs --plan"`
    // and `"echo …"` both pass: this clause would interrogate a runner the gate never
    // invokes. Now the argument list is the gate's own, so an extra flag or a
    // different program is the thing that runs.
    const raw = (scripts[chainEntries[0]] ?? '').trim().split(/\s+/);
    const idx = raw.findIndex((t) => new RegExp(`scripts/${RUNNER_FILE}$`).test(t));
    // **EQUALITY, and a shape test is not enough — W39's adequacy reader, BLOCKING.**
    // The first version required `node` first and the runner somewhere after it, so
    // `node scripts/run-selftests.mjs || exit 0` passed: `||`, `exit` and `0` are inert
    // argv tokens to Node, every clause below interrogated a runner that behaves
    // perfectly, and the SHELL discarded its exit code. `; exit 0` and `|| true` are
    // the same edit. `S12` sees the segment name unchanged and `S13` skips it.
    if (raw.length !== 2 || raw[0] !== 'node' || idx !== 1) {
      fail('G4', `"${chainEntries[0]}" runs \`${raw.join(' ')}\`, and it must be exactly ` +
        `\`node scripts/${RUNNER_FILE}\`. Measured: \`echo scripts/${RUNNER_FILE}\` and ` +
        `\`node scripts/${RUNNER_FILE} --plan\` each satisfied every clause this check had, ` +
        'because they named the file rather than being it; and `|| exit 0` appended to the right ' +
        'command left all six clauses green while the gate threw the runner`s verdict away');
    } else {
      const argv = raw.slice(1);
      argv[idx - 1] = join(SCRIPTS, RUNNER_FILE);
      const base = { ...process.env, CHECK_SELFTESTS_PKG: resolve(ROOT, PKG_PATH),
        CHECK_SELFTESTS_SCRIPTS: relative(ROOT, SCRIPTS).replace(/\\/g, '/') || '.' };
      delete base.CHECK_SELFTESTS_CMD;
      const runIt = (extra, env) => spawnSync(process.execPath, [...argv, ...extra],
        { cwd: ROOT, encoding: 'utf8', env, timeout: 120_000 });

      const p = runIt(['--plan'], base);
      const lines = `${p.stdout ?? ''}`.split('\n')
        .map((l) => /^(alone|concurrent)\s+(\S+)\s+::\s+(.+)$/.exec(l.trim())).filter(Boolean);
      if (p.status !== 0 || lines.length === 0) {
        fail('G4', `\`${argv.join(' ')} --plan\` exited ${p.status} and named ${lines.length} ` +
          'entries. A runner that cannot say what it will run is a runner nothing can check');
      } else {
        const planned = lines.map((m) => m[2]).sort();
        for (const e of owed.filter((x) => !planned.includes(x))) {
          fail('G4', `package.json declares "${e}" and the runner does not plan it, so \`npm run gate\` ` +
            'does not run it. This is the hole W38 closed one level in: the entry exists, the script ' +
            'exists, the flag is there, and nothing runs it');
        }
        for (const e of planned.filter((x) => !owed.includes(x))) {
          fail('G4', `the runner plans "${e}" and package.json has no such \`:selftest\` entry`);
        }
        // **The COMMAND, not only the name — W36's `D6` finding, which is why this
        // clause exists at all.** A plan naming the right entries and running something
        // else is `test:l6:deno` pointed at a file that exports functions and runs
        // nothing: four checks green, zero failures, the rung silently unrun. `--plan`
        // prints what the runner WOULD run, override included, so this reads the
        // default because the run above unsets it.
        for (const m of lines) {
          if (owed.includes(m[2]) && m[3] !== `npm run ${m[2]}`) {
            fail('G4', `the runner plans "${m[2]}" as \`${m[3]}\` rather than \`npm run ${m[2]}\` — ` +
              'the entry name is bound and its argument was not, which is the shape W35 and W36 both ' +
              'found one item apart');
          }
        }
        // The exclusive set, computed here from the same authority the runner uses and
        // compared both ways. A second computation rather than a second source: what it
        // catches is the runner ceasing to read the marker, not the marker being wrong
        // ([Q181](../doc/open-questions.md)).
        const MARK = `SELFTEST-${'EXCLUSIVE'}:`;
        const wantAlone = owed.filter((e) => {
          const m = /scripts\/([\w.-]+)\.mjs/.exec(scripts[e] ?? '');
          const f = m ? join(SCRIPTS, `${m[1]}-selftest.mjs`) : null;
          return f !== null && existsSync(f) && readFileSync(f, 'utf8').includes(MARK);
        }).sort();
        const gotAlone = lines.filter((m) => m[1] === 'alone').map((m) => m[2]).sort();
        if (wantAlone.join(',') !== gotAlone.join(',')) {
          fail('G4', `the runner runs [${gotAlone.join(', ') || 'nothing'}] alone and the \`${MARK}\` ` +
            `marker is carried by [${wantAlone.join(', ') || 'nothing'}]. An entry that mutates state ` +
            'outside dev-dist/ and runs concurrently is a flake with no obvious cause — Q148, measured ' +
            'in four entries rather than the one its row named');
        }
        // **The accounting and the VERDICT, run for real against stubs.** Everything
        // above reads a PLAN. These two are the only clauses that watch the runner
        // finish, and they are two rather than one because the first only ever runs
        // children that succeed: with a passing stub, `let ok = true;` costs **zero**.
        // W39's conformity reader, and it is rule 8's own *a survivor needs a second
        // independent route* applied to a clause rather than to a probe.
        const stub = (code) => ({ ...base, CHECK_SELFTESTS_CMD: `"${process.execPath}" -e "process.exit(${code})"` });
        const green = runIt([], stub(0));
        const done = /(\d+)\/(\d+) completed/.exec(`${green.stdout ?? ''}`);
        if (green.status !== 0 || !done || done[1] !== done[2] || Number(done[2]) !== planned.length) {
          fail('G4', `\`${argv.join(' ')}\`, with every entry pointed at a stub that succeeds, exited ` +
            `${green.status} and reported \`${done ? done[0] : 'no completion line'}\` against ` +
            `${planned.length} planned. A runner that plans an entry and does not run it is the gate ` +
            'at exit 0 with a self-test that did not run');
        }
        const red = runIt([], stub(1));
        if (red.status === 0) {
          fail('G4', `\`${argv.join(' ')}\`, with every entry pointed at a stub that FAILS, exited 0. ` +
            'The runner is the only thing between a failing self-test and a green gate, and reading ' +
            'what its children returned is one expression — measured deletable for zero failures');
        }
      }
    }
  }
}

// --- G5: the runner's DEFAULT behaviour, which G4's own runs cannot observe -----
//
// **`G4` has three runs and every one of them sets an override.** `CHECK_SELFTESTS_PKG`
// and `CHECK_SELFTESTS_SCRIPTS` on all three, `CHECK_SELFTESTS_CMD` on the two that
// watch the runner finish. So **the configuration `npm run gate` executes is the one
// configuration `G4` never takes** — which is `G2`'s sentence, one file across, in the
// file that quotes it. W39's adequacy reader measured four ways in, all four green
// under `check:wiring`, `check:source` AND `check:wiring:selftest`:
//
//   `spawn(CMD ?? \`echo skipping ${command}\`)`   7/7 completed, 7 ok, **0.1 s**
//   `PLAN.filter((x) => x.exclusive && false)`    both hazardous entries concurrent
//   `PLAN = process.env.CHECK_SELFTESTS_PKG ? plan(pkg) : []`   **0/0 completed**, exit 0
//   `SCRIPTS` defaulting to `dev-dist`            **0 exclusive**, no marker ever read
//
// **The affordable answer is `G2`'s answer: read the DEFAULT rather than run it.**
// Each declaration below is captured and compared to the one form it may take, so a
// guard on an override, a replaced default and a falsified filter are all a
// declaration that no longer matches. It is a text clause and it says so; what makes
// it not a presence test is that it captures the whole declaration and compares it,
// which is the fix `D7` took at W37 and `G2` took at W38, both after a reader broke
// the `includes()` version in one edit.
//
// **The cost of the alternative, stated rather than implied**: the only run that
// observes the default end to end is `npm run selftests` itself, and that is 290 s.
// Gated on the manifest like `G1`-`G4`: with no readable `package.json` there are no
// `:selftest` entries and so no runner the gate is obliged to have. It also keeps the
// unreadable-manifest probe's expectation whole — that probe declares that EVERY row
// reads `NOT RUN`, and a clause that ran anyway is a disagreement.
if (pkg && existsSync(join(SCRIPTS, 'run-selftests.mjs'))) {
  ran.G5 = true;
  const src = readFileSync(join(SCRIPTS, 'run-selftests.mjs'), 'utf8');
  /** Each: what it is FOR, and the one line it must be. */
  const REQUIRED = [
    ['the manifest it reads',
      "const PKG_PATH = process.env.CHECK_SELFTESTS_PKG ?? join(ROOT, 'package.json');"],
    ['the scripts directory it reads the markers from',
      "const SCRIPTS = resolve(ROOT, process.env.CHECK_SELFTESTS_SCRIPTS ?? join(ROOT, 'scripts'));"],
    ['the command an entry gets when nothing overrides it',
      "const CMD = process.env.CHECK_SELFTESTS_CMD ?? '';"],
    ['the plan, computed unconditionally',
      'const PLAN = plan(pkg);'],
    ['the command the plan carries, which is the command the run spawns',
      'return { entry, exclusive, command: CMD || commandFor(entry) };'],
    ['the spawn, which reads the plan and nothing else',
      'const child = spawn(command, { cwd: ROOT, shell: true });'],
    ['the exclusive entries, run alone and first',
      'for (const p of PLAN.filter((x) => x.exclusive)) results.push(await run(p));'],
    ['the rest, run concurrently',
      'const rest = PLAN.filter((x) => !x.exclusive);'],
    ['the verdict over what the children returned',
      'let ok = results.every((r) => r.code === 0);'],
  ];
  for (const [what, line] of REQUIRED) {
    // Anchored at a line start, because a literal that quotes the code it searches for
    // is a false match for itself — [Q178](../doc/open-questions.md), found twice in
    // one hour in this file at W38.
    const anchored = new RegExp(`^\\s*${line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm');
    if (!anchored.test(src)) {
      fail('G5', `scripts/run-selftests.mjs does not declare ${what} as \`${line}\`. This is the ` +
        'DEFAULT the gate runs, and every one of `G4`\'s runs sets an override, so no clause there ' +
        'takes this branch: a guard on an override, or a replaced default, is green in all four ' +
        'checks while `npm run gate` runs no self-test at all. If the declaration is right to ' +
        'change, change it here in the same commit');
    }
  }
}

// G6 — **a scratch path under `dev-dist/` carries the PROCESS, and the exceptions are declared.**
//
// **Why a clause and not a convention — [Q181](../doc/open-questions.md), W105.** Before this item
// `dev-dist/` was one flat namespace with fixed paths: `check-docs.mjs` wrote `dev-dist/docs` and
// `rmSync`d it on every run, five self-tests wrote fixed fixture directories, and two files had once
// written their mutants to **the same path**. Nothing said any of it. The measurement, taken at W105
// with `check:wiring:selftest` running concurrently against a `check:docs` loop: on the fixed path
// **19 of 96** victim runs were green, every red one `ENOENT … dev-dist/docs/tsconfig.dom.json`; with
// the path per-process, **61 of 61**. *A latent path collision is invisible until the day it is not.*
//
// **And it is what makes retiring an exclusivity marker safe** ([ADR 0072](../doc/decisions/0072-a-scratch-path-carries-its-process-and-a-self-test-that-shares-the-tree-says-so.md)).
// That marker was the insurance against exactly this, and Q181's complaint is that the marker is bound
// to nothing. Q181's own row proposes a grep — *a path under `dev-dist/` that is not derived from
// `process.pid`* — and this is that grep, with its exceptions named instead of left to a heuristic.
//
// **TOTAL rather than narrow, and W105's adequacy reader is the reason.** The first version required a
// line to match `/join\([^)]*'dev-dist'/`, and that reader added the exact fixed path this clause exists
// to refuse in FIVE ordinary spellings, every one `check:wiring` EXIT 0 with zero `G6` failures:
// `join(resolve(ROOT), 'dev-dist', …)` (because `[^)]*` cannot cross the `)` of a nested call),
// `resolve(ROOT, "dev-dist", …)`, `ROOT + "/dev-dist/…"`, `join(ROOT, "dev" + "-dist", …)`, and the same
// `join` with the literal merely DOUBLE-QUOTED — which nothing would have caught, since
// `npm run lint` is `deno lint src/ test/ examples/ index.ts` and **nothing lints `scripts/` at all**.
// It also narrowed the pid predicate from `process.pid` to `process` and to `pid` for zero, because all
// five probes key on the same shape.
//
// So the subject is now **every occurrence of the TEXT `dev-dist`**, in every `scripts/*.mjs` rather than
// in `check-*.mjs` alone, and what must carry `process.pid` is the enclosing STATEMENT rather than the
// line — which is the other half that reader measured: a second statement on the same line, a trailing
// comment mentioning `process.pid`, and a new fixed path appended beside a declared exception all rode in
// at EXIT 0, because `t.includes(…)` is a test on a whole trimmed line.
//
// **Its one named limit**: `dev-dist` SPLIT across a concatenation (`'dev-' + 'dist'`) is invisible, and
// deliberately so — this file and `check-wiring-selftest.mjs` both split it on purpose, because a literal
// that quotes the pattern it searches for is a false match for itself ([Q178](../doc/open-questions.md),
// which this clause reproduced twice before it worked). A check cannot both use the trick and refuse it.
if (existsSync(SCRIPTS)) {
  ran.G6 = true;
  /**
   * **The sites that may name a SHARED path, each with the reason it cannot carry a pid.** Compared BOTH
   * WAYS: a site that is not declared fails, and a declaration whose line is gone fails too, because a
   * permission with no subject is one the next author inherits.
   *
   * `D` is spelled in halves for the reason in the header.
   */
  const D = 'dev-';
  const SHARED_SCRATCH = [
    // `stage()`'s copies, and the constraint is measured: a staged script derives
    // `ROOT = resolve(dirname(self), '..')` and `check-spec.mjs` imports `./check-markdown.mjs`, so one
    // directory below the repository root with its siblings beside it is the only arrangement that works
    // — the three attempts at the top of this file. [Q182](../doc/open-questions.md) says relocating them
    // would not have helped anyway, *because the copies it runs are the real checks and they write the
    // real paths*, which is the half W105 fixed instead.
    ['check-wiring-selftest.mjs', `const to = join(root, '${D}dist', f);`, 'stage() writes the copies FLAT'],
    ['check-wiring-selftest.mjs', `const stray = (staged) => readdirSync(join(root, '${D}dist'))`,
      'and reads that directory back to NAME a file a killed run left in it — W103 finding 3'],
    ['check-wiring-selftest.mjs', `"process.env.CHECK_SELFTESTS_SCRIPTS ?? join(ROOT, '${D}dist')"),`,
      'a probe literal: the text of a mutation, not a path this file opens'],
    ['check-wiring-selftest.mjs', `CHECK_WIRING_SCRIPTS: '${D}dist'`,
      'an environment VALUE naming the staging directory, not a path construction — two sites'],
    // The directory-SKIP lists. `dev-dist` here is a name to step OVER, not a path to write.
    ['check-markdown.mjs', `name === '${D}dist'`, 'a directory NAME the walk skips'],
    // **The same shape in a second file — [W112](../doc/work-items/w112-the-budget-the-check-and-the-floors.md)'s
    // content digest.** `check-budget-selftest.mjs` walks the tree to hash it and steps OVER this
    // directory by name; it cannot carry a pid, because the thing being skipped is every
    // process's scratch space and not this one's. Everything that file WRITES there does carry
    // one, which is what the exception is narrow about: the clause below pins the skip
    // expression, so a path CONSTRUCTION in the same file is still refused.
    ['check-budget-selftest.mjs', `name === '${D}dist'`, 'a directory NAME the digest walk skips'],
    // **A READ of the directory rather than a path written into it**, which is `stray()`'s own
    // exception one file over: this lists `dev-dist` to NAME the harness's own residue by pid, so a
    // pid in the statement would defeat the thing it is for. Everything that file WRITES there
    // carries one. *It was introduced by the clause that watches for leaks and caught by `G6` on the
    // next run* — [Q178](../doc/open-questions.md)'s shape, which `check-wiring.mjs` has recorded
    // twice about itself.
    ['check-budget-selftest.mjs', `const flat = readdirSync(join(root, '${D}dist'))`,
      'a READ of the shared directory, to name this run`s own residue — the pid is in what it looks for'],
    // **This clause's own PRUNE, and `G6` caught it on the run after it was written** — which is the
    // mechanism working rather than an inconvenience. The intermediate directory it removes is the
    // SHARED one by definition, so it cannot carry a pid; `rmdirSync` refuses a non-empty directory,
    // which is what keeps it from being a deletion of somebody else's facts.
    ['check-wiring.mjs', `rmdirSync(join(ROOT, '${D}dist'));`,
      'the prune of the intermediate directory a nested ROOT creates — shared by definition, and `rmdirSync` refuses it when non-empty'],
    // **A markdown code span inside a failure message**, which the preceded-by-a-quote rule cannot tell
    // from a path literal, because a code span opens with a backtick exactly as a template literal does.
    // Declared rather than special-cased: a rule that tried to tell them apart would be a rule about
    // English.
    ['check-wiring.mjs', `two self-tests wrote \`${D}dist/.self-NN.mjs\``,
      'a markdown code span in this clause`s own failure text, not a path it opens'],
    ['check-markdown-selftest.mjs', `name === '${D}dist'`, 'two probe literals that mutate that walk'],
    // **The browser bundle's ARTIFACTS, which must be FIXED** — W105's adequacy reader, finding 9, which
    // measured that this clause's universe was `check-*.mjs` and that these four were outside it.
    // `run-browser-tests.mjs` reads `dev-dist/browser/tests.js` back by name in a SEPARATE process, so a
    // per-process path would mean the runner cannot find what the builder wrote. They are OUTPUTS rather
    // than scratch, and that distinction is the reason rather than an excuse for them.
    ['build-browser-tests.mjs', `mkdirSync(join(ROOT, '${D}dist'), { recursive: true })`,
      'the bundle output root, read back by run-browser-tests.mjs in another process'],
    ['build-browser-tests.mjs', `const corpusModule = join(ROOT, '${D}dist', 'corpus.generated.js');`,
      'a generated input to the bundle, named in the generated entry'],
    ['build-browser-tests.mjs', `const generated = join(ROOT, '${D}dist', 'browser-entry.generated.ts');`,
      'the generated entry esbuild is pointed at'],
    ['build-browser-tests.mjs', `outfile: join(ROOT, '${D}dist', 'browser', 'tests.js'),`,
      'the bundle itself'],
    ['run-browser-tests.mjs', `const BUNDLE = join(ROOT, '${D}dist', 'browser', 'tests.js');`,
      'the other end of the pair above: the runner reads what the builder wrote'],
  ];
  const used = new Set();
  const NEEDLE = `${D}dist`;
  /**
   * **The enclosing STATEMENT, which is the window the pid must appear in.** Scanning back to the
   * previous `;`, `{`, `}` or line start and forward to the next `;` or line end is what makes a second
   * statement on the same line, and a trailing comment, into different windows — both of which rode in at
   * EXIT 0 when this read the whole trimmed line.
   */
  const statementAt = (src, at) => {
    let a = at; while (a > 0 && !';{}\n'.includes(src[a - 1])) a -= 1;
    let b = at; while (b < src.length && !';\n'.includes(src[b])) b += 1;
    // **Include the terminating `;`.** Without it an anchor written the way the line reads — with its
    // semicolon — matches nothing, and the both-ways clause then reports every entry as a permission
    // with no subject. Four of twelve did on this clause's first run with the window in place.
    return src.slice(a, src[b] === ';' ? b + 1 : b);
  };
  /**
   * **The sites, read LINE BY LINE with the block-comment state tracked — and a GLOB is why.** The first
   * version asked, for each occurrence, whether the nearest block-comment OPENER before it came after the
   * nearest CLOSER. A glob literal — a star, a star, a slash, a star — carries the opener and never the
   * closer, so every occurrence after one in the same file read as COMMENTED.
   * `build-browser-tests.mjs` has one, so all four of its real sites went invisible and their four
   * declared exceptions reported as permissions with no subject — the both-ways clause catching the
   * DETECTOR rather than the tree. *A detector written over a whole file is defeated by any construct
   * that looks like its opener.* (And the first draft of this very comment closed itself by quoting the
   * closer, which is the same defect one layer out.)
   *
   * A comment here is a line whose trimmed form starts with a line comment, a star, or a block opener,
   * or any line between a block opener and the line that closes it — this codebase's only such shape.
   */
  const sitesIn = (src) => {
    const out = [];
    let inBlock = false;
    for (const raw of src.split(NL)) {
      const trimmed = raw.trim();
      if (inBlock) { if (trimmed.includes('*/')) inBlock = false; continue; }
      if (trimmed.startsWith('/*')) { if (!trimmed.includes('*/')) inBlock = true; continue; }
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
      for (let i = raw.indexOf(NEEDLE); i !== -1; i = raw.indexOf(NEEDLE, i + 1)) {
        // **A PATH occurrence BEGINS at a quote or at a slash; prose does not.** `join(ROOT, 'dev-dist'`,
        // `"dev-dist"`, a backtick segment and `ROOT + "/dev-dist/x"` all qualify — four of the five
        // spellings W105's adequacy reader got past the first version — while *outside dev-dist/ and runs
        // concurrently* does not, because a sentence puts a SPACE before the word. The fifth spelling,
        // `'dev-' + 'dist'`, is the named limit in the header: this file uses that trick on purpose and
        // cannot both use it and refuse it.
        if (!"'\"`/".includes(raw[i - 1] ?? ' ')) continue;
        // **The enclosing STATEMENT, not the line.** A second statement on the same line, and a trailing
        // comment that mentions `process.pid`, both rode in at EXIT 0 when this read the whole trimmed
        // line — that reader's finding 2. The terminating `;` is included, or an anchor written the way
        // the line reads misses it.
        let a = i; while (a > 0 && !';{}'.includes(raw[a - 1])) a -= 1;
        let b = i; while (b < raw.length && raw[b] !== ';') b += 1;
        out.push(raw.slice(a, raw[b] === ';' ? b + 1 : b).trim());
      }
    }
    return out;
  };

  const sites = [];
  // **Every `.mjs`, EXCEPT dot-prefixed ones — W105's adequacy reader, finding 9, and its consequence.**
  // Widening the universe from `check-*.mjs` to every `.mjs` is what brings `build-browser-tests.mjs`'s
  // four fixed paths and `run-selftests.mjs` inside the clause. It also brings the HARNESS's own mutant
  // copies in, because `check-wiring-selftest.mjs` points this check at a staging directory that holds
  // them: a copy of this file under another NAME has all of its sites and none of its declared
  // exceptions, which match on the filename — so the META control came back `wanted [G1,G2], got
  // [G1,G2,G6]`, a verdict about the harness. A leading dot is this repository's own convention for a
  // mutant (`.meta-*`, `.self-*`, `.probe-*`) and no file in `scripts/` carries one, so excluding them
  // costs nothing in the configuration that ships and takes the harness's artefacts out of the scan.
  for (const f of readdirSync(SCRIPTS).filter((n) => n.endsWith('.mjs') && !n.startsWith('.')).sort()) {
    for (const stmt of sitesIn(readFileSync(join(SCRIPTS, f), 'utf8'))) sites.push([f, stmt]);
  }
  for (const [f, stmt] of sites) {
    const declared = SHARED_SCRATCH.find(([file, line]) => file === f && stmt.includes(line));
    if (declared) {
      used.add(declared);
      // **A declared site that has STOPPED needing the exception fails too**, which is the direction a
      // list of permissions never has: if the statement now carries the pid the entry is spent, and the
      // next fixed path added beside it would be covered by an exception written for something else.
      if (/\bprocess\.pid\b/.test(stmt)) {
        fail('G6', `scripts/${f} declares \`${declared[1]}\` as a SHARED scratch path and that statement ` +
          'now carries `process.pid`. The exception is spent — delete the entry in `SHARED_SCRATCH` ' +
          'rather than leaving a permission nothing needs');
      }
      continue;
    }
    if (!/\bprocess\.pid\b/.test(stmt)) {
      fail('G6', `scripts/${f} names dev-${'dist'} in a statement that does not carry \`process.pid\`: ` +
        `\`${stmt.slice(0, 110)}\`. That directory is ONE namespace shared by every check, every ` +
        'self-test and every child they spawn, and a fixed path there is a collision nothing reports: ' +
        'W105 measured a `check:docs` loop at 19 of 96 green beside `check:wiring:selftest` on a fixed ' +
        '`dev-dist/docs`, against 61 of 61 per-process. Derive it from `process.pid` and remove it in a ' +
        "`process.on('exit')` handler, or declare it in `SHARED_SCRATCH` above with the reason it cannot");
    }
  }
  for (const entry of SHARED_SCRATCH) {
    if (used.has(entry)) continue;
    fail('G6', `\`SHARED_SCRATCH\` declares \`${entry[1]}\` in scripts/${entry[0]} and no such statement ` +
      'is there. The list is compared BOTH WAYS on purpose — an exception for a line that moved is a ' +
      'permission with no subject, and the next author to touch that file inherits it');
  }
  /**
   * **And no two files may build the same scratch NAME**, which is this row's original defect:
   * `check-source-selftest.mjs` and `check-policies-selftest.mjs` both wrote `dev-dist/.self-NN.mjs`,
   * found by READING, and ADR 0039's three concurrent passes never happened to collide on it. A pid makes
   * two PROCESSES safe and does nothing about two files in one process's tree.
   *
   * **The pid is NORMALISED rather than used as a prefix terminator** — W105's adequacy reader, which
   * put the pid FIRST (`` `${process.pid}-shared` ``) in two files at once and got EXIT 0, because the
   * prefix was then empty and the clause skipped it.
   */
  const byName = new Map();
  for (const [f, stmt] of sites) {
    for (const m of stmt.matchAll(/`([^`]*\$\{process\.pid\}[^`]*)`/g)) {
      const key = m[1].replace(/\$\{process\.pid\}/g, '<pid>');
      if (!byName.has(key)) byName.set(key, new Set());
      byName.get(key).add(f);
    }
  }
  for (const [name, files] of byName) {
    if (files.size > 1) {
      fail('G6', `[${[...files].sort().join(', ')}] all build \`${name}\` under dev-${'dist'}/. One ` +
        'process writing two files to one name is what the pid cannot see, and it is this clause`s own ' +
        'founding defect: two self-tests wrote `dev-dist/.self-NN.mjs` and only a reader noticed');
    }
  }
}
const checks = [
  ['G1', ran.G1, 'G1 every :selftest script routes --self-test to a self-test'],
  ['G2', ran.G2, 'G2 and its DEFAULT self-test is its own, reached with no override set'],
  ['G3', ran.G3, 'G3 and the manifest owes it two entries, derived from disk both ways'],
  ['G4', ran.G4, 'G4 and the gate RUNS every one of them, which the runner is asked'],
  ['G5', ran.G5, 'G5 and the runner`s DEFAULT behaviour is its own, which G4 cannot observe'],
  ['G6', ran.G6, 'G6 and a scratch path under dev-dist/ carries its PROCESS, exceptions declared'],
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
