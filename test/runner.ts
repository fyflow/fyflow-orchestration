/**
 * The test runner. Repository tooling (`RT-R7`), and it runs unchanged on Node 24
 * and Deno because both execute TypeScript directly.
 *
 *   node test/runner.ts              deno run --allow-read test/runner.ts
 *   node test/runner.ts definition   deno run --allow-read test/runner.ts driver
 *
 * **Suites are discovered by globbing, never listed here.** A later work item adds
 * a `*.test.ts` file and it runs; it does not edit this file. That is what makes
 * "W3 owns the toolchain" a statement about who created it rather than a gate
 * every later item queues at
 * (doc/work-items/w3-the-driver-and-the-validator.md, *The toolchain is shared*).
 */
import { collected, isDir, listDir, ROOT } from './harness.ts';

const args = (typeof (globalThis as Record<string, unknown>).Deno !== 'undefined'
  ? (globalThis as unknown as { Deno: { args: string[] } }).Deno.args
  : (globalThis as unknown as { process: { argv: string[] } }).process.argv.slice(2)) ?? [];
const filter = args[0];

const TEST_DIR = `${ROOT}test`;

async function discover(dir: string): Promise<string[]> {
  const found: string[] = [];
  for (const name of await listDir(dir)) {
    const p = `${dir}/${name}`;
    if (await isDir(p)) found.push(...(await discover(p)));
    else if (name.endsWith('.test.ts')) found.push(p);
  }
  return found;
}

const files = (await discover(TEST_DIR)).filter((p) => !filter || p.includes(filter));
if (files.length === 0) {
  console.error(filter ? `no suites match "${filter}"` : 'no *.test.ts files found');
  exit(1);
}
for (const f of files) await import(pathToUrl(f));

let passed = 0;
const failures: string[] = [];

for (const { suite, cases } of collected()) {
  console.log(`\n  ${suite}`);
  for (const c of cases) {
    try {
      await c.fn();
      passed++;
      console.log(`    ok    ${c.name}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      failures.push(`${suite} › ${c.name}\n    ${msg.split('\n').join('\n    ')}`);
      console.log(`    FAIL  ${c.name}`);
    }
  }
}

const runtime = typeof (globalThis as Record<string, unknown>).Deno !== 'undefined'
  ? `deno ${(globalThis as unknown as { Deno: { version: { deno: string } } }).Deno.version.deno}`
  : `node ${(globalThis as unknown as { process: { versions: { node: string } } }).process.versions.node}`;

console.log(`\n  ${files.length} file(s), ${passed + failures.length} assertions, on ${runtime}`);
if (failures.length) {
  console.log(`\n${failures.map((f) => '  ' + f).join('\n\n')}`);
  console.log(`\n  ${failures.length} FAILURE(S)\n`);
  exit(1);
}
console.log('  all passed\n');

function pathToUrl(p: string): string {
  return /^[A-Za-z]:/.test(p) ? `file:///${p.replace(/\\/g, '/')}` : `file://${p}`;
}

function exit(code: number): never {
  const g = globalThis as Record<string, any>;
  if (g.Deno) g.Deno.exit(code);
  g.process.exit(code);
  throw new Error('unreachable');
}
