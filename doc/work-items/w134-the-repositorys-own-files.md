# W134 — The repository's own files: `.gitignore` ignores `.claude/worktrees/` (Q235), `doc/README.md` loses every derived figure (Q484), and `AGENTS.md` states `OR-R6`'s pool dependence (Q534)

**Status:** done — declared 2026-10-07 on `b87fc4a`, the fourth and last item of P30; built, the reader and the fix round done 2026-10-07
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

**Exceptions**: one, declared LATE (the conformity reader's finding 6), after its edit in `921aa60`:
P30's **Stop-and-asks table**, row (h) — outside the plan's Record, which is the record step's file.
The maintainer's answer of 2026-10-07 directed the row there, as W131's record commit did for row (b).
**W133's drag files were checked up front and none applies**: no
suite is added, so `test/definition/l4-corpus.test.ts` does not move; no spec is bumped, so
`spec/README.md` does not move. **AGENTS.md drags nothing**: the edit is prose inside a bullet, so
`check:docs`' snippet list, its snippet count and every `run` snippet are unchanged; no check or
self-test anchors on that sentence (`grep "loud half"` over `scripts/` and `test/` returns one
hit, `test/jsonata/jsonata.test.ts:171`, an unrelated phrase — *corrected by the conformity reader's
finding 5; this said "returns none"*), and
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

*Filled in 2026-10-07 on `2b48046`, held still from the confirming gate to this Record.* Scratch
`dev-dist/w134-64418/` (the declaring shell's pid): every log and script named below. Node v24.20.0
by `fnm use 24` in every shell, Deno 2.9.6; every rung redirected, its EXIT read in the same command,
never piped. Ids here are bare text, as the header says.

### Gate

| command | EXIT | reading |
|---|---|---|
| `git check-ignore .claude/worktrees/x` | **1 before, 0 after** | `ci-before.log`; the rule-8 rung `ci-rung.mjs` on every pass |
| `npm run check:markdown` | 0 before, 0 after | `md-before.log`, `md-after.log`, `md-fix.log` |
| `npm run check:markdown:selftest` | 0 before, 0 after | 42/42 probes caught, 7/7 bounded, both times (`mdself-before.log`, `mdself-after.log`, the latter on the tree with every deletion made) |
| `npm run check:docs` | 0 before, 0 after | 40 snippets (34 run, 6 check) before and after: **no snippet changed** (`docs-before.log`, `docs-fix.log`) |
| `npm run gate:full > dev-dist/w134-64418/full.log 2>&1; echo "EXIT=$?"` | **0** | run ONCE, on `2b48046`, after the reader's fixes and rule 8's pass 2; 0 `FAIL` lines; `git status --short` empty before and after (`tree-before-full.txt`, `full.exit`); 11:30 to 12:12 |
| — L1-L5 | 0 | 1528 cases in node 24.20.0, deno 2.9.6 and chromium (parity 1528): unchanged |
| — L6 | 0 | 2465 assertions over 162 real runs, node and deno: unchanged |
| — self-tests | 0 | 11/11 lanes ok |

L7 did not run. **After the record step** (four doc files a check reads): see the end of this Record.

### Scope 1 — the measurement, before any edit, on `cc287bc`

**The floors** (`scripts/check-markdown.mjs`): `M3` `r.files < 362`, `M4` `r.sources < 120`, `M5`
`r.anchored < 72`.

| | files (M3) | relative links | linking documents (M4) | anchored (M5) | doc/README.md: relative links / anchored / bytes |
|---|---|---|---|---|---|
| before, `cc287bc` | 610 | 5325 | 199 | 84 | 157 / 0 / 51,495 |
| after, `2b48046` | 612 | 5324 | 199 | 84 | 155 / 0 / 45,499 |

**Prediction 3 held**: no floor moved. The two links that went are both `[Q484](questions/q484.md)`, inside
deleted text. The two files added are this file and Q542. Probe r6 measured the margin: doc/README.md with
EVERY relative link stripped leaves `check:markdown` green, one linking document of 199 against a floor of
120.

**The figures `npm run state` or a check derives, deleted by name** (decision 3):

| figure in doc/README.md | where | derived by |
|---|---|---|
| register counts: 179 / 129 / 2 / 48, 140 / 97 / 2 / 41, 34 / 13, 230 / 176 / 2 / 52, 369 | Reading order `questions/`; Document status `questions/`; intro | `npm run state` (register questions, live / resolved, open / deferred) |
| ADR counts: 29, 46, 21, 19, twenty-two, 18, 10 | Document status `decisions/`; intro | `npm run state` (decisions) |
| spec documents, examples, rules, refusals: six / seven documents, 44 / 89, 33 / 80, 55 / 106 / 34, 40 / 87, 29 / 71, 7 / 72 / 132 | Reading order `spec/README.md`; Document status `spec/`; intro | `npm run check:spec` (its header line, and `C4`'s note for refusals) |
| six spec-document versions (`flow-definition` v0.19 and the rest, and the older ones in parentheticals) | Document status `spec/` | `npm run check:spec` `C8`, which reads each document's own `**Status:**` |
| "35 KB budget" (stale: the target is 36 KiB) | Reading order `workflow.md` | `npm run check:budget` (`B7`, its targets) |
| scheduler pin 0.5.2 | Sibling repositories, our row | `npm run state` (scheduler pin), held by `check:scheduler` `D3` |
| **class G**: v0.26 / TWENTY-SIX times, v0.19 / EIGHTEEN times, and v0.17 / SIXTEEN, v0.15 / FOURTEEN, v0.13 / TWELVE, v0.12 / eleven, v0.10 / nine, v0.8 / six in parentheticals | Reading order and Document status `workflow.md`; intro | **no command**: its one source is `doc/workflow.md`'s own header. Deleted by the maintainer's answer to P30 stop-and-ask (h), which this item raised |

With them went every parenthetical recording one of them going stale, and the intro paragraph *"Four
counts in the two sections below are STALE …"*. Cells left with nothing to say: `decisions/` reads *all
accepted*; `spec/` and `workflow.md` read *live*, the word their neighbours use; our pin cell reads
`package.json`, and the sibling row's *needs the same bump* went with the figure it referred to (the
reader's finding 1).

**Kept, because no command derives them and (h) did not name them** (class H): `concept.md`'s **v0.3** (a
copy of that document's own header, and current), `S1-S9` and *9 items* (stale: S10 exists), and every
dated historical figure — 489,966 bytes and 89 blocks, 22,898 bytes, P1's 279 / 72, P3's 16%, every Plan
history row, and P26's *next plan starts at W112, Q459* sentence, which `npm run state`'s ledger reads.
Q542 carries the class and the stale claims that are not figures.

### Outputs

| | output | where | status |
|---|---|---|---|
| (1) | the measurement | above | built |
| (2) | `.claude/worktrees/` ignored | `.gitignore` | built |
| (3) | the deletion | `doc/README.md` | built |
| (4) | the sentence | `AGENTS.md`, one sentence; widened by the reader's finding 2 | built |
| (5) | Q235, Q484, Q534 resolved | `doc/questions/` | the record step |
| (6) | P30's Record and the exit artifact | the plan | the record step |

**The sentence, before**: *The loud half is a result that cannot be cloned at all (a function, a
`Promise`, a `WeakMap`), which stops the run with `UncloneableResult`; this is the quiet half, and it is
the one people hit.* **After**: *… which on an **inline** pool stops the run with `UncloneableResult`,
and on a **thread** pool is refused first by the scheduler's own clone, so the value never reaches the
driver, `UncloneableResult` never fires and `onRunFailure` is not called — the task ends as any failure
does: a non-optional task out of retries ends `user_action` and parks the run `awaiting_action`, and an
`optional` one ends `failed` and routes as a failure (`OR-R6`; the node type's `inline` decides which
pool); the class instance is the quiet half, and it is the one people hit.*

### Exceptions, reconciled to `git status --short` to the path

`git diff --name-only cc287bc~1 HEAD` plus the record step. **Owns, 4**: `.gitignore`, `doc/README.md`,
`AGENTS.md` (one hunk, inside the sentence — asserted by rung `out`'s `out-owns`), this file.
**Exception, 1, late**: P30's Stop-and-asks table, row (h), in `921aa60` (declared above). **Record step**:
P30's plan (its Record, its Status line, stop-and-ask (c)'s answer cell, and a Q542 row in its
*Open questions this plan carries*, as W132 added Q541's), `doc/questions/q542.md`
(raised), `q235.md`, `q484.md`, `q534.md` (resolved). `README.md` was read and not edited: nothing in it
moved. `doc/decisions/**` was not touched — no ADR (prediction 4). `CLAUDE.md`, `doc/workflow.md` and
`doc/concept.md` not edited (prediction 5).

### Rule 8 — two passes, the second on the tree that shipped

Harness `rule8.mjs` and its rungs: `ci` (`ci-rung.mjs`: Q235's clause read through `git check-ignore`,
plus over-ignore and tracked-file guards), `out` (`outputs.mjs`: the Outputs rows as assertions — deleted
figures absent, kept text present, the sentence's clauses, the edit inside Owns), `md`
(`check-markdown.mjs`), `mdp` and `mdp2` (`check-markdown`'s self-test in single-probe mode on the two
probes anchored in doc/README.md that a deletion could reach), `docs` (`check-docs.mjs`). An anchor must
match its declared count in the CURRENT text and change it; each file restored to its first snapshot and
compared back byte for byte; a digest of every tracked and untracked unignored file outside dev-dist/
before and after; node 24 asserted; no-op controls on every rung (`c-clean`, `c-docs`), a CRASH grader
(`g-crash`) and a WRONG-REASON grader (`g-wrong`), each graded every pass on the rung's FAIL-line ids
(full set) and a `why` substring that the failing line carries.

```
pass 1    23 probes, 36 gradings: 33 as declared, 3 against declaration   digest 5da52b701f199830 IDENTICAL
pass 1b    4 probes,  7 gradings:  7 as declared                          digest 5da52b701f199830 IDENTICAL
pass 2    28 probes, 44 gradings: 44 as declared, 0 against declaration   digest 76b3e4ab357c45cd IDENTICAL
```

**Pass 1's three were all the GRADER's, and each was re-declared after reading its output — said so, as
W132's finding 8 asks.** g1's `out`: `out-owns` sees lines LOST from the base, and the ignore line is new
since it, so the rung is green by construction (`ci` is its observer). r2's `mdp2`: the edit broke the link
itself, so the self-test's single-probe mode refused a non-inert fixture (`outcome: corpus`) with no FAIL
line; replaced by r2b, which keeps the link resolving and moves only the probe's anchor text — CAUGHT. a5's
`why`: threading the AGENTS.md snippet's `Uncloneable` type fails `X4` not with *the loud half reported*
but with *unsettled top-level await* at `const stoppedRun = await run(loud)` — **the run never ends, which
is OR-R6 v0.11's `awaiting_action` measured through the reference's own snippet**, so the sentence's thread
half is now observed by `check:docs` under that probe. Pass 2 adds the reader's exact edits as probes
(f1, f1b, f2, f2b) and re-anchors a2 and a3 on the rewritten sentence.

**Declared survivors, by id**: **S1** (r1, r1b, f1 on `md`) — a deleted figure re-added is green in
`check:markdown`; no check holds a figure in doc/README.md, which is P27 decision 4's own position (one copy,
no checker), as W131's S2. **S2** (r6) — doc/README.md stripped of every relative link is green: one
document cannot reach `M4`'s floor. **S3** (a1, f2 on `docs`) — the sentence reverted or narrowed is green
in `check:docs`, which executes snippets and reads no prose. Each of S1-S3 is red in rung `out`, which is
this item's assertion and not a check in the gate.

### The reader — fresh context, plan and rules first, tree still

**Conformity** (8 findings: 4 should-fix, 4 notes; no blocking):
(1) *needs the same bump* dangled once the pin went, and `—` read as *pins nothing*; **fixed** — the clause
deleted with its referent, our cell `package.json` (f1, f1b CAUGHT). (2) the sentence omitted what OR-R6
v0.11 says a consumer needs on a thread pool — `onRunFailure` not called (AGENTS.md tells a reader to rely
on it), `awaiting_action`, the optional case routing as a failure, `inline` deciding — and *never reaches
the driver* was loose; **fixed**, the sentence rewritten (f2, f2b CAUGHT). (3) Q542 omitted *None
superseded.*, *nothing is left to raise*, *Every snippet is executed by the gate*, P17 and P19-P21 dated `—`
and P20's link to a directory; **added to Q542**, not fixed (the maintainer's answer). (4) the `workflow.md`
status row is now a v0.3-v0.12 changelog under *live* with nothing saying it is partial; **added to Q542**
— the summaries are history, not header copies, and (h) did not name them. (5) the declaration's `grep
"loud half"` claim was false (one unrelated hit); **corrected** in place. (6) row (h) in P30's Stop-and-asks
table is outside the plan's Record; **declared** as a late exception. (7) stop-and-ask (c) still read open,
and output (1) was not yet in the tree; **both done** in this Record and P30's. (8) the added text is clean;
no action.

Prediction 6 held: the reader's finding 2 was a consumer-facing omission the author's own provocations could
not see, because they were written from the sentence rather than from OR-R6.

### What broke

1. **The first form of the sentence was true and incomplete** — finding 2. It was written from Q534's
   `closes-when`, which names two outcomes, rather than from OR-R6 v0.11, which names five consequences.
2. **A deletion left a referent dangling** (finding 1): *the same bump* pointed at the figure deleted one
   row up.
3. **The grader's declarations were wrong three times in pass 1**, and each probe was right.
4. **An intro-paragraph cut matched its own quoted heading**: the paragraph contains `` `## Reading order` ``
   as text, so the first `edit-g.mjs` ended the cut there; seen in the diff, restored, re-anchored on the
   heading's line, before anything was committed.

### What this taught

- **A consumer sentence is written from the rule, not from the question that asked for it.** The question's
  `closes-when` is a floor, and the reader found what lay between it and the rule.
- **P30's own count is wrong by one**, found measuring the exit artifact: decision 1 says *thirteen
  questions are in* and its table lists twelve. Stated in P30's Record.
- **Nothing in the spec or `doc/workflow.md` changes.**

### Raised

- **Q542** — doc/README.md's stale claims that no command derives (class H and the non-figure claims,
  including the reader's finding 3 and 4).
