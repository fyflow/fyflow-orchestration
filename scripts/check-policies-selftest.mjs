// **The negative tests for `check-policies.mjs`, checked in rather than run once
// by hand** — `doc/workflow.md` v0.5 section 5 rule 7, all three requirements.
//
//   node scripts/check-policies.mjs --self-test
//
// **This is rule 7 (c)'s first outing**, which P4's retro recorded as unexercised
// and P5 was carrying for a third plan: every probe below declares the **full
// set** of checks it must trip, and the set must match exactly. Naming one does
// not discriminate — P3's retro measured that a merely *malformed* probe trips two
// checks at once and so satisfies a probe declared as either.
//
// **Nine of the ten trip exactly one check and the tenth declares its cascade**,
// which is the ratio P3's retro measured for `check-docs` (eleven of twelve) and
// the reason the stronger form costs almost nothing. The cascade is structural:
// a name in `POLICIES` that the spec does not fix can only be introduced by
// pointing at some existing policy object, whose own `id` is then not that key,
// so P1 and P2 are both true of it.
//
// Each probe breaks ONE half — the spec or the source — and asserts the mutation
// changed its input, so a probe that matches nothing fails loudly rather than
// passing for the wrong reason.
//
// **Three of these ten failed on their first run and the rule paid for itself
// before it shipped:** two were holes in the check (an empty id cell parsed as a
// name; a set comparison still running on a half nobody could parse) and one was
// a probe that edited a heading the section regex did not care about, so nothing
// broke and nothing was reported. All three are recorded where they happened.

// **WHERE THIS STOPS, measured rather than assumed.** A harness that grades
// itself can always be told to return zero, and every guard added here has the
// same hole one level up.
//
// **W31 RE-MEASURED THIS LIST AND TWO OF ITS FOUR ROWS WERE WRONG.** The list was
// written at W16, before W28's named-probe contract and before the `SELF` list
// below existed, and nothing re-ran it. What it said, and what one mutation at a
// time says now:
//
//   `return noticed === META.length ? 0 : 1` -> `return 0`      SURVIVES — unchanged
//   `if (!meta) ... return 0` -> `if (true)`                    SURVIVES — unchanged
//   `MIN_PROBES = 10` -> `0`                                    the literal is 13,
//                                                               and the compound case
//                                                               is now REFUSED
//   the "mutation matched nothing" guard -> `if (false)`        SURVIVES — unchanged
//
// **The first two really are the fixed point and W31 argued otherwise before it
// measured.** This paragraph briefly read *"`if (!meta) -> if (true)` is CAUGHT by
// SELF — a list one level out is exactly what closes it"*, on the reasoning that a
// `SELF` entry grades the child's exit code from outside. **It survives**: the
// mutation is applied to the PARENT as well, so the parent returns 0 after its own
// probe pass and the `SELF` pass never runs. *A list one level out closes nothing
// that short-circuits before it.* The original sentence was right and its argument
// is now stated rather than asserted.
//
// **The third row was stale twice over.** `MIN_PROBES` is **13**, not 10 — it rose
// with the probe list and the comment did not. And its second-order argument
// (*"lowering the floor is only dangerous together with shortening the list, and
// shortening the list is caught"*) is right for a reason it does not give:
// `MIN_PROBES -> 0` **together with** `PROBES` emptied is refused because every
// META entry then names a probe that is gone and **ABORTS**, which is W28's
// contract rather than the floor.
//
// **What is live now, re-measured by W31 one mutation at a time, THEN CORRECTED BY
// BOTH READERS — and it is shorter than the one it replaces in the places the
// `SELF` entries reach.** `MIN_META -> 0`, alone and together with a shortened
// `META`; `MAX_WIDE -> 99`, which W30 recorded as SURVIVING in `check-source`; and
// **the `META` verdict itself** — all three cost 0 before this item and are REFUSED
// now. **That last one was on this list as *the fixed point* and it is not**: the
// verdict is `if (noticed !== META.length) return 1;` and disabling it costs **4**,
// because four `SELF` entries need the child's META pass to reach its own verdict.
// The row quoted a literal the file no longer contains (the pre-W31 ternary) and
// classed the live form from it. **A ceiling row inherited through a refactor is a
// claim about a file that no longer exists.**
//
// **Four more rows left this list after the readers, and each names the mechanism
// that removed it.** `MIN_PROBES -> 0` alone, and its DISJUNCT: both refused once the
// `SELF` entry that deletes a probe was retargeted at one **no `META` entry names** —
// before that the child went red because a grading ABORTED, not because the floor
// fired. **The PROBE-PASS verdict** (`caught !== PROBES.length`), which this list
// never carried at all and which cost 0: it is the verdict the thirteen probes exist
// to produce, and it is what makes rule 7 (b) load-bearing. And **the inertness run**,
// the only producer of `corpus`, which cost 0 until its entry was made to disable its
// own probe's clause as well. **All four were found by W31's adequacy reader, none
// was reachable by breaking a VALUE, and three of the four are the same shape — an
// entry written to a LIST when the thing it had to bound was a GUARD.**
//
// **And `ALL_CHECKS` left it by being DERIVED rather than bounded** — see the guard
// block. That is the one cross-count in this file, and it is the answer to the
// sub-question W28's adequacy reader named and could not instantiate anywhere:
// *does anything COUNT a list from a source other than itself?* Everything else here
// counts itself, and every floor is a bare literal.
//
//   `return bounded === SELF.length ? 0 : 1` -> `return 0`      THE fixed point, and
//                                                               now the only one:
//                                                               the outermost verdict
//   `if (!meta) -> if (true)`, `if (nestedSelf) -> if (true)`   short-circuit before
//                                                               the list that would
//                                                               catch them
//   both "mutation matched nothing" guards -> `if (false)`      rule 7 (b)'s level.
//                                                               Genuinely redundant:
//                                                               a no-op mutation is
//                                                               caught downstream by
//                                                               the verdict anyway
//   `MIN_SELF -> 0`, alone and with `SELF` emptied              second-order, and the
//                                                               outermost list
//   the SELF distinctness bound -> `if (false)`                 it FIRES on a
//                                                               duplicate entry
//                                                               (measured: exit 1,
//                                                               `13 distinct` of 14)
//                                                               and nothing SHIPPED
//                                                               provokes it — see the
//                                                               note below, which is
//                                                               the same correction
//                                                               as `SELF_RAN`'s
//   `SELF_RAN` -> `() => true`                                  provenance, and **it
//                                                               IS reachable** — see
//                                                               below. Nothing
//                                                               shipped provokes it
//   the SELF control run -> `if (false)`                        defence in depth; it
//                                                               fires only when the
//                                                               harness is broken,
//                                                               which is a positive
//                                                               test rather than a
//                                                               probe — measured
//                                                               below
//   `caught++` forced unconditional                             the child's own
//                                                               projection. `RAN` is
//                                                               REFUSED, by the
//                                                               `ran:` entry
//   `tripped` re-sourced from the failure LINES to the report   0, and it is
//   rows                                                        [Q147](../doc/open-questions.md)'s
//                                                               shape: the entries
//                                                               then pass for a
//                                                               reason they do not
//                                                               name. W30 found the
//                                                               same in `check-spec`
//                                                               and it is live in
//                                                               `check-source` and
//                                                               `check-markdown` too
//   the distinctness bound read from `script` not the real check behaviour-preserving
//                                                               here: the guard block
//                                                               is unreachable from
//                                                               single-probe mode, so
//                                                               `script` is always the
//                                                               real check where it
//                                                               runs. W30's hazard
//                                                               cannot arise
//
// **TWO ROWS ABOVE ARE REACHABLE AND ONLY UNPROVOKED BY A SHIPPED ENTRY, and the
// distinction cost this file an argument it had written down as a fact.** The list
// said `SELF_RAN` was *"unprovocable by construction: it is what REJECTS a bad
// entry, and every entry here is good"*, and said the same of the `SELF` distinctness
// bound. **W31's two readers disagreed about this and both were right about
// different questions.** Constructed and measured: a fourteenth `SELF` entry whose
// mutation appends `((( ;` to a declaration — deliberately making this file a syntax
// error — is refused at **13/14 bounded, exit 1**, *"the child never got as far as
// running: a broken file, not a fired floor"*; with `SELF_RAN` dropped from
// `graded()` the same entry reports **14/14, exit 0**. So the guard is reachable and
// load-bearing. **And it cannot be a shipped entry**, because an entry that provokes
// it is an entry whose child cannot run, which grades FAIL — so the file would ship
// red. *Reachable, demonstrated, unshippable* is a third category, and this file now
// has three of them: this, the `ran:` guard's own case, and the control run.
//
//   the ABORT and STILL-CAUGHT branches -> `if (false)`         **and these two are
//                                                               a different kind —
//                                                               see below**
//
// **The ABORT and STILL-CAUGHT branches are MESSAGE-ONLY and no `SELF` entry can
// make them load-bearing.** Both assign `why` and neither touches `ok`, which is
// set true only by the `disappeared`/`exit0`/`corpus` arm — so disabling either
// leaves every verdict in this file unchanged and costs **0 with the `SELF` list
// in place**, exactly as it did without one. W28's adequacy reader measured all
// three of its verdicts at 0 and this item was declared to take them to non-zero;
// **two of the three cannot go to non-zero and that is a property of the design
// rather than of the list.** Only the `ran:` guard changes a verdict, and the
// `SELF` entry for it fires. W28's own Record reached half of this from the other
// side — *"two verdicts and a message, and the message is the product"*.
//
// **A `SELF` child here is loaded by a GENERATED RUNNER, and that WAS an `Owns`
// boundary rather than a preference.** `check-source.mjs` reads
// `CHECK_SOURCE_SELFTEST` and imports the copy it names; `check-policies.mjs`
// imported this file by a hard relative path with no env indirection, and W31 did
// not own it. So the indirection lives here — see `RUNNER`.
//
// **[W38](../doc/work-items/w38-the-dispatch-nothing-binds.md) removed the reason and
// left the mechanism.** `check-policies.mjs` now reads `CHECK_POLICIES_SELFTEST` like
// the other five, so `RUNNER` is no longer the only way in — and it is the SAME
// variable this file already used for the same meaning, *the self-test module to
// load*, which is why the two mechanisms compose rather than collide. `RUNNER` is
// left standing: it is W31's, thirteen probes and fourteen `SELF` entries rest on it,
// and replacing it is not W38's to do. Its stated REASON is what was corrected here.
//
// **This paragraph first said the difference cost nothing, and the twelfth `SELF`
// entry falsified it on the first run.** What it said: *"a `SELF` mutation reaches
// the PARENT's machinery and not the single-probe machinery a META grandchild
// re-imports from the real file — no entry below needs it, because a mutation of
// single-probe mode makes gradings PASS and `SELF` grades on the child going RED."*
// The reasoning was about **single-probe machinery** and the gap is about **the
// LISTS**: with `PROBES` emptied and `MIN_PROBES` lowered, the child had no probes
// at all and still reported **`6/6 noticed` at exit 0**, because the grandchild
// found every named probe in the unmutated original. **A claim about what a
// mechanism cannot reach, written from the mechanism instead of from the entries.**
// The `META` loop now spawns the runner whenever it is already inside a `SELF`
// child, and the thirteen entries below are equivalent in power to
// `check-source-selftest.mjs`'s ten.
//
// **And the SELF pass has a CONTROL RUN, which is W28's inertness check one layer
// out and which exists because this item shipped the defect it catches.** Every
// entry grades *"the child exited non-zero"*, and a child that cannot run at all
// satisfies that for nothing: the mutants were first written into `dir`, which a
// child deletes on its first line, so the META grandchild could not re-import them
// and **all twelve entries passed while every grading in every child read *"the
// mutant did not run: this is a crash, not a detection"***. `12/12 bounded`, exit
// 0, and the whole pass was measuring the deletion. *(This said `13/13` until W31's
// conformity reader noticed it contradicted the entry count in its own sentence —
// the defect was found and fixed while the list was twelve long, and the thirteenth
// and fourteenth entries came later.)* Found by rule 8's set, not by
// the green run. The control writes an UNMUTATED copy, runs it as a `SELF` child
// and requires exit 0; with the defect reintroduced it refuses by name.
//
// **This is written down rather than closed**, because the alternative is a fifth
// guard with a fifth hole. What breaks the regress is a reader, and that is what
// `doc/workflow.md` section 6 pass 2 is for — this list is the map of what a
// reader still has to look at.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const SPEC = 'spec/join-policy.md';
const SRC = 'src/fold/policies.ts';

/**
 * `half` says which file the probe rewrites; the other is read from the tree.
 * `check` plus `also` is the exact set of checks the run must report under.
 */
const PROBES = [
  {
    name: 'a policy name deleted from spec section 3',
    half: 'spec', check: 'P1',
    mutate: (t) => t.replace(/^\| `live-token-requiring-arrival` \|.*$/m, ''),
  },
  {
    name: 'a policy name added to spec section 3 with nothing behind it',
    half: 'spec', check: 'P1',
    mutate: (t) => t.replace('| `live-token` | `open` starts a live count',
      '| `quorum` | satisfied on the first arrival |\n| `live-token` | `open` starts a live count'),
  },
  {
    name: 'a spec row renamed, so both directions of P1 fire at once',
    half: 'spec', check: 'P1',
    // **Anchored on the ID CELL alone, not on the row text.** This read
    // '| `arrival-count` | `N` is fixed', and W33 re-sourced that row -- so the
    // mutation matched nothing and the rule 7 (b) guard said so rather than the
    // probe passing. What this probe is ABOUT is renaming the row's id; the
    // definition beside it is not part of the case. Measured: the anchor occurs
    // exactly once in spec/join-policy.md.
    mutate: (t) => t.replace('| `arrival-count` |', '| `arrival-counting` |'),
  },
  {
    name: 'section 3`s number removed, so no names are read at all',
    half: 'spec', check: 'P3',
    // **This probe was wrong at birth and the check was right.** It first
    // rewrote the heading TEXT — `## 3. Policy names` — which the section regex
    // still matches, so nothing broke and the run exited 0 with no check tripped
    // at all. `doc/workflow.md` section 5 rule 7 (b): a probe whose edit does not
    // do what its name says passes for the wrong reason, and set equality is what
    // made it fail loudly instead of quietly.
    mutate: (t) => t.replace('## 3. What each policy name means', '## What each policy name means'),
  },
  {
    name: 'a spec row`s id emptied, which is a malformed table rather than a spec change',
    half: 'spec', check: 'P3',
    // **This probe found a real hole in the check.** Two empty backtick pairs
    // parsed to two empty ids, which kept the row count above P3's floor — so the
    // run reported a P1 set mismatch and called a broken table a spec change. P3
    // now rejects an empty id, and P1 and P2 no longer run when a half could not
    // be read: a comparison built on an unparsed list is true of the parse.
    mutate: (t) => t.replace('| `arrival-count` | `N` is fixed', '| `` | `N` is fixed')
      .replace('| `live-token` | `open` starts a live count', '| `` | `open` starts a live count'),
  },
  {
    name: 'section 3 left with a single row, which is under P3`s floor',
    half: 'spec', check: 'P3',
    // The floor clause had no probe until W16's adequacy reader disabled it and
    // watched all ten pass. Two rows is the minimum `JP-R7` and `JP-R8` pin.
    mutate: (t) => t.replace(/^\| `live-token(-requiring-arrival)?` \|.*$/gm, ''),
  },
  {
    name: 'JP-R9`s own row deleted from the spec that declares it',
    half: 'spec', check: 'P3',
    mutate: (t) => t.replace(/^\| `JP-R9` \|.*$/m, ''),
  },
  {
    name: 'the POLICIES block renamed, so the source half cannot be read',
    half: 'src', check: 'P3',
    // The `policies === null` clause, likewise unprobed and likewise disable-able
    // with everything green.
    mutate: (t) => t.replace('export const POLICIES = {', 'export const JOIN_POLICIES = {'),
  },
  {
    name: 'a policy deleted from POLICIES',
    half: 'src', check: 'P1',
    mutate: (t) => t.replace("  'live-token-requiring-arrival': liveTokenRequiringArrival,\n", ''),
  },
  {
    name: 'a policy renamed in the code without the spec following',
    half: 'src', check: 'P1',
    // **Key and `id:` moved together**, which is what a real rename looks like
    // and what leaves P2 silent.
    mutate: (t) => t.replace("  'live-token-requiring-arrival': liveTokenRequiringArrival,",
      "  'live-token-needing-arrival': liveTokenRequiringArrival,")
      .replace("  id: 'live-token-requiring-arrival',", "  id: 'live-token-needing-arrival',"),
  },
  {
    name: 'a second key pointing at an existing policy, which is two defects at once',
    half: 'src', check: 'P1',
    // **The one declared cascade, and it is structural rather than incidental.**
    // A name `POLICIES` has and the spec does not (P1) can only be introduced by
    // pointing at some object, and that object's id is then not the new key (P2).
    // The first version of this probe declared P1 alone and was reported as a
    // hole — correctly: it was a claim about two checks wearing one declaration.
    also: ['P2'],
    mutate: (t) => t.replace("  'live-token': liveToken,",
      "  'live-token': liveToken,\n  'live-token-v2': liveToken,"),
  },
  {
    name: 'a POLICIES key that is not its policy`s own id',
    half: 'src', check: 'P2',
    // The key stays a name the spec fixes, so P1 is silent and only P2 fires —
    // which is the whole reason P2 is a separate check.
    mutate: (t) => t.replace("  'live-token-requiring-arrival': liveTokenRequiringArrival,",
      "  'live-token-requiring-arrival': liveToken,"),
  },
  {
    name: 'a policy object`s own id changed, leaving the key alone',
    half: 'src', check: 'P2',
    mutate: (t) => t.replace("  id: 'live-token-requiring-arrival',", "  id: 'live-token-ra',"),
  },
];

/** Every check `check-policies.mjs` reports under, in the order it reports them. */
const ALL_CHECKS = ['P1', 'P2', 'P3'];

/**
 * **A floor on the probe list, and it is the same guard `check-policies.mjs`'s
 * own P3 puts on `names.length`.** `caught === PROBES.length` is **vacuously true
 * at zero**, so emptying this array — or deleting two probes from it — reported
 * `0/0 probes caught` and exited 0. Found by W16's adequacy reader, and it is
 * `doc/workflow.md` rule 7 (b) turned on the harness rather than on a probe: *"a
 * probe whose edit matches nothing passes for the wrong reason"* applies just as
 * well to a probe list that is not there at all.
 */
/**
 * **W28: a META entry names the probe it must break** — [Q138](../doc/open-questions.md),
 * and this file is where the guard that came with it fired first.
 *
 * A grading was `r.status !== 0`. That cannot tell *the clause I broke was caught*
 * from *something else went wrong*, and **`P3 disabled` had been scored *noticed*
 * since W16 because its mutant CRASHED** — it took a branch away from an
 * `if`/`else if` chain whose next arm evaluates `names.length`. W24's conformity
 * reader found that shape in `check-source-selftest.mjs` and rewrote the one entry
 * it knew about; the `ran:` guard W28 adds found this one on its first run, in a
 * file nobody had suspected. Measured: **6.5 s -> 2.8 s**.
 *
 * **What this file still lacks is a `SELF` list**, so nothing bounds `PROBES` and
 * nothing here provokes the new grading — the entries that do that live in the two
 * files that have one. P9 reserves **W31** for it and expects it unused.
 */
const MIN_PROBES = 13;

/**
 * The same floor for the META list below, and for the same reason.
 *
 * **It read 5 against a list of 6 and one grading could leave for exit 0** — found
 * by both of W28's readers independently, and by P9's declaration census, which
 * recorded this list as 5 when it was 6. The floor went stale when the list grew,
 * which is the ordinary way a hand-written literal goes stale, and **there is no
 * `SELF` list in this file to catch it** — the one sub-question of rule 8's fourth
 * obligation neither reader could instantiate anywhere is *does anything COUNT the
 * list from a source other than itself*, and the answer in all three self-tests is
 * no: every floor is a literal.
 */
const MIN_META = 6;

/** And the same floor for `SELF`, because `bounded === SELF.length` is vacuously true at zero. */
const MIN_SELF = 14;

/**
 * **How many `META` gradings may pass as `corpus`.** Zero, and the number is
 * MEASURED rather than chosen: all six mutants below report `inert: yes` today and
 * the summary line carries no corpus term at all.
 *
 * A `corpus` grading is a **pass** — the mutant fails on the repository's own tree,
 * which is noticing, and more strongly than any probe. **So a harness bug that makes
 * every mutant non-inert reads as full coverage.** W30 measured that in
 * `check-spec-selftest.mjs`: one dropped line put all 21 entries there and the file
 * exited 0 saying *"0 noticed by the named probe, 21 by the corpus"*.
 * [Q150](../doc/open-questions.md), closed there and left live in the other four;
 * this is one of the four. Forcing every grading here to `corpus` reports
 * **`6/6 noticed — 0 by the named probe, 6 by the corpus`** at exit 0.
 *
 * **Raise this only with a measurement beside it.** A cap written above the observed
 * number is [Q102](../doc/open-questions.md)'s ratchet in a new place.
 */
const MAX_CORPUS = 0;

/**
 * **How many `META` entries may take the `wide` exemption from the anchor guards.**
 * One, and it is spent: `P1 and P2 swapped` is a legitimate global rename over all
 * four `fail('P1'` / `fail('P2'` sites, which is the whole point of that entry.
 *
 * **`MAX_WIDE` is itself a bare literal on the outermost list and is raisable to 99
 * for 0** — W30's own re-run finding about the bound it wrote to close a reader's
 * finding. It is on the header's ceiling list rather than bounded by a third
 * literal, because that is where the regress goes and saying so is cheaper than
 * pretending otherwise.
 */
const MAX_WIDE = 1;

/**
 * **Did the `SELF` child's own self-test run at all?** A `SELF` entry grading
 * `r.status !== 0` alone can pass by making this file a **syntax error**: W28's
 * adequacy reader appended `((( ;` to a `SELF` mutation in `check-source` and the
 * run reported **7/7 bounded at exit 0** while the bound it claims to test was never
 * tested. Every code path here that grades anything prints this line first; a file
 * that does not parse prints nothing.
 */
const SELF_RAN = (out) => /check-policies self-test — /.test(out);

/**
 * **How a child runs a MUTATED copy of this file, and why it is a generated runner
 * rather than an env variable read by the check.**
 *
 * `check-source.mjs` reads `CHECK_SOURCE_SELFTEST` and imports whatever it names, so
 * a mutated copy reaches every generation of children for free. `check-policies.mjs`
 * imported this file by a hard relative path and **W31 did not own it** — P9 puts a
 * change to a check's behaviour out of scope for every item in it — so the
 * indirection lives here instead. **W38 gave `check-policies.mjs` that same env
 * indirection, under the same variable name and with the same meaning, so this
 * paragraph's premise is now historical**; the constant stays because this file's
 * probes and `SELF` entries are written against it. `node --input-type=module -e`, spawned with an
 * args array, so no shell quoting is involved.
 *
 * **It is used in TWO places and the second one was a measured correction.** The
 * `SELF` pass spawns it, obviously. The `META` loop must spawn it too **whenever it
 * is already inside a `SELF` child**, because otherwise the grandchild re-imports
 * the REAL file and the mutation is silently undone one generation down. This file
 * shipped a header paragraph saying no `SELF` entry needed that, and the twelfth
 * entry — `MIN_PROBES` lowered together with `PROBES` emptied — **reported `6/6
 * noticed` at exit 0 against a child with no probes at all**, because the
 * grandchild found the named probes in the unmutated original. The claim was
 * written down, then measured, and the measurement is why this constant exists.
 */
const RUNNER =
  "import { pathToFileURL } from 'node:url';\n" +
  "const { selfTest } = await import(pathToFileURL(process.env.CHECK_POLICIES_SELFTEST).href);\n" +
  'process.exit(await selfTest(process.env.CHECK_POLICIES_ROOT));\n';

/**
 * **The mutations this self-test is run against ITSELF, and they are what make it
 * more than a claim about the past.**
 *
 * Every probe above asserts that `check-policies.mjs` refuses a broken input.
 * **Nothing asserted that the probes NOTICE a broken check.** W16's adequacy
 * reader disabled the verdict (`return 0`), the set-equality comparison
 * (`refused = r.status !== 0` — rule 7 (c) itself) and the matched-nothing guard,
 * and **all nine survived a green run.** That is W9's finding one layer up: *"a
 * check nobody can re-break is a claim about the past"*, applied to the
 * re-breaker.
 *
 * So the META pass breaks `check-policies.mjs` in each of these ways, re-runs
 * **the whole probe suite** against the broken copy, and requires it to come back
 * non-zero. A self-test that stays green against a check that checks nothing is
 * the one failure this file could not otherwise see.
 */
/**
 * **Every entry names the PROBE it must break, and the grading runs that probe and
 * no other** — W28, [Q138](../doc/open-questions.md). Before this, an entry was
 * graded by re-running the whole suite and requiring a non-zero exit, which cannot
 * tell *the clause I broke was caught* from *something else went wrong*: measured
 * across `check-source`'s 20 and `check-markdown`'s 36 entries, the probe credited
 * with the catch is **the first one in list order that the mutant disturbs**, and in
 * 7 of the 56 it declared a non-empty set and reported a strictly larger one — the
 * mutant had become **noisy** rather than been detected.
 *
 * `probe` is the probe's `name`, verbatim. **A name that matches nothing ABORTS**
 * rather than passing or being skipped — rule 7 (b) one layer out, and the same
 * trade `check-docs-selftest`'s probe 11 made when W13 deleted the API it was
 * pinned to.
 */
const META = [
  ['P1 disabled', (t) => t.replace('if (halvesRead && names && policies) {', 'if (false) {'),
    'a policy name deleted from spec section 3'],
  // **This one is why the comparison below is set equality rather than a count.**
  // A check that reports a real failure under the WRONG label trips the same
  // NUMBER of checks, so `tripped.length === declared.length` passes it and only
  // `tripped.join() === declared.join()` does not. Without it, rule 7 (c) can be
  // downgraded to cardinality with this whole file green — measured.
  //
  // **It has to be a SWAP, and getting there took two wrong tries that are worth
  // recording.** Mislabelling one of P1's two directions leaves the cascade probe
  // reporting `[P1,P2]` against a declared `[P1]`, which cardinality catches too.
  // Mislabelling *all* of P1 collapses that same cascade probe to `[P2]` against a
  // declared `[P1,P2]` — 1 against 2 — which cardinality also catches. Only a
  // swap leaves **every** probe's tripped and declared sets the same SIZE and a
  // different SET: the cascade probe trips `{P1,P2}` either way and passes, and
  // every single-check probe reports the other one. Both wrong versions were
  // measured passing before this one.
  ['P1 and P2 swapped, so every count still matches and no set does',
    (t) => t.replaceAll("fail('P1',", "fail('PX',").replaceAll("fail('P2',", "fail('P1',").replaceAll("fail('PX',", "fail('P2',"),
    // A P2 probe, so this entry and the one above do not lean on the same probe.
    // Under the swap it reports [P1] against a declared [P2] and goes uncaught.
    'a POLICIES key that is not its policy`s own id',
    // **The one declared `wide` exemption, and it is the whole of `MAX_WIDE`.** This
    // mutation is deliberately GLOBAL — it renames all four `fail('P1'` / `fail('P2'`
    // sites, which is what makes it a SWAP rather than a mislabelling of one clause —
    // so the guard below would refuse it by name. W31 measured why the guard has to
    // exist anyway: swapping `P3`s floor clause disabled`'s anchor for
    // `/fail\('P3',/g` disables **all six** `P3` sites while naming one, and this
    // file reported `6/6 noticed` at exit 0.
    'a deliberate global rename of every P1 and P2 site — the swap IS the mutation'],
  ['P2 disabled', (t) => t.replace('for (const { key, binding } of halvesRead ? (policies ?? []) : []) {', 'for (const { key, binding } of []) {'),
    'a policy object`s own id changed, leaving the key alone'],
  // The clause this mutates is `names === null` specifically, and this is the one
  // probe that drives it — every other P3 probe reaches a different clause.
  //
  // **This entry has been wrong twice, and the second time is the more interesting.**
  //
  // It first read `if (names === null) fail('P3'` -> `if (false) fail('P3'`, which
  // takes the branch away from an `if`/`else if` chain whose next arm evaluates
  // `names.length` — so the mutant **threw**, exited non-zero, and was scored
  // *noticed* for a reason with nothing to do with the probes. W24's conformity
  // reader found that shape in `check-source-selftest.mjs`; the `ran:` guard W28
  // added found this one on its first run.
  //
  // **The repair was `[].push('P3', …)` — inert, chain intact — and it STILL
  // crashed**, which only the readers' second correction could see. `check-policies.mjs`
  // ends with ``All checks passed — ${names.join(', ')}``, and that line is reachable
  // with `names === null` **only when P3's first clause is disabled**: the clause is
  // what guarantees the success path never runs on a null. So the mutant is inert on
  // the clean tree and throws under its own probe — precisely the case the `ran:`
  // guard is defence in depth for, and the case the file said did not exist. The
  // first `ran:` guard could not see it either, because it keyed on the report
  // HEADER and the throw happens after it.
  //
  // **So the `names === null` clause has no META entry and cannot have one**, short
  // of a change to `check-policies.mjs` that this item does not own:
  // [Q144](../doc/open-questions.md). This entry now takes P3's FLOOR clause, which
  // is inert, does not crash, and has a probe of its own.
  ['P3`s floor clause disabled', (t) => t.replace('else if (names.length < 2) {', 'else if (false) {'),
    'section 3 left with a single row, which is under P3`s floor'],
  ['every failure swallowed', (t) => t.replace('const fail = (check, msg) => failures.push(`${check}: ${msg}`);', 'const fail = () => {};'),
    'a policy deleted from POLICIES'],
  ['the non-zero exit removed', (t) => t.replace('  process.exit(1);', '  process.exitCode = 0;'),
    'a spec row renamed, so both directions of P1 fire at once'],
];

/**
 * **The mutations THIS FILE is run against — the list `check-policies` never had,
 * and the reason W31 exists.**
 *
 * Every probe above asserts that `check-policies.mjs` refuses a broken input, and
 * every `META` entry asserts that a named probe notices a broken check. **Nothing
 * asserted that either LIST is there.** W28's adequacy reader put each of the three
 * verdicts W28 shipped under an `if (false)` and ran this file: `13/13`, `6/6`,
 * exit 0, three times — because the other two self-tests gained four `SELF` entries
 * each and this copy of the contract got none.
 *
 * **Every entry is ONE edit to a list that sits ABOVE this one in the file**, and
 * both halves of that sentence are W28's most expensive lessons rather than style:
 *
 *   - **Edit the defect, not the guard.** *Remove the guard AND supply the case it
 *     catches* makes the run go GREEN, so *"must exit non-zero"* reads as *the floor
 *     did not fire* whether the guard was load-bearing or not. Asked the right way
 *     round it is: **with the guard in place, does the run go red?**
 *   - **Nothing can self-match.** [Q143](../doc/open-questions.md): four `SELF`
 *     entries in `check-source` quoted the guard they remove, and that quote sits
 *     EARLIER in the file than the guard, so `String.replace` edited the entry
 *     instead. `PROBES`, the floors and `META` all sit above `SELF` here, so a
 *     single-line anchor is safe by position rather than by care.
 *
 * **The exception is entry 12, which needs two edits**, and it is a compound the
 * header's old ceiling list claimed was open. A `SELF` entry may take two edits
 * where a rule 8 provocation may not: it asks *does this harness notice*, and a
 * floor lowered without its list shortened notices nothing by design.
 */
const SELF = [
  // --- rule 8's fourth obligation: can one entry leave, can the whole list leave --
  // **The probe this deletes must be one NO `META` entry names, and that is W31's
  // adequacy reader's finding rather than a detail.** It first deleted *a policy
  // object`s own id changed*, which `P2 disabled` names — so the child went red
  // because a `META` entry ABORTED on a missing probe, and the floor was never the
  // reason. Measured: with this entry as it first stood, deleting the whole
  // `PROBES.length < MIN_PROBES` disjunct from the floor check cost **0**. Retargeted
  // at one of the seven probes no `META` entry names, the floor is the only thing
  // that fires and the disjunct costs 1. **The entry was written to the LIST and not
  // to the GUARD** — P7's *"the author bounded the lists a row iterates"*, one layer
  // in, in an entry whose whole purpose is to bound a guard.
  ['one probe deleted from PROBES — one NO META entry names, so only the floor can fire',
    (t) => t.replace(/\n  \{\n    name: 'JP-R9`s own row deleted from the spec that declares it',[\s\S]*?\n  \},/, '')],
  // **The probe-pass verdict's own case, and no other entry reaches it.** Every
  // other entry here breaks a LIST; this breaks the VERDICT OVER a list. A probe
  // whose mutation matches nothing is refused by the rule 7 (b) guard, which prints
  // its message and does NOT increment `caught` — and `caught !== PROBES.length` is
  // the only thing that turns that into a non-zero exit. Measured before this entry
  // existed: with the verdict replaced by `if (false)`, the run prints
  // `FAIL P3 JP-R9`s own row deleted … — the mutation matched nothing`, then
  // `12/13 probes caught`, then **exits 0**.
  ['a probe whose mutation matches NOTHING — what the probe-pass verdict bounds',
    (t) => t.replace("    mutate: (t) => t.replace(/^\\| `JP-R9` \\|.*$/m, ''),",
      "    mutate: (t) => t.replace(/^\\| `JP-R0000` \\|.*$/m, ''),")],
  ['PROBES emptied entirely — the whole list leaving',
    (t) => t.replace(/const PROBES = \[[\s\S]*?\n\];\n/, 'const PROBES = [];\n')],
  // **`MIN_META` DOES fire and the Record's prefilled table said it cost 0.** W31
  // measured both of these at exit 1 before writing them down. What they buy is
  // rule 7 (a) — *a probe that ran once is a claim about the past* — **and they DO
  // reach the floor being lowered**: `MIN_META -> 0` costs 1, and `-> 0` together
  // with an entry deleted costs 1, both by these two entries. *(This comment read
  // "what they do NOT reach is the floor being LOWERED, which is on the ceiling
  // list" until W31's conformity reader measured it. The header three hundred lines
  // up was right and this line was wrong — a file disagreeing with itself about its
  // own measurement, which is what the header's own re-measurement of W16's list was
  // about.)*
  ['one META entry deleted',
    (t) => t.replace(/\n  \['the non-zero exit removed',[\s\S]*?'a spec row renamed, so both directions of P1 fire at once'\],/, '')],
  ['META emptied entirely — the whole list leaving',
    (t) => t.replace(/const META = \[[\s\S]*?\n\];/, 'const META = [];')],

  // --- W28's three verdicts, each in its own single-edit form -------------------
  //
  // **Two of these three bound an OUTCOME and cannot bound the BRANCH, and that is
  // measured rather than glossed.** The ABORT and STILL-CAUGHT arms assign `why` and
  // never touch `ok`, so disabling either costs 0 with this list in place exactly as
  // it did without one. What these two entries assert is the thing worth asserting:
  // **a dangling probe reference, and an entry whose mutation its named probe
  // survives, each turn this file RED.** Both are true today and nothing re-ran them.
  ['one META entry pointed at a probe that does not exist — the ABORT`s own case',
    (t) => t.replace("    'a spec row renamed, so both directions of P1 fire at once'],",
      "    'a probe this file does not have'],")],
  ['one META entry pointed at a probe its mutation does not break — the STILL-CAUGHT case',
    // Disabling the `P2` loop cannot stop a `P1` probe being caught, so the entry is
    // mislabelled and the verdict has to say so.
    (t) => t.replace("    'a policy object`s own id changed, leaving the key alone'],",
      "    'a policy deleted from POLICIES'],")],
  // **The `ran:` guard, and this file is the only place its case exists.** W28 had
  // to DELETE this mutation as a `META` entry: `check-policies.mjs` ends with
  // ``All checks passed — ${names.join(', ')}``, reachable with `names === null`
  // exactly when this clause is disabled, so the mutant is inert on the clean tree
  // and THROWS under its own probe — [Q144](../doc/open-questions.md), which records
  // the guard as live in several files and provoked in none. As a `SELF` entry it is
  // exactly right: with the guard live the run is `6/7 noticed` at exit 1, and
  // disabling EITHER half — the parent's `!ran` arm or the child's `RAN` producer —
  // takes it to `7/7` at exit 0. **The second demonstration anywhere that `ran:`
  // fires**, after W29 constructed one in `check-docs`.
  ['a META entry inert on the clean tree and FATAL under its probe — the `ran:` case',
    (t) => t.replace("  ['every failure swallowed',",
      "  ['Q144 — the names === null clause disabled inertly', (t) => t.replace(\"if (names === null) fail('P3',\", \"if (names === null) [].push('P3',\"),\n" +
      "    'section 3`s number removed, so no names are read at all'],\n  ['every failure swallowed',")],

  // --- the three bounds W31 adds, made load-bearing rather than merely present ----
  //
  // **All three were measured LIVE in this file at cost 0 before the bound existed**,
  // which is W30's practice rather than W29's inherited claim.
  ['one META entry replaced by a DUPLICATE of another — what a COUNT cannot see',
    // Measured before the distinctness bound: `6/6 noticed`, exit 0, floor satisfied,
    // total unmoved, and the exit-path clause silently ungraded.
    (t) => t.replace(
      "  ['the non-zero exit removed', (t) => t.replace('  process.exit(1);', '  process.exitCode = 0;'),\n    'a spec row renamed, so both directions of P1 fire at once'],",
      "  ['the non-zero exit removed', (t) => t.replace('const fail = (check, msg) => failures.push(`${check}: ${msg}`);', 'const fail = () => {};'),\n    'a policy deleted from POLICIES'],")],
  // **The ambiguous-anchor guard's own case, and it had to be CONSTRUCTED.** W31
  // measured that every singular anchor in `META` occurs exactly once in
  // `check-policies.mjs`, so that guard shipped with no live case and rule 8's set
  // found it unprovoked at cost 0. `fail('P1',` occurs **twice**, so a plain
  // `.replace` on it lands on the first of two and the entry does not say which —
  // and because it is not global, the GLOBAL guard beside it is silent. **Two
  // guards, two entries, and neither substitutes for the other.**
  ['one META entry`s anchor matching TWICE but not globally — the ambiguous case',
    (t) => t.replace("(t) => t.replace('if (halvesRead && names && policies) {', 'if (false) {')",
      "(t) => t.replace(\"fail('P1',\", \"[].push('P1',\")")],
  ['one META entry`s anchor made GLOBAL — six P3 sites, one name',
    // Measured before the anchor guard: all six `P3` clauses disabled by an entry
    // naming one, `6/6 noticed`, exit 0. `check-policies.mjs` has ten `fail()` sites
    // and six of them are `P3` — **tied for the widest single-id surface here** with
    // `fail('S11'` in `check-source.mjs` and `fail('D3'` in `check-scheduler.mjs`,
    // which also have six each. W31 first wrote *"the widest"*; its conformity reader
    // counted all six checks. Nothing else depends on the number.
    (t) => t.replace(
      "  ['P3`s floor clause disabled', (t) => t.replace('else if (names.length < 2) {', 'else if (false) {'),",
      "  ['P3`s floor clause disabled', (t) => t.replace(/fail\\('P3',/g, \"[].push('P3',\"),")],
  ['a SECOND META entry taking the `wide` exemption — what MAX_WIDE bounds',
    // Give an entry that names one clause a fourth element and both anchor guards
    // stop applying to it. W30's adequacy reader's own edit, in this file.
    (t) => t.replace("    'a spec row renamed, so both directions of P1 fire at once'],\n];",
      "    'a spec row renamed, so both directions of P1 fire at once',\n    'a second exemption nobody bounded'],\n];")],
  // **This entry bounds TWO things and its first form bounded only one**, which is
  // W31's adequacy reader's finding. The `corpus` verdict has exactly one producer —
  // the inertness run — and disabling that producer cost **0**: `byCorpus` is then
  // permanently zero, `MAX_CORPUS` is dead code, and [Q150](../doc/open-questions.md)
  // silently reopens. The first form could not see it, because with the inertness run
  // disabled the child still went red, by the OTHER route: the named probe came back
  // STILL CAUGHT. **The right verdict by the wrong route** —
  // [Q147](../doc/open-questions.md)'s shape inside the entry written to close Q150.
  //
  // The two-edit mutation below discriminates. It disables the clause the named probe
  // tests (so `P3` DISAPPEARS rather than staying caught) **and** makes `P1` fire on
  // the untouched tree (so the mutant is not inert):
  //   - inertness run LIVE  -> `corpus`, `byCorpus` 1, `MAX_CORPUS` refuses      RED
  //   - inertness run GONE  -> `disappeared`, `ok`, 6/6, `byCorpus` 0            GREEN
  // A `META` mutation may take two edits; a rule 8 provenance probe may not, and the
  // difference is that this one asks *does this harness notice* rather than *is this
  // value what it claims*.
  ['a META mutation made NON-INERT and UNCAUGHT — what MAX_CORPUS and the inertness run bound',
    (t) => t.replace("(t) => t.replace('else if (names.length < 2) {', 'else if (false) {')",
      "(t) => t.replace('else if (names.length < 2) {', 'else if (false) {')" +
      "\n      .replace('    if (!spec.includes(id)) {', '    if (true) {')")],

  // --- and the compound the header called open ----------------------------------
  //
  // **Two edits, and it is checked in because the header's ceiling list said it
  // survived and W28's contract had already closed it.** With `PROBES` emptied every
  // `META` entry names a probe that is gone and the child ABORTS, so the floor being
  // lowered buys nothing. **`MIN_META`'s compound is closed too, by a different
  // route** — the two `META` entries above need that floor to fire, so lowering it
  // costs 1 with or without a shortened list. The floors are asymmetric in MECHANISM
  // (W28's ABORT here, the entries there) and not in outcome. *(This comment said
  // `MIN_META`'s compound was NOT closed and was on the ceiling list; W31's
  // conformity reader measured otherwise.)*
  ['MIN_PROBES lowered AND PROBES emptied — the compound the header called open',
    (t) => t.replace('const MIN_PROBES = 13;', 'const MIN_PROBES = 0;')
      .replace(/const PROBES = \[[\s\S]*?\n\];\n/, 'const PROBES = [];\n')],
];

/**
 * **Did the check under test RUN TO COMPLETION?** The grading requires this, which
 * is how a mutant that **crashed** is told apart from one that ran and stopped
 * detecting. W24's conformity reader found a META entry scored *noticed* because
 * its mutant threw — W6's syntax-error-read-as-a-caught-mutation, two layers up —
 * and an exit code cannot see the difference where this can. **`P3 disabled` was a
 * second instance and this guard found it on its first run.**
 *
 * **It keys on the TERMINAL line rather than the report header**, after W28's
 * readers measured that the header is printed *before* the report and the exit
 * path: a mutant made to throw after it was scored *noticed* for **0**.
 */
const RAN = (out) => /^(All checks passed|\d+ failure\(s\)\.)/m.test(out);

/**
 * **A probe's verdict, computed in ONE place**, and it is here because W31's
 * adequacy reader measured what two copies cost.
 *
 * This expression existed twice, verbatim — once in single-probe mode and once in
 * the main probe loop. **Only the single-probe copy was covered.** Weakening the
 * MAIN loop's to `tripped.length === declared.length` cost **0**, with all thirteen
 * probes still reported caught; weakening the single-probe copy costs 2, because
 * the `P1 and P2 swapped` META entry exists precisely to prove that set equality
 * beats cardinality. **W28's named-probe contract moved that entry's evidence into
 * the single-probe copy and left the main-pass copy with none** — in the file whose
 * header calls itself *"rule 7 (c)'s first outing"*.
 *
 * The author's own rule 8 probe missed it by being too coarse: it used `replaceAll`
 * and hit both copies, so it was refused, and the refusal came from the copy that
 * was already covered. **Two clauses that both trip the right one are
 * indistinguishable** — W29's limit of set equality, at the probe layer.
 *
 * `check-source-selftest.mjs` reached this a plan earlier and says why in the same
 * words: *"two callers computing the same fact is how they drift."*
 */
const verdict = (probe, r) => {
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  // **Equality, not membership**: a probe that trips a check it did not name is
  // malformed, and a malformed probe reported as caught is why this file exists.
  const declared = [probe.check, ...(probe.also ?? [])].sort();
  const tripped = ALL_CHECKS.filter((x) => out.includes(`${x}: `));
  const refused = r.status !== 0 && tripped.join(',') === declared.join(',');
  const missing = declared.filter((id) => !tripped.includes(id));
  // **`outcome:` is the fact a META parent grades on**, and it exists because reading
  // the EXIT CODE cannot distinguish a detection from NOISE: a mutant that leaves the
  // named clause fully detecting and adds one unrelated failure makes `refused`
  // false, which an exit code reports as *uncaught*. Both of W28's readers found it,
  // from opposite directions.
  const outcome = refused ? 'caught'
    : r.status === 0 ? 'exit0'
      : missing.length ? 'disappeared'
        : tripped.length > declared.length ? 'noisy' : 'other';
  const why = refused ? ''
    : `  — exited ${r.status}, wanted [${declared.join(',')}], got [${tripped.join(',')}]`;
  return { out, declared, tripped, refused, outcome, why };
};

export async function selfTest(root) {
  const dir = join(root, 'dev-dist', 'policies-selftest');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  const source = { spec: readFileSync(join(root, SPEC), 'utf8'), src: readFileSync(join(root, SRC), 'utf8') };
  const ext = { spec: 'md', src: 'ts' };
  // The script under test. `CHECK_POLICIES_SCRIPT` is how the META pass points
  // this same suite at a deliberately broken copy of it.
  const script = process.env.CHECK_POLICIES_SCRIPT ?? join(root, 'scripts', 'check-policies.mjs');
  const meta = !process.env.CHECK_POLICIES_SCRIPT;
  // **A `SELF` child runs a mutated copy of THIS file against the real check**, so it
  // must run `META` — a guard whose only effect is inside `META` is invisible to a
  // child that skips it — and it must NOT run `SELF`, or the recursion has no floor.
  const nestedSelf = !!process.env.CHECK_POLICIES_SELFTEST;

  // **Single-probe mode: the META pass names ONE probe and this runs that one.**
  // The whole-suite re-run it replaces is where both of Q138's halves lived — the
  // credit going to whichever probe happened to react first, and roughly a
  // PROBES.length multiplier on the pass's cost.
  const only = process.env.CHECK_POLICIES_PROBE;
  if (only !== undefined) {
    const probe = PROBES.find((p) => p.name === only);
    if (!probe) {
      // **Aborts rather than passing or skipping.** A renamed probe leaves its META
      // entry pointing at nothing, and the dangerous reading of that is "no probe
      // failed, so the check must still be checking" — which is exactly backwards.
      console.log(`  ABORT  no probe is named "${only}"`);
      return 3;
    }
    const rel = `dev-dist/policies-selftest/only.${ext[probe.half]}`;
    const mutated = probe.mutate(source[probe.half]);
    if (mutated === source[probe.half]) { console.log('  ABORT  the mutation matched nothing'); return 3; }
    writeFileSync(join(root, rel), mutated);
    const env = { ...process.env };
    env[probe.half === 'spec' ? 'CHECK_POLICIES_SPEC' : 'CHECK_POLICIES_SRC'] = rel;
    // **Is the mutated check INERT on the untouched tree?** Rule 8 (b) asks for a
    // mutation that is *present but inert*, and until W28's readers nothing tested
    // it. A mutant that fails on the repository's own tree is still NOTICED — by the
    // corpus, more strongly than by any probe — but its probe verdict is meaningless,
    // because every id it reports may be noise rather than detection. A non-inert
    // mutant short-circuits: running the probe would produce a number to ignore.
    const clean = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', timeout: 300_000 });
    console.log(`  inert: ${clean.status === 0 ? 'yes' : 'no'}`);
    if (clean.status !== 0) {
      console.log('  outcome: corpus');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
    const r = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', env, timeout: 300_000 });
    const v = verdict(probe, r);
    console.log(`  ran: ${RAN(v.out) ? 'yes' : 'no'}`);
    console.log(`  outcome: ${v.outcome}`);
    console.log(`  ${v.refused ? 'ok  ' : 'FAIL'}  ${probe.check}  ${probe.name}${v.why}`);
    rmSync(dir, { recursive: true, force: true });
    return v.refused ? 0 : 1;
  }

  if (PROBES.length < MIN_PROBES || META.length < MIN_META || SELF.length < MIN_SELF) {
    console.log(`check-policies self-test — ${PROBES.length} probes (floor ${MIN_PROBES}), ` +
      `${META.length} meta (floor ${MIN_META}), ${SELF.length} self (floor ${MIN_SELF}).`);
    console.log('  FAIL  a list is short, and `caught === length` is vacuous at zero.');
    rmSync(dir, { recursive: true, force: true });
    return 1;
  }

  // **`META` is bounded by CONTENT as well as by count, and both bounds below were
  // measured LIVE in this file before they were written.** W29 found the first in
  // `check-scheduler` and named this file as structurally exposed and unmeasured;
  // W30 measured it in `check-source`. Here: replacing *"the non-zero exit removed"*
  // with a **duplicate** of *"every failure swallowed"* reported `6/6 noticed` at
  // exit 0 — floor satisfied, total unmoved, and the exit-path clause silently
  // ungraded. And swapping one entry's anchor for `/fail\('P3',/g` disabled **all
  // six** `P3` sites while naming one, at `6/6 noticed`, exit 0.
  //
  // **Against the REAL check, never `script`.** In a `META` child `script` IS the
  // mutant, so two entries that both become no-ops on an already-broken check
  // collapse to the same string and this bound refuses a correct list — W30 hit
  // exactly that and the parent reported it as a crash. **A bound derived from *the
  // script under test* is a different bound inside a child whose script under test
  // is broken.**
  {
    const real = readFileSync(join(root, 'scripts', 'check-policies.mjs'), 'utf8');

    // **`ALL_CHECKS` is DERIVED from the check and cross-checked two ways, and this
    // is the one cross-count this file has.** W31's adequacy reader answered the
    // sub-question W28's reader named and could not instantiate anywhere — *does
    // anything COUNT a list from a source other than itself?* — with **no**, and
    // pointed at the one place where the ingredients were already in hand: this block
    // reads the real check, and `ALL_CHECKS` was a HAND-COPY of that check's own
    // `CHECKS` array with nothing comparing them.
    //
    // **Measured before this bound existed.** Shortening `ALL_CHECKS` is refused
    // (`0/13 probes caught`) so the list is load-bearing; its COMPLETENESS was
    // unbounded in **both** directions — adding an id the check never reports cost
    // **0**, and deleting a whole row from `check-policies.mjs`'s own `CHECKS` cost
    // **0**, with `13/13`, `6/6`, `13/13` and exit 0.
    //
    // Two independent derivations, cross-checked against each other before either is
    // compared to the declaration — W30's form in `check-spec-selftest.mjs`, which
    // derived its universe from the report array **and** the `fail()` sites for
    // exactly this reason: a single derivation moves the hole rather than closing it.
    //
    // **Note what this does NOT do.** This item's `Out` list puts `ALL_CHECKS` out of
    // scope as *"a change to what the harness OBSERVES"*, and that still stands: the
    // list is unchanged and nothing about how `tripped` is read has moved. What is
    // added is a BOUND on the list's completeness, which is this item's subject.
    {
      const fromReport = [...(/const CHECKS = \[([\s\S]*?)\];/.exec(real)?.[1] ?? '')
        .matchAll(/'([A-Z]\d)\s/g)].map((m) => m[1]);
      const fromFails = [...new Set([...real.matchAll(/fail\('([A-Z]\d)',/g)].map((m) => m[1]))];
      const a = [...new Set(fromReport)].sort().join(',');
      const b = fromFails.sort().join(',');
      if (a !== b) {
        console.log(`check-policies self-test — check-policies.mjs's report array declares [${a}] ` +
          `and its fail() sites report [${b}].`);
        console.log('  FAIL  the two derivations of the check`s own id set disagree, so neither can ' +
          'be trusted to bound ALL_CHECKS. Fix the check, or this bound is measuring itself.');
        rmSync(dir, { recursive: true, force: true });
        return 1;
      }
      if ([...ALL_CHECKS].sort().join(',') !== a) {
        console.log(`check-policies self-test — ALL_CHECKS is [${[...ALL_CHECKS].sort().join(',')}] ` +
          `and check-policies.mjs reports [${a}].`);
        console.log('  FAIL  ALL_CHECKS is the set `tripped` is read from, so an id missing from it ' +
          'is a failure no probe can see and an id added to it is one no check can report.');
        rmSync(dir, { recursive: true, force: true });
        return 1;
      }
    }

    const wideEntries = META.filter(([, , , w]) => w).map(([n]) => n);
    if (wideEntries.length > MAX_WIDE) {
      console.log(`check-policies self-test — ${wideEntries.length} META entries take the ` +
        `\`wide\` exemption and this file declares ${MAX_WIDE}: ${wideEntries.join('; ')}.`);
      console.log('  FAIL  every one of them is exempt from BOTH anchor guards, so an entry can ' +
        'disable a set of clauses while naming one and say nothing about it.');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
    const mutants = [];
    for (const [name, mutate, , wide] of META) {
      let once;
      try { once = mutate(real); } catch { once = null; }
      mutants.push(once);
      if (wide || once === null || once === real) continue;
      // **Did the anchor land on more than one place?** Applying the mutation to its
      // own output must change nothing: an anchor that occurs twice edits the first
      // of several and the entry does not say which. W29's guard, and W31 measured
      // that every singular anchor in this file occurs exactly once — so it ships
      // with **no live case here**, which is stated rather than implied.
      if (mutate(once) !== once) {
        console.log(`check-policies self-test — the mutation for "${name}" matched MORE THAN ONCE.`);
        console.log('  FAIL  it landed on the first of several and the entry does not say which. ' +
          'Anchor it uniquely, or declare a `wide` reason as the entry`s fourth element.');
        rmSync(dir, { recursive: true, force: true });
        return 1;
      }
      // **Is it GLOBAL?** A global regex disables every site while naming one. Applied
      // to the source concatenated with itself, a single replacement leaves the second
      // copy untouched and a global one does not.
      if (mutate(real + real) !== once + real) {
        console.log(`check-policies self-test — the mutation for "${name}" is GLOBAL.`);
        console.log('  FAIL  it changes every matching site while the entry names one clause. ' +
          'Anchor it to one site, or declare a `wide` reason as the entry`s fourth element.');
        rmSync(dir, { recursive: true, force: true });
        return 1;
      }
    }
    if (new Set(mutants).size !== META.length) {
      console.log(`check-policies self-test — ${META.length} meta entries, ` +
        `${new Set(mutants).size} distinct mutations.`);
      console.log('  FAIL  two META entries produce the SAME mutation, so one clause is graded ' +
        'twice and another not at all — a floor counts entries and cannot see this.');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
  }

  console.log(`check-policies self-test — ${PROBES.length} probes\n`);
  let caught = 0;
  for (const [i, probe] of PROBES.entries()) {
    const rel = `dev-dist/policies-selftest/${String(i).padStart(2, '0')}.${ext[probe.half]}`;
    const mutated = probe.mutate(source[probe.half]);
    if (mutated === source[probe.half]) {
      console.log(`  FAIL  ${probe.check}  ${probe.name} — the mutation matched nothing`);
      continue;
    }
    writeFileSync(join(root, rel), mutated);
    const env = { ...process.env };
    env[probe.half === 'spec' ? 'CHECK_POLICIES_SPEC' : 'CHECK_POLICIES_SRC'] = rel;
    const r = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', env, timeout: 300_000 });
    const v = verdict(probe, r);
    if (v.refused) caught++;
    console.log(`  ${v.refused ? 'ok  ' : 'FAIL'}  ${probe.check}  ${probe.name}${v.why}`);
  }
  console.log(`\n${caught}/${PROBES.length} probes caught.`);
  // **This verdict was covered by NOTHING and it is the one the thirteen probes
  // exist to produce.** W31's adequacy reader replaced it with `if (false)` for
  // **0**: `13/13 probes caught`, `6/6 noticed`, `13/13 bounded`, exit 0. The two
  // verdicts the header's ceiling list names are the META one and the SELF one; it
  // omitted the third. **And it is what makes rule 7 (b) load-bearing** — a probe
  // whose mutation matches nothing prints its `FAIL … the mutation matched nothing`,
  // prints `12/13 probes caught`, and without this line **exits 0**. The `SELF`
  // entry *a probe whose mutation matches NOTHING* is what bounds it, and no other
  // entry could: every other one breaks a LIST, and this breaks the VERDICT OVER a
  // list.
  if (caught !== PROBES.length) { rmSync(dir, { recursive: true, force: true }); return 1; }

  // --- the META pass: does this suite NOTICE a broken check? -------------------
  if (!meta) { rmSync(dir, { recursive: true, force: true }); return 0; }
  const checkSource = readFileSync(join(root, 'scripts', 'check-policies.mjs'), 'utf8');
  let noticed = 0, byCorpus = 0;
  console.log(`\nand against a broken check — ${META.length} mutations of check-policies.mjs itself\n`);
  for (const [i, [name, mutate, probeName]] of META.entries()) {
    const broken = mutate(checkSource);
    if (broken === checkSource) {
      console.log(`  FAIL  ${name} — the mutation matched nothing`);
      continue;
    }
    // Written into `scripts/` rather than `dev-dist/`, because the script derives
    // its ROOT from its own location and a copy one directory deeper would read a
    // different repository.
    const rel = join(root, 'scripts', `.meta-${String(i).padStart(2, '0')}.mjs`);
    writeFileSync(rel, broken);
    let ok = false, why = '';
    try {
      // **Inside a `SELF` child, the grandchild must be the MUTANT too.** See
      // `RUNNER`: spawning `check-policies.mjs --self-test` here re-imports the real
      // file, and a `SELF` mutation of `PROBES` is then undone one generation down.
      const argv = nestedSelf
        ? ['--input-type=module', '-e', RUNNER]
        : [join(root, 'scripts', 'check-policies.mjs'), '--self-test'];
      const r = spawnSync(process.execPath, argv,
        { cwd: root, encoding: 'utf8', timeout: 600_000,
          env: { ...process.env, CHECK_POLICIES_SCRIPT: rel, CHECK_POLICIES_PROBE: probeName } });
      const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
      // **Three verdicts where there was one, and each says something different.**
      // 3 — the named probe does not exist, so this entry is a dangling reference
      //     and NOT evidence about the check.
      // 1 — the named probe went uncaught: the entry did what it claims.
      // 0 — the named probe was still caught: either the probes have a hole this
      //     entry cannot see, or the entry names the wrong probe. Both are findings
      //     and neither may be closed by renaming the probe to whatever fails.
      // And `ran: no` means the mutant CRASHED rather than stopped checking, which
      // an exit code alone reads as a catch.
      // **Graded on the child's `outcome:`, not on its exit code** — both of W28's
      // readers found that the exit code cannot tell a detection from NOISE.
      const ran = /^ {2}ran: yes$/m.test(out);
      const outcome = (out.match(/^ {2}outcome: (\w+)$/m) ?? [, ''])[1];
      if (r.status === 3) why = ` — ${out.trim().split('\n').pop()}`;
      // Noticed by the corpus rather than by the named probe: true, stronger than a
      // probe, and not what the entry claims — so it is counted separately below.
      else if (outcome === 'corpus') { ok = true; byCorpus++; why = ' (by the corpus: the mutant is not inert)'; }
      else if (!ran) why = ' — the mutant did not run: this is a crash, not a detection';
      else if (outcome === 'caught') why = ` — "${probeName}" is STILL CAUGHT against a check that does not check`;
      else if (outcome === 'noisy') why = ` — "${probeName}" still reports every id it declared; the mutant only got NOISIER, which is not a detection`;
      else if (['disappeared', 'exit0'].includes(outcome)) ok = true;
      else why = ` — the child reported outcome "${outcome || '(none)'}", which grades nothing`;
    } finally { rmSync(rel, { force: true }); }
    if (ok) noticed++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}${ok ? '' : why}`);
  }
  rmSync(dir, { recursive: true, force: true });
  // **Corpus-backed gradings are counted SEPARATELY**, because a bare "noticed"
  // hides how many entries no probe actually backs. This line was left un-split when
  // the other two files gained it, and the omission cost a wrong diagnosis: the
  // adequacy reader's noise mutation was correctly classified `corpus` here and
  // reported as an unqualified `6/6 noticed`, which read as *the fix did nothing*.
  console.log(`\n${noticed}/${META.length} noticed` +
    (byCorpus ? ` — ${noticed - byCorpus} by the named probe, ${byCorpus} by the corpus.` : '.'));
  if (noticed !== META.length) return 1;
  // **And a cap on how many may be corpus-backed.** `corpus` is a PASS, so without
  // this a harness bug that makes every mutant non-inert reads as full coverage —
  // [Q150](../doc/open-questions.md). `MAX_CORPUS` is 0 because the measured count
  // is 0, not because 0 is tidy.
  if (byCorpus > MAX_CORPUS) {
    console.log(`  FAIL  ${byCorpus} grading(s) passed as \`corpus\` and this file declares ` +
      `${MAX_CORPUS}. A corpus grading says the mutant is not inert, which is noticing by the ` +
      'gate rather than by the probe the entry names — so a harness bug that makes every ' +
      'mutant non-inert reads as full coverage.');
    return 1;
  }
  if (nestedSelf) return 0;

  // --- the SELF pass: do PROBES and META have a bound at all? ------------------
  //
  // **The list `check-policies` never had, and W31 is the item that measured why.**
  // W28's adequacy reader disabled each of the three verdicts this file grades on
  // and every one cost **0**, because the other two self-tests have a list one level
  // out and this one did not.
  //
  // **A `SELF` child is loaded by a generated runner rather than by
  // `check-policies.mjs --self-test`, and that is an `Owns` boundary rather than a
  // preference.** See `RUNNER`, which also carries the measurement that made the
  // `META` loop spawn it too: without that, a `SELF` mutation of `PROBES` is undone
  // one generation down and the child reports full coverage over an empty list.
  const selfSource = readFileSync(join(root, 'scripts', 'check-policies-selftest.mjs'), 'utf8');
  // **The mutant is written to `dev-dist/` and NOT into `dir`, and that is a defect
  // this item shipped and rule 8's set caught.** A child's first act is
  // `rmSync(dir)`, and its `dir` is the same one — so a mutant written there was
  // deleted **by the child itself** before the META grandchild could re-import it.
  // Every entry from the ABORT case onward then reported `0/6 noticed`, six times
  // *"the mutant did not run: this is a crash, not a detection"*, and the file
  // printed **`12/12 bounded` at exit 0** because a crashed child exits non-zero
  // just as a fired floor does. **That is [Q138](../doc/open-questions.md)'s own
  // shape — an exit code cannot tell a detection from a crash — one layer further
  // out than the plan that exists to close it, inside the entries written to close
  // it.** The path fix is one word; the control run below is what makes it
  // impossible to ship again.
  const selfPath = (i) => join(root, 'dev-dist', `.self-${String(i).padStart(2, '0')}.mjs`);
  const runSelfChild = (path) => {
    const r = spawnSync(process.execPath, ['--input-type=module', '-e', RUNNER],
      { cwd: root, encoding: 'utf8', timeout: 900_000,
        env: { ...process.env, CHECK_POLICIES_SELFTEST: path, CHECK_POLICIES_ROOT: root } });
    return { status: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
  };

  // **Whether a child counts as bounded, computed in ONE place**, because the
  // control below is the NEGATIVE case for this same expression and two callers
  // computing the same fact is how they drift. Non-zero AND the child's self-test
  // actually ran: `r.status !== 0` alone lets an entry pass by making this file a
  // syntax error, measured in `check-source` at a cost of 0 with the bound it claims
  // to test never tested.
  const graded = (r) => r.status !== 0 && SELF_RAN(r.out);

  // **The control: an UNMUTATED copy, run as a `SELF` child, must RUN and must NOT
  // be graded.** This is W28's inertness run one layer out, and it exists because
  // without it a broken harness reads as full coverage: every entry below grades
  // *"the child exited non-zero"*, and a child that cannot run at all satisfies that
  // for nothing.
  //
  // **Routing it through `graded` rather than through its own comparison closes a
  // measured provenance hole.** With the two written separately, dropping the exit
  // code from `graded` — leaving `SELF_RAN(r.out)` alone, so ANY child that ran
  // counts as bounded — cost **0**, because every entry below produces a child that
  // both ran and failed and nothing here is the other case. Through `graded` the
  // control IS the other case and refuses it. The remaining half is on the ceiling
  // list and is stated rather than papered over: dropping `SELF_RAN` still costs 0,
  // because that term exists to REJECT a malformed entry and every entry here is
  // well formed.
  const control = selfPath('control');
  writeFileSync(control, selfSource);
  const c = runSelfChild(control);
  rmSync(control, { force: true });
  if (graded(c) || !SELF_RAN(c.out)) {
    console.log(`\ncheck-policies self-test — the SELF control exited ${c.status}.`);
    console.log('  FAIL  an UNMUTATED copy of this file, run as a SELF child, must RUN and must ' +
      'NOT be graded as bounded. It is not, so every entry below would grade "the child exited ' +
      'non-zero" against a harness that is broken rather than a floor that fired.');
    console.log(c.out.split('\n').filter((l) => /FAIL|ABORT|Error/.test(l)).slice(0, 4)
      .map((l) => `        ${l.trim()}`).join('\n'));
    rmSync(dir, { recursive: true, force: true });
    return 1;
  }

  // **`SELF` is bounded by CONTENT as well as by count**, which is the same bound
  // `META` gained above, one list further out. **Measured live here before it was
  // written**: replacing *"PROBES emptied entirely"* with a duplicate of *"META
  // emptied entirely"* reported **`13/13 bounded` at exit 0** — floor satisfied,
  // total unmoved, and `MIN_PROBES`' whole-list-leaving case silently unbounded.
  // W29 found this shape in `check-scheduler`'s `META`; nobody had asked it of a
  // `SELF` list, and it is live in the two other files that have one.
  //
  // **Nothing provokes this bound and that is stated rather than hidden.** `SELF` is
  // the outermost list here, so the entry that would provoke it would have to live
  // in `SELF`, which is the list being bounded. It is on the header's ceiling list.
  {
    const seen = SELF.map(([, m]) => { try { return m(selfSource); } catch { return null; } });
    if (new Set(seen).size !== SELF.length) {
      console.log(`\ncheck-policies self-test — ${SELF.length} self entries, ` +
        `${new Set(seen).size} distinct mutations.`);
      console.log('  FAIL  two SELF entries produce the SAME mutation, so one bound is tested ' +
        'twice and another not at all — a floor counts entries and cannot see this.');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
  }

  let bounded = 0;
  console.log(`\nand against a shortened list — ${SELF.length} mutations of this file\n`);
  for (const [i, [name, mutate]] of SELF.entries()) {
    const broken = mutate(selfSource);
    if (broken === selfSource) {
      console.log(`  FAIL  ${name} — the mutation matched nothing`);
      continue;
    }
    const path = selfPath(i);
    writeFileSync(path, broken);
    let ok = false, why = '';
    try {
      const r = runSelfChild(path);
      ok = graded(r);
      if (r.status !== 0 && !ok) why = ' — the child never got as far as running: a broken file, not a fired floor';
    } finally { rmSync(path, { force: true }); }
    if (ok) bounded++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}${ok ? '' : (why || ' — the floor did not fire')}`);
  }
  rmSync(dir, { recursive: true, force: true });
  console.log(`\n${bounded}/${SELF.length} bounded.`);
  return bounded === SELF.length ? 0 : 1;
}
