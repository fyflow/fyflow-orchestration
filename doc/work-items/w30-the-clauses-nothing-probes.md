# W30 — The clauses nothing probes

**Status:** **done** - 2026-09-05
**Plan:** [P9](../plans/p9-when-a-check-stops-checking-what-notices.md)

```
Spec:       none - this item defines it. The C-ids and S-ids are check-spec.mjs's and
            check-source.mjs's own vocabulary and no spec/ document names them
Owns:       scripts/check-spec.mjs             (W1)
            scripts/check-spec-selftest.mjs    (new)
            scripts/check-source.mjs           (W24)
            scripts/check-source-selftest.mjs  (W28)
            package.json                       (P8)
Inputs:     check-spec.mjs's own C1-C8 clauses and check-source.mjs's S4 and S7 clauses.
            Every fixture is hand-written from the clause's own text; NOTHING is captured
            from spec/ or src/ by running the check - doc/workflow.md section 5 rule 4
Outputs:    scripts/check-spec-selftest.mjs - the first negative test check-spec has ever
            had - with probes for C1-C4, C6, C7 and C8 each declaring the exact SET it
            trips, a META pass in W28's named-probe form, and MIN_PROBES / MIN_META
            floors; a `--self-test` flag on check-spec.mjs; `check:spec:selftest` in
            package.json AND in check-source.mjs's GATE_CHAIN; probes for S4 and S7 with
            the input overrides they need; and check-spec.mjs's report id read as the
            first WORD rather than the first two characters
Depends on: W28 - so this item's META entries are written in the new form rather than
            converted afterwards
Blocks:     nothing. It makes Q137 buildable and does not build it
Tests:      the probes, checked in and re-runnable. Expected values come from each
            clause's own text, never from running check-spec and recording what it said
Gate:       L0 (own coverage), L1-L6 as regression and MUST NOT MOVE, then two readers
Reserves:   Q149-Q150
```

## Why this item exists

**Sixteen of this repository's thirty-nine check clauses have no probe at all**, and all sixteen are
in the two scripts [P8](../plans/p8-what-can-be-deleted-with-the-gate-green.md) named as having none:

| | count | which |
|---|---|---|
| a probe **and** a grading | 13 | `C5`, `S8`, `S11`-`S13`, `M1`-`M5`, `P1`-`P3` |
| a probe that nothing grades | 10 | `D1`-`D5`, `X1`-`X5` — [W29](w29-the-two-self-tests-that-grade-nothing.md) |
| **no probe at all** | **16** | **`C1`-`C4`, `C6`-`C8`** (7) and **`S1`-`S7`, `S9`, `S10`** (9) |

**`check-spec.mjs` has no `--self-test` and never has had one.** It is W1's script, it holds eight
clauses over `spec/` — the directory `CLAUDE.md` calls the source of truth — and its negative tests
were run by hand once and written into a Record. That is `doc/workflow.md` rule 7 (a)'s *"a probe that
ran once is a claim about the past"*, over the oldest check here.

**[Q132](../questions/q132.md) says `check-spec` has 8 clauses and 0 probes, and the count is wrong.**
`C5` has **two** — `scripts/check-markdown-selftest.mjs:386-401`, *a dead link inside `spec/`* and *a
dead ANCHOR inside `spec/`* — added by [W25](w25-a-link-is-a-link-and-an-anchor-is-an-anchor.md) one
item **after** Q132 was written at W24. **The row is right about the file and wrong about the number**:
seven clauses, not eight, and `C5`'s probes live in another script. Measured at P9's declaration.

**And one defect is already visible without running anything.** `scripts/check-spec.mjs:201` reads
`const id = c.slice(0, 2)` — **the exact expression W24 repaired in `check-source.mjs`**, where it
made `S10`-`S13` all report as `S1` and a failing run printed `ok` on every row above its own listed
failures. It is **inert today** because every C-id is two characters, and it goes live at `C10`. That
is [Q137](../questions/q137.md)'s stated shape — *a lift moves an implementation and does not move the
guards the two sides needed differently* — one file across and in the opposite direction: **W24 fixed
its own copy and the sibling kept the defect.**

## Scope

**In**

1. **`scripts/check-spec-selftest.mjs`** — probes for `C1`, `C2`, `C3`, `C4`, `C6`, `C7` and `C8`,
   each declaring the exact **set** of checks it trips (rule 7 (c)), with `MIN_PROBES` and `MIN_META`
   floors because `caught === PROBES.length` is vacuously true at zero.
2. **A META pass over `check-spec.mjs` itself**, in [W28](w28-a-grading-names-the-probe-it-breaks.md)'s
   named-probe form — one entry per clause, each naming the probe it must break.
3. **`--self-test` on `check-spec.mjs`**, and **`check:spec:selftest` in `package.json`**, and **the
   same name in `scripts/check-source.mjs`'s `GATE_CHAIN`** so `S12` accepts the widened chain.
4. **Probes for `S4` and `S7`**, with the input overrides they need on the pattern of
   `CHECK_SOURCE_PKG`.
5. **`check-spec.mjs`'s report id read as the first word**, `c.slice(0, c.indexOf(' '))`, matching
   `check-source.mjs`. A repair, so rule 8 applies to it: **break it and watch the gate go red**, which
   means at least one probe has to make the report's `FAIL` rows and the failure lines disagree.

**Out** — named rather than left implicit, with where it goes instead

- **Seven of the sixteen: `S1`, `S2`, `S3`, `S5`, `S6`, `S9`, `S10`.** The cap is P9's decision 3 and
  it is stated because a silent cap reads as coverage. [Q132](../questions/q132.md)'s own argument,
  checked and adopted: `S1`, `S2` and `S3` are guarded a second way by `typecheck:deno` and
  `typecheck:browser`; `S5`, `S6`, `S9` and `S10` are publish-set and reach bookkeeping with a second
  route. **`S4` and `S7` are the two the ladder has no rung for at all** — `S4` is Node's
  type-stripping list, which `RT-R9` exists for because all four typecheckers accept a construct Node
  refuses to load, and `S7` is
  [ADR 0013](../decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
  rule 1's only enforcement, which `CLAUDE.md` calls *"one autocomplete away from being broken"*.
  **The seven left out go into P9's exit artifact as *no probe*, not omitted from it.**
- **[Q137](../questions/q137.md) — `C5`'s missing `M3`-style floor.** Its own row names the blocker
  this item removes: *"`check-spec`'s `C1`-`C8` have no self-test at all, so a new clause there ships
  unprobed unless that gap is closed first."* **It is still out**, because adding a floor changes what
  `check-spec` **checks** and this item's subject is its **negative tests**. This item leaves it
  buildable and says so.
- **Changing what `C1`-`C8`, `S4` or `S7` check.** The report-id repair is the one exception and it
  changes the report rather than a verdict.
- **`spec/` itself.** This item reads it and writes nothing into it. Every probe mutates a **copy**
  under `dev-dist/`, which is gitignored — W24's conformity reader's finding about leaving untracked
  files in the directory section 7 rule 2's by-hand `git status` audit reads.
- **Changing what the gate RUNS.** Adding `check:spec:selftest` is adding an entry the gate already
  implies — every other check has one — and P9 declares any *removal* out.

## The decision this item takes, and what it costs

**Every probe here is a constructed case with no live defect behind it, and that is the point rather
than an apology.** `spec/` passes `C1`-`C8` today and has passed since W1. So each probe has to build
the invalid `spec/` this repository does not contain: an example that does not parse, a rule id
declared twice, an invalid example naming no rule, a definition refusal with no case, a rule naming no
test owner, a valid flow that does not resolve against `registry.json`, a README version row that
disagrees with its document.

**That is exactly the second verdict [P8](../plans/p8-what-can-be-deleted-with-the-gate-green.md)'s
retro left open** — *a check written for a defect you have just fixed has no live case, so its probes
are not a supplement to its corpus but the whole of its evidence* — and this item is **nine instances
of it in one place**, against [W29](w29-the-two-self-tests-that-grade-nothing.md)'s counter-case where
the defect is live. **P9's retro judges the verdict on both**, and this item's Record should say which
of its nine probes it could not construct a discriminating case for, if any. W25's finding is the
warning: it shipped a check whose central rule **could not be falsified by the corpus it ships on**,
and only a reader noticed that the item's own fix had built the fixture that proved it.

**And this item is where P9 predicts the WIRING obligation is tested.** It adds `check:spec:selftest`
to `package.json` — the fourth entry of the shape both of W24's readers found broken, where dropping
` --self-test` leaves the whole self-test unrun with `npm run gate` at exit 0. **`S11`'s `:selftest`
clause now guards exactly that, and `S12`'s named list guards the entry's presence.** The prediction,
written before the item starts: **both fire, the hole already has a check, and P8's proposed fifth
obligation is therefore NOT earned.** If instead this item ships a wiring hole `S11` does not see,
that is the second occurrence and the obligation stands.

**[Q102](../questions/q102.md) reproduces here for the third time, and it is predicted rather than
discovered.** `S12` obliges the literal in `scripts/check-source.mjs` whenever `package.json`'s chain
changes. W25 hit that as a **late** exception because P8's index row predated `S12`; this item's `Owns`
names the file up front. **The direction is the finding W24 recorded**: `RUN_FLOOR` went stale
*silently, toward weakness*; `S12` fails *loudly, toward safety*, naming both the entry and the file.

## Verification

**L0 — own coverage.** Each command named, not implied:

```bash
npm run check:spec               # C1-C8 over spec/, unchanged in behaviour
npm run check:spec:selftest      # the new probes, each declaring the exact SET it trips
npm run check:source:selftest    # 24 probes + S4 and S7, and S12 accepting the widened chain
```

**The provocations, checked in** (`doc/workflow.md` section 5 rule 7, all three requirements): one per
clause, committed and re-runnable, each declaring the exact set. **Three of `check-policies`' ten
failed at birth and two of those were holes in the check** — the expected outcome here is that some
fail at birth, and each one is a finding rather than something to quietly correct.

**L1-L6 — regression, and the expected result is NO MOVEMENT:**

```bash
npm run gate                     # 19 entries after this item, all exit 0
npm run test:l6                  # 23 row labels, 25 real runs, 489 assertions
```

Baseline at `76bf5e6`: **474 `test()` cases** in 19 files across Node 24.20.0, Deno 2.9.6 and
chromium; **489 assertions at L6** in Node and Deno; the gate chain is **18 entries** and becomes
**19**. *(`npm run gate` runs `test:browser`, which is **chromium only**. The two counts count
different things — [Q98](../questions/q98.md) — and are never added.)*

**Rule 8's four obligations, on this item's own repairs**, written before the readers report and
**re-run after acting on them**:

| obligation | what it means here |
|---|---|
| the rule's clauses | each of `C1`-`C4`, `C6`-`C8`, `S4` and `S7` made **present but inert**, one at a time |
| the `Outputs` rows | every row of the table below, including the report-id repair and the `GATE_CHAIN` entry |
| **provenance** | each probe's expected set read from the run's own failure lines rather than from a literal the probe also writes — substitute the source expression and nothing else |
| **loop bounds** | `PROBES` and `META` here; **and `check-spec.mjs`'s own `mdFiles` and `jsonFiles` walks**, which is [Q137](../questions/q137.md)'s subject and which this item probes even though it does not add the floor |

*Not applicable to this item: it touches no routing, so Q4, Q17, Q10, Q13 and Q6 are all outside it.*

## Record

**COMPLETE — 2026-09-05.** Author pass, both readers, and rule 8's re-run after acting on them.
**Overlap between the two readers: 2** — the `refused = true` count route (the conformity reader
found it enumerates three entries where the Record said two; the adequacy reader found the comparison
one character from vacuous, and the two meet on *the count clause is what does the refusing*), and
the **unbounded `wide` exemption** (one read it, the other constructed the entry that takes it).
That is the **thirteenth** measurement of section 6's overlap question and it sits inside the settled
1-4 band.

**The two readers barely touched, and the split is the clearest this repository has produced since
W29's.** The conformity reader found **claims that were false** — a census wrong in six documents, an
`Outputs` row attaching a check id to an unmeasured case, a cluster table still stale after the item
said it had fixed it, and a fixture measurement that cannot be reproduced from what it says. The
adequacy reader found **bounds that were not there** — the universe the coverage bound runs over, the
comparison the one count-graded entry turns on, the exemption from both anchor guards, and 60% of two
pattern lists. **Twelve of its seventeen survivors are rule 8's obligations (a) and (d), and not one
was reachable by a probe that breaks a VALUE** — the pattern the last five items record.

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0 own coverage | **RAN, green** | `check:spec` exit 0, unchanged in behaviour. `check:spec:selftest` **18 probes / 21 gradings — 20 by the named probe, 1 by the failure COUNT** — exit 0. `check:source:selftest` **34 probes / 24 gradings / 10 SELF**, exit 0 |
| L1-L6 regression | **RAN, unmoved** | `npm run gate` **exit 0, zero FAIL lines**, read from the log's own `GATE EXIT=` line rather than through a grep. **474 `test()` cases in 19 files** across node 24.20.0, deno 2.9.6 and chromium ([Q98](../questions/q98.md) — the runner labels them *assertions* and they are cases; never added to the next figure). **489 assertions, 23 row labels, 25 real runs** at L6 in node and deno, both derived from the run's own log. The gate chain is **19 entries**, from 18 |
| rule 8's four obligations | **RAN** | **33 provocations — 23 refused, 10 survive**, then **re-run after acting**, which moved three from SURVIVES to REFUSED. Eight of the ten survivors are the ceiling; one is the report-id repair, which has no discriminating case; one is [Q149](../questions/q149.md) |
| conformity reader | **RAN** | **10 findings, 3 BLOCKING.** All six that carry a number were re-verified by the author before acting, and all six held. It also re-derived the `fail()` census, all 18 probe sets, the 21-entry mapping, the C10 case, the ceiling list (**"the first of the three that did not over-inherit"**), the census with its own aborting parser, and the `Owns` audit at 13 of 13 |
| adequacy reader | **RAN** | **35 mutations, 17 survivors, 4 BLOCKING**, in an isolated copy verified green at exit 0 with zero symlinks and zero reparse points, and byte-identical to the main tree at the end. Every survivor came with a **second independent route**; four were labelled vacuous or behaviour-preserving rather than counted |
| re-run after acting on the readers | **RAN** | **48 provocations — 27 refused, 20 survive, 1 matched nothing** (the author's 31 plus the readers' 17 exact edits). **9 of the readers' 17 are now REFUSED**, and the re-run found three things nobody had: one of the six new probes cannot discriminate, the `GRADED_IDS` fix MOVED the hole rather than closing it, and `MAX_WIDE` is itself unbounded |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| `scripts/check-spec-selftest.mjs`, 7 clauses probed | **yes — 17 `fail()` sites across `C1`-`C4`, `C6`-`C8`, one probe each** | everything: `check-spec` graded nothing and probed nothing before. Ignoring `CHECK_SPEC_DIR` costs **18 of 18** |
| its META pass, in W28's named-probe form | **yes — 21 entries**: 17 clause, 2 report, 2 exit-path | ignoring `CHECK_SPEC_PROBE` costs **21**; dropping the import relocation costs 21 *(and see [Q150](../questions/q150.md) — it costs them as `corpus`, which is a PASS until `MAX_CORPUS`)* |
| `MIN_PROBES` and `MIN_META` | **yes — 18 and 21** | one probe out costs 1, one META entry out costs 1, either list emptied costs 1. **And both lists are bounded by CONTENT**: a duplicate entry costs 1, and a check id with no entry disabling any of its `fail()` sites costs 1 |
| `--self-test` on `check-spec.mjs` | **yes**, dispatched BEFORE the checks run — `check-docs.mjs`'s form, because a META child spawns this script once per entry and the checks it would run first are waste | **nothing. [Q149](../questions/q149.md), and it is this item's central finding** |
| `check:spec:selftest` in `package.json` **and** in `GATE_CHAIN` | **yes** | gutting ` --self-test` costs `[S11]`; removing the chain reference costs `[S11,S12]`; removing it from `GATE_CHAIN` alone costs `[S12]`; removing **both** the script entry and the chain reference costs `[S12]`. *(This row first read "removing it from the manifest costs `S12`", which describes the two-edit case and reads as the one-edit case — its conformity reader's finding.)* **And a FIFTH shape is covered by neither check**: the script entry removed with the chain left alone costs **0** — `S11` iterates DECLARED `check:*` scripts and `S12`'s two lists still agree. `npm run gate` goes red, but **npm** raises it, not a check |
| probes for `S4` and `S7`, with their input overrides | **yes — four probes, one override (`CHECK_SOURCE_SRC`), four META entries** | ignoring the override costs **4 probes**; not resolving `rel()` against `SRC_ROOT` costs 4 as well, by `S6` and `S13` noise rather than by detection |
| the report id read as the first word | **yes** | **nothing that this corpus can express.** Reported, not dressed up — below |

**Cost.** Pairs, never a single figure. **`check:source:selftest` is NOT the control here — this
item changed it.** `check:policies:selftest` is flat at 2.7 s across W28 and W30 and is the best
control available; `check:docs:selftest` and `check:markdown:selftest` are untouched by this item
and read *below* W29's figures, so the machine is if anything faster and the rise below is work.

| | before | after |
|---|---|---|
| `check:spec` | 0.15 s (bare `node`) | unchanged; 0.6 s through `npm run` |
| **`check:spec:selftest`** | **did not exist** | **19.3 / 18.6 s** |
| `check:source:selftest` | 30.7 / 30.0 s (W29's) | **46.6 / 46.4 s** — four probes, four META entries, two `SELF` entries |
| `check:markdown:selftest` — untouched | 90.3 s isolated (W28's) | 98.2 / 97.1 s |
| `check:docs:selftest` — untouched | 128.0 / 123.6 s (W29's) | **111.4 / 111.9 s** |
| `check:policies:selftest` — **the control** | 2.7 s (W28's) | **2.7 s** |
| whole gate | 284 / 299 / 302 s (W28-W29), 375 s for a reader | **322 / 326 / 351 s**, 19 entries |

**Three runs, not a pair, and the third is after the documents landed**: 322 and 326 s were measured
mid-item and 351 s at the close, with this item's own Record and index paragraphs in the tree.

**The gate grew by about 35 s and the arithmetic checks out**: 19 s of new self-test plus 16 s on
`check:source`. Self-tests are now ~87% of the gate. **That is reported rather than buried**, and it
is [Q133](../questions/q133.md)'s number moving in the wrong direction for the right reason —
this plan makes gradings cheaper *per entry* and this item adds entries.

**What each clause cost when made inert, before and after.**

| clause | cost then | cost now |
|---|---|---|
| `C1`, `C2`×2, `C3`×3, `C4`×2, `C6`, `C7`×5, `C8`×3 — **all 17** | **no probe existed**; `check-spec` had no `--self-test` at all | refused, 17 by a named probe |
| `check-spec`'s report block, 2 ways | 0 | refused, by the `agree` projection |
| `check-spec`'s exit path | 0 | refused |
| `S4`'s clause, and `UNSTRIPPABLE` emptied | **0 of 24, both inert, both green** | refused, refused |
| `S7`'s clause, and the published half of `SCHEDULER_REACH` emptied | **0 of 24, both inert, both green** | refused, refused |
| the report id read as two characters | 0 | **still 0 — stated, not hidden.** No case this corpus can express |

**The probes that failed at birth, and what each one was.** Four, and three are findings rather
than typos.

1. **`the chain REORDERED` in `check-source-selftest.mjs` came back *"the mutation matched
   nothing"*.** Its anchor was the literal `npm run check:spec && npm run check:source && `, and
   this item inserted `check:spec:selftest` between the two. **A probe pinned to a chain literal
   goes vacuous the moment the chain legitimately changes** — W25's *a comment that quotes the code
   it explains* and P9's *a mutation pinned to a magic number*, in a third dress. Rule 7 (b) caught
   it; nobody had to. Re-anchored.
2. **`the PUBLISHED half of SCHEDULER_REACH emptied` matched nothing**, because the anchor carried
   four leading spaces and the loop head has two. A typo, and the guard is what found it.
3. **`UNSTRIPPABLE emptied` was refused as AMBIGUOUS** by the double-apply guard this item added.
   The regex ended `\n\];`, and applied to its own output `const UNSTRIPPABLE = [];` it matched
   forward to `SCHEDULER_REACH`'s closing bracket. Tightened to `\[\n`, which cannot re-match.
   **The guard fired on the entry added in the same commit as the guard.**
4. **The content bound refused a correct list, and the reason is worth carrying.** It read the
   mutants from `source.check` — which is `readFileSync(script)`, and in a META child `script`
   **is the mutant**. With `checks = []` already applied, two entries both matched nothing,
   collapsed to the same string, and the child aborted at `23 distinct mutations`; the parent then
   reported it as a **crash**. **A bound derived from *the script under test* is a different bound
   inside a child whose script under test is broken.** Now reads the real `check-source.mjs`.

**What broke, and the first of these is the item's headline.**

1. **[Q149](../questions/q149.md) — the WIRING obligation is EARNED, and this item predicted it
   would not be.** [P9](../plans/p9-when-a-check-stops-checking-what-notices.md) wrote the
   prediction down before this item started, so the verdict is not hindsight: *"`S11` catches it and
   the obligation is therefore NOT earned."* **`S11` catches the manifest half, four ways, all
   measured** — the entry gutted of ` --self-test`, removed from `package.json`, removed from the
   chain, removed from `GATE_CHAIN`. **It does not catch the SCRIPT half.** Delete the four-line
   `--self-test` dispatch from `check-spec.mjs` and `npm run check:spec:selftest` runs the plain
   check, exits **0**, and `check:source` exits 0 beside it. Measured in **all SIX** checks that
   carry a dispatch; in `check-docs`' case that is 128 s of gradings silently not running. *(The
   author wrote **five** into six documents, having enumerated the checks in a probe script rather
   than counting the `:selftest` entries in `package.json`, and omitted `check-markdown` — the second
   most expensive one. **The finding was right and its census was wrong**: W29's own blocking finding
   one item later, in the file whose header opens *"a cap that undercounts reads as coverage"*.)* **Second occurrence, and it is
   the one `S11` does not cover.** Not fixed — P9 declares changes to what a check checks out of
   scope, and the measurement is the deliverable.
2. **[Q150](../questions/q150.md) — a `corpus` grading is a PASS, so a broken harness reads as full
   coverage.** Found by this item's own rule 8 set: dropping the import relocation makes all 21
   mutants non-inert, all 21 grade `corpus`, and the file exits **0** with the summary saying
   *"0 noticed by the named probe, 21 by the corpus"*. Closed here by a declared `MAX_CORPUS = 0`;
   live in the other four self-tests.
3. **Both of W29's structural holes are LIVE in `check-source-selftest.mjs`, and W30 measured them
   rather than inheriting the claim.** An entry replaced by a **duplicate** of another: `20/20
   noticed`, exit 0, floor satisfied, one clause silently ungraded. An entry's anchor swapped for
   `/fail\('S12',/g`: **all five** `S12` sites disabled by an entry naming one, and `20/20
   noticed` again. Both closed, and both now bounded by a `SELF` entry so the guards are
   load-bearing rather than present.
4. **A literal NUL and a `0x01` ended up inside `check-spec-selftest.mjs`'s source**, from a
   fingerprint separator written as a raw character. `grep` reported the file as binary and `file`
   called it `data`. Replaced with `\u0000` / `\u0001` escapes. Harmless and worth recording:
   nothing in the gate reads `scripts/**` for text, so nothing would have said so.

**What this taught.**

- **A parser more careful than the renderer reads a different document.** This item's census parser
  was code-span-aware, and it aborted on **Q101, Q102 and Q117** — three rows that render perfectly.
  All three carry an ODD number of backticks (45, 83, and one used as an apostrophe), so a
  span-aware splitter leaves a span open and loses the rest of the row. **GFM cuts a table row on
  `|` FIRST and parses inline code afterwards**, which is also exactly why
  [Q131](../questions/q131.md)'s two rows really do render wrong. Split on unescaped pipes only.
  The register's census is then **CONFIRMED: 109 questions — 73 open, 2 deferred, 34 resolved**,
  29 ids in both tables, with Q119 and Q71 as two **declared** exemptions carrying their reason.
- **The cluster table had gone stale by FOUR and this item found three of them.**
  The register's own note says the two halves are checked separately — every id has a row, and every
  row's id appears in exactly one cluster cell — and **Q146, Q147 and Q148 were in no cluster cell
  at all**. Corrected in place with W30's two — **and the conformity reader then found Q131 in no
  cell either**, raised by P8's declaration and never filed. Both halves now check out at 109 of 109
  in exactly one cell. **An item auditing exactly this half, and reporting it fixed, left one
  behind** — which is the class in the file read before every work item, one turn further in. `doc/` is checked by nothing, in the file read
  before every work item, one item after the change that made it false.
- **A mechanism can be unreachable in the file that most needs it, and measurement is the only way
  to know.** On its first run **no META entry here graded `caught`**, so W29's failure-COUNT
  discriminator would have shipped as decoration in the file with `C7`'s five `fail()` sites under
  one id. An **eighteenth probe** — one flow tripping the workerType clause and the predicate clause
  at once — makes it reachable, and it now fires: `2 -> 1`, the id set unmoved. **It then paid for
  itself twice**: forcing `refused = true` is refused at **18/21** — **and it is THREE entries, not
  two, and the count comparison rather than the report entries is what refuses them**. Both readers
  arrived at that from opposite directions and it is one of the two overlaps.
- **W28's named-probe contract closes, inside one file, three holes `check-source` needs a `SELF`
  list one level out to close.** `MIN_PROBES -> 0` with the list shortened or emptied is REFUSED
  here — a META entry then names a probe that is gone and ABORTS — and `MIN_META -> 0` with `META`
  emptied is REFUSED by the per-id coverage bound, which reads `check-spec.mjs`'s own `fail()`
  sites. **The regress is not only *move the hole one list further out*: a bound whose authority is
  the checked artefact rather than a declaration stops it where it is.**
- **`exit0` was being printed for sixteen entries that are not about the exit path.** Measured on
  the first run: **17** of 21 grade `exit0` under the sibling order, file as shipped — the Record
  first said 16, and the pre-18th-probe run it was actually quoting was 18. Disabling the only
  reporting clause leaves
  nothing to report and `check-spec` exits 0 — while `exit0`'s meaning in the sibling files is *the
  right ids were found and the exit path lied*. Both verdicts pass, so **no grading changed and only
  the reported reason did**, which is [Q147](../questions/q147.md) exactly. Asking *did the declared
  ids disappear* first gives 17 `disappeared`, 2 `disagreed`, 1 `caught`-by-count and **one**
  `exit0`. **The same conflation is live in `check-source-selftest.mjs` and
  `check-markdown-selftest.mjs` and is NOT swept here.**
- **On P8's second proposed change** — *a check written for a defect you have just fixed has no live
  case, so its probes are the whole of its evidence* — this item is **seventeen instances plus a
  seventeenth-and-a-half**, against W29's counter-case. `spec/` has passed `C1`-`C8` since W1, so
  every probe here builds an invalid `spec/` that does not exist. **And the report-id repair is the
  sharp form**: not merely no live case, but **no case the shipped corpus can express at all**,
  because every id `check-spec` reports is two characters and the two expressions agree on all
  eight rows. The discriminating case was **constructed and measured** rather than argued — with a
  `C10` present, the repaired report says `FAIL C10 examples parse (1)` and the reverted one says
  `ok C10` with the failure line right there.

**What is deliberately NOT done.**

- **[Q137](../questions/q137.md) is BUILDABLE and is not built.** `C5` still has no `M3`-style
  floor, so `spec/`'s link check can pass vacuously. Its stated blocker — *"`check-spec`'s
  `C1`-`C8` have no self-test at all"* — is removed; adding a floor changes what `check-spec`
  **checks**, and this item's subject is its negative tests.
- **The seven unprobed `check-source` clauses stay unprobed and are named, not omitted**: `S1`,
  `S2`, `S3` (guarded a second way by `typecheck:deno` and `typecheck:browser`), and `S5`, `S6`,
  `S9`, `S10` (publish-set bookkeeping with a second route). P9 decision 3.
- **`check-spec-selftest.mjs` has no `SELF` list**, so eight of this item's ten surviving
  provocations are the ceiling. W31 is narrowed to `check-policies`; nothing picks this file up.
- **[Q131](../questions/q131.md), [Q135](../questions/q135.md), [Q123](../questions/q123.md)** — the
  register's three malformed rows stay unfixed on purpose, and Q119 and Q71 are carried as declared
  exemptions in the census parser rather than repaired.

### What the readers found, and what changed because of it

**The conformity reader's three blocking findings, all re-verified by the author before acting.**

| finding | what it was | now |
|---|---|---|
| **"measured in all FIVE checks" is SIX** | six `:selftest` entries exist and deleting the dispatch leaves every one of them **unrun and green**. The author had enumerated the checks in a probe script instead of counting the manifest, and omitted `check-markdown`. Written into six documents including the register | corrected in all six, with the cause named beside it |
| **an `Outputs` row attached a check id to an unmeasured case** | *"removing it from the manifest costs `S12`"* describes a two-edit mutation and reads as a one-edit one. Measured: the script entry removed with the chain left alone costs **0** — a **fifth** wiring shape neither `S11` nor `S12` covers, where only npm's own *"Missing script"* fails the gate | the row now gives all four measured sets and names the fifth as uncovered. [Q149](../questions/q149.md) |
| **the cluster table was still stale** | the item said it had fixed a three-id gap; **Q131** was in no cluster cell either, raised by P8's declaration and never filed | filed; both halves now check out at **109 of 109 in exactly one cell** |

**And three of its non-blocking findings were corrections to numbers the item had written down**: the
fixture's *"23 with one link deliberately broken"* is **1** — the 23 came from a `sed` that hit ~23
of the 26 such links in one file, so the sentence described a different edit than the measurement
(the reader swept every file and directory one at a time and found nothing that yields 23); *"16 of
21 graded `exit0`"* is **17**; and the sibling `removes` probe's comment in
`check-markdown-selftest.mjs` was left at **66 / 1746 / 86** four lines above six numbers the same
commit had corrected to 67 / 1907 / 94.

**The adequacy reader's four blocking survivors, all re-verified with their second routes, all
closed except where closing them was out of scope.**

| survivor | cost then | second route it gave | cost now |
|---|---|---|---|
| **`GRADED_IDS` emptied** — the coverage bound's universe | 0; and emptied **with** `META` and its floor, **`0/0 graded` at exit 0** with every grading in the file gone | the same edits **without** emptying `GRADED_IDS` are refused by the per-id bound | **refused.** The list is **gone**, not bounded — `gradedIds()` derives it from `check-spec.mjs` twice over (the report's `checks` array and the `fail()` sites), cross-checks the two, and admits an exclusion only where another self-test is measured to probe that id |
| **`bN > mN` -> `bN >= mN`** — the count discriminator | 0 | `refused = true` alone is refused at 18/21, and all three failures name this comparison; apply both and the run is **green at 21/21, 0 by the named probe, 21 by the count** | **still survives, and the split is stated**: behaviour-preserving ALONE (no entry here has `bN === mN`), load-bearing COMPOUNDED. On the ceiling list, and a `SELF` list is what closes it |
| **the `wide` exemption is unbounded** | 0 — a NEW entry disabling `S4` and `S7` together while naming only `S7`, handed a `wide` reason, reported 28/28, 24/24, 9/9, exit 0 | the identical entry without the fourth element is refused by name — *"the mutation is GLOBAL"* | **refused**, by `MAX_WIDE = 1` and a `SELF` entry that adds a second exemption. `MAX_CORPUS` already had the shape this needed |
| **one entry leaving `UNSTRIPPABLE` / `SCHEDULER_REACH`** | 0 — three of five entries in each list deletable, with 28/28, 24/24, 9/9 | deleting `an enum` alone costs 1, so the lists are read and 60% of each was unreachable | **five of six refused**, by six new probes. The author had bounded **the whole list leaving** and not **one entry leaving** — P7's exact reader shape, in an item whose own comment says *"one entry covering it says nothing about the other four"* |

**And the sixth of those six is a finding rather than a hole, which only the re-run could tell.**
`SCHEDULER_REACH[4]` — *a relative reach into ../fyflow-scheduler* — **still survives deletion**, and
no probe can change that: it and `SCHEDULER_REACH[0]` share the prefix `\bfrom\s+['"][^'"]*`, and
every string containing `../fyflow-scheduler` contains `fyflow-scheduler`. **[4] is subsumed by [0]
for every possible input.** So it is *already* present-but-inert and *what notices when it goes inert*
has the answer **nothing, and nothing could** — W29's `check-scheduler.mjs:191` shape, **second
occurrence, in a different check**. Not fixed: deleting a clause is a change to what `S7` checks,
which P9 declares out. It needs a Q id and this item's block (Q149-Q150) is spent, so it is carried
here and in [P9's Record](../plans/p9-when-a-check-stops-checking-what-notices.md) rather than filed.

**Six more survivors are non-blocking and all six are the ceiling**, which this file has more of than
any sibling because it has no `SELF` list: `RAN` -> true, `inertOnCleanTree` -> true, the `RELOCATE`
guard, the fingerprint's rule 7 (b) guard, `MAX_CORPUS` raised, and `tripped` re-sourced from the
report rows. **The last is the one to carry**: it costs **0** here and is **REFUSED** in
`check-source-selftest.mjs`, same mutation, same shape of file, one with a list beyond it. That
single pair is the cleanest measurement anyone has of what a missing `SELF` list costs, and it is
[Q147](../questions/q147.md)'s own shape. **The ceiling list went from nine rows to eighteen.**

**And the claim this file argued hardest for was FALSIFIED.** It read: *"the regress is not only
'move the hole one list further out'; a bound whose authority is the checked artefact rather than a
declaration stops it where it is."* The bound's **authority** was the artefact — it counted `fail()`
sites in the real check — and its **scope** was a declaration, so the regress moved out exactly one
list and stopped at `GRADED_IDS`, a literal with nothing beyond it. **Right about where authority
should come from, wrong that having it is enough.** The three rows the argument was written to
explain still hold; what changed is that the list is gone rather than bounded, which is W24's answer
to `ALL_CHECKS` — quoted in this file's own header and not applied.

### What the re-run then caught, which neither reader could

**`doc/workflow.md` rule 8 as amended by P6's retro, firing on its own procedure for the sixth time
across six items — and all three of these are about the FIXES, made in the hours before.**

1. **The `GRADED_IDS` fix moved the hole rather than closing it, and the file said "closed".** The
   reader's exact edit now reports ***"the mutation matched nothing"***, because there is no literal
   left to empty — which reads as a win. Putting the same three edits one level in — `ids: []`
   inside `gradedIds()`'s own return, plus `MIN_META` and `META` — is **`0/0 graded` at exit 0**.
   So the honest statement is `check-source-selftest.mjs`'s own, and this item had quoted it:
   **the hole did not close, it moved out.** What changed is what an attacker must edit — a data
   literal before, a derivation's return expression now — and that is worth having and is not the
   same thing. Corrected in place; the derivation is on the ceiling list with the guards.
2. **`MAX_WIDE` is itself a bare literal on the outermost list.** The bound written to close the
   reader's blocking finding can be raised to 99 for **0**. The `SELF` entry beside it catches a
   second entry TAKING the exemption; nothing catches the number being raised. **A fix for a
   reader's finding that could not fail is this rule's founding observation, and it landed inside
   this rule's own procedure again.** On the ceiling list, named rather than quietly bounded by a
   third literal.
3. **A constant fingerprint and a randomised one are different mutations with different verdicts,
   and the ceiling list had conflated them.** `return 1` costs **0/18** — every probe reports *"the
   mutation matched nothing"*, so rule 7 (b) is load-bearing. `+ Math.random()` costs **0**, because
   the guard can then never fire — but a genuinely vacuous probe is **still refused** under it, by
   its declared set (`exited 0, wanted [C8], got []`) rather than by the guard. **Behaviour-preserving,
   and the right verdict by the wrong route**: [Q147](../questions/q147.md)'s shape a third time.

**And one of the readers' edits is now unmatchable, which is rule 7 (b) reporting a fix rather than a
hole.** `GRADED_IDS = []` matches nothing because the declaration is gone — the same shape as this
item's own re-anchored chain probe, and the reason the re-run reports **1 matched nothing** rather
than counting it as a refusal.

### Cost, re-measured after the readers

| | before W30 | author pass | after the readers |
|---|---|---|---|
| **`check:spec:selftest`** | did not exist | 19.3 / 18.6 s | **19.0 / 18.1 s** |
| `check:source:selftest` | 30.7 / 30.0 s (W29's) | 46.6 / 46.4 s | **76.2 / 76.5 s** |
| `check:policies:selftest` — **the control** | 2.7 s (W28's) | 2.7 s | **2.6 / 2.9 s** |

**The control is flat across all three measurements**, which is what lets the other two rows be read
as work rather than weather. `check:spec:selftest` is unmoved — the derived universe and the two new
bounds cost nothing measurable, because they read two files once. **`check:source:selftest` went
46.4 s to 76.5 s, and that is 30 s of six new probes**, each of which copies `src/` and `index.ts`
into a fresh tree and runs the whole check against it. **The direction is reported rather than
buried**, as it was in W28 and W29: the six probes exist because three entries of `UNSTRIPPABLE` and
three of `SCHEDULER_REACH` could leave for nothing, and `S7` is
[ADR 0013](../decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
rule 1's only enforcement. **Correctness was bought with half a minute of gate**, and this Record
says so rather than quoting the better number.

**`Owns` audit, and it is TWO late exceptions rather than zero.** `git diff --name-only` against
the block above: `package.json`, `scripts/check-source-selftest.mjs`, `scripts/check-source.mjs`,
`scripts/check-spec.mjs`, plus the new `scripts/check-spec-selftest.mjs` — **all five owned**.
`doc/open-questions.md` and the index documents are `doc/workflow.md` section 1 rule 5's record step.

| file | why |
|---|---|
| `scripts/check-markdown.mjs` | **[Q142](../questions/q142.md), second occurrence, and it turned the gate RED at this item's close.** The `M4` link floor is a two-sided window: the probe *"doc/decisions AND doc/plans removed"* must leave the fixture BELOW it, and this item's own Record and index paragraphs took that fixture from 1217 links to **1357** against a floor of 1350. `wanted [M1,M3,M4], got [M1,M3]`. Retuned to **1530** from a measurement — whole tree 67/1907/94, one directory removed 51/1709/94, two removed 41/1357/94 — which restores green and does not remove the ratchet. `M3` at 56 and `M5` at 60 are unchanged and were re-measured. **Q142 is NOT closed**: the window is two-sided by construction and the mitigation is the direction, which is that it fails **loudly, in the gate, naming the probe and the expected set** |
| `scripts/check-markdown-selftest.mjs` | the same repair's other half: the META entry disabling that floor is pinned to the literal `if (r.links < 1350)`, so retuning it left the entry at *"the mutation matched nothing"* — **rule 7 (b) firing correctly**, and P9's *a mutation pinned to a magic number is unmutatable the moment the number is right to change*, reproduced one plan on. Re-anchored, and the probe's stale measured comment (37/1116/78 at W25, 40/1217/86 at P9's declaration) updated to 41/1357/94 |

**Both were independently re-derived by the conformity reader**, which measured the interval itself — the floor must sit above the two-directory fixture (1357) and at or below the one-directory one (1709), and 1530 is in range — and reported the declaration accurate. **Both are exactly the exception P9's own declaration took for itself, for the same reason and on the
same two files** — *an item that adds documents is obliged to edit a file it does not own*. Declared
here rather than left to a reader running `git show --stat`.

**And one correction inside the record step, declared rather than slipped in.** `README.md`'s
`check:markdown` row read *"62 documents, 1602 links, 80 anchored"*, which is W25's measurement; the
run this item's gate log carries says **67 / 1908 / 94**. *(It read 1907 one run earlier: the
sentence correcting the count is itself a document the count is over, so the first correction was
stale before it was committed. Written without a markdown link so the second one is not.)* Corrected, with a row added for
`check:spec:selftest` and `check:source:selftest`'s three counts moved to 28 / 24 / 9. *(Not
corrected, and named so it is visible rather than silently carried:* `README.md`'s *What is here*
table still says ladder L6 is **twenty-one** real runs, where the gate log derives **25**. W29 saw it,
declined it as belonging to whoever owns `examples/**`, and this item declines it on the same
reasoning — **a stale count noticed by two consecutive items and fixed by neither is worth saying out
loud**.)

**Questions raised.** [Q149](../questions/q149.md) — the `--self-test` dispatch is deletable from
any of the five checks for exit 0, and `S11` reads the manifest rather than the script.
[Q150](../questions/q150.md) — a `corpus` grading is a pass, so a harness bug reads as coverage.
**Both of the reserved block are used. No ADR: W30 reserved none**, as the plan predicted for an
item that adds negative tests rather than an architecture.
