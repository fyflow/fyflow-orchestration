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
// direction from [Q102](../doc/questions/q102.md)'s floors and is why the DISTANCE to
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
 * **Each member has its own ceiling AND the set has a total, and until W115 the total was
 * STRICTLY BELOW their sum.** That was not tidiness: the first cut of this check set the total to
 * the sum exactly, which made `B3` unreachable — a total breach then implied a per-file breach, so
 * `B3` could never fire alone and was a clause with no instance of its own (rule 8 obligation (a):
 * a clause the set cannot provoke is a clause nobody has tested).
 *
 * **It is EQUAL to their sum again now, and this time by arithmetic rather than by carelessness.**
 * With every member inside its target, `B4` bounds `TOTAL_CEILING` from both sides onto
 * `TOTAL_TARGET` and `B5` bounds each ceiling to its target, so the three numbers collapse.
 * **So `B3` has lost its own case and the `b3` probe declares a compound** — stated here as well
 * as at `TOTAL_CEILING`, because this is the paragraph that supplies `B3`'s justification and the
 * adequacy reader found it still asserting the opposite. [Q479](../doc/questions/q479.md).
 *
 * **The allowance was for the record step and is not any more, which is a claim this file
 * made about itself and got wrong within a day.** It read *"`CLAUDE.md` is a record-step
 * file (`doc/workflow.md` section 1 rule 5), so finishing this very item grows it"* —
 * and `CLAUDE.md` LEFT that list at W112, by
 * [ADR 0077](../doc/decisions/0077-an-item-does-not-write-its-status-into-claude-md.md)
 * decision 1, in the same item that wrote the sentence. **No member of this set is a
 * record-step file now**, so finishing an item grows the set by nothing:
 * [W113](../doc/work-items/w113-the-register-is-a-reference.md)'s record step writes to
 * the register, `doc/README.md`, `README.md`, `doc/decisions/**` and its own file, and
 * not one of them is measured here.
 *
 * **And the allowance is now ZERO, which is what a MET budget means.** It was 4,096 bytes for an
 * ordinary edit — a hazard note in `CLAUDE.md`, a clause in `doc/workflow.md` at a retro — while
 * any member was still over its target. W115 brought the last one inside, and ceiling, target and
 * the per-file sum then collapse onto one number: **each member has only target-minus-measurement
 * to spend**, and the report prints that per member. Anyone who needs more must cut as much as they
 * write. *The sentence this replaced said the allowance was 4,096 and was false the moment the
 * budget was met.*
 *
 * **The allowance is written INTO each literal rather than named as a constant, and the clause
 * that made that necessary is the right one.** W113's first cut wrote `570_926 + ALLOWANCE`, and
 * `check:budget:selftest`'s source clause *every ceiling is an integer LITERAL, never derived from
 * the measurement it bounds* refused it. Widening that clause to admit `<number> + <identifier>`
 * would admit `statSync(join(ROOT, 'CLAUDE.md')).size + 4_096`, which is the exact expression
 * ADR 0076 consequence 10 records getting past its predecessor — so the arithmetic is in the
 * comments and the value on the line is a number. *A clause that cannot read an expression's
 * meaning is right to refuse every expression.*
 */
const SET = [
  {
    path: 'CLAUDE.md',
    // **23,160 on the tree [W114](../doc/work-items/w114-claude-md-is-guidance-and-npm-run-state-is-the-index.md)
    // ships, from 570,963 — a 24.7x cut**, and it grew again at W115, which took the record step's
    // list to FOUR in this file. This was the FIRST member of the set to MEET its
    // target. So the ceiling is the TARGET rather than `measured + ALLOWANCE`: 23,160 + 4,096 is
    // 27,256, which is ABOVE 25,600, and a ceiling above a met target permits un-meeting it. The
    // allowance here is whatever the report prints between the measurement and the target, an
    // ordinary edit's worth and is tighter than the other two members get — W113's reasoning
    // for `doc/concept.md`, applied to a member that has now arrived.
    // 25 * 1024, written as a literal for the reason below.
    ceiling: 25_600,
    target: 25 * 1024,
  },
  {
    path: 'doc/workflow.md',
    // **cut from 305,643 to about 35.6 KiB by
    // [W115](../doc/work-items/w115-the-exit-artifact-and-the-budget-met.md) — an 8.6x cut**, and
    // this is the LAST member of the set to MEET its
    // target. So the ceiling is the TARGET, and here that is not a preference: **the declaration
    // space admits exactly ONE value.** `B4` requires `TOTAL_CEILING <= sumCeilings` and
    // `TOTAL_CEILING >= TOTAL_TARGET`, so `sumCeilings >= 79,872` and this ceiling must be at
    // least 36,864; `B5` requires a MET member's ceiling to sit at or below its target, so it must
    // be at most 36,864. Brute-forced at W115's declaration step over every value in 1..400,000 for
    // staged sizes of 35,840, 35,000, 30,000 and 20,000: **one legal ceiling and one legal total, in
    // all four.** *So W112's obligation (d) — "lower the ceiling to your own post-cut measurement" —
    // is not satisfiable at the last member, and W114's setting of `CLAUDE.md`'s ceiling to its
    // target was the same arithmetic one member early.*
    //
    // **The 4,096-byte allowance ceases to exist when the last member arrives, and that is the
    // honest cost.** Ceiling, target and the per-file sum all collapse onto one number, so the
    // headroom here is target-minus-measurement, which the report prints. A retro that adopts a clause must
    // cut as much as it writes — which is what a met budget means, stated here rather than
    // discovered by a red gate (ADR 0076 decision 5, and `doc/concept.md`'s 283 bytes).
    //
    // **The TARGET was RAISED by decision, once: 35 KiB to 36 KiB, by the maintainer on 2026-10-06**
    // for `doc/workflow.md` v0.28 ([P29](../doc/plans/p29-which-open-questions-still-matter.md)
    // stop-and-ask (n)), when the headroom was 66 bytes and the clause needed more. Ceiling and
    // target moved together, as `B4` and `B5` require. A raise is a decision, never an edit to fit.
    // 36 * 1024, the target, written as a literal for the reason the SET docstring gives.
    ceiling: 36_864,
    target: 36 * 1024,
  },
  {
    path: 'doc/concept.md',
    // measured 17,125, inside its 17,408-byte target, and until W114 the only member of the
    // set that was. **It moves at W114 because `B5` FIRED ON IT** on that clause's first run:
    // a ceiling of 20,000 sits **2,592 bytes above a MET target**, so the budget could be
    // un-met for this file by writing into it. W113 left the 20,000 calling it *a tighter
    // allowance than the other two get*, which was true and was not the test — the test is
    // whether a met target can be un-met by raising a number, and it could.
    // **The honest cost is that the headroom is now 283 bytes.** A member inside its target has
    // only target-minus-measurement to spend, and anyone who needs more must cut as much as they
    // write. That is what a budget is; it is stated here rather than discovered by a red gate.
    // 17 * 1024, the target, written as a literal for the reason the SET docstring gives.
    ceiling: 17_408,
    target: 17 * 1024,
  },
].map(Object.freeze);

/**
 * **The membership and the allocation, declared BY NAME — `B6` and `B7`, and both are a reader's
 * finding rather than a precaution.** W115's adequacy reader could run no rung, so both were derived
 * and both were then CONFIRMED by running them:
 *
 *   * `SET` staged as `[doc/concept.md, doc/workflow.md, doc/concept.md]` — `CLAUDE.md` simply
 *     absent from the always-read set — came back **EXIT 0 with zero failures and a reported total of
 *     52,730 bytes**. `B1` compares `SET.length` to `MIN_MEMBERS` and three is three; `B3` is
 *     guarded by `sizes.size === SET.length` and the `Map` de-duplicates to two, so **`B3` was
 *     skipped in silence as well.** *A count is not a membership* — obligation (d)'s own named
 *     failure ([Q217](../doc/questions/q217.md)), inside the check that enforces the budget.
 *   * `B4` compares only the SUM of the targets, so the ALLOCATION was free. Targets of
 *     **1 / 1 / 75 KiB** still sum to 78,848; with the ceilings at 876,800 and `TOTAL_CEILING`
 *     matching, every clause is green and **the always-read set may grow to 876,800 bytes** — back
 *     to roughly P27's 893,682 starting point. The smallest instance is a 1 KiB swap between
 *     `CLAUDE.md` and `doc/concept.md`, which takes `doc/concept.md` over its target and so
 *     un-arms `B5` on it. **W115 section 4 brute-forced the CEILING with the targets held fixed and
 *     concluded *exactly one legal value*; that is true of the ceiling and the allocation has a
 *     continuum.** ADR 0076 decision 5 names a derived ceiling as *"the one way this check can be
 *     made worthless without a clause going red"*; this was a second way, using nothing but integer
 *     literals and `N * 1024` products, and it was larger.
 *
 * **Its limit is [Q217](../doc/questions/q217.md)'s and is stated rather than closed**: these are
 * literals in the same file as the `SET` they bind, so a member and its declaration are two edits
 * in one diff. What they buy is that the two edits must AGREE — and the second observer is in
 * another file, where `check-budget-selftest.mjs`'s `SOURCE` clauses read this declaration's own
 * TEXT rather than running it, which is obligation (e)'s *read the default declaration*.
 */
const DECLARED_PATHS = Object.freeze(['CLAUDE.md', 'doc/workflow.md', 'doc/concept.md']);
/** Reads the pair in one place, so neither `B6` loop shares a line with the other. */
const DECLARED_TARGETS_UNDECLARED = (k) => DECLARED_PATHS.indexOf(k) < 0;
const DECLARED_TARGETS = Object.freeze({
  'CLAUDE.md': 25 * 1024,
  'doc/workflow.md': 36 * 1024,
  'doc/concept.md': 17 * 1024,
});

// **FROZEN, because a ceiling can be DERIVED at RUN TIME and the source clause cannot see it.**
// [ADR 0076](../doc/decisions/0076-a-vacuity-floor-counts-what-a-prose-cut-cannot-move.md)
// decision 5 calls a ceiling derived from the size it bounds *"the one way this check can be made
// worthless without a clause going red"*, and consequence 10 records W112's adequacy reader doing
// it by rewriting the DECLARATIONS — after which that item widened the source pattern to the end
// of the line and asserted the count of ceilings found.
//
// **The road that clause cannot see is a statement.** W113's adequacy reader inserted ONE line —
// `SET[0].ceiling = statSync(join(ROOT, 'CLAUDE.md')).size + 4_096;` — and measured `check:budget`
// EXIT 0, `check:budget:selftest` EXIT 0 at 12/12 probes, grader 4/4 and **`source: 7/7 bound(s)
// held`**. Then it grew `CLAUDE.md` by 200 KB and the report printed a ceiling of 756.9 KiB with
// **`ok B2 every member is inside its own ceiling`**; only `B3` fired, on the set's 4,096 bytes of
// headroom. Re-measured here, both halves, before this freeze went in.
//
// **W113 is what made it byte-equivalent**: that item set `CLAUDE.md`'s ceiling to exactly
// `measured + ALLOWANCE`, so the derivation and the literal agree today and no output differs.
// *A clause that reads a declaration is blind to an assignment, and the thing that closes that is
// not a better pattern — it is making the object unassignable.* `Object.freeze` in a module (ESM
// is always strict) makes the assignment THROW, so the road is refused rather than detected, and
// a `SOURCE` clause below refuses the shape in the text as the second observer.

/**
 * **The floor on the list, and it is the only non-vacuity guard a CEILING check can
 * have.** A floor's vacuity is *too little to check*; a ceiling's is *nothing to
 * measure* — an emptied `SET`, or a member that has been renamed on disk, makes every
 * other clause true of nothing and the check prints `All checks passed`. So `B1`
 * refuses both, and this is what `B4` in the self-test's `SELF` list bounds.
 *
 * Three, because P27 decision 1 decides the membership and three is what it decides.
 * Lowering this is how the budget leaves, in exactly the shape
 * [Q102](../doc/questions/q102.md) describes.
 */
const MIN_MEMBERS = 3;

// 891,288 at W112's declaration step; 893,645 at W113's; 345,928 at W114's.
// **The BUDGET IS MET since W115**, from 893,682 bytes at the start of
// [P27](../doc/plans/p27-what-a-register-row-is.md) — roughly an 11.7x drop across its four items.
//
// *This comment used to name all three members' measured sizes and the set's total, and it was
// STALE FIVE TIMES in W115 alone — four found by that item's conformity reader and the fifth
// caused by its own 17-byte correction of an unrelated figure. The cause is structural: **every
// edit to a budgeted document dates every prose copy of its size**, and W115 edited
// `doc/workflow.md` six times. So the measured figures are GONE from this file's comments and
// only the DECIDED ones remain — the targets, which are P27 decision 1's and move by decision
// rather than by editing. **`check:budget` prints the measurement, the ceiling, the target and
// the per-member headroom on every run**, which is P27 decision 4: a fact the tree COMPUTES is
// not written down. Section 1 rule 5's WHEN direction, answered by deleting the copy instead of
// re-taking it for a sixth time.*
//
// **This is pinned to exactly one value and no longer carries an allowance**, for the reason the
// `doc/workflow.md` ceiling comment gives: with every member's ceiling at its target,
// `sumCeilings == TOTAL_TARGET`, and `B4` bounds this number from both sides onto that one
// figure. **So it is NOT strictly below the per-file sum any more, and `B3` loses the case `B2`
// cannot reach** — the defect the `SET` docstring records fixing in this check's first cut,
// arriving from the opposite direction because the budget was MET rather than because the total was
// set carelessly. The maintainer was asked and chose to DECLARE it rather than amend
// [ADR 0076](../doc/decisions/0076-a-vacuity-floor-counts-what-a-prose-cut-cannot-move.md)
// decision 4: `B3` keeps a probe as a compound and regains its own case the moment any member is
// UN-met, which is what a fourth member would do. [Q479](../doc/questions/q479.md).
// 78 * 1024, which is both the sum of the ceilings and the sum of the targets.
// **P27 decision 1's 77 KB was raised to 78 KB by the maintainer on 2026-10-06**, the 1 KiB going
// to `doc/workflow.md` for v0.28 ([P29](../doc/plans/p29-which-open-questions-still-matter.md)
// stop-and-ask (n)). The other two members' targets are still P27's.
const TOTAL_CEILING = 79_872;
const TOTAL_TARGET = 78 * 1024;  // P27's 77 KB raised to 78 KB by P29 (n); the per-file targets sum to it

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
// **And `B1` fails when the loop did not REACH every member, not only when a member it visited
// was unreadable** — W115's adequacy reader. Narrowing the loop above left `doc/concept.md`
// unmeasured and the check printed `MISSING` in its row, `TOTAL ... met`, and **EXIT 0**: a
// member absent from `sizes` merely trips `B3`'s `sizes.size === SET.length` guard, which
// DISABLES that clause in silence rather than failing. That is the same guard shape `B6` was
// added to close, in the one direction `B6` does not cover.
if (sizes.size !== SET.length) {
  fail('B1', `the set declares ${SET.length} member(s) and only ${sizes.size} were measured — `
    + 'a member the loop never reached is not reported by the clauses above, and it silently '
    + 'disables B3, whose guard compares exactly these two numbers');
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

// --- B5: a member that has MET its target keeps its ceiling at or below that target ------
// **Nothing compared a member to its TARGET, and W114's adequacy reader measured the cost**: with
// `CLAUDE.md` cut to 23,160 its ceiling could be lowered to 40,960 — *above* the 25,600 target —
// and every clause here passed, so *under the 25 KB budget* was a report string rather than a
// bound. A universal `ceiling <= target` cannot be the rule: `doc/workflow.md` is 298 KiB against a
// 35 KiB target and is W115's to cut. **The rule is that MEETING a target is a RATCHET** — once a
// member is inside its target, its ceiling may not sit above it, so the budget cannot be un-met by
// raising a number.
//
// **The counter-example this clause rested on NO LONGER EXISTS, and W115's conformity reader
// found it.** The reasoning above read *a universal `ceiling <= target` cannot be the rule:
// `doc/workflow.md` is 298 KiB against a 35 KiB target and is W115's to cut* — and W115 cut it,
// so **all three members are met and the universal rule and this one now agree on every member
// of the set.** `B5` is kept in its conditional form rather than universalised, for one measured
// reason: a FOURTH member joining the set un-met would need a ceiling above its target while it
// is being cut, which is the whole shape of P27's four items, and the universal rule would refuse
// that. *So the clause is right and its argument is dated: it has no live case on this tree, and
// its only instances are declaration edits — which is why its probe mutates the declaration.*
for (const m of SET) {
  const n = sizes.get(m.path);
  if (n === undefined) continue;
  if (n <= m.target && m.ceiling > m.target) {
    fail('B5', `${m.path} is ${n} bytes and has MET its ${m.target}-byte target, and its ceiling ` +
      `is ${m.ceiling} — above the target. A met target is a ratchet: lower the ceiling to the ` +
      'target, or the budget can be un-met by raising a number rather than by writing one');
  }
}

// --- B6: the set is the DECLARED MEMBERSHIP, compared both ways -----------------
// A count cannot see a duplicate, a substitution, or a member that left while another arrived
// twice. This compares the declared paths to `SET`'s, in both directions and with multiplicity.
const setPaths = SET.map((m) => m.path);
// **The two DECLARATIONS are compared to each other first, and until W115's adequacy reader
// nothing did.** `B6` reads `DECLARED_PATHS` and `B7` reads `DECLARED_TARGETS`; a path present in
// the first and absent from the second made `B7` skip that member in SILENCE while `B6` stayed
// correctly quiet — so `B7`'s own `continue` comment, *B6 has already reported an undeclared
// member*, was false for exactly the case the guard exists for. Measured: dropping one key left
// `check:budget` EXIT 0 with `B7` dead for that member. *This is obligation (d)'s own clause — a
// control must fail where its claim is VACUOUS, not only where its subject is ABSENT.*
for (const p of DECLARED_PATHS) {
  if (!(p in DECLARED_TARGETS)) {
    fail('B6', `${p} is in DECLARED_PATHS and has no DECLARED_TARGETS entry — B7 reads the `
      + 'second list and would skip that member in silence, so the two declarations are '
      + 'compared to each other before either is compared to SET');
  }
}
for (const k of Object.keys(DECLARED_TARGETS)) {
  // `k` rather than `p`, and `.indexOf` rather than `.includes`, DELIBERATELY: written as
  // `if (!DECLARED_PATHS.includes(p))` this line is byte-identical to the undeclared-member
  // loop below, and a META mutation pinned to that text then hits whichever comes first. It did:
  // the entry for the loop below graded STILL CAUGHT on its first run. **That is W109's defect
  // at P26 — a second comparison duplicating two probe anchors — and the reason ADR 0070
  // consequence 2 made `gate:full` an item's confirming gate.** *A mutation pinned to text two
  // clauses share is pinned to neither.*
  if (DECLARED_TARGETS_UNDECLARED(k)) {
    fail('B6', `${k} has a DECLARED_TARGETS entry and is not in DECLARED_PATHS`);
  }
}
for (const p of DECLARED_PATHS) {
  const n = setPaths.filter((q) => q === p).length;
  if (n !== 1) {
    fail('B6', `${p} is a declared member of the always-read set and appears ${n} time(s) in SET — ` +
      'the membership is a LIST of names, not a count: a duplicate hides a member that left, and ' +
      'B3 is skipped in silence when the two differ');
  }
}
for (const p of setPaths) {
  if (!DECLARED_PATHS.includes(p)) {
    fail('B6', `SET declares ${p}, which is not in DECLARED_PATHS — P27 decision 1 decides the ` +
      'membership, so a member may not be added here without being declared there');
  }
}

// --- B7: each member's TARGET is its own decided figure ------------------------
// `B4` binds only the SUM, which left the allocation free: measured at W115, targets of 1/1/75 KiB
// sum to the same 78,848 and relax the whole budget 11x with every clause green.
for (const m of SET) {
  const want = DECLARED_TARGETS[m.path];
  if (want === undefined) continue;        // B6 has already reported an undeclared member
  if (m.target !== want) {
    fail('B7', `${m.path}'s target is ${m.target} and P27 decision 1 decides ${want} — the SUM of ` +
      'the targets is not the budget: moving allowance between members un-arms B5 on whichever one ' +
      'goes over, and B4 cannot see it because the sum is unchanged');
  }
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
  'B5 a member that has MET its target keeps its ceiling at or below it',
  'B6 the set is exactly the declared membership, compared both ways',
  "B7 each member's target is the figure P27 decision 1 decides for it",
];

const kib = (n) => `${(n / 1024).toFixed(1)}`;
// **The ROOT is named, because nothing observed it** — W115's adequacy reader, obligation (e)'s
// *is what it ran what SHIPS*. `CHECK_BUDGET_ROOT` repoints the measurement at a copy, which is how
// `--self-test` breaks each clause without touching the real tree; with the root unprinted, a gate
// run with that variable set in the environment measured a copy and its output was indistinguishable
// from a run against the repository. One interpolation closes it.
console.log(`budget check — the always-read set is ${SET.length} document(s), ` +
  `${measured} bytes (${kib(measured)} KiB), measured at ${MEASURE_ROOT}\n`);
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
// **This note's second half was advice W115 then proved unsatisfiable, and the adequacy reader
// found it still printing.** *Each cut item lowers it to its own measurement* was right for
// every item but the LAST: once the final member is inside its target, `B4` and `B5` pin the
// ceiling to the target exactly, so there is no measurement left to lower it to. The distance
// is now permanently 0.0 KiB, and what a reader needs instead is the per-member HEADROOM —
// the number that can still go stale toward weakness, which is why ADR 0076 decision 5 asks
// for a printed one at all.
const headroom = SET.map((m) => `${m.path} ${m.target - (sizes.get(m.path) ?? m.target)}`).join(', ');
console.log(`\nnote: the ceiling is ${kib(TOTAL_CEILING - TOTAL_TARGET)} KiB above the target and ` +
  'only ever moves DOWN. Where a target is MET the two are EQUAL and the headroom is all there ' +
  `is to spend: ${headroom} byte(s)\n`);

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
