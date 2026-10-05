#!/usr/bin/env node
// **A link is a link and an anchor is an anchor** — ladder L0 over every tracked
// markdown file. W25, and [Q121](../doc/open-questions.md).
//
//   node scripts/check-markdown.mjs           node scripts/check-markdown.mjs --self-test
//
// Exits 0 when every check passes, 1 otherwise. It reports; it does not fix.
//
// **`C5` is LIFTED here rather than copied, and it keeps its id.** `check-spec.mjs`
// has resolved relative links inside `spec/` since W1; `doc/` is upstream of every
// check in this repository and has had none. The two are one comparison, so this
// file holds the implementation and `check-spec.mjs` imports it and reports its
// result under **`C5`** — which is cited in nine documents and which
// `doc/workflow.md` section 3 forbids renumbering.
//
// **What `C5` could not do, and why that is where the defects were.** Its pattern
// was `\]\(([^)#\s]+)(?:#[^)\s]*)?\)`: it **stripped the `#…` and compared the path
// alone**, and a link whose target is only an anchor — `](#live)` — did not match it
// at all. Measured at W25's declaration: **0 dead file links** and **14 dead anchors
// over 9 distinct targets**, every one of them an S-id in
// `doc/scheduler-upstream.md`'s own index, born dead in the founding commit.
// *(Across `doc/**` plus the three root documents, which was 55 files at the time.
// **The number this script prints is 62** — the same set plus `spec/**`'s seven,
// which the lift brought in. The referent was not stated and the two read as
// contradicting; W25's conformity reader.)*
//
// **WHAT THIS DOES NOT REACH, stated so its coverage is not overstated** — the same
// paragraph `check-source.mjs` writes for `S7`. This reads ONE link syntax,
// `](target)`, and one anchor source, an ATX heading. Ten other shapes are invisible
// to it, and **all ten were measured at zero occurrences in this corpus**, which is
// what makes them gaps rather than defects:
//
//   reference-style definitions `[a]: url` and uses `[text][a]`      0
//   HTML anchors `<a name=…>` / `<a id=…>`                           0
//   an unclosed fence (odd ``` count in a file)                      0
//   an anchor with uppercase letters, or percent-encoded             0
//   an empty anchor `](#)`, a query string, `](<spaced name.md>)`    0
//
// **THREE would bite in opposite directions, and the third was miscounted here.** A
// reference-style link to a missing file passes **silently** (a false negative). An
// HTML anchor, and an unclosed fence, would be reported **dead when they are not**
// (false positives, the worse direction, because the gate goes red for a document
// that is correct). And a link inside an HTML comment is **not invisible at all** —
// it is REPORTED, so it is a third false positive rather than a gap. This paragraph
// listed it as "invisible, 0 occurrences"; W25's conformity reader ran it and it
// fires. [Q136](../doc/open-questions.md).
//
// **There is no `CHECK_MARKDOWN_ROOT`**, and there was one until W25's conformity
// reader grepped for its setter and found none: the self-test copies this script
// INTO its fixture and runs it there, so `ROOT` comes from the script's own
// location and the override was an untested branch in a gate script. Removed, with
// `CHECK_SPEC_DIR` in `check-spec.mjs` — which was worse, because it let an
// environment variable silently redirect the `spec/` scan, in a lift P8 decision 1
// says has "no behaviour change to `spec/`".

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * **This file is a module AND a script, and the difference is load-bearing.**
 * `check-spec.mjs` imports `resolveLinks` for `C5`'s lift, and on the first run the
 * import executed the whole `doc/` scan and called `process.exit(1)` — so the
 * importer never reached its own first line. Everything below the exports runs only
 * when this file is the entry point.
 */
const IS_ENTRY = process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

/**
 * **Fenced blocks and inline code spans blanked, LENGTH-PRESERVING.** Every
 * character becomes a space and every newline stays.
 *
 * **The reason first given for that was vacuous and is corrected here**: it said
 * *"so a line number in a failure message is the line number in the file"*, and **no
 * message this script emits carries a line number** — W25's adequacy reader. The real
 * reason is composition: the fence pass runs before the span pass, and a blank that
 * COLLAPSED its match would join the text on either side of it, so the span regex
 * would then see pairs of backticks that were never adjacent in the file. Replacing
 * `[^\n]` with `[\s\S]` — dropping only the newline half — costs **0** on this
 * corpus and breaks a heading that follows a fenced block, which is that composition
 * failing in the small.
 *
 * Measured at W25's declaration: without this the scan reports **4 false positives
 * in three files** — two in `doc/open-questions.md`, one in `w22`, and
 * `doc/work-items/TEMPLATE.md`'s `../plans/p_-<slug>.md`, which is a **placeholder**
 * rather than an illustration of link syntax. [Q121](../doc/open-questions.md)
 * describes the phenomenon as illustrations only; it is wider than that and the fix
 * is the same. `C5` never needed it because `spec/` prose does not do either.
 */
export function blankCode(text) {
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  // Fences first: an inline span inside a fence must not be matched on its own.
  const fenced = text.replace(/^([ \t]*)(```+|~~~+)[^\n]*\n[\s\S]*?^[ \t]*\2[^\n]*$/gm, blank);
  // Then inline spans. A span does not cross a blank line, and a run of N
  // backticks is closed by a run of exactly N.
  return fenced.replace(/(`+)(?!`)([^\n]*?)\1(?!`)/g, blank);
}

/**
 * **YAML front matter blanked, LENGTH-PRESERVING — a field is DATA, not a link.**
 * [W116](../doc/work-items/w116-a-question-is-a-file.md) moved the register into
 * `doc/questions/q<N>.md`, one front-matter block per question with every cell copied VERBATIM, and
 * four cells carry a link written relative to the OLD register: `](#live)` three times and
 * `](decisions/0077-…)` once. From `doc/questions/` they resolve to nothing — and rewriting them would
 * break the verbatim copy the round-trip holds. **A front-matter value is printed by a lookup as text
 * and is never rendered as a link**, so it is not this check's subject;
 * [ADR 0079](../doc/decisions/0079-a-register-is-files-with-front-matter-and-its-index-is-derived.md).
 *
 * Only a block that OPENS the file counts — a `---` first line and the FIRST `---` line after it,
 * never the last, so a thematic break in the body does not move the fence down over the links above
 * it. **It applies to EVERY scanned file, not only `doc/questions/`** (W116's conformity reader): no
 * other document opened with `---` when this was written, and one that later opens with a thematic
 * break would lose its links up to the next `---` — the reach this narrowing costs, stated rather
 * than found. **An opening `---` with no closing one is NOT front matter and nothing is blanked**: the
 * whole file stays in the walk, which is the direction that can only report too much — W116's
 * adequacy reader blanked the whole of such a file for 155 links gone and a green self-test.
 */
export function blankFrontMatter(text) {
  if (!text.startsWith('---\n')) return text;
  const close = text.indexOf('\n---\n', 3);
  const end = close >= 0 ? close + 4 : (text.endsWith('\n---') ? text.length : -1);
  if (end < 0) return text;
  return text.slice(0, end).replace(/[^\n]/g, ' ') + text.slice(end);
}

/**
 * **The slug rule, and it is the centre of this check.** GitHub lowercases the
 * heading's rendered text, drops everything that is not a letter, a digit, an
 * underscore, a hyphen or whitespace, and replaces **each** whitespace character
 * with one hyphen — **runs are not collapsed**. That is why `## S2 - Cancel a
 * queued task` is `s2---cancel-a-queued-task` (three: space, the literal hyphen,
 * space) while `## ADR 0001 — Routing …` is `adr-0001--routing-…` (two: the em-dash
 * is dropped, its two spaces remain).
 *
 * **`_` is KEPT, and stripping it was this item's one BLOCKING code defect.** The
 * paragraph above says GitHub keeps underscores and the code removed them with
 * ``[`*_~]`` as "emphasis markup", so `## The run_flow helper` slugged to
 * `the-runflow-helper` and a correct link to `#the-run_flow-helper` was reported
 * **dead**. That is the false-POSITIVE direction — the gate going red for a document
 * that is right — which this file's own reach paragraph calls the worse one. Found by
 * W25's conformity reader, which derived the rule independently before reading the
 * code. **What is still divergent and is now declared rather than hidden**:
 * `_wrapping emphasis_` in a heading renders as italics and GitHub drops the markers,
 * where this keeps them. Intraword is the shape a repository full of code identifiers
 * writes; wrapping emphasis in a heading is not, and **0** links target one.
 *
 * **This corpus could not falsify any of it**, which is measured rather than assumed
 * and is why the probes matter more here than anywhere else in the file. At W25's
 * declaration four different slug rules — this one, whitespace runs collapsed,
 * hyphen runs collapsed, and punctuation replaced by a hyphen rather than dropped —
 * each reported **14 dead of 76**. The rules disagreed about **134, 140 and 294 of
 * the corpus's 584 headings**, and **not one of the 76 anchor-carrying links pointed
 * at a heading they disagree about.**
 *
 * **That was true at `c30ed9f` and W25's OWN FIX made two thirds of it false**, which
 * is a better outcome than the item claimed and was found by its conformity reader.
 * The fourteen repaired `s2---cancel-a-queued-task` anchors ARE discriminating cases:
 * measured on the tree as shipped, hyphen-run collapsing now costs **14** and
 * punctuation-to-hyphen **6**, where both cost 0 before. Only **whitespace-run
 * collapsing** is still invisible to the corpus and still needs a constructed probe.
 * **Fixing the defect built the fixture that proves the rule** — the probes stay,
 * because a corpus that happens to discriminate today is not a test.
 */
export function slug(heading) {
  // **There was a `.replace(/[`*~]/g, '')` here and it was DEAD.** The character
  // class below keeps only letters, digits, whitespace, `_` and `-`, so a backtick,
  // an asterisk and a tilde are already dropped by it — `**Bold**` and `~~Struck~~`
  // slug identically with or without the strip. Deleting it costs **0** on the corpus
  // and **0** on the probes, which is what W25's adequacy sweep reported; the answer
  // to a clause that is subsumed by another clause in the same function is to remove
  // it, not to write a probe that can never distinguish the two.
  //
  // **`.trim()` STAYS and is a different case.** It is not subsumed: the heading
  // regex strips `[ \t]` and `trim()` strips all Unicode whitespace, so a heading
  // ending in a non-breaking space is the one input where they differ. Nothing in
  // this corpus produces one and no probe reaches it. **Defensive and reachable in
  // principle**, where the strip above was defensive and reachable by nothing —
  // W24's `agree` conjunct, one file across.
  const text = heading
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')   // [text](url) renders as text
    .trim();
  return text.toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');
}

/**
 * Every anchor the file offers, including GitHub's `-1`, `-2` suffixes for repeated
 * headings. Headings are read from the code-blanked text, so a `#` inside a fenced
 * block is not a heading — but the heading's OWN inline code is kept, because
 * GitHub slugs what it renders and it renders `` `AGENTS.md` `` as `AGENTS.md`.
 */
export function anchorsOf(text) {
  const counts = new Map();
  const blanked = blankCode(text);
  const lines = text.split(/\r?\n/);
  blanked.split(/\r?\n/).forEach((line, i) => {
    const m = /^#{1,6}[ \t]+(.+?)[ \t]*$/.exec(line);
    if (!m) return;
    // The heading is real; slug the ORIGINAL line's text, not the blanked one.
    const raw = /^#{1,6}[ \t]+(.+?)[ \t]*$/.exec(lines[i]);
    const s = slug(raw ? raw[1] : m[1]);
    counts.set(s, (counts.get(s) ?? 0) + 1);
  });
  const out = new Set();
  for (const [s, n] of counts) {
    out.add(s);
    for (let i = 1; i < n; i++) out.add(`${s}-${i}`);
  }
  return out;
}

/** Every `.md` under `dir`, recursively. Nothing else is scanned. */
export function markdownIn(dir) {
  const out = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      if (name === 'node_modules' || name === '.git' || name === 'dev-dist' || name === 'dist') continue;
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name.endsWith('.md')) out.push(p);
    }
  };
  walk(dir);
  return out;
}

const LINK = /\]\(([^)\s]+)\)/g;

/** A readable `.md` file, which is the only thing an anchor can be resolved against. */
function isMarkdownFile(abs) {
  if (!abs.endsWith('.md')) return false;
  try { return statSync(abs).isFile(); } catch { return false; }
}

/**
 * **The one implementation, serving both `spec/` and `doc/`.** Returns the failures
 * rather than reporting them, so `check-spec.mjs` can label them `C5` and this file
 * can label them `M1` / `M2`.
 *
 * The counts — `files`, `links`, `anchored`, `sources` — are returned so a caller can
 * refuse a **vacuous pass**: a scan that read no files, or found no links, has not
 * checked anything, and P6's retro's lesson is that a derivation which cannot classify
 * its input must say so loudly rather than return a value. *(The docstring named a field
 * `counted` that has never existed; W25's conformity reader.)* **`M3` uses them and
 * `C5` does not**, which is a gap the lift did not carry across — [Q137](../doc/open-questions.md).
 *
 * **`sources` — the number of documents that CARRY at least one relative link — is
 * [W112](../doc/work-items/w112-the-budget-the-check-and-the-floors.md)'s, and it is what `M4`
 * counts instead of `links`.** *(It is incremented BEFORE the dead-link `continue`, so it counts
 * documents that carry a link rather than ones the walk successfully RESOLVED one from. The
 * failure message says `carried`, which is right; the first cut of this docstring said *resolved*,
 * which overstates it by however many dead links there are — zero today. W112's conformity
 * reader.)*
 * [ADR 0076](../doc/decisions/0076-a-vacuity-floor-counts-what-a-prose-cut-cannot-move.md) has
 * the argument; the mechanical reason it exists is that `links` counts repeated
 * CITATIONS and `M4`'s own message says its job is *"`M1` is vacuous below that"*. What
 * makes `M1` non-vacuous is how much of the corpus it resolved links from, and a prose
 * cut removes citations rather than documents.
 */
export function resolveLinks(files, root) {
  const dead = [], deadAnchors = [];
  let links = 0, anchored = 0;
  // A document counts once however many links it carries, so this is a SET rather than
  // a counter: `M4`'s whole property is that it does not move when a citation goes.
  const sources = new Set();
  const cache = new Map();
  const anchorsFor = (abs) => {
    if (!cache.has(abs)) {
      cache.set(abs, existsSync(abs) ? anchorsOf(readFileSync(abs, 'utf8')) : null);
    }
    return cache.get(abs);
  };
  const rel = (p) => relative(root, p).replace(/\\/g, '/');

  for (const p of files) {
    const text = blankCode(blankFrontMatter(readFileSync(p, 'utf8')));
    for (const m of text.matchAll(LINK)) {
      const target = m[1];
      if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue;   // external scheme
      links++;
      sources.add(p);
      const hash = target.indexOf('#');
      const path = hash < 0 ? target : target.slice(0, hash);
      // **`decodeURIComponent` THROWS on a bare `%`** — `](#100%-done)` is a
      // `URIError`, and an uncaught one replaces the whole report with a stack trace
      // and leaves every remaining file unscanned. It takes `check-spec`'s `C5` down
      // with it, because `C5` is now a caller. Found by W25's conformity reader; 0
      // percent-encoded anchors in the corpus, so it was latent rather than live.
      let anchor = null;
      if (hash >= 0) {
        const raw = target.slice(hash + 1);
        try { anchor = decodeURIComponent(raw); } catch { anchor = raw; }
      }
      const abs = path === '' ? p : resolve(dirname(p), path);
      if (path !== '' && !existsSync(abs)) {
        dead.push(`${rel(p)} links to ${target}, which does not exist`);
        continue;
      }
      if (!anchor) continue;
      // **And an anchored link to a DIRECTORY is `EISDIR`**, same shape and same
      // cost: `](../spec#foo)` passes `existsSync` and then `readFileSync` throws.
      // Ten directory links exist today and all ten are unanchored. An anchor into
      // anything that is not a readable markdown file is not something this check can
      // resolve, so it is skipped rather than guessed at.
      if (!isMarkdownFile(abs)) continue;
      anchored++;
      const have = anchorsFor(abs);
      if (have && !have.has(anchor)) {
        deadAnchors.push(`${rel(p)} links to ${target}, and ${rel(abs)} has no heading that ` +
          `slugs to "${anchor}"`);
      }
    }
  }
  return { dead, deadAnchors, files: files.length, links, anchored, sources: sources.size };
}

// --- run as a script: doc/**, spec/** and the root markdown -------------------
if (!IS_ENTRY) {
  // Imported for `C5`'s lift. Nothing below this line may run.
} else {
if (process.argv.includes('--self-test')) {
  const mod = process.env.CHECK_MARKDOWN_SELFTEST ?? join(ROOT, 'scripts', 'check-markdown-selftest.mjs');
  // `resolve`, not `join`: the default is already absolute.
  const { selfTest } = await import(pathToFileURL(resolve(ROOT, mod)).href);
  process.exit(await selfTest(ROOT));
}

const SCAN_ROOT = ROOT;

const failures = [];
const fail = (check, msg) => failures.push(`${check}: ${msg}`);

const files = [
  ...markdownIn(join(SCAN_ROOT, 'doc')),
  ...markdownIn(join(SCAN_ROOT, 'spec')),
  ...['README.md', 'AGENTS.md', 'CLAUDE.md'].map((f) => join(SCAN_ROOT, f)).filter(existsSync),
];

const r = resolveLinks(files, SCAN_ROOT);
for (const d of r.dead) fail('M1', d);
for (const d of r.deadAnchors) fail('M2', d);

// **M3 — the walk covers the tree.** A walk that reads no file, or a file set that
// carries no link, reports zero failures and has checked nothing; `M1` and `M2`
// would then be true of the walk rather than of the tree.
//
// **The first version of these floors was 20 / 100 / 20 and it did not bound
// anything.** W25's conformity reader added `work-items` and `plans` to
// `markdownIn`'s skip list and **31 of 62 documents — every work item and every
// plan — left the scan with all three checks green and the gate at exit 0.** That is
// `doc/workflow.md` rule 8's fourth obligation on this file's own primary loop, and
// the floors were set to the degenerate extreme rather than to the tree.
//
// ~~**They are a MINIMUM nobody is obliged to raise, which is what keeps them out of
// [Q102](../doc/open-questions.md)'s shape.** `RUN_FLOOR`'s defect was that adding a
// snippet obliged an item to raise it, so it went stale in the direction of
// weakness; adding a document here can only move these numbers up and away. Only a
// corpus that SHRINKS by a third trips them, and a corpus shrinking by a third is
// the event they exist for.~~
//
// **THAT PARAGRAPH IS FALSE AND [P9](../doc/plans/p9-when-a-check-stops-checking-what-notices.md)'s
// DECLARATION STEP FALSIFIED IT — four documents later, one plan later.** It is right
// about the CHECK and wrong about the PROBES, and the probes are what make the check
// falsifiable. A floor is one-sided for `check-markdown.mjs` and **two-sided for
// `check-markdown-selftest.mjs`**: the `removes` probes fire `M3`/`M4` by cutting the
// corpus down past the floor, so the floor must sit **above the probe's fixture and
// below the whole tree**, and adding documents outside the removed directories raises
// the fixture into the floor. Measured: P9's declaration added one plan and three work
// items, `doc/decisions removed` went from 46 files to **50** against a floor of `< 50`,
// and **`npm run gate` exited 1** with two probes reporting `wanted [M1,M3], got [M1]`
// and `wanted [M1,M3,M4], got [M1,M3]`. **So it IS [Q102](../doc/open-questions.md)'s
// shape** — an item that adds documents is obliged to retune a constant in a file it
// does not own — and it is **worse** than `RUN_FLOOR`'s, because the window is bounded
// on both sides and the failure lands on the probes rather than on the check. The
// difference that matters is the direction: `RUN_FLOOR` went stale **silently, toward
// weakness**; this failed **loudly, in the gate**, naming both probes. [Q142](../doc/open-questions.md).
//
// **Retuned from a measurement rather than from arithmetic on a comment**, with the
// whole-tree and both fixture counts taken in one pass:
//
//   whole tree                          66 files / 1746 links / 86 anchored  -> silent
//   doc/decisions removed               50 files / 1548 links / 86 anchored  -> M3 only
//   doc/decisions + doc/plans removed   40 files / 1217 links / 86 anchored  -> M3 and M4
//
// The file floor must be **> 50 and <= 66**; the link floor **> 1217 and <= 1548**.
// 56 and 1350 sit near the middle of each window. The anchored floor is untouched at
// 60 against 86, because no `removes` probe moves it — all 86 anchored links are in
// `doc/`'s top level — and `M5`'s own probe takes it to zero.
// **Three ids, not three clauses under one id.** They were all `M3` and W25's
// adequacy reader measured what that cost: `if (r.files < 50)` and
// `if (r.links < 1200)` could each be replaced by `if (false)` for **0 failures**,
// because the probe harness compares the SET of check ids and all three reported the
// same one — so any probe that tripped the anchored floor satisfied a declaration of
// `{M3}` no matter which clause had fired. Set equality cannot discriminate inside a
// single id. New ids are free (`doc/workflow.md` section 3 forbids reuse and
// renumbering, not allocation), so each bound gets one and each is probed on its own.
// **50 -> 56 at P9's declaration, 56 -> 64 at P10's, and P10's is the first time
// this window was measured BEFORE the documents landed rather than after the gate
// went red.** [Q142](../doc/open-questions.md). P10's declaration adds five
// documents that survive BOTH removals — four work items, plus the plan file, which
// only the `doc/plans` removal takes out — so the one-directory fixture went
// **51 -> 56** against a floor of `< 56`, and probe 1 would have stopped firing
// `M3`. Predicted from the pre-edit counts, then confirmed against the post-edit
// tree rather than asserted from the prediction.
// Measured at P10's declaration, all three counts in one pass over a copy:
//
//   whole tree                          72 files / 2145 links / 99 anchored  -> silent
//   doc/decisions removed               56 files / 1947 links / 99 anchored  -> M3 only
//   doc/decisions + doc/plans removed   45 files / 1507 links / 99 anchored  -> M3 and M4
//
// The file floor must be **> 56 and <= 72**; 64 sits near the middle of that window.
//
// **64 -> 74 at [W42](../doc/work-items/w42-what-a-decision-sees.md), and it is the
// FIRST time `M3` has moved since P10's declaration** — three plans and eleven items
// of `M4`-only retunes, so the file half looked like a ratchet nobody had to pay.
// P12 added **two work items, a plan file and two ADRs** and the one-directory
// fixture rose **56 -> 64**, which is the floor exactly: `64 < 64` is false, probe 1
// went silent, and the gate said `wanted [M1,M3], got [M1]`. *A two-sided window
// closes from below on the file count as well as on the link count, and it took a
// plan that adds documents to `doc/decisions` — the directory probe 1 REMOVES — to
// show it.* Measured on a scratch copy outside the repository, unmutated:
//
//   whole tree                          85 files / 3328 links / 167 anchored
//   doc/decisions removed               64 files / 3014 links / 167 anchored
//   doc/decisions + doc/plans removed   51 files / 2406 links / 167 anchored
//
// So `M3`'s window is `(64, 85]` and 74 is near its middle; `M5` is untouched at 60
// against 167, for the sixth plan running.
// **80 -> 90 at [P15](../doc/plans/p15-what-a-run-retains-and-what-a-result-may-be.md)'s
// declaration**, and it is the FIRST retune of this floor taken with the probe still
// FIRING. `M3`'s margin had fallen to **two documents**: the one-directory fixture read
// 73 before that declaration and **78** after it, against a floor of `< 80`, so the next
// plan to add five documents would have silenced it exactly as P9's and P10's did.
// Measured on a scratch copy outside the repository, after the declaration's documents
// landed: whole tree **101 / 4255 / 211**, `doc/decisions` removed **78 / 3900 / 211**,
// both removed **62 / 3109 / 211**. So `M3`'s window is `(78, 101]` and 90 is near its
// middle. [Q142](../doc/open-questions.md), and the retune was **PREDICTED from the
// pre-edit counts** for the second time, which is the mitigation that row has.
// **90 -> 107 at [P18](../doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md)'s
// declaration, and it is the first retune PREDICTED from the count BEFORE the
// documents existed and then CONFIRMED by measuring after.** P18's fact 9 read the
// one-directory fixture at **89** with the draft plan alone, one below the floor, and
// named the four item files as what would cross it; with them in it reads **93** and
// probe 1 reports `wanted [M1,M3], got [M1]`. Measured on a scratch copy outside the
// repository after the declaration's documents landed: whole tree **121 / 5199 / 263**,
// `doc/decisions` removed **93 / 4758 / 263**, both removed **74 / 3808 / 263**. So
// `M3`'s window is `(93, 121]` and 107 is near its middle; `M4` at 3960 is inside
// `(3808, 4758]` and is untouched, and `M5` at 60 against 263. [Q142](../doc/open-questions.md)
// for the third plan running, and this is what a declared exception looks like: the
// item's table names the file before the edit rather than after the gate goes red.
// **107 -> 123 and 4450 -> 5270 at [W80](../doc/work-items/w80-what-a-run-time-result-check-is.md),
// and the JUDGEMENT changed under the measurement.** Measured on a scratch copy at that item's
// close: whole tree **140 / 6092 / 301**, `doc/decisions` removed **106 / 5580 / 301**, both
// removed **106 / 4449 / 296**. So `M3`'s window is `(106, 140]` and `M4`'s is `(4449, 6092]`.
// **Each new floor is the MIDPOINT of its own window** — 123 and 5270 — which is what balances a
// TWO-SIDED window; every earlier retune picked a number near the middle by eye and this one says
// so. [Q142](../doc/open-questions.md) for the ninth time.
//
// **The half worth recording is that W80 decided NOT to retune, and was right until it was not.**
// With `M4` at margin **2** the item declined: `check:markdown:selftest` was 7/7 at exit 0, every
// retune since W28 had been made on a RED gate, and *raising a ratchet that has not fired is a
// ratchet moved for no reason*. Then the item's own Record edit — the ONE edit section 1 rule 5
// allows after the confirming gate — spent the last link, and the margin was **1**. At 1 the same
// reasoning inverts: the floor's own direction is *raise as the corpus grows*, and a window one
// link wide is a trap for whoever edits next rather than a guard. *The decision did not change; the
// measurement moved under it, which is exactly what a two-sided window does to anyone who leaves
// it tight.*
// **142 since [W98](../doc/work-items/w98-what-a-row-may-assert-about-a-dispatch-order.md)**, whose declaration document took
// `M3`'s margin to ZERO exactly as W97's record step predicted ([Q142](../doc/open-questions.md)): 123 files against a floor
// of 123. The midpoint of its window `(123, 162]` on the tree W98 ships, from a scratch-copy measurement — W80's rule, and
// W92's precedent for `M4`. Probe 1 still fires (123 < 142) and the whole tree still passes (162).
// **142 -> 362 at [W116](../doc/work-items/w116-a-question-is-a-file.md), and both `removes` probes
// now cut `doc/questions` as well.** Two findings at once. First, the lane was ALREADY RED on
// `4eac349`: P28's declaration wrote six documents outside both cut directories and probe 1 read
// **146** files against 142 — `wanted [M1,M3], got [M1]`, [Q142](../doc/open-questions.md) for the
// twelfth time, found by measuring this item's baseline. Second, W116 writes **384** files into a
// directory neither probe cut, so retuning the floor alone would have bought a window `(530, 579]` —
// 49 wide, drained by every question raised from then on, since each is now a document. **Cutting
// `doc/questions` in both fixtures takes the register's growth out of the lower edge entirely**:
// measured on this tree in a staged copy, whole tree **579** files, probe 1 (decisions + questions
// cut) **146**, probe 2 (decisions + plans + questions) **117**. 362 is the midpoint of `(146, 579]`
// — W80's rule — leaving 216 documents of headroom below and 217 above, and the whole tree only
// grows. *A floor sitting at the size of the one directory it does not cut would be a different
// mistake; this one sits above everything but the register.*
// **And the reach it gives up, stated** (W116's conformity reader): at 362 against a whole tree of
// 579, `M3` is mostly a check that `doc/questions/` is WALKED — about 216 other documents could
// leave the walk and this floor would not see it. What sees those is `M1`, whose links into a
// document that left go dead, and `M4`, which counts the documents that carry a link.
if (r.files < 362) fail('M3', `only ${r.files} markdown file(s) were scanned, so M1 and M2 are ` +
  'true of the walk rather than of the tree');
// **1200 -> 1350 at P9's declaration, 1350 -> 1530 by W30, and both times because
// ordinary work closed the window from below.** [Q142](../doc/open-questions.md).
// Measured at W30's close: whole tree 67/1907/94, `doc/decisions` removed
// 51/1709/94, `doc/decisions` and `doc/plans` removed **41/1357/94**. The floor has
// to sit ABOVE the two-directory fixture and BELOW the one-directory fixture — the
// interval (1357, 1709] — or one probe stops firing `M4` and the other starts. This
// is a two-sided window rather than a ratchet, and adding documents moves the lower
// bound UP, which is the opposite of what this file's header argued.
// **2050 -> 2400 at [W38](../doc/work-items/w38-the-dispatch-nothing-binds.md)**, the
// FOURTH retune and the third consecutive plan to pay it. Same failure, same line:
// `wanted [M1,M3,M4], got [M1,M3]`, in the gate, after the item was otherwise
// finished. Measured on a scratch copy outside the repository: whole tree
// **78 / 2817 / 127**, `doc/decisions` removed **60 / 2564 / 127**, both removed
// **48 / 2061 / 127** — so `M4`'s window is `(2061, 2817]` and 2400 is near its
// middle. `M3` at 64 is still inside `(60, 78]` and is untouched, and `M5` at 60
// against 127 for the fourth plan running. **W38 added ONE work-item document and a
// register row**, and the two-directory fixture rose 1754 -> 2061 mostly on links
// written into `doc/README.md` and `CLAUDE.md` — the prose obligation W33 identified,
// firing on an item whose subject is *checks that stop checking*.
//
// **1720 -> 2050 at [W33](../doc/work-items/w33-a-map-at-run-time-arity.md), and that
// item added NO DOCUMENT** — which is an instance [Q142](../doc/open-questions.md)'s
// row does not describe. Every earlier one was *an item that adds documents must
// retune a constant in a file it does not own*; W33 added links to documents that
// already existed (a spec rule, register rows, index paragraphs) and the
// two-directory fixture rose **1507 -> 1754**, past a floor of 1720. The probe went
// silent and the gate said `wanted [M1,M3,M4], got [M1,M3]`. **The obligation is on
// writing PROSE, not on adding FILES**, and it lands on `M4` alone. Measured on a
// scratch copy outside the repository: whole tree **73 / 2419 / 119**, `doc/decisions`
// removed **56 / 2205 / 119**, both removed **45 / 1754 / 119** — so `M4`'s window is
// `(1754, 2419]` and 2050 is near its middle. `M3` at 64 is still inside `(56, 73]`
// and is untouched.
//
// **1530 -> 1720 at P10's declaration**, from the counts in the M3 block above: the
// floor must sit ABOVE the two-directory fixture (1507) and BELOW the one-directory
// one (1947), and 1720 is near the middle of (1507, 1947]. **The anchored floor is
// untouched at 60 against 99** — no `removes` probe moves it, for the third plan
// running, because every anchored link is in `doc/`'s top level and `M5`'s own probe
// takes it to zero.
// **2400 -> 2700 at [W42](../doc/work-items/w42-what-a-decision-sees.md)**, the FIFTH
// retune and the fourth consecutive plan to pay it — and the first time BOTH floors
// moved in one edit, which is why the counts are recorded once in the `M3` block
// above rather than twice. `M4`'s window was `(2406, 3014]` and 2700 was near its
// middle. **P12 wrote the links as well as the files**: the two-directory fixture
// rose 2061 -> 2406 on prose in `doc/README.md`, `CLAUDE.md` and
// `doc/open-questions.md`, which is W33's *the obligation is on writing PROSE* for
// the third time.
//
// **2700 -> 3080 and 74 -> 80 at [W46](../doc/work-items/w46-what-a-reference-costs-and-whether-anything-says-so.md)**,
// the SIXTH retune and the FIFTH consecutive plan to pay it. **`M4` was the one that
// fired**, in the gate, at `GATE EXIT=1` with **zero `FAIL` lines** — the exit code
// being the predicate, for the third time in two plans. Measured on a scratch copy
// OUTSIDE the repository: whole tree **91 / 3770 / 187**, `doc/decisions` removed
// **69 / 3437 / 187**, both removed **55 / 2738 / 187**. So `M4`'s fixture had risen
// past the floor (2738 against 2700) and probe 2 reported `wanted [M1,M3,M4], got
// [M1,M3]`. **New windows: `M3` is `(69, 91]` and `M4` is `(2738, 3437]`**, and 80
// and 3080 sit near the middle of each, leaving **11 files** and **342 links** of
// headroom below and 11 / 357 above.
//
// **`M3` did NOT fire and is retuned anyway**, which is the part worth recording: at
// 74 against a one-directory fixture of 69 it had **five files** of headroom, and
// P13's own two remaining Records plus W47's item file would have spent them. *A
// two-sided window is worth re-centring when you are already in the file* — the
// alternative is paying [Q142](../doc/open-questions.md) twice in one plan, which
// P12 did.
//
// **Both bounds RISE TOGETHER as prose is added**, and the gap between them is the
// links in `doc/plans/` — 699 here. So the window slides upward at a stable width,
// which is why re-centring buys headroom in both directions rather than only one.
// **3080 -> 3490 at [P15](../doc/plans/p15-what-a-run-retains-and-what-a-result-may-be.md)'s
// declaration**, the SEVENTH retune and the SIXTH consecutive plan to pay it. The
// two-directory fixture rose **3030 -> 3109**, past a floor of 3080, so the probe declaring
// `[M1,M3,M4]` would have reported `got [M1,M3]` — the same line, in the gate, for the sixth
// time. **It was PREDICTED from the pre-edit counts rather than discovered by the gate going
// red**: the margin was measured at **50 links** BEFORE any document was written, and this
// declaration writes four work-item documents into `doc/work-items`, which **neither
// `removes` probe cuts**. Counts are in the `M3` block above, taken once for both floors.
// `M4`'s window is `(3109, 3900]` and 3490 is near its middle; `M5` is untouched at 60
// against 211, for the eighth plan running, because no `removes` probe moves an anchored
// count — every anchored link is in `doc/`'s top level. [Q142](../doc/open-questions.md).
// **3490 -> 3960 at [W58](../doc/work-items/w58-what-a-node-says-about-its-own-task.md)**, the
// EIGHTH retune, and the first to be found by the GATE rather than predicted: P16's declaration
// checked [Q142](../doc/open-questions.md) with a margin of 388 links over the two-directory
// fixture (3102 against 3490), and W58's spec subsection, register rows, Record and index
// paragraphs took that fixture **3102 -> 3532** — every one of them a link-dense document under
// `doc/` or `spec/`'s top level, which neither `removes` probe cuts. So the probe declaring
// `[M1,M3,M4]` reported `got [M1,M3]` in the item's FINAL gate, after every other rung was green.
// Measured on a scratch copy outside the repository, on the tree the item ships: whole tree
// **108 / 4792 / 247**, `doc/decisions` removed **83 / 4386 / 247**, both removed
// **66 / 3532 / 247**. `M4`'s window is `(3532, 4386]` and 3960 is near its middle; `M3` at 90 is
// inside `(83, 108]` and untouched; `M5` at 60 against 247, untouched for the ninth plan running.
// A late exception on `scripts/**` for the item, on W42's and P15's precedent.
// **3960 -> 4450 at [P18](../doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md)'s
// RETRO**, the NINTH retune and the SECOND consecutive one found by the GATE rather than
// predicted — and the first found by a RETRO's own confirming gate, on a tree to which that
// retro had added **no document at all**. That is [Q142](../doc/open-questions.md)'s window from
// its OTHER side: P18's declaration predicted and paid the FILE half (`M3` 90 -> 107, from a count
// taken before a document was written) and left the LINK half alone, where the margin was
// **31 links** — measured at W67's close, two-directory fixture **3929** against this floor of
// 3960. The retro's own record step writes its paragraphs into `doc/README.md`, `CLAUDE.md`,
// `README.md`, `doc/workflow.md`, `doc/open-questions.md` and `doc/work-items/`, **none of which
// either `removes` probe cuts**, and that was **35** more links — so the fixture read **3964**,
// four past the floor, `M4` did not fire, and the probe declaring `[M1,M3,M4]` reported
// `got [M1,M3]` in the LAST entry of the gate after every other rung was green.
// Measured on a scratch copy outside the repository, on the tree this retro ships: whole tree
// **124 / 5414 / 271**, `doc/decisions` removed **93 / 4948 / 271**, both removed
// **74 / 3966 / 271** — re-taken AFTER the retro's own correction of its Q142 sentence, which moved
// all three by two, because a number is re-taken on the tree the item ships and this one moved
// while being written down. `M4`'s window is `(3966, 4948]` and 4450 is near its middle; `M3` at 107 is
// inside `(93, 124]` and untouched, as the declaration left it; `M5` at 60 against 271, untouched
// for the eleventh plan running. A declared exception on `scripts/**` for the retro, on W42's,
// P15's and W58's precedent. *An index paragraph is the densest link source this repository has,
// and the record step writes six of them — so a retro moves this floor without adding a file.*
// **5270 -> 6225 at [W92](../doc/work-items/w92-what-a-gate-is.md)'s record step, PREDICTED at P24's declaration and
// CONFIRMED by measuring before and after.** P24's seeded exceptions table named this file for this reason: `M4`'s
// margin was **22** links after that declaration. Measured on a copy of the tree with the probe's directories cut
// (`dev-dist/w92/q142.py`): BEFORE W92's record step the both-removed fixture read **5269** — the item's own
// documents had spent 21 of the 22 — and AFTER it **5291**, past the floor, so probe 2 would have reported
// `wanted [M1,M3,M4], got [M1,M3]`. Whole tree **156 / 7159 / 386**, `doc/decisions` removed **118 / 6607**, both
// removed **93 / 5291**. So `M4`'s window is `(5291, 7159]` and 6225 is its MIDPOINT, W80's rule. **`M3` is NOT
// retuned**: its margin is 5 files and it has not fired, and W80's *a ratchet moved before it fires is moved for no
// reason* holds for it. [Q142](../doc/open-questions.md) for the tenth time, and the second declared in advance.
//
// **`M4` STOPS COUNTING LINK INSTANCES AT [W112](../doc/work-items/w112-the-budget-the-check-and-the-floors.md),
// and 6225 -> 120 is a RE-POINTING rather than a retune** —
// [ADR 0076](../doc/decisions/0076-a-vacuity-floor-counts-what-a-prose-cut-cannot-move.md). Every
// retune above moved a number inside a window; this changes which quantity the window is over,
// because **no number existed that was valid both before and after P27's cuts.** Measured at W112's
// declaration step on this tree and on a simulated post-cut tree (the register reduced to 418
// one-line rows, `CLAUDE.md` minus its `Current state` block, this document's twin minus its version
// blocks, `doc/README.md` minus its long status paragraphs):
//
//                        whole tree   - doc/decisions   - decisions+plans
//   links, today              8052             7418                5969      window (5969, 7418]
//   links, post-cut           5496             4862                3413      window (3413, 4862]
//
// **The two windows are DISJOINT**, so a literal cannot span them, and deeper fixtures
// (`- work-items`, `- the three big directories`) and `distinct (source, target) pairs` were all
// measured and stay disjoint. *P27 decision 3 assumed the floors could be re-pointed ahead of the
// cut; for a VALUE they cannot, which is that plan's own prediction-2 reversal arriving at the item
// asked to find it.*
//
// What does span them is the count of documents the walk resolved a link FROM, which is what `M4`'s
// own message has always said its job is — `M1` is vacuous when it resolved links from little of the
// corpus, not when it walked few repeated citations, and **a prose cut removes citations rather than
// documents**:
//
//                        whole tree   - doc/decisions   - decisions+plans
//   sources, today             176              134                 107      window (107, 134]
//   sources, post-cut          175              133                 106      window (106, 133]
//                                                                            shared (107, 133], 26 wide
//
// *(Taken at W112's declaration step. On the tree the item SHIPS they read 178 / 135 / 108, because
// its own documents carry links; 120 is inside that window too, with 12 of headroom below and 15
// above. The today row's own window is `(107, 134]` and the first cut of this table labelled it
// with the SHARED one — W112's conformity reader.)*
//
// 120 is near the middle of the shared window, which is W80's rule for a two-sided one. The
// one-document drift (176 -> 175) is a document losing its LAST link, which is signal. **Every
// existing probe, fixture and declared set is unchanged**, which is the test that this is a
// re-pointing and not a weakening: `check:markdown:selftest` is green on both trees.
if (r.sources < 120) fail('M4', `only ${r.sources} document(s) carried a relative link, of ` +
  `${r.files} scanned; M1 is vacuous below that`);
// **`M6` — `sources` is strictly fewer than `files`, and W112's ADEQUACY READER is why this clause
// exists.** `M4`'s re-pointing had NO OBSERVER ANYWHERE: `sources: sources.size` re-sourced to
// `sources: files.length` cost **ZERO** — `check:markdown` EXIT 0, both `removes` probes `caught`,
// the self-test EXIT 0 at 37/37 and 37/37 — and the reader then built a post-cut tree and measured
// that it cannot discriminate either (`174/131/104` against `183/137/109`, identical verdict sets).
// The mechanism: on all three fixtures the two counts differ by at most FIVE (183/178, 137/135,
// 109/108) while the floor sits twelve or more away from the nearer, so **no fixture can separate
// them** and `M4` was a duplicate of `M3` at a lower floor.
//
// *The claim that "every existing probe, fixture and declared set is unchanged, which is the test
// that this is a re-pointing and not a weakening", is exactly why nothing could see it* — the
// reader's sentence, and it is obligation (c)'s LIMIT: a clause with one observer, re-sourced, is
// indistinguishable from the thing it replaced.
//
// So the observer is a RELATION over the derivation rather than another count, which is v0.21's
// answer to the same shape: **the walk must resolve links from FEWER documents than it scans.**
// Under the substitution the two are equal by construction and this fires on the real tree with no
// probe at all — *you can name the tree on which it fails and `M4` still passes*, which is v0.22's
// test for a control. **A NEW ID rather than a second clause under `M4`**, because rule 7 (c)
// compares the SET of ids and W25's adequacy reader measured what sharing one costs: three bounds
// under `M3` were each replaceable by `if (false)` for zero, since any probe tripping one satisfied
// a declaration of the other two.
//
// Its own durability is measured rather than hoped: the gap is **5** today and **6** post-cut, and
// three of the five are `TEMPLATE.md` files — `doc/decisions/`, `doc/plans/` and `doc/work-items/` —
// which carry no link by their nature, so the gap cannot close while the templates exist.
if (r.sources >= r.files) {
  fail('M6', `the walk scanned ${r.files} document(s) and resolved a relative link from ` +
    `${r.sources} of them. M4 counts documents that CARRY a link and M3 counts documents SCANNED; ` +
    'equal counts mean M4 has been re-sourced to the file list and is a duplicate of M3 at a lower ' +
    'floor. The gap is the documents carrying no relative link, of which three are TEMPLATE.md');
}
// **`M5` moves 60 -> 28 at W113, and the deciding change is not the floor's VALUE, the quantity it
// counts, or the document its probe strips — it is the DECLARED SET of the second `removes` probe.**
//
// W112 measured that `M5` could not be re-pointed while the register still held its anchors: 440 of
// the corpus's 473 were `doc/open-questions.md`'s own `](#live)` and `](#resolved)` self-links,
// resolving to exactly TWO distinct anchors, so emptying that document moved the corpus count by
// almost all of it. `W113`'s cut deletes that subject —
// [ADR 0073](../doc/decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md)
// consequence 2's shape, *removing a subject removed its probes* — and
// [ADR 0076](../doc/decisions/0076-a-vacuity-floor-counts-what-a-prose-cut-cannot-move.md)
// decision 3 hands over the window **`(13, 15]`** with the probe re-pointed at
// `doc/scheduler-upstream.md`.
//
// **That window is EMPTY on the tree the cut produced, and so is every other one, until probe 2
// declares `M5`.** Re-measured here, in a staged copy, with a control that adds one dead link and
// must see it (the first cut of that measurement handed `resolveLinks` RELATIVE paths, so it read
// the real tree whatever root it was given, reported the whole tree's figures for every
// content-modifying scenario, and PASSED its own control):
//
//   quantity           whole   -decisions   -dec+plans   strip upstream   strip register
//   anchored              35           35           17               20               33
//   documents w/ anchor    9            9            2                8                8
//   distinct anchors      24           24           12               14               22
//
// The upper edge is `min(whole, p1, p2)` while probe 2 must stay quiet, and `-dec+plans` is **17**
// because `doc/plans` holds 12 of the 35 and `doc/workflow.md`'s five all point INTO it. Stripping
// the largest remaining holder leaves 20, and 20 >= 17 — so **(20, 17], empty**, and the same
// arithmetic empties all three quantities and both subjects. *The quantity was never the
// constraint, which is why re-pointing it the way `M4` was re-pointed would not have helped.*
//
// **So this takes ADR 0076's own alternative 4 — *giving probe 2 `M5` in its declared set* — which
// that ADR priced as needing `floor > 455` today and `<= 28` after, and refused because no value
// satisfied both. The cut is what makes it available**: with probe 2 declaring `M5` the window is
// `(20, 35]` and **28** is its midpoint ([W80](../doc/work-items/w80-what-a-run-time-result-check-is.md)'s
// rule for a two-sided one). All four constraints hold: the check passes at 35, probe 1 stays quiet
// at 35, probe 2 fires at 17 and says so, and `M5`'s own probe fires at 20. *An alternative refused
// on the tree before a cut is not refused on the tree after it, and the ADR's figures were the
// pre-cut ones.*
//
// **28 -> 72 at [W120](../doc/work-items/w120-the-glossary-points-and-never-defines.md), whose
// `doc/glossary.md` carries one anchored link per row in `doc/`'s top level, which no `removes`
// probe cuts** — [ADR 0080](../doc/decisions/0080-the-glossary-points-and-never-defines.md)
// consequence 4, amending ADR 0078 decision 1's number and nothing else in it. Measured on W120's
// tree in staged copies, with a control adding one dead link that must turn `M1` red (it did):
//
//   anchored     whole   probe 1   probe 2   strip upstream
//   before          35        35        15               20
//   after           83        76        56               68
//
// **The window did NOT just shift; it narrowed, from `(20, 35]` to `(68, 76]`.** 48 rows arrived
// everywhere, but 7 of them point into `doc/decisions`, and a link into a cut directory is dead and
// is not counted, so probe 1 gains 41 where `M5`'s own probe gains 48. 72 is the midpoint. **Every
// future glossary row pointing at an ADR narrows it by one more**, and a row pointing at `spec/` or
// `doc/workflow.md` moves both edges together.
if (r.anchored < 72) fail('M5', `only ${r.anchored} link(s) carry an anchor; M2 is vacuous below that`);

// --- M7 / M8 LEFT at W116 ---------------------------------------------------------------
//
// **They held the register's TABLES and its one-row-per-question shape, and at
// [W116](../doc/work-items/w116-a-question-is-a-file.md) the register stopped being a table.** One
// file per question removes both subjects: there is no table to break, and a question deleted and
// not yet COMMITTED is a file missing against `HEAD`, which `check:register`'s `R4` sees where
// `M8`'s floor said of itself that *a deletion of one to seven rows is a declared ceiling*. A
// COMMITTED deletion is beyond `R4` too — its ceiling is in `check-register.mjs` and Q493.
// [ADR 0079](../doc/decisions/0079-a-register-is-files-with-front-matter-and-its-index-is-derived.md)
// amends [ADR 0078](../doc/decisions/0078-a-vacuity-floors-window-is-a-property-of-the-probe-suite.md),
// which added them; `git show 4eac349:scripts/check-markdown.mjs` has their text. *They had no probe
// in `check-markdown-selftest.mjs` to take with them — zero occurrences of either id there.*

const checks = [
  'M1 every relative link resolves to a file that exists',
  'M2 every anchor resolves to a heading in its target',
  'M3 the walk covers the tree',
  'M4 the tree carries links to check',
  'M5 the links carry anchors to check',
  'M6 M4 counts something M3 does not',
];
// `sources` is printed because it is what `M4` now reads, and a floor whose quantity is not in the
// report is a floor a reader cannot check the check against — W107's `compared` defect, which was
// *a value computed and never read*.
console.log(`markdown check — ${r.files} documents, ${r.links} relative links in ` +
  `${r.sources} of them, ${r.anchored} links anchored\n`);
for (const c of checks) {
  const id = c.slice(0, c.indexOf(' '));
  const bad = failures.filter((f) => f.startsWith(id + ':'));
  console.log(`  ${bad.length ? 'FAIL' : 'ok  '}  ${c}${bad.length ? ` (${bad.length})` : ''}`);
}
if (failures.length) {
  console.log('\n' + failures.map((f) => '  ' + f).join('\n'));
  console.log(`\n${failures.length} failure(s).`);
  process.exit(1);
}
console.log('\nAll checks passed.');
}
