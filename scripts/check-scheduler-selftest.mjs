// **The negative tests for `check-scheduler.mjs`, checked in rather than run once
// by hand** — `doc/workflow.md` v0.5 section 5 rule 7, all three requirements, and
// v0.9 rule 8's four obligations on the lists this file itself iterates.
//
//   node scripts/check-scheduler.mjs --self-test
//
// **Why this file exists now and did not before.** The previous version of that
// check was provoked five ways at birth by W5 and the probes were never committed
// — rule 7 (a) is the requirement written for exactly that, and the check has
// since been rewritten end to end for a registry dependency. A rewritten check
// with its predecessor's hand-run probes is a claim about a script that no longer
// exists.
//
// Each probe below breaks one clause of the pin — the npm side, the JSR side, or
// the declaration parse — and **declares the full SET of checks it must trip**,
// which must match exactly. `D1` and `D2` cascade legitimately in one direction and
// say so: with the package absent there is no manifest to read a version out of.
//
// ---------------------------------------------------------------------------
// **W29: THIS FILE GRADED NOTHING, AND NOW IT DOES.** [Q132](../doc/open-questions.md).
//
// Until W29 there were twelve probes and **no META pass at all**. Every probe here
// asserts that the check refuses a broken **input**; nothing asserted that the
// probes would notice a broken **check**. That is the gap W16's adequacy reader
// opened on `check-policies` — it disabled that script's verdict, its
// set-comparison and its matched-nothing guard and watched all nine probes survive
// — and every self-test written since has had a META pass. This one predates the
// practice and never got one.
//
// **The yield of not having one was measured rather than assumed, and it is 1 in
// 5.** Four clause-level mutations of this check were caught by the probes anyway;
// **one was not**, and it is [Q141](../doc/open-questions.md) — `D5`'s empty-parse
// clause, inert on the clean tree with **12/12 probes green and exit 0**. A clause
// no probe drives is invisible to every probe by construction, and only a META pass
// asks the question.
//
// **The contract is W28's and every part of it is load-bearing here:**
//
//   each META entry names the PROBE it must break, as its second element
//   the child runs THAT probe and no other, selected by CHECK_SCHEDULER_PROBE
//   the child checks INERTNESS first — the mutant against the untouched tree
//   the child prints `inert:`, `ran:` and `outcome:`, and the parent grades on those
//
//   exit 3  the named probe does not exist        -> a dangling reference, ABORT
//   exit 1  the named probe went uncaught         -> the entry did what it claims
//   exit 0  the named probe is STILL CAUGHT       -> a hole, or a mislabelled entry
//
// **`ran:` keys on the TERMINAL line, not on the report header** — W28's readers'
// correction. A mutant that throws exits non-zero and reports nothing, and an exit
// code reads that as a catch.
//
// **What W29 added beyond the contract, and why each was measured first.**
//
//   1. **Six probes for the six clauses no probe could reach**, all three of `D5`'s
//      unprobed ones among them. They are unreachable for one shared reason — the
//      `.d.ts`, the installed manifest and the import map could not be pointed
//      somewhere else — so one input override (`CHECK_SCHEDULER_DTS`) plus two
//      corrupt-file probes close all six. Taking [Q141](../doc/open-questions.md)
//      alone would have built the mechanism and then declined to use it.
//   2. **The report-row `agree` projection.** Measured before it was written: with
//      the `checks` array's `D5` row deleted, or with the verdict loop forced to
//      print `ok`, **every probe still passed** — `wanted [D3] got [D3] exit 1`.
//      The set of failure ids is unchanged by a report mutation, so no set
//      comparison can see one; a second, independent projection can.
//      [Q100](../doc/open-questions.md)'s class, and here it also erases the
//      **`NOT RUN`** state, which is W5's own finding and `doc/workflow.md` section
//      1 rule 4's whole subject.
//   3. **An anchor must match EXACTLY ONCE.** Rule 7 (b) asks that a mutation match
//      something; `String.replace` silently takes the first of several. An ambiguous
//      anchor is a mutation landing somewhere its entry did not name, which is
//      [Q143](../doc/open-questions.md)'s damage arriving by a different road.
//
// **What this file does NOT reach, measured against this file as shipped rather
// than inherited from a sibling.** `scripts/check-policies-selftest.mjs:29-51`
// records the fixed point — **nothing inside a self-grading file can assert that
// the file grades** — and this file is further inside it than its siblings, because
// **it has no `SELF` list**: nothing bounds `PROBES` or `META` from one list
// further out. So all of these survive here:
//
//   `MIN_PROBES` -> `0`, alone or with the list shortened          survives
//   `MIN_META` -> `0`, alone or with the list emptied              survives
//   `refused = ... && agree` -> `refused = true`                   survives
//   `return caught === total ? 0 : 1` -> `return 0`                survives
//   `if (v.refused) caught++` -> `caught++`                        survives
//   the "mutation matched nothing" guard -> `if (false)`           survives
//   the `byMask` / `byCount` tallies dropped from the summary      survives
//   a `masked` entry NAMING a sibling that does not exist          survives
//
// **The last four were added by W29's adequacy reader and three of them are new
// shapes, not repetitions.** The probe-pass verdict (`caught++`) is a *separate
// expression* from the META one the list already named. The summary tallies are the
// exit artifact itself — P9 asks *what notices*, the verdict asserts only *that*
// something did, and the breakdown that answers the question is unasserted
// ([Q100](../doc/open-questions.md)'s class, in the deliverable this item created).
// And the `maskedBy` string is free text: the grading now verifies **that** a
// sibling stepped in — same id, same count, different message — and **cannot verify
// WHICH**, so renaming it to *"a clause that does not exist anywhere"* still costs 0.
// The claim is checked; the citation is not.
//
// In `check-source-selftest.mjs` the first three are **caught**, because a `SELF`
// list one level out asserts that each guard FIRES. That list is
// [W31](../doc/work-items/w31-the-self-list-check-policies-never-had.md)'s shape and
// **W31 is narrowed to `check-policies`**, so no declared item picks this file up.
// Named because a ceiling list that omits its own holes is worse than no list.
//
// **One inherited guard here is DEAD rather than merely unasserted**, and it is on
// this list so the next reader does not spend a run on it: `const nested =
// !!process.env.CHECK_SCHEDULER_SCRIPT` and its `if (nested) return 0` are
// unreachable, because every META child also sets `CHECK_SCHEDULER_PROBE` and
// returns from single-probe mode first. It is load-bearing in
// `check-source-selftest.mjs`, which has a `SELF` list whose children do not.
//
// **And one guard here is live in FIVE files and provoked in none** —
// [Q144](../doc/open-questions.md), whose row says *three* because W29 added the
// fourth and fifth. The case `ran:` exists for is *inert on the clean tree, FATAL
// under the probe*. W29 constructed one in `check-docs` and recorded it as a rule 8
// provocation; the checked-in form is a `SELF` entry, which is out of that item's
// scope. The gap has an address rather than a fix.

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, lstatSync, symlinkSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const PKG = 'package.json';
const MAP = 'examples/deno-import-map.json';

/**
 * `half` names the file the probe rewrites. `dts` probes point `D5`'s declaration
 * parse at a hand-written fixture; `env` probes (below) point the check at a
 * different `node_modules` root by moving the installed package aside — the one
 * thing that cannot be expressed as a file edit.
 */
const PROBES = [
  {
    name: 'package.json asks for a RANGE rather than the pin',
    half: PKG, check: 'D2',
    mutate: (t) => t.replace('"fyflow-scheduler": "0.3.0"', '"fyflow-scheduler": "^0.3.0"'),
  },
  {
    name: 'package.json reinstates the working-tree link',
    half: PKG, check: 'D2',
    // The regression this repository moved away from, and the one that cost it a
    // sibling checkout. D1 does not fire because the INSTALLED package is still
    // the registry one; only the declaration changed.
    mutate: (t) => t.replace('"fyflow-scheduler": "0.3.0"', '"fyflow-scheduler": "file:../fyflow-scheduler"'),
  },
  {
    name: 'package.json moves the scheduler to a runtime dependency',
    half: PKG, check: 'D2',
    mutate: (t) => t.replace('    "fyflow-scheduler": "0.3.0",\n', ''),
  },
  {
    name: 'package.json is not readable JSON at all',
    half: PKG, check: 'D2',
    // **W29.** `D2`'s own unreadable-manifest clause had no probe: every other PKG
    // probe writes valid JSON. Truncating the first brace is the cheapest edit that
    // reaches `JSON.parse`'s catch and nothing else.
    mutate: (t) => t.replace('{\n', '{{\n'),
  },
  {
    name: 'the Deno half pinned to a DIFFERENT version from the Node half',
    half: MAP, check: 'D3',
    // **The hazard this rewrite exists for.** Ladder L6 runs in both runtimes and
    // would report both green against two different schedulers.
    mutate: (t) => t.replace('jsr:@fyflow/scheduler@0.3.0', 'jsr:@fyflow/scheduler@0.2.1'),
  },
  {
    name: 'the Deno half pointed back at a working-tree path',
    half: MAP, check: 'D3',
    mutate: (t) => t.replace('jsr:@fyflow/scheduler@0.3.0', '../../fyflow-scheduler/index.ts'),
  },
  {
    name: 'the Deno half pointed at a different JSR package',
    half: MAP, check: 'D3',
    mutate: (t) => t.replace('jsr:@fyflow/scheduler@0.3.0', 'jsr:@fyflow/schedulr@0.3.0'),
  },
  {
    name: 'the Deno half unpinned',
    half: MAP, check: 'D3',
    mutate: (t) => t.replace('jsr:@fyflow/scheduler@0.3.0', 'jsr:@fyflow/scheduler'),
  },
  {
    name: 'the bare specifier dropped from the import map entirely',
    half: MAP, check: 'D3',
    mutate: (t) => t.replace('"fyflow-scheduler": "jsr:@fyflow/scheduler@0.3.0"', '"_unused": "x"'),
  },
  {
    name: 'the import map is not readable JSON at all',
    half: MAP, check: 'D3',
    // **W29.** `D3`'s unreadable-map clause had no probe for the same reason
    // `D2`'s did not: every other MAP probe writes valid JSON.
    mutate: (t) => t.replace('{\n', '{{\n'),
  },
];

/**
 * **The `.d.ts` probes — W29, and all three fixtures are HAND-WRITTEN.**
 *
 * `doc/workflow.md` section 5 rule 4: a fixture captured from the code under test
 * proves the code agrees with itself. These are written from
 * [ADR 0029](../doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)'s
 * surface claim — *the npm package ships `dist/node`, `dist/browser` and
 * `dist/types`* — in the declaration style `D5` parses, and **not one byte of any
 * of them was read out of `node_modules`**.
 *
 * `dts: null` points the check at a path that does not exist, which is the only way
 * to reach the unreadable clause without deleting the installed package.
 */
const DTS_PROBES = [
  {
    name: 'the declaration file D5 compares against is not there',
    check: 'D5', dts: null,
  },
  {
    name: 'a declaration file with no parseable VALUE exports, so the list comes back empty',
    check: 'D5',
    // **This probe was first named *"exports only TYPES, so the parse yields
    // nothing"* and that overclaimed, which W29's adequacy reader measured**:
    // replacing the whole fixture with `'this is not typescript and never was'`
    // costs **0**, because the clause fires on *nothing parsed* and any unparseable
    // content satisfies it. The `export type` shape is not what is being tested and
    // cannot be — `check-scheduler.mjs`'s own `|| /^\s*export\s+type/` disjunct is
    // **dead code**, since `export\s*\{` can never match a line beginning
    // `export type` and `!m` short-circuits first. The fixture stays in that shape
    // because it is the realistic way this happens to a published package; the
    // NAME no longer claims the shape is load-bearing.
    //
    // Its provenance still is: `doc/workflow.md` section 5 rule 4 forbids a fixture
    // taken from the code under test, and reading this one from `node_modules`
    // instead costs **1** failure, measured.
    // **[Q141](../doc/open-questions.md), and the one live defect this item closed.**
    // `D5`'s empty-parse clause fires only when the parse yields zero value exports,
    // and no probe could produce that: the installed package's declarations always
    // parse. Measured before this probe existed — the clause could be made inert
    // with **12/12 probes green and exit 0**.
    //
    // Every line here is a `export type { … } from` , which `D5` skips by design
    // because a type export erases and cannot be checked against a loaded module.
    dts: [
      "export type { SchedulerLike } from './types.js';",
      "export type { FyflowTask, TaskState } from './task.js';",
      '',
    ].join('\n'),
  },
  {
    name: 'a declaration file naming a value export the artifact does not have',
    check: 'D5',
    // `D5`'s missing-exports clause: the declarations name it, the loaded module
    // does not have it, and that is a partial or mismatched publish. Unreachable
    // before this override for the same reason as the two above.
    dts: [
      "export { FyflowScheduler } from './FyflowScheduler.js';",
      "export { aValueThisTarballDoesNotShip } from './nowhere.js';",
      '',
    ].join('\n'),
  },
];

/**
 * Probes that move the installed package rather than editing a file. They run
 * last and restore it, because everything else depends on it being there.
 */
const INSTALL_PROBES = [
  {
    name: 'the package is not installed at all',
    check: 'D1', notRun: ['D2', 'D4', 'D5'],
    // With no manifest there is no version to compare and no artifact to load, so
    // D2, D4 and D5 do not RUN — which the report distinguishes from `ok`, and
    // which is why they are not declared here.
    apply: (root, dir) => { rmSync(dir, { recursive: true, force: true }); },
  },
  {
    name: 'the installed package replaced by a link into a working tree',
    check: 'D1', notRun: ['D2', 'D4', 'D5'],
    // The accident, as a probe: a junction here is what a recursive delete
    // follows out of this repository and into another one.
    apply: (root, dir, stash) => {
      rmSync(dir, { recursive: true, force: true });
      writeFileSync(join(root, 'dev-dist', 'sched-selftest', 'note.txt'), 'link probe');
      const target = join(root, 'dev-dist', 'sched-selftest');
      try {
        symlinkSync(target, dir, 'junction');
      } catch {
        // **A skip here is a probe passing for the wrong reason**, so it is
        // reported as one. The first version of this probe reached this branch
        // every run — `require` is not defined in an ES module, so the
        // `symlinkSync` call threw a ReferenceError rather than failing to make a
        // junction, and the probe reported SKIP on a machine that creates them
        // fine. That is `doc/workflow.md` rule 7 (b) in its purest form: the
        // mutation did not happen and the harness said so only because it was
        // asked to.
        cpSync(stash, dir, { recursive: true });
        return 'skipped';
      }
    },
  },
  {
    name: 'the installed package`s own manifest is not readable JSON',
    check: 'D1', notRun: ['D2', 'D4', 'D5'],
    // **W29.** `D1`'s third clause — the manifest is there and does not parse.
    // With `manifest` left null, D2, D4 and D5 do not run, so this declares D1
    // alone for the same reason the not-installed probe does.
    apply: (root, dir) => {
      writeFileSync(join(dir, 'package.json'), '{ this is not json');
    },
  },
  {
    name: 'a partial publish — the artifact `exports` selects is missing',
    check: 'D4',
    // D5 loads that same file, so it cascades. Declared.
    also: ['D5'],
    apply: (root, dir) => { rmSync(join(dir, 'dist', 'node', 'index.js'), { force: true }); },
  },
  {
    name: 'a partial publish — the BROWSER artifact is missing',
    check: 'D4',
    // **W29's adequacy reader.** `D4` walks a three-entry list and only
    // `dist/node/index.js` had a probe, so two thirds of it could be deleted for 0
    // failures — `doc/workflow.md` rule 8's fourth obligation, on the CHECK's own
    // list rather than on the harness's.
    apply: (root, dir) => { rmSync(join(dir, 'dist', 'browser', 'index.js'), { force: true }); },
  },
  {
    name: 'a partial publish — the TYPES artifact is missing',
    check: 'D4',
    // D5 reads that same file to derive its expected export list, so it cascades.
    // Declared rather than discovered.
    also: ['D5'],
    apply: (root, dir) => { rmSync(join(dir, 'dist', 'types', 'index.d.ts'), { force: true }); },
  },
  {
    name: 'the installed version is not the version pinned',
    check: 'D2',
    apply: (root, dir) => {
      const p = join(dir, 'package.json');
      writeFileSync(p, readFileSync(p, 'utf8').replace('"version": "0.3.0"', '"version": "0.2.1"'));
    },
  },
];

/** Every check `check-scheduler.mjs` reports under, in the order it reports them. */
const ALL_CHECKS = ['D1', 'D2', 'D3', 'D4', 'D5'];

/**
 * **Did the mutated check RUN TO COMPLETION?** A grading requires this, which is
 * how a mutant that **crashed** is told apart from one that ran and stopped
 * detecting. Keyed on the TERMINAL line rather than on the report header — W28's
 * readers measured that a header-keyed guard covers the checks and not the report
 * or the exit path, so a mutant made to throw one line after the header scored
 * *noticed* at a cost of 0. Every run of this check ends with exactly one of these
 * two lines, and a mutant that dies anywhere prints neither.
 */
const RAN = (out) => /^(All checks passed|\d+ failure\(s\)\.)/m.test(out);

/** The floor `check-policies-selftest.mjs` learned to carry: vacuous at zero. */
const MIN_PROBES = 20;

/** The same floor for `META`, and for the same reason. */
const MIN_META = 22;

/**
 * **The mutations `check-scheduler.mjs` itself is run against.** Every probe above
 * asserts that the check refuses a broken input; **these assert that a probe
 * notices when the check stops checking.** One entry per clause — all eighteen
 * `fail()` calls and the three ways the report block can lie — and each names the
 * probe it must break.
 *
 * **Each mutation is `fail('Dx', ` -> `[].push(`,** which is the shape W28 arrived
 * at the hard way. Replacing the enclosing `if` with `if (false)` takes a branch
 * out of an `if`/`else if` chain and the next arm then evaluates against state the
 * clause was there to reject, so the mutant **throws** — scored *noticed* for a
 * reason that has nothing to do with the probes. Sending the message into a
 * discarded array leaves the control flow and the arguments exactly as they were
 * and reports nothing, which is what *present but inert* means.
 *
 * **Q143 does not apply to this list.** These mutations edit `check-scheduler.mjs`,
 * never this file, so an anchor cannot match its own quotation. The hazard that
 * does apply is an anchor matching the check in more than one place, and the
 * harness refuses that below.
 *
 * **ONE entry carries a fourth element, and it inverts the expected verdict.**
 * [Q146](../doc/open-questions.md). **Two** entries were written expecting
 * *disappeared*, both came back **STILL CAUGHT** on this list's first run, and the
 * author read the same mechanism into each: a sibling clause reporting the SAME id
 * firing in the disabled clause's place, invisible to a set-equality grading.
 *
 * **That was right about one of them and wrong about the other, and the count is
 * what said so.** W29's conformity reader falsified the author's *"it goes red if
 * the guard is removed"* — deleting `D5`'s fallthrough guard left the whole file at
 * **18/18, 21/21, exit 0** — so the grading gained the discriminator
 * [Q146](../doc/open-questions.md)'s own row proposes, and it immediately
 * **separated the two cases**:
 *
 *   D2 unreadable  LIVE -> 2 failures under `D2`   INERT -> 1     count FELL
 *   D5 unreadable  LIVE -> 1 failure  under `D5`   INERT -> 1     count HELD
 *
 * **`D2` is CO-FIRING, not masking.** An unreadable manifest leaves `own` null, so
 * the devDependency clause fires **as well as** the unreadable one; disabling the
 * first drops the count and the clause is **detected after all**. It is graded
 * normally, by the count, and its `maskedBy` was removed.
 *
 * **`D5` is the real thing, and the handover is BY DESIGN**: the empty-parse clause
 * is guarded by `!failures.some(f => f.startsWith('D5'))` precisely so the two do
 * not both report, and that guard is what makes the second step forward when the
 * first is removed. Same id **and** same count, so nothing distinguishes them.
 * Neither a hole in the probes nor a mislabelled entry — relabelling it to whatever
 * fails is W28's *"the single way this item can be done wrongly while looking
 * finished"* — so the entry **declares** the masking, and that declaration is now
 * falsifiable: remove the guard and the baseline goes to 2 against the mutant's 1,
 * and the entry goes red naming both numbers. What this one clause carries is
 * **diagnostic** value rather than detection value: the run fails either way, with a
 * worse message.
 *
 * **The general lesson is one this repository had not written down**: `caught` is
 * not a terminal verdict. Two clauses can share an id, and then the SET is the wrong
 * projection — which is `doc/workflow.md` rule 7 (c)'s form meeting its limit, since
 * (c) discriminates a probe that trips the WRONG check and cannot discriminate two
 * clauses that trip the RIGHT one.
 */
const META = [
  // --- D1 ---------------------------------------------------------------------
  ['D1`s not-installed clause disabled',
    'the package is not installed at all',
    (t) => t.replace("fail('D1', 'node_modules/fyflow-scheduler is missing.", "[].push('node_modules/fyflow-scheduler is missing.")],
  ['D1`s LINK clause disabled — the incident guard',
    'the installed package replaced by a link into a working tree',
    (t) => t.replace("fail('D1', 'node_modules/fyflow-scheduler is a LINK,", "[].push('node_modules/fyflow-scheduler is a LINK,")],
  ['D1`s unreadable-manifest clause disabled',
    'the installed package`s own manifest is not readable JSON',
    (t) => t.replace("fail('D1', `${rel(pkgDir)}/package.json is unreadable", "[].push(`${rel(pkgDir)}/package.json is unreadable")],
  // --- D2 ---------------------------------------------------------------------
  ['D2`s installed-version comparison disabled',
    'the installed version is not the version pinned',
    (t) => t.replace("fail('D2', `the installed scheduler is", "[].push(`the installed scheduler is")],
  ['D2`s unreadable-own-manifest clause disabled',
    'package.json is not readable JSON at all',
    (t) => t.replace("fail('D2', `package.json is unreadable", "[].push(`package.json is unreadable")],
  // **This entry was declared MASKED and it is NOT, and the count is what said so.**
  // An unreadable manifest leaves `own` null, so `spec` is undefined and the
  // devDependency clause fires **as well** — not instead. Both report under `D2`,
  // so the id set is identical either way and set equality reads *STILL CAUGHT*;
  // the count goes **2 -> 1** and the clause is detected after all. W29's author
  // called this masking on the strength of the id set alone, and adding the
  // discriminator its own [Q146](../doc/open-questions.md) row proposes is what
  // falsified it. **Co-firing is not masking**, and only `D5` below is the real
  // thing.
  ['D2`s devDependency clause disabled — ADR 0013 rule 1`s half',
    'package.json moves the scheduler to a runtime dependency',
    (t) => t.replace("fail('D2', 'package.json does not declare", "[].push('package.json does not declare")],
  ['D2`s exact-pin clause disabled, so a range passes',
    'package.json asks for a RANGE rather than the pin',
    (t) => t.replace("fail('D2', `package.json asks for", "[].push(`package.json asks for")],
  // --- D3: the only reason this check still exists ----------------------------
  ['D3`s unreadable-map clause disabled',
    'the import map is not readable JSON at all',
    (t) => t.replace("fail('D3', `${rel(mapPath)} is unreadable,", "[].push(`${rel(mapPath)} is unreadable,")],
  ['D3`s missing-specifier clause disabled',
    'the bare specifier dropped from the import map entirely',
    (t) => t.replace("fail('D3', `${rel(mapPath)} does not map the bare", "[].push(`${rel(mapPath)} does not map the bare")],
  ['D3`s working-tree-path clause disabled',
    'the Deno half pointed back at a working-tree path',
    (t) => t.replace("fail('D3', `${rel(mapPath)} resolves the scheduler to a PATH", "[].push(`${rel(mapPath)} resolves the scheduler to a PATH")],
  ['D3`s pinned-specifier-shape clause disabled',
    'the Deno half unpinned',
    (t) => t.replace("fail('D3', `${rel(mapPath)} maps the scheduler to", "[].push(`${rel(mapPath)} maps the scheduler to")],
  ['D3`s package-name clause disabled',
    'the Deno half pointed at a different JSR package',
    (t) => t.replace("fail('D3', `${rel(mapPath)} points Deno at", "[].push(`${rel(mapPath)} points Deno at")],
  ['D3`s two-runtimes-two-versions clause disabled — the hazard itself',
    'the Deno half pinned to a DIFFERENT version from the Node half',
    (t) => t.replace("fail('D3', `Deno would load", "[].push(`Deno would load")],
  // --- D4 ---------------------------------------------------------------------
  ['D4`s missing-artifact clause disabled',
    'a partial publish — the artifact `exports` selects is missing',
    (t) => t.replace("fail('D4', `${a} is missing from the installed package.", "[].push(`${a} is missing from the installed package.")],
  // --- D5: three of these four clauses had no probe until W29 -----------------
  ['D5`s unreadable-declarations clause disabled',
    'the declaration file D5 compares against is not there',
    (t) => t.replace("fail('D5', `${rel(dts)} is unreadable,", "[].push(`${rel(dts)} is unreadable,"),
    // The empty-parse clause's `!failures.some(f => f.startsWith('D5'))` guard exists
    // so the two do not both report; with the first removed the guard is satisfied
    // and the second steps forward. The handover is by design, which is what makes
    // this the sharper of the two.
    'D5`s empty-parse clause'],
  ['D5`s empty-parse clause disabled — Q141, the one that survived',
    'a declaration file with no parseable VALUE exports, so the list comes back empty',
    (t) => t.replace("fail('D5', `no value exports were parsed out of", "[].push(`no value exports were parsed out of")],
  ['D5`s missing-value-export clause disabled',
    'a declaration file naming a value export the artifact does not have',
    (t) => t.replace("fail('D5', `dist/node/index.js is missing", "[].push(`dist/node/index.js is missing")],
  ['D5`s does-not-load clause disabled',
    'a partial publish — the artifact `exports` selects is missing',
    (t) => t.replace("fail('D5', `dist/node/index.js does not load", "[].push(`dist/node/index.js does not load")],
  // --- the report block, which no set comparison can see ----------------------
  // **These three are why the `agree` projection exists.** Measured before it was
  // written: with the report broken, every probe still reported `wanted [D3] got
  // [D3] exit 1` and passed. The ids that FAILED are unchanged by a mutation to how
  // they are DISPLAYED, so only a second projection of the same fact can discriminate.
  ['the report prints `ok` for every row, verdict and NOT RUN alike',
    'the bare specifier dropped from the import map entirely',
    (t) => t.replace("  const verdict = bad.length ? 'FAIL   ' : didRun ? 'ok     ' : 'NOT RUN';",
      "  const verdict = 'ok     ';")],
  ['a row deleted from the `checks` report array, so one check is never displayed',
    'a partial publish — the artifact `exports` selects is missing',
    (t) => t.replace("  ['D5', ran.D5, `D5 it loads and exports what its own declarations name`],\n", '')],
  ['the failure report and the non-zero exit disabled',
    'the Deno half pinned to a DIFFERENT version from the Node half',
    (t) => t.replace('if (failures.length) {', 'if (false) {')],
  // **The exit path ALONE, and it exists because the entry above bundles two
  // things.** W29's adequacy reader deleted the `r.status !== 0` term from `refused`
  // in both files and it cost **0** — because the only entry touching the exit also
  // removed the report, so `tripped` went empty and the set comparison caught it
  // instead. Nothing asserted that the harness reads the exit code at all.
  //
  // Separating them is what makes that term load-bearing: with the report intact and
  // only `process.exit(1)` gone, the check **finds every failure, prints every
  // failure, prints every FAIL row — and tells the shell it is fine.** Measured by
  // the reader: with the term present that costs `0/18 probes caught`; with the term
  // also deleted, 18/18 and green. The exit code is the only thing `npm run gate`
  // reads.
  ['the non-zero exit removed while the report is left intact',
    'the Deno half pointed at a different JSR package',
    (t) => t.replace('  console.log(`\\n${failures.length} failure(s).`);\n  process.exit(1);',
      '  console.log(`\\n${failures.length} failure(s).`);')],
];

export async function selfTest(root) {
  const dir = join(root, 'dev-dist', 'sched-selftest');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  // **The script under test.** `CHECK_SCHEDULER_SCRIPT` is how the META pass points
  // this same suite at a deliberately broken copy of it. Without it there was no
  // way to run a probe against anything but the real check, which is why this file
  // could not have had a META pass whatever else it did.
  const script = process.env.CHECK_SCHEDULER_SCRIPT ?? join(root, 'scripts', 'check-scheduler.mjs');
  const nested = !!process.env.CHECK_SCHEDULER_SCRIPT;

  const total = PROBES.length + DTS_PROBES.length + INSTALL_PROBES.length;
  if (total < MIN_PROBES || META.length < MIN_META) {
    console.log(`check-scheduler self-test — ${total} probes (floor ${MIN_PROBES}), ` +
      `${META.length} meta (floor ${MIN_META}).`);
    console.log('  FAIL  a list is short, and `caught === length` is vacuous at zero.');
    rmSync(dir, { recursive: true, force: true });
    return 1;
  }

  // **`META` is bounded by CONTENT as well as by count, and W29's adequacy reader is
  // why.** A floor counts entries; it cannot tell twenty-one distinct mutations from
  // twenty plus a duplicate. The reader replaced `D4`'s entry with a copy of `D1`'s —
  // **cost 0, `21/21 graded`, floor satisfied, and `D4`'s only clause silently
  // ungraded.** `doc/workflow.md` rule 8's fourth obligation asks *can one entry
  // leave*, and this is the answer it did not have: an entry can leave **without the
  // list getting shorter**.
  //
  // Two bounds, both derived from the check itself rather than declared here:
  //   1. the twenty-one mutants are pairwise DISTINCT, and
  //   2. every id in `ALL_CHECKS` loses at least one `fail()` site to some entry.
  // (2) is what a duplicate breaks even if it is textually distinct, and neither can
  // be satisfied by editing a number.
  {
    const src = readFileSync(join(root, 'scripts', 'check-scheduler.mjs'), 'utf8');
    const mutants = META.map(([, , m]) => { try { return m(src); } catch { return null; } });
    if (new Set(mutants).size !== META.length) {
      console.log(`check-scheduler self-test — ${META.length} meta entries, ` +
        `${new Set(mutants).size} distinct mutations.`);
      console.log('  FAIL  two META entries produce the SAME mutation, so one clause is graded twice ' +
        'and another not at all — a floor counts entries and cannot see this.');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
    const hit = (id) => (src.match(new RegExp(`fail\\('${id}',`, 'g')) ?? []).length;
    const uncovered = ALL_CHECKS.filter((id) =>
      !mutants.some((m) => m !== null && (m.match(new RegExp(`fail\\('${id}',`, 'g')) ?? []).length < hit(id)));
    if (uncovered.length) {
      console.log(`check-scheduler self-test — no META entry disables any ${uncovered.join(', ')} clause.`);
      console.log('  FAIL  a check id with no grading at all; the count of entries says nothing about ' +
        'which clauses they reach.');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
  }

  const run = (env) => {
    const r = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', env, timeout: 300_000 });
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
    return {
      status: r.status,
      ran: RAN(out),
      // The set of checks that actually reported a failure, compared against the
      // set this probe declared. **Equality, not membership**: a probe that trips a
      // check it did not name is malformed, and a malformed probe reported as
      // caught is the whole reason this file exists.
      tripped: ALL_CHECKS.filter((x) => out.includes(`${x}: `)),
      // **How MANY failures, which the set deliberately throws away.** Only the
      // masked entries read this, and W29's conformity reader is why it exists: the
      // claim that a masked entry *"goes red if the guard is removed"* was **false**
      // when it was written, because two clauses reporting one id look identical to
      // one clause reporting it. The count is the signal that does not —
      // [Q146](../doc/open-questions.md) says so and this is the one place it is read.
      failures: (out.match(/^ {2}D\d+: /gm) ?? []).length,
      // **A fingerprint of the failure MESSAGES**, so a masked entry can be made to
      // prove the sibling it names actually stepped in. W29's adequacy reader found
      // the `maskedBy` string is free text nobody checks — rename it to *"a clause
      // that does not exist anywhere"* and the entry still passes. The name cannot be
      // verified mechanically, but the CLAIM behind it can: if a sibling took the
      // clause's place, the text the check prints must have changed.
      msgkey: (out.match(/^ {2}D\d+: .*/gm) ?? []).sort().join('|')
        .split('').reduce((h, c) => (Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0), 2166136261),
      // **AND the per-check REPORT ROWS, which are a second, independent projection
      // of the same fact.** A mutation to the report changes no failure id, so no
      // set comparison can see it — measured, with every probe green.
      rows: [...out.matchAll(/^ {2}(FAIL {3}|ok {5}|NOT RUN) {2}(D\d+) /gm)]
        .filter((m) => m[1].startsWith('FAIL')).map((m) => m[2]).sort(),
      // **And the `NOT RUN` rows, which the projection above MATCHES AND THROWS
      // AWAY.** W29's adequacy reader found that gap by going around it: forcing
      // `ran` to `{D1..D5: true}` costs **0**, and the honest run then prints `ok`
      // for three checks that never executed. That is W5's original finding — the
      // one `check-scheduler.mjs`'s own comment says the `ran` map exists for — and
      // `doc/workflow.md` section 1 rule 4's whole subject, *"a skipped check
      // reported as passed makes the whole ladder worthless"*.
      //
      // The FAIL half was covered and the other two thirds were not, in an entry
      // **named** *"verdict and NOT RUN alike"*. A probe declares which checks its
      // input stops from running, and the report must say so.
      notRun: [...out.matchAll(/^ {2}NOT RUN {2}(D\d+) /gm)].map((m) => m[1]).sort(),
    };
  };

  /** One probe, run once. Shared by the main pass and single-probe mode so the two cannot drift. */
  const runOne = (probe, i, ctx) => {
    const declared = [probe.check, ...(probe.also ?? [])].sort();
    let r, restore = () => {};
    if (probe.dts !== undefined) {
      // A `.d.ts` fixture, written from ADR 0029's surface claim rather than copied
      // out of the installed package (`doc/workflow.md` section 5 rule 4).
      let relPath = 'dev-dist/sched-selftest/absent.d.ts';
      if (probe.dts !== null) {
        relPath = `dev-dist/sched-selftest/${String(i).padStart(2, '0')}.d.ts`;
        writeFileSync(join(root, relPath), probe.dts);
      }
      r = run({ ...process.env, CHECK_SCHEDULER_DTS: relPath });
    } else if (probe.half) {
      const path = join(root, probe.half);
      const before = readFileSync(path, 'utf8');
      const after = probe.mutate(before);
      if (after === before) {
        return { vacuous: true, refused: false, ran: false, declared, tripped: [], agree: true,
          msg: 'the mutation matched nothing' };
      }
      writeFileSync(path, after);
      restore = () => writeFileSync(path, before);
      try { r = run(process.env); } finally { restore(); }
    } else {
      const pkgDir = ctx.pkgDir;
      let skipped = false;
      try {
        skipped = probe.apply(root, pkgDir, ctx.stash) === 'skipped';
        if (!skipped) r = run(process.env);
      } finally {
        // A junction has to be unlinked rather than deleted through, which is the
        // whole lesson: `rmSync` on a link into another tree deletes that tree.
        try {
          const st = lstatSync(pkgDir);
          if (st.isSymbolicLink()) unlinkSync(pkgDir);
          else rmSync(pkgDir, { recursive: true, force: true });
        } catch { /* already gone */ }
        cpSync(ctx.stash, pkgDir, { recursive: true });
      }
      if (skipped) {
        // Not counted as caught. A probe that did not run is not a hole that is
        // closed, and counting it was how a ReferenceError once stayed invisible.
        return { vacuous: true, refused: false, ran: false, declared, tripped: [], agree: true,
          msg: 'could not create a junction, so the mutation never happened' };
      }
    }
    const agree = r.rows.join(',') === r.tripped.join(',');
    // **What this probe's input stops from RUNNING**, declared per probe and
    // compared exactly. Three probes leave the installed manifest unreadable or the
    // package absent, and D2, D4 and D5 then cannot run; every other probe leaves
    // all five running. Defaulting to `[]` means a probe that starts skipping a
    // check has to say so.
    const wantNotRun = (probe.notRun ?? []).slice().sort();
    const ranOk = r.notRun.join(',') === wantNotRun.join(',');
    const refused = r.status !== 0 && r.tripped.join(',') === declared.join(',') && agree && ranOk;
    return {
      vacuous: false, refused, ran: r.ran, declared, tripped: r.tripped, agree, status: r.status,
      failures: r.failures, ranOk, msgkey: r.msgkey,
      msg: `exited ${r.status}, wanted [${declared.join(',')}], got [${r.tripped.join(',')}]` +
        `${agree ? '' : `, report rows said [${r.rows.join(',')}]`}` +
        `${ranOk ? '' : `, NOT RUN wanted [${wantNotRun.join(',')}] got [${r.notRun.join(',')}]`}`,
    };
  };

  const ALL_PROBES = [...PROBES, ...DTS_PROBES, ...INSTALL_PROBES];
  const needsInstall = (p) => !p.half && p.dts === undefined;
  const pkgDir = join(root, 'node_modules', 'fyflow-scheduler');
  const stash = join(dir, 'installed');
  /** Copied once, and only when a probe that moves the package is about to run. */
  const withStash = (fn) => {
    if (!existsSync(pkgDir)) {
      console.log('  FAIL  node_modules/fyflow-scheduler is absent, so the install probes cannot run');
      return null;
    }
    cpSync(pkgDir, stash, { recursive: true });
    return fn({ pkgDir, stash });
  };

  /**
   * **Is the mutated check INERT on the untouched tree?** Rule 8 asks for a mutation
   * that is *present but inert*. A mutant that fails on the repository's own tree is
   * still NOTICED — by the corpus, more strongly than by any probe — but its probe
   * verdict is meaningless, because every id it reports may be noise rather than
   * detection.
   */
  const inertOnCleanTree = () =>
    spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', timeout: 300_000 }).status === 0;

  // --- single-probe mode: the META pass names ONE probe and this runs that one ---
  const only = process.env.CHECK_SCHEDULER_PROBE;
  if (only !== undefined) {
    const i = ALL_PROBES.findIndex((p) => p.name === only);
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
    const probe = ALL_PROBES[i];
    const v = needsInstall(probe)
      ? withStash((ctx) => runOne(probe, i, ctx))
      : runOne(probe, i, {});
    if (v === null) { rmSync(dir, { recursive: true, force: true }); return 1; }
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
    console.log(`  failures: ${v.failures ?? 0}`);
    console.log(`  msgkey: ${v.msgkey ?? 0}`);
    console.log(`  ${v.refused ? 'ok  ' : 'FAIL'}  ${probe.check}  ${probe.name}` +
      (v.refused ? '' : `  — ${v.msg}`));
    rmSync(dir, { recursive: true, force: true });
    return v.refused ? 0 : 1;
  }

  console.log(`check-scheduler self-test — ${total} probes\n`);
  let caught = 0;
  const report = (probe, v) => {
    if (v.refused) caught++;
    console.log(`  ${v.refused ? 'ok  ' : 'FAIL'}  ${probe.check}  ${probe.name}` +
      (v.refused ? '' : `  — ${v.msg}`));
  };

  // --- file and .d.ts probes ---------------------------------------------------
  for (const [i, probe] of [...PROBES, ...DTS_PROBES].entries()) report(probe, runOne(probe, i, {}));

  // --- install probes: move the installed package aside, then put it back ------
  const ok = withStash((ctx) => {
    for (const [i, probe] of INSTALL_PROBES.entries()) report(probe, runOne(probe, i, ctx));
    return true;
  });
  if (ok === null) { rmSync(dir, { recursive: true, force: true }); return 1; }

  console.log(`\n${caught}/${total} probes caught.`);
  if (caught !== total) { rmSync(dir, { recursive: true, force: true }); return 1; }
  // A nested child is read for its probe verdict alone and must not grade anything:
  // it is running against a deliberately broken check.
  if (nested) { rmSync(dir, { recursive: true, force: true }); return 0; }

  // --- the META pass: does this suite NOTICE a broken check? -------------------
  const checkSource = readFileSync(join(root, 'scripts', 'check-scheduler.mjs'), 'utf8');
  let noticed = 0, byCorpus = 0, byMask = 0, byCount = 0;
  console.log(`\nand against a broken check — ${META.length} mutations of check-scheduler.mjs itself\n`);
  for (const [i, [name, probeName, mutate, maskedBy]] of META.entries()) {
    const broken = mutate(checkSource);
    let why = '', ok2 = false;
    if (broken === checkSource) {
      console.log(`  FAIL  ${name} — the mutation matched nothing`);
      continue;
    }
    // **And it must have matched exactly ONCE.** `String.replace` takes the first of
    // several silently, so an ambiguous anchor lands somewhere the entry did not
    // name — rule 7 (b) asks that a mutation match something, and this asks that it
    // match what it says. Applying the mutation to its own output is what answers
    // it without turning every entry into a pair of literals: a second occurrence
    // gets replaced on the second pass and the two results differ.
    // *(It assumes the replacement does not itself contain the anchor. None here
    // does — each replaces a `fail('Dx', ` prefix, an `if` head, or a whole line
    // with text that cannot re-match — and an entry that broke the assumption would
    // report as ambiguous rather than pass.)*
    if (mutate(broken) !== broken) {
      console.log(`  FAIL  ${name} — the mutation matched MORE THAN ONCE, so it landed ` +
        'on the first of several and the entry does not say which');
      continue;
    }
    // **And it must not be GLOBAL, which the check above cannot see.** W29's
    // adequacy reader swapped one entry's string anchor for `/fail\('D3', /g`:
    // the first pass removes all **six** `D3` clauses, the second pass then changes
    // nothing, and the double-apply guard is satisfied. One entry disabling six
    // clauses while naming one — the discrimination this whole file is built on,
    // discarded at cost 0.
    //
    // Applying the mutation to the source CONCATENATED WITH ITSELF separates them:
    // a single replacement leaves the second copy untouched, so the result still
    // ends with the original; a global one edits both.
    if (!mutate(checkSource + checkSource).endsWith(checkSource)) {
      console.log(`  FAIL  ${name} — the mutation is GLOBAL: it edits every match rather ` +
        'than the one this entry names, so its verdict is about a set of clauses and not a clause');
      continue;
    }
    const path = join(root, 'dev-dist', `.meta-sched-${String(i).padStart(2, '0')}.mjs`);
    writeFileSync(path, broken);
    try {
      const r = spawnSync(process.execPath, [join(root, 'scripts', 'check-scheduler.mjs'), '--self-test'],
        { cwd: root, encoding: 'utf8', timeout: 900_000,
          env: { ...process.env, CHECK_SCHEDULER_SCRIPT: path, CHECK_SCHEDULER_PROBE: probeName } });
      const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
      const ran = /^ {2}ran: yes$/m.test(out);
      const outcome = (out.match(/^ {2}outcome: (\w+)$/m) ?? [, ''])[1];
      if (r.status === 3) why = ` — ${out.trim().split('\n').pop()}`;
      // A mutant that fails on the repository's own tree is NOTICED — by the corpus,
      // which is stronger than any probe. Its probe verdict is meaningless and is
      // not consulted. Counted separately so the number of probe-backed gradings
      // stays visible.
      else if (outcome === 'corpus') { ok2 = true; byCorpus++; why = ' (by the corpus: the mutant is not inert)'; }
      else if (!ran) why = ' — the mutant did not run: this is a crash, not a detection';
      // **A declared masking inverts the expected verdict, and it takes TWO facts.**
      // The clause is inert and a sibling reporting the same id fires instead, so
      // STILL CAUGHT is the measured truth and anything else means the masking
      // changed. **But `caught` alone was not enough, and W29's conformity reader
      // measured why**: the entry claimed it would go red *"if the guard is
      // removed"*, and deleting `D5`'s `!failures.some(f => f.startsWith('D5'))`
      // fallthrough guard left the whole file at **18/18, 21/21, exit 0**. Two
      // clauses reporting one id and one clause reporting it are the same SET.
      //
      // So a masked entry also compares the failure COUNT against a baseline — the
      // same probe against the UNMUTATED check — and requires it to be unchanged,
      // which is exactly what *masked* means: the sibling takes the clause's place
      // rather than reporting alongside it. Remove the guard and the baseline goes
      // to 2 against the mutant's 1, and the entry goes red for the right reason.
      // **This is [Q146](../doc/open-questions.md)'s own proposed discriminator**,
      // taken here for the two entries that need it rather than for all 21.
      // **`caught` is no longer a terminal verdict — it asks one more question.**
      // The id SET being unchanged does not mean nothing changed: two clauses can
      // report one id, and then disabling either leaves the set alone and moves the
      // COUNT. W29's conformity reader found this the hard way — it removed `D5`'s
      // fallthrough guard and the whole file stayed at 18/18, 21/21, exit 0 — and
      // the count is the discriminator [Q146](../doc/open-questions.md) names.
      //
      // So a `caught` entry is re-run against the UNMUTATED check and the two counts
      // compared. The baseline costs one extra child, and only for entries that get
      // this far: today that is **one**.
      //
      //   count FELL     the clause did stop reporting; the sibling merely shares
      //                  its id. That is a DETECTION the set could not see.
      //   count UNCHANGED  genuinely indistinguishable — and only then is `masked`
      //                  the honest verdict, which the entry must have declared.
      else if (outcome === 'caught') {
        const base = spawnSync(process.execPath, [join(root, 'scripts', 'check-scheduler.mjs'), '--self-test'],
          { cwd: root, encoding: 'utf8', timeout: 900_000,
            env: { ...process.env, CHECK_SCHEDULER_SCRIPT: join(root, 'scripts', 'check-scheduler.mjs'),
              CHECK_SCHEDULER_PROBE: probeName } });
        const bOut = `${base.stdout ?? ''}${base.stderr ?? ''}`;
        const bN = Number((bOut.match(/^ {2}failures: (\d+)$/m) ?? [, NaN])[1]);
        const mN = Number((out.match(/^ {2}failures: (\d+)$/m) ?? [, NaN])[1]);
        if (!Number.isFinite(bN) || !Number.isFinite(mN)) {
          why = ' — the baseline run reported no failure count, so `caught` cannot be resolved';
        } else if (bN > mN) {
          if (maskedBy) {
            why = ` — declared MASKED by ${maskedBy}, but the count moved ${bN} -> ${mN}: the sibling ` +
              'reports ALONGSIDE this clause rather than in its place, so the clause IS detectable and ' +
              'the declaration is wrong';
          } else { ok2 = true; byCount++; why = ` (by the COUNT: ${bN} -> ${mN}; the id set never moved)`; }
        } else if (maskedBy) {
          // **A masking must SHOW the sibling stepping in.** The `maskedBy` string is
          // free text and W29's adequacy reader renamed it to *"a clause that does not
          // exist anywhere"* for a cost of 0 — the name cannot be verified, but the
          // claim behind it can: if some other clause took this one's place, the text
          // the check prints must have changed. Identical id, identical count AND
          // identical messages would mean the mutation changed nothing observable at
          // all, which is a vacuous probe rather than a masking.
          const bK = (bOut.match(/^ {2}msgkey: (\d+)$/m) ?? [, ''])[1];
          const mK = (out.match(/^ {2}msgkey: (\d+)$/m) ?? [, ''])[1];
          if (!bK || !mK) why = ' — no message fingerprint, so the masking claim cannot be checked';
          else if (bK === mK) {
            why = ` — declared MASKED by ${maskedBy}, but the failure MESSAGES are byte-identical ` +
              'too: nothing observable changed, so this mutation is vacuous rather than masked';
          } else { ok2 = true; byMask++; why = ` (MASKED by ${maskedBy}: same id and same count ${mN}, different message)`; }
        }
        else why = ` — "${probeName}" is STILL CAUGHT against a check that does not check, and the ` +
          `failure count did not move either (${bN} -> ${mN})`;
      }
      else if (outcome === 'noisy') why = ` — "${probeName}" still reports every id it declared; the mutant only got NOISIER, which is not a detection`;
      else if (['disappeared', 'disagreed', 'exit0'].includes(outcome)) ok2 = true;
      else why = ` — the child reported outcome "${outcome || '(none)'}", which grades nothing`;
    } finally { rmSync(path, { force: true }); }
    if (ok2) noticed++;
    console.log(`  ${ok2 ? 'ok  ' : 'FAIL'}  ${name}${ok2 ? '' : why}`);
  }
  rmSync(dir, { recursive: true, force: true });
  // **The three kinds are counted separately**, because a bare "noticed" hides how
  // many entries no probe actually backs. W25's *"caught by the CORPUS rather than
  // by a probe"* made into a verdict, and W29's *masked by a sibling clause* beside
  // it — a clause whose removal the run still fails on, for the wrong reason.
  const parts = [];
  if (byCount) parts.push(`${byCount} by the failure COUNT, which the id set cannot see`);
  if (byCorpus) parts.push(`${byCorpus} by the corpus`);
  if (byMask) parts.push(`${byMask} masked by a sibling clause`);
  console.log(`\n${noticed}/${META.length} graded` +
    (parts.length ? ` — ${noticed - byCorpus - byMask - byCount} noticed by the named probe, ${parts.join(', ')}.` : '.'));
  return noticed === META.length ? 0 : 1;
}
