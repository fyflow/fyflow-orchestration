// Tests for scripts/publish-output.ts — W152 Outputs (10). Run: `deno task jsr:smoke:test`.
//
// The bug these pin down (fyflow-scheduler's, in its `publishOutput_test.ts`) appeared only on
// Linux, and development happens on Windows. So every path case runs through an EXPLICITLY chosen
// implementation, and both branches run on any host. Expected values are written out by hand from
// the path rules, never taken from a run.

import { deepStrictEqual, strictEqual } from 'node:assert/strict';
import { externalImports, parsePublishedFileUrls, posix, stagingPlan, windows } from './publish-output.ts';

// Faithful to the real output, ANSI colour codes and all (taken from a real dry run on this tree).
const HEADER = '\x1b[0m\x1b[1m\x1b[32mSimulating publish\x1b[0m of \x1b[0m\x1b[38;5;245m@fyflow/orchestration@0.11.0\x1b[0m with files:';
const dryRun = (root: string, files: string[]) => [
  '\x1b[0m\x1b[32mCheck\x1b[0m index.ts',
  'Checking for slow types in the public API...',
  HEADER,
  ...files.map((f) => `   ${root}/${f} (16.3KB)`),
  '\x1b[0m\x1b[1m\x1b[32mSuccess\x1b[0m Dry run complete',
].join('\n');

const LINUX_ROOT = 'file:///home/runner/work/fyflow-orchestration/fyflow-orchestration';
const WINDOWS_ROOT = 'file:///C:/Users/matij/Documents/dev/fyflow-orchestration';
const PUBLISHED = ['README.md', 'index.ts', 'src/scheduler/envelope-worker.ts'];

Deno.test('parses the file URLs out of a Linux dry run', () => {
  deepStrictEqual(parsePublishedFileUrls(dryRun(LINUX_ROOT, PUBLISHED)), [
    `${LINUX_ROOT}/README.md`, `${LINUX_ROOT}/index.ts`, `${LINUX_ROOT}/src/scheduler/envelope-worker.ts`,
  ]);
});

Deno.test('parses the file URLs out of a Windows dry run', () => {
  deepStrictEqual(parsePublishedFileUrls(dryRun(WINDOWS_ROOT, PUBLISHED)), [
    `${WINDOWS_ROOT}/README.md`, `${WINDOWS_ROOT}/index.ts`, `${WINDOWS_ROOT}/src/scheduler/envelope-worker.ts`,
  ]);
});

Deno.test('ignores everything before the file list, and a CRLF line ending', () => {
  const output = [
    '\x1b[0m\x1b[32mCheck\x1b[0m file:///home/runner/work/r/index.ts (9KB)',
    HEADER,
    '   file:///home/runner/work/r/README.md (1KB)\r',
  ].join('\n');
  deepStrictEqual(parsePublishedFileUrls(output), ['file:///home/runner/work/r/README.md']);
});

Deno.test('no header, no files', () => {
  deepStrictEqual(parsePublishedFileUrls('   file:///home/r/README.md (1KB)'), []);
});

Deno.test('stages a Linux dry run under a POSIX staging directory without losing a character', () => {
  const urls = PUBLISHED.map((f) => `${LINUX_ROOT}/${f}`);
  deepStrictEqual(stagingPlan(urls, `${LINUX_ROOT}/`, '/tmp/stage', posix), [
    { source: '/home/runner/work/fyflow-orchestration/fyflow-orchestration/README.md', target: '/tmp/stage/README.md' },
    { source: '/home/runner/work/fyflow-orchestration/fyflow-orchestration/index.ts', target: '/tmp/stage/index.ts' },
    { source: '/home/runner/work/fyflow-orchestration/fyflow-orchestration/src/scheduler/envelope-worker.ts', target: '/tmp/stage/src/scheduler/envelope-worker.ts' },
  ]);
});

Deno.test('stages a Windows dry run under a Windows staging directory', () => {
  const urls = PUBLISHED.map((f) => `${WINDOWS_ROOT}/${f}`);
  deepStrictEqual(stagingPlan(urls, `${WINDOWS_ROOT}/`, 'C:\\stage', windows), [
    { source: 'C:\\Users\\matij\\Documents\\dev\\fyflow-orchestration\\README.md', target: 'C:\\stage\\README.md' },
    { source: 'C:\\Users\\matij\\Documents\\dev\\fyflow-orchestration\\index.ts', target: 'C:\\stage\\index.ts' },
    { source: 'C:\\Users\\matij\\Documents\\dev\\fyflow-orchestration\\src\\scheduler\\envelope-worker.ts', target: 'C:\\stage\\src\\scheduler\\envelope-worker.ts' },
  ]);
});

Deno.test('a root given without its trailing slash stages the same', () => {
  deepStrictEqual(stagingPlan([`${LINUX_ROOT}/a/b.ts`], LINUX_ROOT, '/s', posix), [
    { source: '/home/runner/work/fyflow-orchestration/fyflow-orchestration/a/b.ts', target: '/s/a/b.ts' },
  ]);
});

Deno.test('a percent-encoded space decodes on both platforms', () => {
  strictEqual(posix.fromFileUrl('file:///home/a%20b/x.ts'), '/home/a b/x.ts');
  strictEqual(windows.fromFileUrl('file:///C:/a%20b/x.ts'), 'C:\\a b\\x.ts');
});

Deno.test('a Windows drive letter differing only in case is the same root', () => {
  strictEqual(windows.relative('c:\\repo', 'C:\\repo\\src\\a.ts'), 'src\\a.ts');
  strictEqual(posix.relative('/Repo', '/repo/a.ts'), '../repo/a.ts');
});

Deno.test('external imports: bare and prefixed specifiers, never relative ones, comments, import.meta or a variable', () => {
  const src = [
    "import { WorkerManager } from 'fyflow-scheduler';",
    "import type { X } from './types.ts';",
    "export * from '../driver/driver.ts';",
    "import engine from \"jsonata\";",
    "const m = await import('npm:left-pad');",
    'const u = import.meta.url;',
    'const w = await import(workerUrl);',
    "// import { Worker } from 'node:worker_threads';",
    "/* import x from 'jsr:@std/path'; */",
    'throw new Error(`edge from "${n.id}" is refused`);',
  ].join('\n');
  deepStrictEqual(externalImports(src), ['fyflow-scheduler', 'jsonata', 'npm:left-pad']);
});
