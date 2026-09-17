# W69 — A getting-started example a consumer can copy, executed by the gate and held equal in the README

**Status:** DONE — declared 2026-09-17 on `d04b075`, built and gated the same day; **both reader
passes RUN 2026-09-17** (10 / 2 blocking and 19 mutations / 11 undeclared survivors, overlap 1, the
forty-first measurement), their findings acted on, and **rule 8 re-run with their six exact edits
checked in as probes** — 30 probes, 0 undeclared survivors, 0 against declaration, the tree held
still by a content digest. *Read the Record's Gate table for what ran.*
**Plan:** none — a consumer-facing gap in the reference, belonging to no plan
([W36](w36-the-scheduler-pin-moves-to-0-5-1.md)'s and [W37](w37-the-scheduler-pin-moves-to-0-5-2.md)'s
precedent: an item outside a plan takes the next id rather than a reserved one, so P19 starts at W70
— ids are never renumbered, `doc/workflow.md` section 3). *(P19 starts at **W71**: W70 took the next
id the following day, which is this sentence's own rule applied a second time. The claim had an
expiry date and the item that expired it corrected it, here and in four index files.)*. Raised by the maintainer on 2026-09-17:
*"we don't have a clean simple example one could use as a getting started; the minimum example does
not need a custom resource group; maybe it should live in the README too."*

```
Spec:       none — this item writes no rule. What it asserts is what AGENTS.md
            already asserts: a `run` snippet executes and its assertions hold
            (check-docs X4), and a claim in two documents agrees both ways (X6's
            shape, W46).
Owns:       examples/getting-started/** (new), AGENTS.md §2 and §12 (the getting-
            started snippet, and the old §2 program moved under §12), README.md
            (a record-step file, but this item's whole subject is one section of it)
Inputs:     P18 decision 7 (what stays code: a worker), decision 10 (`start` returns
            a started Driver, `live-token` by default), W66's createRuntime signature
            and its §12 snippet (the shape this item reduces), the envelope worker's
            inner-worker contract in src/scheduler/envelope-worker.ts (a default-
            exported class with `run`; `setup`/`teardown` optional — read, not assumed),
            check-docs.mjs's X6/X7 (the two-documents-one-fact clause shape), and
            the maintainer's two answers of 2026-09-17: the README carries the SAME
            snippet held equal by a check, and today's §2 program moves under §12
Outputs:    (1) examples/getting-started/worker.ts — the ONE file a consumer writes as
                code: a default-exported plain class with `run(envelope)`, no import,
                no base class, ~10 lines
            (2) AGENTS.md §2 rewritten as the P18-shape minimum — one worker entry with
                a settingsSchema, one node type, NO group, a two-task flow whose nodes
                differ in `settings`, one `createRuntime` call, `start`, the fold to
                terminal, `shutdown`, and two assertions read from the FOLD (the
                outcome, and what the second worker returned) — a `run` snippet, so
                the gate executes it
            (3) today's §2 program (a Driver on a fake scheduler — the shape ladder L2
                uses) moved under §12 BYTE-IDENTICAL, so every self-test probe anchored
                on its text still matches exactly once
            (4) README.md gains "## Getting started" carrying the SAME snippet,
                byte-identical, and pointing at `triage` as the next step — because
                README.md ships in the npm tarball (`package.json` `files`) and is what
                a consumer reads on the registry page
            (5) check-docs X8: the README's getting-started block IS AGENTS.md §2's
                first `run` snippet, both ways — missing in either, or unequal, is a
                failure naming the first differing line; the README is read through a
                CHECK_DOCS_README override exactly as AGENTS.md is through
                CHECK_DOCS_DOC (obligation (e)'s second question, X6's own lesson);
                RUN_FLOOR 23 -> 24 (Q102's ratchet, the item that adds a snippet raises
                it); a probe per direction and a META entry
            (6) examples/README.md: one paragraph saying getting-started/ is NOT an L6
                row and naming what executes it
Depends on: nothing — P18 is merged
Blocks:     nothing
Tests:      the snippet's expected values come from the DOCUMENTS it declares — the
            flow's two settings and the run's payload compose to exactly one string —
            and from spec/run-state.md's outcome vocabulary, never from output. X8's
            expected value is byte equality. The probes: the AGENTS copy changed by one
            character and the README copy changed by one character are two probes, one
            per direction; the snippet re-tagged `check` must fail X4's floor; the
            worker module renamed out must fail X4 by name
Gate:       L0 (lint, typecheck — tsconfig.examples.json covers examples/**/*.ts, so
            the worker is typechecked and linted at L0); check:docs (X3/X4 execute the
            new snippet, X8 holds the two copies equal); check:docs:selftest;
            check:markdown (new links); L6 UNMOVED at 1610 / 53 in both runtimes
            (predicted: examples/getting-started/ is outside every L6 walk —
            examples/workers/'s on-disk listing, examples/flows/'s glob, and the
            corpus split's two directories); rule 8 over (a) the snippet's two
            assertions, (b) every Output row, (c) the assertions' provenance (the fold,
            not a literal), (d) RUN_FLOOR both ways, (e) the wiring (X8 with README
            repointed, the snippet re-tagged, the worker renamed out); the
            discriminating pair (the two settings made equal); then the two reader
            passes and rule 8's re-run
Reserves:   Q293 (used). *Q294-Q295 were reserved here too and are W70's: that item
            declared Q294-Q296 the next day and neither item spent any of the three.
            Two declarations claiming two ids is what section 3's block reservation
            exists to prevent, and nothing collided only because nothing was used.
            Found by this item's own conformity reader; the block stays W70's.*
```

## Scope

**In**

1. **The minimum a consumer can copy**, executed by the gate: one worker file, two documents as
   literals, one call. No group, no class type, no named pool, no transform, no predicate — every one
   of those is what `triage` is for, and README says so.
2. **The same snippet in the README, held equal by a check** — the maintainer's choice over a link
   and over executing README.md (a refactor of a check that names `AGENTS.md` in six places).
3. **The consumer reference's §2 says what it is**: today its title is *Minimal working program* and
   its body is the pre-P18 road — a fake scheduler built by hand and a `Driver` constructed by hand —
   which since P18 is the HARDER road. The title is a false claim in the file a consumer reads first.

**Out** — named, with where each goes

- **Executing README.md's snippets.** `check-docs.mjs` reads `DOCS[0]` and names `AGENTS.md` in its
  X3/X4/X6 messages; making it two-document is W46's *reads the file by NAME* finding as a refactor.
  Refused by the maintainer at this item's declaration; X8 is the narrower answer.
- **A getting-started with a custom group or a class type.** That is `examples/flows/triage.flow.json`
  and `examples/run-flow.ts`, P18's exit artifact; README points at it.
- **A completion promise on `Driver`.** There is none (measured: no such member on the class), so the
  fold-poll in the snippet IS the API. Whether it should be is [Q293](../open-questions.md).
- **README.md's stale "What is here" cells** (23 refusals / `FD-V25`, 979 cases, 50 / 1502, 91
  documents / 3822 links — four numbers stale by several plans). *This bullet was NARROWED at the
  record step and this text is what it said before: `README.md` is in this item's `Owns`, the fix was
  four edits, every value is one a check prints, and **no `Q294` was raised** — see the Record's own
  row. Kept as the declaration's record, and corrected here because it names an id this item did not
  spend and its reader read the two as a contradiction.*

## Exceptions

*Seeded from what the declaration measured, on P18's procedure.*

| path | why |
|---|---|
| `scripts/check-docs.mjs`, `scripts/check-docs-selftest.mjs` | predicted: `X8` with its README override, `RUN_FLOOR` 23 -> 24, a probe per direction and a META entry — and the self-test's **first `run` fence is now this item's snippet**, so every probe anchored *on the first ```ts run* (untagged, `typescript`-spelled, `TS`-spelled, indented, re-tagged `check`, deleted whole) now mutates the new snippet and must trip the same set; the three probes pinned to the OLD §2's literal text (`import { Driver, fold, liveToken,`, `driver.start({ name: 'world' });`, the POLICIES `if (false)`) keep matching once because the text MOVES rather than being copied |
| `examples/README.md` | predicted: one paragraph for a directory under `examples/` that is not an L6 row |
| `scripts/check-markdown.mjs` | predicted NOT to fire: this item adds one document under `doc/work-items/`, which the one-directory probe cuts; `M4`'s floor was retuned to 4450 at P18's retro against a two-directory fixture of 3966, and this item's links land in `README.md`, `AGENTS.md`, `examples/README.md` and this file — checked against the fixture before the record step |
| `tsconfig.docs.json` | predicted NOT to fire: the snippet carries its documents as LITERALS, as §12's does, so no JSON import and no `resolveJsonModule` |
| `spec/outcome-record.md` §4, `spec/run-state.md` §7 | predicted NOT to fire: the corpus split walks `spec/examples/valid/` and `examples/flows/`, and this item's flow is a literal in a snippet |

## The declaration step — what was measured before anything was built

*Section 1 rule 5: read from the tree, 2026-09-17 on `d04b075`, tree clean.*

| fact | measured |
|---|---|
| what `check-docs` executes | `const DOCS = [process.env.CHECK_DOCS_DOC \|\| 'AGENTS.md']` — one document; README.md is executed by nothing, which is P3's *rot is what the gate prevents* and the reason X8 exists |
| where a snippet runs from | staged to `dev-dist/docs/<name>.ts`, run with `cwd: ROOT` — so `../../examples/…` is the honest relative path, and §12's snippet already uses it with a comment saying what a consumer writes instead |
| the inner-worker contract | `src/scheduler/envelope-worker.ts`: the module's DEFAULT export must be a class (refused by name otherwise), constructed `new Inner(config, ctx)`, and held to `{ setup?, run, teardown? }` — a plain class with `run` is the whole contract, no `BaseWorker` needed |
| a completion promise | none on `Driver`; §12's fold-poll is the API |
| L0's reach | `tsconfig.examples.json` includes `examples/**/*.ts`; `deno lint src/ test/ examples/ index.ts` — a new directory under `examples/` is typechecked and linted |
| L6's reach | `l6.ts` lists `./workers/` on disk (a module outside it is invisible), the browser bundle globs `examples/flows/*.json`, the corpus split walks `spec/examples/valid` and `examples/flows` — `examples/getting-started/` is outside all three, so L6 is predicted UNMOVED |
| `README.md` is published | `package.json` `files: ["dist/**/*", "README.md"]` — the README is the registry page |
| §2's anchors | no document links to `#2-minimal-working-program`; the heading can change |
| the self-test's first-fence probes | six probes mutate the FIRST ```ts run by `String.replace`, three are pinned to §2's literal text — the table above |
| run snippets today | **23**, `RUN_FLOOR = 23` |

## Verification

| clause | command |
|---|---|
| L0 | `npm run lint`, `npm run typecheck`, read by `$?` |
| check:docs | `npm run check:docs` — X3/X4 on the new snippet, X8 both ways; `npm run check:docs:selftest` |
| check:markdown | `npm run check:markdown`; the `M3`/`M4` fixtures counted before the record step |
| L6 | `npm run test:l6`, `npm run test:l6:deno` — UNMOVED at 1610 / 53, read by `$?` |
| rule 8 | `dev-dist/w69/rule8.mjs` — a control, byte-asserted restores, per-edit anchors, a content digest, the Node-24 environment asserted (v0.19) |
| readers | conformity: the two documents and `FD-C5` first, the snippet's expected string re-derived on paper; adequacy: isolated copy, X8's both-ways and the snippet's two assertions mutated |

*Routing cases: not applicable — a two-task chain with no decision, no region and no join. Every
one of Q4, Q17, Q10, Q13 and Q6 is `triage`'s or the migrated corpus's.*

## Record

**Built and gated 2026-09-17 on `d04b075`. Both reader passes NOT RUN — the item is IN REVIEW, not
done, and the index lines say so.** Every rung RUN and redirected to `dev-dist/w69/`, verdict read
from `$?`; rule 8's harness (`dev-dist/w69/rule8.mjs`, W67's shape) carries a control, asserts every
restore byte for byte, checks each edit's anchor against the CURRENT text, undoes what an aborting
probe applied, holds the tree still by a content digest, **and asserts the Node-24 environment before
a rung runs — v0.19's clause, on its first item**. Every expected value came from the documents the
snippet declares: two settings and one payload compose to exactly one string, and the run's outcome
is `spec/run-state.md`'s vocabulary.

| Clause | Verdict | Notes |
|---|---|---|
| declaration | measured | Started on `d04b075`, tree clean; nine facts read from the tree before a line was written (the table above). The one that decided the SHAPE: `check-docs` executes ONE document, so a README example is P3's rot unless a check holds it. The one that sized the WORKER: the envelope worker's `InnerWorker` contract — a default-exported class with `run`, `setup`/`teardown` optional, no base class — read off `src/scheduler/envelope-worker.ts` rather than off the reference, which shows `extends BaseWorker` |
| L0 | **GREEN on the first run** | `lint` 0, `typecheck` 0 across all five sub-typechecks — the worker typechecked under `strict` through `tsconfig.examples.json`'s `examples/**/*.ts` |
| check:docs | **GREEN on the first run** | **30 snippets, 24 run** (from 29 / 23): the getting-started snippet EXECUTES and both its assertions hold; **`X8` compared **56** lines between `AGENTS.md` §2 and `README.md`, byte for byte, both ways**; `RUN_FLOOR` 23 -> 24. *(This row said **57** until this item's conformity reader re-took it, and `CLAUDE.md` and `doc/README.md` — written by the same record step — both said 56. The 57 is `split('\n').length` counting the empty element after the body's trailing newline. The reverse of the direction section 1 rule 5 warns about: the indexes were right and the item file was wrong.)* |
| check:docs:selftest | RUN 1: **15 / 25, exit 1 — the measurement**; RUN 2: **25 / 25 probes caught, 13 / 13 noticed, exit 0** | The first run is what rule 7 (c) asks for and the declaration could only estimate: every probe that mutates the FIRST ```ts run fence by `String.replace` — untagged, `typescript`-spelled, `TS`-spelled, indented, re-tagged `check`, deleted whole, assertions deleted, the sub-path import, *no snippets at all*, and the second untagged-block probe — now also trips `X8`, because that fence is the getting-started snippet and the README's copy did not move. **TEN, where the declaration said about eight**; the two it did not name are *a reference with no snippets at all* (no `run` fence under §2 IS an X8 finding) and the "prose" untagged block. Each declares `X8` now, with the reason beside it. The three new probes — one per DIRECTION plus the missing heading — were `ok` on the first run, and the thirteenth META entry (X8's inequality clause disabled) is noticed by the AGENTS-direction probe |
| check:markdown | GREEN | **125 documents, 5432 relative links, 272 anchored** before the Record; the fixtures re-counted on a scratch copy outside the repository after every edit — one directory removed **94** against `M3`'s 107, both removed **3984** against `M4`'s 4450 — *predicted NOT to fire* and did not, margins 13 files and 466 links |
| L6 | **GREEN and UNMOVED at 1610 / 53 in node AND deno**, the declared result | `examples/getting-started/` is outside every L6 walk, as the declaration measured: `l6.ts` lists `workers/` on disk, the browser bundle globs `flows/`, the corpus split walks `spec/examples/valid` and `examples/flows` |
| rule 8 | **24 probes: 1 control green, 16 caught, 4 declared ceilings each RUN against its rung, 3 measured, 0 undeclared survivors, 0 crashes, 0 against declaration** — after a first pass that read **1 undeclared survivor and 3 aborts** (`dev-dist/w69/rule8-run-1.log`, `rule8-run-2.log`), digest identical at start and end of both | **The survivor was VACUOUS and the misreading is the snippet's own trap**: `a2` set the end node's `outcome` to `failed` in both copies and the run's outcome did not move, because `spec/flow-definition.md` §3 says `end.outcome` is an AUTHOR-DEFINED label the driver does not interpret and the run-level vocabulary is run state's (Q25). W17's class, in the author's own set — and exactly what a consumer reading `outcome: 'completed'` beside `state.outcome === 'completed'` would assume, so the snippet now says so in a comment and `a2` is kept, declared, as the trap. **The three aborts were rule 7 (b) on the author's own anchors**: §2's and §12's snippets share their first two lines, so a two-line anchor matched twice (`b2`, `d2`), and the bare outcome assertion is in four snippets (`c2`); re-anchored on unique text and re-run. **`d2` was CAUGHT, and NOT for the reason this row first gave** — *corrected by [W70](w70-a-flow-that-decides-and-a-custom-group-on-the-runtime.md), same author, one day later*: it re-tagged the §2 fence to `check` with the floor lowered, and the failure lines read **`X2`** (*a `check` snippet containing `throw`*) with `X8` co-firing — so `X2` alone was sufficient and the probe never measured the Q102 shape, which is a fence DELETED WHOLE with the floor lowered, invisible to `X2`. W70 measured that shape properly: **deleted whole, the routing fence README carries is caught by `X8` ALONE, and the group fence README does not carry survives** — Q102 verbatim, for exactly the snippets `X8` does not hold. Rule 8's *a provocation is evidence only when it fires FOR THE REASON IT NAMES*, on this author's own probe, found by the next item's first pass being caught against its declaration for the same mistake; `d1`, the floor alone, stays the ceiling it always was. **`e2`** ran the SELF-TEST as its rung and it caught the clause disabled. Measured: **`a6`** — `inline: true` removed, the pool a real thread, green; **`c1c`** — the result assertion re-sourced to a literal AND the worker broken, GREEN, so the literal removed the only observer (`c1`'s reason, confirmed); **`c2`** — the outcome assertion re-sourced to a literal with the worker url broken, caught by the REJECT road and not by the assertion, which in a two-task linear flow has no terminal non-`completed` case to see |
| census | **231 / 177 / 2 / 52**, 231 of 231 in one cluster cell, 0 unexplained | P18's retro's parser unchanged; this item raises Q293 |
| own id | measured — **and it fired** | `W69` outside `doc/` and `dev-dist/`: 7 files, every hit this item's own annotation — **and the grep found P18's retro's own sentence, *the next plan starts at W69, Q293 and ADR 0056*, in FOUR files (`CLAUDE.md` twice, `doc/README.md`, `README.md`, the plan), falsified the day after it was written by the item that took both ids.** Section 1 rule 5's third direction, on the retro's closing sentence, found by the procedure that clause prescribes; corrected to **W70, Q294** with a note in each, the plan file as this item's one late exception |
| rule 8, RE-RUN with the readers' edits | **30 probes: 23 caught, 4 declared ceilings, 0 UNDECLARED survivors, 0 crashes, 0 against declaration, 3 measured, 6 aborts every one re-anchored and re-run** (`dev-dist/w71/rule8-w69.log`, `rule8-w69-reanchored.log`); digest `e75d752941f01b86` over 331 files identical at start and end of both passes | **Six of the readers' exact edits are checked in as probes `r1`-`r6`, and every one is CAUGHT BY `X8` ALONE** — a second fence in a listed section, a fence above the first heading, a ```typescript spelling, a heading that keeps its promise and loses its example, the section deleted together with its list entry in ONE diff, and a copy differing only in its LAST lines. **Every one of those six was green before this pass.** The six aborts are rule 7 (b) firing correctly and none is carelessness: three are the `RUN_FLOOR` literal, which W70 raised after these probes were written; two are anchors that became AMBIGUOUS the moment W70 added a second snippet with the same two-node shape, so a probe aimed at §2's flow began matching §12's and the harness refused to guess — re-anchored on the line carrying the node's TYPE, which is what tells the two flows apart, rather than re-pinned to a value that will move again; and one is `X8`'s equality clause, re-anchored twice now, by W70 and again by this rebuild |
| readers | **BOTH RAN 2026-09-17 — 10 / 2 blocking and 19 mutations / 11 undeclared survivors in 7 findings / 4 blocking, OVERLAP 1, the FORTY-FIRST measurement** (the ordinal is derived by counting section 6's own list, which held 40 entries ending at W67 — three consecutive P12 Records inherited a wrong one) | The split held exactly: the conformity reader found CLAIMS THAT WERE FALSE and the adequacy reader found BOUNDS THAT WERE NOT THERE. **The conformity reader's central obligation came back EMPTY** — it derived the envelope, both workers' returns, the edge's carriage and the outcome on paper from `FD-C5` and `spec/run-state.md`, then executed an extracted copy OUTSIDE the repository, and every value matched, including both construction refusals the prose promises. Its blocking two were the README's `check:markdown` cell (stale in all three numbers, and matching neither this Record nor this item's own gate log — so the number in the file was never measured anywhere) and a contradiction this item CREATED, the *What is here* table still saying fifty runs where two other cells now say fifty-three. The adequacy reader's four are `X8`'s, and they are in the row below. **The overlap is the one subject both reached** — that `X8` held membership where every sentence claimed a pairing, one by reading the clause and one by swapping README's two fence bodies for each other and watching it print `ok` beside the sentence the edit falsifies |
| `npm run gate` | **GATE EXIT=0, zero lines beginning FAIL at any indent, 29 chain entries, `selftests` 7/7 completed and 7 ok — on the FIRST run over the final tree** (`dev-dist/w69/gate.log`; L1-L5 41 / 1112 in node, deno and chromium, L6 1610 / 53, `check:docs` 30 / 24, `check:markdown` 125 / 5440 / 272) | digest **`8ba809e14bf89be1` over 329 files identical before and after** — this row is the ONE edit made after it, the precedent P17's and P18's retros set for the only claim a gate cannot be run before |
| `npm run gate`, CONFIRMING (after the readers) | **GATE EXIT=0, zero lines beginning FAIL at any indent, 29 chain entries, `selftests` 7/7 completed and 7 ok in 787.0 s wall over 5 lanes** (`dev-dist/w71/gate.log`): `check:docs` **32 / 26** with `X8` comparing 2 README snippets to the AGENTS.md snippets their sections NAME, `check:docs:selftest` **33 probes / 20 gradings, all caught and all noticed**, `check:markdown` **126 / 5457 / 272**, L1-L5 **41 / 1112**, L6 **1610 assertions over 53 real runs in BOTH runtimes**, `check:source:selftest` 44/44, `check:spec:selftest` 31/31, `check:wiring:selftest` 34/34 | digest **`43341066a6dd893d` over 331 files identical before and after**, the tree held still throughout — this row is the ONE edit made after it |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `examples/getting-started/worker.ts` — a default-exported plain class with `run`, no import | 18 lines with its comment, 5 without; typechecked under `strict` at L0, linted at L0, EXECUTED by the §2 snippet at `check:docs` | `b1` (renamed out), `a1` (its composition broken), `a4` (a function instead of a class — refused by the envelope worker by name), `e4` (its return type broken, at typecheck) |
| (2) `AGENTS.md` §2 rewritten as the P18-shape minimum, a `run` snippet | *"2. Getting started — a flow and its runtime from two documents"*: one worker entry with a `settingsSchema`, one type, no group, two tasks differing in `settings`, `createRuntime`, `start`, the fold to terminal, `shutdown`, two assertions read from the fold | `a3`, `a5`, `b2`, `p1`, and `X4` itself |
| (3) the old §2 program moved under §12 byte-identical | *"The driver with no scheduler at all — the shape ladder L2 uses"*, its three pinned probe anchors each still matching where they did (`import { Driver, fold, liveToken,` occurs twice, as at HEAD — §7 has the same line, so the *stops compiling* probe now hits §7's snippet and not the moved one; same declared set) | the self-test's `process.exit(0)` and `if (false)` probes, pinned to that text |
| (4) `README.md` "Getting started" with the SAME snippet | before "The idea"; the block is ```ts, not `run` — nothing executes it there, and the prose says what does; `triage` named as the next step | `b3` (heading gone), `b4` (one character) |
| (5) `check-docs` `X8`, `CHECK_DOCS_README`, `RUN_FLOOR` 24, three probes, one META entry | `scripts/check-docs.mjs`'s X8 block locates both blocks by HEADING; the self-test's `runOne` stages a README beside the reference when a probe carries `readme:` | `b4`, `b5`, `e1`, `e2` (the META entry, through the self-test), `d2` |
| (6) `examples/README.md` paragraph | first thing after the two commands | `b6` — a declared ceiling, prose no check reads |
| — | **`README.md`'s four stale "What is here" / "Running it" numbers re-taken** — 23 refusals / `FD-V25` -> **34 / `FD-V38`** with four absent, 979 -> **1112**, 50 / 1502 -> **53 / 1610**, 91 / 3822 / 197 -> **125 / 5432 / 272** — and *worker types* -> node TYPES, stale since W65 | `README.md` is in this item's `Owns`, so the Out bullet that promised a Q294 for them was NARROWED at the record step: the fix cost four edits and every number is one a check prints. Each cell keeps its history in a parenthetical, the page's own convention | nothing — `doc/`-class prose copied from what `check-spec`, the runner, `l6.ts` and `check-markdown` print |

**Exceptions — one LATE, zero undeclared.** `doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md`,
one sentence the own-id grep found this item had falsified (above). The seeded rows behaved as
declared: `scripts/check-docs.mjs` and its self-test fired (X8, the override, the floor, ten moved
sets — more than predicted, measured rather than guessed), `examples/README.md` fired, and
`scripts/check-markdown.mjs`, `tsconfig.docs.json` and the two spec split sentences did NOT.

**What broke.**

1. **Ten probe sets moved and the declaration said eight.** Every probe that mutates the FIRST ```ts run
   fence by `String.replace` now hits the getting-started snippet, and `X8` co-fires on each because
   the README's copy stands. Measured on the first self-test run, declared per probe on the second.
   *A prediction about which probes a change reaches is a claim about `String.replace`'s first match,
   and the declaration counted fences by eye.*
2. **The author's own probe was vacuous, and the reason is the snippet's own trap.** `a2` changed an
   `end` node's `outcome` and expected the run's outcome to follow; the spec says the label is the
   author's and the driver does not read it. W17's class, and a getting-started reader's first
   misreading — now a comment in both copies.
3. **Three aborts on the author's own anchors** — two on a two-line prefix that §2 and §12 share, one
   on an assertion four snippets carry. Rule 7 (b) firing correctly; re-anchored on text unique to §2.
4. **A probe anchor occurs twice and did at HEAD.** `import { Driver, fold, liveToken,` is the moved
   program's first line AND §7's; the self-test's *stops compiling* probe mutates the first occurrence,
   which was line 60 and is §7's snippet now. Same declared set, a different snippet under it.
   Recorded, not repaired.
5. **The scratch copy for the `M3`/`M4` count skipped the new directory** — `cp` without `-r` on an
   entry `git status --porcelain` lists as one line — and `&&` short-circuited so nothing was counted.
   An instrument, caught by an empty output.
6. **`X4`'s *asserts something* is the PRESENCE of a `throw`** (`/\bthrow\b/`), so an assertion
   re-sourced to a literal satisfies it: `c1`, a declared ceiling, with `c1c` measuring that the literal
   removed the only observer. True of every `run` snippet in `AGENTS.md` since W9; recorded here
   because this is the snippet a consumer copies.
7. **The declaration's Out bullet about README's numbers was narrowed at the record step** — the fix
   was four edits in a file this item owns — so the Q294 it promised was never raised. Said here rather
   than left silent.
8. **The own-id grep found the retro's closing sentence false in four files**, one day old. Corrected
   with a note each; the plan file is the late exception.

**What this taught.**

- **A getting-started snippet is the one place a co-firing check is the RIGHT design.** `X8` fires beside
  ten other probes' checks because any change to the executed copy is a divergence from the read
  copy — which is exactly the claim: the README's example cannot rot. The cost is ten declared sets,
  each of which says why. And what it buys beyond rot is the Q102 shape closed for the snippets the
  README carries — a second observer of their existence rather than a fourth list — **measured by
  W70's `d3`, not by this item's `d2`**, which re-tagged the fence and was caught by `X2` before `X8`
  had anything to say (the correction is in the Gate table above).
- **The worker contract is smaller than the reference showed.** §12 and P18's sample both extend
  `BaseWorker`; the envelope worker holds the inner worker to `{ setup?, run, teardown? }` on a plain
  class. The getting-started worker has no import at all, and that is what a consumer should see first.
- **Locate a compared block by HEADING, not by position** — a snippet added above either copy would
  otherwise silently repoint the comparison; `X6`'s *the document the check is pointed at, not a
  path*, one axis over.
- **An `end` node's `outcome` is the first thing a getting-started reader gets wrong**, and the author
  of the snippet got it wrong in his own probe set. Q25's answer, now one comment in the place it is
  first met.

## What the readers changed — `X8` is a PAIRING now, and every clause has its own probe

**Both adequacy readers, independently, and the conformity reader from the other end, found the same
thing: `X8` enforced far less than every sentence describing it claimed.** The clause was
`agBodies.includes(body)` — equality against ANY of the twenty-six executed snippets — while the line
the check prints on every run said *README.md's getting-started snippet IS AGENTS.md section 2's
first run snippet*. Measured by the reader: swap README's two fence bodies for each other and the
check prints `ok` beside that sentence. **A membership wearing a pairing's name.**

Six more holes, each measured at a full 26 / 26 probes and 13 / 13 gradings, exit 0:

| hole | what stayed green |
|---|---|
| only the FIRST fence in a section was located | a second `` ```ts `` fence under a listed heading, calling a member that does not exist |
| sections were cut AT headings | a fence ABOVE the first heading — the README's opening, the first screen a registry visitor reads |
| the comparison is exactly `` ```ts `` | a `` ```typescript `` fence, which is `X1`'s own refusal one document across, and `X1` reads `DOCS` and never the README |
| the two halves of *both ways* CO-FIRED under one id | either half deletable in silence, because grading is set equality over ids and the one probe that reached the second half also tripped the first |
| the missing-fence clause had no probe | a listed heading promising an example and carrying none |
| all four probes edit a comment in the snippet's FIRST lines | an equality blind to the last 400 characters — where BOTH assertions live, so the README could show an expected value the executed copy does not have |

**What replaced it.** `README_SNIPPETS` names the README heading AND the AGENTS.md heading whose
snippet it copies, and the AGENTS side must carry EXACTLY ONE `run` fence under that heading — a
pairing that picks silently when a second fence appears is the same defect one layer along. Every
fence in a section is located, the opening is a section, a listed heading must carry exactly one
fence, and a NEAR spelling anywhere in the README is a failure. `README_SNIPPET_FLOOR` sits beside
the list as [Q102](../open-questions.md)'s declared shape, because the list is a literal and a
section plus its entry are two edits in one diff — W69's adequacy reader measured exactly that diff
green at `check:docs` AND `check:markdown`, and the floor is the third edit it now needs.

**Eleven probes where there were four, and eight gradings where there was one**, each grading named
for the probe that trips THAT clause and no other — which is `X6`'s co-firing fix in the same file,
applied to the clause that needed it next. `MIN_PROBES` 26 -> 33, `MIN_META` 10 -> 20. Measured
after: **33 / 33 probes caught, 20 / 20 noticed, exit 0.**

**Questions raised.** [Q293](../open-questions.md) — a `Driver` has no completion promise, so *the run
is over* is eight lines a consumer copies from the README; sound by ADR 0014, and still the first
thing every consumer writes.
