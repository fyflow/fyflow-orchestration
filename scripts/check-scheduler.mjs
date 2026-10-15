#!/usr/bin/env node
// Ladder L0 — **the pinned scheduler is installed from a registry, is the version
// this repository pins, and BOTH runtimes reach that same version.**
//
// **Rewritten 2026-08-31, and the hazard it guards changed shape.** Until then
// `fyflow-scheduler` 0.3.0 was on **no registry** — npm and JSR both stopped at
// 0.2.1, measured by W5 — so the pin was a `file:../fyflow-scheduler` link into a
// working tree, Node loaded that tree's gitignored `dist/` and Deno loaded its
// TypeScript source, and this file existed to stop the two diverging by a stale
// build. **Both registries now carry the pin**, so:
//
//   Node   node_modules/fyflow-scheduler   npm  fyflow-scheduler@<PIN>  -> dist/
//   Deno   examples/deno-import-map.json   JSR  @fyflow/scheduler@<PIN> -> source
//
// **What that removes.** A published tarball cannot go stale against a source it
// no longer ships, so the old D3/D4 mtime comparison has nothing to compare and
// is gone. `npm install` no longer runs a build in another repository, which was
// [ADR 0013](../doc/decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)'s
// stated cost — the one write this repository made outside itself. And nothing on
// this machine can reach the sibling checkout through `node_modules`, which is
// the concrete accident that prompted the change: a junction placed there was
// followed by a recursive delete and took most of the sibling repository with it.
//
// **What it replaces it with, because the hazard did not disappear — it moved.**
// Two runtimes now reach two different registries, and they can pin different
// versions with both green. `D3` is that comparison, and it is this file's whole
// remaining reason to exist.
//
// **And since W57 (ADR 0048) the PUBLISHED manifests declare the scheduler**, so `D8`
// holds `package.json`'s `peerDependencies` entry and `deno.json`'s `jsr:` import to the
// same pin — a third and a fourth copy of it, each with a reader the gate never runs: a
// consumer's installer.
//
//   node scripts/check-scheduler.mjs
//
// Exits 0 when every check passes, 1 otherwise. It reports; it does not fix.
//
// `CHECK_SCHEDULER_DTS` points `D5`'s declaration parse at a copy, which is how
// `--self-test` reaches that clause without touching the installed package. It
// exists for the self-test and for nothing else, on the pattern of
// `CHECK_SOURCE_PKG`. **Three of `D5`'s four clauses were unreachable without it**
// — unreadable, empty-parse and missing-exports — and the middle one is
// [Q141](../doc/questions/q141.md), which survived twelve green probes because no
// probe could supply a `.d.ts` the parse cannot read.

import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The pin, in one place. [Q3](../doc/questions/q3.md) — and there is **no
 * changelog** upstream, so a bump here means re-reading its `AGENTS.md` section 6
 * rather than reading a diff. That reference ships inside the npm package, so it
 * is at `node_modules/fyflow-scheduler/AGENTS.md` rather than next door.
 */
const PIN = '0.6.0';

/** The JSR package Deno resolves the same specifier to. */
const JSR_NAME = '@fyflow/scheduler';

const failures = [];
const fail = (check, msg) => failures.push(`${check}: ${msg}`);
/** Which checks actually executed. See the reporting block at the bottom. */
const ran = { D1: false, D2: false, D3: false, D4: false, D5: false, D6: false, D7: false, D8: false, D9: false };
/** The version the Deno half pins, for the report. `null` until `D3` parses one. */
let jsrPin = null;
const rel = (p) => relative(ROOT, p).replace(/\\/g, '/');

// --- D1: installed, readable, and NOT a link into a working tree --------------
//
// The link half is new and it is a regression guard with an incident behind it.
// `realpathSync` was what the old version used, deliberately, to check "what Node
// will actually load"; here the point is the opposite — a `node_modules` entry
// that is a junction or symlink means someone has reinstated the working-tree
// pin, and every recursive tool that touches this directory then reaches into
// another repository.
const pkgDir = join(ROOT, 'node_modules', 'fyflow-scheduler');
let manifest = null;
if (!existsSync(pkgDir)) {
  fail('D1', 'node_modules/fyflow-scheduler is missing. The pin is a registry devDependency ' +
    `(\`fyflow-scheduler\`@${PIN} on npm); run \`npm install\``);
} else if (lstatSync(pkgDir).isSymbolicLink()) {
  fail('D1', 'node_modules/fyflow-scheduler is a LINK, not an installed package. The pin is a ' +
    'registry version; a link points at a working tree, which is what this repository moved ' +
    'away from — and a recursive delete that follows one deletes the other repository');
} else {
  ran.D1 = true;
  try {
    manifest = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
  } catch (e) {
    fail('D1', `${rel(pkgDir)}/package.json is unreadable: ${e.message}`);
  }
}

// --- D2: it is the pin, and package.json asks for exactly the pin --------------
if (manifest) {
  ran.D2 = true;
  if (manifest.version !== PIN) {
    fail('D2', `the installed scheduler is ${manifest.version} and this repository pins ${PIN} ` +
      '(Q3). A version bump means re-reading its AGENTS.md section 6, because there is no changelog');
  }
  let own = null;
  try {
    own = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  } catch (e) {
    fail('D2', `package.json is unreadable: ${e.message}`);
  }
  const spec = own?.devDependencies?.['fyflow-scheduler'];
  if (spec === undefined) {
    fail('D2', 'package.json does not declare fyflow-scheduler as a devDependency — the pin the GATE ' +
      'installs. Since ADR 0048 it is ALSO a peer at the same pin, which D8 holds; a devDependency ' +
      'alone is what a consumer never sees, and a peer alone is what the gate never installs');
  } else if (spec !== PIN) {
    fail('D2', `package.json asks for "${spec}" and this check pins ${PIN}. A range would let ` +
      'the two runtimes drift on an ordinary install, which is exactly what D3 exists to stop; ' +
      'a `file:` specifier would reinstate the working-tree link');
  }
}

// --- D3: BOTH runtimes reach the same version ---------------------------------
//
// **The replacement hazard, and the only reason this file still exists.** Node
// resolves the bare specifier through npm and Deno resolves it through JSR, so
// the version is written down twice — and ladder L6 runs in both. Before, the two
// roads could differ by a stale build; now they can differ by a version, with
// every check green and L6 reporting 0.3.0 under one runtime and something else
// under the other. Same failure, new address.
{
  const mapPath = join(ROOT, 'examples', 'deno-import-map.json');
  let map = null;
  try {
    map = JSON.parse(readFileSync(mapPath, 'utf8'));
  } catch (e) {
    fail('D3', `${rel(mapPath)} is unreadable, so the Deno half of the pin has no source: ${e.message}`);
  }
  if (map) {
    ran.D3 = true;
    const spec = map.imports?.['fyflow-scheduler'];
    if (!spec) {
      fail('D3', `${rel(mapPath)} does not map the bare \`fyflow-scheduler\` specifier, so Deno ` +
        'cannot resolve it and ladder L6 cannot run there');
    } else if (spec.startsWith('.') || spec.startsWith('/') || spec.includes('..')) {
      fail('D3', `${rel(mapPath)} resolves the scheduler to a PATH ("${spec}"). The pin is a ` +
        'registry version; a path reinstates the working-tree dependency this repository removed');
    } else {
      const m = /^jsr:(@[\w.-]+\/[\w.-]+)@([\d.]+)$/.exec(spec);
      if (!m) {
        fail('D3', `${rel(mapPath)} maps the scheduler to "${spec}", which is not a pinned JSR ` +
          `specifier of the form jsr:${JSR_NAME}@<version>`);
      } else {
        if (m[1] !== JSR_NAME) {
          fail('D3', `${rel(mapPath)} points Deno at "${m[1]}" and this check expects ${JSR_NAME}`);
        }
        jsrPin = m[2];
        if (m[2] !== PIN) {
          fail('D3', `Deno would load ${m[1]}@${m[2]} and Node would load fyflow-scheduler@${PIN}. ` +
            'Ladder L6 runs in both, so this reports two runtimes green against two different ' +
            'schedulers — which is the divergence this check exists for');
        }
      }
    }
  }
}

// --- D4: every artifact Node's `exports` can select is present -----------------
//
// A published tarball can be partial the way a build can. Cheap, and it is what
// turns "cannot resolve" at L6 into a named L0 failure.
if (manifest) {
  ran.D4 = true;
  for (const a of ['dist/node/index.js', 'dist/browser/index.js', 'dist/types/index.d.ts']) {
    if (!existsSync(join(pkgDir, a))) {
      fail('D4', `${a} is missing from the installed package. Node's \`exports\` selects it, so ` +
        'ladder L6 cannot run. Reinstall, or the published tarball is incomplete');
    }
  }
}

// --- D5: it LOADS, and exposes what its own declarations say it exports --------
//
// The expected list is **derived from the package's own `dist/types/index.d.ts`**
// rather than hard-coded, so it needs no maintenance when the API moves: a value
// export it adds is one this check starts requiring. That file replaces the
// sibling's `index.ts`, which the npm tarball does not ship — the source of truth
// moved with the dependency, and this is the one check the move rewrote rather
// than deleted.
if (manifest) {
  ran.D5 = true;
  const dts = process.env.CHECK_SCHEDULER_DTS
    ? join(ROOT, process.env.CHECK_SCHEDULER_DTS)
    : join(pkgDir, 'dist', 'types', 'index.d.ts');
  const expected = [];
  try {
    const src = readFileSync(dts, 'utf8');
    // `export { A, B } from '...'` — and NOT `export type { ... }`, which erases.
    for (const line of src.split(/\r?\n/)) {
      const m = /^\s*export\s*\{([^}]*)\}\s*from/.exec(line);
      if (!m || /^\s*export\s+type/.test(line)) continue;
      for (const part of m[1].split(',')) {
        const name = part.trim().split(/\s+as\s+/).pop()?.trim();
        if (name) expected.push(name);
      }
    }
  } catch (e) {
    fail('D5', `${rel(dts)} is unreadable, so there is nothing to compare against: ${e.message}`);
  }

  // An empty list would make this check pass unconditionally, which is the
  // assertion-that-cannot-fail `doc/workflow.md` section 5 rule 3 forbids. The
  // package exports **ten** values; zero means the parse broke, not that it stopped.
  // *(This comment read "nine" from W5 until W29's adequacy reader counted them —
  // in the clause W29 built three probes for, which is the item that should have
  // caught it. `doc/` is not the only place a number goes stale unread.)*
  if (expected.length === 0 && !failures.some((f) => f.startsWith('D5'))) {
    fail('D5', `no value exports were parsed out of ${rel(dts)}. Either its declaration style ` +
      'changed or this check is silently vacuous — the second is worse');
  }

  if (expected.length) {
    try {
      const mod = await import(pathToFileURL(join(pkgDir, 'dist', 'node', 'index.js')).href);
      const missing = expected.filter((n) => !(n in mod));
      if (missing.length) {
        fail('D5', `dist/node/index.js is missing ${missing.length} value export(s) its own ` +
          `declarations name: ${missing.join(', ')}. A partial or mismatched publish`);
      }
    } catch (e) {
      fail('D5', `dist/node/index.js does not load: ${e.message}`);
    }
  }
}

if (process.argv.includes('--self-test')) {
  const mod = process.env.CHECK_SCHEDULER_SELFTEST ?? join(ROOT, 'scripts', 'check-scheduler-selftest.mjs');
  // `resolve`, not `join`: the default is already absolute and `join` would
  // concatenate it onto ROOT. **The override is what lets `check-wiring.mjs`'s `G1`
  // prove this dispatch ROUTES rather than that its text exists** — W38, where the
  // clause was declared as `S14` inside `check-source` and moved to its own entry
  // under a cost measurement; the idiom is `CHECK_SOURCE_SELFTEST`'s, which predates
  // it. `G2` reads the declaration on the line above and compares both names.
  const { selfTest } = await import(pathToFileURL(resolve(ROOT, mod)).href);
  process.exit(await selfTest(ROOT));
}

// **A check that did not run is reported as `NOT RUN`, never as `ok`.**
// `doc/workflow.md` section 1 rule 4: *"a skipped check reported as passed makes
// the whole ladder worthless"*. Every block above was once guarded by one
// `if (pkgDir)`, so with the link missing this printed four `ok` lines for four
// checks that never executed — found by W5's test-adequacy pass. `ran` is set
// inside each block that actually runs.
// --- D6: both L6 rungs RUN ladder L6, and the Deno one reads the Deno pin -----
//
// **`D3` compares two pins and nothing compared the commands that CONSUME them** —
// W36's adequacy reader, and obligation (e) in the exact form this item's own
// Verification section named. Measured twice, each for ZERO failures:
//
//   1. drop `--import-map=examples/deno-import-map.json` from `test:l6:deno` and
//      Deno resolves the bare `fyflow-scheduler` specifier out of `node_modules` —
//      the **npm** package. L6 prints `25 real runs on fyflow-scheduler 0.5.1, on
//      deno 2.9.6`, 489 assertions, exit 0, and this check prints five `ok` rows
//      **including `D3`**. The JSR half is never loaded at all.
//   2. replace the command with `node examples/l6.ts` and the Deno rung is gone,
//      while every check still passes and the banner says "node" twice.
//
// `S12` binds the gate chain's entry NAMES — by equality and in order — and
// **nothing binds an entry's ARGUMENTS**. So `D3`'s own premise, *ladder L6 runs in
// both runtimes*, was a fact about a command string that nothing checked, which
// makes `D3` a comparison between two files one of which need never be opened.
//
// **It lives here rather than in `check-source.mjs` because the premise belongs to
// the check that rests on it**: without this, `D3` is decoration.
{
  let ourPkg = null;
  try {
    ourPkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  } catch {
    // **Deliberately silent, and `ran.D6` stays false.** `D2` already owns the
    // unreadable-manifest clause and reports it; a second `fail()` for one cause
    // would be two clauses under two ids for one defect, which is the co-firing
    // shape W29 measured and `doc/workflow.md` section 5 rule 8 asks to be told
    // apart from masking. An unreadable manifest means D6 genuinely **did not
    // run**, and the report says so — which is W5's own finding and section 1
    // rule 4's subject.
  }
  if (ourPkg) {
    ran.D6 = true;
    const rung = ourPkg.scripts?.['test:l6:deno'];
    const mapRel = 'examples/deno-import-map.json';
    if (typeof rung !== 'string') {
      fail('D6', 'package.json has no `test:l6:deno` script, so ladder L6 has no Deno rung — and ' +
        "`D3`'s premise is that it runs in both runtimes");
    } else {
      if (!/(^|\s)deno\s+run(\s|$)/.test(rung)) {
        fail('D6', `\`test:l6:deno\` does not invoke \`deno run\`: it is ${JSON.stringify(rung)}. ` +
          'A rung named for a runtime it does not start is a rung reported by omission ' +
          '(`doc/workflow.md` section 1 rule 4)');
      }
      if (!rung.includes(`--import-map=${mapRel}`)) {
        fail('D6', `\`test:l6:deno\` does not pass \`--import-map=${mapRel}\`, so Deno resolves the ` +
          'bare `fyflow-scheduler` specifier out of `node_modules` — the npm package — and the JSR ' +
          'pin D3 just compared is never read. Measured: L6 then reports "on deno" while running ' +
          'the npm build, with every other clause green');
      }
    }
    // **And BOTH rungs must run the FILE — W35, and it is W36's own finding one
    // layer further in.**
    //
    // The two clauses above bind the Deno rung's *runtime* and its *resolution*
    // and say nothing about what it opens; nothing anywhere bound the Node rung's
    // command at all. Measured, each for **zero** failures across `check:source`,
    // `check:scheduler`, `check:spec` and `check:markdown`:
    //
    //   1. `"test:l6": "node examples/run-flow.ts"` — that module exports functions
    //      and runs nothing, so the Node rung **exits 0 having asserted nothing**;
    //   2. the same substitution in `test:l6:deno`, keeping `deno run` and the
    //      import map, so both clauses above still pass.
    //
    // **What that deletes is every exit artifact this repository has.** L6 is the
    // only rung that touches a real scheduler: P4's two-driver pairing, P6's
    // foreign tasks, P7's nested fan-out and P10's map all live in
    // `examples/l6.ts` and nowhere else. `S12` binds the chain's entry NAMES, so
    // the entries stay; they simply stop running the assertions.
    //
    // **Why `l6.ts` by name rather than "some file under examples/"**: the weaker
    // form is satisfied by `run-flow.ts`, which is precisely the measured case.
    const rungs = [['test:l6', /(^|\s)node(\s|$)/, 'node'], ['test:l6:deno', /(^|\s)deno\s+run(\s|$)/, 'deno run']];
    for (const [name, starts, label] of rungs) {
      const cmd = ourPkg.scripts?.[name];
      if (typeof cmd !== 'string') {
        if (name !== 'test:l6:deno') {
          fail('D6', `package.json has no \`${name}\` script, so ladder L6 has no ${label} rung`);
        }
        continue;
      }
      // **Skipped for `test:l6:deno`, which the clause above already owns.** Without
      // this guard the loop reports a SECOND `D6` failure with a near-identical
      // message for one defect — the sibling-under-one-id shape W29 asked to be told
      // apart from masking, produced here by a widening rather than found. W35's
      // conformity reader; the missing-rung clause below already had its guard.
      if (name !== 'test:l6:deno' && !starts.test(cmd)) {
        fail('D6', `\`${name}\` does not invoke \`${label}\`: it is ${JSON.stringify(cmd)}`);
      }
      // **The ENTRY POINT, not a substring — W35's adequacy reader, BLOCKING, and
      // it defeated this clause with four characters.**
      //
      // This read `cmd.includes('examples/l6.ts')`. Measured:
      // `deno run --import-map=… --allow-env examples/run-flow.ts --note=examples/l6.ts`
      // passes **every** `D6` clause, prints `ok`, leaves `check:source` and both
      // self-tests at exit 0 — and `npm run test:l6:deno` then exits 0 with no
      // output at all. The clause this item declared an exception to build, closing
      // *"a command that starts the right runtime and opens the wrong file"*, was
      // satisfied by the wrong file being named in an **argument**.
      //
      // A runtime runs the first non-flag token after its own flags, so that is what
      // is compared. `deno run`'s subcommand word is dropped first; everything
      // beginning `-` is a flag, and Deno's flags here all carry their value with
      // `=`, so no flag consumes the token after it.
      const argv = cmd.split(/\s+/).filter(Boolean);
      const afterRuntime = argv.slice(argv.indexOf(label.split(' ')[0]) + (label.includes(' ') ? 2 : 1));
      const entry = afterRuntime.find((t) => !t.startsWith('-'));
      if (entry !== 'examples/l6.ts') {
        fail('D6', `\`${name}\` does not RUN \`examples/l6.ts\` — the first non-flag argument is ` +
          `${JSON.stringify(entry ?? null)} and the command is ${JSON.stringify(cmd)}. ` +
          'Ladder L6 IS that file — every exit artifact from P4 onward is in it and nowhere else — ' +
          'and a rung pointed elsewhere exits 0 having asserted nothing, with every check green. ' +
          'Naming it in a later argument is not running it');
      }
    }
  }
}

// --- D7: the pin's NUMBER is written only where something resolves it ----------
//
// **W157, the maintainer's direction: "reduce the places where we quote the exact
// scheduler version".** Until W157 this check bound FIVE sentences to REPEAT the pin —
// `spec/README.md` rule 6, `AGENTS.md`, `README.md`, `doc/concept.md` and
// `examples/README.md` — by capture-and-compare (W37, and its adequacy reader's
// rewrite of an `includes` form that was green when the pin was wrong). That answered
// *"does every copy agree"* and multiplied the copies: each bump was five more edits,
// and the eleven documents W37 found naming the old pin were eleven copies nothing
// bound. **The rule is now the other way round: the number lives where something
// RESOLVES or BINDS it, and a document names the pin without it** — `package.json`
// says what it is, and `npm run state` prints it.
//
// **RESOLVING** — the manifests an installer or a runtime reads, and this file's own
// `PIN`. **RECORDS** — dated by construction: an item, a plan, a decision, a question,
// and the upstream register, whose rows date what upstream shipped. **SCANNED** — every
// file at the root, and everything under the six top-level directories this repository
// writes: `doc/`, `spec/`, `src/`, `test/`, `examples/` and `scripts/`, less the RECORDS.
// A declared list rather than *everything less a skip list*, because the skip list would
// name the shared scratch directory — whole-tree COPIES that must never be read as the
// tree (ADR 0072) — and the installed dependencies; neither is a top-level directory
// this repository writes. **Its holes, stated**: a NEW top-level directory is not scanned
// until it is added here; `.github/` exists and is not walked (its workflows are `.yml`,
// which no extension here admits); and a RESOLVING file is skipped WHOLE except for the
// free-text fields in `NOTES`, which are read as prose — the import map's `_note` and
// `package.json`'s `description` (W157's adequacy reader, A2).
//
// **What is refused: the CURRENT pin's number on a line that speaks of the scheduler or
// the pin.** The line filter is not decoration: this package's OWN version history
// names numbers the scheduler later reaches — `AGENTS.md`'s own breaking-change
// paragraphs and `spec/flow-definition.md`'s package-version notes, measured at W157 —
// and a bare-number rule refuses them. **Its holes, stated rather than closed** (W157's
// adequacy reader, A4-A6): the pin's number on a line that names neither the scheduler nor
// the pin passes — and so does one WRAPPED onto the line after the word (*"pinned to"* then
// the number at the start of the next line); a SHORTENED number (`0.6`, `0.6.x`) is not the
// pin's token and passes; and the five retired sentences are matched in their exact
// spelling, so a reworded one passes. The line filter does not name `jsr:` or `npm:`: every
// specifier of this package carries the word *scheduler* (`fyflow-scheduler`,
// `@fyflow/scheduler`), so they added no line the word does not. And a DATED claim in a living
// document cannot name the current pin either — it names the item that measured it,
// whose file carries the version; once the pin moves on, the old number is history and
// writable again.
{
  const RESOLVING = new Set([
    'package.json', 'package-lock.json', 'deno.json', 'deno.lock', 'examples/deno-import-map.json',
  ]);
  const RECORDS = ['doc/work-items/', 'doc/plans/', 'doc/decisions/', 'doc/questions/', 'doc/scheduler-upstream.md'];
  const SCAN_DIRS = new Set(['doc', 'spec', 'src', 'test', 'examples', 'scripts']);
  const EXTENSIONS = /\.(md|ts|mjs|js|json|html)$/;
  const SPEAKS = /scheduler|\bpin/i;
  const SELF = 'scripts/check-scheduler.mjs';
  const pinToken = new RegExp(`(^|[^\\d.])${PIN.replace(/\./g, '\\.')}(?![\\d]|\\.\\d)`);
  // **And the five RETIRED pin sentences, at ANY version.** The number rule above sees
  // only the CURRENT pin, so after a bump a reinstated *"Pin the scheduler at <old>."* is
  // invisible to it — which is W37's measured state (the gate green with eleven documents
  // naming the old pin) arriving by the other road. These are the grammars D7 bound until
  // W157; each states the pin as an INSTRUCTION, and none is written again.
  const RETIRED = [
    /at \*\*\d+\.\d+\.\d+\*\*, the version we pin/,
    /Pin the scheduler at \d+\.\d+\.\d+/,
    /is pinned to \*\*\d+\.\d+\.\d+\*\* and installed from/,
    /We pin \*\*\d+\.\d+\.\d+\*\* \(Q3\)/,
    /Node installs `fyflow-scheduler@\d+\.\d+\.\d+` from/,
  ];
  const found = [];
  const retired = [];
  let scanned = 0;
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, entry.name);
      const r = rel(abs);
      if (entry.isDirectory()) {
        if ((dir === ROOT && !SCAN_DIRS.has(entry.name)) || RECORDS.includes(`${r}/`)) continue;
        walk(abs);
        continue;
      }
      if (!entry.isFile() || !EXTENSIONS.test(entry.name)) continue;
      if (RESOLVING.has(r) || RECORDS.includes(r)) continue;
      let text;
      try {
        text = readFileSync(abs, 'utf8');
      } catch {
        continue;
      }
      scanned++;
      text.split(/\r?\n/).forEach((line, i) => {
        if (r === SELF && /^const PIN = '\d+\.\d+\.\d+';$/.test(line)) return;
        if (pinToken.test(line) && SPEAKS.test(line)) found.push(`${r}:${i + 1}`);
        if (RETIRED.some((re) => re.test(line))) retired.push(`${r}:${i + 1}`);
      });
    }
  };
  walk(ROOT);
  // **The free-text fields of the RESOLVING files, read as prose** — A2. The import map's
  // `_note` restated the pin's number until W157, in a file skipped whole as resolving; an
  // unreadable file is skipped silently, because `D2` and `D3` own that clause.
  const NOTES = [['examples/deno-import-map.json', '_note'], ['package.json', 'description']];
  for (const [r, key] of NOTES) {
    let value;
    try {
      value = JSON.parse(readFileSync(join(ROOT, r), 'utf8'))?.[key];
    } catch {
      continue;
    }
    if (typeof value !== 'string') continue;
    if (pinToken.test(value) && SPEAKS.test(value)) found.push(`${r} "${key}"`);
    if (RETIRED.some((re) => re.test(value))) retired.push(`${r} "${key}"`);
  }
  ran.D7 = true;
  // **Vacuous at zero.** A walk that reads nothing passes everything; this tree holds
  // hundreds of scanned files, so a handful means the walk broke, not that the tree shrank.
  if (scanned < 100) {
    fail('D7', `scanned ${scanned} file(s) for the pin's number — the walk is broken, and a check ` +
      'that reads nothing cannot find a stale copy');
  }
  if (retired.length) {
    fail('D7', `a retired pin STATEMENT is written again, at ${retired.join(', ')} — one of the five ` +
      'sentence forms that stated the pin with its number until W157. A document names the pin without ' +
      'its number; an old pin is recorded in prose, never as an instruction');
  }
  if (found.length) {
    fail('D7', `the pin's number ${PIN} is written outside the files that resolve it, on ` +
      `${found.length} line(s) that speak of the scheduler or the pin: ${found.join(', ')}. ` +
      'Name the pin without its number — `package.json` says what it is and `npm run state` prints ' +
      'it — and date a measurement by the item that took it. The number lives in package.json, ' +
      'package-lock.json, deno.json, deno.lock, the import map and this file\'s PIN, and nowhere else');
  }
}

// --- D9: the two LOCK files hold the pin, and nothing else for the scheduler --
//
// **W157's adequacy reader, A3.** `D2` binds what `package.json` ASKS for and `D3` what the
// import map maps; neither reads what the installers WROTE. A stale `deno.lock` is caught today
// only by Deno's minimum-dependency-age refusal, which lapses a day after a release, and a stale
// `package-lock.json` only by `npm ci`. So the lock entries are held to `PIN` too: the
// `@fyflow/scheduler@<v>` keys of `deno.lock`'s `jsr` block — every one, because W37 found the
// lock had kept two DEAD versions across two bumps (Q174) — and `package-lock.json`'s
// installed entry.
{
  let denoLock = null;
  try {
    denoLock = JSON.parse(readFileSync(join(ROOT, 'deno.lock'), 'utf8'));
  } catch (e) {
    fail('D9', `deno.lock is unreadable, so the JSR half of the pin has no integrity on record: ${e.message}`);
  }
  if (denoLock) {
    ran.D9 = true;
    const locked = Object.keys(denoLock.jsr ?? {})
      .filter((k) => k.startsWith(`${JSR_NAME}@`)).map((k) => k.slice(JSR_NAME.length + 1));
    if (locked.length === 0) {
      fail('D9', `deno.lock locks no ${JSR_NAME} version — Deno resolves it afresh, and inside the 24-hour ` +
        'minimum dependency age it refuses the pin outright (W157)');
    }
    const stale = locked.filter((v) => v !== PIN);
    if (stale.length) {
      fail('D9', `deno.lock locks ${JSR_NAME} at ${stale.join(', ')} and the pin is ${PIN} — a stale or dead ` +
        'trust anchor; rewrite the lock rather than letting it accumulate (Q174)');
    }
  }
  let npmLock = null;
  try {
    npmLock = JSON.parse(readFileSync(join(ROOT, 'package-lock.json'), 'utf8'));
  } catch (e) {
    fail('D9', `package-lock.json is unreadable, so what npm installed is not on record: ${e.message}`);
  }
  if (npmLock) {
    ran.D9 = true;
    const v = npmLock.packages?.['node_modules/fyflow-scheduler']?.version;
    if (v !== PIN) {
      fail('D9', `package-lock.json locks fyflow-scheduler at ${v ?? 'nothing'} and the pin is ${PIN} — run ` +
        '`npm install` after moving the pin, so `npm ci` installs what the gate ran');
    }
  }
}

// --- D8: the two PUBLISHED manifests declare the scheduler, at the pin --------
//
// ADR 0048 rules 1-3 (W57). `D2` binds what the gate INSTALLS (`devDependencies`) and
// `D3` binds the L6 import map; neither reads what a CONSUMER's installer is told.
// `package.json`'s `peerDependencies` is that statement for npm, and `deno.json`'s
// `imports` is it for JSR — a JSR package's dependency is declared there and nowhere
// else. Measured at W57: `deno publish --dry-run` refuses a bare import with no entry,
// and in THIS repository passes without one only because `devDependencies` resolves
// the specifier through `node_modules` to the npm build — which is not what a Deno
// consumer should be handed (ADR 0029). So both are held to `PIN`, EXACTLY: the range
// is exact by ADR 0048 rule 1, and the JSR entry must be the pinned `jsr:` form — not a
// path (`check-source.mjs` `S8` refuses that at its own address) and not `npm:`.
{
  let ourPkg = null;
  let ourDeno = null;
  try {
    ourPkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  } catch {
    // `D2` owns and reports the unreadable manifest; one cause, one clause (W29's shape).
  }
  try {
    ourDeno = JSON.parse(readFileSync(join(ROOT, 'deno.json'), 'utf8'));
  } catch (e) {
    fail('D8', `deno.json is unreadable, so the JSR declaration cannot be checked: ${e.message}`);
  }
  if (ourPkg) {
    ran.D8 = true;
    const peer = ourPkg.peerDependencies?.['fyflow-scheduler'];
    if (peer === undefined) {
      fail('D8', 'package.json declares no peerDependencies entry for fyflow-scheduler — ADR 0048 rule 1. ' +
        'The published library depends on the scheduler, and a consumer`s installer reads that here ' +
        'and nowhere else');
    } else if (peer !== PIN) {
      fail('D8', `package.json declares the peer as "${peer}" and the pin is ${PIN} — ADR 0048 rule 1: the ` +
        'range is EXACT, because the driver is written against one version`s event shapes and there ' +
        'is no upstream changelog to read a wider range from');
    }
    // **`peerDependenciesMeta` can make the peer OPTIONAL, and then nothing above is a
    // declaration at all** — W57's adequacy reader (m20), measured at the installer: a consumer
    // who installs only this library gets no scheduler and fails at import, with D2, D8 and S8
    // all green. A third field decides what the second one means.
    if (ourPkg.peerDependenciesMeta?.['fyflow-scheduler']?.optional === true) {
      fail('D8', 'package.json marks the fyflow-scheduler peer OPTIONAL in peerDependenciesMeta — ADR 0048 ' +
        'rule 1. The published bundle imports the scheduler at load, so a consumer who takes the option ' +
        'fails at import; the peer is a statement of what is REQUIRED');
    }
  }
  if (ourDeno) {
    ran.D8 = true;
    const want = `jsr:${JSR_NAME}@${PIN}`;
    const entry = ourDeno.imports?.['fyflow-scheduler'];
    if (entry === undefined) {
      fail('D8', 'deno.json maps no "fyflow-scheduler" import — ADR 0048 rule 2. A JSR package`s dependency ' +
        'is declared there and nowhere else; without it `deno publish` either refuses the bare ' +
        'specifier or resolves it through package.json to the npm build');
    } else if (entry !== want) {
      fail('D8', `deno.json maps "fyflow-scheduler" to "${entry}" and ADR 0048 rule 2 says "${want}" — the ` +
        'pinned JSR form, so a Deno consumer reads the same version and the same SOURCE the L6 rung does');
    }
    // **And `scopes` can re-map the specifier for part of the package under `imports`' nose** —
    // W57's adequacy reader (m22): `{ "scopes": { "./src/": { "fyflow-scheduler": "../fyflow-scheduler/index.ts" } } }`
    // resolved `src/driver/driver.ts` to a working tree with the `imports` entry intact and every
    // check green. A scope naming the scheduler makes the `imports` entry a statement about nothing.
    const NAMES = /fyflow-scheduler|@fyflow\/scheduler/;
    for (const [scope, map] of Object.entries(ourDeno.scopes ?? {})) {
      for (const [key, target] of Object.entries(map ?? {})) {
        if (NAMES.test(key) || NAMES.test(String(target))) {
          fail('D8', `deno.json re-maps the scheduler inside scopes["${scope}"] ("${key}" -> "${target}") — ` +
            'ADR 0048 rule 2. The imports entry is the ONE declaration; a scope overriding it for part of ' +
            'the package is a second, and it is a path or a different registry');
        }
      }
    }
  }
}

const checks = [
  ['D1', ran.D1, `D1 the pinned scheduler is installed from a registry, not linked`],
  ['D2', ran.D2, `D2 it is ${PIN}, and package.json asks for exactly ${PIN}`],
  ['D3', ran.D3, `D3 Deno's JSR pin is the same version as Node's npm pin`],
  ['D4', ran.D4, `D4 every artifact \`exports\` selects is present`],
  ['D5', ran.D5, `D5 it loads and exports what its own declarations name`],
  ['D6', ran.D6, `D6 both L6 rungs run examples/l6.ts, and the Deno one reads the Deno pin`],
  ['D7', ran.D7, `D7 the pin's number is written only where something resolves it`],
  ['D8', ran.D8, `D8 both PUBLISHED manifests declare the scheduler at ${PIN} — the peer, and the jsr: import`],
  ['D9', ran.D9, `D9 both LOCK files hold the scheduler at ${PIN}, and no other version of it`],
];
// **Both halves carry a VERSION.** This printed the JSR package NAME with no version
// at all — the one line where a human sees the two pins side by side, omitting the
// number the whole check is about. W36's adequacy reader.
console.log(`scheduler check — fyflow-scheduler@${manifest?.version ?? '<not installed>'} ` +
  `(npm) / ${JSR_NAME}@${jsrPin ?? '<unpinned>'} (JSR)\n`);
for (const [id, didRun, label] of checks) {
  const bad = failures.filter((f) => f.startsWith(id + ':'));
  const verdict = bad.length ? 'FAIL   ' : didRun ? 'ok     ' : 'NOT RUN';
  console.log(`  ${verdict}  ${label}${bad.length ? ` (${bad.length})` : ''}`);
}
if (failures.length) {
  console.log('\n' + failures.map((f) => '  ' + f).join('\n'));
  console.log(`\n${failures.length} failure(s).`);
  process.exit(1);
}
console.log('\nAll checks passed.');
