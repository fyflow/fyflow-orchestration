# W134 — The repository's own files: `.gitignore` ignores `.claude/worktrees/` (Q235), `doc/README.md` loses every derived figure (Q484), and `AGENTS.md` states `OR-R6`'s pool dependence (Q534)

**Status:** in progress — declared 2026-10-07 on `b87fc4a`, the fourth and last item of P30
**Plan:** P30, `doc/plans/p30-which-open-questions-close-by-a-fix-already-named.md`

*This file carries NO relative link, deliberately*, as W133's, W131's and W132's do — Q142's
mechanism. A linking document here is one more in `check-markdown`'s second `removes` probe tree and
can cross `M4`'s floor. Ids and paths are bare text.

```
Spec:       none changes. spec/outcome-record.md OR-R6 v0.11 is the SOURCE of Q534's sentence and
            is not edited. The rules are P27 decision 4 (a fact the tree computes is not written
            down) and P30's W134 index row, decisions 3, 6, 7 and 8, predictions 3 and 5, and
            stop-and-asks (c) and (g)
Owns:       .gitignore; doc/README.md; AGENTS.md, ONE sentence only — the bullet "Returning a
            CLASS INSTANCE from a worker", its sentence beginning "The loud half is a result that
            cannot be cloned at all"; and this file (P30's index row)
Inputs:     the tree at `b87fc4a` (W133, W131 and W132 done); `npm run state`, `npm run
            check:spec`, `npm run check:budget` and `npm run check:scheduler` as the derivations
            decision 3 deletes against; spec/outcome-record.md OR-R6 v0.11; Q235's, Q484's and
            Q534's own files, and Q488 (Q484's duplicate)
Outputs:    (1) Scope 1's measurement, recorded BEFORE any edit: `git check-ignore
                .claude/worktrees/x`'s EXIT; `check:markdown` and `check:markdown:selftest` with
                their EXITs and the M3-M5 floors and current values; how many relative links
                doc/README.md carries and how many documents link; and the exact list of figures
                in doc/README.md that `npm run state` or a check derives, each with the command
                that derives it — and the figures it does NOT delete, each with why
            (2) .gitignore gains `.claude/worktrees/`, so `git check-ignore .claude/worktrees/x`
                exits 0 (Q235)
            (3) doc/README.md: every figure of (1)'s list deleted, the parentheticals recording
                that figure going stale deleted with it, and every cell or sentence left with
                nothing to say deleted too — a DELETION, never a re-take (decision 3, Q484)
            (4) AGENTS.md's sentence states the pool dependence as OR-R6 v0.11 does: on an inline
                pool the run stops with `UncloneableResult`; on a thread pool the scheduler's own
                clone refuses the value first, and a non-optional task ends `user_action`, an
                `optional` one `failed` (Q534). No snippet changes
            (5) Q235, Q484 and Q534 resolved, `resolved-by` starting "P30 W134 —"
            (6) P30's Record, with the exit artifact measured on the final tree
Depends on: W132 (P30 decision 7: serial on one tree)
Blocks:     nothing — the last item of P30
Tests:      no behaviour changes, so the tests are the CHECKS that hold these files: (2) by `git
            check-ignore` EXIT 0, and nothing tracked newly ignored (`git ls-files -ci
            --exclude-standard` empty); (3) by `check:markdown` and `check:markdown:selftest`
            EXIT 0 and no M3-M5 floor crossed (prediction 3); (4) by `check:docs` EXIT 0, which
            executes every AGENTS.md snippet, with the snippet count unchanged. Expected values
            come from decision 3, OR-R6 v0.11 and Q235's own sentence, never from a run
Gate:       `git check-ignore .claude/worktrees/x` EXIT 0; `check:markdown`,
            `check:markdown:selftest` and `check:docs` EXIT 0 on the final tree; rule 8 over every
            output in dev-dist/w134-64418/; one conformity reader (P30 decision 8); `npm run
            gate:full` EXIT 0 once, on a still tree, after the reader's fixes
Reserves:   Q542-Q546. No ADR (P30's block 0085-0086 is spent). No W beyond W134
```

**Exceptions**: none declared. **W133's drag files were checked up front and none applies**: no
suite is added, so `test/definition/l4-corpus.test.ts` does not move; no spec is bumped, so
`spec/README.md` does not move. **AGENTS.md drags nothing**: the edit is prose inside a bullet, so
`check:docs`' snippet list, its snippet count and every `run` snippet are unchanged; no check or
self-test anchors on that sentence (`grep "loud half"` over `scripts/` and `test/` returns none), and
README.md carries no twin of it for `X8` to compare. **doc/README.md drags nothing either**: the only
scripts that read it are `check-markdown` (its links) and `check-markdown-selftest`, whose probes
anchor on four texts there — `](workflow.md)`, `](open-questions.md)`, the W37 link and the
`# Documentation index` heading — none of which is a figure, so all four survive the deletion.
`.gitignore` is read by no check. Any file edited outside `Owns` and outside the record step is
declared here before its first edit, and anything outside `Owns` that a fix needs is P30
stop-and-ask (g), asked first. `CLAUDE.md`, `doc/workflow.md` and `doc/concept.md` are not edited
(prediction 5).

## Scope

**In**

1. **Measure first**, on `b87fc4a`, before any edit — output (1). The figure list is the subject
   of decision 3, so it is written down before the deletion, with the command deriving each figure.
2. **Q235.** One line in `.gitignore`.
3. **Q484.** The deletion of (1)'s list, then `check:markdown:selftest` re-measured. **If it goes
   RED, STOP: P30 stop-and-ask (c).**
4. **Q534.** The one sentence, then `check:docs`. If a snippet would have to change, STOP and ask.
5. **Rule 8 on every output**, in a harness under dev-dist/w134-64418/: the provocations are
   about the CHECKS that hold these files.
6. **One conformity reader**, fresh context, the tree still while it reads.
7. Grep for `W134`, `Q235`, `Q484`, `Q534` and every withdrawn sentence or number, excluding
   `dev-dist/`.

**Out**

- **A figure in doc/README.md that no command derives** — a dated measurement in the Plan history,
  a document's own version where no check reads it, a historical byte count of something deleted.
  Decision 3 deletes what `npm run state` or a check DERIVES; anything else is named in Scope 1's
  list with why it stays.
- **Re-taking any figure** (decision 3: a deletion, not a re-take), and **writing any figure into a
  sentence that says run this to find out** (P27 decision 4's limit).
- **A stale claim in doc/README.md that is not a figure** — a status word, a sentence about what
  checks the register. Not decision 3's subject; raised as a question if found, never fixed here.
- The other P30 questions, and the floors' retune (Q142, Q337).

## Verification

- **(2)**: `git check-ignore .claude/worktrees/x; echo "EXIT=$?"`, and `git ls-files -ci
  --exclude-standard` empty before and after.
- **(3)**: `npm run check:markdown > log 2>&1; echo "EXIT=$?"` and the same for
  `check:markdown:selftest`, each RUN and never piped; the floors read from `check-markdown.mjs`
  and the values from its report line.
- **(4)**: `npm run check:docs > log 2>&1; echo "EXIT=$?"`, its snippet count before and after.
- **Rule 8**: break each output's clause — the ignore line removed, narrowed, misspelled or negated;
  a deleted figure re-added (declared survivor: P27 decision 4's own position, as at W131); a
  `check-markdown` anchor in doc/README.md broken; the sentence reverted, or a snippet broken beside
  it — and watch the check go red for the reason it names, or name why it cannot.
- **Reader**: one conformity reader, P30 decision 3, OR-R6 v0.11 and P27 decision 4 first and the
  edits second; it reports and does not fix.
- **Confirming gate**: `npm run gate:full > dev-dist/w134-64418/full.log 2>&1; echo "EXIT=$?"`,
  once, on the final tree.
- **Routing cases** (template): not applicable. This item changes a document, an ignore file and
  one sentence of the consumer reference, not routing.

## Record

*Filled in when the item is done.*
