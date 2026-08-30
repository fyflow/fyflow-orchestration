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

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

/** Each probe returns the mutated reference, and names the check that must refuse it. */
const PROBES = [
  {
    name: 'a snippet that stops compiling',
    check: 'X3',
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
    mutate: (t) => t.replace('driver.start(\'run-1\', { name: \'world\' });',
      'process.exit(0);\ndriver.start(\'run-1\', { name: \'world\' });'),
  },
  {
    name: 'a failing assertion smuggled past X4 by re-tagging the block `check`',
    check: 'X2',
    mutate: (t) => t.replace('```ts run', '```ts check'),
  },
];

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
    const refused = r.status !== 0 && out.includes(`${probe.check}:`);
    if (refused) caught++;
    console.log(`  ${refused ? 'ok  ' : 'FAIL'}  ${probe.check}  ${probe.name}` +
      (refused ? '' : `  — exited ${r.status}, no ${probe.check} failure reported`));
  }
  rmSync(dir, { recursive: true, force: true });
  console.log(`\n${caught}/${PROBES.length} probes caught.`);
  return caught === PROBES.length ? 0 : 1;
}
