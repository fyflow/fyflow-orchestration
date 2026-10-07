/**
 * **Q272's provocation, checked in and runnable** — W132, P30, `doc/workflow.md` section 5 rule 7.
 *
 *   node test/provocations/q272.ts
 *   deno run --allow-read --allow-run test/provocations/q272.ts
 *
 * It runs `test/runner.ts` TWICE in the runtime it is itself run in: CLEAN, as `npm test` does, and
 * PROVOKED, with `--with test/provocations/throws-on-import.ts` — a suite that throws while it is being
 * imported. Every expected value is Q272's own sentence and P30's W132 row, never a run's output:
 *
 * | | the clean run | the provoked run |
 * |---|---|---|
 * | exit | 0 | **1** |
 * | `FAIL` lines | none | **exactly one**, and it NAMES `test/provocations/throws-on-import.ts` |
 * | cases run | N | **N** — every other suite still ran, and the unimported file adds no case |
 * | `ok` lines | N | **N** — and all of them passed |
 * | summary | `all passed` | `1 file(s) could not be imported`, `1 FAILURE(S)` |
 *
 * Rule 7's three requirements: **(a)** this file; **(b)** the input is asserted to have CHANGED — the
 * provocation must throw when imported here, and the provoked run must name it; **(c)** the full SET of
 * `FAIL` lines is compared exactly, not *some line failed* and not *the named line is among them*.
 *
 * Not a `*.test.ts`, so neither the runner's glob nor the browser bundle runs it. Exits 0 when every
 * clause holds, 1 otherwise, naming each clause that did not.
 */
import { spawnSync } from 'node:child_process';
import { ROOT } from '../harness.ts';

const g = globalThis as Record<string, any>;
const isDeno = typeof g.Deno !== 'undefined';
const PROVOCATION = 'test/provocations/throws-on-import.ts';
const RUNNER = `${ROOT}test/runner.ts`;

const problems: string[] = [];
const check = (cond: boolean, clause: string) => {
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${clause}`);
  if (!cond) problems.push(clause);
};

// The ENVIRONMENT, asserted (rule 8's harness row): node 16 fails long before a runner line.
const runtime = isDeno ? `deno ${g.Deno.version.deno}` : `node ${g.process.versions.node}`;
check(isDeno || Number(String(g.process.versions.node).split('.')[0]) >= 24, `the runtime is deno or node >= 24 (${runtime})`);

// (b) the input: the provocation THROWS when it is imported — otherwise the provoked run proves nothing.
let threw = '';
try {
  const p = ROOT + PROVOCATION;
  await import(/^[A-Za-z]:/.test(p) ? `file:///${p}` : `file://${p}`);
} catch (e) {
  threw = e instanceof Error ? e.name : typeof e;
}
check(threw !== '', `${PROVOCATION} throws when it is imported (${threw || 'it did not'})`);

/** The runner as `npm test` and `npm run test:deno` start it, plus `extra`. Deno spawns through its own API, so no `--allow-env`. */
function spawn(extra: string[]): { status: number | null; out: string } {
  if (isDeno) {
    const r = new g.Deno.Command(g.Deno.execPath(), { args: ['run', '--allow-read', RUNNER, ...extra], cwd: ROOT }).outputSync();
    const td = new TextDecoder();
    return { status: r.code, out: `${td.decode(r.stdout)}${td.decode(r.stderr)}` };
  }
  const r = spawnSync(g.process.execPath, [RUNNER, ...extra], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { status: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

function run(extra: string[]) {
  const { status, out } = spawn(extra);
  const cases = /(\d+) assertions, on /.exec(out);
  return {
    status,
    out,
    fails: out.split('\n').filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.trim()),
    oks: out.split('\n').filter((l) => /^\s+ok\s/.test(l)).length,
    cases: cases ? Number(cases[1]) : -1,
  };
}

const clean = run([]);
const provoked = run(['--with', PROVOCATION]);

check(clean.status === 0, `the clean run exits 0 (got ${clean.status})`);
check(clean.fails.length === 0, `the clean run prints no FAIL line (got ${clean.fails.length})`);
check(clean.cases > 0 && clean.oks === clean.cases, `the clean run reports its cases, every one ok (${clean.oks} ok of ${clean.cases})`);
check(/all passed/.test(clean.out), 'the clean run says all passed');

check(provoked.status === 1, `the provoked run exits 1 (got ${provoked.status})`);
// (c) the full SET of FAIL lines, exactly: one, and it names the file.
const expectedFail = `FAIL  ${PROVOCATION} could not be imported — SyntaxError: `;
check(provoked.fails.length === 1 && provoked.fails[0]!.startsWith(expectedFail),
  `the provoked run prints EXACTLY one FAIL line, naming ${PROVOCATION} and its error (got ${JSON.stringify(provoked.fails)})`);
check(provoked.cases === clean.cases, `the provoked run still runs every other suite: ${provoked.cases} cases against the clean run's ${clean.cases}`);
check(provoked.oks === clean.cases, `and every one of them passed: ${provoked.oks} ok against ${clean.cases}`);
// The WHOLE line: it claims no more than that (the conformity reader's finding 2 — a file can register a case
// and then throw, so "none of their cases ran" was false of the tree).
check(/\n {2}1 file\(s\) could not be imported\r?\n/.test(provoked.out), 'the provoked run says 1 file(s) could not be imported, and nothing more');
check(/\n {2}1 FAILURE\(S\)/.test(provoked.out) && !/all passed/.test(provoked.out), 'the provoked run counts 1 FAILURE(S) and does not say all passed');
check(provoked.out.includes(`${PROVOCATION} › could not be imported`), 'the failure list names the file too');

console.log(problems.length
  ? `\n  q272 provocation — ${problems.length} clause(s) did not hold, on ${runtime}\n`
  : `\n  q272 provocation — every clause held, on ${runtime}: one named FAIL, exit 1, ${clean.cases} cases run both ways\n`);
const exitCode = problems.length ? 1 : 0;
if (isDeno) g.Deno.exit(exitCode);
g.process.exit(exitCode);
