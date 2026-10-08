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
// ---------------------------------------------------------------------------
// **W28: A META ENTRY NAMES THE PROBE IT MUST BREAK.** [Q138](../doc/questions/q138.md).
//
// Until W28 a grading was `r.status !== 0` — re-run the whole probe suite against
// the broken check and require a non-zero exit. That cannot tell *the clause I
// broke was caught* from *something else went wrong*, and measured across this
// file's 20 entries and `check-markdown`'s 36, **the probe credited with the catch
// is whichever one comes FIRST in list order and reacts** — an artefact of
// `PROBES`' ordering, not of the clause. Only 14 of these 24 probes were ever the
// one that noticed. *(Every figure in this block — 20 entries, 24 probes, 14 of 24 —
// is W28's, of W28's list, and is left in past tense rather than restated: the list
// is **28 probes and 24 entries** since W30 added `S4` and `S7`. A count in a comment
// is what this repository gets wrong most often, and the fix is to date it.)*
//
// Now each entry carries the probe's `name` as its second element, the child runs
// **that probe and no other**, and the grading has three verdicts instead of one:
//
//   exit 3  the named probe does not exist        -> a dangling reference, ABORT
//   exit 1  the named probe went uncaught         -> the entry did what it claims
//   exit 0  the named probe is STILL CAUGHT       -> a hole, or a mislabelled entry
//
// plus `ran:`, which requires the mutated check to have PRINTED ITS HEADER. A
// mutant that **throws** exits non-zero and reports nothing, and an exit code reads
// that as a catch — W24's conformity reader found one such entry here and rewrote
// it, and **W28's guard found a second in `check-policies-selftest.mjs` on its
// first run**, in a file nobody had suspected.
//
// **It found one here too, and that is the entry to look at.** *"the linted trees
// read from a literal"* had been scored *noticed* since W24 and was noticed by
// nothing: its literal was not the same SHAPE as the expression it replaced, so the
// mutant reported two spurious failures on **every** run and every probe went red
// against it. `doc/workflow.md` v0.9 names this exactly — *a provenance probe
// changes the SOURCE EXPRESSION and nothing else* — and it is [Q112](../doc/questions/q112.md)'s
// fifth correction, the first caught by a machine rather than by a reader.
//
// **And the cost is the same defect from the other side.** A bare `check-source`
// run is ~140 ms; the old grading re-ran up to 24 of them per entry, 20 times.
// Measured: the grading alone went **23.1 s -> 9.1 s**, and the four new `SELF`
// entries below put ~12 s of that back, which is a trade this file makes on
// purpose and reports rather than hides.
//
// **The four new `SELF` entries edit the `META` LIST and leave the guards alone**,
// and that is a correction of how they were first written. The two-edit form —
// *remove the guard AND supply the case it catches* — asks the question backwards:
// with the guard gone and the defect present the run goes GREEN, so `SELF`'s *"must
// exit non-zero"* reads as *the floor did not fire* whether the guard was
// load-bearing or not. **Two of the four then passed VACUOUSLY** for a third
// reason — their anchors quoted the guard's own source line, which appears in this
// file **inside the `SELF` entry itself, hundreds of lines above the guard**, so
// `String.replace` edited the entry rather than the guard. [Q143](../doc/questions/q143.md).
// ---------------------------------------------------------------------------
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
//     `SELF_RAN` -> `true`                                         survives
//     `MAX_WIDE` -> `99`                                           survives
//
// **`MAX_WIDE -> 99` is W30's own, found by rule 8's re-run of the fix it had just
// made**: the bound that stops a second `wide` exemption is itself a bare literal on
// the outermost list, exactly as `MIN_SELF` and `MIN_PROBES` are. The `SELF` entry
// beside it catches a second entry TAKING the exemption; nothing catches the number
// being raised. **That is this rule's founding observation landing inside this rule's
// own procedure for the sixth time across six items.**
//
// **`SELF_RAN -> true` was added by W30's adequacy reader and is the sixth**: the
// guard W28's own reader built — a `SELF` entry passing by making this file a syntax
// error — can be disabled for **0**, at 34/34, 24/24, 10/10. It is on the outermost
// list and there is nothing beyond it, which is the same fixed point as the five
// above rather than a new kind of hole.
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
// **And the probes cover 6 of `check-source`'s 12 checks** — `S8`, `S11`, `S12` and
// `S13`, the four a manifest can reach, plus **`S4` and `S7`, added by W30** through a
// copy of the published tree (`CHECK_SOURCE_SRC`). *(13 until W57 retired `S9` with
// ADR 0013 rule 6; `S8`'s `deno.json` half gained its first probe there, through
// `CHECK_SOURCE_DENO`.)* *(This paragraph read **4 of 13**
// and named `S1`-`S7`, `S9`, `S10` as the pattern lists nothing probes; two of those
// nine are now probed and the sentence is corrected rather than left to rot.)*
//
// **`S1`, `S2`, `S3`, `S5`, `S6` and `S10` remain unprobed and the cap is
// STATED, on [P9](../doc/plans/p9-when-a-check-stops-checking-what-notices.md)
// decision 3's argument**: `S1`-`S3` are guarded a second way by `typecheck:deno` and
// `typecheck:browser`, and `S5`, `S6`, `S10` are publish-set bookkeeping with a
// second route. **`S4` and `S7` were the two with none** — `S4` is `RT-R9`, which all
// four typecheckers accept and Node refuses to load, and `S7` is ADR 0013 rule 1's only
// enforcement. **Measured before they were probed**: emptying `UNSTRIPPABLE`, making
// `S4`'s clause inert, emptying the published half of `SCHEDULER_REACH` and making
// `S7`'s clause inert were **all four inert on the clean tree and all four at 24/24
// probes caught**. [Q132](../doc/questions/q132.md).
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
// hole was a measurement that stopped one command early** — the [Q43](../doc/questions/q43.md)
// class, in the file that exists to refuse exactly that.

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

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
    // **Re-anchored AGNOSTICALLY by W39, which is the second time this file has had
    // to do it and the first time it was done so the next change cannot repeat it.**
    // ADR 0039 reordered the chain and moved `test:l6:deno` off the end; the literal
    // anchor came back *"the mutation matched nothing"* — rule 7 (b) firing correctly,
    // exactly as it did for W30. The anchor is now *the last entry, whatever it is
    // called*: a regex whose `"` is the end of the `gate` value.
    // Anchored on the LAST `test:*` entry rather than on the last entry outright:
    // since ADR 0039 the chain ends with `selftests`, and dropping THAT costs `S11`
    // as well (fourteen `:selftest` entries stop being reachable), which is a
    // different and stronger case — it has its own probe below. Q126's case is an
    // entry `S11` does not iterate, and a runtime is what that means.
    mutate: (t) => t.replace(/("gate": "[^"]*) && npm run test:[\w:.-]+/, '$1'),
  },
  {
    name: 'lint dropped from the gate chain',
    half: 'pkg', check: 'S12',
    // `lint` is the FIRST entry since ADR 0039, so the ` && ` that used to precede it
    // is gone. Anchored on the gate's own key rather than on a neighbour's name.
    mutate: (t) => t.replace('"gate": "npm run lint && ', '"gate": "'),
  },
  {
    name: 'an entry ADDED to the chain and not declared — the direction inclusion cannot see',
    half: 'pkg', check: 'S12',
    // One-way containment catches a deletion and passes an addition. This is why
    // S12 is equality, and it is the probe that fails if it is ever weakened.
    mutate: (t) => t.replace(/("gate": "[^"]*) && npm run ([\w:.-]+)"/, '$1 && npm run $2 && npm run test:scratch"'),
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
    // **Re-anchored by W30, and the reason is rule 7 (b) firing on this file.**
    // The anchor was `npm run check:spec && npm run check:source && `; W30 inserted
    // `check:spec:selftest` between them and this probe came back *"the mutation
    // matched nothing"* on its first run. **A probe pinned to a chain literal goes
    // vacuous the moment the chain legitimately changes** — W25's *a comment that
    // quotes the code it explains* and P9's *a mutation pinned to a magic number*,
    // in a third dress. Caught by the guard rather than by a reader.
    // **Re-anchored a SECOND time, by W39, and agnostically this time.** W30's fix
    // re-pinned it to two entry names and ADR 0039 removed one of them, so the probe
    // went vacuous again — the same class, three items apart, on the same probe. It
    // now swaps the chain's FIRST TWO entries whatever they are called, anchored on
    // the `"gate": "` key so it cannot match the `typecheck` composition above it.
    mutate: (t) => t.replace(/"gate": "npm run ([\w:.-]+) && npm run ([\w:.-]+) && /,
      '"gate": "npm run $2 && npm run $1 && '),
  },
  {
    name: 'a chain segment with a trailing && , which parses to an EMPTY segment',
    half: 'pkg', check: 'S12',
    // **The probe that pins `parts()`' "nothing is filtered out".** Found by the
    // author's own re-run, not by a reader: adding `.filter((s) => s !== '')` to
    // `parts()` left all seventeen probes green, because no probe until this one
    // produced an empty segment.
    mutate: (t) => t.replace(/("gate": "[^"]*) && npm run ([\w:.-]+)"/, '$1 && npm run $2 && "'),
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
    // *(ADR 0039 took `check:docs:selftest` out of the chain, so this removes the one
    // entry that is left. The cascade it names is unchanged: `check:docs` is in
    // `GATE_CHAIN` and in the chain, so S11 and S12 still cannot disagree about it.)*
    mutate: (t) => t.replace('npm run check:docs && ', ''),
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
    // **The prefix hazard is GONE BY CONSTRUCTION since ADR 0039 and this probe is
    // re-pointed rather than deleted.** `S11` no longer runs a regex over the whole
    // chain string: it splits on `&&` and compares segments for equality, because the
    // seven `:selftest` entries are not in the chain at all and reachability had to be
    // computed rather than matched. So `npm run check:docs` can no longer match inside
    // `npm run check:docs:selftest` — there is nothing for it to match inside. What
    // this probe still shows is that S11 fires for a `check:*` entry whose name is a
    // PREFIX of a live `:selftest` entry in the manifest: make `gateRuns` a substring
    // test again and it goes silent.
    mutate: (t) => t.replace('npm run check:docs && ', 'npm run check:docsX && '),
  },
  {
    name: 'the selftests runner dropped from the chain — one edit unreaches eight entries',
    half: 'pkg', check: 'S13', also: ['S11'],
    // **W39's own change, provoked.** Since
    // [ADR 0039](../doc/decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md)
    // the seven `:selftest` entries are not in the chain: `S11` reaches them through
    // the entry that runs `scripts/run-selftests.mjs`. Removing that one entry makes
    // all seven unreachable in a single edit, and both clauses say so — `S12` because
    // `GATE_CHAIN` declares it, `S11` **seven** times because `check:X:selftest` is a
    // `check:*` the gate no longer runs. `G4` in `check-wiring.mjs` refuses it a third
    // time, from the other side.
    //
    // *(This read **fourteen** — the count of `check:*` entries rather than of the
    // `:selftest` half of them, in a probe whose own Record row said `S11 ×7`. W39's
    // conformity reader re-derived it: `S11 (7)`, `S12 (1)`, 8 failures. The seven
    // plain `check:*` entries stay in the chain, which is the whole point of the
    // reachability split.)*
    //
    // **ADR 0070 (W103) moved which clause says so, and the probe is UNCHANGED.**
    // `gate` no longer ends in the runner; `gate:full` does, so this one edit now
    // strips the composed entry instead and the answer is `S13` (the composed list it
    // declares) plus `S11` (the eight `:selftest` entries reachable by nothing) where
    // it used to be `S12` plus `S11`. Measured: `wanted [S11,S12], got [S11,S13]`.
    // *The probe still unreaches every self-test in one edit, which is what it is for;
    // only the clause that owns the list changed, and rule 7 (c) is what made that
    // visible instead of letting a green set hide a moved subject.*
    mutate: (t) => t.replace(' && npm run selftests"', '"'),
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
  // --- S4 and S7: the two clauses the ladder has no rung for ------------------
  // **[Q132](../doc/questions/q132.md)'s two, and W30 measured the hole before
  // writing a line of this.** Both loop over `published()`, so until
  // `CHECK_SOURCE_SRC` existed there was no way to hand this script a broken
  // published tree — and four clause-level mutations were **all inert on the clean
  // tree and all four at 24/24 probes caught**: `UNSTRIPPABLE` emptied, `S4`'s
  // clause made inert, the published loop's `SCHEDULER_REACH` emptied, `S7`'s
  // clause made inert.
  //
  // **`S1`, `S2`, `S3` are left out on P9 decision 3's argument** — `typecheck:deno`
  // and `typecheck:browser` guard them a second way — and `S5`, `S6`, `S10`
  // are publish-set bookkeeping with a second route. `S4` and `S7` have none: `S4`
  // is `RT-R9`, which **all four typecheckers accept and Node refuses to load**, and
  // `S7` is [ADR 0013](../doc/decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
  // rule 1's only enforcement while that rule stood (`S7` is `RT-R11`'s since W57), which `CLAUDE.md` called *"one autocomplete away from
  // being broken"*.
  {
    name: 'an enum in published source — RT-R9, which every typechecker accepts',
    half: 'src', file: 'index.ts', check: 'S4',
    mutate: (t) => `${t}\nexport enum ProbeKind { A, B }\n`,
  },
  {
    name: 'a constructor PARAMETER PROPERTY in published source — RT-R9`s own example',
    half: 'src', file: 'src/driver/driver.ts', check: 'S4',
    // A different entry of `UNSTRIPPABLE` from the one above, deliberately: the list
    // is a loop bound and one entry covering it says nothing about the other four.
    // This is the construct `spec/runtime-targets.md` names in terms — `deno check`,
    // `tsc -p tsconfig.node.json` and `tsc -p tsconfig.browser.json` all accept it
    // and Node throws `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` at import time.
    mutate: (t) => `${t}\nclass Probe {\n  constructor(private readonly n: number) {}\n}\n`,
  },
  {
    // **The CONTROL, and it was a probe until W57.** ADR 0048 rule 4 PERMITS exactly this
    // form — the bare npm specifier, in any published file — so this row asserts the
    // narrowed `S7` lets it through: `clean` means the run must exit 0 tripping nothing.
    // Without it a check that still refused every import would pass every other probe here
    // and be wrong about the one thing the narrowing changed.
    name: 'the bare npm specifier in a published file — PERMITTED since ADR 0048 (control)',
    half: 'src', file: 'src/fold/policies.ts', clean: true,
    mutate: (t) => `${t}\nimport { FyflowScheduler } from 'fyflow-scheduler';\n`,
  },
  {
    name: 'the npm name reached with an npm: prefix — a form only Deno resolves',
    half: 'src', file: 'src/fold/policies.ts', check: 'S7',
    mutate: (t) => `${t}\nimport { FyflowScheduler } from 'npm:fyflow-scheduler';\n`,
  },
  {
    name: 'a published file importing the scheduler by its JSR name, bare',
    half: 'src', file: 'src/definition/types.ts', check: 'S7',
    // **The form W5's adequacy pass found unmatched.** The package answers to two
    // names; a Deno consumer runs `deno add jsr:@fyflow/scheduler` and then writes
    // the BARE `@fyflow/scheduler` with no `jsr:` prefix anywhere near the import.
    // A side-effect import rather than a `from`, so it reaches a different entry of
    // entry of W30's `SCHEDULER_REACH` list than the probe above; since W57 `S7` is one predicate
    // over the captured specifier, so the two probes differ in the FORM they carry, not the entry.
    mutate: (t) => `${t}\nimport '@fyflow/scheduler';\n`,
  },

  // **Six more, added after W30`s adequacy reader measured that ONE ENTRY COULD LEAVE.**
  // The two probes above cover `an enum` and `a constructor parameter property`; the
  // reader deleted `a namespace`, `a decorator`, `import = require()` from
  // `UNSTRIPPABLE` and `a dynamic import`, `a require()` and `a relative reach into
  // ../fyflow-scheduler` from `SCHEDULER_REACH` — **all six for 0 failures, 28/28,
  // 24/24, 9/9, exit 0**. The author had bounded THE WHOLE LIST LEAVING (both META
  // entries do that) and not ONE ENTRY LEAVING, which is exactly the split
  // `doc/workflow.md` rule 8`s fourth obligation names and exactly the shape P7`s
  // readers found twice. Every entry of both lists now has a probe.
  {
    name: 'a namespace in published source — RT-R9',
    half: 'src', file: 'src/definition/regions.ts', check: 'S4',
    mutate: (t) => `${t}\nexport namespace Probe { export const n = 1; }\n`,
  },
  {
    name: 'a decorator in published source — RT-R9',
    half: 'src', file: 'src/driver/routing.ts', check: 'S4',
    mutate: (t) => `${t}\n@Injectable\nclass Probe {}\n`,
  },
  {
    name: 'an import = require() in published source — RT-R9, and it trips S1 as well',
    half: 'src', file: 'src/driver/log.ts', check: 'S1', also: ['S4'],
    // **A declared cascade, not a malformed probe.** `S1``s `RT-R4` list matches any
    // `require(` at all, and `S4``s list matches `import x = require(`, so the one
    // construct is two violations of two different rules. Rule 7 (c) is what makes
    // that a declaration rather than a surprise.
    mutate: (t) => `${t}\nimport probe = require("node:path");\n`,
  },
  {
    name: 'a DYNAMIC import of the scheduler by its jsr: form in published source',
    half: 'src', file: 'src/driver/events.ts', check: 'S7',
    mutate: (t) => `${t}\nconst probe = () => import('jsr:@fyflow/scheduler');\n`,
  },
  {
    name: 'a DYNAMIC import of the scheduler in a TEMPLATE LITERAL — the adequacy reader`s m05',
    half: 'src', file: 'src/driver/events.ts', check: 'S7',
    // The quote class read `['"]`; a backtick-quoted specifier passed every form of `S7` and
    // only `typecheck:node` saw it (TS2307), while Deno accepted the import.
    mutate: (t) => `${t}\nconst probe2 = () => import(\`jsr:@fyflow/scheduler\`);\n`,
  },
  {
    name: 'a require() of the scheduler by its npm: form — S1 as well',
    half: 'src', file: 'src/driver/ids.ts', check: 'S1', also: ['S7'],
    mutate: (t) => `${t}\nconst probe = require("npm:fyflow-scheduler");\n`,
  },
  {
    name: 'a RELATIVE reach into ../fyflow-scheduler — the 2026-08-31 shape',
    half: 'src', file: 'src/driver/policy.ts', check: 'S7',
    // ADR 0029: a path into a sibling checkout is the form a junction in
    // `node_modules` made look ordinary, and it is the one `S7` was KEPT for at W57 —
    // `D1`-`D3` read no source file, so nothing else sees this shape in `src/`.
    // *(Until W57 this comment recorded that the probe tripped `S7` TWICE, because two
    // entries of the old `SCHEDULER_REACH` list matched one string. The narrowed clause
    // is one predicate over one captured specifier, so it fires once per occurrence.)*
    mutate: (t) => `${t}\nimport { x } from '../../fyflow-scheduler/dist/index.js';\n`,
  },
  {
    name: 'a file: specifier reaching the scheduler in published source',
    half: 'src', file: 'src/driver/log.ts', check: 'S7',
    // The declaration form that cost this project a sibling checkout, written as an
    // import rather than as a manifest entry. `check-scheduler`'s `D2` refuses it in
    // `package.json`; nothing but `S7` sees it in a `.ts` file.
    mutate: (t) => `${t}\nimport type { Probe } from 'file:../fyflow-scheduler/index.ts';\n`,
  },
  // --- S14: the SECOND dependency, `jsonata` — reached from src/jsonata/** alone, by one form (W62, RT-R12) ---
  // --- S16 (RT-R13, W66): only src/scheduler/** constructs a pool, a scheduler or a group ---
  //
  // **The last two plant the violation BEHIND a regex literal**, which is W66's adequacy reader's
  // F15: a quote or a backtick inside a regex opened a string or a template and blanked what
  // followed, so `S2`, `S3` and `S16` went blind over the rest of the line or the file.
  {
    name: 'a violation behind a regex literal containing an APOSTROPHE — the scan`s blind spot (the adequacy reader, F15)',
    half: 'src', file: 'src/fold/policies.ts', check: 'S16',
    mutate: (t) => `${t}\nimport { WorkerManager } from 'fyflow-scheduler';\nexport const re = /['x]/;\nexport const p = () => new WorkerManager('u', {});\n`,
  },
  {
    name: 'a violation behind a regex literal containing a BACKTICK — the same blind spot, to end of file',
    half: 'src', file: 'src/fold/policies.ts', check: 'S16',
    // The backtick is built from its code point: a literal one inside this template would end it,
    // and an escaped one would emit a BACKSLASH-backtick, which is a different regex.
    mutate: (t) => `${t}
import { WorkerManager } from 'fyflow-scheduler';
export const re2 = /[${String.fromCharCode(96)}]/;
export const p2 = () => new WorkerManager('u', {});
`,
  },
  {
    name: 'the PURE ENTRY constructing a WorkerManager — a consumer who wanted no pool would load one',
    half: 'src', file: 'index.ts', check: 'S16',
    mutate: (t) => `${t}\nimport { WorkerManager } from 'fyflow-scheduler';\nexport const p = () => new WorkerManager('u', {});\n`,
  },
  {
    name: 'the DRIVER constructing a FyflowScheduler — ADR 0001 rule 1`s shape, one constructor over',
    half: 'src', file: 'src/driver/driver.ts', check: 'S16',
    mutate: (t) => `${t}\nimport { FyflowScheduler } from 'fyflow-scheduler';\nexport const s = () => new FyflowScheduler({});\n`,
  },
  {
    name: 'the definition half constructing a resource GROUP — the built-ins` schemas live there and their factories must not',
    half: 'src', file: 'src/definition/registry.ts', check: 'S16',
    mutate: (t) => `${t}\nimport { ConcurrentLimitGroup } from 'fyflow-scheduler';\nexport const g = () => new ConcurrentLimitGroup(1, 'x');\n`,
  },
  {
    name: 'a published file outside src/jsonata/ importing jsonata — the pure entry`s half would carry the engine',
    half: 'src', file: 'src/definition/types.ts', check: 'S14',
    mutate: (t) => `${t}\nimport engine from 'jsonata';\nvoid engine;\n`,
  },
  {
    name: 'the ROOT re-exporting the jsonata sub-path — ADR 0049 rule 5`s shape one sub-path over, which W59`s reader found unobserved for the helper',
    half: 'src', file: 'index.ts', check: 'S14',
    mutate: (t) => `${t}export * from './src/jsonata/index.ts';\n`,
  },
  {
    name: 'the scheduler sub-path re-exporting the adapter — the sub-path that must stay free of an engine',
    half: 'src', file: 'src/scheduler/index.ts', check: 'S14',
    mutate: (t) => `${t}export { jsonata } from '../jsonata/index.ts';\n`,
  },
  {
    name: 'src/jsonata reaching the engine by npm:jsonata — the form Node and the browser cannot resolve',
    half: 'src', file: 'src/jsonata/index.ts', check: 'S14',
    mutate: (t) => t.replace("from 'jsonata';", "from 'npm:jsonata@2.2.2';"),
  },
  {
    name: 'src/jsonata reaching a package SUB-PATH, jsonata/jsonata.js — a form a prefix test would pass (the adequacy reader, m09)',
    half: 'src', file: 'src/jsonata/index.ts', check: 'S14',
    mutate: (t) => `${t}\nconst probe2 = () => import('jsonata/jsonata.js');\nvoid probe2;\n`,
  },
  {
    name: 'src/jsonata reaching the engine`s own file by a path, in a template-literal dynamic import',
    half: 'src', file: 'src/jsonata/index.ts', check: 'S14',
    mutate: (t) => `${t}\nconst probe = () => import(\`../../node_modules/jsonata/jsonata.js\`);\nvoid probe;\n`,
  },
  {
    name: 'the scheduler declared as a runtime dependency',
    half: 'pkg', check: 'S8',
    // `S8` has been in this file since W5 with no checked-in probe. One is cheap
    // here because the manifest half already has a harness.
    // **Re-anchored by W62**: the manifest now HAS a `dependencies` block (jsonata, ADR 0052), and
    // this probe used to INSERT one before `devDependencies` — a second `dependencies` key, of which
    // `JSON.parse` keeps the LAST, so the inserted scheduler entry vanished and the probe went
    // silent (`wanted [S8], got []`, measured in W62's isolated copy). It writes INTO the block now.
    mutate: (t) => t.replace('  "dependencies": {', '  "dependencies": {\n    "fyflow-scheduler": "0.3.0",'),
  },
  // --- S15: jsonata declared ONCE, at ONE pin, in both manifests, its sub-path exported by both (W62, RT-R12) ---
  {
    name: 'jsonata missing from dependencies — the declaration gone with the module still shipped',
    half: 'pkg', check: 'S15',
    mutate: (t) => t.replace('    "jsonata": "2.2.2"\n', ''),
  },
  {
    name: 'jsonata at a different pin in package.json than deno.json — two engines',
    half: 'pkg', check: 'S15',
    mutate: (t) => t.replace('"jsonata": "2.2.2"', '"jsonata": "2.1.0"'),
  },
  {
    name: 'jsonata declared as an optional PEER beside dependencies — the adjacent fields W57`s reader found',
    half: 'pkg', check: 'S15',
    mutate: (t) => t.replace('  "peerDependencies": {\n    "fyflow-scheduler": "0.5.2"\n  },',
      '  "peerDependencies": {\n    "fyflow-scheduler": "0.5.2",\n    "jsonata": "2.2.2"\n  },\n  "peerDependenciesMeta": { "jsonata": { "optional": true } },'),
  },
  {
    name: 'jsonata declared in optionalDependencies alone beside dependencies — its own probe (the adequacy reader, m13)',
    half: 'pkg', check: 'S15',
    mutate: (t) => t.replace('  "peerDependencies": {', '  "optionalDependencies": { "jsonata": "2.2.2" },\n  "peerDependencies": {'),
  },
  {
    name: 'jsonata named in peerDependenciesMeta ALONE — the adjacent field without its peer (the adequacy reader, m13)',
    half: 'pkg', check: 'S15',
    mutate: (t) => t.replace('  "peerDependencies": {', '  "peerDependenciesMeta": { "jsonata": { "optional": true } },\n  "peerDependencies": {'),
  },
  {
    name: 'jsonata in bundledDependencies — the tarball ships the engine`s files past every check (the adequacy reader, m11)',
    half: 'pkg', check: 'S15',
    mutate: (t) => t.replace('  "peerDependencies": {', '  "bundledDependencies": ["jsonata"],\n  "peerDependencies": {'),
  },
  {
    name: 'jsonata declared in devDependencies as well — a second declaration',
    half: 'pkg', check: 'S15',
    mutate: (t) => t.replace('    "fyflow-scheduler": "0.5.2",\n    "playwright"', '    "fyflow-scheduler": "0.5.2",\n    "jsonata": "2.2.2",\n    "playwright"'),
  },
  {
    name: 'package.json`s ./jsonata export removed — nothing but S15 reads the map for it',
    half: 'pkg', check: 'S15',
    mutate: (t) => t.replace('    "./jsonata": {', '    "./jsonataa": {'),
  },
  {
    name: 'package.json`s ./jsonata export pointing at the scheduler`s bundle paths',
    half: 'pkg', check: 'S15',
    mutate: (t) => t.replace('"default": "./dist/node/jsonata/index.js"\n      },', '"default": "./dist/node/scheduler/index.js"\n      },'),
  },
  {
    name: 'deno.json`s jsonata mapping REMOVED — Deno then resolves through package.json (Q252`s shape), and only S15 sees it',
    half: 'deno', check: 'S15',
    mutate: (t) => t.replace(',\n    "jsonata": "npm:jsonata@2.2.2"', ''),
  },
  {
    name: 'deno.json`s jsonata mapping at a different pin',
    half: 'deno', check: 'S15',
    mutate: (t) => t.replace('"jsonata": "npm:jsonata@2.2.2"', '"jsonata": "npm:jsonata@2.1.0"'),
  },
  {
    name: 'deno.json re-maps jsonata in a scopes block — beside the field the check reads',
    half: 'deno', check: 'S15',
    mutate: (t) => t.replace('  "publish": {', '  "scopes": {\n    "./src/": { "jsonata": "../jsonata/jsonata.js" }\n  },\n  "publish": {'),
  },
  {
    name: 'deno.json`s ./jsonata export removed',
    half: 'deno', check: 'S15',
    mutate: (t) => t.replace('    "./jsonata": "./src/jsonata/index.ts"', '    "./jsonataa": "./src/jsonata/index.ts"'),
  },
  {
    name: 'the scheduler declared as an optionalDependency — a second copy, optionally',
    half: 'pkg', check: 'S8',
    // The third field `S8` reads, and the one no probe had reached: `dependencies` had
    // W30's probe, `peerDependencies` is what `D8` now requires, and this is the remaining
    // way to install a second copy beside the consumer's.
    mutate: (t) => t.replace('  "devDependencies": {',
      '  "optionalDependencies": {\n    "fyflow-scheduler": "0.5.2"\n  },\n  "devDependencies": {'),
  },
  {
    name: 'deno.json maps the scheduler to a working-tree PATH — ADR 0029`s incident, in the publish manifest',
    half: 'deno', check: 'S8',
    // `S8`'s `deno.json` half had NO probe until W57, because its only clause refused any
    // mapping and no probe wanted to add one. ADR 0048 rule 2 requires the `jsr:` mapping,
    // so the clause now refuses a PATH — and this is the path.
    mutate: (t) => t.replace(/"fyflow-scheduler": "jsr:@fyflow\/scheduler@\d+\.\d+\.\d+"/,
      '"fyflow-scheduler": "../fyflow-scheduler/index.ts"'),
  },
  {
    name: 'deno.json re-maps the scheduler to a working-tree PATH inside a scopes block — the adequacy reader`s m22',
    half: 'deno', check: 'S8',
    mutate: (t) => t.replace('  "publish": {',
      '  "scopes": {\n    "./src/": { "fyflow-scheduler": "../fyflow-scheduler/index.ts" }\n  },\n  "publish": {'),
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
/**
 * **Did the mutated check RUN TO COMPLETION?** A grading requires this, which is
 * how a mutant that **crashed** is told apart from one that ran and stopped
 * detecting. W24's conformity reader found an entry here scored *noticed* because
 * its mutant threw and rewrote it; nothing enforced that, and W28's guard found a
 * second instance in `check-policies-selftest.mjs` on its first run.
 *
 * **This keys on the TERMINAL line, not on the report header, and both of W28's
 * readers are why.** It first tested for `'source check — '`, which
 * `check-source.mjs` prints at line 584 of 599 — so the guard covered the checks
 * and **not the report or the exit path**, and a mutant made to throw one line
 * after the header was scored *noticed* at a cost of **0**. Every check here ends
 * with exactly one of these two lines, and a mutant that dies anywhere prints
 * neither.
 */
const RAN = (out) => /^(All checks passed|\d+ failure\(s\)\.)/m.test(out);

/**
 * **And did the SELF child's own self-test run at all?** `SELF` graded
 * `ok = r.status !== 0` — the pre-W28 form, one layer out — so an entry could pass
 * by making this file a **syntax error**: W28's adequacy reader appended `((( ;` to
 * a `SELF` mutation and the run reported **7/7 bounded at exit 0** while the bound
 * it claims to test was never tested. Both code paths that grade anything print
 * this line first; a file that does not parse prints nothing.
 */
const SELF_RAN = (out) => /self-test — /.test(out);

const MIN_PROBES = 60;

/** The same floor for `META`, and for the same reason. */
const MIN_META = 40;

/** And for `SELF`. */
const MIN_SELF = 14;

/**
 * **How many META entries may take the `wide` exemption from the two anchor guards.**
 * One, and W30`s adequacy reader is why it is bounded at all: it wrote a NEW entry
 * that disables `S4` and `S7` together while naming only `S7`, handed it a `wide`
 * reason, and the file reported **28/28, 24/24, 9/9, exit 0**. The identical entry
 * WITHOUT the fourth element is refused by name — *"the mutation is GLOBAL"* — so the
 * guard works and the escape from it did not have to be earned.
 *
 * The header argued *"an exemption that has to be written down beside the entry is a
 * different thing from a guard that is not there"*. True of the one entry that has
 * one, and it said nothing about HOW MANY may write one down. `MAX_CORPUS` already
 * had the shape this needed.
 */
const MAX_WIDE = 1;

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
  ['S12 disabled',
    'a runtime dropped from the gate chain — Q126, reproduced', (t) => t.replace('    if (unreadable.length === 0) {', '    if (false) {')],
  ['S12 made one-way — a declared entry missing from the chain is ignored',
    'lint dropped from the gate chain',
    (t) => t.replace('for (const n of missingFrom(GATE_CHAIN, ran)) {', 'for (const n of []) {')],
  ['S12 made one-way the other way — an undeclared entry in the chain is ignored',
    'an entry ADDED to the chain and not declared — the direction inclusion cannot see',
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
    'a chain segment this check cannot classify',
    (t) => t.replace('    for (const s of unreadable) {', '    for (const s of []) {')],
  ['S12`s ORDER comparison disabled',
    'the chain REORDERED, so every entry is present and the sequence is not',
    (t) => t.replace("          ran.join(' ') !== GATE_CHAIN.join(' ')) {", '          false) {')],
  ['S11`s :selftest clause disabled',
    'a :selftest entry gutted of --self-test, so it runs the plain check twice',
    (t) => t.replace("    if (name.endsWith(':selftest')) {", '    if (false) {')],
  // **The three edits W24's conformity reader made, checked back in** — rule 8's
  // *re-run after acting, with the readers' own edits as probes*. Each is a
  // deletion that leaves `check-source` at exit 0 and is caught only because a
  // probe reaches it.
  ['the lint row deleted from COMPOSED — the reader`s edit, and the survivor W24 wrongly claimed',
    'a directory ADDED to lint`s argument list and not declared',
    (t) => t.replace(/\n  \{\n    name: 'lint',\n    split: 'ws',\n    parts: \[[^\]]*\],\n  \},/, '')],
  ['the report`s check id read as two characters again — S10-S13 all reported as S1',
    'typecheck:deno dropped from the typecheck chain — the only Deno typecheck',
    (t) => t.replace("c.slice(0, c.indexOf(' '))", 'c.slice(0, 2)')],
  ['the S12 row deleted from the report`s checks array',
    'an entry SWAPPED for another, so the count is unchanged and the set is not',
    (t) => t.replace("  'S12 `npm run gate` runs exactly the entries GATE_CHAIN declares',\n", '')],
  // **This one is why the comparison in the probe loop is set equality rather than
  // a count.** A check that reports a real failure under the WRONG label trips the
  // same NUMBER of checks, so `tripped.length === declared.length` passes it and
  // only `tripped.join() === declared.join()` does not. Without it, rule 7 (c) can
  // be downgraded to cardinality with this whole file green.
  ['S12 and S13 swapped, so every count still matches and no set does',
    'a runtime dropped from the gate chain — Q126, reproduced',
    (t) => t.replaceAll("fail('S12'", "fail('SX'").replaceAll("fail('S13'", "fail('S12'").replaceAll("fail('SX'", "fail('S13'"),
    // **The one declared `wide` exemption in this file.** This entry is a rename of
    // EVERY `S12` and `S13` site by construction — that is what makes the counts
    // match and the sets not — so both anchor guards would refuse it for doing
    // exactly what it says. Declared here rather than by turning the guards off.
    'a global rename is the whole mechanism: the ids are swapped at every site'],
  ['S13`s declared-parts comparison disabled',
    'typecheck:deno dropped from the typecheck chain — the only Deno typecheck', (t) => t.replace('for (const c of COMPOSED) {', 'for (const c of []) {')],
  ['S13`s derived clause disabled — the one that counts COMPOSED from package.json',
    'a whole row deleted from COMPOSED',
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
    'the typecheck row deleted from COMPOSED',
    (t) => t.replace("    const cmd = scripts[name] ?? '';\n    if (!/\\bnpm run /.test(cmd)) continue;",
      "    const cmd = scripts[name] ?? '';\n    if (name === 'typecheck') continue;\n    if (!/\\bnpm run /.test(cmd)) continue;")],
  ['the whole checks array emptied, so the report says nothing at all',
    'build:browser-tests dropped from test:browser — a stale bundle reporting green',
    (t) => t.replace(/const checks = \[[\s\S]*?\n\];/, 'const checks = [];')],
  // (c) PROVENANCE, two more — both reached only by the both-halves probe above.
  ['lint`s command read from COMPOSED instead of from package.json',
    'lint`s coverage left to the DERIVED clause alone — the lint row gone AND examples/ dropped',
    (t) => t.replace("  const lintCmd = scripts.lint ?? '';",
      "  const lintCmd = COMPOSED.find((c) => c.name === 'lint')?.parts.join(' ') ?? '';")],
  // **This entry was a REWRITE dressed as a provenance probe, and W28's grading is
  // what exposed it — it had been scored *noticed* since W24 and was noticed by
  // nothing.** It read the walked trees from the literal
  // `['src/', 'test/', 'index.ts']`, which is not the same SHAPE as the expression
  // it replaces: the real one yields absolute paths that `rel()` reduces to
  // `src/`, `test/`, `examples/`, while `rel('src/')` resolves against the root and
  // comes back `src` with no trailing slash. So the mutant reported **`"lint" does
  // not lint src` and `does not lint test` on every run, package.json untouched** —
  // it was NOISY rather than inert, every probe went red against it, and an exit
  // code cannot tell that from a detection. Its own named probe was **still caught**.
  //
  // **`doc/workflow.md` v0.9's procedure names this exactly**: *a provenance probe
  // changes the SOURCE EXPRESSION and nothing else*, and the moment it also changes
  // the projection it is a rewrite whose survival says nothing. [Q112](../doc/questions/q112.md)
  // corrected that four times across three items; this is the fifth, and the first
  // caught by a machine rather than by a reader.
  //
  // Dropping one term from the spread is the source swap the entry meant: same
  // shape, one origin fewer, and the disk walk stops being what tells the check
  // `examples/` must be linted. Measured — probe alone 1 failure, probe under this
  // mutation **0**, and this mutation alone on a clean tree **0**.
  ['the linted trees no longer read the examples walk — the disk half of the derived clause`s source',
    'lint`s coverage left to the DERIVED clause alone — the lint row gone AND examples/ dropped',
    // Re-anchored by W57: the test-tree walker is `testSources()` since `S9` was retired, and
    // the old anchor matched nothing — which this file reported rather than grading.
    (t) => t.replace('const walked = new Set([...files, ...testSources(), ...exampleSources()].map((p) => {',
      'const walked = new Set([...files, ...testSources()].map((p) => {')],
  ['the chain read from GATE_CHAIN instead of from package.json',
    'a runtime dropped from the gate chain — Q126, reproduced',
    (t) => t.replace("const gate = typeof scripts.gate === 'string' ? scripts.gate.trim() : '';",
      "const gate = GATE_CHAIN.map((n) => 'npm run ' + n).join(' && ');")],
  ['each sub-chain read from its own declaration instead of from package.json',
    'typecheck:deno dropped from the typecheck chain — the only Deno typecheck',
    (t) => t.replace("    const cmd = typeof scripts[c.name] === 'string' ? scripts[c.name].trim() : '';",
      "    const cmd = c.parts.join(c.split === '&&' ? ' && ' : ' ');")],
  // (a) S4 and S7, whose clauses had no grading because they had no probe. Each
  // pair breaks the CLAUSE and then the LOOP BOUND behind it — rule 8's first and
  // fourth obligations on the same two checks, which is what says the pattern lists
  // are lists rather than decoration.
  ['S4`s clause disabled', 'an enum in published source — RT-R9, which every typechecker accepts',
    (t) => t.replace("      fail('S4',", "      [].push('S4',")],
  ['UNSTRIPPABLE emptied — the whole pattern list leaving',
    'a constructor PARAMETER PROPERTY in published source — RT-R9`s own example',
    (t) => t.replace(/const UNSTRIPPABLE = \[\n[\s\S]*?\n\];/, 'const UNSTRIPPABLE = [];')],  // `[\n` so the result cannot re-match
  ['S7`s clause disabled', 'a published file importing the scheduler by its JSR name, bare',
    (t) => t.replace("        fail('S7',", "        [].push('S7',")],
  ['SPECIFIER_FORMS emptied at S7`s loop head — the whole list leaving',
    'the npm name reached with an npm: prefix — a form only Deno resolves',
    // Narrowed to `S7`'s own loop head rather than to the array: `S1`'s `NODE_IMPORT` is a
    // separate list, so nothing else reads this one — but the GLOBAL guard below is what
    // refuses an anchor that could, and the loop head is the one string that cannot.
    (t) => t.replace('  for (const re of SPECIFIER_FORMS) {', '  for (const re of []) {')],
  ['S7`s predicate made vacuous — every specifier reads as the canonical one',
    'a file: specifier reaching the scheduler in published source',
    // The narrowed clause is a PREDICATE over a captured specifier, so the list bound above
    // and the fail() site do not cover it: with `&& false` appended, every form is read as
    // the bare name and the clause fires on nothing while the loop runs over everything.
    (t) => t.replace("const reachesSchedulerWrongly = (spec) => SCHEDULER_NAMES.test(spec) && spec !== CANONICAL_SPECIFIER;",
      "const reachesSchedulerWrongly = (spec) => SCHEDULER_NAMES.test(spec) && spec !== CANONICAL_SPECIFIER && false;")],
  // --- S14 (W62): the outside clause, the form clause, the name regex and the directory bound ---
  // W66: `S16`'s one clause, and its LIST — a name dropped from `CONSTRUCTS` is the way this check
  // goes quiet without its `fail()` moving, which is obligation (e)'s third shape (a list is a claim).
  // W66's adequacy reader (F15): the regex branch itself, graded by the probe that only it catches.
  ['the scan`s REGEX branch removed', 'a violation behind a regex literal containing a BACKTICK — the same blind spot, to end of file',
    (t) => t.replace("    if (c === '/' && REGEX_MAY_START.test(lastMeaningful(out))) {", "    if (false && c === '/') {")],
  ['S16`s clause disabled', 'the PURE ENTRY constructing a WorkerManager — a consumer who wanted no pool would load one',
    (t) => t.replace("      fail('S16',", "      [].push('S16',")],
  ['S16`s CONSTRUCTS list emptied', 'the DRIVER constructing a FyflowScheduler — ADR 0001 rule 1`s shape, one constructor over',
    (t) => t.replace("const CONSTRUCTS = ['WorkerManager', 'FyflowScheduler',", "const CONSTRUCTS = [].concat([]) && ['NothingAtAll'] || ['WorkerManager', 'FyflowScheduler',")],
  ['S16`s directory exemption widened to all of src/', 'the definition half constructing a resource GROUP — the built-ins` schemas live there and their factories must not',
    (t) => t.replace("const CONSTRUCTOR_DIR = 'src/scheduler/';", "const CONSTRUCTOR_DIR = 'src/';")],
  ['S14`s outside clause disabled', 'a published file outside src/jsonata/ importing jsonata — the pure entry`s half would carry the engine',
    (t) => t.replace("      if (!r.startsWith(JSONATA_DIR)) {\n        fail('S14',", "      if (!r.startsWith(JSONATA_DIR)) {\n        [].push('S14',")],
  ['S14`s form clause disabled', 'src/jsonata reaching the engine by npm:jsonata — the form Node and the browser cannot resolve',
    (t) => t.replace("      } else if (spec !== 'jsonata') {\n        fail('S14',", "      } else if (spec !== 'jsonata') {\n        [].push('S14',")],
  ['JSONATA_NAMES made to match nothing', 'the ROOT re-exporting the jsonata sub-path — ADR 0049 rule 5`s shape one sub-path over, which W59`s reader found unobserved for the helper',
    (t) => t.replace("const JSONATA_NAMES = /(^|[\\/:])jsonata(?=$|[\\/@.?#])/;", "const JSONATA_NAMES = /(?!)/;")],
  // Names the BARE import from `src/definition/`: widened, that file is "inside" and the bare form
  // passes the form clause. The sub-path re-export probe stays caught with the directory widened,
  // because `../jsonata/index.ts` is not the bare specifier — the form clause fires (measured on
  // this file's first run: STILL CAUGHT against a check that does not check).
  ['JSONATA_DIR widened to src/ — every published file is "inside"', 'a published file outside src/jsonata/ importing jsonata — the pure entry`s half would carry the engine',
    (t) => t.replace("const JSONATA_DIR = 'src/jsonata/';", "const JSONATA_DIR = 'src/';")],
  // --- S15 (W62): the pin clause, the second-field clause, the mapping clause and the exports clause ---
  ['S15`s pin clause disabled', 'jsonata at a different pin in package.json than deno.json — two engines',
    (t) => t.replace("  if (deps.jsonata !== JSONATA_PIN) {\n    fail('S15',", "  if (deps.jsonata !== JSONATA_PIN) {\n    [].push('S15',")],
  ['S15`s second-field clause disabled', 'jsonata declared as an optional PEER beside dependencies — the adjacent fields W57`s reader found',
    (t) => t.replace("      fail('S15', `${PKG_PATH} ${field} names jsonata", "      [].push('S15', `${PKG_PATH} ${field} names jsonata")],
  ['S15`s second-field list shortened to peerDependencies alone', 'jsonata declared in devDependencies as well — a second declaration',
    (t) => t.replace("  for (const field of ['peerDependencies', 'optionalDependencies', 'peerDependenciesMeta', 'devDependencies', 'bundledDependencies', 'bundleDependencies']) {", "  for (const field of ['peerDependencies']) {")],
  ['S15`s array fields read as OBJECTS (bundledDependencies invisible again)', 'jsonata in bundledDependencies — the tarball ships the engine`s files past every check (the adequacy reader, m11)',
    (t) => t.replace("    const names = Array.isArray(pkg[field]) ? pkg[field].map(String) : Object.keys(pkg[field] ?? {});", "    const names = Object.keys(pkg[field] ?? {});")],
  ['S14`s form clause weakened to a PREFIX test', 'src/jsonata reaching a package SUB-PATH, jsonata/jsonata.js — a form a prefix test would pass (the adequacy reader, m09)',
    (t) => t.replace("      } else if (spec !== 'jsonata') {", "      } else if (!spec.startsWith('jsonata')) {")],
  ['S15`s deno mapping clause disabled', 'deno.json`s jsonata mapping REMOVED — Deno then resolves through package.json (Q252`s shape), and only S15 sees it',
    (t) => t.replace("  if (mapped !== `npm:jsonata@${JSONATA_PIN}`) {\n    fail('S15',", "  if (mapped !== `npm:jsonata@${JSONATA_PIN}`) {\n    [].push('S15',")],
  ['S15`s scopes clause disabled', 'deno.json re-maps jsonata in a scopes block — beside the field the check reads',
    (t) => t.replace("    if (where !== 'imports' && (JSONATA_NAMES.test(spec) || JSONATA_NAMES.test(String(target)))) {\n      fail('S15',", "    if (where !== 'imports' && (JSONATA_NAMES.test(spec) || JSONATA_NAMES.test(String(target)))) {\n      [].push('S15',")],
  ['S15`s npm exports clause disabled', 'package.json`s ./jsonata export removed — nothing but S15 reads the map for it',
    (t) => t.replace("  if (sched === undefined || JSON.stringify(js) !== expectedNpm) {\n    fail('S15',", "  if (sched === undefined || JSON.stringify(js) !== expectedNpm) {\n    [].push('S15',")],
  ['S15`s deno exports clause disabled', 'deno.json`s ./jsonata export removed',
    (t) => t.replace("  if (denoJson.exports?.['./jsonata'] !== './src/jsonata/index.ts') {\n    fail('S15',", "  if (denoJson.exports?.['./jsonata'] !== './src/jsonata/index.ts') {\n    [].push('S15',")],
  ['S8`s second-declaration clause disabled',
    'the scheduler declared as an optionalDependency — a second copy, optionally',
    (t) => t.replace("      fail('S8', `${PKG_PATH} ${field} declares", "      [].push(`${PKG_PATH} ${field} declares")],
  ['S8`s deno.json PATH clause disabled',
    'deno.json maps the scheduler to a working-tree PATH — ADR 0029`s incident, in the publish manifest',
    (t) => t.replace("    fail('S8', `${DENO_PATH} ${where} maps", "    [].push(`${DENO_PATH} ${where} maps")],

  ['every failure swallowed',
    'the scheduler declared as a runtime dependency', (t) => t.replace('const fail = (check, msg) => failures.push(`${check}: ${msg}`);', 'const fail = () => {};')],
  ['the non-zero exit removed',
    'GATE_CHAIN emptied entirely — the whole list leaving', (t) => t.replace('  process.exit(1);', '  process.exitCode = 0;')],
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

  // --- W28: the named-probe contract, and each of these needs TWO edits ---------
  //
  // **A SELF entry is allowed two edits and a provocation is not**, which is worth
  // stating because rule 8's provenance procedure says the opposite one layer down.
  // A provenance probe must change the source expression and nothing else, or its
  // survival says nothing. A `SELF` entry asks *does this harness notice*, and three
  // of the four guards below are unobservable on a tree where nothing is wrong — so
  // the entry has to break the guard AND supply the case the guard exists for.
  // Otherwise it measures nothing and reports SURVIVED, which is `doc/workflow.md`
  // rule 8's own definition of a vacuous probe.
  // **EVERY anchor below spans TWO LINES, and that is not style.** Each of these
  // entries mutates a guard by quoting it, and the quote sits EARLIER in this file
  // than the guard does — so a single-line anchor matches the entry's own literal
  // and the entry edits ITSELF. All four were written that way, all four ran, and
  // **two reported SURVIVED while two reported BOUNDED VACUOUSLY**: the guard they
  // claim to remove was never removed, and the run went red for a different reason.
  // Only the first two were visible; entries 3 and 4 passed and said nothing.
  //
  // A two-line anchor cannot self-match, because the `\n` in a source literal is two
  // characters and the newline it targets is one. **This is W25's *a comment that
  // quotes the code it explains makes that code unmutatable* — with the comment
  // replaced by the mutation's own argument**, which is worse: a comment produces a
  // no-op the rule 7 (b) guard catches, and this produces an edit that lands
  // somewhere real. [Q143](../doc/questions/q143.md).
  ['the probe name dropped from the child`s env, so the grading reads the whole suite again',
    // The cheapest demonstration that single-probe mode is load-bearing: without
    // `CHECK_SOURCE_PROBE` the child runs all 24 probes and never prints `ran:`, so
    // the crash guard refuses it. **That the OLD contract now fails this file is the
    // point.**
    (t) => t.replace('timeout: 900_000,\n          env: { ...process.env, CHECK_SOURCE_SCRIPT: path, CHECK_SOURCE_PROBE: probeName } });',
      'timeout: 900_000,\n          env: { ...process.env, CHECK_SOURCE_SCRIPT: path } });')],
  // **The three below edit the META LIST and leave the guards alone, and that is a
  // correction of how they were first written.** Each began as *remove the guard AND
  // supply the case it catches* — two edits — and each then reported the wrong thing:
  // with the guard gone and the defect present the run goes GREEN, so `SELF`'s
  // *"must exit non-zero"* reads as **the floor did not fire** whether the guard was
  // load-bearing or not. Editing only the defect asks the question the right way
  // round: **with the guard in place, does the run go red?** One edit each, rule 7
  // (b) covers it, and nothing self-matches because `META` sits above `SELF`.
  ['one META entry pointed at a probe that does not exist — the ABORT`s own case',
    (t) => t.replace("    'the scheduler declared as a runtime dependency', (t) => t.replace('const fail",
      "    'a probe this file does not have', (t) => t.replace('const fail")],
  ['one META entry pointed at a probe its mutation does not break — the STILL-CAUGHT case',
    // Emptying `COMPOSED`'s comparison cannot make the `S8` probe stop being caught,
    // so the entry is mislabelled and the verdict has to say so.
    (t) => t.replace("['S13`s declared-parts comparison disabled',\n    'typecheck:deno dropped from the typecheck chain — the only Deno typecheck',",
      "['S13`s declared-parts comparison disabled',\n    'the scheduler declared as a runtime dependency',")],
  // **This entry replaces one that made a META mutation FATAL, and the replacement
  // is a finding rather than a tidy-up.** That entry existed because a crashing
  // mutant used to be scored *noticed* on its exit code. **The inertness check the
  // readers asked for absorbs the whole class**: a mutant that throws does not exit
  // 0 on the untouched tree, so it is classified `corpus` — noticed, by the gate
  // itself, which is true and is stronger than a probe. The `ran:` guard stays as
  // defence in depth for a mutant that is inert on the clean tree and dies only on
  // the probe's input, and **no such mutation exists in this file**, so its
  // provocation is out of reach here. *(W143 found one — `S15`'s jsonata read — and it is
  // the `ran:` case at the end of this list; Q536.)* It is provoked in `check-markdown`, where the
  // readers measured it at a cost of 2, and it is on this file's ceiling list.
  //
  // What this entry provokes instead is rule 7 (b) at the META layer: a mutation
  // that matches nothing must say so rather than grading anything.
  // --- W30: the two bounds this item added, made load-bearing rather than present.
  //
  // **Both survived W30`s own rule 8 set at cost 0 before these entries existed**,
  // which is the ceiling `check-spec-selftest.mjs` has to live with and this file
  // does not: it HAS a list one level out, so the hole need not move — it closes.
  // Each edits the `META` LIST and leaves the guard alone, which is W28`s
  // correction: with the guard gone and the defect present the run goes GREEN, so
  // *"must exit non-zero"* would read as *the floor did not fire* either way.
  ['one META entry replaced by a DUPLICATE of another — what a COUNT cannot see',
    // Measured by W30 before the bound existed: `20/20 noticed`, exit 0, floor
    // satisfied, total unmoved, and `check-source`'s exit-path clause silently
    // ungraded. W29 found this in `check-scheduler` and named this file as
    // structurally exposed; it was exposed.
    (t) => t.replace(
      "  ['the non-zero exit removed',\n    'GATE_CHAIN emptied entirely — the whole list leaving', (t) => t.replace('  process.exit(1);', '  process.exitCode = 0;')],",
      "  ['the non-zero exit removed',\n    'the scheduler declared as a runtime dependency', (t) => t.replace('const fail = (check, msg) => failures.push(`${check}: ${msg}`);', 'const fail = () => {};')],")],
  ['one META entry`s anchor made GLOBAL — one entry, five S12 sites, one name',
    // W29's adequacy reader's finding, measured live here by W30: swapping `S12
    // disabled`'s anchor for `/fail\\('S12',/g` disabled ALL FIVE `S12` clauses
    // while naming one, and this file still reported `20/20 noticed` at exit 0.
    (t) => t.replace(
      "    'a runtime dropped from the gate chain — Q126, reproduced', (t) => t.replace('    if (unreadable.length === 0) {', '    if (false) {')],",
      "    'a runtime dropped from the gate chain — Q126, reproduced', (t) => t.replace(/fail\\('S12',/g, \"[].push('S12',\")],")],
  ['a SECOND META entry taking the `wide` exemption — what MAX_WIDE bounds',
    // The reader`s own edit, checked in: give an entry that names one clause a fourth
    // element, and both anchor guards stop applying to it. One edit, and `META` sits
    // above `SELF` so nothing self-matches.
    (t) => t.replace(
      "  ['S7`s clause disabled', 'a published file importing the scheduler by its JSR name, bare',",
      "  ['S7`s clause disabled', 'a published file importing the scheduler by its JSR name, bare', undefined, 'a second exemption nobody bounded',")],
  ['one META mutation made VACUOUS — rule 7 (b) at the grading layer',
    (t) => t.replace("(t) => t.replace('    if (unreadable.length === 0) {', '    if (false) {')",
      "(t) => t.replace('a string this file does not contain', 'nor this one')")],

  // --- W143: the three guards' own cases, each graded on its REASON ----------------
  //
  // **Q536: the `ran:` case this file said it could not have.** The comment above said *no such
  // mutation exists in this file*; one does. `S15` reads `deno.json`'s jsonata mapping, and with
  // `.trim()` added to that read the mutant is INERT on the clean tree (the mapping is a string) and
  // THROWS under *deno.json`s jsonata mapping REMOVED* (it is `undefined`) — before the report line, so
  // the grandchild prints `ran: no` and the injected entry must FAIL naming *the mutant did not run*.
  ['a META entry inert on the clean tree and FATAL under its probe — the `ran:` case, Q536',
    (t) => t.replace("  ['S12 disabled',\n",
      "  ['S15`s jsonata read made to THROW on a missing mapping',\n" +
      "    'deno.json`s jsonata mapping REMOVED — Deno then resolves through package.json (Q252`s shape), and only S15 sees it',\n" +
      "    (t) => t.replace('const mapped = denoJson.imports?.jsonata;', 'const mapped = denoJson.imports?.jsonata.trim();')],\n" +
      "  ['S12 disabled',\n"),
    'S15`s jsonata read made to THROW on a missing mapping — the mutant did not run'],
  // **Q434, in the META pass and in the PROBES pass.** A dead second edit appended to a real mutation:
  // the text still changes, so the whole-text guard passes it, and only the instrumented count refuses
  // it. Each child must go red on that entry's own `matched NOTHING` line.
  ['a META entry made a COMPOUND whose second edit matches nothing — Q434',
    (t) => t.replace("'a runtime dropped from the gate chain — Q126, reproduced', (t) => t.replace('    if (unreadable.length === 0) {', '    if (false) {')],",
      "'a runtime dropped from the gate chain — Q126, reproduced', (t) => t.replace('    if (unreadable.length === 0) {', '    if (false) {').replace('W143: no such anchor', '')],"),
    "S12 disabled — 1 of this mutation's `replace` calls matched NOTHING"],
  ['a PROBE made a COMPOUND whose second edit matches nothing — Q434',
    (t) => t.replace("    mutate: (t) => t.replace('\"gate\": \"npm run lint && ', '\"gate\": \"'),",
      "    mutate: (t) => t.replace('\"gate\": \"npm run lint && ', '\"gate\": \"').replace('W143: no such anchor', ''),"),
    "lint dropped from the gate chain  — 1 of this mutation's `replace` calls matched NOTHING"],
  // **Q437: the META control handed a copy that cannot run.** The control's source gets a first line
  // that throws, so the copy fails on the clean tree as a copy at the wrong depth did at W105 — and the
  // control, not any entry, must be what turns the child red. The anchor is SPLIT, because the line it
  // edits sits BELOW this list and an unsplit quote here would be the first match.
  ['the META control handed a copy that cannot run — Q437',
    (t) => t.replace("gradeMeta(-1, ['the control: an UNMUTATED copy', META[0][1], IDENTITY]" + ');',
      "gradeMeta(-1, ['the control: an UNMUTATED copy', META[0][1], IDENTITY], 'throw new Error(\"W143: this copy cannot run\");\\n' + checkSource);"),
    'FAIL  the control: an UNMUTATED copy of check-source.mjs is graded'],
];

export async function selfTest(root) {
  // **The shared instrumented replace — W143, Q434.** Loaded by the ROOT rather than by `./`, because
  // a SELF child runs a mutated copy of this file from dev-dist/ (scripts/selftest-guards.mjs's header).
  const { applyMutation, missWhy } = await import(pathToFileURL(join(root, 'scripts', 'selftest-guards.mjs')).href);
  // **Per PROCESS, and removed on the way out including on the abort path — W105.** `dev-dist/` is one
  // flat namespace and this was a FIXED path inside it, `rmSync`d on entry, so a child running this same
  // function deleted its parent's fixtures and two top-level runs did the same to each other
  // ([Q182](../doc/questions/q182.md)). The `rmSync` stays, and is now load-bearing for a different
  // reason: Windows recycles pids, so a directory a killed run left can be inherited by a live one.
  // **`process.on('exit')` rather than a `finally`**, because this function returns from many places and
  // the one road none of their `rmSync` calls covers is a THROW — which is how W103's finding 3 left its
  // stub behind. `SIGKILL` leaks this one directory: *one path per killed run, not one per probe*.
  const dir = join(root, 'dev-dist', `source-selftest-${process.pid}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  process.on('exit', () => rmSync(dir, { recursive: true, force: true }));
  // The RELATIVE spelling, DERIVED rather than written a second time — W105. `stem` named
  // `dev-dist/source-selftest/` by hand and `tree` built the same directory a third way with its
  // own `join`: three sources for one path, so namespacing any one of them alone is a child
  // reading a directory nothing staged into.
  const relDir = relative(root, dir).replace(/\\/g, '/');
  // **The flat `.meta-*` mutants are registered too**: each is written and removed per entry inside a
  // `finally`, so at most one is alive, but a throw between the two used to leave an `.mjs` in
  // `dev-dist/` — W103's finding 3's exact shape.
  const metaMutants = new Set();
  process.on('exit', () => { for (const p of metaMutants) rmSync(p, { force: true }); });

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
    deno: readFileSync(join(root, 'deno.json'), 'utf8'),
    check: readFileSync(script, 'utf8'),
  };

  if (PROBES.length < MIN_PROBES || META.length < MIN_META || SELF.length < MIN_SELF) {
    console.log(`check-source self-test — ${PROBES.length} probes (floor ${MIN_PROBES}), ` +
      `${META.length} meta (floor ${MIN_META}), ${SELF.length} self (floor ${MIN_SELF}).`);
    console.log('  FAIL  a list is short, and `caught === length` is vacuous at zero.');
    rmSync(dir, { recursive: true, force: true });
    return 1;
  }

  // **`META` is bounded by CONTENT as well as by count, and W30 MEASURED the hole
  // here rather than inheriting it.** W29 found this in `check-scheduler` and named
  // `check-source`, `check-markdown` and `check-policies` as structurally exposed
  // and unmeasured. Measured: replacing this file's *"the non-zero exit removed"*
  // entry with a **duplicate** of *"every failure swallowed"* reported
  // **`20/20 noticed` at exit 0** — floor satisfied, total unmoved, and
  // `check-source`'s exit-path clause silently ungraded.
  //
  // **Only the distinctness half is available here, and that is stated rather than
  // quietly dropped.** `check-scheduler-selftest.mjs` carries a second bound — every
  // id loses a `fail()` SITE to some entry — which works there because every entry
  // rewrites a `fail('Dx', ` prefix. Most entries here disable a clause with
  // `if (false)` or `for (… of [])` and leave every `fail()` call textually in
  // place, so a site count cannot see them. `check-spec-selftest.mjs` ships both.
  {
    // **Against the REAL check, never `source.check`.** `source.check` is
    // `readFileSync(script)`, and in a META child `script` IS the mutant — so two
    // entries that both become no-ops on an already-broken check collapse to the
    // same string and this bound refuses a correct list. Measured: with
    // `checks = []` already applied, *"the whole checks array emptied"* and *"the
    // S12 row deleted"* both matched nothing, the child aborted at `23 distinct
    // mutations`, and the parent reported it as a CRASH. **A bound derived from
    // "the script under test" is a different bound inside a child whose script
    // under test is broken.**
    const real = readFileSync(join(root, 'scripts', 'check-source.mjs'), 'utf8');
    const mutants = META.map(([, , m]) => { try { return m(real); } catch { return null; } });
    const wideEntries = META.filter(([, , , w]) => w).map(([n]) => n);
    if (wideEntries.length > MAX_WIDE) {
      console.log(`check-source self-test — ${wideEntries.length} META entries take the ` +
        `\`wide\` exemption and this file declares ${MAX_WIDE}: ${wideEntries.join('; ')}.`);
      console.log('  FAIL  every one of them is exempt from BOTH anchor guards, so an entry can ' +
        'disable a set of clauses while naming one and say nothing about it.');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
    if (new Set(mutants).size !== META.length) {
      console.log(`check-source self-test — ${META.length} meta entries, ` +
        `${new Set(mutants).size} distinct mutations.`);
      console.log('  FAIL  two META entries produce the SAME mutation, so one clause is graded ' +
        'twice and another not at all — a floor counts entries and cannot see this.');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
  }

  /**
   * **The verdict, computed in ONE place**, because W30 added a third probe half
   * and two callers computing the same fact is how they drift — this file's own
   * stated reason for sharing `runOne` between the main pass and single-probe mode.
   */
  const verdict = (probe, r) => {
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
    // The set of checks that actually reported a failure, compared against the set
    // this probe declared. **Equality, not membership**: a probe that trips a check
    // it did not name is malformed, and a malformed probe reported as caught is the
    // whole reason this file exists.
    //
    // Read from the FAILURE LINES, which say which check owns each failure.
    // **`clean`: the probe is a CONTROL and the check must ACCEPT its input** — W57, for the
    // one form the narrowed `S7` permits. Declared as the empty set, and `refused` then means
    // exit 0 with nothing tripped; every other probe keeps its non-zero-exit meaning.
    const declared = probe.clean ? [] : [probe.check, ...(probe.also ?? [])].sort();
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
    const refused = (probe.clean ? r.status === 0 : r.status !== 0) && tripped.join(',') === declared.join(',') && agree;
    return {
      vacuous: false, refused, ran: RAN(out), declared, tripped, agree, status: r.status,
      msg: `exited ${r.status}, wanted [${declared.join(',')}], ` +
        `got [${tripped.join(',')}]${agree ? '' : `, report rows said [${rows.join(',')}]`}`,
    };
  };

  /**
   * **One probe, run once**, shared by the main pass and by single-probe mode so
   * the two cannot drift. Returns the verdict rather than printing it, because the
   * two callers want different things around the same line.
   *
   * `ran` says whether the mutated check PRINTED ITS HEADER. A mutant that throws
   * exits non-zero and reports nothing, which every grading here used to read as a
   * catch — W24's conformity reader found one such entry and **W28's `ran:` guard
   * found a second in `check-policies-selftest.mjs` on its first run.**
   */
  const runOne = (i, probe) => {
    const stem = `${relDir}/${String(i).padStart(2, '0')}`;
    const declared = probe.clean ? [] : [probe.check, ...(probe.also ?? [])].sort();
    // **The third half, added by W30: a copy of the PUBLISHED TREE.** `S4` and `S7`
    // loop over `published()`, so neither the manifest half nor the check half can
    // reach them — the probe has to hand this script a different `src/` and
    // `index.ts`. `CHECK_SOURCE_SRC` is that handle and it is inert when unset.
    if (probe.half === 'src') {
      const tree = join(dir, `tree-${String(i).padStart(2, '0')}`);
      rmSync(tree, { recursive: true, force: true });
      mkdirSync(tree, { recursive: true });
      cpSync(join(root, 'src'), join(tree, 'src'), { recursive: true });
      cpSync(join(root, 'index.ts'), join(tree, 'index.ts'));
      const target = join(tree, probe.file);
      const before = readFileSync(target, 'utf8');
      const { out: after, misses } = applyMutation(probe.mutate, before);
      if (after === before) {
        return { vacuous: true, refused: false, ran: false, declared, tripped: [], agree: true,
          msg: 'the mutation matched nothing' };
      }
      // **And EVERY edit of it matched** (W143, Q434).
      if (misses > 0) return { vacuous: true, refused: false, ran: false, declared, tripped: [], agree: true, msg: missWhy(misses) };
      writeFileSync(target, after);
      const env = { ...process.env, CHECK_SOURCE_SRC: relative(root, tree).replace(/\\/g, '/') };
      const r = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', env, timeout: 300_000 });
      rmSync(tree, { recursive: true, force: true });
      return verdict(probe, r);
    }
    const { out: mutated, misses } = applyMutation(probe.mutate, source[probe.half]);
    // **`declared` and `tripped` on EVERY vacuous return — W143.** These two returns carried neither, so
    // single-probe mode threw at `v.declared.filter(...)`: a META child whose named probe went vacuous died
    // with a TypeError instead of printing `ran: no` and `outcome: vacuous`. The child now says so; the
    // parent still tests `!ran` first and reports it as *the mutant did not run* (the reader's finding 7),
    // which is a red either way. The `src` half's return carried `declared: []`; all four carry the
    // probe's own set now.
    if (mutated === source[probe.half]) {
      // A probe that changes nothing passes for the wrong reason — the exact
      // vacuity rule 7 (b) refuses.
      return { vacuous: true, refused: false, ran: false, declared, tripped: [], agree: true, msg: 'the mutation matched nothing' };
    }
    if (misses > 0) return { vacuous: true, refused: false, ran: false, declared, tripped: [], agree: true, msg: missWhy(misses) };
    const env = { ...process.env };
    let run = script;
    // **`alsoPkg` breaks the manifest as well as the check**, and exists because one
    // clause here can only be reached with both halves broken: while `COMPOSED`
    // still declares `lint`'s arguments, the declared-parts comparison catches
    // everything the derived disk-walk clause would, so the derived clause's own
    // source can be swapped for free. A probe that mutates one half cannot
    // distinguish one route from two.
    if (probe.alsoPkg) {
      const { out: p, misses: pMisses } = applyMutation(probe.alsoPkg, source.pkg);
      if (p === source.pkg) {
        return { vacuous: true, refused: false, ran: false, declared, tripped: [], agree: true, msg: 'the alsoPkg mutation matched nothing' };
      }
      if (pMisses > 0) return { vacuous: true, refused: false, ran: false, declared, tripped: [], agree: true, msg: `alsoPkg: ${missWhy(pMisses)}` };
      writeFileSync(join(root, `${stem}.json`), p);
      env.CHECK_SOURCE_PKG = `${stem}.json`;
    }
    if (probe.half === 'pkg') {
      writeFileSync(join(root, `${stem}.json`), mutated);
      env.CHECK_SOURCE_PKG = `${stem}.json`;
    } else if (probe.half === 'deno') {
      // W57: `S8`'s JSR half reads `deno.json`, and `CHECK_SOURCE_DENO` is its copy handle.
      writeFileSync(join(root, `${stem}.deno.json`), mutated);
      env.CHECK_SOURCE_DENO = `${stem}.deno.json`;
    } else {
      // **Written one level down from ROOT, in `dev-dist/`.** `check-source.mjs`
      // derives `ROOT` as `resolve(dirname(self), '..')`, so a copy must sit
      // exactly one directory below the repository root or it reads a different
      // tree. `check-policies-selftest.mjs` uses `scripts/` for the same reason and
      // that is one level too — but `scripts/` is TRACKED and `dev-dist/` is
      // gitignored, so an interrupted run there leaves untracked files in the
      // directory `doc/workflow.md` section 7 rule 2's by-hand `git status` audit
      // reads. W24's conformity reader's finding; `dev-dist/` costs nothing.
      // FLAT, with the pid in the NAME — a copy of `check-source.mjs`, so it is depth-bound; see
      // the note beside the `.meta-*` path below.
      run = join(root, 'dev-dist', `.probe-${process.pid}-${String(i).padStart(2, '0')}.mjs`);
      metaMutants.add(run);
      writeFileSync(run, mutated);
    }
    let r;
    try {
      r = spawnSync(process.execPath, [run], { cwd: root, encoding: 'utf8', env, timeout: 300_000 });
    } finally {
      if (probe.half === 'check') rmSync(run, { force: true });
    }
    return verdict(probe, r);
  };

  /**
   * **Is the mutated check INERT on the untouched tree?** Rule 8 (b) asks for a
   * mutation that is *present but inert*, and until W28's readers nothing tested
   * it. A mutant that fails on the repository's own tree is still NOTICED — by the
   * corpus, more strongly than by any probe — but its probe verdict is meaningless,
   * because every id it reports may be noise rather than detection.
   */
  const inertOnCleanTree = () => {
    const r = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', timeout: 300_000 });
    return r.status === 0;
  };

  // **Single-probe mode.** The META pass names ONE probe and this runs that one, in
  // place of re-running all 24 against every broken check. Both halves of
  // [Q138](../doc/questions/q138.md) live in that re-run: the credit went to
  // whichever probe reacted first, and the pass cost a `PROBES.length` multiplier.
  const only = process.env.CHECK_SOURCE_PROBE;
  if (only !== undefined) {
    const i = PROBES.findIndex((p) => p.name === only);
    // **Aborts rather than passing or skipping.** A renamed probe leaves its META
    // entry pointing at nothing, and reading that as "no probe failed, so the check
    // must still be checking" is exactly backwards.
    if (i < 0) { console.log(`  ABORT  no probe is named "${only}"`); rmSync(dir, { recursive: true, force: true }); return 3; }
    // **The mutant is checked for inertness FIRST**, and a non-inert one short-
    // circuits: its probe verdict cannot discriminate, and running the probe would
    // only produce a number the parent must then ignore.
    const inert = inertOnCleanTree();
    console.log(`  inert: ${inert ? 'yes' : 'no'}`);
    if (!inert) {
      console.log('  outcome: corpus');
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
    const v = runOne(i, PROBES[i]);
    // **`outcome:` is the fact the parent grades on, and it exists because reading
    // the EXIT CODE cannot distinguish a detection from noise.** `refused` is
    // computed with full set equality here and was then collapsed to a boolean the
    // parent read as *uncaught* — so a mutant that left the named clause fully
    // detecting and added one unrelated failure was graded as a detection. Both of
    // W28's readers found it, from opposite directions, and it is the item's own
    // stated defect surviving one layer in: *the grading no longer reads AN exit
    // code, it reads ONE exit code.*
    const missing = v.declared.filter((id) => !v.tripped.includes(id));
    const outcome = v.vacuous ? 'vacuous'
      : v.refused ? 'caught'
        // The report contradicting the failure lines is a detection in its own
        // right, and it is the ONLY thing that sees a mutation to the report — the
        // set of ids is unchanged, so no set comparison can. Three entries here are
        // graded by this and nothing else.
        : !v.agree ? 'disagreed'
          // Right set, wrong exit path: the check found everything and told the
          // shell it was fine.
          : v.status === 0 ? 'exit0'
            : v.declared.length === 0 ? (v.tripped.length ? 'fires' : 'other')
              : missing.length ? 'disappeared'
                : v.tripped.length > v.declared.length ? 'noisy' : 'other';
    console.log(`  ran: ${v.ran ? 'yes' : 'no'}`);
    console.log(`  outcome: ${outcome}`);
    console.log(`  ${v.refused ? 'ok  ' : 'FAIL'}  ${PROBES[i].check}  ${PROBES[i].name}` +
      (v.refused ? '' : `  — ${v.msg}`));
    rmSync(dir, { recursive: true, force: true });
    return v.refused ? 0 : 1;
  }

  console.log(`check-source self-test — ${PROBES.length} probes\n`);
  let caught = 0;
  for (const [i, probe] of PROBES.entries()) {
    const v = runOne(i, probe);
    if (v.refused) caught++;
    console.log(`  ${v.refused ? 'ok  ' : 'FAIL'}  ${probe.clean ? 'ctl' : probe.check}  ${probe.name}` +
      (v.refused ? '' : `  — ${v.msg}`));
    // Once a probe has gone uncaught in a nested child the answer is settled and
    // the remaining spawns are waste.
    if (nested && !v.refused) break;
  }
  console.log(`\n${caught}/${PROBES.length} probes caught.`);
  if (caught !== PROBES.length) { rmSync(dir, { recursive: true, force: true }); return 1; }
  if (nestedScript) { rmSync(dir, { recursive: true, force: true }); return 0; }

  // --- the META pass: does this suite NOTICE a broken check? -------------------
  const checkSource = readFileSync(join(root, 'scripts', 'check-source.mjs'), 'utf8');
  let noticed = 0, byCorpus = 0;
  console.log(`\nand against a broken check — ${META.length} mutations of check-source.mjs itself\n`);
  /** The control's mutation: it changes nothing, and `gradeMeta` skips the text guards for it alone. */
  const IDENTITY = (t) => t;
  /**
   * **One META entry, graded — a function since W143** so the control below goes through the SAME path
   * as every entry. Returns `{ ok, why, corpus, outcome }`. `source` is the text the mutation is applied
   * to: the real check, except where a `SELF` entry provokes the control with a copy that cannot run.
   */
  const gradeMeta = (i, [name, probeName, mutate, wide], source = checkSource) => {
    // **Instrumented — W143, Q434.** Only this FIRST application: the two guards below re-apply the
    // mutation where it must NOT match, and counting those would count their success as a miss.
    const { out: broken, misses } = applyMutation(mutate, source);
    if (broken === source && mutate !== IDENTITY) return { ok: false, why: ' — the mutation matched nothing' };
    if (misses > 0) return { ok: false, why: ` — ${missWhy(misses)}` };
    // **And it must have matched exactly ONCE, and must not be GLOBAL** — W29's two
    // guards, carried here because **W30 measured both holes live in this file**.
    // Swapping one entry's anchor for `/fail\('S12',/g` disabled **all five** `S12`
    // sites while naming one, and this file still reported `20/20 noticed`. Rule 7
    // (b) asks that a mutation match something; these ask that it match **what it
    // says**.
    //
    // Applying the mutation to its own output catches a second occurrence; applying
    // it to the source concatenated with itself catches a `/g` anchor, which the
    // first cannot see because a global pass edits everything and then changes
    // nothing on the second run.
    //
    // **`wide` is a DECLARED exemption with its reason, and exactly one entry takes
    // it.** The `S12`/`S13` swap is a rename of every site by construction — that is
    // what makes the counts match and the sets not — so both guards would refuse a
    // correct entry. An exemption that has to be written down beside the entry is a
    // different thing from a guard that is not there.
    if (!wide && mutate !== IDENTITY) {
      if (mutate(broken) !== broken) {
        return { ok: false, why: ' — the mutation matched MORE THAN ONCE, so it landed ' +
          'on the first of several and the entry does not say which' };
      }
      if (!mutate(source + source).endsWith(source)) {
        return { ok: false, why: ' — the mutation is GLOBAL: it edits every match rather ' +
          'than the one this entry names, so its verdict is about a set of clauses and not a clause' };
      }
    }
    // **FLAT, with the pid in the NAME.** A `.meta-*` mutant is a copy of the CHECK, which derives
    // `ROOT = resolve(dirname(self), '..')`, so it must sit exactly one directory below the repository
    // root — W105 nested three of these and `check:spec:selftest` reported *29 of 29 graded by the
    // CORPUS*, its own *the harness broke rather than the check* clause. A `.self-*` mutant is a copy of
    // this SELFTEST module, which the dispatch hands `ROOT`, and nests.
    const path = join(root, 'dev-dist', `.meta-${process.pid}-${i < 0 ? 'control' : String(i).padStart(2, '0')}.mjs`);
    metaMutants.add(path);
    writeFileSync(path, broken);
    let ok = false, why = '', corpus = false, outcome;
    try {
      const r = spawnSync(process.execPath, [join(root, 'scripts', 'check-source.mjs'), '--self-test'],
        { cwd: root, encoding: 'utf8', timeout: 900_000,
          env: { ...process.env, CHECK_SOURCE_SCRIPT: path, CHECK_SOURCE_PROBE: probeName } });
      const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
      // **Three verdicts where there was one**, and each says something different.
      //   3 — the named probe does not exist. A dangling reference, and NOT
      //       evidence about the check either way.
      //   1 — the named probe went uncaught: this entry did what it claims.
      //   0 — the named probe is STILL CAUGHT. Either the probes have a hole this
      //       entry cannot see, or the entry names the wrong probe. Both are
      //       findings, and neither may be closed by renaming the probe to whatever
      //       happens to fail — that is the one way to finish this wrongly.
      // `ran: no` means the mutant CRASHED rather than stopped checking, which an
      // exit code alone reads as a catch.
      // **Graded on the child's `outcome:`, not on its exit code.** Both of W28's
      // readers found that the exit code cannot tell a detection from NOISE: a
      // mutant that leaves the named clause fully detecting and adds one unrelated
      // failure makes `refused` false, which the exit code reports as *uncaught*.
      // The child computes the discriminating fact and now says it out loud.
      const ran = /^ {2}ran: yes$/m.test(out);
      outcome = (out.match(/^ {2}outcome: (\w+)$/m) ?? [, ''])[1];
      if (r.status === 3) why = ` — ${out.trim().split('\n').pop()}`;
      // A mutant that fails on the repository's own tree is NOTICED — by the corpus,
      // which is stronger than any probe. Its probe verdict is meaningless and is
      // not consulted. Reported distinctly so the count of probe-backed gradings
      // stays visible; W25's *"caught by the CORPUS rather than by a probe"*, made
      // into a verdict instead of a footnote.
      else if (outcome === 'corpus') { ok = true; corpus = true; why = ' (by the corpus: the mutant is not inert)'; }
      else if (!ran) why = ' — the mutant did not run: this is a crash, not a detection';
      else if (outcome === 'caught') why = ` — "${probeName}" is STILL CAUGHT against a check that does not check`;
      else if (outcome === 'noisy') why = ` — "${probeName}" still reports every id it declared; the mutant only got NOISIER, which is not a detection`;
      else if (['disappeared', 'fires', 'disagreed', 'exit0'].includes(outcome)) ok = true;
      else why = ` — the child reported outcome "${outcome || '(none)'}", which grades nothing`;
    } finally { rmSync(path, { force: true }); }
    return { ok, why, corpus, outcome };
  };

  // **The CONTROL for this pass — W143, Q437.** An UNMUTATED copy of the check, driven through the same
  // `gradeMeta` every entry takes, naming `META[0]`'s probe. Nothing is broken, so the probe must still
  // catch what it declares (`outcome: caught`) and the entry must NOT be graded noticed. A copy that
  // cannot run against the check comes back noticed — by the corpus — which is how a pass grades every
  // mutation of a check it never ran against (W105's adequacy reader, in check-wiring-selftest.mjs). The
  // `SELF` entry *the META control handed a copy that cannot run* is its checked-in case, and **removing
  // this block is visible**: `metaControl` is read by the verdict below.
  const metaControl = gradeMeta(-1, ['the control: an UNMUTATED copy', META[0][1], IDENTITY]);
  if (metaControl.ok || metaControl.outcome !== 'caught') {
    console.log(`  FAIL  the control: an UNMUTATED copy of check-source.mjs is graded ` +
      `${metaControl.ok ? 'NOTICED' : 'not caught'} (outcome "${metaControl.outcome ?? '(none)'}"${metaControl.why}). ` +
      'Nothing is broken, so the probe must still catch what it declares — every verdict below would be a ' +
      'fact about the harness rather than about the check.');
    rmSync(dir, { recursive: true, force: true });
    return 1;
  }
  console.log('  ok    the control: an unmutated copy is NOT graded as noticed (outcome caught)\n');
  for (const [i, entry] of META.entries()) {
    const { ok, why, corpus } = gradeMeta(i, entry);
    if (ok) { noticed++; if (corpus) byCorpus++; }
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${entry[0]}${ok ? '' : why}`);
    // Same reason as the probe loop's break: a SELF child is read for its exit
    // code alone, so once a grading has failed the remaining spawns are waste.
    if (nestedSelf && !ok) break;
  }
  // **Corpus-backed gradings are counted SEPARATELY**, because a bare "noticed"
  // hides how many entries no probe actually backs. A mutant that is not inert is
  // caught by the gate rather than by the probe the entry names — true, stronger
  // than a probe, and not what the entry claims.
  console.log(`\n${noticed}/${META.length} noticed` +
    (byCorpus ? ` — ${noticed - byCorpus} by the named probe, ${byCorpus} by the corpus.` : '.'));
  if (noticed !== META.length || metaControl.outcome !== 'caught') { rmSync(dir, { recursive: true, force: true }); return 1; }
  if (nestedSelf) { rmSync(dir, { recursive: true, force: true }); return 0; }

  // --- the SELF pass: does the probe LIST have a bound? ------------------------
  const selfSource = readFileSync(join(root, 'scripts', 'check-source-selftest.mjs'), 'utf8');
  /**
   * **The first application of a SELF entry, and the two vacuity verdicts — a function since W143** so
   * the guard case below reaches the SAME expression the loop does.
   */
  const selfVacuity = (mutate) => {
    const { out: broken, misses } = applyMutation(mutate, selfSource);
    if (broken === selfSource) return { why: ' — the mutation matched nothing' };
    if (misses > 0) return { why: ` — ${missWhy(misses)}` };
    return { broken };
  };
  // **Q434's case for THIS pass, in process** — a `SELF` child skips the `SELF` pass, so no `SELF` entry
  // can provoke it. `SELF[0]`'s real mutation followed by a dead second edit must be refused by
  // `selfVacuity` before anything is spawned.
  {
    const v = selfVacuity((t) => SELF[0][1](t).replace('\u0000W143: no such anchor', ''));
    if (!v.why?.includes('matched NOTHING')) {
      console.log('\n  FAIL  GUARD CASE a compound SELF entry whose second edit matches nothing — Q434 — ' +
        `wanted a refusal naming "matched NOTHING", got ${v.why ?? 'a mutation to run'}`);
      rmSync(dir, { recursive: true, force: true });
      return 1;
    }
    console.log('\n  ok    GUARD CASE a compound SELF entry whose second edit matches nothing — Q434');
  }
  let bounded = 0;
  console.log(`\nand against a shortened probe list — ${SELF.length} mutations of this file\n`);
  for (const [i, [name, mutate, reason]] of SELF.entries()) {
    const { broken, why: vacuous } = selfVacuity(mutate);
    if (vacuous) {
      console.log(`  FAIL  ${name}${vacuous}`);
      continue;
    }
    // **Named for this check, because `dev-dist/` is a SHARED namespace.** ADR 0039
    // runs the seven self-tests concurrently, and `check-policies-selftest.mjs` wrote
    // its `SELF` mutants to this exact path — two runs overwriting each other's
    // mutant, which is a grading about the wrong file and prints nothing to say so.
    // Found by reading rather than by a run; the three concurrent passes W39 measured
    // never happened to overlap on it, which is the whole reason it is worth fixing.
    // Inside `dir` since W105: a `.self-*` mutant is a copy of this SELFTEST module and the
    // dispatch passes it `ROOT`, so it is under no depth constraint.
    //
    // **`mkdirSync` beside it**, because a non-terminal `rmSync(dir)` on the probe path can have removed
    // the directory by now and a flat path could never notice — the defect the policies lane reported as
    // `ENOENT` on its SELF control.
    mkdirSync(dir, { recursive: true });
    const path = join(dir, `.self-source-${String(i).padStart(2, '0')}.mjs`);
    writeFileSync(path, broken);
    let ok = false, why = '';
    try {
      const r = spawnSync(process.execPath, [join(root, 'scripts', 'check-source.mjs'), '--self-test'],
        { cwd: root, encoding: 'utf8', timeout: 900_000,
          env: { ...process.env, CHECK_SOURCE_SELFTEST: path } });
      // **Non-zero AND the child's self-test actually ran.** `r.status !== 0` alone
      // let a `SELF` entry pass by making this file a syntax error — measured by
      // W28's adequacy reader at a cost of 0, with the bound it claims to test never
      // tested.
      const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
      ok = r.status !== 0 && SELF_RAN(out);
      if (r.status !== 0 && !ok) why = ' — the child never got as far as running: a broken file, not a fired floor';
      // **An entry that names its REASON is graded on it** — W143, as `check-policies-selftest.mjs` has
      // since W131: a guard case must go red BECAUSE its guard fired, not merely go red.
      else if (ok && reason !== undefined && !out.includes(reason)) {
        ok = false;
        why = ` — the child went red, but not for the reason this entry names ("${reason}"); it said: ${(out.split('\n').find((l) => /FAIL|ABORT|Error/.test(l)) ?? `exit ${r.status}, no FAIL line`).trim().slice(0, 200)}`;
      }
    } finally { rmSync(path, { force: true }); }
    if (ok) bounded++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}${ok ? '' : (why || ' — the floor did not fire')}`);
  }
  rmSync(dir, { recursive: true, force: true });
  console.log(`\n${bounded}/${SELF.length} bounded.`);
  return bounded === SELF.length ? 0 : 1;
}
