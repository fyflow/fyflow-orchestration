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
// same hole one level up. W16 provoked this file ten ways after adding the META
// pass below; **six are now caught and four remain live, and they are all the
// OUTERMOST verdict**:
//
//   `return noticed === META.length ? 0 : 1` -> `return 0`      still survives
//   `if (!meta) ... return 0` -> `if (true)`                    still survives
//   `MIN_PROBES = 10` -> `0`                                    still survives
//   the "mutation matched nothing" guard -> `if (false)`        still survives
//
// The first two are the fixed point: **nothing inside a self-grading file can
// assert that the file grades.** The third is second-order — lowering the floor
// is only dangerous together with shortening the list, and shortening the list is
// caught. The fourth needs a level the META pass does not have: a probe's anchor
// vanishing, which is `doc/workflow.md` rule 7 (b)'s real-world case and which
// showed up on its own when W13 deleted the API `check-docs`' probe 11 was pinned
// to.
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
    mutate: (t) => t.replace('| `arrival-count` | `N` is fixed', '| `arrival-counting` | `N` is fixed'),
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
const MIN_PROBES = 13;

/** The same floor for the META list below, and for the same reason. */
const MIN_META = 5;

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
const META = [
  ['P1 disabled', (t) => t.replace('if (halvesRead && names && policies) {', 'if (false) {')],
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
    (t) => t.replaceAll("fail('P1',", "fail('PX',").replaceAll("fail('P2',", "fail('P1',").replaceAll("fail('PX',", "fail('P2',")],
  ['P2 disabled', (t) => t.replace('for (const { key, binding } of halvesRead ? (policies ?? []) : []) {', 'for (const { key, binding } of []) {')],
  ['P3 disabled', (t) => t.replace("if (names === null) fail('P3'", "if (false) fail('P3'")],
  ['every failure swallowed', (t) => t.replace('const fail = (check, msg) => failures.push(`${check}: ${msg}`);', 'const fail = () => {};')],
  ['the non-zero exit removed', (t) => t.replace('  process.exit(1);', '  process.exitCode = 0;')],
];

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

  if (PROBES.length < MIN_PROBES || META.length < MIN_META) {
    console.log(`check-policies self-test — ${PROBES.length} probes (floor ${MIN_PROBES}), ` +
      `${META.length} meta (floor ${MIN_META}).`);
    console.log('  FAIL  a list is short, and `caught === length` is vacuous at zero.');
    return 1;
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
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
    const declared = [probe.check, ...(probe.also ?? [])].sort();
    const tripped = ALL_CHECKS.filter((x) => out.includes(`${x}: `));
    const refused = r.status !== 0 && tripped.join(',') === declared.join(',');
    if (refused) caught++;
    console.log(`  ${refused ? 'ok  ' : 'FAIL'}  ${probe.check}  ${probe.name}` +
      (refused ? '' : `  — exited ${r.status}, wanted [${declared.join(',')}], got [${tripped.join(',')}]`));
  }
  console.log(`\n${caught}/${PROBES.length} probes caught.`);
  if (caught !== PROBES.length) { rmSync(dir, { recursive: true, force: true }); return 1; }

  // --- the META pass: does this suite NOTICE a broken check? -------------------
  if (!meta) { rmSync(dir, { recursive: true, force: true }); return 0; }
  const checkSource = readFileSync(join(root, 'scripts', 'check-policies.mjs'), 'utf8');
  let noticed = 0;
  console.log(`\nand against a broken check — ${META.length} mutations of check-policies.mjs itself\n`);
  for (const [i, [name, mutate]] of META.entries()) {
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
    let ok = false;
    try {
      const r = spawnSync(process.execPath, [join(root, 'scripts', 'check-policies.mjs'), '--self-test'],
        { cwd: root, encoding: 'utf8', timeout: 600_000,
          env: { ...process.env, CHECK_POLICIES_SCRIPT: rel } });
      ok = r.status !== 0;
    } finally { rmSync(rel, { force: true }); }
    if (ok) noticed++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}${ok ? '' : ' — the probes passed against a check that does not check'}`);
  }
  rmSync(dir, { recursive: true, force: true });
  console.log(`\n${noticed}/${META.length} noticed.`);
  return noticed === META.length ? 0 : 1;
}
