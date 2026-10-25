# W220 — The key path reader exported and documented: `keyPathSteps` and `KeyPathStep` from the root entry, all five in `AGENTS.md`

**Status:** done 2026-10-25 — `npm run gate:item` on the final tree, one command, EXIT 0 (the Record); both readers RAN, every finding acted on or declared; no stop-and-ask, no exception used, no ADR, no question raised. Earlier: declared 2026-10-25 on `ab9a035`, P45's FIRST item: (c1); decision 1; fact 2; this file written from the plan's row BEFORE any other edit
**Plan:** [P45](../plans/p45-what-a-comparison-may-compare-against-and-who-may-read-a-key-path.md) — *what may a
comparison compare against, and who may read a key path the way a gate does?* — and this is its FIRST item: fyflow-app's
pass 6 #2, answered (c1) by the maintainer.

```
Spec:       spec/flow-definition.md v0.54, section 2's KEY PATH (the grammar and what each step names) and section 3's
            `when` PATH (FD-V43's two roots) — READ, not moved; ADR 0137 rules 1-3. No spec version moves (decision 1:
            exporting a reader the library already uses decides nothing a sentence in the docblock does not).
Owns:       from P45's W220 row, exactly: src/definition/validate.ts (the re-export line only); src/definition/condition.ts
            (the docblock only); test/driver/surface.test.ts; test/definition/** (a new suite — and
            test/definition/l4-corpus.test.ts's suite census, which every new suite title joins); AGENTS.md (the whole
            of it, D′); README.md (only if an export list moves); scripts/check-docs.mjs (RUN_FLOOR only); this file.
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2): the record step's four files (P45's plan
            file is not touched — its Record is W222's). index.ts is NOT edited (decision 1: the re-export sits where
            readKeyPath's does). Anything else found to need an edit is a STOP-AND-ASK.
Inputs:     P45 decision 1, fact 2, (c1); src/definition/condition.ts (keyPathSteps, KeyPathStep, readKeyPath);
            src/definition/validate.ts (KEY_PATH_RE, the re-export); src/definition/types.ts (PREDICATE_ROOTS);
            scripts/build.mjs (ENTRIES: the one index.ts, both platforms).
Outputs:    (1) validate.ts — `keyPathSteps` and `KeyPathStep` re-exported beside `readKeyPath`, so index.ts' `export *`
                over validate.ts carries them; evalLeaf and evaluateDeclared stay unexported.
            (2) condition.ts' docblock — what is public, through which re-export, and why; the "Not re-exported ...
                the package's exported names do not move" sentence (fact 2's premise) replaced.
            (3) a new L1 suite, test/definition/key-path-reader.test.ts: the root namespace (`import * from index.ts`)
                holding keyPathSteps, readKeyPath, KEY_PATH_RE and PREDICATE_ROOTS, each === the module's own; the
                CONTROL evalLeaf and evaluateDeclared ABSENT from it (each present in condition.ts, so the absence is
                of the root's choosing); KeyPathStep imported as a type from index.ts and used (L0); keyPathSteps and
                readKeyPath over hand-derived values from spec section 2's KEY PATH; its title in l4-corpus' census.
            (4) test/driver/surface.test.ts — nothing, unless the suite in (3) belongs there (decided at the edit,
                stated in the Record).
            (5) the built bundles measured: `npm run build`, then dist/node/index.js and dist/browser/index.js each
                exporting keyPathSteps and readKeyPath (an import of each bundle, the names listed), in the Record.
            (6) AGENTS.md — one subsection naming the five (readKeyPath, keyPathSteps, KeyPathStep, KEY_PATH_RE,
                PREDICATE_ROOTS), the grammar, the parse, the read, the roots (and the `if`'s `input`, which is not a
                public name); a `run` snippet: `files[0].name` read, its steps listed, a plain `xs.1` over an array
                undefined, a malformed path refused by KEY_PATH_RE; the :821 sentence re-read.
            (7) scripts/check-docs.mjs RUN_FLOOR 54 -> 55, with its one-line history comment.
Depends on: nothing — (a)-(f) answered
Blocks:     W221
Tests:      Outputs (3) and (6). L1 in node, deno and chromium (the new suite); L0 in the node, browser, deno, tests
            and examples typecheck lanes; check:docs executing the new `run` snippet. Expected values from spec
            section 2's KEY PATH and ADR 0137 rules 1-2, derived by hand below before the first run.
Gate:       `npm run gate:item` (not the plan's last item; no edit to scripts/check-register*.mjs, scripts/state.mjs or
            doc/questions/README.md); `npm run gate` on the B′ draft in a byte copy before the Owns are fixed, and
            check:docs:selftest there (a `run` snippet is added, B′); `npm run gate` before the readers (sentence C);
            the bundle measurement (5); then the conformity reader and the adequacy reader, workflow section 6, in
            worktrees under C:/tmp-w220, scaled to the item's size.
Reserves:   Q791-Q792, ADR 0141 (expected unused, decision 1)
```

## Scope

**In**

1. **The re-export** — Output (1), and the docblock, Output (2).
2. **The surface, held** — Output (3): every name by identity, its control by absence.
3. **Both builds, measured** — Output (5).
4. **The reference** — Output (6) and its floor, Output (7).

**Out** — named rather than left implicit, with where it goes instead

- **A validator function** (*is this a key path, under which roots*) — declined by the maintainer, (c2).
- **`evalLeaf` / `evaluateDeclared` / the `if`'s `GATE_CONDITION_ROOTS`** — stay unexported (decision 1; W154's *no new
  public name*).
- **`valueFrom`** — W221. **The L6 block and the reply** — W222.
- **`index.ts`** — not edited (decision 1).

## Hand-derived values (written before the first run)

From spec section 2's KEY PATH (the grammar `^SEG(\.SEG)*$`, `SEG` = `[A-Za-z0-9_-]{1,64}(\[(0|[1-9][0-9]{0,8})\])*`;
a KEY step an own key of a plain object; an INDEX step an own element of a real array; a plain numeric segment a KEY):

| input | `keyPathSteps` | over `{ files: [{ name: 'a.csv' }, { name: 'b.csv' }], xs: ['p', 'q'], m: [[0, 1, 2]], o: { '1': 'one' } }` | `KEY_PATH_RE` |
|---|---|---|---|
| `files[0].name` | `[{key:'files'},{index:0},{key:'name'}]` | `'a.csv'` | true |
| `files[1].name` | `[{key:'files'},{index:1},{key:'name'}]` | `'b.csv'` | true |
| `files[2].name` | `[{key:'files'},{index:2},{key:'name'}]` | `undefined` (past the end) | true |
| `xs[1]` | `[{key:'xs'},{index:1}]` | `'q'` | true |
| `xs.1` | `[{key:'xs'},{key:'1'}]` | `undefined` (a KEY step over an array) | true |
| `o.1` | `[{key:'o'},{key:'1'}]` | `'one'` | true |
| `o[1]` | `[{key:'o'},{index:1}]` | `undefined` (an index over a plain object) | true |
| `m[0][2]` | `[{key:'m'},{index:0},{index:2}]` | `2` | true |
| `files` | `[{key:'files'}]` | the array itself | true |
| `nope.x` | `[{key:'nope'},{key:'x'}]` | `undefined` | true |
| `[0].x` | `[{key:'[0]'},{key:'x'}]` (a segment the grammar does not spell is ONE literal key) | `undefined` | false |
| `xs[01]` | `[{key:'xs[01]'}]` | `undefined` | false |
| `files[*].name` | `[{key:'files[*]'},{key:'name'}]` | `undefined` | false |

`PREDICATE_ROOTS` is `['outcome', 'needs']` (section 3's `when` PATH, `FD-V43`); the `if`'s `input` is not in it.

## Predictions, written before the change

1. **P45 prediction 1**: no existing case moves in any runtime; the suite adds its cases (node 103 files / 2,295 cases
   before, so 104 files after); `RUN_FLOOR` 54 → 55; the built `dist/browser/index.js` exports `keyPathSteps` with no
   build-script edit.
2. `test/driver/surface.test.ts` needs no edit (the new suite carries the namespace claim, as `wiring.test.ts` carries
   W73's).

## Verification

`npm run gate` on the B′ draft in a byte copy (`C:/tmp-w220/m`) before the `Owns` are fixed, with
`check:docs:selftest` there; the bundles measured by importing each built `index.js`; `npm run gate` on the author's tree
before the readers; the two readers in their own worktrees under `C:/tmp-w220/`; then `npm run gate:item` once, on the
final tree, held still. **Routing coverage**: not applicable — the item exports a reader and moves no routing; no
`user_action` (Q17), map semantics (Q6), routed-away branch (Q4), unmatched decision (Q10) or task id (Q13) moves.

## Record

*Filled 2026-10-25, after both readers and the confirming gate. Logs in `C:/tmp-w220/` (`gate-m.log`,
`l6deno-m-rerun.log`, `docs-selftest-m.log`, `rule8.log`, `gateitem.log`); harnesses in the session scratchpad's `w220/`
(`bundles.mjs`, `rule8.mjs`); the readers' in `C:/tmp-w220/rc-scratch` and `C:/tmp-w220/ra-scratch`.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| B′ — the change built in the byte copy `C:/tmp-w220/m` (a worktree at `ab9a035`, the diff applied, `node_modules` COPIED, 0 links, 0 reparse points) and `npm run gate` run before the `Owns` were fixed | RAN — **EXIT 1**, then the one red lane re-run alone **EXIT 0** (`gate-m.log`, `l6deno-m-rerun.log`) | L1-L5 **104 files / 2,300 cases** in node 24.20.0, deno 2.9.6 and chromium (parity); every check EXIT 0; L6 node 2,883 / 0. **The one red was L6 deno, `cross-row` W94 (2h) / W97's ARRANGEMENT row, `failing: ["K=2"]`** — a timing row this item cannot reach (no `src/` logic moved); `npm run test:l6:deno` alone, same copy, **2,883 / 0, EXIT 0**. The `Owns` held as declared |
| `check:docs:selftest` in the copy (B′: a `run` snippet added) | RAN — **EXIT 0**, 24/24 noticed | |
| sentence C — `npm run gate` before the readers | the B′ run above, on content **byte-identical** to the author's tree (`cmp` over every changed file) | not re-run on the author's tree before the readers: the same bytes, and a second ~20 min ladder under the readers' load would have measured the machine |
| Output (5) — the built bundles | RAN — `npm run build` EXIT 0 (no build-script edit), then `bundles.mjs` importing each | `dist/node/index.js` and `dist/browser/index.js` each: `keyPathSteps` and `readKeyPath` functions, `KEY_PATH_RE` and `PREDICATE_ROOTS` objects, **`evalLeaf` and `evaluateDeclared` undefined**; `keyPathSteps('files[0].name')` = `[{"key":"files"},{"index":0},{"key":"name"}]` from both; each bundle's `export { … }` clause names both (a second observer). `dist/types/src/definition/validate.d.ts` carries the value and type re-exports. Re-measured independently by both readers |
| conformity reader (`C:/tmp-w220/rc`) | RAN | 0 BLOCKER, 1 SHOULD, 2 NIT, below; re-derived all 13 table rows and every snippet assertion from section 2 before reading them; ran `edgePath` and `validateDefinition` over 24 constructed paths — agreeing on all 24 |
| adequacy reader (`C:/tmp-w220/ra`) | RAN | 36 probes plus a no-op control (Z0, green) and a CRASH grader (Z1, an import failure): every implementation mutant KILLED; survivors D1, D2, D4b, D4c, D5, D7, D8b (the suite's own weakenings), B6 (equivalent) and E3 (by design); 2 SHOULD, 3 NIT, below; every file restored by digest |
| rule 8 on the fixes (`rule8.mjs`, in the copy synced to the final tree) | RAN — **EXIT 0** | P0 no-op control green; P1 (D4b), P2 (D5), P3 (D7), P4 (D8b) each RED for the reason it names (the new count, or the table's named rows); restored by digest |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command, 2026-10-25 13:58:40 → 14:31:25 (`gateitem.log`) | lint; typecheck (five lanes); every check; `check:docs` **61 snippets, 55 `run`**; L1-L5 **104 files / 2,301 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 2,301); L6 **2,883 / 0 failed** over 252 real runs in node and deno; selftests **10/10 ok** (1,478.5 s wall, 9 lanes), `check:register:selftest` left out by `--without`. Written after it: this Record and the Status line alone — `check:markdown`, `check:budget`, `check:register`, `check:spec`, `check:wiring` and `check:docs` re-run on it |

**L0 — which lanes OBSERVE the export (adequacy SHOULD 2, the row's L0 clause narrowed here).** The row says *reachable
from `index.ts` in the node, browser and deno typecheck lanes*. Those three lanes COMPILE `index.ts` carrying the
re-export, and nothing they compile USES either name — the adequacy reader's A1 (`keyPathSteps` dropped) and A2 (the type
re-export dropped) were EXIT 0 in all three. **The lanes that observe it are the tests lane (`tsconfig.json`: TS2339 /
TS2724), `check:docs` X3 (every snippet typechecked against `index.ts`) and X5 (the same under the DOM lib, the browser
consumer's view).** Deno has a VALUE observer (`npm run test:deno` runs the suite: A1 red) and no TYPE observer — `deno
run` does not typecheck. Stated, not widened: a deno typecheck of a test file is a `package.json` script edit, outside
`Owns`, for one type alias every other lane holds.

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the re-export in `validate.ts` | yes — `export { keyPathSteps, readKeyPath }` and `export type { KeyPathStep }` | A1 (node, deno, tests lane, X3-X5), A2 (tests lane, X3, X5) |
| (1) `evalLeaf` / `evaluateDeclared` NOT public | yes | A4-A7 — the whole module re-exported, at either site, or either name alone — each red on case 1's control |
| (2) `condition.ts`' docblock | yes — what is public, through which re-export, since when; *not re-exported* replaced | — (prose; both readers read it, conformity NIT 1 corrected it) |
| (3) the suite, `test/definition/key-path-reader.test.ts`, 5 cases | yes | A1, A3 (a wrapper: identity), B1-B4, B7, B8, C1b, C2; its census line (D3, D6) and, since the adequacy reader, its COUNT in `l4-corpus` (D4b, D4c, D5) and its table's named rows (D7, D8b) |
| (4) `test/driver/surface.test.ts` | **not edited** — the namespace claim sits in the new suite, as `wiring.test.ts` carries W73's (prediction 2) | — |
| (5) the bundles measured | yes, above | — (a measurement; nothing in the gate builds `dist/`, adequacy NIT 1) |
| (6) `AGENTS.md` section 4's subsection, its table and `run` snippet; the :821 sentence's pointer | yes | E1 (X2), E2 (X4's floor), E4-E7 (the snippet executes and each assertion can fail) |
| (7) `RUN_FLOOR` 55 | yes | E2 |
| ADR 0141 | **not written** — decision 1 needs none. SPENT, unissued | — |

**Predictions.** 1 **HOLDS**: no existing case moved in any runtime — 103 / 2,295 → 104 / 2,301, the six being the new
suite's five and `l4-corpus`' one count; `RUN_FLOOR` 54 → 55; both built bundles export `keyPathSteps` with no
build-script edit. 2 **HOLDS**: `surface.test.ts` untouched.

**The readers, and what was acted on.**

| reader | finding | acted on |
|---|---|---|
| conformity SHOULD 1 | `AGENTS.md`'s *"Nor the evaluator: a condition is evaluated by running it"* is false — `evaluateWhen` is public from the root (`routing.ts`) and evaluates a `when` over a `DecisionContext` synchronously | **FIXED** — the paragraph names `evalLeaf` and `evaluateDeclared` as the unexported ones and `evaluateWhen(when, ctx, predicates)` as public |
| conformity NIT 1 | the docblock's *`readKeyPath` (since W92)* through the re-export — it moved there at W154; and its *evaluated by running it* | **FIXED** — *public since W92, defined in `validate.ts` then; through this re-export since W154*; the evaluator sentence names `evaluateWhen` |
| conformity NIT 2 | the snippet's `edgePath`, *"the roots, as FD-V43 reads them"*, is exact today and becomes a necessary condition only if W221 takes (g1) | **LEFT FOR W221** — the maintainer answered (g1) and (h1) on 2026-10-25 (W221 records them in the plan; this item does not edit it); W221 owns `AGENTS.md` and re-reads this line |
| adequacy SHOULD 1 | the suite can be emptied for zero failures — D5 (early return), D4c (case 1 and its declared line: the identity claim's and the control's ONLY observer), D4b | **FIXED** — a count of five in `l4-corpus` (*W220's suite still REGISTERS the five cases it declares*), the census comment *counted below*; rule 8 P1, P2 red |
| adequacy D7, D8b | a table row dropped, or the table emptied, left every loop green | **FIXED** — the table's thirteen paths asserted by name and order; rule 8 P3, P4 red |
| adequacy D1, D2 | the identity assertion, or the control, made a tautology together with its mutant — survives | **DECLARED** — one observer each, by design: the claim IS the root's own surface, and the count above now stops the case being deleted |
| adequacy SHOULD 2 | the row's L0 clause is vacuous in the node, browser and deno lanes | **NARROWED**, above |
| adequacy NIT 1 | nothing in the gate builds and checks `dist/` | **DECLARED** — Output (5) is a measurement, as declared |
| adequacy NIT 2 | the table's *hole*, *class instance* and *999,999,999* are held by older suites (W216, W92), not this item's | **DECLARED** — this item adds a reader's surface, not a resolution; B5 and C1 are killed by W216's suite |
| adequacy NIT 3; conformity (checked) | *since 0.13.0* is a forward claim | **DECLARED** — P45 (e1)'s intended version; AGENTS.md said *since 0.12.0* eight times while `package.json` was 0.11.0 (the conformity reader's measurement) |
| adequacy B6, E3 | past-the-end test removed; snippet deleted AND floor lowered | **DECLARED** — B6 equivalent (an own-element test is already false past the end); E3 is the floor's own edit |

**Decisions taken by this item** (within decision 1): the new suite in `test/definition/`, not `surface.test.ts`; its
namespace read through `import * as lib from index.ts`, the control two names `condition.ts` exports; the `AGENTS.md`
subsection at the end of section 4 (the comparison's own section), the `if`'s `input` named as not public; no ADR.

**What broke.** At no rung. One sentence of the reference was false on the first green tree (*nor the evaluator*), found
by the conformity reader by running `evaluateWhen` from the root; and the new suite could be emptied at exit 0, found by
the adequacy reader by mutation.

**What this taught.** *For the retro*: **a census-only entry for a new suite repeats W85's and W108's finding** — every
suite that is a claim's ONLY observer needs its case count held outside it, and the census comment said *no case count
below* as though that were a choice. And **an L0 clause naming a lane is a claim about what that lane USES**, not what it
compiles: three of four named lanes could not see the export disappear.

**Questions raised.** None — Q791-Q792 SPENT, unissued. **Closed.** None. **ADR 0141** SPENT, unissued. **Declared
exceptions**: none used — `index.ts` and `surface.test.ts` not edited; P45's plan file not touched.

**The readers' overlap.** **ONE** — the forward claim *since 0.13.0* (conformity checked it and found precedent;
adequacy NIT 3): one subject, compatible findings. Distinct otherwise: the conformity reader's subjects were prose
(`evaluateWhen`, the docblock's history, `edgePath` under (g1)); the adequacy reader's the suite's own observers.

**Leftover worktrees.** `C:/tmp-w220/m` (the B′ copy, synced to the final tree for rule 8), `rc` and `ra` (git worktrees
at `ab9a035` with the pre-reader change applied; `node_modules` COPIED; scanned: 0 links, 0 reparse points), with
`C:/tmp-w220/rc-scratch` and `ra-scratch` — left for the maintainer; not removed with `--force`.
