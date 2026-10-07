# W131 — The self-tests' stale and unpinned: a success line that stops dereferencing (Q144), a header's site counts deleted (Q430, Q454), a floor held one file over (Q439), and a helper pinned (Q490)

**Status:** done — declared 2026-10-06 on `cc9f6e2`, the second item of P30; built, the reader and the fix round done 2026-10-07
**Plan:** P30, `doc/plans/p30-which-open-questions-close-by-a-fix-already-named.md`

*This file carries NO relative link, deliberately*, as W133's does — Q142's mechanism. A linking
document here is one more in `check-markdown`'s second `removes` probe tree and can cross `M4`'s
floor. Ids and paths are bare text.

```
Spec:       none changes. The rules are doc/workflow.md section 5 rules 7 and 8 and P27 decision 4;
            P30 decisions 4 and 5 fix the direction of Q144 and of Q430 + Q454
Owns:       scripts/check-policies.mjs, scripts/check-policies-selftest.mjs,
            scripts/check-docs-selftest.mjs, scripts/check-budget-selftest.mjs;
            COMMENT-ONLY: scripts/check-markdown-selftest.mjs (~866-871) and
            scripts/check-scheduler-selftest.mjs (~122-128), each only if its Q144 sentence becomes
            false; and, by P30 stop-and-ask (g) answered by the maintainer 2026-10-06 (option A),
            COMMENT-ONLY: the one paragraph above `const README_SNIPPET_FLOOR = 3;` in
            scripts/check-docs.mjs, no code and no other comment; and, by the same stop-and-ask
            answered by the maintainer 2026-10-07 (option A again, after the conformity reader's
            finding 7), COMMENT-ONLY: one clause appended to that file's "8 since W101" history
            sentence; and this file (P30's index row)
Inputs:     the tree at `cc9f6e2` (W133 done); P30 decisions 4, 5, 6, 7, 8; the five questions'
            own files
Outputs:    (1) a REPLACEMENT `ran:` case in check-policies-selftest.mjs's SELF list, built and
                shown firing BEFORE line 187 changes: a META entry inert on the clean tree and
                FATAL under its probe that does not depend on `names.join` — `srcPolicies`'
                `if (!m) return null;` disabled, named against "the POLICIES block renamed"
            (2) check-policies.mjs's success line stops dereferencing `names` (Q144)
            (3) the `names === null` clause gains the META entry Q144 said it could not have;
                MIN_META follows the list (6 -> 7)
            (4) the Q144 mutant's old SELF entry retired, and the sentences that described it
                (check-policies-selftest.mjs's comments; markdown and scheduler selftests if
                false) made true of the new tree
            (5) check-docs-selftest.mjs's header: every stated `fail()` SITE count deleted, with
                the procedure (`grep`) named instead — no computed census (P30 decision 5)
            (6) check-docs-selftest.mjs's source-text bound reads README_SNIPPET_FLOOR beside
                X4_WIDTH's and refuses it below 3 (Q439); check-docs.mjs's residue sentence
                rewritten to say so (the stop-and-ask (g) widening)
            (7) check-budget-selftest.mjs: a PROBE that reaches B6's
                "has a DECLARED_TARGETS entry and is not in DECLARED_PATHS" clause, and a META
                entry that makes DECLARED_TARGETS_UNDECLARED vacuous, named against it (Q490);
                MIN_PROBES and MIN_META follow their lists (18 -> 19 each)
            (8) Q144, Q430, Q439, Q454, Q490 resolved, `resolved-by` starting "P30 W131 —"
Depends on: W133 (P30 decision 7: serial on one tree)
Blocks:     W132
Tests:      the outputs ARE tests. Each new or moved clause is provoked at birth (section 5
            rule 7): (1) fires with the `ran:` guard live and is GREEN with it disabled; (3) is
            noticed through `exit0` and its anchor is graded; (6) refuses a lowered floor; (7)'s
            probe is caught for its own reason and its META entry is noticed. Expected verdicts
            come from the clause each one names, never from a run
Gate:       L0-L6 by `npm run gate` along the way; each lane this item owns run alone
            (check:policies:selftest, check:docs:selftest, check:budget:selftest); rule 8 over
            every output in dev-dist/w131-61120/; one conformity reader (P30 decision 8);
            `npm run gate:full` EXIT 0 once, on a still tree, after the reader's fixes
Reserves:   Q536-Q540, ADR 0086. No W beyond W131. (Q535 and ADR 0085 were W133's, spent unissued)
```

**Exceptions**: two, both in `scripts/check-docs.mjs` and both answered into `Owns` above by P30
stop-and-ask (g), each before its first edit — the paragraph above `README_SNIPPET_FLOOR` (the
maintainer, 2026-10-06, option A) and one clause in the "8 since W101" sentence (2026-10-07, option A). **The
two files W133 found an item always drags do not apply here**: W131 adds no L1 suite
(`test/definition/l4-corpus.test.ts`) and bumps no spec version (`spec/README.md`). Any other file
edited outside `Owns` and outside the record step is declared here before its first edit.

## Scope

**In**

1. **Q144, decision 4's order.** Build output (1) first, run it, and show it fires for its own reason
   — `ran: no` under its probe, inert on the clean tree, the SELF child RED with the guard live and
   GREEN with it disabled. Only then change line 187. Then show the old Q144 mutant no longer crashes
   (`ran: yes`, `outcome: exit0`), which is why its SELF entry retires and its clause becomes a META
   entry.
2. **Q430 + Q454.** Delete the site counts in the header. Do not compute them (decision 5).
3. **Q439.** The bound beside `X4_WIDTH`'s, and the residue sentence in `check-docs.mjs`.
4. **Q490.** The probe, then the META entry, then the floors.
5. Grep for `W131`, the five Q ids, `names.join` and every withdrawn number, excluding `dev-dist/`.

**Out**

- Every other count in `check-docs-selftest.mjs`'s header (probe and META counts, the W29 history):
  decision 5 is about the SITE counts.
- The other `fail()` sites `check-policies-selftest.mjs` does not grade (W31's per-site bound).
- `README_SNIPPET_FLOOR`'s VALUE, and any probe of it: a source-text bound is the device P30's W131 row names.

## Verification

- `node scripts/check-policies.mjs --self-test`, `node scripts/check-docs.mjs --self-test`,
  `node scripts/check-budget.mjs --self-test`, each run alone, redirected, EXIT read in the same
  command.
- **Rule 7** for every new or moved clause, and **rule 8** on every output, in
  `dev-dist/w131-61120/`: every anchor checked against the CURRENT text, every edit asserted to
  change its input, each file restored to its FIRST snapshot byte for byte, a content digest before
  and after, a no-op control, a CRASH grader and a WRONG-REASON grader.
- **Conformity reader**: fresh context, the rules and checks first, then the code; reports, does not
  fix. Its edits re-run as probes.
- **Confirming gate**: `npm run gate:full > dev-dist/w131-61120/full.log 2>&1; echo "EXIT=$?"`, once.
- **Routing cases** (template): not applicable — this item changes checks, not the driver.

## Record

*Filled in 2026-10-07 on `79e844a`, held still from the confirming gate to this Record.* Scratch
`dev-dist/w131-61120/` (the shell pid that made it): every log and script named below. Node v24.20.0 by
`fnm use 24` in every shell, Deno 2.9.6; every rung redirected and its EXIT read in the same command,
never piped. Ids are bare text, as the header says.

### Gate

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate:full > dev-dist/w131-61120/full.log 2>&1; echo "EXIT=$?"` | **RAN, EXIT 0** | once, on `79e844a`, after the reader's fixes and rule 8's pass 2; `git status --short` empty before (`tree-before-full.txt`) and after; no `FAIL` line |
| — L0 (lint, typecheck) and the checks | RAN, ok | inside the chain |
| — L1-L5 | RAN, ok | **1528** cases in node 24.20.0, deno 2.9.6 and chromium (parity 1528). Unchanged: W131 adds no case (prediction 2) |
| — L6 | RAN, ok | **2465** assertions, node and deno. Unchanged |
| — self-tests | RAN, ok | 11/11 lanes ok, 2323.0 s wall; `check:policies:selftest` 41.0 s, `check:docs:selftest` 813.3 s, `check:budget:selftest` 97.3 s |
| the three owned lanes, alone | RAN, EXIT 0 | policies 13/13, 7/7, 14/14; budget 19 caught + 1 control, 19/19 meta, 15/15 self; docs 47/47, 24/24 (also the reader's own run on `9b643f0`) |
| conformity reader | RAN | 8 should-fix, 6 notes, nothing BLOCKING — below |
| after the record step | RAN, EXIT 0 | it edits `doc/questions/**`, P30's plan and ADR 0073, which `check:register` and `check:markdown` read: both re-run, EXIT 0 (the first `check:register` was RED, *what broke* 5), then `npm run gate > dev-dist/w131-61120/gate-record.log 2>&1` EXIT 0, no `FAIL` line. The self-tests were NOT re-run after the record step |
| adequacy reader | NOT RUN | P30 decision 8: one reader for W131 |
| L7 | NOT RUN | no trace changes |

### Decision 4's order, and which mutation carries the guard now

The replacement was built and shown firing BEFORE line 187 moved, and the commit `45e3c20` carries both,
so the order is in these logs rather than in `git` (the reader's finding 2):

| time (2026-10-06) | log | what it shows |
|---|---|---|
| 23:57:34 | `q144-new-before.log` | the replacement fires: guard live, the child RED (*the mutant did not run*); either half of the guard disabled, GREEN. 3/3 |
| 23:57:41 | `q144-old-before.log` | the old Q144 entry fires too, on the old success line. 3/3 |
| 23:57:53 | `pol-check.log` | line 187 now `(names ?? []).join`; `check:policies` EXIT 0 |
| 23:57:59 | `q144-new-after.log` | the replacement still fires. 3/3 |
| 23:58:05 | `q144-old-after.log` | the old entry no longer fires: its injected META entry grades `ok`, EXIT 0 (2/3 against declaration) — it stopped proving anything |

**The `ran:` guard is now carried by `srcPolicies`' `if (!m) return null;` disabled**, named against
*the POLICIES block renamed*: inert on the clean tree, it throws in `m[1]` before any report line. P30
stop-and-ask (a) did not fire.

### Outputs

| | Declared output | Exists | What would fail without it |
|---|---|---|---|
| (1) | the rebased `ran:` SELF entry | `scripts/check-policies-selftest.mjs` | probes p5, p6 (either half of the guard disabled: that entry FAIL *the floor did not fire*), p8 |
| (2) | the success line reads `(names ?? []).join` | `scripts/check-policies.mjs:187-191` | p1: reverted, the null-clause META entry crashes |
| (3) | the `names === null` META entry; MIN_META 7 | `check-policies-selftest.mjs` | p2 (the clause inert in the real check is seen, `exit0`), p3, p4 |
| (4) | the old SELF entry retired; the Q144 sentences made true | `check-policies-selftest.mjs`, `check-markdown-selftest.mjs`, `check-scheduler-selftest.mjs` | comments; the reader's findings 4 and 8 read them |
| (5) | the header's site census deleted, the grep named | `check-docs-selftest.mjs` | declared survivor S2 (p14): re-adding a count passes, by design |
| (6) | the README floor bound, with its own two cases; the two `check-docs.mjs` comments | `check-docs-selftest.mjs`, `check-docs.mjs` | p10-p12, r3, r4, p13b; S1 (p13) shows it is the sole observer |
| (7) | two probes reaching `B6`'s DECLARED_TARGETS direction, the META entry on the helper; MIN_PROBES 20, MIN_META 19 | `check-budget-selftest.mjs` | p15-p20, r1, r2; S3 (p21) is Q490 as raised |
| (8) | the five questions resolved | `doc/questions/` | the record step |

**Exceptions, reconciled to `git status --short` and `git diff --name-only 194e945^..HEAD`, to the path.**
Fifteen paths after the record step. **Owns, 7**: `scripts/check-policies.mjs`,
`scripts/check-policies-selftest.mjs`, `scripts/check-docs-selftest.mjs`, `scripts/check-budget-selftest.mjs`,
`scripts/check-markdown-selftest.mjs` and `scripts/check-scheduler-selftest.mjs` (comments only), and this
file. **Exceptions, 1 path, two widenings**: `scripts/check-docs.mjs`, comments only — the paragraph above
`README_SNIPPET_FLOOR` (P30 stop-and-ask (g), the maintainer, 2026-10-06, option A) and one clause in its
"8 since W101" sentence (the same stop-and-ask, 2026-10-07, option A, after the reader's finding 7). Both
declared before their first edit; neither late. **Record step, 7**: P30's plan (its Record),
`doc/questions/q144.md`, `q430.md`, `q439.md`, `q454.md`, `q490.md` (resolved), `q536.md` (raised), and
`doc/decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md` (a dated note on
consequence 10). `README.md` was not edited: nothing a consumer reads moved. Neither of W133's drag files
was touched, as declared.

### Rule 7 and rule 8 — three passes

Harness `rule8.mjs` (pass 1's copy kept as `rule8-pass1.mjs`): node 24 asserted; every anchor must occur
ONCE in the CURRENT text and must change it; each touched file restored to its FIRST snapshot and compared
byte for byte; a content digest over every tracked and untracked-unignored file; a no-op control per lane; a
CRASH grader (`g-crash`) and a WRONG-REASON grader (`g-wrong`); each `must` matched on one output line.

```
pass 1   27 probes, 27 as declared                         digest fcd389f86e25b4ac IDENTICAL   (on 9b643f0)
pass 2   31 probes, 30 as declared, 1 against (p13)        digest 50b263a3fc6201b2 IDENTICAL   (on 79e844a)
pass 2b   2 probes,  2 as declared (p13, p13b)             digest 50b263a3fc6201b2 IDENTICAL
```

**Declared survivors, by id**, each RUN against the lane its reason names: **S1** p13 (floor lowered to 1
with the bound removed — the bound is the sole observer); **S2** p14 (a site count re-added — nothing
compares it, P27 decision 4); **S3** p21 (Q490 as raised: the helper vacuous against the pre-W131
self-test, EXIT 0); **S4** p8b (p8 with the SELF reason check removed — the check is p8's sole observer).
**Pass 2's one deviation was the declaration's**: S1 at floor 2 is CAUGHT on the pass-2 tree, because the
reader-finding-6 self-case replaces the floor line with 2 and an edit that changes nothing fails closed —
a second route, now probe p13b, and S1 re-declared at floor 1. Pass 2 carries the reader's exact edits as
probes r1 (finding 1's narrowing), r2 (its loop bound) and r3, r4 (finding 6's checked-in cases).

**Rule 7 at birth**: `q144-step.mjs` for output (1), above; the new META entries and probes in each
owned lane's own run (`pol-step1b.log`, `budget-st.log`, `docs-st.log`).

### The conformity reader — fresh context, rules and checks first, tree still

Brief `brief-conformity.md`; its scratch `reader/`. **Fourteen findings, nothing BLOCKING.**

1. **should-fix — a constructed survivor**: narrowing `B6`'s call site to `&& !k.startsWith('doc/')` was
   EXIT 0 through the whole budget self-test, because the one stray key was at the root. **Fixed**: a
   second probe with a key under `doc/` (MIN_PROBES 19 -> 20); its exact edit is probe r1, CAUGHT.
2. should-fix — decision 4's order is not in `git`. **Recorded** above.
3. should-fix — a referent the census deletion left dangling. **Fixed**.
4. should-fix — "FIVE files" in a sentence W131 rewrote (six by grep). **Fixed**: the grep replaces it.
5. should-fix — the SELF-loop comment cited a ceiling row that does not exist. **Fixed**.
6. should-fix — the README bound absent from the header's map and its cases only in `dev-dist/`.
   **Fixed**: the bound applies itself to both cases (r3, r4 CAUGHT), and the map names it.
7. should-fix — ADR 0073 consequence 10 and `check-docs.mjs`'s "8 since W101" ceiling sentence now false.
   **Fixed**: a dated note on the ADR (record step) and one clause in the sentence (second widening).
   `check-docs.mjs:322`'s stale *8 against 8* is not W131's claim and was left, by the maintainer's answer.
8. should-fix — comments say Q144 is closed before the register does; and the remaining `ran:` gap has no
   address. **Fixed** by the record step, and **raised as Q536**.
9. note — answers A-F, all holding.
10. note — the widening was in W131's file only. **Fixed**: P30's Record states both.
11. note — the harness: `must`s real, graders controlled, p18's `edits` dead (overwritten by `pre`). Left.
12. note — a declaration-reading bound takes the first match and cannot see the comparison moved to another
    constant; X4's has the same limit. Recorded, not acted on.
13. note — "unshippable" is imprecise for two of the four cases; predates W131. Not acted on.
14. note — prediction 6 holds.

### What broke

1. **The first `ran:` replacement passed for a reason it did not name** — an injected entry that went red as
   STILL CAUGHT satisfied it, because a SELF grading reads only *red*. Found by rule 8's probe p8 before the
   reader; fixed by a reason the entry names, with S4 showing that check is p8's sole observer.
2. **A single stray key under-selected** Q490's direction (reader finding 1): obligation (a)'s *where it
   SELECTS*, missed by the author's own p16, which narrowed the other way.
3. **The rule-8 declaration was wrong once** (S1 at floor 2), the harness's own class, as at W133.
4. **Two scratch scripts written through heredocs were wrong** — an escaped newline and an escaped quote,
   CLAUDE.md's warning twice; both aborted before touching the tree.
5. **The record step's first `check:register` was RED** (`R8`): Q439's `resolved-by` named ADR 0073, which
   does not list Q439 in `resolves`. The ADR was not what resolved it, so the id came out of the sentence;
   `check:register` EXIT 0 after.

### What this taught

- **A SELF entry that exists to prove a guard FIRES needs the guard's reason, not only a red child** — W31's
  grading is right for floors and wrong for a guard about WHY. Nothing else in the file changed.
- **A fix that makes a clause probeable should give it its entry in the same commit**: Q144's real deliverable
  was the META entry, not the line.
- **A probe of a SELECTING clause needs a fixture on each side of the selection**, at birth.

### Questions raised

- **Q536** — the `ran:` guard is provoked by a checked-in case in one self-test of six, and the gap Q144
  used to carry for the others has no address.
