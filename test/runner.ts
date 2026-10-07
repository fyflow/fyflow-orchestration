/**
 * The test runner. Repository tooling (`RT-R7`), and it runs unchanged on Node 24
 * and Deno because both execute TypeScript directly.
 *
 *   node test/runner.ts              deno run --allow-read test/runner.ts
 *   node test/runner.ts definition   deno run --allow-read test/runner.ts driver
 *   node test/runner.ts --with test/provocations/throws-on-import.ts
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
/** `--with <path>` adds a suite file the glob does not reach (W132: Q272's provocation); the first other argument filters. */
const withFiles: string[] = [];
let filter: string | undefined;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--with') {
    const p = args[++i];
    if (!p) {
      console.error('--with needs a path');
      exit(1);
    }
    withFiles.push(/^([A-Za-z]:|\/)/.test(p) ? p : `${ROOT}${p}`);
  } else if (filter === undefined) filter = args[i];
}

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

// `--with` files FIRST, so a provocation that fails to import has every globbed suite still to load after it.
const files = [...withFiles, ...(await discover(TEST_DIR)).filter((p) => !filter || p.includes(filter))];
if (files.length === 0) {
  console.error(filter ? `no suites match "${filter}"` : 'no *.test.ts files found');
  exit(1);
}

/**
 * **A suite the runner cannot import is ONE named `FAIL`, and every other suite still runs** — W132, Q272.
 * Before it, one module throwing while it loaded (a fixture read at module scope, an import that does not
 * resolve) ended the run with a stack trace, ZERO `FAIL` lines, and no other suite run. Each import is tried
 * on its own; a failure is reported against its FILE and exits 1. The file is not a case, so it is not in the
 * case count — but a case it REGISTERED before it threw is, and still runs. Whatever was thrown is described
 * by `describe`, which cannot itself throw (W132's conformity reader: `Object.create(null)` escaped a bare
 * `String(e)` here and restored the crash). Provoked by `test/provocations/q272.ts`.
 */
const unimported: string[] = [];
for (const f of files) {
  try {
    await import(pathToUrl(f));
  } catch (e) {
    const msg = describe(e, true);
    unimported.push(`${relPath(f)} › could not be imported\n    ${msg.split('\n').join('\n    ')}`);
    console.log(`\n    FAIL  ${relPath(f)} could not be imported — ${msg.split('\n')[0]}`);
  }
}

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
      const msg = describe(e, false);
      failures.push(`${suite} › ${c.name}\n    ${msg.split('\n').join('\n    ')}`);
      console.log(`    FAIL  ${c.name}`);
    }
  }
}

const runtime = typeof (globalThis as Record<string, unknown>).Deno !== 'undefined'
  ? `deno ${(globalThis as unknown as { Deno: { version: { deno: string } } }).Deno.version.deno}`
  : `node ${(globalThis as unknown as { process: { versions: { node: string } } }).process.versions.node}`;

console.log(`\n  ${files.length} file(s), ${passed + failures.length} assertions, on ${runtime}`);
if (unimported.length) console.log(`  ${unimported.length} file(s) could not be imported`);
const all = [...unimported, ...failures];
if (all.length) {
  console.log(`\n${all.map((f) => '  ' + f).join('\n\n')}`);
  console.log(`\n  ${all.length} FAILURE(S)\n`);
  exit(1);
}
console.log('  all passed\n');

/** What was thrown, as text — and never a second throw from inside a `catch`. */
function describe(e: unknown, withName: boolean): string {
  try {
    return e instanceof Error ? (withName ? `${e.name}: ${e.message}` : e.message) : String(e);
  } catch {
    return `a thrown value with no string form (${Object.prototype.toString.call(e)})`;
  }
}

/** A path as the repository names it — what a `FAIL` line for an unimported file shows. */
function relPath(p: string): string {
  return p.startsWith(ROOT) ? p.slice(ROOT.length) : p;
}

function pathToUrl(p: string): string {
  return /^[A-Za-z]:/.test(p) ? `file:///${p.replace(/\\/g, '/')}` : `file://${p}`;
}

function exit(code: number): never {
  const g = globalThis as Record<string, any>;
  if (g.Deno) g.Deno.exit(code);
  g.process.exit(code);
  throw new Error('unreachable');
}
