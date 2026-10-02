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
// **`check-docs.mjs` has 58 clauses: 55 `fail()` sites and 3 ways the report can
// lie** — and this headline said *"17 clauses: 14 `fail()` sites"* until
// [W104](../doc/work-items/w104-the-snippet-loop-runs-concurrently.md) counted them.
// **It was W29's count and the check has quadrupled since**: `X6` arrived at W46, `X7`
// at W65, `X8` at W69 and W70, `X9` at W86, `X10` and `X11` at W96 — so the number was
// stale by **33 sites**, in the paragraph whose own subject is a stated cap that
// undercounts. *A census that narrates its own correctness and is never re-derived is
// `doc/workflow.md` section 1 rule 5's writing clause in a `scripts/` file.* It had
// already been wrong once, at W29, when it said *"six"* ungraded and omitted two, and
// the same six were copied into four more documents.
//
// **The scope of what W104 re-took is stated rather than implied**: the SITE count, by
// `grep -c "fail('X"`, is 55 across eleven ids (X1 4, X2 2, X3 2, **X4 13**, X5 1, X6 5,
// X7 5, X8 9, X9 4, X10 4, X11 6), and 47 of them predate W104. The `META` list below
// is **28** entries and the coverage bound it carries is per **ID**, not per site, so
// every id has at least one grading and *which sites* are graded is the question this
// list answers — for the sites named below and for no others. Re-deriving that for all
// 55 is an audit and W104 did not take it; what follows is the list as it stood plus
// W104's own eight.
//
// *(**And this very paragraph shipped at 53 / X4 11 for the length of one reader pass**,
// because W104 counted its own sites BEFORE adding the second-source clause and never
// re-took the number — its conformity reader caught it at 54, and acting on both readers'
// findings took it to 55. The same defect the paragraph is about, in the item correcting
// it, twice: `doc/workflow.md` section 1 rule 5's WHEN clause is the answer and the
// procedure is to run the grep on the tree that SHIPS.)*
//
//   X1  the unclosed-fence refusal           probe: an unclosed fence
//   X1  the no-snippets-at-all vacuity guard probe: a reference with no snippets at all
//   X1  the MISSING-DOCUMENT refusal         **NO PROBE CAN REACH IT** — see below
//   X2  the check-snippet-that-throws refusal (X4b)  probe: the re-tagged block
//   X4  the process.exit() refusal           probe: the process.exit() snippet
//   X4  the `if (false)` refusal             probe: the wrapped assertions
//   X4  the snippet-does-not-RUN report      probe: a snippet that stops producing its result
//   X4  the DEADLINE report                  probe: a snippet that never exits (W104)
//   X4  the RUN_FLOOR ratchet                probe: a whole `run` snippet deleted
//   X3  the `tsc failed:` fallback           covered jointly by the X3 entry below
//   report  a row deleted from the `checks` array — reachable by `agree`, not graded
//   X10 the MISSING-FILES refusal            **NO PROBE CAN REACH IT** — every probe writes the files it stages (W96)
//   X11 the MISSING-INDEX refusal            **NO PROBE CAN REACH IT** — ditto (W96)
//   X11 the EMPTY-DIRECTORY vacuity guard    **NO PROBE CAN REACH IT** — the directory is always the tree's own (W96)
//
// **W104's five remaining clauses are UNREACHABLE BY ANY PROBE and the reason is about
// the FACT rather than about the observer**, which is `doc/workflow.md` rule 8's own
// test for whether a declared ceiling is honest: every probe here mutates the
// REFERENCE, and these are properties of the pool that executes it.
//
//   X4  the COULD-NOT-SPAWN report           a probe would need `process.execPath` to be gone
//   X4  the membership clause (every `run` snippet got a verdict, exactly once)
//   X4  its SECOND SOURCE (the verdict count against the extractor's own `run`-block count)
//   X4  the peak-concurrency clause (the pool reached its declared width)
//   X4  the overlap clause (the recorded times agree the children were concurrent)
//   X4  the REPORT-against-RUN relation (the failures emitted match the failing seats)
//   X4  the width FLOOR — held a third time by the bound in `selfTest` below, which reads
//       `X4_WIDTH` and `X4_WIDTH_FLOOR` out of the check's source
//
// *(The second-source clause was missing from this list and from the count above, for the
// one reason: it was added after both were written. W104's conformity reader, finding 1 —
// one cause, both symptoms.)*
//
// All five are bound by W104's rule 8 set, which edits `check-docs.mjs` rather than the
// reference, and the Record names the cost of each.
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
import { join, dirname, resolve, relative } from 'node:path';
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
    // **Anchored AGNOSTICALLY on the CONDITION and not on what follows it** — rule 7 (b) fired here
    // at W78's confirming gate (`the mutation matched nothing`) because that item's §7 restructure
    // turned three `throw`s into `reject`s, to close a reader's finding that the rejections reached a
    // promise nothing had attached to. *The fix for a reader's finding un-anchored a probe in a file
    // the item did not own, and the GATE is what said so* — which is the shape W74's own row on this
    // self-test records one plan earlier.
    mutate: (t) => t.replace("if (!accepted || again)", "if (accepted || !again)"),
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
  // --- X9: the version README.md tells a consumer to expect, against both manifests — W86 (`h1`) ---
  // **A README-side probe, because X9's subject is the README sentence.** The `mutate` is the
  // identity on AGENTS.md, so the probe declares `X9` alone and the run proves it: a probe that
  // trips a check it did not name is malformed, and this one must trip exactly one.
  {
    name: 'README.md tells a consumer the manifests read a version they do not',
    check: 'X9',
    mutate: (t) => t,
    // The literal moved `0.4.0` -> `0.5.0` with the manifests at W90 and `0.5.0` -> `0.6.0` at W94, and rule 7 (b) would
    // have ABORTED this probe at each. **VERSION-AGNOSTIC since W94**, on W92's precedent for `X7`'s two probes: it reads
    // whatever version the sentence names and replaces it with one no manifest carries, so the next bump re-anchors nothing.
    // **Digits only, and the META pass is why**: W94's first cut wrote `9.9.9-never`, which X9's `[0-9]+.[0-9]+.[0-9]+`
    // does not match — so the probe tripped the *sentence is not where X9 looks* clause instead of the comparison, and
    // the META grading below read it STILL CAUGHT with the comparison disabled. A probe firing for another reason.
    readme: (t) => t.replace(/\*\*The manifests read `[^`]+`/, '**The manifests read `9.9.9`'),
  },
  // --- X7: AGENTS.md's refusal count against spec/flow-definition.md section 5's rows — W65 (`d4`) ---
  // **COUNT-AGNOSTIC since W92**, which moved the count 34 -> 37 and the range end V38 -> V41: both probes were
  // pinned to the literal and would have ABORTED (rule 7 (b)) at every new rule id — *a mutation pinned to a
  // magic number is unmutatable the moment the number is right to change* (P9's declaration). Each now reads
  // whatever the sentence says and moves it by one, so the next item that adds a rule has nothing to re-anchor.
  {
    name: 'AGENTS.md`s refusal count moved up by one while section 5 declares the old count',
    check: 'X7',
    mutate: (t) => t.replace(/There are \*\*(\d+) refusals\*\* over the id range `FD-V1` … `FD-V(\d+)`/, (_m, n, hi) => `There are **${Number(n) + 1} refusals** over the id range \`FD-V1\` … \`FD-V${hi}\``),
  },
  {
    name: 'AGENTS.md`s id range ends one below section 5`s highest row — the range clause alone',
    check: 'X7',
    mutate: (t) => t.replace(/There are \*\*(\d+) refusals\*\* over the id range `FD-V1` … `FD-V(\d+)`/, (_m, n, hi) => `There are **${n} refusals** over the id range \`FD-V1\` … \`FD-V${Number(hi) - 1}\``),
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
    // + X8 since W74: the LAST closing fence in the reference is now section 15's — section 17's since W86, section 18's
    // since W90 and section 20's since W101, and section 19's from W94 until then, each also a snippet X8 pairs, so the declared set is unmoved — and that
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
    // **The DEADLINE, which is `X4`'s fourth shape and had no observer at all** —
    // [W104](../doc/work-items/w104-the-snippet-loop-runs-concurrently.md). `X4` tells four things
    // apart: a snippet that THROWS (exit 1 with a stack), one that calls `process.exit(n)`, one the
    // deadline KILLS (`status === null`, `signal` set) and one that cannot be spawned at all. The
    // first two have probes above; the fourth is reachable by nothing, because `spawn` failing means
    // `process.execPath` is gone. This is the third, and it is the branch W104 added a message for,
    // on [Q425](../doc/open-questions.md): nine sub-second snippets were killed under load and
    // reported as *the snippet does not run*, a sentence about the snippet that was about the clock.
    //
    // **It costs ~26 s, once, and WHAT IT BUYS IS NOT WHAT THIS COMMENT FIRST CLAIMED.** The snippet
    // is held for the full 30 s deadline while the other 31 finish, so this probe's `check-docs` run
    // is ~30 s rather than ~4.6 s — about 4% of the lane W104 takes from 1096 s to 624 s.
    //
    // It said *without this the whole branch could be deleted at 50/50 and 28/28*, and **W104's
    // adequacy reader measured that false**: with this probe in place, `} else if (r.status === null
    // && r.signal) {` replaced by `if (false)` leaves `check:docs` at zero failures and this probe at
    // `ran: yes, outcome: caught`, because the deadline arm and the plain arm report under the SAME id
    // and emit the SAME number of failures. The branch is deletable at 51/51. W104's own ceiling
    // `a6b` says exactly that; this comment said the opposite, in the file that exists to refuse the
    // class. *The message is bound by W104's rule 8 set at a rung that reads the failure LINE, and by
    // nothing here.*
    //
    // **What it does buy, measured, is that the DEADLINE EXISTS.** Delete `timeout: X4_DEADLINE_MS`
    // from the `spawn` options and this probe's document never exits — no exit in 75 s at the
    // `check:docs` rung, so in the lane it is killed by `runOne`'s 300 s timeout and reported
    // not-caught. That is a clause with no other observer anywhere, and it is the honest reason to
    // keep paying the 26 s.
    //
    // Anchored on a TOP-LEVEL declaration in section 7's snippet, which `X8` does not pair (the
    // string occurs once in `AGENTS.md` and not at all in `README.md`), so the declared set is `X4`
    // alone. The snippet's own assertions still run and still pass; the interval is what stops it
    // exiting afterwards, so this probe reaches the deadline and nothing else.
    name: 'a `run` snippet that never exits, so the deadline kills it — X4`s THIRD verdict, and the one Q425 is about',
    check: 'X4',
    mutate: (t) => t.replace('let parked: string | null = null;',
      'let parked: string | null = null;\nsetInterval(() => {}, 1_000);'),
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
  // ---- X10: every CURRENT copy of the L6 counts against what examples/l6.ts declares — W96 (Q171) ----
  // One probe per COPY, because each is found by its own anchored sentence and a probe that moved one copy grades
  // nothing about the other three; one for the OTHER direction (the declaration moves and every copy is stale); and
  // one each for the two clauses that say a subject is not where X10 looks. Each moves its number by ONE and reads
  // whatever the sentence says, so the next L6 change re-anchors nothing (X7's precedent since W92).
  {
    name: 'README.md`s status paragraph states an L6 assertion count one above what l6.ts declares',
    check: 'X10',
    mutate: (t) => t,
    readme: (r) => r.replace(/\*\*plus (\d+) assertions across/, (_m, n) => `**plus ${Number(n) + 1} assertions across`),
  },
  {
    name: 'README.md`s ladder table states an L6 run count one above what l6.ts declares',
    check: 'X10',
    mutate: (t) => t,
    readme: (r) => r.replace(/a real scheduler, \*\*(\d+) runs,/, (_m, n) => `a real scheduler, **${Number(n) + 1} runs,`),
  },
  {
    name: 'examples/README.md`s paragraph under the two commands states an assertion count one below l6.ts`s',
    check: 'X10',
    mutate: (t) => t,
    examples: (e) => e.replace(/run the same \*\*(\d+) assertions/, (_m, n) => `run the same **${Number(n) - 1} assertions`),
  },
  {
    name: 'examples/README.md`s l6.ts row states a run count one below l6.ts`s',
    check: 'X10',
    mutate: (t) => t,
    examples: (e) => e.replace(/\*\*the gate\.\*\* \*\*(\d+) real runs,/, (_m, n) => `**the gate.** **${Number(n) - 1} real runs,`),
  },
  {
    name: 'examples/l6.ts declares one more run while every copy states the old count — the OTHER direction',
    check: 'X10',
    mutate: (t) => t,
    l6: (s) => s.replace(/^const DECLARED_RUNS = (\d+);$/m, (_m, n) => `const DECLARED_RUNS = ${Number(n) + 1};`),
  },
  {
    name: 'README.md`s status paragraph reworded so X10 cannot find the copy it holds',
    check: 'X10',
    mutate: (t) => t,
    readme: (r) => r.replace('**plus ', '**and also '),
  },
  {
    name: 'examples/l6.ts stops declaring its run count where X10 reads it',
    check: 'X10',
    mutate: (t) => t,
    l6: (s) => s.replace(/^const DECLARED_RUNS = /m, 'const DECLARED_RUN_COUNT = '),
  },
  // ---- X11: doc/decisions/README.md against the ADRs on disk, both ways — W96 ----
  // X11 shipped with NO live case (the index was 37 / 37 at W96's declaration), so these two are the whole of its
  // evidence — P8's retro: a check written for a defect you just fixed has no live case.
  {
    name: 'doc/decisions/README.md drops the row for ADR 0067, which is on disk — the unindexed direction',
    check: 'X11',
    mutate: (t) => t,
    adrIndex: (x) => x.split('\n').filter((l) => !l.startsWith('| [0067](')).join('\n'),
  },
  {
    name: 'doc/decisions/README.md gains a row for an ADR that is not on disk — the phantom direction',
    check: 'X11',
    mutate: (t) => t,
    adrIndex: (x) => x.replace(/^(\| \[0067\]\()/m, '| [0099](0099-a-decision-nobody-wrote.md) | nothing | — | 2026-09-26 |\n$1'),
  },
  // ---- X10's ANCHORS, bound — W96's adequacy reader (M2-M5) ----
  // Every current copy was also the FIRST number of its shape in its file, so an anchor loosened to the bare numbers read
  // the same copy and every probe above stayed refused: the wrong selection coinciding with the right one at the default
  // position (`doc/workflow.md` v0.23). Each probe below puts a CORRECT figure in the loose shape AHEAD of the copy and makes
  // the copy itself stale, so a strict anchor fails and a loose one reads the decoy and passes. The two runs-first copies
  // move their ASSERTION count, which no probe above did (M5: that half was compared by nothing).
  {
    name: 'a correct decoy ahead of README.md`s status paragraph, whose own assertion count is stale — the anchor, not the first match',
    check: 'X10',
    mutate: (t) => t,
    readme: (r) => {
      const m = /\*\*plus (\d+) assertions across (\d+) runs/.exec(r);
      return `<!-- ${m[1]} assertions across ${m[2]} runs -->\n` + r.replace(m[0], `**plus ${Number(m[1]) + 1} assertions across ${m[2]} runs`);
    },
  },
  {
    name: 'a correct decoy ahead of README.md`s ladder table, whose own ASSERTION count is stale',
    check: 'X10',
    mutate: (t) => t,
    readme: (r) => {
      const m = /a real scheduler, \*\*(\d+) runs, (\d+) assertions\*\*/.exec(r);
      return `<!-- **${m[1]} runs, ${m[2]} assertions** -->\n` + r.replace(m[0], `a real scheduler, **${m[1]} runs, ${Number(m[2]) + 1} assertions**`);
    },
  },
  {
    name: 'a correct decoy ahead of examples/README.md`s paragraph, whose own run count is stale',
    check: 'X10',
    mutate: (t) => t,
    examples: (e) => {
      const m = /run the same \*\*(\d+) assertions over (\d+) real runs\*\*/.exec(e);
      return `<!-- ${m[1]} assertions over ${m[2]} real runs -->\n` + e.replace(m[0], `run the same **${m[1]} assertions over ${Number(m[2]) + 1} real runs**`);
    },
  },
  {
    name: 'a correct decoy ahead of examples/README.md`s l6.ts row, whose own ASSERTION count is stale',
    check: 'X10',
    mutate: (t) => t,
    examples: (e) => {
      const m = /\*\*the gate\.\*\* \*\*(\d+) real runs, (\d+) assertions\*\*/.exec(e);
      return `<!-- **${m[1]} real runs, ${m[2]} assertions** -->\n` + e.replace(m[0], `**the gate.** **${m[1]} real runs, ${Number(m[2]) + 1} assertions**`);
    },
  },
  {
    // M6: the OTHER direction's other half — no probe moved `DECLARED_TOTAL`, so re-sourcing it to a literal was free.
    name: 'examples/l6.ts declares one more assertion while every copy states the old count',
    check: 'X10',
    mutate: (t) => t,
    l6: (s) => s.replace(/^const DECLARED_TOTAL = (\d+);$/m, (_m, n) => `const DECLARED_TOTAL = ${Number(n) + 1};`),
  },
  {
    name: 'doc/decisions/README.md indexes ADR 0067 twice',
    check: 'X11',
    mutate: (t) => t,
    adrIndex: (x) => x.replace(/^(\| \[0067\]\(.*)$/m, '$1\n$1'),
  },
  {
    name: 'doc/decisions/README.md names ADR 0067`s row by the number 0068',
    check: 'X11',
    mutate: (t) => t,
    adrIndex: (x) => x.replace('| [0067](0067-', '| [0068](0067-'),
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
// **34 since [W86](../doc/work-items/w86-score-each-item-then-fan-out-per-item.md)**, which added
// `X9`'s probe and raised the floor to the count it ships (Q102's ratchet: the item that adds one
// raises it, and it goes stale toward WEAKNESS in silence otherwise).
// **50 since W96**, which added X10's twelve probes and X11's four.
// **51 since [W104](../doc/work-items/w104-the-snippet-loop-runs-concurrently.md)**, which added the
// DEADLINE probe — `X4`'s third verdict, which had no observer of any kind before it.
const MIN_PROBES = 51;

/** The same floor for `META`, and for the same reason. */
// **21 since W86**, which gave `X9`'s comparison clause a grading — the coverage bound below is
// what required one, by deriving `ALL_CHECKS` from `check-docs.mjs`'s own `checks` array.
// **28 since W96**, X10's three reachable clauses and X11's four.
const MIN_META = 28;

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
  // W86 (`h1`): X9's comparison clause. The guard above the `fail` is what is disabled, so
  // `idAt` reads the next `fail('X9'` after the divergence and the coverage bound sees the id.
  ['X9`s comparison clause disabled', 'README.md tells a consumer the manifests read a version they do not',
    (t) => t.replace("    else if (said[1] !== npmV) fail('X9',", "    else if (false) fail('X9',")],
  // W65 (`d4`): X7's two clauses, one probe each.
  ['X7`s count clause disabled', 'AGENTS.md`s refusal count moved up by one while section 5 declares the old count',
    (t) => t.replace('      if (Number(said[1]) !== live) fail', '      if (false) fail')],
  ['X7`s range-end clause disabled', 'AGENTS.md`s id range ends one below section 5`s highest row — the range clause alone',
    (t) => t.replace('      if (Number(said[2]) !== top) fail', '      if (false) fail')],
  ['X6`s `the spec states what AGENTS does not quote` direction disabled — the other way',
    'a cost figure spec/flow-definition.md states that AGENTS.md drops — the OTHER direction',
    (t) => t.replace('      if (extra.length) {', '      if (false) {')],
  // W96: X10's three reachable clauses and X11's four, each named for the probe that trips it alone. X10's missing-files
  // clause and X11's missing-index and empty-directory clauses are UNREACHABLE by any probe and named in the header.
  ['X10`s comparison clause disabled, so a copy of the L6 counts can drift from what l6.ts declares in silence',
    'README.md`s status paragraph states an L6 assertion count one above what l6.ts declares',
    (t) => t.replace('        if (said.assertions !== want.assertions || said.runs !== want.runs) {', '        if (false) {')],
  ['X10`s cannot-find-the-copy clause disabled, so a reworded sentence drops out of the comparison in silence',
    'README.md`s status paragraph reworded so X10 cannot find the copy it holds',
    (t) => t.replace("        if (!m) { fail('X10',", "        if (!m) { if (0) fail('X10',")],
  ['X10`s cannot-find-the-declaration clause disabled, so a renamed DECLARED_RUNS compares nothing',
    'examples/l6.ts stops declaring its run count where X10 reads it',
    (t) => t.replace("      fail('X10', 'examples/l6.ts declares no", "      if (0) fail('X10', 'examples/l6.ts declares no")],
  ['X11`s unindexed direction disabled — an ADR on disk the index does not name',
    'doc/decisions/README.md drops the row for ADR 0067, which is on disk — the unindexed direction',
    (t) => t.replace("    if (unindexed.length) fail('X11',", "    if (false) fail('X11',")],
  ['X11`s phantom direction disabled — an index row naming an ADR not on disk',
    'doc/decisions/README.md gains a row for an ADR that is not on disk — the phantom direction',
    (t) => t.replace("    if (phantom.length) fail('X11',", "    if (false) fail('X11',")],
  ['X11`s duplicate-row clause disabled', 'doc/decisions/README.md indexes ADR 0067 twice',
    (t) => t.replace('    if (duplicated.length) fail(', '    if (false) fail(')],
  ['X11`s row-number clause disabled', 'doc/decisions/README.md names ADR 0067`s row by the number 0068',
    (t) => t.replace('    if (misnumbered.length) fail(', '    if (false) fail(')],
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
  // W96: X10's and X11's subjects, staged the same way — `examples`, `l6` and `adrIndex` beside `readme`.
  const EXTRA = [
    ['examples', 'CHECK_DOCS_EXAMPLES', readFileSync(join(root, 'examples', 'README.md'), 'utf8'), '-examples.md'],
    ['l6', 'CHECK_DOCS_L6', readFileSync(join(root, 'examples', 'l6.ts'), 'utf8'), '-l6.ts'],
    ['adrIndex', 'CHECK_DOCS_ADR_INDEX', readFileSync(join(root, 'doc', 'decisions', 'README.md'), 'utf8'), '-adr.md'],
  ];
  // **Per PROCESS, and removed on the way out including on the abort path — W105.** `dev-dist/` is one
  // flat namespace and this was a FIXED path inside it, `rmSync`d on entry: a META child runs this same
  // function, so a fixed name has the child delete the parent's fixtures underneath it, and two top-level
  // runs do the same to each other ([Q182](../doc/open-questions.md)).
  //
  // The `rmSync` stays and is now load-bearing for a DIFFERENT reason: Windows recycles pids, so a
  // directory left by a killed run can be inherited by a live one. Measured at W105 — nine leaked
  // directories, every one reporting its pid as alive — which is also why reaping by liveness is not
  // the answer and deleting on entry is.
  const dir = join(root, 'dev-dist', `docs-selftest-${process.pid}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  // **`process.on('exit')` rather than a `finally`, because this function returns from fifteen places
  // and each one carries its own `rmSync(dir)` today.** An `exit` handler covers all fifteen plus the
  // one road none of them covers — a throw — which is [Q323](../doc/open-questions.md)'s class and
  // exactly how W103's finding 3 left its stub behind. `SIGKILL` leaks this one directory, which is the
  // stated limit: *one path per killed run, not one per probe*, and that is what nesting buys.
  process.on('exit', () => rmSync(dir, { recursive: true, force: true }));
  /**
   * **The RELATIVE spelling, DERIVED rather than written a second time — W105.** The probes hand the
   * check a relative path in `CHECK_DOCS_DOC`, and that path was a separate template literal naming
   * `dev-dist/docs-selftest/` by hand. Two sources for one directory: pid one and not the other, and
   * the child reads a directory nothing staged into — which is hazard 5's shape and W38's adequacy
   * reader's empty directory printing `ok`.
   */
  const relDir = relative(root, dir).replace(/\\/g, '/');
  // **The flat `.meta-*` mutants are registered too.** Each is written and removed per entry inside a
  // `finally`, so at most one is alive at a time and a kill leaks one FILE beside the one directory —
  // but a throw between the write and the `finally` used to leave it, and a leftover `.mjs` in
  // `dev-dist/` is W103's finding 3's exact shape.
  process.on('exit', () => { for (const p of metaMutants) rmSync(p, { force: true }); });
  const metaMutants = new Set();

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
    // **`X4`'s pool width and its own floor, read out of the check and held HERE** —
    // [W104](../doc/work-items/w104-the-snippet-loop-runs-concurrently.md). The check
    // runs its `run` snippets through a pool and fails if the width is below the floor
    // it declares, which catches the width being lowered and **cannot catch the FLOOR
    // being lowered with it** — the two are literals in one file and so two edits in
    // one diff ([Q217](../doc/open-questions.md)). This is the third edit, in another
    // file: measured, `X4_WIDTH = 1` is `check:docs` EXIT 0 at the pre-W104 wall clock
    // with all 51 probes below still caught, because a serial pool computes the same
    // verdicts more slowly. `README_SNIPPET_FLOOR`'s recorded gap, closed for this one.
    //
    // **The floor this holds is EIGHT and it shipped as TWO** — W104's adequacy reader,
    // BLOCKING: a floor of two against a width of eight passes here, passes in the check,
    // and gives back half the saving (width 2 is 5964 ms against width 8's 4344, +37%).
    // So the value held here is the width itself, which is what `RUN_FLOOR` and
    // `README_SNIPPET_FLOOR` do, and a deliberate retune is three edits in two files.
    //
    // **What it does NOT reach is the width being made INERT rather than smaller.** Both
    // literals can stay at 8 while `pump`'s own condition is narrowed; that is two edits
    // in `check-docs.mjs` and the clauses there are what catch it. This bound reads the
    // declaration and never the behaviour, which is stated rather than implied.
    //
    // **And no probe below can reach it** — every probe mutates the REFERENCE and this is
    // a property of the check's own source, so the header's list names it. *(The reason
    // first written here was that a bound over a `CHECK_DOCS_SCRIPT` mutant would fire on
    // every `META` entry; W104's adequacy reader measured that false — none of the 28
    // mutants touches `X4_WIDTH`. The simpler reason is the right one: the mutants are
    // deliberately broken and are not the shipping configuration, and the path this reads
    // is exactly the script `npm run check:docs` runs.)*
    {
      const w = /^const X4_WIDTH = (\d+);$/m.exec(src);
      const f = /^const X4_WIDTH_FLOOR = (\d+);$/m.exec(src);
      if (!w || !f || Number(f[1]) < 8 || Number(w[1]) < Number(f[1])) {
        console.log('check-docs self-test — `X4`\'s pool width and floor, as check-docs.mjs declares them: ' +
          `width ${w ? w[1] : 'not declared where this reads it'}, floor ${f ? f[1] : 'not declared where this reads it'}.`);
        console.log('  FAIL  the `run` snippets are not executed concurrently at the width W104 measured, ' +
          'or the floor that says so has been lowered with it. Half the saving goes at width 2 and all of ' +
          'it at width 1, and every clause inside check-docs.mjs passes at either.');
        rmSync(dir, { recursive: true, force: true });
        return 1;
      }
    }
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
      // `X\d+` since W96 — with one digit, `fail('X10'` does not match at all (the quote must follow ONE digit), so every
      // X10 and X11 entry read `null` and the bound below failed LOUDLY naming both. W96's declaration said the ids read as
      // `X1` and the bound passed in silence; its conformity reader measured that false. The widening was needed; the
      // silence was not the mechanism.
      return (src.slice(i).match(/fail\('(X\d+)'/) ?? [, null])[1];
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
    const rel = `${relDir}/${String(i).padStart(2, '0')}.md`;
    const mutated = probe.mutate(doc);
    const readmeMutated = probe.readme ? probe.readme(readme) : null;
    const extras = EXTRA.filter(([k]) => probe[k]).map(([k, envName, text, suffix]) => ({ envName, text, suffix, out: probe[k](text) }));
    if (mutated === doc && (readmeMutated === null || readmeMutated === readme) && extras.every((x) => x.out === x.text)) {
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
    for (const x of extras) {
      const xrel = rel.replace(/\.md$/, x.suffix);
      writeFileSync(join(root, xrel), x.out);
      env[x.envName] = xrel;
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
    for (const [, envName] of EXTRA) delete env[envName];
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
    // **FLAT, with the pid in the NAME — and a rung is what corrected this, W105.** A `.meta-*` mutant
    // is a copy of the CHECK, which derives `ROOT = resolve(dirname(self), '..')`, so it must sit
    // exactly one directory below the repository root; W105 first nested it beside the fixtures on the
    // reasoning that a mutant is depth-free, and that is true only of a `.self-*` mutant, which is a copy
    // of this SELFTEST module and receives `ROOT` as a parameter. Nested, the copy reads `dev-dist/` as
    // its tree: `check:spec:selftest` reported **29/29 graded, 0 by the named probe, 29 by the corpus**,
    // which is this file's own *the harness broke rather than the check* clause firing exactly as written.
    const path = join(root, 'dev-dist', `.meta-docs-${process.pid}-${String(i).padStart(2, '0')}.mjs`);
    metaMutants.add(path);
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
