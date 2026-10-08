# W144 — check-markdown's M3-M5 floors are derived from the probe trees, and examples/ is walked (Q142, then Q337)

**Status:** in review — declared 2026-10-08 on `fb64b63`, the fifth item of P31; built, the reader and the fix round done, `gate:item` EXIT 0 on `8bbb662`; the record step waits on three asks (Questions, below)
**Plan:** P31, `doc/plans/p31-which-open-questions-close-by-a-decision-taken-now.md`

*This file carries NO relative link, deliberately* — Q142's own mechanism: on `fb64b63` ONE more linking
document outside doc/decisions, doc/plans and doc/questions turns `check:markdown:selftest` RED (measured
below). Ids and paths are bare text, as in W140-W145's files.

```
Spec:       none changes. P31 decision 2 fixes Q142's direction — check-markdown's M3-M5 floors are
            DERIVED from the probe trees, so adding ordinary documents can no longer close the window
            — and decision 3 Q337's: examples/ joins the walk, on top of the derived floors. ADR 0076
            (a vacuity floor counts what the churn it guards against cannot move) and ADR 0078 (a
            floor's window is a property of the probe SUITE) bind it; a derivation that contradicts
            either is a stop (ADR 0089 is free)
Owns:       scripts/check-markdown.mjs, scripts/check-markdown-selftest.mjs (P31's W144 row);
            examples/README.md ONLY where the walk finds a broken link; this file
Inputs:     the tree at fb64b63 (W140, W142, W141, W145 done); Q142 and Q337's files; ADR 0076,
            ADR 0078 and ADR 0080 consequence 4 (M5's 28 -> 72); the floors' own comment history in
            check-markdown.mjs; W123's and P29's M4 measurement (the precedent for how the window is
            shown)
Outputs:    (1) the measurement, BEFORE any edit: M3, M4 and M5's literals, what the whole tree and
                each probe tree measure against each, and how many ordinary documents close each
                window and from which side — shown on the self-test, not only by arithmetic; and how
                many relative links examples/README.md carries and how many are broken
            (2) the floors derived from the probe trees, in check-markdown.mjs, with no hand-tuned
                literal left in M3-M5. *Amended in place on 2026-10-08 by the maintainer's answer to
                P31 stop-and-ask (c), option (A) plus M9*: each floor is the largest measure among the
                probe trees that must fire it, plus 1, computed in memory from ONE exported
                probe-tree definition that the self-test's removes probes read; a definition emptied
                or misnamed is RED; and a new clause, M9 — the walk reads every markdown file a
                walked document links to — takes over noticing documents that leave the walk, landing
                with examples/ joining the walk (output 5)
            (3) check-markdown-selftest.mjs: the removes probes and the derivation read ONE definition
                of each probe tree; every new or moved clause provoked at birth (rule 7); META entries
                showing the derivation can fail — a floor derived to 0, or a derivation made vacuous,
                is RED. *Amended at the fix round*: "misnamed is RED" needed a clause of its own, M10 —
                every path a probe tree names is one the walk links into — because one misnamed path of
                two removes nothing and the probe built from the same name agrees with it; a META
                entry graded `corpus` now declares the ids the corpus must trip, so M10's only case
                asserts that M10 fired; and each tree probe's fixture counts are held to the
                in-memory tree the floor is derived from (rule 8's d6)
            (4) prediction 5, shown: N ordinary linking documents added to a COPY of the tree, and the
                check and the self-test's probe pass stay green, where on fb64b63 one document turns
                the probe pass RED
            (5) examples/ in the walk: the check reads examples/README.md (its document count moves by
                one), and a broken link there is RED — provoked by a checked-in probe
            (6) Q142 and Q337 resolved, each resolved-by starting "P31 W144 —"
Depends on: W145 (P31 decision 5: serial on one tree)
Blocks:     W143 (it shares check-markdown-selftest.mjs)
Tests:      (3) and (5) are the tests of (2) and (5). Expected values come from the probe trees'
            definitions and P31 decisions 2-3 — a probe tree that removes the floor's subject fires
            the floor, the whole tree does not, and a tree with N more ordinary documents keeps both
            verdicts — never read back from a run of the derivation
Gate:       `npm run check:markdown` and `npm run check:markdown:selftest` EXIT 0; `npm run gate`
            EXIT 0; rule 8 on every output in dev-dist/w144-16309/; one conformity reader (P31
            decision 6); `npm run gate:item` EXIT 0 once, on a still tree (decision 4)
Reserves:   Q565-Q567; ADR 0089 only if a stop-and-ask answer needs it. No W beyond W144
```

**Exceptions**: two, asked under workflow section 1 rule 6 and answered **YES by the maintainer on
2026-10-08**, written here before either edit: (1) doc/work-items/TEMPLATE.md, its italic note's one false
claim (the conformity reader's finding 10: *one of the FIVE … closes M6's gap*, false since before W144);
(2) scripts/check-spec-selftest.mjs:31, its stale line references to the C5 probes. Neither is on P31's
W144 row. **The drag files, checked up front:**

| file | why it should not move |
|---|---|
| `scripts/check-spec.mjs` | it imports `resolveLinks` for C5; the export keeps its signature and its result's fields |
| `scripts/check-spec-selftest.mjs` | it reads check-markdown-selftest.mjs for `check: 'C5'` and relocates check-spec's `from './check-markdown.mjs'`; both literals are kept |
| `scripts/check-wiring.mjs` | its G6 table reads the walk's skip line (`name === 'dev-dist'`) in check-markdown.mjs and two probe literals in the self-test; all three are kept byte for byte, and no new statement names the scratch directory |
| `scripts/check-docs.mjs` (X10), `scripts/check-scheduler.mjs` | they read examples/README.md's L6-count sentences and its pin sentence; an edit to that file for a broken link leaves those sentences alone |
| `doc/work-items/TEMPLATE.md` | its italic note says a real link there closes M6's gap in the second removes probe's tree; M6 and that probe tree are kept. *Corrected at the fix round (the conformity reader's finding 10)*: the note was ALREADY false on fb64b63 — that tree's gap was 15, not 0 — so it does not "stay true"; W144 does not make it falser |
| `package.json` | `check:markdown` and `check:markdown:selftest` are not renamed; nothing new is wired (P31 Out) |
| documents citing the literals 362, 120 or 72 | dated history stays; a sentence that is FALSE once the floors are derived is un-written at the record step only where it sits in a record-step file, and asked otherwise |

Any file edited outside `Owns` and outside the record step is asked first (workflow section 1 rule 6; P31
decision 7), and its YES is written here before the edit.

## Scope

**In**

1. **Measure first**, output (1), on `fb64b63`, in staged copies under dev-dist/w144-16309/.
2. **Q142**, outputs (2)-(4). If no derivation from the probe trees is stable — it still lets ordinary
   documents close the window, or it makes a floor vacuous — this is P31's stop-and-ask (c), and it goes up
   with the options before any edit to the floors. **It went up on 2026-10-08 and the maintainer answered
   (A) plus M9** (P31's stop-and-ask table).
3. **Q337**, output (5), on top of the derived floors.
4. Rule 8 on every output in a harness under dev-dist/w144-16309/.
5. Grep for `W144`, `Q142`, `Q337` and every withdrawn floor value and sentence, excluding dev-dist/.

**Out**

- **The self-tests' three guards** (Q434, Q437, Q536): W143's, which runs after this item on the same file.
- **Any change to what `gate:item` or `gate:full` runs** — P31 Out.
- **Widening the walk beyond examples/** (src/, test/, scripts/ carry no markdown the walk is for).

## Verification

- **The check and its self-test**: `npm run check:markdown` and `npm run check:markdown:selftest`, each
  RUN and redirected, EXIT read in the same command.
- **The window**: a staged copy with N ordinary linking documents added under doc/work-items, the check and
  the self-test's probe pass run there, before and after.
- **Rule 8**: break each output's clause — the derivation's subject, its arithmetic, the shared probe-tree
  definition, the walk's examples/ line — and watch the self-test go red for the reason it names; a no-op
  control, a CRASH grader and a WRONG-REASON grader.
- **Reader**: one conformity reader, fresh context, Q142, Q337 and ADRs 0076/0078 first, then the code; it
  reports and does not fix, and the tree holds still while it reads.
- **Confirming gate**: `npm run gate:item > dev-dist/w144-16309/item.log 2>&1; echo "EXIT=$?"`, once, on
  the final tree.
- **Routing cases** (template): not applicable. This item changes a documentation check, not routing.

## Record

*Filled in 2026-10-08 on `8bbb662`, held still from the confirming gate to this Record.* Scratch
`dev-dist/w144-16309/` (this item's shell pid): every log and script named below. Node v24.20.0 by
`fnm use 24` in every shell; every rung redirected and its EXIT read in the same command, never piped. Ids
and paths here are bare text, as the header says.

### Gate

| clause | verdict | notes |
|---|---|---|
| `npm run gate:item > dev-dist/w144-16309/item.log 2>&1; echo "EXIT=$?"` | **RAN, EXIT 0** | ONCE, on `8bbb662`, after the reader's fixes and rule 8's pass 4; `git status --short` empty before; 12:23 to 12:47 |
| — L0-L5 | RAN, 0 | **1580** cases in node 24.20.0, deno 2.9.6 and chromium (`all passed (parity with node: 1580)`): unchanged |
| — L6 | RAN, 0 | **164** real runs in node and deno: unchanged |
| — self-tests | RAN, 0 | 10/10 ok, 9 lanes, `check:register:selftest` left out (P31 decision 4), **1316.1 s wall**; `check:markdown:selftest` **1302.6 s** in that arrangement — now the longest lane |
| `npm run check:markdown:selftest` alone | RAN, EXIT 0 | 44/44 probes caught, **52/52 noticed** (30 by the named probe, 22 by the corpus), 7/7 bounded; **12 m 43 s** alone (`st3.log`) |
| conformity reader | RAN | 11 findings: 7 should-fix, 4 notes — below |
| adequacy reader | NOT RUN | P31 decision 6: one conformity reader for W144 |

L7 did not run. firefox and webkit did not run.

### The floors, before and after

| | before (`fb64b63`) | after (`8bbb662`) |
|---|---|---|
| `M3` | literal **362**, files | derived: **169** = the "decisions removed" tree's 168 files + 1 |
| `M4` | literal **120**, documents carrying a link | derived: **121** = the "decisions and plans removed" tree's 120 + 1 |
| `M5` | literal **72**, anchored links | derived: **71** = max(that tree's 56, the "upstream stripped of its anchors" tree's 70) + 1 |
| `M9` | — | **new**: the walk reads every markdown file a walked document links to |
| `M10` | — | **new**: every path a probe tree names is one the walk links into |
| the walk | doc/, spec/, three root documents — 620 files | **examples/ joins** — 621 |

**The derivation** (output 2): `PROBE_TREES` and `FLOORS` are exported from check-markdown.mjs; `deriveFloors`
builds each tree in memory — the removed paths left out of the walk AND made absent as link targets, the
strip applied to its one file — and each floor is the largest measure among the trees that must fire it,
plus 1. A floor with no tree, an undefined tree or an unknown measure is `Infinity` (RED on every tree).
The self-test imports `PROBE_TREES` from the SCRIPT UNDER TEST and builds its tree probes from it, and
holds each tree probe's fixture counts (`files / sources / anchored`) to the in-memory measure the check
prints. **No literal is left in M3-M5.**

### The window, before and after (output 4: prediction 5)

`window.mjs N`: a copy of the tree with N ordinary linking documents (each one relative link and one
anchored link) added under doc/work-items, then the check and the self-test's whole probe pass there.

| N | before (`fb64b63`) | after |
|---|---|---|
| 0 | check EXIT 0; probe pass 42/42 | — |
| **1** | check EXIT 0; probe pass **RED**: `wanted [M1,M3,M4,M5], got [M1,M3,M5]`, 38/42 | check EXIT 0; 44/44 |
| 2 | RED the same (M5's edge, 72 against 72, also crossed) | 44/44 |
| 25 | — | 44/44 |
| **200** | — (M3's own window was 196) | 44/44; floors 369 / 321 / 271 |

Before: M3's window `(166, 619]` (196 ordinary documents from below), **M4's `(119, 150]` (ONE)**, M5's
`(70, 78]` (two). After: no ordinary document moves a verdict, by construction.

**The trade-off, measured and decided** (P31 stop-and-ask (c), answered (A) plus M9): a floor no ordinary
document can close is also one no ordinary document LEAVING can fire. M3-M5 now fire only when the WHOLE of
a probe tree's subject has left — every file in doc/decisions and doc/questions (M3), every link-carrying
document in decisions, plans and questions (M4), every anchored link touching them or every one in
doc/scheduler-upstream.md (M5). **A partial loss inside a subject is no longer caught by M3-M5** (before:
258 of 619 files, 82 of 201 documents, 14 of 85 anchors). **M9 takes over noticing documents that leave the
walk**: the META entry *the walk skips doc/work-items and doc/plans* is graded `corpus` by M9 alone (rule 8
`m9d`: with M9 disabled that mutant is green on the corpus; before W144 the literal M4 caught it at 67
sources).

### Q337 (output 5)

examples/README.md carried **91** relative links on `fb64b63`, **none broken** (0 dead links, 0 dead anchors
with examples/ in the walk), so examples/README.md was NOT edited. M9's first run found it as the ONE markdown
file the walk linked to and did not read (two links from AGENTS.md). The probe *a dead link in
examples/README.md* is caught as `{M1}`; the META entry *examples/ dropped from the walk* is graded `corpus`
with `[M9]`. **Under the literals, adding examples/ was itself the one document that closed M4** (probe 2's
tree 119 → 120 against 120). Q337's title says *read by NO check*; check-docs' X10 and check-scheduler read
its L6-count and pin sentences — what no check read was its links.

### Outputs

| | output | where | what fails without it |
|---|---|---|---|
| (1) | the measurement, before | above; `m-base.json`, `m-ex.json`, `window-before-n*.log`, `closure.log` | — |
| (2) | the derived floors, no literal | check-markdown.mjs `PROBE_TREES`, `FLOORS`, `deriveFloors` | rule 8 d1-d5, d7, n3, r3; META *forced to 0*, *made VACUOUS*, *EMPTIED* (x2), *NOT DEFINED*, *MEASURE misnamed*, *strip NOT applied* |
| (3) | one definition read twice; M10; corpus ids declared; the fixture held to the in-memory tree | check-markdown-selftest.mjs `runOne`, `cleanRun`, `grade` | s1-s3, cmp1, cmp2, r2, r2g, f-m10, f-inf; META *counted ALIVE* (`measured`) |
| (4) | prediction 5 | `window-after-n*.log` | — |
| (5) | examples/ walked; M9 | check-markdown.mjs | m9a-m9c, x1; the M9 and examples probes |
| (6) | Q142, Q337 resolved | the record step | — |

### Exceptions, reconciled to `git status --short` to the path

`git diff --name-only fb64b63` at `8bbb662`: four paths. **Owns, 3**: scripts/check-markdown.mjs,
scripts/check-markdown-selftest.mjs and this file (examples/README.md, Owns only for a broken link, did not
move). **Record step, 1**: P31's plan (its stop-and-ask (c) row, written with the maintainer's answer).
**Exceptions, 0** so far. The drag files did not move: check-spec, check-wiring, check-docs, check-scheduler
EXIT 0 on the item's tree; check-spec's `resolveLinks(mdFiles, ROOT)` call is unchanged.

### Rule 8 — five passes, harness `rule8.mjs`

Each anchor must match ONCE in the CURRENT text and must change it, or the pass aborts and restores; every
touched file restored to its FIRST snapshot and compared back byte for byte; a digest over every tracked
and untracked-unignored file outside dev-dist/ before and after; node 24 asserted; a no-op control (`c0`,
`c0p`), a CRASH grader (`g-crash`) and a WRONG-REASON grader (`g-wrong`) every pass; each probe declares its
verdict and the substrings its failure lines must carry. Run types: `check`, `probes` (the self-test's
probe pass), `full` (the whole self-test) and `single` (one META child, as the parent spawns it).

```
pass 1        22 probes: 19 as declared, 3 against declaration   digest c338b58f7b1667f2 IDENTICAL  (6cee7a3)
pass 2         9 probes:  7 as declared, 2 against declaration   digest c338b58f7b1667f2 IDENTICAL  (6cee7a3)
pass 3         4 probes:  4 as declared                          digest c338b58f7b1667f2 IDENTICAL  (6cee7a3)
pass 4        30 probes: 30 as declared                          digest db52b927f135957b IDENTICAL  (8bbb662)
pass 4 full    7 probes:  6 as declared, 1 against declaration   digest db52b927f135957b IDENTICAL  (8bbb662)
pass 5         2 probes:  1 as declared, 1 against declaration   digest db52b927f135957b IDENTICAL  (8bbb662)
```

**Every probe against its declaration was the declaration's**, each re-declared from the line seen: d2 (the
smallest also drops M3 below probe 1, so probe 1 fails first), n1 (doc/decisions is linked to EXACTLY by a
directory link, so only questions and plans fire), d8 (with the no-tree guard AND its case broken the REAL
tree is green — the guard's job; `f-inf` is where the gate goes red for it), f-m9 (M9's removal is caught
by the probe pass before META; replaced by `m9d`). **Two came back RED where a survivor was declared**, both
for an incidental reason: r7 (the reader's widening of the second tree) is caught because the corpus-id
declaration on *the three ROOT documents dropped* saw M10 join M9; r7b (the reader's narrowing of the first
tree) because the META entries pinned to that definition line matched nothing (rule 7 (b)).

**One was the code's: `d6`** — links into a removed path counted ALIVE in memory was green at pass 1 (the
in-memory tree read 73 anchored where the fixture holds 56; the floor moved 71 → 74 and no verdict changed,
measured by a second route, `d6.mjs`). **Fixed at `9948771`**: the check prints each tree's in-memory measure,
the self-test holds each tree probe's fixture to it, and the META entry *counted ALIVE* is graded `measured`.
The reader's exact edits are pass 4's r2, r3, r3g, r4, r4g, s4 and r7, and pass 5's r7b.

**Declared survivors, by id**: **S1** (`d6`, at check level) — the absent-target clause moves no verdict on
the real tree; its observer is the self-test's comparison (cmp2). **S2** (`s4`) — the self-test reading the
definition from the ROOT script rather than the script under test is green: a derived floor fires on its
own tree whatever the definition says, so every mutation of the definition is non-inert on the corpus or
caught by construction (the reader's finding 6, stated in the code). **S3** (`m9d`, `r3g`, `r2g`, `cmp3`) —
each a guard removed together with its case, green by design: the observer named in its row is what goes red.
**S4** (the reader's finding 7) — the definition's CONTENT has no clause of its own; option (A) accepts it,
and r7 and r7b were caught only incidentally.

### The reader — fresh context, Q142, Q337, ADRs 0076 and 0078, P31 first; tree still at `9948771`

It re-derived the three trees and what each floor catches before reading the code, and agreed with the
code's own statement of the reach; the in-memory trees equal staged copies (168/151/78, 136/120/56,
621/202/70) and prediction 5 holds with 30 documents added to every copy.

1. **should-fix — ADR 0076 decisions 1-2 and ADR 0078 decision 1 now carry statements false of the code**
   (M3 362 and *not moved*; M5 *28*/72; *the only criterion for lowering a ratchet*), and M9/M10 have no
   ADR; the code's sentence that the suite's quiet probes still set the window overstated. **The comment is
   corrected** (`8bbb662`): quiet probes constrain nothing on the real tree. **The ADR note went up as a
   stop-and-ask** — see *Questions*.
2. **should-fix — M10 is outside the decision and has no `{M10}` probe; `corpus` read the exit alone.**
   **Fixed**: a META entry graded `corpus` may declare the ids the corpus must trip; the child prints
   `corpus-ids:`; *a probe tree path MISNAMED* declares `[M10]` (rule 8 r2, r2c, r2g). M10 is in the
   declaration's output (3), amended in place: it is what makes *misnamed is RED* true for one misnamed path.
3. **should-fix — a misnamed MEASURE made a floor `-Infinity` with the check green.** **Fixed**: an unknown
   measure is `Infinity`; META entry *a floor`s MEASURE misnamed* (`[M3]`); rule 8 r3 and r3g.
4. **should-fix — a META mutant that does not LOAD was graded a crash** (the import moved ahead of the
   inertness test). **Fixed**: in single-probe mode an import failure falls through to the inertness test,
   which grades `corpus` as before W144 (r4, r4g).
5. **should-fix — M9 regraded four existing META entries to `corpus`** (AGENTS.md dropped, spec/ dropped,
   the three root documents dropped, isMarkdownFile's .md test removed), and the new examples/ entry is
   `corpus` from birth. **Stated, and each now declares `[M9]`**; their named probes no longer decide them
   — the price of a relation that sees a walk shrink.
6. **should-fix — nothing tests that META children read the definition from the script under test.**
   **Measured (S2) and stated in the code**; no entry can observe it.
7. **note — the definition's content is unguarded** (S4); Q460's ENOENT reach widens by examples/.
   **Not acted on**: option (A) and Q460 (iceboxed).
8. **note — the in-memory trees equal the real ones; prediction 5 holds.** Confirms.
9. **should-fix — written figures a check derives** (the verified triples, M6's *gap is 5*) and the report
   rows' wording. **Fixed**: the figures left for the report; M6's comment marked as W112's history; rows
   reworded to what a derived floor checks.
10. **note — drag files**: unchanged and green. **Two pre-existing false claims outside Owns**:
    doc/work-items/TEMPLATE.md's italic note (*one of the FIVE … closes M6's gap*: that tree's gap was 15 on
    fb64b63) and check-spec-selftest.mjs:31's line references. The declaration's drag row said the note
    *stays true*; corrected in place. **Asked under rule 6** — see *Questions*.
11. **note — Q487 waits on Q142's decision.** **Asked** — see *Questions*.

### What broke

1. **The self-test imported the script under test by its own URL while that script was the entry module
   inside its top-level await** — Node: *unsettled top-level await*, exit 13, in 1 s. A query on the URL
   gives a fresh, non-entry instance.
2. **The in-memory tree could differ from the real one with every verdict unchanged** (d6), because a
   derived floor fires on its own tree by construction — so the comparison had to be added as its own
   observer.
3. **Four of 39 rule-8 declarations were wrong at first**, each re-declared from the line actually seen.

### What this taught

- **A floor stable under ordinary additions has no reach over ordinary losses** — the same fact read twice;
  reach over a walk that shrinks has to be a RELATION (M9), not a count.
- **A derived floor makes its probes pass by construction**, so the probe trees no longer test the floor's
  VALUE — what tests the derivation is the comparison of the in-memory tree with the real one, and the
  META entries on the derivation.
- **Nothing in the spec or doc/workflow.md changes.**

### Questions closed and raised (section 1 rule 6)

- **To close at the record step: Q142 and Q337**, each `resolved-by` starting "P31 W144 —".
- **Raised: none.** Q565-Q567 unused so far.
- **Asked, and waiting** (2026-10-08), before the record step:
  1. **The ADR note** (the reader's finding 1; the maintainer's instruction: an ADR note is a stop) —
     (a) dated correction notes in ADR 0076 decisions 1-2 and ADR 0078 decision 1, no new ADR, as W141
     corrected ADR 0051 and ADR 0075 at its record step; or (b) ADR 0089, amending both and recording the
     derivation, M9 and M10, which reverses prediction 2 for W144.
  2. **Rule 6, to widen Owns by two pre-existing false claims**: doc/work-items/TEMPLATE.md's italic note,
     and scripts/check-spec-selftest.mjs:31's line references.
  3. **Q487** (deferred, *waits on Q142's decision*): the comments it names are gone and the derived floors
     are printed, so it is closeable — but P31's exit artifact lists exactly twelve questions.
