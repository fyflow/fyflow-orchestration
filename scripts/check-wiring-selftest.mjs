#!/usr/bin/env node
// **The negative tests for `check-wiring.mjs`, checked in rather than run once by
// hand** — `doc/workflow.md` rule 7 (b), and [W38](../doc/work-items/w38-the-dispatch-nothing-binds.md).
//
//   node scripts/check-wiring.mjs --self-test
//
// Three passes, on the shape `check-policies-selftest.mjs` settled into:
//
//   PROBES  break an INPUT and require `check-wiring` to refuse it, naming exactly
//           the checks the probe declares. **Sixteen**: seven dispatches falsified,
//           one per `:selftest` entry INCLUDING this check's own — which is what makes
//           the check self-covering — plus one that breaks routing while leaving the
//           dispatch's shape intact (`G1` alone), three that break the shape while
//           leaving routing intact (`G2`, two of them alone),
//           four manifests (`G3`), and one unreadable manifest, the only probe whose
//           expected report row is `NOT RUN`.
//   META    break the CHECK itself and require a named probe to notice. **Eight
//           against fourteen `fail()` sites — three `G1`, seven `G2`, four `G3` — and
//           the cap is stated rather than padded**: one entry per DISTINCT mechanism,
//           plus the report block, which no set comparison can see
//           ([Q100](../doc/open-questions.md)). The six not covered are the arms that
//           report a variant of a covered arm's message under the same id, where a
//           second entry would grade STILL CAUGHT by co-firing rather than by
//           reaching anything new. *(The first version of this header said "one entry
//           per `fail()` site", which was false by four before `G3` existed and by ten
//           after. W38's conformity reader.)*
//   SELF    break THIS FILE and require it to stop reporting success. W31's shape, and
//           W38's adequacy reader asked for it by name: without one, the verdict line
//           becomes `return 0` for **zero** failures, and the floor is lowerable to
//           nothing, printing `0/0 probes caught` at exit 0. **Six.**
//
// **A probe declares the SET of checks it must trip** (rule 7 (c)) and this file
// compares by equality: a probe that trips a check it did not name is malformed, and
// a malformed probe reported as caught is the defect W6 shipped and P3's retro
// turned into a rule. **The seven dispatch probes declare `G1` AND `G2`, because the
// mutation genuinely breaks both** — W29's co-firing, which the failure count and the
// report rows can both see; the four single-clause probes are what show the two are
// not one clause written twice.
//
// **v0.11's harness requirement**: the run below opens with a CONTROL — an unmutated
// copy, driven through the same path the probes take, which must run, must NOT be
// graded, and **must have staged a file for every check**. That last clause is W38's
// adequacy reader's: a control that asserts only *it was green* passes while staging
// nothing, and so does the check it is controlling for.
//
// **Every mutation is written to a COPY; the tree is never touched.**

import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * The seven checks whose dispatch `G1` and `G2` test — **declared here and compared
 * to `package.json` inside the run, both ways and for distinctness.**
 *
 * W38's adequacy reader: with the list a bare literal, `['spec','source','spec',
 * 'source','spec','source']` costs **zero** — six entries, two distinct, `MIN_PROBES`
 * satisfied, four checks unprobed. `S12`'s shape, one file over.
 */
const CHECKS = ['spec', 'source', 'wiring', 'markdown', 'scheduler', 'policies', 'docs'];

/** A literal newline, so the anchors below are not written as escapes in prose. */
const NL = '\n';

/** The one condition a dispatch may carry, matched verbatim by `G2`. */
const DISPATCH = "if (process.argv.includes('--self-test')) {";

const G1_PROBES = CHECKS.map((c) => ({
  name: `check-${c}.mjs stops routing --self-test`,
  file: `check-${c}.mjs`,
  check: 'G1',
  // **Declares BOTH, because this mutation genuinely breaks both properties** —
  // a falsified condition is not the verbatim dispatch `G2` requires, so the two
  // clauses CO-FIRE here. W29's distinction: co-firing is visible in the failure
  // count and in the report rows, both of which this file compares; masking is not.
  // The discriminating cases are kept below — a `G2`-only probe and a `G1`-only one.
  also: ['G2'],
  // **Anchored to a line start, and not anchoring it cost a run.** A bare
  // `replace(DISPATCH, …)` rewrote `check-wiring.mjs`'s own `const DISPATCH = "…"`
  // declaration — the first occurrence in that file — leaving the real dispatch
  // untouched, so the probe ran a working check and reported it as SURVIVED. **The
  // same self-quotation defect `G2` had just found in the check**, in the probe
  // written to test it, within the hour. W25: a literal that quotes the code is a
  // false match for it.
  mutate: (t) => t.replace(NL + DISPATCH, NL + 'if (false) {'),
}));

/**
 * **The one mutation that breaks routing and leaves the dispatch's SHAPE intact** —
 * the discriminating case for `G1`, and the reason `G1` runs the script rather than
 * reading it. Every clause `G2` states still holds: the override is read, the default
 * is this check's own, the exit is a top-level statement. The module simply does not
 * answer, and only running it can tell.
 */
const G1_ONLY = [{
  name: 'check-spec.mjs imports a module its own declaration does not name',
  file: 'check-spec.mjs',
  check: 'G1',
  // **A later write overrides the declared source** — rule 8's provenance shape,
  // applied to the dispatch. `G2` reads the `const mod = ... ?? ...` declaration and
  // every clause it states still holds; the import simply uses something else. The
  // first attempt here was `.catch(() => ({ selfTest: async () => 0 }))`, which is
  // **vacuous**: the import never fails, so the probe reported SURVIVED against a
  // working check. Rule 8's requirement on the set, caught by the set.
  mutate: (t) => t.replace('  const { selfTest } = await import(pathToFileURL(resolve(ROOT, mod)).href);',
    "  const via = join(ROOT, 'scripts', 'check-spec-selftest-renamed.mjs');" + NL +
    '  const { selfTest } = await import(pathToFileURL(resolve(ROOT, via)).href);'),
}];

/**
 * **`G3`'s probes are MANIFESTS rather than mutated scripts**, because `G3`'s subject
 * is `package.json` and its authority is the `scripts/` directory listing. Each is
 * derived from the real manifest inside the run, so none can go stale against it.
 */
const G3_PROBES = [
  {
    // **The adequacy reader's own mutation.** `S12` compares entry NAMES and is
    // silent; `G3` compares the entry's ARGUMENT to the file on disk.
    name: 'check:wiring is repointed at another check`s script',
    file: null,
    check: 'G3',
    env: (dir) => ({ CHECK_WIRING_PKG: `${dir}/pkg-repoint.json` }),
    mutate: (t) => t,
  },
  {
    name: 'both check:wiring entries are deleted from the manifest and the chain',
    file: null,
    check: 'G3',
    env: (dir) => ({ CHECK_WIRING_PKG: `${dir}/pkg-deleted.json` }),
    mutate: (t) => t,
  },
  {
    // **The entry survives and the CHAIN does not** — the half `S12` would catch on
    // its own list and cannot catch on a list derived from disk. Found by running the
    // item's rule-8 set: with only the two probes above, dropping this clause cost
    // zero failures.
    name: 'check:wiring exists but is dropped from scripts.gate',
    file: null,
    check: 'G3',
    env: (dir) => ({ CHECK_WIRING_PKG: `${dir}/pkg-unchained.json` }),
    mutate: (t) => t,
  },
  {
    // The other direction, likewise a survivor until this probe existed: an entry
    // naming a check that is not on disk.
    name: 'the manifest carries entries for a check that does not exist',
    file: null,
    check: 'G3',
    env: (dir) => ({ CHECK_WIRING_PKG: `${dir}/pkg-ghost.json` }),
    mutate: (t) => t,
  },
];

/**
 * **The unreadable-manifest arm, which no staged script can reach** — the conformity
 * reader found it documented as an input and exercised by nothing. `CHECK_WIRING_PKG`
 * is the only way in, so this probe carries an `env` rather than a mutation, and it is
 * the one probe whose report rows must ALL read `NOT RUN`: with no manifest there are
 * no entries, so no clause runs and every row says so.
 */
const PKG_PROBE = [{
  name: 'package.json cannot be parsed, so there are no entries to check',
  file: null,
  check: 'G1',
  // **The one probe whose report rows must ALL read `NOT RUN`**, declared here so
  // that a `NOT RUN` row is a disagreement for every other probe.
  notRun: true,
  env: (dir) => ({ CHECK_WIRING_PKG: `${dir}/broken-package.json` }),
  mutate: (t) => t,
}];


/**
 * **`G2`'s probes, and the reason they are a separate family.** `G1` sets
 * `CHECK_<NAME>_SELFTEST` on every run and the gate never does, so `G1` cannot see
 * anything about the branch taken when the override is unset. These three break that
 * branch three ways, and their declared sets differ, which is what shows the two
 * clauses are not the same clause twice.
 */
const G2_PROBES = [
  {
    name: 'check-spec.mjs guards its exit on the override being set',
    file: 'check-spec.mjs',
    check: 'G2',
    // **The measured defect, verbatim** — `G1` green, `check:wiring:selftest` green,
    // and `npm run check:spec:selftest` printing the plain spec check at exit 0 with
    // 18 probes unrun. `G1` still passes because `G1` is what sets that variable.
    mutate: (t) => t.replace('  process.exit(await selfTest(ROOT));',
      '  if (process.env.CHECK_SPEC_SELFTEST) process.exit(await selfTest(ROOT));'),
  },
  {
    name: 'check-spec.mjs defaults to another check`s self-test',
    file: 'check-spec.mjs',
    check: 'G2',
    mutate: (t) => t.replace("'check-spec-selftest.mjs'", "'check-docs-selftest.mjs'"),
  },
  {
    // **Declares BOTH, and that is why it is kept.** Drop the override name and `G1`
    // has nowhere to point its stub, so it runs the real self-test and the exit is
    // not the sentinel. Two clauses, one mutation, different reasons — the
    // discriminating case rule 7 (c) asks for.
    name: 'check-spec.mjs stops reading its override variable',
    file: 'check-spec.mjs',
    check: 'G2',
    also: ['G1'],
    mutate: (t) => t.replace('process.env.CHECK_SPEC_SELFTEST ?? ', ''),
  },
];

const PROBES = [...G1_PROBES, ...G1_ONLY, ...G2_PROBES, ...G3_PROBES, ...PKG_PROBE];

/** Vacuous at zero, which is the floor `check-policies-selftest.mjs` taught. */
const MIN_PROBES = 16;
const MIN_META = 8;
const MIN_SELF = 6;

const ALL_CHECKS = ['G1', 'G2', 'G3'];

/**
 * **The mutations `check-wiring.mjs` itself is run against**, each naming the probe
 * that must stop noticing. Every probe above asserts the check refuses a broken
 * input; these assert a probe notices when the check stops checking.
 */
const META = [
  ['G1`s routing clause disabled',
    'check-spec.mjs stops routing --self-test',
    (t) => t.replace("fail('G1', `${rel(script)} does not ROUTE", "[].push(`${rel(script)} does not ROUTE")],
  // **The report block, which no set comparison can see** — [Q100](../doc/open-questions.md).
  // Forcing every row to `ok` leaves the failure ids unchanged, so only a second
  // projection of the same fact can discriminate: the `agree` check below.
  ['the report prints `ok` for every row, verdict and NOT RUN alike',
    'check-source.mjs stops routing --self-test',
    (t) => t.replace("console.log(`  ${didRun ? (n ? `FAIL  ` : 'ok    ') : 'NOT RUN'}",
      "console.log(`  ${'ok    '}")],
  ['G2`s unconditional-exit clause disabled',
    'check-spec.mjs guards its exit on the override being set',
    (t) => t.replace("fail('G2', `${rel(file)}'s dispatch does not exit", "[].push(`${rel(file)}'s dispatch does not exit")],
  ['the unreadable-manifest arm stops reporting',
    'package.json cannot be parsed, so there are no entries to check',
    (t) => t.replace("fail('G1', `${PKG_PATH} is unreadable", "[].push(`${PKG_PATH} is unreadable")],
  ['G2 stops counting the entries it never read',
    'check-spec.mjs stops routing --self-test',
    (t) => t.replace('    read.push(name);', '')],
  ['G3`s argument clause stops reporting',
    'check:wiring is repointed at another check`s script',
    (t) => t.replace("fail('G3', `\"${entry}\" runs", '[].push(`\"${entry}\" runs')],
  ['G3`s missing-entry clause stops reporting',
    'both check:wiring entries are deleted from the manifest and the chain',
    (t) => t.replace("fail('G3', `scripts/check-${base}.mjs carries", '[].push(`scripts/check-${base}.mjs carries')],
  ['G1 stops counting the entries it skipped',
    'check-spec.mjs stops routing --self-test',
    (t) => t.replace('    tested.push(name);', '')],
];

/**
 * **The mutations of THIS FILE, each of which must stop it exiting 0.** W31's
 * `SELF` shape. The child runs the whole probe pass against the real check with
 * `CHECK_WIRING_NESTED_SELF` set, so it grades neither `META` nor `SELF` — the
 * regress stops one list out, exactly as W31 measured, and this list is what makes
 * that one list load-bearing.
 */
const SELF = [
  // **Graded on the REPORT rather than on the exit code, which is P9's own rule.**
  // Forcing the verdict alone changes nothing on a green tree — there is nothing to
  // suppress — so the entry compounds it with a probe made vacuous: a correct file
  // then exits 1, and the mutant exits **0** while still printing `11/12`. The
  // evidence is that printed line. *The exit code cannot tell a detection from a
  // suppression; the count can.*
  ['the verdict is forced to 0 while one probe is made vacuous',
    (t) => t.replace('  return done(bad || ungraded || unbounded ? 1 : 0);', '  return done(0);')
      .replace('  if (!meta) return done(bad ? 1 : 0);', '  if (!meta) return done(0);')
      .replace("  mutate: (t) => t.replace(NL + DISPATCH, NL + 'if (false) {'),",
        '  mutate: (t) => t,'),
    (out) => { const m = /(\d+)\/(\d+) probes caught/.exec(out); return !!m && m[1] !== m[2]; }],
  ['MIN_PROBES is lowered and PROBES emptied',
    (t) => t.replace('const MIN_PROBES = 16;', 'const MIN_PROBES = 0;')
      .replace('const PROBES = [...G1_PROBES, ...G1_ONLY, ...G2_PROBES, ...G3_PROBES, ...PKG_PROBE];', 'const PROBES = [];')],
  ['MIN_PROBES is lowered, PROBES emptied, and the per-check coverage bound removed',
    (t) => t.replace('const MIN_PROBES = 16;', 'const MIN_PROBES = 0;')
      .replace('const PROBES = [...G1_PROBES, ...G1_ONLY, ...G2_PROBES, ...G3_PROBES, ...PKG_PROBE];', 'const PROBES = [];')
      .replace('    if (missing.length) {', '    if (false) {')],
  ['ALL_CHECKS is emptied, so no probe can trip anything',
    (t) => t.replace("const ALL_CHECKS = ['G1', 'G2', 'G3'];", 'const ALL_CHECKS = [];')],
  ['CHECKS repeats one name instead of naming seven',
    (t) => t.replace("const CHECKS = ['spec', 'source', 'wiring', 'markdown', 'scheduler', 'policies', 'docs'];",
      "const CHECKS = ['spec', 'source', 'spec', 'source', 'spec', 'source', 'spec'];")],
  ['CHECKS drops a check the manifest has an entry for',
    (t) => t.replace("'policies', 'docs'];", "'policies'];")],
];

// **What a `SELF` list buys nothing against here, stated rather than padded around.**
// The child runs with `CHECK_WIRING_NESTED_SELF` set and returns after the probe
// pass, so **`MIN_META`, `MIN_SELF`, the `META` list and this list are all invisible
// to it** — lowering either floor and emptying either list costs zero, and no entry
// here can change that. That is W31's own measured limit — *the regress stops at the
// first thing that can return early* — and inventing an entry that appears to cover
// it would be a provocation that fires for the wrong reason. The control's
// staged-count assertion is likewise unbounded and deliberately kept: `G1`'s own
// entry count already fails when nothing is staged, so the assertion is a second
// projection rather than the only one.

const RAN = (out) => /^(All checks passed|\d+ failure\(s\)\.)/m.test(out);

const verdict = (probe, r) => {
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  const declared = [probe.check, ...(probe.also ?? [])].sort();
  const tripped = ALL_CHECKS.filter((x) => out.includes(`${x}: `));
  const refused = r.status !== 0 && tripped.join(',') === declared.join(',');
  const why = refused ? '' : `  — exited ${r.status}, wanted [${declared.join(',')}], got [${tripped.join(',')}]`;
  // **A second projection of the same fact**: the report row must agree with the
  // failures. A mutation to how a verdict is DISPLAYED leaves the id set untouched.
  // **`NOT RUN` is a third state, and WHICH probe may see it is DECLARED rather than
  // blanket-exempted.** The first version exempted any row in that state, and rule 8
  // found the hole in one provocation: `ran.G1 = false` makes the clause report
  // `NOT RUN` while it runs and fails, and all sixteen probes still passed. Only the
  // probe that takes the manifest away expects it, and it says so — so everywhere
  // else a `NOT RUN` row is a disagreement, which is what W5 asked that state to be
  // for. The forced-`ok` META entry breaks this either way.
  const rowOf = (x) => (new RegExp(`NOT RUN\\s+${x}`).test(out) ? 'notrun'
    : new RegExp(`FAIL\\s+${x}`).test(out) ? 'fail' : 'ok');
  const agree = ALL_CHECKS.every((x) => (probe.notRun
    ? rowOf(x) === 'notrun'
    : rowOf(x) === (tripped.includes(x) ? 'fail' : 'ok')));
  return { out, declared, tripped, refused, why, agree };
};

export async function selfTest(root) {
  // **The pid is in the name, and [Q151](../doc/open-questions.md) is why.** A
  // `SELF` child runs THIS function, whose first line deletes this directory — so a
  // fixed name has the child delete the parent's scratch space underneath it. W31
  // shipped that defect and reported `12/12 bounded` while measuring the deletion;
  // here it crashed on the second entry instead, which is the louder direction.
  const dir = join(root, 'dev-dist', `wiring-selftest-${process.pid}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  const script = join(root, 'scripts', 'check-wiring.mjs');
  // **A `SELF` child grades neither `META` nor `SELF`.** There was a second variable
  // here, `CHECK_WIRING_SCRIPT`, read twice and set by nothing — the escape hatch the
  // META pass was originally meant to use, left behind when that pass started passing
  // the script under test as an argument instead. W38's conformity reader; removed
  // rather than documented, because a dead input reads as a supported one.
  const nested = !!process.env.CHECK_WIRING_NESTED_SELF;
  const meta = !nested;

  writeFileSync(join(dir, 'broken-package.json'), '{ "scripts": ');
  // **`G3`'s two probes need manifests rather than mutated scripts**, and they are
  // derived from the real one so they cannot go stale against it.
  {
    const real = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    const repoint = structuredClone(real);
    repoint.scripts['check:wiring'] = 'node scripts/check-spec.mjs';
    writeFileSync(join(dir, 'pkg-repoint.json'), JSON.stringify(repoint));
    const deleted = structuredClone(real);
    delete deleted.scripts['check:wiring'];
    delete deleted.scripts['check:wiring:selftest'];
    deleted.scripts.gate = deleted.scripts.gate
      .replace('npm run check:wiring && ', '').replace('npm run check:wiring:selftest && ', '');
    writeFileSync(join(dir, 'pkg-deleted.json'), JSON.stringify(deleted));
    const unchained = structuredClone(real);
    unchained.scripts.gate = unchained.scripts.gate.replace('npm run check:wiring && ', '');
    writeFileSync(join(dir, 'pkg-unchained.json'), JSON.stringify(unchained));
    const ghost = structuredClone(real);
    // **Only the plain entry, and that is a discrimination rather than a shortcut.**
    // Adding the `:selftest` half too makes `G1` and `G2` iterate an entry whose
    // script is missing, so both of their skip counts fire and the probe trips all
    // three clauses — measured. One entry keeps this probe about `G3` alone.
    ghost.scripts['check:ghost'] = 'node scripts/check-ghost.mjs';
    writeFileSync(join(dir, 'pkg-ghost.json'), JSON.stringify(ghost));
  }

  const done = (code) => { rmSync(dir, { recursive: true, force: true }); return code; };

  /**
   * Stage every check script FLAT in `dev-dist/`, mutate one, and point the check
   * there.
   *
   * **`dev-dist/` is a direct child of the repository root and that is the whole
   * constraint.** Each check derives `ROOT` as `resolve(dirname(self), '..')`, so a
   * staging directory one level deeper gives them all the wrong tree; and staging a
   * single file breaks `check-spec.mjs`, which imports `./check-markdown.mjs`. Flat,
   * here, both hold.
   */
  const stage = (probe) => {
    const staged = [];
    for (const f of readdirSync(join(root, 'scripts')).filter((n) => n.endsWith('.mjs'))) {
      const to = join(root, 'dev-dist', f);
      let text = readFileSync(join(root, 'scripts', f), 'utf8');
      if (probe && f === probe.file) {
        const after = probe.mutate(text);
        if (after === text) return null;
        text = after;
      }
      writeFileSync(to, text);
      staged.push(to);
    }
    return staged;
  };
  const unstage = (staged) => { for (const f of staged ?? []) rmSync(f, { force: true }); };

  const runProbe = (probe, against = script) => {
    const staged = stage(probe.file ? probe : null);
    if (staged === null) {
      return { vacuous: true, refused: false, agree: true, why: '  — the mutation matched nothing' };
    }
    const env = { ...process.env, CHECK_WIRING_SCRIPTS: 'dev-dist', ...(probe.env?.(dir) ?? {}) };
    const r = spawnSync(process.execPath, [against], { cwd: root, encoding: 'utf8', env, timeout: 300_000 });
    unstage(staged);
    return verdict(probe, r);
  };

  if (PROBES.length < MIN_PROBES || META.length < MIN_META || SELF.length < MIN_SELF) {
    console.log(`check-wiring self-test — ${PROBES.length} probes (floor ${MIN_PROBES}), ` +
      `${META.length} meta entries (floor ${MIN_META}), ${SELF.length} self entries (floor ${MIN_SELF}).`);
    console.log('  FAIL  the lists are below their floors; a suite that grades nothing passes.');
    return done(1);
  }

  // **`CHECKS` is compared to the manifest, both ways, and for distinctness.** The
  // list is a declaration and the manifest is the authority; equality is what makes
  // adding a seventh check to the gate fail here rather than pass silently, and
  // distinctness is what stops seven entries naming two checks.
  {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    const owed = Object.keys(pkg.scripts ?? {})
      .filter((n) => n.endsWith(':selftest'))
      .map((n) => n.replace(/^check:/, '').replace(/:selftest$/, ''))
      .sort();
    const have = [...CHECKS].sort();
    if (new Set(CHECKS).size !== CHECKS.length) {
      console.log(`  FAIL  CHECKS repeats a name: [${CHECKS.join(', ')}]. ${CHECKS.length} entries ` +
        `naming ${new Set(CHECKS).size} checks leaves the rest unprobed with the floor satisfied.`);
      return done(1);
    }
    if (have.join(',') !== owed.join(',')) {
      console.log(`  FAIL  CHECKS is [${have.join(', ')}] and package.json's \`:selftest\` entries are ` +
        `[${owed.join(', ')}]. Equality, not a floor: a check added to the gate and not to this list ` +
        'is a check nothing here probes.');
      return done(1);
    }
  }

  // **A floor is a count, and a count is not coverage** — W38's adequacy reader:
  // `MIN_PROBES` lowered with `PROBES` emptied prints `0/0 probes caught` at exit 0,
  // and lowering it alone leaves the list free to name two checks seven times. These
  // two bounds derive from `CHECKS` and from `ALL_CHECKS` rather than from a number,
  // so neither can be satisfied by padding — and each is what catches the other's
  // removal, which is why both `SELF` entries below fire.
  {
    const files = new Set(PROBES.map((p) => p.file).filter(Boolean));
    const missing = CHECKS.map((c) => `check-${c}.mjs`).filter((f) => !files.has(f));
    if (missing.length) {
      console.log(`  FAIL  no probe touches ${missing.join(', ')} — a floor counts probes and says ` +
        'nothing about which checks they reach.');
      return done(1);
    }
    const declared = new Set(PROBES.flatMap((p) => [p.check, ...(p.also ?? [])]));
    const unprobed = ALL_CHECKS.filter((x) => !declared.has(x));
    if (unprobed.length) {
      console.log(`  FAIL  no probe declares ${unprobed.join(', ')}; a check nothing probes is a ` +
        'check this file cannot say anything about.');
      return done(1);
    }
  }

  console.log(`check-wiring self-test — ${PROBES.length} probes\n`);

  // **The CONTROL — `doc/workflow.md` v0.11, adopted by P10's retro.** An unmutated
  // copy, driven through the same expression the probes use. It must RUN, must NOT
  // be graded, and **must stage a file for every check**: a harness that stages
  // nothing is green for the same reason an empty check is, and W38's adequacy
  // reader measured exactly that — `CHECK_WIRING_SCRIPTS` at an empty directory
  // printed `ok` and exited 0.
  {
    const staged = stage(null);
    const r = spawnSync(process.execPath, [script], {
      cwd: root, encoding: 'utf8', timeout: 300_000,
      env: { ...process.env, CHECK_WIRING_SCRIPTS: 'dev-dist' },
    });
    unstage(staged);
    if (!staged || staged.length < CHECKS.length) {
      console.log(`  FAIL  the control staged ${staged?.length ?? 0} files for ${CHECKS.length} checks ` +
        '— a control that stages nothing is green for the same reason an empty check is.');
      return done(1);
    }
    if (!RAN(`${r.stdout ?? ''}${r.stderr ?? ''}`) || r.status !== 0) {
      console.log(`  FAIL  the control did not run clean (exit ${r.status}) — every verdict below ` +
        'would be a fact about the harness rather than about the check.');
      return done(1);
    }
    console.log(`  ok    the control: ${staged.length} files staged unmutated, runs, and is not graded\n`);
  }

  let bad = 0;
  for (const probe of PROBES) {
    const v = runProbe(probe);
    if (v.vacuous || !v.refused || !v.agree) bad++;
    const tag = v.vacuous ? 'FAIL' : v.refused && v.agree ? 'ok  ' : 'FAIL';
    console.log(`  ${tag}  ${[probe.check, ...(probe.also ?? [])].join('+')}  ${probe.name}${v.why ?? ''}` +
      (v.agree === false ? '  — the report row disagrees with the failures' : ''));
  }
  console.log(`\n${PROBES.length - bad}/${PROBES.length} probes caught.`);

  if (!meta) return done(bad ? 1 : 0);

  // --- META: break the check, require the named probe to stop noticing ----------
  console.log('\n  and against a broken check:');
  const src = readFileSync(join(root, 'scripts', 'check-wiring.mjs'), 'utf8');
  const mutants = META.map(([, , m]) => { try { return m(src); } catch { return null; } });
  if (new Set(mutants).size !== META.length) {
    console.log('  FAIL  two META entries produce the same mutation; the count says nothing.');
    return done(1);
  }
  let ungraded = 0;
  for (const [k, [label, probeName, mutate]] of META.entries()) {
    const probe = PROBES.find((p) => p.name === probeName);
    if (!probe) {
      console.log(`  ABORT  ${label} — no probe is named "${probeName}"`);
      ungraded++;
      continue;
    }
    const mutated = mutate(src);
    if (mutated === src) {
      console.log(`  FAIL  ${label} — the mutation matched nothing`);
      ungraded++;
      continue;
    }
    const copy = join(dir, `check-wiring-${k}.mjs`);
    writeFileSync(copy, mutated);
    // **Run the probe the entry names AGAINST THE BROKEN COPY.** The first version
    // set an env variable here and let `selfTest` read it — which does nothing, because
    // that read happens once at the top of this function, so every entry graded against
    // the REAL check and both came back STILL CAUGHT: a harness defect reading as the
    // strongest verdict this file can print. The copy is an argument now.
    const v = runProbe(probe, copy);
    const noticed = v.vacuous || !v.refused || !v.agree;
    if (!noticed) ungraded++;
    console.log(`  ${noticed ? 'ok  ' : 'FAIL'}  ${label}${noticed ? '' : ' — STILL CAUGHT against a check that does not check'}`);
  }
  console.log(`\n${META.length - ungraded}/${META.length} graded.`);

  // --- SELF: break THIS FILE, require it to stop exiting 0 -----------------------
  //
  // **W31's shape, and W38's adequacy reader asked for it by name.** Every entry
  // above bounds the CHECK; nothing bounded the file doing the bounding, and the
  // verdict line, both floors and the `CHECKS` list were each replaceable for zero
  // failures. The child grades neither `META` nor `SELF`, so the regress stops one
  // list out — which is W31's own measured limit, stated rather than papered over.
  console.log('\n  and against a broken self-test:');
  const selfSrc = readFileSync(join(root, 'scripts', 'check-wiring-selftest.mjs'), 'utf8');
  const selfMutants = SELF.map(([, m]) => { try { return m(selfSrc); } catch { return null; } });
  if (new Set(selfMutants).size !== SELF.length) {
    console.log('  FAIL  two SELF entries produce the same mutation; the count says nothing.');
    return done(1);
  }
  let unbounded = 0;
  for (const [k, [label, mutate, evidence]] of SELF.entries()) {
    const mutated = mutate(selfSrc);
    if (mutated === selfSrc) {
      console.log(`  FAIL  ${label} — the mutation matched nothing`);
      unbounded++;
      continue;
    }
    const copy = join(dir, `wiring-selftest-${k}.mjs`);
    writeFileSync(copy, mutated);
    const r = spawnSync(process.execPath, [join(root, 'scripts', 'check-wiring.mjs'), '--self-test'], {
      cwd: root, encoding: 'utf8', timeout: 600_000,
      env: { ...process.env, CHECK_WIRING_SELFTEST: copy, CHECK_WIRING_NESTED_SELF: '1' },
    });
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
    // **The child must have RUN.** [Q151](../doc/open-questions.md): a `SELF` pass
    // whose children all crash reports every entry bounded while measuring the
    // crash. A child that reached a verdict printed one of these three lines.
    const ranChild = /probes caught\.|below their floors|FAIL  CHECKS|no probe (touches|declares)|the control /.test(out);
    // **A `SELF` entry may name its own evidence.** The default is the exit code;
    // the verdict entry cannot use it, because the verdict IS the exit code and
    // nothing is downstream of it — so it grades the printed count instead.
    const bounded = ranChild && (evidence ? evidence(out) : r.status !== 0);
    if (!bounded) unbounded++;
    console.log(`  ${bounded ? 'ok  ' : 'FAIL'}  ${label}` +
      (bounded ? '' : ranChild ? ` — exited ${r.status}: the mutation costs nothing`
        : ' — the mutant did not run: this is a crash, not a bound'));
  }
  console.log(`\n${SELF.length - unbounded}/${SELF.length} bounded.`);

  return done(bad || ungraded || unbounded ? 1 : 0);
}
