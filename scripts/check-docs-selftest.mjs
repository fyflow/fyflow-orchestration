// **The negative tests for `check-docs.mjs`, checked in rather than run once by hand.**
//
//   node scripts/check-docs.mjs --self-test
//
// `doc/workflow.md` v0.3 section 5 rule 7 says a new check is negative-tested at
// birth. W9 did that and the probes lived in a scratch directory, so nothing
// re-ran them — and W9's adequacy reader measured what that costs: **8 of 9
// mutations that disabled the script's own machinery survived**, including
// `if (false)` on X3, on X4, and on the final `process.exit(1)`.
//
// A check nobody can re-break is a claim about the past. Each probe below breaks
// the reference in one specific way and asserts that the named check refuses it.
// **A probe that stops failing is a hole that has opened**, which is the whole
// point of keeping them.
//
// **A probe declares the FULL SET of checks it trips, not just one**, and P3's
// retro is why. Naming a single check does not discriminate: a probe that is
// merely *malformed* — W6's original defect, and the thing rule 7 (c) was written
// to refuse — trips X3 *and* X4, so it satisfies a probe aimed at either one and
// is reported as caught. Measured: garbage inserted into a `run` snippet and
// declared `check: 'X4'` was reported caught, and eleven of the twelve probes
// below already tripped exactly one check, so the stronger form costs one
// declaration. `X3` is the one legitimate cascade — a snippet that does not
// compile also does not run and also fails under the DOM lib — and it says so.
//
// ---------------------------------------------------------------------------
// **W29: THIS FILE GRADED NOTHING, AND NOW IT GRADES SEVEN CLAUSES.**
// [Q132](../doc/open-questions.md).
//
// Fourteen probes, and until W29 **no META pass at all**: every probe here asserts
// that the check refuses a broken **input**, and nothing asserted that the probes
// would notice a broken **check**. The contract is
// [W28](../doc/work-items/w28-a-grading-names-the-probe-it-breaks.md)'s — each entry
// names the probe it must break, the child runs that probe and no other, checks the
// mutant for INERTNESS first, and prints `inert:`, `ran:` and `outcome:` for the
// parent to grade on. `ran:` keys on the TERMINAL line rather than the report
// header, which is W28's readers' correction.
//
// **The `META` list is CAPPED at one entry per check id plus two for the report, and
// the cap is stated rather than silent** — P9 decision 3's requirement. The reason
// is arithmetic and was measured before the list was written: a bare `check-docs`
// run is **3.75 s**, and an entry is **two** of them (the inertness run and the named
// probe), so **~7.0 s each**. `check-scheduler` costs **0.13 s** a run and gets every
// clause; this file gets seven. Grading all seventeen would put this self-test at
// ~170 s and the gate at ~325 s, which is [Q133](../doc/open-questions.md)'s trade
// and not an item's to spend unremarked.
//
// **`check-docs.mjs` has 17 clauses: 14 `fail()` sites and 3 ways the report can
// lie.** Seven are graded below. **The other TEN are named here** — and this list
// was WRONG when W29 first wrote it, which is the defect this whole item exists to
// refuse. It said *"six"*, omitting two, and the same six were copied into four more
// documents; W29's conformity reader found it by the arithmetic the file itself
// supplies. **A stated cap that undercounts reads as coverage exactly as a silent
// one does.**
//
//   X1  the unclosed-fence refusal           probe: an unclosed fence
//   X1  the no-snippets-at-all vacuity guard probe: a reference with no snippets at all
//   X1  the MISSING-DOCUMENT refusal         **NO PROBE CAN REACH IT** — see below
//   X2  the check-snippet-that-throws refusal (X4b)  probe: the re-tagged block
//   X4  the process.exit() refusal           probe: the process.exit() snippet
//   X4  the `if (false)` refusal             probe: the wrapped assertions
//   X4  the snippet-does-not-RUN report      probe: a snippet that stops producing its result
//   X4  the RUN_FLOOR ratchet                probe: a whole `run` snippet deleted
//   X3  the `tsc failed:` fallback           covered jointly by the X3 entry below
//   report  a row deleted from the `checks` array — reachable by `agree`, not graded
//
// **One of those ten is a different kind and is called out rather than listed
// quietly.** `check-docs.mjs`'s missing-document refusal is ungraded **and
// unprobed**: every probe writes its mutated reference to disk and points
// `CHECK_DOCS_DOC` at it, so no probe can present a document that is not there.
// Measured: made inert, **all 14 probes still pass at exit 0**. That is
// [Q132](../doc/open-questions.md)'s *no probe at all* category, in a file
// [W30](../doc/work-items/w30-the-clauses-nothing-probes.md) does not own.
//
// **And a finding from the survey that decided which seven to take.** Four of those
// clauses, made inert, are noticed **under a different id**: removing the near-fence
// refusal, the vacuity guard, the untagged-block refusal or the re-tag refusal each
// deletes a snippet from the extract, so **`RUN_FLOOR` fires and the failure is
// reported as `X4`**. The run still fails; it fails for the wrong reason. A
// `r.status !== 0` grading calls that *noticed*; the named-probe grading calls it
// `disappeared` on the id the entry declared, which is right. That is
// [Q102](../doc/open-questions.md)'s ratchet holding up four clauses that are not
// its own, and its row does not say so.
//
// **What this file does NOT reach**, measured against this file as shipped.
// `scripts/check-policies-selftest.mjs:29-51` records the fixed point — nothing
// inside a self-grading file can assert that the file grades — and this file is
// further inside it than `check-source-selftest.mjs`, because **it has no `SELF`
// list**: nothing bounds `PROBES` or `META` from one list further out, so both
// floors, the verdict and the matched-nothing guard survive being disabled here
// where a `SELF` list catches three of them there.
// [W31](../doc/work-items/w31-the-self-list-check-policies-never-had.md) is narrowed
// to `check-policies`, so no declared item picks this file up.
//
//   `MIN_PROBES` / `MIN_META` -> `0`, with the list shortened too   survives
//   `return noticed === META.length ? 0 : 1` -> `return 0`          survives
//   `if (v.refused) caught++` -> `caught++`                         survives
//   `outcome === 'caught'` accepted as a grading                    survives
//   `RAN` forced true                                               survives
//   the inertness check forced true                                 survives
//   the "mutation matched nothing" guard -> `if (false)`            survives
//
// **And one guard is DEAD rather than unasserted**, named so the next reader does
// not spend a two-minute run on it: `const nested = !!process.env.CHECK_DOCS_SCRIPT`
// and its `if (nested) return 0` are unreachable, because every META child also sets
// `CHECK_DOCS_PROBE` and returns from single-probe mode first. It is load-bearing in
// `check-source-selftest.mjs`, whose `SELF` children do not set a probe.
//
// **This file drops `fires` from W28's outcome set**, deliberately: that verdict is
// for a probe whose declared set is EMPTY, and every probe here declares a check.
// [Q147](../doc/open-questions.md)'s row said otherwise until W29's conformity
// reader measured it.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

/**
 * **This file's own repository root**, so `ALL_CHECKS` below can read
 * `check-docs.mjs`'s report list at module scope rather than waiting for the `root`
 * argument `selfTest` receives. It is the same derivation `check-docs.mjs` uses.
 */
const SELFTEST_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Each probe returns the mutated reference and names the check that must refuse
 * it. `also` declares the checks it is permitted to trip in addition — the only
 * one is X3's cascade, and anything tripping a check it did not declare is a
 * probe that is broken rather than a hole that is closed.
 */
const PROBES = [
  {
    name: 'a snippet that stops compiling',
    check: 'X3',
    // A snippet that does not compile also does not execute (X4) and does not
    // compile under the DOM lib either (X5). This is the only declared cascade.
    also: ['X4', 'X5'],
    mutate: (t) => t.replace('import { Driver, fold, liveToken,', 'import { Driver, fold, noSuchExport,'),
  },
  {
    name: 'a snippet that stops producing its stated result',
    check: 'X4',
    mutate: (t) => t.replace("if (!accepted || again) throw", "if (accepted || !again) throw"),
  },
  {
    name: 'an untagged block',
    check: 'X2',
    // + X8 since W69: this mutates the FIRST ```ts run fence, which is the getting-started snippet, and X8 sees AGENTS.md`s copy differ from README`s — measured, not assumed.
    also: ['X8'],
    mutate: (t) => t.replace('```ts run', '```ts'),
  },
  {
    // W59: the sub-path import is REWRITTEN to its published entry before typechecking; a
    // specifier the rewrite does not recognise reaches `tsc` as written and fails to resolve —
    // under both lib sets, so `X5` cascades exactly as it does for the compile probe above. This
    // is what would notice the rewrite being dropped: with it gone the CLEAN reference fails the
    // same way, and no probe is needed to say so.
    name: 'a snippet importing the sub-path by a name the rewrite does not recognise',
    check: 'X3',
    // **`X4` joined the set at W66**, whose section 12 leads with a `run` snippet importing this
    // sub-path: a name the rewrite cannot resolve now breaks a snippet that EXECUTES as well as the
    // ones that only typecheck. Rule 7 (c) — the set is declared, so the item that widens it says so,
    // and the gate's own self-test is what said the set had moved.
    // + X8 since W69: this mutates the FIRST ```ts run fence, which is the getting-started snippet, and X8 sees AGENTS.md`s copy differ from README`s — measured, not assumed.
    also: ['X4', 'X5', 'X8'],
    mutate: (t) => t.replace("from 'fyflow-orchestration/scheduler'", "from 'fyflow-orchestration/schedulerr'"),
  },
  {
    // W62: the jsonata sub-path's rewrite, the same shape one sub-path over — a specifier the
    // rewrite does not recognise reaches `tsc` as written and fails to resolve under both lib sets.
    name: 'a snippet importing the jsonata sub-path by a name the rewrite does not recognise',
    check: 'X3',
    also: ['X5'],
    mutate: (t) => t.replace("from 'fyflow-orchestration/jsonata'", "from 'fyflow-orchestration/jsonataa'"),
  },
  // --- X6: AGENTS.md's cost figures against spec/flow-definition.md's, both ways ---
  //
  // **Three of `X6`'s four clauses are reachable from this side**, which is what the
  // harness can mutate: it writes a modified AGENTS.md and points the check at it.
  // Both DIRECTIONS of the comparison are here — a figure that disagrees and a figure
  // that is missing — because a one-directional binding is what
  // [Q196](../doc/open-questions.md) records as the thing a type cannot fix.
  {
    name: 'a cost figure in AGENTS.md that spec/flow-definition.md does not state',
    check: 'X6',
    mutate: (t) => t.replace('**613.6 ms** — **71x**', '**61.3 ms** — **7x**'),
  },
  {
    name: 'a cost figure spec/flow-definition.md states that AGENTS.md drops — the OTHER direction',
    check: 'X6',
    mutate: (t) => t.replace('the `?` suffix costs nothing (**617.4 ms**)', 'the `?` suffix costs nothing'),
  },
  {
    // **This one trips only the `missing` direction, and that is why it exists.**
    // Changing a figure trips BOTH clauses at once — co-firing, which W29 measured is
    // invisible to set equality — so neither could be graded alone. Adding a figure
    // the spec does not have separates them.
    name: 'AGENTS.md quotes an EXTRA figure the spec does not have — the `missing` direction alone',
    check: 'X6',
    mutate: (t) => t.replace('the `?` suffix costs nothing (**617.4 ms**)',
      'the `?` suffix costs nothing (**617.4 ms**, and once **99.9 ms**)'),
  },
  // --- X7: AGENTS.md's refusal count against spec/flow-definition.md section 5's rows — W65 (`d4`) ---
  {
    name: 'AGENTS.md`s refusal count moved to 35 while section 5 declares 34',
    check: 'X7',
    mutate: (t) => t.replace('There are **34 refusals** over the id range `FD-V1` … `FD-V38`', 'There are **35 refusals** over the id range `FD-V1` … `FD-V38`'),
  },
  {
    name: 'AGENTS.md`s id range ends at FD-V37 while section 5`s highest row is FD-V38 — the range clause alone',
    check: 'X7',
    mutate: (t) => t.replace('There are **34 refusals** over the id range `FD-V1` … `FD-V38`', 'There are **34 refusals** over the id range `FD-V1` … `FD-V37`'),
  },
  {
    name: 'AGENTS.md`s cost paragraph moved, so X6 cannot find its own subject',
    check: 'X6',
    mutate: (t) => t.replace('**And inside a `map`, what it costs is what you point it at.**',
      '**And inside a map, the cost is what you point it at.**'),
  },
  {
    name: 'an untagged block whose preceding line merely contains the word "prose"',
    check: 'X2',
    // + X8 since W69: this mutates the FIRST ```ts run fence, which is the getting-started snippet, and X8 sees AGENTS.md`s copy differ from README`s — measured, not assumed.
    also: ['X8'],
    mutate: (t) => t.replace(
      '```ts run',
      'The paragraphs below are prose.\n\n```ts',
    ),
  },
  {
    name: 'a fence spelled ```typescript, which the extractor would otherwise skip in silence',
    check: 'X1',
    // + X8 since W69: this mutates the FIRST ```ts run fence, which is the getting-started snippet, and X8 sees AGENTS.md`s copy differ from README`s — measured, not assumed.
    also: ['X8'],
    mutate: (t) => t.replace('```ts run', '```typescript run'),
  },
  {
    name: 'a fence spelled ```TS, ditto',
    check: 'X1',
    // + X8 since W69: this mutates the FIRST ```ts run fence, which is the getting-started snippet, and X8 sees AGENTS.md`s copy differ from README`s — measured, not assumed.
    also: ['X8'],
    mutate: (t) => t.replace('```ts run', '```TS run'),
  },
  {
    name: 'an indented fence, ditto',
    check: 'X1',
    // + X8 since W69: this mutates the FIRST ```ts run fence, which is the getting-started snippet, and X8 sees AGENTS.md`s copy differ from README`s — measured, not assumed.
    also: ['X8'],
    mutate: (t) => t.replace('```ts run', '   ```ts run'),
  },
  {
    name: 'an unclosed fence',
    check: 'X1',
    // + X8 since W74: the LAST closing fence in the reference is now section 15's, and that
    // snippet is one X8 PAIRS — so removing it leaves the pairing with no `run` fence under the
    // heading it names. MEASURED, not assumed: this probe read `[X1,X8]` against its declared
    // `[X1]` on W74's first confirming run, which is rule 7 (c) discriminating exactly as it is
    // meant to, in a GATE ENTRY. Before W74 the last fence was section 14's, which X8 does not pair.
    also: ['X8'],
    // The LAST closing fence in the file, so the unclosed block runs to EOF.
    mutate: (t) => t.slice(0, t.lastIndexOf('```')) + t.slice(t.lastIndexOf('```') + 3),
  },
  {
    name: 'a reference with no snippets at all',
    check: 'X1',
    // + X8 since W69: this mutates the FIRST ```ts run fence, which is the getting-started snippet, and X8 sees AGENTS.md`s copy differ from README`s — measured, not assumed.
    also: ['X8'],
    mutate: (t) => t.replace(/```ts[\s\S]*?```/g, ''),
  },
  {
    name: 'a `run` snippet whose assertions are deleted, so it only exits zero',
    check: 'X4',
    // + X8 since W69: this mutates the FIRST ```ts run fence, which is the getting-started snippet, and X8 sees AGENTS.md`s copy differ from README`s — measured, not assumed.
    also: ['X8'],
    mutate: (t) => t.replace(/^.*\bthrow new Error\(.*$/gm, ''),
  },
  {
    name: 'a `run` snippet that calls process.exit() ahead of its assertions',
    check: 'X4',
    // Pinned to §2's literal text. It read `driver.start('run-1', { name: 'world' })`
    // until W13 moved the run id to the constructor, and requirement (b) — a probe
    // must assert it changed its input — is what turned that into a red gate
    // instead of a probe silently passing for the wrong reason.
    mutate: (t) => t.replace('driver.start({ name: \'world\' });',
      'process.exit(0);\ndriver.start({ name: \'world\' });'),
  },
  {
    name: 'a failing assertion smuggled past X4 by re-tagging the block `check`',
    check: 'X2',
    // + X8 since W69: this mutates the FIRST ```ts run fence, which is the getting-started snippet, and X8 sees AGENTS.md`s copy differ from README`s — measured, not assumed.
    also: ['X8'],
    mutate: (t) => t.replace('```ts run', '```ts check'),
  },
  {
    name: 'a `run` snippet whose assertions are wrapped in `if (false)`',
    check: 'X4',
    // The third road into X4's vacuity, after deleted assertions and
    // `process.exit(0)`. Found by W16's adequacy reader on the policy-set
    // snippet, where both `throw`s survived being made unreachable.
    mutate: (t) => t.replace(
      "if (POLICIES['live-token'] !== liveToken) throw new Error('POLICIES must expose the same objects');",
      "if (false) { if (POLICIES['live-token'] !== liveToken) throw new Error('unreachable'); }"),
  },
  {
    name: 'a whole `run` snippet deleted, which every other check is blind to',
    check: 'X4',
    // + X8 since W69: this mutates the FIRST ```ts run fence, which is the getting-started snippet, and X8 sees AGENTS.md`s copy differ from README`s — measured, not assumed.
    also: ['X8'],
    mutate: (t) => {
      const i = t.indexOf('```ts run');
      const j = t.indexOf('```', t.indexOf(String.fromCharCode(10), i));
      return t.slice(0, i) + t.slice(j + 3);
    },
  },
  // ---- X8: the README's getting-started snippet IS AGENTS.md section 2's — W69 ----
  // One probe per DIRECTION of a both-ways comparison (`doc/workflow.md` section 5 rule 8, obligation
  // (e)'s third shape: *find the other list and compare BOTH WAYS*). Each edits a COMMENT inside the
  // snippet, so the snippet still compiles and runs and only X8 sees the copies disagree — a probe
  // that edited code would trip X4 as well and could not tell X8's clause from X4's.
  {
    name: 'AGENTS.md`s copy of the getting-started snippet differs from README.md`s by one character — the AGENTS direction',
    check: 'X8',
    mutate: (t) => t.replace('// THE REGISTRY — what exists.', '// THE REGISTRY — what exist.'),
  },
  {
    name: 'README.md`s copy of the getting-started snippet differs from AGENTS.md`s by one character — the README direction',
    check: 'X8',
    mutate: (t) => t,
    readme: (r) => r.replace('// THE REGISTRY — what exists.', '// THE REGISTRY — what exist.'),
  },
  {
    // **The heading AND its fence**, so this trips the missing-heading clause ALONE. Until W69 and W70 ran their readers it
    // renamed the heading only, which left the fence under an unlisted one and tripped the OTHER
    // direction too — both under id `X8`, so set equality could not tell them apart and EITHER
    // clause was deletable in silence. W69's and W70's adequacy readers measured both halves at a
    // full 26/26, 13/13, exit 0. That is `X6`'s co-firing shape, and its fix is the same: a probe
    // per clause, each named for the one clause it trips.
    name: 'README.md loses its "Getting started" heading AND the fence under it — the missing-heading clause alone',
    check: 'X8',
    mutate: (t) => t,
    readme: (r) => {
      const renamed = r.replace('## Getting started\n', '## Getting going\n');
      const i = renamed.indexOf('```ts\n');
      const j = renamed.indexOf('\n```', i) + 4;
      return renamed.slice(0, i) + renamed.slice(j);
    },
  },
  {
    name: 'README.md`s SECOND snippet — the routing flow — differs from AGENTS.md`s by one character: X8 over every fence, not the first (W70)',
    check: 'X8',
    mutate: (t) => t,
    readme: (r) => r.replace('// THE FLOW — a DECISION, a FAN-OUT, a JOIN.', '// THE FLOW — a DECISION, a FAN-OUT, a JOI.'),
  },
  // ---- X8's remaining clauses, one probe each, from W69's and W70's ADEQUACY READERS ----
  // Every one of these was measured as an UNDECLARED SURVIVOR: the clause could be disabled with
  // this self-test at 26/26, 13/13, exit 0, because no probe reached it. Each edit below is the
  // reader's own, checked back in as `doc/workflow.md` section 5 rule 8's re-run requires.
  {
    name: 'README.md keeps "A flow that decides" and loses the fence under it — the missing-FENCE clause alone',
    check: 'X8',
    mutate: (t) => t,
    readme: (r) => {
      const i = r.indexOf('```ts\n', r.indexOf('## A flow that decides'));
      const j = r.indexOf('\n```', i) + 4;
      return r.slice(0, i) + r.slice(j);
    },
  },
  {
    name: 'README.md gains a ```ts fence under a heading X8`s list does not name, both listed headings intact — the other direction alone',
    check: 'X8',
    mutate: (t) => t,
    readme: (r) => r.replace('## The idea\n', '## A second example nothing holds\n\n```ts\nconsole.log(1);\n```\n\n## The idea\n'),
  },
  {
    // Sections are cut AT `## ` headings, so the README's OPENING — its title, its status line, the
    // first thing a registry-page visitor reads — was in no section and held by nothing.
    name: 'README.md gains a ```ts fence ABOVE its first heading, where no section reached',
    check: 'X8',
    mutate: (t) => t,
    readme: (r) => r.replace('## Getting started\n', '```ts\nconsole.log(2);\n```\n\n## Getting started\n'),
  },
  {
    // `X1`'s reason, one document across: a near spelling skips in silence, and `X1` reads `DOCS`.
    name: 'README.md gains a ```typescript fence, which X8`s ```ts comparison cannot see — the near-spelling clause alone',
    check: 'X8',
    mutate: (t) => t,
    readme: (r) => r.replace('## The idea\n', '## A near spelling\n\n```typescript\nconsole.log(3);\n```\n\n## The idea\n'),
  },
  {
    name: 'README.md carries a SECOND ```ts fence under "## Getting started", which X8 pairs with ONE snippet',
    check: 'X8',
    mutate: (t) => t,
    readme: (r) => {
      const i = r.indexOf('```ts\n');
      const j = r.indexOf('\n```', i) + 4;
      return r.slice(0, j) + '\n' + r.slice(i, j) + r.slice(j);
    },
  },
  {
    // The PAIRING's other end: if the AGENTS heading a pair names stops carrying exactly one `run`
    // fence, the pair has nothing to compare against and must say so rather than pick.
    name: 'AGENTS.md`s "The same on the RUNTIME" heading is renamed, so the pair X8 declares has no snippet',
    check: 'X8',
    mutate: (t) => t.replace('### The same on the RUNTIME — a decision, a fan-out and a join on real workers',
      '### The same on the runtime, renamed'),
  },
  {
    // **The TAIL.** Every other X8 probe edits a comment in the snippet's first lines, so an
    // equality blind to the last 400 characters — where BOTH assertions live — was green. W69's
    // adequacy reader measured exactly that: the README could show an expected value the executed
    // copy does not have.
    name: 'README.md`s copy of the getting-started snippet differs from AGENTS.md`s in its LAST lines — the expected value itself',
    check: 'X8',
    mutate: (t) => t,
    readme: (r) => r.replace('\'{"text":"hello world !"}\'', '\'{"text":"hello world!"}\''),
  },
];

/** Every check `check-docs.mjs` reports under, in the order it reports them. */
/**
 * **DERIVED from `check-docs.mjs`'s own report list, not written down here** — W46,
 * and it is [Q43](../doc/open-questions.md)'s class caught live in this file. It read
 * `['X1', 'X2', 'X3', 'X4', 'X5']`, and W46 shipped **`X6`** into `check-docs.mjs`
 * with four clauses, ran this self-test, and got **14/14 probes caught, 8/8 noticed,
 * exit 0** — a whole check id with no probe and no grading, invisible because the
 * universe of ids was a literal beside the thing it was supposed to bound.
 * `doc/workflow.md` section 5 rule 8 obligation (e)'s third shape: *find the other
 * list and compare both ways.* This IS the other list.
 *
 * **W36 found the identical defect in another self-test** — a closed allowlist making
 * a new check's failure lines invisible to the id parse — and closed it there. This
 * is the second occurrence, in the file that had not been fixed.
 */
const ALL_CHECKS = (() => {
  const src = readFileSync(join(SELFTEST_ROOT, 'scripts', 'check-docs.mjs'), 'utf8');
  const head = src.indexOf('const checks = [');
  const body = head < 0 ? '' : src.slice(head, src.indexOf('];', head));
  const ids = [...new Set((body.match(/'(X\d+) /g) ?? []).map((m) => m.slice(1, -1)))].sort();
  if (ids.length === 0) {
    console.log('check-docs self-test — check-docs.mjs`s `checks` array named no X-ids.');
    console.log('  FAIL  the universe of check ids could not be derived, so every coverage bound ' +
      'below would be vacuous. Q43`s class, and the reason this list is not a literal.');
    process.exit(1);
  }
  return ids;
})();

/**
 * **Did the mutated check RUN TO COMPLETION?** A grading requires this, which is how
 * a mutant that **crashed** is told apart from one that ran and stopped detecting.
 * Keyed on the TERMINAL line rather than on the report header — W28's readers
 * measured that a header-keyed guard covers the checks and not the report or the
 * exit path, so a mutant made to throw one line after the header scored *noticed*
 * at a cost of 0.
 */
const RAN = (out) => /^(All checks passed|\d+ failure\(s\)\.)/m.test(out);

/**
 * The floor `check-policies-selftest.mjs` learned to carry: `caught === PROBES.length`
 * is **vacuously true at zero**, so emptying this list — or deleting one probe from
 * it — would report `0/0 probes caught` and exit 0. W16's adequacy reader's finding,
 * inherited rather than rediscovered; **this file had no floor at all until W29.**
 */
// 18 until W59, which added the sub-path probe and raised the floor to the count it ships (Q102);
// 20 until W69, which added X8's three and raised it to the count it ships — 25; 26 since W70's
// second-fence probe; **33 since W69 and W70 ran their reader passes**, which gave each of `X8`'s clauses a probe that trips THAT
// clause and no other, after both adequacy readers measured six of them deletable at 26/26, 13/13.
const MIN_PROBES = 33;

/** The same floor for `META`, and for the same reason. */
const MIN_META = 20;

/**
 * **The mutations `check-docs.mjs` itself is run against**, one per check id plus
 * two for the report block, each naming the probe it must break. The cap and the
 * six clauses it leaves out are in the header; the arithmetic behind it is ~7.0 s
 * an entry against `check-scheduler`'s ~0.5 s.
 *
 * Expected values come from each clause's own text in the check — never from
 * running a mutant and recording which probe happened to react, which is the audit
 * W28 measured and found says nothing about whether the INTENDED probe fails.
 *
 * **Q143 does not apply to this list**: these mutations edit `check-docs.mjs` and
 * never this file, so an anchor cannot match its own quotation. The hazard that
 * does apply is an anchor matching the check in more than one place, and the
 * harness refuses that below.
 */
const META = [
  // (a) the rule's clauses — one per id, chosen for blast radius.
  // Re-anchored at W70, which generalised the clause from one compared block to every README fence
  // (rule 7 (b): the W69 anchor `if (rm.body !== ag.body)` no longer exists).
  // **`X8`'s clauses, ONE ENTRY EACH, and each named for the probe that trips THAT clause alone**
  // — and the reason is `X6`'s two paragraphs below, reached again from two directions. W69's
  // and W70's adequacy readers each measured that three of X8's four clauses could be disabled with
  // this self-test at a full 26/26 probes, 13/13 noticed, exit 0: the one probe that reached the
  // *both ways* direction ALSO tripped the missing-heading clause, both under id `X8`, and grading
  // is set equality over ids. Co-firing is invisible to a set. The probes were split first, and
  // these entries follow them.
  ['X8`s equality clause disabled, so a README copy can drift from the executed one in silence — W69, re-anchored W70 and again at the reader passes',
    'AGENTS.md`s copy of the getting-started snippet differs from README.md`s by one character — the AGENTS direction',
    (t) => t.replace('      if (bodies[0] !== theirs[0]) {', '      if (false) {')],
  ['X8`s missing-HEADING clause disabled, so a README section X8 names can vanish in silence',
    'README.md loses its "Getting started" heading AND the fence under it — the missing-heading clause alone',
    (t) => t.replace("      if (!s) { fail('X8',", "      if (!s) { if (0) fail('X8',")],
  ['X8`s missing-FENCE clause disabled, so a README heading can promise an example and carry none',
    'README.md keeps "A flow that decides" and loses the fence under it — the missing-FENCE clause alone',
    (t) => t.replace("      if (bodies.length === 0) { fail('X8',", "      if (bodies.length === 0) { if (0) fail('X8',")],
  ['X8`s one-fence-per-pair clause disabled, so a SECOND fence under a listed heading is held by nothing',
    'README.md carries a SECOND ```ts fence under "## Getting started", which X8 pairs with ONE snippet',
    (t) => t.replace('        fail(\'X8\', `${README} carries ${bodies.length}', '        if (0) fail(\'X8\', `${README} carries ${bodies.length}')],
  ['X8`s PAIRING clause disabled, so a pair whose AGENTS.md snippet is gone compares nothing and says nothing',
    'AGENTS.md`s "The same on the RUNTIME" heading is renamed, so the pair X8 declares has no snippet',
    (t) => t.replace('        fail(\'X8\', `X8 pairs', '        if (0) fail(\'X8\', `X8 pairs')],
  ['X8`s other direction disabled — a ```ts fence under an unlisted heading, which is half of `both ways`',
    'README.md gains a ```ts fence under a heading X8`s list does not name, both listed headings intact — the other direction alone',
    (t) => t.replace('      if (listed.has(s.title)) continue;', '      if (true) continue;')],
  // The OPENING is its own mechanism, not its own clause: (ii) reaches it only because the section
  // list begins with it. Deleting that one element puts the README's first screen back outside
  // every section, which is where W69's adequacy reader found a fence living unheld.
  ['X8 stops treating the README`s opening as a section, so a fence above the first heading is unreachable again',
    'README.md gains a ```ts fence ABOVE its first heading, where no section reached',
    (t) => t.replace('const sections = [{ title: README_OPENING, text: rmText.slice(0, heads.length ? heads[0].index : rmText.length) }];',
      'const sections = [];')],
  ['X8`s near-spelling clause disabled, so a ```typescript example in the README is held by nothing',
    'README.md gains a ```typescript fence, which X8`s ```ts comparison cannot see — the near-spelling clause alone',
    (t) => t.replace("      if (NEAR_FENCE.test(line) && line.trim() !== '```ts') {", '      if (false) {')],
  ['X1`s near-fence refusal disabled, so a variant spelling silently drops a snippet',
    'a fence spelled ```typescript, which the extractor would otherwise skip in silence',
    (t) => t.replace('      if (NEAR_FENCE.test(lines[i])) {', '      if (false) {')],
  ['X2`s untagged-block refusal disabled, so an unchecked snippet passes',
    'an untagged block',
    (t) => t.replace('  if (!OPT_OUT.test(b.prevLine)) {', '  if (false) {')],
  ['X3`s typecheck report disabled, so tsc can fail in silence',
    'a snippet that stops compiling',
    (t) => t.replace('  if (tsc.status !== 0) {', '  if (false) {')],
  ['X4a`s no-throw refusal disabled, so a snippet that asserts nothing passes',
    'a `run` snippet whose assertions are deleted, so it only exits zero',
    (t) => t.replace('  if (!/\\bthrow\\b/.test(body)) {', '  if (false) {')],
  // Re-anchored by W57: the allowance was `> 1` while Q71 accounted for one failing snippet,
  // and is `> 0` since W57 closed it. The old anchor then matched nothing and this file said
  // so — rule 7 (b) — rather than grading a mutation that never happened.
  ['X5`s DOM-lib refusal disabled, so a snippet failing under the consumer`s default lib passes',
    'a snippet that stops compiling',
    (t) => t.replace('  if (hit.size > 0) {', '  if (false) {')],
  // **`X6`'s comparison disabled, so three documents can drift apart in silence** —
  // W46. The clause it silences is the *AGENTS.md quotes what the spec does not*
  // direction, which is what the named probe trips.
  // **TWO entries, one per DIRECTION, and each named for the probe that trips only
  // that one.** The first version had one entry named for the change-a-figure probe,
  // and it came back **STILL CAUGHT**: changing a figure trips `missing` AND `extra`
  // together, so disabling either leaves the other reporting under the same id and
  // set equality cannot tell. That is W29's **co-firing** shape — detectable by the
  // failure COUNT and not by the id set — and the fix is a probe per direction rather
  // than a better grading.
  ['X6`s `AGENTS quotes what the spec does not` direction disabled',
    'AGENTS.md quotes an EXTRA figure the spec does not have — the `missing` direction alone',
    (t) => t.replace('      if (missing.length) {', '      if (false) {')],
  // W65 (`d4`): X7's two clauses, one probe each.
  ['X7`s count clause disabled', 'AGENTS.md`s refusal count moved to 35 while section 5 declares 34',
    (t) => t.replace('      if (Number(said[1]) !== live) fail', '      if (false) fail')],
  ['X7`s range-end clause disabled', 'AGENTS.md`s id range ends at FD-V37 while section 5`s highest row is FD-V38 — the range clause alone',
    (t) => t.replace('      if (Number(said[2]) !== top) fail', '      if (false) fail')],
  ['X6`s `the spec states what AGENTS does not quote` direction disabled — the other way',
    'a cost figure spec/flow-definition.md states that AGENTS.md drops — the OTHER direction',
    (t) => t.replace('      if (extra.length) {', '      if (false) {')],
  // (b) the report block. **These two are why the `agree` projection exists**, and
  // it was measured before it was written: with the verdict loop forced to `ok`,
  // every probe still reported `wanted [X2] got [X2] exit 1` and passed. A mutation
  // to how failures are DISPLAYED changes no failure id, so no set comparison can
  // see one — [Q100](../doc/open-questions.md)'s class.
  ['the report prints `ok` for every row while the failures below it say otherwise',
    'an untagged block',
    (t) => t.replace(
      "  console.log(`  ${bad.length ? 'FAIL' : 'ok  '}  ${c}${bad.length ? ` (${bad.length})` : ''}`);",
      '  console.log(`  ok    ${c}`);')],
  ['the failure report and the non-zero exit disabled — the check finds everything and says nothing',
    'an untagged block',
    (t) => t.replace('if (failures.length) {', 'if (false) {')],
  // **The exit path ALONE.** The entry above bundles the report and the exit, so
  // `tripped` goes empty and the set comparison catches it — which meant nothing
  // asserted that this harness reads the exit code at all. W29's adequacy reader
  // deleted the `r.status !== 0` term from `refused` in both files for a cost of
  // **0**. With the report left intact and only `process.exit(1)` gone, the check
  // finds every failure, prints every failure, prints every FAIL row, and tells the
  // shell it is fine — and the exit code is the only thing `npm run gate` reads.
  ['the non-zero exit removed while the report is left intact',
    'a fence spelled ```typescript, which the extractor would otherwise skip in silence',
    (t) => t.replace('  console.log(`\\n${failures.length} failure(s).`);\n  process.exit(1);',
      '  console.log(`\\n${failures.length} failure(s).`);')],
];

export async function selfTest(root) {
  const doc = readFileSync(join(root, 'AGENTS.md'), 'utf8');
  // The README, for `X8`'s probes: a probe may carry `readme: (t) => t'` beside `mutate`, staged the
  // same way and handed to the check as `CHECK_DOCS_README` — one direction of a both-ways
  // comparison needs a mutation on each side (W69).
  const readme = readFileSync(join(root, 'README.md'), 'utf8');
  const dir = join(root, 'dev-dist', 'docs-selftest');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  // **The script under test.** `CHECK_DOCS_SCRIPT` is how the META pass points this
  // same suite at a deliberately broken copy of it. Without it there was no way to
  // run a probe against anything but the real check, which is why this file could
  // not have had a META pass whatever else it did.
  const script = process.env.CHECK_DOCS_SCRIPT ?? join(root, 'scripts', 'check-docs.mjs');
  const nested = !!process.env.CHECK_DOCS_SCRIPT;

  if (PROBES.length < MIN_PROBES || META.length < MIN_META) {
    console.log(`check-docs self-test — ${PROBES.length} probes (floor ${MIN_PROBES}), ` +
      `${META.length} meta (floor ${MIN_META}).`);
    console.log('  FAIL  a list is short, and `caught === length` is vacuous at zero.');
    rmSync(dir, { recursive: true, force: true });
    return 1;
  }

  // **`META` is bounded by CONTENT as well as by count**, and W29's adequacy reader
  // is why: it replaced the `X5` entry with a copy of the `X1` entry and the run
  // stayed at `7/7`, exit 0, floor satisfied — with `X5`'s only grading silently
  // gone. `X5` is the clause whose entire job is a number that must not drift
  // ([Q71](../doc/open-questions.md)), so that is the worst one to lose quietly.
  // **An entry can leave without the list getting shorter**, which is the gap in
  // `doc/workflow.md` rule 8's fourth obligation as it was being applied here.
  {
    const src = readFileSync(join(root, 'scripts', 'check-docs.mjs'), 'utf8');
    const mutants = META.map(([, , m]) => { try { return m(src); } catch { return null; } });
    if (new Set(mutants).size !== META.length) {
      console.log(`check-docs self-test — ${META.length} meta entries, ` +
        `${new Set(mutants).size} distinct mutations.`);
      console.log('  FAIL  two META entries produce the SAME mutation, so one clause is graded ' +
        'twice and another not at all — a floor counts entries and cannot see this.');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
    // **Which id does an entry target?** Every clause entry here disables the GUARD
    // in front of a `fail()` rather than the call itself, so counting call sites —
    // which is what the sibling file can do — sees nothing. What identifies the
    // target is WHERE the edit lands: the first byte at which mutant and source
    // diverge, and then the next `fail('X?'` after it. Each of the five clause
    // entries sits immediately above the call it silences; the three report entries
    // sit below every call and contribute no id, which is correct rather than a gap.
    const idAt = (m) => {
      if (m === null) return null;
      let i = 0;
      while (i < m.length && i < src.length && m[i] === src[i]) i++;
      return (src.slice(i).match(/fail\('(X\d)'/) ?? [, null])[1];
    };
    const covered = new Set(mutants.map(idAt).filter(Boolean));
    const missing = ALL_CHECKS.filter((id) => !covered.has(id));
    if (missing.length) {
      console.log(`check-docs self-test — no META entry reaches any ${missing.join(', ')} clause.`);
      console.log('  FAIL  a check id with no grading at all; the count of entries says nothing ' +
        'about which clauses they reach.');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
  }

  /** One probe, run once. Shared by the main pass and single-probe mode so the two cannot drift. */
  const runOne = (i, probe) => {
    const declared = [probe.check, ...(probe.also ?? [])].sort();
    const rel = `dev-dist/docs-selftest/${String(i).padStart(2, '0')}.md`;
    const mutated = probe.mutate(doc);
    const readmeMutated = probe.readme ? probe.readme(readme) : null;
    if (mutated === doc && (readmeMutated === null || readmeMutated === readme)) {
      // A probe that changes nothing passes for the wrong reason — the exact
      // vacuity rule 7 (b) refuses. A README-side probe is vacuous on the same terms.
      return { vacuous: true, refused: false, ran: false, declared, tripped: [], agree: true,
        msg: 'the mutation matched nothing' };
    }
    writeFileSync(join(root, rel), mutated);
    const env = { ...process.env, CHECK_DOCS_DOC: rel };
    if (readmeMutated !== null) {
      const rrel = rel.replace(/\.md$/, '-readme.md');
      writeFileSync(join(root, rrel), readmeMutated);
      env.CHECK_DOCS_README = rrel;
    }
    const r = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', env, timeout: 300_000 });
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
    // The set of checks that actually reported a failure, compared against the
    // set this probe declared. Equality, not membership: a probe that trips a
    // check it did not name is malformed, and a malformed probe reported as
    // caught is the whole reason this file exists.
    const tripped = ALL_CHECKS.filter((x) => out.includes(`${x}: `));
    // **AND the per-check REPORT ROWS, which are a second, independent projection of
    // the same fact.** W29, and it was measured live in this file: deleting a row
    // from the `checks` array, and forcing the verdict column to `ok`, were both
    // invisible to every probe here.
    const rows = [...out.matchAll(/^ {2}(ok {2}|FAIL) {2}(X\d+) /gm)]
      .filter((m) => m[1] === 'FAIL').map((m) => m[2]).sort();
    const agree = rows.join(',') === tripped.join(',');
    const refused = r.status !== 0 && tripped.join(',') === declared.join(',') && agree;
    return {
      vacuous: false, refused, ran: RAN(out), declared, tripped, agree, status: r.status,
      msg: `exited ${r.status}, wanted [${declared.join(',')}], got [${tripped.join(',')}]` +
        `${agree ? '' : `, report rows said [${rows.join(',')}]`}`,
    };
  };

  /**
   * **Is the mutated check INERT on the untouched tree?** Rule 8 asks for a mutation
   * that is *present but inert*. A mutant that fails on the repository's own
   * reference is still NOTICED — by the corpus, more strongly than by any probe —
   * but its probe verdict is meaningless, because every id it reports may be noise
   * rather than detection. **This is the expensive half of an entry** and it is not
   * optional: without it a `disappeared` verdict cannot be told from a mutant that
   * was already failing.
   */
  const inertOnCleanTree = () => {
    const env = { ...process.env };
    delete env.CHECK_DOCS_DOC;
    delete env.CHECK_DOCS_README;
    return spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', env, timeout: 300_000 }).status === 0;
  };

  // --- single-probe mode: the META pass names ONE probe and this runs that one ---
  const only = process.env.CHECK_DOCS_PROBE;
  if (only !== undefined) {
    const i = PROBES.findIndex((p) => p.name === only);
    // **Aborts rather than passing or skipping.** A renamed probe leaves its META
    // entry pointing at nothing, and reading that as "no probe failed, so the check
    // must still be checking" is exactly backwards.
    if (i < 0) { console.log(`  ABORT  no probe is named "${only}"`); rmSync(dir, { recursive: true, force: true }); return 3; }
    const inert = inertOnCleanTree();
    console.log(`  inert: ${inert ? 'yes' : 'no'}`);
    if (!inert) {
      console.log('  outcome: corpus');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
    const v = runOne(i, PROBES[i]);
    // **`outcome:` is the fact the parent grades on, and it exists because reading
    // the EXIT CODE cannot distinguish a detection from noise.** A mutant that
    // leaves the named clause fully detecting and adds one unrelated failure makes
    // `refused` false, which an exit code reports as *uncaught*.
    const missing = v.declared.filter((id) => !v.tripped.includes(id));
    const outcome = v.vacuous ? 'vacuous'
      : v.refused ? 'caught'
        // The report contradicting the failure lines is a detection in its own
        // right, and it is the ONLY thing that sees a mutation to the report.
        : !v.agree ? 'disagreed'
          : v.status === 0 ? 'exit0'
            : missing.length ? 'disappeared'
              : v.tripped.length > v.declared.length ? 'noisy' : 'other';
    console.log(`  ran: ${v.ran ? 'yes' : 'no'}`);
    console.log(`  outcome: ${outcome}`);
    console.log(`  ${v.refused ? 'ok  ' : 'FAIL'}  ${PROBES[i].check}  ${PROBES[i].name}` +
      (v.refused ? '' : `  — ${v.msg}`));
    rmSync(dir, { recursive: true, force: true });
    return v.refused ? 0 : 1;
  }

  console.log(`check-docs self-test — ${PROBES.length} probes\n`);
  let caught = 0;
  for (const [i, probe] of PROBES.entries()) {
    const v = runOne(i, probe);
    if (v.refused) caught++;
    console.log(`  ${v.refused ? 'ok  ' : 'FAIL'}  ${probe.check}  ${probe.name}` +
      (v.refused ? '' : `  — ${v.msg}`));
  }
  console.log(`\n${caught}/${PROBES.length} probes caught.`);
  if (caught !== PROBES.length) { rmSync(dir, { recursive: true, force: true }); return 1; }
  // A nested child is read for its probe verdict alone and must not grade anything:
  // it is running against a deliberately broken check.
  if (nested) { rmSync(dir, { recursive: true, force: true }); return 0; }

  // --- the META pass: does this suite NOTICE a broken check? -------------------
  const checkSource = readFileSync(join(root, 'scripts', 'check-docs.mjs'), 'utf8');
  let noticed = 0, byCorpus = 0;
  console.log(`\nand against a broken check — ${META.length} mutations of check-docs.mjs itself\n`);
  for (const [i, [name, probeName, mutate]] of META.entries()) {
    const broken = mutate(checkSource);
    let ok = false, why = '';
    if (broken === checkSource) {
      console.log(`  FAIL  ${name} — the mutation matched nothing`);
      continue;
    }
    // **And it must have matched exactly ONCE.** `String.replace` takes the first of
    // several silently, so an ambiguous anchor lands somewhere the entry did not
    // name. Applying the mutation to its own output answers that without turning
    // every entry into a pair of literals: a second occurrence is replaced on the
    // second pass and the two results differ.
    if (mutate(broken) !== broken) {
      console.log(`  FAIL  ${name} — the mutation matched MORE THAN ONCE, so it landed ` +
        'on the first of several and the entry does not say which');
      continue;
    }
    const path = join(root, 'dev-dist', `.meta-docs-${String(i).padStart(2, '0')}.mjs`);
    writeFileSync(path, broken);
    try {
      const r = spawnSync(process.execPath, [join(root, 'scripts', 'check-docs.mjs'), '--self-test'],
        { cwd: root, encoding: 'utf8', timeout: 900_000,
          env: { ...process.env, CHECK_DOCS_SCRIPT: path, CHECK_DOCS_PROBE: probeName } });
      const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
      const ran = /^ {2}ran: yes$/m.test(out);
      const outcome = (out.match(/^ {2}outcome: (\w+)$/m) ?? [, ''])[1];
      if (r.status === 3) why = ` — ${out.trim().split('\n').pop()}`;
      // A mutant that fails on the repository's own reference is NOTICED — by the
      // corpus, which is stronger than any probe. Its probe verdict is meaningless
      // and is not consulted. Counted separately so the number of probe-backed
      // gradings stays visible.
      else if (outcome === 'corpus') { ok = true; byCorpus++; why = ' (by the corpus: the mutant is not inert)'; }
      else if (!ran) why = ' — the mutant did not run: this is a crash, not a detection';
      else if (outcome === 'caught') why = ` — "${probeName}" is STILL CAUGHT against a check that does not check`;
      else if (outcome === 'noisy') why = ` — "${probeName}" still reports every id it declared; the mutant only got NOISIER, which is not a detection`;
      else if (['disappeared', 'disagreed', 'exit0'].includes(outcome)) ok = true;
      else why = ` — the child reported outcome "${outcome || '(none)'}", which grades nothing`;
    } finally { rmSync(path, { force: true }); }
    if (ok) noticed++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}${ok ? '' : why}`);
  }
  rmSync(dir, { recursive: true, force: true });
  console.log(`\n${noticed}/${META.length} noticed` +
    (byCorpus ? ` — ${noticed - byCorpus} by the named probe, ${byCorpus} by the corpus.` : '.'));
  return noticed === META.length ? 0 : 1;
}
