#!/usr/bin/env node
// Bundle the test suites for the browser — `RT-R1`'s third runtime.
//
// Two problems the other two runtimes do not have, and one rule that shapes both:
//
//   1. **A browser has no filesystem**, and L4's fixtures are files. The corpus is
//      inlined into the bundle as `__FYFLOW_CORPUS__`; `test/harness.ts` prefers it
//      when present, so **the suites themselves are byte-identical in all three
//      runtimes** — which is what `RT-R1` is actually asking for.
//   2. **The output is ESM, not IIFE.** The suites load their fixtures at module
//      scope, so they use top-level await, which the IIFE format forbids. The
//      runner injects the bundle as `<script type="module">`.
//   3. **The entry must import every suite statically**, because a bundle has no
//      dynamic `import()` of a local path. That would normally mean a maintained
//      list, which W3's declaration forbids: *"the test runner MUST discover suites
//      by globbing, so a later item adds a file rather than editing a shared
//      list."* So the entry is **generated** from the same glob the Node and Deno
//      runner uses. Derived, never maintained.
//
// Output: dev-dist/browser/tests.js — an ES module that runs the suite and leaves
// `globalThis.__FYFLOW_RESULT__ = { passed, failures, suites }`.

import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const SEP = String.fromCharCode(92); // a backslash, without escaping it in a template
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const toPosix = (p) => p.split(SEP).join('/');
const relPosix = (p) => toPosix(relative(ROOT, p));

function walk(dir, keep) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, keep));
    else if (keep(name)) out.push(p);
  }
  return out;
}

// The same glob the Node and Deno runner uses.
const suites = walk(join(ROOT, 'test'), (n) => n.endsWith('.test.ts')).sort();
// Every fixture L4 reads. Inlined rather than fetched: an `about:blank` page has
// no origin to fetch from.
//
// **`spec/flow-definition.md` is here because L4 reads it** — `test/definition/l4-corpus.test.ts`
// compares `spec/examples/valid/` against section 7's own table both ways
// ([W32](../doc/work-items/w32-what-a-map-fanout-is.md)). It is the first non-JSON
// entry and the first outside `spec/examples/`, so the walk is no longer the whole
// story and the list says so.
//
// **The failure this fixes is worth stating, because it is silent in the wrong
// way.** `readText` throws for a path the corpus does not carry; the suites read
// their fixtures at MODULE SCOPE, so the throw happens while the bundle is
// LOADING and takes **every** suite with it. The runner then reports *"the suite
// never reported"* at **0 file(s), 1 assertion** — measured in all three browsers.
// A missing fixture does not fail one test; it fails the run in a way that names
// no file.
//
// **`spec/join-policy.md` is here because [W33](../doc/work-items/w33-a-map-at-run-time-arity.md)
// binds section 3's `arrival-count` ROW** — `test/fold/policies.test.ts` refuses the
// retired `region.branches.length` wording, after its adequacy reader measured that
// reverting that row left `check-policies`, `check-spec` and all 543 cases green.
//
// **And its failure mode was BETTER than the one above, which is the half worth
// recording.** That read is inside a `test()` rather than at module scope, so the
// missing fixture failed **one** test naming its own path —
// `fixture not inlined in the browser bundle: spec/join-policy.md`, 21 files / 553
// assertions, 1 failure — instead of taking all twenty-one suites down at
// `0 file(s), 1 assertion`. Same defect, same check, and the difference is entirely
// WHERE the read happens. A fixture read at module scope is a bundle-wide hazard;
// the same read inside a test is an ordinary failing test.
// **`spec/outcome-record.md` is here because `OR-R11`'s suite reads its boundary
// TABLE** — `test/fold/result-value.test.ts` compares the 27 shapes it asserts to the
// rows that document tabulates, both ways, and derives the `14 / 124 / 89%` split from
// both corpora and checks it against that document's own sentence. Added by
// [W54](../doc/work-items/w54-what-a-result-may-be-and-what-bounding-it-would-cost.md),
// and it is the THIRD time a suite reading a `spec/**` document has turned the browser
// rungs red while node and deno stayed green — W32's, W33's, and this.
//
// **What is new is how it was MISSED, and it is worth more than the fix.** The author
// ran `npm run test:browser:all` twice after the reads were added and reported it green
// both times, because the command was piped through `grep -E "file\(s\)|PARITY"` — and
// the `27 file(s), 703 assertions` line prints BEFORE the failures. `doc/workflow.md`
// section 4, v0.15: **a rung reported GREEN means its command EXITED 0, and a line of
// its output is never the predicate.** That clause was adopted one plan ago, this item
// quotes it in its own Verification table, and it was broken while being quoted.
const fixtures = [
  ...walk(join(ROOT, 'spec', 'examples'), (n) => n.endsWith('.json')),
  join(ROOT, 'spec', 'flow-definition.md'),
  join(ROOT, 'spec', 'join-policy.md'),
  join(ROOT, 'spec', 'outcome-record.md'),
  // **The SECOND corpus, for the same suite.** `OR-R11`'s corpus half walks BOTH
  // `spec/examples/valid/` and `examples/flows/` — that is what makes the split
  // `14 of 124` rather than 6 of 60 — and only the first was inlined. Without these
  // the assertion does not fail to RUN; it runs against half a corpus and reports a
  // different number, which is the more dangerous of the two failure modes and is why
  // it is caught by an equality against the document rather than by a floor.
  // 18 files, ~69 KiB.
  ...walk(join(ROOT, 'examples', 'flows'), (n) => n.endsWith('.json')),
  // **The GENERATED signature file, and it is the first `.ts` entry here** — W74. The recipe's
  // whole claim is that `examples/getting-started/session-types.ts` IS what `signatureOf` emits
  // from the session registry's schemas, and `test/definition/assist.test.ts` holds the two
  // together BOTH WAYS by reading the file. Without this the browser rungs are red on that one
  // test while node and deno stay green — the fourth time a suite reading a file outside
  // `spec/examples/` has done that (W32's, W33's, W54's, this). It is read inside a `test()`, so
  // the failure mode is W33's better one: one named test rather than the whole bundle.
  join(ROOT, 'examples', 'getting-started', 'session-types.ts'),
  // **Two `src/**` modules, as TEXT, because W76's binding is a claim about two LISTS in one file
  // and a PARTITION across two** — [W76](../doc/work-items/w76-what-start-accepts.md),
  // [P20](../doc/plans/p20-what-the-runtime-owes-a-consumer.md) decision 5. `StartOptions`' `Pick`
  // and `start`'s conditional spreads are two hand-written lists nothing compared, and P20 fact 2
  // measured that widening the first without the second is green on all five typecheckers,
  // `npm test`, `check:source` AND `check:docs`. The binding is `doc/workflow.md` rule 8 obligation
  // (e)'s third shape — *find the other list and compare BOTH WAYS* — and the only place both lists
  // exist is the source, so the suite reads it.
  //
  // **The bundle already carries both of these COMPILED; what it did not carry is their TEXT.**
  // That is the whole cost: **193.0 KB**, and the corpus goes 386.1 KB -> 579.1 KB in a dev-only
  // artifact. The alternative priced at W76`s declaration was a `check-source` clause, which the
  // plan's decision 5 declines by name, and skipping the test in the browser, which would be a rung
  // green on a test that did not run with no `RT-R10` reason behind it.
  //
  // **This is the FIFTH time a suite reading a file outside `spec/examples/` has reached here**, and
  // the fourth entry's comment above enumerates the first three. Both are read inside a `test()`, so
  // the failure mode is W33's better one — one named test rather than the whole bundle.
  join(ROOT, 'src', 'scheduler', 'runtime.ts'),
  join(ROOT, 'src', 'driver', 'driver.ts'),
].sort();
const corpus = Object.fromEntries(fixtures.map((p) => [relPosix(p), readFileSync(p, 'utf8')]));

// Absolute specifiers: the generated entry lives in dev-dist/, so a path relative
// to the repository root would not resolve from there.
// The corpus assignment lives in its OWN module, imported first. ES module
// imports are HOISTED: written as a statement in the entry it would run *after*
// every suite had already loaded its fixtures at module scope, and the harness
// would fall through to its Node branch — which is exactly the failure this
// bundle exists to rule out.
mkdirSync(join(ROOT, 'dev-dist'), { recursive: true });
const corpusModule = join(ROOT, 'dev-dist', 'corpus.generated.js');
writeFileSync(
  corpusModule,
  `globalThis.__FYFLOW_CORPUS__ = ${JSON.stringify(corpus)};
`,
);

const imports = [
  `import ${JSON.stringify(toPosix(corpusModule))};`,
  `import { collected } from ${JSON.stringify(toPosix(join(ROOT, 'test', 'harness.ts')))};`,
  ...suites.map((p, i) => `import * as s${i} from ${JSON.stringify(toPosix(p))};`),
  suites.map((_p, i) => `void s${i};`).join(' '),
].join('\n');

const entry = [
  imports,
  '',
  '// ESM output, so top-level await is legal — which the suites need for fixtures.',
  'async function main() {',
  '  const failures = [];',
  '  let passed = 0;',
  '  for (const { suite, cases } of collected()) {',
  '    for (const c of cases) {',
  '      try { await c.fn(); passed++; }',
  '      catch (e) { failures.push(suite + " > " + c.name + "\\n    " + ((e && e.message) || String(e))); }',
  '    }',
  '  }',
  `  return { passed, failures, suites: ${suites.length} };`,
  '}',
  '',
  'main().then(',
  '  (r) => { globalThis.__FYFLOW_RESULT__ = r; },',
  '  (e) => { globalThis.__FYFLOW_RESULT__ = { passed: 0, failures: [String((e && e.stack) || e)], suites: 0 }; },',
  ');',
].join('\n');

const generated = join(ROOT, 'dev-dist', 'browser-entry.generated.ts');
mkdirSync(dirname(generated), { recursive: true });
writeFileSync(generated, entry);

await esbuild.build({
  entryPoints: [generated],
  bundle: true,
  platform: 'browser',
  format: 'esm',
  target: 'es2022',
  // `test/harness.ts` reaches node:fs on its Node branch, which the browser
  // branch short-circuits before — unreachable here, but the bundler still has to
  // resolve it. Left external so the dynamic import survives unevaluated.
  // RT-R7 exempts the harness; that this is the ONLY external is the evidence
  // that no published module and no suite reaches for a Node builtin.
  external: ['node:fs'],
  outfile: join(ROOT, 'dev-dist', 'browser', 'tests.js'),
  logLevel: 'warning',
});

console.log(
  `browser bundle — ${suites.length} suite(s), ${fixtures.length} fixture(s) inlined ` +
    `-> dev-dist/browser/tests.js`,
);
