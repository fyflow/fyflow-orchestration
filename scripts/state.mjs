#!/usr/bin/env node
// **The repository's state, DERIVED. It cannot go stale, because there is no copy to go
// stale** — [P27](../doc/plans/p27-what-a-register-row-is.md) decision 5, shipped by
// [W114](../doc/work-items/w114-claude-md-is-guidance-and-npm-run-state-is-the-index.md).
//
//   node scripts/state.mjs            npm run state
//
// **What it replaces.** `CLAUDE.md` carried a `## Current state` block of **532,021 bytes
// — 93.2% of that file** — whose own opening sentence read *derived by grep off the tree at
// W98's record step, never from this sentence*, and which said on FIFTY separate lines
// *read every status from the item's own file, never from this line.* This script makes
// that true rather than aspirational. `doc/workflow.md` section 1 rule 5 has said since
// v0.9 that a status is read from the item's own file and never from an index; this reads
// the item files.
//
// **Every figure below is read from the ONE file that declares it**, so nothing here is a
// second source that can disagree with a check. Where a count's only home is a check's
// output — the L1-L5 case count, `check:spec`'s triple, the always-read set's bytes — it is
// ABSENT rather than copied, which is P27 decision 4's limit: a count becomes a check's
// output, a derivation, or nothing, never a sentence saying *run this to find out*.
//
// **It is NOT a gate entry, and it asserts its own derivations instead** — W114's
// stop-and-ask (b), answered by the maintainer. A derivation with no verdict in the chain
// would print twenty-five lines nobody reads, and `S11` cannot see this script anyway
// because its name does not begin with `check:`. The failure mode that matters is not a
// stale copy but a stale PARSE: **a pattern that silently matches nothing reports an empty
// index exactly as confidently as a full one.** So `ASSERTIONS` below refuses every empty
// reading and exits 1, which makes a person's own run the control.
//
// **Its first run found five defects in itself and one of them is why `const` is in the
// pattern below**: `DECLARED_TOTAL\s*=\s*(\d+)` read **2174** off a COMMENT at
// `examples/l6.ts:11082` — *`git show` at W98's commit gives `DECLARED_TOTAL = 2174`* —
// where the declaration twenty lines down is 2435. A derivation that takes the FIRST match
// of a name occurring eighteen times reads whichever one history left highest in the file,
// and the floor could not see it because 2174 is a plausible number.
//
// Exits 0 when every derivation is non-empty, 1 otherwise.

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// `STATE_ROOT` points the derivation at a copy of the tree, which is what lets a
// provocation break a pattern without touching the real one.
const TREE = process.env.STATE_ROOT ? resolve(ROOT, process.env.STATE_ROOT) : ROOT;

const read = (p) => readFileSync(join(TREE, p), 'utf8');
const idOf = (f) => parseInt(f.match(/\d+/)[0], 10);
const listing = (dir, re) => {
  try { return readdirSync(join(TREE, dir)).filter((f) => re.test(f)).sort((a, b) => idOf(a) - idOf(b)); }
  catch { return []; }
};

const PLAN_DIR = 'doc/plans';
const ITEM_DIR = 'doc/work-items';
const planFiles = listing(PLAN_DIR, /^p\d+-.*\.md$/);
const itemFiles = listing(ITEM_DIR, /^w\d+-.*\.md$/);
const adrFiles = listing('doc/decisions', /^\d{4}-.*\.md$/);

/**
 * **Emphasis is stripped EVERYWHERE and not only at the ends, which the first cut got
 * wrong.** `**in progress** — declared 2026-09-29` with the ends trimmed is
 * `in progress** — declared …`, and taking the text before the first dash then yields
 * `in progress**`, which is in no vocabulary. Twenty-eight of ninety-five item files read
 * that way.
 */
const plain = (s) => s.replace(/[*_`]/g, '').trim();
/** The status is the text before the first DASH separator; everything after it is prose. */
const leading = (v) => plain(v).split(/\s+[—–-]\s+/)[0].trim().toLowerCase();
const statusLine = (t) => { const m = t.match(/^\*\*Status:\*\*[ \t]*(.+)$/m); return m ? plain(m[1]) : null; };
/**
 * **The declared word is matched as a word-boundary PREFIX, and that choice is worth 9
 * files.** Nine item files read `**DONE** 2026-09-26 — see the Record`: the separator is
 * there and the DATE sits between the word and it, so an exact match on the text before
 * the separator yields `done 2026-09-26` and fails. The alternatives were to rewrite nine
 * items' prose to suit a parser or to anchor the vocabulary at the start, and the second is
 * one expression in one file. **Its cost is stated rather than hidden**: `done-ish` would
 * read as `done`, because `\b` sits between a letter and a hyphen. A five-word vocabulary
 * anchored at position zero is tight enough for that to be a worse lie than it is a risk.
 */
const declares = (status, vocab) => status !== null
  && new RegExp(`^(?:${vocab.join('|')})\\b`).test(status);

// --- each plan's state and question, from ITS OWN file ------------------------
/**
 * **TWO declared spellings, and reading one of them is how the prototype mis-measured
 * this.** `doc/plans/TEMPLATE.md` declares `**Question this plan answers:**` and sixteen
 * plans use it; six of the recent ones use a fenced `Question:` line. P27 decision 5
 * recorded *"P25's did not parse"*, which is this list having had one entry: P25 uses the
 * template's. Both are legitimate — two spellings of one fact in two files is one fact
 * spelled twice, not two copies of it — so the list is declared and the parse takes
 * whichever exists.
 */
const QUESTION_FORMS = [
  /^Question:[ \t]*(.+)$/m,
  /^\*\*Question this plan answers:\*\*[ \t]*(.+)$/m,
];
/**
 * **The H1 TITLE is the third source, and taking it is what keeps five plan files
 * unedited.** P27 decision 5 calls a uniform question line a precondition; measured, 22 of
 * 27 plans declare one and the five that do not state their subject in their title — three
 * of the five interrogatively. **P18's file states no question sentence ANYWHERE**, so
 * writing one into it would be the author's question rather than the plan's, which is the
 * one thing W107's method forbids. The title is already in the file and already identifies
 * the plan, so it is read and MARKED as a title rather than replaced by an invention.
 */
const titleOf = (t) => {
  const m = t.match(/^#[ \t]+P\d+[ \t]*[—–-][ \t]*(.+)$/m);
  return m ? plain(m[1]) : null;
};
/**
 * **A plan's status is REPORTED rather than held to a vocabulary, and that is a scope call
 * stated rather than drifted into.** P27 decision 5 names two preconditions — a uniform
 * item `**Status:**` line and a uniform plan question line — and not a third. Measured at
 * W114's declaration: 25 of 27 plans carry the line, 16 of those 25 parse to one of
 * `planning | declared | in progress | complete | complete and retro'd`, and the nine that
 * do not are separated by a comma, a period or nothing rather than by a dash (one of them
 * with a CURLY apostrophe). Normalising them is nobody's item, so this derives the plan's
 * state from the file's own STRUCTURE where the line is missing and prints the line's own
 * leading text where it is there.
 */
const plans = planFiles.map((f) => {
  const t = read(`${PLAN_DIR}/${f}`);
  let q = null;
  for (const re of QUESTION_FORMS) {
    const m = t.match(re);
    if (m && m[1].trim().length > 3) { q = plain(m[1]); break; }
  }
  const fromTitle = q === null;
  if (fromTitle) q = titleOf(t);
  const raw = statusLine(t);
  const hasRetro = /^#+ *Retro/mi.test(t);
  const structural = hasRetro ? "complete and retro'd"
    : /^#+ *Record/mi.test(t) ? 'has a Record'
      : 'declared';
  // **A plan's Status LINE is a copy, and the first cut preferred the stale copy over the
  // answer it had already computed.** BOTH READERS found this, from opposite ends: the
  // conformity reader derived P25's state from its own file and got `COMPLETE 2026-09-30`
  // against a line reading `DECLARED`; the adequacy reader inverted the preference and
  // watched the right answer appear. *The structural reading was computed and discarded.*
  //
  // So the two are COMPARED, which is what this script already does for the id ledger and
  // what it claimed about itself in `CLAUDE.md`: *it cannot go stale, because there is no
  // copy to go stale.* That sentence is false of a line, and true of a comparison. A plan
  // carrying a `## Retro` whose status does not say `complete` is the unambiguous case and
  // is the one asserted; P25 was its only live instance and is corrected.
  const disagrees = raw !== null && hasRetro && !/^complete/.test(leading(raw));
  return {
    id: 'P' + idOf(f), file: f, question: q, fromTitle, structural, disagrees,
    status: raw ? leading(raw) : structural + ' (derived)', declared: raw !== null,
  };
});

// --- each item's status, from ITS OWN file ------------------------------------
/**
 * **The declared vocabulary is `doc/work-items/TEMPLATE.md`'s, and `reserved` is the FIFTH
 * word.** It is not decoration: four items were reserved and never issued, which
 * `doc/workflow.md` section 3 calls *skipped, never reissued*, and none of the template's
 * other four is true of them.
 */
const STATUSES = ['todo', 'in progress', 'in review', 'done', 'reserved'];
const items = itemFiles.map((f) => {
  const raw = statusLine(read(`${ITEM_DIR}/${f}`));
  return { id: 'W' + idOf(f), file: f, raw, status: raw === null ? null : leading(raw) };
});

// --- the id ledger, which `max + 1` is wrong about exactly when a plan closed one ---
/**
 * **A derivation naive about a convention is a copy with extra steps.** P27 decision 5's
 * prototype offered `w111` as the next work item and W111 was CLOSED UNISSUED at P26's
 * retro, so the answer was `w112`. An id is never reused (`doc/workflow.md` section 3), so
 * the next free one is the highest on disk plus one UNLESS a retro has already spent the
 * ids above it — and that fact lives only in the plans' own prose.
 *
 * **Both derivations are printed and a disagreement is reported rather than resolved.** The
 * ledger is English read by a pattern; the maximum is a directory listing. Where they
 * differ the reason is in a plan's Retro, and a reader is better served seeing both than by
 * this script picking one. **The ledger's answer is the sentence with the HIGHEST id, not
 * the last one in file order** — the first cut concatenated the plans and then the items and
 * reported W103 on a tree whose answer is W115, because an item file's older sentence came
 * last.
 */
const LEDGER = {
  // **The phrasings are a LIST and the convention is wider than any one of them** — the
  // adequacy reader found W52 missing because its phrase WRAPS across a newline between
  // `as` and `reserved`, and W26/W27 missing because two plans write *skipped and never
  // reissued* instead. `\s+` rather than a space, and both verbs. **The limit is stated
  // rather than closed**: the next plan to invent a sixth spelling is invisible here, which
  // is the defect P27 decision 5 named in its own prototype.
  itemSpent: /\bW(\d+)(?:\s+and\s+W(\d+))?\s+(?:(?:is|are|stay|stays)\s+)?(?:therefore\s+)?(?:CLOSED|skipped)\s+(?:unissued|as\s+reserved|and\s+(?:are\s+)?never\s+reissued)/gi,
  qSpent: /\bQ(\d+)(?:\s*-\s*Q(\d+))?\s+(?:reserved and UNUSED and therefore\s+)?SPENT\b/gi,
  adrSkipped: /\bADR\s+0*(\d{1,4})(?:\s*-\s*0*(\d{1,4}))?\s+(?:is\s+)?SKIPPED\b/gi,
  nextPlan: /next plan starts at\s+W(\d+),?\s+Q(\d+)\s+and\s+ADR\s+0*(\d{1,4})/gi,
};
/**
 * **The ledger is matched against the text with its EMPHASIS STRIPPED**, because the fact
 * is not where the bold is. P26's own sentence is *The next plan starts at `**`W112,\nQ459`**`
 * and `**`ADR 0076`**`.* — the id is split from its neighbour by a line break AND by two
 * asterisks mid-phrase — and a pattern written around the markers read **W103** off P25's
 * retro instead, which is the last one whose bold happened to sit outside the ids. *A
 * pattern that tolerates one author's emphasis is a pattern about that author.*
 */
const ledgerText = [...planFiles.map((f) => read(`${PLAN_DIR}/${f}`)),
  ...itemFiles.map((f) => read(`${ITEM_DIR}/${f}`))].join('\n')
  .replace(/[*_`]/g, '');

const spent = (re) => {
  const out = new Set();
  for (const m of ledgerText.matchAll(re)) {
    const a = parseInt(m[1], 10);
    const b = m[2] ? parseInt(m[2], 10) : a;
    for (let n = a; n <= b; n++) out.add(n);
  }
  return out;
};
const spentItems = spent(LEDGER.itemSpent);
const spentQs = spent(LEDGER.qSpent);
const skippedAdrs = spent(LEDGER.adrSkipped);

// --- the register, ONE FILE PER QUESTION ----------------------------------------
/**
 * **The register is `doc/questions/q<N>.md` since
 * [W116](../doc/work-items/w116-a-question-is-a-file.md)**, and this read the old table's rows by
 * CELL COUNT until then. Now a question is live exactly when its `status` is not `resolved`, and
 * `icebox` is the fourth word — counted on its own line, because the lookup hides it and a count
 * that folded it into `open` would hide it here too.
 *
 * **Its own reader, not `check-register.mjs`'s**: the one field these counts need is `status:`,
 * read off the front matter's own line. A derivation that imported the check's parser would be one
 * observer of the folder rather than two — obligation (c)'s LIMIT.
 */
const QUESTION_DIR = 'doc/questions';
// **A file that cannot be read is a REFUSAL with its name, not a stack trace** — W116's adequacy
// reader put a DIRECTORY named `q9002.md` in the folder and this died of `EISDIR`.
const unreadableQs = [];
const questions = listing(QUESTION_DIR, /^q\d+\.md$/).map((f) => {
  let text = '';
  try { text = read(`${QUESTION_DIR}/${f}`); } catch { unreadableQs.push(f); }
  const fm = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(text);
  const m = fm ? /^status: *"?([a-z]+)"? *$/m.exec(fm[1]) : null;
  return { id: idOf(f), status: m ? m[1] : null };
});
/**
 * **A SECOND ROUTE to the folder, sharing nothing with the first** — its own `readdirSync`, its own
 * name test, no `listing()`. W116's adequacy reader narrowed `listing`'s pattern to `/^q(?!49)\d+/`
 * and this script printed *next free Q490* at EXIT 0 — an id already issued — because the old
 * second route (`idsSane`) read the SAME `qIds` the first route had already narrowed: one observer
 * counted twice, obligation (c)'s LIMIT. Every entry but the README is a question or a defect, so
 * the count must agree, and the highest number on disk must sit below the next free id.
 */
let rawQuestionNames = [];
try { rawQuestionNames = readdirSync(join(TREE, QUESTION_DIR)).filter((n) => n !== 'README.md'); }
catch { rawQuestionNames = []; }
const rawMaxQ = rawQuestionNames.reduce((a, n) => {
  const m = /(\d+)/.exec(n);
  return m ? Math.max(a, Number(m[1])) : a;
}, 0);
const byStatus = (s) => questions.filter((q) => q.status === s).length;
const resolvedCount = byStatus('resolved');
const liveCount = questions.length - resolvedCount;
const qIds = questions.map((q) => q.id);
const openRows = byStatus('open');
const deferredRows = byStatus('deferred');
const iceboxRows = byStatus('icebox');

const maxOf = (xs) => (xs.length ? Math.max(...xs) : 0);
const nextFree = (max, taken) => { let n = max + 1; while (taken.has(n)) n++; return n; };
// `nextFree` for all FOUR, including the plan: the first cut used a bare `max + 1` there
// alone, which is the one id whose convention happens not to have been exercised yet.
const next = {
  plan: nextFree(maxOf(planFiles.map(idOf)), new Set()),
  item: nextFree(maxOf(itemFiles.map(idOf)), spentItems),
  q: nextFree(maxOf(qIds), spentQs),
  adr: nextFree(maxOf(adrFiles.map(idOf)), skippedAdrs),
};
// **A SECOND ROUTE to each maximum, because `maxOf` is one expression and the adequacy
// reader replaced it with `Math.min`** — printing `P2 W2 Q2 ADR 0002` at EXIT 0. The
// listings are sorted by id, so their LAST element is the maximum by a different route, and
// a next id must exceed it. Stop-and-ask (b) promised *every next id > 0* and this is the
// stronger form of that promise.
const lastOf = (xs) => (xs.length ? idOf(xs[xs.length - 1]) : 0);
const idsSane = next.plan > lastOf(planFiles) && next.item > lastOf(itemFiles)
  && next.adr > lastOf(adrFiles) && next.q > Math.max(...qIds, 0);
const ledgerNext = [...ledgerText.matchAll(LEDGER.nextPlan)]
  .sort((a, b) => +a[1] - +b[1]).pop();

// --- the counts, each from the one file that declares it ----------------------
const l6 = read('examples/l6.ts');
/** `const` is load-bearing: see the header. A comment quoting the name is not a declaration. */
const declared = (name) => {
  const m = l6.match(new RegExp(`^const ${name}\\s*=\\s*(\\d+)`, 'm'));
  return m ? Number(m[1]) : null;
};
// **ONE read of each L6 constant, not two.** The report row and the floor below were two
// separate `declared(...)` calls, so rule 8's provenance probe could re-source the ROW and
// the floor never saw it — obligation (c)'s LIMIT, two expressions over one value, which is
// the shape W81's clone counter had. Read once here and used in both places.
const L6_TOTAL = declared('DECLARED_TOTAL');
const L6_RUNS = declared('DECLARED_RUNS');
const pkg = JSON.parse(read('package.json'));
const deno = JSON.parse(read('deno.json'));
const counts = [
  ['plans', planFiles.length],
  ['work items', itemFiles.length],
  ['decisions', adrFiles.length],
  ['register questions (doc/questions/)', questions.length],
  ['  of those, live / resolved', `${liveCount} / ${resolvedCount}`],
  ['  of the live, open / deferred', `${openRows} / ${deferredRows}`],
  ['  of the live, iceboxed', iceboxRows],
  ['ladder L6 assertions (examples/l6.ts)', L6_TOTAL],
  ['ladder L6 real runs (examples/l6.ts)', L6_RUNS],
  ['package version (package.json / deno.json)', `${pkg.version} / ${deno.version}`],
  ['gate chain entries (package.json)', (pkg.scripts?.gate ?? '').split('&&').filter((s) => s.trim()).length],
  ['scheduler pin (package.json)', pkg.devDependencies?.['fyflow-scheduler']
    ?? pkg.peerDependencies?.['fyflow-scheduler'] ?? null],
];

// --- the control: every derivation refuses to be empty ------------------------
/**
 * Each bound is a FLOOR well below today's reading rather than an equality, because an
 * equality here would be a ratchet every new plan, item, question and decision had to
 * bump — the shape [Q102](../doc/questions/q102.md) describes. A floor cannot go stale
 * toward weakness the way a ceiling can **where the quantity only grows, and that is true of a
 * FILE COUNT and false of a STATUS**: ids are never reused, so plans, items, decisions and
 * question files only grow, while how many questions read `open` is a judgement a plan can move
 * on purpose. P29's triage took `open` from 307 to 23 and a floor of 200 on it turned this
 * script red at W123 — [W127](../doc/work-items/w127-an-open-question-says-what-closes-it.md)
 * removed it. A status is held by RELATIONS here, which move with the register rather than with a
 * literal. **What a floor cannot see is a plausible wrong number**, which is why the one
 * defect it missed is recorded in the header rather than guarded here.
 */
const ASSERTIONS = [
  ['plan files found', plans.length, 20, 'plans'],
  ['item files found', items.length, 80, 'items'],
  ['decision files found', adrFiles.length, 40, 'decisions'],
  ['register question files read', questions.length, 300, 'register'],
  // **Resolved only grows in practice** — nothing un-resolves a question — so it keeps its floor.
  ['questions that are resolved', resolvedCount, 50, 'register'],
  // a RELATION rather than a floor: every live question is open, deferred or iceboxed, so a
  // status line that changes shape is caught where a floor of 200 would absorb it silently —
  // and an unreadable `status:` line counts as live and as none of the three.
  ['live questions that are open, deferred or iceboxed', openRows + deferredRows + iceboxRows, liveCount, 'register'],
  // **And the same relation read the OTHER way, which replaced `live >= 200` at W127.** Live falls
  // with every resolution (270 at W127), so a floor on it is a status floor in waiting. What it
  // caught — a reading that counts every question resolved, live 0 — is this row: the two together
  // make live EQUAL to open + deferred + iceboxed, at any register size.
  ['live questions, against open, deferred and iceboxed read the other way', liveCount,
    openRows + deferredRows + iceboxRows, 'register'],
  // **The second route, and each comparison is a floor at the OTHER route's figure**, so the first
  // route reading fewer than the directory holds, or a next id at or below an id on disk, is red.
  ['question files read, against every entry the folder holds read a second way',
    questions.length, rawQuestionNames.length, 'register'],
  ['question files that are readable files' +
    (unreadableQs.length ? ` — NOT: ${unreadableQs.join(', ')}` : ''),
    questions.length - unreadableQs.length, questions.length, 'register'],
  ['question files whose `status:` line parses', questions.filter((q) => q.status !== null).length,
    questions.length, 'register'],
  ['the next free Q, against the highest number on disk read a second way', next.q, rawMaxQ + 1, 'register'],
  // **An EQUALITY against the derived count, not a floor, and that is what rule 8 found.**
  // With a floor of 20 the title fallback could be DELETED for nothing: 22 plans declare a
  // question line and 22 >= 20, so the five identified only by their title left no trace.
  // *Every plan is identified* is the claim, and an equality against `plans.length` states
  // it without being a ratchet — it moves with the directory rather than with a literal.
  ['plans identified by a question line or a title', plans.filter((p) => p.question).length, plans.length, 'plans'],
  // **DISTINCT questions, not just present ones.** The adequacy reader replaced `titleOf`'s
  // body with `return 'the plan'` and the equality above still held, because it is a
  // TRUTHINESS test: a constant answer is present for every plan. Distinctness is what the
  // claim means, and it collapses to 1 under a constant.
  ['plans whose question is DISTINCT from every other', new Set(plans.map((x) => x.question)).size, plans.length, 'plans'],
  ['plans DECLARING a question line', plans.filter((p) => !p.fromTitle).length, 15, 'plans'],
  ['plans whose declared status AGREES with their own structure',
    plans.length - plans.filter((p) => p.disagrees).length, plans.length, 'plans'],
  // **An EQUALITY, for the same reason the plan one is.** At a floor of 90 against 95 the
  // adequacy reader removed FIVE of the seven Status lines this item adds for nothing, and
  // reduced `STATUSES` to `['done']` alone — four of five members gone — because 90 items say
  // `done` and 90 met the floor exactly. *Every item file carries a parseable status* is the
  // claim; it moves with the directory rather than with a literal, so it is not a ratchet.
  ['items whose Status line parses to a declared word',
    items.filter((i) => declares(i.status, STATUSES)).length, items.length, 'items'],
  // and each ledger pattern on its own, because ONE SUMMED floor let any single one leave
  ['item ids the ledger reports spent', spentItems.size, 10, 'ledger'],
  ['Q ids the ledger reports spent', spentQs.size, 8, 'ledger'],
  ['ADR ids the ledger reports skipped', skippedAdrs.size, 5, 'ledger'],
  ['the ledger\'s own "next plan starts at" sentence', ledgerNext ? 1 : 0, 1, 'ledger'],
  ['the next free ids exceed the highest on disk by a second route', idsSane ? 1 : 0, 1, 'ids'],
  ['the counts this script reports', counts.length, 10, 'counts'],
  ['L6 assertions declared in examples/l6.ts', L6_TOTAL ?? 0, 1000, 'l6'],
  ['L6 runs declared in examples/l6.ts', L6_RUNS ?? 0, 50, 'l6'],
];
/**
 * **And a floor on the LIST, because `ASSERTIONS` is itself a list bound to nothing** —
 * rule 8 obligation (e)'s third shape, on this script's own new list. Emptied, `broken` is
 * empty and the report reads *all 0 derivations non-empty*, which is a pass. The count is
 * printed beside the verdict for the same reason.
 */
const MIN_ASSERTIONS = 10;
/**
 * **A COUNT is not a MEMBERSHIP** (`doc/workflow.md` v0.14, adopted because a whole layer of
 * assertions walked out past `DECLARED_TOTAL` three times in three plans). `MIN_ASSERTIONS`
 * catches an EMPTIED list; W114's adequacy reader showed it lets an individual floor leave for
 * nothing at 10 against twenty, and raising it to the length would be a ratchet every added
 * assertion must bump — [Q102](../doc/questions/q102.md)'s shape. So every assertion
 * declares the SUBJECT it is about and the subjects are compared BOTH WAYS: a subject that
 * loses its last assertion is named, and a subject nobody asserts is refused.
 */
const SUBJECTS = ['plans', 'items', 'decisions', 'register', 'ledger', 'ids', 'counts', 'l6'];
const broken = ASSERTIONS.filter(([, got, floor]) => !(Number(got) >= floor));
if (ASSERTIONS.length < MIN_ASSERTIONS) {
  broken.push(['the derivations this script asserts at all', ASSERTIONS.length, MIN_ASSERTIONS]);
}
{
  const covered = new Set(ASSERTIONS.map((a) => a[3]));
  for (const s of SUBJECTS) {
    if (!covered.has(s)) broken.push([`assertions about "${s}", which SUBJECTS declares`, 0, 1]);
  }
  for (const s of covered) {
    if (!SUBJECTS.includes(s)) broken.push([`"${s}" asserted and not declared in SUBJECTS`, 0, 1]);
  }
}

// --- report -------------------------------------------------------------------
const RECENT_PLANS = 5;
const RECENT_ITEMS = 10;
const w = (s, n) => String(s).padEnd(n);
const pad4 = (n) => String(n).padStart(4, '0');

console.log(`repository state, derived from the tree — ${planFiles.length} plan(s), ` +
  `${itemFiles.length} item(s), ${adrFiles.length} decision(s)\n`);

console.log('  the next free id, derived two ways');
console.log(`    from the tree       P${next.plan}   W${next.item}   Q${next.q}   ADR ${pad4(next.adr)}`);
if (ledgerNext) {
  const l = { item: +ledgerNext[1], q: +ledgerNext[2], adr: +ledgerNext[3] };
  const agrees = l.item === next.item && l.q === next.q && l.adr === next.adr;
  console.log(`    from the ledger           W${l.item}   Q${l.q}   ADR ${pad4(l.adr)}` +
    '    (the highest "next plan starts at" sentence under doc/)');
  console.log(agrees ? '    the two AGREE'
    : '    THE TWO DISAGREE — a plan has been declared since that sentence, or a retro spent an id. ' +
      'The reason is in a plan\'s Retro; both are printed rather than one being picked');
} else {
  console.log('    from the ledger     NO "next plan starts at" sentence found under doc/');
}
for (const x of plans.filter((y) => y.disagrees)) {
  console.log(`\n    ${x.id} declares "${x.status}" and its own file says "${x.structural}" — ` +
    'a Status LINE is a copy, and this is the one kind of staleness a derivation can still carry');
}
if (spentItems.size) {
  console.log(`    spent, never issued W${[...spentItems].sort((a, b) => a - b).join(' W')}`);
}

console.log(`\n  the last ${RECENT_PLANS} plan(s), each read from its own file`);
for (const p of plans.slice(-RECENT_PLANS)) {
  const mark = (p.fromTitle ? ' [title]' : '') + (p.disagrees ? ' [DISAGREES WITH ITS OWN FILE]' : '');
  console.log(`    ${w(p.id, 5)} ${w(p.status, 32).slice(0, 32)} ${(p.question ?? '(none)').slice(0, 46)}${mark}`);
}

console.log(`\n  the last ${RECENT_ITEMS} item(s), each read from its own file`);
for (const i of items.slice(-RECENT_ITEMS)) {
  console.log(`    ${w(i.id, 5)} ${w(i.status ?? 'NO STATUS LINE', 14)} ${i.file.replace(/\.md$/, '')}`);
}
const noStatus = items.filter((i) => i.status === null);
const oddStatus = items.filter((i) => i.status !== null && !declares(i.status, STATUSES));
if (noStatus.length || oddStatus.length) {
  console.log(`\n    ${noStatus.length} item(s) carry no Status line and ${oddStatus.length} carry one ` +
    'this parse cannot read — doc/work-items/TEMPLATE.md declares ' + STATUSES.join(' | '));
}

console.log('\n  the counts, each from the one file that declares it');
for (const [k, v] of counts) console.log(`    ${w(k, 44)} ${v}`);
console.log('\n  NOT here, because its only home is a check\'s output (P27 decision 4):');
console.log('    L1-L5\'s file and case counts   npm test, npm run test:deno, npm run test:browser:all');
console.log('    the spec\'s documents/examples/rules   npm run check:spec');
console.log('    the always-read set\'s bytes          npm run check:budget');

if (broken.length) {
  console.log('\nthe derivation refuses its own reading:');
  for (const [name, got, floor] of broken) {
    console.log(`  ${name}: ${got}, and the floor is ${floor} — a pattern that matches nothing ` +
      'reports an empty index as confidently as a full one');
  }
  console.log(`\n${broken.length} empty or short derivation(s).`);
  process.exit(1);
}
console.log(`\nall ${ASSERTIONS.length} derivations non-empty.`);
