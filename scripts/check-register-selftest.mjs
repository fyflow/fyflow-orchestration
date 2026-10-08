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
//   PROBES  break the INPUT. Each stages a copy of `doc/questions/` and of `doc/decisions/` WHOLE —
//           `R6`-`R8` read every ADR's front matter since W117 — plus the NAMES of every plan and
//           work item, which is all `R3` and `R7` read of them, and `doc/scheduler-upstream.md`,
//           whose `## S<n>` headings are `R7`'s S ids — points `CHECK_REGISTER_ROOT` at it, and
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
import { pathToFileURL } from 'node:url';

// --- the environment the rungs need -------------------------------------------
// v0.19: a rung that cannot START is indistinguishable in a report from one a probe took down.
const NODE_MAJOR = Number(process.versions.node.split('.')[0]);
const MIN_NODE_MAJOR = 24;

// --- the floors on this file's own lists, each AT its list's length -------------
// *A floor one below its list is a permission to delete the entry nobody has named* — W112.
const MIN_PROBES = 260;
const MIN_META = 192;
const MIN_SELF = 22;
const MIN_GRADER = 4;
const GRADED_VERDICTS = ['crash', 'wrong-reason', 'against-declaration', 'did-not-run'];
// A `corpus` grading is a pass and that is Q150: a mutant that fails on the untouched tree is
// noticed, but its probe verdict is noise. **Until W127 that was `MAX_CORPUS = 0`, and P29 broke it
// on purpose**: once triage iced a question, the mutant *`icebox` removed from the vocabulary*
// failed the untouched tree for ever, and a count of zero had no way to say that one mutant may.
// So the permission is an exact list BY META NAME, checked BOTH WAYS (rule 8 (e)): a listed mutant
// that is INERT on the base is red — the entry excuses nothing and would excuse whatever arrives —
// and an unlisted one that is not inert is red. Reported by id, never by count (v0.26).
// **Inertness is measured on the PLANTED BASE, not the repository's own register** — W127's
// conformity reader (finding 2): measured on the register, both entries leaned on its content, and
// giving the 64 deferred questions a `closes-when`, which ADR 0082 decision 3 permits, turned the
// suite red. On the base each entry is non-inert BY A SYNTHETIC FILE: *`icebox` removed* by Q8006,
// iceboxed with a note, and *R9 widened to `deferred`* by Q8005, deferred with no `closes-when`.
// **A listed mutant is ALSO graded by its named probe**, so a listing excuses the corpus's notice
// and nothing else — and the widened one's probe is a control isolated so that it sees the widening
// through its own file alone (the adequacy reader's finding 3).
const CORPUS_ALLOWED = Object.freeze([
  '`icebox` removed from the vocabulary',
  'R9 widened to `deferred`',
]);

const Q = (t, n) => join(t, 'doc', 'questions', `q${n}.md`);

// --- the SYNTHETIC fixtures, since W127 --------------------------------------------
// **No probe reads a live question's content.** Until W127 the fixtures were register questions
// chosen by their fields at the time — Q490 open with a note, Q488 open with an empty note, Q1
// resolved — and P29's triage moved them: W126's verdict on Q488 aborted every probe anchored on
// its `status: open`. A verdict is a register edit, so a fixture in the register is dated by the
// next triage. These are written into the staged copy by `plant` instead, under ids far above the
// register's maximum, and `plant` refuses to run if the register ever reaches one.
const OPEN = 8001;           // open, a note, an owner, a closing condition — the R1/R2 fixture
const BARE = 8002;           // open, an empty note — the one iced and deleted
const RES = 8003;            // resolved by prose naming no ADR
const RES_ADR = 8004;        // resolved by ADR 8803, which resolves it back — R8's pairing
const DEF = 8005;            // deferred, with its reason in `note`
const RES_PREFIXED = 80031;  // resolved; Q8003 is a PREFIX of its id
const ICE = 8006;            // iceboxed, with its note — so the vocabulary's fourth word is in every copy
/** Synthetic ADRs beside them, for R3's and R8's pairings: none resolves anything but 8803. */
const SYN_ADRS = ['8801', '8802', '8803'];
const Q1_BY = 'resolved-by: "The driver, outside the scheduler"\n';
const Q4_BY = 'Live tokens - ADR 8803, decided';
const Q466_LINK = '[ADR 0077](decisions/0077-an-item-does-not-write-its-status-into-claude-md.md) consequence 4';
/** One question's front matter, every field present, in the subset the README declares. */
const synQ = ({ id, title, status, cluster = 'Verification and fixtures', owner = '', closesWhen = '',
  resolvedBy = '', note = '', raisedBy = 'W127', shared = '' }) => ['---', `id: Q${id}`,
  `title: ${JSON.stringify(title)}`, `status: ${status}`, `cluster: ${JSON.stringify(cluster)}`,
  `owner: ${JSON.stringify(owner)}`, `closes-when: ${JSON.stringify(closesWhen)}`,
  `resolved-by: ${JSON.stringify(resolvedBy)}`, `note: ${JSON.stringify(note)}`,
  `raised-by: ${JSON.stringify(raisedBy)}`, `shared: ${JSON.stringify(shared)}`, '---', ''].join('\n');
const SYN_QUESTIONS = [
  { id: OPEN, title: 'a synthetic open question with a note', status: 'open', owner: 'no owner',
    closesWhen: 'a synthetic closing condition', note: 'a synthetic note' },
  { id: BARE, title: 'a synthetic open question with an empty note', status: 'open',
    closesWhen: 'a synthetic closing condition' },
  { id: RES, title: 'a synthetic question resolved by prose', status: 'resolved',
    resolvedBy: 'The driver, outside the scheduler' },
  { id: RES_ADR, title: 'a synthetic question resolved by a synthetic ADR', status: 'resolved',
    resolvedBy: Q4_BY },
  { id: DEF, title: 'a synthetic deferred question', status: 'deferred',
    note: 'a synthetic reason it is not now' },
  { id: RES_PREFIXED, title: 'a synthetic resolved question whose id Q8003 is a prefix of', status: 'resolved',
    resolvedBy: 'Two features over ONE region' },
  { id: ICE, title: 'a synthetic iceboxed question', status: 'icebox', note: 'a synthetic what-if' },
];
/**
 * **Q466 is the ONE register id a probe still needs, and only its NAME**: `NOT_A_RESOLUTION` in the
 * check excuses `Q466 -> ADR 0077` by id, so the exception's probes must edit a file of that name.
 * `plant` OVERWRITES it in the staged copy with this text, so no probe reads Q466's own content.
 */
const SYN_Q466 = synQ({ id: 466, title: 'a synthetic stand-in for Q466, the id NOT_A_RESOLUTION names',
  status: 'resolved', cluster: 'Documents and indexes', raisedBy: '',
  resolvedBy: `answered by a person, which ${Q466_LINK} left to a person` });
const synAdr = (nnnn, resolves = '""') => {
  const title = `A synthetic decision ${nnnn} the register self-test writes into its copy`;
  return ['---', `id: ADR ${nnnn}`, `title: ${JSON.stringify(title)}`, 'status: accepted', 'date: "2026-10-06"',
    'item: W127', 'raised-by: P29', 'supersedes: ""', 'amends: ""', `resolves: ${resolves}`, '---', '',
    `# ADR ${nnnn} — ${title}`, '', 'A fixture. It decides nothing.', ''].join('\n');
};
/** Write the synthetic fixtures into a staged copy — refusing to overwrite a register file. */
const plant = (t, { adrs = true } = {}) => {
  for (const q of SYN_QUESTIONS) {
    if (existsSync(Q(t, q.id))) throw new Error(`q${q.id}.md is in the register — the synthetic band is reached`);
    writeFileSync(Q(t, q.id), synQ(q));
  }
  if (!existsSync(Q(t, 466))) throw new Error('q466.md is not in the register, and NOT_A_RESOLUTION names it');
  writeFileSync(Q(t, 466), SYN_Q466);
  if (!adrs) return;
  const dir = join(t, 'doc', 'decisions');
  for (const nnnn of SYN_ADRS) {
    if (readdirSync(dir).some((n) => n.startsWith(`${nnnn}-`))) throw new Error(`ADR ${nnnn} is in the tree`);
    writeFileSync(join(dir, `${nnnn}-a-synthetic-fixture.md`), synAdr(nnnn, nnnn === '8803' ? `Q${RES_ADR}` : '""'));
  }
};
/**
 * **A probe that WRITES a register question is refused** — W127's adequacy reader (H3b) re-pointed
 * the emptied R9 probe at a live question and single-probe mode graded it caught: `plant` guards the
 * synthetic band, and nothing guarded the register FROM a probe. So every staged tree is compared to
 * its base after the probe's staging, and a question file below the band that is NEW or CHANGED
 * aborts the probe by name — a fixture in the register is dated by the next triage (W126's
 * calibration 1). **Deleting one is not a write** (the floor and folder probes read no content).
 * The two stand-ins are overwritten whole by NAME and read for nothing; a probe that must write
 * the register declares `writesRegister` with its reason, which is the one way past this.
 */
const SYN_FLOOR = 8000;
const STAND_INS = new Set([1, 466]);
const registerWrites = (tree, baseQ) => {
  const qdir = join(tree, 'doc', 'questions');
  if (!existsSync(qdir)) return [];
  const out = [];
  for (const n of readdirSync(qdir)) {
    const m = /^q(\d+)\.md$/.exec(n);
    if (!m) continue;
    const id = Number(m[1]);
    if (id >= SYN_FLOOR || STAND_INS.has(id)) continue;
    const f = join(qdir, n);
    if (!statSync(f).isFile()) continue;
    const was = baseQ.get(n);
    if (was === undefined || !readFileSync(f).equals(was)) out.push(n);
  }
  return out.sort();
};
/** A base's question files, read once: `name -> bytes`. */
const questionBytes = (tree) => new Map(readdirSync(join(tree, 'doc', 'questions'))
  .filter((n) => statSync(join(tree, 'doc', 'questions', n)).isFile())
  .map((n) => [n, readFileSync(join(tree, 'doc', 'questions', n))]));
/**
 * Give every DEFERRED question with an empty `closes-when` one — so a control moved to deferred is
 * the only deferred file a widening of R9 could see. Selected by status at staging time, so no
 * triage verdict moves it; at least Q8005 must be filled, or it threw.
 */
const fillDeferred = (t) => {
  const qdir = join(t, 'doc', 'questions');
  let filled = 0;
  for (const n of readdirSync(qdir).filter((x) => /^q\d+\.md$/.test(x))) {
    const f = join(qdir, n);
    const text = readFileSync(f, 'utf8');
    if (!text.includes('\nstatus: deferred\n') || !text.includes('\ncloses-when: ""\n')) continue;
    writeFileSync(f, text.replace('\ncloses-when: ""\n', '\ncloses-when: "a staged closing condition"\n'));
    filled++;
  }
  if (!filled || readFileSync(Q(t, DEF), 'utf8').includes('closes-when: ""')) throw new Error('fillDeferred filled nothing, or not Q8005');
};
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
/** A NEW valid question under a fresh id — the synthetic open one's fields, written, never cloned. */
const raise = (t, n) => {
  if (existsSync(Q(t, n))) throw new Error(`q${n}.md already exists`);
  writeFileSync(Q(t, n), synQ({ ...SYN_QUESTIONS[0], id: n }));
};

// --- the ADRs, since W117 --------------------------------------------------------
/** The staged path of ADR `nnnn`, found by its number — the slug is not this harness's to repeat. */
const A = (t, nnnn) => {
  const dir = join(t, 'doc', 'decisions');
  const f = readdirSync(dir).find((n) => n.startsWith(`${nnnn}-`));
  if (!f) throw new Error(`no ADR ${nnnn} in the staged copy`);
  return join(dir, f);
};
/** An anchored edit of one ADR, as `edit` is of one question. */
const adrEdit = (t, nnnn, from, to) => {
  const p = A(t, nnnn);
  const s = readFileSync(p, 'utf8');
  if (!s.includes(from)) throw new Error(`ADR ${nnnn} does not contain ${JSON.stringify(from)}`);
  writeFileSync(p, s.replace(from, to));
};
/**
 * Replace the WHOLE `key: …` line of one ADR's FRONT MATTER — checked to sit above the closing
 * fence, because an ADR's body is prose and may carry a line that opens with the same word.
 */
const adrSet = (t, nnnn, key, value) => {
  const p = A(t, nnnn);
  const s = readFileSync(p, 'utf8');
  const m = new RegExp(`^${key}: .*$`, 'm').exec(s);
  if (!m || m.index > s.indexOf('\n---\n', 3)) throw new Error(`ADR ${nnnn}'s front matter has no ${key} line`);
  writeFileSync(p, s.slice(0, m.index) + `${key}: ${value}` + s.slice(m.index + m[0].length));
};
/** Delete one front-matter line of one ADR. */
const adrDrop = (t, nnnn, key) => {
  const p = A(t, nnnn);
  const s = readFileSync(p, 'utf8');
  const m = new RegExp(`^${key}: .*\\n`, 'm').exec(s);
  if (!m || m.index > s.indexOf('\n---\n', 3)) throw new Error(`ADR ${nnnn}'s front matter has no ${key} line`);
  writeFileSync(p, s.slice(0, m.index) + s.slice(m.index + m[0].length));
};
/**
 * **Anchored on the CLOSING FENCE, never on a field's value** — W127. These probes anchored on
 * `resolves: ""\n---\n`, and P29 decision 5 says a resolution naming an ADR edits that ADR's
 * `resolves`: the next triage verdict naming ADR 0079 would have aborted them. `adrAppend` writes
 * lines above the fence; `adrUnclose` deletes the fence.
 */
const adrFence = (t, nnnn) => {
  const p = A(t, nnnn);
  const s = readFileSync(p, 'utf8');
  const close = s.indexOf('\n---\n', 3);
  if (!s.startsWith('---\n') || close < 0) throw new Error(`ADR ${nnnn} has no front matter to edit`);
  return { p, s, close };
};
const adrAppend = (t, nnnn, lines) => {
  const { p, s, close } = adrFence(t, nnnn);
  writeFileSync(p, s.slice(0, close + 1) + lines + s.slice(close + 1));
};
const adrUnclose = (t, nnnn) => {
  const { p, s, close } = adrFence(t, nnnn);
  writeFileSync(p, s.slice(0, close + 1) + s.slice(close + 5));
};
/**
 * **A copy of ADR 0079 under another NAME, its id and H1 renumbered to the name's digits**, so the
 * copy is valid in everything but its name — the one way a name probe tells `ADR_NAME` apart from
 * the id and H1 clauses, which a plain copy would trip as well and so cover for it.
 */
const adrClone = (t, name, digits) => {
  const s = readFileSync(A(t, '0079'), 'utf8');
  // **Each edit checked on its own — W143, Q434.** This was one compound guarded by `out === s`, so a
  // clone whose H1 had moved still changed (by its id line) and was written with the OLD H1: a copy
  // invalid in a way the name probes do not name. Now either anchor missing throws, like every helper here.
  if (!s.includes('id: ADR 0079\n')) throw new Error('ADR 0079 has no id line to renumber');
  if (!s.includes('\n# ADR 0079 — ')) throw new Error('ADR 0079 has no H1 to renumber');
  const out = s.replace('id: ADR 0079\n', `id: ADR ${digits}\n`).replace('\n# ADR 0079 — ', `\n# ADR ${digits} — `);
  writeFileSync(join(t, 'doc', 'decisions', name), out);
};

// ==============================================================================
// PROBES — break the INPUT
// ==============================================================================
//
// `trips` is the exact set of ids the failure block must name; `notRun` the exact set the report
// must print as NOT RUN — `['R4']` for every `git: false` copy, `[]` for every `git: true` one.
// The fixtures are SYNTHETIC since W127 — `OPEN`, `BARE`, `RES` and the rest above, planted into
// the staged copy — so no triage verdict, and no growth of the register, moves one.
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
const FIXTURES = new Set([...SYN_QUESTIONS.map((q) => q.id), 466]);
/**
 * Delete question files, lowest non-fixture id first, until the folder holds `REAL_FLOOR - 1` —
 * skipping every question an ADR's front matter NAMES, since W117: deleting one is `R7`'s failure
 * too, and this probe's declared set is the floor's alone.
 */
const dropBelowFloor = (t) => {
  if (!Number.isInteger(REAL_FLOOR)) throw new Error('QUESTION_FLOOR could not be read from check-register.mjs');
  const dir = join(t, 'doc', 'questions');
  const ids = readdirSync(dir).map((f) => /^q(\d+)\.md$/.exec(f)?.[1]).filter(Boolean).map(Number)
    .sort((a, b) => a - b);
  const named = new Set();
  const ddir = join(t, 'doc', 'decisions');
  for (const f of existsSync(ddir) ? readdirSync(ddir).filter((n) => /^\d{4}-/.test(n)) : []) {
    const s = readFileSync(join(ddir, f), 'utf8');
    for (const [, n] of s.slice(0, s.indexOf('\n---\n', 3)).matchAll(/\bQ(\d+)\b/g)) named.add(Number(n));
  }
  let count = ids.length;
  for (const id of ids) {
    if (count < REAL_FLOOR) break;
    if (FIXTURES.has(id) || named.has(id)) continue;
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

// --- R6-R8, W117: written to the RULE before the first green run ------------------------------
// W116's first round shipped 28 probes and its adequacy reader found about 30 narrowings through
// them, because every probe used one bad value FAR from every legal one. So: a near-miss of every
// value a clause enumerates, a probe deleting EACH required field, each reader guard provoked on an
// ADR, a second-id-missing cell for every id-bearing field, and each R8 direction broken alone.
const r6 = (name, says, stage) => ({ name, git: false, trips: ['R6'], notRun: NR, says, stage });
const r7 = (name, says, stage) => ({ name, git: false, trips: ['R7'], notRun: NR, says, stage });
const r8 = (name, says, stage) => ({ name, git: false, trips: ['R8'], notRun: NR, says, stage });
const clean = (name, stage) => ({ name, git: false, trips: [], notRun: NR, stage });
/** P28 decision 2's nine fields — a probe deletes EACH. */
const ADR_FIELDS = ['id', 'title', 'status', 'date', 'item', 'raised-by', 'supersedes', 'amends', 'resolves'];
/** Near-misses of the two words, the word a superseded ADR would want, and the QUESTION register's. */
const ADR_STATUS_NEAR_MISSES = ['Accepted', 'accept', 'acceptedd', 'Proposed', 'propose', 'superseded', 'resolved', 'open'];
/**
 * Near-misses of `ADR 0079` inside 0079-*.md, as `[written, read]`. `0079` is QUOTED: plain, it is
 * a YAML number and the reader refuses it first, which would test the reader and not the id clause.
 */
const ADR_ID_NEAR_MISSES = [['ADR 79', 'ADR 79'], ['ADR-0079', 'ADR-0079'], ['"0079"', '0079'],
  ['adr 0079', 'adr 0079'], ['"ADR  0079"', 'ADR  0079'], ['ADR 00079', 'ADR 00079'], ['ADR 0080', 'ADR 0080']];
/** Dates that are not a real YYYY-MM-DD, each quoted so the DATE clause and not the reader sees it. */
const DATE_NEAR_MISSES = ['2026-10-4', '04-10-2026', '2026/10/04', '2026-02-30', '2026-13-01',
  '2026-10-04T00:00:00Z', ' 2026-10-04'];
/** Near-misses of `ADR 0078` as a `supersedes` entry — and a LINK, which front matter never holds. */
const RULED_NEAR_MISSES = ['ADR 78', 'ADR-0078', '0078', 'adr 0078', 'ADR 0078 rule', 'ADR 0078 rules 1, 2, and 6',
  'ADR 0078 section 2', 'ADR 0078, ADR 0076', 'ADR 0078;ADR 0076', '[ADR 0078](0078-x.md)'];
/** Near-misses of a `raised-by` list on ADR 0079, as `[written, the entry the check reports]`. */
const ID_NEAR_MISSES = [['P28,Q4', 'P28,Q4'], ['p28', 'p28'], ['P028', 'P028'], ['P28 decisions 1 and 3', 'P28 decisions 1 and 3'],
  ['[P28](../plans/p28.md)', '[P28](../plans/p28.md)'], ['P28, ', ''], ['Q 4', 'Q 4']];
/** A full YAML 1.1 timestamp in each shape a clause of it admits — W117's adequacy reader's nine survivors. */
const TIMESTAMPS = ['2026-10-04T10:00:00Z', '2026-10-04t10:00:00', '2026-10-04 10:00:00', '2026-10-04T10:00:00.5',
  '2026-10-04T10:00:00+02', '2026-10-04T10:00:00 Z', '2026-10-04T1:00:00', '2026-1-4T10:00:00'];
/** YAML 1.1 numbers the first reader passed as strings: sexagesimal, binary, and SIGNED hex and octal. */
const YAML_NUMBERS = ['1:30', '190:20:30.15', '0b101', '+0x1F', '+0o17'];
const r9 = (name, says, stage) => ({ name, git: false, trips: ['R9'], notRun: NR, says, stage });
/** Empty an open question's closing condition — the input every R9 probe starts from. */
const noClose = (t, n) => setLine(t, n, 'closes-when', '""');

const PROBES = [
  // --- the controls — v0.11: a probe that changes nothing comes back clean ----------
  { name: 'CONTROL — a staged copy that is not a repository: clean, and R4 NOT RUN',
    git: false, trips: [], notRun: NR, stage: null },
  { name: 'CONTROL — a staged copy that IS a repository, HEAD = the tree: clean, R4 runs',
    git: true, trips: [], notRun: [], stage: null },
  { name: 'icebox WITH a note is accepted — the fourth word is in the vocabulary',
    git: false, trips: [], notRun: NR,
    stage: (t) => { edit(t, BARE, 'status: open\n', 'status: icebox\n');
      edit(t, BARE, 'note: ""\n', 'note: "a what-if: no flow in the corpus reaches it"\n'); } },

  // --- R1: the names, and each id is its file's ---------------------------------
  { name: 'a stray file in the folder that is not q<N>.md',
    git: false, trips: ['R1'], notRun: NR, says: 'is not `q<N>.md`',
    stage: (t) => writeFileSync(join(t, 'doc', 'questions', 'notes.md'), '# notes\n') },
  { name: 'a PADDED name, q08001.md, declaring the id its digits spell',
    git: false, trips: ['R1'], notRun: NR, says: 'q08001.md is not',
    stage: (t) => writeFileSync(join(t, 'doc', 'questions', 'q08001.md'),
      synQ({ ...SYN_QUESTIONS[0], id: '08001' })) },
  // W116's adequacy reader, R1-n1: `NAME` made case-insensitive accepted this, and `state.mjs`
  // skipped it in silence.
  { name: 'an UPPER-CASE name, Q9001.md, declaring its own id',
    git: false, trips: ['R1'], notRun: NR, says: 'Q9001.md is not',
    stage: (t) => writeFileSync(join(t, 'doc', 'questions', 'Q9001.md'), synQ({ ...SYN_QUESTIONS[0], id: 9001 })) },
  { name: 'a file whose id disagrees with its name — a second Q8002 inside q8001.md',
    git: false, trips: ['R1'], notRun: NR, says: 'its name says Q8001',
    stage: (t) => edit(t, OPEN, `id: Q${OPEN}\n`, `id: Q${BARE}\n`) },
  // R1-n2 and R1-n3: a NUMERIC and a case-folding comparison each passed one of these.
  { name: 'a padded ID inside its own file — `id: Q08001` in q8001.md',
    git: false, trips: ['R1'], notRun: NR, says: 'declares `id: Q08001`',
    stage: (t) => edit(t, OPEN, `id: Q${OPEN}\n`, 'id: Q08001\n') },
  { name: 'a lower-case ID inside its own file — `id: q8001` in q8001.md',
    git: false, trips: ['R1'], notRun: NR, says: 'declares `id: q8001`',
    stage: (t) => edit(t, OPEN, `id: Q${OPEN}\n`, 'id: q8001\n') },

  // --- R2: every field, the vocabulary, the clusters, the subset -----------------------
  // EACH of the ten fields deleted, because the first cut deleted only `shared` and a missing-field
  // test that skipped `note` passed every probe (R2-n7). Deleting `id` also trips R1, honestly: the
  // file then declares no id, which is not its name's.
  ...FIELDS.map((f) => ({
    name: `a required field missing — \`${f}\` deleted`,
    git: false, trips: f === 'id' ? ['R1', 'R2'] : ['R2'], notRun: NR, says: `has no \`${f}\``,
    stage: (t) => { const s = readFileSync(Q(t, OPEN), 'utf8');
      const re = new RegExp(`^${f}: .*\\n`, 'm');
      if (!re.test(s)) throw new Error(`q${OPEN}.md has no ${f} line`);
      writeFileSync(Q(t, OPEN), s.replace(re, '')); },
  })),
  r2('a field P28 decision 1 does not declare — `closes-by` beside `closes-when`', 'declares `closes-by`',
    // A key in the subset's own spelling: `closes_when` is refused EARLIER, as a line that is not
    // `key: value`, and graded `wrong-reason` on this probe's first run.
    (t) => edit(t, OPEN, 'shared: ""\n', 'shared: ""\ncloses-by: ""\n')),
  // R2-n8: a test that flagged only HYPHENATED extras passed a plain one.
  r2('an undeclared field with no hyphen — `foo`', 'declares `foo`',
    (t) => edit(t, OPEN, 'shared: ""\n', 'shared: ""\nfoo: ""\n')),
  // R2-r1: the duplicate-key refusal had no probe at all.
  r2('a field declared TWICE — two `title` lines', 'declares `title` twice',
    (t) => edit(t, OPEN, `id: Q${OPEN}\n`, `id: Q${OPEN}\ntitle: "a second title"\n`)),
  r2('an empty title', '`title` is empty', (t) => setLine(t, OPEN, 'title', '""')),
  // R2-n6: the non-empty test without its trim.
  r2('a title of one SPACE', '`title` is empty', (t) => setLine(t, OPEN, 'title', '" "')),
  r2('a status outside the four words — `closed`', 'status is "closed"',
    (t) => edit(t, OPEN, 'status: open\n', 'status: closed\n')),
  // R2-n1 and R2-n2: a prefix match and a case-folded match each passed one of these.
  ...STATUS_NEAR_MISSES.map((w) => r2(`a status NEAR-MISS — \`${w}\``, `status is "${w}"`,
    (t) => edit(t, OPEN, 'status: open\n', `status: ${w}\n`))),
  r2('a cluster the README does not declare', 'cluster "Nowhere" is not',
    (t) => setLine(t, OPEN, 'cluster', '"Nowhere"')),
  // R2-n3 and R2-n4, and a near-miss of EVERY declared cluster (rule 8 (a)).
  ...CLUSTERS.map((c) => r2(`a cluster NEAR-MISS — "${c.toLowerCase()}"`, `cluster "${c.toLowerCase()}" is not`,
    (t) => setLine(t, OPEN, 'cluster', JSON.stringify(c.toLowerCase())))),
  r2('a cluster that is a SUBSTRING of a declared one — "join"', 'cluster "join" is not',
    (t) => setLine(t, OPEN, 'cluster', '"join"')),
  r2('a cluster with a trailing space inside its quotes — "The join "', 'cluster "The join " is not',
    (t) => setLine(t, OPEN, 'cluster', '"The join "')),
  r2('icebox with an EMPTY note', 'iceboxed with no `note`',
    (t) => edit(t, BARE, 'status: open\n', 'status: icebox\n')),
  // R2-n5: the icebox test without its trim.
  r2('icebox with a note of one SPACE', 'iceboxed with no `note`',
    (t) => { edit(t, BARE, 'status: open\n', 'status: icebox\n'); edit(t, BARE, 'note: ""\n', 'note: " "\n'); }),
  r2('front matter with no closing fence — unreadable, so no field is present', 'has no closing `---` line',
    (t) => { const s = readFileSync(Q(t, OPEN), 'utf8');
      if (!s.endsWith('\n---\n')) throw new Error(`q${OPEN}.md does not close with ---`);
      writeFileSync(Q(t, OPEN), s.slice(0, -4)); }),
  // R2-n9: a reader that normalised a BOM and CRLF first accepted this file.
  r2('a file with a BOM and CRLF line ends', 'does not open with a `---` line',
    (t) => { const s = readFileSync(Q(t, OPEN), 'utf8');
      writeFileSync(Q(t, OPEN), `﻿${s.replace(/\n/g, '\r\n')}`); }),
  // Each guard of the plain subset, one input each (R2-r2 .. R2-r5), and every typed word.
  r2('a plain value outside the declared subset — an unquoted `: ` inside it', 'carries a comment or a mapping',
    (t) => setLine(t, OPEN, 'owner', 'no owner: nobody')),
  r2('a plain value carrying an inline COMMENT — `a # comment`', 'carries a comment or a mapping',
    (t) => setLine(t, OPEN, 'title', 'a # comment')),
  r2('a plain value with a TRAILING space', 'leading or trailing space',
    (t) => setLine(t, OPEN, 'title', 'x ')),
  r2('a plain value opening with a YAML indicator — `[a, b]`', 'opens with a YAML indicator',
    (t) => setLine(t, OPEN, 'title', '[a, b]')),
  r2('an EMPTY unquoted value — `shared: `, which YAML reads as null', 'is empty and unquoted',
    (t) => setLine(t, OPEN, 'shared', '')),
  ...TYPED_WORDS.map((w) => r2(`a plain word YAML would TYPE — \`shared: ${w}\``, `plain value "${w}" is a YAML`,
    (t) => setLine(t, OPEN, 'shared', w))),
  r2("the README's Clusters table emptied — no cluster can be checked", 'declares no cluster',
    (t) => { const p = join(t, 'doc', 'questions', 'README.md');
      const s = readFileSync(p, 'utf8');
      const out = s.replace(/(## Clusters\n[\s\S]*?)(\n## )/, (_, body, next) =>
        body.split('\n').filter((l) => !/^\| [A-Z]/.test(l) || l.startsWith('| cluster')).join('\n') + next);
      if (out === s) throw new Error('README.md: the Clusters table matched nothing');
      writeFileSync(p, out); }),

  // --- R3: resolved iff resolved-by, and what it names exists ------------------------
  r3('resolved with an EMPTY resolved-by', 'is resolved and `resolved-by` is empty',
    (t) => edit(t, RES, Q1_BY, 'resolved-by: ""\n')),
  // R3-n2: the emptiness test without its trim.
  r3('resolved with a resolved-by of one SPACE', 'is resolved and `resolved-by` is empty',
    (t) => edit(t, RES, Q1_BY, 'resolved-by: " "\n')),
  r3('open with a resolved-by filled', 'is open and `resolved-by` is filled',
    (t) => edit(t, OPEN, 'resolved-by: ""\n', 'resolved-by: "nothing yet"\n')),
  // R3-n3: the reverse clause narrowed to `open` passed these — every non-resolved word.
  r3('deferred with a resolved-by filled', 'is deferred and `resolved-by` is filled',
    (t) => edit(t, DEF, 'resolved-by: ""\n', 'resolved-by: "nothing yet"\n')),
  r3('icebox with a resolved-by filled', 'is icebox and `resolved-by` is filled',
    (t) => { edit(t, BARE, 'status: open\n', 'status: icebox\n');
      edit(t, BARE, 'note: ""\n', 'note: "a what-if"\n');
      edit(t, BARE, 'resolved-by: ""\n', 'resolved-by: "nothing yet"\n'); }),
  r3('resolved-by naming an ADR that does not exist', 'names ADR 9999',
    (t) => edit(t, RES, Q1_BY, 'resolved-by: "The driver, outside the scheduler - ADR 9999"\n')),
  // R3-n1, C10, C11: the SECOND id of a cell, the list form, and the hyphenated form. **Since W117
  // an ADR a resolved-by names must list the question back (`R8`)**, so each probe that names an
  // existing ADR also writes that ADR's `resolves` — the probe is R3's, and R8 is held clean beside
  // it. The ADRs are the SYNTHETIC 8801 and 8802 since W127, so no resolution can move them.
  r3('resolved-by naming two ADRs, the SECOND missing — `ADR 8801 and ADR 9999`', 'names ADR 9999',
    (t) => { edit(t, RES, Q1_BY, 'resolved-by: "ADR 8801 and ADR 9999"\n'); adrSet(t, '8801', 'resolves', `Q${RES}`); }),
  r3('resolved-by in the LIST form, the second missing — `ADRs 8801 and 9999`', 'names ADR 9999',
    (t) => { edit(t, RES, Q1_BY, 'resolved-by: "ADRs 8801 and 9999"\n'); adrSet(t, '8801', 'resolves', `Q${RES}`); }),
  r3('resolved-by in the HYPHENATED form — `ADR-9999`', 'names ADR 9999',
    (t) => edit(t, RES, Q1_BY, 'resolved-by: "ADR-9999"\n')),
  { name: 'resolved-by in the list form with BOTH ADRs present — `ADRs 8801 and 8802` is clean',
    git: false, trips: [], notRun: NR,
    stage: (t) => { edit(t, RES, Q1_BY, 'resolved-by: "ADRs 8801 and 8802"\n');
      adrSet(t, '8801', 'resolves', `Q${RES}`); adrSet(t, '8802', 'resolves', `Q${RES}`); } },
  r3('resolved-by naming a PLAN that does not exist', 'names P999,',
    (t) => edit(t, RES, Q1_BY, 'resolved-by: "The driver, outside the scheduler - P999"\n')),
  r3('resolved-by naming a WORK ITEM that does not exist', 'names W9999,',
    (t) => edit(t, RES, Q1_BY, 'resolved-by: "The driver, outside the scheduler - W9999"\n')),

  // --- R9: an open question says what would close it — W127, ADR 0082 ------------------------
  // Written from P29 decision 6's sentence before the first run: *every `status: open` question has
  // a non-empty `closes-when`*, and *`deferred` is not bound*. Rule 8 (a): EVERY status word is a
  // fixture, and the three R9 does not bind are the SAME file with only its status moved, so each
  // control differs from the firing probe by the one thing the clause selects on.
  r9('an open question with its closes-when EMPTIED', 'q8001.md is open and its `closes-when` is empty',
    (t) => noClose(t, OPEN)),
  r9('an open question with a closes-when of one SPACE', 'q8001.md is open and its `closes-when` is empty',
    (t) => setLine(t, OPEN, 'closes-when', '" "')),
  r9('an open question with a closes-when of a TAB and a NEWLINE', 'q8001.md is open and its `closes-when` is empty',
    (t) => setLine(t, OPEN, 'closes-when', '"\\t\\n"')),
  clean('R9 CONTROL — the same question DEFERRED with an empty closes-when is clean: deferred is not bound',
    (t) => { noClose(t, OPEN); edit(t, OPEN, 'status: open\n', 'status: deferred\n'); }),
  clean('R9 CONTROL — the same question ICEBOXED, with its note, and an empty closes-when is clean',
    (t) => { noClose(t, OPEN); edit(t, OPEN, 'status: open\n', 'status: icebox\n'); }),
  clean('R9 CONTROL — the same question RESOLVED, with a resolved-by, and an empty closes-when is clean',
    (t) => { noClose(t, OPEN); edit(t, OPEN, 'status: open\n', 'status: resolved\n');
      setLine(t, OPEN, 'resolved-by', '"a synthetic answer"'); }),
  // A status NEAR-MISS is R2's and not R9's: R9 binds the word `open` and nothing that resembles it.
  ...STATUS_NEAR_MISSES.map((w) => r2(`R9 — a status NEAR-MISS \`${w}\` with an empty closes-when is R2's alone`,
    `status is "${w}"`, (t) => { noClose(t, OPEN); edit(t, OPEN, 'status: open\n', `status: ${w}\n`); })),
  // A file R2 cannot read is R2's: R9 reads no field of it.
  r2('R9 — an open question with an empty closes-when whose front matter never closes is R2`s alone',
    'has no closing `---` line', (t) => { noClose(t, OPEN);
      const s = readFileSync(Q(t, OPEN), 'utf8');
      if (!s.endsWith('\n---\n')) throw new Error(`q${OPEN}.md does not close with ---`);
      writeFileSync(Q(t, OPEN), s.slice(0, -4)); }),
  // The loop's BOUNDS (rule 8 (d)): the first file in the folder's order and the last. **q1.md is
  // the first name any listing can hold** — `q0…` is refused by R1 and `.` sorts below every digit —
  // so this probe needs that NAME. It OVERWRITES the file whole, reading none of Q1's content; Q1 is
  // resolved by prose that names no ADR, and no ADR's `resolves` lists it.
  r9('R9 — the FIRST file in the folder`s order, q1.md, open with no closing condition',
    'q1.md is open and its `closes-when` is empty',
    (t) => writeFileSync(Q(t, 1), synQ({ id: 1, title: 'a synthetic stand-in at the first position', status: 'open' }))),
  r9('R9 — the LAST file in the folder`s order, q99999.md, open with no closing condition',
    'q99999.md is open and its `closes-when` is empty',
    (t) => writeFileSync(Q(t, 99999), synQ({ id: 99999, title: 'a synthetic question at the last position', status: 'open' }))),
  // **R9 beside ANOTHER failure** — W127's adequacy reader, CR11-CR15: every probe above stages one
  // fault, so R9 stopping at its first failure, running only on a clean tree, or skipping a file
  // that is wrong in some OTHER way, survived all of them. ADR 0082 decision 2 excuses only a file
  // that does not parse or lacks `status` or `closes-when`; each of these parses, so R9 fires.
  { name: 'R9 — TWO open questions with no closing condition: BOTH are named',
    git: false, trips: ['R9'], notRun: NR, says: ['q8001.md is open and its `closes-when` is empty', 'q8002.md is open and its `closes-when` is empty'],
    stage: (t) => { noClose(t, OPEN); noClose(t, BARE); } },
  { name: 'R9 — no closing condition AND an undeclared cluster: R2 and R9 both',
    git: false, trips: ['R2', 'R9'], notRun: NR, says: 'q8001.md is open and its `closes-when` is empty',
    stage: (t) => { noClose(t, OPEN); setLine(t, OPEN, 'cluster', '"Nowhere"'); } },
  { name: 'R9 — no closing condition AND an eleventh field: R2 and R9 both',
    git: false, trips: ['R2', 'R9'], notRun: NR, says: 'q8001.md is open and its `closes-when` is empty',
    stage: (t) => { noClose(t, OPEN); edit(t, OPEN, '\nraised-by: ', '\nstray: ""\nraised-by: '); } },
  { name: 'R9 — no closing condition AND an id that disagrees with its name: R1 and R9 both',
    git: false, trips: ['R1', 'R9'], notRun: NR, says: 'q8001.md is open and its `closes-when` is empty',
    stage: (t) => { noClose(t, OPEN); setLine(t, OPEN, 'id', 'Q8009'); } },
  // **The emptiness test's other edge**: a SHORT condition is a condition, and `TBD` passes, which
  // ADR 0082 consequence 3 says outright (CR16, CR19); a NON-ASCII space `trim()` removes is empty
  // (CR17).
  clean('R9 — a closes-when of ONE character, `x`, is a closing condition: clean',
    (t) => setLine(t, OPEN, 'closes-when', '"x"')),
  clean('R9 — a closes-when of `TBD` passes: R9 reads emptiness, not content (ADR 0082 consequence 3)',
    (t) => setLine(t, OPEN, 'closes-when', '"TBD"')),
  r9('R9 — a closes-when of a NO-BREAK SPACE alone, which trim() removes', 'q8001.md is open and its `closes-when` is empty',
    (t) => setLine(t, OPEN, 'closes-when', '"\u00a0"')),
  // **A control seen to discriminate ON ITS OWN** — the adequacy reader's finding 3: Q8005 and the
  // register's deferred questions trip any widening in every copy, so the controls above are never
  // the reason a widening is seen. Here every other deferred file is given a `closes-when` first,
  // and META grades the widening on THIS probe with its failure lines confined to q8001.md.
  { name: 'R9 CONTROL — DEFERRED with an empty closes-when, ISOLATED: every other deferred question given one first',
    git: false, trips: [], notRun: NR,
    writesRegister: 'gives each deferred question a closes-when, which R9 does not read for deferred',
    stage: (t) => { fillDeferred(t); noClose(t, OPEN); edit(t, OPEN, 'status: open\n', 'status: deferred\n'); } },

  // --- R4: HEAD against the tree, in a real repository --------------------------------
  { name: 'a question DELETED while another is raised — the count holds and only R4 sees it',
    git: true, trips: ['R4'], notRun: [], says: 'q8002.md is at HEAD and not in the tree',
    stage: (t) => { rmSync(Q(t, BARE)); raise(t, 9001); } },
  // R4-n3: comparing the INDEX (`git ls-files`) instead of HEAD passed a STAGED removal.
  { name: 'a question removed with `git rm` — staged, not committed — while another is raised',
    git: true, trips: ['R4'], notRun: [], says: 'q8002.md is at HEAD and not in the tree',
    stage: (t) => { const g = git(t, ['rm', '-q', '--', `doc/questions/q${BARE}.md`]);
      if (g.error || g.status !== 0) throw new Error(`git rm failed: ${(g.stderr ?? '').trim()}`);
      raise(t, 9001); } },
  { name: 'questions deleted below the floor with nothing raised — R4 and R5 both',
    git: true, trips: ['R4', 'R5'], notRun: [], stage: (t) => dropBelowFloor(t) },
  { name: 'the same deletion and raise in a copy that is NOT a repository — R4 says NOT RUN, nothing passes for it',
    git: false, trips: [], notRun: NR,
    stage: (t) => { rmSync(Q(t, BARE)); raise(t, 9001); } },
  { name: 'a repository with no commit — no HEAD, so R4 says NOT RUN',
    git: 'init-only', trips: [], notRun: NR, stage: (t) => raise(t, 9001) },
  { name: 'a copy NESTED inside another repository that does not track it — R4 says NOT RUN',
    git: 'nested', trips: [], notRun: NR,
    stage: (t) => { rmSync(Q(t, BARE)); raise(t, 9001); } },

  // --- R5: the floor -------------------------------------------------------------------
  { name: 'the folder taken one below the floor, in a copy that is not a repository — the floor alone',
    git: false, trips: ['R5'], notRun: NR, says: 'and the floor is',
    stage: (t) => dropBelowFloor(t) },
  // R2-R4 have nothing to read and say so: NOT RUN, never `ok` over an absent folder — and since
  // W117 R7 and R8, which check an ADR's Q ids against this folder, and since W127 R9.
  { name: 'the folder missing entirely — R1 and R5 fail, R2 to R4 say NOT RUN',
    git: false, trips: ['R1', 'R5'], notRun: ['R2', 'R3', 'R4', 'R7', 'R8', 'R9'],
    stage: (t) => rmSync(join(t, 'doc', 'questions'), { recursive: true, force: true }) },
  { name: 'a question added — the floor only moves up, so more is clean',
    git: false, trips: [], notRun: NR, stage: (t) => raise(t, 9001) },

  // --- R6: the ADR names, fields, vocabulary, date and H1 — W117 ----------------------------------
  r6('a stray file in doc/decisions that is not NNNN-<slug>.md', 'notes.md is not `NNNN-<slug>.md`',
    (t) => writeFileSync(join(t, 'doc', 'decisions', 'notes.md'), '# notes\n')),
  // Each name near-miss is a RENUMBERED copy, valid in its id and H1, so only the name refuses it.
  r6('an ADR name of THREE digits — 079-short-number.md', '079-short-number.md is not',
    (t) => adrClone(t, '079-short-number.md', '079')),
  r6('an ADR name of FIVE digits — 00079-long-number.md', '00079-long-number.md is not',
    (t) => adrClone(t, '00079-long-number.md', '00079')),
  r6('an ADR name with NO slug — 0099.md', '0099.md is not', (t) => adrClone(t, '0099.md', '0099')),
  r6('an ADR name with an UPPER-CASE slug — 0098-Upper-Case.md', '0098-Upper-Case.md is not',
    (t) => adrClone(t, '0098-Upper-Case.md', '0098')),
  r6('an ADR name with an UNDERSCORE — 0097_underscore.md', '0097_underscore.md is not',
    (t) => adrClone(t, '0097_underscore.md', '0097')),
  r6('an ADR slug ending in a hyphen — 0096-trailing-.md', '0096-trailing-.md is not',
    (t) => adrClone(t, '0096-trailing-.md', '0096')),
  r6('a DIRECTORY named like an ADR — 0095-a-directory.md', '0095-a-directory.md is not',
    (t) => { mkdirSync(join(t, 'doc', 'decisions', '0095-a-directory.md'));
      writeFileSync(join(t, 'doc', 'decisions', '0095-a-directory.md', 'inside.txt'), 'a directory\n'); }),
  r6('two ADR files sharing the number 0079', 'share the number 0079',
    (t) => writeFileSync(join(t, 'doc', 'decisions', '0079-a-second-decision.md'), readFileSync(A(t, '0079'), 'utf8'))),
  ...ADR_ID_NEAR_MISSES.map(([written, read]) => r6(`an ADR id NEAR-MISS — \`id: ${written}\` in 0079-*.md`,
    `declares \`id: ${read}\` and its name says ADR 0079`, (t) => adrSet(t, '0079', 'id', written))),
  ...ADR_FIELDS.map((f) => r6(`an ADR field missing — \`${f}\` deleted from ADR 0079`, `has no \`${f}\``,
    (t) => adrDrop(t, '0079', f))),
  r6('an ADR field P28 decision 2 does not declare — `plan`', 'declares `plan`',
    (t) => adrAppend(t, '0079', 'plan: P28\n')),
  r6('a DERIVED field declared by hand — `superseded-by`', 'declares `superseded-by`',
    (t) => adrAppend(t, '0079', 'superseded-by: ""\n')),
  r6('an empty ADR id', '`id` is empty', (t) => adrSet(t, '0079', 'id', '""')),
  r6('an empty ADR title', '`title` is empty', (t) => adrSet(t, '0079', 'title', '""')),
  r6('an empty ADR status', '`status` is empty', (t) => adrSet(t, '0079', 'status', '""')),
  r6('an empty ADR date', '`date` is empty', (t) => adrSet(t, '0079', 'date', '""')),
  r6('an ADR date of one SPACE', '`date` is empty', (t) => adrSet(t, '0079', 'date', '" "')),
  ...ADR_STATUS_NEAR_MISSES.map((w) => r6(`an ADR status NEAR-MISS — \`${w}\``, `status is "${w}"`,
    (t) => adrSet(t, '0079', 'status', w))),
  r6('an ADR status with a trailing space INSIDE its quotes — "accepted "', 'status is "accepted "',
    (t) => adrSet(t, '0079', 'status', '"accepted "')),
  r6('an ADR status that states its own supersession — "superseded by ADR 0080"', 'status is "superseded by ADR 0080"',
    (t) => adrSet(t, '0079', 'status', '"superseded by ADR 0080"')),
  clean('an ADR status of `proposed` is accepted — the second word is in the vocabulary',
    (t) => adrSet(t, '0079', 'status', 'proposed')),
  ...DATE_NEAR_MISSES.map((d) => r6(`an ADR date NEAR-MISS — ${JSON.stringify(d)}`, `date "${d}" is not a real`,
    (t) => adrSet(t, '0079', 'date', JSON.stringify(d)))),
  r6('an H1 whose title differs from the front matter by one word', 'is not "# ADR 0079',
    (t) => adrEdit(t, '0079', '\n# ADR 0079 — A register is a folder', '\n# ADR 0079 — A register is a FOLDER')),
  r6('a front-matter title that differs from the H1 by one word', 'is not "# ADR 0079',
    (t) => adrSet(t, '0079', 'title', '"A register is a FOLDER of files with front matter, and its index is derived"')),
  r6('an H1 carrying another ADR`s number', 'is not "# ADR 0079',
    (t) => adrEdit(t, '0079', '\n# ADR 0079 — ', '\n# ADR 0080 — ')),
  r6('an H1 with a HYPHEN for its dash', 'is not "# ADR 0079',
    (t) => adrEdit(t, '0079', '\n# ADR 0079 — ', '\n# ADR 0079 - ')),
  r6('an H1 at level TWO', 'is not "# ADR 0079',
    (t) => adrEdit(t, '0079', '\n# ADR 0079 — ', '\n## ADR 0079 — ')),
  r6('an H1 with words AFTER its title', 'is not "# ADR 0079',
    (t) => adrEdit(t, '0079', 'its index is derived\n\n', 'its index is derived, and more\n\n')),
  r6('an H1 with a TRAILING space', 'is not "# ADR 0079',
    (t) => adrEdit(t, '0079', 'its index is derived\n\n', 'its index is derived \n\n')),
  r6('an H1 with NO blank line under the front matter', 'is not "# ADR 0079',
    (t) => adrEdit(t, '0079', '---\n\n# ADR 0079', '---\n# ADR 0079')),
  r6('an H1 with TWO blank lines under the front matter', 'is not "# ADR 0079',
    (t) => adrEdit(t, '0079', '---\n\n# ADR 0079', '---\n\n\n# ADR 0079')),
  // the reader's own guards, each provoked on an ADR
  r6('an ADR field declared TWICE — two `status` lines', 'declares `status` twice',
    (t) => adrEdit(t, '0079', '\nstatus: accepted\n', '\nstatus: accepted\nstatus: accepted\n')),
  r6('an ADR with a BOM and LF line ends', 'does not open with a `---` line',
    (t) => writeFileSync(A(t, '0079'), `﻿${readFileSync(A(t, '0079'), 'utf8')}`)),
  r6('an ADR with CRLF line ends and no BOM', 'does not open with a `---` line',
    (t) => writeFileSync(A(t, '0079'), readFileSync(A(t, '0079'), 'utf8').replace(/\n/g, '\r\n'))),
  r6('an ADR whose front matter never closes', 'has no closing `---` line',
    (t) => adrUnclose(t, '0079')),
  r6('an ADR whose front matter never closes ABOVE a thematic break — the break is not a close',
    'carries a line that is not `key: value`', (t) => adrUnclose(t, '0062')),
  r6('an UNQUOTED date, which YAML 1.1 types as a timestamp', 'is a YAML null, boolean, number or timestamp',
    (t) => adrSet(t, '0079', 'date', '2026-10-04')),
  r6('an unquoted ADR status with a TRAILING space', 'leading or trailing space',
    (t) => adrSet(t, '0079', 'status', 'accepted ')),
  { name: 'every ADR deleted, README and TEMPLATE kept — R6 says so, R3 loses what it named',
    git: false, trips: ['R3', 'R6'], notRun: NR, says: 'holds no `NNNN-<slug>.md` file',
    stage: (t) => { for (const f of readdirSync(join(t, 'doc', 'decisions'))) if (/^\d{4}-/.test(f)) rmSync(join(t, 'doc', 'decisions', f)); } },
  { name: 'doc/decisions missing entirely — R6 fails, R7 and R8 say NOT RUN',
    git: false, trips: ['R3', 'R6'], notRun: ['R4', 'R7', 'R8'], says: 'is not a readable directory, so there are no ADRs',
    stage: (t) => rmSync(join(t, 'doc', 'decisions'), { recursive: true, force: true }) },

  // --- R7: every id an ADR names is in its form and exists ----------------------------------------
  ...RULED_NEAR_MISSES.map((v) => r7(`a supersedes NEAR-MISS — ${JSON.stringify(v)}`, `supersedes entry "${v}"`,
    (t) => adrSet(t, '0079', 'supersedes', JSON.stringify(v)))),
  r7('an amends NEAR-MISS — "ADR 78"', 'amends entry "ADR 78"', (t) => adrSet(t, '0079', 'amends', '"ADR 78"')),
  ...ID_NEAR_MISSES.map(([v, entry]) => r7(`a raised-by NEAR-MISS — ${JSON.stringify(v)}`, `raised-by entry "${entry}"`,
    (t) => adrSet(t, '0079', 'raised-by', JSON.stringify(v)))),
  r7('an item naming a PLAN — `W116, P28`', 'item entry "P28"', (t) => adrSet(t, '0079', 'item', '"W116, P28"')),
  r7('an item in lower case — `w116`', 'item entry "w116"', (t) => adrSet(t, '0079', 'item', 'w116')),
  r7('a resolves naming a PLAN — `P28`', 'resolves entry "P28"', (t) => adrSet(t, '0079', 'resolves', 'P28')),
  // a cell with two ids where only the SECOND is missing, for EVERY id-bearing field and id kind
  r7('item with two ids, the SECOND missing — `W116, W9999`', 'item names W9999,',
    (t) => adrSet(t, '0079', 'item', '"W116, W9999"')),
  r7('raised-by with two ids, the SECOND a missing PLAN — `P28, P999`', 'raised-by names P999,',
    (t) => adrSet(t, '0079', 'raised-by', '"P28, P999"')),
  r7('raised-by with two ids, the SECOND a missing QUESTION — `P28, Q9999`', 'raised-by names Q9999,',
    (t) => adrSet(t, '0079', 'raised-by', '"P28, Q9999"')),
  r7('raised-by with two ids, the SECOND a missing ITEM — `P28, W9999`', 'raised-by names W9999,',
    (t) => adrSet(t, '0079', 'raised-by', '"P28, W9999"')),
  r7('raised-by with two ids, the SECOND a missing UPSTREAM want — `P28, S99`', 'raised-by names S99,',
    (t) => adrSet(t, '0079', 'raised-by', '"P28, S99"')),
  r7('raised-by with two ids, the SECOND a missing ADR — `P28, ADR 9999`', 'raised-by names ADR 9999,',
    (t) => adrSet(t, '0079', 'raised-by', '"P28, ADR 9999"')),
  r7('resolves with two ids, the SECOND missing — `Q8004, Q9999` on ADR 8803', 'resolves names Q9999,',
    (t) => adrSet(t, '8803', 'resolves', `"Q${RES_ADR}, Q9999"`)),
  r7('supersedes with two entries, the SECOND missing — `ADR 0078; ADR 0005`', 'supersedes names ADR 0005,',
    (t) => adrSet(t, '0079', 'supersedes', '"ADR 0078; ADR 0005"')),
  r7('amends with two entries, the SECOND missing — `ADR 0078; ADR 0006`', 'amends names ADR 0006,',
    (t) => adrSet(t, '0079', 'amends', '"ADR 0078; ADR 0006"')),
  r7('supersedes naming ITSELF', 'supersedes names ADR 0079, which is itself',
    (t) => adrSet(t, '0079', 'supersedes', 'ADR 0079')),
  r7('amends naming ITSELF', 'amends names ADR 0079, which is itself',
    (t) => adrSet(t, '0079', 'amends', 'ADR 0079')),
  clean('raised-by naming one id of EVERY kind, each present — `P28, Q8001, W116, S10, ADR 0078` is clean',
    (t) => adrSet(t, '0079', 'raised-by', `"P28, Q${OPEN}, W116, S10, ADR 0078"`)),
  clean('supersedes with EVERY qualifier form — `ADR 0078 rules 1, 2 and 6; ADR 0076 decision 3 in part` is clean',
    (t) => adrSet(t, '0079', 'supersedes', '"ADR 0078 rules 1, 2 and 6; ADR 0076 decision 3 in part"')),

  // --- R8: resolves and resolved-by, each direction broken ALONE --------------------------------
  // Synthetic since W127: Q8003 resolved by prose, Q8004 resolved by ADR 8803 which resolves it back,
  // Q80031 whose id Q8003 is a prefix of, and ADRs 8801 and 8802 resolving nothing. Only the
  // exception's probes still name a register file, and only by the id `NOT_A_RESOLUTION` holds.
  r8('FORWARD alone — ADR 8802 resolves Q8003, whose resolved-by names no ADR',
    "resolves Q8003, and doc/questions/q8003.md's resolved-by does not name ADR 8802",
    (t) => adrSet(t, '8802', 'resolves', `Q${RES}`)),
  r8('FORWARD alone — ADR 8802 resolves an OPEN question, Q8001', 'resolves Q8001, and',
    (t) => adrSet(t, '8802', 'resolves', `Q${OPEN}`)),
  r8('FORWARD, the SECOND id — ADR 8803 resolves `Q8004, Q8003`', 'resolves Q8003, and',
    (t) => adrSet(t, '8803', 'resolves', `"Q${RES_ADR}, Q${RES}"`)),
  r8('FORWARD broken from the QUESTION side — Q8004`s resolved-by stops naming ADR 8803', 'resolves Q8004, and',
    (t) => edit(t, RES_ADR, Q4_BY, 'Live tokens, decided')),
  r8('REVERSE alone — Q8003`s resolved-by names ADR 8801, which does not list it',
    "q8003.md's resolved-by names ADR 8801, and", (t) => edit(t, RES, Q1_BY, 'resolved-by: "The driver, outside the scheduler - ADR 8801"\n')),
  r8('REVERSE broken from the ADR side — ADR 8803`s resolves emptied', "q8004.md's resolved-by names ADR 8803, and",
    (t) => adrSet(t, '8803', 'resolves', '""')),
  r8('REVERSE, the SECOND ADR of a list — `ADRs 8803 and 8801`, only 8803 listing Q8003',
    "q8003.md's resolved-by names ADR 8801, and",
    (t) => { edit(t, RES, Q1_BY, 'resolved-by: "ADRs 8803 and 8801"\n'); adrSet(t, '8803', 'resolves', `"Q${RES_ADR}, Q${RES}"`); }),
  r8('REVERSE in the HYPHENATED form — `ADR-8801`', "q8003.md's resolved-by names ADR 8801, and",
    (t) => edit(t, RES, Q1_BY, 'resolved-by: "ADR-8801"\n')),
  r8('REVERSE where Q8003 is a PREFIX of a listed Q80031 — a substring is not a listing', "q8003.md's resolved-by names ADR 8803, and",
    (t) => { adrSet(t, '8803', 'resolves', `"Q${RES_ADR}, Q${RES_PREFIXED}"`);
      edit(t, RES_PREFIXED, 'resolved-by: "Two features over ONE region"\n', 'resolved-by: "Two features over ONE region - ADR 8803"\n');
      edit(t, RES, Q1_BY, 'resolved-by: "The driver, outside the scheduler - ADR 8803"\n'); }),
  clean('a pairing stated on BOTH sides — Q8003 names ADR 8801 and ADR 8801 resolves Q8003 — is clean',
    (t) => { edit(t, RES, Q1_BY, 'resolved-by: "The driver, outside the scheduler - ADR 8801"\n'); adrSet(t, '8801', 'resolves', `Q${RES}`); }),
  r8('the exception is BY PAIR — another question naming ADR 0077 is still compared',
    "q8003.md's resolved-by names ADR 0077, and",
    (t) => edit(t, RES, Q1_BY, 'resolved-by: "The driver, outside the scheduler - ADR 0077"\n')),
  r8('the exception is BY PAIR — Q466 naming ANOTHER ADR is still compared', "q466.md's resolved-by names ADR 8801, and",
    (t) => edit(t, 466, 'left to a person', 'left to a person (see ADR 8801)')),
  r8('a STALE exception — Q466 no longer names ADR 0077', 'NOT_A_RESOLUTION excuses Q466',
    (t) => edit(t, 466, Q466_LINK, 'that item`s consequence 4')),
  r8('a CONTRADICTED exception — ADR 0077 resolves Q466', 'NOT_A_RESOLUTION declares',
    (t) => adrSet(t, '0077', 'resolves', 'Q466')),

  // --- W117's FIX ROUND: every reader finding, each a probe written for it -------------------
  // The adequacy reader's survivors, each the input that told its mutant from the real check.
  r6('an ADR slug carrying a DOT — 0094-a.b.md', '0094-a.b.md is not', (t) => adrClone(t, '0094-a.b.md', '0094')),
  r6('an ADR slug with a DOUBLED hyphen — 0093-a--b.md', '0093-a--b.md is not', (t) => adrClone(t, '0093-a--b.md', '0093')),
  r6('an ADR name with a suffix AFTER .md — 0092-x.md.bak', '0092-x.md.bak is not', (t) => adrClone(t, '0092-x.md.bak', '0092')),
  r6('a QUESTION register field on an ADR — `note`', 'declares `note`',
    (t) => adrAppend(t, '0079', 'note: ""\n')),
  r6('an ADR date NEAR-MISS — "2026-02-29", in a year with no leap day', 'date "2026-02-29" is not a real',
    (t) => adrSet(t, '0079', 'date', '"2026-02-29"')),
  r7('a raised-by of one SPACE — an entry outside its form, never skipped as empty', 'raised-by entry " "',
    (t) => adrSet(t, '0079', 'raised-by', '" "')),
  r7('a supersedes NEAR-MISS — "ADR 0078 rules 1 or 2"', 'supersedes entry "ADR 0078 rules 1 or 2"',
    (t) => adrSet(t, '0079', 'supersedes', '"ADR 0078 rules 1 or 2"')),
  r8('a STALE exception whose question keeps the number in OTHER words — "commit 0077"', 'NOT_A_RESOLUTION excuses Q466',
    (t) => edit(t, 466, Q466_LINK, 'that item`s consequence 4 (commit 0077)')),
  r8('FORWARD broken by a number that is NOT an ADR reference — "commit 8803"', 'resolves Q8004, and',
    (t) => edit(t, RES_ADR, Q4_BY, 'Live tokens - commit 8803, decided')),
  // ... and every clause of a full YAML 1.1 timestamp, each refused plain (the survivors' nine).
  ...TIMESTAMPS.map((v) => r2(`a plain YAML 1.1 TIMESTAMP — \`shared: ${v}\``, `plain value "${v}" is a YAML`,
    (t) => setLine(t, OPEN, 'shared', v))),
  // The adequacy reader's CONSTRUCTED inputs, each a value YAML 1.1 types or cannot read as a string.
  ...YAML_NUMBERS.map((v) => r2(`a plain YAML 1.1 NUMBER — \`shared: ${v}\``, `plain value "${v}" is a YAML`,
    (t) => setLine(t, OPEN, 'shared', v))),
  r2('a plain value with a TAB-led comment — `a<TAB>#b`', 'carries a tab-led comment', (t) => setLine(t, OPEN, 'shared', 'a\t#b')),
  r2('a plain value ENDING in a mapping colon — `W1:`', 'ends in a mapping colon', (t) => setLine(t, OPEN, 'shared', 'W1:')),
  r2('a plain value opening with the complex-key indicator — `? x`', 'opens with the `?` complex-key indicator',
    (t) => setLine(t, OPEN, 'shared', '? x')),
  r2('a plain value that is the complex-key indicator ALONE — `?`', 'opens with the `?` complex-key indicator',
    (t) => setLine(t, OPEN, 'shared', '?')),
  // The other side of each: what YAML 1.1 reads as a STRING is accepted, so no guard over-refuses.
  clean('a plain date with ONE-digit month and day — `2026-1-4` — is a string to YAML 1.1, and accepted',
    (t) => setLine(t, OPEN, 'shared', '2026-1-4')),
  clean('a plain value with a colon INSIDE it and no space — `W1:2a` — is accepted',
    (t) => setLine(t, OPEN, 'shared', 'W1:2a')),
  clean('a plain value opening with `?` and no space — `?x` — is accepted', (t) => setLine(t, OPEN, 'shared', '?x')),
  clean('an ADR dated in the year 0026 is a real day — `Date.UTC` read it as 1926', (t) => adrSet(t, '0079', 'date', '"0026-10-04"')),
  // R7's new clauses, from both readers' constructions.
  r7('an OLDER ADR superseding a newer one — 0078 supersedes ADR 0079', 'which is NEWER',
    (t) => adrSet(t, '0078', 'supersedes', 'ADR 0079')),
  r7('a CYCLE — 0078 supersedes 0079 and 0079 supersedes 0078', 'which is NEWER',
    (t) => { adrSet(t, '0078', 'supersedes', 'ADR 0079'); adrSet(t, '0079', 'supersedes', 'ADR 0078'); }),
  r7('an OLDER ADR amending a newer one — 0078 amends ADR 0079', 'which is NEWER',
    (t) => adrSet(t, '0078', 'amends', 'ADR 0079')),
  r7('raised-by naming its OWN ADR — `P28, ADR 0079`', 'raised-by names ADR 0079, which is itself',
    (t) => adrSet(t, '0079', 'raised-by', '"P28, ADR 0079"')),
  r7('resolves naming one question TWICE — `Q8004, Q8004` on ADR 8803', 'resolves names Q8004 twice',
    (t) => adrSet(t, '8803', 'resolves', `"Q${RES_ADR}, Q${RES_ADR}"`)),
  r7('raised-by naming one id TWICE — `P28, P28`', 'raised-by names P28 twice',
    (t) => adrSet(t, '0079', 'raised-by', '"P28, P28"')),
  r7('supersedes naming one ADR TWICE, qualified differently — `ADR 0078; ADR 0078 rule 1`', 'supersedes names ADR 0078 twice',
    (t) => adrSet(t, '0079', 'supersedes', '"ADR 0078; ADR 0078 rule 1"')),
  r7('an item of TWO work items — `W116, W117`', 'item names 2 entries', (t) => adrSet(t, '0079', 'item', '"W116, W117"')),
  // R8 reads an ADR however a resolved-by names it: either case, or only a link into decisions/.
  r8('REVERSE in LOWER case — `adr 8801`', "q8003.md's resolved-by names ADR 8801, and",
    (t) => edit(t, RES, Q1_BY, 'resolved-by: "The driver, outside the scheduler - adr 8801"\n')),
  r8('REVERSE by a LINK alone — `[the decision](decisions/8801-x.md)`', "q8003.md's resolved-by names ADR 8801, and",
    (t) => edit(t, RES, Q1_BY, 'resolved-by: "The driver, outside the scheduler - [the decision](decisions/8801-x.md)"\n')),
  clean('the exception still matches when Q466 names ADR 0077 by its LINK alone',
    (t) => edit(t, 466, '[ADR 0077](decisions/0077-', '[that ADR](decisions/0077-')),
];

// ==============================================================================
// GRADER CONTROLS — v0.24: the grader is graded on its clause's own failure line
// ==============================================================================
const GRADER_CONTROLS = [
  { name: 'GRADER CONTROL — the check made to THROW: non-zero exit, zero named failures',
    expect: 'crash', git: false, trips: ['R2'], notRun: NR,
    stage: (t) => edit(t, OPEN, 'status: open\n', 'status: closed\n'),
    declare: (s) => s.replace('const failures = [];', 'const failures = [];\nthrow new Error("grader control");') },
  { name: 'GRADER CONTROL — trips R2 as declared, with a reason the check never prints',
    expect: 'wrong-reason', git: false, trips: ['R2'], notRun: NR, says: 'status is "a word nobody wrote"',
    stage: (t) => edit(t, OPEN, 'status: open\n', 'status: closed\n') },
  { name: 'GRADER CONTROL — declares R1 and trips R2: against-declaration',
    expect: 'against-declaration', git: false, trips: ['R1'], notRun: NR,
    stage: (t) => edit(t, OPEN, 'status: open\n', 'status: closed\n') },
  { name: 'GRADER CONTROL — the banner removed: the check runs and cannot be seen to',
    expect: 'did-not-run', git: false, trips: ['R2'], notRun: NR,
    stage: (t) => edit(t, OPEN, 'status: open\n', 'status: closed\n'),
    declare: (s) => s.replace('console.log(`register check — ', 'console.log(`BANNER REMOVED — ') },
];

// ==============================================================================
// META — break the CHECK: [what is disabled, the probe that must stop grading as declared, mutate]
// ==============================================================================
const META = [
  ['R1`s name clause disabled', 'a stray file in the folder that is not q<N>.md',
    (s) => s.replace("    if (!m || !statSync(join(dirAbs, n)).isFile()) {\n      fail('R1'",
      "    if (!m || !statSync(join(dirAbs, n)).isFile()) {\n      continue;\n      fail('R1'")],
  ['R1`s name pattern loosened to accept a padded id', 'a PADDED name, q08001.md, declaring the id its digits spell',
    (s) => s.replace('const NAME = /^q([1-9][0-9]*)\\.md$/;', 'const NAME = /^q([0-9]+)\\.md$/;')],
  // --- W116's adequacy reader's survivors, each against the probe written for it ---------------
  ['R1-n1 — the name pattern made CASE-INSENSITIVE', 'an UPPER-CASE name, Q9001.md, declaring its own id',
    (s) => s.replace('const NAME = /^q([1-9][0-9]*)\\.md$/;', 'const NAME = /^q([1-9][0-9]*)\\.md$/i;')],
  ['R1`s id-equals-name comparison disabled', 'a file whose id disagrees with its name — a second Q8002 inside q8001.md',
    (s) => s.replace('    if (got.fields.id !== `Q${m[1]}`) {', '    if (false) {')],
  ['R1-n2 — the id compared NUMERICALLY', 'a padded ID inside its own file — `id: Q08001` in q8001.md',
    (s) => s.replace('    if (got.fields.id !== `Q${m[1]}`) {',
      '    if (Number(String(got.fields.id).slice(1)) !== Number(m[1])) {')],
  ['R1-n3 — the id compared after UPPER-CASING', 'a lower-case ID inside its own file — `id: q8001` in q8001.md',
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
  ['R3-n1 — only the FIRST ADR reference of a cell read', 'resolved-by naming two ADRs, the SECOND missing — `ADR 8801 and ADR 9999`',
    (s) => s.replace('    for (const m of by.matchAll(ADR_REF)) {', '    for (const m of [...by.matchAll(ADR_REF)].slice(0, 1)) {')],
  ['C10 — only the first id of a LIST read', 'resolved-by in the LIST form, the second missing — `ADRs 8801 and 9999`',
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

  // --- R6, W117: each clause disabled, and each written to be NARROWED the way W116's were ------
  ['R6`s name clause disabled', 'a stray file in doc/decisions that is not NNNN-<slug>.md',
    (s) => s.replace("    if (!m || !statSync(abs).isFile()) {\n      fail('R6'", "    if (!m || !statSync(abs).isFile()) {\n      continue;\n      fail('R6'")],
  ['R6 — the name pattern takes three to five digits', 'an ADR name of THREE digits — 079-short-number.md',
    (s) => s.replace('const ADR_NAME = /^(\\d{4})-', 'const ADR_NAME = /^(\\d{3,5})-')],
  ['R6 — the name pattern made CASE-INSENSITIVE', 'an ADR name with an UPPER-CASE slug — 0098-Upper-Case.md',
    (s) => s.replace('(?:-[a-z0-9]+)*\\.md$/;', '(?:-[a-z0-9]+)*\\.md$/i;')],
  ['R6 — the slug made OPTIONAL', 'an ADR name with NO slug — 0099.md',
    (s) => s.replace('const ADR_NAME = /^(\\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*\\.md$/;',
      'const ADR_NAME = /^(\\d{4})(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?\\.md$/;')],
  ['R6 — the separator widened to an underscore', 'an ADR name with an UNDERSCORE — 0097_underscore.md',
    (s) => s.replace('const ADR_NAME = /^(\\d{4})-[a-z0-9]+', 'const ADR_NAME = /^(\\d{4})[-_][a-z0-9]+')],
  ['R6 — a slug may end in a hyphen', 'an ADR slug ending in a hyphen — 0096-trailing-.md',
    (s) => s.replace('(?:-[a-z0-9]+)*\\.md$/;', '(?:-[a-z0-9]*)*\\.md$/;')],
  ['R6`s is-a-file guard removed — a directory is read', 'a DIRECTORY named like an ADR — 0095-a-directory.md',
    (s) => s.replace("    if (!m || !statSync(abs).isFile()) {\n      fail('R6'", "    if (!m) {\n      fail('R6'")],
  ['R6`s duplicate-number clause disabled', 'two ADR files sharing the number 0079',
    (s) => s.replace('    if (byNumber.has(m[1])) {', '    if (false) {')],
  ['R6`s id clause disabled', 'an ADR id NEAR-MISS — `id: ADR 0080` in 0079-*.md',
    (s) => s.replace('    if (fields.id !== `ADR ${m[1]}`) {', '    if (false) {')],
  ['R6 — the id compared NUMERICALLY', 'an ADR id NEAR-MISS — `id: ADR 79` in 0079-*.md',
    (s) => s.replace('    if (fields.id !== `ADR ${m[1]}`) {', "    if (Number(String(fields.id).replace(/\\D/g, '')) !== Number(m[1])) {")],
  ['R6 — the id compared after UPPER-CASING', 'an ADR id NEAR-MISS — `id: adr 0079` in 0079-*.md',
    (s) => s.replace('    if (fields.id !== `ADR ${m[1]}`) {', '    if (String(fields.id).toUpperCase() !== `ADR ${m[1]}`) {')],
  ['R6 — the id compared after collapsing spaces and hyphens', 'an ADR id NEAR-MISS — `id: ADR-0079` in 0079-*.md',
    (s) => s.replace('    if (fields.id !== `ADR ${m[1]}`) {', "    if (String(fields.id).replace(/[\\s-]+/g, ' ') !== `ADR ${m[1]}`) {")],
  ['R6 — the id compared by its DIGITS alone', 'an ADR id NEAR-MISS — `id: "0079"` in 0079-*.md',
    (s) => s.replace('    if (fields.id !== `ADR ${m[1]}`) {', '    if (!String(fields.id).endsWith(m[1])) {')],
  ['R6`s missing-field clause disabled', 'an ADR field missing — `resolves` deleted from ADR 0079',
    (s) => s.replace("    if (absent.length) fail('R6'", "    if (false) fail('R6'")],
  ['R6 — the missing-field test skips `resolves`', 'an ADR field missing — `resolves` deleted from ADR 0079',
    (s) => s.replace('const absent = ADR_FIELDS.filter((f) => !order.includes(f));',
      "const absent = ADR_FIELDS.filter((f) => f !== 'resolves' && !order.includes(f));")],
  ['R6 — the missing-field test skips `date`', 'an ADR field missing — `date` deleted from ADR 0079',
    (s) => s.replace('const absent = ADR_FIELDS.filter((f) => !order.includes(f));',
      "const absent = ADR_FIELDS.filter((f) => f !== 'date' && !order.includes(f));")],
  ['R6`s undeclared-field clause disabled', 'a DERIVED field declared by hand — `superseded-by`',
    (s) => s.replace("    if (extra.length) fail('R6'", "    if (false) fail('R6'")],
  ['R6`s non-empty clause disabled', 'an empty ADR date',
    (s) => s.replace("      if (order.includes(f) && fields[f].trim() === '') fail('R6'", "      if (false) fail('R6'")],
  ['R6 — the non-empty test without its trim', 'an ADR date of one SPACE',
    (s) => s.replace("      if (order.includes(f) && fields[f].trim() === '') fail('R6'", "      if (order.includes(f) && fields[f] === '') fail('R6'")],
  ['R6`s vocabulary clause disabled', 'an ADR status NEAR-MISS — `superseded`',
    (s) => s.replace("    if (order.includes('status') && !ADR_STATUSES.includes(fields.status)) {", '    if (false) {')],
  ['R6 — the vocabulary matched by PREFIX', 'an ADR status NEAR-MISS — `acceptedd`',
    (s) => s.replace("    if (order.includes('status') && !ADR_STATUSES.includes(fields.status)) {",
      "    if (order.includes('status') && !ADR_STATUSES.some((w) => fields.status.startsWith(w))) {")],
  ['R6 — the vocabulary matched as a SUBSTRING', 'an ADR status NEAR-MISS — `accept`',
    (s) => s.replace("    if (order.includes('status') && !ADR_STATUSES.includes(fields.status)) {",
      "    if (order.includes('status') && !ADR_STATUSES.some((w) => w.includes(fields.status))) {")],
  ['R6 — the vocabulary matched CASE-INSENSITIVELY', 'an ADR status NEAR-MISS — `Accepted`',
    (s) => s.replace("    if (order.includes('status') && !ADR_STATUSES.includes(fields.status)) {",
      "    if (order.includes('status') && !ADR_STATUSES.includes(fields.status.toLowerCase())) {")],
  ['R6 — the vocabulary matched after a TRIM', 'an ADR status with a trailing space INSIDE its quotes — "accepted "',
    (s) => s.replace("    if (order.includes('status') && !ADR_STATUSES.includes(fields.status)) {",
      "    if (order.includes('status') && !ADR_STATUSES.includes(fields.status.trim())) {")],
  ['R6 — the question register`s four words admitted', 'an ADR status NEAR-MISS — `resolved`',
    (s) => s.replace("    if (order.includes('status') && !ADR_STATUSES.includes(fields.status)) {",
      "    if (order.includes('status') && !ADR_STATUSES.includes(fields.status) && !STATUSES.includes(fields.status)) {")],
  ['R6 — `proposed` removed from the vocabulary', 'an ADR status of `proposed` is accepted — the second word is in the vocabulary',
    (s) => s.replace("const ADR_STATUSES = Object.freeze(['proposed', 'accepted']);", "const ADR_STATUSES = Object.freeze(['accepted']);")],
  ['R6`s date clause disabled', 'an ADR date NEAR-MISS — "2026-10-4"',
    (s) => s.replace("      if (!real) fail('R6'", "      if (false) fail('R6'")],
  ['R6 — the date read by its SHAPE alone, no calendar', 'an ADR date NEAR-MISS — "2026-02-30"',
    (s) => s.replace("      const real = d !== null && day.toISOString().slice(0, 10) === fields.date;",
      '      const real = !!d;')],
  ['R6 — the date read by Date.parse, which takes any form', 'an ADR date NEAR-MISS — "2026/10/04"',
    (s) => s.replace("      const real = d !== null && day.toISOString().slice(0, 10) === fields.date;",
      '      const real = !Number.isNaN(Date.parse(fields.date));')],
  ['R6`s H1 clause disabled', 'an H1 whose title differs from the front matter by one word',
    (s) => s.replace('      if (!body.startsWith(`\\n${h1}\\n`)) {', '      if (false) {')],
  ['R6 — the H1 compared by its NUMBER alone', 'a front-matter title that differs from the H1 by one word',
    (s) => s.replace('      if (!body.startsWith(`\\n${h1}\\n`)) {', '      if (!body.startsWith(`\\n# ADR ${m[1]} — `)) {')],
  ['R6 — the H1 compared as a PREFIX', 'an H1 with words AFTER its title',
    (s) => s.replace('      if (!body.startsWith(`\\n${h1}\\n`)) {', '      if (!body.startsWith(`\\n${h1}`)) {')],
  ['R6 — the H1 found after ANY blank lines', 'an H1 with TWO blank lines under the front matter',
    (s) => s.replace('      if (!body.startsWith(`\\n${h1}\\n`)) {', '      if (!body.trimStart().startsWith(`${h1}\\n`)) {')],
  ['R6 — the H1 compared after trimming each line', 'an H1 with a TRAILING space',
    (s) => s.replace('      if (!body.startsWith(`\\n${h1}\\n`)) {',
      "      if (!body.split('\\n').map((l) => l.trimEnd()).join('\\n').startsWith(`\\n${h1}\\n`)) {")],
  ['R6 — the H1 read DASH-BLIND', 'an H1 with a HYPHEN for its dash',
    (s) => s.replace('      if (!body.startsWith(`\\n${h1}\\n`)) {', "      if (!body.replace(' - ', ' — ').startsWith(`\\n${h1}\\n`)) {")],
  ['R6 — the H1`s LEVEL not read', 'an H1 at level TWO',
    (s) => s.replace('      if (!body.startsWith(`\\n${h1}\\n`)) {', "      if (!body.replace(/^\\n#+ /, '\\n# ').startsWith(`\\n${h1}\\n`)) {")],
  ['R6`s unreadable-front-matter clause disabled', 'an ADR whose front matter never closes',
    (s) => s.replace("      fail('R6', `${where}'s front matter ${got.error}, so none of its fields is present`);", '')],
  ['R6 — the reader strips a BOM first', 'an ADR with a BOM and LF line ends',
    (s) => s.replace('export function readFrontMatter(text) {\n',
      "export function readFrontMatter(text) {\n  text = text.replace(/^\\uFEFF/, '');\n")],
  ['R6 — the reader normalises CRLF first', 'an ADR with CRLF line ends and no BOM',
    (s) => s.replace('export function readFrontMatter(text) {\n',
      "export function readFrontMatter(text) {\n  text = text.replace(/\\r\\n/g, '\\n');\n")],
  ['R6 — the duplicate-key refusal deleted, against an ADR', 'an ADR field declared TWICE — two `status` lines',
    (s) => s.replace("    if (key in fields) return { error: `declares \\`${key}\\` twice` };\n", '')],
  ['R6 — the YAML timestamp guard removed', 'an UNQUOTED date, which YAML 1.1 types as a timestamp',
    (s) => s.replace('|\\d{4}-\\d\\d-\\d\\d|', '|(?!)\\d{4}-\\d\\d-\\d\\d|')],
  ['R6`s empty-folder clause disabled', 'every ADR deleted, README and TEMPLATE kept — R6 says so, R3 loses what it named',
    (s) => s.replace("  if (adrCount === 0) fail('R6'", "  if (false) fail('R6'")],
  ['R6`s unreadable-folder clause disabled', 'doc/decisions missing entirely — R6 fails, R7 and R8 say NOT RUN',
    (s) => s.replace("  fail('R6', `${ADR_DIR} is not a readable directory", "  ('R6', `${ADR_DIR} is not a readable directory")],
  ['R7 run without the question folder', 'the folder missing entirely — R1 and R5 fail, R2 to R4 say NOT RUN',
    (s) => s.replace('if (adrNames && names) {\n  ran.R7 = true;', 'if (adrNames) {\n  ran.R7 = true;')],
  ['R8 run without the question folder', 'the folder missing entirely — R1 and R5 fail, R2 to R4 say NOT RUN',
    (s) => s.replace('if (adrNames && names) {\n  ran.R8 = true;', 'if (adrNames) {\n  ran.R8 = true;')],

  // --- R7, W117 -------------------------------------------------------------------------------
  ['R7`s bare-id form clause disabled', 'an item naming a PLAN — `W116, P28`',
    (s) => s.replace('        } else if (!ID_FORM[key].test(entry)) {', '        } else if (false) {')],
  ['R7 — `item` takes every id `raised-by` takes', 'an item naming a PLAN — `W116, P28`',
    (s) => s.replace('  item: /^W[1-9]\\d*$/,', '  item: /^(?:[QPWS][1-9]\\d*|ADR \\d{4})$/,')],
  ['R7 — `resolves` takes a plan or an item', 'a resolves naming a PLAN — `P28`',
    (s) => s.replace('  resolves: /^Q[1-9]\\d*$/,', '  resolves: /^[QPW][1-9]\\d*$/,')],
  ['R7 — a list split on a bare comma and trimmed', 'a raised-by NEAR-MISS — "P28,Q4"',
    (s) => s.replace("      const entries = fields[key].split(ruled ? '; ' : ', ');",
      "      const entries = fields[key].split(ruled ? ';' : ',').map((e) => e.trim());")],
  ['R7 — only the FIRST entry of a list read', 'raised-by with two ids, the SECOND a missing PLAN — `P28, P999`',
    (s) => s.replace('      for (const entry of entries) {', '      for (const entry of entries.slice(0, 1)) {')],
  ['R7 — a ruled list split on a semicolon with or without its space', 'a supersedes NEAR-MISS — "ADR 0078;ADR 0076"',
    (s) => s.replace("      const entries = fields[key].split(ruled ? '; ' : ', ');",
      "      const entries = fields[key].split(ruled ? /; ?/ : ', ');")],
  ['R7 — a ruled list split on a comma before another ADR', 'a supersedes NEAR-MISS — "ADR 0078, ADR 0076"',
    (s) => s.replace("      const entries = fields[key].split(ruled ? '; ' : ', ');",
      "      const entries = fields[key].split(ruled ? /; |, (?=ADR )/ : ', ');")],
  ['R7`s existence clause disabled', 'raised-by with two ids, the SECOND a missing QUESTION — `P28, Q9999`',
    (s) => s.replace("          if (why) fail('R7'", "          if (false) fail('R7'")],
  ['R7 — a QUESTION id never looked up', 'raised-by with two ids, the SECOND a missing QUESTION — `P28, Q9999`',
    (s) => s.replace("    case 'Q': return qNumbers.has(n) ? '' :", "    case 'Q': return true ? '' :")],
  ['R7 — a PLAN id never looked up', 'raised-by with two ids, the SECOND a missing PLAN — `P28, P999`',
    (s) => s.replace("    case 'P': return plans.has(n) ? '' :", "    case 'P': return true ? '' :")],
  ['R7 — an ITEM id never looked up', 'raised-by with two ids, the SECOND a missing ITEM — `P28, W9999`',
    (s) => s.replace("    case 'W': return items.has(n) ? '' :", "    case 'W': return true ? '' :")],
  ['R7 — an UPSTREAM id never looked up', 'raised-by with two ids, the SECOND a missing UPSTREAM want — `P28, S99`',
    (s) => s.replace("    case 'S': return upstream.has(n) ? '' :", "    case 'S': return true ? '' :")],
  ['R7 — an ADR id in a bare list never looked up', 'raised-by with two ids, the SECOND a missing ADR — `P28, ADR 9999`',
    (s) => s.replace("  if (id.startsWith('ADR ')) return adrs.has(id.slice(4)) ? '' :", "  if (id.startsWith('ADR ')) return true ? '' :")],
  ['R7 — any qualifier admitted after ADR NNNN', 'a supersedes NEAR-MISS — "ADR 0078 rule"',
    (s) => s.replace('(?: (?:rule|rules|decision|decisions) \\d+(?:(?:, \\d+)* and \\d+)?)?(?: in part)?$/;', '(?: .*)?$/;')],
  ['R7 — the ruled form takes a hyphen or no space', 'a supersedes NEAR-MISS — "ADR-0078"',
    (s) => s.replace('const RULED = /^ADR (\\d{4})', 'const RULED = /^ADR[ -]?(\\d{4})')],
  ['R7 — the ruled form made CASE-INSENSITIVE', 'a supersedes NEAR-MISS — "adr 0078"',
    (s) => s.replace('(?: in part)?$/;', '(?: in part)?$/i;')],
  ['R7 — the ruled form takes a bare number', 'a supersedes NEAR-MISS — "0078"',
    (s) => s.replace('const RULED = /^ADR (\\d{4})', 'const RULED = /^(?:ADR )?(\\d{4})')],
  ['R7 — the qualifier takes an Oxford comma', 'a supersedes NEAR-MISS — "ADR 0078 rules 1, 2, and 6"',
    (s) => s.replace('\\d+(?:(?:, \\d+)* and \\d+)?)?', '\\d+(?:(?:, \\d+)*,? and \\d+)?)?')],
  ['R7 — the qualifier takes any noun', 'a supersedes NEAR-MISS — "ADR 0078 section 2"',
    (s) => s.replace('(?:rule|rules|decision|decisions) \\d+', '[a-z]+ \\d+')],
  ['R7 — a LINK read through to its text', 'a supersedes NEAR-MISS — "[ADR 0078](0078-x.md)"',
    (s) => s.replace('          const r = RULED.exec(entry);',
      () => "          const r = RULED.exec(entry.replace(/\\[([^\\]]*)\\]\\([^)]*\\)/g, '$1'));")],
  ['R7`s self-reference clause disabled', 'supersedes naming ITSELF',
    (s) => s.replace('          } else if (r[1] === nnnn) {', '          } else if (false) {')],
  ['R7`s ruled existence clause disabled', 'supersedes with two entries, the SECOND missing — `ADR 0078; ADR 0005`',
    (s) => s.replace('          } else if (!adrs.has(r[1])) {', '          } else if (false) {')],
  // **Each FIELD dropped from R7's reading, one entry each** — rule 8 (a): every value it enumerates.
  ...['item', 'raised-by', 'resolves', 'supersedes', 'amends'].map((k) => [`R7 — \`${k}\` not read`,
    { item: 'item with two ids, the SECOND missing — `W116, W9999`',
      'raised-by': 'raised-by with two ids, the SECOND a missing ITEM — `P28, W9999`',
      resolves: 'resolves with two ids, the SECOND missing — `Q8004, Q9999` on ADR 8803',
      supersedes: 'supersedes with two entries, the SECOND missing — `ADR 0078; ADR 0005`',
      amends: 'amends with two entries, the SECOND missing — `ADR 0078; ADR 0006`' }[k],
    (s) => s.replace("    for (const key of ['item', 'raised-by', 'resolves', 'supersedes', 'amends']) {",
      `    for (const key of ${JSON.stringify(['item', 'raised-by', 'resolves', 'supersedes', 'amends'].filter((x) => x !== k)).replace(/"/g, "'")}) {`)]),

  // --- R8, W117 -------------------------------------------------------------------------------
  ['R8`s forward clause disabled', 'FORWARD alone — ADR 8802 resolves Q8003, whose resolved-by names no ADR',
    (s) => s.replace("      } else if (!adrRefs(qf.fields['resolved-by']).includes(nnnn)) {", '      } else if (false) {')],
  ['R8 — forward reads only the FIRST question', 'FORWARD, the SECOND id — ADR 8803 resolves `Q8004, Q8003`',
    (s) => s.replace("    for (const q of fields.resolves.split(', ')) {", "    for (const q of fields.resolves.split(', ').slice(0, 1)) {")],
  ['R8`s reverse clause disabled', 'REVERSE alone — Q8003`s resolved-by names ADR 8801, which does not list it',
    (s) => s.replace("      if (!a.fields.resolves.split(', ').includes(q)) {", '      if (false) {')],
  ['R8 — reverse skips an ADR whose resolves is EMPTY', 'REVERSE broken from the ADR side — ADR 8803`s resolves emptied',
    (s) => s.replace("      if (!a || !a.order.includes('resolves')) continue;",
      "      if (!a || !a.order.includes('resolves') || a.fields.resolves === '') continue;")],
  ['R8 — reverse reads only the FIRST ADR a resolved-by names', 'REVERSE, the SECOND ADR of a list — `ADRs 8803 and 8801`, only 8803 listing Q8003',
    (s) => s.replace("    for (const id of adrRefs(fields['resolved-by'])) {", "    for (const id of adrRefs(fields['resolved-by']).slice(0, 1)) {")],
  ['R8 — reverse compares by SUBSTRING', 'REVERSE where Q8003 is a PREFIX of a listed Q80031 — a substring is not a listing',
    (s) => s.replace("      if (!a.fields.resolves.split(', ').includes(q)) {", '      if (!a.fields.resolves.includes(q)) {')],
  ['R8 — the HYPHENATED form not read', 'REVERSE in the HYPHENATED form — `ADR-8801`',
    (s) => s.replace('const ADR_REF = /\\bADRs?[\\s-]+(', 'const ADR_REF = /\\bADRs?\\s+(')],
  ['R8 — the exception keyed by its ADR alone', 'the exception is BY PAIR — another question naming ADR 0077 is still compared',
    (s) => s.replace('NOT_A_RESOLUTION.some((x) => x.q === q && x.adr === adr);', 'NOT_A_RESOLUTION.some((x) => x.adr === adr);')],
  ['R8 — the exception keyed by its question alone', 'the exception is BY PAIR — Q466 naming ANOTHER ADR is still compared',
    (s) => s.replace('NOT_A_RESOLUTION.some((x) => x.q === q && x.adr === adr);', 'NOT_A_RESOLUTION.some((x) => x.q === q);')],
  ['R8`s stale-exception clause disabled', 'a STALE exception — Q466 no longer names ADR 0077',
    (s) => s.replace("    if (!qf || !adrRefs(qf.fields['resolved-by'] ?? '').includes(x.adr)) {", '    if (false) {')],
  ['R8`s contradicted-exception clause disabled', 'a CONTRADICTED exception — ADR 0077 resolves Q466',
    (s) => s.replace('      if (excused(q, nnnn)) {', '      if (false) {')],

  // --- W117's FIX ROUND: the adequacy reader's eighteen survivors, each its own edit ------------
  ['R6 — the slug admits a dot', 'an ADR slug carrying a DOT — 0094-a.b.md',
    (s) => s.replace('const ADR_NAME = /^(\\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*\\.md$/;', 'const ADR_NAME = /^(\\d{4})-[a-z0-9.]+(?:-[a-z0-9.]+)*\\.md$/;')],
  ['R6 — the slug admits a doubled hyphen', 'an ADR slug with a DOUBLED hyphen — 0093-a--b.md',
    (s) => s.replace('(?:-[a-z0-9]+)*\\.md$/;', '(?:-+[a-z0-9]+)*\\.md$/;')],
  ['R6 — the name pattern unanchored at the END', 'an ADR name with a suffix AFTER .md — 0092-x.md.bak',
    (s) => s.replace('(?:-[a-z0-9]+)*\\.md$/;', '(?:-[a-z0-9]+)*\\.md/;')],
  ['R6 — the undeclared-field test admits the QUESTION register`s fields', 'a QUESTION register field on an ADR — `note`',
    (s) => s.replace('const extra = order.filter((f) => !ADR_FIELDS.includes(f));', 'const extra = order.filter((f) => !ADR_FIELDS.includes(f) && !FIELDS.includes(f));')],
  ['R6 — the date checked by a month-length table with no leap rule', 'an ADR date NEAR-MISS — "2026-02-29", in a year with no leap day',
    (s) => s.replace('      const real = d !== null && day.toISOString().slice(0, 10) === fields.date;',
      '      const real = d !== null && +d[2] >= 1 && +d[2] <= 12 && +d[3] >= 1 && +d[3] <= [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][+d[2] - 1];')],
  ['R7 — a whitespace-only id field skipped as empty', 'a raised-by of one SPACE — an entry outside its form, never skipped as empty',
    (s) => s.replace("      if (!order.includes(key) || fields[key] === '') continue;", "      if (!order.includes(key) || fields[key].trim() === '') continue;")],
  ['R7 — the qualifier list takes `or`', 'a supersedes NEAR-MISS — "ADR 0078 rules 1 or 2"',
    (s) => s.replace('\\d+(?:(?:, \\d+)* and \\d+)?)?', '\\d+(?:(?:, \\d+)* (?:and|or) \\d+)?)?')],
  ['R8 — the stale-exception test reads resolved-by as a SUBSTRING', 'a STALE exception whose question keeps the number in OTHER words — "commit 0077"',
    (s) => s.replace("    if (!qf || !adrRefs(qf.fields['resolved-by'] ?? '').includes(x.adr)) {", "    if (!qf || !(qf.fields['resolved-by'] ?? '').includes(x.adr)) {")],
  ['R8 — the forward test reads resolved-by as a SUBSTRING', 'FORWARD broken by a number that is NOT an ADR reference — "commit 8803"',
    (s) => s.replace("      } else if (!adrRefs(qf.fields['resolved-by']).includes(nnnn)) {", "      } else if (!qf.fields['resolved-by'].includes(nnnn)) {")],
  ['the timestamp — its whole TIME form removed', 'a plain YAML 1.1 TIMESTAMP — `shared: 2026-10-04T10:00:00Z`',
    (s) => s.replace('|\\d{4}-\\d\\d?-\\d\\d?(?:[Tt]|[ \\t]+)', '|(?!)\\d{4}-\\d\\d?-\\d\\d?(?:[Tt]|[ \\t]+)')],
  ['the timestamp — a lower-case `t` not read', 'a plain YAML 1.1 TIMESTAMP — `shared: 2026-10-04t10:00:00`',
    (s) => s.replace('(?:[Tt]|[ \\t]+)\\d\\d?:', '(?:T|[ \\t]+)\\d\\d?:')],
  ['the timestamp — a SPACE separator not read', 'a plain YAML 1.1 TIMESTAMP — `shared: 2026-10-04 10:00:00`',
    (s) => s.replace('(?:[Tt]|[ \\t]+)\\d\\d?:', '(?:[Tt])\\d\\d?:')],
  ['the timestamp — a FRACTION of a second not read', 'a plain YAML 1.1 TIMESTAMP — `shared: 2026-10-04T10:00:00.5`',
    (s) => s.replace(':\\d\\d:\\d\\d(?:\\.\\d*)?(?:', ':\\d\\d:\\d\\d(?:')],
  ['the timestamp — its whole ZONE removed', 'a plain YAML 1.1 TIMESTAMP — `shared: 2026-10-04T10:00:00Z`',
    (s) => s.replace('(?:[ \\t]*(?:Z|[-+]\\d\\d?(?::\\d\\d)?))?)$/;', ')$/;')],
  ['the timestamp — a zone of HOURS alone not read', 'a plain YAML 1.1 TIMESTAMP — `shared: 2026-10-04T10:00:00+02`',
    (s) => s.replace('[-+]\\d\\d?(?::\\d\\d)?))?)$/;', '[-+]\\d\\d?:\\d\\d))?)$/;')],
  ['the timestamp — a SPACE before the zone not read', 'a plain YAML 1.1 TIMESTAMP — `shared: 2026-10-04T10:00:00 Z`',
    (s) => s.replace('(?:[ \\t]*(?:Z|', '(?:(?:Z|')],
  ['the timestamp — a one-digit HOUR not read', 'a plain YAML 1.1 TIMESTAMP — `shared: 2026-10-04T1:00:00`',
    (s) => s.replace('[ \\t]+)\\d\\d?:\\d\\d:', '[ \\t]+)\\d\\d:\\d\\d:')],
  ['the timestamp — a one-digit MONTH and DAY not read in the full form', 'a plain YAML 1.1 TIMESTAMP — `shared: 2026-1-4T10:00:00`',
    (s) => s.replace('|\\d{4}-\\d\\d?-\\d\\d?(?:[Tt]', '|\\d{4}-\\d\\d-\\d\\d(?:[Tt]')],

  // --- the reader's new guards, each removed or narrowed — and each over-refusal control widened ---
  ['YAML_TYPED — SEXAGESIMAL numbers not read', 'a plain YAML 1.1 NUMBER — `shared: 1:30`',
    (s) => s.replace('|[-+]?\\d[\\d_]*(?::[0-5]?\\d)+(?:\\.[\\d_]*)?', '')],
  ['YAML_TYPED — a sexagesimal FRACTION not read', 'a plain YAML 1.1 NUMBER — `shared: 190:20:30.15`',
    (s) => s.replace('(?::[0-5]?\\d)+(?:\\.[\\d_]*)?', '(?::[0-5]?\\d)+')],
  ['YAML_TYPED — BINARY not read', 'a plain YAML 1.1 NUMBER — `shared: 0b101`',
    (s) => s.replace('|[-+]?0b[01_]+', '')],
  ['YAML_TYPED — a SIGNED hex not read', 'a plain YAML 1.1 NUMBER — `shared: +0x1F`',
    (s) => s.replace('|[-+]?0x[0-9a-fA-F_]+', '|0x[0-9a-fA-F_]+')],
  ['YAML_TYPED — a SIGNED octal not read', 'a plain YAML 1.1 NUMBER — `shared: +0o17`',
    (s) => s.replace('|[-+]?0o[0-7_]+', '|0o[0-7_]+')],
  ['the tab-led comment guard removed', 'a plain value with a TAB-led comment — `a<TAB>#b`',
    (s) => s.replace('      if (/\\t#/.test(raw)) return', '      if (false) return')],
  ['the mapping-colon guard removed', 'a plain value ENDING in a mapping colon — `W1:`',
    (s) => s.replace('      if (/:$/.test(raw)) return', '      if (false) return')],
  ['the complex-key guard removed', 'a plain value opening with the complex-key indicator — `? x`',
    (s) => s.replace('      if (/^\\?(?:[ \\t]|$)/.test(raw)) return', '      if (false) return')],
  ['the complex-key guard narrowed to `? ` with its space', 'a plain value that is the complex-key indicator ALONE — `?`',
    (s) => s.replace('      if (/^\\?(?:[ \\t]|$)/.test(raw)) return', '      if (/^\\? /.test(raw)) return')],
  ['the bare-date shape widened to one-digit month and day — an over-refusal', 'a plain date with ONE-digit month and day — `2026-1-4` — is a string to YAML 1.1, and accepted',
    (s) => s.replace('|\\d{4}-\\d\\d-\\d\\d|', '|\\d{4}-\\d\\d?-\\d\\d?|')],
  ['the mapping-colon guard widened to ANY colon — an over-refusal', 'a plain value with a colon INSIDE it and no space — `W1:2a` — is accepted',
    (s) => s.replace('      if (/:$/.test(raw)) return', '      if (/:/.test(raw)) return')],
  ['the complex-key guard widened to any opening `?` — an over-refusal', 'a plain value opening with `?` and no space — `?x` — is accepted',
    (s) => s.replace('      if (/^\\?(?:[ \\t]|$)/.test(raw)) return', '      if (/^\\?/.test(raw)) return')],
  ['the date read through Date.UTC again — years 0-99 become 1900-1999', 'an ADR dated in the year 0026 is a real day — `Date.UTC` read it as 1926',
    (s) => s.replace('      if (d) day.setUTCFullYear(+d[1], +d[2] - 1, +d[3]);', '      if (d) day.setTime(Date.UTC(+d[1], +d[2] - 1, +d[3]));')],

  // --- R7's new clauses ----------------------------------------------------------------------
  ['R7`s direction clause disabled', 'an OLDER ADR superseding a newer one — 0078 supersedes ADR 0079',
    (s) => s.replace('          } else if (r[1] > nnnn) {', '          } else if (false) {')],
  ['R7`s direction clause held for supersedes alone', 'an OLDER ADR amending a newer one — 0078 amends ADR 0079',
    (s) => s.replace('          } else if (r[1] > nnnn) {', "          } else if (key === 'supersedes' && r[1] > nnnn) {")],
  ['R7`s ruled duplicate clause disabled', 'supersedes naming one ADR TWICE, qualified differently — `ADR 0078; ADR 0078 rule 1`',
    (s) => s.replace('            if (seen.has(r[1])) fail(', '            if (false) fail(')],
  ['R7 — a ruled duplicate compared by its WHOLE entry', 'supersedes naming one ADR TWICE, qualified differently — `ADR 0078; ADR 0078 rule 1`',
    (s) => s.replace('            if (seen.has(r[1])) fail(', '            if (seen.has(entry)) fail(').replace('            seen.add(r[1]);', '            seen.add(entry);')],
  ['R7`s bare-id duplicate clause disabled', 'resolves naming one question TWICE — `Q8004, Q8004` on ADR 8803',
    (s) => s.replace('          if (seen.has(entry)) fail(', '          if (false) fail(')],
  ['R7`s own-ADR clause for bare ids disabled', 'raised-by naming its OWN ADR — `P28, ADR 0079`',
    (s) => s.replace('          if (entry === `ADR ${nnnn}`) fail(', '          if (false) fail(')],
  ['R7`s one-item clause disabled', 'an item of TWO work items — `W116, W117`',
    (s) => s.replace("      if (key === 'item' && entries.length > 1) {", '      if (false) {')],

  // --- R8's wider reading ---------------------------------------------------------------------
  ['R8 — an ADR read in UPPER case only', 'REVERSE in LOWER case — `adr 8801`',
    (s) => s.replace("const ADR_REF_ANY_CASE = new RegExp(ADR_REF.source, 'gi');", "const ADR_REF_ANY_CASE = new RegExp(ADR_REF.source, 'g');")],
  ['R8 — a LINK into decisions/ not read', 'REVERSE by a LINK alone — `[the decision](decisions/8801-x.md)`',
    (s) => s.replace('  ...[...by.matchAll(/decisions\\/(\\d{4})-/g)].map((m) => m[1]),\n', '')],

  // --- R9, W127: disabled, and each way it could be NARROWED or WIDENED -------------------------
  ['R9`s clause disabled', 'an open question with its closes-when EMPTIED',
    (s) => s.replace("    if (fields.status === 'open' && fields['closes-when'].trim() === '') {", '    if (false) {')],
  ['R9 — the emptiness test without its trim', 'an open question with a closes-when of one SPACE',
    (s) => s.replace("    if (fields.status === 'open' && fields['closes-when'].trim() === '') {",
      "    if (fields.status === 'open' && fields['closes-when'] === '') {")],
  ['R9 — the emptiness test strips SPACES alone', 'an open question with a closes-when of a TAB and a NEWLINE',
    (s) => s.replace("    if (fields.status === 'open' && fields['closes-when'].trim() === '') {",
      "    if (fields.status === 'open' && fields['closes-when'].replace(/ /g, '') === '') {")],
  // Not inert on the base: Q8005 is deferred with no closes-when — CORPUS_ALLOWED names it. Graded
  // ALSO on the ISOLATED control, and its failure lines must name q8001.md alone (the fourth element).
  ['R9 widened to `deferred`', 'R9 CONTROL — DEFERRED with an empty closes-when, ISOLATED: every other deferred question given one first',
    (s) => s.replace("    if (fields.status === 'open' && fields['closes-when'].trim() === '') {",
      "    if ((fields.status === 'open' || fields.status === 'deferred') && fields['closes-when'].trim() === '') {"),
    'q8001.md'],
  ['R9 — the status matched CASE-INSENSITIVELY', 'R9 — a status NEAR-MISS `Open` with an empty closes-when is R2\'s alone',
    (s) => s.replace("    if (fields.status === 'open' && fields['closes-when'].trim() === '') {",
      "    if (fields.status.toLowerCase() === 'open' && fields['closes-when'].trim() === '') {")],
  ['R9 — the status matched by PREFIX', 'R9 — a status NEAR-MISS `opened` with an empty closes-when is R2\'s alone',
    (s) => s.replace("    if (fields.status === 'open' && fields['closes-when'].trim() === '') {",
      "    if (fields.status.startsWith('open') && fields['closes-when'].trim() === '') {")],
  ['R9 — an ABSENT closes-when read as an empty one', 'a required field missing — `closes-when` deleted',
    (s) => s.replace("    if (!order.includes('status') || !order.includes('closes-when')) continue;   // R2's\n    if (fields.status === 'open' && fields['closes-when'].trim() === '') {",
      "    if (!order.includes('status')) continue;\n    if (fields.status === 'open' && (fields['closes-when'] ?? '').trim() === '') {")],
  ['R9 — the FIRST file skipped', 'R9 — the FIRST file in the folder`s order, q1.md, open with no closing condition',
    (s) => s.replace('  ran.R9 = true;\n  for (const [n, { fields, order }] of parsed) {',
      '  ran.R9 = true;\n  for (const [n, { fields, order }] of [...parsed].slice(1)) {')],
  ['R9 — the LAST file skipped', 'R9 — the LAST file in the folder`s order, q99999.md, open with no closing condition',
    (s) => s.replace('  ran.R9 = true;\n  for (const [n, { fields, order }] of parsed) {',
      '  ran.R9 = true;\n  for (const [n, { fields, order }] of [...parsed].slice(0, -1)) {')],
  // W127's fix round: the adequacy reader's CR11-CR17 and CR19, each against the probe written for it.
  ['R9 — stops at its FIRST failure (CR11)', 'R9 — TWO open questions with no closing condition: BOTH are named',
    (s) => s.replace("        'would close it, or it is deferred with its reason in `note`');\n",
      "        'would close it, or it is deferred with its reason in `note`'); break;\n")],
  ['R9 — runs only where no earlier clause failed (CR12)', 'R9 — no closing condition AND an id that disagrees with its name: R1 and R9 both',
    (s) => s.replace("    if (!order.includes('status') || !order.includes('closes-when')) continue;   // R2's", "    if (!order.includes('status') || !order.includes('closes-when')) continue;   // R2's\n    if (failures.length) break;")],
  ['R9 — skips a file without exactly the ten fields (CR13)', 'R9 — no closing condition AND an eleventh field: R2 and R9 both',
    (s) => s.replace("    if (!order.includes('status') || !order.includes('closes-when')) continue;   // R2's", "    if (!order.includes('status') || !order.includes('closes-when')) continue;   // R2's\n    if (order.length !== 10) continue;")],
  ['R9 — skips a file whose cluster is undeclared (CR14)', 'R9 — no closing condition AND an undeclared cluster: R2 and R9 both',
    (s) => s.replace("    if (!order.includes('status') || !order.includes('closes-when')) continue;   // R2's", "    if (!order.includes('status') || !order.includes('closes-when')) continue;   // R2's\n    if (!clusters.includes(fields.cluster)) continue;")],
  ['R9 — skips a file whose id disagrees with its name (CR15)', 'R9 — no closing condition AND an id that disagrees with its name: R1 and R9 both',
    (s) => s.replace("    if (!order.includes('status') || !order.includes('closes-when')) continue;   // R2's", "    if (!order.includes('status') || !order.includes('closes-when')) continue;   // R2's\n    if (fields.id !== `Q${n.slice(1, -3)}`) continue;")],
  ['R9 — a closes-when shorter than four characters read as empty (CR16)', 'R9 — a closes-when of ONE character, `x`, is a closing condition: clean',
    (s) => s.replace("    if (fields.status === 'open' && fields['closes-when'].trim() === '') {", "    if (fields.status === 'open' && fields['closes-when'].trim().length < 4) {")],
  ['R9 — ASCII whitespace stripped instead of trim() (CR17)', 'R9 — a closes-when of a NO-BREAK SPACE alone, which trim() removes',
    (s) => s.replace("    if (fields.status === 'open' && fields['closes-when'].trim() === '') {", "    if (fields.status === 'open' && fields['closes-when'].replace(/[ \\t\\r\\n\\f\\v]/g, '') === '') {")],
  ['R9 — `TBD` refused as a placeholder (CR19)', 'R9 — a closes-when of `TBD` passes: R9 reads emptiness, not content (ADR 0082 consequence 3)',
    (s) => s.replace("    if (fields.status === 'open' && fields['closes-when'].trim() === '') {", "    if (fields.status === 'open' && ['', 'TBD'].includes(fields['closes-when'].trim())) {")],
  ['R9 never marked as run — its row reads NOT RUN over a clause that ran', 'CONTROL — a staged copy that is not a repository: clean, and R4 NOT RUN',
    (s) => s.replace('  ran.R9 = true;\n', '')],
  ['R9 run without the question folder', 'the folder missing entirely — R1 and R5 fail, R2 to R4 say NOT RUN',
    (s) => s.replace('  ran.R9 = true;\n', '').replace("const ran = { R1: false, R2: false, R3: false, R4: false, R5: false, R6: false, R7: false, R8: false, R9: false };",
      "const ran = { R1: false, R2: false, R3: false, R4: false, R5: false, R6: false, R7: false, R8: false, R9: true };")],
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
    stage: (t) => { edit(t, BARE, 'status: open\n', 'status: icebox\n');
      edit(t, BARE, 'note: ""\n', 'note: "a what-if"\n'); } },
  { name: 'STATE — a status outside the four words is live and none of them: refused', exit: 1,
    says: 'live questions that are open, deferred or iceboxed',
    stage: (t) => edit(t, OPEN, 'status: open\n', 'status: closed\n') },
  { name: 'STATE — a CRLF question file, whose status line does not parse: refused', exit: 1,
    says: 'question files whose `status:` line parses',
    stage: (t) => { const s = readFileSync(Q(t, OPEN), 'utf8'); writeFileSync(Q(t, OPEN), s.replace(/\n/g, '\r\n')); } },
  { name: 'STATE — an UPPER-CASE Q9001.md the listing does not read: refused', exit: 1,
    says: 'read a second way',
    stage: (t) => writeFileSync(join(t, 'doc', 'questions', 'Q9001.md'), synQ({ ...SYN_QUESTIONS[0], id: 9001 })) },
  { name: 'STATE — a DIRECTORY named q9002.md: refused BY NAME, not a crash', exit: 1,
    says: 'NOT: q9002.md',
    stage: (t) => { mkdirSync(join(t, 'doc', 'questions', 'q9002.md'));
      writeFileSync(join(t, 'doc', 'questions', 'q9002.md', 'inside.txt'), 'a directory, not a question\n'); } },
];
const MIN_STATE = 6;

/** The label of `state.mjs`'s live relation — the row S8 and S9 must be refused BY. */
const LIVE_RELATION = 'live questions, against the files not reading `resolved` counted a second way';
/**
 * `[what, the STATE probe that must stop grading as declared, mutation of state.mjs, the row that
 * must refuse it]` — the fourth is optional; where present, *noticed* means `state.mjs` exits 1
 * naming THAT row, and a mutant noticed only by the figure grader is red.
 */
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
  // W127: the `live >= 200` floor became a relation to a SECOND ROUTE's live count. What the floor
  // caught — every question read as resolved, live 0 — the relation catches at any register size.
  // **S8 and S9 carry a fourth element: the row that must REFUSE them**, because W127's readers
  // showed the figure grader catching S8 with the relation deleted (adequacy ST05): one observer
  // standing in for another. Graded on that row's own refusal, deleting the row is red here.
  ['S8 — every question counted as resolved, so live reads 0', 'STATE CONTROL — the register as it is: every figure agrees with a third reading',
    (s) => s.replace("const resolvedCount = byStatus('resolved');", 'const resolvedCount = questions.length;'),
    LIVE_RELATION],
  ['S9 — the status reader reads every file as `resolved`, so every count but resolved reads 0',
    'STATE CONTROL — the register as it is: every figure agrees with a third reading',
    (s) => s.replace('  return { id: idOf(f), status: m ? m[1] : null };', "  return { id: idOf(f), status: 'resolved' };"),
    LIVE_RELATION],
];
const MIN_STATE_META = 12;

// ==============================================================================
// SELF — break THIS FILE: each must turn the suite red
// ==============================================================================
// **Each planted case is a defect a guard exists to catch**, not a guard removed: a weakened
// grader on a tree where every probe passes has nothing to be wrong about — `check-budget`'s
// SELF comment, W31's device with the polarity reversed.
/** Replace the LAST occurrence of `from` — for an anchor in the harness below the SELF list. */
const lastReplace = (t, from, to) => {
  const i = t.lastIndexOf(from);
  return i < 0 ? t : t.slice(0, i) + to + t.slice(i + from.length);
};
const SELF = [
  ['one probe deleted from PROBES',
    (t) => t.replace("  r2('an empty title', '`title` is empty', (t) => setLine(t, OPEN, 'title', '\"\"')),\n", '')],
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
    (t) => t.replace("    (t) => edit(t, OPEN, 'shared: \"\"\\n', 'shared: \"\"\\ncloses-by: \"\"\\n')),",
      "    (t) => edit(t, OPEN, 'shared: \"\"\\n', 'shared: \"\"\\n')),")],
  ['the CONTROL made to trip something — what the control`s own verdict catches',
    (t) => t.replace("    git: false, trips: [], notRun: NR, stage: null },",
      "    git: false, trips: [], notRun: NR, stage: (t) => edit(t, OPEN, 'status: open\\n', 'status: closed\\n') },")],
  ['a GRADER control declaring the wrong verdict — what grading the grader catches',
    (t) => t.replace("    expect: 'crash', git: false,", "    expect: 'caught', git: false,")],
  // --- W127: the corpus allow-list, which replaced `MAX_CORPUS = 0`, broken each way it is held ---
  ['CORPUS_ALLOWED emptied — an UNLISTED mutant fails the planted base',
    (t) => t.replace(/const CORPUS_ALLOWED = Object\.freeze\(\[[\s\S]*?\]\);/, 'const CORPUS_ALLOWED = Object.freeze([]);')],
  ['an INERT mutant listed in CORPUS_ALLOWED — an entry the planted base does not need',
    (t) => t.replace("  'R9 widened to `deferred`',\n]);", "  'R9 widened to `deferred`',\n  'R9`s clause disabled',\n]);")],
  ['a CORPUS_ALLOWED name that is no META entry',
    (t) => t.replace("  '`icebox` removed from the vocabulary',\n  'R9", "  '`icebox` removed from the vocabulary',\n  'a mutant nobody wrote',\n  'R9")],
  // --- W127's fix round: the register-write guard, which H3b showed absent ------------------------
  ['the register-write guard made blind — a probe may write a live question',
    (t) => t.replace('    if (id >= SYN_FLOOR || STAND_INS.has(id)) continue;', '    if (true) continue;')],
  // --- W117's fix round: the restore, which the adequacy reader proved asserted and not proved ---
  // **These anchor the HARNESS, which sits BELOW this list in this same file**, so each replaces the
  // LAST occurrence. The first cut used `replace`, which hit the anchor's own copy in the line that
  // declares it: three of the five edited this list instead of the code, the child ran an unharmed
  // suite, and the run said *exited 0: the mutation costs nothing* — which was true, and was the
  // only reason it was caught. A SELF entry whose anchor is ALSO its own literal edits itself.
  ['the restore ASSERTION made to pass whatever the tree — its H2',
    (t) => lastReplace(t, "  const assertRestored = () => (digestDir(work) === baseDigest ? ''", "  const assertRestored = () => (true ? ''")],
  ['the digest made blind to DIRECTORIES — an empty one left by a probe',
    (t) => lastReplace(t, '      if (e.isDirectory()) { h.update(`D\\0${rel}\\0`); walk(p); continue; }', '      if (e.isDirectory()) { walk(p); continue; }')],
  ['the digest hashing path and bytes with NO delimiter',
    (t) => lastReplace(t, '      h.update(`F\\0${rel}\\0${bytes.length}\\0`);', '      h.update(rel);')],
  ['the digest skipping `.git` at EVERY depth',
    (t) => lastReplace(t, "      if (rel === '.git') continue;", "      if (e.name === '.git') continue;")],
  ['the restore EMPTYING a stray directory instead of removing it — its H1',
    (t) => lastReplace(t, '        if (!w || w.isDirectory() !== e.isDirectory()) rmSync(join(d, e.name), { recursive: true, force: true });',
      '        if (!w || w.isDirectory() !== e.isDirectory()) { if (e.isDirectory()) { for (const c of readdirSync(join(d, e.name))) rmSync(join(d, e.name, c), { recursive: true, force: true }); } else rmSync(join(d, e.name), { force: true }); }')],
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

/**
 * **A digest of a staged tree, with every entry DELIMITED and every DIRECTORY in it** — W117's
 * adequacy reader proved the first cut blind three ways, each residue able to change a verdict: it
 * hashed path then bytes with no delimiter (`q1.md` holding `---…` and `q1.md-` holding `--…` were
 * one stream), it never recorded a directory (an EMPTY `doc/decisions/0090-x.md` left by a probe was
 * invisible), and it skipped `.git` at EVERY depth. Only the staged repository's own `.git`, at the
 * root, is skipped now. The restore control below proves each.
 */
function digestDir(d) {
  const h = createHash('sha256');
  const walk = (x) => {
    if (!existsSync(x)) return;
    const entries = readdirSync(x, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    for (const e of entries) {
      const p = join(x, e.name);
      const rel = relative(d, p).replace(/\\/g, '/');
      if (rel === '.git') continue;
      if (e.isDirectory()) { h.update(`D\0${rel}\0`); walk(p); continue; }
      const bytes = readFileSync(p);
      h.update(`F\0${rel}\0${bytes.length}\0`);
      h.update(bytes);
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
  // A LIST of reasons is each matched on a failure line — W127: two files, both named (CR11).
  if (probe.says !== undefined && ![].concat(probe.says).every((x) => mentions(out, x))) return { outcome: 'wrong-reason', got, out };
  if (wanted.length === 0) return { outcome: r.status === 0 ? 'clean' : 'crash', got, out };
  if (r.status === 0) return { outcome: 'exit-zero', got, out };
  return { outcome: 'caught', got, out };
}

export async function selfTest(root) {
  // **The shared instrumented replace — W143, Q434.** Loaded by the ROOT rather than by `./`, because
  // a SELF child runs a mutated copy of this file from dev-dist/ (scripts/selftest-guards.mjs's header).
  const { applyMutation, missWhy } = await import(pathToFileURL(join(root, 'scripts', 'selftest-guards.mjs')).href);
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
  {
    // **The allow-list is a list of META NAMES, and a name that is no META entry excuses nothing it
    // can be seen to** — refused here, before anything runs, as `META` naming a missing probe is.
    const unknown = CORPUS_ALLOWED.filter((n) => !META.some((m) => m[0] === n));
    if (unknown.length || new Set(CORPUS_ALLOWED).size !== CORPUS_ALLOWED.length) {
      banner();
      console.log(`  FAIL  CORPUS_ALLOWED names ${unknown.length ? `[${unknown.join('; ')}], which is no META entry` : 'one entry twice'}: ` +
        'the allow-list is by name, and a name that matches nothing would excuse whatever is renamed to it.');
      return 1;
    }
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
  cpSync(join(root, 'doc', 'decisions'), join(base, 'doc', 'decisions'), { recursive: true });
  cpSync(join(root, 'doc', 'scheduler-upstream.md'), join(base, 'doc', 'scheduler-upstream.md'));
  for (const d of ['plans', 'work-items']) {
    mkdirSync(join(base, 'doc', d), { recursive: true });
    for (const f of readdirSync(join(root, 'doc', d))) writeFileSync(join(base, 'doc', d, f), '');
  }
  // **The synthetic fixtures, W127** — written once into the base, so every probe's copy has them.
  try { plant(base); } catch (e) {
    console.log(`check-register self-test — ABORT: the synthetic fixtures could not be planted — ${e.message}`);
    return 3;
  }
  let seq = 0;
  /** Stage one probe's tree. Returns `{ tree }`, or `{ abort }` with the reason. */
  // **Every `git: false` probe is staged in ONE working tree, restored from the base between probes,
  // and the restore is ASSERTED by digest** (v0.11's *asserted restore, bytes compared back*). W117
  // measured why: a fresh copy of the base is ~850 files, and the FIRST read of a freshly written
  // file cost 2,221 ms for the tree against 30 ms for the second — on-access scanning, not the
  // hash. A fresh copy per probe paid it twice per probe, at 190 probes and every META and SELF
  // re-run of them. The restore rewrites only what a probe changed, so only that is read cold.
  const baseDigest = digestDir(base);
  const baseQ = questionBytes(base);
  const work = join(dir, 'work');
  const restore = (src, dst) => {
    const list = (d) => (existsSync(d) ? readdirSync(d, { withFileTypes: true }) : []);
    const walk = (s, d) => {
      const want = new Map(list(s).map((e) => [e.name, e]));
      for (const e of list(d)) {
        const w = want.get(e.name);
        if (!w || w.isDirectory() !== e.isDirectory()) rmSync(join(d, e.name), { recursive: true, force: true });
      }
      for (const [n, e] of want) {
        const sp = join(s, n), dp = join(d, n);
        if (e.isDirectory()) { mkdirSync(dp, { recursive: true }); walk(sp, dp); continue; }
        const bytes = readFileSync(sp);
        if (!existsSync(dp) || !bytes.equals(readFileSync(dp))) writeFileSync(dp, bytes);
      }
    };
    walk(src, dst);
  };
  /** The restore's ASSERTION, one function so the restore control below fires the one the probes use. */
  const assertRestored = () => (digestDir(work) === baseDigest ? ''
    : 'the working tree did not restore to the base — a probe`s residue would grade the next');
  const stage = (probe) => {
    if (!probe.git) {
      if (existsSync(work)) restore(base, work); else cpSync(base, work, { recursive: true });
      const unrestored = assertRestored();
      if (unrestored) return { abort: unrestored };
      if (probe.stage) {
        try { probe.stage(work); } catch (e) { return { abort: `the edit's anchor matched nothing — ${e.message}` }; }
        // **Rule 7 (b): a probe asserts it changed its input.**
        if (digestDir(work) === baseDigest) return { abort: 'the staging changed nothing (rule 7 (b))' };
        const wrote = probe.writesRegister ? [] : registerWrites(work, baseQ);
        if (wrote.length) return { abort: `the probe WROTE register question(s) ${wrote.join(', ')} — a fixture is synthetic (W127, H3b)` };
      }
      return { tree: work, top: null };
    }
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
      const wrote = probe.writesRegister ? [] : registerWrites(tree, baseQ);
      if (wrote.length) return { abort: `the probe WROTE register question(s) ${wrote.join(', ')} — a fixture is synthetic (W127, H3b)` };
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
    // **Instrumented — W143, Q434**: a compound declaration whose second edit matches nothing aborts.
    const { out: text, misses } = probe.declare ? applyMutation(probe.declare, src) : { out: src, misses: 0 };
    if (probe.declare && text === src) return { outcome: 'abort', why: 'the declaration mutation matched nothing' };
    if (misses > 0) return { outcome: 'abort', why: missWhy(misses) };
    if (text !== realSrc || probe.declare) { useScript = mutantPath(`run-${seq}`); writeFileSync(useScript, text); }
    const s = stage(probe);
    if (s.abort) { if (useScript !== script) rmSync(useScript, { force: true }); return { outcome: 'abort', why: s.abort }; }
    const r = run(useScript, s.tree);
    if (useScript !== script) rmSync(useScript, { force: true });
    if (s.top) rmSync(s.top, { recursive: true, force: true });
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

  // --- the restore control: each residue the digest must SEE, and the restore must REMOVE ------
  // W117's adequacy reader: the restore assertion had no case that made it fire, and was deleted for
  // a green suite (H2). Each residue here is planted in the working tree; the ASSERTION must fire
  // over it, and after a restore must not. Each is one the first digest was blind to.
  const RESIDUE = [
    ['an EMPTY directory named like an ADR', (t) => mkdirSync(join(t, 'doc', 'decisions', '0090-residue.md'))],
    ['an EMPTY directory named like a question', (t) => mkdirSync(join(t, 'doc', 'questions', 'q9003.md'))],
    ['a file named .git below the root', (t) => writeFileSync(join(t, 'doc', 'decisions', '.git'), '')],
    ['a name and its bytes SHIFTED across their boundary — q8003.md becomes q8003.md- one byte shorter', (t) => {
      const q1 = Q(t, RES);
      const s = readFileSync(q1);
      rmSync(q1);
      writeFileSync(`${q1}${String.fromCharCode(s[0])}`, s.subarray(1));
    }],
  ];
  let residueOk = 0;
  for (const [what, plant] of RESIDUE) {
    if (existsSync(work)) restore(base, work); else cpSync(base, work, { recursive: true });
    plant(work);
    const seen = assertRestored() !== '';
    restore(base, work);
    const cleared = assertRestored() === '';
    if (seen && cleared) residueOk++;
    else failures.push(`RESTORE CONTROL — ${what}: the assertion ${seen ? 'fired' : 'did NOT fire'} over it, ` +
      `and ${cleared ? 'passed' : 'still FIRED'} after the restore`);
  }
  console.log(`  restore: ${residueOk}/${RESIDUE.length} residue kind(s) seen by the assertion and removed by the restore`);

  // --- the register-write guard's control: H3b's case, which the guard must SEE -------------------
  // W127: the lowest register id that is no stand-in, found at run time so no verdict moves it, is
  // overwritten with a synthetic open question; the guard must name it, and after a restore must not.
  {
    const live = [...baseQ.keys()].map((n) => /^q(\d+)\.md$/.exec(n)).filter(Boolean).map((m) => Number(m[1]))
      .filter((id) => id < SYN_FLOOR && !STAND_INS.has(id)).sort((a, b) => a - b)[0];
    if (live === undefined) failures.push('GUARD CONTROL — no register question below the band to provoke the guard with');
    else {
      restore(base, work);
      writeFileSync(Q(work, live), synQ({ id: live, title: 'a probe written over a live question', status: 'open' }));
      const seen = registerWrites(work, baseQ).includes(`q${live}.md`);
      restore(base, work);
      const cleared = registerWrites(work, baseQ).length === 0;
      if (seen && cleared) console.log(`  guard: a write over q${live}.md seen, and gone after the restore`);
      else failures.push(`GUARD CONTROL — a write over q${live}.md was ${seen ? 'seen' : 'NOT seen'} by the register-write guard, ` +
        `and ${cleared ? 'cleared' : 'still SEEN'} after the restore`);
    }
  }

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
  // **Q434's case for a DECLARATION, in process — W143.** The first grader control's declaration with a
  // dead second edit must abort naming the miss; `grade` refuses it before it stages or runs anything.
  {
    const g = GRADER_CONTROLS.find((x) => x.declare);
    const v = grade({ ...g, declare: (s) => g.declare(s).replace('\u0000W143: no such anchor', '') }, realSrc);
    if (v.outcome !== 'abort' || !`${v.why}`.includes('matched NOTHING')) {
      failures.push(`GUARD CASE a compound declaration whose second edit matches nothing — Q434 — got ${v.outcome}${v.why ? `: ${v.why}` : ''}`);
    }
    console.log(`  declaration guard case (Q434): ${v.outcome === 'abort' && `${v.why}`.includes('matched NOTHING') ? 'refused, as it must be' : 'NOT REFUSED'}`);
  }
  if (nestedRed()) {
    console.log('\n' + failures.map((f) => `  FAIL  ${f}`).join('\n'));
    console.log(`\n${failures.length} failure(s) — a SELF child, stopped at its first red.`);
    return 1;
  }

  // --- pass 2: META -----------------------------------------------------------------------
  let noticed = 0;
  const byCorpus = [];
  /** The control's mutation: it changes nothing, and the graders skip the vacuity guard for it alone. */
  const IDENTITY = (t) => t;
  /**
   * **One META entry, graded — a function since W143** so the control and the guard cases below go
   * through the SAME path as every entry. Returns `{ failure, corpus, outcome }`; `failure` is the line
   * this file reports, or null when the entry is noticed.
   */
  const gradeMeta = ([what, probeName, mutate, only], source = realSrc) => {
    {
      // **Instrumented — W143, Q434.**
      const { out: mutated, misses } = applyMutation(mutate, source);
      if (mutated === source && mutate !== IDENTITY) return { failure: `META ${what} — ABORT: the mutation matched nothing (rule 7 (b))`, outcome: 'abort' };
      if (misses > 0) return { failure: `META ${what} — ABORT: ${missWhy(misses)}`, outcome: 'abort' };
      const mutant = mutantPath('meta');
      writeFileSync(mutant, mutated);
      // Is the mutant INERT on the planted BASE? One that fails there is noticed by the corpus, and
      // that is permitted for the names CORPUS_ALLOWED lists and for no other — BOTH WAYS. The BASE,
      // not the repository's register (W127, conformity 2): a legal register edit cannot move it.
      const inert = run(mutant, base).status === 0;
      rmSync(mutant, { force: true });
      const allowed = CORPUS_ALLOWED.includes(what);
      if (allowed && inert) {
        return { outcome: 'inert-but-allowed', failure: `META ${what} — listed in CORPUS_ALLOWED and INERT on the base: the entry ` +
          'excuses nothing, so delete it and let its probe grade it' };
      }
      if (!inert && !allowed) {
        return { outcome: 'corpus', failure: `META ${what} — NOT INERT on the base and not in CORPUS_ALLOWED: its probe's ` +
          'verdict would be noise (Q150), so either the tree is wrong or the mutant is listed by name' };
      }
      // A listed non-inert mutant is graded by its named probe below, all the same (W127).
      const probe = PROBES.find((p) => p.name === probeName);
      const v = grade(probe, mutated);
      // `only`: the probe must see the mutant through that ONE file — every failure line names it.
      const beyond = only === undefined ? [] : (v.out ?? '').split('\n').filter((l) => /^ {2}R\d: /.test(l) && !l.includes(only));
      const corpus = !inert;
      if (v.outcome === 'abort') return { corpus, outcome: v.outcome, failure: `META ${what} — the probe aborted: ${v.why}` };
      if (v.outcome === expected(probe)) return { corpus, outcome: v.outcome, failure: `META ${what} — STILL ${v.outcome} by "${probeName}", so the clause is not what it rests on` };
      if (beyond.length) return { corpus, outcome: v.outcome, failure: `META ${what} — seen by "${probeName}" through ${beyond.length} failure line(s) not naming ${only}: the control did not see it ON ITS OWN` };
      return { corpus, outcome: v.outcome, failure: null };
    }
  };
  // **The CONTROL for this pass — W143, Q437.** An UNMUTATED copy of the check, staged where every mutant
  // is and driven through the same `gradeMeta`, naming the first entry CORPUS_ALLOWED does not list.
  // Nothing is broken, so the copy must be inert on the base and its probe must still grade as declared —
  // which for an entry is STILL; `failure` names that, and `outcome` is the probe's own verdict. A copy
  // that cannot run comes back `corpus`, which is how a pass grades every mutation of a check it never ran
  // against (W105's adequacy reader). **Removing this block is visible** — `metaControl` then stays `not run`
  // and the `NOT RUN` arm below is a failure (the reader's finding 1: it was a quiet line until then).
  const controlEntry = META.find(([w]) => !CORPUS_ALLOWED.includes(w));
  const controlProbe = PROBES.find((p) => p.name === controlEntry[1]);
  const metaControlOf = (source) => gradeMeta(['the control: an UNMUTATED copy', controlEntry[1], IDENTITY], source);
  const controlHolds = (g) => g.outcome === expected(controlProbe) && !g.corpus;
  let metaControl = { outcome: 'not run' };
  if (meta) {
    metaControl = metaControlOf(realSrc);
    if (!controlHolds(metaControl)) {
      failures.push(`META CONTROL — an UNMUTATED copy of check-register.mjs graded "${metaControl.outcome}" by ` +
        `"${controlEntry[1]}", where nothing is broken and the probe must still grade ${expected(controlProbe)}: every ` +
        'META verdict is then a fact about the harness rather than about the check');
    }
    console.log(`  meta control: an unmutated copy graded ${metaControl.outcome} (must be ${expected(controlProbe)})`);
    // **The guards' own cases, in process — W143, rule 7.** Each is graded on its guard's own line.
    //   Q434: `META[0]`'s mutation with a dead second edit must ABORT naming the miss.
    //   Q437: the control handed a copy that cannot run must NOT hold.
    const g434 = gradeMeta([`${META[0][0]}, then a dead second edit`, META[0][1],
      (s) => META[0][2](s).replace('\u0000W143: no such anchor', ''), META[0][3]]);
    if (!g434.failure?.includes('matched NOTHING')) {
      failures.push(`GUARD CASE a compound META entry whose second edit matches nothing — Q434 — got ${g434.failure ?? 'noticed'}`);
    }
    const g437 = metaControlOf('throw new Error("W143: this copy cannot run");\n' + realSrc);
    if (controlHolds(g437)) {
      failures.push('GUARD CASE the META control handed a copy that cannot run — Q437 — the control still held');
    }
    console.log(`  meta guard cases: Q434 ${g434.failure?.includes('matched NOTHING') ? 'refused' : 'NOT REFUSED'}, ` +
      `Q437 ${controlHolds(g437) ? 'NOT FIRED' : `fired (${g437.outcome})`}`);
  }
  if (meta && controlHolds(metaControl)) {
    for (const entry of META) {
      const g = gradeMeta(entry);
      if (g.corpus && !g.failure) byCorpus.push(entry[0]);
      if (g.failure) failures.push(g.failure);
      else noticed++;
    }
    console.log(`  meta: ${noticed}/${META.length} noticed by the named probe; ${byCorpus.length} of them also by the corpus ` +
      `on the base, as CORPUS_ALLOWED permits, by name: ${byCorpus.length ? byCorpus.join('; ') : 'none'}`);
  } else if (meta) {
    // **A pass skipped is a FAILURE, never a quiet line — the reader's finding 1 (W143).** This printed
    // `NOT RUN` and pushed nothing, so deleting the control block (`metaControl` stays `not run`) or only
    // its failure line skipped all of META at exit 0. Now the skip is itself the red, whatever removed it.
    failures.push(`META NOT RUN — its control did not hold (${metaControl.outcome}), so no entry was graded`);
    console.log('  meta: NOT RUN — its control did not hold');
  } else console.log('  meta: skipped — this run is already a META child');
  // **A SELF child stops at its first red after META too — W143**, the same cost decision W116 took after
  // the grader pass: the META control and the guard cases sit at the top of META, so a child whose planted
  // case is one of them had the whole of META and STATE still to run, for a verdict it already had.
  if (nestedRed()) {
    console.log('\n' + failures.map((f) => `  FAIL  ${f}`).join('\n'));
    console.log(`\n${failures.length} failure(s) — a SELF child, stopped at its first red.`);
    return 1;
  }

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
  // The same synthetic questions, so no STATE probe anchors on a live one either (W127). No ADR:
  // `state.mjs` counts the decisions folder and reads none of its front matter.
  try { plant(sbase, { adrs: false }); } catch (e) {
    console.log(`check-register self-test — ABORT: the synthetic fixtures could not be planted for STATE — ${e.message}`);
    return 3;
  }
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
  const gradeState = (probe, src, forceCopy = false) => {
    const tree = join(dir, `s${seq++}`);
    cpSync(sbase, tree, { recursive: true });
    if (probe.stage) {
      const was = digestDir(tree);
      try { probe.stage(tree); } catch (e) { return { outcome: 'abort', why: e.message }; }
      if (digestDir(tree) === was) return { outcome: 'abort', why: 'the staging changed nothing (rule 7 (b))' };
    }
    let useScript = stateScript;
    if (src !== stateSrc || forceCopy) { useScript = mutantPath(`state-${seq}`); writeFileSync(useScript, src); }
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
  /**
   * **The first application of a STATE_META entry — a function since W143** so the guard case below
   * reaches the SAME expression the loop does. Returns `{ mutated }` or `{ failure }`.
   */
  const stateVacuity = (what, mutate) => {
    const { out: mutated, misses } = applyMutation(mutate, stateSrc);
    if (mutated === stateSrc) return { failure: `STATE_META ${what} — ABORT: the mutation matched nothing (rule 7 (b))` };
    if (misses > 0) return { failure: `STATE_META ${what} — ABORT: ${missWhy(misses)}` };
    return { mutated };
  };
  let stateControl = { outcome: 'not run' };
  const sProbe = STATE_PROBES.find((p) => p.name === STATE_META[0][1]);
  if (meta) {
    // **The CONTROL for STATE_META — W143, Q437.** An unmutated COPY of `state.mjs`, run from where every
    // mutant runs (`forceCopy`), against the first entry's probe, must grade exactly as the real script
    // does. Without it, a copy that cannot run would grade every entry noticed.
    stateControl = gradeState(sProbe, stateSrc, true);
    if (stateControl.outcome !== stateWant(sProbe)) {
      failures.push(`STATE_META CONTROL — an UNMUTATED copy of state.mjs graded "${stateControl.outcome}" by ` +
        `"${sProbe.name}", where nothing is broken and it must grade ${stateWant(sProbe)}`);
    }
    // Q437's case: the same control handed a copy that cannot run must NOT grade as declared.
    const s437 = gradeState(sProbe, 'throw new Error("W143: this copy cannot run");\n' + stateSrc, true);
    if (s437.outcome === stateWant(sProbe)) failures.push('GUARD CASE the STATE_META control handed a copy that cannot run — Q437 — it still graded as declared');
    // Q434's case: `STATE_META[0]`'s mutation with a dead second edit must ABORT naming the miss.
    const s434 = stateVacuity('a dead second edit', (s) => STATE_META[0][2](s).replace('\u0000W143: no such anchor', ''));
    if (!s434.failure?.includes('matched NOTHING')) failures.push(`GUARD CASE a compound STATE_META entry whose second edit matches nothing — Q434 — got ${s434.failure ?? 'a mutation to run'}`);
    console.log(`  state meta control: an unmutated copy graded ${stateControl.outcome} (must be ${stateWant(sProbe)}); ` +
      `guard cases: Q434 ${s434.failure?.includes('matched NOTHING') ? 'refused' : 'NOT REFUSED'}, Q437 ` +
      `${s437.outcome === stateWant(sProbe) ? 'NOT FIRED' : `fired (${s437.outcome})`}`);
  }
  // **Gated on the control HOLDING, and a skip is a failure** — the reader's finding 1 again: this read
  // `!== 'not run'`, so a control that failed silently still let every entry grade, and a deleted control
  // block skipped the pass with nothing said.
  if (meta && stateControl.outcome !== stateWant(sProbe)) {
    failures.push(`STATE_META NOT RUN — its control did not hold (${stateControl.outcome}), so no entry was graded`);
  }
  if (meta && stateControl.outcome === stateWant(sProbe)) {
    for (const [what, probeName, mutate, refusedBy] of STATE_META) {
      const { mutated, failure } = stateVacuity(what, mutate);
      if (failure) { failures.push(failure); continue; }
      const probe = STATE_PROBES.find((p) => p.name === probeName);
      if (refusedBy !== undefined) {
        // W127: graded on the named ROW's refusal, so a second observer cannot stand in for it.
        const v = gradeState({ ...probe, exit: 1, says: refusedBy }, mutated);
        if (v.outcome === 'refused') stateNoticed++;
        else failures.push(`STATE_META ${what} — not refused by "${refusedBy}": ${v.outcome}${v.why ? `: ${v.why}` : ''}`);
        continue;
      }
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
    /** The first application of a SELF entry — a function since W143, so the guard case below reaches it. */
    const selfVacuity = (mutate) => {
      const { out, misses } = applyMutation(mutate, selfSrc);
      if (out === selfSrc) return { why: 'the mutation matched nothing (rule 7 (b))' };
      if (misses > 0) return { why: missWhy(misses) };
      return { out };
    };
    // **Q434's case for THIS pass, in process** — a `SELF` child skips the `SELF` pass.
    {
      const v = selfVacuity((t) => SELF[0][1](t).replace('\u0000W143: no such anchor', ''));
      if (!v.why?.includes('matched NOTHING')) failures.push(`GUARD CASE a compound SELF entry whose second edit matches nothing — Q434 — got ${v.why ?? 'a mutation to run'}`);
      console.log(`  self guard case (Q434): ${v.why?.includes('matched NOTHING') ? 'refused, as it must be' : 'NOT REFUSED'}`);
    }
    for (const [what, mutate] of SELF) {
      const { out: mutated, why: vacuous } = selfVacuity(mutate);
      if (vacuous) { failures.push(`SELF ${what} — ABORT: ${vacuous}`); continue; }
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
