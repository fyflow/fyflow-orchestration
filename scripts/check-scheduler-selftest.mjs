// **The negative tests for `check-scheduler.mjs`, checked in rather than run once
// by hand** — `doc/workflow.md` v0.5 section 5 rule 7, all three requirements.
//
//   node scripts/check-scheduler.mjs --self-test
//
// **Why this file exists now and did not before.** The previous version of that
// check was provoked five ways at birth by W5 and the probes were never committed
// — rule 7 (a) is the requirement written for exactly that, and the check has
// since been rewritten end to end for a registry dependency. A rewritten check
// with its predecessor's hand-run probes is a claim about a script that no longer
// exists.
//
// Each probe below breaks one half of the pin — the npm side or the JSR side —
// and **declares the full SET of checks it must trip**, which must match exactly.
// `D1` and `D2` cascade legitimately in one direction and say so: with the package
// absent there is no manifest to read a version out of.

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, lstatSync, symlinkSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const PKG = 'package.json';
const MAP = 'examples/deno-import-map.json';

/**
 * `half` names the file the probe rewrites. `env` probes point the check at a
 * different `node_modules` root by moving the installed package aside — the one
 * thing that cannot be expressed as a file edit.
 */
const PROBES = [
  {
    name: 'package.json asks for a RANGE rather than the pin',
    half: PKG, check: 'D2',
    mutate: (t) => t.replace('"fyflow-scheduler": "0.3.0"', '"fyflow-scheduler": "^0.3.0"'),
  },
  {
    name: 'package.json reinstates the working-tree link',
    half: PKG, check: 'D2',
    // The regression this repository moved away from, and the one that cost it a
    // sibling checkout. D1 does not fire because the INSTALLED package is still
    // the registry one; only the declaration changed.
    mutate: (t) => t.replace('"fyflow-scheduler": "0.3.0"', '"fyflow-scheduler": "file:../fyflow-scheduler"'),
  },
  {
    name: 'package.json moves the scheduler to a runtime dependency',
    half: PKG, check: 'D2',
    mutate: (t) => t.replace('    "fyflow-scheduler": "0.3.0",\n', ''),
  },
  {
    name: 'the Deno half pinned to a DIFFERENT version from the Node half',
    half: MAP, check: 'D3',
    // **The hazard this rewrite exists for.** Ladder L6 runs in both runtimes and
    // would report both green against two different schedulers.
    mutate: (t) => t.replace('jsr:@fyflow/scheduler@0.3.0', 'jsr:@fyflow/scheduler@0.2.1'),
  },
  {
    name: 'the Deno half pointed back at a working-tree path',
    half: MAP, check: 'D3',
    mutate: (t) => t.replace('jsr:@fyflow/scheduler@0.3.0', '../../fyflow-scheduler/index.ts'),
  },
  {
    name: 'the Deno half pointed at a different JSR package',
    half: MAP, check: 'D3',
    mutate: (t) => t.replace('jsr:@fyflow/scheduler@0.3.0', 'jsr:@fyflow/schedulr@0.3.0'),
  },
  {
    name: 'the Deno half unpinned',
    half: MAP, check: 'D3',
    mutate: (t) => t.replace('jsr:@fyflow/scheduler@0.3.0', 'jsr:@fyflow/scheduler'),
  },
  {
    name: 'the bare specifier dropped from the import map entirely',
    half: MAP, check: 'D3',
    mutate: (t) => t.replace('"fyflow-scheduler": "jsr:@fyflow/scheduler@0.3.0"', '"_unused": "x"'),
  },
];

/**
 * Probes that move the installed package rather than editing a file. They run
 * last and restore it, because everything else depends on it being there.
 */
const INSTALL_PROBES = [
  {
    name: 'the package is not installed at all',
    check: 'D1',
    // With no manifest there is no version to compare and no artifact to load, so
    // D2, D4 and D5 do not RUN — which the report distinguishes from `ok`, and
    // which is why they are not declared here.
    apply: (root, dir) => { rmSync(dir, { recursive: true, force: true }); },
  },
  {
    name: 'the installed package replaced by a link into a working tree',
    check: 'D1',
    // The accident, as a probe: a junction here is what a recursive delete
    // follows out of this repository and into another one.
    apply: (root, dir, stash) => {
      rmSync(dir, { recursive: true, force: true });
      writeFileSync(join(root, 'dev-dist', 'sched-selftest', 'note.txt'), 'link probe');
      const target = join(root, 'dev-dist', 'sched-selftest');
      try {
        symlinkSync(target, dir, 'junction');
      } catch {
        // **A skip here is a probe passing for the wrong reason**, so it is
        // reported as one. The first version of this probe reached this branch
        // every run — `require` is not defined in an ES module, so the
        // `symlinkSync` call threw a ReferenceError rather than failing to make a
        // junction, and the probe reported SKIP on a machine that creates them
        // fine. That is `doc/workflow.md` rule 7 (b) in its purest form: the
        // mutation did not happen and the harness said so only because it was
        // asked to.
        cpSync(stash, dir, { recursive: true });
        return 'skipped';
      }
    },
  },
  {
    name: 'a partial publish — the artifact `exports` selects is missing',
    check: 'D4',
    // D5 loads that same file, so it cascades. Declared.
    also: ['D5'],
    apply: (root, dir) => { rmSync(join(dir, 'dist', 'node', 'index.js'), { force: true }); },
  },
  {
    name: 'the installed version is not the version pinned',
    check: 'D2',
    apply: (root, dir) => {
      const p = join(dir, 'package.json');
      writeFileSync(p, readFileSync(p, 'utf8').replace('"version": "0.3.0"', '"version": "0.2.1"'));
    },
  },
];

/** Every check `check-scheduler.mjs` reports under, in the order it reports them. */
const ALL_CHECKS = ['D1', 'D2', 'D3', 'D4', 'D5'];

/** The floor `check-policies-selftest.mjs` learned to carry: vacuous at zero. */
const MIN_PROBES = 12;

export async function selfTest(root) {
  const dir = join(root, 'dev-dist', 'sched-selftest');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  const total = PROBES.length + INSTALL_PROBES.length;
  if (total < MIN_PROBES) {
    console.log(`check-scheduler self-test — ${total} probes, and the floor is ${MIN_PROBES}.`);
    console.log('  FAIL  the probe list is short; `caught === total` is vacuous at zero.');
    return 1;
  }

  const script = join(root, 'scripts', 'check-scheduler.mjs');
  const run = (env) => {
    const r = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', env, timeout: 300_000 });
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
    return { status: r.status, tripped: ALL_CHECKS.filter((x) => out.includes(`${x}: `)) };
  };

  console.log(`check-scheduler self-test — ${total} probes\n`);
  let caught = 0;

  // --- file probes: rewrite one half, restore it -------------------------------
  for (const probe of PROBES) {
    const path = join(root, probe.half);
    const before = readFileSync(path, 'utf8');
    const after = probe.mutate(before);
    if (after === before) {
      console.log(`  FAIL  ${probe.check}  ${probe.name} — the mutation matched nothing`);
      continue;
    }
    writeFileSync(path, after);
    let r;
    try { r = run(process.env); } finally { writeFileSync(path, before); }
    const declared = [probe.check, ...(probe.also ?? [])].sort();
    const refused = r.status !== 0 && r.tripped.join(',') === declared.join(',');
    if (refused) caught++;
    console.log(`  ${refused ? 'ok  ' : 'FAIL'}  ${probe.check}  ${probe.name}` +
      (refused ? '' : `  — exited ${r.status}, wanted [${declared.join(',')}], got [${r.tripped.join(',')}]`));
  }

  // --- install probes: move the installed package aside, then put it back ------
  const pkgDir = join(root, 'node_modules', 'fyflow-scheduler');
  const stash = join(dir, 'installed');
  if (!existsSync(pkgDir)) {
    console.log('  FAIL  node_modules/fyflow-scheduler is absent, so the install probes cannot run');
    rmSync(dir, { recursive: true, force: true });
    return 1;
  }
  cpSync(pkgDir, stash, { recursive: true });
  for (const probe of INSTALL_PROBES) {
    let r, skipped = false;
    try {
      skipped = probe.apply(root, pkgDir, stash) === 'skipped';
      if (!skipped) r = run(process.env);
    } finally {
      // A junction has to be unlinked rather than deleted through, which is the
      // whole lesson: `rmSync` on a link into another tree deletes that tree.
      try {
        const st = lstatSync(pkgDir);
        if (st.isSymbolicLink()) unlinkSync(pkgDir);
        else rmSync(pkgDir, { recursive: true, force: true });
      } catch { /* already gone */ }
      cpSync(stash, pkgDir, { recursive: true });
    }
    if (skipped) {
      // Not counted as caught. A probe that did not run is not a hole that is
      // closed, and counting it was how the ReferenceError above stayed invisible.
      console.log(`  FAIL  ${probe.check}  ${probe.name} — could not create a junction, so the ` +
        'mutation never happened');
      continue;
    }
    const declared = [probe.check, ...(probe.also ?? [])].sort();
    const refused = r.status !== 0 && r.tripped.join(',') === declared.join(',');
    if (refused) caught++;
    console.log(`  ${refused ? 'ok  ' : 'FAIL'}  ${probe.check}  ${probe.name}` +
      (refused ? '' : `  — exited ${r.status}, wanted [${declared.join(',')}], got [${r.tripped.join(',')}]`));
  }

  rmSync(dir, { recursive: true, force: true });
  console.log(`\n${caught}/${total} probes caught.`);
  return caught === total ? 0 : 1;
}
