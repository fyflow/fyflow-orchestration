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
 * The counts — `files`, `links`, `anchored` — are returned so a caller can refuse a
 * **vacuous pass**: a scan that read no files, or found no links, has not checked
 * anything, and P6's retro's lesson is that a derivation which cannot classify its
 * input must say so loudly rather than return a value. *(The docstring named a field
 * `counted` that has never existed; W25's conformity reader.)* **`M3` uses them and
 * `C5` does not**, which is a gap the lift did not carry across — [Q137](../doc/open-questions.md).
 */
export function resolveLinks(files, root) {
  const dead = [], deadAnchors = [];
  let links = 0, anchored = 0;
  const cache = new Map();
  const anchorsFor = (abs) => {
    if (!cache.has(abs)) {
      cache.set(abs, existsSync(abs) ? anchorsOf(readFileSync(abs, 'utf8')) : null);
    }
    return cache.get(abs);
  };
  const rel = (p) => relative(root, p).replace(/\\/g, '/');

  for (const p of files) {
    const text = blankCode(readFileSync(p, 'utf8'));
    for (const m of text.matchAll(LINK)) {
      const target = m[1];
      if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue;   // external scheme
      links++;
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
  return { dead, deadAnchors, files: files.length, links, anchored };
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
if (r.files < 56) fail('M3', `only ${r.files} markdown file(s) were scanned, so M1 and M2 are ` +
  'true of the walk rather than of the tree');
// **1200 -> 1350 at P9's declaration, 1350 -> 1530 by W30, and both times because
// ordinary work closed the window from below.** [Q142](../doc/open-questions.md).
// Measured at W30's close: whole tree 67/1907/94, `doc/decisions` removed
// 51/1709/94, `doc/decisions` and `doc/plans` removed **41/1357/94**. The floor has
// to sit ABOVE the two-directory fixture and BELOW the one-directory fixture — the
// interval (1357, 1709] — or one probe stops firing `M4` and the other starts. This
// is a two-sided window rather than a ratchet, and adding documents moves the lower
// bound UP, which is the opposite of what this file's header argued.
if (r.links < 1530) fail('M4', `only ${r.links} relative link(s) were found; M1 is vacuous below that`);
if (r.anchored < 60) fail('M5', `only ${r.anchored} link(s) carry an anchor; M2 is vacuous below that`);

const checks = [
  'M1 every relative link resolves to a file that exists',
  'M2 every anchor resolves to a heading in its target',
  'M3 the walk covers the tree',
  'M4 the tree carries links to check',
  'M5 the links carry anchors to check',
];
console.log(`markdown check — ${r.files} documents, ${r.links} relative links, ` +
  `${r.anchored} of them anchored\n`);
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
