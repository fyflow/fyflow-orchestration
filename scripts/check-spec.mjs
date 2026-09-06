#!/usr/bin/env node
// Ladder L0 for a document-only work item: a mechanical check that spec/ is
// well-formed and self-consistent. See doc/work-items/w1-the-normative-layer.md
// for why L0 is redefined here rather than reported as not applicable.
//
// Zero dependencies and no package.json on purpose: W1 must not choose W2's
// toolchain (doc/work-items/w1-the-normative-layer.md, Scope/Out).
//
//   node scripts/check-spec.mjs              node scripts/check-spec.mjs --self-test
//
// Exits 0 when every check passes, 1 otherwise. It reports; it does not fix.
//
// **`CHECK_SPEC_DIR` points every check at a copy of `spec/`**, which is how
// `--self-test` builds the invalid `spec/` this repository does not contain without
// writing a byte into the real one. Every path below derives from `SPEC`, so one
// override reaches `C1`-`C8`; `rel()` still resolves against `ROOT`, because it only
// ever labels a message. It exists for the self-test and for nothing else, on the
// pattern of `CHECK_SOURCE_PKG` and `CHECK_SCHEDULER_DTS`.
//
// **The fixture must carry `doc/` beside its `spec/`, and that is measured rather
// than assumed.** Every relative link in `spec/**` points into `../doc/**` — 88 of
// them at `doc/open-questions.md` alone — so a copy with no sibling `doc/` reports
// **195** dead links under `C5` and drowns every other probe in noise. W30 measured
// both directions: 195 without it, 0 with it, and 23 with it present and one link
// deliberately broken.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// W25: C5's implementation lives here now. See the C5 block below.
import { resolveLinks } from './check-markdown.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SPEC = process.env.CHECK_SPEC_DIR ? resolve(ROOT, process.env.CHECK_SPEC_DIR) : join(ROOT, 'spec');

// **Dispatched BEFORE the checks run**, which is `check-docs.mjs`'s form rather than
// `check-scheduler.mjs`'s. A META child spawns this script once per entry and the
// checks it would run first are pure waste; the flag is the whole of the argument.
if (process.argv.includes('--self-test')) {
  const { selfTest } = await import('./check-spec-selftest.mjs');
  process.exit(await selfTest(ROOT));
}

const RULE_ID = /\b(FD-V\d+|FD-R\d+|ID-R\d+|OR-R\d+|RS-R\d+|RN-R\d+|RT-R\d+|JP-R\d+)\b/g;
const failures = [];
const notes = [];
const fail = (check, msg) => failures.push(`${check}: ${msg}`);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const files = walk(SPEC);
const rel = p => relative(ROOT, p).replace(/\\/g, '/');
const mdFiles = files.filter(p => p.endsWith('.md'));
const jsonFiles = files.filter(p => p.endsWith('.json'));

// --- C1: every example parses -------------------------------------------------
const parsed = new Map();
for (const p of jsonFiles) {
  try {
    parsed.set(p, JSON.parse(readFileSync(p, 'utf8')));
  } catch (e) {
    fail('C1', `${rel(p)} does not parse — ${e.message}`);
  }
}

// --- C2: every rule id is DECLARED exactly once -------------------------------
// A declaration is a table row whose first cell is a backticked rule id:
//   | `FD-V7` | a task node has no edges ... |
// Mentions elsewhere are citations and are not counted.
// A rule may also be declared ABSENT — a held id with no rule behind it, so a
// gap in the sequence is not read as a rule someone lost. It is exempt from C4.
const declared = new Map(); // id -> [file, ...]
const absent = new Set();
const rowOf = new Map(); // id -> the declaring row's cells, for C6
const mentioned = new Set();
for (const p of mdFiles) {
  const text = readFileSync(p, 'utf8');
  for (const m of text.matchAll(RULE_ID)) mentioned.add(m[1]);
  for (const line of text.split(/\r?\n/)) {
    const m = /^\|\s*`(FD-V\d+|FD-R\d+|ID-R\d+|OR-R\d+|RS-R\d+|RN-R\d+|RT-R\d+|JP-R\d+)`\s*\|(.*)$/.exec(line);
    if (!m) continue;
    if (!declared.has(m[1])) declared.set(m[1], []);
    declared.get(m[1]).push(rel(p));
    if (/deliberately absent/i.test(m[2])) absent.add(m[1]);
    rowOf.set(m[1], line.replace(/^\||\|$/g, '').split('|').map(c => c.trim()));
  }
}
for (const [id, where] of declared) {
  if (where.length > 1) fail('C2', `${id} is declared ${where.length} times — ${where.join(', ')}`);
}
for (const id of mentioned) {
  if (!declared.has(id)) fail('C2', `${id} is cited but never declared in a rules table`);
}

// --- C3 + C4: refusal coverage ------------------------------------------------
// C3: every invalid example's filename prefix names a declared rule.
// C4: every DEFINITION refusal (FD-V*) is named by at least one invalid example.
//     Runtime refusals (FD-R*, ID-R*, OR-R*) cannot be an example flow; their
//     coverage is the owning work item's gate, not this script's.
const INVALID_DIR = join(SPEC, 'examples', 'invalid');
const covered = new Set();
if (!existsSync(INVALID_DIR)) {
  fail('C3', 'spec/examples/invalid/ does not exist');
} else {
  for (const name of readdirSync(INVALID_DIR)) {
    const m = /^([A-Z]+-[A-Z]\d+)--.+\.flow\.json$/.exec(name);
    if (!m) {
      fail('C3', `spec/examples/invalid/${name} is not named <rule-id>--<slug>.flow.json`);
      continue;
    }
    if (!declared.has(m[1])) fail('C3', `spec/examples/invalid/${name} names ${m[1]}, which no rules table declares`);
    covered.add(m[1]);
  }
}
const definitionRefusals = [...declared.keys()].filter(id => id.startsWith('FD-V') && !absent.has(id));
for (const id of definitionRefusals.sort()) {
  if (!covered.has(id)) fail('C4', `${id} is a definition refusal with no case in spec/examples/invalid/`);
}
for (const id of covered) {
  if (absent.has(id)) fail('C4', `${id} is declared absent but has a case in spec/examples/invalid/`);
}
const notExamplable = [...declared.keys()].filter(id => !id.startsWith('FD-V'));
notes.push(
  `C4 covered ${definitionRefusals.length} definition refusals` +
  (absent.size ? `, and skipped ${[...absent].sort().join(', ')} as declared absent` : '') + '.'
);
notes.push(
  `NOT checked here: ${notExamplable.length} rules no example flow can express ` +
  `(${notExamplable.sort().join(', ')}). C6 checks each names an owner; whether that test EXISTS ` +
  `is the named item's gate, not this script's.`
);

// --- C6: every non-FD-V rule names the item owing its test --------------------
// spec/README.md claims this; W1's own conformity pass found 12 of 16 rules sitting
// in bare two-column tables with no owner at all. This is that claim made checkable.
for (const id of notExamplable.sort()) {
  const cells = rowOf.get(id) ?? [];
  const owner = cells.length >= 3 ? cells[cells.length - 1] : '';
  if (!owner) fail('C6', `${id}'s declaring row has no "Test owed by" cell`);
}

// --- C7: the valid corpus resolves against the declared registry --------------
// The one SEMANTIC check L0 can honestly make. FD-V4 and FD-V5 are refusals about
// a registry, so without one written down neither case can be evaluated and every
// other example's `when` name is unchecked. Full definition validation is W3's L4;
// this is the slice that needs no graph logic.
const REG = join(SPEC, 'examples', 'registry.json');
const VALID_DIR = join(SPEC, 'examples', 'valid');
if (!existsSync(REG)) {
  fail('C7', 'spec/examples/registry.json does not exist');
} else if (existsSync(VALID_DIR)) {
  const reg = parsed.get(REG) ?? {};
  const preds = new Set(reg.predicates ?? []), wts = new Set(reg.workerTypes ?? []);
  for (const name of readdirSync(VALID_DIR)) {
    const doc = parsed.get(join(VALID_DIR, name));
    for (const n of doc?.nodes ?? []) {
      if (n.kind === 'task' && !wts.has(n.workerType))
        fail('C7', `valid/${name}: workerType "${n.workerType}" is not in registry.json`);
      for (const e of n.edges ?? [])
        if (e.when !== undefined && !preds.has(e.when))
          fail('C7', `valid/${name}: predicate "${e.when}" is not in registry.json`);
    }
  }
  // and the two refusal cases must name things the registry does NOT have
  const invDir = join(SPEC, 'examples', 'invalid');
  for (const name of existsSync(invDir) ? readdirSync(invDir) : []) {
    const doc = parsed.get(join(invDir, name));
    if (name.startsWith('FD-V4--')) {
      const names = (doc?.nodes ?? []).flatMap(n => (n.edges ?? []).map(e => e.when)).filter(Boolean);
      if (!names.some(w => !preds.has(w))) fail('C7', `invalid/${name} names no predicate absent from registry.json`);
    }
    if (name.startsWith('FD-V5--')) {
      const wt = (doc?.nodes ?? []).filter(n => n.kind === 'task').map(n => n.workerType);
      if (!wt.some(w => !wts.has(w))) fail('C7', `invalid/${name} names no workerType absent from registry.json`);
    }
  }
}

// --- C8: spec/README's version column matches each document's own header ------
// The third conformity pass found README stale against three of the five documents
// it indexes — and README is the first thing W2 and W3 read to know which version
// of the layer they are building against. A reader found it; a check should.
const README = join(SPEC, 'README.md');
if (existsSync(README)) {
  const idx = readFileSync(README, 'utf8');
  for (const p of mdFiles) {
    if (p === README) continue;
    const base = p.split(/[\\/]/).pop();
    const own = /\*\*Status:\*\*\s*(v\d+\.\d+)/.exec(readFileSync(p, 'utf8'));
    if (!own) { fail('C8', `spec/${base} has no "**Status:** vN.N" header`); continue; }
    const row = idx.split(/\r?\n/).find(l => l.startsWith('|') && l.includes(`(${base})`));
    if (!row) { fail('C8', `spec/README.md has no index row for ${base}`); continue; }
    if (!row.includes(`**${own[1]}**`))
      fail('C8', `spec/README.md lists ${base} as something other than ${own[1]}, which is its own header`);
  }
}

// --- C5: every relative link inside spec/ resolves ----------------------------
// **LIFTED to `scripts/check-markdown.mjs` by W25, and the id stays.** `C5` has done
// this for `spec/` since W1 and `doc/` had nothing; the two are one comparison, so
// the implementation moved and this is now the caller. `C5` is cited in nine
// documents and `doc/workflow.md` section 3 forbids renumbering, so the report row
// below is unchanged and the failures are still labelled `C5`.
//
// **The lift also gains `spec/` two things it never had** — code spans blanked
// before parsing, and anchors resolved — and both are measured **inert here**:
// `spec/` reported 0 dead links before and after, and carries **zero** links with an
// anchor at all. It is `doc/` that illustrates link syntax in prose and `doc/` that
// had fourteen dead anchors.
const linkResult = resolveLinks(mdFiles, ROOT);
for (const d of linkResult.dead) fail('C5', d);
for (const d of linkResult.deadAnchors) fail('C5', d);

// --- report -------------------------------------------------------------------
const checks = ['C1 examples parse', 'C2 rule ids unique', 'C3 invalid examples name a rule',
                'C4 every definition refusal has a case', 'C5 links resolve',
                'C6 every other rule names a test owner',
                'C7 valid corpus resolves against registry.json',
                'C8 README version column matches each document'];
console.log(`spec check — ${mdFiles.length} documents, ${jsonFiles.length} examples, ${declared.size} rules\n`);
for (const c of checks) {
  // **The id is the first word, not the first two characters** — the exact
  // expression W24 repaired in `check-source.mjs`, where `c.slice(0, 2)` read
  // `S10`-`S13` all as `S1`, so four rows printed one check's failure count and
  // their own never appeared. **W24 fixed its own copy and this sibling kept the
  // defect**, which is [Q137](../doc/open-questions.md)'s shape — a lift moves an
  // implementation and does not move the guards the two sides needed differently —
  // one file across.
  //
  // **It is inert today and W30 says so rather than implying a live fix**: every id
  // this script reports is two characters, so both expressions agree on all eight
  // rows and no probe here can discriminate them. It goes live at `C10`. The
  // discriminating case was CONSTRUCTED and measured rather than left as an
  // argument — see `scripts/check-spec-selftest.mjs`'s header.
  const id = c.slice(0, c.indexOf(' '));
  const bad = failures.filter(f => f.startsWith(id + ':'));
  console.log(`  ${bad.length ? 'FAIL' : 'ok  '}  ${c}${bad.length ? ` (${bad.length})` : ''}`);
}
if (notes.length) console.log('\n' + notes.map(n => '  note: ' + n).join('\n'));
if (failures.length) {
  console.log('\n' + failures.map(f => '  ' + f).join('\n'));
  console.log(`\n${failures.length} failure(s).`);
  process.exit(1);
}
console.log('\nAll checks passed.');
