// **The negative tests for `check-docs.mjs`, checked in rather than run once by hand.**
//
//   node scripts/check-docs.mjs --self-test
//
// `doc/workflow.md` v0.3 section 5 rule 7 says a new check is negative-tested at
// birth. W9 did that and the probes lived in a scratch directory, so nothing
// re-ran them — and W9's adequacy reader measured what that costs: **8 of 9
// mutations that disabled the script's own machinery survived**, including
// `if (false)` on X3, on X4, and on the final `process.exit(1)`.
//
// A check nobody can re-break is a claim about the past. Each probe below breaks
// the reference in one specific way and asserts that the named check refuses it.
// **A probe that stops failing is a hole that has opened**, which is the whole
// point of keeping them.
//
// **A probe declares the FULL SET of checks it trips, not just one**, and P3's
// retro is why. Naming a single check does not discriminate: a probe that is
// merely *malformed* — W6's original defect, and the thing rule 7 (c) was written
// to refuse — trips X3 *and* X4, so it satisfies a probe aimed at either one and
// is reported as caught. Measured: garbage inserted into a `run` snippet and
// declared `check: 'X4'` was reported caught, and eleven of the twelve probes
// below already tripped exactly one check, so the stronger form costs one
// declaration. `X3` is the one legitimate cascade — a snippet that does not
// compile also does not run and also fails under the DOM lib — and it says so.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Each probe returns the mutated reference and names the check that must refuse
 * it. `also` declares the checks it is permitted to trip in addition — the only
 * one is X3's cascade, and anything tripping a check it did not declare is a
 * probe that is broken rather than a hole that is closed.
 */
const PROBES = [
  {
    name: 'a snippet that stops compiling',
    check: 'X3',
    // A snippet that does not compile also does not execute (X4) and does not
    // compile under the DOM lib either (X5). This is the only declared cascade.
    also: ['X4', 'X5'],
    mutate: (t) => t.replace('import { Driver, fold, liveToken,', 'import { Driver, fold, noSuchExport,'),
  },
  {
    name: 'a snippet that stops producing its stated result',
    check: 'X4',
    mutate: (t) => t.replace("if (!accepted || again) throw", "if (accepted || !again) throw"),
  },
  {
    name: 'an untagged block',
    check: 'X2',
    mutate: (t) => t.replace('```ts run', '```ts'),
  },
  {
    name: 'an untagged block whose preceding line merely contains the word "prose"',
    check: 'X2',
    mutate: (t) => t.replace(
      '```ts run',
      'The paragraphs below are prose.\n\n```ts',
    ),
  },
  {
    name: 'a fence spelled ```typescript, which the extractor would otherwise skip in silence',
    check: 'X1',
    mutate: (t) => t.replace('```ts run', '```typescript run'),
  },
  {
    name: 'a fence spelled ```TS, ditto',
    check: 'X1',
    mutate: (t) => t.replace('```ts run', '```TS run'),
  },
  {
    name: 'an indented fence, ditto',
    check: 'X1',
    mutate: (t) => t.replace('```ts run', '   ```ts run'),
  },
  {
    name: 'an unclosed fence',
    check: 'X1',
    // The LAST closing fence in the file, so the unclosed block runs to EOF.
    mutate: (t) => t.slice(0, t.lastIndexOf('```')) + t.slice(t.lastIndexOf('```') + 3),
  },
  {
    name: 'a reference with no snippets at all',
    check: 'X1',
    mutate: (t) => t.replace(/```ts[\s\S]*?```/g, ''),
  },
  {
    name: 'a `run` snippet whose assertions are deleted, so it only exits zero',
    check: 'X4',
    mutate: (t) => t.replace(/^.*\bthrow new Error\(.*$/gm, ''),
  },
  {
    name: 'a `run` snippet that calls process.exit() ahead of its assertions',
    check: 'X4',
    // Pinned to §2's literal text. It read `driver.start('run-1', { name: 'world' })`
    // until W13 moved the run id to the constructor, and requirement (b) — a probe
    // must assert it changed its input — is what turned that into a red gate
    // instead of a probe silently passing for the wrong reason.
    mutate: (t) => t.replace('driver.start({ name: \'world\' });',
      'process.exit(0);\ndriver.start({ name: \'world\' });'),
  },
  {
    name: 'a failing assertion smuggled past X4 by re-tagging the block `check`',
    check: 'X2',
    mutate: (t) => t.replace('```ts run', '```ts check'),
  },
];

/** Every check `check-docs.mjs` reports under, in the order it reports them. */
const ALL_CHECKS = ['X1', 'X2', 'X3', 'X4', 'X5'];

export async function selfTest(root) {
  const doc = readFileSync(join(root, 'AGENTS.md'), 'utf8');
  const dir = join(root, 'dev-dist', 'docs-selftest');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  console.log(`check-docs self-test — ${PROBES.length} probes\n`);
  let caught = 0;
  for (const [i, probe] of PROBES.entries()) {
    const rel = `dev-dist/docs-selftest/${String(i).padStart(2, '0')}.md`;
    const mutated = probe.mutate(doc);
    if (mutated === doc) {
      // A probe that changes nothing passes for the wrong reason — the exact
      // vacuity this file exists to refuse.
      console.log(`  FAIL  ${probe.check}  ${probe.name} — the mutation matched nothing`);
      continue;
    }
    writeFileSync(join(root, rel), mutated);
    const r = spawnSync(process.execPath, [join(root, 'scripts', 'check-docs.mjs')], {
      cwd: root, encoding: 'utf8', env: { ...process.env, CHECK_DOCS_DOC: rel }, timeout: 300_000,
    });
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
    // The set of checks that actually reported a failure, compared against the
    // set this probe declared. Equality, not membership: a probe that trips a
    // check it did not name is malformed, and a malformed probe reported as
    // caught is the whole reason this file exists.
    const declared = [probe.check, ...(probe.also ?? [])].sort();
    const tripped = ALL_CHECKS.filter((x) => out.includes(`${x}: `));
    const refused = r.status !== 0 && tripped.join(',') === declared.join(',');
    if (refused) caught++;
    console.log(`  ${refused ? 'ok  ' : 'FAIL'}  ${probe.check}  ${probe.name}` +
      (refused ? '' : `  — exited ${r.status}, wanted [${declared.join(',')}], got [${tripped.join(',')}]`));
  }
  rmSync(dir, { recursive: true, force: true });
  console.log(`\n${caught}/${PROBES.length} probes caught.`);
  return caught === PROBES.length ? 0 : 1;
}
