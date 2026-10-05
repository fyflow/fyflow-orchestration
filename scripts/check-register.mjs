#!/usr/bin/env node
// **The register is a folder of files with front matter, and this holds it** —
// [W116](../doc/work-items/w116-a-question-is-a-file.md),
// [ADR 0079](../doc/decisions/0079-a-register-is-files-with-front-matter-and-its-index-is-derived.md),
// [P28](../doc/plans/p28-what-can-be-looked-up-instead-of-read.md) decisions 1 and 3. The
// seventeenth gate entry.
//
//   node scripts/check-register.mjs           node scripts/check-register.mjs --self-test
//
// Exits 0 when every clause that RAN passes, 1 otherwise. It reports; it does not fix.
//
// **What it replaces, and why the replacement is smaller.** `check-markdown`'s `M7` held the
// register's TABLES — header, delimiter, cell counts, balanced inline markup — because `18eee73`
// deleted a header and the `## Resolved` half rendered as literal pipes for 31 days. `M8` held one
// row per question and a row FLOOR, whose own comment said *a deletion of one to seven rows is a
// declared ceiling: no expression here can see it, because the ids ARE the source*. **One file per
// question removes both subjects**: there is no table to break, and an UNCOMMITTED deletion of a
// question file is a file missing against `HEAD` — that is `R4`, the clause `M8` could not have.
// **Its ceiling, stated where it is claimed** (W116's conformity reader): `R4` compares the tree to
// `HEAD` and nothing older, so a deletion that is COMMITTED is green for ever after, and a fresh
// checkout — CI — can never fire it; `R5` sees a deletion only while the count is under its floor;
// and a question gutted and re-used IN PLACE under its own id is seen by nothing. Q493 prices it.
//
//   R1  every file in doc/questions/ other than README.md is `q<N>.md`, unpadded, and its `id` is
//       `Q<N>`. **No id appears twice BY CONSTRUCTION**: a directory cannot hold two files of one
//       name, and a padded or upper-case name is refused here, so a second `Q17` must sit in a file
//       that is not `q17.md` and is refused by its id. A separate duplicate loop would be a clause
//       no tree can reach — `check-markdown`'s `slug()` comment on a subsumed clause.
//   R2  every field P28 decision 1 declares is present and no other; `status` is one of the four
//       words; `cluster` is a row of doc/questions/README.md's `## Clusters` table; `icebox` carries
//       a non-empty `note`. A file whose front matter cannot be read is an R2 failure, because none
//       of its fields is present.
//   R3  `status: resolved` IF AND ONLY IF `resolved-by` is non-empty, and every ADR, `P<n>` and
//       `W<n>` it names exists in the tree — every ADR in `ADR 0003`, `ADR-0003` and the list form
//       `ADRs 0003 and 0004` / `ADRs 0003, 0004 and 0005`, which W116's adequacy reader passed
//       through the first cut with the second id missing. EXISTS — the header is W117's subject.
//   R4  every question file at `HEAD` is in the working tree — UNCOMMITTED deletions only, see the
//       ceiling above. **It runs only where the tree IS a
//       repository's top level**, and says NOT RUN otherwise rather than passing: a staged copy
//       under `dev-dist/` sits INSIDE this repository, so `git` would discover the outer one and
//       list `HEAD`'s `dev-dist/.../doc/questions/` — nothing — and the clause would pass over a
//       deletion it never compared.
//   R5  a vacuity floor on the file count — a ratchet that only moves UP, because a question is
//       never deleted (`doc/workflow.md` section 3), so a floor set at a day's count is valid for
//       ever. What it cannot see is a deletion matched by an addition; that is `R4`'s.

import { readdirSync, readFileSync, statSync, existsSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// **The dispatch goes HERE, before the check runs** — `check-wiring.mjs`'s own comment: below the
// check it is unreachable on a failing run, and `G1` reports a file whose `--self-test` does not
// reach the module `CHECK_REGISTER_SELFTEST` names.
if (process.argv.includes('--self-test')) {
  const mod = process.env.CHECK_REGISTER_SELFTEST ?? join(ROOT, 'scripts', 'check-register-selftest.mjs');
  const { selfTest } = await import(pathToFileURL(resolve(ROOT, mod)).href);
  process.exit(await selfTest(ROOT));
}

/**
 * **`CHECK_REGISTER_ROOT` points the check at a staged tree**, which is how the self-test breaks an
 * input without touching this one. The gate sets nothing, so the DEFAULT — this repository — is
 * what every gate run reads.
 */
const MEASURE_ROOT = process.env.CHECK_REGISTER_ROOT
  ? resolve(ROOT, process.env.CHECK_REGISTER_ROOT)
  : ROOT;
const DIR = 'doc/questions';
const README = 'README.md';

const failures = [];
const fail = (check, msg) => failures.push(`${check}: ${msg}`);
/** Which clauses executed — `NOT RUN` is a third state and it is not `ok` (W5). */
const ran = { R1: false, R2: false, R3: false, R4: false, R5: false };
let r4Why = '';
/** What R3 and R4 compared, printed so a reader can check the check against its own work. */
let refsChecked = 0, atHeadCount = 0;

/** P28 decision 1's fields, in its order. Every file carries all ten. */
const FIELDS = Object.freeze(['id', 'title', 'status', 'cluster', 'owner', 'closes-when',
  'resolved-by', 'note', 'raised-by', 'shared']);
/** The four status words — P28 decision 1, `icebox` decided by the maintainer on 2026-10-04. */
const STATUSES = Object.freeze(['open', 'deferred', 'icebox', 'resolved']);
/** Fields that are never empty: a question with no id, title, status or cluster is not one. */
const NON_EMPTY = Object.freeze(['id', 'title', 'status', 'cluster']);
/**
 * **`R5`'s floor: 383 is the count W116 migrated, and it only ever moves UP.** A question is never
 * deleted, so this is valid for ever at any later day's count; raising it is a choice, never an
 * obligation, which is the opposite of [Q102](../doc/open-questions.md)'s hazard.
 */
const QUESTION_FLOOR = 383;
const NAME = /^q([1-9][0-9]*)\.md$/;
/** YAML 1.1 and 1.2 core-schema scalars that a plain value would be TYPED as: null, booleans, numbers. */
const YAML_TYPED = /^(?:~|null|Null|NULL|true|True|TRUE|false|False|FALSE|yes|Yes|YES|no|No|NO|on|On|ON|off|Off|OFF|y|Y|n|N|[-+]?(?:\d[\d_]*(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?|0x[0-9a-fA-F_]+|0o[0-7_]+|[-+]?\.(?:inf|Inf|INF)|\.(?:nan|NaN|NAN))$/;
/**
 * Every ADR id a `resolved-by` names: `ADR 0003`, `ADR-0003`, and the list forms `ADRs 0003 and
 * 0004`, `ADRs 0003, 0004 and 0005`, `ADRs 0003/0004`. Each match's 4-digit ids are all read.
 */
const ADR_REF = /\bADRs?[\s-]+(\d{4}(?:(?:\s*,\s*(?:and\s+|or\s+)?|\s+and\s+|\s+or\s+|\s*\/\s*)\d{4})*)\b/g;

/**
 * **The front matter, read as the SUBSET the README declares** — `key: value` per line, a value
 * either a plain run or a JSON double-quoted string. Anything else is refused, never guessed at: a
 * reader that accepts what it cannot parse reports a field it never read.
 * Returns `{ fields, order }` or `{ error }`.
 */
export function readFrontMatter(text) {
  if (!text.startsWith('---\n')) return { error: 'does not open with a `---` line' };
  const end = text.indexOf('\n---\n', 3);
  const endAtEof = text.endsWith('\n---') ? text.length - 4 : -1;
  const close = end >= 0 ? end : endAtEof;
  if (close < 0) return { error: 'has no closing `---` line' };
  const fields = {};
  const order = [];
  for (const line of text.slice(4, close).split('\n')) {
    const m = /^([a-z][a-z-]*): (.*)$/.exec(line);
    if (!m) return { error: `carries a line that is not \`key: value\`: ${JSON.stringify(line.slice(0, 60))}` };
    const [, key, raw] = m;
    if (key in fields) return { error: `declares \`${key}\` twice` };
    let value;
    if (raw.startsWith('"')) {
      try { value = JSON.parse(raw); } catch { return { error: `\`${key}\`'s quoted value does not parse` }; }
      if (typeof value !== 'string') return { error: `\`${key}\`'s value is not a string` };
    } else {
      // **Each guard is its own clause and each has a probe** — empty (YAML reads `key: ` as null),
      // padded, a leading YAML indicator, an inline comment or a nested mapping, and a word YAML
      // TYPES. The last is W116's conformity reader's: the README says a value in another YAML form
      // is "refused rather than guessed at", and `owner: null` or `note: 123` was a string here and
      // a null or a number to every YAML reader W119 might use. The reader is made to agree with the
      // sentence rather than the sentence with the reader, because a lookup built on a real YAML
      // parser would otherwise read a different value from the one this check approved.
      if (raw === '') return { error: `\`${key}\` is empty and unquoted, which YAML reads as null — write ""` };
      if (raw !== raw.trim()) return { error: `\`${key}\`'s plain value carries leading or trailing space — quote it` };
      if (/^['[{|>&*!%@`#-]/.test(raw)) return { error: `\`${key}\`'s plain value opens with a YAML indicator — quote it` };
      if (/ #|: /.test(raw)) return { error: `\`${key}\`'s plain value carries a comment or a mapping — quote it` };
      if (YAML_TYPED.test(raw)) return { error: `\`${key}\`'s plain value "${raw}" is a YAML null, boolean or number, not a string — quote it` };
      value = raw;
    }
    fields[key] = value;
    order.push(key);
  }
  return { fields, order };
}

/** The `## Clusters` table's first cells, in doc/questions/README.md. */
function declaredClusters(text) {
  const at = text.search(/^## Clusters[ \t]*$/m);
  if (at < 0) return [];
  const rest = text.slice(at).split('\n').slice(1);
  const out = [];
  for (const line of rest) {
    if (/^## /.test(line)) break;
    const m = /^\|([^|]*)\|/.exec(line);
    if (!m) continue;
    const cell = m[1].trim();
    if (cell === '' || cell === 'cluster' || /^:?-+:?$/.test(cell)) continue;
    out.push(cell);
  }
  return out;
}

const dirAbs = join(MEASURE_ROOT, DIR);
let names = null;
try { names = readdirSync(dirAbs).sort(); } catch { names = null; }

const parsed = new Map();   // file name -> fields
if (!names) {
  fail('R1', `${DIR} is not a readable directory, so there are no questions to check`);
  fail('R5', `${DIR} is not readable, and a register with no files is not a register`);
  ran.R1 = true; ran.R5 = true;
} else {
  // --- R1: the names, and each id is its file's ----------------------------------
  ran.R1 = true;
  for (const n of names) {
    if (n === README) continue;
    const m = NAME.exec(n);
    if (!m || !statSync(join(dirAbs, n)).isFile()) {
      fail('R1', `${DIR}/${n} is not \`q<N>.md\` — a question file is named by its id alone, ` +
        'unpadded and lower-case, and nothing else lives in this folder but README.md');
      continue;
    }
    const got = readFrontMatter(readFileSync(join(dirAbs, n), 'utf8'));
    if (got.error) continue;   // R2 reports it: a file whose fields cannot be read has none
    parsed.set(n, got);
    if (got.fields.id !== `Q${m[1]}`) {
      fail('R1', `${DIR}/${n} declares \`id: ${got.fields.id ?? ''}\` and its name says Q${m[1]} — ` +
        'the name is the lookup, so an id that disagrees with it is a second question under one name');
    }
  }

  // --- R2: the fields, the vocabulary and the clusters ---------------------------
  ran.R2 = true;
  let clusters = [];
  try { clusters = declaredClusters(readFileSync(join(dirAbs, README), 'utf8')); } catch { clusters = []; }
  if (clusters.length === 0) {
    fail('R2', `${DIR}/${README} declares no cluster under \`## Clusters\`, so no question's ` +
      '`cluster` can be checked against anything');
  }
  for (const n of names) {
    if (!NAME.test(n)) continue;
    const abs = join(dirAbs, n);
    if (!statSync(abs).isFile()) continue;
    if (!parsed.has(n)) {
      const { error } = readFrontMatter(readFileSync(abs, 'utf8'));
      fail('R2', `${DIR}/${n}'s front matter ${error}, so none of its fields is present`);
      continue;
    }
    const { fields, order } = parsed.get(n);
    const missing = FIELDS.filter((f) => !order.includes(f));
    const extra = order.filter((f) => !FIELDS.includes(f));
    if (missing.length) fail('R2', `${DIR}/${n} has no ${missing.map((f) => `\`${f}\``).join(', ')} — ` +
      `every file carries all ${FIELDS.length} fields, empty as "" where there is nothing to say`);
    if (extra.length) fail('R2', `${DIR}/${n} declares ${extra.map((f) => `\`${f}\``).join(', ')}, ` +
      'which P28 decision 1 does not — a misspelt field is a field no lookup will ever project');
    for (const f of NON_EMPTY) {
      if (order.includes(f) && fields[f].trim() === '') fail('R2', `${DIR}/${n}'s \`${f}\` is empty`);
    }
    if (order.includes('status') && !STATUSES.includes(fields.status)) {
      fail('R2', `${DIR}/${n}'s status is "${fields.status}" and the vocabulary is ` +
        `${STATUSES.join(' | ')}, and nothing else`);
    }
    if (order.includes('cluster') && clusters.length && !clusters.includes(fields.cluster)) {
      fail('R2', `${DIR}/${n}'s cluster "${fields.cluster}" is not a row of ${DIR}/${README}'s ` +
        '`## Clusters` table');
    }
    if (fields.status === 'icebox' && (fields.note ?? '').trim() === '') {
      fail('R2', `${DIR}/${n} is iceboxed with no \`note\` — an iceboxed question says WHY it is a ` +
        'what-if, because the lookup hides it and the reason is all a later reader will see');
    }
  }

  // --- R3: resolved iff resolved-by, and what it names exists --------------------
  ran.R3 = true;
  const listing = (d) => { try { return readdirSync(join(MEASURE_ROOT, d)); } catch { return []; } };
  const adrs = new Set(listing('doc/decisions').map((f) => /^(\d{4})-.+\.md$/.exec(f)?.[1]).filter(Boolean));
  const plans = new Set(listing('doc/plans').map((f) => /^p(\d+)-.+\.md$/.exec(f)?.[1]).filter(Boolean));
  const items = new Set(listing('doc/work-items').map((f) => /^w(\d+)-.+\.md$/.exec(f)?.[1]).filter(Boolean));
  for (const [n, { fields, order }] of parsed) {
    if (!order.includes('status') || !order.includes('resolved-by')) continue;   // R2's
    const by = fields['resolved-by'];
    const isResolved = fields.status === 'resolved';
    if (isResolved && by.trim() === '') {
      fail('R3', `${DIR}/${n} is resolved and \`resolved-by\` is empty — a resolution names what resolved it`);
    } else if (!isResolved && by.trim() !== '') {
      fail('R3', `${DIR}/${n} is ${fields.status} and \`resolved-by\` is filled — either it is resolved ` +
        'or nothing has resolved it yet');
    }
    for (const m of by.matchAll(ADR_REF)) {
      for (const [id] of m[1].matchAll(/\d{4}/g)) {
        refsChecked++;
        if (!adrs.has(id)) fail('R3', `${DIR}/${n}'s resolved-by names ADR ${id}, and doc/decisions has no ${id}-*.md`);
      }
    }
    for (const m of by.matchAll(/\bP(\d+)\b/g)) {
      refsChecked++;
      if (!plans.has(String(Number(m[1])))) fail('R3', `${DIR}/${n}'s resolved-by names P${m[1]}, and doc/plans has no p${m[1]}-*.md`);
    }
    for (const m of by.matchAll(/\bW(\d+)\b/g)) {
      refsChecked++;
      if (!items.has(String(Number(m[1])))) fail('R3', `${DIR}/${n}'s resolved-by names W${m[1]}, and doc/work-items has no w${m[1]}-*.md`);
    }
  }

  // --- R4: what HEAD carries, the tree carries -----------------------------------
  /**
   * **The guard is the TOP LEVEL, not the presence of `git`.** A tree staged under this repository's
   * `dev-dist/` has no `.git` of its own, and `git` run there discovers the OUTER repository and
   * answers a different question. So R4 runs only where `git rev-parse --show-toplevel` IS the tree
   * being measured; anywhere else it is NOT RUN, and says why.
   */
  //
  // **`core.longpaths` is set because without it R4 went NOT RUN in silence on a deep checkout.**
  // Measured at W116 in a copy of the tree under a 163-character scratch path: `git` could not read
  // its own `.git/objects/xx/…` past Windows' 260, `ls-tree HEAD` failed, and the clause reported
  // *no HEAD to compare against* — honest, and a gate green with R4 never compared. The setting is
  // inert where paths are short and on every other platform.
  const git = (args) => spawnSync('git', ['-c', 'core.longpaths=true', ...args],
    { cwd: MEASURE_ROOT, encoding: 'utf8', timeout: 60_000 });
  const norm = (p) => {
    let q = p;
    try { q = realpathSync(p); } catch { /* keep the spelling */ }
    q = q.replace(/\\/g, '/').replace(/\/+$/, '');
    return process.platform === 'win32' ? q.toLowerCase() : q;
  };
  const top = git(['rev-parse', '--show-toplevel']);
  if (top.error || top.status !== 0) {
    r4Why = `\`git rev-parse\` cannot read ${MEASURE_ROOT} as a repository`;
  } else if (norm(top.stdout.trim()) !== norm(MEASURE_ROOT)) {
    r4Why = `the tree is not a repository's top level — git answers for ${top.stdout.trim()}`;
  } else {
    const head = git(['ls-tree', '-r', '--name-only', 'HEAD', '--', `${DIR}/`]);
    if (head.error || head.status !== 0) {
      r4Why = '`git ls-tree HEAD` failed — the repository has no HEAD to compare against';
    } else {
      ran.R4 = true;
      const atHead = head.stdout.split('\n').map((s) => s.trim()).filter((s) => s !== '');
      atHeadCount = atHead.length;
      for (const p of atHead) {
        if (!existsSync(join(MEASURE_ROOT, p))) {
          fail('R4', `${p} is at HEAD and not in the tree — a question is never deleted (ids are never ` +
            'reused), and this is the deletion a row floor could not see');
        }
      }
    }
  }

  // --- R5: the floor --------------------------------------------------------------
  ran.R5 = true;
  const count = names.filter((n) => NAME.test(n)).length;
  if (count < QUESTION_FLOOR) {
    fail('R5', `${DIR} holds ${count} question file(s) and the floor is ${QUESTION_FLOOR} — R1 to R3 ` +
      'are true of nothing below that, and a question is never deleted');
  }
}

const CHECKS = [
  'R1 every question file is q<N>.md and declares its own id',
  'R2 every field is present, the status is one of four words, the cluster is declared',
  'R3 a question is resolved exactly when resolved-by says by what, and what it names exists',
  'R4 every question file at HEAD is in the tree',
  'R5 the folder holds at least the questions W116 migrated',
];
const qCount = names ? names.filter((n) => NAME.test(n)).length : 0;
console.log(`register check — ${qCount} question file(s) in ${DIR}, measured at ${MEASURE_ROOT}\n`);
for (const c of CHECKS) {
  const id = c.slice(0, 2);
  const bad = failures.filter((f) => f.startsWith(id + ':'));
  const state = !ran[id] ? 'NOT RUN' : bad.length ? 'FAIL   ' : 'ok     ';
  console.log(`  ${state}  ${c}${bad.length ? ` (${bad.length})` : ''}`);
}
console.log(`\nnote: R3 checked ${refsChecked} ADR/P/W reference(s) in resolved-by; R4 ` +
  (ran.R4 ? `compared ${atHeadCount} question file(s) at HEAD` : `did not run — ${r4Why || 'the register is not readable'}`));
if (failures.length) {
  console.log('\n' + failures.map((f) => '  ' + f).join('\n'));
  console.log(`\n${failures.length} failure(s).`);
  process.exit(1);
}
console.log('\nAll checks that ran passed.');
