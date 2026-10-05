#!/usr/bin/env node
// **The lookup: the caller picks the records AND the fields** —
// [W119](../doc/work-items/w119-the-lookup.md),
// [P28](../doc/plans/p28-what-can-be-looked-up-instead-of-read.md) decision 5. Its job is to print the
// fewest bytes that answer the question, so nothing is printed that was not asked for.
//
//   npm run q    -- [Q<N> ... | --where F=V | --where F~V | --search T] [options]    --table
//   npm run adr  -- [NNNN ... | ...the same...]                                       --index
//   npm run term -- [<term>   | ...the same...]
//   npm run refs -- <id> [--fields path,count] [--limit N] [--format F] [--count]   (no filter)
//   options: --fields a,b,c   --format line|json   --count   --limit N   --include-icebox (q only)
//
// **Exit codes are grep's.** 0: at least one record. 1: none — and the output says which id or filter
// found nothing, and how many `icebox` questions it hid. **2: the reading is broken** — an unknown field
// in `--where` or `--fields`, an unparseable record, a kind that reads to zero records, an option this
// file does not know. *An unknown field is a 2 and never an empty result*: a misspelt field that
// silently matches nothing reports an empty index as confidently as a full one, which is `state.mjs`'s
// founding defect.
//
// **It reads; `check:register` judges.** Nothing here writes, and a record this file cannot read is
// a 2 naming the file rather than a record skipped.
//
// **The front-matter reader is this file's OWN, and that is a decision, not an oversight** — W119's
// stop-and-ask 3. `check-register.mjs` exports `readFrontMatter`, and importing it RUNS the whole
// register check at module scope: it prints the report and calls `process.exit(1)` when the tree is
// red. So this file reads the same subset `doc/questions/README.md` declares, and
// `check-lookup-selftest.mjs` asserts the two readers AGREE — on every question and ADR file in the
// tree and on constructed inputs — importing `check-register`'s in a child process.
//
// **The contract other items lean on**, each a decision W119's Record states:
//
//   --format line   one line per record, values TAB-separated in the order projected, no header. A
//                   value is escaped so a record is always one line: `\` as `\\`, a tab as `\t`, a
//                   newline as `\n`, a carriage return as `\r`. `refs` prints `path:count` entries
//                   joined by `,`. A line opening `# ` is a NOTE — what found nothing, what `icebox`
//                   hid, what `--limit` cut, that an `S<N>` count spans two namespaces (Q505) —
//                   and is never a record.
//                   **One exception**: a lookup BY ID with no `--fields` prints each record's front
//                   matter as it stands in its file, `key: value` lines, records separated by a blank
//                   line — P28's *a single record prints its front matter*. A term has no front
//                   matter and prints its four fields in the same `key: value` shape.
//   --format json   one object: `{ kind, count, hidden-icebox, records }`, with `not-shown` when
//                   `--limit` cut, `none` when nothing matched and `note` for an `S<N>` (Q505). `refs` is an array of
//                   `{ path, count }`, `refs-count` a number, every other value a string.
//   --count         the number of records, every match whatever `--limit` says, then the same notes;
//                   `{ kind, count, hidden-icebox }` in json, with `none` and `note` where they apply.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// **The dispatch goes HERE, before anything reads an argument** — `check-wiring.mjs`'s `G2` requires
// this shape verbatim, and `G1` points `CHECK_LOOKUP_SELFTEST` at a stub to prove it routes. The
// module's name is `check-lookup-selftest.mjs` because `G2` derives it that way from this file's name.
if (process.argv.includes('--self-test')) {
  const mod = process.env.CHECK_LOOKUP_SELFTEST ?? join(ROOT, 'scripts', 'check-lookup-selftest.mjs');
  const { selfTest } = await import(pathToFileURL(resolve(ROOT, mod)).href);
  process.exit(await selfTest(ROOT));
}

/**
 * **`LOOKUP_ROOT` points the lookup at another tree**, which is how the self-test reads its fixtures.
 * Nothing sets it in `package.json`, so the default — this repository — is what every user reads.
 */
const MEASURE_ROOT = process.env.LOOKUP_ROOT ? resolve(ROOT, process.env.LOOKUP_ROOT) : ROOT;

/** A broken reading: exit 2, with the reason on stderr. */
class Broken extends Error {}
const broken = (msg) => { throw new Broken(msg); };

// --- the three record kinds -----------------------------------------------------------------------

/** P28 decision 1's ten fields, in its order. */
const Q_FIELDS = Object.freeze(['id', 'title', 'status', 'cluster', 'owner', 'closes-when',
  'resolved-by', 'note', 'raised-by', 'shared']);
/** P28 decision 2's nine fields, in its order. */
const ADR_FIELDS = Object.freeze(['id', 'title', 'status', 'date', 'item', 'raised-by', 'supersedes',
  'amends', 'resolves']);
/** A glossary row's cells, and the table it sits in as `domain`. */
const TERM_FIELDS = Object.freeze(['term', 'domain', 'sense', 'defined-at']);

const KINDS = Object.freeze({
  q: { noun: 'question', fields: Q_FIELDS, derived: ['refs', 'refs-count', 'body'], list: ['id', 'status', 'title'] },
  adr: { noun: 'ADR', fields: ADR_FIELDS, derived: ['refs', 'refs-count', 'superseded-by', 'body'], list: ['id', 'status', 'title'] },
  term: { noun: 'term', fields: TERM_FIELDS, derived: ['refs', 'refs-count'], list: ['term', 'domain', 'sense'] },
  refs: { noun: 'citing file', fields: ['path', 'count'], derived: [], list: ['path', 'count'] },
});

/**
 * YAML 1.1 and 1.2 core-schema scalars a plain value would be TYPED as — `check-register.mjs`'s
 * `YAML_TYPED`, written out again because that module cannot be imported (the header). The
 * self-test's agreement case is what holds the two copies together.
 */
const YAML_TYPED = /^(?:~|null|Null|NULL|true|True|TRUE|false|False|FALSE|yes|Yes|YES|no|No|NO|on|On|ON|off|Off|OFF|y|Y|n|N|[-+]?(?:\d[\d_]*(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?|[-+]?0x[0-9a-fA-F_]+|[-+]?0o[0-7_]+|[-+]?0b[01_]+|[-+]?\d[\d_]*(?::[0-5]?\d)+(?:\.[\d_]*)?|[-+]?\.(?:inf|Inf|INF)|\.(?:nan|NaN|NAN)|\d{4}-\d\d-\d\d|\d{4}-\d\d?-\d\d?(?:[Tt]|[ \t]+)\d\d?:\d\d:\d\d(?:\.\d*)?(?:[ \t]*(?:Z|[-+]\d\d?(?::\d\d)?))?)$/;

/**
 * **The front matter, read as the subset `doc/questions/README.md` declares**: `key: value` per line,
 * a value either a plain word run or a double-quoted string with JSON's escapes. Anything else is an
 * error, never a guess. Returns `{ fields, order, raw, body }` or `{ error }`.
 */
export function readRecord(text) {
  if (!text.startsWith('---\n')) return { error: 'does not open with a `---` line' };
  let close = text.indexOf('\n---\n', 3);
  if (close < 0 && text.endsWith('\n---')) close = text.length - 4;
  if (close < 0) return { error: 'has no closing `---` line' };
  const raw = text.slice(4, close);
  const fields = {};
  const order = [];
  for (const line of raw.split('\n')) {
    const m = /^([a-z][a-z-]*): (.*)$/.exec(line);
    if (!m) return { error: `carries a line that is not \`key: value\`: ${JSON.stringify(line.slice(0, 60))}` };
    const [, key, v] = m;
    if (Object.hasOwn(fields, key)) return { error: `declares \`${key}\` twice` };
    let value;
    if (v.startsWith('"')) {
      try { value = JSON.parse(v); } catch { return { error: `\`${key}\`'s quoted value does not parse` }; }
      if (typeof value !== 'string') return { error: `\`${key}\`'s quoted value is not a string` };
    } else if (v === '' || v !== v.trim() || /^['[{|>&*!%@`#-]/.test(v) || / #|: |\t#|:$/.test(v) ||
      /^\?(?:[ \t]|$)/.test(v) || YAML_TYPED.test(v)) {
      return { error: `\`${key}\`'s plain value ${JSON.stringify(v)} is outside the subset — quote it` };
    } else {
      value = v;
    }
    fields[key] = value;
    order.push(key);
  }
  const after = close + 5 <= text.length ? text.slice(close + 5) : '';
  return { fields, order, raw, body: after };
}

/** `rel` from the measured root, with forward slashes, for every path this file prints. */
const relOf = (p) => relative(MEASURE_ROOT, p).replace(/\\/g, '/');

/** A folder of front-matter records: each file named by `name`, its id checked against the name. */
function readFolder(kind, dirRel, skip, name, idOf, fieldsOf) {
  const dir = join(MEASURE_ROOT, ...dirRel.split('/'));
  if (!existsSync(dir) || !statSync(dir).isDirectory()) broken(`${dirRel} does not exist, so there are no ${kind.noun}s to read`);
  const out = [];
  for (const n of readdirSync(dir).sort()) {
    if (skip.includes(n)) continue;
    const m = name.exec(n);
    if (!m) broken(`${dirRel}/${n} is not a ${kind.noun} file name — \`npm run check:register\` says why`);
    const got = readRecord(readFileSync(join(dir, n), 'utf8'));
    if (got.error) broken(`${dirRel}/${n} ${got.error}`);
    const want = idOf(m);
    if (got.fields.id !== want) broken(`${dirRel}/${n} declares id ${JSON.stringify(got.fields.id ?? '')}, not ${want}`);
    const missing = fieldsOf.filter((f) => !got.order.includes(f));
    const extra = got.order.filter((f) => !fieldsOf.includes(f));
    if (missing.length) broken(`${dirRel}/${n} lacks ${missing.join(', ')}`);
    if (extra.length) broken(`${dirRel}/${n} carries ${extra.join(', ')}, which no ${kind.noun} declares`);
    out.push({ ...got.fields, $path: `${dirRel}/${n}`, $raw: got.raw, $body: got.body, $n: Number(m[1]) });
  }
  if (out.length === 0) broken(`${dirRel} holds no ${kind.noun} file — a folder that reads to zero records is a broken reading, not an empty answer`);
  return out.sort((a, b) => a.$n - b.$n);
}

const readQuestions = () => readFolder(KINDS.q, 'doc/questions', ['README.md'],
  /^q([1-9][0-9]*)\.md$/, (m) => `Q${m[1]}`, Q_FIELDS);

function readAdrs() {
  const adrs = readFolder(KINDS.adr, 'doc/decisions', ['README.md', 'TEMPLATE.md'],
    /^(\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/, (m) => `ADR ${m[1]}`, ADR_FIELDS);
  // **`superseded-by` is DERIVED**, P28 decision 2: only the newer ADR declares the pair. Each entry
  // reads `ADR <newer>`, with the older ADR's qualifier in parentheses — `ADR 0025 (rule 5)` on 0003 —
  // and several are `; `-separated, the grammar `supersedes` itself uses.
  const by = new Map();
  for (const a of adrs) {
    if (a.supersedes === '') continue;
    for (const entry of a.supersedes.split('; ')) {
      const m = /^ADR (\d{4})(?: (.+))?$/.exec(entry);
      if (!m) broken(`${a.$path}'s supersedes entry ${JSON.stringify(entry)} is not \`ADR NNNN\` with an optional qualifier`);
      const list = by.get(`ADR ${m[1]}`) ?? [];
      list.push(`${a.id}${m[2] ? ` (${m[2]})` : ''}`);
      by.set(`ADR ${m[1]}`, list);
    }
  }
  for (const a of adrs) a['superseded-by'] = (by.get(a.id) ?? []).join('; ');
  return adrs;
}

/**
 * **The glossary's two tables, read to `doc/glossary.md`'s own `## Format` contract** — ADR 0080
 * decision 4: under exactly `## PRODUCT` and `## PROCESS`, the header exactly
 * `| term | sense, in one line | defined at |`, then `|---|---|---|`, then one row per term-sense.
 * A row that is not three cells is a broken reading. `## Not rows` is a LIST, and nothing reads it.
 */
function readTerms() {
  const path = join(MEASURE_ROOT, 'doc', 'glossary.md');
  if (!existsSync(path)) broken('doc/glossary.md does not exist, so there are no terms to read');
  const lines = readFileSync(path, 'utf8').split('\n');
  const out = [];
  for (const domain of ['PRODUCT', 'PROCESS']) {
    const at = lines.indexOf(`## ${domain}`);
    if (at < 0) broken(`doc/glossary.md has no \`## ${domain}\` heading`);
    let i = at + 1;
    while (i < lines.length && lines[i].trim() === '') i++;
    if (lines[i] !== '| term | sense, in one line | defined at |' || lines[i + 1] !== '|---|---|---|') {
      broken(`doc/glossary.md's \`## ${domain}\` is not followed by the header row its \`## Format\` declares`);
    }
    for (i += 2; i < lines.length && lines[i].startsWith('|'); i++) {
      const cells = splitRow(lines[i]);
      if (!cells || cells.length !== 3) broken(`doc/glossary.md line ${i + 1} is not a three-cell row`);
      const [term, sense, definedAt] = cells;
      if (term === '') broken(`doc/glossary.md line ${i + 1} has an empty term cell`);
      out.push({ term, domain, sense, 'defined-at': definedAt, $path: 'doc/glossary.md', $n: out.length });
    }
  }
  if (out.length === 0) broken('doc/glossary.md holds no term row');
  return out;
}

/**
 * A markdown table row's cells, split on pipes that no backslash escapes; `null` if not a row. **An
 * escaped `\|` reads as the `|` it renders as** — W119's adequacy reader: kept escaped, a term `a | b`
 * was findable only by typing `a \| b`.
 */
function splitRow(line) {
  if (!line.startsWith('|') || !line.endsWith('|')) return null;
  const cells = [];
  let cur = '';
  for (let k = 1; k < line.length - 1; k++) {
    if (line[k] === '\\' && line[k + 1] === '|') { cur += '|'; k++; continue; }
    if (line[k] === '|') { cells.push(cur.trim()); cur = ''; continue; }
    cur += line[k];
  }
  cells.push(cur.trim());
  return cells;
}

// --- refs: which files cite an id ----------------------------------------------------------------

/**
 * **The walk `refs` reads**: every file under the measured root but the directories that hold a
 * SECOND copy of the answer or none — `dev-dist/`, whose whole-tree copies are a weeks-old second
 * answer; `.claude/`, whose `worktrees/` holds the same kind of copy (W119's conformity reader);
 * `node_modules/` and `.git/`; and the other directories `.gitignore` names — build output, test
 * reports, `.vscode/`. A file with a NUL byte is binary and is not read.
 */
const skippedDir = (name) => name === '.git' || name === 'node_modules' || name === 'dev-dist' || name === '.claude' || name === 'dist' || name === 'test-results' || name === 'playwright-report' || name === '.vscode';

let corpus = null;
function readCorpus() {
  if (corpus) return corpus;
  corpus = [];
  const walk = (d) => {
    for (const name of readdirSync(d).sort()) {
      const p = join(d, name);
      const st = statSync(p);
      if (st.isDirectory()) { if (!skippedDir(name)) walk(p); continue; }
      const buf = readFileSync(p);
      if (buf.includes(0)) continue;
      corpus.push({ path: relOf(p), lines: buf.toString('utf8').split('\n') });
    }
  };
  walk(MEASURE_ROOT);
  return corpus;
}

/**
 * **What counts as citing an ADR**: `ADR 0007` and `ADR-0007` in either case, the list forms `ADRs 0003
 * and 0004` / `ADRs 0003, 0004 and 0005` / `ADRs 0003/0004` — `check-register.mjs`'s `ADR_REF`,
 * written out again for the reason in the header — and the ADR's own FILE NAME, which is what every
 * link into it carries whatever its text says. **A bare `0007` is not a citation**: four digits alone
 * are a year, a count or a port as often as an id, and nothing could tell them apart.
 */
const ADR_REF = /\bADRs?[\s-]+(\d{4}(?:(?:\s*,\s*(?:and\s+|or\s+)?|\s+and\s+|\s+or\s+|\s*\/\s*)\d{4})*)\b/gi;
/**
 * **A Q, W, P or S id is a whole TOKEN**: not preceded by a letter, digit or underscore, and not
 * followed by a digit — so `Q17` does not match inside `Q170` or `RQ17`, and does match in `Q17,`,
 * `[Q17]` and `Q17-Q19` (whose `Q18` is not expanded: a range is not a citation of its middle).
 * Upper case only: `q17.md` is a file name, and the link carrying it carries `Q17` as its text.
 */
const ID_TOKEN = /(?<![A-Za-z0-9_])([QWPS])([1-9][0-9]*)(?![0-9])/g;

let idIndex = null;
/** id -> Map(path -> citing-line count), built in one pass over the corpus. */
function citations() {
  if (idIndex) return idIndex;
  idIndex = new Map();
  const adrFiles = new Map();
  const dec = join(MEASURE_ROOT, 'doc', 'decisions');
  if (existsSync(dec)) {
    for (const n of readdirSync(dec)) {
      const m = /^(\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.exec(n);
      if (m) adrFiles.set(n, `ADR ${m[1]}`);
    }
  }
  const add = (id, path) => {
    const per = idIndex.get(id) ?? new Map();
    per.set(path, (per.get(path) ?? 0) + 1);
    idIndex.set(id, per);
  };
  for (const { path, lines } of readCorpus()) {
    for (const line of lines) {
      const ids = new Set();
      for (const m of line.matchAll(ID_TOKEN)) ids.add(`${m[1]}${m[2]}`);
      for (const m of line.matchAll(ADR_REF)) for (const [d] of m[1].matchAll(/\d{4}/g)) ids.add(`ADR ${d}`);
      for (const m of line.matchAll(/(\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*\.md/g)) {
        const id = adrFiles.get(m[0]);
        if (id) ids.add(id);
      }
      for (const id of ids) add(id, path);
    }
  }
  return idIndex;
}

/** The file that IS the record, which cites itself and is never one of its refs. */
function ownFile(id) {
  let m;
  if ((m = /^Q(\d+)$/.exec(id))) return `doc/questions/q${m[1]}.md`;
  const findIn = (dirRel, re) => {
    const dir = join(MEASURE_ROOT, ...dirRel.split('/'));
    if (!existsSync(dir)) return null;
    const n = readdirSync(dir).find((f) => re.test(f));
    return n ? `${dirRel}/${n}` : null;
  };
  if ((m = /^ADR (\d{4})$/.exec(id))) return findIn('doc/decisions', new RegExp(`^${m[1]}-.*\\.md$`));
  if ((m = /^W(\d+)$/.exec(id))) return findIn('doc/work-items', new RegExp(`^w${m[1]}-.*\\.md$`));
  if ((m = /^P(\d+)$/.exec(id))) return findIn('doc/plans', new RegExp(`^p${m[1]}-.*\\.md$`));
  return null;
}

function refsOfId(id) {
  const own = ownFile(id);
  const per = citations().get(id) ?? new Map();
  return [...per].filter(([p]) => p !== own).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([path, count]) => ({ path, count }));
}

/**
 * **A term's refs are the lines carrying it as a whole word, in either case** — the predicate P28 and
 * W120 measured the *gate* collision with (`git grep -oiw`), so `npm run term -- gate --fields
 * refs-count` and those figures count the same thing. The glossary itself is the record, not a ref.
 */
function refsOfTerm(term) {
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?<![A-Za-z0-9_])${esc}(?![A-Za-z0-9_])`, 'i');
  const out = [];
  for (const { path, lines } of readCorpus()) {
    if (path === 'doc/glossary.md') continue;
    const n = lines.filter((l) => re.test(l)).length;
    if (n) out.push({ path, count: n });
  }
  return out;
}

// --- arguments ------------------------------------------------------------------------------------

function parseArgs(kindName, argv) {
  const o = { ids: [], wheres: [], search: null, fields: null, format: 'line', count: false, limit: null,
    includeIcebox: false, table: false, index: false };
  const value = (i, flag) => {
    if (i >= argv.length || argv[i].startsWith('--')) broken(`${flag} needs a value`);
    return argv[i];
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const eq = a.startsWith('--') ? a.indexOf('=') : -1;
    const flag = eq > 0 ? a.slice(0, eq) : a;
    const inline = eq > 0 ? a.slice(eq + 1) : null;
    const take = () => (inline !== null ? inline : value(++i, flag));
    if (flag === '--where') {
      const w = take();
      const m = /^([a-z][a-z-]*)([=~])(.*)$/s.exec(w);
      if (!m) broken(`--where ${JSON.stringify(w)} is not FIELD=VALUE or FIELD~TEXT`);
      o.wheres.push({ field: m[1], op: m[2], value: m[3] });
    } else if (flag === '--search') o.search = take();
    else if (flag === '--fields') o.fields = take().split(',').map((f) => f.trim());
    else if (flag === '--format') {
      o.format = take();
      if (o.format !== 'line' && o.format !== 'json') broken(`--format is line or json, not ${JSON.stringify(o.format)}`);
    } else if (flag === '--limit') {
      const v = take();
      if (!/^[1-9][0-9]*$/.test(v)) broken(`--limit takes a positive integer, not ${JSON.stringify(v)}`);
      o.limit = Number(v);
    } else if (flag === '--count' && inline === null) o.count = true;
    else if (flag === '--include-icebox' && inline === null && kindName === 'q') o.includeIcebox = true;
    else if (flag === '--table' && inline === null && kindName === 'q') o.table = true;
    else if (flag === '--index' && inline === null && kindName === 'adr') o.index = true;
    else if (a.startsWith('--')) broken(`\`${kindName}\` does not take ${a}`);
    else o.ids.push(a);
  }
  return o;
}

/** A positional argument as the id it names, or a 2. */
function normaliseIds(kindName, raw) {
  if (kindName === 'term') return raw.length ? [raw.join(' ')] : [];
  if (kindName === 'refs') {
    const s = raw.join(' ');
    if (!s) broken('`refs` takes one id — Q<N>, W<N>, P<N>, S<N> or an ADR number');
    let m;
    if ((m = /^([QWPS])([1-9][0-9]*)$/i.exec(s))) return [`${m[1].toUpperCase()}${m[2]}`];
    if ((m = /^(?:ADR[ -]?)?(\d{1,4})$/i.exec(s)) && Number(m[1]) > 0) return [`ADR ${m[1].padStart(4, '0')}`];
    broken(`\`refs\` cannot read ${JSON.stringify(s)} as an id — Q<N>, W<N>, P<N>, S<N>, or ADR NNNN`);
  }
  // **`ADR 0007` arrives as two arguments through `npm run adr -- ADR 0007`**, so an `ADR` word joins the
  // number after it rather than being read as an id of its own.
  const joined = [];
  for (let i = 0; i < raw.length; i++) {
    if (/^ADR$/i.test(raw[i]) && i + 1 < raw.length) { joined.push(`${raw[i]} ${raw[i + 1]}`); i++; } else joined.push(raw[i]);
  }
  return joined.map((s) => {
    let m;
    if (kindName === 'q' && (m = /^Q?([1-9][0-9]*)$/i.exec(s))) return `Q${m[1]}`;
    if (kindName === 'adr' && (m = /^(?:ADR[ -]?)?(\d{1,4})$/i.exec(s)) && Number(m[1]) > 0) return `ADR ${m[1].padStart(4, '0')}`;
    return broken(`\`${kindName}\` cannot read ${JSON.stringify(s)} as an id`);
  });
}

// --- output ---------------------------------------------------------------------------------------

const esc = (v) => String(v).replace(/\\/g, '\\\\').replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\r/g, '\\r');

function render(kindName, rec, field, asJson) {
  if (field === 'refs' || field === 'refs-count') {
    const refs = rec.$refs ?? (rec.$refs = kindName === 'term' ? refsOfTerm(rec.term) : refsOfId(rec.id));
    if (field === 'refs-count') return asJson ? refs.length : String(refs.length);
    return asJson ? refs : refs.map((r) => `${r.path}:${r.count}`).join(',');
  }
  if (field === 'body') return rec.$body;
  if (field === 'count' && kindName === 'refs') return asJson ? rec.count : String(rec.count);
  return rec[field];
}

function describe(o) {
  const parts = [];
  if (o.ids.length) parts.push(o.ids.join(' '));
  for (const w of o.wheres) parts.push(`--where ${w.field}${w.op}${w.value}`);
  if (o.search !== null) parts.push(`--search ${JSON.stringify(o.search)}`);
  return parts.join(' ') || 'the whole kind';
}

// --- the two generated documents ------------------------------------------------------------------

/**
 * **`--table`: the register as `aa43cb3` carried it, ROWS only** — W119 Outputs (3), and it claims no
 * more than ADR 0079 consequence 2 allows: a live row's status cell is the status word and its note
 * re-joined, and a note opening `**` re-opens the bold span before the word. That inverse is exact on
 * the `aa43cb3` corpus and on nothing written after it. What the files do not carry is not
 * reproduced: a row's POSITION in its table (rows print by id), the cluster descriptions, and the
 * prose between the tables.
 */
function registerTable(qs) {
  const readme = join(MEASURE_ROOT, 'doc', 'questions', 'README.md');
  const clusters = [];
  if (existsSync(readme)) {
    const lines = readFileSync(readme, 'utf8').split('\n');
    let i = lines.indexOf('## Clusters');
    if (i >= 0) {
      while (++i < lines.length && !lines[i].startsWith('## ')) {
        const c = splitRow(lines[i]);
        if (c && c[0] !== 'cluster' && !/^-+$/.test(c[0])) clusters.push(c[0]);
      }
    }
  }
  for (const q of qs) if (!clusters.includes(q.cluster)) clusters.push(q.cluster);
  const statusCell = (q) => (q.note === '' ? q.status : q.note.startsWith('**') ? `**${q.status} ${q.note.slice(2)}` : `${q.status} ${q.note}`);
  const out = ['## Live', ''];
  for (const c of clusters) {
    const rows = qs.filter((q) => q.cluster === c && q.status !== 'resolved');
    if (!rows.length) continue;
    out.push(`### ${c}`, '', '| Q | Question or finding | Status | Owner | Closes when |', '|---|---|---|---|---|');
    for (const q of rows) out.push(`| ${q.id} | ${q.title} | ${statusCell(q)} | ${q.owner} | ${q['closes-when']} |`);
    out.push('');
  }
  out.push('## Resolved', '', '| Q | Cluster | Question | What resolved it |', '|---|---|---|---|');
  for (const q of qs.filter((x) => x.status === 'resolved')) out.push(`| ${q.id} | ${q.cluster} | ${q.title} | ${q['resolved-by']} |`);
  return out.join('\n');
}

/**
 * **`--index`: the four columns `doc/decisions/README.md`'s hand-kept index had, from front matter
 * alone** — W119 Outputs (3). `Decision` is the title, then ` — supersedes …`, ` — amends …` and the
 * DERIVED ` — superseded by …` where there are any; `Raised by` is `raised-by`, then ` / ` and `item`
 * unless `raised-by` already names it (ADR 0004 is raised by W1 and taken by W1); the link is relative
 * to `doc/decisions/`, where the index stood.
 */
function adrIndex(adrs) {
  const out = ['| # | Decision | Raised by | Date |', '|---|---|---|---|'];
  for (const a of adrs) {
    const n = a.id.slice(4);
    const file = a.$path.slice('doc/decisions/'.length);
    let decision = a.title;
    if (a.supersedes) decision += ` — supersedes ${a.supersedes}`;
    if (a.amends) decision += ` — amends ${a.amends}`;
    if (a['superseded-by']) decision += ` — superseded by ${a['superseded-by']}`;
    const named = a['raised-by'] === '' ? [] : a['raised-by'].split(', ');
    const raised = [a['raised-by'], named.includes(a.item) ? '' : a.item].filter((x) => x !== '').join(' / ');
    out.push(`| [${n}](${file}) | ${decision} | ${raised} | ${a.date} |`);
  }
  return out.join('\n');
}

// --- main -----------------------------------------------------------------------------------------

function main(argv) {
  const kindName = argv[0];
  const kind = KINDS[kindName];
  if (!kind) broken(`the first argument is the kind — q, adr, term or refs — not ${JSON.stringify(kindName ?? '')}`);
  const o = parseArgs(kindName, argv.slice(1));
  const ids = normaliseIds(kindName, o.ids);

  // **Every field name is checked BEFORE anything is read**, so a misspelt field is a 2 even over an
  // empty folder — the founding defect is a wrong field answered as though it were a right one.
  for (const w of o.wheres) {
    if (kind.derived.includes(w.field)) broken(`--where reads front matter, and \`${w.field}\` is derived — a ${kind.noun} has ${kind.fields.join(', ')}`);
    if (!kind.fields.includes(w.field)) broken(`--where names \`${w.field}\`, which no ${kind.noun} has — a ${kind.noun} has ${kind.fields.join(', ')}`);
  }
  if (o.fields) {
    for (const f of o.fields) {
      if (!kind.fields.includes(f) && !kind.derived.includes(f)) {
        broken(`--fields names \`${f}\`, which no ${kind.noun} has — a ${kind.noun} has ${[...kind.fields, ...kind.derived].join(', ')}`);
      }
    }
  }
  // **`refs` takes `--fields`, `--limit`, `--format` and `--count`, and no filter** — W119 Outputs (1).
  // Both readers found `--where count=1` silently matching nothing (a number against a string) and
  // `--where count~1` crashing at exit 1, which is a broken reading reported as an empty one.
  if (kindName === 'refs' && (o.wheres.length || o.search !== null)) {
    broken('`refs` takes no --where or --search: it prints every file citing one id — narrow it with --limit');
  }
  if ((o.table || o.index) && (ids.length || o.wheres.length || o.search !== null || o.fields || o.count || o.limit || o.includeIcebox || o.format !== 'line')) {
    broken(`${o.table ? '--table' : '--index'} prints the whole ${kindName === 'q' ? 'register' : 'index'} as markdown and takes no other option`);
  }

  let all;
  if (kindName === 'refs') {
    all = refsOfId(ids[0]).map((r) => ({ ...r, id: ids[0] }));
  } else {
    all = kindName === 'q' ? readQuestions() : kindName === 'adr' ? readAdrs() : readTerms();
  }
  if (o.table) { console.log(registerTable(all)); return 0; }
  if (o.index) { console.log(adrIndex(all)); return 0; }

  // Selection. By id first; then every --where, ANDed; then --search over every front matter field.
  let matched = all;
  const notFound = [];
  if (ids.length && kindName !== 'refs') {
    const key = kindName === 'term' ? (r) => r.term.toLowerCase() : (r) => r.id;
    const want = ids.map((i) => (kindName === 'term' ? i.toLowerCase() : i));
    for (const w of want) if (!all.some((r) => key(r) === w)) notFound.push(w);
    matched = all.filter((r) => want.includes(key(r)));
  }
  for (const w of o.wheres) {
    matched = matched.filter((r) => (w.op === '=' ? r[w.field] === w.value : r[w.field].toLowerCase().includes(w.value.toLowerCase())));
  }
  if (o.search !== null) {
    const s = o.search.toLowerCase();
    matched = matched.filter((r) => kind.fields.some((f) => String(r[f]).toLowerCase().includes(s)));
  }
  // **`icebox` is hidden from every list and search, never from a lookup by id** — P28 decision 5.
  let hidden = 0;
  const seeking = o.includeIcebox || o.wheres.some((w) => w.field === 'status' && w.op === '=' && w.value === 'icebox');
  if (kindName === 'q' && !ids.length && !seeking) {
    hidden = matched.filter((r) => r.status === 'icebox').length;
    matched = matched.filter((r) => r.status !== 'icebox');
  }

  const asJson = o.format === 'json';
  const hiddenNote = hidden ? `# ${hidden} icebox question(s) also matched and are hidden — add --include-icebox to see them` : null;
  // **An `S<N>` is TWO namespaces, and a token cannot tell them apart** — Q505, resolved by the
  // maintainer at W119 with the ceiling accepted: doc/scheduler-upstream.md's wants and
  // `check-source.mjs`'s clause ids are both `S<N>`, so `refs S9` counts both. The answer is
  // printed anyway, and never without saying so.
  const sharedNote = kindName === 'refs' && /^S\d+$/.test(ids[0])
    ? `# S ids are shared with check-source's clause ids (S1-S16); this count includes both — Q505`
    : null;
  // **A term is matched WHOLE, case-insensitively**: `term gate` is the three `gate` rows and `term
  // floor` is nothing — `vacuity floor` is a different term, and a lookup that answered `floor` with it
  // would be ranking. The line says where the substring form is.
  const none = matched.length === 0
    ? (notFound.length && notFound.length === ids.length && !o.wheres.length && o.search === null
      ? `no ${kind.noun} ${notFound.join(' ')}` +
        (kindName === 'term' ? ` — a term is matched whole; --where term~${notFound[0]} matches inside one` : '')
      : `no ${kind.noun} matches ${describe({ ...o, ids })}`)
    : null;

  // **`--count` names what found nothing too** — both readers: a bare `0` at exit 1 said no filter.
  // It counts every match, whatever `--limit` says; `--limit` bounds what is PRINTED.
  if (o.count) {
    if (asJson) {
      const doc = { kind: kindName, count: matched.length, 'hidden-icebox': hidden };
      if (none) doc.none = none;
      if (sharedNote) doc.note = sharedNote.slice(2);
      console.log(JSON.stringify(doc));
    } else {
      console.log(String(matched.length));
      if (none) console.log(`# ${none}`);
      if (hiddenNote) console.log(hiddenNote);
      if (sharedNote) console.log(sharedNote);
    }
    return matched.length ? 0 : 1;
  }

  const total = matched.length;
  const shown = o.limit ? matched.slice(0, o.limit) : matched;
  const cut = total - shown.length;
  const byIdDefault = ids.length && !o.fields && kindName !== 'refs';
  const fields = o.fields ?? (byIdDefault ? kind.fields : kind.list);

  if (asJson) {
    const doc = { kind: kindName, count: total, 'hidden-icebox': hidden };
    if (none) doc.none = none;
    if (notFound.length && !none) doc['not-found'] = notFound;
    if (cut) doc['not-shown'] = cut;
    if (sharedNote) doc.note = sharedNote.slice(2);
    doc.records = shown.map((r) => Object.fromEntries(fields.map((f) => [f, render(kindName, r, f, true)])));
    console.log(JSON.stringify(doc, null, 2));
    return total ? 0 : 1;
  }

  const lines = [];
  if (byIdDefault) {
    shown.forEach((r, i) => {
      if (i) lines.push('');
      if (kindName === 'term') for (const f of TERM_FIELDS) lines.push(`${f}: ${r[f]}`);
      else lines.push(r.$raw);
    });
  } else {
    for (const r of shown) lines.push(fields.map((f) => esc(render(kindName, r, f, false))).join('\t'));
  }
  if (none) lines.push(`# ${none}`);
  else if (notFound.length) lines.push(`# not found: ${notFound.join(' ')}`);
  if (cut) lines.push(`# ${cut} more not shown — raise --limit`);
  if (hiddenNote) lines.push(hiddenNote);
  if (sharedNote) lines.push(sharedNote);
  if (lines.length) console.log(lines.join('\n'));
  return total ? 0 : 1;
}

// **Only when run, never when imported** — the self-test imports `readRecord` to compare it with
// `check-register`'s, and an import that ran a lookup would print one into its output.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (e) {
    if (!(e instanceof Broken)) throw e;
    console.error(`lookup: ${e.message}`);
    process.exitCode = 2;
  }
}
