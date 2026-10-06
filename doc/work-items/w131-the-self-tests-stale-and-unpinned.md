# W131 — The self-tests' stale and unpinned: a success line that stops dereferencing (Q144), a header's site counts deleted (Q430, Q454), a floor held one file over (Q439), and a helper pinned (Q490)

**Status:** in progress — declared 2026-10-06 on `cc9f6e2`, the second item of P30
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
            scripts/check-docs.mjs, no code and no other comment; and this file (P30's index row)
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

**Exceptions**: one, declared before its first edit — the paragraph in `scripts/check-docs.mjs`,
answered into `Owns` above by P30 stop-and-ask (g) (the maintainer, 2026-10-06, option A). **The
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

*Filled in when the item is done.*
