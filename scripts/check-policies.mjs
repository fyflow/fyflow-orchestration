#!/usr/bin/env node
// **`JP-R9`: a policy id exists in `spec/join-policy.md` section 3 or it does not
// exist.** This script is the comparison; without it the two halves are two
// hand-written copies of one claim, and `doc/` is checked by nothing.
//
//   node scripts/check-policies.mjs              node scripts/check-policies.mjs --self-test
//
// **Why this check and why now.** The set of policies was frozen at two from P1
// until W16, by four literals in four test files and one `AGENTS.md` snippet —
// nothing compared any of them to the document that *fixes the names*. ADR 0025
// is what makes the set able to grow: `JP-R7` and `JP-R8` both say a refinement
// is built *"under its own id"*, so the next one arrives the same way this one
// did. A name in `POLICIES` that section 3 does not fix is a policy whose
// definition is its implementation, which `spec/README.md` rule 1 forbids; a name
// in section 3 with nothing behind it is `spec/run-state.md` section 5's class —
// a document asserting what its own inputs cannot supply.
//
// It reports; it does not fix. Exits 0 when every check passes, 1 otherwise.
//
// `CHECK_POLICIES_SPEC` and `CHECK_POLICIES_SRC` point the checks at a copy, which
// is how `--self-test` breaks each half in turn without touching the tree.

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SPEC = process.env.CHECK_POLICIES_SPEC ?? 'spec/join-policy.md';
const SRC = process.env.CHECK_POLICIES_SRC ?? 'src/fold/policies.ts';

const failures = [];
const fail = (check, msg) => failures.push(`${check}: ${msg}`);

/**
 * The ids section 3's **first** table declares — its `| id | Definition |` rows.
 *
 * The second table in that section declares `JP-R7`, `JP-R8` and `JP-R9`, whose
 * first cell is backticked too, so "the first table after the heading" is the
 * discriminator rather than the cell shape. A rule id reaching this list would
 * mean the parser walked past the table it was written for.
 */
function specIds(text) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => /^##\s+3\.\s/.test(l));
  if (start < 0) return null; // P3 reports it; an empty list must not pass as "no rows"
  const ids = [];
  let seen = false;
  for (const line of lines.slice(start + 1)) {
    if (/^##\s/.test(line)) break;
    if (!line.startsWith('|')) { if (seen) break; continue; }
    seen = true;
    const cell = line.replace(/^\|/, '').split('|')[0].trim();
    if (/^\|?\s*-+\s*$/.test(cell) || cell === 'id' || cell === '`id`') continue;
    const m = /^`([^`]*)`$/.exec(cell);
    if (!m) continue;
    ids.push(m[1]);
  }
  return ids;
}

/**
 * `POLICIES`' keys and the exported binding each maps to, read as source rather
 * than imported — this file must be readable by a check that does not choose a
 * toolchain, the constraint `scripts/check-spec.mjs` states in its own header.
 */
function srcPolicies(text) {
  const m = /export const POLICIES = \{([\s\S]*?)\n\} as const;/.exec(text);
  if (!m) return null;
  const out = [];
  for (const row of m[1].matchAll(/'([^']+)'\s*:\s*([A-Za-z0-9_]+)\s*,?/g)) {
    out.push({ key: row[1], binding: row[2] });
  }
  return out;
}

/** The `id:` literal each exported policy object carries. */
function bindingIds(text) {
  const out = new Map();
  for (const m of text.matchAll(/export const ([A-Za-z0-9_]+)[^=]*= \{\s*\n\s*id: '([^']*)'/g)) {
    out.set(m[1], m[2]);
  }
  return out;
}

const specText = readFileSync(join(ROOT, SPEC), 'utf8');
const srcText = readFileSync(join(ROOT, SRC), 'utf8');

const names = specIds(specText);
const policies = srcPolicies(srcText);
const ids = bindingIds(srcText);

// --- P3: both halves were actually FOUND ------------------------------------
// A parser that matches nothing reports two empty sets and passes P1 for the
// wrong reason — the vacuity `doc/workflow.md` section 5 rule 7 (b) refuses of a
// probe, applied to the check itself.
if (names === null) fail('P3', `${SPEC} has no "## 3." heading, so no policy names were read`);
else if (names.length < 2) {
  fail('P3', `${SPEC} section 3 declares ${names.length} policy name(s); at least the two ` +
    'pinned by JP-R7 and JP-R8 must be there, so this is a parse failure rather than a spec change');
} else if (!/\|\s*`JP-R9`\s*\|/.test(specText)) {
  // **The check's own charter has to exist.** `JP-R9` is what this script
  // enforces, and W16's adequacy reader deleted its row from the spec with every
  // check here still green — a rule with a test and no declaration, which is the
  // inverse of the defect P1 catalogued. `check-spec`'s C2 and C6 constrain a
  // rule that IS declared and say nothing about one that vanishes.
  fail('P3', `${SPEC} no longer declares \`JP-R9\`, which is the rule this check enforces`);
} else if (names.some((n) => n.trim() === '')) {
  // **Found by this file's own probes at birth**, which is rule 7 (a) earning
  // itself on its first run: a row whose id cell is an empty pair of backticks
  // parsed to `''`, which kept the LENGTH above the floor and reported as a set
  // mismatch — a malformed table dressed as a spec change.
  fail('P3', `${SPEC} section 3 has a row with an empty id cell, which is a malformed table`);
}
if (policies === null) fail('P3', `${SRC} has no "export const POLICIES = { ... } as const;" block`);
else if (policies.length === 0) fail('P3', `${SRC}'s POLICIES block declares no members`);

/**
 * **If either half could not be read, P1 and P2 do not run.** A set comparison
 * built on a list nobody could parse reports a mismatch that is true of the parse
 * and says nothing about the code — and it buries the one failure a reader can
 * act on under three that they cannot. This is the shape `doc/workflow.md`
 * section 5 rule 7 (c) asks a probe to make visible: with P1 firing alongside, a
 * malformed spec and a genuine drift were indistinguishable from the outside.
 */
const halvesRead = failures.length === 0;

// --- P1: the two sets are equal ----------------------------------------------
if (halvesRead && names && policies) {
  const spec = [...names].sort();
  const code = policies.map((p) => p.key).sort();
  for (const id of code) {
    if (!spec.includes(id)) {
      fail('P1', `POLICIES exports "${id}" and ${SPEC} section 3 does not name it — a policy ` +
        'whose definition is its implementation (JP-R9)');
    }
  }
  for (const id of spec) {
    if (!code.includes(id)) {
      fail('P1', `${SPEC} section 3 names "${id}" and POLICIES has no such key — a name fixed ` +
        'with nothing behind it (JP-R9)');
    }
  }
}

// --- P2: a key is the policy's own id ----------------------------------------
// `POLICIES['live-token']` returning a policy whose `id` is something else would
// make every matrix cell, every `AGENTS.md` snippet and every L6 row label a
// different policy from the one it ran.
for (const { key, binding } of halvesRead ? (policies ?? []) : []) {
  const declared = ids.get(binding);
  if (declared === undefined) {
    fail('P2', `POLICIES maps "${key}" to \`${binding}\`, which is not an exported policy object ` +
      `with an \`id:\` literal in ${SRC}`);
  } else if (declared !== key) {
    fail('P2', `POLICIES maps "${key}" to \`${binding}\`, whose own id is "${declared}"`);
  }
}

// --- report -------------------------------------------------------------------
if (process.argv.includes('--self-test')) {
  const { selfTest } = await import('./check-policies-selftest.mjs');
  process.exit(await selfTest(ROOT));
}

const CHECKS = ['P1 spec section 3 and POLICIES name the same set',
                'P2 every POLICIES key is its policy`s own id',
                'P3 both halves were found and are non-empty'];
console.log(`policy check — ${names?.length ?? 0} name(s) in ${SPEC}, ` +
  `${policies?.length ?? 0} in ${SRC}\n`);
for (const c of CHECKS) {
  const id = c.slice(0, 2);
  const bad = failures.filter((f) => f.startsWith(id + ':'));
  console.log(`  ${bad.length ? 'FAIL' : 'ok  '}  ${c}${bad.length ? ` (${bad.length})` : ''}`);
}
if (failures.length) {
  console.log('\n' + failures.map((f) => '  ' + f).join('\n'));
  console.log(`\n${failures.length} failure(s).`);
  process.exit(1);
}
console.log(`\nAll checks passed — ${names.join(', ')}.`);
