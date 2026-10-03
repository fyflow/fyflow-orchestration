#!/usr/bin/env node
// **`check-budget.mjs`'s negative tests — `doc/workflow.md` section 5 rule 7.** A check
// that has never been seen to fail is a claim about the past, so every clause here is
// fired by a staged tree and every clause is then DISABLED to prove the firing was the
// clause's rather than a sibling's.
//
//   node scripts/check-budget.mjs --self-test
//
// Three passes, each answering a question the one before it cannot:
//
//   PROBES  break the INPUT. Each entry stages a tree of the always-read set at chosen
//           sizes, points `CHECK_BUDGET_ROOT` at it, and declares the exact SET of
//           check ids it must trip — rule 7 (c), because naming ONE id does not
//           discriminate: a merely malformed probe trips two.
//   META    break the CHECK. Each entry disables one clause and names the probe that
//           must stop being caught. A clause nothing probes is a clause that can go
//           inert in silence, which is [Q138](../doc/open-questions.md).
//   SELF    break THIS FILE. Each entry must change a verdict, because every bound
//           above lives here and a list bounded by nothing is the regress
//           [Q217](../doc/open-questions.md) names.
//
// **This harness never writes inside the tree it measures.** A probe stages its own
// copy of the three documents under `dev-dist/budget-selftest-<pid>/`, so the
// repository is untouched by construction rather than by a restore — which is the one
// requirement on a rule 8 harness that an *asserted restore* only approximates. The
// content digest is still taken at both ends, because *untouched by construction* is a
// claim and the digest is the measurement of it.
//
// **The scratch path carries its PROCESS and is removed on the way out including on the
// abort path** —
// [ADR 0072](../doc/decisions/0072-a-scratch-path-carries-its-process-and-a-self-test-that-shares-the-tree-says-so.md),
// which `check-wiring`'s `G6` refuses a statement naming `dev-dist` without.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** This file's own path, so a SOURCE clause can read the harness as well as the check. */
const SELF_PATH = fileURLToPath(import.meta.url);

// --- the environment the rungs need -------------------------------------------
// **v0.19, P18's retro: a harness asserts the ENVIRONMENT its rungs need**, because a
// rung that cannot START is indistinguishable in the report from a rung a probe took
// down — W67, where four probes came back CRASH on a correct tree because the shell
// had no `fnm use 24`. Every other requirement on a rule 8 harness is about a probe
// that RAN, and none of them can see a constant.
const NODE_MAJOR = Number(process.versions.node.split('.')[0]);
const MIN_NODE_MAJOR = 24;

// --- the floors on this file's own lists ---------------------------------------
const MIN_PROBES = 13;
// **`MIN_META` and `MIN_SELF` sit AT their lists' lengths, not one below.** W112's adequacy reader
// measured what the slack bought: one `META` entry deletable for zero (the `B1` isFile half — the
// probe's own comment calls it *the LENIENT direction* — because the coverage bound only asks that
// SOME entry name a probe of `B1`, and the other `B1` entry satisfied it), and one `SELF` entry
// deletable for zero which then **compounded**: that deletion plus `MAX_CORPUS = 99` was also EXIT 0,
// so the single free slot bought a second weakening. *A floor one below its list is a permission to
// delete the entry nobody has named.*
const MIN_META = 11;
const MIN_SELF = 14;
// **`SOURCE` gets a floor for the same reason `PROBES` and `META` have one, and the
// reason it was added LAST is the finding.** Emptying it removed five guards whose
// CASES do not exist on a correct tree, so the child stayed green and the entry read
// *the mutation costs nothing* — the seventh instance of that polarity in this file.
// A floor is the one bound that does not need a case.
//
// **Its limit, recorded rather than argued**: the compound *lower this and empty the
// list* defeats it, and nothing here can see that — which is exactly where
// [W31](../doc/work-items/w31-the-self-list-check-policies-never-had.md) stopped.
// *The regress does not move one list further out; it stops at the first thing that
// can return early.* What is NOT the limit is the clauses themselves: each of the five
// is bound by a planted case above, so emptying the list to weaken ONE of them is
// caught whatever this floor says.
const MIN_SOURCE = 7;
// **A `corpus` grading is a PASS and that is [Q150](../doc/open-questions.md)** — W30
// measured it in `check-spec`, where dropping one relocation made 21 mutants non-inert
// and the file exited 0 reporting *0 noticed by the named probe, 21 by the corpus*. A
// mutant that fails on the untouched tree is noticed, but its probe verdict is noise.
const MAX_CORPUS = 0;

const SET_PATHS = ['CLAUDE.md', 'doc/workflow.md', 'doc/concept.md'];

// ==============================================================================
// PROBES — break the INPUT
// ==============================================================================
//
// `sizes` names the byte length each member is staged at; `null` means the member is
// not staged at all, and `'dir'` stages a DIRECTORY at that path. `declare` mutates
// `check-budget.mjs`'s own declaration, which is the only input `B4` has — that clause
// compares three declared numbers and no tree can reach it.
//
// **The sizes are chosen so that each clause fires ALONE.** That took a correction: the
// first cut of `check-budget.mjs` set `TOTAL_CEILING` to the per-file ceilings' sum, so
// a total breach implied a per-file breach and `B3` could not fire on its own — a clause
// with no instance of its own, which is what rule 8 obligation (a) is for. The total is
// strictly below the sum now and probe `b3-total-alone` is the case.
const PROBES = [
  // **The CONTROL — v0.11, P10's retro.** A probe that changes nothing must come back
  // clean. Without it every verdict below is a claim about a harness nobody has seen
  // produce a pass.
  {
    name: 'the set staged at its real sizes — the control, and it must trip nothing',
    check: null, sizes: 'real',
  },

  // --- B2: each member against its OWN ceiling, one member at a time ------------
  // Three entries rather than one, because the clause is a LOOP over `SET` and
  // obligation (d) asks of every list whether one entry can leave. The other two
  // members are staged tiny so the TOTAL stays under its ceiling and `B3` is silent:
  // that is what makes each of these `[B2]` alone rather than `[B2,B3]`.
  {
    name: 'CLAUDE.md one byte over its own ceiling, the others tiny',
    check: 'B2', sizes: { 'CLAUDE.md': 586_001, 'doc/workflow.md': 100, 'doc/concept.md': 100 },
    says: 'CLAUDE.md is 586001 bytes and its ceiling is 586000',
  },
  {
    name: 'doc/workflow.md one byte over its own ceiling, the others tiny',
    check: 'B2', sizes: { 'CLAUDE.md': 100, 'doc/workflow.md': 310_001, 'doc/concept.md': 100 },
    says: 'doc/workflow.md is 310001 bytes and its ceiling is 310000',
  },
  {
    name: 'doc/concept.md one byte over its own ceiling, the others tiny',
    check: 'B2', sizes: { 'CLAUDE.md': 100, 'doc/workflow.md': 100, 'doc/concept.md': 20_001 },
    says: 'doc/concept.md is 20001 bytes and its ceiling is 20000',
  },

  // --- B3: the SET against the total, with every member legal -------------------
  {
    name: 'every member AT its ceiling, so the set exceeds the total and no member does',
    check: 'B3', sizes: { 'CLAUDE.md': 586_000, 'doc/workflow.md': 310_000, 'doc/concept.md': 20_000 },
    says: 'the always-read set is 916000 bytes and TOTAL_CEILING is 907590',
  },

  // --- B1: the set is there -----------------------------------------------------
  // One per member, for the same loop-bound reason as `B2`'s three. A member that is
  // not staged also takes itself out of the total, so `B3` stays silent and these are
  // `[B1]` alone.
  {
    name: 'CLAUDE.md not in the tree at all',
    check: 'B1', sizes: { 'CLAUDE.md': null, 'doc/workflow.md': 'real', 'doc/concept.md': 'real' },
    says: 'CLAUDE.md is declared in the always-read set and is not a readable file',
  },
  {
    name: 'doc/workflow.md not in the tree at all',
    check: 'B1', sizes: { 'CLAUDE.md': 'real', 'doc/workflow.md': null, 'doc/concept.md': 'real' },
    says: 'doc/workflow.md is declared in the always-read set and is not a readable file',
  },
  {
    name: 'doc/concept.md not in the tree at all',
    check: 'B1', sizes: { 'CLAUDE.md': 'real', 'doc/workflow.md': 'real', 'doc/concept.md': null },
    says: 'doc/concept.md is declared in the always-read set and is not a readable file',
  },
  {
    // **The `isFile` half, which `existsSync` alone would pass.** A directory at that
    // path exists, and a budget that measured directories would report a size of zero
    // for the largest document in the set — the LENIENT direction.
    name: 'CLAUDE.md staged as a DIRECTORY, which exists and is not a file',
    check: 'B1', sizes: { 'CLAUDE.md': 'dir', 'doc/workflow.md': 'real', 'doc/concept.md': 'real' },
    says: 'CLAUDE.md is declared in the always-read set and is not a readable file',
  },

  // --- the compound, declared rather than engineered away -----------------------
  {
    name: 'CLAUDE.md over its ceiling AND the set over its total — the compound',
    check: 'B2', also: ['B3'],
    sizes: { 'CLAUDE.md': 586_001, 'doc/workflow.md': 310_000, 'doc/concept.md': 20_000 },
    says: 'CLAUDE.md is 586001 bytes and its ceiling is 586000',
  },

  // --- B4: the declaration's own consistency ------------------------------------
  // `B4` compares three declared numbers, so its input is the DECLARATION and these
  // three probes mutate it. Without them `B4` is a clause whose only evidence is that
  // it is written down.
  {
    name: 'TOTAL_CEILING declared ABOVE the per-file ceilings` sum — slack B2 cannot see',
    check: 'B4', sizes: 'real',
    declare: (t) => t.replace('const TOTAL_CEILING = 907_590;', 'const TOTAL_CEILING = 999_999;'),
    says: 'TOTAL_CEILING is 999999 and the per-file ceilings sum to 916000',
  },
  {
    name: 'TOTAL_CEILING declared BELOW the total target — the budget already met',
    check: 'B4', also: ['B3'], sizes: 'real',
    declare: (t) => t.replace('const TOTAL_CEILING = 907_590;', 'const TOTAL_CEILING = 70_000;'),
    says: 'TOTAL_CEILING is 70000 and TOTAL_TARGET is 78848',
  },
  {
    name: 'one per-file target moved, so the targets and TOTAL_TARGET are two budgets',
    check: 'B4', sizes: 'real',
    declare: (t) => t.replace('    target: 17 * 1024,', '    target: 18 * 1024,'),
    says: 'the per-file targets sum to 79872 and TOTAL_TARGET is 78848',
  },
];

// **The GRADER's own controls — v0.24, P23's retro.** A set carries a probe whose right
// verdict is CRASH and one whose right verdict is WRONG-REASON, both graded on every
// pass, because the only two rung readings in P23 that were wrong were a grader's and
// *a controlled grader proves the grader can SAY a verdict; it says nothing about
// whether its COMPARISON of verdicts is right* ([Q452](../doc/open-questions.md), W110).
// They are a separate list so the probe floor cannot be satisfied by them.
const GRADER_CONTROLS = [
  {
    name: 'GRADER CONTROL — the check made to THROW: non-zero exit, zero named failures',
    expect: 'crash', check: 'B2', sizes: 'real',
    declare: (t) => t.replace('const failures = [];', 'const failures = [];\nthrow new Error("grader control");'),
  },
  {
    // **The first cut of this control fired `B1` while declaring `B2`, and the grader
    // said `against-declaration` — which was RIGHT.** An id set that does not match is
    // a different defect from a right id reached for a wrong reason, and a control that
    // conflates them grades nothing. So this one trips exactly `B2`, as declared, and
    // names a reason the check does not print: the id set matches, the reason does not,
    // and `wrong-reason` is the only verdict left.
    name: 'GRADER CONTROL — trips B2 as declared, with a reason the check never prints',
    expect: 'wrong-reason', check: 'B2',
    sizes: { 'CLAUDE.md': 586_001, 'doc/workflow.md': 100, 'doc/concept.md': 100 },
    says: 'CLAUDE.md is 999999 bytes and its ceiling is 42',
  },
  {
    // **The CRASH discriminator's EXIT-CODE half, which the two controls above could not see.**
    // W112's adequacy reader dropped `r.status !== 0 &&` from the crash test and measured EXIT 0
    // with **`grader: 2/2 control(s) graded as declared`** — so a check exiting 0 and reporting
    // nothing would have graded `crash`, and both controls were satisfied while the grader was
    // wrong. That is the brief's own question answered against the harness: *a controlled grader
    // proves the grader can SAY a verdict; it says nothing about whether its COMPARISON is right*
    // ([Q452](../doc/open-questions.md)). This control exits 0 with no named failure and must grade
    // `against-declaration`; under that mutation it grades `crash`.
    name: 'GRADER CONTROL — exits 0 reporting nothing while declaring B2: against-declaration, not a crash',
    expect: 'against-declaration', check: 'B2', sizes: 'real',
  },
  {
    // **`did-not-run` was an arm with NO CASE**, which the same reader measured by replacing it with
    // `if (false)` for zero — obligation (a)'s enumeration question asked of `verdict()`'s own
    // outcomes. Of the eight, seven had a case. This is the eighth: the banner is removed, so `RAN`
    // is false, while the probe still trips `B2` with a non-zero exit — which is what separates
    // *the check did not run* from *the check crashed*.
    name: 'GRADER CONTROL — the banner removed, so the check runs and cannot be seen to: did-not-run',
    expect: 'did-not-run', check: 'B2',
    sizes: { 'CLAUDE.md': 586_001, 'doc/workflow.md': 100, 'doc/concept.md': 100 },
    declare: (t) => t.replace('console.log(`budget check — the always-read set is', 'console.log(`BANNER REMOVED — the always-read set is'),
  },
];

/**
 * **`GRADER_CONTROLS` is bounded by COUNT and by MEMBERSHIP, and it had neither.** W112's adequacy
 * reader appended `.slice(0, 1)` to the array and measured EXIT 0 with the report reading
 * `grader: 1/1 control(s) graded as declared` — v0.24 requires the set to carry a probe whose right
 * verdict is WRONG-REASON and nothing checked that it did. A count alone is v0.14's *a count is not
 * a membership*, so the declared VERDICTS are the membership: each must be represented.
 */
const MIN_GRADER = 4;
const GRADED_VERDICTS = ['crash', 'wrong-reason', 'against-declaration', 'did-not-run'];

// ==============================================================================
// META — break the CHECK
// ==============================================================================
//
// `[what is disabled, the probe that must stop being caught, the mutation]`.
//
// **Anchor-agnostic about every NUMBER it does not mean to pin**, which is
// `check-markdown`'s own lesson three times over: *a mutation pinned to a magic number
// is unmutatable the moment the number is right to change*, and in that file `M5`'s
// entry was still pinned nine retunes after `M4`'s was fixed. Every ceiling here will
// move at W113, W114 and W115 by design.
const META = [
  ['B1`s readable-file clause disabled',
    'CLAUDE.md not in the tree at all',
    (t) => t.replace('if (!st || !st.isFile()) {', 'if (false) {')],
  ['B1`s isFile half narrowed to mere existence',
    'CLAUDE.md staged as a DIRECTORY, which exists and is not a file',
    (t) => t.replace('if (!st || !st.isFile()) {', 'if (!st) {')],
  ['B2`s comparison disabled',
    'CLAUDE.md one byte over its own ceiling, the others tiny',
    (t) => t.replace(/if \(n > m\.ceiling\) \{/, 'if (false) {')],
  ['B2`s loop narrowed to the first member — the LOOP BOUND',
    'doc/workflow.md one byte over its own ceiling, the others tiny',
    (t) => t.replace('for (const m of SET) {\n  const n = sizes.get(m.path);', 'for (const m of SET.slice(0, 1)) {\n  const n = sizes.get(m.path);')],
  ['B3`s comparison disabled',
    'every member AT its ceiling, so the set exceeds the total and no member does',
    (t) => t.replace(/if \(sizes\.size === SET\.length && measured > TOTAL_CEILING\) \{/, 'if (false) {')],
  ['B4`s per-file-sum clause disabled',
    'TOTAL_CEILING declared ABOVE the per-file ceilings` sum — slack B2 cannot see',
    (t) => t.replace(/if \(TOTAL_CEILING > sumCeilings\) \{/, 'if (false) {')],
  ['B4`s total-target clause disabled',
    'TOTAL_CEILING declared BELOW the total target — the budget already met',
    (t) => t.replace(/if \(TOTAL_CEILING < TOTAL_TARGET\) \{/, 'if (false) {')],
  ['B4`s target-sum clause disabled',
    'one per-file target moved, so the targets and TOTAL_TARGET are two budgets',
    (t) => t.replace(/if \(sumTargets !== TOTAL_TARGET\) \{/, 'if (false) {')],
  ['every failure swallowed',
    'CLAUDE.md one byte over its own ceiling, the others tiny',
    (t) => t.replace('const fail = (check, msg) => failures.push(`${check}: ${msg}`);', 'const fail = () => {};')],
  ['the non-zero exit removed',
    'doc/concept.md one byte over its own ceiling, the others tiny',
    (t) => t.replace('  console.log(`\\n${failures.length} failure(s).`);\n  process.exit(1);', '  console.log(`\\n${failures.length} failure(s).`);')],
  ['B2`s row deleted from the report`s CHECKS array, so its id is never printed',
    'CLAUDE.md one byte over its own ceiling, the others tiny',
    (t) => t.replace("  'B2 every member is inside its own ceiling',\n", '')],
];

// ==============================================================================
// SELF — break THIS FILE
// ==============================================================================
//
// Every bound above lives here, so without this list the whole file is a claim about
// itself. **Its limit is recorded rather than argued**: an entry cannot reach anything
// that RETURNS BEFORE IT, because the mutation reaches the parent as well as the child —
// W31's finding, and the reason `MIN_SELF` is not the last word.
const SELF = [
  ['one probe deleted from PROBES',
    (t) => t.replace(/\{\n    name: 'doc\/concept\.md one byte over its own ceiling[\s\S]*?\n  \},\n/, '')],
  ['PROBES emptied entirely',
    (t) => t.replace(/const PROBES = \[[\s\S]*?\n\];/, 'const PROBES = [];')],
  ['MIN_PROBES lowered AND PROBES emptied — the compound the floor alone cannot see',
    (t) => t.replace(/const MIN_PROBES = \d+;/, 'const MIN_PROBES = 0;')
      .replace(/const PROBES = \[[\s\S]*?\n\];/, 'const PROBES = [];')],
  // **The whole entry, up to its closing bracket.** The first cut matched
  // `[\s\S]*?\n`, which is minimal to the FIRST newline, so it deleted the entry's
  // opening line and left its body stranded — a syntax error, which the harness
  // correctly reported as *the mutant did not run: this is a crash, not a detection*.
  ['one META entry deleted',
    (t) => t.replace(/  \['B3`s comparison disabled',[\s\S]*?\],\n/, '')],
  ['META emptied, and MIN_META lowered with it',
    (t) => t.replace(/const MIN_META = \d+;/, 'const MIN_META = 0;')
      .replace(/const META = \[[\s\S]*?\n\];/, 'const META = [];')],
  // **The seven below INTRODUCE the defect a guard exists to catch, rather than
  // removing the guard — and getting that backwards is the finding.** The first cut
  // deleted each grader clause (`setsEqual` downgraded to a count, the reason check
  // forced true, the control allowed to trip, the inertness run skipped) and **all seven
  // came back *exited 0: the mutation costs nothing* — correctly.** A weakened grader on
  // a tree where every probe passes has nothing to be wrong about: there is no case for
  // it to mis-grade, so removing it costs exactly nothing and the entry measures the
  // absence of a case rather than the presence of a guard.
  //
  // So each entry below plants the case instead. With the guard present the child is
  // RED; the day someone removes the guard, the planted case stops being caught, the
  // child goes GREEN, and this entry reports *the mutation costs nothing* — which is
  // the signal, pointed at the guard rather than at the grader that reads it. It is
  // W31's compound device with the polarity the other direction: *what a SELF list buys
  // nothing against is a weakening whose case does not exist*, and the counter-measure
  // is to supply the case.
  ['a probe DECLARING the wrong id with the right count — what setsEqual catches',
    (t) => t.replace("    check: 'B2', sizes: { 'CLAUDE.md': 586_001, 'doc/workflow.md': 100, 'doc/concept.md': 100 },",
      "    check: 'B1', sizes: { 'CLAUDE.md': 586_001, 'doc/workflow.md': 100, 'doc/concept.md': 100 },")],
  ['a probe whose staging changes NOTHING — what rule 7 (b) catches',
    (t) => t.replace("    check: 'B3', sizes: { 'CLAUDE.md': 586_000, 'doc/workflow.md': 310_000, 'doc/concept.md': 20_000 },",
      "    check: 'B3', sizes: { 'CLAUDE.md': 'real', 'doc/workflow.md': 'real', 'doc/concept.md': 'real' },")],
  ['a META mutation that is NOT INERT on the untouched tree — what MAX_CORPUS catches',
    (t) => t.replace("    (t) => t.replace(/if \\(n > m\\.ceiling\\) \\{/, 'if (false) {')],",
      "    (t) => t.replace(/if \\(n > m\\.ceiling\\) \\{/, 'if (true) {')],")],
  ['the CONTROL probe made to trip something — what the control`s own verdict catches',
    (t) => t.replace("    check: null, sizes: 'real',",
      "    check: null, sizes: { 'CLAUDE.md': 586_001, 'doc/workflow.md': 100, 'doc/concept.md': 100 },")],
  ['a GRADER control declaring the wrong expected verdict — what grading the grader catches',
    (t) => t.replace("    expect: 'crash', check: 'B2', sizes: 'real',", "    expect: 'caught', check: 'B2', sizes: 'real',")],
  ['a probe naming a reason the check never prints — what the reason check catches',
    (t) => t.replace("    says: 'doc/concept.md is 20001 bytes and its ceiling is 20000',",
      "    says: 'doc/concept.md is 1 byte and its ceiling is 2',")],
  ['a SET member this file does not expect — what the SOURCE membership bound catches',
    (t) => t.replace("const SET_PATHS = ['CLAUDE.md', 'doc/workflow.md', 'doc/concept.md'];",
      "const SET_PATHS = ['CLAUDE.md', 'doc/workflow.md', 'README.md'];")],
  // **Anchored on the declaration's FIRST ENTRY, because the obvious anchor matched
  // THIS ENTRY ITSELF.** A pattern for `const SOURCE = [` … `\n];` found its own
  // replacement string — and this being the last entry in the list, the array's own
  // closing bracket sits immediately after it — so the mutation deleted 25 bytes of its
  // own declaration and the child died of a syntax error, which the harness reported as
  // *the mutant did not run: this is a crash, not a detection*. **A probe whose
  // replacement text is also its anchor mutates itself**, which is `check-markdown`'s
  // *a comment that quotes the code it explains makes that code unmutatable by a
  // literal-anchored probe* one step worse: here the quotation was the repair, not the
  // explanation.
  ['the SOURCE bounds emptied — the clauses no staged tree can reach',
    (t) => t.replace(/const SOURCE = \[\n {2}\['the MIN_MEMBERS[\s\S]*?\n\];/, 'const SOURCE = [\n];')],
  ['the coverage bound`s id set re-sourced to this file, so the CHECK stops being its authority',
    (t) => t.replace(".matchAll(/\\bfail\\('(B\\d)'/g)].map((m) => m[1]))].sort();",
      ".matchAll(/\\bfail\\('(B\\d)'/g)].map((m) => m[1]))].sort().slice(0, 0);")],
];

// ==============================================================================
// SOURCE — the clauses no staged tree and no mutation can reach
// ==============================================================================
//
// **A ceiling's vacuity is not *too little to check* but *nothing to measure*, and two
// of `check-budget.mjs`'s guards are about its own TEXT rather than about any tree.**
// `MIN_MEMBERS` cannot be fired by a probe (emptying `SET` makes the check non-inert on
// the untouched tree, which grades `corpus` and is a pass — [Q150](../doc/open-questions.md)),
// and *the ceilings are LITERALS* cannot be fired at all: a ceiling derived from the
// measurement it bounds would pass on every tree for ever, and that is the one way this
// check can be made worthless without a clause going red.
//
// This is the device [ADR 0073](../doc/decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md)
// consequence 10 names as the cheap road — *a source-text bound of the kind this
// self-test already runs on `X4_WIDTH`* — and it is bounded by `SELF`'s last entry.
const SOURCE = [
  ['the MIN_MEMBERS floor is present and is at least 3',
    (src) => {
      const m = /^const MIN_MEMBERS = (\d+);$/m.exec(src);
      if (!m) return 'MIN_MEMBERS is not declared where this reads it';
      if (Number(m[1]) < 3) return `MIN_MEMBERS is ${m[1]} and P27 decision 1 decides a set of three`;
      return null;
    }],
  ['the floor is READ as well as declared',
    (src) => /if \(SET\.length < MIN_MEMBERS\)/.test(src)
      ? null : 'nothing compares SET.length against MIN_MEMBERS'],
  // **This clause matched NOTHING and reported itself satisfied — W112's adequacy reader, and it is
  // the worst defect in the item.** Two independent faults in one expression:
  //
  //   1. `[^,]+` CANNOT SPAN A COMMA, and the derivation worth refusing has one. With the three
  //      ceilings rewritten as `statSync(join(ROOT, 'CLAUDE.md')).size + 16_302`, the pattern
  //      matched **0 of 3** and the reader measured `check:budget` EXIT 0, `check:budget:selftest`
  //      EXIT 0 and **`source: 5/5 bound(s) held`** — every ceiling now tracking the file it bounds,
  //      so `B2` and `B3` can never fire however much `CLAUDE.md` grows, which is the check's entire
  //      purpose. ADR 0076 decision 5 calls this clause the ONLY guard against that.
  //   2. **A ZERO-MATCH read as *no bad entries*.** The loop collected offenders and never asked
  //      whether it had found its subject, so any spelling the pattern misses passes — a
  //      continuation line (`ceiling:` then the expression on the next line) is a comma-free bypass
  //      of the same kind.
  //
  // So: a pattern that spans to the end of the LINE, and **the count of ceilings found is asserted
  // against `SET`'s own membership**. That second half is the general lesson and it is W30's: *a
  // bound whose authority is the checked artefact rather than a declaration stops the regress where
  // it is* — and a grep that cannot say it found the artefact has no authority at all. Measured
  // after: the reader's exact edit costs 1 and names the derivation.
  ['every ceiling is an integer LITERAL, never derived from the measurement it bounds',
    (src) => {
      const bad = [];
      // `[^\n]+` rather than `[^,]+`: a derived ceiling carries a comma inside its own call.
      const found = [...src.matchAll(/^\s*ceiling: ([^\n]+?),?$/gm)];
      const members = [...src.matchAll(/^\s*path: '/gm)].length;
      if (found.length !== members) {
        return `this clause found ${found.length} ceiling(s) and SET declares ${members} member(s) — ` +
          'a grep that cannot find its subject reports no offenders for the same reason an empty ' +
          'check passes, which is how a derived ceiling got past it';
      }
      for (const m of found) {
        const v = m[1].trim().replace(/,$/, '');
        if (!/^[\d_]+$/.test(v)) bad.push(v);
      }
      const tc = /^const TOTAL_CEILING = ([^;]+);$/m.exec(src);
      if (!tc) bad.push('TOTAL_CEILING is not declared where this reads it');
      else if (!/^[\d_]+$/.test(tc[1].trim())) bad.push(`TOTAL_CEILING = ${tc[1].trim()}`);
      if (!bad.length) return null;
      return `derived rather than declared: ${bad.join(', ')} — a ceiling computed from the ` +
        'size it bounds passes on every tree for ever';
    }],
  ['the set declares as many members as MIN_MEMBERS requires',
    (src) => {
      const n = [...src.matchAll(/^\s*path: '/gm)].length;
      return n >= 3 ? null : `SET declares ${n} member(s)`;
    }],
  // **The one mitigation ADR 0076 decision 5 names, and it was deletable for zero** — W112's
  // adequacy reader. That decision says a ceiling going stale toward weakness is visible only
  // because *"the distance to target is PRINTED on every run"*, and `Outputs` (1) promises the
  // per-file figures and that distance. Nothing read any of the report but its `FAIL` rows, so the
  // whole of it could go in silence. This is the cheapest possible observer and it is the right
  // one: a printed line's only property is that it is printed.
  // **The digest must READ THE BYTES, and adequacy 13 is why this clause exists in this list.**
  // The digest hashed path and size until that reader said so; made a content digest, dropping the
  // content read AGAIN costs zero, because a digest's own sensitivity cannot be observed from
  // inside the run that takes it — the tree does not move, so neither version reports anything.
  // *The only thing that can bind it is its own text*, which is the device the ceilings clause uses
  // and which ADR 0073 consequence 10 names. This clause reads THIS file rather than
  // `check-budget.mjs`, which is the one entry in `SOURCE` whose subject is the harness.
  ['the content digest reads the bytes, not the stat',
    (_src) => {
      const self = readFileSync(SELF_PATH, 'utf8');
      const walk = /const digest = \(\) => \{[\s\S]*?\n  \};/.exec(self);
      if (!walk) return 'the digest walk is not where this reads it';
      if (!/h\.update\(readFileSync\(p\)\)/.test(walk[0])) {
        return 'the digest does not hash file CONTENT — path and size alone cannot see a ' +
          'same-size edit anywhere in the tree, and `THE TREE MOVED` then has no case';
      }
      return null;
    }],
  ['the report prints the per-file figures and the distance to target',
    (src) => {
      const bad = [];
      if (!/over target by/.test(src)) bad.push('the per-file table has no `over target by` column');
      if (!/the ceiling is \$\{kib\(TOTAL_CEILING - TOTAL_TARGET\)\} KiB above the target/.test(src)) {
        bad.push('the `note:` line stating the distance to target is not where this reads it');
      }
      if (!/measured\s+ceiling\s+target/.test(src.replace(/ +/g, ' '))) {
        bad.push('the table header naming measured, ceiling and target is gone');
      }
      return bad.length ? bad.join('; ') : null;
    }],
  ['every declared member is one of the always-read set`s paths',
    (src) => {
      const paths = [...src.matchAll(/^\s*path: '([^']+)',$/gm)].map((m) => m[1]);
      const extra = paths.filter((p) => !SET_PATHS.includes(p));
      const missing = SET_PATHS.filter((p) => !paths.includes(p));
      if (!extra.length && !missing.length) return null;
      return `the set and this file disagree — extra ${extra.join(', ') || 'none'}, ` +
        `missing ${missing.join(', ') || 'none'}`;
    }],
];

// ==============================================================================
// the harness
// ==============================================================================

const RAN = (out) => /^budget check — /m.test(out);
// **No trailing space, and the reason is a defect this file's first run reported as
// three crashes.** `selfTest` prints its banner from four places, and the early-exit
// paths print `check-budget self-test —` with nothing after it. A pattern requiring the
// space read those as *the mutant did not run* — a CRASH verdict on three mutations
// that were detected correctly, which is exactly the misreading v0.24's grader clause
// exists for, arriving in the grader rather than in a probe.
const SELF_RAN = (out) => /check-budget self-test —/.test(out);
const setsEqual = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const idsIn = (out) => [...new Set(
  out.split('\n').filter((l) => /^\s{2}FAIL/.test(l))
    .flatMap((l) => [...l.matchAll(/\bB\d\b/g)].map((m) => m[0])),
)].sort();
// A reason is matched on its clause's own failure LINE, never on the whole output —
// v0.24. The failure block prints `  B2: <message>`, so that is what is read.
const mentions = (out, says) => out.split('\n')
  .some((l) => /^\s{2}B\d: /.test(l) && l.includes(says));

/** Stage the always-read set at the sizes a probe names. `null` returns no staging. */
function stageTree(root, dir, sizes) {
  const tree = join(dir, 'tree');
  rmSync(tree, { recursive: true, force: true });
  mkdirSync(join(tree, 'doc'), { recursive: true });
  let changed = false;
  for (const p of SET_PATHS) {
    const want = sizes === 'real' ? 'real' : sizes[p];
    const realBytes = statSync(join(root, p)).size;
    if (want === null || want === undefined) { changed = true; continue; }
    if (want === 'dir') { mkdirSync(join(tree, p), { recursive: true }); changed = true; continue; }
    const n = want === 'real' ? realBytes : want;
    if (n !== realBytes) changed = true;
    // The content is irrelevant to the SIZE — `check-budget` reads `statSync().size` — so this is
    // padding rather than a copy, which keeps the staging cheap and makes the size the only thing a
    // probe controls.
    //
    // **But it is NOT ASCII, and W112's adequacy reader is why.** With every staged file filled
    // with `.`, bytes and characters are equal BY CONSTRUCTION, so
    // `sizes.set(m.path, readFileSync(abs, 'utf8').length)` — measuring CHARACTERS instead of bytes
    // — cost **ZERO**: `check:budget` EXIT 0 reporting 886,367 against the true 891,288, which is
    // 4,921 bytes of leniency, with every probe, META, SELF and SOURCE bound green. The line it
    // replaces carries its own reason — *the bytes on disk are what a session pays for, not the
    // characters after decoding* — and nothing could tell the two apart.
    //
    // So every staging carries a known multi-byte prefix: sixteen `é` (two bytes each) and ASCII
    // padding to exactly `n`. The file is `n` bytes and `n - 16` characters, so the substitution now
    // reports a size no ceiling arithmetic agrees with. *A fixture made of one character class
    // cannot discriminate a measure that is about character classes.*
    const MB = Buffer.from('é'.repeat(16), 'utf8');   // 32 bytes, 16 characters
    writeFileSync(join(tree, p), n >= MB.length
      ? Buffer.concat([MB, Buffer.alloc(n - MB.length, 0x2e)])
      : Buffer.alloc(n, 0x2e));
  }
  // **Rule 7 (b): a probe asserts it changed its input.** A `sizes` map that happens to
  // name every real size stages a tree identical to the one it is a probe against, and
  // reads as a pass — the vacuous direction, which is the dangerous one.
  if (sizes !== 'real' && !changed) return null;
  return tree;
}

/** Run `check-budget.mjs` (or a mutated copy) against a staged tree. */
function runCheck(root, script, tree) {
  const env = { ...process.env };
  if (tree) env.CHECK_BUDGET_ROOT = relative(root, tree).replace(/\\/g, '/');
  delete env.CHECK_BUDGET_SELFTEST;
  const r = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', env, timeout: 300_000 });
  return { out: `${r.stdout ?? ''}${r.stderr ?? ''}`, status: r.status };
}

/**
 * Grade one probe. The outcomes are an ENUMERATION rather than a boolean, because the
 * exit code cannot tell a detection from a crash, from noise, or from a sibling
 * covering for the clause — section 4's two directions and
 * [Q138](../doc/open-questions.md).
 */
function verdict(probe, r, staged) {
  if (staged === null) { return { outcome: "abort", why: " — the staging changed nothing" }; }
  const out = r.out;
  const wanted = probe.check === null ? [] : [probe.check, ...(probe.also ?? [])].sort();
  const got = idsIn(out);
  if (probe.check === null) return { outcome: wanted.length === 0 && got.length === 0 ? 'clean' : 'control-tripped', got, out };
  // **CRASH is tested BEFORE `did-not-run`, and the grader control is what said so.** A
  // check that throws before its banner satisfies both descriptions, and the first cut
  // tested `did-not-run` first — so the control whose right verdict is CRASH was graded
  // `did-not-run` and the discriminator section 4 names (*non-zero exit with ZERO named
  // failures*) never ran. A crash that happens EARLY is still a crash.
  if (r.status !== 0 && got.length === 0) return { outcome: 'crash', got, out };
  if (!RAN(out)) return { outcome: 'did-not-run', got, out };
  if (!setsEqual(got, wanted)) return { outcome: 'against-declaration', got, out };
  const reasonHeld = probe.says === undefined || mentions(out, probe.says);
  if (!reasonHeld) return { outcome: 'wrong-reason', got, out };
  // **And the check must have EXITED non-zero, which the first cut did not test** —
  // section 4's two directions, and the META entry for the exit path is what found it.
  // Grading on the FAIL lines alone is right for telling a detection from a crash and
  // is NOT sufficient for *refused*: with `process.exit(1)` removed the lines still
  // print, every id still matches, and a check that reports a breach and exits 0 is one
  // `npm run gate` walks straight past. That entry read STILL CAUGHT until this clause
  // existed.
  if (r.status === 0) return { outcome: 'exit-zero', got, out };
  return { outcome: 'caught', got, out };
}

export async function selfTest(root) {
  if (NODE_MAJOR < MIN_NODE_MAJOR) {
    console.log(`check-budget self-test — ABORT: node ${process.versions.node}, and the rungs ` +
      `here need >= ${MIN_NODE_MAJOR}. A rung that cannot start is indistinguishable in this ` +
      'report from a rung a probe took down.');
    return 3;
  }

  // Per PROCESS and removed on the way out including on the abort path — ADR 0072, and
  // `process.on('exit')` rather than a `finally` because this function returns from
  // many places and the one road none of their removals covers is a THROW.
  const dir = mkdtempSync(join(root, 'dev-dist', `budget-selftest-${process.pid}-`));
  process.on('exit', () => rmSync(dir, { recursive: true, force: true }));

  /**
   * **A mutated copy of the check must sit EXACTLY ONE level below the root, and this
   * file's first run is what measured why.** `check-budget.mjs` computes its own `ROOT`
   * as `dirname(import.meta.url)/..`, so a mutant written into the per-process scratch
   * directory resolved `ROOT` to `dev-dist/` — it then looked for `dev-dist/CLAUDE.md`,
   * `B1` fired on every one of them, and the report read **three probes
   * against-declaration and nine META mutants graded `corpus`**. Nine of eleven clauses
   * ungraded, and not one of the nine said anything about the clause it was testing.
   *
   * *That is why every other self-test here writes its mutants FLAT into `dev-dist/`* —
   * a convention three files follow and none explains. The pid is in the FILENAME,
   * which is what `G6` requires of a statement naming that directory
   * ([ADR 0072](../doc/decisions/0072-a-scratch-path-carries-its-process-and-a-self-test-that-shares-the-tree-says-so.md)),
   * and each is removed on the way out.
   *
   * **AND THE NAME CARRIES A LEADING DOT, which is the OTHER half of that convention and the one
   * `npm run gate:full` had to find.** Flat and undotted, these mutants killed
   * `check:wiring:selftest`: that lane runs `1 of 8` concurrently with this one and points
   * `CHECK_WIRING_SCRIPTS` at `dev-dist`, where `G6` scans **every** `.mjs` — so a copy of THIS FILE
   * named `budget-<pid>-self.mjs` is not covered by the `G6` exception declared for
   * `check-budget-selftest.mjs`, because that list is keyed on the FILENAME. Measured: the copy
   * draws **15** `G6` failures, every probe in that lane read `got [G1,G2,G6]` against its declared
   * `[G1,G2]`, and the lane's own control passed — the signature of a RACE rather than a defect,
   * since the same lane run alone was EXIT 0. **W108's incident, reproduced by this item's own
   * residue** ([Q182](../doc/open-questions.md)), and found independently by W112's adequacy reader.
   *
   * `G6`'s scan filters `!n.startsWith('.')` and the comment above it says why: *a leading dot is
   * this repository's own convention for a mutant (`.meta-*`, `.self-*`, `.probe-*`) and no file in
   * `scripts/` carries one.* So a dot keeps the one-level-below-root `ROOT` resolution AND takes
   * these out of `G6`'s universe and `G3`'s. *The convention had two halves and only one of them was
   * written down anywhere.*
   */
  const mutants = new Set();
  process.on('exit', () => { for (const p of mutants) rmSync(p, { force: true }); });
  const mutantPath = (tag) => {
    const p = join(root, 'dev-dist', `.budget-${process.pid}-${tag}.mjs`);
    mutants.add(p);
    return p;
  };

  const script = process.env.CHECK_BUDGET_SCRIPT ?? join(root, 'scripts', 'check-budget.mjs');
  const meta = !process.env.CHECK_BUDGET_SCRIPT;
  // A `SELF` child runs a mutated copy of THIS file against the real check, so it must
  // run `META` — a guard whose only effect is inside `META` is invisible to a child
  // that skips it — and it must NOT run `SELF`, or the recursion has no floor.
  const nestedSelf = !!process.env.CHECK_BUDGET_SELFTEST;
  const realSrc = readFileSync(join(root, 'scripts', 'check-budget.mjs'), 'utf8');

  /**
   * **A CONTENT digest over every tracked and untracked-unignored file — v0.17, and it hashed only
   * the path and the SIZE until W112's adequacy reader said so.** Dropping `h.update(String(st.size))`
   * cost zero and left a sorted path list; as shipped it could not see any same-size edit anywhere in
   * the tree, while its own docstring called it a content digest. **`THE TREE MOVED` had no case and
   * no control**, which is the defect v0.17 added this requirement to prevent, in the only digest in
   * `scripts/` (grep: one hit).
   *
   * It reads the bytes now. Measured cost: the whole walk is well under a second against a lane that
   * runs for ~25 s, so the honest reading is that the cheap version was never cheaper for a reason.
   */
  const digest = () => {
    const h = createHash('sha256');
    const walk = (d) => {
      for (const name of readdirSync(d).sort()) {
        if (name === 'node_modules' || name === '.git' || name === 'dev-dist' || name === 'dist') continue;
        const p = join(d, name);
        const st = statSync(p);
        if (st.isDirectory()) walk(p);
        else {
          h.update(relative(root, p).replace(/\\/g, '/'));
          h.update(readFileSync(p));
        }
      }
    };
    walk(root);
    return h.digest('hex').slice(0, 16);
  };
  const before = digest();

  // **`MAX_CORPUS` is asserted rather than merely declared**, because W112's adequacy reader
  // measured that `0 -> 99` compounded with a free `SELF` slot at EXIT 0, taking the inertness run's
  // only case with it. A literal the file reads and never checks is the shape this whole pass is
  // about.
  if (MAX_CORPUS !== 0) {
    console.log('check-budget self-test —');
    console.log(`  FAIL  MAX_CORPUS is ${MAX_CORPUS} and must be 0: a corpus grading says the ` +
      'mutant is noticed and says nothing about the probe the entry names.');
    return 1;
  }
  if (GRADER_CONTROLS.length < MIN_GRADER) {
    console.log('check-budget self-test —');
    console.log(`  FAIL  ${GRADER_CONTROLS.length} grader control(s), floor ${MIN_GRADER}.`);
    return 1;
  }
  {
    const have = [...new Set(GRADER_CONTROLS.map((g) => g.expect))].sort();
    const missing = GRADED_VERDICTS.filter((v) => !have.includes(v));
    const extra = have.filter((v) => !GRADED_VERDICTS.includes(v));
    if (missing.length || extra.length) {
      console.log('check-budget self-test —');
      console.log(`  FAIL  the grader controls must cover [${GRADED_VERDICTS.join(', ')}] and cover ` +
        `[${have.join(', ')}] — missing [${missing.join(', ') || 'none'}], unexpected ` +
        `[${extra.join(', ') || 'none'}]. A count is not a membership.`);
      return 1;
    }
  }
  if (PROBES.length < MIN_PROBES || META.length < MIN_META || SELF.length < MIN_SELF
      || SOURCE.length < MIN_SOURCE) {
    console.log(`check-budget self-test — ${PROBES.length} probes (floor ${MIN_PROBES}), ` +
      `${META.length} meta (floor ${MIN_META}), ${SELF.length} self (floor ${MIN_SELF}), ` +
      `${SOURCE.length} source (floor ${MIN_SOURCE}).`);
    console.log('  FAIL  a list is short, and `caught === length` is vacuous at zero.');
    return 1;
  }
  // **`META` is bounded by CONTENT as well as by count** — W29 found that a duplicate
  // entry satisfies a floor while leaving a clause ungraded, and that an anchor made
  // global disables every site of one id while naming one.
  {
    const names = META.map((m) => m[0]);
    if (new Set(names).size !== names.length) {
      console.log('check-budget self-test —');
      console.log('  FAIL  two META entries share a name, so the floor is satisfied by a duplicate.');
      return 1;
    }
    const probed = new Set(META.map((m) => m[1]));
    for (const p of probed) {
      if (!PROBES.some((x) => x.name === p)) {
        console.log('check-budget self-test —');
        console.log(`  FAIL  a META entry names probe "${p}", which does not exist.`);
        return 1;
      }
    }
  }
  {
    const names = PROBES.map((p) => p.name);
    if (new Set(names).size !== names.length) {
      console.log('check-budget self-test —');
      console.log('  FAIL  two PROBES share a name, so the floor is satisfied by a duplicate.');
      return 1;
    }
  }
  // **COVERAGE, derived from the CHECK rather than from a list here — and a floor could
  // not do this job.** `MIN_PROBES` and `MIN_META` are literals in this file, so the
  // compound *lower the floor and empty the list* defeats both: measured, `META = []`
  // with `MIN_META = 0` left this suite at **exit 0**, every clause of `check-budget`
  // ungraded and nothing saying so. That is W30's finding — *a bound whose authority is
  // the checked artefact rather than a declaration stops the regress where it is* —
  // and the artefact here is the check's own `fail('BN'` sites.
  {
    const ids = [...new Set([...readFileSync(join(root, 'scripts', 'check-budget.mjs'), 'utf8')
      .matchAll(/\bfail\('(B\d)'/g)].map((m) => m[1]))].sort();
    const probed = new Set(PROBES.flatMap((p) => [p.check, ...(p.also ?? [])]).filter(Boolean));
    const metaed = new Set(META.map((m) => {
      const probe = PROBES.find((x) => x.name === m[1]);
      return probe ? probe.check : null;
    }).filter(Boolean));
    const bad = [];
    for (const id of ids) {
      if (!probed.has(id)) bad.push(`${id} has no probe`);
      if (!metaed.has(id)) bad.push(`${id} has no META entry naming a probe of it`);
    }
    if (!ids.length) bad.push('check-budget.mjs reports no check id where this reads them');
    if (bad.length) {
      console.log(`check-budget self-test — ${ids.length} id(s) in the check: ${ids.join(', ')}`);
      console.log(`  FAIL  ${bad.join('; ')}.`);
      return 1;
    }
  }

  // **Single-probe mode: the META pass names ONE probe and this runs that one**, which
  // is what makes a grading name the probe it breaks rather than crediting whichever
  // probe reacted first — W28, and both halves of Q138.
  const only = process.env.CHECK_BUDGET_PROBE;
  if (only !== undefined) {
    const probe = [...PROBES, ...GRADER_CONTROLS].find((p) => p.name === only);
    if (!probe) { console.log(`  ABORT  no probe is named "${only}"`); return 3; }
    const src = probe.declare ? probe.declare(realSrc) : realSrc;
    if (probe.declare && src === realSrc) { console.log('  ABORT  the declaration mutation matched nothing'); return 3; }
    let useScript = script;
    if (probe.declare) {
      useScript = mutantPath('only-declared');
      writeFileSync(useScript, src);
    }
    const staged = stageTree(root, dir, probe.sizes);
    const r = staged === null ? { out: '', status: 0 } : runCheck(root, useScript, staged);
    const v = verdict(probe, r, staged);
    console.log(`  ran: ${RAN(v.out ?? '') ? 'yes' : 'no'}`);
    console.log(`  outcome: ${v.outcome}`);
    const ok = v.outcome === 'caught' || v.outcome === 'clean';
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${probe.check ?? '--'}  ${probe.name}${v.why ?? ''}`);
    return ok ? 0 : 1;
  }

  console.log(`check-budget self-test — ${PROBES.length} probes, ${META.length} meta, ` +
    `${SELF.length} self, ${SOURCE.length} source, ${GRADER_CONTROLS.length} grader control(s)\n`);

  const failures = [];
  // **A declared ceiling is reported BY ID, so whatever re-runs the set reads that LIST
  // and never the COUNT** — v0.26, P26's retro, after W108's harness named ELEVEN
  // ceilings while its tally said ten. This set declares NONE, and the empty list is
  // printed rather than omitted so the absence is a statement.
  const ceilings = [];

  // --- pass 1: the probes -------------------------------------------------------
  let caught = 0, cleanControls = 0, probeIndex = -1;
  for (const probe of PROBES) {
    probeIndex++;
    const src = probe.declare ? probe.declare(realSrc) : realSrc;
    if (probe.declare && src === realSrc) {
      failures.push(`${probe.name} — ABORT: the declaration mutation matched nothing (rule 7 (b))`);
      continue;
    }
    let useScript = script;
    if (probe.declare) {
      useScript = mutantPath(`declared-${probeIndex}`);
      writeFileSync(useScript, src);
    }
    const staged = stageTree(root, dir, probe.sizes);
    const r = staged === null ? { out: '', status: 0 } : runCheck(root, useScript, staged);
    // **Removed INLINE, not at exit** — the exit handler is a backstop and the window that matters
    // is the one while a concurrent `check:wiring:selftest` has `G6` pointed at this directory.
    if (useScript !== script) rmSync(useScript, { force: true });
    const v = verdict(probe, r, staged);
    if (v.outcome === 'caught') caught++;
    else if (v.outcome === 'clean') cleanControls++;
    else {
      failures.push(`${probe.name} — ${v.outcome}` +
        (v.got ? `, wanted [${[probe.check, ...(probe.also ?? [])].filter(Boolean).sort()}], got [${v.got}]` : '') +
        (v.why ?? ''));
    }
  }
  const firing = PROBES.filter((p) => p.check !== null).length;
  const controls = PROBES.length - firing;
  console.log(`  probes: ${caught}/${firing} caught, ${cleanControls}/${controls} control(s) clean, ` +
    `${ceilings.length} declared ceiling(s)${ceilings.length ? `: ${ceilings.join(', ')}` : ' (none)'}`);

  // --- the grader's own controls ------------------------------------------------
  let graderOk = 0;
  for (const g of GRADER_CONTROLS) {
    const src = g.declare ? g.declare(realSrc) : realSrc;
    if (g.declare && src === realSrc) {
      failures.push(`${g.name} — ABORT: the declaration mutation matched nothing`);
      continue;
    }
    let useScript = script;
    if (g.declare) { useScript = mutantPath('grader'); writeFileSync(useScript, src); }
    const staged = stageTree(root, dir, g.sizes);
    const r = staged === null ? { out: '', status: 0 } : runCheck(root, useScript, staged);
    if (useScript !== script) rmSync(useScript, { force: true });
    const v = verdict(g, r, staged);
    if (v.outcome === g.expect) graderOk++;
    else failures.push(`${g.name} — the grader said ${v.outcome} where the right verdict is ${g.expect}`);
  }
  console.log(`  grader: ${graderOk}/${GRADER_CONTROLS.length} control(s) graded as declared`);

  // --- the source bounds --------------------------------------------------------
  let sourceOk = 0;
  for (const [name, read] of SOURCE) {
    const why = read(realSrc);
    if (why === null) sourceOk++;
    else failures.push(`SOURCE ${name} — ${why}`);
  }
  console.log(`  source: ${sourceOk}/${SOURCE.length} bound(s) held`);

  // --- pass 2: META -------------------------------------------------------------
  let noticed = 0, byCorpus = 0;
  if (meta) {
    for (const [what, probeName, mutate] of META) {
      const mutated = mutate(realSrc);
      if (mutated === realSrc) {
        failures.push(`META ${what} — ABORT: the mutation matched nothing (rule 7 (b))`);
        continue;
      }
      const mutant = mutantPath('meta');
      writeFileSync(mutant, mutated);
      // **Is the mutated check INERT on the untouched tree?** A mutant that fails
      // there is noticed — by the corpus, more strongly than by any probe — but its
      // probe verdict is noise.
      const cleanRun = runCheck(root, mutant, null);
      const inert = cleanRun.status === 0;
      if (!inert) { byCorpus++; continue; }
      const probe = PROBES.find((p) => p.name === probeName);
      const src = probe.declare ? probe.declare(mutated) : mutated;
      let useScript = mutant;
      if (probe.declare) { useScript = mutantPath('meta-declared'); writeFileSync(useScript, src); }
      const staged = stageTree(root, dir, probe.sizes);
      const r = staged === null ? { out: '', status: 0 } : runCheck(root, useScript, staged);
      if (useScript !== mutant) rmSync(useScript, { force: true });
      const v = verdict(probe, r, staged);
      if (v.outcome === 'caught') {
        // **The failure COUNT discriminates CO-FIRING from MASKING** — W29. Same id and
        // same count is masking and is undetectable by set equality; same id and a
        // lower count is co-firing and the clause IS detected.
        failures.push(`META ${what} — STILL CAUGHT by "${probeName}", so the clause is not what caught it`);
      } else noticed++;
      rmSync(mutant, { force: true });
    }
    if (byCorpus > MAX_CORPUS) {
      failures.push(`META: ${byCorpus} mutant(s) were not inert and MAX_CORPUS is ${MAX_CORPUS} — ` +
        'a corpus grading says the mutant is noticed and says nothing about the probe');
    }
    console.log(`  meta: ${noticed}/${META.length} noticed by the named probe, ${byCorpus} by the corpus`);
  } else {
    console.log('  meta: skipped — this run is already a META child');
  }

  // --- pass 3: SELF -------------------------------------------------------------
  let bounded = 0;
  if (meta && !nestedSelf) {
    const selfSrc = readFileSync(join(root, 'scripts', 'check-budget-selftest.mjs'), 'utf8');
    for (const [what, mutate] of SELF) {
      const mutated = mutate(selfSrc);
      if (mutated === selfSrc) {
        failures.push(`SELF ${what} — ABORT: the mutation matched nothing (rule 7 (b))`);
        continue;
      }
      const mutant = mutantPath('self');
      writeFileSync(mutant, mutated);
      const env = { ...process.env, CHECK_BUDGET_SELFTEST: relative(root, mutant).replace(/\\/g, '/') };
      const r = spawnSync(process.execPath, [join(root, 'scripts', 'check-budget.mjs'), '--self-test'],
        { cwd: root, encoding: 'utf8', env, timeout: 600_000 });
      const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
      if (!SELF_RAN(out)) {
        failures.push(`SELF ${what} — the mutant did not run: this is a crash, not a detection`);
      } else if (r.status === 0) {
        failures.push(`SELF ${what} — exited 0: the mutation costs nothing`);
      } else bounded++;
      rmSync(mutant, { force: true });
    }
    console.log(`  self: ${bounded}/${SELF.length} bounded`);
  } else {
    console.log('  self: skipped — a SELF child does not run SELF');
  }

  // **The scratch cleanup had no observer, and the digest CANNOT be it** — W112's adequacy reader.
  // Both `process.on('exit')` handlers were deletable for zero, with `digest … (unmoved)` printed
  // beside the leak, because the digest walk skips `dev-dist` by design. Measured from a cleared
  // directory: one run without them leaves **15 directories (~8.7 MB) and 40 mutant `.mjs`
  // modules** — which is ADR 0072's *removed on the way out including on the abort path* with
  // nothing watching, i.e. [Q426](../doc/open-questions.md)'s defect re-introducible for free. And
  // it compounds: those 40 modules are exactly the residue that kills `check:wiring:selftest`'s
  // control. So this run's OWN residue is named here, by the one name it can predict — its pid.
  {
    // The per-entry `rmSync` calls are what this can see; `dir` itself belongs to the exit handler
    // and is still alive here by construction, so it is named rather than counted as a leak.
    const live = [...mutants].filter((p) => existsSync(p));
    const flat = readdirSync(join(root, 'dev-dist'))
      .filter((n) => n.endsWith('.mjs') && n.includes(`${process.pid}`));
    if (live.length || flat.length) {
      failures.push(`SCRATCH: ${live.length} registered mutant(s) and ${flat.length} flat .mjs ` +
        `of this pid are still in dev-dist (${[...new Set([...live.map((p) => p.split(/[\\/]/).pop()), ...flat])].join(', ')}). ` +
        'Each is removed inline after its entry, and a leak here is what takes a concurrent ' +
        'check:wiring:selftest control down.');
    }
    console.log(`  scratch: ${live.length} registered + ${flat.length} flat mutant(s) left ` +
      `(must be 0); dir is the exit handler's`);
  }

  const after = digest();
  if (before !== after) {
    failures.push(`THE TREE MOVED: digest ${before} -> ${after}. This harness stages every ` +
      'mutant under dev-dist and must leave the repository untouched.');
  }
  console.log(`  digest: ${before} -> ${after}${before === after ? ' (unmoved)' : ' — MOVED'}`);

  if (failures.length) {
    console.log('\n' + failures.map((f) => `  FAIL  ${f}`).join('\n'));
    console.log(`\n${failures.length} failure(s).`);
    return 1;
  }
  console.log('\nAll self-test passes clean.');
  return 0;
}
