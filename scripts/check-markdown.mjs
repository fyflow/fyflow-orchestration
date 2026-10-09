#!/usr/bin/env node
// **A link is a link and an anchor is an anchor** — ladder L0 over every tracked
// markdown file. W25, and [Q121](../doc/questions/q121.md).
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
// fires. [Q136](../doc/questions/q136.md).
//
// **There is no `CHECK_MARKDOWN_ROOT`**, and there was one until W25's conformity
// reader grepped for its setter and found none: the self-test copies this script
// INTO its fixture and runs it there, so `ROOT` comes from the script's own
// location and the override was an untested branch in a gate script. Removed, with
// `CHECK_SPEC_DIR` in `check-spec.mjs` — which was worse, because it let an
// environment variable silently redirect the `spec/` scan, in a lift P8 decision 1
// says has "no behaviour change to `spec/`".

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';
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
 * rather than an illustration of link syntax. [Q121](../doc/questions/q121.md)
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

/**
 * **ONE read cache and ONE existence cache, shared by the walk and its three probe trees** —
 * [W150](../doc/work-items/w150-check-markdown-reads-each-file-once.md), P31's Retro proposal B. Since
 * W144 the script calls `resolveLinks` four times, the walk and then once per probe tree, and each call
 * re-read every file and re-tested every target: the check went from ~820 ms to ~2130 ms on the
 * retro's machine, and the self-test pays that once per probe and META child.
 *
 * **It holds only what the DISK says**: a file's RAW text, and a path's kind — `'file'`, `'other'`, or
 * `null` for nothing there — from one `stat`, which answers both `exists` and `isMarkdownFile`. **A
 * probe tree is NOT in it.** `absent` is asked BEFORE the cache, so a removed path is never served the
 * walk's answer and a probe tree's removal is never stored for the next; `rewrite` is applied ABOVE it,
 * to the raw text it returns, so a strip is never served to the walk and the walk's text is never served
 * past a strip. Either way round the in-memory tree would differ from the staged one — W144's `d6` —
 * and the self-test's META entries *the cache answers for a removed path*, *a probe tree`s removal
 * STORED in the cache*, *the cache holds the REWRITTEN text* and *the rewritten text WRITTEN BACK* are
 * its birth provocations.
 */
export function fileCache() {
  return { text: new Map(), kind: new Map() };
}

/** The path's kind through the cache: `'file'`, `'other'` (a directory), or `null` if nothing is there. */
function kindOf(cache, abs) {
  let k = cache.kind.get(abs);
  if (k === undefined) {
    try { k = statSync(abs).isFile() ? 'file' : 'other'; } catch { k = null; }
    cache.kind.set(abs, k);
  }
  return k;
}

/** The file's RAW text through the cache — never a probe tree's rewrite of it. */
function rawText(cache, abs) {
  let t = cache.text.get(abs);
  if (t === undefined) {
    t = readFileSync(abs, 'utf8');
    cache.text.set(abs, t);
  }
  return t;
}

/** A readable `.md` file, which is the only thing an anchor can be resolved against. */
function isMarkdownFile(abs, cache) {
  if (!abs.endsWith('.md')) return false;
  return kindOf(cache, abs) === 'file';
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
 * `C5` does not**, which is a gap the lift did not carry across — [Q137](../doc/questions/q137.md).
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
export function resolveLinks(files, root, { absent = [], rewrite = null, cache = fileCache() } = {}) {
  const dead = [], deadAnchors = [], unwalked = [];
  let links = 0, anchored = 0;
  // A document counts once however many links it carries, so this is a SET rather than
  // a counter: `M4`'s whole property is that it does not move when a citation goes.
  const sources = new Set();
  // **Every path a link names, dead or alive** — `M10` asks whether a probe tree's paths are ones
  // the walk links into, and a link into a directory a probe removed is dead and still names it.
  const targets = new Set();
  const walked = new Set(files.map((f) => resolve(f)));
  // **`absent` and `rewrite` are a PROBE TREE built in memory** —
  // [W144](../doc/work-items/w144-the-markdown-floors-are-derived-and-examples-is-walked.md). A path
  // under an `absent` prefix does not exist, exactly as it does not in a fixture whose `removes`
  // deleted it; `rewrite` is the edit a content probe makes. The floors are derived from these.
  // **`cache` is SHARED across the walk and the probe trees (W150), and it is consulted only BELOW both**:
  // `gone` is asked first, and `rewrite` is applied to the raw text it returns — `fileCache` says why.
  const gone = (abs) => absent.some((a) => abs === a || abs.startsWith(a + sep));
  const exists = (abs) => !gone(abs) && kindOf(cache, abs) !== null;
  const read = (abs) => {
    const t = rawText(cache, abs);
    return rewrite ? rewrite(abs, t) : t;
  };
  // Per CALL, unlike `cache`: what a target's headings slug to depends on this tree's `rewrite`.
  const anchorCache = new Map();
  const anchorsFor = (abs) => {
    if (!anchorCache.has(abs)) {
      anchorCache.set(abs, exists(abs) ? anchorsOf(read(abs)) : null);
    }
    return anchorCache.get(abs);
  };
  const rel = (p) => relative(root, p).replace(/\\/g, '/');

  for (const p of files) {
    const text = blankCode(blankFrontMatter(read(p)));
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
      if (path !== '') targets.add(abs);
      if (path !== '' && !exists(abs)) {
        dead.push(`${rel(p)} links to ${target}, which does not exist`);
        continue;
      }
      // **`M9`: a markdown file the walk links to and does not READ** — its links are checked by
      // nothing. Measured at W144's declaration: exactly one, `examples/README.md` (Q337).
      if (path !== '' && isMarkdownFile(abs, cache) && !walked.has(abs)) {
        unwalked.push(`${rel(p)} links to ${target}, a markdown file the walk does not read`);
      }
      if (!anchor) continue;
      // **And an anchored link to a DIRECTORY is `EISDIR`**, same shape and same
      // cost: `](../spec#foo)` passes `existsSync` and then `readFileSync` throws.
      // Ten directory links exist today and all ten are unanchored. An anchor into
      // anything that is not a readable markdown file is not something this check can
      // resolve, so it is skipped rather than guessed at.
      if (!isMarkdownFile(abs, cache)) continue;
      anchored++;
      const have = anchorsFor(abs);
      if (have && !have.has(anchor)) {
        deadAnchors.push(`${rel(p)} links to ${target}, and ${rel(abs)} has no heading that ` +
          `slugs to "${anchor}"`);
      }
    }
  }
  return { dead, deadAnchors, unwalked, targets, files: files.length, links, anchored, sources: sources.size };
}

/**
 * **The PROBE TREES, and the floors `M3`-`M5` are DERIVED from them** —
 * [W144](../doc/work-items/w144-the-markdown-floors-are-derived-and-examples-is-walked.md),
 * [Q142](../doc/questions/q142.md), P31 decision 2 and the maintainer's answer to its stop-and-ask (c).
 *
 * **ONE definition, read twice**: `check-markdown-selftest.mjs` imports this object from the script it
 * is testing and builds its `removes` and strip probes from it, and `deriveFloors` builds the same trees
 * in memory. A floor is **the largest measure among the probe trees that must fire it, plus 1**, so the
 * whole tree passes exactly when it measures more than each of them, and a probe tree fails exactly
 * because it IS one of them.
 *
 * **Why no literal can do this, measured.** On `fb64b63` the literals were 362 / 120 / 72 and the
 * windows `(166, 619]`, `(119, 150]`, `(70, 78]`: ONE ordinary linking document outside the removed
 * directories made probe 2 report `wanted [M1,M3,M4,M5], got [M1,M3,M5]` with `check:markdown` green —
 * Q142 for the thirteenth time. A floor derived from the probe tree rises with every ordinary document
 * exactly as the probe tree does, so **no ordinary document can close the window**.
 *
 * **And the price, which is the same fact read the other way**: an ordinary document LEAVING the walk
 * moves the floor down with it, so `M3`-`M5` see a loss only when it takes the WHOLE of a probe tree's
 * subject — every file in `doc/decisions` and `doc/questions` for `M3`, every link-carrying document
 * in the three removed directories for `M4`, and for `M5` every anchored link touching them or every
 * one in `doc/scheduler-upstream.md`. A partial loss inside a subject is no longer caught. **`M9` is what
 * notices a document leaving the walk now**, as a relation rather than a count.
 */
export const PROBE_TREES = {
  'decisions removed': { removes: ['doc/decisions', 'doc/questions'] },
  'decisions and plans removed': { removes: ['doc/decisions', 'doc/plans', 'doc/questions'] },
  // `](.)` is a link to a directory, which `resolveLinks` counts as a link and never as an anchored one.
  'upstream stripped of its anchors': {
    strips: { file: 'doc/scheduler-upstream.md', pattern: /\]\(#[a-z0-9-]+\)/g, with: '](.)' },
  },
};

/** Which probe trees must fire which floor, and what the floor counts. */
export const FLOORS = {
  M3: { measure: 'files', trees: ['decisions removed', 'decisions and plans removed'] },
  M4: { measure: 'sources', trees: ['decisions and plans removed'] },
  M5: { measure: 'anchored', trees: ['decisions and plans removed', 'upstream stripped of its anchors'] },
};

/** Every path a probe tree names, relative to the root — what `M10` asks the walk to link into. */
export const probeTreePaths = () => [...new Set(Object.values(PROBE_TREES)
  .flatMap((t) => [...(t.removes ?? []), ...(t.strips ? [t.strips.file] : [])]))];

/**
 * **Each floor, derived.** `files` is the walk; each probe tree is built from it in memory — the
 * removed paths left out of the walk AND made absent as link targets, so a link into them is dead and
 * counts as no anchor, exactly as in a fixture where they were deleted; the strip applied to its one
 * file's text. Verified equal to staged copies at W144, and the self-test holds every tree probe's
 * fixture to it on each run — the figures are in the check's report, and only there.
 *
 * **A floor with no tree, or naming a tree that is not defined, is `Infinity`**, so it fires on every
 * tree rather than on none: `Math.max()` of nothing is `-Infinity`, and a floor of `-Infinity + 1` is a
 * floor nothing can fail. *A floor derived to nothing must be RED, never vacuous.*
 *
 * **`cache` is the WALK's, and it is required** (W150): every probe tree reads through it, below its own
 * `absent` and `rewrite`, so the files the walk read are not read again. **A caller that forgets it is
 * REFUSED here**, because `resolveLinks` would otherwise take `undefined` as "use the default" and give
 * each tree a fresh cache — every verdict right and four walks' I/O paid in silence (W150's rule 8, `x1`).
 */
export function deriveFloors(files, root, cache) {
  if (!cache) throw new Error('deriveFloors needs the walk`s fileCache() — W150: one cache for the walk and every probe tree');
  const memo = new Map();
  const measureOf = (name) => {
    if (!memo.has(name)) {
      const t = PROBE_TREES[name];
      const absent = (t.removes ?? []).map((d) => resolve(root, d));
      const inAbsent = (f) => absent.some((a) => resolve(f) === a || resolve(f).startsWith(a + sep));
      const strip = t.strips ? resolve(root, t.strips.file) : null;
      const rewrite = strip ? (abs, text) => (abs === strip ? text.replace(t.strips.pattern, t.strips.with) : text) : null;
      memo.set(name, resolveLinks(files.filter((f) => !inAbsent(f)), root, { absent, rewrite, cache }));
    }
    return memo.get(name);
  };
  const out = {};
  for (const [id, { measure, trees }] of Object.entries(FLOORS)) {
    let floor = trees.length ? -Infinity : Infinity, from = trees.length ? null : '(no probe tree)';
    for (const name of trees) {
      if (!(name in PROBE_TREES)) { floor = Infinity; from = `"${name}", which is not a probe tree`; break; }
      const m = measureOf(name)[measure];
      // **A MEASURE no tree counts is `undefined`, and `undefined + 1 > floor` is false for ever**, so
      // the floor stayed `-Infinity` and passed everything — the conformity reader's finding 3, `M3 -Infinity`
      // printed with the check green. It is RED instead, for the reason a missing tree is.
      if (!Number.isFinite(m)) { floor = Infinity; from = `"${measure}", which no probe tree counts`; break; }
      if (m + 1 > floor) { floor = m + 1; from = `the "${name}" probe tree's ${m}`; }
    }
    out[id] = { floor, from };
  }
  // **What each tree measured, so the self-test can hold the in-memory tree to the REAL one**: it runs
  // each tree as a fixture and compares that run's own counts with these. Without it, links into a
  // removed path counted ALIVE in memory cost nothing — 73 anchored where the fixture holds 56, a floor
  // of 74 for 71 and every verdict unchanged (W144's rule 8, `d6`).
  out.measured = Object.fromEntries(Object.keys(PROBE_TREES).map((name) => {
    const m = measureOf(name);
    return [name, `${m.files} / ${m.sources} / ${m.anchored}`];
  }));
  return out;
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
  // **`examples/` joins the walk at [W144](../doc/work-items/w144-the-markdown-floors-are-derived-and-examples-is-walked.md)**
  // — [Q337](../doc/questions/q337.md). `examples/README.md` carries L6's link table, and its links
  // were checked by nothing: `M9` found it as the one markdown file the walk linked to and did not read.
  ...markdownIn(join(SCAN_ROOT, 'examples')),
  ...['README.md', 'AGENTS.md', 'CLAUDE.md'].map((f) => join(SCAN_ROOT, f)).filter(existsSync),
];

// **ONE cache for the walk and every probe tree** — W150; `fileCache` says what it holds and what it never does.
const cache = fileCache();
const r = resolveLinks(files, SCAN_ROOT, { cache });
for (const d of r.dead) fail('M1', d);
for (const d of r.deadAnchors) fail('M2', d);

// **`M3`, `M4` and `M5` are DERIVED from the probe trees since W144** — `PROBE_TREES` and
// `deriveFloors` above carry why, and what it costs. Each floor is the largest measure among the probe
// trees that must fire it, plus 1: the walk must measure MORE than each tree that removes the floor's
// subject. **The literals they replace, and every retune of them, are in `git`**: `git show
// fb64b63:scripts/check-markdown.mjs` has 362 / 120 / 72 and the measured history from P9's
// declaration to W120 — [Q142](../doc/questions/q142.md)'s window, met twelve times and retuned each
// time, which [ADR 0076](../doc/decisions/0076-a-vacuity-floor-counts-what-a-prose-cut-cannot-move.md)
// and [ADR 0078](../doc/decisions/0078-a-vacuity-floors-window-is-a-property-of-the-probe-suite.md)
// measured and this replaces. Both ADRs' rules still hold of what a derived floor counts: `M4` counts
// documents carrying a link (ADR 0076 decision 1), and the probe trees that must FIRE a floor set it
// (ADR 0078 decision 2's suite, read from the side that still binds). *The other side no longer does*:
// a probe tree that must stay QUIET constrains nothing on the real tree, because each fixture derives its
// own floors — the conformity reader's finding 1; the quiet verdicts are held by the probes' declared sets.
const floors = deriveFloors(files, SCAN_ROOT, cache);
// **M3 — the walk covers the tree.** A walk that reads no file has a floor of 1 and fails it.
if (r.files < floors.M3.floor) fail('M3', `only ${r.files} markdown file(s) were scanned, no more than ` +
  `${floors.M3.from}, so M1 and M2 are true of the walk rather than of the tree`);
if (r.sources < floors.M4.floor) fail('M4', `only ${r.sources} document(s) carried a relative link, of ` +
  `${r.files} scanned, no more than ${floors.M4.from}; M1 is vacuous below that`);
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
// Its own durability was measured at W112 — a gap of **5** then, three of them `TEMPLATE.md` files, which
// carry no link by their nature. *That figure is history*: since W116 every question is a document and
// most carry no relative link, so the gap is hundreds, and it is in the report as `files - sources`.
if (r.sources >= r.files) {
  fail('M6', `the walk scanned ${r.files} document(s) and resolved a relative link from ` +
    `${r.sources} of them. M4 counts documents that CARRY a link and M3 counts documents SCANNED; ` +
    'equal counts mean M4 has been re-sourced to the file list and is a duplicate of M3 at a lower ' +
    'floor. The gap is the documents carrying no relative link, of which three are TEMPLATE.md');
}
if (r.anchored < floors.M5.floor) fail('M5', `only ${r.anchored} link(s) carry an anchor, no more than ` +
  `${floors.M5.from}; M2 is vacuous below that`);
// **`M9` — the walk reads every markdown file it links to.** The relation that notices a document
// LEAVING the walk, which no derived floor can (see `PROBE_TREES`): a walk that skips a directory, or a
// root document, still links into it from somewhere, and every such link names a file nothing reads.
// It is not a count, so no ordinary document can close it. **It found `examples/README.md` on its first
// run** — two links from `AGENTS.md`, and the reason `examples/` joins the walk above.
for (const d of r.unwalked) fail('M9', d);
// **`M10` — every path a probe tree names is one the walk links into**, dead or alive. A MISNAMED path
// removes nothing, so its tree is the whole walk less the others' and the probe built from the same
// name removes nothing either: both halves agree, and the floor quietly loses that path's subject. A
// link into a directory a probe removed still NAMES it, so this holds in every probe tree and fails
// only on a name nothing points at. *An EMPTIED tree needs no clause: it measures the whole walk and
// its floor is the whole walk plus 1, which `M3`-`M5` fail on the real tree.*
const named = new Set([...r.targets]);
const linksInto = (abs) => [...named].some((t) => t === abs || t.startsWith(abs + sep));
for (const path of probeTreePaths()) {
  if (!linksInto(resolve(SCAN_ROOT, path))) {
    fail('M10', `the probe tree path ${path} is one no walked document links to, so it names nothing ` +
      'and the floor derived from it has lost that subject');
  }
}

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
  'M3 the walk scans more files than each probe tree that removes its subject',
  'M4 more documents carry a link than in the probe tree that removes its subject',
  'M5 more links carry an anchor than in each probe tree that removes its subject',
  'M6 M4 counts something M3 does not',
  'M9 the walk reads every markdown file it links to',
  'M10 every path a probe tree names is one the walk links into',
];
// `sources` is printed because it is what `M4` now reads, and a floor whose quantity is not in the
// report is a floor a reader cannot check the check against — W107's `compared` defect, which was
// *a value computed and never read*.
console.log(`markdown check — ${r.files} documents, ${r.links} relative links in ` +
  `${r.sources} of them, ${r.anchored} links anchored`);
// **The derived floors are PRINTED**, for the reason `sources` is: a floor whose value is not in the
// report is one a reader cannot check the check against, and these move with every document.
console.log(`floors derived from the probe trees — M3 ${floors.M3.floor}, M4 ${floors.M4.floor}, ` +
  `M5 ${floors.M5.floor}`);
for (const [name, m] of Object.entries(floors.measured)) {
  console.log(`  probe tree "${name}" measured in memory: ${m}`);
}
console.log('');
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
