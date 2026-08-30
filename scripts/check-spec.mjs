#!/usr/bin/env node
// Ladder L0 for a document-only work item: a mechanical check that spec/ is
// well-formed and self-consistent. See doc/work-items/w1-the-normative-layer.md
// for why L0 is redefined here rather than reported as not applicable.
//
// Zero dependencies and no package.json on purpose: W1 must not choose W2's
// toolchain (doc/work-items/w1-the-normative-layer.md, Scope/Out).
//
//   node scripts/check-spec.mjs
//
// Exits 0 when every check passes, 1 otherwise. It reports; it does not fix.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SPEC = join(ROOT, 'spec');

const RULE_ID = /\b(FD-V\d+|FD-R\d+|ID-R\d+|OR-R\d+|RS-R\d+|RT-R\d+|JP-R\d+)\b/g;
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
    const m = /^\|\s*`(FD-V\d+|FD-R\d+|ID-R\d+|OR-R\d+|RS-R\d+|RT-R\d+|JP-R\d+)`\s*\|(.*)$/.exec(line);
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
for (const p of mdFiles) {
  const text = readFileSync(p, 'utf8');
  for (const m of text.matchAll(/\]\(([^)#\s]+)(?:#[^)\s]*)?\)/g)) {
    const target = m[1];
    if (/^[a-z]+:/i.test(target)) continue; // external
    const abs = resolve(dirname(p), target);
    if (!existsSync(abs)) fail('C5', `${rel(p)} links to ${target}, which does not exist`);
  }
}

// --- report -------------------------------------------------------------------
const checks = ['C1 examples parse', 'C2 rule ids unique', 'C3 invalid examples name a rule',
                'C4 every definition refusal has a case', 'C5 links resolve',
                'C6 every other rule names a test owner',
                'C7 valid corpus resolves against registry.json',
                'C8 README version column matches each document'];
console.log(`spec check — ${mdFiles.length} documents, ${jsonFiles.length} examples, ${declared.size} rules\n`);
for (const c of checks) {
  const id = c.slice(0, 2);
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
