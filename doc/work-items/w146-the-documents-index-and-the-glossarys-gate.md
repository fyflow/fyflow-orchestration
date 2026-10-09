# W146 — The documents: every stale claim Q542 lists in `doc/README.md` deleted or corrected, and Q508 closed by P31 decision 2 with the glossary's three *gate* rows carrying the distinction

**Status:** in progress — declared 2026-10-09 on `c9f0918`, the seventh and LAST item of P31
**Plan:** P31, `doc/plans/p31-which-open-questions-close-by-a-decision-taken-now.md`

*This file carries NO relative link, as W140-W145's files do* — Q142's M4 mechanism, which W144 derived
away, is no longer the reason; the convention is kept so a link here moves no probe tree. Ids and paths are
bare text.

```
Spec:       none changes. The rules are P27 decision 4 (a fact the tree COMPUTES is not written
            down) and decision 2 (nothing is archived; a cut thing keeps a one-line entry and its
            commit), P31's W146 index row and decisions 2-7, predictions 5 and 6, ADR 0077 and Q466
            (an item does not write its status into doc/README.md), ADR 0080 (the glossary points
            and never defines), and workflow section 1 rules 5 and 6
Owns:       doc/README.md; doc/glossary.md (P31's W146 row: touched only if its three gate rows do
            not already carry the distinction, or where a line states Q508 as undecided); this file
Inputs:     the tree at c9f0918 (W140, W142, W141, W145, W144 and W143 done); Q542's and Q508's own
            files, Q542's list including W134's conformity reader's additions; `npm run state`,
            `npm run adr`, `npm run check:markdown`, `npm run check:register`, check-docs' FENCE as
            the derivations a deletion points at; doc/scheduler-upstream.md (S10's status), each
            plan file's own Status line, AGENTS.md's fence tags
Outputs:    (1) the measurement, BEFORE any edit: for each claim Q542 lists, whether it is still
                present and still false on c9f0918, with the command or fact showing it; the three
                glossary gate rows as they stand; check:markdown's derived floors and measures
            (2) doc/README.md: each claim of (1) that is still false deleted (where the tree
                derives it, P27 decision 4, or where it is a status copy, ADR 0077 / Q466) or
                corrected (a fact no command derives); a claim that later work made true again is
                named and left. The Plan history is judged by P27 decisions 2 and 4
            (3) doc/glossary.md: the three gate rows checked against their targets; the commands
                row names gate:item (W139); the Not-rows line stating Q508 as open corrected to its
                decision
            (4) Q542 and Q508 resolved, each resolved-by starting "P31 W146 —"
            (5) P31's Record, with the exit artifact measured on the final tree: gate:full's EXIT,
                the resolved-by~P31 listing, the open count, each difference accounted by id
Depends on: W143 (P31 decision 5: serial on one tree, the documents last)
Blocks:     nothing — the last item of P31
Tests:      no behaviour changes, so the tests are the CHECKS that hold these files:
            check:markdown and check:markdown:selftest EXIT 0 with no derived floor crossed
            (prediction 5), check:register EXIT 0 on the resolved questions, and `npm run term --
            gate` reading three rows. Expected values come from Q542's list, P27 decision 4 and
            P31 decision 2, never from a run
Gate:       check:markdown and check:markdown:selftest EXIT 0 on the final tree; rule 8 over every
            output in dev-dist/w146-23759/; one conformity reader (P31 decision 6); `npm run
            gate:full` EXIT 0 ONCE, on a still tree — the plan's last item (decision 4, workflow
            v0.29)
Reserves:   Q571-Q573 (P31's block Q553-Q567 is wholly reserved by W140-W145 and Q568-Q570 by
            W143, every unused id skipped and never reissued); no ADR. No W beyond W146
```

**Exceptions**: none at declaration. Any file edited outside `Owns` and outside the record step is
asked first under workflow section 1 rule 6, and its YES written here before the edit. `CLAUDE.md`,
`doc/workflow.md` and `doc/concept.md` are not edited (prediction 6). **The drag files, checked up front:**

| file | why it should not move |
|---|---|
| `scripts/check-markdown-selftest.mjs` | its M1/M2 probes anchor on four texts in doc/README.md — `](workflow.md)` (first occurrence: the Reading-order row), `](open-questions.md)`, `](work-items/w37-the-scheduler-pin-moves-to-0-5-2.md)` (the scheduler-upstream status row) and `# Documentation index`. Every one is kept, so no probe matches nothing (Q482's class) |
| `scripts/check-markdown.mjs` | the floors are DERIVED from probe trees that contain doc/README.md (W144), so a deletion moves a floor with its measure (prediction 5) |
| `scripts/lookup.mjs` | reads the glossary's two tables by its Format contract; `## Not rows` is a list and nothing reads it. No table row changes shape |
| `scripts/check-lookup-selftest.mjs` | builds its own glossary fixture; reads none of doc/glossary.md |
| `scripts/check-budget.mjs` | doc/README.md and doc/glossary.md are outside the always-read set |
| `scripts/check-register.mjs` | holds q542.md and q508.md at the record step; `resolved-by` may name P31 and W146, both of which exist |

## Scope

**In**

1. **Measure first**, output (1), on `c9f0918`, logs under dev-dist/w146-23759/.
2. **Q542**, output (2): each still-false claim deleted or corrected in doc/README.md.
3. **Q508**, output (3): the glossary's three gate rows checked; the Not-rows line corrected.
4. Rule 8 over the checks that hold these files, in a harness under dev-dist/w146-23759/, and prediction 5
   re-tested on the final tree.
5. One conformity reader; then rule 8 re-run with its exact edits as probes.
6. `npm run gate:full`, once, on a still tree.
7. The record step, and P31's Record with the exit artifact. Grep for `W146`, `Q542`, `Q508` and every
   withdrawn sentence, excluding dev-dist/.

**Out**

- **Any claim outside doc/README.md and doc/glossary.md**, even the same claim in another file — asked
  under rule 6, never edited without a YES.
- **Renaming a sense of gate** — P31 decision 2 keeps all three.
- **Any change to a check or to what `gate:item` or `gate:full` runs** — P31 Out.
- **Q20 and Q513** — P31 Out.

## Verification

- **check:markdown and its self-test**: `npm run check:markdown` and `npm run check:markdown:selftest`, each
  RUN and redirected, EXIT read in the same command, before and after.
- **Rule 8**: break the edits and watch the checks that hold these files notice — a link this item keeps
  broken, an anchor removed, a resolved question with an empty `resolved-by`, a `resolved-by` naming an id
  that does not exist; a no-op control, a CRASH grader and a WRONG-REASON grader; anchors checked against
  the current text, aborting on more than one match; every edit asserted to change its input; the tree
  restored to its first snapshot byte for byte; a digest before and after. Prediction 5: ordinary linking
  documents added on the final tree leave `check:markdown:selftest` green.
- **Reader**: one conformity reader, fresh context, Q542, Q508, P27 decision 4 and P31 first, then the
  edits; it reports and does not fix, and the tree holds still while it reads.
- **Confirming gate**: `npm run gate:full > dev-dist/w146-23759/full.log 2>&1; echo "EXIT=$?"`, once, on the
  final tree.
- **Routing cases** (template): not applicable. This item changes two documents, not routing.

## Record

*Filled in when the item is done.*
