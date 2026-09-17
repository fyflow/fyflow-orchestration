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
// `CHECK_DOCS_README` is `CHECK_DOCS_DOC`'s twin, for `X8` and for the same reason: a probe stages
// a mutated README and points the check at it, so the check reads its SUBJECT rather than a path —
// obligation (e)'s second question, which `X6` learned by reading `AGENTS.md` by name. W69.
const README = process.env.CHECK_DOCS_README || 'README.md';
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
  // **The SUB-PATH, rewritten to its published entry — W59.** `fyflow-orchestration/scheduler` is
  // what a consumer writes for the bootstrap helper (both manifests export it), and it resolves to
  // `src/scheduler/index.ts`. Neither pattern can match the other's text — the root form ends in a
  // quote where the sub-path form continues with a slash — so the order here is not load-bearing.
  const relSub = relative(OUT, join(ROOT, 'src', 'scheduler', 'index.ts')).replace(/\\/g, '/');
  // **The THIRD rewrite — W62.** `fyflow-orchestration/jsonata` is the adapter's sub-path (ADR 0052)
  // and resolves to `src/jsonata/index.ts`; W59's exceptions table predicted this edit for the item
  // that adds a sub-path. The three patterns are disjoint by their endings, so order is not load-bearing.
  const relJsonata = relative(OUT, join(ROOT, 'src', 'jsonata', 'index.ts')).replace(/\\/g, '/');
  const code = b.body
    .replaceAll(`'${PKG}/scheduler'`, `'${relSub}'`).replaceAll(`"${PKG}/scheduler"`, `'${relSub}'`)
    .replaceAll(`'${PKG}/jsonata'`, `'${relJsonata}'`).replaceAll(`"${PKG}/jsonata"`, `'${relJsonata}'`)
    .replaceAll(`'${PKG}'`, `'${rel}'`).replaceAll(`"${PKG}"`, `'${rel}'`);
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
// with. **Reported, and since W57 FAILED at any count above zero.** It was written
// *reported, never failed*, because the one snippet that broke under the DOM lib was
// [Q71](../doc/open-questions.md) and W9 was not permitted to fix it; so it carried an
// allowance of exactly one, pinned so the caveat could not get worse unnoticed.
//
// **[W57](../doc/work-items/w57-the-scheduler-is-a-dependency.md) closed Q71** — a real
// `FyflowScheduler` satisfies `SchedulerLike` under the DOM lib — and moved
// `tsconfig.docs.json` itself onto `["ES2022", "DOM"]`, so `X3` now typechecks every
// snippet under the consumer's default. That leaves this clause as the second observer
// over a slightly wider lib set (`DOM.Iterable`), and its allowance is ZERO: a snippet
// failing here and not at `X3` is a regression nothing else sees, and one failing at
// both is `X3`'s cascade, which the self-test's `X3` probe declares.
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
  // Zero since W57 — Q71 no longer accounts for one, and nothing else may.
  if (hit.size > 0) {
    fail('X5', `${hit.size} snippet(s) fail under the DOM lib, and since W57 closed Q71 none may. ` +
      `Failing: ${[...hit].map((l) => `AGENTS.md:${l}`).join(', ')}`);
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
// **16 -> 17 by [W42](../doc/work-items/w42-what-a-decision-sees.md)**, which added
// section 4's edge-level `needs` snippet. *(This block skipped that raise until W54's
// conformity reader ran `git log -S"RUN_FLOOR = 17"` and found `5557e01`, so the
// running count below was one short of the truth for three plans — a history that
// narrates itself and misses an entry is exactly what `doc/workflow.md` section 1 rule
// 5's provenance clause is about.)*
// **Raised 17 -> 18 by [W54](../doc/work-items/w54-what-a-result-may-be-and-what-bounding-it-would-cost.md)**,
// which added section 10's `OR-R11` snippet — a worker returning a class instance, and
// what the driver logs instead. **Q102's obligation firing for the SIXTH recorded time
// and by the same mechanism as the third, fourth and fifth**: W54 declared its `Owns`
// from P15's index row, that row names `spec/outcome-record.md` and not this file, and
// the obligation arrived from the CONTENT of the change. Taken as a declared late
// exception. *(P15 does not PREDICT the `AGENTS.md` half — it lists that file among
// three no item pre-declares and makes one narrower prediction, about `spec/README.md`
// alone. Naming a file is not predicting it; this item answers that test `AGENTS.md`
// YES, which is a data point for P15's retro rather than a confirmation.)*
// **Raised 18 -> 19 by [W57](../doc/work-items/w57-the-scheduler-is-a-dependency.md)**,
// which made section 12's wiring snippet a `run` one: a real `FyflowScheduler` passed by
// name with no cast (Q71 closed) and no `createTask` (the default is the driver's), run to
// `completed`. **Q102's obligation firing for the SEVENTH recorded time, and for once from a
// DECLARED exception rather than a late one**: W57's `Owns` was written from P16's index
// row, that row names four `scripts/**` files and not this one, and the item declared this
// file at its start because `X5`'s Q71 allowance was already in its path.
// **Raised 19 -> 20 by [W59](../doc/work-items/w59-what-a-node-type-is.md)**, which added section
// 13's `run` snippet — a node type as a registry entry, a typed flow validated, and the three
// refusals `FD-V32`-`FD-V34` each thrown on. Declared at the item's start, on W57's precedent: the
// section's `check` snippet imports the sub-path and the rewrite above was already in its path.
// **Raised 20 -> 21 by [W61](../doc/work-items/w61-what-a-transform-is.md)**, which added section
// 13's second `run` snippet — a language adapter's two halves, a transformed flow validated, the
// three refusals `FD-V35`-`FD-V37` each thrown on, and the envelope worker evaluating the transform
// and failing a task with `TransformFailed`. Declared in the item's exceptions table before the
// snippet was written, on Q102's ratchet.
// **Raised 21 -> 22 by [W62](../doc/work-items/w62-the-jsonata-adapter.md)**, which added section
// 14's `run` snippet — the REAL JSONata adapter registered by name, a transformed flow validated,
// `FD-V35` and `FD-V36` thrown on with the engine's own `S0203` and position, and the envelope
// worker reducing a join's collection, binding `$settings`, and failing a task on an unbound name.
// Declared in the item's exceptions table before the snippet was written, from W59's and W61's
// tables (Q102's ratchet, the ninth recorded raise).
// **Raised 22 -> 23 by [W66](../doc/work-items/w66-the-runtime-entry.md)**, whose section 12 leads
// with a `createRuntime` run snippet — Q102's ratchet, the tenth recorded raise.
// 23 until W69, which added the getting-started snippet to section 2 and raised the floor to the
// count it ships (Q102's ratchet: the item that adds a snippet raises it); 24 until W70, which added
// the routing snippet to section 5 and the custom-group snippet to section 12 — 26.
const RUN_FLOOR = 26;
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

// ---------------------------------------------------------------------------
// X6 — the cost figures AGENTS.md quotes are `spec/flow-definition.md`'s
//
// **Obligation (e)'s third shape, at three copies** — W46's adequacy reader.
// `spec/flow-definition.md` section 3's cost table, `AGENTS.md`'s cost paragraph and
// `doc/decisions/0040-*.md` all carried the same five figures, and **nothing compared
// any two**: editing the spec's `613.6 ms` to `6.1 ms`, or AGENTS.md's to `61.3`, cost
// **zero** across all four checks while destroying the `71x` claim in its own table.
//
// **The ADR's copy is now marked HISTORICAL and is deliberately not compared** — it is
// the record of what that decision was made on. What must agree is the normative
// document and the consumer reference, because both are read as current.
//
// **BOTH WAYS, and by SET rather than by count**: a figure in one and not the other is
// a failure in either direction, which is `JP-R9`'s *compare the two halves rather
// than copy one of them* over two files.
{
  const SPEC = join(ROOT, 'spec', 'flow-definition.md');
  // **The document the check is POINTED AT, not a hard-coded path** —
  // `doc/workflow.md` section 5 rule 8 obligation (e)'s second question, and this
  // check's own self-test found it: `X6` read `AGENTS.md` directly, so all three of
  // its probes exited 0 while the harness had written its mutated copy elsewhere and
  // pointed the check at that. *A check that reads a path instead of its subject is
  // not testing what ships* — W36's `D3` and W35's `test:l6` in a third shape, caught
  // here by the substitution mechanism that exists for exactly this.
  const AG = join(ROOT, DOCS[0]);
  const msIn = (text, from, to) => {
    const a = text.indexOf(from);
    const b = a < 0 ? -1 : text.indexOf(to, a);
    if (a < 0 || b < 0) return null;
    return [...new Set(text.slice(a, b).match(/\d+\.\d+ ms/g) ?? [])].sort();
  };
  /**
   * The LAST figure on each table row — the spec's table is
   * `| label | arity 100 | arity 1000 |` and `AGENTS.md` quotes the arity-1000
   * column, so the two halves are only comparable one column at a time. **The first
   * version filtered by magnitude (`>= 5`) and the check caught it**: the arity-100
   * large figure is 8.1 ms, which passes any such threshold and is in neither column
   * AGENTS.md quotes. A filter by VALUE cannot separate two columns; a filter by
   * POSITION can.
   */
  const lastPerRow = (text, from, to) => {
    const a = text.indexOf(from);
    const b = a < 0 ? -1 : text.indexOf(to, a);
    if (a < 0 || b < 0) return null;
    const out = [];
    for (const line of text.slice(a, b).split(/\r?\n/)) {
      if (!line.includes('|')) continue;
      const all = line.match(/\d+\.\d+ ms/g);
      if (all) out.push(all[all.length - 1]);
    }
    return out.length ? [...new Set(out)].sort() : null;
  };
  if (!existsSync(SPEC) || !existsSync(AG)) {
    fail('X6', 'spec/flow-definition.md or AGENTS.md is missing, so the cost figures cannot be compared');
  } else {
    // The spec's ARITY-1000 column, which is the one AGENTS.md quotes: the table rows
    // between the header and the sentence that follows them.
    const specTable = lastPerRow(readFileSync(SPEC, 'utf8'),
      '| what the branch entry declares | arity 100 | arity 1000 |', '> **71x,');
    const agents = msIn(readFileSync(AG, 'utf8'),
      '**And inside a `map`, what it costs is what you point it at.**', 'The mechanism makes one copy');
    if (specTable === null) {
      fail('X6', 'spec/flow-definition.md section 3`s cost table is not where X6 looks for it');
    } else if (agents === null) {
      fail('X6', 'AGENTS.md`s cost paragraph is not where X6 looks for it');
    } else {
      // AGENTS.md quotes the arity-1000 figures only, so the spec side is filtered to
      // those — the arity-100 column is the spec's alone and is not a disagreement.
      const spec1000 = specTable;
      const missing = agents.filter((x) => !spec1000.includes(x));
      const extra = spec1000.filter((x) => !agents.includes(x));
      if (missing.length) {
        fail('X6', `AGENTS.md quotes ${missing.join(', ')}, which spec/flow-definition.md ` +
          `section 3's table does not — it has ${spec1000.join(', ')}`);
      }
      if (extra.length) {
        fail('X6', `spec/flow-definition.md section 3 states ${extra.join(', ')}, which AGENTS.md ` +
          `does not quote — it has ${agents.join(', ')}`);
      }
      if (!missing.length && !extra.length) {
        console.log(`note: X6 compared ${spec1000.length} cost figures between ` +
          'spec/flow-definition.md section 3 and AGENTS.md, both ways — three documents carried ' +
          'them and nothing compared any two.');
      }
    }
  }
}

// X8 — every ```ts fence in README.md IS the EXECUTED AGENTS.md snippet its section NAMES
//
// **Copies of EXECUTED programs, held equal** — W69 for one snippet, W70 for every one, on X6's
// shape. `AGENTS.md`'s `run` snippets are extracted and executed by this check (X3, X4); `README.md`
// is what a consumer reads on the registry page (`package.json` ships it) and NOTHING executes it —
// P3's *rot is what the gate prevents*. So each README fence is compared BYTE FOR BYTE to a snippet
// this check RAN, and a fence that differs is a failure naming the first line at which it differs.
//
// **The pairing is DECLARED, and it is a PAIRING rather than a MEMBERSHIP** — W69's and W70's
// adequacy readers independently, and W70's conformity reader from the other end. Until they read
// it the comparison was `agBodies.includes(body)`, equality against ANY executed snippet: README's
// two sections could carry the SAME program, or each other's, and this check printed `ok` beside a
// sentence naming one. Each entry names the README heading AND the AGENTS.md heading whose snippet
// it copies, and the AGENTS side must carry EXACTLY ONE `run` fence under that heading — a pairing
// that picks silently once a second fence appears is the same defect one layer along.
//
// **Both ways, and EVERY fence.** A listed heading with no fence, a listed heading with MORE THAN
// ONE, a fence under a heading the list does not name, and a fence ABOVE the first heading are each
// a failure. The last is there because sections are cut AT headings, so the README's opening — the
// first thing a registry-page visitor reads — sat in no section and was held by nothing. A NEAR
// spelling is a failure too, for `X1`'s reason one document across: ```typescript would otherwise
// skip in silence, and `X1`'s own pass reads `DOCS` and never the README.
//
// `README_SNIPPET_FLOOR` is [Q102](../doc/open-questions.md)'s shape, declared as `RUN_FLOOR` is.
// The list is a literal — [Q217](../doc/open-questions.md) — so a README section and its entry here
// are two edits in ONE diff, and W69's adequacy reader measured exactly that diff green at
// `check:docs` AND `check:markdown`. The floor is what makes the third edit visible. The README is
// read through `CHECK_DOCS_README`, as AGENTS.md is through `CHECK_DOCS_DOC`, for the reason X6's
// own header records.
const README_SNIPPETS = [
  { readme: 'Getting started', agents: '2. Getting started — a flow and its runtime from two documents' },
  { readme: 'A flow that decides', agents: 'The same on the RUNTIME — a decision, a fan-out and a join on real workers' },
];
const README_SNIPPET_FLOOR = 2;
/** The README's text above its first `## ` heading, which is a section for X8's purposes. */
const README_OPENING = '(the opening, above the first ## heading)';
{
  let rmText = null;
  try { rmText = readFileSync(join(ROOT, README), 'utf8'); } catch { /* reported below */ }
  // The floor first, because it is a claim about this list and holds whether or not the README reads.
  if (README_SNIPPETS.length < README_SNIPPET_FLOOR) {
    fail('X8', `X8 pairs ${README_SNIPPETS.length} README snippet(s) and README_SNIPPET_FLOOR is ${README_SNIPPET_FLOOR} — ` +
      'a README section and its entry in README_SNIPPETS are two edits in one diff, and this floor is the third');
  }
  if (rmText === null) {
    fail('X8', `${README} cannot be read, so its snippets have nothing to be compared to`);
  } else {
    const agText = readFileSync(join(ROOT, DOCS[0]), 'utf8');
    // **AGENTS.md's `run` bodies, each under the heading NEAREST ABOVE IT** — at any level, because
    // the snippet a README section names may sit under a `###` inside a numbered section, and that
    // heading is what a human writing the pair above would name.
    const agLines = agText.split('\n');
    const agUnder = new Map();
    let agHead = '(above the first heading)';
    for (let i = 0; i < agLines.length; i++) {
      const h = /^#{1,6} (.+)$/.exec(agLines[i]);
      if (h) { agHead = h[1].trim(); continue; }
      if (agLines[i] === '```ts run') {
        let j = i + 1;
        while (j < agLines.length && agLines[j] !== '```') j++;
        if (!agUnder.has(agHead)) agUnder.set(agHead, []);
        agUnder.get(agHead).push(agLines.slice(i + 1, j).join('\n') + '\n');
        i = j;
      }
    }
    const agCount = [...agUnder.values()].reduce((n, xs) => n + xs.length, 0);
    // README sections: the opening, then each `## ` heading and the text up to the next one.
    const heads = [...rmText.matchAll(/^## (.+)$/gm)];
    const sections = [{ title: README_OPENING, text: rmText.slice(0, heads.length ? heads[0].index : rmText.length) }];
    heads.forEach((h, i) => sections.push({
      title: h[1].trim(),
      text: rmText.slice(h.index, i + 1 < heads.length ? heads[i + 1].index : rmText.length),
    }));
    // EVERY fence, not the first: a second one under a listed heading was held by nothing.
    const fencesIn = (text) => [...text.matchAll(/^```ts\n([\s\S]*?)^```$/gm)].map((m) => m[1]);
    const firstDiff = (mine, theirs) => {
      const a = mine.split('\n'), b = theirs.split('\n');
      let i = 0;
      while (i < a.length && i < b.length && a[i] === b[i]) i++;
      return { line: i, mine: a[i] ?? '<end>', theirs: b[i] ?? '<end>' };
    };
    const listed = new Set(README_SNIPPETS.map((p) => p.readme));
    let compared = 0;
    // (i) every listed heading carries EXACTLY ONE fence, and it is the snippet the pair NAMES.
    for (const pair of README_SNIPPETS) {
      const s = sections.find((x) => x.title === pair.readme);
      if (!s) { fail('X8', `${README} has no "## ${pair.readme}" heading (X8's README_SNIPPETS names it)`); continue; }
      const bodies = fencesIn(s.text);
      if (bodies.length === 0) { fail('X8', `${README} has no \`\`\`ts fence under its "## ${pair.readme}" heading`); continue; }
      if (bodies.length > 1) {
        fail('X8', `${README} carries ${bodies.length} \`\`\`ts fences under "## ${pair.readme}" and X8 pairs it with ONE — ` +
          `every fence under a listed heading is compared, so give the second its own heading and its own entry`);
        continue;
      }
      const theirs = agUnder.get(pair.agents);
      if (!theirs || theirs.length !== 1) {
        fail('X8', `X8 pairs "## ${pair.readme}" with ${DOCS[0]}'s "${pair.agents}", which carries ` +
          `${theirs ? theirs.length : 0} \`\`\`ts run fences and must carry exactly one`);
        continue;
      }
      if (bodies[0] !== theirs[0]) {
        const d = firstDiff(bodies[0], theirs[0]);
        fail('X8', `the snippet under "## ${pair.readme}" in ${README} is not, byte for byte, the \`\`\`ts run snippet under ` +
          `"${pair.agents}" in ${DOCS[0]} — they first differ at snippet line ${d.line + 1}: ` +
          `${JSON.stringify(d.mine.slice(0, 70))} against ${JSON.stringify(d.theirs.slice(0, 70))}`);
      } else compared++;
    }
    // (ii) no ```ts fence anywhere else in the README — including above its first heading.
    for (const s of sections) {
      if (listed.has(s.title)) continue;
      for (const _ of fencesIn(s.text)) {
        fail('X8', `${README} carries a \`\`\`ts fence under "${s.title}", which X8's README_SNIPPETS does not name — ` +
          'list it (it must then be an executed AGENTS.md snippet) rather than leaving a README example nothing holds');
      }
    }
    // (iii) and no NEAR spelling anywhere, which (ii) cannot see because it compares ```ts exactly.
    rmText.split('\n').forEach((line, i) => {
      if (NEAR_FENCE.test(line) && line.trim() !== '```ts') {
        fail('X8', `${README}:${i + 1} opens a fence as ${JSON.stringify(line.trim())}, which X8 does not compare — ` +
          'spell it ```ts under a listed heading, or it is a README example nothing holds (X1\'s reason, one document across)');
      }
    });
    if (compared === README_SNIPPETS.length) {
      console.log(`note: X8 compared ${compared} README snippet(s) — ` +
        `${README_SNIPPETS.map((p) => `"${p.readme}" to "${p.agents}"`).join(', ')} — ` +
        `byte for byte, against ${DOCS[0]}'s ${agCount} \`\`\`ts run snippets, both ways.`);
    }
  }
}

// X7 — the refusal count AGENTS.md states is `spec/flow-definition.md` section 5's row count
//
// **Obligation (e)'s third shape, one count** — W59's conformity reader found this sentence
// stale twelve lines below the table W59 rewrote, and W65's rule 8 set (`d4`) measured that
// moving it to 35 with the spec at 34 cost zero across every check: the consumer reference's
// one number about the validator was compared to nothing. Derived the way `check-spec`'s `C4`
// derives it — the declaring rows whose first cell is a backticked `FD-V` id, less the ones
// declared *deliberately absent* — and compared to the sentence's count AND its range end,
// because both are literals a consumer asserts on ("the ids are never renumbered, so it is safe
// to assert on them"). `X6`'s shape: the normative document against the consumer reference.
{
  const SPEC = join(ROOT, 'spec', 'flow-definition.md');
  const AG = join(ROOT, DOCS[0]);
  if (!existsSync(SPEC) || !existsSync(AG)) {
    fail('X7', 'spec/flow-definition.md or AGENTS.md is missing, so the refusal count cannot be compared');
  } else {
    const spec = readFileSync(SPEC, 'utf8');
    const ag = readFileSync(AG, 'utf8');
    const rows = [];
    for (const line of spec.split(/\r?\n/)) {
      const m = /^\|\s*`(FD-V(\d+))`\s*\|(.*)$/.exec(line);
      if (m) rows.push({ id: m[1], n: Number(m[2]), absent: /deliberately absent/i.test(m[3]) });
    }
    const live = rows.filter((r) => !r.absent).length;
    const top = rows.reduce((h, r) => Math.max(h, r.n), 0);
    const said = /There are \*\*(\d+) refusals\*\* over the id range `FD-V1` … `FD-V(\d+)`/.exec(ag);
    if (rows.length === 0) fail('X7', 'spec/flow-definition.md section 5 declares no FD-V rows where X7 looks for them');
    else if (!said) fail('X7', 'AGENTS.md`s refusal-count sentence is not where X7 looks for it');
    else {
      if (Number(said[1]) !== live) fail('X7', `AGENTS.md says **${said[1]} refusals** and spec/flow-definition.md section 5 declares ${live} (${rows.length} rows, ${rows.length - live} absent)`);
      if (Number(said[2]) !== top) fail('X7', `AGENTS.md says the id range ends at FD-V${said[2]} and section 5's highest row is FD-V${top}`);
    }
  }
}

const checks = [
  'X1 the reference exists and its fences parse',
  'X2 every ```ts block is tagged run or check, or opts out explicitly',
  'X3 every tagged snippet typechecks against index.ts',
  'X4 every `run` snippet executes, and asserts something',
  'X5 no snippet fails under the DOM lib a browser consumer compiles with (zero since W57 closed Q71)',
  'X6 AGENTS.md`s cost figures ARE spec/flow-definition.md section 3`s, both ways',
  'X7 AGENTS.md`s refusal count IS spec/flow-definition.md section 5`s row count, and its range end the highest row',
  'X8 every ```ts fence in README.md IS the executed AGENTS.md snippet its section NAMES, byte for byte, both ways',
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
