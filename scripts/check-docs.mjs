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

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
// `spawn` beside `spawnSync` since W104: the `run` snippets go through a bounded pool
// of asynchronous children, and the two `tsc` invocations stay synchronous because
// there are two of them and they are not what this check spends its time on.
import { spawn, spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
/**
 * **Per PROCESS, and [Q182](../doc/questions/q182.md) is why — W105.** This was `dev-dist/docs` at a
 * fixed path, `rmSync`d on every run, so **two concurrent `check-docs` bodies destroyed each other**.
 * That is not hypothetical and it is not only about running this check twice: `check-wiring-selftest.mjs`
 * stages every `scripts/check-*.mjs` flat into `dev-dist/` and runs those copies with their dispatch
 * falsified, so a staged copy reaches THIS body and deleted the real run's snippets underneath it —
 * which is half of why that self-test had to carry a `SELFTEST-EXCLUSIVE:` marker and run alone.
 * Q182's own row says relocating the staging would not fix it, *because the copies it runs are the
 * real checks and they write the real paths*: this line is the path.
 *
 * **The pid, not a random token**, because a stale directory from a killed run must be reusable rather
 * than accumulate — Windows recycles pids freely (measured at W105: nine leaked directories all
 * reported their pid as live), so the `rmSync` below is what makes reuse safe and is not tidying.
 */
const OUT = join(ROOT, 'dev-dist', `docs-${process.pid}`);
/**
 * **Removed on the way out, INCLUDING on the abort path.** `process.on('exit')` rather than a
 * `finally`: this check reports from the top level and leaves by `process.exit` in several places as
 * well as by falling off the end, and an `exit` handler covers all of them plus an uncaught throw.
 * `rmSync` is synchronous, which is what makes it legal here.
 *
 * What it does NOT cover is `SIGKILL`, and that is the stated limit rather than an oversight: the
 * honest target W105 set is *a killed run leaks ONE path, not one per snippet*, which nesting buys
 * and no handler can.
 */
process.on('exit', () => rmSync(OUT, { recursive: true, force: true }));
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
  // `SchedulerLike` when it is — see [Q71](../doc/questions/q71.md), which this
  // check found and does not cover.
  // The compiler is invoked through `process.execPath` and TypeScript's own entry
  // rather than through `npx`, which on Windows is a `.cmd` shim that `spawnSync`
  // reports as a non-zero exit with no output — a failure indistinguishable from a
  // real one, which is the shape this repository keeps finding.
  //
  // **The config is WRITTEN, and `OUT` being per-process is why — W105.**
  // `tsconfig.docs.json`'s own `include` is a fixed `dev-dist/docs/*.ts`, and a tracked file cannot
  // name a directory whose name carries this process's pid. So the options stay where W57 put them
  // and only `include` is overridden, in a config inside `OUT`: **one source for the compiler flags,
  // which is the thing that must not drift**, and `extends` resolves `tsconfig.docs.json`'s own
  // `"./tsconfig.json"` relative to that file rather than to this one. `X5` below has written its
  // config this way since W57 and this is the same shape, one lib set over.
  const cfg = join(OUT, 'tsconfig.x3.json');
  writeFileSync(cfg, JSON.stringify({
    extends: relative(OUT, join(ROOT, 'tsconfig.docs.json')).replace(/\\/g, '/'),
    include: ['*.ts'],
  }));
  const tsc = spawnSync(
    process.execPath,
    [join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', cfg],
    { cwd: ROOT, encoding: 'utf8' },
  );
  if (tsc.status !== 0) {
    const out = `${tsc.stdout ?? ''}${tsc.stderr ?? ''}`.trim();
    for (const line of out.split('\n').filter((l) => l.includes('error TS')).slice(0, 12)) {
      // `docs[^\\/]*` since W105: the directory is `docs-<pid>`, so an anchor reading `docs/` matches
      // nothing and every error would be reported as a raw `tsc` line instead of as `AGENTS.md:<line>`.
      // Loud rather than silent — the clause still fails — but it loses the one thing that makes the
      // failure readable, which is what a path anchor costs when the path becomes derived.
      const m = /docs[^\\/]*[\\/](\d+)-line(\d+)\./.exec(line);
      fail('X3', m ? `AGENTS.md:${m[2]} — ${line.split('): ').slice(1).join('): ') || line}` : line);
    }
    if (!out.includes('error TS')) fail('X3', `tsc failed: ${out.slice(0, 300)}`);
  }
}

// X4 — every `run` snippet executes, and a non-zero exit is the snippet's failure.
//
// **CONCURRENT at a declared width since
// [W104](../doc/work-items/w104-the-snippet-loop-runs-concurrently.md)**, and the one thing that
// changed is this loop: `spawnSync` in a `for` became a bounded pool over asynchronous `spawn`.
// The reason is [ADR 0070](../doc/decisions/0070-the-local-gate-is-the-ladder-and-proving-the-checks-can-fail-belongs-to-ci.md) —
// `check:docs:selftest` runs this whole check **106 times** (50 probes, plus two runs for each of
// 28 `META` entries), so it was **1096 s of CI's self-test wall**, and halving any other lane moves
// the total by single digits.
//
// **Measured on the 32 snippets this tree ships, on a machine whose `node -e ''` is 49 ms**
// ([Q180](../doc/questions/q180.md)'s baseline is 54 ms, and [Q427](../doc/questions/q427.md) is why
// the reading is stated with the machine): sequentially this loop is **4911 ms**, and at pool width
// 4 / 8 / 16 / 20 / 32 it is **1614 / 1201 / 1048 / 1082 / 1128 ms**. So the curve is already flat at
// 8, width 16 buys a further 13%, and **20 and 32 are measurably WORSE than 16** on twenty cores.
//
// **Almost the whole loop is startup, which is why overlapping it works at all.** A noop `.ts` in
// `dev-dist/docs` is 80 ms, one that imports `index.ts` and asserts nothing is 130 ms, and the median
// snippet is ~150 ms — so **85% of what the pool overlaps is Node booting and loading this package**
// and ~13% is the snippet doing its own work. That is also why `worker_threads` would buy a further
// 1.75x by paying the import once, and they are **W106's** deliberately: the asynchronous restructure
// moves ONE variable, sequential to concurrent, so any behaviour change is attributable to
// concurrency alone. Doing both at once moves two.
//
// **Width 8 rather than the fastest 16, and the measurement that decides it is the one taken under
// LOAD — which REVERSES the ranking above.** `npm run gate:full` runs `selftests`, which runs six
// lanes at once, so the condition this lane actually ships in is a busy machine. Measured on this
// check with eight CPU burners alongside, three runs each: width 1 **11606 ms**, width 8
// **6017 ms**, width 16 **6469 ms** — so 16 wins by 9% idle and **loses by 7% under the load that
// ships**, because the snippets are already oversubscribed and a wider pool only adds scheduling.
// Per-snippet WALL also rises 1.7x at width 8 (251 -> 341 ms) against 2.6x at 16 (578 ms), which
// matters because the deadline below is a fixed wall-clock cap, and CI's runner has FOUR cores,
// where 16 is 4x oversubscribed and 8 is 2x.
const X4_WIDTH = 8;
// **A floor, because the deliverable is one integer edit from gone and the check is green without
// it** — measured: `X4_WIDTH = 1` is `check:docs` EXIT 0 at 9084 ms, which is the pre-W104 9314 ms
// back again, and all 51 of the self-test's probes still pass, because a serial pool computes the
// same verdicts more slowly. [Q102](../doc/questions/q102.md)'s shape, declared as `RUN_FLOOR` and
// `README_SNIPPET_FLOOR` are.
//
// **AT the width and not below it, and W104's adequacy reader is why.** This shipped at **2**, with a
// comment claiming it was declared the way those two floors are — and it was not: `RUN_FLOOR` is 32
// against 32 actual and `README_SNIPPET_FLOOR` is 8 against 8, both sitting AT the current value and
// raised by the item that moves it. A floor of 2 against a width of 8 answers *not literally
// sequential*, which is not what this check claims. Measured by that reader, three reps round-robin:
// **width 1 7451 ms, width 2 5964 ms, width 8 4344 ms** — so `X4_WIDTH = 2` was `check:docs` EXIT 0,
// the self-test's bound EXIT 0, every probe still caught, and **half the saving gone** (+37% idle,
// +32% under three real concurrent self-test lanes, +45% under twenty burners; roughly +170 s on a
// 624 s lane). **Its limit is `RUN_FLOOR`'s**: the width and this floor are two edits in one diff
// ([Q217](../doc/questions/q217.md)), which is why `check-docs-selftest.mjs` reads BOTH out of this
// file and holds the floor itself — the third edit, in another file.
const X4_WIDTH_FLOOR = 8;
if (X4_WIDTH < X4_WIDTH_FLOOR) {
  fail('X4', `the \`run\` snippets are executed through a pool ${X4_WIDTH} wide and the floor is ` +
    `${X4_WIDTH_FLOOR}. Lowering the width is how this item's whole deliverable leaves, and every ` +
    'other clause here passes at any width: the verdicts are the same and only the wall clock moves');
}
// **Unchanged at 30 s, and the headroom is measured rather than assumed**: the slowest snippet is
// 251 ms sequentially and 341 ms at this width, so the cap is ~88x the worst case the pool produces.
// Scaling it with the width was considered and refused — a hung snippet would then cost eight minutes,
// and [Q425](../doc/questions/q425.md)'s own row calls a scaled timeout the dearer road.
//
// **What W104 does change is the MESSAGE, which is the cheapest fix that row names.** Q425 is three
// readings of one check over 32 snippets that never moved — 15 s, then 639 s, then 563 s — in which
// NINE sub-second snippets were killed at the cap and reported as *the snippet does not run*: a
// sentence about the snippet that was really about the clock. A `status` of `null` is the deadline and
// not the snippet; a failure to spawn at all is a third thing that today renders as the same
// `exit null`; and saying which costs the two branches below. **Concurrency is what makes it no
// longer optional**, because the pool adds its own 1.7x to whatever the machine is already doing.
const X4_DEADLINE_MS = 30_000;
const runnable = written.filter((x) => x.tag === 'run');
{
  // Each child's verdict is recorded **at its own index**, never pushed, so the mapping from child to
  // snippet is positional and cannot drift with the completion order — which is the hazard W104's
  // declaration names first: several children are in flight at once, and `X4`'s detail lines are what
  // the self-test's gradings read.
  const seats = new Array(runnable.length).fill(null);
  let peak = 0;
  await new Promise((settle) => {
    // **Zero `run` snippets must not hang.** The probe *a reference with no snippets at all* produces
    // exactly that, so the pool settles before it waits for anything.
    if (runnable.length === 0) { settle(); return; }
    let next = 0, live = 0, closed = 0;
    const pump = () => {
      while (live < X4_WIDTH && next < runnable.length) {
        const at = next++;
        const w = runnable[at];
        const t0 = Date.now();
        live++;
        if (live > peak) peak = live;
        let err = '', settledHere = false;
        // **`error` and `close` BOTH fire for a child that could not be spawned, and the guard is what
        // makes the FIRST verdict win** — measured on this platform rather than inferred, because
        // W104's two readers disagreed about it and both reasoned from the answer: a nonexistent
        // executable gives `error(ENOENT)` at 3.3 ms and then `close(-4058, null)` at 4.1 ms, two
        // settling events for one child.
        //
        // *Its stated consequence was the one thing it CANNOT be*: this closure captures `at` and `w`,
        // so a second call rewrites the SAME snippet's seat and never another's — W104's conformity
        // reader. What it really stops is the counting. Without it `closed` increments twice per
        // child, so `settle()` runs at the sixteenth of thirty-two with half the seats still null;
        // `live` decrements twice, so `pump` exceeds the declared width; and the ENOENT verdict is
        // overwritten by `exit -4058`, which is the useless half of the pair. **That makes removing it
        // a RACE rather than a failure**, which is why W104's adequacy reader measured one run as
        // *identical* and concluded the guard was inert — a racy probe is worse than one that fails.
        const finish = (status, signal, spawnError) => {
          if (settledHere) return;
          settledHere = true;
          seats[at] = { name: w.name, line: w.line, status, signal, spawnError, err, t0, t1: Date.now() };
          live--;
          if (++closed === runnable.length) settle(); else pump();
        };
        const ch = spawn(process.execPath, [join(OUT, w.name)], {
          cwd: ROOT,
          // stdout is DRAINED and discarded, as `spawnSync`'s captured buffer was: a piped stream
          // nothing reads fills and **blocks the child**, which is a hazard the synchronous form did
          // not have. Measured in isolation by W104's adequacy reader: an undrained pipe completes at
          // 70 KB and **deadlocks at 200 KB**; the worst snippet here writes 708 bytes, so the drain
          // has a ~100x margin and no live case. `stdin: 'ignore'` is the same hazard reversed.
          //
          // **The one behaviour `spawnSync` had and this does not** is its implicit 1 MiB `maxBuffer`:
          // on exceeding it the synchronous form KILLED the child with SIGTERM and set
          // `error.code = 'ENOBUFS'`, which the old code rendered as `exit null` — so a chatty snippet
          // used to be reported as a timeout. This drains without limit instead. Both readers raised
          // it independently; it is a change in the right direction and it is recorded rather than
          // left for someone to find.
          stdio: ['ignore', 'pipe', 'pipe'],
          timeout: X4_DEADLINE_MS,
        });
        ch.stdout.on('data', () => {});
        // **Decoded as UTF-8 on the stream and not by `+=` on a Buffer** — W104's conformity reader:
        // `err += d` coerces each chunk separately, so a multi-byte character straddling a chunk
        // boundary mojibakes where `spawnSync(..., { encoding: 'utf8' })` decoded the whole buffer.
        ch.stderr.setEncoding('utf8');
        ch.stderr.on('data', (d) => { err += d; });
        ch.on('error', (e) => finish(null, null, e.code ?? e.message));
        ch.on('close', (code, signal) => finish(code, signal, undefined));
      }
    };
    pump();
  });
  // **Reported in SOURCE order and never in completion order**, so neither the report a human reads
  // nor the failure list a probe's set equality reads depends on how the pool happened to schedule.
  // `doc/workflow.md` rule 8 obligation (f) answered by construction rather than by luck.
  const emittedBefore = failures.length;
  for (const r of seats) {
    if (r === null || r.status === 0) continue;
    const err = `${r.err ?? ''}`.trim().split('\n').slice(0, 4).join(' | ');
    if (r.spawnError !== undefined) {
      fail('X4', `AGENTS.md:${r.line} — the snippet could not be spawned at all (${r.spawnError}), ` +
        'which is this check`s own machinery rather than the snippet');
    } else if (r.status === null && r.signal) {
      // **The clock, NAMED** — Q425. The elapsed time and the deadline are both printed, so a reader
      // can see whether the snippet was slow or the machine was, without this check guessing.
      //
      // **A SIGNAL is required, which is the branch ORDER made local** — W104's adequacy reader. The
      // three arms are tried in order and the order is asserted by nothing, so with the arm above
      // disabled a 15 ms spawn failure read *killed by no signal after 15 ms against a 30 s deadline*:
      // a sentence naming a deadline it never reached and contradicting itself in six words. A kill
      // carries a signal on both platforms this ships to (measured: Windows reports `SIGTERM` for
      // Node's own `timeout`), so requiring one sends anything else to the plain arm below.
      fail('X4', `AGENTS.md:${r.line} — the snippet did not exit: killed by ${r.signal} ` +
        `after ${r.t1 - r.t0} ms against a ${X4_DEADLINE_MS / 1000} s deadline, with up to ${X4_WIDTH} ` +
        `snippet(s) running at once${err ? ` | ${err}` : ''}`);
    } else {
      fail('X4', `AGENTS.md:${r.line} — the snippet does not run: ${err || `exit ${r.status}`}`);
    }
  }
  // **The REPORT half is bound to the RUN half, and the restructure is why it has to be** — W104's
  // adequacy reader, BLOCKING. Before W104 one `for` both spawned and reported, so a bound on the
  // loop was a bound on both; W104 split them, and all five clauses below read `seats` rather than
  // what was EMITTED from it. Measured: `for (const r of seats.slice(0, 1))` is `check:docs` EXIT 0
  // **on a reference whose snippet throws**, with the note printed and every clause below green —
  // the item's own argument for the membership clause (*the sequential `for` was self-bounding; a
  // pool can under-run*) applying verbatim to the half it was not applied to.
  //
  // It matters more since [ADR 0070](../doc/decisions/0070-the-local-gate-is-the-ladder-and-proving-the-checks-can-fail-belongs-to-ci.md)
  // than it would have before: `npm run gate` carries no `:selftest` entry, so a clause whose only
  // observer is a probe is invisible to the local ladder and lives in CI alone
  // ([Q431](../doc/questions/q431.md)). This is a relation between the two halves, in the check.
  {
    const emitted = failures.length - emittedBefore;
    const failing = seats.filter((r) => r !== null && r.status !== 0).length;
    if (emitted !== failing) {
      fail('X4', `the pool recorded ${failing} failing snippet(s) and the report above emitted ` +
        `${emitted} failure(s). The loop that RUNS and the loop that REPORTS are separate since W104, ` +
        'and this is the only thing that notices the second one stopping');
    }
  }
  // **The pool runs EVERY `run` snippet, EXACTLY ONCE** — `doc/workflow.md` rule 8 obligation (d),
  // and it is a hole this change CREATES rather than one it inherits. The sequential `for` was
  // self-bounding; a pool can under-run, and `RUN_FLOOR` above counts the snippets EXTRACTED rather
  // than the ones executed, so a pool that ran eight of thirty-two would be green at every other
  // clause here. Set equality against the names the writer produced, **with the count beside it**,
  // because a seat filled twice is invisible to a set and a seat left empty is invisible to a count.
  //
  // **And POSITIONALLY, which the sorted comparison alone does not reach** — W104's own author pass,
  // and it is the hazard the item's declaration names first. `seats[closed]` in place of `seats[at]`
  // fills every seat exactly once with the right snippet's own name and line, so the SET and the
  // COUNT are both unmoved and only the report's ORDER becomes the completion order: measured, that
  // mutation cost ZERO at `check:docs` and at all 51 probes. Comparing seat `i` to snippet `i` is
  // what makes the mapping an assertion rather than a convention — and it is also what makes
  // obligation (f) hold by construction below rather than by a comment saying it does.
  const wanted = runnable.map((w) => w.name).sort();
  const reported = seats.filter(Boolean).map((r) => r.name).sort();
  const skipped = wanted.filter((n) => !reported.includes(n));
  // **And the count a SECOND way, from `all` rather than from `written`** — obligation (c)'s procedure
  // run on this clause's own values, and it found a hole: re-sourcing `wanted` from the seats makes
  // the comparison above the pool against itself, and the under-run at `a1` then costs ZERO. `all` is
  // the blocks the extractor parsed and `written` is the subset a separate loop wrote files for, so
  // this is a different array produced by different code — the same expression `RUN_FLOOR` reads
  // below, which is this file's established derivation of *how many snippets should run*.
  const runBlocks = all.filter((x) => x.tag === 'run').length;
  // **BOTH fields the seat carries, not just the name** — W104's adequacy reader, BLOCKING. Two
  // values are handed in (`name` and `line`) and the report prints the LINE, which is the mapping as
  // a HUMAN reads it; comparing the name alone left `line: runnable[0].line` at `check:docs` EXIT 0,
  // and on a reference whose snippet at line 946 throws it reported **`AGENTS.md:77`** — the right
  // verdict against the wrong snippet, with the self-test's probe still reading `outcome: caught`
  // because the gradings read the id SET and the report ROWS and never the line. *W90's handed-on
  // value compared on two fields of four, one plan on.*
  const misseated = seats.findIndex((r, i) => r !== null &&
    (r.name !== runnable[i].name || r.line !== runnable[i].line));
  if (reported.length !== wanted.length || reported.join('\n') !== wanted.join('\n') || misseated >= 0) {
    // Two arms and not three: a third, *its seats are not the snippets that were written*, was
    // UNREACHABLE and said so ungrammatically — an empty `skipped` forces every seat non-null, which
    // forces both the set and the length equal, so the condition cannot be true with `misseated < 0`.
    // W104's conformity reader.
    const which = skipped.length
      ? `${skipped.join(', ')} never ran`
      : `seat ${misseated} holds ${seats[misseated].name} at line ${seats[misseated].line} where ` +
        `snippet ${misseated} is ${runnable[misseated].name} at line ${runnable[misseated].line}, ` +
        'so a verdict is attributed to the wrong snippet';
    fail('X4', `the pool returned a verdict for ${reported.length} of ${wanted.length} \`run\` ` +
      `snippet(s) — ${which}. Every other clause here is about the snippets that DID run, so this is ` +
      'the only thing that notices one the pool skipped or mis-seated');
  }
  if (reported.length !== runBlocks) {
    fail('X4', `the pool returned ${reported.length} verdict(s) and the extractor found ${runBlocks} ` +
      '`run` block(s). This is the clause above`s second source, from a different array: with only one, ' +
      're-sourcing it from the pool makes the comparison the pool against itself');
  }
  // **And it ran them CONCURRENTLY, which is this item's whole deliverable and would otherwise be
  // held by nothing** — obligation (b)'s tautology clause. Lowering `X4_WIDTH` and narrowing `pump`'s
  // own condition each serialise the pool, and both are green at every other clause here and at all
  // 51 of the self-test's probes, because a serial pool computes the same verdicts more slowly.
  //
  // **TWO expressions, and the second is a PROVENANCE guard rather than a second detector** — and the
  // comment here claimed otherwise until W104's two readers took it apart from opposite ends. The
  // honest account, measured:
  //
  //   * `live` is incremented before `spawn` and decremented in `finish`, and `[t0, t1]` brackets
  //     exactly that interval, so **`overlap >= peak` always** — therefore the overlap clause can
  //     never fire on a tree where the peak clause passes (conformity reader). It is not a second
  //     chance to catch a serial pool.
  //   * What it DOES catch is a mutated counter: forcing `peak = X4_WIDTH` and serialising the pool
  //     is caught by **overlap alone**. That is obligation (c)'s own purpose and it is why there are
  //     two (adequacy reader, measured).
  //   * Both are the PARENT's bookkeeping. `t0` is read two statements above `peak` and `t1` in the
  //     parent's `finish`; **no child reports its own clock.** The proof is that with every child
  //     failing to spawn — not one snippet running — the note still printed *9 by the snippets' own
  //     clocks*. So they are siblings in one apparatus, which is `doc/workflow.md` v0.16's clause,
  //     and the words no longer claim more than that.
  //
  // **Each clause derives its own expectation**, because sharing one was the hole: with `expectedPeak`
  // the right-hand side of both, narrowing `pump` AND re-pointing `expectedPeak` — two edits in ONE
  // file — was `check:docs` EXIT 0 with the note printing *pool 8 wide — peak 1 in flight* and the
  // cross-file bound passing, since that bound reads the two literals and not whether they are used.
  // Two derivations of one formula is [Q217](../doc/questions/q217.md)'s shape and is the cost;
  // what it buys is that the mutation now needs three edits and the peak clause reads `X4_WIDTH`
  // itself. **Neither is a clock BUDGET** — that would be [Q179](../doc/questions/q179.md)'s error,
  // since wall time here is not reproducible — they are relations that hold at any speed, because
  // `pump` spawns `min(width, n)` children synchronously before the event loop can deliver a `close`.
  if (runnable.length > 0 && peak !== Math.min(X4_WIDTH, runnable.length)) {
    fail('X4', `the pool held ${peak} snippet(s) in flight at its peak, where a declared width of ` +
      `${X4_WIDTH} over ${runnable.length} snippet(s) must reach ${Math.min(X4_WIDTH, runnable.length)}. ` +
      'A pool that serialises itself is this clause`s subject: the saving is gone and every other ' +
      'check here passes');
  }
  // The second derivation, over the timestamps the PARENT recorded around each child rather than over
  // its counter. A FLOOR and not an equality: `Date.now()` is millisecond-grained, so children opening
  // and closing within one millisecond read as overlapping — and the tie-break puts every open before
  // every close, so **k simultaneous closes inflate this by k and not by one**, which is what the
  // comment claimed until W104's conformity reader derived the sort. Measured: 9 against a peak of 8
  // in 5 of 5 runs at width 8, and 2 against 1 at width 1.
  const expectedOverlap = Math.min(X4_WIDTH, runnable.length);
  const overlap = (() => {
    const edges = [];
    for (const r of seats) { if (r) { edges.push([r.t0, 1], [r.t1, -1]); } }
    edges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
    let n = 0, hi = 0;
    for (const [, d] of edges) { n += d; if (n > hi) hi = n; }
    return hi;
  })();
  if (runnable.length > 0 && overlap < expectedOverlap) {
    fail('X4', `the start and end times recorded around each child overlap ${overlap} deep, where a ` +
      `declared width of ${X4_WIDTH} over ${runnable.length} snippet(s) must reach ${expectedOverlap} ` +
      '— so the children did not run at the same time, whatever the pool`s own counter says');
  }
  // **Printed whether or not the clauses above passed, because it used to go silent exactly when
  // something was wrong** — W104's adequacy reader. Its guard required no skipped snippet and both
  // concurrency clauses satisfied, so the one artifact a person would read to see whether the pool
  // worked was absent in every case where it had not. [Q100](../doc/questions/q100.md)'s class says
  // nothing reads this line, which is the honest half; a diagnostic that disappears under the
  // condition it diagnoses is the other.
  if (runnable.length) {
    console.log(`note: X4 ran ${runnable.length} \`run\` snippet(s) through a pool ${X4_WIDTH} wide — ` +
      `peak ${peak} in flight by the pool's count and ${overlap} by the times recorded around them, ` +
      `each with a ${X4_DEADLINE_MS / 1000} s deadline.`);
  }
}

// X5 — the same snippets under the lib set a BROWSER-targeting consumer compiles
// with. **Reported, and since W57 FAILED at any count above zero.** It was written
// *reported, never failed*, because the one snippet that broke under the DOM lib was
// [Q71](../doc/questions/q71.md) and W9 was not permitted to fix it; so it carried an
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
// claim. **This is [Q102](../doc/questions/q102.md)'s obligation firing for the
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
// **Raised 28 -> 29 by [W86](../doc/work-items/w86-score-each-item-then-fan-out-per-item.md)**, which
// added section 17's `run` snippet — a `map` whose branch opens a second `map`, one opener with two
// INSTANCES, `RunState.regions` read at both levels, `RegionEvent.regionPath` naming the instance
// through `onRegionEvent`, and `JP-R12`'s collection two levels deep. **Q102's ratchet, and this item
// declared the file in its exceptions table before the snippet was written**, on W59's, W61's and
// W62's precedent: the obligation is created by the CONTENT of the change and not by a file set.
// **Raised 29 -> 30 by [W90](../doc/work-items/w90-a-run-killed-and-resumed-on-real-workers.md)**, which added section 18's
// `run` snippet — append-then-resume on a real `createRuntime`, a store keyed by position across two processes. Q102's
// ratchet, declared in that item's exceptions table before the snippet was written.
// **Raised 30 -> 31 by [W94](../doc/work-items/w94-a-tv-series-ingest-through-a-gate-on-real-workers.md)**, which added section 19's `run` snippet — the TV ingest
// through a `distinct` gate on a real `createRuntime`, and a consumer's gate type stopping a run with `UndeclaredRoute`.
// Q102's ratchet, SEEDED in P24's declaration and declared in W94's exceptions table before the snippet was written.
// **32 since [W101](../doc/work-items/w101-the-authoring-session-wiring-a-gate-before-it-runs.md)**, whose
// section 20 is an authoring session for a GATE — raised in the commit that adds the snippet.
// **Raised 32 -> 33 by [W108](../doc/work-items/w108-a-predicate-is-data.md)**, which added section 4's
// DECLARED-predicate snippet — the three shapes of a `when` validated together, and all four of
// `FD-V42`-`FD-V45` thrown on, including the bare STRING that was the form until v0.27. Q102's
// ratchet, declared in that item's exceptions table before the snippet was written.
// **Raised 33 -> 34 by [W110](../doc/work-items/w110-a-flow-a-ui-could-have-emitted.md)**, whose section 21
// is **P26's exit artifact as a reference section**: a whole flow validated with NO predicate registered
// and the `unchecked` residue of a transform-only node asserted rather than described. Raised in the
// commit that adds the snippet.
// **Raised 34 -> 35 by [W154](../doc/work-items/w154-the-built-in-if-and-switch.md)**, section 19's `if`/`switch` snippet — exception (o).
const RUN_FLOOR = 35;
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

// X6b — W109's TIER-THREE cost figures, the same two documents and the same both-ways rule
//
// **The adequacy reader's F11.** `1.93x`, `~1.47x`, `+4 clones` and `+2 log records` are in
// `spec/flow-definition.md`'s v0.28 paragraph, `AGENTS.md` section 13's tier table,
// `doc/decisions/0075-*.md` and the work item — four copies — and nothing compared any two:
// editing the spec's `1.93x` to `9.31x` left `check:docs` at **EXIT 0, all checks passed**. That
// is `X6`'s own founding measurement one decision later, which is why this is `X6`'s clause and
// not a new id.
//
// **The ADR's and the item's copies are HISTORICAL and deliberately not compared**, exactly as
// ADR 0040's are above: a decision's record is what it was made on. What must agree is the
// normative document and the consumer reference, because both are read as CURRENT.
//
// **By SET and BOTH WAYS**, as above. The figures compared are the RATIOS (`N.NNx`) and the
// per-item COUNTS (`+N <noun>`), because those are the four an author acts on.
{
  const SPEC = join(ROOT, 'spec', 'flow-definition.md');
  const AG = join(ROOT, DOCS[0]);
  /** Every `N.NNx` ratio and every `+N clones|log records|dispatch` count in a slice, de-duplicated. */
  const figuresIn = (text, from, to) => {
    const a = text.indexOf(from);
    const b = a < 0 ? -1 : text.indexOf(to, a);
    if (a < 0 || b < 0) return null;
    const slice = text.slice(a, b);
    const out = [
      ...(slice.match(/\d+\.\d+x/g) ?? []),
      ...(slice.match(/\+\d+ (?:dispatch|clones?|log records?)/g) ?? []),
    ];
    return out.length ? [...new Set(out)].sort() : null;
  };
  if (!existsSync(SPEC) || !existsSync(AG)) {
    fail('X6', 'spec/flow-definition.md or AGENTS.md is missing, so the tier-three cost figures cannot be compared');
  } else {
    const spec = figuresIn(readFileSync(SPEC, 'utf8'),
      '**The type is the ESCAPE HATCH and not the default', '**Binds:**');
    const agents = figuresIn(readFileSync(AG, 'utf8'),
      '**Use it last, and the reason is a cost.**', '**Three things to know before you use one.**');
    if (spec === null) {
      fail('X6', 'spec/flow-definition.md`s v0.28 tier paragraph is not where X6 looks for it');
    } else if (agents === null) {
      fail('X6', 'AGENTS.md section 13`s tier table is not where X6 looks for it');
    } else {
      const missing = agents.filter((x) => !spec.includes(x));
      const extra = spec.filter((x) => !agents.includes(x));
      if (missing.length) {
        fail('X6', `AGENTS.md quotes tier-three figure(s) ${missing.join(', ')}, which spec/flow-definition.md's ` +
          `v0.28 paragraph does not — it has ${spec.join(', ')}`);
      }
      if (extra.length) {
        fail('X6', `spec/flow-definition.md's v0.28 paragraph states ${extra.join(', ')}, which AGENTS.md ` +
          `section 13 does not quote — it has ${agents.join(', ')}`);
      }
      if (!missing.length && !extra.length) {
        console.log(`note: X6 also compared ${spec.length} tier-three cost figure(s) between ` +
          'spec/flow-definition.md`s v0.28 paragraph and AGENTS.md section 13, both ways — four documents ' +
          'carried them and nothing compared any two (W109`s adequacy reader, F11).');
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
// `README_SNIPPET_FLOOR` is [Q102](../doc/questions/q102.md)'s shape, declared as `RUN_FLOOR` is.
// The list is a literal — [Q217](../doc/questions/q217.md) — so a README section and its entry here
// are two edits in ONE diff, and W69's adequacy reader measured exactly that diff green at
// `check:docs` AND `check:markdown`. The floor is what makes the third edit visible. The README is
// read through `CHECK_DOCS_README`, as AGENTS.md is through `CHECK_DOCS_DOC`, for the reason X6's
// own header records.
const README_SNIPPETS = [
  { readme: 'Getting started', agents: '2. Getting started — a flow and its runtime from two documents' },
  { readme: 'A flow that decides', agents: 'The same on the RUNTIME — a decision, a fan-out and a join on real workers' },
  { readme: 'Checking a flow before it runs', agents: '15. What a schema buys an AUTHOR — an authoring session' },
];
// **5 since [W86](../doc/work-items/w86-score-each-item-then-fan-out-per-item.md)**, which added
// section 17's pair — Q102's ratchet, and that item's adequacy reader (finding 16) is what noticed
// the floor had been left at four while `README_SNIPPETS` became five.
// **6 since [W90](../doc/work-items/w90-a-run-killed-and-resumed-on-real-workers.md)**, which added section 18's pair —
// Q102's ratchet, raised in the commit that adds the entry, as a declared exception.
// **7 since [W94](../doc/work-items/w94-a-tv-series-ingest-through-a-gate-on-real-workers.md)**, which added section 19's pair — the same ratchet, raised in the commit that adds the entry.
// **8 since [W101](../doc/work-items/w101-the-authoring-session-wiring-a-gate-before-it-runs.md)**, which added
// section 20's pair — the same ratchet, and the three edits are one diff. **What this floor does NOT have is
// `RUN_FLOOR`'s self-test probe**: W101's adequacy reader (F12) lowered it to 7 and `check:docs:selftest` was
// EXIT 0 at 50/50 and 28/28, where lowering `RUN_FLOOR` is CAUGHT by name. A declared CEILING, and
// [Q102](../doc/questions/q102.md)'s shape on one of two floors that carry it *(closed since W131:
// `check-docs-selftest.mjs`'s source-text bound holds the floor — Q439)*.
// **3 since [W107](../doc/work-items/w107-the-readme-is-for-a-person-who-will-use-the-library.md), and it
// went DOWN, which is the only time that has happened to a floor here.** A ratchet lowered is how a
// deliverable leaves ([Q102](../doc/questions/q102.md)), so this is legitimate only because the thing
// being counted CHANGED: [ADR 0073](../doc/decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md)
// says `README.md` is for a PERSON who will use the library and `AGENTS.md` is the extensive reference,
// where `X8` was built when the README was the showcase and mirrored all eight of its sections. Five
// pairings were removed with their sections; the three that remain are the basic usage the README now
// claims to carry. *A floor that falls needs a decision above it, not a comment beside it.*
//
// **The residue, measured, and closed at W131**: W101's adequacy reader (F12) lowered this floor to 7 and
// `check:docs:selftest` was EXIT 0 at 50/50 and 28/28, where lowering `RUN_FLOOR` is CAUGHT by name.
// Since W131 `check-docs-selftest.mjs`'s source-text bound holds this floor beside `X4_WIDTH`'s, so
// lowering it is a third edit in another file — [Q439](../doc/questions/q439.md).
const README_SNIPPET_FLOOR = 3;
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
  // **And the entries are DISTINCT on both sides, which is what makes the floor a floor — W107's
  // adequacy reader.** The floor counts `README_SNIPPETS.length` and nothing said the entries differ,
  // so a pairing DUPLICATED takes the length back over the floor for free: that reader deleted
  // `## Checking a flow before it runs` from the README whole — 6538 bytes, one of the three examples
  // [ADR 0073](../doc/decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md)
  // decision 4 names as this document's content — replaced its pairing with a copy of the first, and
  // measured `check:docs` EXIT 0, `check:markdown` EXIT 0 and **all forty-seven self-test probes still
  // caught**, because no probe anchors on the third pairing. *Nothing needed to lower the floor.*
  // This was `X11`'s own `duplicated` clause one check along, bought by W96's adequacy reader for the
  // same reason — three kept pairings get the bound forty-one ADR rows had (`X11` retired at W119, ADR 0081). The `agents` side
  // is held too, because two pairings naming ONE snippet is caught today only by the byte comparison
  // happening to differ, which is a property of the documents rather than of the list.
  for (const [side, label] of [['readme', 'README.md heading'], ['agents', `${DOCS[0]} heading`]]) {
    const names = README_SNIPPETS.map((p) => p[side]);
    const dupes = [...new Set(names.filter((n, i) => names.indexOf(n) !== i))];
    if (dupes.length > 0) {
      fail('X8', `X8's README_SNIPPETS names the same ${label} twice — ${dupes.map((d) => `"${d}"`).join(', ')} — ` +
        `so ${README_SNIPPET_FLOOR === names.length ? 'the floor is satisfied' : 'the count is inflated'} by a ` +
        'duplicate and a section that left the README is held by nothing');
    }
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
    // **`reached` records a VERDICT per pairing, on every exit path — W107, and the position is the
    // whole of it.** The first cut counted successful comparisons (`compared`); the second pushed at
    // the TOP of the loop body. Both were defeated, each by its own reader, and the two defeats are
    // what fixed the position:
    //
    //   * `compared === README_SNIPPETS.length` fired BESIDE every `continue` below, so four `META`
    //     entries read STILL CAUGHT — and guarding it with *fire only if nothing else did* converted
    //     W29's detectable CO-FIRING (2 failure lines -> 1) into `D5`'s undetectable MASKING (1 -> 1),
    //     which the conformity reader measured with W29's own line-count discriminator. Every path
    //     that skips `compared++` also calls `fail`, so `compared < length` IS *some clause fired*,
    //     whichever way its `fail` was neutered.
    //   * a push at the top of the body cannot see a body that does not EXECUTE. The adequacy reader
    //     inserted one `continue` after it and got `ok X8` at EXIT 0 with zero fences compared; adding
    //     `compared++` beside it printed *compared 3 … both ways* with nothing compared at all. A
    //     one-line window, between the record and the first clause.
    //
    // A record on each exit path has neither hole: a neutered `fail` still reaches its own push, so
    // each clause stays isolated, and an early exit anywhere reaches none of them.
    //
    // **DECLARED CEILING — the five sites are a list nothing binds, and the direction is why this is
    // the trade taken.** Delete one push and that path reports a SPURIOUS SECOND `X8` line; the
    // conformity reader refused the shape for that reason (Q217 times five). But a missing push is
    // reachable only on a tree where that clause is already firing, so its whole cost is a duplicate
    // line on a tree that is already RED — noise, and never a silent pass. The window it replaces was
    // a silent total bypass of everything `X8` exists to do. *An unbound list that can only add noise
    // to a failure is a smaller hazard than a one-line window that turns the check off.*
    const reached = [];
    // (i) every listed heading carries EXACTLY ONE fence, and it is the snippet the pair NAMES.
    for (const pair of README_SNIPPETS) {
      const s = sections.find((x) => x.title === pair.readme);
      if (!s) { fail('X8', `${README} has no "## ${pair.readme}" heading (X8's README_SNIPPETS names it)`); reached.push(pair.readme); continue; }
      const bodies = fencesIn(s.text);
      if (bodies.length === 0) { fail('X8', `${README} has no \`\`\`ts fence under its "## ${pair.readme}" heading`); reached.push(pair.readme); continue; }
      if (bodies.length > 1) {
        fail('X8', `${README} carries ${bodies.length} \`\`\`ts fences under "## ${pair.readme}" and X8 pairs it with ONE — ` +
          `every fence under a listed heading is compared, so give the second its own heading and its own entry`);
        reached.push(pair.readme);
        continue;
      }
      const theirs = agUnder.get(pair.agents);
      if (!theirs || theirs.length !== 1) {
        fail('X8', `X8 pairs "## ${pair.readme}" with ${DOCS[0]}'s "${pair.agents}", which carries ` +
          `${theirs ? theirs.length : 0} \`\`\`ts run fences and must carry exactly one`);
        reached.push(pair.readme);
        continue;
      }
      if (bodies[0] !== theirs[0]) {
        const d = firstDiff(bodies[0], theirs[0]);
        fail('X8', `the snippet under "## ${pair.readme}" in ${README} is not, byte for byte, the \`\`\`ts run snippet under ` +
          `"${pair.agents}" in ${DOCS[0]} — they first differ at snippet line ${d.line + 1}: ` +
          `${JSON.stringify(d.mine.slice(0, 70))} against ${JSON.stringify(d.theirs.slice(0, 70))}`);
      } else compared++;
      reached.push(pair.readme);
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
    // **And EVERY pairing reached a verdict — W107.** The positions the records sit at, and the two
    // defeats that put them there, are above the loop. This is the clause they serve: a membership
    // rather than a count, per rule 8 obligation (d)'s *a count is not a membership*, so the failure
    // NAMES the pairing that got no verdict.
    //
    // **Declared ceiling**: both sides derive from `README_SNIPPETS`, so re-sourcing `reached` to it is
    // vacuous by construction — Q216's *both ways is a DIRECTION, not an observer count* — and what is
    // asserted is that the loop reached what the list declares, which is one list by design. The
    // conformity reader measured that re-sourcing AND narrowing the loop together is EXIT 0, so the
    // probe that narrows the loop holds this clause's PRESENCE and not its SOURCING; no second source
    // exists, because any counter over this loop derives from the same list.
    const unreached = [...listed].filter((t) => !reached.includes(t));
    if (unreached.length > 0 || reached.length !== README_SNIPPETS.length) {
      fail('X8', `X8 declares ${README_SNIPPETS.length} README pairing(s) and ${reached.length} reached a verdict` +
        `${unreached.length ? `, leaving ${unreached.map((t) => `"${t}"`).join(' and ')} with none` : ''} — ` +
        'every pairing must reach one of this clause\'s arms, and a loop narrowed to a prefix of the list, ' +
        'or short-circuited before its first arm, compares nothing and otherwise says nothing');
    }
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

// X9 — the version README.md tells a consumer to expect IS the version both manifests carry
//
// **[W86](../doc/work-items/w86-score-each-item-then-fan-out-per-item.md), and its own rule 8 pass
// is what earned it.** Probe `h1` put `package.json` back to `0.3.0` on the tree that ships `0.4.0`
// and it cost **ZERO** at `check:docs`, `check:spec` and both L6 rungs: the one sentence in this
// repository that tells a consumer which version a breaking change arrived in was compared to
// nothing at all, while `D7` held the SCHEDULER's pin to five sentences from
// [W37](../doc/work-items/w37-the-scheduler-pin-moves-to-0-5-2.md) until W157, which reversed it: the
// scheduler's number is now written only where something resolves it.
//
// `X7`'s shape and `D7`'s subject: the number a consumer reads against the file it is about, both
// manifests, and both of them against each other — because
// [ADR 0029](../doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)
// publishes through two of them and a reader of either gets one answer.
{
  // Through `CHECK_DOCS_README`, as `X8` reads it and for the same reason: a clause a probe
  // cannot reach is a clause the self-test's coverage bound counts and cannot grade.
  const RM = join(ROOT, README);
  const PKG = join(ROOT, 'package.json');
  const DENO = join(ROOT, 'deno.json');
  if (!existsSync(RM) || !existsSync(PKG) || !existsSync(DENO)) {
    fail('X9', 'README.md, package.json or deno.json is missing, so the version cannot be compared');
  } else {
    const npmV = JSON.parse(readFileSync(PKG, 'utf8')).version;
    const jsrV = JSON.parse(readFileSync(DENO, 'utf8')).version;
    const said = /The manifests read `([0-9]+\.[0-9]+\.[0-9]+)`/.exec(readFileSync(RM, 'utf8'));
    if (!said) fail('X9', 'README.md`s manifest-version sentence is not where X9 looks for it');
    else if (said[1] !== npmV) fail('X9', `README.md says the manifests read ${said[1]} and package.json reads ${npmV}`);
    if (npmV !== jsrV) fail('X9', `package.json reads ${npmV} and deno.json reads ${jsrV} — one consumer of two gets the wrong answer`);
  }
}

// X10 — every CURRENT copy of ladder L6's counts IS what `examples/l6.ts` declares
//
// **[W96](../doc/work-items/w96-the-counts-and-the-index-a-check-can-compare-and-q394.md), and [Q171](../doc/questions/q171.md)
// is why** — named for a check by P20's retro, measured by P23's (`README.md`'s current cell read 1724 / 58 for SIX commits
// while `DECLARED_TOTAL` read 1833), and stale again inside W94 (four copies at 2059 on a tree running 2060, found by a reader).
// W96's declaration measured the hole: `README.md`'s current sentence moved to 2070 / 155 cost `check:docs` EXIT 0.
//
// **Each copy is found by its OWN anchored sentence, never by searching for the number** — P23's retro: a check asking *does
// the README contain the total* passes on a stale cell, because every copy also carries its predecessors' figures in
// parentheses. So the anchors name WHICH copy is current, as `X7`'s does. **Its limit is the anchors'**: a new sentence stating
// the counts that no anchor names is invisible here ([Q217](../doc/questions/q217.md)'s regress, one layer on).
// The subjects are read through overrides for the self-test, obligation (e)'s second question.
const EXAMPLES_README = process.env.CHECK_DOCS_EXAMPLES || join('examples', 'README.md');
const L6_FILE = process.env.CHECK_DOCS_L6 || join('examples', 'l6.ts');
{
  const L6P = join(ROOT, L6_FILE);
  const EXP = join(ROOT, EXAMPLES_README);
  if (!existsSync(L6P) || !existsSync(EXP)) {
    fail('X10', 'examples/l6.ts or examples/README.md is missing, so the L6 counts cannot be compared');
  } else {
    const l6 = readFileSync(L6P, 'utf8');
    const total = /^const DECLARED_TOTAL = (\d+);$/m.exec(l6);
    const runs = /^const DECLARED_RUNS = (\d+);$/m.exec(l6);
    if (!total || !runs) {
      fail('X10', 'examples/l6.ts declares no DECLARED_TOTAL or DECLARED_RUNS where X10 looks for them');
    } else {
      const want = { assertions: Number(total[1]), runs: Number(runs[1]) };
      const ex = readFileSync(EXP, 'utf8');
      // [document, text, the copy's name, its anchored sentence, which group is the assertion count]
      const COPIES = [
        ['examples/README.md', ex, 'paragraph under the two commands', /run the same \*\*(\d+) assertions over (\d+) real runs\*\*/, 'ar'],
        ['examples/README.md', ex, '`l6.ts` row', /\| \[`l6\.ts`\]\(l6\.ts\) \| \*\*the gate\.\*\* \*\*(\d+) real runs, (\d+) assertions\*\*/, 'ra'],
      ];
      // **`X10` carries `X8`'s own defect and W107 edited this block without applying its own fix —
      // its adequacy reader.** `COPIES` had no floor of any kind and `compared` gated only the `note`,
      // so narrowing the loop to `COPIES.slice(0, 1)` was EXIT 0 with the note line simply absent, and
      // DELETING an entry was EXIT 0 with the note cheerfully printing *compared 1 copies*. W107 took
      // this list from four entries to two ([ADR 0073](../doc/decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md)
      // decision 5 records that reduction as deliberate) and added nothing to stop the next one, which
      // is [Q171](../doc/questions/q171.md)'s row — these counts going stale — reachable by deletion.
      // So: a floor on the list, and a verdict per entry on every exit path, which is `X8`'s shape
      // above for the reasons stated there.
      const COPIES_FLOOR = 2;
      if (COPIES.length < COPIES_FLOOR) {
        fail('X10', `X10 holds ${COPIES.length} copy/copies of the L6 counts and COPIES_FLOOR is ${COPIES_FLOOR} — ` +
          'a copy and its entry here are two edits in one diff, and this floor is the third');
      }
      let compared = 0;
      const verdicts = [];
      for (const [doc, text, name, re, order] of COPIES) {
        const m = re.exec(text);
        if (!m) {
          fail('X10', `${doc}'s ${name} — the sentence carrying the current L6 counts — is not where X10 looks for it`);
          verdicts.push(name);
          continue;
        }
        const said = order === 'ar' ? { assertions: Number(m[1]), runs: Number(m[2]) } : { assertions: Number(m[2]), runs: Number(m[1]) };
        compared++;
        if (said.assertions !== want.assertions || said.runs !== want.runs) {
          fail('X10', `${doc}'s ${name} says ${said.assertions} assertions over ${said.runs} runs, and examples/l6.ts ` +
            `declares ${want.assertions} over ${want.runs}`);
        }
        verdicts.push(name);
      }
      if (verdicts.length !== COPIES.length) {
        fail('X10', `X10 holds ${COPIES.length} copy/copies of the L6 counts and ${verdicts.length} reached a verdict — ` +
          'every entry in COPIES must reach one, and a loop narrowed to a prefix of it, or short-circuited ' +
          'before its first arm, compares nothing and otherwise says nothing');
      }
      if (compared === COPIES.length) {
        console.log(`note: X10 compared ${compared} copies of the L6 counts against examples/l6.ts's ` +
          `${want.assertions} / ${want.runs}.`);
      }
    }
  }
}

// X11 — RETIRED at [W119](../doc/work-items/w119-the-lookup.md),
// [ADR 0081](../doc/decisions/0081-the-adr-index-is-generated-and-x11-leaves-with-it.md). It compared
// `doc/decisions/README.md`'s hand-kept index with the ADRs on disk, both ways, because that index
// was a SECOND LIST typed by hand and 29 of the 46 commits that touched the directory had shipped it
// short. The index is now generated — `npm run adr -- --index` — so there is no second list, and a
// comparison of the folder with what it generates is the folder compared with itself. The id stays
// retired, never reissued: `doc/workflow.md` section 3, one level in.

const checks = [
  'X1 the reference exists and its fences parse',
  'X2 every ```ts block is tagged run or check, or opts out explicitly',
  'X3 every tagged snippet typechecks against index.ts',
  'X4 every `run` snippet executes, and asserts something',
  'X5 no snippet fails under the DOM lib a browser consumer compiles with (zero since W57 closed Q71)',
  'X6 AGENTS.md`s cost figures ARE spec/flow-definition.md section 3`s, both ways',
  'X7 AGENTS.md`s refusal count IS spec/flow-definition.md section 5`s row count, and its range end the highest row',
  'X8 every ```ts fence in README.md IS the executed AGENTS.md snippet its section NAMES, byte for byte, both ways',
  'X9 the version README.md tells a consumer to expect IS the version both manifests carry',
  'X10 every current copy of the L6 counts in examples/README.md IS what examples/l6.ts declares',
];
const runCount = written.filter((x) => x.tag === 'run').length;
console.log(`docs check — ${all.length} snippet(s): ${runCount} run, ` +
  `${written.length - runCount} check, ${all.length - written.length} untagged`);
console.log(`             under the DOM lib, failing: ${domFailing}\n`);
for (const c of checks) {
  // The id is the report line's first WORD, never its first two characters — W96: `c.slice(0, 2)` read `X10` as `X1`, so the
  // row for a two-digit id would have printed `X1`'s verdict and never its own.
  const bad = failures.filter((f) => f.startsWith(c.split(' ')[0] + ':'));
  console.log(`  ${bad.length ? 'FAIL' : 'ok  '}  ${c}${bad.length ? ` (${bad.length})` : ''}`);
}
if (failures.length) {
  console.log('\n' + failures.map((f) => '  ' + f).join('\n'));
  console.log(`\n${failures.length} failure(s).`);
  process.exit(1);
}
console.log('\nAll checks passed.');
