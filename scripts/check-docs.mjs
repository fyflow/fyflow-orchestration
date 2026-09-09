#!/usr/bin/env node
// Ladder L0/L1 — **every snippet in `AGENTS.md` is extracted, typechecked, and run.**
//
// [P3](../doc/plans/p3-a-consumer-reference-the-gate-keeps-true.md) exists because
// this repository's thirteen reader-passes have found the same defect eleven
// times: **a written claim nobody ran.** A hand-written API reference is that
// failure mode with a larger surface and no reader assigned to it.
//
// The sibling tried the weaker form and reported the result. Its
// `tests/suites/docs.ts` transcribes each published snippet into a test by hand,
// and its own header says why: *"instead of rotting silently the way
// `onCompleteDescendants()` and the benchmark efficiency metric both did."*
// Transcription is a copy kept in step by a person. **Extraction is not a copy**:
// the snippet in the document IS the code that runs, so a stale snippet is a
// failing gate rather than a lie.
//
//   node scripts/check-docs.mjs
//
// Exits 0 when every snippet typechecks and every `run` snippet executes.
// It reports; it does not fix.

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dev-dist', 'docs');
// `CHECK_DOCS_DOC` exists for `--self-test` below and for nothing else: the probes
// need to run this script against a deliberately broken copy of the reference.
const DOCS = [process.env.CHECK_DOCS_DOC || 'AGENTS.md'];
if (process.argv.includes('--self-test')) {
  const mod = process.env.CHECK_DOCS_SELFTEST ?? join(ROOT, 'scripts', 'check-docs-selftest.mjs');
  // `resolve`, not `join`: the default is already absolute and `join` would
  // concatenate it onto ROOT. **The override is what lets `check-wiring.mjs`'s `G1`
  // prove this dispatch ROUTES rather than that its text exists** — W38, where the
  // clause was declared as `S14` inside `check-source` and moved to its own entry
  // under a cost measurement; the idiom is `CHECK_SOURCE_SELFTEST`'s, which predates
  // it. `G2` reads the declaration on the line above and compares both names.
  const { selfTest } = await import(pathToFileURL(resolve(ROOT, mod)).href);
  process.exit(await selfTest(ROOT));
}

const failures = [];
const fail = (check, msg) => failures.push(`${check}: ${msg}`);

/**
 * **The bare specifier a consumer actually writes.** The published snippet says
 * `from 'fyflow-orchestration'`, which is what someone who installed the package
 * types; the extractor rewrites it to a relative path so the same text is also
 * runnable. Without this the reference would have to show an import no consumer
 * would ever write, which is where a reference starts being a different program
 * from the one it documents.
 *
 * `fyflow-scheduler` needs no rewriting — it resolves through `node_modules`
 * (ADR 0013 rule 3).
 */
const PKG = 'fyflow-orchestration';

/**
 * A block is `run` (executed), `check` (typechecked only — for a snippet whose
 * point is a type, or that would need a live scheduler), or **untagged**, which is
 * refused unless the line above it carries the marker. An unchecked snippet in a
 * reference is precisely what this script exists to prevent, so opting out costs a
 * line a reader can see.
 *
 * **`NEAR_FENCE` is why this is two patterns and not one.** W9's adequacy reader
 * found that ` ```typescript run `, ` ```TS run ` and three spaces of indentation
 * each made a block invisible to the extractor with the gate still green — a
 * one-character edit that silently deletes a snippet from the gate, while X1's
 * vacuity guard stayed satisfied by the other thirteen. So anything that LOOKS
 * like a TypeScript fence is matched, and one that is not exactly ` ```ts run ` or
 * ` ```ts check ` is a failure rather than a skip.
 */
const FENCE = /^```ts(?:[ \t]+(\w+))?[ \t]*$/;
const NEAR_FENCE = /^[ \t]*`{3,}[ \t]*(ts|typescript)\b/i;

/**
 * The escape hatch for a block that is deliberately not checked. It was a word
 * list (`not checked|illustration|prose|pseudo`) tested against the preceding
 * line, which the same reader tripped with an ordinary English sentence and with a
 * heading ending in the word "prose". An escape must be deliberate, so it is now
 * an explicit marker and nothing else.
 */
const OPT_OUT = /<!--\s*check-docs:\s*not checked\s*(?:—|--|-)\s*\S/;

function extract(docPath) {
  const text = readFileSync(join(ROOT, docPath), 'utf8');
  const lines = text.split(/\r?\n/);
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const m = FENCE.exec(lines[i]);
    if (!m) {
      // Anything that reads as a TypeScript fence but is not exactly ` ```ts run `
      // or ` ```ts check ` is refused, rather than skipped in silence.
      if (NEAR_FENCE.test(lines[i])) {
        fail('X1', `${docPath}:${i + 1} — \`${lines[i].trim()}\` is not an extractable fence. ` +
          'Write exactly ```ts run or ```ts check; a variant spelling silently removes the snippet ' +
          'from the gate');
      }
      continue;
    }
    const start = i;
    let end = i + 1;
    while (end < lines.length && lines[end].trimEnd() !== '```') end++;
    if (end >= lines.length) {
      fail('X1', `${docPath}:${start + 1} opens a \`\`\`ts fence that is never closed`);
      break;
    }
    const tag = m[1];
    const body = lines.slice(start + 1, end).join('\n');
    // The justification for an untagged block, if any: the preceding non-blank line.
    let prev = start - 1;
    while (prev >= 0 && lines[prev].trim() === '') prev--;
    blocks.push({ doc: docPath, line: start + 1, tag, body, prevLine: prev >= 0 ? lines[prev] : '' });
    i = end;
  }
  return blocks;
}

const all = DOCS.filter((d) => existsSync(join(ROOT, d))).flatMap(extract);
if (DOCS.some((d) => !existsSync(join(ROOT, d)))) {
  fail('X1', `${DOCS.filter((d) => !existsSync(join(ROOT, d))).join(', ')} does not exist`);
}
if (all.length === 0 && !failures.length) {
  // A check that finds nothing to check is the vacuous kind this repository has
  // shipped twice; say so rather than passing.
  fail('X1', 'no ```ts blocks were found — either the reference has none, or the fence syntax changed');
}

// X2 — an untagged block must carry the explicit opt-out marker on the line above it.
for (const b of all) {
  if (b.tag === 'run' || b.tag === 'check') continue;
  if (!OPT_OUT.test(b.prevLine)) {
    fail('X2', `${b.doc}:${b.line} is an untagged \`\`\`ts block. Tag it \`run\` or \`check\`, or put ` +
      '`<!-- check-docs: not checked — <reason> -->` on the line above. An unchecked snippet in a ' +
      'reference is what this check exists to prevent, so opting out is deliberate and visible');
  }
}

// X4a — a `run` snippet that asserts nothing proves only that it exits zero, which
// is the vacuous shape this repository has shipped twice. W9's adequacy reader
// deleted a snippet's assertions and inserted `process.exit(0)` before them, and
// both passed.
for (const b of all.filter((x) => x.tag === 'run')) {
  const body = b.body.replace(/\/\/.*$/gm, '');
  if (!/\bthrow\b/.test(body)) {
    fail('X4', `${b.doc}:${b.line} is a \`run\` snippet with no \`throw\`. Executing is not asserting: ` +
      'a snippet that cannot fail proves only that it exits zero. Assert what the surrounding prose ' +
      'claims, or tag it `check`');
  }
  if (/process\.exit\(/.test(body)) {
    fail('X4', `${b.doc}:${b.line} calls process.exit(), which makes the exit code independent of ` +
      'the assertions below it');
  }
  // **`if (false)` is `process.exit(0)` with better manners**, and it was the
  // third road into the same vacuity. W16's adequacy reader wrapped both `throw`s
  // of the new policy snippet in `if (false) { ... }`: the textual test above
  // still found a `throw`, the snippet still ran, and it asserted nothing.
  if (/if\s*\(\s*false\s*\)/.test(body)) {
    fail('X4', `${b.doc}:${b.line} contains \`if (false)\`, which reaches nothing. A run snippet's ` +
      'assertions have to be reachable, and this check counts `throw` textually');
  }
}

// X4b — the converse. A `check` snippet that throws is a `run` snippet that was
// downgraded, and the run/check split is otherwise on the honour system: the same
// reader inverted an assertion, re-tagged the block `check`, and the gate went green.
for (const b of all.filter((x) => x.tag === 'check')) {
  const body = b.body.replace(/\/\/.*$/gm, '');
  if (/\bthrow\b/.test(body)) {
    fail('X2', `${b.doc}:${b.line} is a \`check\` snippet containing \`throw\`. A snippet with an ` +
      'assertion belongs in `run`, where the assertion is executed; tagging it `check` hides a ' +
      'runtime failure behind a typecheck');
  }
}

// Write every tagged block out, together, so they typecheck as one program set.
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const written = [];
for (const [i, b] of all.entries()) {
  if (b.tag !== 'run' && b.tag !== 'check') continue;
  const rel = relative(OUT, join(ROOT, 'index.ts')).replace(/\\/g, '/');
  const code = b.body.replaceAll(`'${PKG}'`, `'${rel}'`).replaceAll(`"${PKG}"`, `'${rel}'`);
  const name = `${String(i).padStart(2, '0')}-line${b.line}.${b.tag}.ts`;
  writeFileSync(join(OUT, name), code + '\n');
  written.push({ ...b, name });
}

// X3 — they all typecheck, together, against the real `index.ts`.
if (written.length) {
  // **`tsconfig.docs.json`, not a pile of flags**, so the snippets are checked
  // under the same configuration the rest of this repository compiles with.
  //
  // Writing the flags by hand got this wrong on the first try: they pulled the
  // **DOM** lib into scope, and a real `FyflowScheduler` is not assignable to
  // `SchedulerLike` when it is — see [Q71](../doc/open-questions.md), which this
  // check found and does not cover.
  // The compiler is invoked through `process.execPath` and TypeScript's own entry
  // rather than through `npx`, which on Windows is a `.cmd` shim that `spawnSync`
  // reports as a non-zero exit with no output — a failure indistinguishable from a
  // real one, which is the shape this repository keeps finding.
  const tsc = spawnSync(
    process.execPath,
    [join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', join(ROOT, 'tsconfig.docs.json')],
    { cwd: ROOT, encoding: 'utf8' },
  );
  if (tsc.status !== 0) {
    const out = `${tsc.stdout ?? ''}${tsc.stderr ?? ''}`.trim();
    for (const line of out.split('\n').filter((l) => l.includes('error TS')).slice(0, 12)) {
      const m = /docs[\\/](\d+)-line(\d+)\./.exec(line);
      fail('X3', m ? `AGENTS.md:${m[2]} — ${line.split('): ').slice(1).join('): ') || line}` : line);
    }
    if (!out.includes('error TS')) fail('X3', `tsc failed: ${out.slice(0, 300)}`);
  }
}

// X4 — every `run` snippet executes, and a non-zero exit is the snippet's failure.
for (const w of written.filter((x) => x.tag === 'run')) {
  const r = spawnSync(process.execPath, [join(OUT, w.name)], { cwd: ROOT, encoding: 'utf8', timeout: 30_000 });
  if (r.status !== 0) {
    const err = `${r.stderr ?? ''}`.trim().split('\n').slice(0, 4).join(' | ');
    fail('X4', `AGENTS.md:${w.line} — the snippet does not run: ${err || `exit ${r.status}`}`);
  }
}

// X5 — the same snippets under the lib set a BROWSER-targeting consumer compiles
// with. **Reported, never failed**, because the one snippet that breaks is
// [Q71](../doc/open-questions.md) and this item is not permitted to fix it.
//
// Its value is the number. W9 shipped Q71 as a rhetorical caveat — *"if your
// tsconfig includes the DOM lib"* — without measuring how much of the reference it
// costs. That is the shape of defect this whole script exists to refuse, so the
// caveat is now pinned at a count that moves if it gets worse.
let domFailing = 'not run';
if (written.length) {
  const domCfg = join(OUT, 'tsconfig.dom.json');
  writeFileSync(domCfg, JSON.stringify({
    extends: relative(OUT, join(ROOT, 'tsconfig.json')).replace(/\\/g, '/'),
    compilerOptions: { lib: ['ES2022', 'DOM', 'DOM.Iterable'], types: ['node'], noEmit: true },
    include: ['*.ts'],
  }));
  const dom = spawnSync(
    process.execPath,
    [join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', domCfg],
    { cwd: ROOT, encoding: 'utf8' },
  );
  const hit = new Set(
    `${dom.stdout ?? ''}`.split('\n')
      .filter((l) => l.includes('error TS'))
      .map((l) => /(\d+)-line(\d+)\./.exec(l)?.[2])
      .filter(Boolean),
  );
  domFailing = `${hit.size} of ${written.length} (${[...hit].map((l) => `AGENTS.md:${l}`).join(', ') || 'none'})`;
  // Q71 is one snippet. If it ever becomes more, that is a regression nothing else sees.
  if (hit.size > 1) {
    fail('X5', `${hit.size} snippets fail under the DOM lib, and Q71 accounts for one. ` +
      `Newly failing: ${[...hit].map((l) => `AGENTS.md:${l}`).join(', ')}`);
  }
}

// X4c — a floor on how much of the reference actually executes. W16's adequacy
// reader **deleted an entire `run` snippet** and the gate stayed green: the count
// is printed and nothing reads it, which is the same shape as `check-policies`'
// own `names.length >= 2` and is here for the same reason. The floor is a
// ratchet, not a target — raise it when the reference gains a snippet, never
// lower it to make a deletion pass.
//
// **13 -> 14 by W18**, which added section 9's `parseTaskId` snippet. Raising
// it is not optional bookkeeping: at 13 the self-test probe *"a whole `run` snippet
// deleted"* went GREEN, because 14 - 1 clears a floor of 13. **A ratchet left
// un-raised stops being a ratchet on the first addition**, and the probe that
// exists to notice a deletion is the thing that reports it — which is rule 7 (a)
// working exactly as written, one item after the floor was built.
//
// **14 -> 15 by [W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)**,
// which added section 5's *what a join carries downstream* snippet — a `run` rather
// than a `check`, because *"a claim a consumer writes code from belongs in an
// assertion"* (P3's retro) and *what the join hands your next node* is that kind of
// claim. **This is [Q102](../doc/open-questions.md)'s obligation firing for the
// third recorded time**, and the item that tripped it declared four `scripts/**`
// files in advance and not this one: the obligation is created by the CONTENT of
// the change — adding a runnable snippet — rather than by the file set, which is
// the half of Q102's row that an `Owns` block cannot anticipate.
// **Raised 15 -> 16 by [W41](../doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md)**,
// which added section 3's `needs` snippet. **Q102's obligation firing for the fourth
// recorded time, and by the same mechanism as the third**: W41 declared its `Owns`
// from P12's index row, that row names `scripts/check-spec.mjs` and not this file,
// and the obligation arrived from the CONTENT of the change. Taken as a declared
// late exception.
const RUN_FLOOR = 16;
{
  // **Only when the document parsed.** A count over a reference whose fences are
  // malformed or untagged is true of the parse and says nothing about coverage —
  // the same reason `check-policies.mjs` does not run P1 on a half it could not
  // read. Without this scope the floor fired alongside five existing probes and
  // turned each of them into a declared cascade, which is rule 7 (c) reporting a
  // check that does not discriminate rather than a probe that is wrong.
  const parsed = !failures.some((f) => f.startsWith('X1:') || f.startsWith('X2:'));
  const runs = all.filter((x) => x.tag === 'run').length;
  if (!parsed) {
    // nothing: X1/X2 already say what is wrong, and more precisely
  } else
  if (runs < RUN_FLOOR) {
    fail('X4', `${runs} \`run\` snippets, and the floor is ${RUN_FLOOR}. A snippet was deleted or ` +
      'retagged; the count is the only thing that notices, because every other check here is ' +
      'about the snippets that ARE there');
  }
}

const checks = [
  'X1 the reference exists and its fences parse',
  'X2 every ```ts block is tagged run or check, or opts out explicitly',
  'X3 every tagged snippet typechecks against index.ts',
  'X4 every `run` snippet executes, and asserts something',
  'X5 how much of the reference the DOM lib costs (Q71) — reported',
];
const runCount = written.filter((x) => x.tag === 'run').length;
console.log(`docs check — ${all.length} snippet(s): ${runCount} run, ` +
  `${written.length - runCount} check, ${all.length - written.length} untagged`);
console.log(`             under the DOM lib, failing: ${domFailing}\n`);
for (const c of checks) {
  const bad = failures.filter((f) => f.startsWith(c.slice(0, 2) + ':'));
  console.log(`  ${bad.length ? 'FAIL' : 'ok  '}  ${c}${bad.length ? ` (${bad.length})` : ''}`);
}
if (failures.length) {
  console.log('\n' + failures.map((f) => '  ' + f).join('\n'));
  console.log(`\n${failures.length} failure(s).`);
  process.exit(1);
}
console.log('\nAll checks passed.');
