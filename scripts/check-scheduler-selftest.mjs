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
// **W29: THIS FILE GRADED NOTHING, AND NOW IT DOES.** [Q132](../doc/questions/q132.md).
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
// **one was not**, and it is [Q141](../doc/questions/q141.md) — `D5`'s empty-parse
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
// **What `D7` leaves unprobed, named rather than omitted — W37.** `D7` has two
// `fail()` sites: the **pin statement** and the **unreadable document**. Only the
// first is probed. The second cannot be, for W29's own reason one file across: the
// `half` mechanism mutates a document and writes it back, so every probe presents a
// file that IS there and IS readable, and none can present one that is not. It is
// the same shape as `check-docs`' missing-document refusal, which W29 recorded as
// reachable by no probe at all. Two probes drive the one clause that can be driven,
// one per document, because both documents were wrong at once on the bump that added
// the check.
//
// **What W29 added beyond the contract, and why each was measured first.**
//
//   1. **Six probes for the six clauses no probe could reach**, all three of `D5`'s
//      unprobed ones among them. They are unreachable for one shared reason — the
//      `.d.ts`, the installed manifest and the import map could not be pointed
//      somewhere else — so one input override (`CHECK_SCHEDULER_DTS`) plus two
//      corrupt-file probes close all six. Taking [Q141](../doc/questions/q141.md)
//      alone would have built the mechanism and then declined to use it.
//   2. **The report-row `agree` projection.** Measured before it was written: with
//      the `checks` array's `D5` row deleted, or with the verdict loop forced to
//      print `ok`, **every probe still passed** — `wanted [D3] got [D3] exit 1`.
//      The set of failure ids is unchanged by a report mutation, so no set
//      comparison can see one; a second, independent projection can.
//      [Q100](../doc/questions/q100.md)'s class, and here it also erases the
//      **`NOT RUN`** state, which is W5's own finding and `doc/workflow.md` section
//      1 rule 4's whole subject.
//   3. **An anchor must match EXACTLY ONCE.** Rule 7 (b) asks that a mutation match
//      something; `String.replace` silently takes the first of several. An ambiguous
//      anchor is a mutation landing somewhere its entry did not name, which is
//      [Q143](../doc/questions/q143.md)'s damage arriving by a different road.
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
// ([Q100](../doc/questions/q100.md)'s class, in the deliverable this item created).
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
// **The `ran:` guard is provoked here by a checked-in case — W143,
// [Q536](../doc/questions/q536.md).** The case `ran:` exists for is *inert on the clean tree, FATAL
// under the probe*. This file has no `SELF` list, so the case is a GUARD CASE beside the META pass:
// a mutant run through the same `gradeMeta` every entry takes, which must come back FAIL naming *the
// mutant did not run*. Two more GUARD CASES sit beside it — a compound whose second edit matches
// nothing ([Q434](../doc/questions/q434.md)), once through the META pass and once through the PROBES
// pass — and the META pass opens with an unmutated-copy CONTROL ([Q437](../doc/questions/q437.md)).
// *(This paragraph said the gap had "no address" from W131 until W143.)*

// SELFTEST-EXCLUSIVE: this file's install probes DELETE `node_modules/fyflow-scheduler`
// and restore it from a stash, so nothing that resolves that package may run while it
// does. [ADR 0039](../doc/decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md)
// makes `scripts/run-selftests.mjs` read this marker and run this entry alone;
// `G4` in `scripts/check-wiring.mjs` derives the same set from this same marker and
// compares the two. **[Q148](../doc/questions/q148.md) named ONE entry that would
// contend and P11's declaration measured FOUR** — `check:docs` and `typecheck` on
// `Cannot find module`, `check:scheduler` on its own `D1`, `test:l6` on
// `ERR_MODULE_NOT_FOUND` — and its stated mechanism (a runtime import from an
// `AGENTS.md` snippet) was type resolution instead. Running alone is the conservative
// superset of all four and costs 13 s.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, lstatSync, symlinkSync, unlinkSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const PKG = 'package.json';
const MAP = 'examples/deno-import-map.json';

/**
 * `half` names the file the probe rewrites. `dts` probes point `D5`'s declaration
 * parse at a hand-written fixture; `env` probes (below) point the check at a
 * different `node_modules` root by moving the installed package aside — the one
 * thing that cannot be expressed as a file edit.
 */
/**
 * **The pin anchors, VERSION-AGNOSTIC.** Every probe below used to name the literal
 * `0.3.0`, and the moment
 * [W36](../doc/work-items/w36-the-scheduler-pin-moves-to-0-5-1.md) moved the pin to
 * 0.5.1 **nine of them reported *"the mutation matched nothing"*** — rule 7 (b)
 * firing correctly rather than passing, and the fourth item running to hit that
 * class after W33 lost three probes and W34 one.
 *
 * **Re-anchored rather than re-pinned**, which is the only fix that does not
 * reproduce on the next bump: these match the pin's SHAPE and capture whatever
 * version is there, so a probe that needs a *different* version derives one from
 * the captured value rather than hard-coding a second literal.
 *
 * **They are deliberately NOT sourced from `package.json` at runtime.** A probe
 * whose anchor is read from the file it mutates agrees with that file by
 * construction and can no longer fail to match — which is the thing rule 7 (b)
 * exists to detect, removed rather than satisfied.
 */
// **Anchored inside `devDependencies` since W57**: with `peerDependencies` above it, the first
// `"fyflow-scheduler": "x.y.z"` in the file was the PEER, three D2 probes mutated it, and the
// distinctness guard refused two probes producing one file — a legitimate manifest reorder
// turning this self-test red (the adequacy reader`s m51). Two groups: the prefix through the
// opening quote, and the version.
const PKG_PIN_RE = /("devDependencies": \{[^}]*"fyflow-scheduler": ")(\d+\.\d+\.\d+)"/;
const PKG_PIN_LINE_RE = /[ \t]*"fyflow-scheduler": "\d+\.\d+\.\d+",\r?\n/;
const MAP_PIN_RE = /jsr:@fyflow\/scheduler@(\d+\.\d+\.\d+)/;
const MAP_ENTRY_RE = /"fyflow-scheduler": "jsr:@fyflow\/scheduler@\d+\.\d+\.\d+"/;
const INSTALLED_VERSION_RE = /"version": "(\d+)\.(\d+)\.(\d+)"/;

const PROBES = [
  {
    name: 'package.json asks for a RANGE rather than the pin',
    half: PKG, check: 'D2',
    mutate: (t) => t.replace(PKG_PIN_RE, (_m, pre, v) => `${pre}^${v}"`),
  },
  {
    name: 'package.json reinstates the working-tree link',
    half: PKG, check: 'D2',
    // The regression this repository moved away from, and the one that cost it a
    // sibling checkout. D1 does not fire because the INSTALLED package is still
    // the registry one; only the declaration changed.
    mutate: (t) => t.replace(PKG_PIN_RE, '$1file:../fyflow-scheduler"'),
  },
  {
    name: 'package.json moves the scheduler to a runtime dependency',
    half: PKG, check: 'D2',
    mutate: (t) => t.replace(PKG_PIN_LINE_RE, ''),
  },
  {
    name: 'the Deno rung stops passing the import map',
    half: PKG, check: 'D6',
    // **W36's adequacy reader's blocking finding, as a probe.** Measured before the
    // clause existed: Deno then resolves the bare specifier out of `node_modules` —
    // the npm package — and L6 reports `on deno 2.9.6` at 489 assertions, exit 0,
    // with `D3` printing `ok`. The JSR pin was compared and never read.
    mutate: (t) => t.replace('--import-map=examples/deno-import-map.json ', ''),
  },
  {
    name: 'the Deno rung replaced by a second NODE run',
    half: PKG, check: 'D6',
    // The wider form: the Deno rung of ladder L6 disappears entirely and the banner
    // says "node" twice, with every check green. `spec/runtime-targets.md` `RT-R1`
    // says a runtime is supported only if the gate runs in it; this is what enforces
    // that for L6.
    mutate: (t) => t.replace(/"test:l6:deno": "deno run[^"]*"/, '"test:l6:deno": "node examples/l6.ts"'),
  },
  {
    name: 'the Node rung pointed at a module that runs nothing',
    half: PKG, check: 'D6',
    // **W35, and it is the finding above one layer further in.** The two clauses
    // before this bind the Deno rung's runtime and its resolution and say nothing
    // about the FILE, and nothing anywhere bound the Node rung's command at all.
    // Measured for zero failures across four checks: `examples/run-flow.ts` exports
    // functions and runs nothing, so the rung exits 0 having asserted nothing —
    // which deletes P4's, P6's, P7's and P10's exit artifacts in one edit, since
    // ladder L6 is one file.
    mutate: (t) => t.replace('"test:l6": "node examples/l6.ts"', '"test:l6": "node examples/run-flow.ts"'),
  },
  {
    name: 'the Deno rung pointed at a module that runs nothing',
    half: PKG, check: 'D6',
    // The same substitution on the other rung, **keeping `deno run` and the import
    // map**, so both W36 clauses still pass and only the file has moved.
    mutate: (t) => t.replace(/("test:l6:deno": "deno run[^"]*)examples\/l6\.ts"/, '$1examples/run-flow.ts"'),
  },
  {
    name: 'the Node rung started with the WRONG runtime',
    half: PKG, check: 'D6',
    // **Its own file is right and its runtime is wrong**, which is what separates
    // this clause from the one below it. Written first as *`node examples/run-flow.ts`*
    // and re-pointed: that trips the FILE clause and leaves this one masked behind
    // a sibling reporting the same id, at an unmoved failure count. The self-test's
    // own STILL-CAUGHT arm is what said so, which is `doc/workflow.md` rule 8's
    // *fires for the reason it names* enforced by a file rather than by a reader.
    mutate: (t) => t.replace('"test:l6": "node examples/l6.ts"', '"test:l6": "deno run examples/l6.ts"'),
  },
  {
    name: 'spec/README.md names a version that is not the pin',
    half: 'spec/README.md', check: 'D7',
    // **The state this whole item was in for an hour, and the gate was green.**
    // `package.json`, the import map and `PIN` all said 0.5.2 while five `spec/`
    // documents and `AGENTS.md` still said 0.5.1 — `D2` compares the manifest to
    // `PIN` and stops there. The mutation is the pin STATEMENT, not any mention of
    // a version: `spec/` legitimately cites older versions in every re-dating
    // paragraph, and a check that refused those would refuse the record.
    mutate: (t) => t.replace(/at \*\*\d+\.\d+\.\d+\*\*, the version we pin/,
      'at **9.9.9**, the version we pin'),
  },
  {
    name: 'spec/README.md stops stating the pin at all',
    half: 'spec/README.md', check: 'D7',
    // **The clause that stops an empty document passing.** `D7` compares every
    // captured version to `PIN`; with no capture there is nothing to disagree, so a
    // document that has stopped saying which version to install would pass a
    // compare-only check. Deleting the sentence is the case.
    mutate: (t) => t.replace(/at \*\*\d+\.\d+\.\d+\*\*, the version we pin/, 'at the version we pin'),
  },
  {
    name: 'AGENTS.md names a version that is not the pin',
    half: 'AGENTS.md', check: 'D7',
    // The consumer-facing half. `AGENTS.md` is the one document a consumer reads
    // to know what to install, and it is the one `check-docs` executes — so a wrong
    // pin here is a wrong `npm install` line with every snippet still passing.
    mutate: (t) => t.replace(/Pin the scheduler at \d+\.\d+\.\d+\./, 'Pin the scheduler at 9.9.9.'),
  },
  {
    name: 'README.md names a version that is not the pin',
    half: 'README.md', check: 'D7',
    // **One probe per `D7` site — W37's own rule 8 re-run.** The adequacy reader
    // added three sites and only the first two had probes, so dropping this one from
    // `sites` cost **0**: the check stopped reading the repository's front page and
    // nothing said so. A site with no probe is a site that can leave.
    mutate: (t) => t.replace(/is pinned to \*\*\d+\.\d+\.\d+\*\* and installed from/,
      'is pinned to **9.9.9** and installed from'),
  },
  {
    name: 'doc/concept.md names a version that is not the pin',
    half: 'doc/concept.md', check: 'D7',
    mutate: (t) => t.replace(/We pin \*\*\d+\.\d+\.\d+\*\* \(Q3\)/, 'We pin **9.9.9** (Q3)'),
  },
  {
    name: 'examples/README.md names a version that is not the pin',
    half: 'examples/README.md', check: 'D7',
    mutate: (t) => t.replace(/Node installs `fyflow-scheduler@\d+\.\d+\.\d+` from/,
      'Node installs `fyflow-scheduler@9.9.9` from'),
  },
  {
    name: 'the Node rung deleted from package.json entirely',
    half: PKG, check: 'D6',
    // `S12` would notice this in `check-source` — the gate chain still names an
    // entry that no longer exists — but `check-scheduler` is where `D3`'s premise
    // lives, and a premise checked in another file is a premise this check cannot
    // rely on.
    mutate: (t) => t.replace('    "test:l6": "node examples/l6.ts",\n', ''),
  },
  {
    name: 'package.json is not readable JSON at all',
    // **`D6` does not RUN here, declared rather than discovered** — W36. That clause
    // reads this repository's own `package.json` too, and when it is unparseable it
    // stays silent on purpose: `D2` already owns the unreadable-manifest clause, and
    // a second `fail()` for one cause is the co-firing shape W29 measured. So the
    // honest report is that D6 did not run, which is what `notRun` says and what
    // `doc/workflow.md` section 1 rule 4 is about.
    half: PKG, check: 'D2', notRun: ['D6'],
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
    // The replacement version is DERIVED from the pinned one — its patch level
    // bumped by one — so it differs from the Node half whatever the pin is.
    mutate: (t) => t.replace(MAP_PIN_RE, (_m, v) => {
      const [maj, min, pat] = v.split('.').map(Number);
      return `jsr:@fyflow/scheduler@${maj}.${min}.${pat + 1}`;
    }),
  },
  {
    name: 'the Deno half pointed back at a working-tree path',
    half: MAP, check: 'D3',
    mutate: (t) => t.replace(MAP_PIN_RE, '../../fyflow-scheduler/index.ts'),
  },
  {
    name: 'the Deno half pointed at a different JSR package',
    half: MAP, check: 'D3',
    mutate: (t) => t.replace(MAP_PIN_RE, (_m, v) => `jsr:@fyflow/schedulr@${v}`),
  },
  {
    name: 'the Deno half unpinned',
    half: MAP, check: 'D3',
    mutate: (t) => t.replace(MAP_PIN_RE, 'jsr:@fyflow/scheduler'),
  },
  {
    name: 'the bare specifier dropped from the import map entirely',
    half: MAP, check: 'D3',
    mutate: (t) => t.replace(MAP_ENTRY_RE, '"_unused": "x"'),
  },
  {
    name: 'the import map is not readable JSON at all',
    half: MAP, check: 'D3',
    // **W29.** `D3`'s unreadable-map clause had no probe for the same reason
    // `D2`'s did not: every other MAP probe writes valid JSON.
    mutate: (t) => t.replace('{\n', '{{\n'),
  },
  // --- D8: the PUBLISHED manifests — W57, ADR 0048 rules 1-3 ------------------
  {
    name: 'package.json declares no peer dependency on the scheduler',
    half: PKG, check: 'D8',
    // The state this repository was in for sixteen plans: a devDependency the gate installs
    // and nothing a consumer's installer reads. `D2` is satisfied; only `D8` sees it.
    mutate: (t) => t.replace(/,\r?\n[ \t]*"peerDependencies": \{\r?\n[ \t]*"fyflow-scheduler": "\d+\.\d+\.\d+"\r?\n[ \t]*\}/, ''),
  },
  {
    name: 'the peer range is a CARET rather than the pin',
    half: PKG, check: 'D8',
    // Anchored on the `peerDependencies` block; `PKG_PIN_RE` is anchored on the devDependencies
    // block, so neither depends on the order the two appear in (W57, and its adequacy reader).
    mutate: (t) => t.replace(/("peerDependencies": \{\s*"fyflow-scheduler": ")(\d+\.\d+\.\d+)/, '$1^$2'),
  },
  {
    name: 'the peer pinned to a DIFFERENT version from the devDependency',
    half: PKG, check: 'D8',
    mutate: (t) => t.replace(/("peerDependencies": \{\s*"fyflow-scheduler": ")(\d+)\.(\d+)\.(\d+)/,
      (_m, p, a, b, c) => `${p}${a}.${b}.${Number(c) + 1}`),
  },
  {
    name: 'deno.json maps no fyflow-scheduler import',
    half: 'deno.json', check: 'D8',
    // Measured at W57: `deno publish --dry-run` then passes in this repository — resolving the
    // bare specifier through package.json to the npm build — and refuses in a clean copy.
    // **Re-anchored AGNOSTICALLY by W62**: this removed the whole `imports` block by its literal
    // two-line text, and the block gained a second entry (`jsonata`, ADR 0052) — `the mutation
    // matched nothing` in W62's first gate over its final tree, rule 7 (b) firing on a file in
    // nobody's `Owns`. It removes the scheduler's own LINE now, whatever else the block maps.
    mutate: (t) => t.replace(/[ \t]*"fyflow-scheduler": "jsr:@fyflow\/scheduler@\d+\.\d+\.\d+",?\r?\n/, ''),
  },
  {
    name: 'deno.json maps the scheduler to a DIFFERENT version',
    half: 'deno.json', check: 'D8',
    mutate: (t) => t.replace(/("imports": \{\s*"fyflow-scheduler": "jsr:@fyflow\/scheduler@)(\d+)\.(\d+)\.(\d+)/,
      (_m, p, a, b, c) => `${p}${a}.${b}.${Number(c) + 1}`),
  },
  {
    name: 'deno.json maps the scheduler to npm: — the build ADR 0029 refused for Deno',
    half: 'deno.json', check: 'D8',
    mutate: (t) => t.replace(/"fyflow-scheduler": "jsr:@fyflow\/scheduler@(\d+\.\d+\.\d+)"/, '"fyflow-scheduler": "npm:fyflow-scheduler@$1"'),
  },
  {
    name: 'deno.json is not readable JSON at all',
    half: 'deno.json', check: 'D8',
    mutate: () => '{ this is not json',
  },
  {
    name: 'the peer marked OPTIONAL in peerDependenciesMeta',
    half: PKG, check: 'D8',
    // **The adequacy reader`s m20**: with this block present, `npm install <tgz>` in a fresh
    // consumer added the library and NOT the scheduler, and D2, D8 and S8 were all green.
    mutate: (t) => t.replace('  "peerDependencies": {',
      '  "peerDependenciesMeta": {\n    "fyflow-scheduler": { "optional": true }\n  },\n  "peerDependencies": {'),
  },
  {
    name: 'deno.json re-maps the scheduler to a working-tree path inside a scopes block',
    half: 'deno.json', check: 'D8',
    // **The adequacy reader`s m22**: `deno info` resolved `src/driver/driver.ts`'s specifier to
    // `../fyflow-scheduler/index.ts` with the `imports` entry intact and every check green.
    mutate: (t) => t.replace('  "publish": {',
      '  "scopes": {\n    "./src/": { "fyflow-scheduler": "../fyflow-scheduler/index.ts" }\n  },\n  "publish": {'),
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
    // **[Q141](../doc/questions/q141.md), and the one live defect this item closed.**
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
    // **`pkgDir` rather than `dir`, because the parameter SHADOWED the scratch directory and W105's
    // first edit bound to the wrong one** — `join(dir, 'note.txt')` wrote into
    // `node_modules/fyflow-scheduler`, which this probe has just deleted, and the suite died with
    // `ENOENT` rather than reporting. The junction's TARGET is the scratch directory and its LOCATION is
    // the install directory; one name for both is how that went unnoticed. The scratch directory arrives
    // as the fourth argument because the probes are module-scope literals and it is local to `selfTest`.
    apply: (root, pkgDir, stash, scratch) => {
      rmSync(pkgDir, { recursive: true, force: true });
      writeFileSync(join(scratch, 'note.txt'), 'link probe');
      const target = scratch;
      try {
        symlinkSync(target, pkgDir, 'junction');
      } catch {
        // **A skip here is a probe passing for the wrong reason**, so it is
        // reported as one. The first version of this probe reached this branch
        // every run — `require` is not defined in an ES module, so the
        // `symlinkSync` call threw a ReferenceError rather than failing to make a
        // junction, and the probe reported SKIP on a machine that creates them
        // fine. That is `doc/workflow.md` rule 7 (b) in its purest form: the
        // mutation did not happen and the harness said so only because it was
        // asked to.
        // **`pkgDir`, not `dir` — W143.** This read `cpSync(stash, dir, …)`, and `dir` is not in scope
        // here (the parameters are `root, pkgDir, stash, scratch`), so reaching this branch threw a
        // ReferenceError rather than putting back the package it had just deleted. `runOne`'s `finally`
        // restores from the stash anyway; this line is the branch saying what it means.
        cpSync(stash, pkgDir, { recursive: true });
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
      writeFileSync(p, readFileSync(p, 'utf8').replace(INSTALLED_VERSION_RE,
        (_m, maj, min, pat) => `"version": "${maj}.${min}.${Number(pat) + 1}"`));
    },
  },
];

/** Every check `check-scheduler.mjs` reports under, in the order it reports them. */
// **`D6` was added to `check-scheduler.mjs` and NOT to this list, and the effect is
// worth recording**: `tripped` is built by filtering THIS array against the output,
// so a `D6:` failure line was invisible to the id parse. Both new probes reported
// `exited 1, wanted [D6], got []` while the report rows plainly said `D6` — the two
// projections disagreeing, which is the `agree` check W29 added doing its job on the
// author who widened the check and forgot the allowlist. **An allowlist is a second
// place the id vocabulary is written down**, which is [Q43](../doc/questions/q43.md)'s
// class and exactly what W29's declaration killed as a hypothesis for three other
// self-tests — here it is live.
const ALL_CHECKS = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'];

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
const MIN_PROBES = 41;

/** The same floor for `META`, and for the same reason. */
const MIN_META = 36;

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
 * [Q146](../doc/questions/q146.md). **Two** entries were written expecting
 * *disappeared*, both came back **STILL CAUGHT** on this list's first run, and the
 * author read the same mechanism into each: a sibling clause reporting the SAME id
 * firing in the disabled clause's place, invisible to a set-equality grading.
 *
 * **That was right about one of them and wrong about the other, and the count is
 * what said so.** W29's conformity reader falsified the author's *"it goes red if
 * the guard is removed"* — deleting `D5`'s fallthrough guard left the whole file at
 * **18/18, 21/21, exit 0** — so the grading gained the discriminator
 * [Q146](../doc/questions/q146.md)'s own row proposes, and it immediately
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
  // discriminator its own [Q146](../doc/questions/q146.md) row proposes is what
  // falsified it. **Co-firing is not masking**, and only `D5` below is the real
  // thing.
  ['D2`s devDependency clause disabled — the pin the GATE installs (ADR 0029 rule 1; it was ADR 0013 rule 1`s half until W57)',
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
  // --- D6 ---------------------------------------------------------------------
  ['D6`s deno-run clause disabled',
    'the Deno rung replaced by a second NODE run',
    (t) => t.replace("fail('D6', `\\`test:l6:deno\\` does not invoke", "[].push(`\\`test:l6:deno\\` does not invoke")],
  ['D6`s import-map clause disabled — the one the reader found missing',
    'the Deno rung stops passing the import map',
    (t) => t.replace("fail('D6', `\\`test:l6:deno\\` does not pass", "[].push(`\\`test:l6:deno\\` does not pass")],
  ['D6`s missing-rung clause disabled — W35',
    'the Node rung deleted from package.json entirely',
    (t) => t.replace("fail('D6', `package.json has no \\`${name}\\`", "[].push(`package.json has no \\`${name}\\`")],
  ['D6`s wrong-runtime clause disabled — W35, the Node half',
    'the Node rung started with the WRONG runtime',
    (t) => t.replace("fail('D6', `\\`${name}\\` does not invoke", "[].push(`\\`${name}\\` does not invoke")],
  ['D6`s wrong-FILE clause disabled — W35, and it is what a rung is FOR',
    'the Deno rung pointed at a module that runs nothing',
    // **Re-anchored after the entry-point rewrite** — W35's adequacy reader made
    // this clause compare the first non-flag token instead of testing a substring,
    // and the message went from *"does not run"* to *"does not RUN"*. The old anchor
    // then matched nothing and this file **said so** rather than passing: rule 7 (b),
    // and `doc/workflow.md` rule 8's *a provocation is evidence only when it fires*
    // enforced by a check rather than by a reader.
    (t) => t.replace("fail('D6', `\\`${name}\\` does not RUN", "[].push(`\\`${name}\\` does not RUN")],
  // --- D7 ---------------------------------------------------------------------
  // Re-anchored when `D7` was rewritten to CAPTURE AND COMPARE after its adequacy
  // reader: the message went from *"does not state the pin as X"* to *"states the pin
  // as X"*, and this file said so — `a check id with no grading at all` — rather than
  // passing. Rule 7 (b), caught by the one bound here a floor edit cannot satisfy.
  ['D7`s wrong-version clause disabled — W37',
    'spec/README.md names a version that is not the pin',
    (t) => t.replace("fail('D7', `${rel_} states the pin as", "[].push(`${rel_} states the pin as")],
  ['D7`s no-statement clause disabled — W37, and it is what stops an EMPTY document passing',
    'spec/README.md stops stating the pin at all',
    (t) => t.replace("fail('D7', `${rel_} states the pin nowhere", "[].push(`${rel_} states the pin nowhere")],
  // --- D8 — W57 ---------------------------------------------------------------
  ['D8`s missing-peer clause disabled',
    'package.json declares no peer dependency on the scheduler',
    (t) => t.replace("fail('D8', 'package.json declares no peerDependencies", "[].push('package.json declares no peerDependencies")],
  ['D8`s exact-peer clause disabled — a caret or a different version passes',
    'the peer pinned to a DIFFERENT version from the devDependency',
    (t) => t.replace("fail('D8', `package.json declares the peer as", "[].push(`package.json declares the peer as")],
  ['D8`s missing-JSR-import clause disabled',
    'deno.json maps no fyflow-scheduler import',
    (t) => t.replace("fail('D8', 'deno.json maps no", "[].push('deno.json maps no")],
  ['D8`s JSR-form clause disabled — npm: and a wrong version pass',
    'deno.json maps the scheduler to a DIFFERENT version',
    (t) => t.replace("fail('D8', `deno.json maps \"fyflow-scheduler\" to", "[].push(`deno.json maps \"fyflow-scheduler\" to")],
  ['D8`s unreadable-deno.json clause disabled',
    'deno.json is not readable JSON at all',
    (t) => t.replace("fail('D8', `deno.json is unreadable", "[].push(`deno.json is unreadable")],
  ['D8`s optional-peer clause disabled — the adequacy reader`s m20',
    'the peer marked OPTIONAL in peerDependenciesMeta',
    (t) => t.replace("fail('D8', 'package.json marks the fyflow-scheduler peer OPTIONAL", "[].push('package.json marks the fyflow-scheduler peer OPTIONAL")],
  ['D8`s scopes clause disabled — the adequacy reader`s m22',
    'deno.json re-maps the scheduler to a working-tree path inside a scopes block',
    (t) => t.replace("fail('D8', `deno.json re-maps the scheduler inside scopes", "[].push(`deno.json re-maps the scheduler inside scopes")],
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
  // **The shared instrumented replace — W143, Q434.** Loaded by the ROOT rather than by `./`, because
  // a mutated copy of this file would not find a sibling (scripts/selftest-guards.mjs's header).
  const { applyMutation, missWhy } = await import(pathToFileURL(join(root, 'scripts', 'selftest-guards.mjs')).href);
  // **Per PROCESS, and removed on the way out including on the abort path — W105.** `dev-dist/` is one
  // flat namespace and this was a FIXED path inside it, `rmSync`d on entry, so a child running this same
  // function deleted its parent's fixtures and two top-level runs did the same to each other
  // ([Q182](../doc/questions/q182.md)). The `rmSync` stays, and is now load-bearing for a different
  // reason: Windows recycles pids, so a directory a killed run left can be inherited by a live one.
  // **`process.on('exit')` rather than a `finally`**, because this function returns from many places and
  // the one road none of their `rmSync` calls covers is a THROW — which is how W103's finding 3 left its
  // stub behind. `SIGKILL` leaks this one directory: *one path per killed run, not one per probe*.
  const dir = join(root, 'dev-dist', `sched-selftest-${process.pid}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  process.on('exit', () => rmSync(dir, { recursive: true, force: true }));
  // The RELATIVE spelling, DERIVED rather than written a second time — W105. Two sources for one
  // directory means pid one and not the other, and a child then reads a path nothing staged into,
  // which is hazard 5's shape and W38's adequacy reader's empty directory printing `ok`.
  const relDir = relative(root, dir).replace(/\\/g, '/');
  // **The flat `.meta-*` mutants are registered too.** Each is written and removed per entry inside a
  // `finally`, so at most one is alive at a time and a kill leaks one FILE beside the one directory —
  // but a throw between the write and the `finally` used to leave it, and a leftover `.mjs` in
  // `dev-dist/` is W103's finding 3's exact shape.
  process.on('exit', () => { for (const p of metaMutants) rmSync(p, { force: true }); });
  const metaMutants = new Set();

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

  // **`PROBES` is bounded by CITATION as well as by count — W36's adequacy reader.**
  // `META` has had a content bound since W29; `PROBES` had only `MIN_PROBES`, a
  // literal in this file which this file's own ceiling list already declares
  // lowerable. Measured, both for **zero failures**:
  //
  //   * delete the `package.json reinstates the working-tree link` probe and set
  //     `MIN_PROBES` to 19 — `19/19 probes caught`, `22/22 graded`, exit 0. Extended
  //     to all three probes no `META` entry names, plus `MIN_PROBES = 17`:
  //     `17/17`, `22/22`, exit 0. **Two of those three are exactly the probes W29's
  //     reader added to close `D4`'s three-artifact bound**, so that closure was
  //     reversible for one edited literal.
  //   * leave the working-tree-link probe in place and change its `mutate` to the
  //     wrong-version edit — `20/20 probes caught`, exit 0. The probe for the
  //     incident that cost a sibling checkout now duplicates another, under its own
  //     name, and the `file:` specifier shape has no probe anywhere.
  //
  // **A probe a `META` entry names is already protected**: deleting it makes the
  // child abort at exit 3. So the bound is the citation itself — every probe must be
  // named by some `META` entry, or declared here with a reason. The declared list is
  // what a reader checks; the alternative is a floor that cannot tell twenty probes
  // from seventeen plus a lowered number.
  // **Each uncited probe declares what its mutant must CONTAIN, not just that it
  // exists** — W36's rule 8 re-run, second pass. The citation bound below stops an
  // uncited probe being DELETED and the distinctness bound stops it DUPLICATING a
  // neighbour; neither stops it being **repurposed into a different edit that still
  // trips the same check**. Measured: change the working-tree-link probe's `mutate`
  // to the wrong-version edit and it reports `20/20 probes caught`, exit 0 — the
  // probe passes, `D2` fires, and the `file:` specifier shape (the declaration form
  // that cost this project a sibling checkout) silently has no coverage anywhere.
  //
  // **A probe's NAME is prose and nothing can check that prose describes an edit**
  // — [Q162](../doc/questions/q162.md)'s class. What IS checkable is the one string
  // the edit must produce, so each exemption carries it.
  const UNCITED = [
    // `D1`'s link clause has a `META` entry of its own; this probe drives the same
    // clause from the OTHER declaration shape — a `file:` specifier in the manifest
    // rather than a link in `node_modules` — and no clause is disabled for it.
    ['package.json reinstates the working-tree link', 'file:../fyflow-scheduler'],
    // `D4`'s three artifacts share one clause and one `META` entry. These two are
    // the per-artifact cases W29's reader added; citing them would need three
    // `META` entries for one `fail()` site, which the entry cap refuses. Their
    // mutants REMOVE a file rather than writing a string, so the bound is on the
    // artifact each one names.
    ['a partial publish — the BROWSER artifact is missing', null],
    ['a partial publish — the TYPES artifact is missing', null],
    // **W35, and the same reason as `D4`'s two above.** `D6`'s wrong-FILE clause is
    // one `fail()` site inside a loop over both rungs, so it takes one `META`
    // entry; the Deno half cites it and this is the Node half. It is the case that
    // was actually MEASURED surviving — `"test:l6": "node examples/run-flow.ts"`,
    // zero failures across four checks — so it is kept as a probe rather than
    // dropped for being the second of a pair, and the string bounds it.
    ['the Node rung pointed at a module that runs nothing', 'examples/run-flow.ts'],
    // **W37, and the same reason again.** `D7`'s pin-statement clause is one
    // `fail()` site inside a loop over two documents, so it takes one `META` entry;
    // `spec/README.md` cites it and this is `AGENTS.md`. Both were wrong at once on
    // the bump that added the check, which is why both are probed rather than one.
    ['AGENTS.md names a version that is not the pin', 'Pin the scheduler at 9.9.9.'],
    // The other three `D7` sites, for the same reason: one `fail()` site, one `META`
    // entry, and a probe each so that no site can leave unnoticed.
    ['README.md names a version that is not the pin', 'is pinned to **9.9.9**'],
    ['doc/concept.md names a version that is not the pin', 'We pin **9.9.9** (Q3)'],
    ['examples/README.md names a version that is not the pin', '`fyflow-scheduler@9.9.9`'],
    // **W57, `D8`.** Two clauses, one `META` entry each; the second probe of each pair drives
    // the same site from the other declaration shape and is bound by the string it writes.
    ['the peer range is a CARET rather than the pin', '"fyflow-scheduler": "^'],
    ['deno.json maps the scheduler to npm: — the build ADR 0029 refused for Deno', 'npm:fyflow-scheduler@'],
  ].map(([name, mustProduce]) => ({ name, mustProduce }));
  {
    const cited = new Set(META.map(([, probeName]) => probeName));
    const names = [...PROBES, ...DTS_PROBES, ...INSTALL_PROBES].map((x) => x.name);
    const uncited = names.filter((n) => !cited.has(n));
    const exempt = new Map(UNCITED.map((u) => [u.name, u.mustProduce]));
    const undeclared = uncited.filter((n) => !exempt.has(n));
    const stale = [...exempt.keys()].filter((n) => !names.includes(n));
    if (undeclared.length) {
      console.log(`  FAIL  ${undeclared.length} probe(s) are named by no META entry and are not ` +
        `declared UNCITED: ${undeclared.join(', ')}. An uncited probe can be deleted for one ` +
        'edited floor, or repurposed under its own name, and nothing says so.');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
    if (stale.length) {
      console.log(`  FAIL  ${stale.length} UNCITED entr(y/ies) name no probe: ${stale.join(', ')}. ` +
        'The exemption list outlived the probe it exempted, which is how a deletion hides.');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
    if (names.length !== new Set(names).size) {
      console.log('  FAIL  two probes share a name, so a META citation cannot say which it means.');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
    // **And no two probes may produce the SAME mutant** — W36's rule 8 re-run, which
    // is where the citation bound above turned out to be half a fix. It stops an
    // uncited probe being DELETED; it does not stop one being REPURPOSED. Measured:
    // leaving the `package.json reinstates the working-tree link` probe in place and
    // changing its `mutate` to the wrong-version edit gives `20/20 probes caught`,
    // exit 0 — the probe for the incident that cost a sibling checkout silently
    // becomes a duplicate of another, under its own name, and the `file:` specifier
    // shape loses its only coverage.
    //
    // **This is W29's `META` distinctness guard applied to `PROBES`**, and the same
    // argument carries: a floor counts entries and cannot tell N distinct mutations
    // from N-1 plus a duplicate. Comparing the mutated TEXT rather than the mutate
    // function is what makes two differently-written edits with one effect collide.
    {
      // The content half: an exempt probe must still produce the string its
      // exemption names, so repurposing it fails here rather than passing there.
      for (const probe of [...PROBES, ...DTS_PROBES]) {
        const must = exempt.get(probe.name);
        // **`mustProduce: null` was a silent opt-out — W37's adequacy reader,
        // BLOCKING.** Two tokens (`null`, plus repurposing the probe's `mutate`)
        // dropped an exempt probe out of this bound for **0** failures, `28/28`
        // green. The negative control is on the same expression: the repurposing
        // ALONE, with the string intact, costs 1 and names the probe. The two
        // legitimate `null`s are `INSTALL_PROBES` with neither a `mutate` nor a
        // `half`, so they are skipped by the two clauses after this one and the
        // disjunct was doing no work for them — it was pure opt-out for everyone
        // else, in a list whose own comment says *each uncited probe declares what
        // its mutant must CONTAIN*.
        // `exempt.has` and not `!must`: a CITED probe has no entry here at all, so
        // `must` is `undefined` for it too. The first version of this guard omitted
        // that and fired on every cited probe — caught on its first run.
        if (exempt.has(probe.name) && typeof probe.mutate === 'function' && probe.half && !must) {
          console.log(`  FAIL  UNCITED probe ${JSON.stringify(probe.name)} declares no string its ` +
            'mutant must contain, and it has both a `mutate` and a `half` — so it can be repurposed ' +
            'onto any other clause with nothing to say so. `null` is for a probe that writes no ' +
            'string at all.');
          rmSync(dir, { recursive: true, force: true });
          return 1;
        }
        if (!must || typeof probe.mutate !== 'function' || !probe.half) continue;
        let mutated = '';
        try { mutated = probe.mutate(readFileSync(join(root, probe.half), 'utf8')); } catch { /* below */ }
        if (!mutated.includes(must)) {
          console.log(`  FAIL  the UNCITED probe ${JSON.stringify(probe.name)} no longer produces ` +
            `${JSON.stringify(must)}. It is named by no META entry, so this string is the only ` +
            'thing binding it to the clause it exists for.');
          rmSync(dir, { recursive: true, force: true });
          return 1;
        }
      }

      const sameHalf = new Map();
      for (const probe of [...PROBES, ...DTS_PROBES]) {
        if (typeof probe.mutate !== 'function' || !probe.half) continue;
        let mutated;
        try {
          mutated = probe.mutate(readFileSync(join(root, probe.half), 'utf8'));
        } catch {
          continue; // a probe whose mutate throws is the harness's problem, not this bound's
        }
        const key = `${probe.half}\u0000${mutated}`;
        const first = sameHalf.get(key);
        if (first !== undefined) {
          console.log(`  FAIL  probes ${JSON.stringify(first)} and ${JSON.stringify(probe.name)} ` +
            'produce the SAME mutated file. One of them is testing nothing its neighbour does not, ' +
            'and the clause it was named for has lost its only coverage.');
          rmSync(dir, { recursive: true, force: true });
          return 1;
        }
        sameHalf.set(key, probe.name);
      }
    }
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
    // **The same bound on PROBES, derived the same way — W37's adequacy reader.**
    // `MIN_PROBES` is a number and `UNCITED` is a list, and both live in this file:
    // deleting a probe, deleting its exemption and decrementing the floor is **three
    // edits in one commit for 0 failures**. This does not close that — the reader's
    // compound leaves `D7` with its other probe, so an id-level bound is satisfied —
    // and it closes the case the floor cannot see at all: **a check id whose LAST
    // probe leaves**, where the floor is happy because some other id gained one.
    //
    // *What is NOT closed is stated rather than implied.* A site-level bound would
    // need an exemption list for the clauses no probe can reach (`D7`'s unreadable
    // arm, `D2`'s and `D3`'s before it), and that list would live here too — which is
    // [W31](../doc/work-items/w31-the-self-list-check-policies-never-had.md)'s own
    // finding: *the regress does not move one list further out; it stops at the first
    // thing that can return early.* The remaining hole is a reviewer's, and it is
    // named in W37's Record rather than papered over.
    const probeIds = new Set([...PROBES, ...DTS_PROBES, ...INSTALL_PROBES].map((p) => p.check));
    const unprobed = ALL_CHECKS.filter((id) => !probeIds.has(id));
    if (unprobed.length) {
      console.log(`check-scheduler self-test — no probe drives any ${unprobed.join(', ')} clause.`);
      console.log('  FAIL  a check id with no probe at all; MIN_PROBES counts entries and cannot see ' +
        'which ids they reach, so the last probe for a check can leave for one edited number.');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
    if (uncovered.length) {
      console.log(`check-scheduler self-test — no META entry disables any ${uncovered.join(', ')} clause.`);
      console.log('  FAIL  a check id with no grading at all; the count of entries says nothing about ' +
        'which clauses they reach.');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
  }

  // **`D8` compares to `PIN` and to nothing else — W57's rule 8 provenance probe `c1`.**
  // Swapping `peer !== PIN` for `peer !== '0.5.2'` is invisible to every probe here on a
  // correct tree — W34's rule, both sources agree until the pin moves — and blind the day it
  // does: measured with `PIN` moved to 0.5.3 and the literal left, `D8` named the JSR half
  // and not the peer. A META entry cannot bind it (an entry must make a probe stop being
  // caught, and this one changes nothing observable), so the check's SOURCE is bound instead:
  // the pin's value may appear in the check's CODE exactly ONCE — the `PIN` declaration — and a
  // second occurrence is a comparison that will not move with it. **In any spelling**: the first
  // version split on `'0.5.2'` and was blind to `"0.5.2"` and to `'jsr:@fyflow/scheduler@0.5.2'`
  // (the adequacy reader`s m28 and m29, each green at 39/39, 34/34), so the bound now counts the
  // bare version string with comments stripped, which no quote style or prefix escapes.
  {
    const src = readFileSync(join(root, 'scripts', 'check-scheduler.mjs'), 'utf8');
    const pin = /const PIN = '(\d+\.\d+\.\d+)';/.exec(src)?.[1];
    const code = src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1 ');
    const literals = pin ? code.split(pin).length - 1 : 0;
    if (!pin || literals !== 1) {
      console.log(`  FAIL  the pin's value appears ${literals} time(s) in check-scheduler.mjs's code ` +
        '(comments stripped); exactly one — the PIN declaration — is allowed, or a comparison ' +
        'stops moving with the pin.');
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
      // [Q146](../doc/questions/q146.md) says so and this is the one place it is read.
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
      let relPath = `${relDir}/absent.d.ts`;
      if (probe.dts !== null) {
        relPath = `${relDir}/${String(i).padStart(2, '0')}.d.ts`;
        writeFileSync(join(root, relPath), probe.dts);
      }
      r = run({ ...process.env, CHECK_SCHEDULER_DTS: relPath });
    } else if (probe.half) {
      const path = join(root, probe.half);
      const before = readFileSync(path, 'utf8');
      const { out: after, misses } = applyMutation(probe.mutate, before);
      if (after === before) {
        return { vacuous: true, refused: false, ran: false, declared, tripped: [], agree: true,
          msg: 'the mutation matched nothing' };
      }
      // **And EVERY edit of it matched** (W143, Q434): a compound whose second edit lands nowhere
      // still changes the file, so the whole-file guard above passes it.
      if (misses > 0) {
        return { vacuous: true, refused: false, ran: false, declared, tripped: [], agree: true, msg: missWhy(misses) };
      }
      writeFileSync(path, after);
      restore = () => writeFileSync(path, before);
      try { r = run(process.env); } finally { restore(); }
    } else {
      const pkgDir = ctx.pkgDir;
      let skipped = false;
      try {
        skipped = probe.apply(root, pkgDir, ctx.stash, dir) === 'skipped';
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
  /** The control's mutation: it changes nothing, and `gradeMeta` skips the three text guards for it alone. */
  const IDENTITY = (t) => t;
  let noticed = 0, byCorpus = 0, byMask = 0, byCount = 0;
  console.log(`\nand against a broken check — ${META.length} mutations of check-scheduler.mjs itself\n`);
  /**
   * **One META entry, graded — a function since W143** so the control, the dead-compound case and the
   * `ran:` case below go through the SAME path as every entry rather than a copy of it. Returns
   * `{ ok2, why, kind }`; `kind` is how a noticed entry was noticed (`probe`, `corpus`, `count`, `mask`).
   * `source` is the text the mutation is applied to — the real check, except for the control.
   */
  const gradeMeta = (i, [name, probeName, mutate, maskedBy], source = checkSource) => {
    // **Instrumented — W143, Q434.** Only this FIRST application: the two guards below re-apply the
    // mutation where it must NOT match, and counting those would count their success as a miss.
    const { out: broken, misses } = applyMutation(mutate, source);
    let why = '', ok2 = false, kind = 'probe';
    if (broken === source && mutate !== IDENTITY) return { ok2, why: ' — the mutation matched nothing', kind };
    if (misses > 0) return { ok2, why: ` — ${missWhy(misses)}`, kind };
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
    if (mutate !== IDENTITY && mutate(broken) !== broken) {
      return { ok2, kind, why: ' — the mutation matched MORE THAN ONCE, so it landed ' +
        'on the first of several and the entry does not say which' };
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
    if (mutate !== IDENTITY && !mutate(source + source).endsWith(source)) {
      return { ok2, kind, why: ' — the mutation is GLOBAL: it edits every match rather ' +
        'than the one this entry names, so its verdict is about a set of clauses and not a clause' };
    }
    // **FLAT, with the pid in the NAME — and a rung is what corrected this, W105.** A `.meta-*` mutant
    // is a copy of the CHECK, which derives `ROOT = resolve(dirname(self), '..')`, so it must sit
    // exactly one directory below the repository root; W105 first nested it beside the fixtures on the
    // reasoning that a mutant is depth-free, and that is true only of a `.self-*` mutant, which is a copy
    // of this SELFTEST module and receives `ROOT` as a parameter. Nested, the copy reads `dev-dist/` as
    // its tree: `check:spec:selftest` reported **29/29 graded, 0 by the named probe, 29 by the corpus**,
    // which is this file's own *the harness broke rather than the check* clause firing exactly as written.
    const path = join(root, 'dev-dist', `.meta-sched-${process.pid}-${i < 0 ? 'control' : String(i).padStart(2, '0')}.mjs`);
    metaMutants.add(path);
    writeFileSync(path, broken);
    let lastOutcome;
    try {
      const r = spawnSync(process.execPath, [join(root, 'scripts', 'check-scheduler.mjs'), '--self-test'],
        { cwd: root, encoding: 'utf8', timeout: 900_000,
          env: { ...process.env, CHECK_SCHEDULER_SCRIPT: path, CHECK_SCHEDULER_PROBE: probeName } });
      const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
      const ran = /^ {2}ran: yes$/m.test(out);
      const outcome = (out.match(/^ {2}outcome: (\w+)$/m) ?? [, ''])[1];
      lastOutcome = outcome;
      if (r.status === 3) why = ` — ${out.trim().split('\n').pop()}`;
      // A mutant that fails on the repository's own tree is NOTICED — by the corpus,
      // which is stronger than any probe. Its probe verdict is meaningless and is
      // not consulted. Counted separately so the number of probe-backed gradings
      // stays visible.
      else if (outcome === 'corpus') { ok2 = true; kind = 'corpus'; why = ' (by the corpus: the mutant is not inert)'; }
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
      // **This is [Q146](../doc/questions/q146.md)'s own proposed discriminator**,
      // taken here for the two entries that need it rather than for all 21.
      // **`caught` is no longer a terminal verdict — it asks one more question.**
      // The id SET being unchanged does not mean nothing changed: two clauses can
      // report one id, and then disabling either leaves the set alone and moves the
      // COUNT. W29's conformity reader found this the hard way — it removed `D5`'s
      // fallthrough guard and the whole file stayed at 18/18, 21/21, exit 0 — and
      // the count is the discriminator [Q146](../doc/questions/q146.md) names.
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
          } else { ok2 = true; kind = 'count'; why = ` (by the COUNT: ${bN} -> ${mN}; the id set never moved)`; }
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
          } else { ok2 = true; kind = 'mask'; why = ` (MASKED by ${maskedBy}: same id and same count ${mN}, different message)`; }
        }
        else why = ` — "${probeName}" is STILL CAUGHT against a check that does not check, and the ` +
          `failure count did not move either (${bN} -> ${mN})`;
      }
      else if (outcome === 'noisy') why = ` — "${probeName}" still reports every id it declared; the mutant only got NOISIER, which is not a detection`;
      else if (['disappeared', 'disagreed', 'exit0'].includes(outcome)) ok2 = true;
      else why = ` — the child reported outcome "${outcome || '(none)'}", which grades nothing`;
    } finally { rmSync(path, { force: true }); }
    return { ok2, why, kind, outcome: lastOutcome };
  };

  // **The CONTROL for this pass — W143, Q437.** An UNMUTATED copy of the check, driven through the same
  // `gradeMeta` every entry takes, naming `META[0]`'s probe. Nothing is broken, so the probe must still
  // catch what it declares — the child's `outcome: caught` — and the entry must NOT be graded noticed.
  // A copy that cannot run against the check (a wrong ROOT, a missing sibling) comes back noticed, which
  // is how a pass grades every mutation of a check it never ran against (W105's adequacy reader, measured
  // in check-wiring-selftest.mjs). **Removing this block is visible**: `control` is read by the verdict.
  /** **What it means for the control to HOLD**, one expression for the control and for its own case below. */
  const controlHolds = (g) => !g.ok2 && g.outcome === 'caught';
  const control = gradeMeta(-1, ['the control: an UNMUTATED copy', META[0][1], IDENTITY]);
  if (!controlHolds(control)) {
    console.log(`  FAIL  the control: an UNMUTATED copy of check-scheduler.mjs is graded ` +
      `${control.ok2 ? 'NOTICED' : 'not caught'} (outcome "${control.outcome ?? '(none)'}"${control.why}). Nothing ` +
      'is broken, so the probe must still catch what it declares — every verdict below would be a fact ' +
      'about the harness rather than about the check.');
    rmSync(dir, { recursive: true, force: true });
    return 1;
  }
  console.log('  ok    the control: an unmutated copy is NOT graded as noticed (outcome caught)');
  // **The control handed a copy that CANNOT run — its own case, W143, Q437.** The same unmutated source with
  // a first line that throws must NOT hold: its child goes `corpus` on the clean tree, as a copy at the wrong
  // depth did at W105. Graded on the control's own condition, so the case and the control cannot drift.
  {
    const broken = gradeMeta(-1, ['the control: a copy that cannot run', META[0][1], IDENTITY],
      'throw new Error("W143: this copy cannot run");\n' + checkSource);
    if (controlHolds(broken)) {
      console.log('  FAIL  GUARD CASE the control handed a copy that cannot run — Q437 — it still held');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
    console.log(`  ok    GUARD CASE the control handed a copy that cannot run — Q437 (outcome ${broken.outcome || '(none)'})`);
  }

  // **The guards' own cases, checked in — W143, `doc/workflow.md` section 5 rule 7.** Each is graded on
  // the failure line its guard prints, so a case that went red for another reason is a FAIL too.
  const cases = [
    // Q434: a compound whose SECOND edit matches nothing. `META[0]`'s mutation is real, so the text
    // changes and the whole-text guard passes it; only the instrumented count can see the dead half.
    ['a compound META entry whose second edit matches nothing — Q434',
      [`${META[0][0]}, then a dead second edit`, META[0][1], (t) => META[0][2](t).replace('\u0000W143: no such anchor', '')],
      'matched NOTHING'],
    // Q434, the other method the shared guard counts: `replaceAll` (three swap entries elsewhere use it).
    ['a compound META entry whose second edit is a `replaceAll` matching nothing — Q434',
      [`${META[0][0]}, then a dead replaceAll`, META[0][1], (t) => META[0][2](t).replaceAll('\u0000W143: no such anchor', '')],
      'matched NOTHING'],
    // Q536: a mutation INERT on the clean tree and FATAL under its probe. Under the bare specifier
    // dropped from the import map, `spec` is undefined and `.trim()` throws before the report line, so
    // the child prints `ran: no`; on the real map it is a string and the mutant passes. The `ran:` guard
    // is the only arm that names this — disable it and the entry reads `outcome "(none)"` instead.
    ['a mutant inert on the clean tree and FATAL under its probe — the `ran:` case, Q536',
      ['the import-map read made to throw on a missing entry', 'the bare specifier dropped from the import map entirely',
        (t) => t.replace("const spec = map.imports?.['fyflow-scheduler'];", "const spec = map.imports?.['fyflow-scheduler'].trim();")],
      'the mutant did not run'],
  ];
  for (const [label, entry, must] of cases) {
    const g = gradeMeta(META.length, entry);
    if (g.ok2 || !g.why.includes(must)) {
      console.log(`  FAIL  GUARD CASE ${label} — wanted a FAIL naming "${must}", got ` +
        `${g.ok2 ? 'ok' : 'FAIL'}${g.why}`);
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
    console.log(`  ok    GUARD CASE ${label}`);
  }
  // Q434 in the PROBES pass too: the same dead second edit, through `runOne`, which returns before it
  // writes anything when an edit missed — so this case touches no file and spawns nothing.
  {
    const p = PROBES[0];
    const v = runOne({ ...p, mutate: (t) => p.mutate(t).replace('\u0000W143: no such anchor', '') }, 0, {});
    if (!v.vacuous || !v.msg.includes('matched NOTHING')) {
      console.log(`  FAIL  GUARD CASE a compound PROBE whose second edit matches nothing — Q434 — wanted a vacuous ` +
        `verdict naming "matched NOTHING", got ${v.vacuous ? 'vacuous' : 'graded'}: ${v.msg}`);
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
    console.log('  ok    GUARD CASE a compound PROBE whose second edit matches nothing — Q434');
  }
  console.log('');

  for (const [i, entry] of META.entries()) {
    const { ok2, why, kind } = gradeMeta(i, entry);
    if (ok2) {
      noticed++;
      if (kind === 'corpus') byCorpus++;
      if (kind === 'count') byCount++;
      if (kind === 'mask') byMask++;
    }
    console.log(`  ${ok2 ? 'ok  ' : 'FAIL'}  ${entry[0]}${ok2 ? '' : why}`);
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
  return noticed === META.length && controlHolds(control) ? 0 : 1;
}
