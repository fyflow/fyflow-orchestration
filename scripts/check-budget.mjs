#!/usr/bin/env node
// **The always-read set is a declared LIST, and every member is under its declared
// ceiling.** This script is the enforcement; without it the budget is a sentence in a
// plan, and a budget nobody enforces is how 601,000 tokens of required reading
// happened — [P27](../doc/plans/p27-what-a-register-row-is.md) stop-and-ask (c), which
// the maintainer answered YES.
//
//   node scripts/check-budget.mjs                node scripts/check-budget.mjs --self-test
//
// **What the always-read set IS, and why it is three files.** P27 decision 1: a document
// is in this set because something cannot be DONE without it, not because it is
// important. `README.md` is for a PERSON by
// [ADR 0073](../doc/decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md),
// so it was never the agent's required reading; `doc/open-questions.md` cannot fit under
// any honest budget — 418 rows at one line each is the whole of it — so it becomes a
// REFERENCE, read like `spec/` when the row you need is in it. `AGENTS.md` is a tested
// artifact rather than prose. What is left is three files.
//
// **CEILING and TARGET are two numbers and the difference between them is the point.**
// The ceiling is where the set is TODAY and it only ever moves DOWN; the target is P27
// decision 1's budget. [W112](../doc/work-items/w112-the-budget-the-check-and-the-floors.md)
// cuts nothing, so a check that enforced the target would be red by 11x on correct work —
// which is why stop-and-ask (c)'s own answer says what this does: it *"refuses a commit
// that grows the required reading"*. Each cut item lowers the ceiling to its own
// post-cut measurement and W115 lands it on the target.
//
// **A ceiling goes stale toward WEAKNESS if nobody lowers it**, which is the opposite
// direction from [Q102](../doc/open-questions.md)'s floors and is why the DISTANCE to
// target is printed on every run rather than being recoverable from a plan document. A
// number nobody sees drift is a number that drifts.
//
// It reports; it does not fix. Exits 0 when every check passes, 1 otherwise.
//
// `CHECK_BUDGET_ROOT` points the measurement at a copy of the tree, which is how
// `--self-test` breaks each clause without touching the real one.

import { readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MEASURE_ROOT = process.env.CHECK_BUDGET_ROOT
  ? resolve(ROOT, process.env.CHECK_BUDGET_ROOT)
  : ROOT;

const failures = [];
const fail = (check, msg) => failures.push(`${check}: ${msg}`);

/**
 * **The always-read set, with each member's ceiling and target in BYTES.**
 *
 * Bytes rather than KB, and the reason is a defect this item inherited: P27's own
 * decision-1 table reads *876 KB* for a set measuring **891,288 bytes**, because it
 * added a KiB figure for `CLAUDE.md` to a KB figure for `doc/workflow.md`. A budget
 * stated in a unit nobody fixed is two budgets. The report prints KiB for a reader and
 * compares bytes.
 *
 * **Each member has its own ceiling AND the set has a total, and the total is STRICTLY
 * BELOW their sum.** That is not tidiness: the first cut of this check set the total to
 * the sum exactly, which made `B3` unreachable — a total breach then implied a per-file
 * breach, so `B3` could never fire alone and was a clause with no instance of its own
 * (rule 8 obligation (a): a clause the set cannot provoke is a clause nobody has
 * tested). Below the sum, each member may breathe within its own ceiling while the SET
 * may not grow past one allowance, and both clauses have cases.
 *
 * **The allowance is for the record step.** `CLAUDE.md` is a record-step file
 * (`doc/workflow.md` section 1 rule 5), so finishing this very item grows it, and a
 * ceiling pinned at the measurement would be red by the time the item was recorded. It
 * is granted ONCE to the total rather than three times, so the set cannot grow by three
 * allowances while every member stays inside its own.
 */
const SET = [
  {
    path: 'CLAUDE.md',
    // measured 569,698 at W112's declaration step; W114 takes it to its target.
    ceiling: 586_000,
    target: 25 * 1024,
  },
  {
    path: 'doc/workflow.md',
    // measured 304,465. Only a RETRO edits this file, and P27's is W115's successor
    // rather than part of any item here, so the slack is small and deliberate.
    ceiling: 310_000,
    target: 35 * 1024,
  },
  {
    path: 'doc/concept.md',
    // measured 17,125, which is already inside its 17,408-byte target — the only member
    // of the set that is, and P27 decision 1 says so.
    ceiling: 20_000,
    target: 17 * 1024,
  },
];

/**
 * **The floor on the list, and it is the only non-vacuity guard a CEILING check can
 * have.** A floor's vacuity is *too little to check*; a ceiling's is *nothing to
 * measure* — an emptied `SET`, or a member that has been renamed on disk, makes every
 * other clause true of nothing and the check prints `All checks passed`. So `B1`
 * refuses both, and this is what `B4` in the self-test's `SELF` list bounds.
 *
 * Three, because P27 decision 1 decides the membership and three is what it decides.
 * Lowering this is how the budget leaves, in exactly the shape
 * [Q102](../doc/open-questions.md) describes.
 */
const MIN_MEMBERS = 3;

// The set measured 891,288 bytes at W112's declaration step, plus ONE record-step
// allowance of 16,302. Strictly below the per-file ceilings' sum of 916,000, for the
// reason the `SET` docstring gives.
const TOTAL_CEILING = 907_590;
const TOTAL_TARGET = 77 * 1024;  // P27 decision 1's 77 KB, and the per-file targets sum to it

// --- B1: the set is there -----------------------------------------------------
if (SET.length < MIN_MEMBERS) {
  fail('B1', `the always-read set declares ${SET.length} member(s) and MIN_MEMBERS is ` +
    `${MIN_MEMBERS} — every other clause here is true of nothing below that`);
}
const sizes = new Map();
for (const m of SET) {
  const abs = join(MEASURE_ROOT, m.path);
  let st;
  try { st = statSync(abs); } catch { st = null; }
  if (!st || !st.isFile()) {
    fail('B1', `${m.path} is declared in the always-read set and is not a readable file`);
    continue;
  }
  // `statSync().size` rather than reading the file: this check costs ~0.1 s and the
  // bytes on disk are what a session pays for, not the characters after decoding.
  sizes.set(m.path, st.size);
}

// --- B2: each member is inside its own ceiling ---------------------------------
for (const m of SET) {
  const n = sizes.get(m.path);
  if (n === undefined) continue;   // B1 has already reported it
  if (n > m.ceiling) {
    fail('B2', `${m.path} is ${n} bytes and its ceiling is ${m.ceiling} — ` +
      `over by ${n - m.ceiling}. The ceiling only moves DOWN: lower it in a cut, ` +
      `never raise it to fit`);
  }
}

// --- B3: the set as a whole is inside the total ceiling ------------------------
const measured = [...sizes.values()].reduce((a, b) => a + b, 0);
if (sizes.size === SET.length && measured > TOTAL_CEILING) {
  fail('B3', `the always-read set is ${measured} bytes and TOTAL_CEILING is ` +
    `${TOTAL_CEILING} — over by ${measured - TOTAL_CEILING}`);
}

// --- B4: the declaration is internally consistent ------------------------------
// Two ways it can contradict itself, and each hides a different thing. A total ceiling
// ABOVE the per-file sum is slack no per-file clause can see, so `B3` would permit a
// breach `B2` reports; a total ceiling BELOW the total target says the budget has
// already been met while the targets say it has not.
const sumCeilings = SET.reduce((a, m) => a + m.ceiling, 0);
const sumTargets = SET.reduce((a, m) => a + m.target, 0);
if (TOTAL_CEILING > sumCeilings) {
  fail('B4', `TOTAL_CEILING is ${TOTAL_CEILING} and the per-file ceilings sum to ` +
    `${sumCeilings} — the difference is slack B2 cannot see`);
}
if (TOTAL_CEILING < TOTAL_TARGET) {
  fail('B4', `TOTAL_CEILING is ${TOTAL_CEILING} and TOTAL_TARGET is ${TOTAL_TARGET} — ` +
    'a ceiling below the target says the budget is already met');
}
if (sumTargets !== TOTAL_TARGET) {
  fail('B4', `the per-file targets sum to ${sumTargets} and TOTAL_TARGET is ` +
    `${TOTAL_TARGET} — two statements of one budget`);
}

// --- report -------------------------------------------------------------------
if (process.argv.includes('--self-test')) {
  const mod = process.env.CHECK_BUDGET_SELFTEST ?? join(ROOT, 'scripts', 'check-budget-selftest.mjs');
  // `resolve`, not `join`: the default is already absolute. The override is what lets
  // `check-wiring`'s `G1` prove this dispatch ROUTES rather than that its text exists.
  const { selfTest } = await import(pathToFileURL(resolve(ROOT, mod)).href);
  process.exit(await selfTest(ROOT));
}

const CHECKS = [
  'B1 the always-read set is declared and every member is a readable file',
  'B2 every member is inside its own ceiling',
  'B3 the set as a whole is inside the total ceiling',
  'B4 the ceilings and the targets are one budget',
];

const kib = (n) => `${(n / 1024).toFixed(1)}`;
console.log(`budget check — the always-read set is ${SET.length} document(s), ` +
  `${measured} bytes (${kib(measured)} KiB)\n`);
console.log('  document                 measured      ceiling       target    over target by');
for (const m of SET) {
  const n = sizes.get(m.path);
  const got = n === undefined ? 'MISSING' : `${kib(n)} KiB`;
  const over = n === undefined ? '' : n <= m.target ? 'met' : `${kib(n - m.target)} KiB`;
  console.log(`  ${m.path.padEnd(22)} ${got.padStart(11)} ${(kib(m.ceiling) + ' KiB').padStart(12)} ` +
    `${(kib(m.target) + ' KiB').padStart(12)} ${over.padStart(14)}`);
}
console.log(`  ${'TOTAL'.padEnd(22)} ${(kib(measured) + ' KiB').padStart(11)} ` +
  `${(kib(TOTAL_CEILING) + ' KiB').padStart(12)} ${(kib(TOTAL_TARGET) + ' KiB').padStart(12)} ` +
  `${(measured <= TOTAL_TARGET ? 'met' : kib(measured - TOTAL_TARGET) + ' KiB').padStart(14)}`);
// **The distance is printed rather than merely available.** It is what goes stale
// toward weakness if the ceiling is never lowered, and the only thing that makes that
// drift visible is a reader seeing it on every gate run.
console.log(`\nnote: the ceiling is ${kib(TOTAL_CEILING - TOTAL_TARGET)} KiB above the target, ` +
  'and only ever moves DOWN — each cut item lowers it to its own measurement\n');

for (const c of CHECKS) {
  const id = c.slice(0, 2);
  const bad = failures.filter((f) => f.startsWith(id + ':'));
  console.log(`  ${bad.length ? 'FAIL' : 'ok  '}  ${c}${bad.length ? ` (${bad.length})` : ''}`);
}
if (failures.length) {
  console.log('\n' + failures.map((f) => '  ' + f).join('\n'));
  console.log(`\n${failures.length} failure(s).`);
  process.exit(1);
}
console.log('\nAll checks passed.');
