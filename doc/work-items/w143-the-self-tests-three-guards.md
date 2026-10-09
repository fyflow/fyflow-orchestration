# W143 — The self-tests' three guards: every compound mutation is instrumented, every META pass carries an unmutated-copy control, and every `ran:` guard has a checked-in case (Q434, Q437, Q536)

**Status:** done — declared 2026-10-08 on `e952ac3`, the sixth item of P31; built, the reader and the fix round done, the maintainer's (B) on the wall taken, `gate:item` and `check:register:selftest` EXIT 0 on `f722ffa`, the record step done, 2026-10-09
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

*Filled in 2026-10-09 on `f722ffa`, held still from the confirming gate to this Record.* Scratch
`dev-dist/w143-19571/` (this item's shell pid): every log, harness and probe file named below. Node v24.20.0
by `fnm use 24` in every shell; every rung redirected and its EXIT read in the same command, never piped.
Ids and paths here are bare text, as the header says.

### Gate

| clause | verdict | notes |
|---|---|---|
| each self-test touched, alone | RAN, **EXIT 0** ×11 | before (`e952ac3`), after (`0b2d8c3`), and the three (B) changed again (`f722ffa`) — the table below; `before-*.log`, `after-*.log`, `afterB-*.log` |
| `npm run gate:item > dev-dist/w143-19571/item2.log 2>&1; echo "EXIT=$?"` | **RAN, EXIT 0** | ONCE, on `f722ffa`, `git status --short` empty before; 1439 s |
| — L0-L5 | RAN, 0 | **1580** cases in node 24.20.0, deno 2.9.6 and chromium (`all passed (parity with node: 1580)`): unchanged |
| — L6 | RAN, 0 | **164** real runs, 2487 assertions, in node and deno: unchanged |
| — self-tests | RAN, 0 | 10/10 ok, 9 lanes, `check:register:selftest` left out (P31 decision 4), **1277.9 s wall** — against W144's 1316.1 s and this item's own 1600.1 s before (B) |
| `npm run check:register:selftest > dev-dist/w143-19571/register.log 2>&1; echo "EXIT=$?"` | **RAN, EXIT 0** | ONCE, on `f722ffa`, after `gate:item`, tree still: 1720 s; probes 237/237 caught and 23/23 clean, grader 4/4, the META control and its two cases, 192/192 META, the STATE_META control and its two cases, 12/12 STATE_META, the SELF case, 22/22 bounded, digest unmoved, `All self-test passes clean.` |
| an earlier `gate:item` on `0b2d8c3` | RAN, EXIT 0 | 1759 s, self-test wall **1600.1 s** — the measurement that went up as a stop-and-ask (below) |
| conformity reader | RAN | 15 findings: 1 blocking, 7 should-fix, 7 notes — below |
| adequacy reader | NOT RUN | P31 decision 6: one conformity reader for W143 |

L7 did not run. firefox and webkit did not run.

### The per-self-test table, before and after

Each lane ALONE, sequentially, EXIT 0 every time (`walls.sh`). *before* is `e952ac3`; *after (SELF form)* is
`0b2d8c3`; *after (B)* is `f722ffa`, re-measured for the three lanes (B) changed. Wall times are one sample
on one machine — the 1-4 s lanes move by that much between runs.

| self-test | compound mutations, and their guard before | META control before | grades on `ran:` / checked-in case before | wall before | after (SELF form) | after (B) |
|---|---|---|---|---|---|---|
| spec | yes (PROBES 413; the `/g` loop at 300); whole-text / fingerprint only | no | yes / **no** | 71 s | 79 s | 79 s |
| source | yes (META 889 `replaceAll` ×3, PROBE 361 + alsoPkg); whole-text only | no | yes / **no** (*no such mutation exists*, its comment said) | 426 s | 498 s | **399 s** |
| wiring | yes (three PROBES compounds); `applyMutation` in its SELF pass only | **yes** (W105) | no `ran:` line | 464 s | 619 s | **459 s** |
| markdown | yes (META 704 `replaceAll` ×3, SELF 959, the C5 lift chain); whole-text only | no | yes / **no** | 764 s | 957 s | **742 s** |
| scheduler | no | no (a masking baseline only) | yes / **no** (*no address*) | 14 s | 15 s | 15 s |
| policies | yes (PROBES 279, 311; SELF 746; META 513); whole-text only | no (a SELF control only) | yes / yes (W131) | 14 s | 18 s | 18 s |
| docs | yes (PROBES 475, 623, 632); a CONJUNCTION over the halves | no | yes / **no** (W29's hand-run construction) | 537 s | 559 s | 559 s |
| workers | no (PROBES edit JSON objects) | no | no `ran:` line | 37 s | 39 s | 39 s |
| budget | yes (PROBES 261 `declare`; SELF 492, 506); whole-text only | no | prints `ran:`, grades on `RAN` (GRADER controls fire it) | 30 s | 41 s | 41 s |
| register | yes (META 1260, 1325; STATE_META 1393; SELF 1428, 1433; `adrClone`); whole-text only | no (META, STATE_META) | no `ran:` line | 1915 s | 1717 s | 1717 s |
| lookup | no (exactly-once `[from, to]` pairs) | **yes** | no `ran:` line | 246 s | 254 s | 254 s |

**After**, every row: every pass that applies a mutation reads `scripts/selftest-guards.mjs`'s count on its
FIRST application (lookup and workers' PROBES excepted — no compound text edit), every META-like pass runs an
unmutated-copy control first and treats a control that did not hold as a FAILURE, and the six that grade on
`ran:` each carry a case. Register is FASTER: a SELF child now stops at its first red after META too (W116's
decision, extended), so the children whose case is a META or STATE guard stop there.

### What was built

- **Q434 — `scripts/selftest-guards.mjs`** (the maintainer's option A, 2026-10-08): `applyMutation(mutate,
  ...args)` patches `String.prototype.replace` AND `replaceAll` for the duration of the call and counts calls
  whose result equals their receiver; `missWhy` is the one sentence every caller prints. Loaded by a
  root-derived dynamic import (a SELF child runs a copy from dev-dist/). check-wiring-selftest.mjs's own copy
  went. Every pass of ten self-tests applies it to the first application only — never to the "MORE THAN
  ONCE" and "GLOBAL" re-applications or the distinctness pre-passes, which miss by design. spec carries ONE
  named exemption, `MISS_EXEMPT` (the probe that walks every spec document), bounded by name and by needing
  at least one hit. **It found a live instance on its first run**: check-policies-selftest.mjs's probe *a spec
  row`s id emptied* had a first edit (`` `N` is fixed ``) that had matched nothing since the spec was
  reworded, so the probe had graded its second edit alone. Re-anchored. The register's `adrClone` became two
  checked edits.
- **Q437 — a control per META pass**: docs, markdown (and its C5 path, which runs a check-spec.mjs copy the
  first control does not cover), policies, scheduler, source, spec, budget, register META and STATE_META, and
  workers; wiring's (W105) is now READ before anything is graded. Each control is an UNMUTATED copy driven
  through the same function the entries take, must come back caught-and-not-noticed, and has a case handing
  it a copy that cannot run (a first line that throws), which must NOT hold. A control that did not hold is a
  FAILURE (`META NOT RUN — its control did not hold`), never a quiet line.
- **Q536 — a `ran:` case** in docs (W29's construction, checked in at last), markdown, scheduler, source and
  spec; policies' (W131) unchanged. Each is inert on the clean tree, throws under its named probe before the
  terminal report line, and is graded on *the mutant did not run* — the reader verified each against its
  check script.
- **The maintainer's (B), 2026-10-09**: the nine cases that were `SELF` entries in markdown (4), source (4)
  and wiring (1) are IN-PROCESS GUARD CASES calling each pass's own `gradeMeta` / `runOne` / `runProbe`, as
  scheduler, spec, docs, register and workers' already were. **The trade-off, as the maintainer took it**:
  those cases are graded one level less end-to-end — through the pass's function, not through a SELF child
  running a mutated copy of the self-test. policies and budget keep their SELF form (cheap lanes). Rule 8
  pass 4 shows each guard removed is still caught by its in-process case.
- **Two in-Owns defects**: check-scheduler-selftest.mjs's junction branch restored into `dir`, which is not in
  scope there (a ReferenceError; `runOne`'s `finally` restored anyway); check-source-selftest.mjs's vacuous
  returns carried no `declared`, so single-probe mode threw on a vacuous probe.

### Outputs

| | output | where | what fails without it |
|---|---|---|---|
| (1) | the measurement, before | the table above; `before-walls.txt`, `before-*.log`; the three structure maps | — |
| (2) | Q434's instrumented replace | `scripts/selftest-guards.mjs`; every pass's first application | rule 8 h1-h3, s1, s2, sp1-sp4, p1-p3, p6, b1-b3, wk1, d1, d2, so5, m6, m7, w2, w4, r1, r2, r4, r5, bs1, bs2, bm1, bm2, bw1, rd10 |
| (3) | Q437's control per META pass | each self-test's META pass | s3, s7, sp6, p4, b4, wk3, d4, w3, r3, rd1-rd5, rd9, bs3, bm3 |
| (4) | Q536's `ran:` cases | docs, markdown, scheduler, source, spec | s4, s5, sp5, p5, d3, rd4b, bs4, bs5, bm4 |
| (5) | each guard provoked at birth | the GUARD CASES and the policies/budget SELF entries | every row above: each is a case going RED for its own line |
| (6) | Q434, Q437, Q536 resolved | the record step | — |

### Exceptions, reconciled to `git status --short` to the path

`git diff --name-only e952ac3..HEAD` before the record step:

| path | in Owns? |
|---|---|
| doc/work-items/w143-the-self-tests-three-guards.md | yes — this file |
| scripts/check-budget-selftest.mjs, -docs-, -markdown-, -policies-, -register-, -scheduler-, -source-, -spec-, -wiring-, -workers-selftest.mjs | yes — `scripts/*-selftest.mjs` (lookup untouched) |
| scripts/selftest-guards.mjs | **by the maintainer's YES**, written into Exceptions before the file existed (`0f0213a`) |

Nothing else. The record step adds P31's plan, doc/questions/q434.md, q437.md and q536.md — section 1 rule 5's
files.

### Rule 8 — four passes, harness `rule8.mjs`

Node 24 asserted; each anchor matched ONCE against the CURRENT text and each edit asserted to change it, or
the probe aborts; every touched file restored to its FIRST snapshot and compared back byte for byte; a
content digest over every tracked and untracked-unignored file outside dev-dist/ before and after; a no-op
control, a CRASH grader and a WRONG-REASON grader. Run types: `lane` (the whole self-test), `lane` with the
self-test's own variable pointed at itself (a SELF child's arrangement: PROBES and META, no SELF), and
`self1` (one SELF entry as its parent spawns and grades it, reason included).

```
pass 1 (af914ea)  34 probes: 33 as declared, 1 against (s7)          digest befbf006cd7f9c43 IDENTICAL
pass 2 (af914ea)  25 probes: 25 as declared                          digest befbf006cd7f9c43 IDENTICAL
pass 3 (0b2d8c3)  61 probes: 60 as declared, 1 abort (wk2)           digest 1fc54c97f7af9663 IDENTICAL
pass 4 (f722ffa)  15 probes: 14 as declared, 1 against (g-wrongb)    digest 4e4dfbebed54adcb IDENTICAL
```

- **Every probe against its declaration was the declaration's**, each re-declared from the line seen: `s7`
  (the control deleted) went red with `ReferenceError: control is not defined`, which my CRASH regex missed
  — re-declared `caught` on that line and caught in pass 3; `g-wrongb` made the probe a GUARD CASE reads
  vacuous, so the case's own line appeared and the grader said `caught` — the grader was right and the probe
  was not a wrong-reason probe (pass 1's `g-wrong` is). `wk2` ABORTED on an anchor that matched twice after
  the fix round added a second line beginning the same way — the harness's own guard; `rd3b` supersedes it.
- **Pass 3 carried the reader's exact edits** (`rd1`-`rd10`), all caught, and re-ran the whole of pass 1 and
  the pass-2 probes on the files the fix round changed.
- **Declared survivors, by id**: **S1** (`h4`) — the helper's patch not restored after a call: every call
  re-patches and the old patch still delegates, so nothing observable moves. **S2** (`s6`, `bs6`, `bm5`, and
  the same arm in spec and docs) — a control's REFUSAL arm, in a file whose cases run in process: on a
  healthy tree the control holds, so the arm is unreachable; its predicate is shared with its case and IS
  caught (`s3`, `sp6`, `d4`, `bs3`, `bm3`), and in register, budget, workers and wiring a skipped pass is now
  a failure (`rd1`-`rd3b`). **S3** (`s8`) — the scheduler junction branch: unreachable on a machine that makes
  junctions. **S6** (`m5`) — the C5 lift's loop-level miss check: the function it calls is caught (`m6`).

### The reader — fresh context, Q434, Q437, Q536 and workflow section 5 rules 7-8 first; a still copy of `af914ea`

It read `git archive af914ea` under dev-dist/w143-19571/reader-tree while rule 8 ran on the live tree, so
both held still. Its per-question verdict: **Q434 closed; Q536 closed; Q437 closed against its closes-when
and NOT against this item's output (5)** until finding 1 was fixed.

1. **blocking — register's META and STATE_META controls were not visible when removed.** `NOT RUN` printed a
   line and pushed nothing, so deleting the control block skipped the pass at exit 0. **Fixed** (`0b2d8c3`):
   a skipped pass is a failure; STATE_META is gated on the control HOLDING (`rd1`, `rd1b`, `rd1c`).
2. **should-fix — budget's comment named the wrong mechanism.** **Fixed**, and the `NOT RUN` arm is a
   failure there too (`rd2`).
3. **should-fix — wiring's control (W105) was read by nothing; workers' `bad` deletable.** **Fixed**: wiring
   refuses to grade META without a control that held (`rd3`); workers' skip is a failure (`rd3b`).
4. **should-fix — two docs header rows W143 made false** (`caught` accepted; `RAN` forced true). **Re-taken**
   as REFUSED since W143, and shown so (`rd4`, `rd4b`).
5. **should-fix — spec's `bN >= mN` row and two neighbours.** **Re-taken**; `rd5` is caught by the control.
6. **should-fix — a false comment in scheduler** (the `ran:` case's reading with the arm disabled) and a
   header count. **Fixed.**
7. **should-fix — source's comment on the `declared` fix overclaimed**: the parent still tests `!ran` first.
   **Corrected** to say what the fix does.
8. **should-fix — policies' "the only place its case exists"** and a stale SELF count. **Fixed.**
9. **note — markdown's C5 path had no control.** **Built**: `gradeSpec` runs it, and its control is handed a
   copy that cannot run in `rd9`.
10. **note — spec's exemption covered any number of misses.** **Bounded**: at least one document hit (`rd10`).
11. **note — the helper's doc said "the eleven files".** **Fixed.**
12. **note — what the instrumentation does not reach** (scheduler's INSTALL `apply`, a single replace; docs'
    `slice` edits; register's throw-guarded staging): stated, not acted on.
13. **note — the policies re-anchor is correct.** Confirms.
14. **note — the scheduler junction fix is correct.** Confirms.
15. **note — rule 7 (a)-(c) hold, scratch paths carry their pid, the helper import is root-derived.** Confirms.

### The stop-and-ask on the wall, and its answer

`gate:item` on `0b2d8c3` read a self-test wall of **1600.1 s** against W144's 1316.1 s (+22%), the markdown
lane 1585.4 s against 1302.6 s: the nine SELF entries each re-ran a probe pass and part of META to reach one
line. It went up with three options. **The maintainer chose (B) on 2026-10-09**: the nine move in process
(above), policies and budget keep the SELF form. On `f722ffa` the wall is **1277.9 s** — below both figures —
and the three lanes alone read 742 / 399 / 459 s against 764 / 426 / 464 s before W143. *Not chosen*: (A)
accept +284 s; (C) keep markdown's `ran:` case as a SELF entry.

### What broke

1. **A `\n` and a `\u0000` written through a heredoc into a Python edit script became a real newline and a
   real NUL** in three self-tests — CLAUDE.md's warning, met twice. Each was caught by `node --check` or by
   `grep` reporting a binary file before anything ran, and every later edit script was written with the
   Write tool as a raw string.
2. **Edits landed while long lanes ran** — register's first run reported THE TREE MOVED, honestly. Every
   recorded figure here is from a still tree.
3. **Source's SELF cases came back red for "not the reason this entry names" in one concurrent run and green
   alone**; the cause was not found. The mismatch line now quotes what the child DID say, and (B) removed the
   SELF form there.

### What this taught

- **The instrumented replace found a dead edit on its first run in a file that had passed every gate since
  the spec was reworded** — Q434 was not hypothetical.
- **A control nothing reads is a control nobody would miss**: three of the controls this item built, and the
  one W105 built, could be deleted at exit 0 until the reader asked what reads them.
- **A guard case through a SELF child costs a probe pass per case**; through the pass's own function it costs
  nothing or one child, and rule 8 catches the same removals either way — at one level less end-to-end.
- **Nothing in the spec or doc/workflow.md changes.**

### Questions closed and raised (section 1 rule 6)

- **Closed: Q434, Q437 and Q536**, each `resolved-by` starting "P31 W143 —".
- **Raised: none.** Q568-Q570 unused. ADR 0089 unused.
- **Rule 6 fired once**: the shared helper, answered **YES (option A)** by the maintainer on 2026-10-08,
  written into Exceptions before the file existed. **A second stop-and-ask** (the wall) was answered **(B)**
  on 2026-10-09.

### After the record step

The record step changed files `check:markdown`, `check:register` and `npm run state` read (P31's plan,
doc/questions/q434.md, q437.md and q536.md, this file), so `npm run gate` was re-run on that tree: **RAN,
EXIT 0** (`gate-record.log`), and `npm run state` reads W143 `done`. `npm run q -- --where status=open
--count` prints **4**.
