# W143 — The self-tests' three guards: every compound mutation is instrumented, every META pass carries an unmutated-copy control, and every `ran:` guard has a checked-in case (Q434, Q437, Q536)

**Status:** in progress — declared 2026-10-08 on `e952ac3`, the sixth item of P31
**Plan:** P31, `doc/plans/p31-which-open-questions-close-by-a-decision-taken-now.md`

*This file carries NO relative link, as W140-W145's files do* — Q142's M4 mechanism, which W144 derived
away, is no longer the reason; the convention is kept so a link here moves no probe tree. Ids and paths are
bare text.

```
Spec:       none changes. P31 decision 3 fixes all three directions as each question's own
            closes-when: Q434 — every self-test whose mutations are compound adopts
            check-wiring-selftest.mjs's instrumented replace (or one shared helper), so a compound
            whose second edit matches nothing fails the vacuity guard; Q437 — every META pass gains an
            unmutated-copy control, one extra child per pass; Q536 — every self-test that grades on
            `ran:` carries a checked-in case that makes the guard fire. Workflow section 5 rule 7
            (a)-(c) binds each new guard; ADR 0072 (a scratch path carries its process) binds every new
            scratch path; ADR 0089 is free and used only if an answer needs it
Owns:       scripts/*-selftest.mjs (P31's W143 row) — eleven files on e952ac3; scripts/selftest-guards.mjs
            (new, by the maintainer's YES — Exceptions); this file
Inputs:     the tree at e952ac3 (W140, W142, W141, W145, W144 done); Q434, Q437 and Q536's files;
            W105's Record (the instrumented replace's origin, Q434); W125's rows for Q434 and Q437 (the
            measured scope at P29); W131's Record (Q536); check-wiring-selftest.mjs's `applyMutation`
            and META control; check-lookup-selftest.mjs's META CONTROL; check-policies-selftest.mjs's
            SELF `ran:` case
Outputs:    (1) the measurement, BEFORE any edit, one row per self-test: its passes, which carry
                compound mutations and how each guards vacuity; whether each META pass has an
                unmutated-copy control; whether it grades on `ran:` and has a checked-in case firing
                it; its wall time alone
            (2) Q434: in every self-test whose mutations are compound, every pass that applies one
                reads what the mutation DID — a `.replace` that matched nothing is RED, naming the
                entry, not graded
            (3) Q437: every META pass (a pass that runs a mutated copy of the CHECK and requires a
                named probe to notice) runs one unmutated copy through the same path first, and that
                copy must come back NOT noticed, or the pass is RED before it grades anything
            (4) Q536: every self-test that grades on `ran:` (`grep -l "ran: yes" scripts/*-selftest.mjs`:
                docs, markdown, policies, scheduler, source, spec on e952ac3) carries a checked-in case
                that makes the guard fire, graded on the guard's own failure line
            (5) each new guard provoked at birth in each file (rule 7 (a)-(c)): a compound whose second
                edit matches nothing goes RED; a META pass whose control is removed is visible; the
                `ran:` case fires for its own reason — checked in as SELF entries where the file has a
                SELF pass
            (6) Q434, Q437 and Q536 resolved, each resolved-by starting "P31 W143 —"
Depends on: W144 (P31 decision 5: serial on one tree; both touch check-markdown-selftest.mjs)
Blocks:     W146
Tests:      (5) is the test of (2)-(4). Expected values come from the three questions' closes-when and
            rule 7: a compound with a dead second edit is RED, an unmutated copy is NOT noticed, and a
            mutant that cannot run is graded `did not run` — never read back from a run of the guard
Gate:       each self-test touched EXIT 0 alone; `npm run gate` EXIT 0; rule 8 on every output in
            dev-dist/w143-19571/; one conformity reader (P31 decision 6); `npm run gate:item` EXIT 0
            once, on a still tree (decision 4); AND `npm run check:register:selftest` EXIT 0 once —
            check-register-selftest.mjs carries chained replaces (W125's measure: three), so this item
            expects to move it and P31 decision 4 puts the register lane in its gate. Together the two
            runs are gate:full's lanes
Reserves:   Q568-Q570 (P31's block Q553-Q567 is wholly reserved by W140-W145, whose unused ids are
            skipped, never reissued); ADR 0089 only if a stop-and-ask answer needs it. No W beyond W143
```

**Exceptions**: one, asked under workflow section 1 rule 6 and answered **YES by the maintainer on
2026-10-08 (option A)**, written here before the file exists: **`scripts/selftest-guards.mjs`, a new
module**, joins `Owns`. It exports `applyMutation(mutate, src) -> { out, misses }`, instrumenting
`String.prototype.replace` AND `replaceAll` for the duration of the `mutate` call only; each self-test loads
it by a root-derived dynamic import (a SELF child runs a mutated copy from dev-dist/, where a relative static
import does not resolve); check-wiring-selftest.mjs's own copy is replaced by the import. Only the
instrumentation is shared — each META control and each `ran:` case stays in its own file. *Not chosen*: (B)
a copy per file. Any other file edited outside `Owns` and outside the record step is asked first and its
YES written here before the edit. **The drag files, checked up front:**

| file | why it should not move |
|---|---|
| `scripts/check-wiring.mjs` | `G6` scans `scripts/*.mjs` for the scratch directory's name, with a table of declared literals in check-wiring-selftest.mjs, check-lookup-selftest.mjs, check-budget-selftest.mjs and check-markdown-selftest.mjs; every one is kept byte for byte and every new scratch path carries `process.pid`. `G2`/`G4` read each self-test's dispatch and the exclusivity marker; neither is touched |
| `scripts/check-wiring-selftest.mjs`'s own `G6` probes | they anchor on literals in check-spec-selftest.mjs (`spec-selftest-${process.pid}`) and check-policies-selftest.mjs (`policies-selftest-${process.pid}`); both literals are kept |
| `scripts/check-spec-selftest.mjs` reading check-markdown-selftest.mjs | it reads that file for `check: 'C5'` and the `from './check-markdown.mjs'` relocation; both kept |
| `scripts/run-selftests.mjs` | reads the exclusivity marker in check-scheduler-selftest.mjs; kept |
| each `scripts/check-*.mjs` dispatch | each loads its self-test by path (`CHECK_<X>_SELFTEST`); no check changes. A SELF child runs a mutated COPY of the self-test from another directory, so a helper imported by a relative static path would not resolve there — one reason the helper is an ask, not a default |
| `package.json` | nothing is renamed or wired (P31 Out) |
| header comments in each self-test that state entry counts or "survives" tables | a new entry makes a stated count false; each is re-taken in the same edit (Q43's class) |

## Scope

**In**

1. **Measure first**, output (1), on `e952ac3`, logs under dev-dist/w143-19571/.
2. **Q434**, output (2): the instrumented replace in every pass of every self-test whose mutations are
   compound — check-wiring-selftest.mjs's own PROBES and META passes included, since only its SELF pass uses
   `applyMutation` on e952ac3.
3. **Q437**, output (3): one unmutated-copy control per META pass that lacks one.
4. **Q536**, output (4): one checked-in `ran:` case in each of the five self-tests that lack one.
5. Each guard provoked at birth, output (5).
6. Rule 8 on every output in a harness under dev-dist/w143-19571/.
7. Grep for `W143`, `Q434`, `Q437`, `Q536` and every withdrawn sentence, excluding dev-dist/.

**Out**

- **Any change to a check** (`scripts/check-*.mjs` that is not a self-test), `scripts/run-selftests.mjs` or
  `package.json` — a stop-and-ask if one is needed (rule 6).
- **Any change to what `gate:item` or `gate:full` runs** — P31 Out.
- **Q20 and Q513** — P31 Out.

## Verification

- **Each self-test**: `npm run check:<x>:selftest`, RUN and redirected, EXIT read in the same command, alone
  and with its wall time, before and after.
- **Rule 8**: break each guard — the instrumentation (a compound with a dead second edit graded as a pass), the
  META control (removed, or made to compare nothing), the `ran:` case (its producer disabled, its parent arm
  disabled) — and watch the self-test go red for the reason it names; a no-op control, a CRASH grader and a
  WRONG-REASON grader; anchors checked against the current text, every edit asserted to change its input, the
  tree restored to its first snapshot byte for byte, a digest before and after.
- **Reader**: one conformity reader, fresh context, Q434, Q437, Q536 and workflow section 5 rule 7 first,
  then the code; it reports and does not fix, and the tree holds still while it reads.
- **Confirming gate**: `npm run gate:item > dev-dist/w143-19571/item.log 2>&1; echo "EXIT=$?"`, once, on the
  final tree; then `npm run check:register:selftest > dev-dist/w143-19571/register.log 2>&1; echo "EXIT=$?"`,
  once, on the same tree.
- **Routing cases** (template): not applicable. This item changes the self-tests, not routing.

## Record

*Filled in when the item is done.*
