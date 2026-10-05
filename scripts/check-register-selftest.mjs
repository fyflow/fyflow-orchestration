#!/usr/bin/env node
// **`check-register.mjs`'s negative tests — `doc/workflow.md` section 5 rule 7**, born with the
// check at [W116](../doc/work-items/w116-a-question-is-a-file.md). A check never seen to fail is a
// claim about the past, so every clause is fired by a staged tree and then DISABLED to prove the
// firing was the clause's rather than a sibling's.
//
//   node scripts/check-register.mjs --self-test
//
// Three passes, each answering a question the one before it cannot:
//
//   PROBES  break the INPUT. Each stages a copy of `doc/questions/` — plus the NAMES of every ADR,
//           plan and work item, which is all `R3` reads — points `CHECK_REGISTER_ROOT` at it, and
//           declares the exact SET of ids it must trip AND the exact set the report must print as
//           NOT RUN. Rule 7 (c), and the second set is how `R4`'s *says it did not run rather than
//           passing* is held: a staged copy that is not a repository's top level must print R4 as
//           NOT RUN, and one that is must not.
//   META    break the CHECK. Each disables one clause and names the probe that must stop being
//           graded as declared.
//   SELF    break THIS FILE. Each must turn this suite red.
//
// **`R4` is provoked in a REAL repository.** A `git: true` probe runs `git init` in its staged
// copy and commits it before the edit, so `HEAD` holds the unedited register and the edit is a
// working-tree change against it — the one shape R4 exists for. A `git: false` probe's copy has no
// `.git`, and since it sits under this repository's scratch directory, `git` discovers the OUTER
// repository from it: that is exactly the case R4's top-level guard exists for, exercised by every
// such probe.
//
// **This harness never writes inside the tree it measures**: every copy and every mutant is under a
// per-process scratch path — [ADR 0072](../doc/decisions/0072-a-scratch-path-carries-its-process-and-a-self-test-that-shares-the-tree-says-so.md),
// which `check-wiring`'s `G6` refuses a statement without — and a content digest of the tree is
// taken at both ends because *untouched by construction* is a claim.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';

// --- the environment the rungs need -------------------------------------------
// v0.19: a rung that cannot START is indistinguishable in a report from one a probe took down.
const NODE_MAJOR = Number(process.versions.node.split('.')[0]);
const MIN_NODE_MAJOR = 24;

// --- the floors on this file's own lists, each AT its list's length -------------
// *A floor one below its list is a permission to delete the entry nobody has named* — W112.
const MIN_PROBES = 81;
const MIN_META = 50;
const MIN_SELF = 14;
const MIN_GRADER = 4;
const GRADED_VERDICTS = ['crash', 'wrong-reason', 'against-declaration', 'did-not-run'];
// A `corpus` grading is a pass and that is Q150: a mutant that fails on the untouched tree is
// noticed, but its probe verdict is noise. Asserted below, not merely declared.
const MAX_CORPUS = 0;

const Q = (t, n) => join(t, 'doc', 'questions', `q${n}.md`);
/**
 * **Every edit checks its ANCHOR against the current text** — v0.17. A probe whose edit matches
 * nothing throws, and the harness grades it ABORT rather than passing it.
 */
const edit = (t, n, from, to) => {
  const p = Q(t, n);
  const s = readFileSync(p, 'utf8');
  if (!s.includes(from)) throw new Error(`q${n}.md does not contain ${JSON.stringify(from)}`);
  writeFileSync(p, s.replace(from, to));
};
/** A NEW valid question, cloned from Q490 (open, no owner, a note) under a fresh id. */
const raise = (t, n, from = 490) => {
  const s = readFileSync(Q(t, from), 'utf8');
  if (!s.includes(`id: Q${from}\n`)) throw new Error(`q${from}.md has no id line`);
  writeFileSync(Q(t, n), s.replace(`id: Q${from}\n`, `id: Q${n}\n`));
};

// ==============================================================================
// PROBES — break the INPUT
// ==============================================================================
//
// `trips` is the exact set of ids the failure block must name; `notRun` the exact set the report
// must print as NOT RUN — `['R4']` for every `git: false` copy, `[]` for every `git: true` one.
// The fixture ids are chosen by their CURRENT fields: Q490 is open with a note, Q488 open with an
// empty note, Q1 resolved, and none of them is a constant that moves when the register grows.
const NR = ['R4'];

/** Replace the WHOLE `key: …` line of one question file; the anchor is the key, checked. */
const setLine = (t, n, key, value) => {
  const p = Q(t, n);
  const s = readFileSync(p, 'utf8');
  const re = new RegExp(`^${key}: .*$`, 'm');
  if (!re.test(s)) throw new Error(`q${n}.md has no ${key} line`);
  writeFileSync(p, s.replace(re, `${key}: ${value}`));
};
/**
 * **`R5`'s floor, read from the REAL check rather than written here**, so a probe that must go under
 * it still does when the register grows — W116 raised two questions and the first cut's *delete one
 * file* stopped reaching 382. The check is the one `scripts/check-register.mjs` beside the entry
 * point; a META mutant that LOWERS the floor is graded against this real figure, which is the point.
 */
const REAL_FLOOR = (() => {
  try {
    const src = readFileSync(join(dirname(process.argv[1] ?? ''), 'check-register.mjs'), 'utf8');
    return Number(/const QUESTION_FLOOR = (\d+);/.exec(src)?.[1] ?? NaN);
  } catch { return NaN; }
})();
/** Fixture ids the probes name, which a floor probe never deletes. */
const FIXTURES = new Set([1, 17, 92, 300, 488, 490]);
/** Delete question files, lowest non-fixture id first, until the folder holds `REAL_FLOOR - 1`. */
const dropBelowFloor = (t) => {
  if (!Number.isInteger(REAL_FLOOR)) throw new Error('QUESTION_FLOOR could not be read from check-register.mjs');
  const dir = join(t, 'doc', 'questions');
  const ids = readdirSync(dir).map((f) => /^q(\d+)\.md$/.exec(f)?.[1]).filter(Boolean).map(Number)
    .sort((a, b) => a - b);
  let count = ids.length;
  for (const id of ids) {
    if (count < REAL_FLOOR) break;
    if (FIXTURES.has(id)) continue;
    rmSync(Q(t, id));
    count--;
  }
  if (count !== REAL_FLOOR - 1) throw new Error(`could not take the folder to ${REAL_FLOOR - 1}`);
};

/** P28 decision 1's ten fields — a probe deletes EACH (rule 8 (a): every value the rule enumerates). */
const FIELDS = ['id', 'title', 'status', 'cluster', 'owner', 'closes-when', 'resolved-by', 'note', 'raised-by', 'shared'];
/**
 * The clusters doc/questions/README.md declares, written HERE so a near-miss can be built for each —
 * and compared to the README both ways at run time, so the day a cluster is added this list is
 * refused rather than silently short.
 */
const CLUSTERS = ['Control flow', 'The join', 'Decisions and data', 'Identity, state, failure',
  'Scale and interop', 'Verification and fixtures', 'Raised late', 'Documents and indexes'];
/** Plain words YAML would TYPE — each must be refused unquoted. */
const TYPED_WORDS = ['null', '~', 'true', 'yes', 'on', '123', '1.5', '0x1F', '.inf'];
/** A near-miss of every status word, and one that a prefix match would let through. */
const STATUS_NEAR_MISSES = ['opened', 'Open', 'Deferred', 'iceboxed', 'Resolved'];

const r2 = (name, says, stage) => ({ name, git: false, trips: ['R2'], notRun: NR, says, stage });
const r3 = (name, says, stage) => ({ name, git: false, trips: ['R3'], notRun: NR, says, stage });
const Q1_BY = 'resolved-by: "The driver, outside the scheduler"\n';

const PROBES = [
  // --- the controls — v0.11: a probe that changes nothing comes back clean ----------
  { name: 'CONTROL — a staged copy that is not a repository: clean, and R4 NOT RUN',
    git: false, trips: [], notRun: NR, stage: null },
  { name: 'CONTROL — a staged copy that IS a repository, HEAD = the tree: clean, R4 runs',
    git: true, trips: [], notRun: [], stage: null },
  { name: 'icebox WITH a note is accepted — the fourth word is in the vocabulary',
    git: false, trips: [], notRun: NR,
    stage: (t) => { edit(t, 488, 'status: open\n', 'status: icebox\n');
      edit(t, 488, 'note: ""\n', 'note: "a what-if: no flow in the corpus reaches it"\n'); } },

  // --- R1: the names, and each id is its file's ---------------------------------
  { name: 'a stray file in the folder that is not q<N>.md',
    git: false, trips: ['R1'], notRun: NR, says: 'is not `q<N>.md`',
    stage: (t) => writeFileSync(join(t, 'doc', 'questions', 'notes.md'), '# notes\n') },
  { name: 'a PADDED name, q0017.md, declaring the id its digits spell',
    git: false, trips: ['R1'], notRun: NR, says: 'q0017.md is not',
    stage: (t) => { const s = readFileSync(Q(t, 17), 'utf8');
      if (!s.includes('id: Q17\n')) throw new Error('q17.md has no id line');
      writeFileSync(join(t, 'doc', 'questions', 'q0017.md'), s.replace('id: Q17\n', 'id: Q0017\n')); } },
  // W116's adequacy reader, R1-n1: `NAME` made case-insensitive accepted this, and `state.mjs`
  // skipped it in silence.
  { name: 'an UPPER-CASE name, Q9001.md, declaring its own id',
    git: false, trips: ['R1'], notRun: NR, says: 'Q9001.md is not',
    stage: (t) => { const s = readFileSync(Q(t, 490), 'utf8');
      if (!s.includes('id: Q490\n')) throw new Error('q490.md has no id line');
      writeFileSync(join(t, 'doc', 'questions', 'Q9001.md'), s.replace('id: Q490\n', 'id: Q9001\n')); } },
  { name: 'a file whose id disagrees with its name — a second Q491 inside q490.md',
    git: false, trips: ['R1'], notRun: NR, says: 'its name says Q490',
    stage: (t) => edit(t, 490, 'id: Q490\n', 'id: Q491\n') },
  // R1-n2 and R1-n3: a NUMERIC and a case-folding comparison each passed one of these.
  { name: 'a padded ID inside its own file — `id: Q017` in q17.md',
    git: false, trips: ['R1'], notRun: NR, says: 'declares `id: Q017`',
    stage: (t) => edit(t, 17, 'id: Q17\n', 'id: Q017\n') },
  { name: 'a lower-case ID inside its own file — `id: q17` in q17.md',
    git: false, trips: ['R1'], notRun: NR, says: 'declares `id: q17`',
    stage: (t) => edit(t, 17, 'id: Q17\n', 'id: q17\n') },

  // --- R2: every field, the vocabulary, the clusters, the subset -----------------------
  // EACH of the ten fields deleted, because the first cut deleted only `shared` and a missing-field
  // test that skipped `note` passed every probe (R2-n7). Deleting `id` also trips R1, honestly: the
  // file then declares no id, which is not its name's.
  ...FIELDS.map((f) => ({
    name: `a required field missing — \`${f}\` deleted`,
    git: false, trips: f === 'id' ? ['R1', 'R2'] : ['R2'], notRun: NR, says: `has no \`${f}\``,
    stage: (t) => { const s = readFileSync(Q(t, 490), 'utf8');
      const re = new RegExp(`^${f}: .*\\n`, 'm');
      if (!re.test(s)) throw new Error(`q490.md has no ${f} line`);
      writeFileSync(Q(t, 490), s.replace(re, '')); },
  })),
  r2('a field P28 decision 1 does not declare — `closes-by` beside `closes-when`', 'declares `closes-by`',
    // A key in the subset's own spelling: `closes_when` is refused EARLIER, as a line that is not
    // `key: value`, and graded `wrong-reason` on this probe's first run.
    (t) => edit(t, 490, 'shared: ""\n', 'shared: ""\ncloses-by: ""\n')),
  // R2-n8: a test that flagged only HYPHENATED extras passed a plain one.
  r2('an undeclared field with no hyphen — `foo`', 'declares `foo`',
    (t) => edit(t, 490, 'shared: ""\n', 'shared: ""\nfoo: ""\n')),
  // R2-r1: the duplicate-key refusal had no probe at all.
  r2('a field declared TWICE — two `title` lines', 'declares `title` twice',
    (t) => edit(t, 490, 'id: Q490\n', 'id: Q490\ntitle: "a second title"\n')),
  r2('an empty title', '`title` is empty', (t) => setLine(t, 490, 'title', '""')),
  // R2-n6: the non-empty test without its trim.
  r2('a title of one SPACE', '`title` is empty', (t) => setLine(t, 490, 'title', '" "')),
  r2('a status outside the four words — `closed`', 'status is "closed"',
    (t) => edit(t, 490, 'status: open\n', 'status: closed\n')),
  // R2-n1 and R2-n2: a prefix match and a case-folded match each passed one of these.
  ...STATUS_NEAR_MISSES.map((w) => r2(`a status NEAR-MISS — \`${w}\``, `status is "${w}"`,
    (t) => edit(t, 490, 'status: open\n', `status: ${w}\n`))),
  r2('a cluster the README does not declare', 'cluster "Nowhere" is not',
    (t) => setLine(t, 490, 'cluster', '"Nowhere"')),
  // R2-n3 and R2-n4, and a near-miss of EVERY declared cluster (rule 8 (a)).
  ...CLUSTERS.map((c) => r2(`a cluster NEAR-MISS — "${c.toLowerCase()}"`, `cluster "${c.toLowerCase()}" is not`,
    (t) => setLine(t, 490, 'cluster', JSON.stringify(c.toLowerCase())))),
  r2('a cluster that is a SUBSTRING of a declared one — "join"', 'cluster "join" is not',
    (t) => setLine(t, 490, 'cluster', '"join"')),
  r2('a cluster with a trailing space inside its quotes — "The join "', 'cluster "The join " is not',
    (t) => setLine(t, 490, 'cluster', '"The join "')),
  r2('icebox with an EMPTY note', 'iceboxed with no `note`',
    (t) => edit(t, 488, 'status: open\n', 'status: icebox\n')),
  // R2-n5: the icebox test without its trim.
  r2('icebox with a note of one SPACE', 'iceboxed with no `note`',
    (t) => { edit(t, 488, 'status: open\n', 'status: icebox\n'); edit(t, 488, 'note: ""\n', 'note: " "\n'); }),
  r2('front matter with no closing fence — unreadable, so no field is present', 'has no closing `---` line',
    (t) => { const s = readFileSync(Q(t, 490), 'utf8');
      if (!s.endsWith('\n---\n')) throw new Error('q490.md does not close with ---');
      writeFileSync(Q(t, 490), s.slice(0, -4)); }),
  // R2-n9: a reader that normalised a BOM and CRLF first accepted this file.
  r2('a file with a BOM and CRLF line ends', 'does not open with a `---` line',
    (t) => { const s = readFileSync(Q(t, 490), 'utf8');
      writeFileSync(Q(t, 490), `﻿${s.replace(/\n/g, '\r\n')}`); }),
  // Each guard of the plain subset, one input each (R2-r2 .. R2-r5), and every typed word.
  r2('a plain value outside the declared subset — an unquoted `: ` inside it', 'carries a comment or a mapping',
    (t) => setLine(t, 490, 'owner', 'no owner: nobody')),
  r2('a plain value carrying an inline COMMENT — `a # comment`', 'carries a comment or a mapping',
    (t) => setLine(t, 490, 'title', 'a # comment')),
  r2('a plain value with a TRAILING space', 'leading or trailing space',
    (t) => setLine(t, 490, 'title', 'x ')),
  r2('a plain value opening with a YAML indicator — `[a, b]`', 'opens with a YAML indicator',
    (t) => setLine(t, 490, 'title', '[a, b]')),
  r2('an EMPTY unquoted value — `shared: `, which YAML reads as null', 'is empty and unquoted',
    (t) => setLine(t, 490, 'shared', '')),
  ...TYPED_WORDS.map((w) => r2(`a plain word YAML would TYPE — \`shared: ${w}\``, `plain value "${w}" is a YAML`,
    (t) => setLine(t, 490, 'shared', w))),
  r2("the README's Clusters table emptied — no cluster can be checked", 'declares no cluster',
    (t) => { const p = join(t, 'doc', 'questions', 'README.md');
      const s = readFileSync(p, 'utf8');
      const out = s.replace(/(## Clusters\n[\s\S]*?)(\n## )/, (_, body, next) =>
        body.split('\n').filter((l) => !/^\| [A-Z]/.test(l) || l.startsWith('| cluster')).join('\n') + next);
      if (out === s) throw new Error('README.md: the Clusters table matched nothing');
      writeFileSync(p, out); }),

  // --- R3: resolved iff resolved-by, and what it names exists ------------------------
  r3('resolved with an EMPTY resolved-by', 'is resolved and `resolved-by` is empty',
    (t) => edit(t, 1, Q1_BY, 'resolved-by: ""\n')),
  // R3-n2: the emptiness test without its trim.
  r3('resolved with a resolved-by of one SPACE', 'is resolved and `resolved-by` is empty',
    (t) => edit(t, 1, Q1_BY, 'resolved-by: " "\n')),
  r3('open with a resolved-by filled', 'is open and `resolved-by` is filled',
    (t) => edit(t, 490, 'resolved-by: ""\n', 'resolved-by: "nothing yet"\n')),
  // R3-n3: the reverse clause narrowed to `open` passed these — every non-resolved word.
  r3('deferred with a resolved-by filled', 'is deferred and `resolved-by` is filled',
    (t) => edit(t, 92, 'resolved-by: ""\n', 'resolved-by: "nothing yet"\n')),
  r3('icebox with a resolved-by filled', 'is icebox and `resolved-by` is filled',
    (t) => { edit(t, 488, 'status: open\n', 'status: icebox\n');
      edit(t, 488, 'note: ""\n', 'note: "a what-if"\n');
      edit(t, 488, 'resolved-by: ""\n', 'resolved-by: "nothing yet"\n'); }),
  r3('resolved-by naming an ADR that does not exist', 'names ADR 9999',
    (t) => edit(t, 1, Q1_BY, 'resolved-by: "The driver, outside the scheduler - ADR 9999"\n')),
  // R3-n1, C10, C11: the SECOND id of a cell, the list form, and the hyphenated form.
  r3('resolved-by naming two ADRs, the SECOND missing — `ADR 0001 and ADR 9999`', 'names ADR 9999',
    (t) => edit(t, 1, Q1_BY, 'resolved-by: "ADR 0001 and ADR 9999"\n')),
  r3('resolved-by in the LIST form, the second missing — `ADRs 0001 and 9999`', 'names ADR 9999',
    (t) => edit(t, 1, Q1_BY, 'resolved-by: "ADRs 0001 and 9999"\n')),
  r3('resolved-by in the HYPHENATED form — `ADR-9999`', 'names ADR 9999',
    (t) => edit(t, 1, Q1_BY, 'resolved-by: "ADR-9999"\n')),
  { name: 'resolved-by in the list form with BOTH ADRs present — `ADRs 0001 and 0002` is clean',
    git: false, trips: [], notRun: NR,
    stage: (t) => edit(t, 1, Q1_BY, 'resolved-by: "ADRs 0001 and 0002"\n') },
  r3('resolved-by naming a PLAN that does not exist', 'names P999,',
    (t) => edit(t, 1, Q1_BY, 'resolved-by: "The driver, outside the scheduler - P999"\n')),
  r3('resolved-by naming a WORK ITEM that does not exist', 'names W9999,',
    (t) => edit(t, 1, Q1_BY, 'resolved-by: "The driver, outside the scheduler - W9999"\n')),

  // --- R4: HEAD against the tree, in a real repository --------------------------------
  { name: 'a question DELETED while another is raised — the count holds and only R4 sees it',
    git: true, trips: ['R4'], notRun: [], says: 'q300.md is at HEAD and not in the tree',
    stage: (t) => { rmSync(Q(t, 300)); raise(t, 9001); } },
  // R4-n3: comparing the INDEX (`git ls-files`) instead of HEAD passed a STAGED removal.
  { name: 'a question removed with `git rm` — staged, not committed — while another is raised',
    git: true, trips: ['R4'], notRun: [], says: 'q300.md is at HEAD and not in the tree',
    stage: (t) => { const g = git(t, ['rm', '-q', '--', 'doc/questions/q300.md']);
      if (g.error || g.status !== 0) throw new Error(`git rm failed: ${(g.stderr ?? '').trim()}`);
      raise(t, 9001); } },
  { name: 'questions deleted below the floor with nothing raised — R4 and R5 both',
    git: true, trips: ['R4', 'R5'], notRun: [], stage: (t) => dropBelowFloor(t) },
  { name: 'the same deletion and raise in a copy that is NOT a repository — R4 says NOT RUN, nothing passes for it',
    git: false, trips: [], notRun: NR,
    stage: (t) => { rmSync(Q(t, 300)); raise(t, 9001); } },
  { name: 'a repository with no commit — no HEAD, so R4 says NOT RUN',
    git: 'init-only', trips: [], notRun: NR, stage: (t) => raise(t, 9001) },
  { name: 'a copy NESTED inside another repository that does not track it — R4 says NOT RUN',
    git: 'nested', trips: [], notRun: NR,
    stage: (t) => { rmSync(Q(t, 300)); raise(t, 9001); } },

  // --- R5: the floor -------------------------------------------------------------------
  { name: 'the folder taken one below the floor, in a copy that is not a repository — the floor alone',
    git: false, trips: ['R5'], notRun: NR, says: 'and the floor is',
    stage: (t) => dropBelowFloor(t) },
  // R2-R4 have nothing to read and say so: NOT RUN, never `ok` over an absent folder.
  { name: 'the folder missing entirely — R1 and R5 fail, R2 to R4 say NOT RUN',
    git: false, trips: ['R1', 'R5'], notRun: ['R2', 'R3', 'R4'],
    stage: (t) => rmSync(join(t, 'doc', 'questions'), { recursive: true, force: true }) },
  { name: 'a question added — the floor only moves up, so more is clean',
    git: false, trips: [], notRun: NR, stage: (t) => raise(t, 9001) },
];

// ==============================================================================
// GRADER CONTROLS — v0.24: the grader is graded on its clause's own failure line
// ==============================================================================
const GRADER_CONTROLS = [
  { name: 'GRADER CONTROL — the check made to THROW: non-zero exit, zero named failures',
    expect: 'crash', git: false, trips: ['R2'], notRun: NR,
    stage: (t) => edit(t, 490, 'status: open\n', 'status: closed\n'),
    declare: (s) => s.replace('const failures = [];', 'const failures = [];\nthrow new Error("grader control");') },
  { name: 'GRADER CONTROL — trips R2 as declared, with a reason the check never prints',
    expect: 'wrong-reason', git: false, trips: ['R2'], notRun: NR, says: 'status is "a word nobody wrote"',
    stage: (t) => edit(t, 490, 'status: open\n', 'status: closed\n') },
  { name: 'GRADER CONTROL — declares R1 and trips R2: against-declaration',
    expect: 'against-declaration', git: false, trips: ['R1'], notRun: NR,
    stage: (t) => edit(t, 490, 'status: open\n', 'status: closed\n') },
  { name: 'GRADER CONTROL — the banner removed: the check runs and cannot be seen to',
    expect: 'did-not-run', git: false, trips: ['R2'], notRun: NR,
    stage: (t) => edit(t, 490, 'status: open\n', 'status: closed\n'),
    declare: (s) => s.replace('console.log(`register check — ', 'console.log(`BANNER REMOVED — ') },
];

// ==============================================================================
// META — break the CHECK: [what is disabled, the probe that must stop grading as declared, mutate]
// ==============================================================================
const META = [
  ['R1`s name clause disabled', 'a stray file in the folder that is not q<N>.md',
    (s) => s.replace("    if (!m || !statSync(join(dirAbs, n)).isFile()) {\n      fail('R1'",
      "    if (!m || !statSync(join(dirAbs, n)).isFile()) {\n      continue;\n      fail('R1'")],
  ['R1`s name pattern loosened to accept a padded id', 'a PADDED name, q0017.md, declaring the id its digits spell',
    (s) => s.replace('const NAME = /^q([1-9][0-9]*)\\.md$/;', 'const NAME = /^q([0-9]+)\\.md$/;')],
  // --- W116's adequacy reader's survivors, each against the probe written for it ---------------
  ['R1-n1 — the name pattern made CASE-INSENSITIVE', 'an UPPER-CASE name, Q9001.md, declaring its own id',
    (s) => s.replace('const NAME = /^q([1-9][0-9]*)\\.md$/;', 'const NAME = /^q([1-9][0-9]*)\\.md$/i;')],
  ['R1`s id-equals-name comparison disabled', 'a file whose id disagrees with its name — a second Q491 inside q490.md',
    (s) => s.replace('    if (got.fields.id !== `Q${m[1]}`) {', '    if (false) {')],
  ['R1-n2 — the id compared NUMERICALLY', 'a padded ID inside its own file — `id: Q017` in q17.md',
    (s) => s.replace('    if (got.fields.id !== `Q${m[1]}`) {',
      '    if (Number(String(got.fields.id).slice(1)) !== Number(m[1])) {')],
  ['R1-n3 — the id compared after UPPER-CASING', 'a lower-case ID inside its own file — `id: q17` in q17.md',
    (s) => s.replace('    if (got.fields.id !== `Q${m[1]}`) {', '    if (String(got.fields.id).toUpperCase() !== `Q${m[1]}`) {')],
  ['R2`s missing-field clause disabled', 'a required field missing — `shared` deleted',
    (s) => s.replace('    if (missing.length) fail(', '    if (false) fail(')],
  ['R2-n7 — the missing-field test skips `note`', 'a required field missing — `note` deleted',
    (s) => s.replace('    const missing = FIELDS.filter((f) => !order.includes(f));',
      "    const missing = FIELDS.filter((f) => f !== 'note' && !order.includes(f));")],
  ['R2`s undeclared-field clause disabled', 'a field P28 decision 1 does not declare — `closes-by` beside `closes-when`',
    (s) => s.replace('    if (extra.length) fail(', '    if (false) fail(')],
  ['R2-n8 — only HYPHENATED extras flagged', 'an undeclared field with no hyphen — `foo`',
    (s) => s.replace('    const extra = order.filter((f) => !FIELDS.includes(f));',
      "    const extra = order.filter((f) => f.includes('-') && !FIELDS.includes(f));")],
  ['R2-r1 — the duplicate-key refusal deleted', 'a field declared TWICE — two `title` lines',
    (s) => s.replace("    if (key in fields) return { error: `declares \\`${key}\\` twice` };\n", '')],
  ['R2`s non-empty clause disabled', 'an empty title',
    (s) => s.replace("      if (order.includes(f) && fields[f].trim() === '') fail(", '      if (false) fail(')],
  ['R2-n6 — the non-empty test without its trim', 'a title of one SPACE',
    (s) => s.replace("      if (order.includes(f) && fields[f].trim() === '') fail(", "      if (order.includes(f) && fields[f] === '') fail(")],
  ['R2`s vocabulary clause disabled', 'a status outside the four words — `closed`',
    (s) => s.replace("    if (order.includes('status') && !STATUSES.includes(fields.status)) {", '    if (false) {')],
  ['R2-n1 — the vocabulary matched by PREFIX', 'a status NEAR-MISS — `opened`',
    (s) => s.replace("    if (order.includes('status') && !STATUSES.includes(fields.status)) {",
      "    if (order.includes('status') && !STATUSES.some((w) => fields.status.startsWith(w))) {")],
  ['R2-n2 — the vocabulary matched CASE-INSENSITIVELY', 'a status NEAR-MISS — `Open`',
    (s) => s.replace("    if (order.includes('status') && !STATUSES.includes(fields.status)) {",
      "    if (order.includes('status') && !STATUSES.includes(fields.status.toLowerCase())) {")],
  ['`icebox` removed from the vocabulary', 'icebox WITH a note is accepted — the fourth word is in the vocabulary',
    (s) => s.replace("const STATUSES = Object.freeze(['open', 'deferred', 'icebox', 'resolved']);",
      "const STATUSES = Object.freeze(['open', 'deferred', 'resolved']);")],
  ['R2`s cluster clause disabled', 'a cluster the README does not declare',
    (s) => s.replace("    if (order.includes('cluster') && clusters.length && !clusters.includes(fields.cluster)) {", '    if (false) {')],
  ['R2-n3 — clusters compared CASE-INSENSITIVELY', 'a cluster NEAR-MISS — "the join"',
    (s) => s.replace("    if (order.includes('cluster') && clusters.length && !clusters.includes(fields.cluster)) {",
      "    if (order.includes('cluster') && clusters.length && !clusters.some((c) => c.toLowerCase() === fields.cluster.toLowerCase())) {")],
  ['R2-n4 — clusters compared by SUBSTRING', 'a cluster that is a SUBSTRING of a declared one — "join"',
    (s) => s.replace("    if (order.includes('cluster') && clusters.length && !clusters.includes(fields.cluster)) {",
      "    if (order.includes('cluster') && clusters.length && !clusters.some((c) => c.includes(fields.cluster))) {")],
  ['R2`s icebox-note clause disabled', 'icebox with an EMPTY note',
    (s) => s.replace("    if (fields.status === 'icebox' && (fields.note ?? '').trim() === '') {", '    if (false) {')],
  ['R2-n5 — the icebox note test without its trim', 'icebox with a note of one SPACE',
    (s) => s.replace("    if (fields.status === 'icebox' && (fields.note ?? '').trim() === '') {",
      "    if (fields.status === 'icebox' && (fields.note ?? '') === '') {")],
  ['R2`s unreadable-front-matter clause disabled', 'front matter with no closing fence — unreadable, so no field is present',
    (s) => s.replace("      fail('R2', `${DIR}/${n}'s front matter ${error}, so none of its fields is present`);", '')],
  ['R2-n9 — the reader normalises a BOM and CRLF first', 'a file with a BOM and CRLF line ends',
    (s) => s.replace('export function readFrontMatter(text) {\n',
      "export function readFrontMatter(text) {\n  text = text.replace(/^\\uFEFF/, '').replace(/\\r\\n/g, '\\n');\n")],
  ['the mapping half of the comment-or-mapping guard removed', 'a plain value outside the declared subset — an unquoted `: ` inside it',
    (s) => s.replace('      if (/ #|: /.test(raw)) return', '      if (/ #/.test(raw)) return')],
  ['R2-r4 — the comment half of the comment-or-mapping guard removed', 'a plain value carrying an inline COMMENT — `a # comment`',
    (s) => s.replace('      if (/ #|: /.test(raw)) return', '      if (/: /.test(raw)) return')],
  ['R2-r2 — the padded-value guard removed', 'a plain value with a TRAILING space',
    (s) => s.replace('      if (raw !== raw.trim()) return', '      if (false) return')],
  ['R2-r3 — the YAML-indicator guard removed', 'a plain value opening with a YAML indicator — `[a, b]`',
    (s) => s.replace("      if (/^['[{|>&*!%@`#-]/.test(raw)) return", '      if (false) return')],
  ['R2-r5 — the empty-unquoted guard removed', 'an EMPTY unquoted value — `shared: `, which YAML reads as null',
    (s) => s.replace("      if (raw === '') return", '      if (false) return')],
  ['the YAML-typed-word guard removed', 'a plain word YAML would TYPE — `shared: null`',
    (s) => s.replace('      if (YAML_TYPED.test(raw)) return', '      if (false) return')],
  ['R2`s empty-cluster-list clause disabled', "the README's Clusters table emptied — no cluster can be checked",
    (s) => s.replace('  if (clusters.length === 0) {', '  if (false) {')],
  ['R3`s resolved-without-a-resolution clause disabled', 'resolved with an EMPTY resolved-by',
    (s) => s.replace("    if (isResolved && by.trim() === '') {", '    if (false) {')],
  ['R3-n2 — the emptiness test without its trim', 'resolved with a resolved-by of one SPACE',
    (s) => s.replace("    if (isResolved && by.trim() === '') {", "    if (isResolved && by === '') {")],
  ['R3`s resolution-without-resolved clause disabled', 'open with a resolved-by filled',
    (s) => s.replace("    } else if (!isResolved && by.trim() !== '') {", '    } else if (false) {')],
  ['R3-n3 — the reverse clause narrowed to `open`', 'deferred with a resolved-by filled',
    (s) => s.replace("    } else if (!isResolved && by.trim() !== '') {", "    } else if (fields.status === 'open' && by.trim() !== '') {")],
  ['R3`s ADR existence clause disabled', 'resolved-by naming an ADR that does not exist',
    (s) => s.replace('        if (!adrs.has(id)) fail(', '        if (false) fail(')],
  ['R3-n1 — only the FIRST ADR reference of a cell read', 'resolved-by naming two ADRs, the SECOND missing — `ADR 0001 and ADR 9999`',
    (s) => s.replace('    for (const m of by.matchAll(ADR_REF)) {', '    for (const m of [...by.matchAll(ADR_REF)].slice(0, 1)) {')],
  ['C10 — only the first id of a LIST read', 'resolved-by in the LIST form, the second missing — `ADRs 0001 and 9999`',
    (s) => s.replace('      for (const [id] of m[1].matchAll(/\\d{4}/g)) {', '      for (const [id] of [...m[1].matchAll(/\\d{4}/g)].slice(0, 1)) {')],
  ['C11 — the HYPHENATED form not read', 'resolved-by in the HYPHENATED form — `ADR-9999`',
    (s) => s.replace('const ADR_REF = /\\bADRs?[\\s-]+(', 'const ADR_REF = /\\bADRs?\\s+(')],
  ['R3`s plan existence clause disabled', 'resolved-by naming a PLAN that does not exist',
    (s) => s.replace('      if (!plans.has(String(Number(m[1])))) fail(', '      if (false) fail(')],
  ['R3`s work-item existence clause disabled', 'resolved-by naming a WORK ITEM that does not exist',
    (s) => s.replace('      if (!items.has(String(Number(m[1])))) fail(', '      if (false) fail(')],
  ['R4`s comparison disabled', 'a question DELETED while another is raised — the count holds and only R4 sees it',
    (s) => s.replace('        if (!existsSync(join(MEASURE_ROOT, p))) {', '        if (false) {')],
  ['R4-n3 — the INDEX compared instead of HEAD', 'a question removed with `git rm` — staged, not committed — while another is raised',
    (s) => s.replace("    const head = git(['ls-tree', '-r', '--name-only', 'HEAD', '--', `${DIR}/`]);",
      "    const head = git(['ls-files', '--', `${DIR}/`]);")],
  ['R4`s top-level guard removed — git answers for the OUTER repository', 'a copy NESTED inside another repository that does not track it — R4 says NOT RUN',
    (s) => s.replace('  } else if (norm(top.stdout.trim()) !== norm(MEASURE_ROOT)) {', '  } else if (false) {')],
  ['R4`s no-HEAD guard removed — an empty listing passes for a comparison', 'a repository with no commit — no HEAD, so R4 says NOT RUN',
    (s) => s.replace('    if (head.error || head.status !== 0) {', '    if (false) {')],
  ['R4`s NOT RUN state erased from the report', 'CONTROL — a staged copy that is not a repository: clean, and R4 NOT RUN',
    (s) => s.replace("  const state = !ran[id] ? 'NOT RUN' : bad.length ? 'FAIL   ' : 'ok     ';",
      "  const state = bad.length ? 'FAIL   ' : 'ok     ';")],
  ['R5`s comparison disabled', 'the folder taken one below the floor, in a copy that is not a repository — the floor alone',
    (s) => s.replace('  if (count < QUESTION_FLOOR) {', '  if (false) {')],
  ['R5`s floor lowered by one', 'the folder taken one below the floor, in a copy that is not a repository — the floor alone',
    (s) => s.replace(/const QUESTION_FLOOR = (\d+);/, (_, n) => `const QUESTION_FLOOR = ${Number(n) - 1};`)],
  ['every failure swallowed', 'a status outside the four words — `closed`',
    (s) => s.replace('const fail = (check, msg) => failures.push(`${check}: ${msg}`);', 'const fail = () => {};')],
  ['the non-zero exit removed', 'a status outside the four words — `closed`',
    (s) => s.replace("  console.log(`\\n${failures.length} failure(s).`);\n  process.exit(1);",
      "  console.log(`\\n${failures.length} failure(s).`);\n  process.exitCode = 0;")],
];

// ==============================================================================
// STATE — `npm run state`'s register figures, graded by a THIRD reading of the staged folder
// ==============================================================================
//
// **Why here, and why a pass rather than assertions alone** (W116's adequacy reader, S1-S7).
// `state.mjs` is not a gate entry and had no self-test, so a listing narrowed to skip Q490-Q499
// printed *next free Q490* — an id already issued — at EXIT 0, and `icebox` could be dropped from
// its regex, its relation or its count line for nothing: the corpus holds no iceboxed question, so
// no reading of THIS tree can tell. `state.mjs` now carries a second route of its own (a raw
// `readdirSync`, sharing nothing with `listing()`), which is what a person's own run sees; and THIS
// pass is what the gate sees — it stages trees the corpus does not contain (an iceboxed question, a
// status outside the four, a CRLF file, an upper-case name, a directory) and grades the printed
// figures against a reading of its own: substring counts of `\nstatus: <word>\n` per file, and the
// highest number on disk. Three observers, none of them another's instrument. It lives in this file
// because the register is its subject and this harness already stages it.
const STATE_PROBES = [
  { name: 'STATE CONTROL — the register as it is: every figure agrees with a third reading', exit: 0, stage: null },
  { name: 'STATE — one question iceboxed: counted on its own line, and live', exit: 0,
    stage: (t) => { edit(t, 488, 'status: open\n', 'status: icebox\n');
      edit(t, 488, 'note: ""\n', 'note: "a what-if"\n'); } },
  { name: 'STATE — a status outside the four words is live and none of them: refused', exit: 1,
    says: 'live questions that are open, deferred or iceboxed',
    stage: (t) => edit(t, 490, 'status: open\n', 'status: closed\n') },
  { name: 'STATE — a CRLF question file, whose status line does not parse: refused', exit: 1,
    says: 'question files whose `status:` line parses',
    stage: (t) => { const s = readFileSync(Q(t, 490), 'utf8'); writeFileSync(Q(t, 490), s.replace(/\n/g, '\r\n')); } },
  { name: 'STATE — an UPPER-CASE Q9001.md the listing does not read: refused', exit: 1,
    says: 'read a second way',
    stage: (t) => { const s = readFileSync(Q(t, 490), 'utf8');
      writeFileSync(join(t, 'doc', 'questions', 'Q9001.md'), s.replace('id: Q490\n', 'id: Q9001\n')); } },
  { name: 'STATE — a DIRECTORY named q9002.md: refused BY NAME, not a crash', exit: 1,
    says: 'NOT: q9002.md',
    stage: (t) => { mkdirSync(join(t, 'doc', 'questions', 'q9002.md'));
      writeFileSync(join(t, 'doc', 'questions', 'q9002.md', 'inside.txt'), 'a directory, not a question\n'); } },
];
const MIN_STATE = 6;

/** `[what, the STATE probe that must stop grading as declared, mutation of state.mjs]`. */
const STATE_META = [
  ['S1 — the listing narrowed to skip Q490-Q499', 'STATE CONTROL — the register as it is: every figure agrees with a third reading',
    (s) => s.replace('const questions = listing(QUESTION_DIR, /^q\\d+\\.md$/)', 'const questions = listing(QUESTION_DIR, /^q(?!49)\\d+\\.md$/)')],
  ['S1b — the listing narrowed to skip Q492 alone', 'STATE CONTROL — the register as it is: every figure agrees with a third reading',
    (s) => s.replace('const questions = listing(QUESTION_DIR, /^q\\d+\\.md$/)', 'const questions = listing(QUESTION_DIR, /^q(?!492)\\d+\\.md$/)')],
  ['S2 — `icebox` dropped from the status pattern', 'STATE — one question iceboxed: counted on its own line, and live',
    (s) => s.replace('/^status: *"?([a-z]+)"? *$/m', '/^status: *"?(open|deferred|resolved)"? *$/m')],
  ['S3 — `icebox` dropped from the relation', 'STATE — one question iceboxed: counted on its own line, and live',
    (s) => s.replace('openRows + deferredRows + iceboxRows, liveCount,', 'openRows + deferredRows, liveCount,')],
  ['S4 — the icebox count made a constant 0', 'STATE — one question iceboxed: counted on its own line, and live',
    (s) => s.replace("const iceboxRows = byStatus('icebox');", 'const iceboxRows = 0;')],
  ['S5 — the `iceboxed` line deleted from the report', 'STATE — one question iceboxed: counted on its own line, and live',
    (s) => s.replace("  ['  of the live, iceboxed', iceboxRows],\n", '')],
  ['S7 — live counted as open + deferred + icebox, which makes the relation a tautology',
    'STATE — a status outside the four words is live and none of them: refused',
    (s) => s.replace('const liveCount = questions.length - resolvedCount;',
      "const liveCount = questions.filter((q) => ['open', 'deferred', 'icebox'].includes(q.status)).length;")],
  ['the unreadable-file guard removed — a directory crashes the run', 'STATE — a DIRECTORY named q9002.md: refused BY NAME, not a crash',
    (s) => s.replace('  try { text = read(`${QUESTION_DIR}/${f}`); } catch { unreadableQs.push(f); }',
      '  text = read(`${QUESTION_DIR}/${f}`);')],
  ['the second route`s count comparison deleted', 'STATE — an UPPER-CASE Q9001.md the listing does not read: refused',
    (s) => s.replace("  ['question files read, against every entry the folder holds read a second way',\n    questions.length, rawQuestionNames.length, 'register'],\n", '')
      .replace("  ['the next free Q, against the highest number on disk read a second way', next.q, rawMaxQ + 1, 'register'],\n", '')],
  ['the status-parses assertion deleted', 'STATE — a CRLF question file, whose status line does not parse: refused',
    (s) => s.replace("  ['question files whose `status:` line parses', questions.filter((q) => q.status !== null).length,\n    questions.length, 'register'],\n", '')],
];
const MIN_STATE_META = 10;

// ==============================================================================
// SELF — break THIS FILE: each must turn the suite red
// ==============================================================================
// **Each planted case is a defect a guard exists to catch**, not a guard removed: a weakened
// grader on a tree where every probe passes has nothing to be wrong about — `check-budget`'s
// SELF comment, W31's device with the polarity reversed.
const SELF = [
  ['one probe deleted from PROBES',
    (t) => t.replace("  r2('an empty title', '`title` is empty', (t) => setLine(t, 490, 'title', '\"\"')),\n", '')],
  ['PROBES emptied entirely', (t) => t.replace(/const PROBES = \[[\s\S]*?\n\];/, 'const PROBES = [];')],
  ['MIN_PROBES lowered AND PROBES emptied — what the coverage bound catches',
    (t) => t.replace(/const MIN_PROBES = \d+;/, 'const MIN_PROBES = 0;')
      .replace(/const PROBES = \[[\s\S]*?\n\];/, 'const PROBES = [];')],
  ['one META entry deleted',
    (t) => t.replace(/ {2}\['R5`s floor lowered by one',[\s\S]*?\],\n {2}\['every failure/, "  ['every failure")],
  ['META emptied, and MIN_META lowered with it',
    (t) => t.replace(/const MIN_META = \d+;/, 'const MIN_META = 0;').replace(/const META = \[[\s\S]*?\n\];/, 'const META = [];')],
  ['one STATE probe deleted',
    (t) => t.replace(/ {2}\{ name: 'STATE — a CRLF question file[\s\S]*?\n {2}\{ name: 'STATE — an UPPER-CASE/, "  { name: 'STATE — an UPPER-CASE")],
  ['one STATE_META entry deleted',
    (t) => t.replace(/ {2}\['S4 — the icebox count made a constant 0',[\s\S]*?\],\n {2}\['S5/, "  ['S5")],
  ['a cluster added to CLUSTERS that the README does not declare — the both-ways bound',
    (t) => t.replace("'Raised late', 'Documents and indexes'];", "'Raised late', 'Documents and indexes', 'Nowhere'];")],
  ['a probe DECLARING the wrong id — what the set comparison catches',
    (t) => t.replace("  r3('resolved-by in the HYPHENATED form — `ADR-9999`', ", "  r2('resolved-by in the HYPHENATED form — `ADR-9999`', ")],
  ['a probe declaring the wrong NOT RUN set — a git copy said to skip R4',
    (t) => t.replace("    git: true, trips: ['R4', 'R5'], notRun: [],", "    git: true, trips: ['R4', 'R5'], notRun: NR,")],
  ['a probe whose staging changes NOTHING — what rule 7 (b) catches',
    (t) => t.replace("    (t) => edit(t, 490, 'shared: \"\"\\n', 'shared: \"\"\\ncloses-by: \"\"\\n')),",
      "    (t) => edit(t, 490, 'shared: \"\"\\n', 'shared: \"\"\\n')),")],
  ['the CONTROL made to trip something — what the control`s own verdict catches',
    (t) => t.replace("    git: false, trips: [], notRun: NR, stage: null },",
      "    git: false, trips: [], notRun: NR, stage: (t) => edit(t, 490, 'status: open\\n', 'status: closed\\n') },")],
  ['a GRADER control declaring the wrong verdict — what grading the grader catches',
    (t) => t.replace("    expect: 'crash', git: false,", "    expect: 'caught', git: false,")],
  ['MAX_CORPUS raised — the inertness run asserted, not declared',
    (t) => t.replace('const MAX_CORPUS = 0;', 'const MAX_CORPUS = 3;')],
];

// ==============================================================================
// the harness
// ==============================================================================
const RAN = (out) => /^register check — /m.test(out);
const SELF_RAN = (out) => /check-register self-test —/.test(out);
const setsEqual = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const failIds = (out) => [...new Set([...out.matchAll(/^ {2}(R\d): /gm)].map((m) => m[1]))].sort();
const rowIds = (out, state) => [...out.matchAll(/^ {2}(ok {5}|FAIL {3}|NOT RUN) {2}(R\d) /gm)]
  .filter((m) => m[1].trim() === state).map((m) => m[2]).sort();
/** A reason is matched on its clause's own failure LINE, never on the whole output — v0.24. */
const mentions = (out, says) => out.split('\n').some((l) => /^ {2}R\d: /.test(l) && l.includes(says));

function digestDir(d) {
  const h = createHash('sha256');
  const walk = (x) => {
    if (!existsSync(x)) return;
    for (const name of readdirSync(x).sort()) {
      if (name === '.git') continue;
      const p = join(x, name);
      if (statSync(p).isDirectory()) walk(p);
      else { h.update(relative(d, p)); h.update(readFileSync(p)); }
    }
  };
  walk(d);
  return h.digest('hex');
}

function git(cwd, args) {
  return spawnSync('git', ['-c', 'user.name=check-register selftest', '-c', 'user.email=selftest@invalid',
    '-c', 'core.autocrlf=false', '-c', 'core.longpaths=true', ...args], { cwd, encoding: 'utf8', timeout: 120_000 });
}

/** Grade one run. An ENUMERATION, because an exit code cannot tell a detection from a crash. */
function verdict(probe, r) {
  const out = r.out;
  const got = failIds(out);
  if (r.status !== 0 && got.length === 0) return { outcome: 'crash', got, out };
  if (!RAN(out)) return { outcome: 'did-not-run', got, out };
  const notRun = rowIds(out, 'NOT RUN');
  const failRows = rowIds(out, 'FAIL');
  const wanted = [...probe.trips].sort();
  // **Two projections of one fact must agree** — the failure block and the report rows (W29).
  if (!setsEqual(got, wanted) || !setsEqual(failRows, wanted) || !setsEqual(notRun, [...probe.notRun].sort())) {
    return { outcome: 'against-declaration', got, notRun, failRows, out };
  }
  if (probe.says !== undefined && !mentions(out, probe.says)) return { outcome: 'wrong-reason', got, out };
  if (wanted.length === 0) return { outcome: r.status === 0 ? 'clean' : 'crash', got, out };
  if (r.status === 0) return { outcome: 'exit-zero', got, out };
  return { outcome: 'caught', got, out };
}

export async function selfTest(root) {
  if (NODE_MAJOR < MIN_NODE_MAJOR) {
    console.log(`check-register self-test — ABORT: node ${process.versions.node}, and the rungs here ` +
      `need >= ${MIN_NODE_MAJOR}.`);
    return 3;
  }
  const gv = spawnSync('git', ['--version'], { encoding: 'utf8' });
  if (gv.error || gv.status !== 0) {
    console.log('check-register self-test — ABORT: `git` cannot be run, and R4 is provoked in a real ' +
      'repository. A rung that cannot start is not a rung a probe took down.');
    return 3;
  }

  // Per PROCESS, and removed on the way out including the abort path — ADR 0072.
  const dir = mkdtempSync(join(root, 'dev-dist', `register-selftest-${process.pid}-`));
  process.on('exit', () => rmSync(dir, { recursive: true, force: true }));
  // Mutants sit ONE level below the root, so the copy's own `ROOT` is this repository, and carry a
  // leading dot, which keeps them out of `G6`'s and `G3`'s universe (W112's race).
  const mutants = new Set();
  process.on('exit', () => { for (const p of mutants) rmSync(p, { force: true }); });
  const mutantPath = (tag) => {
    const p = join(root, 'dev-dist', `.register-${process.pid}-${tag}.mjs`);
    mutants.add(p);
    return p;
  };

  const script = process.env.CHECK_REGISTER_SCRIPT ?? join(root, 'scripts', 'check-register.mjs');
  const meta = !process.env.CHECK_REGISTER_SCRIPT;
  const nestedSelf = !!process.env.CHECK_REGISTER_SELFTEST;
  const realSrc = readFileSync(join(root, 'scripts', 'check-register.mjs'), 'utf8');

  // **The scratch root is skipped by PATH — the parent of this run's own directory — rather than by
  // a name literal.** `G6` read the first cut's name test as a statement naming the shared scratch
  // directory with no pid in it, which is what it is: the exception `check-budget-selftest.mjs`
  // declares for the same line. Deriving it from `dir` needs no exception, and it is the one
  // directory every concurrent self-test writes into while this digest is being taken.
  const scratchRoot = dirname(dir);
  const digestTree = () => {
    const h = createHash('sha256');
    const walk = (d) => {
      for (const name of readdirSync(d).sort()) {
        if (name === 'node_modules' || name === '.git' || name === 'dist') continue;
        const p = join(d, name);
        if (p === scratchRoot) continue;
        if (statSync(p).isDirectory()) walk(p);
        else { h.update(relative(root, p).replace(/\\/g, '/')); h.update(readFileSync(p)); }
      }
    };
    walk(root);
    return h.digest('hex').slice(0, 16);
  };
  const before = digestTree();

  const banner = () => console.log('check-register self-test —');
  if (MAX_CORPUS !== 0) {
    banner();
    console.log(`  FAIL  MAX_CORPUS is ${MAX_CORPUS} and must be 0: a corpus grading says the mutant is ` +
      'noticed and nothing about the probe the entry names.');
    return 1;
  }
  {
    const have = [...new Set(GRADER_CONTROLS.map((g) => g.expect))].sort();
    const missing = GRADED_VERDICTS.filter((v) => !have.includes(v));
    if (GRADER_CONTROLS.length < MIN_GRADER || missing.length) {
      banner();
      console.log(`  FAIL  ${GRADER_CONTROLS.length} grader control(s), floor ${MIN_GRADER}, missing ` +
        `verdict(s) [${missing.join(', ')}]. A count is not a membership.`);
      return 1;
    }
  }
  if (PROBES.length < MIN_PROBES || META.length < MIN_META || SELF.length < MIN_SELF
      || STATE_PROBES.length < MIN_STATE || STATE_META.length < MIN_STATE_META) {
    console.log(`check-register self-test — ${PROBES.length} probes (floor ${MIN_PROBES}), ${META.length} meta ` +
      `(floor ${MIN_META}), ${SELF.length} self (floor ${MIN_SELF}), ${STATE_PROBES.length} state ` +
      `(floor ${MIN_STATE}), ${STATE_META.length} state meta (floor ${MIN_STATE_META}).`);
    console.log('  FAIL  a list is short, and `caught === length` is vacuous at zero.');
    return 1;
  }
  {
    const pn = PROBES.map((p) => p.name);
    const mn = META.map((m) => m[0]);
    const bad = [];
    if (new Set(pn).size !== pn.length) bad.push('two PROBES share a name');
    if (new Set(mn).size !== mn.length) bad.push('two META entries share a name');
    for (const m of META) if (!PROBES.some((p) => p.name === m[1])) bad.push(`META "${m[0]}" names probe "${m[1]}", which does not exist`);
    for (const m of STATE_META) if (!STATE_PROBES.some((p) => p.name === m[1])) bad.push(`STATE_META "${m[0]}" names probe "${m[1]}", which does not exist`);
    // **`CLUSTERS` against the README's own table, BOTH WAYS** — a near-miss is built for each name
    // here, so a cluster the README adds and this list lacks is a cluster nothing near-misses.
    {
      let readme = '';
      try { readme = readFileSync(join(root, 'doc', 'questions', 'README.md'), 'utf8'); } catch { readme = ''; }
      const at = readme.search(/^## Clusters[ \t]*$/m);
      const declared = at < 0 ? [] : readme.slice(at).split('\n').slice(1)
        .reduce((acc, l) => { if (acc.done || /^## /.test(l)) { acc.done = true; return acc; }
          const m = /^\|([^|]*)\|/.exec(l); const c = m ? m[1].trim() : '';
          if (c && c !== 'cluster' && !/^:?-+:?$/.test(c)) acc.out.push(c); return acc; }, { out: [], done: false }).out;
      for (const c of declared) if (!CLUSTERS.includes(c)) bad.push(`the README declares cluster "${c}" and CLUSTERS lacks it`);
      for (const c of CLUSTERS) if (!declared.includes(c)) bad.push(`CLUSTERS names "${c}" and the README does not declare it`);
    }
    // **COVERAGE, derived from the CHECK's own `fail('RN'` sites**, so the compound *lower the floor
    // and empty the list* cannot pass (W30): every id the check can report has a probe that trips
    // it and a META entry naming such a probe.
    const ids = [...new Set([...realSrc.matchAll(/\bfail\('(R\d)'/g)].map((m) => m[1]))].sort();
    if (!ids.length) bad.push('check-register.mjs reports no id where this reads them');
    for (const id of ids) {
      const probes = PROBES.filter((p) => p.trips.includes(id)).map((p) => p.name);
      if (!probes.length) bad.push(`${id} has no probe`);
      if (!META.some((m) => probes.includes(m[1]))) bad.push(`${id} has no META entry naming a probe of it`);
    }
    if (bad.length) {
      console.log(`check-register self-test — ${ids.length} id(s) in the check: ${ids.join(', ')}`);
      console.log(`  FAIL  ${bad.join('; ')}.`);
      return 1;
    }
  }

  // --- the base: the register as it is, and the NAMES R3 reads ------------------------
  const base = join(dir, 'base');
  mkdirSync(join(base, 'doc'), { recursive: true });
  cpSync(join(root, 'doc', 'questions'), join(base, 'doc', 'questions'), { recursive: true });
  for (const d of ['decisions', 'plans', 'work-items']) {
    mkdirSync(join(base, 'doc', d), { recursive: true });
    for (const f of readdirSync(join(root, 'doc', d))) writeFileSync(join(base, 'doc', d, f), '');
  }
  let seq = 0;
  /** Stage one probe's tree. Returns `{ tree }`, or `{ abort }` with the reason. */
  const stage = (probe) => {
    const top = join(dir, `t${seq++}`);
    // **`nested`: the copy sits one level INSIDE a repository of its own that does not track it** —
    // the shape every `git: false` probe has when this suite runs inside this repository, and NOT the
    // shape it has in a copy of the tree outside any repository. The first cut relied on the
    // environment for it, and `gate:full` in such a copy graded the top-level guard's META entry
    // `STILL clean`: with no outer repository, `git rev-parse` fails before the guard is reached. A
    // fixture the environment supplies is a fixture the environment can take away.
    const tree = probe.git === 'nested' ? join(top, 'inner') : top;
    cpSync(base, tree, { recursive: true });
    if (probe.git) {
      // **Only `doc/questions` is committed**, which is all `R4` lists, and `core.longpaths` is set:
      // the first cut committed the whole copy and `git add` refused an ADR name as *Filename too
      // long* in a copy under a deep scratch path — Windows' 260, which the repository's own
      // shorter path had hidden.
      const steps = probe.git === 'init-only' ? [[tree, ['init', '-q']]]
        : probe.git === 'nested'
          ? [[top, ['init', '-q']], [top, ['commit', '-q', '--allow-empty', '-m', 'an outer repository that does not track the copy']]]
          : [[tree, ['init', '-q']], [tree, ['add', '-A', '--', 'doc/questions']],
            [tree, ['commit', '-q', '-m', 'the register, unedited']]];
      for (const [cwd, a] of steps) {
        const g = git(cwd, a);
        if (g.error || g.status !== 0) return { abort: `git ${a[0]} failed in the staged copy: ${(g.stderr ?? '').trim()}` };
      }
    }
    if (probe.stage) {
      const was = digestDir(tree);
      try { probe.stage(tree); } catch (e) { return { abort: `the edit's anchor matched nothing — ${e.message}` }; }
      // **Rule 7 (b): a probe asserts it changed its input.**
      if (digestDir(tree) === was) return { abort: 'the staging changed nothing (rule 7 (b))' };
    }
    return { tree, top };
  };
  const run = (useScript, tree) => {
    const env = { ...process.env };
    delete env.CHECK_REGISTER_SELFTEST;
    if (tree) env.CHECK_REGISTER_ROOT = relative(root, tree).replace(/\\/g, '/');
    else delete env.CHECK_REGISTER_ROOT;
    const r = spawnSync(process.execPath, [useScript], { cwd: root, encoding: 'utf8', env, timeout: 300_000 });
    return { out: `${r.stdout ?? ''}${r.stderr ?? ''}`, status: r.status };
  };
  /** Run a probe against a script, or against a mutant of it, and grade it. */
  const grade = (probe, src) => {
    let useScript = script;
    const text = probe.declare ? probe.declare(src) : src;
    if (probe.declare && text === src) return { outcome: 'abort', why: 'the declaration mutation matched nothing' };
    if (text !== realSrc || probe.declare) { useScript = mutantPath(`run-${seq}`); writeFileSync(useScript, text); }
    const s = stage(probe);
    if (s.abort) { if (useScript !== script) rmSync(useScript, { force: true }); return { outcome: 'abort', why: s.abort }; }
    const r = run(useScript, s.tree);
    if (useScript !== script) rmSync(useScript, { force: true });
    rmSync(s.top, { recursive: true, force: true });
    return verdict(probe, r);
  };
  const expected = (p) => (p.trips.length ? 'caught' : 'clean');

  // Single-probe mode, for a reader re-running one entry.
  const only = process.env.CHECK_REGISTER_PROBE;
  if (only !== undefined) {
    const probe = [...PROBES, ...GRADER_CONTROLS].find((p) => p.name === only);
    if (!probe) { console.log(`  ABORT  no probe is named "${only}"`); return 3; }
    const v = grade(probe, realSrc);
    const want = probe.expect ?? expected(probe);
    console.log(`  ${v.outcome === want ? 'ok  ' : 'FAIL'}  ${probe.name} — ${v.outcome}${v.why ? `: ${v.why}` : ''}`);
    return v.outcome === want ? 0 : 1;
  }

  console.log(`check-register self-test — ${PROBES.length} probes, ${META.length} meta, ${SELF.length} self, ` +
    `${GRADER_CONTROLS.length} grader control(s)\n`);
  const failures = [];
  const describe = (p, v) => `${v.outcome}${v.why ? ` — ${v.why}` : ''}` +
    (v.got ? `, wanted [${p.trips}] not-run [${p.notRun}], got [${v.got}]` +
      `${v.notRun ? ` not-run [${v.notRun}] fail-rows [${v.failRows}]` : ''}` : '');

  // --- pass 1: the probes ---------------------------------------------------------------
  // **A SELF child stops at its first red**, and that is a cost decision taken at W116's fix round,
  // stated rather than hidden: a SELF child's only verdict is *did this suite go red*, and five of
  // its entries plant a defect pass 1 or the grader pass reaches — so running the whole of META and
  // STATE after the suite is already red bought nothing but wall clock (the lane was the slowest in
  // `gate:full` at 3,400 s). A guard whose only effect is in META or STATE is still reached by a
  // child that is NOT yet red, which is every child whose planted case lives there.
  const nestedRed = () => nestedSelf && failures.length > 0;
  let caught = 0, clean = 0;
  for (const probe of PROBES) {
    if (nestedRed()) break;
    const v = grade(probe, realSrc);
    if (v.outcome === expected(probe)) { if (v.outcome === 'caught') caught++; else clean++; }
    else failures.push(`${probe.name} — ${describe(probe, v)}`);
  }
  const firing = PROBES.filter((p) => p.trips.length).length;
  console.log(`  probes: ${caught}/${firing} caught, ${clean}/${PROBES.length - firing} clean, ` +
    'declared ceilings: none');

  // --- the grader's own controls ----------------------------------------------------------
  let graderOk = 0;
  for (const g of GRADER_CONTROLS) {
    const v = grade(g, realSrc);
    if (v.outcome === g.expect) graderOk++;
    else failures.push(`${g.name} — the grader said ${v.outcome} where the right verdict is ${g.expect}`);
  }
  console.log(`  grader: ${graderOk}/${GRADER_CONTROLS.length} control(s) graded as declared`);
  if (nestedRed()) {
    console.log('\n' + failures.map((f) => `  FAIL  ${f}`).join('\n'));
    console.log(`\n${failures.length} failure(s) — a SELF child, stopped at its first red.`);
    return 1;
  }

  // --- pass 2: META -----------------------------------------------------------------------
  let noticed = 0, byCorpus = 0;
  if (meta) {
    for (const [what, probeName, mutate] of META) {
      const mutated = mutate(realSrc);
      if (mutated === realSrc) { failures.push(`META ${what} — ABORT: the mutation matched nothing (rule 7 (b))`); continue; }
      const mutant = mutantPath('meta');
      writeFileSync(mutant, mutated);
      // Is the mutant INERT on the untouched tree? One that fails there is noticed by the corpus.
      const inert = run(mutant, null).status === 0;
      rmSync(mutant, { force: true });
      if (!inert) { byCorpus++; continue; }
      const probe = PROBES.find((p) => p.name === probeName);
      const v = grade(probe, mutated);
      if (v.outcome === 'abort') failures.push(`META ${what} — the probe aborted: ${v.why}`);
      else if (v.outcome === expected(probe)) failures.push(`META ${what} — STILL ${v.outcome} by "${probeName}", so the clause is not what it rests on`);
      else noticed++;
    }
    if (byCorpus > MAX_CORPUS) {
      failures.push(`META: ${byCorpus} mutant(s) were not inert and MAX_CORPUS is ${MAX_CORPUS}`);
    }
    console.log(`  meta: ${noticed}/${META.length} noticed by the named probe, ${byCorpus} by the corpus`);
  } else console.log('  meta: skipped — this run is already a META child');

  // --- pass 2b: STATE — `npm run state` against a third reading ------------------------------
  const stateScript = join(root, 'scripts', 'state.mjs');
  const stateSrc = readFileSync(stateScript, 'utf8');
  const sbase = join(dir, 'state-base');
  for (const d of ['plans', 'work-items', 'decisions', 'questions']) {
    cpSync(join(root, 'doc', d), join(sbase, 'doc', d), { recursive: true });
  }
  mkdirSync(join(sbase, 'examples'), { recursive: true });
  cpSync(join(root, 'examples', 'l6.ts'), join(sbase, 'examples', 'l6.ts'));
  for (const f of ['package.json', 'deno.json']) cpSync(join(root, f), join(sbase, f));
  /** The third reading: substring counts per file and the highest number on disk — no regex of state's. */
  const thirdReading = (tree) => {
    const qdir = join(tree, 'doc', 'questions');
    const names = readdirSync(qdir).filter((n) => /^q\d+\.md$/.test(n));
    const c = { total: names.length, open: 0, deferred: 0, icebox: 0, resolved: 0, maxId: 0 };
    for (const n of names) {
      c.maxId = Math.max(c.maxId, Number(n.slice(1, -3)));
      const text = readFileSync(join(qdir, n), 'utf8');
      for (const w of ['open', 'deferred', 'icebox', 'resolved']) if (text.includes(`\nstatus: ${w}\n`)) c[w]++;
    }
    return c;
  };
  const gradeState = (probe, src) => {
    const tree = join(dir, `s${seq++}`);
    cpSync(sbase, tree, { recursive: true });
    if (probe.stage) {
      const was = digestDir(tree);
      try { probe.stage(tree); } catch (e) { return { outcome: 'abort', why: e.message }; }
      if (digestDir(tree) === was) return { outcome: 'abort', why: 'the staging changed nothing (rule 7 (b))' };
    }
    let useScript = stateScript;
    if (src !== stateSrc) { useScript = mutantPath(`state-${seq}`); writeFileSync(useScript, src); }
    const env = { ...process.env, STATE_ROOT: relative(root, tree).replace(/\\/g, '/') };
    const r = spawnSync(process.execPath, [useScript], { cwd: root, encoding: 'utf8', env, timeout: 300_000 });
    if (useScript !== stateScript) rmSync(useScript, { force: true });
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
    const want = probe.exit === 0 ? thirdReading(tree) : null;
    rmSync(tree, { recursive: true, force: true });
    if (probe.exit === 1) {
      if (r.status !== 1) return { outcome: `exited ${r.status}` };
      if (/\n\s+at .+\(.*\)/.test(out) || /Error:/.test(out)) return { outcome: 'crashed — a stack trace, not a refusal' };
      if (!out.includes(probe.says)) return { outcome: `refused without "${probe.says}"` };
      return { outcome: 'refused' };
    }
    if (r.status !== 0) return { outcome: `exited ${r.status}` };
    const num = (re) => { const m = re.exec(out); return m ? m.slice(1).map(Number) : null; };
    const got = {
      total: num(/register questions \(doc\/questions\/\)\s+(\d+)/),
      lr: num(/of those, live \/ resolved\s+(\d+) \/ (\d+)/),
      od: num(/of the live, open \/ deferred\s+(\d+) \/ (\d+)/),
      ice: num(/of the live, iceboxed\s+(\d+)/),
      next: num(/from the tree\s+P\d+\s+W\d+\s+Q(\d+)/),
    };
    const bad = [];
    if (!got.total || got.total[0] !== want.total) bad.push(`questions ${got.total} vs ${want.total}`);
    if (!got.lr || got.lr[0] !== want.total - want.resolved || got.lr[1] !== want.resolved) bad.push(`live/resolved ${got.lr}`);
    if (!got.od || got.od[0] !== want.open || got.od[1] !== want.deferred) bad.push(`open/deferred ${got.od}`);
    if (!got.ice || got.ice[0] !== want.icebox) bad.push(`iceboxed ${got.ice} vs ${want.icebox}`);
    if (!got.next || got.next[0] <= want.maxId) bad.push(`next free Q${got.next} at or below Q${want.maxId} on disk`);
    return { outcome: bad.length ? `figures differ: ${bad.join('; ')}` : 'clean' };
  };
  const stateWant = (p) => (p.exit === 0 ? 'clean' : 'refused');
  let stateOk = 0, stateNoticed = 0;
  for (const p of STATE_PROBES) {
    const v = gradeState(p, stateSrc);
    if (v.outcome === stateWant(p)) stateOk++;
    else failures.push(`${p.name} — ${v.outcome}${v.why ? `: ${v.why}` : ''}`);
  }
  if (meta) {
    for (const [what, probeName, mutate] of STATE_META) {
      const mutated = mutate(stateSrc);
      if (mutated === stateSrc) { failures.push(`STATE_META ${what} — ABORT: the mutation matched nothing (rule 7 (b))`); continue; }
      const probe = STATE_PROBES.find((p) => p.name === probeName);
      const v = gradeState(probe, mutated);
      if (v.outcome === 'abort') failures.push(`STATE_META ${what} — the probe aborted: ${v.why}`);
      else if (v.outcome === stateWant(probe)) failures.push(`STATE_META ${what} — STILL ${v.outcome} by "${probeName}"`);
      else stateNoticed++;
    }
  }
  console.log(`  state: ${stateOk}/${STATE_PROBES.length} graded as declared, ` +
    `${meta ? `${stateNoticed}/${STATE_META.length} state meta noticed` : 'state meta skipped'}`);

  // --- pass 3: SELF -----------------------------------------------------------------------
  let bounded = 0;
  if (meta && !nestedSelf) {
    const selfSrc = readFileSync(join(root, 'scripts', 'check-register-selftest.mjs'), 'utf8');
    for (const [what, mutate] of SELF) {
      const mutated = mutate(selfSrc);
      if (mutated === selfSrc) { failures.push(`SELF ${what} — ABORT: the mutation matched nothing (rule 7 (b))`); continue; }
      const mutant = mutantPath('self');
      writeFileSync(mutant, mutated);
      const env = { ...process.env, CHECK_REGISTER_SELFTEST: relative(root, mutant).replace(/\\/g, '/') };
      delete env.CHECK_REGISTER_ROOT;
      const r = spawnSync(process.execPath, [join(root, 'scripts', 'check-register.mjs'), '--self-test'],
        { cwd: root, encoding: 'utf8', env, timeout: 900_000 });
      rmSync(mutant, { force: true });
      const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
      if (!SELF_RAN(out)) failures.push(`SELF ${what} — the mutant did not run: a crash, not a detection`);
      else if (r.status === 0) failures.push(`SELF ${what} — exited 0: the mutation costs nothing`);
      else bounded++;
    }
    console.log(`  self: ${bounded}/${SELF.length} bounded`);
  } else console.log('  self: skipped — a SELF child does not run SELF');

  // --- this run's own residue, named by its pid --------------------------------------------
  {
    const live = [...mutants].filter((p) => existsSync(p));
    const flat = readdirSync(join(root, 'dev-dist')).filter((n) => n.startsWith(`.register-${process.pid}-`));
    if (live.length || flat.length) {
      failures.push(`SCRATCH: ${live.length} registered and ${flat.length} flat mutant(s) of this pid ` +
        'are still in the scratch directory. Each is removed inline after its entry.');
    }
    console.log(`  scratch: ${live.length} registered + ${flat.length} flat mutant(s) left (must be 0)`);
  }
  const after = digestTree();
  if (before !== after) failures.push(`THE TREE MOVED: digest ${before} -> ${after}`);
  console.log(`  digest: ${before} -> ${after}${before === after ? ' (unmoved)' : ' — MOVED'}`);

  if (failures.length) {
    console.log('\n' + failures.map((f) => `  FAIL  ${f}`).join('\n'));
    console.log(`\n${failures.length} failure(s).`);
    return 1;
  }
  console.log('\nAll self-test passes clean.');
  return 0;
}
