#!/usr/bin/env node
// **The negative tests for `check-wiring.mjs`, checked in rather than run once by
// hand** — `doc/workflow.md` rule 7 (b), and [W38](../doc/work-items/w38-the-dispatch-nothing-binds.md).
//
//   node scripts/check-wiring.mjs --self-test
//
// Three passes, on the shape `check-policies-selftest.mjs` settled into:
//
//   PROBES  break an INPUT and require `check-wiring` to refuse it, naming exactly
//           the checks the probe declares. **Thirty-three**: seven dispatches
//           falsified, one per `:selftest` entry INCLUDING this check's own — which is
//           what makes the check self-covering — plus one that breaks routing while
//           leaving the dispatch's shape intact (`G1` alone), three that break the
//           shape while leaving routing intact (`G2`, two of them alone), four
//           manifests (`G3`), **thirteen for `G4`** — five mutations of
//           `run-selftests.mjs`, five manifests, one environment override and two that
//           co-fire with `G5` — **four for `G5`**, and one unreadable manifest, the only
//           probe whose expected report row is `NOT RUN`.
//           *(This read **Sixteen** and enumerated no `G4` family at all, one item
//           after W38's conformity reader corrected the same header for the same
//           class, and then **Twenty-eight** for as long as it took both of W39's
//           readers to add five more. A count in a header is this repository's most
//           reliable defect.)*
//   META    break the CHECK itself and require a named probe to notice. **Fourteen
//           against twenty-six `fail()` sites — three `G1`, eight `G2`, four `G3`,
//           ten `G4`, one `G5` — and the cap is stated rather than padded**: one entry
//           per DISTINCT mechanism, plus the report block, which no set comparison can
//           see ([Q100](../doc/open-questions.md)). `G5` reports one message for nine
//           declarations and a second entry there would grade STILL CAUGHT. The twelve
//           not covered are the arms that
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
//
// **This file CARRIED the exclusivity marker and no longer does — W105,
// [ADR 0072](../doc/decisions/0072-a-scratch-path-carries-its-process-and-a-self-test-that-shares-the-tree-says-so.md),
// which supersedes that part of
// [ADR 0039](../doc/decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md).**
// The marker is one line in this comment and `run-selftests.mjs` reads it, `G4` derives the same set,
// and nothing is written here about it in a form either of them can see — which is deliberate, because
// a sentence that spells the token out re-arms the thing it is explaining ([Q178](../doc/open-questions.md)'s
// hazard, one file across).
//
// **What it was for.** `stage()` writes every `scripts/check-*.mjs` into `dev-dist/` FLAT — the one
// directory every other self-test used for scratch — and then runs those copies with their dispatch
// falsified. So a staged `check-docs.mjs` reached the real `check-docs` body and `rmSync`d the fixed
// `dev-dist/docs`, and a staged `check-spec.mjs` whose override read is removed launches the **whole**
// `check-spec` self-test, which deleted and rebuilt the fixed `dev-dist/spec-selftest`. Running the
// seven concurrently, ADR 0039 saw `check:docs:selftest` report an `X4` probe uncaught and another
// tripping `[X1,X4]`, and `check:spec:selftest` report *the mutant did not run: this is a crash, not a
// detection* — **a harness fault wearing the verdict of a finding, arriving from a NEIGHBOURING
// process**, which is what `doc/workflow.md` v0.11 is about.
//
// **Why it is gone.** Both victims were FIXED PATHS, and W105 made every scratch path under `dev-dist/`
// carry its process — `check-docs.mjs` writes `docs-<pid>`, `check-spec-selftest.mjs` writes
// `spec-selftest-<pid>`, and `G6` in `check-wiring.mjs` refuses a new one that does not.
// [Q182](../doc/open-questions.md) had already said relocating THIS file's staging would not have
// helped, *because the copies it runs are the real checks and they write the real paths*; the real
// paths are what moved.
//
// **Measured from both sides, with this file running concurrently against a `check:docs` loop and
// `check:spec:selftest`**: on the fixed paths **19 of 96** victim runs were green, every red one
// `ENOENT … dev-dist/docs/tsconfig.dom.json`; per-process, **61 of 61**. The control is the point —
// the arrangement that proves nothing collides now is the arrangement that went red before.
//
// **What `stage()` still shares, and why it is safe.** The staged copies stay FLAT, because each
// derives `ROOT = resolve(dirname(self), '..')` and `check-spec.mjs` imports `./check-markdown.mjs`:
// one directory below the repository root with its siblings beside it is the only arrangement that
// works, which `check-wiring.mjs`'s header records over three attempts. They are written and unstaged
// per probe, registered for removal on the abort path, and `G6` declares those three sites as the
// exceptions they are. A file a KILLED run leaves there is now NAMED by the control below rather than
// turning it red with a message about a dispatch — W103's finding 3.
//
// **`check:scheduler:selftest` keeps its marker, and that was measured too, not assumed**: it deletes
// `node_modules/fyflow-scheduler`, which is process-wide whatever any scratch path is named, and a
// `check:docs` loop beside it is **4 of 5** green — a one-in-five flake with no obvious cause, which is
// precisely what [Q181](../doc/open-questions.md) says an absent marker produces.

import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * The eight checks whose dispatch `G1` and `G2` test (seven until W72's `check-workers`) — **declared here and compared
 * to `package.json` inside the run, both ways and for distinctness.**
 *
 * W38's adequacy reader: with the list a bare literal, `['spec','source','spec',
 * 'source','spec','source']` costs **zero** — six entries, two distinct, `MIN_PROBES`
 * satisfied, four checks unprobed. `S12`'s shape, one file over.
 */
const CHECKS = ['spec', 'source', 'wiring', 'markdown', 'scheduler', 'policies', 'docs', 'workers'];

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
 * the one probe whose MANIFEST-GATED report rows must read `NOT RUN`: with no manifest there are
 * no entries, so none of those clauses runs and every one of their rows says so.
 *
 * **It declares WHICH rows, and `G6` is why — W105.** This read `notRun: true`, meaning *all of
 * them*, and `G6` reads the scripts DIRECTORY rather than the manifest: it runs, reports `ok`, and
 * the probe came back *the report row disagrees with the failures*. **The expectation was what was
 * wrong, not the clause.** Gating `G6` on a readable `package.json` would invent a dependency in
 * order to satisfy a probe, and it would mean a scratch-path collision goes unreported on exactly
 * the trees where someone is already editing the manifest. So the list is enumerated, which also
 * makes the next clause's author choose: a new `G` is manifest-gated and belongs in this list, or it
 * is not and does not, and `agree` will not let it be neither.
 */
const PKG_PROBE = [{
  name: 'package.json cannot be parsed, so there are no entries to check',
  file: null,
  check: 'G1',
  // **The rows that must read `NOT RUN`**, declared here so that a `NOT RUN` row is a
  // disagreement for every other probe. `G6` is absent deliberately: it is not gated on the
  // manifest and must still report.
  notRun: ['G1', 'G2', 'G3', 'G4', 'G5'],
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

/**
 * **`G4`'s probes — five mutations of `scripts/run-selftests.mjs` and one manifest.**
 *
 * `G4` is the clause that replaces what `S11`, `S12` and `G3` all stopped seeing when
 * [ADR 0039](../doc/decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md)
 * took the seven `:selftest` entries out of the gate's `&&` chain. So each of these
 * asks the question those three used to answer, one indirection further out: **is
 * this entry still run by `npm run gate`, and is it run as itself?**
 *
 * The runner is staged flat in `dev-dist/` by `stage()` like every other script, and
 * `G4` reaches it through the same `CHECK_WIRING_SCRIPTS` the other clauses use.
 */
const G4_PROBES = [
  {
    // The entry is in the manifest, the script exists, its dispatch routes — and the
    // gate does not run it. That is Q149's own sentence with the subject changed.
    name: 'the runner plans one fewer entry than the manifest declares',
    file: 'run-selftests.mjs',
    check: 'G4',
    mutate: (t) => t.replace("  const entries = Object.keys(scripts).filter((n) => n.endsWith(':selftest')).sort();",
      "  const entries = Object.keys(scripts).filter((n) => n.endsWith(':selftest')).sort().slice(1);"),
  },
  {
    name: 'the runner plans an entry the manifest does not declare',
    file: 'run-selftests.mjs',
    check: 'G4',
    mutate: (t) => t.replace('  return entries.map((entry) => {',
      "  return [...entries, 'check:ghost:selftest'].map((entry) => {"),
  },
  {
    // **W36's `D6` and W35's `test:l6` shape, in the runner.** The plan names the
    // right seven and runs something else for one of them; the entry names are bound
    // and the argument is not, which is exactly the pair of findings this repository
    // made one item apart.
    name: 'the runner names the right entries and would run another command',
    file: 'run-selftests.mjs',
    check: 'G4',
    mutate: (t) => t.replace('const commandFor = (entry) => `npm run ${entry}`;',
      "const commandFor = (entry) => (entry.includes('docs') ? 'npm run lint' : `npm run ${entry}`);"),
  },
  {
    // Not a cost question: an exclusive entry running concurrently is a flake with no
    // obvious cause, which is what Q148 predicted and what W39 measured twice.
    name: 'the runner stops reading the exclusivity marker',
    file: 'run-selftests.mjs',
    check: 'G4',
    mutate: (t) => t.replace("    if (file && existsSync(file)) exclusive = readFileSync(file, 'utf8').includes(MARK);",
      '    if (false) exclusive = true;'),
  },
  {
    // **The accounting path, and the only probe here that watches the runner FINISH.**
    // Everything above reads a plan. This drops an entry from the queue and leaves the
    // plan alone, so the plan comparison is silent and only the completion count moves.
    name: 'the runner plans every entry and runs one fewer',
    file: 'run-selftests.mjs',
    check: 'G4',
    mutate: (t) => t.replace(NL + 'const queue = [...rest];', NL + 'const queue = [...rest].slice(1);'),
  },
  {
    // **The COMPOUND, and it is what makes the runner's own accounting load-bearing.**
    // The probe above is caught by `G4` reading the printed counts, so the runner's
    // `if (missing.length || ...)` was deletable for **zero** — measured by W39's rule 8
    // set, as a survivor. Here the count is reported as the PLAN's, so `G4`'s
    // arithmetic is satisfied and the only thing left is the exit code, which that
    // `if` is the only producer of. *A provenance guard cannot be graded against a
    // correct implementation* — W34's finding, and W38's `G2` block-end before it.
    name: 'the runner runs one fewer entry and reports the plan`s count anyway',
    file: 'run-selftests.mjs',
    check: 'G4',
    mutate: (t) => t.replace(NL + 'const queue = [...rest];', NL + 'const queue = [...rest].slice(1);')
      .replace('${completed.length}/${planned.length} completed', '${planned.length}/${planned.length} completed'),
  },
  {
    // **W39's conformity reader, BLOCKING, and it is W36's `D6` in the one entry that
    // reaches the other seven.** `G4` asked whether some chain entry's command MENTIONED
    // the runner and then spawned `node <runner>` itself, so it interrogated a runner the
    // gate need not invoke: this manifest left `check:wiring` **4/4 ok** and
    // `check:source` **13/13 ok** while `npm run gate` printed a plan and ran nothing.
    name: 'the chain entry runs the runner with --plan, so the gate runs nothing',
    file: null,
    check: 'G4',
    env: (dir) => ({ CHECK_WIRING_PKG: `${dir}/pkg-planonly.json` }),
    mutate: (t) => t,
  },
  {
    // The same reader's second manifest: the command names the file and is not the file.
    name: 'the chain entry echoes the runner`s path instead of running it',
    file: null,
    check: 'G4',
    env: (dir) => ({ CHECK_WIRING_PKG: `${dir}/pkg-echo.json` }),
    mutate: (t) => t,
  },
  {
    // **The override, set in the environment the CHECK runs in** — the one shape a
    // manifest cannot express and a mutated script cannot either. With it exported,
    // `npm run selftests` reports `7/7 completed, 7 ok` in 0.3 s. W38's `G2` distinction,
    // missing from the file that cites it until W39's conformity reader measured it.
    name: 'CHECK_SELFTESTS_CMD is exported into the gate`s own environment',
    file: null,
    check: 'G4',
    env: () => ({ CHECK_SELFTESTS_CMD: `"${process.execPath}" -e ""` }),
    mutate: (t) => t,
  },
  {
    // **The runner's VERDICT, which no clause read until the same reader deleted it.**
    // One expression, one line, and every child's exit code discarded: seven failing
    // self-tests, runner exit 0, gate green. It needs its own stub run because the
    // accounting clause only ever runs children that succeed.
    name: 'the runner never reads what its children returned',
    file: 'run-selftests.mjs',
    check: 'G4',
    // Co-fires with `G5`, which requires this exact declaration: one mutation, two
    // clauses, and they are not the same clause twice — `G4` runs the runner against a
    // FAILING stub and watches the exit code, `G5` reads the line. The failure COUNT
    // and the report rows both see the pair, which is W29's discrimination.
    also: ['G5'],
    mutate: (t) => t.replace('let ok = results.every((r) => r.code === 0);', 'let ok = true;'),
  },
  {
    // **The DEFAULT command, replaced.** `--plan` prints what the runner would actually
    // run, so with the override unset this is the default and `G4`'s command clause sees
    // it. Before that, both of `G4`'s runs set the override and neither observed the
    // configuration the gate executes.
    name: 'the runner`s default command becomes a stub when nothing overrides it',
    file: 'run-selftests.mjs',
    check: 'G4',
    also: ['G5'],
    // *(Re-anchored once already: the declaration gained `?? ''` when the override moved
    // into `plan()`, and this probe reported *the mutation matched nothing* — rule 7 (b)
    // firing on the fix for a reader's finding, which is obligation (e)'s own founding
    // observation about repairs.)*
    mutate: (t) => t.replace(`const CMD = process.env.CHECK_SELFTESTS_CMD ?? '';`,
      `const CMD = process.env.CHECK_SELFTESTS_CMD ?? '"node" -e ""';`),
  },
  {
    // **W39's adequacy reader, BLOCKING, and the reason `G5` exists.** Every one of
    // `G4`'s three runs sets an override, so the branch the gate takes is the one branch
    // no `G4` clause observes: with this, `npm run selftests` reported `7/7 completed,
    // 7 ok` in **0.1 s** and `check:wiring`, `check:source` AND `check:wiring:selftest`
    // were all green. `G4` co-fires now only because its failing-stub run also notices.
    name: 'the runner prints the command instead of spawning it',
    file: 'run-selftests.mjs',
    check: 'G5',
    also: ['G4'],
    mutate: (t) => t.replace('const child = spawn(command, { cwd: ROOT, shell: true });',
      'const child = spawn(`echo skipping ${command}`, { cwd: ROOT, shell: true });'),
  },
  {
    // **`alone` was a LABEL.** `--plan` still printed `alone` for both exclusive entries
    // and `plan 7 entries, 2 exclusive`, while the run put all seven in five lanes —
    // `check:scheduler:selftest` deleting `node_modules/` beside the other five. The
    // exclusivity clause compares the printed plan; only the declaration binds the run.
    name: 'the exclusive entries are labelled alone and run concurrently',
    file: 'run-selftests.mjs',
    check: 'G5',
    // Co-fires with `G4`: `rest` still excludes the two exclusive entries, so with the
    // first loop falsified they run NOWHERE and the stub pass reports `5/7 completed`.
    // Declared rather than discovered — the set caught it on its first run.
    also: ['G4'],
    mutate: (t) => t.replace('for (const p of PLAN.filter((x) => x.exclusive)) results.push(await run(p));',
      'for (const p of PLAN.filter((x) => x.exclusive && false)) results.push(await run(p));'),
  },
  {
    // The plan itself, guarded on an override `G4` sets on every run: `0/0 completed`,
    // exit 0, the whole self-test half gone, four checks green. `G2`'s own probe
    // (*check-spec.mjs guards its exit on the override being set*) in the runner.
    name: 'the plan is computed only when the PKG override is set',
    file: 'run-selftests.mjs',
    check: 'G5',
    mutate: (t) => t.replace('const PLAN = plan(pkg);',
      'const PLAN = process.env.CHECK_SELFTESTS_PKG ? plan(pkg) : [];'),
  },
  {
    // The markers are read out of `SCRIPTS`, and `G4` sets that too — so moving the
    // DEFAULT means no marker is ever read and both hazardous entries run concurrently,
    // with `--plan` reporting `0 exclusive` under the gate's own configuration.
    name: 'the runner reads its markers from the wrong directory by default',
    file: 'run-selftests.mjs',
    check: 'G5',
    // **`G6` co-fires, and it is DECLARED rather than discovered — W105.** The mutation writes a
    // `dev-dist` path into `run-selftests.mjs` that carries no pid, which is exactly what `G6` refuses;
    // once `G6`'s universe became every `.mjs` rather than `check-*.mjs`, this probe trips both. Two
    // clauses, one mutation, and the failure COUNT is what tells them apart — W29's co-firing, which
    // rule 7 (c)'s set equality turned from a silent pass into a declared pair.
    also: ['G6'],
    mutate: (t) => t.replace("process.env.CHECK_SELFTESTS_SCRIPTS ?? join(ROOT, 'scripts')",
      "process.env.CHECK_SELFTESTS_SCRIPTS ?? join(ROOT, 'dev-dist')"),
  },
  {
    // **The "exactly one" half, which the equality clause MASKS in the zero direction.**
    // W39's rule-8 re-run: with `chainEntries.length !== 1` replaced by `if (false)`,
    // the no-runner manifest is still refused — `chainEntries[0]` is `undefined`, the
    // command is `''`, and the equality clause fires in its place. Two clauses, one id,
    // and the failure COUNT does not move: **masking**, in W29's sense. This manifest is
    // the discriminating case, and it is the other direction: TWO entries naming the
    // runner, where `chainEntries[0]` is a real command and equality passes.
    name: 'two chain entries run the selftest runner',
    file: null,
    check: 'G4',
    env: (dir) => ({ CHECK_WIRING_PKG: `${dir}/pkg-tworunners.json` }),
    mutate: (t) => t,
  },
  {
    // **The suffix case, and closing the deletion case did not close it.** `|| exit 0`
    // appended to the right command: `||`, `exit` and `0` are inert argv tokens to Node,
    // so all six clauses interrogated a runner that behaves perfectly while the SHELL
    // discarded its verdict. `; exit 0` and `|| true` are the same edit.
    name: 'the chain entry appends a shell suffix that swallows the verdict',
    file: null,
    check: 'G4',
    env: (dir) => ({ CHECK_WIRING_PKG: `${dir}/pkg-suffix.json` }),
    mutate: (t) => t,
  },
  {
    // The chain half. `G3` co-fires because `gateRuns` is the same predicate in both,
    // and it is DECLARED rather than discovered: one manifest, two clauses, and the
    // failure count is what tells them apart.
    name: 'the gate chain stops running the selftest runner',
    file: null,
    check: 'G4',
    also: ['G3'],
    env: (dir) => ({ CHECK_WIRING_PKG: `${dir}/pkg-norunner.json` }),
    mutate: (t) => t,
  },
];

/**
 * `G6` — **a scratch path under `dev-dist/` carries its PROCESS.** One probe per clause, each
 * declaring `G6` alone: none of these touches a dispatch, a manifest or the runner, so a probe that
 * also trips `G1`-`G5` is malformed and rule 7 (c)'s set equality is what says so.
 *
 * **The subject is a STAGED copy**, which is what makes these probes possible at all: `stage()` writes
 * every `scripts/check-*.mjs` into the staging directory and `CHECK_WIRING_SCRIPTS` points the check
 * there, so `G6` reads the mutated file exactly as it reads the real one.
 *
 * **Every literal below splits `dev-dist`, and the control went RED for want of it** —
 * [Q178](../doc/open-questions.md) for the third and fourth time in this item. `G6` reads source TEXT,
 * so a probe that writes the text it searches for turns THIS file into a site: the control reported
 * `check-wiring-selftest.mjs builds a path under dev-dist/ that does not carry process.pid` against the
 * probe literal two lines down, and two more as duplicate NAMES. **And the vacuity is the sharper half**:
 * `SHARED_SCRATCH`'s both-ways clause asks whether its anchor still exists in the file, and the probe
 * written to remove that anchor CONTAINED it — so probe `the anchor no longer exists` would have passed
 * while proving nothing, which is rule 7 (b)'s vacuity reached through the check's own subject rather
 * than through the mutation. Splitting the token fixes the detection and the vacuity together, because
 * both of `G6`'s readings key on the same `join(... 'dev-dist' ...)` test.
 */
const DD = `dev-${'dist'}`;
const G6_PROBES = [
  {
    // **The clause itself: a fixed path, which is what every one of these was before W105.** Measured
    // from both sides at this item's build — a `check:docs` loop beside `check:wiring:selftest` is 19 of
    // 96 green on a fixed `dev-dist/docs` and 61 of 61 per-process.
    name: 'a check writes a FIXED path under dev-dist/',
    file: 'check-docs.mjs',
    check: 'G6',
    mutate: (t) => t.replace(`const OUT = join(ROOT, '${DD}', \`docs-\${process.pid}\`);`,
      `const OUT = join(ROOT, '${DD}', 'docs');`),
  },
  {
    // **A self-test's fixture directory, which is the shape five of the eight had.** A different file
    // from the probe above, because `G6` loops over the directory and a clause bound at one file is a
    // clause about that file.
    name: 'a self-test writes a FIXED fixture directory under dev-dist/',
    file: 'check-spec-selftest.mjs',
    check: 'G6',
    mutate: (t) => t.replace(`const dir = join(root, '${DD}', \`spec-selftest-\${process.pid}\`);`,
      `const dir = join(root, '${DD}', 'spec-selftest');`),
  },
  {
    // **Two files, one NAME — the defect [Q182](../doc/open-questions.md) was raised for.**
    // `check-source-selftest.mjs` and `check-policies-selftest.mjs` both wrote `dev-dist/.self-NN.mjs`;
    // it was found by READING, and ADR 0039's three concurrent passes never happened to collide on it.
    // A pid makes two PROCESSES safe and says nothing about two files inside one.
    name: 'two self-tests build the same scratch NAME',
    file: 'check-policies-selftest.mjs',
    check: 'G6',
    mutate: (t) => t.replace('`policies-selftest-${process.pid}`', '`spec-selftest-${process.pid}`'),
  },
  {
    // **A declared exception that has STOPPED being needed.** The direction a permission list never has:
    // if the line now carries the pid, the entry is a permission with no subject, and the next fixed path
    // added beside it is covered by an exception written for something else.
    name: 'a SHARED_SCRATCH site now carries the pid and the exception is left standing',
    file: 'check-wiring-selftest.mjs',
    check: 'G6',
    mutate: (t) => t.replace(`      const to = join(root, '${DD}', f);`,
      `      const to = join(root, '${DD}', \`\${process.pid}-\${f}\`);`),
  },
  {
    // **A declared exception whose LINE is gone**, the other direction of the same list. The mutation
    // moves the construction into a helper, so the path is still built and the anchor is not there —
    // a refactor, which is the shape that actually happens.
    name: 'a SHARED_SCRATCH anchor no longer exists in the file it names',
    file: 'check-wiring-selftest.mjs',
    check: 'G6',
    mutate: (t) => t.replace(`      const to = join(root, '${DD}', f);`,
      '      const to = stagedPath(f);'),
  },
  {
    // **A path keyed on something that merely CONTAINS `process`**, which is what makes the predicate's
    // PRECISION load-bearing — W105's adequacy reader, which narrowed `process.pid` to `process` and to
    // `pid` for ZERO against all five of the probes below, because every real site contains all three.
    // `process.ppid` is a well-formed wrong selection the type admits: `/\bprocess\.pid\b/` refuses this
    // line and `/\bprocess\b/` accepts it, so the two predicates DIFFER here and nowhere else in the
    // tree. *A shape covered at its default instance is a shape visited, not a shape discriminated* —
    // v0.23's clause, applied to a predicate rather than to a key.
    name: 'a scratch path keyed on process.ppid, which is not this process',
    file: 'check-docs.mjs',
    check: 'G6',
    mutate: (t) => t.replace(`const OUT = join(ROOT, '${DD}', \`docs-\${process.pid}\`);`,
      `const OUT = join(ROOT, '${DD}', \`docs-\${process.ppid}\`);`),
  },
];

/**
 * **The `G6` probes BY NAME, because `MIN_PROBES` is a count and a count is not a membership**
 * (`doc/workflow.md` v0.14). W105's adequacy reader deleted the fifth `G6` probe and ran the lane to
 * completion: **`39 probes`, `39/39 probes caught`, `14/14 graded`, `6/6 bounded`, EXIT 0** — because
 * `MIN_PROBES` was 39 against 40, the file-coverage bound is already satisfied by `G1_PROBES` and the
 * `ALL_CHECKS` bound by the other four. **Nothing counted them.** Deleting the two-files-one-name probe
 * would have left that clause with no observer at all, and the fifth is the one this item's own Record
 * calls nearly vacuous — i.e. the likeliest for a later author to drop.
 *
 * Set equality, both ways, so a renamed probe fails naming itself and a sixth added without a line here
 * fails too — which is `ROW_KEYS`' shape in `examples/l6.ts`, one directory over.
 */
const G6_NAMES = [
  'a check writes a FIXED path under dev-dist/',
  'a self-test writes a FIXED fixture directory under dev-dist/',
  'two self-tests build the same scratch NAME',
  'a SHARED_SCRATCH site now carries the pid and the exception is left standing',
  'a SHARED_SCRATCH anchor no longer exists in the file it names',
  'a scratch path keyed on process.ppid, which is not this process',
];

const PROBES = [...G1_PROBES, ...G1_ONLY, ...G2_PROBES, ...G3_PROBES, ...G4_PROBES, ...PKG_PROBE,
  ...G6_PROBES];

/** Vacuous at zero, which is the floor `check-policies-selftest.mjs` taught. */
const MIN_PROBES = 41;
const MIN_META = 14;
const MIN_SELF = 6;

// **`G5` had to be added here as well as to the check, and forgetting it is
// [Q43](../doc/open-questions.md)'s class** — a closed allowlist makes a new id's
// failure lines invisible to the parse, so a probe declaring `[G4,G5]` reported
// `got [G4]` while `G5` was failing in the same output. W36 hit this adding `D6`;
// W39 hit it adding `G5`, one item later, in the file that records it.
const ALL_CHECKS = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'];

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
  ['G4`s unplanned-entry clause stops reporting',
    'the runner plans one fewer entry than the manifest declares',
    (t) => t.replace('        fail(\'G4\', `package.json declares "${e}"', '        [].push(`package.json declares "${e}"')],
  ['G4`s command clause stops reporting',
    'the runner names the right entries and would run another command',
    (t) => t.replace("          fail('G4', `the runner plans \"${m[2]}\" as", '          [].push(`the runner plans "${m[2]}" as')],
  ['G4 stops running the runner to completion, and only reads its plan',
    'the runner plans every entry and runs one fewer',
    (t) => t.replace('        if (green.status !== 0 || !done || done[1] !== done[2] || Number(done[2]) !== planned.length) {',
      '        if (false) {')],
  // **Named in lower case deliberately.** `npm run gate`'s secondary signal is
  // *zero FAIL lines*, read by grepping the log — and an `ok` row whose probe name
  // contains `FAILS` makes that count non-zero on a green gate. W34 recorded the
  // opposite direction (exit 1 with zero FAIL lines); this is the same lesson, that
  // the exit code is the predicate and the count is secondary, arriving as a
  // self-inflicted false positive in W39's own final gate log.
  ['G4 stops running the runner against a stub that fails',
    'the runner never reads what its children returned',
    (t) => t.replace('        if (red.status === 0) {', '        if (false) {')],
  ['G4 stops requiring the chain entry to BE the runner',
    'the chain entry echoes the runner`s path instead of running it',
    (t) => t.replace("      fail('G4', `\"${chainEntries[0]}\" runs", '      [].push(`"${chainEntries[0]}" runs')],
  ['G4 stops refusing the override in its own environment',
    'CHECK_SELFTESTS_CMD is exported into the gate`s own environment',
    (t) => t.replace("    fail('G4', 'CHECK_SELFTESTS_CMD is set in this process", "    [].push('CHECK_SELFTESTS_CMD is set in this process")],
];

/**
 * **Apply a mutation and report how many of its `.replace` calls MATCHED NOTHING.**
 *
 * `mutated === src` is rule 7 (b) over the whole file, and a compound defeats it: W105 moved the
 * `PROBES` declaration onto two lines, two `SELF` entries below pinned it on one, and both reported
 * **`exited 0: the mutation costs nothing`** — `MIN_PROBES` had been lowered and `PROBES` had not been
 * emptied, so the entry ran, changed the file, and proved something narrower than its own name. *A
 * vacuity guard over the whole file cannot see half a compound.*
 *
 * **It instruments `String.prototype.replace` for the duration of the call**, which is cheaper and more
 * general than restructuring every entry into a list of pairs: it holds for any compound written later,
 * and it reads what the mutation DID rather than what its author says it does. The patch is restored in
 * a `finally`; a `.replace` that legitimately replaces a string with itself would count as a miss, and
 * no entry here does that.
 */
const applyMutation = (mutate, src) => {
  const real = String.prototype.replace;
  let misses = 0;
  // eslint-disable-next-line no-extend-native
  String.prototype.replace = function patched(from, to) {
    const out = real.call(this, from, to);
    if (out === String(this)) misses += 1;
    return out;
  };
  try {
    const out = mutate(src);
    return { out, misses };
  } finally {
    String.prototype.replace = real;
  }
};

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
    (t) => t.replace('const MIN_PROBES = 41;', 'const MIN_PROBES = 0;')
      .replace('const PROBES = [...G1_PROBES, ...G1_ONLY, ...G2_PROBES, ...G3_PROBES, ...G4_PROBES, ...PKG_PROBE,'
        + NL + '  ...G6_PROBES];', 'const PROBES = [];')],
  ['MIN_PROBES is lowered, PROBES emptied, and the per-check coverage bound removed',
    (t) => t.replace('const MIN_PROBES = 41;', 'const MIN_PROBES = 0;')
      .replace('const PROBES = [...G1_PROBES, ...G1_ONLY, ...G2_PROBES, ...G3_PROBES, ...G4_PROBES, ...PKG_PROBE,'
        + NL + '  ...G6_PROBES];', 'const PROBES = [];')
      .replace('    if (missing.length) {', '    if (false) {')],
  ['ALL_CHECKS is emptied, so no probe can trip anything',
    (t) => t.replace("const ALL_CHECKS = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'];", 'const ALL_CHECKS = [];')],
  ['CHECKS repeats one name instead of naming eight',
    (t) => t.replace("const CHECKS = ['spec', 'source', 'wiring', 'markdown', 'scheduler', 'policies', 'docs', 'workers'];",
      "const CHECKS = ['spec', 'source', 'spec', 'source', 'spec', 'source', 'spec', 'source'];")],
  ['CHECKS drops a check the manifest has an entry for',
    (t) => t.replace("'docs', 'workers'];", "'docs'];")],
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
  // **`probe.notRun` is a LIST of the rows that must read `NOT RUN`, and the rest are judged as
  // usual.** It was a boolean until W105, when `G6` arrived with a different gate — see `PKG_PROBE`.
  // Written so a clause named in the list is required to be `notrun` AND one left out is required
  // not to be: a row that stops running is as much a defect as one that starts.
  const agree = ALL_CHECKS.every((x) => (probe.notRun?.includes(x)
    ? rowOf(x) === 'notrun'
    : rowOf(x) === (tripped.includes(x) ? 'fail' : 'ok')));
  // **`fails` is the failure COUNT, and it is the projection an id SET cannot see** — W29,
  // [Q146](../doc/open-questions.md). Two clauses can report one id, so disabling either leaves the set
  // alone and moves only the count. The META pass below compares it against the control's.
  const fails = (out.match(/^ {2}G\d: /gm) ?? []).length;
  return { out, declared, tripped, refused, why, agree, fails };
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
  /**
   * **`done()` removes `dir` from every RETURN and nothing covered a THROW — W105.** This file already
   * nests its scratch per process, which is the half [Q182](../doc/open-questions.md) asks for; what it
   * did not have is the abort path. `process.on('exit')` covers a throw and every `process.exit` road,
   * and it also reaps `stage()`'s FLAT files below, which are the ones that cannot nest.
   *
   * `SIGKILL` leaks this directory and, if it lands between a `stage()` and its `unstage`, up to 19
   * `dev-dist/check-*.mjs`. That residue is now NAMED by the control rather than left to produce a
   * mystery — see `stray()`.
   */
  const stagedNow = new Set();
  /** The flat `.meta-wiring-*` copies, which cannot nest — see the note at `copy` in the META pass. */
  const metaMutants = new Set();
  process.on('exit', () => {
    rmSync(dir, { recursive: true, force: true });
    for (const f of stagedNow) rmSync(f, { force: true });
    for (const f of metaMutants) rmSync(f, { force: true });
  });

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
    // **`G4`'s chain half.** The runner entry stays in `scripts` and leaves the chain,
    // which is the one shape that makes all eight `:selftest` entries unreachable in a
    // single edit — and the shape `S13` catches on ITS declared list and `G3` cannot
    // catch on a list derived from disk.
    //
    // **The chain it leaves is `gate:full`, not `gate` — ADR 0070 (W103).** This
    // fixture read `scripts.gate` and that entry no longer names the runner, so the
    // mutation matched nothing, the fixture was byte-equal to the real manifest and the
    // probe reported `exited 0, wanted [G3,G4], got []`. *A probe whose subject moves
    // does not fail loudly on its own; it goes quiet, and rule 7 (c)'s declared SET is
    // what turned the silence into a red line.*
    const norunner = structuredClone(real);
    norunner.scripts['gate:full'] = (norunner.scripts['gate:full'] ?? '')
      .replace(' && npm run selftests', '');
    writeFileSync(join(dir, 'pkg-norunner.json'), JSON.stringify(norunner));
    const planonly = structuredClone(real);
    planonly.scripts.selftests = `${planonly.scripts.selftests} --plan`;
    writeFileSync(join(dir, 'pkg-planonly.json'), JSON.stringify(planonly));
    const echoed = structuredClone(real);
    echoed.scripts.selftests = 'echo scripts/run-selftests.mjs';
    writeFileSync(join(dir, 'pkg-echo.json'), JSON.stringify(echoed));
    const suffixed = structuredClone(real);
    suffixed.scripts.selftests = `${suffixed.scripts.selftests} || exit 0`;
    writeFileSync(join(dir, 'pkg-suffix.json'), JSON.stringify(suffixed));
    const two = structuredClone(real);
    two.scripts['selftests:again'] = two.scripts.selftests;
    two.scripts.gate = `${two.scripts.gate} && npm run selftests:again`;
    writeFileSync(join(dir, 'pkg-tworunners.json'), JSON.stringify(two));
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
      stagedNow.add(to);
    }
    return staged;
  };
  const unstage = (staged) => {
    for (const f of staged ?? []) { rmSync(f, { force: true }); stagedNow.delete(f); }
  };

  /**
   * **Every `dev-dist/check-*.mjs` this run did not stage — W103's finding 3, given a name.**
   *
   * `stage()` writes flat into `dev-dist/` because each staged script derives `ROOT` from its own
   * location and `check-spec.mjs` imports `./check-markdown.mjs`, so one directory below the repository
   * root with its siblings present is the only arrangement that works — measured over three attempts and
   * recorded in `check-wiring.mjs`'s header. What that costs is that **a file a killed run left behind is
   * indistinguishable from a file this run staged**, and `CHECK_WIRING_SCRIPTS` points the check at the
   * whole directory: a gate killed mid-run left `dev-dist/check-wiring-stub-27708.mjs`, `G3` reported a
   * check the manifest never declares, and the CONTROL below went red saying *the control did not run
   * clean* — true, and about the harness. The real probe failure underneath it was invisible until a human
   * removed the file by hand.
   *
   * W105 moved that stub into a directory, so the known producer is gone; this is the general case, and it
   * is a READING rather than a deletion.
   *
   * **Its SCOPE, because `stage()` writes more than this reads** — W105's conformity reader. `stage()`
   * stages every `scripts/*.mjs`, which is **19** files, and this glob matches `check-*.mjs`, which is
   * **16** of them: `build-browser-tests.mjs`, `run-browser-tests.mjs` and `run-selftests.mjs` left behind
   * by a killed run are outside what this names. They do no harm — `G3` reads `check-*.mjs` too, so a
   * leftover non-check is not a check the manifest fails to declare — but the sentence above would
   * otherwise claim more than the glob does. Removing a `check-*.mjs` nobody here wrote would be a self-test
   * deleting a path it does not own, which is the one thing W105's hazard 4 forbids.
   */
  const stray = (staged) => readdirSync(join(root, 'dev-dist'))
    .filter((n) => /^check-.*\.mjs$/.test(n))
    .filter((n) => !(staged ?? []).some((f) => f.endsWith(`${sep}${n}`)));

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
    // **`G6`'s probes, by NAME and both ways** — see `G6_NAMES`. The count below cannot see one leave.
    {
      const got = PROBES.filter((p) => p.check === 'G6').map((p) => p.name).sort();
      const want = [...G6_NAMES].sort();
      const missing = want.filter((n) => !got.includes(n));
      const extra = got.filter((n) => !want.includes(n));
      if (missing.length || extra.length) {
        console.log(`  FAIL  the \`G6\` probes are [${got.join(' | ')}] and \`G6_NAMES\` declares ` +
          `[${want.join(' | ')}]` +
          `${missing.length ? ` — missing: ${missing.join(', ')}` : ''}` +
          `${extra.length ? ` — undeclared: ${extra.join(', ')}` : ''}. A probe can leave without the ` +
          'count getting shorter, and each of these is the only observer of one clause.');
        return done(1);
      }
    }
    const declared = new Set(PROBES.flatMap((p) => [p.check, ...(p.also ?? [])]));
    const unprobed = ALL_CHECKS.filter((x) => !declared.has(x));
    if (unprobed.length) {
      console.log(`  FAIL  no probe declares ${unprobed.join(', ')}; a check nothing probes is a ` +
        'check this file cannot say anything about.');
      return done(1);
    }
  }

  // **`PROBES` is bounded by COUNT and by COVERAGE and, until W39's adequacy reader,
  // by nothing about CONTENT.** Re-point one probe's `mutate` at another probe's
  // mutation and the file still reports `28/28 probes caught` at exit 0 — with the
  // clause that probe was the only probe for deletable for **zero**. Six of the twelve
  // `G4` probes are named by a `META` entry and cannot be re-pointed without an ABORT;
  // the other six could. `META` and `SELF` have asserted distinctness since W30 and
  // W31; this is the same bound on the list they grade, arriving two items later.
  // [Q153](../doc/open-questions.md)'s shape in the newest file's `PROBES`.
  {
    const sig = PROBES.map((probe) => {
      if (!probe.file) {
        // A manifest or environment probe mutates nothing; what distinguishes it is
        // the input it supplies, so that is what is compared.
        return `env\u0000${JSON.stringify(probe.env?.(dir) ?? null)}`;
      }
      const text = readFileSync(join(root, 'scripts', probe.file), 'utf8');
      let out = null;
      try { out = probe.mutate(text); } catch { /* a throwing mutate is its own signature */ }
      return `${probe.file}\u0000${out}`;
    });
    if (new Set(sig).size !== PROBES.length) {
      console.log(`check-wiring self-test — ${PROBES.length} probes, ${new Set(sig).size} distinct inputs.`);
      console.log('  FAIL  two probes present the SAME input, so one clause is probed twice and ' +
        'another not at all — a count and a coverage bound can see neither.');
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
      // **The residue is NAMED here, and W103's finding 3 is why.** The sentence below is right and said
      // nothing about the cause; one `readdirSync` turns the commonest cause into the first line a reader
      // sees, so the next person does not spend the verdicts underneath it looking for a defect in a check.
      const left = stray(staged);
      console.log(`  FAIL  the control did not run clean (exit ${r.status}) — every verdict below ` +
        'would be a fact about the harness rather than about the check.' +
        (left.length
          ? ` **dev-dist/ holds ${left.length} check-*.mjs this run did not stage: ${left.join(', ')}.** ` +
            'stage() writes flat into that directory because a staged script derives its own ROOT, so a ' +
            'file a KILLED run left behind is one `CHECK_WIRING_SCRIPTS` points the check at, and `G3` ' +
            'reports it as a check the manifest never declares — W103 finding 3, Q323\'s class. Remove ' +
            'them and re-run; they are left alone here because deleting a path this file did not write is ' +
            'worse than naming it.'
          : ''));
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
  /** The control's own failure count, which the entries below are compared against. */
  let controlFails = -1;
  /**
   * **The CONTROL for THIS pass, and it is the thing that was missing — W105's adequacy reader.**
   * v0.11 requires a harness to carry a control; the PROBES pass has one (`stage(null)` must run clean
   * and must not be graded) and this pass had only distinctness and `mutated === src`. An UNMUTATED copy,
   * driven through the same `runProbe` the entries use, must come back **NOT noticed** — because nothing
   * is broken, so the probe must still catch what it declares. When the copy's `ROOT` was wrong, this
   * control's verdict was `noticed`, which is how a pass can grade fourteen mutations of a check it never
   * ran against. *A control that fails here means every verdict below it is a fact about the harness.*
   */
  {
    const probe = PROBES.find((p) => p.name === META[0][1]);
    const ctl = join(root, 'dev-dist', `.meta-wiring-${process.pid}-control.mjs`);
    metaMutants.add(ctl);
    writeFileSync(ctl, src);
    const v = runProbe(probe, ctl);
    rmSync(ctl, { force: true });
    const noticed = v.vacuous || !v.refused || !v.agree;
    controlFails = v.fails;
    if (noticed) {
      console.log(`  FAIL  the control: an UNMUTATED copy of check-wiring.mjs is graded as NOTICED ` +
        `(${v.why ?? ''} ${JSON.stringify(v.tripped ?? [])} against ${JSON.stringify(v.declared ?? [])}). ` +
        'Nothing is broken, so the probe must still catch what it declares — every verdict below would be ' +
        'a fact about the harness rather than about the check.');
      return done(1);
    }
    console.log(`  ok    the control: an unmutated copy is NOT graded as noticed${NL}`);
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
    // **FLAT in `dev-dist/`, dot-prefixed, per-pid — and this was TWO DIRECTORIES DEEP, which made
    // every grading in this pass hollow.** W105's adequacy reader, BLOCKING. A copy of `check-wiring.mjs`
    // derives `ROOT = resolve(dirname(self), '..')`, so one written inside
    // `dev-dist/wiring-selftest-<pid>/` has `ROOT = <root>/dev-dist`: `PKG_PATH` resolves to
    // `dev-dist/package.json`, which is not there, so the mutant reported `G1: … is unreadable`, its
    // `tripped` set was `[G1]` against a declared `[G1,G2]`, and `noticed` came back TRUE **for a reason
    // that has nothing to do with the mutation**. Measured by that reader with an UNMUTATED copy: also
    // graded `noticed`. *So `14/14 graded` was satisfied by a copy that was never broken* — and the fix
    // is the depth rule this very item established, applied to the lane that establishes it.
    //
    // Dot-prefixed because a `check-*.mjs` in `dev-dist/` is what `G3` reads as a check the manifest
    // never declares and what `stray()` reports — W103's finding 3, which is the other half of this item.
    const copy = join(root, 'dev-dist', `.meta-wiring-${process.pid}-${k}.mjs`);
    metaMutants.add(copy);
    writeFileSync(copy, mutated);
    // **Run the probe the entry names AGAINST THE BROKEN COPY.** The first version
    // set an env variable here and let `selfTest` read it — which does nothing, because
    // that read happens once at the top of this function, so every entry graded against
    // the REAL check and both came back STILL CAUGHT: a harness defect reading as the
    // strongest verdict this file can print. The copy is an argument now.
    const v = runProbe(probe, copy);
    // **`caught` is not terminal — it asks one more question, and this file needed it.** W105's adequacy
    // reader measured that this pass graded 14 of 14 while every mutant was unable to read the manifest;
    // with that fixed, TWO entries came back STILL CAUGHT — `G1 stops counting the entries it skipped`
    // and `G2 stops counting the entries it never read`. Both are MASKING in W29's sense: the probe's own
    // mutation trips the same id through the ROUTING clause, so disabling the COUNTING clause leaves the
    // id set identical and moves only the number of failures. [Q146](../doc/open-questions.md)'s
    // discriminator, which `check-scheduler-selftest.mjs` has carried since W29 and this file did not.
    const byCount = v.fails !== controlFails;
    const noticed = v.vacuous || !v.refused || !v.agree || byCount;
    if (!noticed) ungraded++;
    console.log(`  ${noticed ? 'ok  ' : 'FAIL'}  ${label}`
      + (noticed ? (byCount && v.refused && v.agree ? ` (by the failure COUNT, ${controlFails} -> ${v.fails}, which the id set cannot see)` : '')
        : ' — STILL CAUGHT against a check that does not check'));
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
    const { out: mutated, misses } = applyMutation(mutate, selfSrc);
    if (mutated === selfSrc) {
      console.log(`  FAIL  ${label} — the mutation matched nothing`);
      unbounded++;
      continue;
    }
    // **And EVERY half of it matched** — see `applyMutation`. An entry whose second `.replace` lands
    // nowhere still changes the file, so the guard above passes and the entry grades a mutation it did
    // not make. W105 shipped exactly that for two entries and the lane said `exited 0: the mutation
    // costs nothing`, which is a true sentence about the wrong subject.
    if (misses > 0) {
      console.log(`  FAIL  ${label} — ${misses} of this mutation's \`replace\` calls matched NOTHING, ` +
        'so the file changed and the entry is about a different mutation from the one it names. Re-anchor ' +
        'it: a literal pinned to a declaration someone has since reformatted is rule 7 (b) at the half ' +
        'a whole-file comparison cannot see');
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
