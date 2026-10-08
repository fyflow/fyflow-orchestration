# W144 — check-markdown's M3-M5 floors are derived from the probe trees, and examples/ is walked (Q142, then Q337)

**Status:** in progress — declared 2026-10-08 on `fb64b63`, the fifth item of P31
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

**Exceptions**: none declared. **The drag files, checked up front:**

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

*Not yet filled in.*
