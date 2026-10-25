// **The negative tests for `check-spec.mjs` — the first this repository's OLDEST
// check has ever had** — `doc/workflow.md` section 5 rule 7, all three requirements,
// and rule 8's four obligations on the lists this file itself iterates.
//
//   node scripts/check-spec.mjs --self-test
//
// `check-spec.mjs` shipped with [W1](../doc/work-items/w1-the-normative-layer.md).
// Its negative tests were run by hand once and written into a Record, which is rule
// 7 (a)'s *"a probe that ran once is a claim about the past"* — over `spec/`, the
// directory `CLAUDE.md` calls the source of truth. `check-source-selftest.mjs`'s own
// header has said so since W24, naming this file as the gap; W30 closes it.
//
// ---------------------------------------------------------------------------
// **THE UNITS, STATED FIRST, BECAUSE A CAP THAT UNDERCOUNTS READS AS COVERAGE.**
//
// [P9](../doc/plans/p9-when-a-check-stops-checking-what-notices.md)'s census counts
// clauses at **ID** granularity and calls `check-spec` *seven clauses*. This file
// works at **`fail()`-SITE** granularity, and the two reconcile exactly:
//
//   **RE-TAKEN AT W223** by `grep -o "fail('C[0-9]*'," scripts/check-spec.mjs | sort | uniq -c`:
//   34  `fail()` sites — C1×1 C2×4 C3×3 C4×9 C5×2 C6×1 C7×9 C8×3 C9×2; 44 probes and 42 META
//       entries, which the floors below hold. *The headline read 30 and C4×7 from W61 until W223's
//       conformity reader found it never re-taken; C4's two missing sites are W65's spec-paragraph
//       pair. The 18 / 21 reconciliation below is W30's, true of that tree and kept as history.*
//        (C9 added TWO at W223, P45 (h1): a cited corpus path that does not exist, and a corpus
//         spelling C9 cannot resolve. Its probes and META entries are at the end of each list.)
//        (C4 gained ONE at W61: the README row's HEADLINE count beside the tail count it read.)
//        (C7 gained TWO at W61: a transform's `lang` against `languages`, and FD-V35's case
//         naming a language the registry lacks — the fifth set, W59's pair one set over.)
//        (C7 gained TWO at W59: a typed task's `type` against `nodeTypes`, and FD-V32's case
//         naming a type the registry lacks — `FD-V5`'s two clauses one registry set over.)
//        (C4 gained FOUR at W45: two comparing spec/README.md's own refusal count to
//         what C4 counted, and two reporting that the count is not stated at all)
//       (C2 gained TWO at W41: the `RULE_PREFIXES` binding, both directions.)
//  - 2  `C5`'s two, which are NOT this file's: `C5` was lifted into
//       `scripts/check-markdown.mjs` by W25, and its probes and its one grading live
//       in `scripts/check-markdown-selftest.mjs` (the two probes declaring `check: 'C5'`, the META
//       entry *"C5`s lift removed from check-spec"*). `check-spec` is the caller.
//  ----
//   19  probed here, ONE PROBE PER SITE and one META entry per site.
//  + 1  an eighteenth probe that is deliberately NOT one-per-site: a single flow
//       tripping TWO `C7` clauses at once, which is what makes the failure-COUNT
//       discriminator below reachable. Measured: without it, no entry in this file
//       ever grades `caught`, so that mechanism would have shipped as decoration.
//  ----
//   18  probes, and 21 META entries — 17 clause, 2 report, 2 exit-path.
//
// **That is the whole of `C1`-`C4`, `C6`, `C7` and `C8` — there is no cap.** W29's
// `check-docs` pass had to cap and its stated cap undercounted by four; the reason
// there was cost, and the reason there is no cap here is also cost: a bare
// `check-spec` run is **~155 ms**, against `check-docs`' 4.4 s. An entry is two runs
// ([Q148](../doc/questions/q148.md)), so 21 gradings are seconds rather than minutes.
//
// **`C5` is excluded from `GRADED_IDS` and from nothing else.** `trippedIn()` below
// reads every `C\d+` the run reports, with no allowlist, so a probe that trips `C5`
// by accident is refused rather than ignored — which is the hole W24's adequacy
// reader found in `ALL_CHECKS` and deleted.
// ---------------------------------------------------------------------------
//
// **THE FIXTURE, AND WHY IT CARRIES `doc/`.** Every probe here builds the invalid
// `spec/` this repository does not contain — `spec/` has passed `C1`-`C8` since W1,
// so there is no live defect behind any of them. `CHECK_SPEC_DIR` points the check
// at a copy under `dev-dist/` (gitignored — W24's conformity reader's finding about
// leaving untracked files where section 7 rule 2's by-hand `git status` audit reads).
//
// The copy needs a sibling `doc/`, and that is measured rather than assumed: every
// relative link in `spec/**` points into `../doc/**`, so a fixture with no `doc/`
// beside it reports **195** dead links under `C5` and buries every probe's declared
// set in noise. Measured: **195** without it, **0** with it.
//
// **And the fixture is EXERCISED rather than merely satisfied**, which is a separate
// claim and the one this paragraph got wrong. It read *"**23** with it and ONE link
// deliberately broken"*; **one broken link costs 1**. The 23 came from a `sed` that
// replaced the first match on each of ~23 lines of the 26 links `spec/join-policy.md`
// carries to `doc/open-questions.md` — a measurement of a DIFFERENT EDIT than the
// sentence described, which is rule 8's *"an edit precise enough to re-run"* failing in
// the small. W30's conformity reader swept every file and directory one at a time and
// found no edit that yields 23. **Re-measured: 0 intact, 1 with one link broken, 26
// with every occurrence in that one file broken.**
//
// **THE REPAIR THIS ITEM SHIPS HAS NO DISCRIMINATING CASE, AND THAT IS REPORTED
// RATHER THAN DRESSED UP.** `check-spec.mjs`'s report read its id as
// `c.slice(0, 2)` — the exact expression W24 repaired in `check-source.mjs`, where
// it made `S10`-`S13` all report as `S1`. Here every id is two characters, so the
// repaired and unrepaired expressions **agree on all eight rows** and no probe in
// this file can tell them apart. There is therefore **no META entry for it**: one
// would grade STILL CAUGHT and be a lie.
//
// **The case was CONSTRUCTED and measured instead**, which is `doc/workflow.md`
// rule 8's *"an edit precise enough to re-run"*. With `C1`'s clause and its report
// row renamed to `C10` and one example made unparseable:
//
//   repaired  (first word)          FAIL  C10 examples parse (1)
//   reverted  (first two chars)     ok    C10 examples parse      <- with the failure
//                                                                    line right there
//
// So the repair is **inert today and correct at `C10`**, and this file says which.
// That is [P8](../doc/plans/p8-what-can-be-deleted-with-the-gate-green.md)'s second
// proposed verdict — *a check written for a defect you have just fixed has no live
// case* — in its sharpest form: not merely no live case, but **no case the shipped
// corpus can express at all**. W25's finding one turn further round.
//
// ---------------------------------------------------------------------------
// **THE CEILING — MEASURED AGAINST THIS FILE AS SHIPPED, NOT COPIED FROM A SIBLING.**
// `scripts/check-policies-selftest.mjs:29-51` records the fixed point: **nothing
// inside a self-grading file can assert that the file grades.**
//
// **This file has NO `SELF` list**, and that is a declared consequence rather than an
// oversight: [W31](../doc/work-items/w31-the-self-list-check-policies-never-had.md)
// is narrowed to `check-policies`, so nothing picks this one up. **Ten of W30's
// thirty-three provocations survive and eight of them are here**, each measured
// against this file as shipped:
//
//   `MIN_PROBES` -> 0, ALONE                                    survives
//   `MIN_META`   -> 0, ALONE                                    survives
//   the distinctness bound -> `if (false)`                      survives
//   the per-id coverage bound -> `if (false)`                   survives
//   the two-projection cross-check -> `if (false)`              survives
//   the earned-exclusion check -> `if (false)`                  survives
//   the ambiguous-anchor guard -> `if (false)`                  survives
//   the GLOBAL-anchor guard -> `if (false)`                     survives
//   `RAN` -> `true`                                             REFUSED since W143: the
//                                                               `ran:` GUARD CASE (Q536)
//   `inertOnCleanTree` -> `true`                                survives
//   the RELOCATE `includes` guard -> `if (false)`               survives
//   the fingerprint made RANDOM, so 7 (b) can never fire        survives
//   `gradedIds()`'s own return expression -> `ids: []`          survives
//   `MAX_CORPUS` -> 99                                          survives
//   `bN > mN` -> `bN >= mN`                                     REFUSED since W143: the
//                                                               control has `bN === mN`
//   `tripped` re-sourced from the report ROWS                   survives
//   the final verdict -> `return 0`                             survives
//   `nested` -> `true`  (deletes the whole META pass)           survives
//   the `note:` lines AND the report HEADER counts              unasserted
//
// **Seventeen, where this header first listed nine — and the eight it missed were
// found by W30's adequacy reader.** Four deserve naming rather than counting:
//
//  - **`bN > mN` -> `>=` is behaviour-preserving ALONE and load-bearing COMPOUNDED**,
//    and the split is the point. *(Until W143: its unmutated-copy control has `bN === mN`, so
//    `>=` is now refused alone — the reader's finding 5.)* No entry here has `bN === mN`, so the file reads
//    `21/21 graded — 20 by the named probe, 1 by the failure COUNT` either way. But
//    `refused = true` ALONE is REFUSED at **18/21** — and all three failures come from
//    this comparison, not from the report entries the ceiling first credited. Apply
//    both and the run is **green at 21/21, 0 by the named probe, 21 by the failure
//    COUNT**. W29 built the count as a narrow escape hatch for one masked clause; here
//    it is the pass route for every entry the moment the primary verdict breaks.
//  - **`tripped` re-sourced from the failure lines to the report ROWS costs 0 here and
//    is REFUSED in `check-source-selftest.mjs`.** It makes `agree` compare a value with
//    itself, and the two report entries then pass as `disappeared` rather than
//    `disagreed` — [Q147](../doc/questions/q147.md), the right verdict by the wrong
//    route. **That single pair is the cleanest measurement anyone has of what a missing
//    `SELF` list costs**: the same mutation, the same shape of file, one with a list
//    beyond it and one without.
//  - **A fully broken harness reports `21/21` at exit 0.** `RAN` -> true,
//    `inertOnCleanTree` -> true and the RELOCATE guard removed, together, grade nothing
//    and say nothing. Each survived alone (`RAN` no longer does, since W143's `ran:` case); each is REFUSED in combination with one of
//    the others, so all three are demonstrably reachable and none is bounded.
//  - **A CONSTANT fingerprint is refused and a RANDOM one is not**, and the ceiling
//    first conflated them. `return 1` makes every probe report *"the mutation matched
//    nothing"* — **0/18** — so rule 7 (b) is load-bearing. Adding `+ Math.random()`
//    instead means the guard can never fire, and that costs **0** — but a genuinely
//    vacuous probe is **still refused** under it, by its declared set
//    (`exited 0, wanted [C8], got []`) rather than by the guard. **Behaviour-preserving,
//    and the right verdict by the wrong route** — [Q147](../doc/questions/q147.md)'s
//    shape a third time, which is why it is a ceiling row and not a hole.
//  - **The report's HEADER counts are as unread as its `note:` lines.** Replacing
//    `${mdFiles.length} documents, ${jsonFiles.length} examples, ${declared.size} rules`
//    with zeroes costs **0**. This list named the notes and not the header.
//
// **Three cases that ARE on `check-source-selftest.mjs`'s ceiling list are REFUSED
// here, and the reason is a bound that comes from OUTSIDE the file entirely:**
//
//   `MIN_PROBES` -> 0 AND one probe deleted     REFUSED — a META entry then names a
//                                                probe that is gone and ABORTS
//   `MIN_PROBES` -> 0 AND PROBES emptied        REFUSED — same, at `0/0 probes caught`
//   `MIN_META`   -> 0 AND META emptied          REFUSED — the per-id coverage bound
//
// **W28's named-probe contract is what does the first two**: naming the probe makes
// `PROBES` a list `META` depends on BY NAME, so shortening it dangles a reference
// rather than shortening a count.
//
// **And the argument this file first made for the third was FALSIFIED, which is the
// finding worth carrying out of it.** It read: *"the regress is not only 'move the hole
// one list further out'; a bound whose authority is the checked artefact rather than a
// declaration stops it where it is."* W30's adequacy reader emptied `GRADED_IDS` — the
// list that bound named its universe with — and the file printed **`0/0 graded` at exit
// 0**, every grading gone and green. **The bound's AUTHORITY was the artefact and its
// SCOPE was a declaration**, so the regress moved out exactly one list and stopped at a
// literal with nothing beyond it. The claim was right about where authority should come
// from and wrong that having it is enough.
//
// **The DECLARATION is gone, and the hole MOVED rather than closed — measured, not
// hoped.** `gradedIds()` derives the universe from `check-spec.mjs` twice over (the
// report's `checks` array and the `fail()` sites), cross-checks the two projections
// against each other, and admits an exclusion only when another self-test is measured
// to probe that id — W24's answer to `ALL_CHECKS`, which this file had quoted and not
// applied. The reader's exact edit now reports **"the mutation matched nothing"**,
// because there is no literal left to empty.
//
// **But rule 8's re-run put the same three edits one level in — `ids: []` inside the
// derivation, plus `MIN_META` and `META` — and it survives at `0/0 graded`, exit 0.**
// So the honest statement is `check-source-selftest.mjs`'s own: **the hole did not
// close, it moved out.** What changed is what an attacker has to edit — a data literal
// before, the return expression of a derivation now — and that is worth having and is
// not the same as closed. **The three rows above hold with the list gone**; the
// derivation that replaced it is on the ceiling with the guards.
//
// **And the exclusion is now the only declared thing here and it is bounded by
// evidence**: excluding `C1` — which nothing else probes — is REFUSED by name, at
// *"C1 is excluded from grading and no other self-test probes it"*.
//
// **The `note:`/header entry is not a mutation and is the honest addition.**
// `check-spec.mjs` prints two `note:` lines — how many definition refusals `C4` covered,
// and the 51 rules no example flow can express — and a header carrying three counts, and
// **no probe and no grading here reads any of them.**
// [Q100](../doc/questions/q100.md)'s class, in this file's own subject.
//
// **And one survivor is NOT the ceiling and is not fixable from inside any of this**:
// deleting the `--self-test` dispatch from `check-spec.mjs` leaves
// `npm run check:spec:selftest` at **exit 0** with the whole self-test unrun, and `S11`
// does not see it — it reads the MANIFEST. Measured in **all SIX** checks that have one.
// *(This read "all five" in six documents until W30's conformity reader counted the
// `:selftest` entries in `package.json` rather than trusting the list in the author's own
// probe script, which had omitted `check-markdown` — the second most expensive of them.
// **The finding was right and its census was wrong**, which is W29's own blocking finding
// one item later, in the file whose header opens "A CAP THAT UNDERCOUNTS READS AS
// COVERAGE".)* [Q149](../doc/questions/q149.md), and it is P8's proposed fifth obligation
// for rule 8 earning itself on the item that predicted it would not.
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync, rmSync, mkdirSync, cpSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

/**
 * **Every probe rewrites a COPY of `spec/` and nothing else**, so `apply` is a
 * side-effecting function over the fixture directory rather than a text mutation.
 * SIX of the eighteen add or remove a FILE (three each way) — a case a `(text) => text` probe
 * cannot express at all — which is why the shape differs from the sibling
 * self-tests' and why rule 7 (b) is enforced by a directory FINGERPRINT below
 * rather than by a string comparison.
 *
 * `check` and `also` together are the exact set of check ids the run must report
 * under (rule 7 (c)). Naming one does not discriminate: a merely malformed probe
 * trips two at once and so satisfies a probe declared as either.
 */
const PROBES = [
  // --- C1: every example parses ------------------------------------------------
  {
    name: 'an example that does not parse',
    check: 'C1',
    // **A VALID example, deliberately, and the alternative was measured.** Breaking
    // `registry.json` instead makes `parsed.get(REG)` undefined, `reg` `{}`, and
    // every predicate and workerType in the corpus unknown — **27 spurious `C7`
    // failures** on top of the one `C1`. A probe that trips a second check is
    // malformed, and this is the shape that would have hidden it.
    apply: (spec) => writeFileSync(join(spec, 'examples', 'valid', 'linear.flow.json'), '{ not json'),
  },

  // --- C2: every rule id is declared exactly once -------------------------------
  {
    name: 'a rule id declared TWICE, in two documents',
    check: 'C2',
    apply: (spec) => append(join(spec, 'task-id.md'),
      '\n| `RT-R9` | a second declaring row, added by check-spec`s self-test | W2 and W3 |\n'),
  },
  {
    name: 'a rule id cited in prose and declared by no rules table',
    check: 'C2',
    // `RN-R99` matches `RULE_ID` and no table declares it. The citation half of C2 —
    // a rule someone renamed and left referenced.
    apply: (spec) => append(join(spec, 'run-state.md'),
      '\nA sentence citing `RN-R99`, which no rules table declares.\n'),
  },

  // --- C2's PREFIX binding, added by W41 for Q164 ---------------------------------
  // `RULE_PREFIXES` is the whole spec's id vocabulary and it was bound to NOTHING:
  // dropping `FD-C` from it cost **zero**, because the two `FD-C` rules then matched
  // neither pattern and were neither declared nor cited. That is Q164's own defect —
  // *a rule declared, cited and checked by nothing* — surviving inside the fix for
  // it. The clause binds the list to `spec/`'s own declaration rows both ways, and
  // these are its two directions.
  {
    name: 'a rules table declares a prefix RULE_PREFIXES does not carry',
    check: 'C2',
    // A rule-id-SHAPED row with a prefix the list has never held. Without the
    // binding this is invisible: every `XY-Z` rule would be uncounted, unchecked for
    // uniqueness and unchecked for an owner, and `check-spec` would print `ok`.
    apply: (spec) => append(join(spec, 'run-state.md'),
      '\n| `XY-Z1` | a rule whose prefix the check does not know | W2 |\n'),
  },
  {
    name: 'every rule of a declared prefix removed, so RULE_PREFIXES carries an unused one',
    check: 'C2',
    // **The other direction, and it has to be reached from the DOCUMENT** — every
    // probe here rewrites a copy of `spec/` and none may edit the check. Deleting
    // both `FD-C` declaring rows leaves `FD-C` in `RULE_PREFIXES` with nothing
    // declaring it, which is the shape a RENAME leaves behind and which a one-way
    // binding passes. `C6` is not in the set: the rows are gone, so there is no
    // owner cell to be missing.
    // **Every MENTION goes too, and that is what makes this probe discriminate.**
    // Deleting only the declaring rows leaves `FD-C1` and `FD-C2` cited in prose, so
    // C2's *cited but never declared* clause fires as well — under the SAME id, so
    // set equality cannot tell the two apart and the META entry below would grade
    // STILL CAUGHT. That is W29's `D5` masking shape, and it was live in this probe's
    // first version. Removing the citations too leaves the prefix-unused clause as
    // the only thing that can report.
    apply: (spec) => {
      for (const f of readdirSync(spec)) {
        if (!f.endsWith('.md')) continue;
        const p = join(spec, f);
        writeFileSync(p, readFileSync(p, 'utf8')
          .split('\n').filter((l) => !/^\|\s*`FD-C\d+`/.test(l)).join('\n')
          .replace(/`FD-C\d+`/g, '`the carry rule`'));
      }
    },
  },

  // --- C3: every invalid example names a declared rule ---------------------------
  {
    name: 'spec/examples/invalid/ removed entirely',
    check: 'C3', also: ['C4', 'C9'],
    // **A structural cascade, declared rather than discovered.** With the directory
    // gone C3 says so once and C4 then reports all 22 definition refusals as
    // uncovered — the two cannot disagree about a missing directory, which is
    // exactly the shape rule 7 (c) admits (`check-docs`' `X3 -> X4, X5`).
    // **And `C9` since W223**: every rule row citing an `invalid/` case now cites a file that is
    // not there — measured on this probe's first run under C9, not predicted.
    apply: (spec) => rmSync(join(spec, 'examples', 'invalid'), { recursive: true, force: true }),
  },
  {
    name: 'a file in invalid/ that is not named <rule-id>--<slug>.flow.json',
    check: 'C3',
    // **`.txt`, not `.md` and not `.json`.** An `.md` here would join `mdFiles` and
    // trip `C8`'s missing-`Status` clause as well; a `.json` would be parsed by C1.
    // The probe has to reach the naming clause and nothing else.
    apply: (spec) => writeFileSync(join(spec, 'examples', 'invalid', 'notes.txt'), 'not an example\n'),
  },
  {
    name: 'an invalid example naming a rule id no rules table declares',
    check: 'C3',
    apply: (spec) => writeFileSync(join(spec, 'examples', 'invalid', 'FD-V99--nope.flow.json'),
      '{ "flowId": "nope", "version": 1, "entry": "a", "nodes": [] }\n'),
  },

  // --- C4: every definition refusal has a case ----------------------------------
  {
    name: 'a definition refusal whose only case is deleted',
    check: 'C4',
    apply: (spec) => rmSync(join(spec, 'examples', 'invalid', 'FD-V7--no-default-edge.flow.json')),
  },
  {
    name: 'a case for a rule declared DELIBERATELY ABSENT',
    check: 'C4',
    // C4's other direction, and the one a coverage count cannot see: `FD-V14` is a
    // held id with no rule behind it, so a case naming it means someone read the gap
    // as a lost rule. `declared` still holds it, so C3 is silent and only C4 fires.
    apply: (spec) => writeFileSync(join(spec, 'examples', 'invalid', 'FD-V14--held.flow.json'),
      '{ "flowId": "held", "version": 1, "entry": "a", "nodes": [] }\n'),
  },

  // --- C4's THIRD and FOURTH clauses: spec/README.md's own refusal COUNT ----------
  //
  // **W45's adequacy reader, and the clause exists because both statements could be
  // moved for zero** while this script printed the true number in the same terminal.
  // Two probes because they are two literals in one row and either can drift alone —
  // obligation (e)'s third shape, closed by comparing rather than by copying.
  {
    name: 'spec/README.md`s bold refusal count disagrees with what C4 counted',
    check: 'C4',
    apply: (spec) => edit(join(spec, 'README.md'),
      (t) => t.replace(/\*\*(\d+) refusals\*\*(?![\s\S]*\*\*\d+ refusals\*\*)/,
        (_m, n) => `**${Number(n) + 1} refusals**`)),
  },
  {
    name: 'spec/README.md`s quoted "C4 covered N" disagrees with what C4 counted',
    check: 'C4',
    apply: (spec) => edit(join(spec, 'README.md'),
      (t) => t.replace(/C4 covered (\d+) definition refusals(?![\s\S]*C4 covered \d+ definition refusals)/,
        (_m, n) => `C4 covered ${Number(n) + 1} definition refusals`)),
  },

  // --- C6: every non-FD-V rule names the item owing its test ---------------------
  {
    name: 'a non-FD-V rule whose declaring row has no "Test owed by" cell',
    check: 'C6',
    apply: (spec) => edit(join(spec, 'runtime-targets.md'),
      (t) => t.replace('before any assertion | W2 and W3 |', 'before any assertion |')),
  },

  // --- C7: the valid corpus resolves against the declared registry ---------------
  {
    name: 'registry.json removed, so FD-V4 and FD-V32 cannot be evaluated at all',
    check: 'C7', also: ['C9'],
    // **`C9` since W223, a declared cascade**: five rule rows (FD-V31-FD-V33, FD-V35, FD-V38) cite
    // `spec/examples/registry.json` by its full path — measured on this probe's first run under C9.
    apply: (spec) => rmSync(join(spec, 'examples', 'registry.json')),
  },
  {
    name: 'a valid flow naming a type the registry does not have',
    check: 'C7',
    apply: (spec) => edit(join(spec, 'examples', 'valid', 'linear.flow.json'),
      (t) => t.replace('"type": "IngestWorker"', '"type": "NoSuchType"')),
  },
  {
    name: 'a valid flow naming a predicate the registry does not have',
    check: 'C7',
    apply: (spec) => edit(join(spec, 'examples', 'valid', 'decision.flow.json'),
      (t) => t.replace('"when": { "predicate": "isLowConfidence" }', '"when": { "predicate": "noSuchPredicate" }')),
  },
  {
    name: 'a valid flow naming an unknown type AND an unknown predicate — TWO C7 clauses under ONE id',
    check: 'C7',
    // **The eighteenth probe, and the only one that is not one-per-`fail()`-site.**
    // It exists to make the failure-COUNT discriminator reachable, and W30 measured
    // that it was not: on this file's first run **no entry graded `caught`**, so the
    // mechanism [Q146](../doc/questions/q146.md) proposed and W29 built would have
    // shipped here as decoration.
    //
    // With two C7 clauses firing on one input, disabling either leaves the id SET
    // unchanged and moves the COUNT from 2 to 1 — which is Q146's finding in a
    // second file: **a detection the set structurally cannot see.** `C7` is where
    // this was always most likely, having five `fail()` sites under one id against
    // `C1`'s one.
    apply: (spec) => edit(join(spec, 'examples', 'valid', 'fanout-join.flow.json'),
      (t) => t.replace('"type": "IngestWorker"', '"type": "NoSuchType"')
        .replace('{ "to": "split" }', '{ "when": { "predicate": "noSuchPredicate" }, "to": "split" }')),
  },
  {
    name: 'FD-V4`s case naming only predicates the registry DOES have',
    check: 'C7',
    // The refusal cases are the half nobody thinks of: `FD-V4` exists to be an
    // unknown predicate, and a typo-fix that made it known would leave the rule with
    // a case that does not exercise it. C7 is the only thing that says so.
    apply: (spec) => edit(join(spec, 'examples', 'invalid', 'FD-V4--unknown-predicate-name.flow.json'),
      (t) => t.replace('"isLowConfidenc"', '"isLowConfidence"')),
  },
  // W65: a POOL is an instance of the node's type (`FD-V38`) — one probe per new `fail()` site.
  {
    name: 'a valid flow naming a POOL that is not an instance of its type',
    check: 'C7',
    apply: (spec) => edit(join(spec, 'examples', 'valid', 'pooled.flow.json'),
      (t) => t.replace('"pool": "scorer-fast"', '"pool": "nope"')),
  },
  {
    name: 'FD-V38`s case naming a pool that IS an instance of its type',
    check: 'C7',
    apply: (spec) => edit(join(spec, 'examples', 'invalid', 'FD-V38--pool-not-an-instance-of-the-type.flow.json'),
      (t) => t.replace('"type": "ScoreWorker", "pool": "scorer-fast"', '"type": "Scorer", "pool": "scorer-fast"')),
  },
  // W59: the fourth registry set. A typed task names its pool by `type`, and `C7` reads it
  // against `nodeTypes` — one probe per new `fail()` site, as for `workerType`.
  {
    name: 'a valid flow naming a node TYPE the registry does not have',
    check: 'C7',
    apply: (spec) => edit(join(spec, 'examples', 'valid', 'typed.flow.json'),
      (t) => t.replace('"type": "Scorer", "settings": { "factor": 100 }', '"type": "NoSuchType", "settings": { "factor": 100 }')),
  },
  {
    name: 'FD-V32`s case naming only node types the registry DOES have',
    check: 'C7',
    apply: (spec) => edit(join(spec, 'examples', 'invalid', 'FD-V32--type-not-in-registry.flow.json'),
      (t) => t.replace('"type": "Nope"', '"type": "Scorer"')),
  },
  // W61: the README row's HEADLINE count reverted while its tail is right — `C4` read the last
  // occurrence alone, and the author's rule 8 set (`e7`) reverted the first for zero.
  {
    name: 'spec/flow-definition.md`s OWN version paragraph says a count the rows do not give',
    check: 'C4',
    // **Anchored on the LAST `**N refusals**` in the document, whatever sentence carries it** — the
    // clause reads the last occurrence as the current claim (the header is a version history), and
    // this probe was anchored on v0.19's sentence: when W72's v0.20 paragraph added a later
    // occurrence, the probe edited history, the clause read the claim, and W72's confirming gate
    // was RED on this one line — rule 7 (b)'s shape, a probe going vacuous on the next version's
    // edit, which is exactly what an anchor pinned to a sentence does at the next bump (W32).
    apply: (spec) => edit(join(spec, 'flow-definition.md'),
      // **And COUNT-AGNOSTIC since W92**: `lastIndexOf('**34 refusals**')` found a HISTORICAL 34 once v0.23's
      // paragraph said 37, so the probe edited history and went vacuous — the same shape, one bump later. It now
      // moves whatever the LAST `**N refusals**` says, which is the occurrence the clause reads.
      (t) => { const all = [...t.matchAll(/\*\*(\d+) refusals\*\*/g)]; const m = all[all.length - 1]; if (!m) return t; return t.slice(0, m.index) + `**${Number(m[1]) + 1} refusals**` + t.slice(m.index + m[0].length); }),
  },
  {
    name: 'spec/README.md`s headline refusal count reverted while the version paragraph`s is right',
    check: 'C4',
    apply: (spec) => edit(join(spec, 'README.md'),
      // W65: 34 since v0.19 (35 until then) — rule 7 (b): a probe pinned to a count is re-anchored by the item that moves it.
      // COUNT-AGNOSTIC since W92 (37 at v0.23): it reverts whatever the headline says by two.
      (t) => t.replace(/how fan-out and join are paired, and \*\*(\d+) refusals\*\*\./, (_m, n) => `how fan-out and join are paired, and **${Number(n) - 2} refusals**.`)),
  },
  // W61: the fifth registry set. A transform's `lang` is read against `languages` — one probe per
  // new `fail()` site, as for `type`.
  {
    name: 'a valid flow naming a transform LANGUAGE the registry does not have',
    check: 'C7',
    apply: (spec) => edit(join(spec, 'examples', 'valid', 'transformed.flow.json'),
      (t) => t.replace('"transform": { "lang": "path", "expr": "document" }', '"transform": { "lang": "nosuch", "expr": "document" }')),
  },
  {
    name: 'FD-V35`s case naming only languages the registry DOES have',
    check: 'C7',
    apply: (spec) => edit(join(spec, 'examples', 'invalid', 'FD-V35--transform-language-not-in-registry.flow.json'),
      (t) => t.replace('"lang": "jsonata"', '"lang": "path"')),
  },

  // --- C8: spec/README's version column matches each document --------------------
  {
    name: 'a spec document with no "**Status:** vN.N" header',
    check: 'C8',
    // **Anchored on the SHAPE, not on the version.** This read
    // `t.replace('**Status:** v0.3', ...)` and went inert the moment W33 bumped
    // `run-state.md` to v0.4 -- reported by the rule 7 (b) guard as *"the mutation
    // matched nothing"* rather than passing, which is the guard working.
    apply: (spec) => edit(join(spec, 'run-state.md'),
      (t) => t.replace(/\*\*Status:\*\* v/, '**Version:** v')),
  },
  {
    name: 'a document spec/README.md has no index row for',
    check: 'C8',
    apply: (spec) => edit(join(spec, 'README.md'),
      (t) => t.replace(/^\| \[run-state\.md\]\(run-state\.md\).*\n/m, '')),
  },
  {
    name: 'a document whose own Status disagrees with the version README lists',
    check: 'C8',
    // The clause W1's third conformity pass was written for: README stale against
    // three of the five documents it indexes, and README is the first thing anyone
    // reads to know which version of the layer they are building against.
    // Version-agnostic for the same reason as the probe above, and here the old
    // literal was worse than inert: `v0.3 -> v0.4` on a document that now READS
    // v0.4 is a no-op, so the probe would have reported a disagreement it had not
    // created. Bumping the minor version by one is what the clause is about,
    // whatever the current number is.
    apply: (spec) => edit(join(spec, 'run-state.md'),
      (t) => t.replace(/(\*\*Status:\*\* v\d+\.)(\d+)/, (_m, a, b) => `${a}${Number(b) + 1}`)),
  },
  {
    name: 'README`s version COLUMN wrong while the row`s PROSE still names the version',
    check: 'C8',
    // **The same clause from the OTHER side, and it is the side that was unbound**
    // — W34. The probe above bumps the DOCUMENT's Status, which makes it disagree
    // with every occurrence in the row and so is caught by a check that searches the
    // whole row. This one leaves the document alone and breaks the version COLUMN,
    // which is what a stale README actually looks like.
    //
    // **Measured before the fix: it cost 0.** `C8` read `row.includes('**vN.N**')`
    // and every row of that table narrates its own version history in its prose
    // cell, so 2 of the 6 rows — the two whose documents had just been bumped —
    // had their version column bound by nothing. The clause bound least on the
    // rows most likely to be edited.
    //
    // **This is the constructed case for a fix that is inert on the corpus**: all
    // six columns were correct, so the repaired clause ships with no live case and
    // this probe is the whole of its evidence (`doc/workflow.md` section 5 rule 8).
    // It targets `join-policy.md` rather than `run-state.md` **because it must be a
    // row whose prose carries the version** — on a row where it does not, the old
    // check would have caught this too and the probe would prove nothing.
    apply: (spec) => edit(join(spec, 'README.md'),
      (t) => t.replace(
        /(\| \[join-policy\.md\]\(join-policy\.md\)[\s\S]*?)\*\*(v\d+\.\d+)\*\* \|/,
        (_m, head) => `${head}**v0.1** |`)),
  },
  {
    name: 'README`s version column is EMPTY, and the row`s prose still names the version',
    check: 'C8',
    // **The same clause in the direction the probe above cannot see.** That one
    // mutates the version's VALUE; this one removes it. W34's first repair scoped
    // `C8` to *the last non-empty cell*, which for an empty version cell is the
    // PROSE cell — and every row of that table narrates its own version history, so
    // `| … |  |` passed. Found by that item's conformity reader, one probe after the
    // repair. **A fix and its probe written together share the fix's blind spot**,
    // which is `doc/workflow.md` section 5 rule 8's founding observation applied to
    // a check rather than to a repair.
    apply: (spec) => edit(join(spec, 'README.md'),
      (t) => t.replace(
        /(\| \[join-policy\.md\]\(join-policy\.md\)[\s\S]*?)\*\*v\d+\.\d+\*\* \|/,
        (_m, head) => `${head} |`)),
  },

  // --- C9: every corpus file a rule row cites exists — W223, P45 (h1) -------------
  // **One probe per citation SHAPE the clause resolves differently** (W223's M2: full, bare after a
  // full, bare alone), plus the cited FILE deleted rather than the citation edited, the former-name
  // marker removed, and the one probe where a WRONG directory selection differs (obligation (a)'s
  // *where it SELECTS*). Each edits ONE row through `editRow`, because every string these anchor on
  // also occurs in prose that `C9` does not read — an edit there would be vacuous for the clause.
  {
    name: 'a full spec/examples citation in a rule row naming a file in the WRONG directory',
    check: 'C9',
    // The file exists — in `invalid/`. A resolver by BASENAME would pass it; `C9` resolves the path
    // as written. FD-V44's row carries this one full citation and no bare one after it.
    apply: (spec) => editRow(spec, 'flow-definition.md', 'FD-V44', (l) => l.replace(
      '`spec/examples/invalid/FD-V44--predicate-op-outside-the-subset.flow.json`',
      '`spec/examples/valid/FD-V44--predicate-op-outside-the-subset.flow.json`')),
  },
  {
    name: 'W216 S1 — a renamed case`s OLD name restored in its row, unmarked as a former name',
    check: 'C9',
    // **The defect's own shape** (P44 retro (a)): a bare name AFTER the row's full citation. The
    // row already carries `until v0.53` EARLIER in the line, before the former name — so this probe
    // also fails if the former-name marker is read anywhere in the line rather than immediately
    // before the span (the META entry *FORMER unanchored* names it).
    // **And the LINE is declared** (the adequacy reader's finding 4): the rule, the citation, and the
    // path it was resolved against — the row's own `invalid/` directory, which is what a `dir` mistake
    // would move.
    expect: /^ {2}C9: FD-V40's row in \S*spec\/flow-definition\.md cites `FD-V40--gate-key-path-with-an-index\.flow\.json`, and \S*spec\/examples\/invalid\/FD-V40--gate-key-path-with-an-index\.flow\.json does not exist$/m,
    apply: (spec) => editRow(spec, 'flow-definition.md', 'FD-V40', (l) => l.replace(
      '`FD-V40--an-if-condition-outside-input.flow.json`',
      '`FD-V40--gate-key-path-with-an-index.flow.json`')),
  },
  {
    name: 'a cited corpus FILE deleted while its row still cites it',
    check: 'C9',
    // The rename's other half: the citation untouched and the file gone. FD-V42 keeps another case
    // (`FD-V42--when-is-a-bare-string`), so `C4`'s coverage is unmoved and `C9` is the only reporter.
    apply: (spec) => rmSync(join(spec, 'examples', 'invalid', 'FD-V42--a-comparison-with-value-and-value-from.flow.json')),
  },
  {
    name: 'a bare citation AFTER a full one naming a file that exists only in ANOTHER corpus directory',
    check: 'C9',
    // **The selection probe.** `value-from.flow.json` is W221's VALID file; FD-V43's row cites its
    // cases in `invalid/`. Resolved against the row's own directory it does not exist; resolved
    // against any corpus directory it does — so this is the fixture where the wrong selection differs.
    apply: (spec) => editRow(spec, 'flow-definition.md', 'FD-V43', (l) => l.replace(
      '`FD-V43--value-from-outside-the-roots.flow.json`', '`value-from.flow.json`')),
  },
  {
    name: 'a bare citation with no full one before it naming a file in no corpus directory',
    check: 'C9',
    apply: (spec) => editRow(spec, 'flow-definition.md', 'FD-R3', (l) => l.replace(
      '`reference-past-a-map-arity.flow.json`', '`reference-past-a-map-arty.flow.json`')),
  },
  {
    name: 'the "until vN.N" marker removed, so a former name reads as a live citation',
    check: 'C9',
    // The exemption is load-bearing on the tree as shipped (W223's M3: the ONE unresolved span), so
    // the marker going is a citation of a file that does not exist.
    apply: (spec) => editRow(spec, 'flow-definition.md', 'FD-V40', (l) => l.replace(
      '(until v0.53 `FD-V40--gate-key-path-with-an-index.flow.json`', '(`FD-V40--gate-key-path-with-an-index.flow.json`')),
  },

  // --- C9's second pass — W223's two readers, every probe below a survivor or a construction ------
  {
    name: 'a bare citation misspelled in a rule row OUTSIDE flow-definition.md, and not an FD- row',
    check: 'C9',
    // Adequacy finding 1 (A1/A2): every probe above edits `flow-definition.md`, so C9 narrowed to
    // that file, or to `FD-` rows, survived. RN-R13 in `run-state.md` cites `p1-routed-away.flow.json`.
    apply: (spec) => editRow(spec, 'run-state.md', 'RN-R13', (l) => l.replace(
      '`p1-routed-away.flow.json`', '`p1-routed-awy.flow.json`')),
  },
  {
    name: 'a DIRECTORY citation in a rule row misspelled',
    check: 'C9',
    // Conformity NIT 2: RN-R2 cites `spec/examples/valid/`, which C9 did not read while its spans
    // had to end in `.json`.
    apply: (spec) => editRow(spec, 'run-state.md', 'RN-R2', (l) => l.replace(
      '`spec/examples/valid/`', '`spec/examples/vlaid/`')),
  },
  {
    name: 'a former name marked "since vN.N" rather than "until vN.N"',
    check: 'C9',
    // Adequacy finding 2 (A7b): the marker's WORD is part of the exemption; `since v0.53` before a
    // span is not the history of a rename, and the name it precedes must resolve.
    apply: (spec) => editRow(spec, 'flow-definition.md', 'FD-V40', (l) => l.replace(
      '(until v0.53 `FD-V40--gate-key-path-with-an-index.flow.json`', '(since v0.53 `FD-V40--gate-key-path-with-an-index.flow.json`')),
  },
  {
    name: 'a bare citation resolved against the NEAREST full one, not the first',
    check: 'C9',
    // Adequacy finding 3 (A5). Appended to FD-V43's row: a full `valid/` citation that resolves,
    // then a bare `invalid/` name. Against the nearest (`valid/`) it does not exist; against the
    // first (`invalid/`) it does — the wrong selection passes.
    apply: (spec) => editRow(spec, 'flow-definition.md', 'FD-V43', (l) => l.replace(
      '`FD-V43--a-needs-key-the-edge-does-not-declare.flow.json`',
      '`FD-V43--a-needs-key-the-edge-does-not-declare.flow.json`, `spec/examples/valid/value-from.flow.json`, ' +
      '`FD-V43--predicate-path-has-no-root.flow.json`')),
  },
  {
    name: 'a bare citation after registry.json resolved against the row`s flow directory, not registry.json`s',
    check: 'C9',
    // Adequacy finding 3 (A4): only a full `.flow.json` citation sets the row's directory. A stray
    // flow file is written beside `registry.json` and cited bare after it in FD-V31's row: against
    // `invalid/` (the row's flow directory) it does not exist; against `spec/examples/` it does.
    apply: (spec) => {
      writeFileSync(join(spec, 'examples', 'stray.flow.json'), '{}\n');
      editRow(spec, 'flow-definition.md', 'FD-V31', (l) => l.replace(
        '`spec/examples/registry.json`', '`spec/examples/registry.json`, `stray.flow.json`'));
    },
  },
  {
    name: 'a MISSING full citation still sets the row`s directory for the bare one after it',
    check: 'C9',
    // Adequacy finding 3 (A3), graded by the failure COUNT: FD-V43's full citation renamed to a file
    // that does not exist, and the bare citation after it to `value-from.flow.json` (a `valid/` file).
    // The directory is `invalid/` either way, so BOTH fail (2); a `dir` set only when the full file
    // exists falls back to every corpus directory, finds `valid/value-from.flow.json`, and reports 1.
    apply: (spec) => editRow(spec, 'flow-definition.md', 'FD-V43', (l) => l.replace(
      '`spec/examples/invalid/FD-V43--predicate-path-has-no-root.flow.json`',
      '`spec/examples/invalid/FD-V43--predicate-path-has-no-roots.flow.json`')
      .replace('`FD-V43--value-from-outside-the-roots.flow.json`', '`value-from.flow.json`')),
  },
  {
    name: 'a PARTIAL corpus path in a rule row, neither full nor bare',
    check: 'C9',
    // Adequacy finding 7: `invalid/X.flow.json` passed in silence. It is refused now as a spelling C9
    // cannot resolve, whether or not the file exists (this one does).
    apply: (spec) => editRow(spec, 'flow-definition.md', 'FD-V44', (l) => l.replace(
      '`spec/examples/invalid/FD-V44--predicate-op-outside-the-subset.flow.json`',
      '`invalid/FD-V44--predicate-op-outside-the-subset.flow.json`')),
  },
];

/**
 * **The ids a run reported under, read out of the run's own output.** There is no
 * allowlist, deliberately: W24's adequacy reader deleted nine tenths of
 * `check-source`'s for **0 cost**, because the ids no probe declares are exactly the
 * ones whose job is to catch a probe tripping a check it did **not** name. A failure
 * line is `  ${check}: ${msg}` by construction, so the ids are in the text and the
 * loop bound disappears rather than being guarded.
 */
const trippedIn = (out) => [...new Set([...out.matchAll(/^ {2}(C\d+): /gm)].map((m) => m[1]))].sort();

/**
 * **Did the mutated check RUN TO COMPLETION?** A grading requires this, which is how
 * a mutant that **crashed** is told apart from one that ran and stopped detecting.
 * Keyed on the TERMINAL line rather than on the report header — W28's readers
 * measured a header-keyed guard covering the checks and not the report or the exit
 * path, at a cost of 0.
 */
const RAN = (out) => /^(All checks passed|\d+ failure\(s\)\.)/m.test(out);

/** Floors, because `caught === PROBES.length` is vacuously true at zero. */
// 22 / 23 until W59, which added two of each and raised both to the counts it ships — Q102's
// ratchet, the obligation on the item that adds a probe. 29 / 28 until W223, which added C9's
// thirteen probes and thirteen META entries and raised both to the counts it ships (44 / 42).
const MIN_PROBES = 44;
const MIN_META = 42;

/**
 * **How many gradings may be backed by the CORPUS rather than by the probe they
 * name.** Zero, and it is measured rather than aspirational: all 21 mutants here are
 * inert on the untouched tree. See the check at the end of the META pass.
 */
const MAX_CORPUS = 0;

/**
 * **The one id this file does NOT grade, and the only thing here that is declared
 * rather than derived.** `C5` was lifted to `check-markdown.mjs` by W25 and is probed
 * and graded from `check-markdown-selftest.mjs`; `check-spec` is the caller. 19
 * `fail()` sites - `C5`'s 2 = **17**, which is the clause half of `MIN_META`.
 * `MIN_PROBES` is **18**: the seventeen one-per-site probes plus the co-firing probe
 * that makes `caught` reachable.
 *
 * **And the exclusion is bounded by EVIDENCE rather than by a cap**: an id may be
 * left out here only if some OTHER self-test declares a probe for it. Excluding `C1`
 * fails, because nothing else probes `C1`.
 */
const EXCLUDED = ['C5'];

/**
 * **The ids this file is responsible for grading, DERIVED from `check-spec.mjs` and
 * not declared here.** W30's adequacy reader found the declared version was the
 * outermost list and nothing bounded it: `const GRADED_IDS = []` cost **0**, and
 * emptying it together with `META` and its floor printed **`0/0 graded` at exit 0**
 * — every grading in the file gone, and green.
 *
 * **That falsified this file's own argument**, which said *"a bound whose authority is
 * the checked artefact rather than a declaration stops it where it is"*. The bound's
 * AUTHORITY was the artefact — `sites()` counts `fail()` calls in the real check —
 * and its SCOPE was a declaration, so the regress moved out exactly one list and
 * stopped at a literal with nothing beyond it. The fix is W24's on `ALL_CHECKS`: **do
 * not have the list.**
 *
 * Two independent projections of the same fact, cross-checked against each other:
 * the ids the report's `checks` array names, and the ids that appear as `fail()`
 * sites. Emptying either one is then a disagreement rather than a smaller universe.
 */
function gradedIds(src) {
  const arr = /const checks = \[([\s\S]*?)\];/.exec(src);
  const fromReport = arr
    ? [...new Set([...arr[1].matchAll(/'(C\d+) /g)].map((m) => m[1]))].sort()
    : [];
  const fromSites = [...new Set([...src.matchAll(/fail\('(C\d+)',/g)].map((m) => m[1]))].sort();
  return { fromReport, fromSites, ids: fromSites.filter((id) => !EXCLUDED.includes(id)) };
}

/**
 * **The mutations `check-spec.mjs` itself is run against**, each naming the ONE probe
 * it must break — W28's contract. Every probe above asserts that the check refuses a
 * broken input; **nothing above asserts that the probes notice a broken check.**
 *
 * Every clause mutation has the same shape and it is not style: `fail('Cx', …)`
 * becomes `[].push('Cx', …)`. It leaves the surrounding `if`/`else` chain and every
 * `continue` intact, so the mutant is **present but inert** rather than fatal — W28's
 * `P3 disabled` crashed because `if (…) fail(…)` was replaced by `if (false)` in a
 * chain whose next arm dereferenced what the first had guarded.
 */
const META = [
  ['C1`s parse clause disabled', 'an example that does not parse',
    (t) => t.replace("    fail('C1', `${rel(p)} does not parse", "    [].push('C1', `${rel(p)} does not parse")],

  ['C2`s PREFIX-MISSING clause disabled', 'a rules table declares a prefix RULE_PREFIXES does not carry',
    (t) => t.replace("      fail('C2', `${pre} is a rule-id prefix declared in spec/", "      [].push('C2', `${pre} is a rule-id prefix declared in spec/")],
  ['C2`s PREFIX-UNUSED clause disabled', 'every rule of a declared prefix removed, so RULE_PREFIXES carries an unused one',
    (t) => t.replace("      fail('C2', `RULE_PREFIXES carries ${pre}", "      [].push('C2', `RULE_PREFIXES carries ${pre}")],
  ['C2`s DECLARED-TWICE clause disabled', 'a rule id declared TWICE, in two documents',
    (t) => t.replace("  if (where.length > 1) fail('C2',", "  if (where.length > 1) [].push('C2',")],
  ['C2`s CITED-NEVER-DECLARED clause disabled', 'a rule id cited in prose and declared by no rules table',
    (t) => t.replace("  if (!declared.has(id)) fail('C2',", "  if (!declared.has(id)) [].push('C2',")],

  ['C3`s missing-directory clause disabled', 'spec/examples/invalid/ removed entirely',
    (t) => t.replace("  fail('C3', 'spec/examples/invalid/ does not exist');",
      "  [].push('C3', 'spec/examples/invalid/ does not exist');")],
  ['C3`s filename-shape clause disabled', 'a file in invalid/ that is not named <rule-id>--<slug>.flow.json',
    (t) => t.replace("      fail('C3', `spec/examples/invalid/${name} is not named",
      "      [].push('C3', `spec/examples/invalid/${name} is not named")],
  ['C3`s undeclared-rule clause disabled', 'an invalid example naming a rule id no rules table declares',
    (t) => t.replace("    if (!declared.has(m[1])) fail('C3',", "    if (!declared.has(m[1])) [].push('C3',")],

  ['C4`s uncovered-refusal clause disabled', 'a definition refusal whose only case is deleted',
    (t) => t.replace("  if (!covered.has(id)) fail('C4',", "  if (!covered.has(id)) [].push('C4',")],
  ['C4`s case-for-an-absent-rule clause disabled', 'a case for a rule declared DELIBERATELY ABSENT',
    (t) => t.replace("  if (absent.has(id)) fail('C4',", "  if (absent.has(id)) [].push('C4',")],
  // W65 (`d1`): the spec's own paragraph, the same reading one file over.
  ['C4`s spec-paragraph clause disabled', 'spec/flow-definition.md`s OWN version paragraph says a count the rows do not give',
    (t) => t.replace("      fail('C4', `spec/flow-definition.md's own version paragraph says", "      [].push('C4', `spec/flow-definition.md's own version paragraph says")],
  ['C4`s README-headline clause disabled', 'spec/README.md`s headline refusal count reverted while the version paragraph`s is right',
    (t) => t.replace("      fail('C4', `spec/README.md's headline says", "      [].push('C4', `spec/README.md's headline says")],

  ['C6 disabled', 'a non-FD-V rule whose declaring row has no "Test owed by" cell',
    (t) => t.replace("  if (!owner) fail('C6',", "  if (!owner) [].push('C6',")],

  ['C7`s missing-registry clause disabled', 'registry.json removed, so FD-V4 and FD-V32 cannot be evaluated at all',
    (t) => t.replace("  fail('C7', 'spec/examples/registry.json does not exist');",
      "  [].push('C7', 'spec/examples/registry.json does not exist');")],
  // **This entry names the CO-FIRING probe on purpose, and it is the only entry in
  // this file the id set cannot grade.** Against the single-fault type probe
  // it would report `disappeared` like the other sixteen; against a flow that trips
  // the type clause AND the predicate clause, disabling one leaves `C7`
  // reporting from the other, so the set is unchanged and the run is STILL CAUGHT.
  // *(W65: this disabled the `workerType` clause until v0.19 retired it; the unknown-TYPE
  // clause is the one the co-firing probe trips now, and this is that clause's ONE entry —
  // W59's entry for it against the typed flow was the same mutation, which this file refuses.)*
  // The failure COUNT is what moves — 2 -> 1 — and that is
  // [Q146](../doc/questions/q146.md)'s discriminator doing the whole of the work.
  ['C7`s unknown-type clause disabled, against the co-firing probe',
    'a valid flow naming an unknown type AND an unknown predicate — TWO C7 clauses under ONE id',
    (t) => t.replace("        fail('C7', `valid/${name}: type", "        [].push('C7', `valid/${name}: type")],
  ['C7`s unknown-predicate clause disabled', 'a valid flow naming a predicate the registry does not have',
    (t) => t.replace("          fail('C7', `valid/${name}: predicate", "          [].push('C7', `valid/${name}: predicate")],
  ['C7`s FD-V4 refusal-case clause disabled', 'FD-V4`s case naming only predicates the registry DOES have',
    (t) => t.replace("      if (!names.some(w => !preds.has(w))) fail('C7',",
      "      if (!names.some(w => !preds.has(w))) [].push('C7',")],
  // W65: the pool clauses, graded by their own probes; the unknown-type clause is graded above against
  // the co-firing probe (the workerType clause it replaced was).
  ['C7`s pool-instance clause disabled', 'a valid flow naming a POOL that is not an instance of its type',
    (t) => t.replace("      if (n.kind === 'task' && !poolOk(n))", "      if (false && n.kind === 'task' && !poolOk(n))")],
  ['C7`s FD-V38 refusal-case clause disabled', 'FD-V38`s case naming a pool that IS an instance of its type',
    (t) => t.replace("      if (!tasks.some(n => n.pool !== undefined && !poolOk(n))) fail('C7',",
      "      if (!tasks.some(n => n.pool !== undefined && !poolOk(n))) [].push('C7',")],
  // W59: the `FD-V32` case clause, graded by its own probe (its unknown-type entry is the co-firing one above since W65).
  ['C7`s FD-V32 refusal-case clause disabled', 'FD-V32`s case naming only node types the registry DOES have',
    (t) => t.replace("      if (!ty.some(t => !nts.has(t))) fail('C7',",
      "      if (!ty.some(t => !nts.has(t))) [].push('C7',")],
  ['C7`s unknown-language clause disabled', 'a valid flow naming a transform LANGUAGE the registry does not have',
    (t) => t.replace("        fail('C7', `valid/${name}: transform.lang", "        [].push('C7', `valid/${name}: transform.lang")],
  ['C7`s FD-V35 refusal-case clause disabled', 'FD-V35`s case naming only languages the registry DOES have',
    (t) => t.replace("      if (!ls.some(l => !langs.has(l))) fail('C7',",
      "      if (!ls.some(l => !langs.has(l))) [].push('C7',")],

  ['C8`s missing-Status clause disabled', 'a spec document with no "**Status:** vN.N" header',
    (t) => t.replace("    if (!own) { fail('C8',", "    if (!own) { [].push('C8',")],
  ['C8`s missing-index-row clause disabled', 'a document spec/README.md has no index row for',
    (t) => t.replace("    if (!row) { fail('C8',", "    if (!row) { [].push('C8',")],
  // **Anchored on the GUARD, not on the message** — W34. This was pinned to the
  // message text `` fail('C8', `spec/README.md lists ${base} as something other than ``
  // and went inert the moment that message was reworded, aborting with *"the
  // mutation matched nothing"*: rule 7 (b) firing correctly rather than passing,
  // and the third time in three items that a `scripts/**` probe pinned to a
  // literal has been broken by the item that changed the literal. The guard's
  // CONDITION is what the clause is, and it survives any rewording of what it says.
  ['C8`s version-disagreement clause disabled', 'a document whose own Status disagrees with the version README lists',
    (t) => t.replace("    if (!column.includes(`**${own[1]}**`))",
      "    if (false && !column.includes(`**${own[1]}**`))")],

  // --- C9 — W223: its ONE fail() site, and the four branches that decide what reaches it ----------
  // Every branch entry is inert on the tree as shipped (every span there resolves by either
  // reading), so a grading is the named probe's and never the corpus's — `MAX_CORPUS` holds it.
  ['C9`s fail() site disabled', 'W216 S1 — a renamed case`s OLD name restored in its row, unmarked as a former name',
    (t) => t.replace("        else fail('C9',", "        else [].push('C9',")],
  ['C9 reads every span as a former name', 'a full spec/examples citation in a rule row naming a file in the WRONG directory',
    (t) => t.replace('        if (FORMER.test(line.slice(0, m.index))) {', '        if (true || FORMER.test(line.slice(0, m.index))) {')],
  ['C9`s former-name marker read anywhere before the span rather than immediately before it',
    'W216 S1 — a renamed case`s OLD name restored in its row, unmarked as a former name',
    (t) => t.replace('  const FORMER = /until v\\d+\\.\\d+\\s*$/;', '  const FORMER = /until v\\d+\\.\\d+/;')],
  ['C9 resolves a bare citation after a full one against every corpus directory, not the row`s own',
    'a bare citation AFTER a full one naming a file that exists only in ANOTHER corpus directory',
    (t) => t.replace('        } else if (dir !== null) {', '        } else if (false && dir !== null) {')],
  ['C9 accepts a bare citation with no full one before it whatever it names',
    'a bare citation with no full one before it naming a file in no corpus directory',
    (t) => t.replace('          ok = CORPUS_DIRS.some(', '          ok = true || CORPUS_DIRS.some(')],
  // The second pass — each entry a survivor W223's adequacy reader measured (A-ids are its own).
  ['C9 reads FD- rows only (A1)', 'a bare citation misspelled in a rule row OUTSIDE flow-definition.md, and not an FD- row',
    (t) => t.replace('      const row = RULE_ROW.exec(line);\n      if (!row) continue;\n      let dir = null;',
      "      const row = RULE_ROW.exec(line);\n      if (!row || !row[1].startsWith('FD-')) continue;\n      let dir = null;")],
  ['C9 reads only spans ending .json, so a directory citation is unread',
    'a DIRECTORY citation in a rule row misspelled',
    (t) => t.replace('      for (const m of line.matchAll(/`([^`\\n]+)`/g)) {', '      for (const m of line.matchAll(/`([^`\\n]+\\.json)`/g)) {')],
  ['C9`s former-name marker without its word (A7b)', 'a former name marked "since vN.N" rather than "until vN.N"',
    (t) => t.replace('  const FORMER = /until v\\d+\\.\\d+\\s*$/;', '  const FORMER = /v\\d+\\.\\d+\\s*$/;')],
  ['C9`s row directory is the FIRST full citation, not the nearest (A5)', 'a bare citation resolved against the NEAREST full one, not the first',
    (t) => t.replace("          if (s.endsWith('.flow.json')) dir = dirname(where);", "          if (s.endsWith('.flow.json')) dir ??= dirname(where);")],
  ['C9`s row directory set by ANY full citation, registry.json included (A4)',
    'a bare citation after registry.json resolved against the row`s flow directory, not registry.json`s',
    (t) => t.replace("          if (s.endsWith('.flow.json')) dir = dirname(where);", '          dir = dirname(where);')],
  ['C9`s row directory set only when the full citation exists (A3)',
    'a MISSING full citation still sets the row`s directory for the bare one after it',
    (t) => t.replace("          if (s.endsWith('.flow.json')) dir = dirname(where);", "          if (ok && s.endsWith('.flow.json')) dir = dirname(where);")],
  ['C9`s partial-spelling fail() site disabled', 'a PARTIAL corpus path in a rule row, neither full nor bare',
    (t) => t.replace("          if (PARTIAL.test(s)) fail('C9',", "          if (PARTIAL.test(s)) [].push('C9',")],
  ['C9`s failure line no longer names the rule, the citation or the path (A9)',
    'W216 S1 — a renamed case`s OLD name restored in its row, unmarked as a former name',
    (t) => t.replace("        else fail('C9', `${row[1]}'s row in ${rel(p)} cites \\`${s}\\`, and ${rel(where)} does not exist`);",
      "        else fail('C9', 'a citation does not resolve');")],

  // --- the REPORT, which no set of check ids can see ----------------------------
  // A mutation to the report changes no failure id, so `tripped` is unmoved and only
  // the `agree` projection below fires. W24's conformity reader found this in
  // `check-source`: a list nothing counted.
  ['the whole checks array emptied, so the report says nothing at all',
    'a rule id declared TWICE, in two documents',
    (t) => t.replace(/const checks = \['C1[\s\S]*?\];/, 'const checks = [];')],
  ['the C7 row deleted from the report`s checks array',
    'a valid flow naming a type the registry does not have',
    (t) => t.replace("                'C7 valid corpus resolves against registry.json',\n", '')],

  // --- the exit path and the collector ------------------------------------------
  ['every failure swallowed', 'a non-FD-V rule whose declaring row has no "Test owed by" cell',
    (t) => t.replace('const fail = (check, msg) => failures.push(`${check}: ${msg}`);', 'const fail = () => {};')],
  ['the non-zero exit removed — every failure found, every failure printed, exit 0',
    'a definition refusal whose only case is deleted',
    (t) => t.replace('  process.exit(1);', '  process.exitCode = 0;')],
];

// --- small helpers the probes use ----------------------------------------------
const append = (p, text) => writeFileSync(p, readFileSync(p, 'utf8') + text);
const edit = (p, f) => {
  const before = readFileSync(p, 'utf8');
  writeFileSync(p, f(before));
};
/**
 * **ONE rule row of one spec document, edited by `f` — W223.** The row is FOUND without a
 * `.replace`, so the instrumented harness counts exactly `f`'s own call: a row that is not there
 * throws rather than passing, and an `f` that matches nothing is a miss. The DOCUMENT is a parameter
 * since the adequacy reader's finding 1: every C9 probe edited `flow-definition.md`, so narrowing C9
 * to that file (or to `FD-` rows) survived.
 */
const editRow = (spec, file, id, f) => {
  const p = join(spec, file);
  const lines = readFileSync(p, 'utf8').split('\n');
  const i = lines.findIndex((l) => l.startsWith(`| \`${id}\` |`));
  if (i < 0) throw new Error(`editRow: no rule row declares ${id}`);
  lines[i] = f(lines[i]);
  writeFileSync(p, lines.join('\n'));
};

/** Every file under `dir`, as repo-relative paths. */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/**
 * **Rule 7 (b), for a probe that edits a DIRECTORY.** The sibling self-tests compare
 * two strings; three probes here add or delete a file, which no string comparison
 * sees. A fingerprint over every path and every byte answers the same question — *did
 * this probe change its input* — for all three shapes at once.
 */
function fingerprint(dir) {
  const parts = walk(dir).sort().map((p) => `${relative(dir, p)}\u0000${readFileSync(p, 'utf8')}`);
  return parts.join('\u0001').split('')
    .reduce((h, c) => (Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0), 2166136261);
}

/**
 * **The mutated copy has to be able to find `check-markdown.mjs`.** `check-spec.mjs`
 * imports `resolveLinks` from a sibling in `scripts/` and a META copy lives in
 * `dev-dist/`, one directory below the root — which is where it must live, because
 * `check-spec.mjs` derives `ROOT` from its own location. So the specifier is
 * rewritten and the rewrite is ASSERTED: a silent miss would make every META entry a
 * `ran: no`, and *the mutant did not run* would be reported where *the import moved*
 * is the truth.
 */
/**
 * **The probes whose edits may legitimately match nothing, by NAME — W143, Q434.** One: it walks every
 * document in spec/ and blanks the `FD-C` citations of each, and most documents cite none, so its `/g`
 * replace misses once per such document by construction. Its OWN vacuity is still the fingerprint's, and
 * the GUARD CASE below shows the exemption is load-bearing — the same probe, renamed out of this list,
 * is refused for its misses. A name here that is not a probe is refused at the top of the run.
 */
const MISS_EXEMPT = ['every rule of a declared prefix removed, so RULE_PREFIXES carries an unused one'];

const RELOCATE_FROM = "from './check-markdown.mjs'";
const RELOCATE_TO = "from '../scripts/check-markdown.mjs'";

export async function selfTest(root) {
  // **The shared instrumented replace — W143, Q434.** Loaded by the ROOT rather than by `./`, because
  // a mutated copy of this file would not find a sibling (scripts/selftest-guards.mjs's header).
  const { applyMutation, missWhy } = await import(pathToFileURL(join(root, 'scripts', 'selftest-guards.mjs')).href);
  for (const n of MISS_EXEMPT) {
    if (!PROBES.some((p) => p.name === n)) {
      console.log(`  FAIL  MISS_EXEMPT names "${n}", which is no probe — an exemption for nothing is a typo waiting to exempt something else`);
      return 1;
    }
  }
  // **Per PROCESS, and removed on the way out including on the abort path — W105.** `dev-dist/` is one
  // flat namespace and this was a FIXED path inside it, `rmSync`d on entry, so a child running this same
  // function deleted its parent's fixtures and two top-level runs did the same to each other
  // ([Q182](../doc/questions/q182.md)). The `rmSync` stays, and is now load-bearing for a different
  // reason: Windows recycles pids, so a directory a killed run left can be inherited by a live one.
  // **`process.on('exit')` rather than a `finally`**, because this function returns from many places and
  // the one road none of their `rmSync` calls covers is a THROW — which is how W103's finding 3 left its
  // stub behind. `SIGKILL` leaks this one directory: *one path per killed run, not one per probe*.
  const dir = join(root, 'dev-dist', `spec-selftest-${process.pid}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  process.on('exit', () => rmSync(dir, { recursive: true, force: true }));
  // **The flat `.meta-*` mutants are registered too.** Each is written and removed per entry inside a
  // `finally`, so at most one is alive at a time and a kill leaks one FILE beside the one directory —
  // but a throw between the write and the `finally` used to leave it, and a leftover `.mjs` in
  // `dev-dist/` is W103's finding 3's exact shape.
  process.on('exit', () => { for (const p of metaMutants) rmSync(p, { force: true }); });
  const metaMutants = new Set();

  const script = process.env.CHECK_SPEC_SCRIPT ?? join(root, 'scripts', 'check-spec.mjs');
  // A `META` child runs against a deliberately broken check, so it must not grade
  // anything: it exists to answer *did the named probe notice*.
  const nested = !!process.env.CHECK_SPEC_SCRIPT;

  if (PROBES.length < MIN_PROBES || META.length < MIN_META) {
    console.log(`check-spec self-test — ${PROBES.length} probes (floor ${MIN_PROBES}), ` +
      `${META.length} meta (floor ${MIN_META}).`);
    console.log('  FAIL  a list is short, and `caught === length` is vacuous at zero.');
    rmSync(dir, { recursive: true, force: true });
    return 1;
  }

  // **`META` is bounded by CONTENT as well as by count, and it is not inherited on
  // faith — W30 MEASURED the hole in `check-source-selftest.mjs` first.** Replacing
  // one entry there with a duplicate of another reported `20/20 noticed` at exit 0,
  // floor satisfied, total unmoved, and `check-source`'s exit-path clause silently
  // ungraded. A floor counts entries; it cannot tell 21 distinct mutations from 20
  // plus a copy.
  //
  // Two bounds, both derived from the CHECK rather than declared here:
  //   1. the mutants are pairwise DISTINCT, and
  //   2. every id in `GRADED_IDS` loses at least one `fail()` site to some entry.
  // (2) is what a duplicate breaks even when it is textually distinct, and neither
  // can be satisfied by editing a number.
  {
    const src = readFileSync(join(root, 'scripts', 'check-spec.mjs'), 'utf8');
    const mutants = META.map(([, , m]) => { try { return m(src); } catch { return null; } });
    if (new Set(mutants).size !== META.length) {
      console.log(`check-spec self-test — ${META.length} meta entries, ` +
        `${new Set(mutants).size} distinct mutations.`);
      console.log('  FAIL  two META entries produce the SAME mutation, so one clause is graded twice ' +
        'and another not at all — a floor counts entries and cannot see this.');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
    const sites = (text, id) => (text.match(new RegExp(`fail\\('${id}',`, 'g')) ?? []).length;
    const { fromReport, fromSites, ids: graded } = gradedIds(src);
    // **The two projections must agree**, or the universe this bound runs over is
    // whatever survived an edit rather than what the check reports.
    if (fromReport.join(',') !== fromSites.join(',')) {
      console.log('check-spec self-test — the report names [' + fromReport.join(',') +
        '] and the fail() sites are [' + fromSites.join(',') + '].');
      console.log('  FAIL  the two projections of the check ids disagree, so the ' +
        'set this bound runs over is an artefact of an edit rather than the vocabulary the check reports.');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
    // **And an exclusion has to be earned**: some other self-test must declare a probe
    // for the id being left out. `C5` is probed at `check: 'C5'` in
    // `check-markdown-selftest.mjs`; excluding anything else fails here.
    const elsewhere = readFileSync(join(root, 'scripts', 'check-markdown-selftest.mjs'), 'utf8');
    const unearned = EXCLUDED.filter((id) => !elsewhere.includes(`check: '${id}'`));
    if (unearned.length) {
      console.log(`check-spec self-test — ${unearned.join(', ')} is excluded from grading and no ` +
        'other self-test probes it.');
      console.log('  FAIL  an exclusion is only honest while something else covers the id; this one ' +
        'is a hole with a name.');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
    const uncovered = graded.filter((id) =>
      !mutants.some((m) => m !== null && sites(m, id) < sites(src, id)));
    if (uncovered.length) {
      console.log(`check-spec self-test — no META entry disables any ${uncovered.join(', ')} clause.`);
      console.log('  FAIL  a check id with no grading at all; the count of entries says nothing about ' +
        'which clauses they reach.');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
  }

  // --- the fixture --------------------------------------------------------------
  // `doc/` once; `spec/` refreshed before every probe, so a probe that deletes a file
  // cannot leak into the next one.
  cpSync(join(root, 'doc'), join(dir, 'doc'), { recursive: true });
  const specDir = join(dir, 'spec');
  const relSpec = relative(root, specDir).replace(/\\/g, '/');
  const freshSpec = () => {
    rmSync(specDir, { recursive: true, force: true });
    cpSync(join(root, 'spec'), specDir, { recursive: true });
  };

  /** One probe, run once, shared by the main pass and by single-probe mode. */
  const runOne = (probe) => {
    const declared = [probe.check, ...(probe.also ?? [])].sort();
    freshSpec();
    const before = fingerprint(specDir);
    const { misses } = applyMutation(probe.apply, specDir);
    if (fingerprint(specDir) === before) {
      return { vacuous: true, refused: false, ran: false, declared, tripped: [], agree: true,
        msg: 'the mutation matched nothing — the fixture is byte-identical after apply()' };
    }
    // **And EVERY edit of it matched** (W143, Q434) — a compound whose second edit lands nowhere still
    // changes the fixture, so the fingerprint above passes it. **One probe is exempt, by NAME** — see
    // `MISS_EXEMPT`: it rewrites every document in spec/ and most of them carry nothing it removes.
    if (misses > 0 && !MISS_EXEMPT.includes(probe.name)) {
      return { vacuous: true, refused: false, ran: false, declared, tripped: [], agree: true, msg: missWhy(misses) };
    }
    // **And the exemption is BOUNDED: at least one document must be hit** — the reader's finding 10. The
    // exempt probe makes one `replace` per document, so a miss in EVERY document is its citation edit gone
    // entirely, which the fingerprint cannot see while its row removal (by `split`/`join`) still lands.
    if (MISS_EXEMPT.includes(probe.name) && misses >= readdirSync(specDir).filter((f) => f.endsWith('.md')).length) {
      return { vacuous: true, refused: false, ran: false, declared, tripped: [], agree: true,
        msg: `${missWhy(misses)} — in every document, which the exemption does not cover` };
    }
    const r = spawnSync(process.execPath, [script], {
      cwd: root, encoding: 'utf8', timeout: 300_000,
      env: { ...process.env, CHECK_SPEC_DIR: relSpec },
    });
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
    const tripped = trippedIn(out);
    // **The per-check REPORT ROWS, a second and independent projection of the same
    // fact.** A mutation to the report changes no failure id, so no set comparison
    // can see it; requiring the two projections to agree is what makes the report a
    // thing something counts. `check-spec` has exactly two row verdicts — `ok` and
    // `FAIL` — and no `NOT RUN`, which is why there is no third projection here and
    // why this file says so rather than copying `check-scheduler`'s.
    const rows = [...out.matchAll(/^ {2}(ok {2}|FAIL) {2}(C\d+) /gm)]
      .filter((m) => m[1] === 'FAIL').map((m) => m[2]).sort();
    const agree = rows.join(',') === tripped.join(',');
    // **A probe may also declare the failure LINE it must produce — W223** (its adequacy reader's
    // finding 4): C9's Outputs promise a message naming the rule, the citation and the resolved path,
    // and an id set cannot see a message. Only a probe carrying `expect` is held to one.
    const worded = !probe.expect || probe.expect.test(out);
    const refused = r.status !== 0 && tripped.join(',') === declared.join(',') && agree && worded;
    return {
      vacuous: false, refused, ran: RAN(out), declared, tripped, agree, worded, status: r.status,
      failures: (out.match(/^ {2}C\d+: /gm) ?? []).length,
      msg: `exited ${r.status}, wanted [${declared.join(',')}], got [${tripped.join(',')}]` +
        `${agree ? '' : `, report rows said [${rows.join(',')}]`}` +
        `${worded ? '' : `, and no failure line matched ${probe.expect}`}`,
    };
  };

  /**
   * **Is the mutated check INERT on the untouched tree?** Rule 8 asks for a mutation
   * that is *present but inert*. A mutant that fails on the repository's own `spec/`
   * is still NOTICED — by the corpus, more strongly than by any probe — but its probe
   * verdict is meaningless, because every id it reports may be noise.
   */
  const inertOnCleanTree = () =>
    spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', timeout: 300_000 }).status === 0;

  // --- single-probe mode: the META pass names ONE probe and this runs that one ----
  const only = process.env.CHECK_SPEC_PROBE;
  if (only !== undefined) {
    const i = PROBES.findIndex((p) => p.name === only);
    // Aborts rather than passing or skipping. A renamed probe leaves its META entry
    // pointing at nothing, and reading that as "no probe failed, so the check must
    // still be checking" is exactly backwards.
    if (i < 0) { console.log(`  ABORT  no probe is named "${only}"`); rmSync(dir, { recursive: true, force: true }); return 3; }
    const inert = inertOnCleanTree();
    console.log(`  inert: ${inert ? 'yes' : 'no'}`);
    if (!inert) {
      console.log('  outcome: corpus');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
    const v = runOne(PROBES[i]);
    const missing = v.declared.filter((id) => !v.tripped.includes(id));
    // **`disappeared` is tested BEFORE `exit0`, and the two siblings test them the
    // other way round.** Measured on this file's first run: **16 of 21** entries came
    // back `exit0`, because disabling the only clause that reports leaves nothing to
    // report and `check-spec` then exits 0. So `exit0` — whose meaning in
    // `check-source-selftest.mjs` is *the right ids were found and the exit path
    // lied* — was being printed for *no id was found at all*, and the one entry that
    // really is about the exit path was indistinguishable from sixteen that are not.
    //
    // Both verdicts pass, so **no grading changes and only the reported reason
    // does** — which is [Q147](../doc/questions/q147.md) exactly: an entry passing
    // for a reason it does not name. Asking *did the declared ids disappear* first
    // gives 17 `disappeared`, 2 `disagreed`, 1 `caught`-by-count and **one**
    // `exit0`. The same conflation is live in `check-source-selftest.mjs` and
    // `check-markdown-selftest.mjs` and is NOT swept here.
    const outcome = v.vacuous ? 'vacuous'
      : v.refused ? 'caught'
        : !v.agree ? 'disagreed'
          : missing.length ? 'disappeared'
            : !v.worded ? 'misworded'
            : v.status === 0 ? 'exit0'
              : v.tripped.length > v.declared.length ? 'noisy' : 'other';
    console.log(`  ran: ${v.ran ? 'yes' : 'no'}`);
    console.log(`  outcome: ${outcome}`);
    console.log(`  failures: ${v.failures ?? 0}`);
    console.log(`  ${v.refused ? 'ok  ' : 'FAIL'}  ${PROBES[i].check}  ${PROBES[i].name}` +
      (v.refused ? '' : `  — ${v.msg}`));
    rmSync(dir, { recursive: true, force: true });
    return v.refused ? 0 : 1;
  }

  console.log(`check-spec self-test — ${PROBES.length} probes\n`);
  let caught = 0;
  for (const probe of PROBES) {
    const v = runOne(probe);
    if (v.refused) caught++;
    console.log(`  ${v.refused ? 'ok  ' : 'FAIL'}  ${probe.check}  ${probe.name}` +
      (v.refused ? '' : `  — ${v.msg}`));
    // Once a probe has gone uncaught in a nested child the answer is settled and the
    // remaining spawns are waste.
    if (nested && !v.refused) break;
  }
  console.log(`\n${caught}/${PROBES.length} probes caught.`);
  if (caught !== PROBES.length) { rmSync(dir, { recursive: true, force: true }); return 1; }
  if (nested) { rmSync(dir, { recursive: true, force: true }); return 0; }

  // --- the META pass: does this suite NOTICE a broken check? ---------------------
  const checkSource = readFileSync(join(root, 'scripts', 'check-spec.mjs'), 'utf8');
  let noticed = 0, byCorpus = 0, byCount = 0;
  console.log(`\nand against a broken check — ${META.length} mutations of check-spec.mjs itself\n`);
  /** The control's mutation: it changes nothing, and `gradeMeta` skips the text guards for it alone. */
  const IDENTITY = (t) => t;
  /**
   * **One META entry, graded — a function since W143** so the control and the guard cases below go
   * through the SAME path as every entry. Returns `{ ok, why, kind, outcome }`.
   */
  const gradeMeta = (i, [name, probeName, mutate], source = checkSource) => {
    // **Instrumented — W143, Q434.** Only this FIRST application: the two guards below re-apply the
    // mutation where it must NOT match, and counting those would count their success as a miss.
    const { out: broken, misses } = applyMutation(mutate, source);
    let why = '', ok = false, kind = 'probe', outcome;
    if (broken === source && mutate !== IDENTITY) return { ok, why: ' — the mutation matched nothing', kind };
    if (misses > 0) return { ok, why: ` — ${missWhy(misses)}`, kind };
    // **And it must have matched exactly ONCE.** `String.replace` takes the first of
    // several silently, so an ambiguous anchor lands somewhere the entry did not
    // name. Applying the mutation to its own output answers it: a second occurrence
    // is replaced on the second pass and the two results differ.
    if (mutate !== IDENTITY && mutate(broken) !== broken) {
      return { ok, kind, why: ' — the mutation matched MORE THAN ONCE, so it landed ' +
        'on the first of several and the entry does not say which' };
    }
    // **And it must not be GLOBAL, which the check above cannot see** — a `/…/g`
    // anchor edits every match on the first pass and then changes nothing on the
    // second, satisfying the double-apply guard while disabling a SET of clauses and
    // naming one. **Measured live in `check-source-selftest.mjs` by W30**: swapping
    // one entry's anchor for `/fail\('S12',/g` disabled all FIVE `S12` sites and the
    // file still reported `20/20 noticed`. Applying the mutation to the source
    // concatenated with itself separates them.
    if (mutate !== IDENTITY && !mutate(source + source).endsWith(source)) {
      return { ok, kind, why: ' — the mutation is GLOBAL: it edits every match rather ' +
        'than the one this entry names, so its verdict is about a set of clauses and not a clause' };
    }
    if (!broken.includes(RELOCATE_TO) && !broken.includes(RELOCATE_FROM)) {
      return { ok, kind, why: ' — the mutant no longer carries the check-markdown import ' +
        'this harness relocates, so the copy could not run for a reason that has nothing to do ' +
        'with the clause' };
    }
    // **FLAT, with the pid in the NAME — and a rung is what corrected this, W105.** A `.meta-*` mutant
    // is a copy of the CHECK, which derives `ROOT = resolve(dirname(self), '..')`, so it must sit
    // exactly one directory below the repository root; W105 first nested it beside the fixtures on the
    // reasoning that a mutant is depth-free, and that is true only of a `.self-*` mutant, which is a copy
    // of this SELFTEST module and receives `ROOT` as a parameter. Nested, the copy reads `dev-dist/` as
    // its tree: `check:spec:selftest` reported **29/29 graded, 0 by the named probe, 29 by the corpus**,
    // which is this file's own *the harness broke rather than the check* clause firing exactly as written.
    const path = join(root, 'dev-dist', `.meta-spec-${process.pid}-${i < 0 ? 'control' : String(i).padStart(2, '0')}.mjs`);
    metaMutants.add(path);
    writeFileSync(path, broken.replace(RELOCATE_FROM, RELOCATE_TO));
    try {
      const r = spawnSync(process.execPath, [join(root, 'scripts', 'check-spec.mjs'), '--self-test'],
        { cwd: root, encoding: 'utf8', timeout: 900_000,
          env: { ...process.env, CHECK_SPEC_SCRIPT: path, CHECK_SPEC_PROBE: probeName } });
      const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
      const ran = /^ {2}ran: yes$/m.test(out);
      outcome = (out.match(/^ {2}outcome: (\w+)$/m) ?? [, ''])[1];
      if (r.status === 3) why = ` — ${out.trim().split('\n').pop()}`;
      else if (outcome === 'corpus') { ok = true; kind = 'corpus'; why = ' (by the corpus: the mutant is not inert)'; }
      else if (!ran) why = ' — the mutant did not run: this is a crash, not a detection';
      // **`caught` is not terminal — it asks one more question.** The id SET being
      // unchanged does not mean nothing changed: two clauses can report one id, and
      // then disabling either leaves the set alone and moves the COUNT.
      // [Q146](../doc/questions/q146.md), and it is live machinery here rather than
      // inherited decoration — **`C7` has five `fail()` sites under one id, `C3` and
      // `C8` three each, `C2` and `C4` two** — so this file is where a sibling
      // reporting the same id is most likely, not least.
      else if (outcome === 'caught') {
        const base = spawnSync(process.execPath, [join(root, 'scripts', 'check-spec.mjs'), '--self-test'],
          { cwd: root, encoding: 'utf8', timeout: 900_000,
            env: { ...process.env, CHECK_SPEC_SCRIPT: join(root, 'scripts', 'check-spec.mjs'),
              CHECK_SPEC_PROBE: probeName } });
        const bOut = `${base.stdout ?? ''}${base.stderr ?? ''}`;
        const bN = Number((bOut.match(/^ {2}failures: (\d+)$/m) ?? [, NaN])[1]);
        const mN = Number((out.match(/^ {2}failures: (\d+)$/m) ?? [, NaN])[1]);
        if (!Number.isFinite(bN) || !Number.isFinite(mN)) {
          why = ' — the baseline run reported no failure count, so `caught` cannot be resolved';
        } else if (bN > mN) { ok = true; kind = 'count'; why = ` (by the COUNT: ${bN} -> ${mN}; the id set never moved)`; }
        else {
          why = ` — "${probeName}" is STILL CAUGHT against a check that does not check, and the ` +
            `failure count did not move either (${bN} -> ${mN})`;
        }
      }
      else if (outcome === 'noisy') why = ` — "${probeName}" still reports every id it declared; the mutant only got NOISIER, which is not a detection`;
      else if (['disappeared', 'disagreed', 'misworded', 'exit0'].includes(outcome)) ok = true;
      else why = ` — the child reported outcome "${outcome || '(none)'}", which grades nothing`;
    } finally { rmSync(path, { force: true }); }
    return { ok, why, kind, outcome };
  };

  // **The CONTROL for this pass — W143, Q437.** An UNMUTATED copy of the check, relocated and driven
  // through the same `gradeMeta` every entry takes, naming `META[0]`'s probe. Nothing is broken, so the
  // probe must still catch what it declares (`outcome: caught`) and the entry must NOT be graded noticed.
  // A copy that cannot run against the check — W30's dropped `RELOCATE`, W105's wrong depth — comes back
  // noticed, which is how a pass grades every mutation of a check it never ran against. **Removing this
  // block is visible**: `control` is read by the verdict at the end of this function.
  /** **What it means for the control to HOLD**, one expression for the control and for its own case below. */
  const controlHolds = (g) => !g.ok && g.outcome === 'caught';
  const control = gradeMeta(-1, ['the control: an UNMUTATED copy', META[0][1], IDENTITY]);
  if (!controlHolds(control)) {
    console.log(`  FAIL  the control: an UNMUTATED copy of check-spec.mjs is graded ` +
      `${control.ok ? 'NOTICED' : 'not caught'} (outcome "${control.outcome ?? '(none)'}"${control.why}). Nothing ` +
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
    // Q536: a mutation INERT on the clean tree and FATAL under its probe. With the `!== undefined`
    // guard gone, a pool the registry does not have is dereferenced: under *a POOL that is not an
    // instance of its type* the flow names `nope` and `.type` throws before the report line, so the
    // child prints `ran: no`; on the real corpus every named pool exists and the mutant passes.
    ['a mutant inert on the clean tree and FATAL under its probe — the `ran:` case, Q536',
      ['the pool lookup made to throw on a pool the registry lacks', 'a valid flow naming a POOL that is not an instance of its type',
        (t) => t.replace('(pools[n.pool] !== undefined && pools[n.pool].type === n.type)', '(pools[n.pool].type === n.type)')],
      'the mutant did not run'],
  ];
  for (const [label, entry, must] of cases) {
    const g = gradeMeta(META.length, entry);
    if (g.ok || !g.why.includes(must)) {
      console.log(`  FAIL  GUARD CASE ${label} — wanted a FAIL naming "${must}", got ` +
        `${g.ok ? 'ok' : 'FAIL'}${g.why}`);
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
    console.log(`  ok    GUARD CASE ${label}`);
  }
  // Q434 in the PROBES pass, and the one exemption shown load-bearing: the exempt probe, renamed out of
  // `MISS_EXEMPT`, is refused for its misses; and `META[0]`'s probe with a dead second edit is refused
  // too. Each returns before it spawns anything.
  {
    const exempt = PROBES.find((p) => p.name === MISS_EXEMPT[0]);
    const firstEdit = PROBES.find((p) => p.name === 'a valid flow naming a POOL that is not an instance of its type');
    const pcases = [
      ['the miss-exempt probe, renamed out of MISS_EXEMPT, is refused for its misses — Q434',
        { ...exempt, name: `${exempt.name} (renamed)` }],
      ['a compound PROBE whose second edit matches nothing — Q434',
        { ...firstEdit, apply: (spec) => edit(join(spec, 'examples', 'valid', 'pooled.flow.json'),
          (t) => t.replace('"pool": "scorer-fast"', '"pool": "nope"').replace('\u0000W143: no such anchor', '')) }],
    ];
    for (const [label, p] of pcases) {
      const v = runOne(p);
      if (!v.vacuous || !v.msg.includes('matched NOTHING')) {
        console.log(`  FAIL  GUARD CASE ${label} — wanted a vacuous verdict naming "matched NOTHING", got ` +
          `${v.vacuous ? 'vacuous' : 'graded'}: ${v.msg}`);
        rmSync(dir, { recursive: true, force: true });
        return 1;
      }
      console.log(`  ok    GUARD CASE ${label}`);
    }
  }
  console.log('');

  for (const [i, entry] of META.entries()) {
    const { ok, why, kind } = gradeMeta(i, entry);
    if (ok) {
      noticed++;
      if (kind === 'corpus') byCorpus++;
      if (kind === 'count') byCount++;
    }
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${entry[0]}${ok ? '' : why}`);
  }
  rmSync(dir, { recursive: true, force: true });
  const parts = [];
  if (byCount) parts.push(`${byCount} by the failure COUNT, which the id set cannot see`);
  if (byCorpus) parts.push(`${byCorpus} by the corpus`);
  console.log(`\n${noticed}/${META.length} graded` +
    (parts.length ? ` — ${noticed - byCorpus - byCount} noticed by the named probe, ${parts.join(', ')}.` : '.'));
  // **`corpus` is a PASS, so a harness bug that makes every mutant crash reads as
  // full coverage — and W30's own rule 8 set produced exactly that.** Dropping the
  // `RELOCATE` rewrite leaves every META copy unable to resolve `check-markdown.mjs`;
  // all 21 mutants then fail on the clean tree, all 21 grade `corpus`, and the file
  // exits **0** with the summary line reading *"0 noticed by the named probe, 21 by
  // the corpus"*. True, and nobody reads a summary line in a green run.
  //
  // **Every entry here is inert on the clean tree — measured, all 21 — so this file
  // declares that NONE of its gradings may be corpus-backed.** `check-markdown`
  // legitimately has six that cannot be made inert; this has none, so the bound is
  // zero rather than a floor. [Q145](../doc/questions/q145.md)'s verdict *"global
  // noise passes as `corpus`"* is right about a clause that cannot be made inert and
  // says nothing about a harness that broke.
  if (byCorpus > MAX_CORPUS) {
    console.log(`  FAIL  ${byCorpus} grading(s) were backed by the CORPUS rather than by the probe ` +
      `each entry names, and this file declares ${MAX_CORPUS}. A mutant that is not inert says ` +
      'nothing about the probe; if the whole list is corpus-backed, the harness broke rather ' +
      'than the check.');
    return 1;
  }
  return noticed === META.length && controlHolds(control) ? 0 : 1;
}
