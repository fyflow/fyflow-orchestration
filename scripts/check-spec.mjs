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
import { fileURLToPath, pathToFileURL } from 'node:url';

// W25: C5's implementation lives here now. See the C5 block below.
import { resolveLinks } from './check-markdown.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SPEC = process.env.CHECK_SPEC_DIR ? resolve(ROOT, process.env.CHECK_SPEC_DIR) : join(ROOT, 'spec');

// **Dispatched BEFORE the checks run**, which is `check-docs.mjs`'s form rather than
// `check-scheduler.mjs`'s. A META child spawns this script once per entry and the
// checks it would run first are pure waste; the flag is the whole of the argument.
if (process.argv.includes('--self-test')) {
  const mod = process.env.CHECK_SPEC_SELFTEST ?? join(ROOT, 'scripts', 'check-spec-selftest.mjs');
  // `resolve`, not `join`: the default is already absolute and `join` would
  // concatenate it onto ROOT. **The override is what lets `check-wiring.mjs`'s `G1`
  // prove this dispatch ROUTES rather than that its text exists** — W38, where the
  // clause was declared as `S14` inside `check-source` and moved to its own entry
  // under a cost measurement; the idiom is `CHECK_SOURCE_SELFTEST`'s, which predates
  // it. `G2` reads the declaration on the line above and compares both names.
  const { selfTest } = await import(pathToFileURL(resolve(ROOT, mod)).href);
  process.exit(await selfTest(ROOT));
}

// **`FD-C` is the ninth prefix and W41 added it** — [Q164](../doc/questions/q164.md),
// resolved. `spec/flow-definition.md` has `FD-V` for a rule about what a DOCUMENT
// may say and `FD-R` for one about what a RUN refuses, and until v0.11 it had none
// for a rule about **what a run CARRIES**, so that contract lived in section 3 as
// prose with no id at all.
//
// **This list was written down TWICE in this file** — here, and in C2's declaration
// pattern below — and the two had to agree or a rule would be declared and never
// cited, or cited and never declared. That is a provenance hazard rather than a
// hypothesis: measured before the prefix was taken, a rule declared as `FD-C1` and
// cited one line below it reported **8 checks ok, 80 rules** and exit 0 — not
// counted, not checked for uniqueness, not checked for an owner, which is exactly
// what Q164's row predicted. Both patterns are derived from this one constant now,
// which is the smallest thing that makes them unable to disagree.
const RULE_PREFIXES = ['FD-V', 'FD-R', 'FD-C', 'ID-R', 'OR-R', 'RS-R', 'RN-R', 'RT-R', 'JP-R'];
const RULE_ALT = RULE_PREFIXES.map(p => p + '\\d+').join('|');
const RULE_ID = new RegExp('\\b(' + RULE_ALT + ')\\b', 'g');
/** The DECLARATION form: a table row whose first cell is a backticked rule id. */
const RULE_ROW = new RegExp('^\\|\\s*`(' + RULE_ALT + ')`\\s*\\|(.*)$');
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
    const m = RULE_ROW.exec(line);
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

// **And `RULE_PREFIXES` itself is bound to the documents, both ways** — W41. Rule 8
// measured that dropping `FD-C` from that list costs **zero**: the two `FD-C` rules
// then match neither pattern, so they are neither declared nor cited and every check
// is silent. That is exactly [Q164](../doc/questions/q164.md)`s defect — *a rule
// declared, cited and checked by nothing* — surviving inside the fix for it, and it
// is obligation (e)'s SECOND QUESTION on a product item: the list was bound to
// nothing, so what the check RAN was not what `spec/` SHIPS.
//
// The bound is a rule-id-SHAPED first cell, which is a deliberately WIDER pattern
// than `RULE_ROW`: any `| `XX-Y7` |` row, whatever its prefix. Both directions,
// because a prefix that leaves the list and a prefix nobody uses are different
// mistakes and only the first is silent.
{
  const SHAPED = /^\|\s*`([A-Z]{2,4}-[A-Z])\d+`\s*\|/;
  const inDocs = new Set();
  for (const p of mdFiles) {
    for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = SHAPED.exec(line);
      if (m) inDocs.add(m[1]);
    }
  }
  for (const pre of [...inDocs].sort()) {
    if (!RULE_PREFIXES.includes(pre)) {
      fail('C2', `${pre} is a rule-id prefix declared in spec/ and missing from RULE_PREFIXES — ` +
        `every ${pre}* rule is invisible to C2 and C6, which is Q164's own defect`);
    }
  }
  for (const pre of RULE_PREFIXES) {
    if (!inDocs.has(pre)) {
      fail('C2', `RULE_PREFIXES carries ${pre} and no rules table in spec/ declares a ${pre}* rule`);
    }
  }
  notes.push(
    `C2 matched ${RULE_PREFIXES.length} rule-id prefixes against spec/'s own declaration rows, ` +
    'both ways — so a prefix cannot leave the list and take its rules out of every check with it.',
  );
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
/**
 * **`C4` also compares its own count to `spec/README.md`'s prose** — W45's adequacy
 * reader, obligation (e)'s third shape. That row states the number twice ("**27
 * refusals**" and "*C4 covered 27 definition refusals*") and **both could be moved to
 * 28 for zero** while this script printed 27 in the same terminal. The row already
 * carries a correction from W41's conformity reader for that exact defect, so this is
 * the second occurrence — and the count is derivable here in one expression, which is
 * the argument [Q102](../doc/questions/q102.md) asks for before a floor becomes a
 * binding.
 *
 * Both statements are compared, because they are two literals and either can drift
 * alone.
 */
{
  const n = definitionRefusals.length;
  // `README` is declared with `C8`'s block below, so the path is rebuilt here rather
  // than hoisted — one line against moving a const out of the section it belongs to.
  const readmePath = join(SPEC, 'README.md');
  const readme = existsSync(readmePath) ? readFileSync(readmePath, 'utf8') : '';
  if (readme) {
    // **The LAST occurrence of each, because the row is a version HISTORY.** Earlier
    // versions state earlier counts, and those are true of the version they name; the
    // row's current claim is its last one. Written this way after the clause's own
    // first run found `spec/README.md` quoting *"C4 covered 26"* from v0.11 in the
    // present tense beside v0.13's 27 — which is the live-versus-historical split
    // [W36](../doc/work-items/w36-the-scheduler-pin-moves-to-0-5-1.md) leaked twelve
    // times, and the earlier sentences are now past tense.
    const all = (re) => [...readme.matchAll(re)];
    const lastOf = (re) => { const m = all(re); return m.length ? m[m.length - 1] : null; };
    const bold = lastOf(/\*\*(\d+) refusals\*\*/g);
    const cited = lastOf(/C4 covered (\d+) definition refusals/g);
    if (!bold) fail('C4', 'spec/README.md states no "**N refusals**" count for flow-definition.md');
    else if (Number(bold[1]) !== n) {
      fail('C4', `spec/README.md says **${bold[1]} refusals** and C4 counts ${n}`);
    }
    // **And the FIRST one, which is the row's HEADLINE** — W61's rule 8 set (`e7`): the row opens
    // *"…and **N refusals**"* as a summary and closes with the version paragraph's *"now holds
    // **N refusals**"*; reading the last occurrence alone let the headline be reverted to 32 with
    // this check green. The sentences between the two are historical and past tense; the two ends
    // are both present tense and both must be the count.
    const first = all(/\*\*(\d+) refusals\*\*/g)[0];
    if (first && bold && first.index !== bold.index && Number(first[1]) !== n) {
      fail('C4', `spec/README.md's headline says **${first[1]} refusals** and C4 counts ${n} — the row's first count is a copy the last one does not cover`);
    }
    if (!cited) fail('C4', 'spec/README.md does not quote "C4 covered N definition refusals"');
    else if (Number(cited[1]) !== n) {
      fail('C4', `spec/README.md quotes "C4 covered ${cited[1]}" and C4 counts ${n}`);
    }
  }
  // **And the spec's OWN version paragraph** — W65's rule 8 set (`d1`): each version paragraph in
  // `spec/flow-definition.md`'s header closes with *"this document now holds **N refusals**"*, and
  // the LAST of those is the current claim; moving it to 35 with the rows at 34 cost zero across
  // every check while this clause compared the README twice. The same shape, the same reading
  // (the last occurrence, because the header is a version HISTORY), one file over.
  const fdPath = join(SPEC, 'flow-definition.md');
  const fdText = existsSync(fdPath) ? readFileSync(fdPath, 'utf8') : '';
  if (fdText) {
    const owns = [...fdText.matchAll(/\*\*(\d+) refusals\*\*/g)];
    const own = owns.length ? owns[owns.length - 1] : null;
    if (!own) fail('C4', 'spec/flow-definition.md states no "**N refusals**" count of its own');
    else if (Number(own[1]) !== n) {
      fail('C4', `spec/flow-definition.md's own version paragraph says **${own[1]} refusals** and C4 counts ${n}`);
    }
  }
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
// The one SEMANTIC check L0 can honestly make. FD-V4, FD-V32, FD-V35 and FD-V38 are refusals about
// a registry, so without one written down none of their cases can be evaluated and every
// other example's `when` name is unchecked. Full definition validation is W3's L4;
// this is the slice that needs no graph logic.
const REG = join(SPEC, 'examples', 'registry.json');
const VALID_DIR = join(SPEC, 'examples', 'valid');
if (!existsSync(REG)) {
  fail('C7', 'spec/examples/registry.json does not exist');
} else if (existsSync(VALID_DIR)) {
  const reg = parsed.get(REG) ?? {};
  const preds = new Set(reg.predicates ?? []);
  // **`registry.json` is a registry DOCUMENT since v0.19 (W65, ADR 0054)**: `nodeTypes` and `pools`
  // are objects keyed by name, and every task node names a `type` — `workerType` is retired, so the
  // clause that read it against `workerTypes` retired with it. A task's `type` must be a key of
  // `nodeTypes`; a `pool`, when named and not the type's own name, must be a key of `pools` whose
  // `type` is the node's (`FD-V38`). `groups` is deliberately not read here (W58): it needs
  // `FD-V31`'s per-entry logic, which is ladder L4's; and what a type's WORKER or SCHEMA says is the
  // registry resolver's, at L4 too.
  // **The BUILT-IN node types are nameable by a flow and are in NO registry document** - v0.28
  // (W109, ADR 0075): `nodeTypesOf` merges them, so `Transform` resolves against a registry that
  // declares no `nodeTypes` at all, which is the whole point of the merge. The list is a LITERAL here
  // rather than imported, because this script reads the tree as TEXT and importing `src/` would make
  // the check a consumer of the thing it checks; `test/definition/node-type.test.ts` holds the literal
  // to `BUILT_IN_NODE_TYPES` both ways, so a built-in added without this line failing is caught there.
  const BUILT_IN_NODE_TYPES = ['Transform'];
  const nts = new Set([...Object.keys(reg.nodeTypes ?? {}), ...BUILT_IN_NODE_TYPES]);
  const pools = reg.pools ?? {};
  const poolOk = (n) => n.pool === undefined || n.pool === n.type || (pools[n.pool] !== undefined && pools[n.pool].type === n.type);
  // `languages` since W61 (v0.18): a typed task may declare `transform: { lang, expr }`, and `lang`
  // names an entry in registry.json's `languages`. What the expression SAYS is `FD-V36`'s and needs
  // the language's compiler, which is ladder L4's.
  const langs = new Set(reg.languages ?? []);
  /**
   * **The registered NAME a `when` carries, or `null` where it carries none** — v0.27, W108.
   * One expression for both clauses below, so the valid corpus and the `FD-V4` fixture cannot
   * read the same key two ways.
   */
  const whenName = (w) =>
    (typeof w === 'object' && w !== null && typeof w.predicate === 'string') ? w.predicate : null;

  for (const name of readdirSync(VALID_DIR)) {
    const doc = parsed.get(join(VALID_DIR, name));
    for (const n of doc?.nodes ?? []) {
      if (n.kind === 'task' && !nts.has(n.type))
        fail('C7', `valid/${name}: type ${JSON.stringify(n.type)} is not in registry.json`);
      if (n.kind === 'task' && !poolOk(n))
        fail('C7', `valid/${name}: pool ${JSON.stringify(n.pool)} is not an instance of type ${JSON.stringify(n.type)} in registry.json`);
      if (n.kind === 'task' && n.transform !== undefined && !langs.has(n.transform?.lang))
        fail('C7', `valid/${name}: transform.lang ${JSON.stringify(n.transform?.lang)} is not in registry.json`);
      // **A `when` is an OBJECT since v0.27 (W108, ADR 0074), and only ONE of its three shapes
      // names a predicate.** This read `preds.has(e.when)` on the string form; a declared
      // comparison or a group names nothing, so asking the registry about it reported
      // `predicate "[object Object]" is not in registry.json` on a CORRECT document — measured
      // RED at W108's declaration step, before the grammar was written.
      for (const e of n.edges ?? [])
        if (whenName(e.when) !== null && !preds.has(whenName(e.when)))
          fail('C7', `valid/${name}: predicate "${whenName(e.when)}" is not in registry.json`);
    }
  }
  // and the two refusal cases must name things the registry does NOT have
  const invDir = join(SPEC, 'examples', 'invalid');
  for (const name of existsSync(invDir) ? readdirSync(invDir) : []) {
    const doc = parsed.get(join(invDir, name));
    if (name.startsWith('FD-V4--')) {
      const names = (doc?.nodes ?? []).flatMap(n => (n.edges ?? []).map(e => whenName(e.when))).filter(w => w !== null);
      if (!names.some(w => !preds.has(w))) fail('C7', `invalid/${name} names no predicate absent from registry.json`);
    }
    // W59: `FD-V32` is the refusal about the fourth set, and its case must name a type the
    // registry lacks — `FD-V5`'s clause one set over.
    if (name.startsWith('FD-V32--')) {
      const ty = (doc?.nodes ?? []).filter(n => n.kind === 'task' && n.type !== undefined).map(n => n.type);
      if (!ty.some(t => !nts.has(t))) fail('C7', `invalid/${name} names no node type absent from registry.json`);
    }
    // W65: `FD-V38` is the refusal about a POOL, and its case must name a pool that is absent from
    // the registry's `pools` or an instance of another type than the node's.
    if (name.startsWith('FD-V38--')) {
      const tasks = (doc?.nodes ?? []).filter(n => n.kind === 'task');
      if (!tasks.some(n => n.pool !== undefined && !poolOk(n))) fail('C7', `invalid/${name} names no pool that is absent from registry.json or of another type than the node's`);
    }
    // W61: `FD-V35` is the refusal about the fifth set, and its case must name a language the
    // registry lacks — `FD-V32`'s clause one set over.
    if (name.startsWith('FD-V35--')) {
      const ls = (doc?.nodes ?? []).filter(n => n.kind === 'task' && n.transform !== undefined).map(n => n.transform?.lang);
      if (!ls.some(l => !langs.has(l))) fail('C7', `invalid/${name} names no language absent from registry.json`);
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
    // **The VERSION COLUMN, not the whole row** — [W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md).
    // This read `row.includes(...)`, and every row of that table narrates its own
    // version history in its prose cell, so a row announcing **v0.13** in prose
    // passed with a version column reading anything at all. **Measured: 2 of the 6
    // rows were unbound, and they were exactly the two documents the item that
    // found this had just bumped** — the clause binds least on the rows most likely
    // to be edited, which is the opposite of what a staleness check is for.
    // [Q162](../doc/questions/q162.md)'s class in a second check.
    //
    // **Inert on the corpus**: all six columns were already correct, so this ships
    // with no live case and its evidence is its probe (`doc/workflow.md` section 5
    // rule 8's *does the guard ever fire* — construct the case, and where the corpus
    // cannot express one, record that).
    // **Positional, and the empties are NOT filtered.** The first repair filtered
    // them, and W34's conformity reader measured what that cost: a row whose version
    // cell is EMPTY collapses to its prose cell, and every row of this table narrates
    // its own version history in prose — so `| … |  |` passed. That is the same
    // mechanism the repair was written for, surviving in the one direction the
    // repair's own probe could not see, because that probe mutates the VALUE.
    // A well-formed row is `| a | b | c |`, so `split('|')` gives an empty first and
    // last element and the version column is the second from the end.
    const cells = row.split('|');
    const column = (cells[cells.length - 2] ?? '').trim();
    if (!column.includes(`**${own[1]}**`))
      fail('C8', `spec/README.md's version COLUMN for ${base} reads ${JSON.stringify(column)}, ` +
        `not ${own[1]}, which is that document's own header`);
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
  // defect**, which is [Q137](../doc/questions/q137.md)'s shape — a lift moves an
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
