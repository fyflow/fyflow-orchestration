// **The negative tests for `check-source.mjs`, checked in rather than run once by
// hand** — `doc/workflow.md` section 5 rule 7, all three requirements, and rule 8's
// four obligations on the lists this file itself iterates.
//
//   node scripts/check-source.mjs --self-test
//
// **This is the first self-test `check-source` has ever had.** It shipped with W1
// and its negative tests were run by hand once and written into a Record, which is
// the exact thing `check-source.mjs`'s own header says W3 did wrong — *"a probe
// that ran once is a claim about the past"*, one level out from the check it makes
// about `RT-R4`. `check-spec` is still in that position; it is W25's file and not
// this item's, and saying so here is how the gap stays visible.
//
// Every probe declares the **full set** of checks it must trip and the set must
// match exactly (rule 7 (c)). Naming one check does not discriminate: a merely
// malformed probe trips two at once and so satisfies a probe declared as either.
//
// **Three lists live here and each is a loop bound** — `PROBES`, `META`, `SELF` —
// and each has a floor, because `caught === PROBES.length` is **vacuously true at
// zero**. That is W16's adequacy reader's finding on `check-policies`, inherited
// rather than rediscovered.
//
// **There was a FOURTH and it is gone rather than bounded**, which is the more
// useful outcome and took both of W24's readers to reach. The conformity reader
// found this paragraph claiming *three* when `ALL_CHECKS` made it four — a census
// of lists miscounting in the paragraph about censusing lists — and the adequacy
// reader then deleted **nine of that list's thirteen entries for 0 cost**, because
// the nine ids no probe declares are exactly the ones whose job is to catch a probe
// tripping a check it did **not** name. An allowlist on the observing side of a set
// equality narrows the equality to a universe the author chose. So the answer is
// not a fourth floor: `trippedIn()` reads the ids out of the run's own output and
// **the bound does not exist to be broken**.
//
// **What this file does NOT reach.** `scripts/check-policies-selftest.mjs:30-45`
// records the fixed point — **nothing inside a self-grading file can assert that
// the file grades** — and it holds here. But its four named survivors are NOT the
// four here, and **the difference was measured rather than inherited**: this header
// first said *"the same four holes are live"* and two of the four are **caught**.
//
//   caught here, survivors there:
//     `MIN_PROBES` -> `0`, alone AND with the list shortened      -> caught
//     `MIN_META` -> `0` TOGETHER WITH emptying `META`             -> caught
//     `refused = r.status !== 0 && ...` -> `refused = true`       -> caught
//
// **Each is caught because a list one level OUT asserts that the guard FIRES**, not
// that it exists. `MIN_PROBES -> 0`: `SELF` shortens the list, the child no longer
// aborts, and `bounded` comes back short. `MIN_META -> 0` with `META` emptied:
// `SELF`'s `agree` entry needs the child to run `META`, and an empty `META` grades
// nothing. `refused = true`: `META`'s broken-check children pass too, so `noticed`
// is 0. **The hole did not close, it MOVED OUT** — every one of these needs the
// list beyond it, and the last list has nothing beyond it:
//
//   live here, all measured against this file as shipped:
//     `return bounded === SELF.length ? 0 : 1` -> `return 0`       survives
//     `nestedScript` -> `true`  (deletes `META` AND `SELF`)        survives
//     `nestedSelf`   -> `true`  (deletes `SELF`)                   survives
//     `MIN_SELF` -> `0` TOGETHER WITH emptying `SELF`              survives
//     `MIN_META` -> `0` alone                                      survives
//     the "mutation matched nothing" guard -> `if (false)`         survives
//
// Emptying `META` or `SELF` with its floor left alone is caught; it is the floor
// **and** the list together that survives, and only on the outermost list — which
// is exactly the third case `check-policies` records for `MIN_PROBES`, moved two
// lists further out. A fourth list would move it again and would have the same
// hole, which is that file's own argument for writing it down instead. **What
// breaks the regress is a reader** — `doc/workflow.md` section 6 pass 2 — and this
// list is the map of what a reader still has to look at.
//
// **`nestedScript -> true` is W24's own invention and is the biggest of them**,
// found by the adequacy reader against a single `nested` flag: one word, not
// inherited from `check-policies`, and it deletes **every grading this file does
// beyond the probes** while the run still prints its probe results and exits 0.
// Splitting the flag in two did not close it — it made `nestedSelf` a second,
// smaller instance of the same thing. Named because a ceiling list that omits its
// largest hole is worse than no list.
//
// **And the probes cover 4 of `check-source`'s 13 checks** — `S8`, `S11`, `S12`,
// `S13`, the four a manifest can reach. `S1`-`S7`, `S9` and `S10` are pattern lists
// that can each be **emptied entirely for 0 failures** with this file green
// (measured by the adequacy reader), and probing them means mutating `src/`,
// `test/` and `examples/`, which W24's `Owns` excludes and which needs three more
// input overrides. [Q132](../doc/open-questions.md).
//
// **What is NOT on that list, and the correction is the point.** This header
// claimed a fifth survivor of W24's own — *"deleting the `lint` row from `COMPOSED`
// costs 0 failures"* — and offered to raise it as a register row. **It is not a
// survivor and W24's conformity reader measured why.** The claim was made by
// running `check-source` alone (exit 0, which is true) and never running the
// self-test: the probe *"a directory ADDED to lint`s argument list and not
// declared"* is refused by that row and by nothing else, so with the row gone it
// reports `wanted [S13], got []` and `check:source:selftest` — **which is in the
// gate, because this item put it there** — exits 1. Under
// `doc/workflow.md` rule 8's own definition a survivor needs a second independent
// route to confirm the clause was *unreachable*, and the second route here shows it
// **refused**. It is now `META`'s entry *"the lint row deleted from COMPOSED"*.
// **A row this file would have written into `doc/open-questions.md` as a measured
// hole was a measurement that stopped one command early** — the [Q43](../doc/open-questions.md)
// class, in the file that exists to refuse exactly that.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * `half` says which file the probe rewrites — `pkg` for the manifest, `check` for
 * `check-source.mjs` itself — and the other is read from the tree. `check` and
 * `also` together are the exact set of checks the run must report under.
 *
 * **The `check` half exists because two of this item's deliverables are LISTS
 * INSIDE THE SCRIPT** (`GATE_CHAIN` and `COMPOSED`), and rule 8's fourth
 * obligation asks whether one entry can leave and whether the whole list can. A
 * probe that only ever edits `package.json` cannot ask either question.
 */
const PROBES = [
  // --- S12: the gate chain, both directions ----------------------------------
  {
    name: 'a runtime dropped from the gate chain — Q126, reproduced',
    half: 'pkg', check: 'S12',
    // The mutation P8's declaration ran by hand and measured at 0 failures with
    // all eight `check:*` entries exiting 0. This is that measurement, checked in.
    mutate: (t) => t.replace(' && npm run test:l6:deno"', '"'),
  },
  {
    name: 'lint dropped from the gate chain',
    half: 'pkg', check: 'S12',
    mutate: (t) => t.replace(' && npm run lint && ', ' && '),
  },
  {
    name: 'an entry ADDED to the chain and not declared — the direction inclusion cannot see',
    half: 'pkg', check: 'S12',
    // One-way containment catches a deletion and passes an addition. This is why
    // S12 is equality, and it is the probe that fails if it is ever weakened.
    mutate: (t) => t.replace(' && npm run test:l6:deno"', ' && npm run test:l6:deno && npm run test:scratch"'),
  },
  {
    name: 'an entry SWAPPED for another, so the count is unchanged and the set is not',
    half: 'pkg', check: 'S12',
    // **The probe that discriminates equality from a floor**, which is the whole
    // argument against `RUN_FLOOR`'s shape (Q102): sixteen entries before and
    // sixteen after, `test:l6` gone and `test:l6:deno` run twice.
    mutate: (t) => t.replace('npm run test:l6 && npm run test:l6:deno',
      'npm run test:l6:deno && npm run test:l6:deno'),
  },
  {
    name: 'the chain REORDERED, so every entry is present and the sequence is not',
    half: 'pkg', check: 'S12',
    // W24's conformity reader's edit, checked in. Order was not asserted when it
    // ran this and `check-source` exited 0; `&&` in sequence is the only
    // implementation `doc/workflow.md` section 4's ladder has, so L6 could be moved
    // ahead of L0 with the gate green.
    mutate: (t) => t.replace('npm run check:spec && npm run check:source && ',
      'npm run check:source && npm run check:spec && '),
  },
  {
    name: 'a chain segment with a trailing && , which parses to an EMPTY segment',
    half: 'pkg', check: 'S12',
    // **The probe that pins `parts()`' "nothing is filtered out".** Found by the
    // author's own re-run, not by a reader: adding `.filter((s) => s !== '')` to
    // `parts()` left all seventeen probes green, because no probe until this one
    // produced an empty segment.
    mutate: (t) => t.replace(' && npm run test:l6:deno"', ' && npm run test:l6:deno && "'),
  },
  {
    name: 'an entry run TWICE in the chain, which only a MULTISET difference sees',
    half: 'pkg', check: 'S12',
    // **W24's adequacy reader's edit, checked in**, and the case the comment above
    // `GATE_CHAIN` claims: sixteen declared entries, seventeen run, every *name*
    // present. It is refused by the multiset difference, with the message that
    // names the entry; deleting `missingFrom`'s `pool.splice` leaves it refused by
    // the order clause instead, which is why that deletion is not a META entry.
    //
    // *(The reader also measured that the SWAP probe above does not exercise the
    // duplicate half it was written to demonstrate: the swap is caught by the
    // missing-entry direction on its own. This probe is the one that reaches it.)*
    mutate: (t) => t.replace('npm run lint && npm run typecheck &&',
      'npm run lint && npm run lint && npm run typecheck &&'),
  },
  {
    name: 'a chain segment this check cannot classify',
    half: 'pkg', check: 'S12',
    // The aborting-parser clause. P6's retro: a parser that cannot classify a row
    // must say so loudly rather than return a value.
    mutate: (t) => t.replace(' && npm run test:l6 && ', ' && echo half-done && '),
  },
  {
    name: 'an entry deleted from GATE_CHAIN, leaving the gate alone',
    half: 'check', check: 'S12',
    mutate: (t) => t.replace("  'test:l6:deno',\n", ''),
  },
  {
    name: 'GATE_CHAIN emptied entirely — the whole list leaving',
    half: 'check', check: 'S12',
    // W23's adequacy reader's finding, asked of this file's own deliverable: the
    // author bounds the list a row iterates, the reader bounds the list the FILE
    // iterates.
    mutate: (t) => t.replace(/const GATE_CHAIN = \[[\s\S]*?\n\];/, 'const GATE_CHAIN = [];'),
  },

  // --- S13: the composed sub-chains, both directions --------------------------
  {
    name: 'typecheck:deno dropped from the typecheck chain — the only Deno typecheck',
    half: 'pkg', check: 'S13',
    mutate: (t) => t.replace('npm run typecheck:deno && ', ''),
  },
  {
    name: 'build:browser-tests dropped from test:browser — a stale bundle reporting green',
    half: 'pkg', check: 'S13',
    // Anchored on the whole entry: `test:browser:all` contains the same prefix and
    // must NOT be the thing that changes.
    mutate: (t) => t.replace('"test:browser": "npm run build:browser-tests && node scripts/run-browser-tests.mjs"',
      '"test:browser": "node scripts/run-browser-tests.mjs"'),
  },
  {
    name: 'examples/ dropped from lint`s argument list — the whole of L6 un-linted',
    half: 'pkg', check: 'S13',
    // **Two routes, one check.** The declared-parts comparison and the derived
    // coverage clause both fire, which is `doc/workflow.md` rule 8's *second,
    // independent route* rather than a cascade across checks.
    mutate: (t) => t.replace('deno lint src/ test/ examples/ index.ts', 'deno lint src/ test/ index.ts'),
  },
  {
    name: 'a directory ADDED to lint`s argument list and not declared',
    half: 'pkg', check: 'S13',
    mutate: (t) => t.replace('deno lint src/ test/ examples/ index.ts',
      'deno lint src/ test/ examples/ spec/ index.ts'),
  },
  {
    name: 'a part deleted from a COMPOSED row, leaving package.json alone',
    half: 'check', check: 'S13',
    mutate: (t) => t.replace("      'npm run typecheck:deno',\n", ''),
  },
  {
    name: 'a whole row deleted from COMPOSED',
    half: 'check', check: 'S13',
    // Caught by the derived clause — `test:browser`'s command runs another npm
    // script, so `package.json` itself says it is a composed list.
    mutate: (t) => t.replace(/\n  \{\n    name: 'test:browser',\n    split: '&&',\n    parts: \[[^\]]*\],\n  \},/, ''),
  },
  {
    name: 'the typecheck row deleted from COMPOSED',
    half: 'check', check: 'S13',
    // **W24's adequacy reader's edit, checked in, and the bound it exposes is the
    // one v0.9 was written for.** The derived clause loops over `GATE_CHAIN` and
    // only **two** of its sixteen entries reach it — `typecheck` and `test:browser`
    // — and only `test:browser`'s row-deletion was probed. So `if (name ===
    // 'typecheck') continue;` cost **0**, and with it the five sub-typechecks,
    // including the item's own headline example (*dropping `typecheck:deno` drops
    // the only Deno typecheck*), were guarded by nothing. The author bounded the
    // list a ROW iterates; the reader bounded the list the LOOP iterates.
    mutate: (t) => t.replace(/\n  \{\n    name: 'typecheck',\n    split: '&&',\n    parts: \[[^\]]*\],\n  \},/, ''),
  },
  {
    name: 'COMPOSED emptied entirely — the whole list leaving',
    half: 'check', check: 'S13',
    mutate: (t) => t.replace(/const COMPOSED = \[[\s\S]*?\n\];/, 'const COMPOSED = [];'),
  },
  {
    name: 'lint`s coverage left to the DERIVED clause alone — the lint row gone AND examples/ dropped',
    half: 'check', check: 'S13',
    // **The only probe that reaches the derived lint clause on its own, and it
    // needs both halves broken at once.** W24's adequacy reader found that the
    // clause's source expression — `scripts.lint` — could be swapped to read from
    // `COMPOSED` for **0 failures**, because every probe that touches `lint` is
    // also caught by the declared-parts comparison. Probe 10's comment claims *"two
    // routes, one check"*; with only one half broken the harness cannot tell one
    // route from two, since it compares check ids and not failure lines.
    //
    // Removing the declared row leaves the disk walk as the only thing that can
    // fire, so this probe is what makes the two provenance METAs below — the
    // manifest half and the `exampleSources()` half — cost anything at all.
    mutate: (t) => t.replace(/\n  \{\n    name: 'lint',\n    split: 'ws',\n    parts: \[[^\]]*\],\n  \},/, ''),
    alsoPkg: (t) => t.replace('deno lint src/ test/ examples/ index.ts', 'deno lint src/ test/ index.ts'),
  },

  // --- the clauses that were already here, which had no probe at all ----------
  {
    name: 'a check:* entry removed from the gate — S11`s own case, now a cascade',
    half: 'pkg', check: 'S11', also: ['S12'],
    // **The item file declared this as `{S11}` and it was wrong at birth.** S12
    // declares `check:docs` and the chain no longer runs it, so the two fire
    // together — and the cascade is structural rather than incidental: every
    // `check:*` entry is in GATE_CHAIN, so S11 and S12 cannot disagree about one.
    // Set equality is what turned a wrong declaration into a failure instead of a
    // pass, which is rule 7 (c)'s whole claim.
    mutate: (t) => t.replace('npm run check:docs && npm run check:docs:selftest && ', ''),
  },
  {
    name: 'ONE check:* entry removed, leaving its :selftest sibling — the prefix case',
    half: 'pkg', check: 'S11', also: ['S12'],
    // **W24's adequacy reader's edit, checked in.** `S11`'s membership regex ends
    // `(?![:\w])`, and deleting that lookahead cost **0** — because `npm run
    // check:docs` matches inside `npm run check:docs:selftest`, so with the sibling
    // still in the chain S11 goes silent and only S12 fires. The probe above
    // removes BOTH `check:docs` entries, which is why it could not see this.
    //
    // *(The reader's wider point stands and is in the Record: every `check:*` name
    // is in `GATE_CHAIN`, so S12 now subsumes S11's membership half. This probe is
    // what keeps the lookahead from rotting in the meantime.)*
    mutate: (t) => t.replace('npm run check:docs && npm run check:docs:selftest && ',
      'npm run check:docs:selftest && '),
  },
  {
    name: 'a check:* entry pointed at something that is not a check',
    half: 'pkg', check: 'S11',
    // Still in the chain, still exits 0, checks nothing — the survivor of the
    // first version of S11. S12 is silent because the NAME is untouched, which is
    // what makes this probe discriminate S11 from S12 rather than duplicate it.
    mutate: (t) => t.replace('"check:policies": "node scripts/check-policies.mjs"',
      '"check:policies": "node --version"'),
  },
  {
    name: 'a :selftest entry gutted of --self-test, so it runs the plain check twice',
    half: 'pkg', check: 'S11',
    // **W24's conformity reader's sharpest edit, checked in — and it landed on the
    // entry this item adds.** The name stays in the chain, the script exists, S12
    // sees an untouched name and S13 sees no `npm run`, so before this clause the
    // self-test this item exists to build could be wired into the gate and run
    // nothing, at exit 0. All four `:selftest` entries had it.
    mutate: (t) => t.replace('"check:source:selftest": "node scripts/check-source.mjs --self-test"',
      '"check:source:selftest": "node scripts/check-source.mjs"'),
  },
  {
    name: 'the scheduler declared as a runtime dependency',
    half: 'pkg', check: 'S8',
    // `S8` has been in this file since W5 with no checked-in probe. One is cheap
    // here because the manifest half already has a harness.
    mutate: (t) => t.replace('  "devDependencies": {',
      '  "dependencies": {\n    "fyflow-scheduler": "0.3.0"\n  },\n  "devDependencies": {'),
  },
];

/** Every check `check-source.mjs` reports under, in the order it reports them. */
/**
 * **The ids a run reported under, read out of the run's own output.** There is no
 * allowlist, and there was one until W24's adequacy reader deleted nine tenths of it
 * for **0 cost**: with `ALL_CHECKS` narrowed to the four ids some probe declares, a
 * probe that *also* tripped `S2` reported `ok` at 18/18 instead of
 * `wanted [S12], got [S12,S2]`. **The nine ids no probe declares are exactly the
 * ones whose job is to catch a probe tripping a check it did not name** — rule 7
 * (c)'s whole purpose — so an allowlist here narrows set equality to equality over
 * a universe the author chose.
 *
 * The fix is not a floor on the list. **It is not having the list**: a failure line
 * is `  ${check}: ${msg}` by construction, so the ids are in the text and the loop
 * bound disappears rather than being guarded.
 */
const trippedIn = (out) => [...new Set([...out.matchAll(/^ {2}(S\d+): /gm)].map((m) => m[1]))].sort();

/**
 * **A floor on the probe list**, and it is the same guard `check-policies`' P3 puts
 * on `names.length`. `caught === PROBES.length` is vacuously true at zero, so
 * emptying this array — or deleting one probe from it — would report `0/0 probes
 * caught` and exit 0. `SELF` below provokes exactly that.
 */
const MIN_PROBES = 24;

/** The same floor for `META`, and for the same reason. */
const MIN_META = 20;

/** And for `SELF`. */
const MIN_SELF = 3;

/**
 * **The mutations `check-source.mjs` itself is run against, with the WHOLE probe
 * suite re-run against each broken copy.** Every probe above asserts that the check
 * refuses a broken input; **nothing above asserts that the probes notice a broken
 * check.** W16's adequacy reader disabled `check-policies`' verdict, its
 * set-comparison and its matched-nothing guard and watched all nine probes survive.
 *
 * Each entry must make at least one probe stop being caught. An entry that changes
 * the script and costs no probe is a clause with no test, and it reports as FAIL
 * here rather than passing quietly.
 */
const META = [
  // (b) the `Outputs` table's rows, broken so they are PRESENT BUT INERT — which
  // is what W15's and W16's readers found rule-written probes blind to.
  ['S12 disabled', (t) => t.replace('    if (unreadable.length === 0) {', '    if (false) {')],
  ['S12 made one-way — a declared entry missing from the chain is ignored',
    (t) => t.replace('for (const n of missingFrom(GATE_CHAIN, ran)) {', 'for (const n of []) {')],
  ['S12 made one-way the other way — an undeclared entry in the chain is ignored',
    (t) => t.replace('for (const n of missingFrom(ran, GATE_CHAIN)) {', 'for (const n of []) {')],
  // **This entry was FATAL rather than inert and was rewritten.** It first set
  // `const unreadable = []`, which leaves `parsed` holding a `null` and makes the
  // mutant **throw** at `parsed.map((m) => m[1])`. The child exited non-zero
  // because the script crashed, and META's verdict is `r.status !== 0` — so it was
  // scored *noticed* for the wrong reason, which is W6's syntax-error-read-as-a-
  // caught-mutation one level out from the probes, where set equality discriminates
  // and an exit code does not. Found by W24's conformity reader. Emptying the
  // REPORTING loop instead leaves the script running and silent, which is what
  // "present but inert" means.
  ['S12`s unclassifiable segment reported by nobody',
    (t) => t.replace('    for (const s of unreadable) {', '    for (const s of []) {')],
  ['S12`s ORDER comparison disabled',
    (t) => t.replace("          ran.join(' ') !== GATE_CHAIN.join(' ')) {", '          false) {')],
  ['S11`s :selftest clause disabled',
    (t) => t.replace("    if (name.endsWith(':selftest')) {", '    if (false) {')],
  // **The three edits W24's conformity reader made, checked back in** — rule 8's
  // *re-run after acting, with the readers' own edits as probes*. Each is a
  // deletion that leaves `check-source` at exit 0 and is caught only because a
  // probe reaches it.
  ['the lint row deleted from COMPOSED — the reader`s edit, and the survivor W24 wrongly claimed',
    (t) => t.replace(/\n  \{\n    name: 'lint',\n    split: 'ws',\n    parts: \[[^\]]*\],\n  \},/, '')],
  ['the report`s check id read as two characters again — S10-S13 all reported as S1',
    (t) => t.replace("c.slice(0, c.indexOf(' '))", 'c.slice(0, 2)')],
  ['the S12 row deleted from the report`s checks array',
    (t) => t.replace("  'S12 `npm run gate` runs exactly the entries GATE_CHAIN declares',\n", '')],
  // **This one is why the comparison in the probe loop is set equality rather than
  // a count.** A check that reports a real failure under the WRONG label trips the
  // same NUMBER of checks, so `tripped.length === declared.length` passes it and
  // only `tripped.join() === declared.join()` does not. Without it, rule 7 (c) can
  // be downgraded to cardinality with this whole file green.
  ['S12 and S13 swapped, so every count still matches and no set does',
    (t) => t.replaceAll("fail('S12'", "fail('SX'").replaceAll("fail('S13'", "fail('S12'").replaceAll("fail('SX'", "fail('S13'")],
  ['S13`s declared-parts comparison disabled', (t) => t.replace('for (const c of COMPOSED) {', 'for (const c of []) {')],
  ['S13`s derived clause disabled — the one that counts COMPOSED from package.json',
    (t) => t.replace('  for (const name of GATE_CHAIN) {\n    const cmd = scripts[name]', '  for (const name of []) {\n    const cmd = scripts[name]')],
  // (c) PROVENANCE — the SOURCE EXPRESSION and nothing else (v0.9's procedure,
  // after Q112 corrected this four times across three items). The value under
  // attack is *what the gate actually runs*; each of these two reads it from the
  // declaration instead of from the manifest, and edits no projection, no expected
  // literal and no second line.
  // (a) a clause of the new check with no probe until the reader wrote one.
  //
  // **`missingFrom`'s `pool.splice` is NOT here, and the reason is a measurement.**
  // W24's adequacy reader found it deletable for 0 failures, against the code as it
  // stood before the conformity reader's order finding was acted on. With order
  // asserted, sequence equality implies multiset equality, so deleting that line
  // **changes no verdict** — the duplicate-entry probe above is still refused, by
  // the order clause, with a message that says *in a different ORDER* about a
  // duplicate. A META entry has to make a probe stop being caught, and this one
  // cannot: it degrades a message and the harness compares check ids. Recorded in
  // `check-source.mjs` beside the line and in the header's ceiling list rather than
  // dressed up as a grading that fires.
  ['the derived clause`s loop narrowed to skip typecheck',
    (t) => t.replace("    const cmd = scripts[name] ?? '';\n    if (!/\\bnpm run /.test(cmd)) continue;",
      "    const cmd = scripts[name] ?? '';\n    if (name === 'typecheck') continue;\n    if (!/\\bnpm run /.test(cmd)) continue;")],
  ['the whole checks array emptied, so the report says nothing at all',
    (t) => t.replace(/const checks = \[[\s\S]*?\n\];/, 'const checks = [];')],
  // (c) PROVENANCE, two more — both reached only by the both-halves probe above.
  ['lint`s command read from COMPOSED instead of from package.json',
    (t) => t.replace("  const lintCmd = scripts.lint ?? '';",
      "  const lintCmd = COMPOSED.find((c) => c.name === 'lint')?.parts.join(' ') ?? '';")],
  ['the linted trees read from a literal instead of from the walks this script does',
    (t) => t.replace('const walked = new Set([...files, ...browserBundleInputs(), ...exampleSources()].map((p) => {',
      "const walked = new Set(['src/', 'test/', 'index.ts'].map((p) => {")],
  ['the chain read from GATE_CHAIN instead of from package.json',
    (t) => t.replace("const gate = typeof scripts.gate === 'string' ? scripts.gate.trim() : '';",
      "const gate = GATE_CHAIN.map((n) => 'npm run ' + n).join(' && ');")],
  ['each sub-chain read from its own declaration instead of from package.json',
    (t) => t.replace("    const cmd = typeof scripts[c.name] === 'string' ? scripts[c.name].trim() : '';",
      "    const cmd = c.parts.join(c.split === '&&' ? ' && ' : ' ');")],
  ['every failure swallowed', (t) => t.replace('const fail = (check, msg) => failures.push(`${check}: ${msg}`);', 'const fail = () => {};')],
  ['the non-zero exit removed', (t) => t.replace('  process.exit(1);', '  process.exitCode = 0;')],
];

/**
 * **The mutations THIS file is run against**, which is rule 8's fourth obligation
 * turned on the harness: `PROBES` is a loop bound, so ask whether one entry can
 * leave it and whether the whole list can. Both must make the self-test exit
 * non-zero, and `MIN_PROBES` is the only thing that makes them.
 *
 * The third case — lowering `MIN_PROBES` **and** shortening the list — is measured
 * and **survives**, exactly as `check-policies-selftest.mjs` records. It is in the
 * header's ceiling list rather than here, because a list that requires its entries
 * to be caught cannot hold an entry that is not.
 */
const SELF = [
  ['one probe deleted from PROBES', (t) => t.replace(/\n  \{\n    name: 'the scheduler declared as a runtime dependency',[\s\S]*?\n  \},/, '')],
  ['PROBES emptied entirely', (t) => t.replace(/const PROBES = \[[\s\S]*?\n\];/, 'const PROBES = [];')],
  // **The report-row agreement, which only `META` can show is load-bearing.**
  // Disabling it leaves every probe caught — it only ever tightens — so no probe
  // sees it. But two META entries (the check-id repair reverted, a row deleted from
  // the report array) are noticed *because of it*, so with it gone `noticed` falls
  // short and this file exits 1. That is the shape a `SELF` entry has to have: a
  // mutation the probes cannot see and the gradings can.
  ['the report-row agreement disabled, which no probe can see',
    (t) => t.replace(/const agree = rows\.join\('.'\) === tripped\.join\('.'\);/, 'const agree = true;')],
];

export async function selfTest(root) {
  const dir = join(root, 'dev-dist', 'source-selftest');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  // **The script under test.** `CHECK_SOURCE_SCRIPT` is how the META pass points
  // this same suite at a deliberately broken copy of it; a `check`-half probe
  // mutates whatever that resolves to, so a META mutation and a probe mutation
  // compose rather than the probe reverting the META.
  const script = process.env.CHECK_SOURCE_SCRIPT ?? join(root, 'scripts', 'check-source.mjs');
  // **Two nesting modes, not one, and the difference is what a child is allowed to
  // grade.** A `META` child is running against a deliberately broken check, so it
  // must not grade anything — it exists to answer *did the probes notice*. A `SELF`
  // child is running a mutated copy of THIS file against the real check, so it must
  // run `META` as well: a guard whose only effect is inside `META` is invisible to
  // a child that skips it, which is how the `agree` entry in `SELF` first came back
  // *"the floor did not fire"* against a mutation that is genuinely load-bearing.
  const nestedScript = !!process.env.CHECK_SOURCE_SCRIPT;
  const nestedSelf = !!process.env.CHECK_SOURCE_SELFTEST;
  const nested = nestedScript || nestedSelf;
  const source = {
    pkg: readFileSync(join(root, 'package.json'), 'utf8'),
    check: readFileSync(script, 'utf8'),
  };

  if (PROBES.length < MIN_PROBES || META.length < MIN_META || SELF.length < MIN_SELF) {
    console.log(`check-source self-test — ${PROBES.length} probes (floor ${MIN_PROBES}), ` +
      `${META.length} meta (floor ${MIN_META}), ${SELF.length} self (floor ${MIN_SELF}).`);
    console.log('  FAIL  a list is short, and `caught === length` is vacuous at zero.');
    rmSync(dir, { recursive: true, force: true });
    return 1;
  }

  console.log(`check-source self-test — ${PROBES.length} probes\n`);
  let caught = 0;
  for (const [i, probe] of PROBES.entries()) {
    const stem = `dev-dist/source-selftest/${String(i).padStart(2, '0')}`;
    const mutated = probe.mutate(source[probe.half]);
    if (mutated === source[probe.half]) {
      // A probe that changes nothing passes for the wrong reason — the exact
      // vacuity rule 7 (b) refuses.
      console.log(`  FAIL  ${probe.check}  ${probe.name} — the mutation matched nothing`);
      continue;
    }
    const env = { ...process.env };
    let run = script;
    // **`alsoPkg` breaks the manifest as well as the check**, and exists because one
    // clause here can only be reached with both halves broken: while `COMPOSED`
    // still declares `lint`'s arguments, the declared-parts comparison catches
    // everything the derived disk-walk clause would, so the derived clause's own
    // source can be swapped for free. A probe that mutates one half cannot
    // distinguish one route from two.
    if (probe.alsoPkg) {
      const p = probe.alsoPkg(source.pkg);
      if (p === source.pkg) {
        console.log(`  FAIL  ${probe.check}  ${probe.name} — the alsoPkg mutation matched nothing`);
        continue;
      }
      writeFileSync(join(root, `${stem}.json`), p);
      env.CHECK_SOURCE_PKG = `${stem}.json`;
    }
    if (probe.half === 'pkg') {
      writeFileSync(join(root, `${stem}.json`), mutated);
      env.CHECK_SOURCE_PKG = `${stem}.json`;
    } else {
      // **Written one level down from ROOT, in `dev-dist/`.** `check-source.mjs`
      // derives `ROOT` as `resolve(dirname(self), '..')`, so a copy must sit
      // exactly one directory below the repository root or it reads a different
      // tree. `check-policies-selftest.mjs` uses `scripts/` for the same reason and
      // that is one level too — but `scripts/` is TRACKED and `dev-dist/` is
      // gitignored, so an interrupted run there leaves untracked files in the
      // directory `doc/workflow.md` section 7 rule 2's by-hand `git status` audit
      // reads. W24's conformity reader's finding; `dev-dist/` costs nothing.
      run = join(root, 'dev-dist', `.probe-${String(i).padStart(2, '0')}.mjs`);
      writeFileSync(run, mutated);
    }
    let r;
    try {
      r = spawnSync(process.execPath, [run], { cwd: root, encoding: 'utf8', env, timeout: 300_000 });
    } finally {
      if (probe.half === 'check') rmSync(run, { force: true });
    }
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
    // The set of checks that actually reported a failure, compared against the set
    // this probe declared. **Equality, not membership**: a probe that trips a check
    // it did not name is malformed, and a malformed probe reported as caught is the
    // whole reason this file exists.
    //
    // Read from the FAILURE LINES, which say which check owns each failure.
    const declared = [probe.check, ...(probe.also ?? [])].sort();
    const tripped = trippedIn(out);
    // **AND from the per-check REPORT ROWS, which are a second, independent
    // projection of the same fact.** W24's conformity reader found that the report
    // was a list nothing counted: reverting the check-id repair (`c.slice(0, 2)`,
    // which read `S10`-`S13` all as `S1`) printed **thirteen `ok` rows above eleven
    // listed failures** and cost 0 probes, and deleting a row from the `checks`
    // array cost 0 as well. Requiring the two projections to agree is what makes a
    // repair to the report breakable — `doc/workflow.md` rule 8's *break the fix
    // and watch the gate go red*, which that repair could not otherwise satisfy.
    const rows = [...out.matchAll(/^ {2}(ok {2}|FAIL) {2}(S\d+) /gm)]
      .filter((m) => m[1] === 'FAIL').map((m) => m[2]).sort();
    const agree = rows.join(',') === tripped.join(',');
    const refused = r.status !== 0 && tripped.join(',') === declared.join(',') && agree;
    if (refused) caught++;
    console.log(`  ${refused ? 'ok  ' : 'FAIL'}  ${probe.check}  ${probe.name}` +
      (refused ? '' : `  — exited ${r.status}, wanted [${declared.join(',')}], ` +
        `got [${tripped.join(',')}]${agree ? '' : `, report rows said [${rows.join(',')}]`}`));
    // The META pass only reads this run's exit code, so once a probe has gone
    // uncaught the answer is settled and the remaining spawns are waste.
    if (nested && !refused) break;
  }
  console.log(`\n${caught}/${PROBES.length} probes caught.`);
  if (caught !== PROBES.length) { rmSync(dir, { recursive: true, force: true }); return 1; }
  if (nestedScript) { rmSync(dir, { recursive: true, force: true }); return 0; }

  // --- the META pass: does this suite NOTICE a broken check? -------------------
  const checkSource = readFileSync(join(root, 'scripts', 'check-source.mjs'), 'utf8');
  let noticed = 0;
  console.log(`\nand against a broken check — ${META.length} mutations of check-source.mjs itself\n`);
  for (const [i, [name, mutate]] of META.entries()) {
    const broken = mutate(checkSource);
    if (broken === checkSource) {
      console.log(`  FAIL  ${name} — the mutation matched nothing`);
      continue;
    }
    const path = join(root, 'dev-dist', `.meta-${String(i).padStart(2, '0')}.mjs`);
    writeFileSync(path, broken);
    let ok = false;
    try {
      const r = spawnSync(process.execPath, [join(root, 'scripts', 'check-source.mjs'), '--self-test'],
        { cwd: root, encoding: 'utf8', timeout: 900_000,
          env: { ...process.env, CHECK_SOURCE_SCRIPT: path } });
      ok = r.status !== 0;
    } finally { rmSync(path, { force: true }); }
    if (ok) noticed++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}${ok ? '' : ' — the probes passed against a check that does not check'}`);
    // Same reason as the probe loop's break: a SELF child is read for its exit
    // code alone, so once a grading has failed the remaining spawns are waste.
    if (nestedSelf && !ok) break;
  }
  console.log(`\n${noticed}/${META.length} noticed.`);
  if (noticed !== META.length) { rmSync(dir, { recursive: true, force: true }); return 1; }
  if (nestedSelf) { rmSync(dir, { recursive: true, force: true }); return 0; }

  // --- the SELF pass: does the probe LIST have a bound? ------------------------
  const selfSource = readFileSync(join(root, 'scripts', 'check-source-selftest.mjs'), 'utf8');
  let bounded = 0;
  console.log(`\nand against a shortened probe list — ${SELF.length} mutations of this file\n`);
  for (const [i, [name, mutate]] of SELF.entries()) {
    const broken = mutate(selfSource);
    if (broken === selfSource) {
      console.log(`  FAIL  ${name} — the mutation matched nothing`);
      continue;
    }
    const path = join(root, 'dev-dist', `.self-${String(i).padStart(2, '0')}.mjs`);
    writeFileSync(path, broken);
    let ok = false;
    try {
      const r = spawnSync(process.execPath, [join(root, 'scripts', 'check-source.mjs'), '--self-test'],
        { cwd: root, encoding: 'utf8', timeout: 900_000,
          env: { ...process.env, CHECK_SOURCE_SELFTEST: path } });
      ok = r.status !== 0;
    } finally { rmSync(path, { force: true }); }
    if (ok) bounded++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}${ok ? '' : ' — the floor did not fire'}`);
  }
  rmSync(dir, { recursive: true, force: true });
  console.log(`\n${bounded}/${SELF.length} bounded.`);
  return bounded === SELF.length ? 0 : 1;
}
